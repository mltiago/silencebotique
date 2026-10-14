# SILENCE — Contexto & Diretrizes para Vibecoding

> **Objetivo:** Guia consolidado de regras, design system, tom de voz e anti-padrões para alimentar ferramentas de IA na geração de código e prototipagem do site da SILENCE.

---

## 1. Identidade Essencial do Projeto

*   **Nome da Marca:** SILENCE
*   **Assinatura / Tagline:** *Let silence speak*
*   **Categoria:** Boutique Travel & Experiential Hospitality (Viagens imersivas e lentas com curadoria).
*   **Frase-síntese oficial:**
    > *"A boutique travel company creating curated, slow travel experiences in Brazil for mental health professionals."*
*   **Público-alvo:** Profissionais de saúde mental internacionais (psicólogos clínicos, psicoterapeutas, psicanalistas, psiquiatras) em fase intermediária a avançada de carreira. Prioridade: EUA / idioma inglês.
*   **Destino:** Exclusivamente Brasil (uma região por vez, ritmo lento, cultura e natureza autênticas).
*   **Formato:** 7 noites / 8 dias, grupos hiper-reduzidos (6 a 8 pessoas).

---

## 2. A "Vibe" & Design System (Frontend / UI / UX)

### Filosofia de Design: *"O site que sabe calar"*
O visitante deve sentir calma em menos de 10 segundos. O design é a própria amostra do serviço: espaço em branco, ritmo contemplativo, ausência total de urgência ou ruído.

### Paleta de Cores
*   **Background principal:** Off-white quente / papel suave (`#F9F8F6` ou `#F7F5F0`).
*   **Base contrastante (Texto / Dark panels):** Carvão profundo ou verde-escuro quase preto (`#141916` ou `#1A1D1A`).
*   **Neutros secundários:** Cinza pedra quente (`#706E6B`, `#E5E2DC`).
*   **Acentos sutis:** Tons terrosos ou verde-musgo dessaturado (`#4A5848`, `#8A7968`).
*   *Regra de contraste:* Atenção estrita ao contraste de leitura (WCAG AA). Nada de texto cinza ilegível.

### Tipografia
*   **Títulos / Display / Wordmark:** Serifada elegante, editorial, clássica (ex: *Cormorant Garamond*, *Playfair Display*, *Cinzel* ou serif customizada).
    *   *Wordmark:* `SILENCE` em caixa alta com `letter-spacing: 0.15em` a `0.25em`.
*   **Corpo de Texto / UI:** Sans-serif geométrica limpa e respirada (ex: *Montserrat*, *Plus Jakarta Sans*, *Inter*, ou *Geist Sans*).

### Ritmo, Movimento & Layout
*   **Espaço em branco extremo:** Seções vazias intencionais entre blocos, contendo apenas uma linha poética.
*   **Animações:** Transições lentas (`transition-all duration-700 ease-out`), fades sutis ao rolar a página.
*   **Acessibilidade:** Suporte obrigatório a `prefers-reduced-motion` (desativa transições lentas para quem tem sensibilidade).
*   **Hero minimalista:** Carregamento suave, imagem/vídeo lento em loop sem som, tipografia que surge após breve respiro.
*   **Áudio (se houver):** Botão discreto `Listen` (sons de vento, água, mata atlântica). **Autoplay é terminantemente proibido.**

---

## 3. Anti-Padrões Absolutos (Regras do "NÃO FAÇA")

Se o agente de IA sugerir qualquer um dos itens abaixo, deve ser corrigido imediatamente:

1.  ❌ **NÃO parecer terapia nem clínica:** Proibido usar termos como *cure, heal, therapy retreat, therapeutic journey, burnout treatment, mental health recovery*.
2.  ❌ **NÃO usar clichês de wellness genérico:** Sem fotos de poses de ioga no pôr do sol, pedras empilhadas, flores de lótus, incenso ou spas convencionais.
3.  ❌ **NÃO diagnosticar nem expor o visitante:** Nunca presumir que o visitante está esgotado ou deprimido. Sem estatísticas de burnout médico no site.
4.  ❌ **NÃO criar urgência de marketing:** Proibido contadores regressivos, badges de "restam 2 vagas!", pop-ups de saída, modais de captura agressivos ou chatbots flutuantes barulhentos.
5.  ❌ **NÃO folclorizar o Brasil:** Nada de clichês turísticos estridentes (carnaval genérico, caipirinha, praia barulhenta). Foco em hospitalidade refinada, luz natural, madeira, linho, arquitetura, natureza e silêncio.
6.  ❌ **NÃO coletar dados de saúde:** No formulário, nunca pergunte sobre diagnóstico, remédios ou histórico emocional.

