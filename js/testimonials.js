// @ts-check
// testimonials.js — Data-driven guest feedback module for SILENCE (05 / TESTIMONIALS).
// Fetches quotes from ./data/testimonials.json (editable via /admin)
// and renders elegant editorial cards for mental health professionals.

/**
 * @typedef {Object} Testimonial
 * @property {string} id - Unique identifier (e.g. "julian-ross")
 * @property {number} [order] - Display order (1-based)
 * @property {"published" | "archived"} [status] - Publication state
 * @property {string} author - Name of the guest (e.g. "Dr. Julian Ross")
 * @property {string} role - Professional title / discipline
 * @property {string} location - City / Country of practice
 * @property {string} journey - Destination / Journey visited in Brazil
 * @property {string} quote - Contemplative feedback text
 */

/** @type {Testimonial[]} */
export const DEFAULT_TESTIMONIALS = [
  {
    id: "julian-ross",
    order: 1,
    status: "published",
    author: "Dr. Julian Ross",
    role: "Clinical Psychoanalyst",
    location: "Manhattan, New York",
    journey: "Praia de Algodões, Bahia",
    quote:
      "In Manhattan, clinical listening is an act of holding back an overwhelming tide of language. At Algodões, between the reef and the coastal forest, silence was no longer something to interpret—it became an unburdened presence. A rare space where attention simply rests.",
  },
  {
    id: "eleanor-ward",
    order: 2,
    status: "published",
    author: "Prof. Eleanor Ward",
    role: "Professor of Social Psychology",
    location: "Cambridge, United Kingdom",
    journey: "Atins, Lençóis Maranhenses",
    quote:
      "Academic and social life demand continuous performance. In Atins, sharing the vast dunes and quiet freshwater lagoons with eight peers carried zero social expectation. The silence wasn’t awkward or enforced; it was a generous common ground.",
  },
  {
    id: "marcus-reid",
    order: 3,
    status: "published",
    author: "Dr. Marcus Reid",
    role: "Clinical Psychiatrist",
    location: "Vancouver, Canada",
    journey: "The Amazon, Brazil",
    quote:
      "The sensory cadence of the Amazon river at dawn settles chronic clinical vigilance like nothing else. For eight unhurried days, the mind re-calibrates to the slow rhythm of water and canopy. An essential restoration of quiet.",
  },
];

/**
 * Creates an accessible, semantic DOM element for a testimonial card.
 * @param {Testimonial} item
 * @returns {HTMLElement}
 */
export function createTestimonialCardElement(item) {
  const card = document.createElement("article");
  card.className = "testimonial-card";
  card.setAttribute("data-id", item.id);

  // Quote container
  const blockquote = document.createElement("blockquote");
  blockquote.className = "testimonial-body";

  const quotePara = document.createElement("p");
  quotePara.className = "testimonial-quote";
  quotePara.textContent = `“${item.quote.replace(/^["“]|["”]$/g, "")}”`;
  blockquote.appendChild(quotePara);

  // Author & Context attribution
  const footer = document.createElement("footer");
  footer.className = "testimonial-footer";

  const metaWrap = document.createElement("div");
  metaWrap.className = "testimonial-meta";

  const authorHeading = document.createElement("cite");
  authorHeading.className = "testimonial-author";
  authorHeading.textContent = item.author;
  metaWrap.appendChild(authorHeading);

  const rolePara = document.createElement("span");
  rolePara.className = "testimonial-role";
  rolePara.textContent = `${item.role} · ${item.location}`;
  metaWrap.appendChild(rolePara);

  footer.appendChild(metaWrap);

  if (item.journey) {
    const journeyTag = document.createElement("span");
    journeyTag.className = "testimonial-journey";
    journeyTag.textContent = item.journey;
    footer.appendChild(journeyTag);
  }

  blockquote.appendChild(footer);
  card.appendChild(blockquote);

  return card;
}

/**
 * Fetches data/testimonials.json and populates the container.
 * @param {HTMLElement | null} containerEl
 * @returns {Promise<void>}
 */
export async function renderTestimonials(containerEl) {
  if (!containerEl) return;

  /** @type {Testimonial[]} */
  let testimonials = [];

  try {
    const response = await fetch("data/testimonials.json", { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    if (Array.isArray(data.testimonials) && data.testimonials.length > 0) {
      testimonials = data.testimonials;
    } else {
      testimonials = DEFAULT_TESTIMONIALS;
    }
  } catch {
    testimonials = DEFAULT_TESTIMONIALS;
  }

  const published = testimonials
    .filter((t) => t.status !== "archived")
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  if (published.length === 0) return;

  containerEl.replaceChildren();
  for (const item of published) {
    containerEl.appendChild(createTestimonialCardElement(item));
  }
}
