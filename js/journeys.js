// @ts-check
// journeys.js — Data-driven Journeys module with Morphing Card Dossier.
// Fetches travel packages from ./data/journeys.json (maintained via Git-Based CMS /admin)
// and renders cards declaratively using <template id="journey-card-template">.
// Expanding a card triggers a smooth FLIP-based morphing transition into a framed dossier.

/**
 * @typedef {Object} JourneyPackage
 * @property {string} id - Unique slug identifier (e.g., "algodoes")
 * @property {number} [order] - Sort order in the grid (1-based)
 * @property {"published" | "coming_soon" | "archived"} [status] - Publication state
 * @property {boolean} flagship - Highlights card with a subtle moss-green border
 * @property {string} name - Destination title
 * @property {string} region - Geographic region / state
 * @property {string} accommodation - Hospitality category (e.g., "Boutique pousada")
 * @property {string} [duration] - Journey length (e.g., "7 nights / 8 days")
 * @property {string} [groupSize] - Participant cap (e.g., "8–10 guests")
 * @property {string} [editionDates] - Optional edition timing note
 * @property {string} [axiom] - Short 1-line phrase on compact card
 * @property {string | null} image - Relative path/URL to cover image, or null for placeholder
 * @property {string} [imageAlt] - Descriptive alt text (WCAG 2.2 AA)
 * @property {string} description - Full sensory narrative for the expanded dossier
 * @property {string[]} [highlights] - List of sensory / curatorial highlights
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
    accommodation: "Boutique pousada",
    duration: "7 nights / 8 days",
    groupSize: "8–10 guests",
    editionDates: "",
    axiom: "Warm tide, coastal forest, and unhurried light.",
    image: "assets/images/journeys/algodoes.webp",
    imageAlt:
      "Golden hour over calm waters and palm trees at Praia de Algodões, Maraú Peninsula, Bahia",
    description:
      "On Bahia's coast, the Atlantic, the forest, and the architecture make their presence felt without asking for attention. Seven days to settle into the rhythm of the reef, the shade of native palms, and long conversations around a regional table.",
    highlights: [
      "Quiet mornings between calm Atlantic tide pools and the coastal forest",
      "Open architecture in natural wood, fiber, and linen",
      "Generous Bahian cuisine shared in an intimate group of 8–10 guests",
    ],
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
    editionDates: "",
    axiom: "Wind-carved white sand and still rainwater under an open sky.",
    image: "assets/images/journeys/atins.webp",
    imageAlt:
      "White sand dunes and fresh water lagoons in Atins, Lençóis Maranhenses, Maranhão",
    description:
      "A quiet village between the dunes and the sea, where white sand and fresh water meet at the edge of the Lençóis National Park. Days follow the wind, the shifting light over the lagoons, and the slow pace of sandy paths.",
    highlights: [
      "Late-afternoon walks across sweeping dunes and crystal rainwater lagoons",
      "Unhurried hours where the Preguiças river meets the Atlantic",
      "Secluded boutique pousada sheltered by native cashews and palms",
    ],
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
    editionDates: "",
    axiom: "Morning mist over mirrored waters, where the river sets the pace.",
    image: "assets/images/journeys/amazon.webp",
    imageAlt: "Forest canopy and calm river waters in the Amazon region",
    description:
      "Deep in the forest, the river sets the pace. A place where silence is the loudest presence, the day follows the current, and the scale of the canopy invites a rare quality of listening.",
    highlights: [
      "Dawn navigation along calm, mirror-like blackwater tributaries",
      "Contemplative immersion in the acoustics and light of the primary forest",
      "Boutique forest lodge designed in harmony with the riverbanks",
    ],
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
 * @param {string} [imagePrefix=""] - Optional path prefix for relative image paths (e.g. "../" in /admin/)
 * @returns {HTMLElement}
 */
export function createJourneyCardElement(
  location,
  template = null,
  imagePrefix = ""
) {
  const article =
    template && template.content.firstElementChild
      ? /** @type {HTMLElement} */ (
          template.content.firstElementChild.cloneNode(true)
        )
      : document.createElement("article");

  article.className = location.flagship
    ? "journey-card journey-card-flagship"
    : "journey-card";
  article.dataset.journeyId = location.id;
  article.tabIndex = 0;
  article.setAttribute("role", "button");
  article.setAttribute("aria-haspopup", "dialog");
  article.setAttribute("aria-label", `View details for ${location.name}`);

  const imageContainer =
    article.querySelector('[data-field="image-container"]') ||
    document.createElement("div");
  imageContainer.className = "journey-image";
  imageContainer.replaceChildren();

  if (location.image) {
    const img = document.createElement("img");
    const isExternalOrRoot =
      location.image.startsWith("http://") ||
      location.image.startsWith("https://") ||
      location.image.startsWith("/") ||
      location.image.startsWith("../");
    img.src = isExternalOrRoot
      ? location.image
      : `${imagePrefix}${location.image}`;
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
    eyebrowEl.textContent = location.region;
  }

  const nameEl = article.querySelector('[data-field="name"]');
  if (nameEl) {
    nameEl.textContent = location.name;
  }

  const regionEl = article.querySelector('[data-field="region"]');
  if (regionEl) {
    regionEl.textContent = location.editionDates
      ? `${location.accommodation} · ${location.editionDates}`
      : location.accommodation;
  }

  const axiomEl = article.querySelector('[data-field="axiom"]');
  if (axiomEl) {
    axiomEl.textContent = location.axiom || location.description;
  }

  return article;
}

