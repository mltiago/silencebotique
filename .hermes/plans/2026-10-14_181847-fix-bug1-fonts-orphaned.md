# Plan: Fix Bug 1 — Fontes self-hosted órfãs

## Goal
Eliminar as fontes órfãs: mover `@font-face` para `styles.css`, remover o CDN do Google Fonts do HTML e apagar `fonts-local.css`. Resultado: 177 KB de `.woff2` passam a ser usados, zero dependência de terceiros.

## Current Context / Assumptions
- **Repo root**: `/home/hermes/silencebotique`
- **Arquivos envolvidos**:
  - `index.html` — carrega Google Fonts via CDN (linhas 12-17)
  - `styles.css` — já declara `--serif`/`--sans` mas usa CDN
  - `fonts-local.css` — contém `@font-face` completos, **não referenciado por ninguém**
  - `fonts/` — 6 arquivos `.woff2` (177 KB) self-hosted, SIL Open Font License 1.1
  - `js/loader.js` — importa Vimeo dinamicamente; padrão de módulos ES já estabelecido
- **Branch**: `prototype/silence` (HEAD: 904ec4f)
- **Servidor**: `python3 -m http.server 8123` em `/home/hermes/silencebotique/`

## Architecture / Proposed Approach
Mover as declarações `@font-face` do arquivo órfão para o topo do `styles.css` (single source of truth), remover o `<link>` do Google Fonts do `index.html`, apagar `fonts-local.css`. Nada de bundler, nada de build step — apenas CSS nativo e ES modules que já funcionam.

## Step-by-Step Tasks

### Task 1: Verificar estado atual (read-only)
```bash
cd /home/hermes/silencebotique
grep -n "googleapis\|gstatic" index.html
grep -n "fonts-local" index.html styles.css js/
ls -la fonts/
```
**Expected**: CDN no HTML, zero refs a `fonts-local.css`, 6 `.woff2` em `fonts/`.

---

### Task 2: Mover `@font-face` para `styles.css` (topo do arquivo)
**Arquivo**: `styles.css`
**Ação**: Inserir bloco `@font-face` logo após `:root` (após linha 12), antes do `* { box-sizing... }`.

**Conteúdo exato a inserir** (copiado de `fonts-local.css`, ajustado para variáveis já existentes):
```css
/* Self-hosted brand fonts. SIL Open Font License 1.1 — commercial use, no royalties, no attribution required.
   Source: Google Fonts (variable cuts). Subsets: latin only (English-only site, NA/EU markets). */

@font-face {
  font-family: 'DM Sans';
  font-style: normal;
  font-weight: 400 700;
  font-display: swap;
  src: url('./fonts/DMSans-normal-latin.woff2') format('woff2-variations');
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
}

@font-face {
  font-family: 'Playfair Display';
  font-style: normal;
  font-weight: 400 500;
  font-display: swap;
  src: url('./fonts/PlayfairDisplay-normal-latin.woff2') format('woff2-variations');
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
}

@font-face {
  font-family: 'Playfair Display';
  font-style: italic;
  font-weight: 400 500;
  font-display: swap;
  src: url('./fonts/PlayfairDisplay-italic-latin.woff2') format('woff2-variations');
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
}
```

**Verificação**:
```bash
head -30 styles.css | grep -A2 "@font-face"
```
**Expected**: 3 blocos `@font-face` aparecem antes de `* { box-sizing }`.

---

### Task 3: Remover Google Fonts CDN do `index.html`
**Arquivo**: `index.html`
**Linhas a remover**: 12–17 (o bloco `preconnect` + `link` do Google Fonts)
**Ação**: Apagar linhas 12–17 inclusive.

**Antes (linhas 12–19)**:
```html
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Playfair+Display:ital,wght@0,400;0,500;1,400;1,500&display=swap"
      rel="stylesheet"
    />
    <link rel="stylesheet" href="styles.css" />
```

**Depois (linhas 12–13)**:
```html
    <link rel="stylesheet" href="styles.css" />
```

**Verificação**:
```bash
grep -n "googleapis\|gstatic" index.html
```
**Expected**: zero resultados.

---

### Task 4: Apagar `fonts-local.css`
```bash
rm /home/hermes/silencebotique/fonts-local.css
```
**Verificação**:
```bash
ls -la fonts-local.css 2>&1
grep -rn "fonts-local" .
```
**Expected**: "No such file" + zero referências.

