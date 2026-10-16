#!/usr/bin/env python3
"""SILENCE Boutique Travel - Local Development HTTP Server.

Servidor HTTP Python otimizado para o site SILENCE.
- Serve assets estáticos com MIME types corretos (especialmente ES Modules .js, .json e .woff2).
- Bloqueia acesso a diretórios e arquivos internos (.git, .hermes, CONTEXT.md) conforme SOP.
- Adiciona headers de controle de cache para refletir edições imediatamente.
- Suporta busca automática de porta caso a porta padrão esteja ocupada.
"""

from __future__ import annotations

import argparse
import json
import mimetypes
import os
import socket
import sys
from http import HTTPStatus
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import unquote, urlparse

# MIME types essenciais garantidos para ESM, fontes e catálogo JSON
MIME_OVERRIDES = {
    ".js": "text/javascript; charset=utf-8",
    ".mjs": "text/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".html": "text/html; charset=utf-8",
    ".woff2": "font/woff2",
    ".woff": "font/woff",
    ".svg": "image/svg+xml",
    ".webp": "image/webp",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".ico": "image/x-icon",
    ".yml": "text/yaml; charset=utf-8",
    ".yaml": "text/yaml; charset=utf-8",
}

# Arquivos/diretórios protegidos conforme SOP de Engenharia
PROTECTED_PATHS = {
    ".git",
    ".hermes",
    ".gemini",
    "CONTEXT.md",
}