/**
 * Synchronizes the <select name="journey"> options in the invitation form with active packages.
 * @param {JourneyPackage[]} journeys
 * @param {HTMLSelectElement | null} [select]
 */
function syncJourneySelectOptions(journeys, select = null) {
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
 * Sets up the Morphing Journey Dossier overlay (opens card into framed sheet, retracts back).
 * @param {JourneyPackage[]} catalog
 * @param {HTMLElement} [sectionElement=document]
 */
function setupJourneyDossier(catalog, sectionElement = document) {
  const dossierModal = /** @type {HTMLElement | null} */ (
    sectionElement.querySelector("#journey-dossier")
  );
  const panel = /** @type {HTMLElement | null} */ (
    sectionElement.querySelector("#journey-dossier-panel")
  );
  if (!dossierModal || !panel) return;

  /** @type {HTMLElement | null} */
  let activeCard = null;
  let isAnimating = false;

  const titleEl = dossierModal.querySelector("#dossier-title");
  const eyebrowEl = dossierModal.querySelector("#dossier-eyebrow");
  const axiomEl = dossierModal.querySelector("#dossier-axiom");
  const descEl = dossierModal.querySelector("#dossier-description");
  const durationEl = dossierModal.querySelector("#dossier-duration");
  const groupEl = dossierModal.querySelector("#dossier-group");
  const accommodationEl = dossierModal.querySelector("#dossier-accommodation");
  const imageWrap = dossierModal.querySelector("#dossier-image");
  const highlightsList = dossierModal.querySelector("#dossier-highlights");
  const ctaBtn = /** @type {HTMLAnchorElement | null} */ (
    dossierModal.querySelector("#dossier-cta")
  );
  const ctaLabel = dossierModal.querySelector("#dossier-cta-label");
  const closeBtn = /** @type {HTMLElement | null} */ (
    dossierModal.querySelector(".dossier-close-btn")
  );

  /**
   * Calculates transform deltas between card and panel for FLIP animation.
   * @param {HTMLElement} card
   */
  function applyMorphVariables(card) {
    if (!card || !panel) return;
    const cardRect = card.getBoundingClientRect();
    const panelRect = panel.getBoundingClientRect();

    if (panelRect.width === 0 || panelRect.height === 0) return;

    const cardCenterX = cardRect.left + cardRect.width / 2;
    const cardCenterY = cardRect.top + cardRect.height / 2;
    const panelCenterX = panelRect.left + panelRect.width / 2;
    const panelCenterY = panelRect.top + panelRect.height / 2;

    const deltaX = cardCenterX - panelCenterX;
    const deltaY = cardCenterY - panelCenterY;
    const scaleX = Math.max(cardRect.width / panelRect.width, 0.1);
    const scaleY = Math.max(cardRect.height / panelRect.height, 0.1);

    panel.style.setProperty("--morph-x", `${deltaX}px`);
    panel.style.setProperty("--morph-y", `${deltaY}px`);
    panel.style.setProperty("--morph-sx", `${scaleX}`);
    panel.style.setProperty("--morph-sy", `${scaleY}`);
  }

  /**
   * Opens the dossier with morphing from source card.
   * @param {JourneyPackage} location
   * @param {HTMLElement} card
   */
  function openDossier(location, card) {
    if (isAnimating) return;
    activeCard = card;

    if (titleEl) titleEl.textContent = location.name;
    if (eyebrowEl) eyebrowEl.textContent = location.region;
    if (axiomEl) {
      axiomEl.textContent = location.axiom || "";
      // @ts-ignore
      axiomEl.hidden = !location.axiom;
    }
    if (descEl) descEl.textContent = location.description;
    if (durationEl) durationEl.textContent = location.duration || "7 nights / 8 days";
    if (groupEl) groupEl.textContent = location.groupSize || "8–10 guests";
    if (accommodationEl) accommodationEl.textContent = location.accommodation;

    if (imageWrap) {
      imageWrap.replaceChildren();
      if (location.image) {
        const img = document.createElement("img");
        img.src = location.image;
        img.alt = location.imageAlt || location.name;
        imageWrap.appendChild(img);
      }
    }

    if (highlightsList) {
      highlightsList.replaceChildren();
      const items = location.highlights || [];
      items.forEach((itemText) => {
        const li = document.createElement("li");
        li.textContent = itemText;
        highlightsList.appendChild(li);
      });
    }

    if (ctaBtn) {
      ctaBtn.href = "#invitation";
      ctaBtn.dataset.journey = location.id;
      if (ctaLabel) {
        ctaLabel.textContent = location.ctaLabel || "Enquire about this journey";
      }
    }

    dossierModal.hidden = false;
    applyMorphVariables(card);

    isAnimating = true;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        dossierModal.classList.add("is-open");
        document.body.classList.add("has-modal-open");
        isAnimating = false;
        if (closeBtn) closeBtn.focus();
      });
    });
  }

  /**
   * Retracts the dossier back into the source card.
   */
  function closeDossier() {
    if (isAnimating || dossierModal.hidden) return;
    isAnimating = true;

    if (activeCard) {
      applyMorphVariables(activeCard);
    }

    dossierModal.classList.remove("is-open");
    document.body.classList.remove("has-modal-open");

    const onTransitionEnd = () => {
      dossierModal.hidden = true;
      isAnimating = false;
      panel.style.removeProperty("--morph-x");
      panel.style.removeProperty("--morph-y");
      panel.style.removeProperty("--morph-sx");
      panel.style.removeProperty("--morph-sy");
      if (activeCard) {
        activeCard.focus();
        activeCard = null;
      }
    };

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReducedMotion) {
      onTransitionEnd();
    } else {
      setTimeout(onTransitionEnd, 460);
    }
  }

  // Handle click on cards inside the section
  sectionElement.addEventListener("click", (event) => {
    const target = /** @type {HTMLElement | null} */ (event.target);
    if (!target) return;

    // Check if close trigger
    if (target.closest("[data-dossier-close]")) {
      event.preventDefault();
      closeDossier();
      return;
    }

    // Check if CTA within dossier
    if (target.closest("#dossier-cta")) {
      closeDossier();
      return;
    }

    // Check if card was clicked
    const card = /** @type {HTMLElement | null} */ (
      target.closest(".journey-card")
    );
    if (card && !dossierModal.contains(card)) {
      const journeyId = card.dataset.journeyId;
      const found = catalog.find((item) => item.id === journeyId);
      if (found) {
        openDossier(found, card);
      }
    }
  });

  // Handle keyboard activation of card (Enter/Space) and Escape to close
  sectionElement.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !dossierModal.hidden) {
      event.preventDefault();
      closeDossier();
      return;
    }

    const target = /** @type {HTMLElement | null} */ (event.target);
    if (!target) return;

    if (
      (event.key === "Enter" || event.key === " ") &&
      target.classList.contains("journey-card") &&
      !dossierModal.contains(target)
    ) {
      event.preventDefault();
      const journeyId = target.dataset.journeyId;
      const found = catalog.find((item) => item.id === journeyId);
      if (found) {
        openDossier(found, target);
      }
    }
  });

  window.addEventListener("resize", () => {
    if (!dossierModal.hidden && activeCard) {
      applyMorphVariables(activeCard);
    }
  });
}