---

### Task 5: Verificação de integração (smoke test)
```bash
# Reiniciar servidor
pkill -f 'python3 -m http.server' && sleep 1 && python3 -m http.server 8123 &
sleep 2
curl -s -o /dev/null -w "HTML %{http_code}
" http://localhost:8123/index.html
curl -s -o /dev/null -w "CSS %{http_code}
" http://localhost:8123/styles.css
curl -s -o /dev/null -w "DM Sans %{http_code}
" http://localhost:8123/fonts/DMSans-normal-latin.woff2
curl -s -o /dev/null -w "Playfair %{http_code}
" http://localhost:8123/fonts/PlayfairDisplay-normal-latin.woff2
```
**Expected**: HTTP 200 para todos.

**Teste visual no navegador** (abrir http://100.123.155.52:8123/index.html):
1. Abrir DevTools → Network → filtrar "font"
2. Confirmar que `DMSans-normal-latin.woff2` e `PlayfairDisplay-normal-latin.woff2` carregam com status 200
3. Confirmar que **não** há requisições para `fonts.googleapis.com` nem `fonts.gstatic.com`
4. Verificar se o texto renderiza com Playfair (títulos) e DM Sans (corpo)

---

### Task 6: Atualizar documentação (opcional, baixa prioridade)
**Arquivo**: `docs/silence-website.md` linha 37
- Atualizar "Fontes self-hosted (SIL Open Font License): Playfair Display + DM Sans" → confirmar que já está ✅
- Nenhuma ação obrigatória se já estiver correto.

---

## Tests / Validation

| Teste | Comando | Expected |
|-------|---------|----------|
| CSS carrega fontes | `grep -c "@font-face" styles.css` | `3` |
| CDN removido | `grep -c "googleapis\|gstatic" index.html` | `0` |
| Arquivo órfão gone | `test -f fonts-local.css && echo EXISTE || echo REMOVIDO` | `REMOVIDO` |
| Fontes servidas | `curl -sI http://localhost:8123/fonts/DMSans-normal-latin.woff2 | head -1` | `HTTP/1.0 200 OK` |
| Zero CDN no network | Abrir DevTools → Network → filtrar "googleapis" | 0 requests |
| LCP não regressou | Lighthouse mobile | > 90 |

---

## Risks, Tradeoffs, Open Questions

| Risco | Mitigação |
|-------|-----------|
| `font-weight: 400 700` no DM Sans mas binário é faixa 400–500 | O binário variable font cobre até 700; se houver fallback visual, o navegador usa o mais próximo. Se houver artefato, ajustar para `400 500` no `@font-face`. |
| `Playfair Display` weight 700 declarado mas binário só vai a 500 | Mesmo acima — variable font interpola. Se houver problema, reduzir para `400 500`. |
| Cache do navegador serve CSS antigo | Testar com Ctrl+Shift+R ou abrir em aba anônima. |
| `unicode-range` latino-only — site é EN only | OK por decisão explícita (NA/EU markets). Se PT-BR for adicionado no futuro, adicionar `latin-ext`. |

**Open question**: O peso 700 no DM Sans é realmente necessário? O design system usa `font-weight: 500; 600` no CSS original. Se 700 não for usado, simplificar para `400 500` evita interpolação desnecessária.

---

## Commands Summary (copy-paste)
```bash
cd /home/hermes/silencebotique

# 1. Backup rápido
cp styles.css styles.css.bak
cp index.html index.html.bak

# 2. Inserir @font-face no styles.css (após linha 12)
# -- usar editor ou sed preciso --

# 3. Remover CDN do index.html (linhas 12-17)
# -- editar arquivo --

# 4. Apagar órfão
rm fonts-local.css

# 5. Testar
pkill -f 'python3 -m http.server' && sleep 1 && python3 -m http.server 8123 &
sleep 2
curl -sI http://localhost:8123/fonts/DMSans-normal-latin.woff2 | head -1
curl -s http://localhost:8123/index.html | grep -c "googleapis\|gstatic"
```

---

*Salvo em: `.hermes/plans/2026-10-14_143000-fix-bug1-fonts-orphaned.md`*