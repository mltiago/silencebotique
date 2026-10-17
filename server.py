#!/usr/bin/env python3
"""SILENCE Boutique Travel - Local Development & Curatorial CMS HTTP Server.

Servidor HTTP Python otimizado para o site SILENCE.
- Serve assets estáticos com MIME types corretos (especialmente ES Modules .js, .json e .woff2).
- Bloqueia acesso a diretórios e arquivos internos (.git, .hermes, CONTEXT.md, server.py) conforme SOP.
- Valida origem (proteção contra CSRF cross-origin), schema e voz da marca (CONTEXT.md) na API Admin.
- Escrita atômica thread-safe em data/journeys.json e data/testimonials.json.
- Adiciona headers de controle de cache para refletir edições imediatamente.
- Suporta busca automática de porta caso a porta padrão esteja ocupada.
"""

from __future__ import annotations

import argparse
import json
import mimetypes
import os
import re
import socket
import sys
import tempfile
import threading
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

for _ext, _mime in MIME_OVERRIDES.items():
    mimetypes.add_type(_mime, _ext)

# Arquivos/diretórios protegidos conforme SOP de Engenharia (comparação case-insensitive)
PROTECTED_PATHS_LOWER = {
    ".git",
    ".gitignore",
    ".hermes",
    ".gemini",
    ".pages.yml",
    "context.md",
    "readme.md",
    "server.py",
}

FORBIDDEN_BRAND_TERMS = (
    "therapy",
    "therapeutic",
    "retreat",
    "healing",
    "heal",
    "burnout",
    "detox",
    "transform",
    "transformation",
    "cure",
    "spa",
    "wellness",
    "vip",
)

FORBIDDEN_BRAND_REGEX = re.compile(
    r"\b(" + "|".join(FORBIDDEN_BRAND_TERMS) + r")\b",
    re.IGNORECASE,
)

SLUG_REGEX = re.compile(r"^[a-z0-9-]+$")
FILE_WRITE_LOCK = threading.Lock()


def find_forbidden_terms(text: str) -> list[str]:
    """Retorna termos proibidos pelo CONTEXT.md encontrados no texto."""
    if not isinstance(text, str) or not text:
        return []
    found = {match.group(1).lower() for match in FORBIDDEN_BRAND_REGEX.finditer(text)}
    return sorted(found)


def validate_journeys_payload(journeys: object) -> tuple[bool, str]:
    """Valida a lista de pacotes de viagem e as diretrizes de voz da marca."""
    if not isinstance(journeys, list) or len(journeys) == 0:
        return False, "Catalog must contain at least one journey."

    seen_ids: set[str] = set()
    for idx, item in enumerate(journeys, start=1):
        if not isinstance(item, dict):
            return False, f"Journey #{idx} must be a JSON object."

        slug = str(item.get("id", "")).strip()
        if not slug or not SLUG_REGEX.match(slug):
            return False, f"Journey #{idx} has an invalid slug ID '{slug}'."
        if slug in seen_ids:
            return False, f"Duplicate journey slug ID '{slug}'."
        seen_ids.add(slug)

        for req_field in ("name", "region", "accommodation", "description"):
            val = item.get(req_field)
            if not isinstance(val, str) or not val.strip():
                return False, f"Journey '{slug}' is missing required field '{req_field}'."

        status = item.get("status", "published")
        if status not in ("published", "coming_soon", "archived"):
            return False, f"Journey '{slug}' has invalid status '{status}'."

        highlights = item.get("highlights", [])
        if highlights is not None and not isinstance(highlights, list):
            return False, f"Journey '{slug}' highlights must be a list of strings."

        text_blobs = [
            str(item.get("name", "")),
            str(item.get("region", "")),
            str(item.get("accommodation", "")),
            str(item.get("axiom", "")),
            str(item.get("description", "")),
            str(item.get("editionDates", "")),
            str(item.get("ctaLabel", "")),
            " ".join(str(h) for h in (highlights or [])),
        ]
        violations = find_forbidden_terms(" ".join(text_blobs))
        if violations:
            terms_str = ", ".join(violations)
            return (
                False,
                f"Brand voice violation in journey '{slug}': forbidden terms ({terms_str}).",
            )

    return True, ""


