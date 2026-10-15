# Plan: Pesquisa & Justificativa da Paleta + Tokens de Cor

## Goal
Pesquisar e justificar (ou corrigir) a paleta de cores do SILENCE segundo teoria das cores e WCAG 2.2 AA, e então eliminar a paleta paralela — 17 hex no `styles.css` contra 7 tokens declarados no `CONTEXT.md`.

---

## Current Context / Assumptions

- **Projeto**: SILENCE — boutique travel company, quiet luxury, slow travel no Brasil para profissionais de saúde mental. Mercado NA/EU, inglês.
- **Atributos de marca**: quiet luxury, contemplativo, premium, natural, sereno. Nunca clínico, nunca wellness-espa.
- **Arquivos**: `styles.css` (fonte de estilos), `CONTEXT.md` (fonte de verdade dos tokens), `index.html`
- **Servidor de teste**: `python3 -m http.server 8123` em `/home/hermes/silencebotique/`
- **Estado**: bugs 1 e 2 já corrigidos; `script.js` órfão removido; paliativo CSS do reveal removido.

### Achado que muda o plano

Medi os contrastes reais (script `execute_code`, fórmula WCAG relative luminance). **A premissa original do relatório de auditoria estava errada** em dois pontos:

1. `--muted` dá **5.40:1** sobre `--paper` — passa AA normal (eu havia afirmado 4.8:1, falha).
2. **Nenhuma** das 10 cores não-token é igual a um token existente. A mais próxima (`#e9e8e1` → `--paper-warm`) está a 1.08:1 de distância; a mais distante (`#9c9e94` → `--line`) a 1.87:1. Todas são **escolhas de design deliberadas**, não duplicatas.

**Consequência**: a ideia de "absorver no token existente onde for imperceptível" está morta. Substituir mudaria o visual. O caminho correto é **promover todas a tokens nomeados**.

---

## Phase 1 — Pesquisa e justificativa (fazer ANTES de tocar no código)

### Task R1: Medir contraste de tudo que é texto

```bash
cd /home/hermes/silencebotique
python3 - <<'EOF'
def lin(c):
    c=c/255
    return c/12.92 if c<=0.03928 else ((c+0.055)/1.055)**2.4
def lum(h):
    h=h.lstrip('#')
    r,g,b=int(h[0:2],16),int(h[2:4],16),int(h[4:6],16)
    return 0.2126*lin(r)+0.7152*lin(g)+0.0722*lin(b)
def ratio(a,b):
    la,lb=lum(a),lum(b); hi,lo=max(la,lb),min(la,lb)
    return (hi+0.05)/(lo+0.05)
paper='#F9F8F6'
for name,v in [('ink','#141916'),('muted','#686662'),('green','#4A5848'),
               ('earth','#8A7968'),('form-label','#303530'),
               ('invitation-text','#565b55'),('nav-scrolled','#393d38')]:
    r=ratio(v,paper)
    print(f"{name:18} {v}  {r:5.2f}:1  AA-normal={'PASS' if r>=4.5 else 'FAIL'}  AAA={'PASS' if r>=7 else 'FAIL'}")
print()
print("text-on-green #e2e4db sobre --green #4A5848:", round(ratio('#e2e4db','#4A5848'),2))
EOF
```

**Resultado esperado (já verificado)**:

| Cor | Sobre `--paper` | AA normal |
|-----|-----------------|-----------|
| `--ink` `#141916` | 16.76:1 | PASS (AAA) |
| `--muted` `#686662` | 5.40:1 | PASS |
| `--green` `#4A5848` | 7.12:1 | PASS (AAA) |
| `--earth` `#8A7968` | **3.94:1** | **FAIL** ⚠️ |
| `#303530` | 11.79:1 | PASS (AAA) |
| `#565b55` | 6.54:1 | PASS |
| `#393d38` | 8.14:1 | PASS |
| `#e2e4db` sobre `--green` | 5.88:1 | PASS |

