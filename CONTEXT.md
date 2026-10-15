# CONTEXT — SILENCE

Referência central do projeto. Glossário, linguagem ubíqua e tokens de design.
Fonte anterior (`silence.md`, briefing de 15 páginas) removida do worktree; histórico em `git show HEAD:silence.md`.

## Termos-chave

- **SILENCE** – Boutique travel company criando experiências de viagem lentas e selecionadas no Brasil para profissionais de saúde mental (psicólogos clínicos, terapeutas, psicanalistas, psiquiatras). Formato: 7 noites / 8 dias, grupos de 8 a 10 participantes pagantes. Territorialidade: só Brasil. Mercado: internacional (prioridade EUA). Posicionamento: premium, quiet luxury, curadoria, sem promessa de transformação.
- **Slow travel** – Experiências que desaceleram o ritmo de propósito, priorizando profundidade cultural, presença e encontro humano sobre velocidade ou turismo de massa.
- **Viagem boutique** – Viagem premium, altamente selecionada, com poucos participantes (8-10), curadoria personalizada, foco em qualidade sobre quantidade.
- **Quem viaja** – Profissionais de saúde mental (psicólogos, terapeutas, psicanalistas, psiquiatras), curiosos, abertos a outras culturas, confortáveis em grupos pequenos, interessados em natureza, cultura, descanso e conversas significativas.
- **O que SILENCE não é** – Terapia, retiro, wellness genérico (spa, yoga, detox), viagem profissional/congresso, turismo convencional, luxo por luxo, grupo animado o tempo todo. Não promete transformação. Não faz suposições sobre o estado emocional do convidado.

## Relações e limites

- **SILENCE vs. terapia/wellness/viagem profissional** – SILENCE não oferece terapia; cria condições para que algo aconteça sem prescrever o que. Não é wellness, mas conexão. Não é viagem de trabalho, mas descanso.
- **Propósito vs. transformação** – SILENCE cria espaço para descanso, descoberta, encontro e tempo não programado — não para "curar" ou "voltar renovado".
- **Curadoria vs. seleção aleatória** – Experiências são selecionadas a partir de cultura brasileira, natureza e hospitalidade boutique, não de listas de atrações.
- **Silêncio vs. meditação** – A dimensão é contemplativa, não meditativa. Nenhuma prática, técnica ou instrução de interioridade é oferecida.

## Território e mercado

- **Mercado-alvo** – Internacional, com prioridade EUA. Operação no Brasil.
- **Brasil como destino único** – FLAGSHIP: Vila Oyá Casa Hotel, Praia de Algodões, Península de Maraú, Bahia. Outros destinos em desenvolvimento: Atins (Lençóis Maranhenses) e The Amazon. Uma região por edição. O site de Vila Oyá é o modelo visual de referência. O Brasil é protagonista, sem folclore turístico.

## Processo e vendas

- **Processo de admissão em três etapas** – 1. Convite direcionado; 2. Formulário de interesse; 3. Conversa individual. A experiência é personalizada e personificada.
- **Pipeline existente** – 40k potenciais clientes; 10 já manifestaram interesse no flagship. O site é ferramenta de vendas desse pipeline, não ferramenta de validação de mercado.
- **Métricas de validação** (demanda, compreensão do conceito, disposição a pagar, entrega pós-viagem) – responsabilidade de outros departamentos, não do website.

## Confiança e privacidade

- **Privacidade para público sensível** – Público formado por profissionais de saúde mental, especialmente sensível a privacidade. Política clara (LGPD, GDPR, CCPA). Zero coleta de dados de saúde ou diagnóstico, em qualquer formulário. Analytics sem cookies invasivos. SPF/DKIM/DMARC no e-mail do domínio.
- **Sem suposições sobre estado emocional** – Nenhuma pergunta sobre diagnóstico, estado emocional ou esgotamento. Nenhuma estatística de burnout no site público.

## Arquitetura e fluxo

