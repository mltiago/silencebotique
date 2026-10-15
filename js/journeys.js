// @ts-check
// journeys.js — Data-driven Journeys module.
// Fetches travel packages from ./data/journeys.json (maintained via Git-Based CMS /admin)
// and renders cards declaratively using <template id="journey-card-template">.

/**
 * @typedef {Object} JourneyPackage
 * @property {string} id - Unique slug identifier (e.g., "algodoes")
 * @property {number} [order] - Sort order in the grid (1-based)
 * @property {"published" | "coming_soon" | "archived"} [status] - Publication state
 * @property {boolean} flagship - Highlights card as the inaugural journey
 * @property {string} name - Destination title
 * @property {string} region - Geographic region / state
 * @property {string} accommodation - Hospitality base name or category
 * @property {string} [duration] - Journey length (e.g., "7 nights / 8 days")
 * @property {string} [groupSize] - Participant cap (e.g., "8–10 guests")
 * @property {string} [editionDates] - Optional edition timing note
 * @property {string | null} image - Relative path/URL to cover image, or null for placeholder
 * @property {string} [imageAlt] - Descriptive alt text (WCAG 2.2 AA)
 * @property {string} description - Short contemplative summary
 * @property {string} [ctaLabel] - Call-to-action link label
 */

/** @type {JourneyPackage[]} */
export const DEFAULT_JOURNEYS = [
  {
    id: "algodoes",
    order: 1,
    status: "published",
    flagship: true,
    name: "Praia de Algodões",
    region: "Maraú Peninsula, Bahia",
    accommodation: "Vila Oyá Casa Hotel",
    duration: "7 nights / 8 days",
    groupSize: "8–10 guests",
    editionDates: "Inaugural edition",
    image: null,
    imageAlt: "Natural materials and open architecture at Vila Oyá Casa Hotel",
    description:
      "On Bahia's coast, the Atlantic, the forest, and the architecture make their presence felt without asking for attention.",
    ctaLabel: "Enquire about this journey",
  },
  {
    id: "atins",
    order: 2,
    status: "published",
    flagship: false,
    name: "Atins",
    region: "Lençóis Maranhenses, Maranhão",
    accommodation: "Boutique pousada",
    duration: "7 nights / 8 days",
    groupSize: "8–10 guests",
    editionDates: "In development",
    image: null,
    imageAlt: "White sand dunes and fresh water lagoons in Atins, Maranhão",
    description:
      "A quiet village between the dunes and the sea, where white sand and fresh water meet at the edge of the Lençóis National Park.",
    ctaLabel: "Enquire about this journey",
  },
  {
    id: "amazon",
    order: 3,
    status: "published",
    flagship: false,
    name: "The Amazon",
    region: "Amazon region",
    accommodation: "Boutique lodge",
    duration: "7 nights / 8 days",
    groupSize: "8–10 guests",
    editionDates: "In development",
    image: null,
    imageAlt: "Forest canopy and calm river waters in the Amazon region",
    description:
      "Deep in the forest, the river sets the pace. A place where silence is the loudest presence and the day follows the current.",
    ctaLabel: "Enquire about this journey",
  },
];

/**
 * Loads the journey catalog from data/journeys.json with graceful fallback.
 * @param {string} [dataUrl="./data/journeys.json"]
 * @returns {Promise<JourneyPackage[]>}
 */
export async function loadJourneysCatalog(dataUrl = "./data/journeys.json") {
  try {
    const response = await fetch(dataUrl);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const payload = await response.json();
    const list = Array.isArray(payload) ? payload : payload.journeys;
    if (!Array.isArray(list) || list.length === 0) {
      return DEFAULT_JOURNEYS;
    }
    return list;
  } catch {
    return DEFAULT_JOURNEYS;
  }
}

/**
 * Builds a single journey card element from a <template> or fallback DOM.
 * @param {JourneyPackage} location
 * @param {HTMLTemplateElement | null} [template]
 * @returns {HTMLElement}
 */