/**
 * Renders all visible journeys into the target grid container.
 * @param {HTMLElement | null} container
 * @param {string} [dataUrl="./data/journeys.json"]
 * @param {{ templateSelector?: string, selectSelector?: string }} [options]
 * @returns {Promise<void>}
 */
export async function renderJourneys(
  container,
  dataUrl = "./data/journeys.json",
  {
    templateSelector = "#journey-card-template",
    selectSelector = "#journey-select",
  } = {}
) {
  if (!container) return;

  const rawCatalog = await loadJourneysCatalog(dataUrl);
  const visibleJourneys = rawCatalog
    .filter((item) => item.status !== "archived")
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  const sectionScope = /** @type {HTMLElement} */ (
    container.closest("section") || document.body
  );
  const template = /** @type {HTMLTemplateElement | null} */ (
    sectionScope.querySelector(templateSelector)
  );
  const fragment = document.createDocumentFragment();

  visibleJourneys.forEach((location) => {
    fragment.appendChild(createJourneyCardElement(location, template));
  });

  container.replaceChildren(fragment);

  const selectEl = /** @type {HTMLSelectElement | null} */ (
    document.querySelector(selectSelector)
  );
  syncJourneySelectOptions(visibleJourneys, selectEl);

  setupJourneyDossier(visibleJourneys, sectionScope);
}