**Único problema real**: `--earth` falha AA para texto normal. Onde é usado?

---

### Task R2: Auditar onde `--earth` é usado como texto

```bash
cd /home/hermes/silencebotique
grep -n "var(--earth)" styles.css
```

Hoje: `.aside-line` (linha decorativa — cor de **forma**, não texto), `.breather-mark` (o travessão "—", decorativo), `.site-nav a:hover` (hover de nav — 10px) e possivelmente mais.

**Pergunta de design a responder**: `--earth` é usado para *texto legível* ou apenas para *elementos decorativos* (linhas, marcas, hovers)? Se decorativo, 3.94:1 não é violação (WCAG 1.4.3 aplica a texto). Se há texto de 10px em hover, precisa subir para ~4.5:1 → `#7A6A5B` ou similar.

**Entregável**: lista de usos classificados (texto vs. forma).

---

### Task R3: Justificar ou corrigir a paleta

Sete perguntas, uma resposta curta cada — registradas no `CONTEXT.md`:

1. **Harmonia**: `--green` (H≈120°) e `--earth` (H≈30°) estão a 90° no círculo cromático → quase complementares, sustentados por neutros quentes (`#F9F8F6`, `#F2F0EB`). Funciona para quiet luxury: um verde profundo + um terroso + neutros, sem cor saturada.
2. **Por que near-black e não `#000`?** `#141916` tem 2–4 pontos de verde no canal — aquece o preto e evita a dureza do contraste máximo. Coerente com "não clínico".
3. **Por que dois off-whites?** `#F9F8F6` (base) e `#F2F0EB` (seções alternadas). A diferença é 1.03:1 — serve para separar seções suavemente, não para contraste.
4. **`--green` como cor de marca**: 7.12:1 sobre paper — pode carregar texto e é o único acento com peso AA. Correto estar no CTA e nos eyebrows.
5. **`--earth` como acento**: falha AA como texto. Aceitável **só** como forma/decorativo.
6. **Benchmark quiet luxury** (Aesop, Aman, The Row): padrão é neutro quente + um escuro profundo + um terroso. A paleta SILENCE segue o padrão. Sem necessidade de mudança estrutural.
7. **Daltônico**: verde `#4A5848` e terra `#8A7968` são distinguíveis por luminância (7.12 vs 3.94) mesmo para deuteranopia. Os neutros carregam a hierarquia. Sem problema.

**Conclusão esperada**: a paleta está fundamentada, **exceto** `--earth` como texto. Não reescrever a paleta — só corrigir o uso.

---

## Architecture / Proposed Approach

Manter a paleta (está justificada). Promover as 10 cores não-token a **tokens semânticos nomeados** — já que nenhuma é duplicata de token existente, todas são decisões de design que merecem nome. `CONTEXT.md` passa a ter 17 tokens (7 base + 10 semânticos) e é a única fonte de verdade; `styles.css` só usa `var(--token)`.

---

## Step-by-Step Tasks (implementação)

### Task 1: Backup
```bash
cd /home/hermes/silencebotique
cp styles.css styles.css.bak && cp CONTEXT.md CONTEXT.md.bak
```
**Expected**: dois arquivos `.bak` criados.

---

### Task 2: Adicionar 10 tokens semânticos ao `:root`
**Arquivo**: `styles.css`, após a linha `--earth: #8a7968;`

```css
  /* Semantic tokens — derived from the base palette, named by role */
  --nav-scrolled: #393d38;      /* nav links once header turns solid */
  --form-label: #303530;         /* form field labels */
  --invitation-text: #565b55;    /* body copy in the invitation section */
  --placeholder: #706e6b;        /* input/select placeholder text */
  --field-line: #aaa99f;         /* form control underline */
  --quiet-line: #9c9e94;         /* quiet button border */
  --note-line: #c6c6bd;          /* privacy note top border */
  --track: #cfcec5;              /* form progress track */
  --invitation-bg: #e9e8e1;      /* invitation section background */
  --text-on-green: #e2e4db;      /* text sitting on --green */
```