export function createJourneyCardElement(location, template = null) {
  const cardTemplate =
    template ||
    /** @type {HTMLTemplateElement | null} */ (
      document.getElementById("journey-card-template")
    );

  const article = cardTemplate
    ? /** @type {HTMLElement} */ (
        cardTemplate.content.firstElementChild.cloneNode(true)
      )
    : document.createElement("article");

  article.className = location.flagship
    ? "journey-card journey-card-flagship"
    : "journey-card";

  const imageContainer =
    article.querySelector('[data-field="image-container"]') ||
    document.createElement("div");
  imageContainer.className = "journey-image";
  imageContainer.replaceChildren();

  if (location.image) {
    const img = document.createElement("img");
    img.src = location.image;
    img.alt = location.imageAlt || location.name;
    img.loading = "lazy";
    img.decoding = "async";
    imageContainer.appendChild(img);
  } else {
    imageContainer.classList.add("journey-image-placeholder");
    imageContainer.setAttribute("role", "img");
    imageContainer.setAttribute(
      "aria-label",
      location.imageAlt || `Placeholder image for ${location.name}`
    );
  }

  const eyebrowEl = article.querySelector('[data-field="eyebrow"]');
  if (eyebrowEl) {
    eyebrowEl.textContent = location.flagship
      ? "The inaugural journey"
      : location.region;
  }

  const nameEl = article.querySelector('[data-field="name"]');
  if (nameEl) {
    nameEl.textContent = location.name;
  }

  const regionEl = article.querySelector('[data-field="region"]');
  if (regionEl) {
    regionEl.textContent = location.flagship
      ? `${location.region} · ${location.accommodation}`
      : location.accommodation;
  }

  const descriptionEl = article.querySelector('[data-field="description"]');
  if (descriptionEl) {
    descriptionEl.textContent = location.description;
  }

  const ctaEl = /** @type {HTMLAnchorElement | null} */ (
    article.querySelector('[data-field="cta"]')
  );
  if (ctaEl) {
    ctaEl.href = "#invitation";
    ctaEl.dataset.journey = location.id;
    const labelSpan = ctaEl.querySelector('[data-field="cta-label"]');
    if (labelSpan) {
      labelSpan.textContent = location.ctaLabel || "Enquire about this journey";
    }
  }

  return article;
}

/**
 * Synchronizes the <select name="journey"> options in the invitation form with active packages.
 * @param {JourneyPackage[]} journeys
 */
function syncJourneySelectOptions(journeys) {
  const select = /** @type {HTMLSelectElement | null} */ (
    document.getElementById("journey-select")
  );
  if (!select) return;

  const currentValue = select.value;
  const defaultOption = document.createElement("option");
  defaultOption.value = "";
  defaultOption.textContent = "Open to any destination";

  const fragment = document.createDocumentFragment();
  fragment.appendChild(defaultOption);

  journeys.forEach((item) => {
    const option = document.createElement("option");
    option.value = item.id;
    option.textContent = `${item.name} (${item.region})`;
    fragment.appendChild(option);
  });

  select.replaceChildren(fragment);
  if (currentValue) {
    select.value = currentValue;
  }
}

/**
 * Renders all visible journeys into the target grid container.
 * @param {HTMLElement | null} container
 * @param {string} [dataUrl="./data/journeys.json"]
 * @returns {Promise<void>}
 */
export async function renderJourneys(container, dataUrl = "./data/journeys.json") {
  if (!container) return;

  const rawCatalog = await loadJourneysCatalog(dataUrl);
  const visibleJourneys = rawCatalog
    .filter((item) => item.status !== "archived")
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  const template = /** @type {HTMLTemplateElement | null} */ (
    document.getElementById("journey-card-template")
  );
  const fragment = document.createDocumentFragment();

  visibleJourneys.forEach((location) => {
    fragment.appendChild(createJourneyCardElement(location, template));
  });

  container.replaceChildren(fragment);
  syncJourneySelectOptions(visibleJourneys);
}