# Plan: Fix Bug 2 — Reveal roda escondido atrás do loader

## Goal
Garantir que a animação de reveal (fade-in suave dos blocos) só inicie **após** o loader do hero ter saído, para que o usuário veja o fade-in suave em vez de conteúdo já revelado.

## Current Context / Assumptions
- **Bug**: `initReveal()` roda em `DOMContentLoaded` simultâneo ao `initLoader()`. O observer marca `is-visible` nos blocos enquanto o véu `.loader` ainda cobre a tela. Regra `.is-loading .reveal { transition: none }` cancela a transição. Usuário nunca vê o fade.
- **Arquivos atuais**:
  - `js/loader.js` — `initLoader()` retorna `Promise<void>` que resolve no `play` do Vimeo ou timeout 3s
  - `js/reveal.js` — `initReveal()` usa `IntersectionObserver` + classe `.reveal` + `.is-visible`
  - `js/main.js` — já alterado para `await initLoader()` antes de `initReveal()`
  - `styles.css:192` — `.is-loading .reveal { transition: none }` (paliativo que deve ser removido após fix)
- **Servidor**: `python3 -m http.server 8123` em `/home/hermes/silencebotique/`

## Architecture / Proposed Approach
O loader é o "gate" de entrada da página. O reveal só deve começar a observar **após** o loader resolver. Isso elimina a corrida e permite remover o paliativo CSS `.is-loading .reveal { transition: none }`.

Mudança mínima: `initLoader()` já retorna `Promise<void>` que resolve no `play` ou timeout 3s. Basta garantir que `main.js` faça `await initLoader()` **antes** de chamar `initReveal()`. Já feito no `main.js`. Restam dois ajustes:
1. Remover o paliativo CSS `.is-loading .reveal { transition: none }` (agora desnecessário).
2. Garantir que `initLoader()` rejeite a promise em caso de erro de import do Vimeo (hoje sempre resolve no catch — ok para UX, mas sem sinal de erro).

## Step-by-Step Tasks

### Task 1: Verificar estado atual (read-only)
```bash
cd /home/hermes/silencebotique
grep -n "is-loading.*reveal" styles.css
grep -n "await initLoader" js/main.js
cat js/loader.js
```
**Expected**: paliativo CSS presente; `main.js` já tem `await initLoader()`; `loader.js` retorna `Promise<void>`.

---

### Task 2: Remover paliativo CSS desnecessário
**Arquivo**: `styles.css`
**Linha alvo**: 192 (aprox) — `.is-loading .reveal { transition: none; }`
**Ação**: Apagar a regra inteira.

**Verificação**:
```bash
grep -n "is-loading.*reveal" styles.css
```
**Expected**: zero resultados.

---

### Task 3: Melhorar error handling no loader (opcional, robustez)
**Arquivo**: `js/loader.js`
**Problema**: `catch` sempre chama `hideLoader()` → `resolve()`. Promise nunca rejeita. Se o Vimeo falhar silenciosamente, o loader some mas não há sinal de erro.
**Ação**: No `catch`, logar erro e depois resolver (mantém UX), mas permitir que callers saibam se houve erro se quiserem.

**Patch mínimo** (mantém comportamento atual, só adiciona log):
```javascript
} catch (err) {
  console.warn('[SILENCE] Vimeo loader failed, hiding loader:', err);
  hideLoader();
}
```

**Verificação**:
```bash
grep -A2 "catch" js/loader.js
```

---

### Task 4: Smoke test completo
```bash
cd /home/hermes/silencebotique
pkill -f 'python3 -m http.server' && sleep 1 && python3 -m http.server 8123 &
sleep 2
curl -s -o /dev/null -w "HTTP %{http_code}
" http://localhost:8123/index.html
```
Abrir `http://100.123.155.52:8123/index.html` no navegador real (não headless) e confirmar:
1. Loader aparece (off-white)
2. Após vídeo iniciar (ou 3s), loader faz fade-out 700ms
3. **Blocos abaixo fazem fade-in suave** (não aparecem instantâneos)
4. Scroll revela blocos restantes com fade suave

---

## Tests / Validation

| Teste | Comando / Ação | Expected |
|-------|----------------|----------|
| Paliativo removido | `grep -c "is-loading.*reveal" styles.css` | `0` |
| Loader retorna Promise | `grep -c "return new Promise" js/loader.js` | `1` |
| main.js awaita loader | `grep -c "await initLoader" js/main.js` | `1` |
| Reveal roda após loader | Visual: fade-in visível nos blocos | Visível |
| Zero erros console | DevTools Console | 0 erros |

---

## Risks, Tradeoffs, Open Questions

| Risco | Mitigação |
|-------|-----------|
| Vimeo não dispara `play` (autoplay bloqueado) | Fail-safe 3s garante que loader some |
| Promise nunca rejeita → erros silenciosos | Log no `catch` mantém visibilidade sem quebrar UX |
| Transição CSS não roda em headless | Testar em navegador real (não headless) |
| `prefers-reduced-motion` desliga transição | Já coberto em `styles.css:259-264` |

**Open question**: O `initReveal()` adiciona `.reveal` a todos os targets e depois o observer adiciona `.is-visible`. Se o loader já saiu, a transição roda normalmente. Se por algum motivo o loader demorar >3s, o reveal já terá começado a observar — mas a transição só roda quando a classe `.is-visible` é adicionada, que acontece no `IntersectionObserver`. Como o loader já saiu, a transição roda normalmente. **Correto**.

---

## Commands Summary
```bash
cd /home/hermes/silencebotique

# 1. Remover paliativo CSS
sed -i '/\.is-loading \.reveal { transition: none; }/d' styles.css

# 2. Verificar
grep -n "is-loading.*reveal" styles.css

# 3. Testar
pkill -f 'python3 -m http.server' && sleep 1 && python3 -m http.server 8123 &
sleep 2
curl -s -o /dev/null -w "HTTP %{http_code}
" http://localhost:8123/index.html

# 4. Validar visualmente em http://100.123.155.52:8123/index.html
```

---

*Salvo em: `.hermes/plans/2026-10-14_184500-fix-bug2-reveal-timing.md`*