def validate_testimonials_payload(testimonials: object) -> tuple[bool, str]:
    """Valida a lista de depoimentos e as diretrizes de voz da marca."""
    if not isinstance(testimonials, list) or len(testimonials) == 0:
        return False, "Must contain at least one testimonial."

    seen_ids: set[str] = set()
    for idx, item in enumerate(testimonials, start=1):
        if not isinstance(item, dict):
            return False, f"Testimonial #{idx} must be a JSON object."

        slug = str(item.get("id", "")).strip()
        if not slug or not SLUG_REGEX.match(slug):
            return False, f"Testimonial #{idx} has an invalid slug ID '{slug}'."
        if slug in seen_ids:
            return False, f"Duplicate testimonial slug ID '{slug}'."
        seen_ids.add(slug)

        for req_field in ("author", "role", "location", "journey", "quote"):
            val = item.get(req_field)
            if not isinstance(val, str) or not val.strip():
                return False, f"Testimonial '{slug}' is missing required field '{req_field}'."

        status = item.get("status", "published")
        if status not in ("published", "archived"):
            return False, f"Testimonial '{slug}' has invalid status '{status}'."

        text_blobs = [
            str(item.get("author", "")),
            str(item.get("role", "")),
            str(item.get("location", "")),
            str(item.get("journey", "")),
            str(item.get("quote", "")),
        ]
        violations = find_forbidden_terms(" ".join(text_blobs))
        if violations:
            terms_str = ", ".join(violations)
            return (
                False,
                f"Brand voice violation in testimonial '{slug}': forbidden terms ({terms_str}).",
            )

    return True, ""


def atomic_write_json(target_file: Path, data: dict) -> None:
    """Escreve arquivo JSON de forma atômica e thread-safe."""
    target_file.parent.mkdir(parents=True, exist_ok=True)
    formatted = json.dumps(data, indent=2, ensure_ascii=False) + "\n"
    with FILE_WRITE_LOCK:
        fd, tmp_path_str = tempfile.mkstemp(
            dir=str(target_file.parent),
            prefix=f".{target_file.name}.",
            suffix=".tmp",
        )
        tmp_path = Path(tmp_path_str)
        try:
            with os.fdopen(fd, "w", encoding="utf-8") as tmp_file:
                tmp_file.write(formatted)
                tmp_file.flush()
                os.fsync(tmp_file.fileno())
            tmp_path.replace(target_file)
        except Exception:
            if tmp_path.exists():
                tmp_path.unlink(missing_ok=True)
            raise