class SilenceHTTPRequestHandler(SimpleHTTPRequestHandler):
    """Handler com controle de segurança, MIME types estritos, no-cache e API Admin."""

    def __init__(self, *args, directory: str | None = None, **kwargs):
        for ext, mime in MIME_OVERRIDES.items():
            mimetypes.add_type(mime, ext)
        super().__init__(*args, directory=directory, **kwargs)

    def is_path_forbidden(self, path: str) -> bool:
        """Verifica se o caminho tenta acessar arquivos de engenharia ou ocultos."""
        parsed = urlparse(path).path
        decoded = unquote(parsed).strip("/")
        parts = decoded.split("/") if decoded else []
        for part in parts:
            if part.startswith(".") or part in PROTECTED_PATHS:
                return True
        return False

    def send_json(self, status: HTTPStatus, payload: dict) -> None:
        """Envia uma resposta JSON padronizada."""
        body = (json.dumps(payload, ensure_ascii=False) + "\n").encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self) -> None:
        self.send_response(HTTPStatus.NO_CONTENT)
        self.send_header("Access-Control-Allow-Methods", "GET, HEAD, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def do_POST(self) -> None:
        clean_path = urlparse(self.path).path.rstrip("/")
        if clean_path not in ("/api/journeys", "/api/testimonials"):
            self.send_json(
                HTTPStatus.NOT_FOUND,
                {"ok": False, "error": "Endpoint not found."},
            )
            return

        try:
            content_length = int(self.headers.get("Content-Length", "0"))
            if content_length <= 0 or content_length > 524288:
                self.send_json(
                    HTTPStatus.BAD_REQUEST,
                    {"ok": False, "error": "Invalid payload size."},
                )
                return

            raw_body = self.rfile.read(content_length).decode("utf-8")
            data = json.loads(raw_body)

            if clean_path == "/api/journeys":
                journeys = data.get("journeys") if isinstance(data, dict) else None
                if not isinstance(journeys, list) or len(journeys) == 0:
                    self.send_json(
                        HTTPStatus.BAD_REQUEST,
                        {"ok": False, "error": "Catalog must contain at least one journey."},
                    )
                    return

                target_file = Path(self.directory) / "data" / "journeys.json"
                target_file.parent.mkdir(parents=True, exist_ok=True)
                formatted = json.dumps({"journeys": journeys}, indent=2, ensure_ascii=False) + "\n"
                temp_file = target_file.with_suffix(".json.tmp")
                temp_file.write_text(formatted, encoding="utf-8")
                temp_file.replace(target_file)

                self.send_json(
                    HTTPStatus.OK,
                    {"ok": True, "count": len(journeys), "path": "data/journeys.json"},
                )
                return

            if clean_path == "/api/testimonials":
                testimonials = data.get("testimonials") if isinstance(data, dict) else None
                if not isinstance(testimonials, list) or len(testimonials) == 0:
                    self.send_json(
                        HTTPStatus.BAD_REQUEST,
                        {"ok": False, "error": "Must contain at least one testimonial."},
                    )
                    return

                target_file = Path(self.directory) / "data" / "testimonials.json"
                target_file.parent.mkdir(parents=True, exist_ok=True)
                formatted = json.dumps({"testimonials": testimonials}, indent=2, ensure_ascii=False) + "\n"
                temp_file = target_file.with_suffix(".json.tmp")
                temp_file.write_text(formatted, encoding="utf-8")
                temp_file.replace(target_file)

                self.send_json(
                    HTTPStatus.OK,
                    {"ok": True, "count": len(testimonials), "path": "data/testimonials.json"},
                )
                return
        except Exception as exc:
            self.send_json(
                HTTPStatus.INTERNAL_SERVER_ERROR,
                {"ok": False, "error": str(exc)},
            )

    def do_GET(self) -> None:
        if self.is_path_forbidden(self.path):
            self.send_error(
                HTTPStatus.FORBIDDEN,
                "Access to internal engineering assets is forbidden by SOP.",
            )
            return

        # Normaliza redirecionamento para pastas como /admin -> /admin/
        clean_path = urlparse(self.path).path
        local_target = os.path.join(self.directory, clean_path.lstrip("/"))
        if os.path.isdir(local_target) and not self.path.endswith("/"):
            self.send_response(HTTPStatus.MOVED_PERMANENTLY)
            self.send_header("Location", self.path + "/")
            self.end_headers()
            return

        super().do_GET()

    def do_HEAD(self) -> None:
        if self.is_path_forbidden(self.path):
            self.send_error(HTTPStatus.FORBIDDEN)
            return
        super().do_HEAD()

    def end_headers(self) -> None:
        # Desativa cache agressivo no browser em desenvolvimento local
        self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        self.send_header("Access-Control-Allow-Origin", "*")
        super().end_headers()

    def guess_type(self, path: str | os.PathLike) -> str:
        ext = Path(path).suffix.lower()
        if ext in MIME_OVERRIDES:
            return MIME_OVERRIDES[ext]
        return super().guess_type(path)

    def log_message(self, format: str, *args) -> None:
        # Log sucinto e limpo
        sys.stderr.write(f"[{self.log_date_time_string()}] {self.address_string()} - {format % args}\n")


def is_port_in_use(port: int, host: str = "0.0.0.0") -> bool:
    """Checa se a porta já está ocupada."""
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
        sock.settimeout(0.5)
        return sock.connect_ex(("127.0.0.1", port)) == 0


def find_available_port(start_port: int, max_attempts: int = 50) -> int:
    """Encontra a primeira porta disponível a partir de start_port."""
    for port in range(start_port, start_port + max_attempts):
        if not is_port_in_use(port):
            return port
    raise RuntimeError(f"Nenhuma porta disponível encontrada a partir de {start_port}")


def get_local_ip() -> str:
    """Tenta obter o IP local da máquina para acesso na rede."""
    try:
        with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as s:
            s.connect(("8.8.8.8", 80))
            return s.getsockname()[0]
    except Exception:
        return "127.0.0.1"


def main() -> None:
    parser = argparse.ArgumentParser(description="Servidor HTTP local do SILENCE")
    parser.add_argument(
        "--port",
        "-p",
        type=int,
        default=8088,
        help="Porta de escuta (padrão: 8088, busca automática se ocupada)",
    )
    parser.add_argument(
        "--host",
        "-H",
        default="0.0.0.0",
        help="Endereço host para binding (padrão: 0.0.0.0)",
    )
    parser.add_argument(
        "--dir",
        "-d",
        default=str(Path(__file__).resolve().parent),
        help="Diretório raiz a ser servido",
    )
    args = parser.parse_args()

    serve_dir = os.path.abspath(args.dir)
    target_port = args.port

    if is_port_in_use(target_port, args.host):
        print(f"Aviso: Porta {target_port} já em uso. Buscando próxima disponível...")
        target_port = find_available_port(target_port + 1)

    handler = lambda *h_args, **h_kwargs: SilenceHTTPRequestHandler(
        *h_args, directory=serve_dir, **h_kwargs
    )

    ThreadingHTTPServer.allow_reuse_address = True
    with ThreadingHTTPServer((args.host, target_port), handler) as httpd:
        local_ip = get_local_ip()
        print("\n" + "=" * 60)
        print(" SILENCE — Boutique Travel HTTP Server")
        print("=" * 60)
        print(f" Diretório raiz : {serve_dir}")
        print(f" URL Local      : http://localhost:{target_port}/")
        print(f" URL Rede local : http://{local_ip}:{target_port}/")
        print(f" Painel Admin   : http://localhost:{target_port}/admin/")
        print(f" Catálogo JSON  : http://localhost:{target_port}/data/journeys.json")
        print("=" * 60)
        print(" Pressione Ctrl+C para encerrar o servidor.\n")

        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nEncerrando servidor...")
        finally:
            httpd.server_close()
            print("Servidor finalizado com sucesso.")


if __name__ == "__main__":
    main()