**Verificação**:
```bash
grep -c "  --" styles.css   # 12 base + 10 semânticos = 22
```
**Expected**: `22`.

---

### Task 3: Substituir as 13 ocorrências por `var(--token)`

**Arquivo**: `styles.css`

| # | Linha aprox. | Seletor | Antes | Depois |
|---|---|---|---|---|
| 1 | ~70 | `.site-header.is-scrolled .site-nav` | `#393d38` | `var(--nav-scrolled)` |
| 2 | ~164 | `.founder .eyebrow` | `#e2e4db` | `var(--text-on-green)` |
| 3 | ~167 | `.founder-signature` | `#e2e4db` | `var(--text-on-green)` |
| 4 | ~179 | `.invitation` background | `#e9e8e1` | `var(--invitation-bg)` |
| 5 | ~183 | `.invitation-intro > p:not(...)` | `#565b55` | `var(--invitation-text)` |
| 6 | ~184 | `.invitation-intro .privacy-note` border-top | `#c6c6bd` | `var(--note-line)` |
| 7 | ~188 | `.progress-track` background | `#cfcec5` | `var(--track)` |
| 8 | ~194 | `.form-step > label > span` | `#303530` | `var(--form-label)` |
| 9 | ~195 | `.form-step input/select/textarea` border-bottom | `#aaa99f` | `var(--field-line)` |
| 10 | ~197 | `.form-step input::placeholder` | `#706e6b` | `var(--placeholder)` |
| 11 | ~198 | `.form-step select:invalid` | `#706e6b` | `var(--placeholder)` |
| 12 | ~200 | `.interest-options label` | `#303530` | `var(--form-label)` |
| 13 | ~204 | `.button-quiet` border-color | `#9c9e94` | `var(--quiet-line)` |
| 14 | ~206 | `.form-note` | `#565b55` | `var(--invitation-text)` |

**Verificação**:
```bash
grep -nE '#303530|#393d38|#565b55|#706e6b|#9c9e94|#aaa99f|#c6c6bd|#cfcec5|#e2e4db|#e9e8e1' styles.css
```
**Expected**: vazio (fora do `:root`).

---

### Task 4: Sincronizar `CONTEXT.md`

**Arquivo**: `CONTEXT.md`, seção `### Tokens` → tabela Paleta. Expandir para 17 linhas, com uma coluna **Papel**:

```markdown
| Token | Hex | Papel |
|-------|-----|-------|
| `--paper` | `#F9F8F6` | fundo base off-white |
| `--paper-warm` | `#F2F0EB` | seções alternadas |
| `--ink` | `#141916` | texto principal, near-black esverdeado |
| `--muted` | `#686662` | texto secundário |
| `--line` | `#D9D6D0` | divisores |
| `--green` | `#4A5848` | cor de marca, CTA, eyebrows |
| `--earth` | `#8A7968` | acento terroso — **formas apenas, nunca texto** (3.94:1) |
| `--nav-scrolled` | `#393d38` | links da nav com header sólido |
| `--form-label` | `#303530` | rótulos de formulário |
| `--invitation-text` | `#565b55` | corpo na seção convite |
| `--placeholder` | `#706e6b` | placeholders |
| `--field-line` | `#AAA99F` | sublinhado de campo |
| `--quiet-line` | `#9C9E94` | borda de botão quiet |
| `--note-line` | `#C6C6BD` | borda da nota de privacidade |
| `--track` | `#CFCEC5` | trilho do progresso |
| `--invitation-bg` | `#E9E8E1` | fundo da seção convite |
| `--text-on-green` | `#E2E4DB` | texto sobre `--green` |