---

## 4. Arquitetura da Informação & Páginas (MVP)

1.  **Home:**
    *   Hero calmo com wordmark e assinatura.
    *   Frase-síntese de abertura.
    *   Parágrafo de hospitalidade reflexiva.
    *   3 Pilares: *Slow. Small. Brazil.* (ou *Presence · Perception · Connection*).
    *   Momento de respiro visual (tela quase em branco).
    *   CTA discreto: `Request an invitation`.
2.  **Silence (A Filosofia):**
    *   O que Silence é (espaço, escuta, presença, tempo).
    *   Seção elegante *"What SILENCE is not"* (sem blocos coloridos; texto sutil revelando o contraste com turismo/terapia tradicional).
3.  **The Experience:**
    *   Formato 7 noites / 8 dias, 6 a 8 pessoas.
    *   Linha do tempo vertical com "espaços não programados" visíveis na grade de horários.
    *   Seção transparente de itens inclusos / não inclusos.
4.  **Brazil:**
    *   Foco em uma única região por vez (flagship).
    *   Sensações táteis, gastronômicas e sonoras, sem listas de "atrações turísticas".
5.  **Who It's For & Selection Process:**
    *   Critérios humanos e profissionais (curiosidade, abertura cultural, conforto em grupos pequenos).
    *   O processo em 3 passos: *1. Targeted invitation → 2. Interest form → 3. Individual conversation*.
6.  **The Founder:**
    *   Breve texto institucional focado em visão e curadoria (sem histórico clínico ou títulos excessivos).
7.  **Request an Invitation (Funil de Entrada):**
    *   Formulário conversational / multi-step limpo (uma pergunta por vez ou rolagem minimalista).
    *   Campos: Nome, e-mail, profissão/especialidade, anos de experiência, país de residência, idioma, motivação e interesses.
    *   Confirmação humana e serena: *"Thank you. We will be in touch personally."*
8.  **FAQ:**
    *   Respostas diretas e elegantes, esclarecendo que não se trata de terapia em grupo.

---

## 5. Dicionário de Vocabulário da Marca (Prompt Enforcer)

| Em vez de usar (Proibido) | Use preferencialmente (Aprovado) |
| :--- | :--- |
| *Heal, transform, cure, recover* | *Space, pause, room, presence, listen* |
| *Burned-out therapists* | *Those who care for others / Mental health professionals* |
| *Wellness retreat / Therapy trip* | *Boutique travel company / Curated slow travel* |
| *Luxury, VIP, Exclusive* | *Thoughtful hospitality, quiet luxury, curated* |
| *"You will become a better version"* | *"Creates the conditions for something to emerge"* |

---

## 6. Prompt de Sistema Pronto para Ferramentas de Vibecoding

Copie e cole o bloco abaixo no painel de contexto do seu editor de IA (Cursor Rules, Lovable/Bolt system prompt, v0):

```markdown
You are a senior frontend engineer and luxury editorial designer building the web application for "SILENCE", a quiet luxury boutique travel company creating curated, slow travel experiences in Brazil for international mental health professionals.

CORE VALUES & DESIGN RULES:
1. "The site that knows how to be quiet": Radical minimalism, immense whitespace, calm pacing, slow and elegant transitions (ease-out), and zero visual noise.
2. Aesthetic: High-end editorial print look. Warm off-white background (#F9F8F6), deep charcoal text (#141916), subtle warm gray and earthy accents. Serif headlines with generous tracking for the "SILENCE" wordmark; clean geometric sans-serif for body copy.
3. STRICT PROHIBITIONS:
   - Absolutely NO marketing pressure: No countdown clocks, no pop-ups, no invasive chatbots, no fake scarcity.
   - NO therapy or wellness clichés: Do not mention healing, treatment, burnout cures, yoga poses, lotus flowers, or spas.
   - NO health data collection: Forms must never ask for clinical or emotional diagnoses.
   - NO audio autoplay.
4. COPY & VOICE:
   - Official Tagline: "Let silence speak"
   - Core description: "A boutique travel company creating curated, slow travel experiences in Brazil for mental health professionals."
   - Tone: Sensorial, warm, restrained, sophisticated, welcoming.
5. TECH & UX REQUIREMENTS:
   - Fully responsive, mobile-first, semantic HTML5, accessible (WCAG AA, prefers-reduced-motion respected).
   - Multi-step conversational invitation request form with serene UI and clear progress indicator.
   - Clean, lightweight animations.
```