- **Site como ferramenta de vendas** – Seções do MVP (single-file landing): Home, Silence (filosofia), The Experience, Brazil (Vila Oyá), The Journeys, Who it's for, The Founder, FAQ, Request an invitation.
- **Área privada de hóspedes** (fase 2+) – Guia pré-viagem, informações práticas.

## Princípios de design

- **Silêncio como princípio fundamental** – Espaço em branco é conteúdo. Poucas palavras por tela, uma ideia por vez. Ritmo lento, transições suaves, nada competindo por atenção. Zero contadores regressivos, pop-ups, chatbot invasivo, som automático. Escuta antes de fala. Curadoria visível.
- **Quiet luxury como template secundário** – Estética minimalista e elegante, paleta natural, tipografia refinada. O silêncio é o princípio; o quiet luxury é a expressão visual.

### Tokens

- **Paleta (hex)**
  | Token | Hex | Papel |
  |-------|-----|-------|
  | `--paper` | `#F9F8F6` | fundo off-white quente |
  | `--paper-warm` | `#F2F0EB` | papel quente |
  | `--ink` | `#141916` | tinta carvão |
  | `--muted` | `#686662` | cinza pedra |
  | `--line` | `#D9D6D0` | linha |
  | `--green` | `#4A5848` | verde-musgo |
  | `--earth` | `#8A7968` | terra |
  | `--nav-scrolled` | `#393D38` | links da nav com header sólido |
  | `--form-label` | `#303530` | labels de formulário |
  | `--invitation-text` | `#565B55` | textos da seção convite, nota do formulário |
  | `--placeholder` | `#706E6B` | placeholders |
  | `--field-line` | `#AAA99F` | sublinhado de campo |
  | `--quiet-line` | `#9C9E94` | borda de botão quiet |
  | `--note-line` | `#C6C6BD` | borda da nota de privacidade |
  | `--track` | `#CFCEC5` | trilho do progresso |
  | `--invitation-bg` | `#E9E8E1` | fundo da seção convite |
  | `--text-on-green` | `#E2E4DB` | textos sobre fundo verde |

  Contraste WCAG AA obrigatório para **texto**. `--earth` (3.94:1) e `--line` (1.37:1) são tokens de **forma** — nunca aplicar a texto legível.
- **Tipografia** – Display/wordmark: serifada editorial (Playfair Display). Corpo/UI: sans geométrica (DM Sans). Wordmark em caixa alta, tracking `0.15em`–`0.25em`.
- **Movimento** – transições lentas (`ease-out`, ~700ms), fades sutis na rolagem. `prefers-reduced-motion` desliga tudo.
- **Hero** – imagem/vídeo lento em loop, sem som, tipografia surgindo após breve respiro.

### Direção de fotografia e vídeo

- Natureza e arquitetura boutique: luz natural, horas douradas, névoa, água, madeira, linho.
- Pessoas de costas, de longe, em contemplação — nunca posando ou sorrindo para a câmera.
- Detalhes de hospitalidade: mãos, xícaras, janelas, redes, varandas.
- Brasil como experiência: cultura, gastronomia, artesanato, paisagens, modos de viver — sem folclore turístico.
- Vídeos curtos (5–12 s), loop lento, sem áudio embutido, sempre com poster.

### Momentos de silêncio

- Seção intencionalmente quase vazia entre blocos de texto, com uma única frase.
- Hero sem texto nos primeiros segundos.
- Botão `Listen` opcional (som desligado por padrão; autoplay proibido).
- 404 poética. Estados de carregamento minimalistas. Rodapé como assinatura.
- "Moments not programmed": o não programado visível no itinerário.

## Voz

- Institucional, sensorial, sóbria. Frases curtas. Verbos de convite ("invites", "creates space"), nunca de promessa ("transforms", "heals", "fixes").
- Assinatura global: **Let silence speak.**

|| Preferir | Evitar |
|| --- | --- |
|| space, room, pause, presence, listening, curated, small-scale | healing, therapy, treatment, recovery, burnout cure, detox |
|| "those who care for others" | "stressed/exhausted therapists" |
|| "creates the conditions for something to happen" | "you will discover / become / transform" |
|| "boutique travel company" | "wellness retreat", "therapy trip", "retreat" |
|| quiet luxury | luxury, exclusive, VIP (ostensivo) |