Contraste WCAG 2.2 AA obrigatório para **texto**. `--earth` (3.94:1) e `--line` (1.37:1) são tokens de **forma** — nunca aplicar a texto legível.
```

---

### Task 5: Confirmar que `--earth` não carrega texto

```bash
grep -n "var(--earth)" styles.css
```
Revisar cada resultado. Se algum for `color:` de texto com fonte < 18px, trocar por `var(--green)` ou `var(--muted)`. Se todos forem `background`/`border`/marca decorativa, nada a fazer.

---

### Task 6: Validação final

```bash
cd /home/hermes/silencebotique

# a) nenhum hex cru fora do :root
awk '/^:root/,/^}/' styles.css > /tmp/root.txt
grep -vFf /tmp/root.txt styles.css | grep -oE '#[0-9a-fA-F]{6}' | sort -u
# Expected: vazio

# b) todo var() usado tem declaração
grep -oE 'var\(--[a-z-]+\)' styles.css | sed 's/var(--\(.*\))/\1/' | sort -u > /tmp/used.txt
grep -oE '^\s+--[a-z-]+' styles.css | tr -d ' ' | sort -u > /tmp/decl.txt
comm -23 /tmp/used.txt /tmp/decl.txt
# Expected: vazio  (nenhum token usado sem declaração)

# c) smoke test
pkill -f 'python3 -m http.server' && sleep 1 && python3 -m http.server 8123 &
sleep 2
curl -s -o /dev/null -w "HTTP %{http_code}\n" http://localhost:8123/index.html
# Expected: HTTP 200
```

---

## Tests / Validation

| Teste | Comando | Expected |
|---|---|---|
| Hex cru fora do `:root` | `awk '/^:root/,/^}/' styles.css > /tmp/r; grep -vFf /tmp/r styles.css \| grep -oE '#[0-9a-fA-F]{6}' \| sort -u` | vazio |
| Token usado sem declaração | `comm -23 /tmp/used.txt /tmp/decl.txt` | vazio |
| `--earth` só em formas | `grep -n "var(--earth)" styles.css` | nenhum `color:` de texto |
| Contraste AA de texto | Task R1 | todos PASS exceto decorativos |
| Sem regressão visual | abrir `http://100.123.155.52:8123/index.html` e comparar com `styles.css.bak` | idêntico |
| HTTP | `curl -s -o /dev/null -w "%{http_code}" http://localhost:8123/index.html` | `200` |

---

## Risks, Tradeoffs, Open Questions

| Risco | Mitigação |
|---|---|
| Promover 10 tokens incha a lista | Aceito: cada um é um papel distinto comprovado por medição. Alternativa (absorver) mudaria o visual. |
| `--earth` 3.94:1 | Restringir a formas; documentar no `CONTEXT.md` |
| Nomes de token ruins | Usar papel, nunca escala (`--gray-500`). Se um nome não descrever o uso, renomear na hora. |
| Regressão visual silenciosa | Manter `styles.css.bak` até validar no navegador |
| `--track` e `--note-line` talvez sejam iguais na prática | Aceito — correção de 1 valor cada, não vale fusão prematura (YAGNI) |

### Open questions (responder antes de executar)

1. `--earth` está mesmo só em formas decorativas, ou há texto pequeno em hover de nav? (Task R2 resolve.)
2. Quer mesmo 17 tokens nomeados, ou prefere aceitar hex cru em 3–4 casos onde o valor é usado uma única vez e é óbvio no contexto?
3. O `--placeholder` `#706e6b` sobre `--paper-warm` (fundo da seção convite) dá quanto? (Se falhar AA, placeholders são isentos — mas vale saber.)

---

## Commands Summary

```bash
cd /home/hermes/silencebotique
cp styles.css styles.css.bak && cp CONTEXT.md CONTEXT.md.bak
# editar styles.css: 10 tokens em :root + 14 substituições
# editar CONTEXT.md: tabela de 17 linhas
pkill -f 'python3 -m http.server' && sleep 1 && python3 -m http.server 8123 &
sleep 2 && curl -s -o /dev/null -w "HTTP %{http_code}\n" http://localhost:8123/index.html
```