class SilenceHTTPRequestHandler(SimpleHTTPRequestHandler):
    """Handler com controle de segurança, MIME types estritos, no-cache e API Admin."""

    def is_path_forbidden(self, path: str) -> bool:
        """Verifica se o caminho tenta acessar arquivos de engenharia ou ocultos."""
        parsed = urlparse(path).path
        decoded = unquote(parsed).replace("\\", "/").strip("/")
        parts = [p for p in decoded.split("/") if p]
        for part in parts:
            part_lower = part.lower()
            if part.startswith(".") or part_lower in PROTECTED_PATHS_LOWER:
                return True
        return False

    def is_same_origin_request(self) -> bool:
        """Bloqueia requisições cross-origin maliciosas (CSRF) contra a API local."""
        origin = self.headers.get("Origin")
        if not origin:
            return True
        parsed_origin = urlparse(origin)
        host_header = self.headers.get("Host", "")
        if parsed_origin.netloc == host_header:
            return True
        if parsed_origin.hostname in ("localhost", "127.0.0.1"):
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
        if not self.is_same_origin_request():
            self.send_error(HTTPStatus.FORBIDDEN, "Cross-origin access denied.")
            return
        self.send_response(HTTPStatus.NO_CONTENT)
        self.send_header("Access-Control-Allow-Methods", "GET, HEAD, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def do_POST(self) -> None:
        if not self.is_same_origin_request():
            self.send_json(
                HTTPStatus.FORBIDDEN,
                {"ok": False, "error": "Cross-origin requests are not permitted."},
            )
            return

        clean_path = urlparse(self.path).path.rstrip("/")
        if clean_path not in ("/api/journeys", "/api/testimonials"):
            self.send_json(
                HTTPStatus.NOT_FOUND,
                {"ok": False, "error": "Endpoint not found."},
            )
            return

        try:
            content_length = int(self.headers.get("Content-Length", "0"))
        except ValueError:
            content_length = 0

        if content_length <= 0 or content_length > 524288:
            self.send_json(
                HTTPStatus.BAD_REQUEST,
                {"ok": False, "error": "Invalid payload size."},
            )
            return

        try:
            raw_body = self.rfile.read(content_length).decode("utf-8")
            data = json.loads(raw_body)
        except (UnicodeDecodeError, json.JSONDecodeError):
            self.send_json(
                HTTPStatus.BAD_REQUEST,
                {"ok": False, "error": "Malformed JSON payload."},
            )
            return

        try:
            if clean_path == "/api/journeys":
                journeys = data.get("journeys") if isinstance(data, dict) else None
                is_valid, error_msg = validate_journeys_payload(journeys)
                if not is_valid:
                    self.send_json(
                        HTTPStatus.BAD_REQUEST,
                        {"ok": False, "error": error_msg},
                    )
                    return

                target_file = Path(self.directory) / "data" / "journeys.json"
                atomic_write_json(target_file, {"journeys": journeys})

                self.send_json(
                    HTTPStatus.OK,
                    {"ok": True, "count": len(journeys), "path": "data/journeys.json"},
                )
                return

            if clean_path == "/api/testimonials":
                testimonials = data.get("testimonials") if isinstance(data, dict) else None
                is_valid, error_msg = validate_testimonials_payload(testimonials)
                if not is_valid:
                    self.send_json(
                        HTTPStatus.BAD_REQUEST,
                        {"ok": False, "error": error_msg},
                    )
                    return

                target_file = Path(self.directory) / "data" / "testimonials.json"
                atomic_write_json(target_file, {"testimonials": testimonials})

                self.send_json(
                    HTTPStatus.OK,
                    {"ok": True, "count": len(testimonials), "path": "data/testimonials.json"},
                )
                return
        except OSError as exc:
            self.send_json(
                HTTPStatus.INTERNAL_SERVER_ERROR,
                {"ok": False, "error": f"Failed to persist data: {exc.strerror or 'I/O error'}"},
            )

    def do_GET(self) -> None:
        if self.is_path_forbidden(self.path):
            self.send_error(
                HTTPStatus.FORBIDDEN,
                "Access to internal engineering assets is forbidden by SOP.",
            )
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
        self.send_header("X-Content-Type-Options", "nosniff")
        origin = self.headers.get("Origin")
        if origin and self.is_same_origin_request():
            self.send_header("Access-Control-Allow-Origin", origin)
            self.send_header("Vary", "Origin")
        super().end_headers()

    def guess_type(self, path: str | os.PathLike) -> str:
        ext = Path(path).suffix.lower()
        if ext in MIME_OVERRIDES:
            return MIME_OVERRIDES[ext]
        return super().guess_type(path)

    def log_message(self, format: str, *args) -> None:
        sys.stderr.write(f"[{self.log_date_time_string()}] {self.address_string()} - {format % args}\n")


def is_port_in_use(port: int, host: str = "127.0.0.1") -> bool:
    """Checa se a porta já está ocupada no host especificado."""
    check_host = "127.0.0.1" if host in ("0.0.0.0", "") else host
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
        sock.settimeout(0.5)
        return sock.connect_ex((check_host, port)) == 0


def find_available_port(start_port: int, host: str = "127.0.0.1", max_attempts: int = 50) -> int:
    """Encontra a primeira porta disponível a partir de start_port."""
    for port in range(start_port, start_port + max_attempts):
        if not is_port_in_use(port, host):
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
        default="127.0.0.1",
        help="Endereço host para binding (padrão seguro: 127.0.0.1; use 0.0.0.0 para LAN)",
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
        target_port = find_available_port(target_port + 1, args.host)

    def handler(*h_args, **h_kwargs):
        return SilenceHTTPRequestHandler(*h_args, directory=serve_dir, **h_kwargs)

    ThreadingHTTPServer.allow_reuse_address = True
    with ThreadingHTTPServer((args.host, target_port), handler) as httpd:
        local_ip = get_local_ip()
        print("\n" + "=" * 60)
        print(" SILENCE — Boutique Travel HTTP Server")
        print("=" * 60)
        print(f" Diretório raiz : {serve_dir}")
        print(f" URL Local      : http://localhost:{target_port}/")
        if args.host == "0.0.0.0":
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