## Checklist de "não pode"

- Nenhuma palavra de terapia, tratamento, cura, retiro ou transformação prometida.
- Nenhuma estatística de burnout ou suposição sobre o estado emocional do visitante.
- Nenhum pop-up, contador regressivo, chat invasivo ou som automático.
- Nenhuma imagem de clichê wellness (lótus, velas, yoga no pôr do sol, pedras empilhadas, spa).
- Nenhuma imagem de agência de turismo (resort, piscina, selfie, banco de imagens óbvio).
- Nenhuma biografia inventada do fundador.
- Brasil como único destino; mercado internacional (EUA prioritário).
- Marca em primeiro plano; fundador como visão e curadoria.
- Grupo de 8 a 10 participantes.
- Vila Oyá como flagship confirmado.

## Tecnologia

- **Performance** – Mobile-first, LCP < 2,5 s, CLS < 0,1, INP < 200 ms, Lighthouse mobile > 90. CDN global, AVIF/WebP, srcset, lazy loading, dimensões declaradas.
- **Acessibilidade** – WCAG 2.2 AA: contraste, teclado completo, foco visível, alt descritivo, erros gentis, áudio/vídeo nunca automáticos.
- **SEO de categoria** – Mirar "curated travel Brazil", "slow travel Brazil", "boutique travel for psychologists/therapists", "small-group travel Brazil". Nunca "therapy retreat", "wellness retreat", "travel therapy".
- **Formulário** – Anti-spam discreto (honeypot/Turnstile), sem CAPTCHA irritante.
- **Plataforma** – Framer/Webflow ou Astro. Decisão do TI.

## Fases de lançamento

0. **Preparação** – conteúdo oficial, fotos/vídeos, domínio, e-mail, páginas legais.
1. **Soft launch privado** – acesso por link à rede próxima do fundador; feedback sobre clareza e sensação.
2. **Lançamento direcionado** – convites diretos, LinkedIn do fundador, associações e parceiros. Qualidade de conexão, não volume.
3. **Aprendizado** – ajustar textos, FAQ e formulário com base nas conversas individuais.
4. **Segunda edição** – depoimentos, datas e, se fizer sentido, área privada e conteúdo editorial.

## Perguntas em aberto

- Domínio (.com, .com.br, .travel)? Já registrado?
- Só inglês no lançamento ou já bilíngue?
- Quem edita o conteúdo depois (fundador? agência?)
- Já existem fotos e vídeos próprios, ou será preciso produzir/licenciar? As fotos da Vila Oyá podem ser licenciadas?
- O investimento aparece no site ou só na conversa individual?
- Reserva e pagamento online no MVP, ou apenas pedido de convite?
- Qual CRM/e-mail a equipe já usa?
- Orçamento para ferramentas recorrentes?
- Quais datas da primeira edição podem ser comunicadas?
- Nome, foto e texto do fundador entram no lançamento?
- Quantos quartos a Vila Oyá tem disponíveis para 8–10 pessoas?

## Resumo para o time técnico

Um site lento no ritmo e rápido no carregamento: poucas páginas, muito espaço, texto oficial da marca, formulário em formato de conversa, privacidade impecável — e nada que pareça terapia, wellness genérico ou turismo de massa.

## The Journeys (seção da landing)

**Propósito** – Seção da landing que apresenta todos os destinos SILENCE com estrutura consistente, dentro do scroll de `index.html`. O visitante compara destinos e escolhe o que mais interesa, mantendo o tom contemplativo e a curadoria.

**Estrutura da seção**

1. **Cabeçalho** – `section-number` (04), título H2, texto de introdução.
   - Título: "Three places, one pace."
   - Intro: "Each SILENCE journey stays with one region — a considered base, a small group, and unhurried days."

2. **Grid de destinos (3-col)** – Cada card contém:
   - Imagem destacada (ou placeholder com gradiente)
   - Eyebrow: "The inaugural journey" (flagship) ou região
   - Nome do destino em H3
   - Subtítulo com acomodações
   - Breve descrição (campo `description`)
   - Link CTA: "Enquire about this journey" (para #invitation)

3. **Encerramento** – Transição suave para a seção de convite.

**Layout responsivo** (grid de cards; a altura da fila estira os cards)

- Desktop: grid 3 colunas
- Tablet (≤900px): grid 2 colunas
- Mobile (≤680px): grid 1 coluna

**Destinos**

- **Praia de Algodões (Maraú Peninsula, Bahia)** – flagship, Vila Oyá Casa Hotel
  - Eyebrow: "The inaugural journey"
  - Imagem placeholder até produção
  - Description: "On Bahia's coast, the Atlantic, the forest, and the architecture make their presence felt without asking for attention."

- **Atins (Lençóis Maranhenses, Maranhão)** – non-flagship
  - Eyebrow: "Lençóis Maranhenses, Maranhão"
  - Acomodação: "Boutique pousada"
  - Description: "A quiet village between the dunes and the sea, where white sand and fresh water meet at the edge of the Lençóis National Park."

- **The Amazon (Amazon region)** – non-flagship
  - Eyebrow: "Amazon region"
  - Acomodação: "Boutique lodge"
  - Description: "Deep in the forest, the river sets the pace. A place where silence is the loudest presence and the day follows the current."

**Design tokens específicos**

- `.journeys` – padding: 135px top / 145px bottom (base desktop); mobile (≤680px) 87px / 91px
- `.journeys-grid` – display: grid, gap 26px desktop, 20px mobile
- `.journey-card` – flex column, background var(--paper), border 1px solid var(--line)
- `.journey-card-flagship` – border-color: var(--green)
- `.journey-body .eyebrow` – color: var(--green) (nunca `--earth`, é token de forma — WCAG AA)
- `.journey-image-placeholder` – background: linear-gradient(135deg, var(--earth), var(--green))

**Acessibilidade**

- `aria-labelledby="journeys-title"` na section
- `role="img"` + `aria-label="Placeholder image for {name}"` nos placeholders
- `alt="{name}"` em imagens reais
- Foco visível em links (<200ms INP)

**Checklist de "não pode"**

- Nenhuna imagem de agência de turismo padrão
- Nenhuna estatística de burnout
- Nenhuna menção de terapia/tratamento/cura/retiro/transformação
- Assinatura "Let silence speak." transmitida
- Grupo 8–10 em todos os destinos
- Flagship destacado só Vila Oyá

**Numeração das seções** (espelha o HTML real)

- 01 / The philosophy · 02 / The experience · 03 / Brazil
- 04 / The Journeys · 05 / Who it's for · 06 / A few clear answers · 07 / Request an invitation
- The Founder não tem número (seção institucional curta, fora da numeração) e **não entra na nav** (nav enxuta; quem se interessa encontra no scroll).

**Pendências técnicas para o launch**

- Hero video: iframe Vimeo (background mode, `background=1&autoplay=1&muted=1&loop=1&dnt=1`) mantido. Referência do vídeo está em `assets/video/README.md`.
- Anti-spam do formulário (honeypot/Turnstile) — adiar para o soft launch, quando o form realmente transmitir (hoje o protótipo não envia).
- Tracking privado (Plausible) — idem, fase soft launch (site de vendas real).
- SEO/social: sem OG/Twitter cards, sem schema.org, sem canonical no `<head>` — adicionar na preparação de conteúdo oficial.

**Arquitetura de destinos (data-driven)**

- Fonte da verdade: `js/journeys.js` – array `LOCATIONS` (const interna do módulo).
- Acrescentar/remover destino = editar o array; o DOM se atualiza via `renderJourneys(container)` em `js/journeys.js`.
- Estrutura de produto: `id`, `name`, `region`, `accommodation`, `flagship`, `image`, `description`.
- Flagship: `flagship: true` – Vila Oyá; destaque visual (borda verde), eyebrow "The inaugural journey".
- Imagens: campo `image: null` = placeholder (bloco com gradiente). Atribuir URL real antes do launch.