// @ts-check
// admin.js — Git-Based CMS Local & Cloud Studio for SILENCE
// Manages both The Journeys (../data/journeys.json) and Testimonials (../data/testimonials.json).
// Validates CONTEXT.md brand voice rules in real time.

import { DEFAULT_JOURNEYS, createJourneyCardElement } from "../js/journeys.js";
import { DEFAULT_TESTIMONIALS, createTestimonialCardElement } from "../js/testimonials.js";

/** @typedef {import("../js/journeys.js").JourneyPackage} JourneyPackage */
/** @typedef {import("../js/testimonials.js").Testimonial} Testimonial */

const FORBIDDEN_TERMS = [
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
];

/**
 * Checks text against CONTEXT.md forbidden terms.
 * @param {string} text
 * @returns {string[]}
 */
function findForbiddenTerms(text) {
  const lower = text.toLowerCase();
  return FORBIDDEN_TERMS.filter((term) => {
    const regex = new RegExp(`\\b${term}\\b`, "i");
    return regex.test(lower);
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  /* -------------------------------------------------------------
   * 1. TAB SWITCHING
   * ----------------------------------------------------------- */
  const tabBtnJourneys = /** @type {HTMLButtonElement} */ (
    document.getElementById("tab-btn-journeys")
  );
  const tabBtnTestimonials = /** @type {HTMLButtonElement} */ (
    document.getElementById("tab-btn-testimonials")
  );
  const sectionJourneys = /** @type {HTMLElement} */ (
    document.getElementById("section-journeys")
  );
  const sectionTestimonials = /** @type {HTMLElement} */ (
    document.getElementById("section-testimonials")
  );

  function switchTab(target) {
    if (target === "testimonials") {
      tabBtnJourneys.classList.remove("is-active");
      tabBtnJourneys.setAttribute("aria-selected", "false");
      sectionJourneys.classList.remove("is-active");

      tabBtnTestimonials.classList.add("is-active");
      tabBtnTestimonials.setAttribute("aria-selected", "true");
      sectionTestimonials.classList.add("is-active");
    } else {
      tabBtnTestimonials.classList.remove("is-active");
      tabBtnTestimonials.setAttribute("aria-selected", "false");
      sectionTestimonials.classList.remove("is-active");

      tabBtnJourneys.classList.add("is-active");
      tabBtnJourneys.setAttribute("aria-selected", "true");
      sectionJourneys.classList.add("is-active");
    }
  }

  tabBtnJourneys.addEventListener("click", () => switchTab("journeys"));
  tabBtnTestimonials.addEventListener("click", () => switchTab("testimonials"));

  /* -------------------------------------------------------------
   * 2. THE JOURNEYS CATALOG
   * ----------------------------------------------------------- */
  const listEl = /** @type {HTMLElement} */ (document.getElementById("package-list"));
  const formEl = /** @type {HTMLFormElement} */ (document.getElementById("package-editor"));
  const previewEl = /** @type {HTMLElement} */ (document.getElementById("preview-grid"));
  const alertEl = /** @type {HTMLElement} */ (document.getElementById("voice-alert"));
  const statusEl = /** @type {HTMLElement} */ (document.getElementById("admin-status"));
  const addBtn = /** @type {HTMLButtonElement} */ (document.getElementById("add-journey-btn"));
  const deleteBtn = /** @type {HTMLButtonElement} */ (
    document.getElementById("delete-journey-btn")
  );
  const saveBtn = /** @type {HTMLButtonElement} */ (document.getElementById("save-json-btn"));
  const template = /** @type {HTMLTemplateElement} */ (
    document.getElementById("journey-card-template")
  );

  /** @type {JourneyPackage[]} */
  let journeys = [];
  let activeIndex = 0;

  try {
    const response = await fetch("../data/journeys.json", { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const payload = await response.json();
    journeys = Array.isArray(payload.journeys) ? payload.journeys : [...DEFAULT_JOURNEYS];
  } catch {
    journeys = structuredClone(DEFAULT_JOURNEYS);
  }

  function normalizeJourneyOrders() {
    journeys.forEach((item, idx) => {
      item.order = idx + 1;
    });
  }

  /**
   * Moves a package up or down in the display order.
   * @param {number} index
   * @param {number} delta
   */
  function movePackage(index, delta) {
    const targetIndex = index + delta;
    if (targetIndex < 0 || targetIndex >= journeys.length) return;
    const temp = journeys[index];
    journeys[index] = journeys[targetIndex];
    journeys[targetIndex] = temp;
    normalizeJourneyOrders();
    activeIndex = targetIndex;
    populateJourneyForm(journeys[activeIndex]);
    renderJourneyListAndPreview();
  }

  function renderJourneyListAndPreview() {
    journeys.sort((a, b) => (a.order || 0) - (b.order || 0));

    const listFragment = document.createDocumentFragment();
    journeys.forEach((item, index) => {
      const row = document.createElement("div");
      row.className = index === activeIndex ? "package-item is-active" : "package-item";
      row.setAttribute("role", "listitem");
      row.tabIndex = 0;

      const info = document.createElement("div");
      const title = document.createElement("strong");
      title.textContent = `${item.order}. ${item.name}`;
      const meta = document.createElement("div");
      meta.className = "package-item-meta";
      meta.textContent = `${item.region} · ${item.accommodation}`;
      info.append(title, meta);

      const controls = document.createElement("div");
      controls.className = "package-item-controls";

      const upBtn = document.createElement("button");
      upBtn.type = "button";
      upBtn.className = "reorder-btn";
      upBtn.textContent = "↑";
      upBtn.title = "Move up";
      upBtn.setAttribute("aria-label", `Move ${item.name} up`);
      upBtn.disabled = index === 0;
      upBtn.addEventListener("click", (event) => {
        event.stopPropagation();
        movePackage(index, -1);
      });

      const downBtn = document.createElement("button");
      downBtn.type = "button";
      downBtn.className = "reorder-btn";
      downBtn.textContent = "↓";
      downBtn.title = "Move down";
      downBtn.setAttribute("aria-label", `Move ${item.name} down`);
      downBtn.disabled = index === journeys.length - 1;
      downBtn.addEventListener("click", (event) => {
        event.stopPropagation();
        movePackage(index, 1);
      });

      controls.append(upBtn, downBtn);

      const badge = document.createElement("span");
      badge.className = "package-badge";
      badge.textContent = item.status || "published";
      controls.appendChild(badge);

      row.append(info, controls);

      row.addEventListener("click", () => {
        activeIndex = index;
        populateJourneyForm(journeys[activeIndex]);
        renderJourneyListAndPreview();
      });

      listFragment.appendChild(row);
    });

    listEl.replaceChildren(listFragment);

    // Render Preview
    const previewFragment = document.createDocumentFragment();
    journeys.forEach((item) => {
      const card = createJourneyCardElement(item, template);
      previewFragment.appendChild(card);
    });
    previewEl.replaceChildren(previewFragment);

    deleteBtn.disabled = journeys.length <= 1;
  }

  /**
   * @param {JourneyPackage} item
   */
  function populateJourneyForm(item) {
    if (!item) return;
    const elements = /** @type {any} */ (formEl.elements);
    elements.id.value = item.id;
    elements.order.value = String(item.order ?? 1);
    elements.status.value = item.status ?? "published";
    elements.flagship.checked = Boolean(item.flagship);
    elements.name.value = item.name;
    elements.region.value = item.region;
    elements.accommodation.value = item.accommodation;
    elements.axiom.value = item.axiom ?? "";
    elements.duration.value = item.duration ?? "7 nights / 8 days";
    elements.groupSize.value = item.groupSize ?? "8–10 guests";
    elements.editionDates.value = item.editionDates ?? "";
    elements.image.value = item.image ?? "";
    elements.imageAlt.value = item.imageAlt ?? "";
    elements.description.value = item.description;
    elements.highlights.value = Array.isArray(item.highlights)
      ? item.highlights.join("\n")
      : "";
    validateJourneyVoice(item.description, item.axiom ?? "");
  }

  /**
   * @param {string} text
   * @param {string} [axiomText]
   */
  function validateJourneyVoice(text, axiomText = "") {
    const combined = `${text} ${axiomText}`;
    const violations = findForbiddenTerms(combined);
    if (violations.length > 0) {
      alertEl.hidden = false;
      alertEl.innerHTML = `<strong>Brand Voice Alert:</strong> The terms <em>"${violations.join('", "')}"</em> conflict with CONTEXT.md. Please rephrase in quiet luxury tone.`;
      return false;
    }
    alertEl.hidden = true;
    alertEl.textContent = "";
    return true;
  }

  formEl.description.addEventListener("input", () => {
    validateJourneyVoice(formEl.description.value, formEl.axiom.value);
  });

  formEl.axiom.addEventListener("input", () => {
    validateJourneyVoice(formEl.description.value, formEl.axiom.value);
  });

  function applyJourneyFormChanges() {
    const current = journeys[activeIndex];
    if (!current) return false;

    const elements = /** @type {any} */ (formEl.elements);
    const desc = elements.description.value.trim();
    const axiom = elements.axiom.value.trim();

    if (!validateJourneyVoice(desc, axiom)) return false;

    current.id = elements.id.value.trim();
    current.order = Number(elements.order.value) || 1;
    current.status = elements.status.value;
    current.flagship = elements.flagship.checked;
    current.name = elements.name.value.trim();
    current.region = elements.region.value.trim();
    current.accommodation = elements.accommodation.value.trim();
    current.axiom = axiom;
    current.duration = elements.duration.value.trim();
    current.groupSize = elements.groupSize.value.trim();
    current.editionDates = elements.editionDates.value.trim();
    current.image = elements.image.value.trim() || null;
    current.imageAlt = elements.imageAlt.value.trim();
    current.description = desc;

    const rawHighlights = elements.highlights.value.split("\n");
    current.highlights = rawHighlights
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    renderJourneyListAndPreview();
    return true;
  }

  async function persistJourneys() {
    normalizeJourneyOrders();
    const jsonString = JSON.stringify({ journeys }, null, 2) + "\n";

    try {
      const response = await fetch("/api/journeys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: jsonString,
      });
      if (response.ok) {
        statusEl.textContent = "Saved directly to data/journeys.json on server!";
        setTimeout(() => {
          statusEl.textContent = "";
        }, 5000);
        return;
      }
    } catch {
      // Fall through to client download
    }

    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "journeys.json";
    link.click();
    URL.revokeObjectURL(url);
    statusEl.textContent = "Downloaded journeys.json. Commit to repo.";
  }

  formEl.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!applyJourneyFormChanges()) return;
    await persistJourneys();
  });

  addBtn.addEventListener("click", () => {
    const nextOrder = journeys.length + 1;
    /** @type {JourneyPackage} */
    const newPkg = {
      id: `destination-${nextOrder}`,
      order: nextOrder,
      status: "published",
      flagship: false,
      name: "New Destination",
      region: "Brazil",
      accommodation: "Boutique pousada",
      axiom: "A considered base with unhurried days.",
      duration: "7 nights / 8 days",
      groupSize: "8–10 guests",
      highlights: [
        "Quiet mornings immersed in nature",
        "Curated local cuisine and slow living",
        "Intimate small group of 8–10 guests",
      ],
      editionDates: "",
      image: null,
      imageAlt: "Placeholder image for New Destination",
      description:
        "A considered base with unhurried days, where the landscape and architecture set a quiet pace.",
      ctaLabel: "Enquire about this journey",
    };
    journeys.push(newPkg);
    activeIndex = journeys.length - 1;
    populateJourneyForm(newPkg);
    renderJourneyListAndPreview();
  });

  deleteBtn.addEventListener("click", () => {
    if (journeys.length <= 1) return;
    journeys.splice(activeIndex, 1);
    normalizeJourneyOrders();
    activeIndex = Math.max(0, activeIndex - 1);
    populateJourneyForm(journeys[activeIndex]);
    renderJourneyListAndPreview();
  });

  saveBtn.addEventListener("click", async () => {
    if (!applyJourneyFormChanges()) return;
    await persistJourneys();
  });

  populateJourneyForm(journeys[activeIndex]);
  renderJourneyListAndPreview();

  /* -------------------------------------------------------------
   * 3. TESTIMONIALS (07 / I'VE BEEN THERE)
   * ----------------------------------------------------------- */
  const testimonialListEl = /** @type {HTMLElement} */ (
    document.getElementById("testimonial-list")
  );
  const testimonialFormEl = /** @type {HTMLFormElement} */ (
    document.getElementById("testimonial-editor")
  );
  const testimonialPreviewEl = /** @type {HTMLElement} */ (
    document.getElementById("testimonial-preview-grid")
  );
  const testimonialAlertEl = /** @type {HTMLElement} */ (
    document.getElementById("testimonial-voice-alert")
  );
  const testimonialStatusEl = /** @type {HTMLElement} */ (
    document.getElementById("testimonial-admin-status")
  );
  const addTestimonialBtn = /** @type {HTMLButtonElement} */ (
    document.getElementById("add-testimonial-btn")
  );
  const deleteTestimonialBtn = /** @type {HTMLButtonElement} */ (
    document.getElementById("delete-testimonial-btn")
  );
  const saveTestimonialsBtn = /** @type {HTMLButtonElement} */ (
    document.getElementById("save-testimonials-btn")
  );

  /** @type {Testimonial[]} */
  let testimonials = [];
  let activeTestimonialIndex = 0;

  try {
    const response = await fetch("../data/testimonials.json", { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const payload = await response.json();
    testimonials = Array.isArray(payload.testimonials)
      ? payload.testimonials
      : [...DEFAULT_TESTIMONIALS];
  } catch {
    testimonials = structuredClone(DEFAULT_TESTIMONIALS);
  }

  function normalizeTestimonialOrders() {
    testimonials.forEach((item, idx) => {
      item.order = idx + 1;
    });
  }

  /**
   * @param {number} index
   * @param {number} delta
   */
  function moveTestimonial(index, delta) {
    const targetIndex = index + delta;
    if (targetIndex < 0 || targetIndex >= testimonials.length) return;
    const temp = testimonials[index];
    testimonials[index] = testimonials[targetIndex];
    testimonials[targetIndex] = temp;
    normalizeTestimonialOrders();
    activeTestimonialIndex = targetIndex;
    populateTestimonialForm(testimonials[activeTestimonialIndex]);
    renderTestimonialListAndPreview();
  }

  function renderTestimonialListAndPreview() {
    testimonials.sort((a, b) => (a.order || 0) - (b.order || 0));

    const listFragment = document.createDocumentFragment();
    testimonials.forEach((item, index) => {
      const row = document.createElement("div");
      row.className =
        index === activeTestimonialIndex ? "package-item is-active" : "package-item";
      row.setAttribute("role", "listitem");
      row.tabIndex = 0;

      const info = document.createElement("div");
      const title = document.createElement("strong");
      title.textContent = `${item.order}. ${item.author}`;
      const meta = document.createElement("div");
      meta.className = "package-item-meta";
      meta.textContent = `${item.role} · ${item.location}`;
      info.append(title, meta);

      const controls = document.createElement("div");
      controls.className = "package-item-controls";

      const upBtn = document.createElement("button");
      upBtn.type = "button";
      upBtn.className = "reorder-btn";
      upBtn.textContent = "↑";
      upBtn.title = "Move up";
      upBtn.setAttribute("aria-label", `Move ${item.author} up`);
      upBtn.disabled = index === 0;
      upBtn.addEventListener("click", (event) => {
        event.stopPropagation();
        moveTestimonial(index, -1);
      });

      const downBtn = document.createElement("button");
      downBtn.type = "button";
      downBtn.className = "reorder-btn";
      downBtn.textContent = "↓";
      downBtn.title = "Move down";
      downBtn.setAttribute("aria-label", `Move ${item.author} down`);
      downBtn.disabled = index === testimonials.length - 1;
      downBtn.addEventListener("click", (event) => {
        event.stopPropagation();
        moveTestimonial(index, 1);
      });

      controls.append(upBtn, downBtn);

      const badge = document.createElement("span");
      badge.className = "package-badge";
      badge.textContent = item.status || "published";
      controls.appendChild(badge);

      row.append(info, controls);

      row.addEventListener("click", () => {
        activeTestimonialIndex = index;
        populateTestimonialForm(testimonials[activeTestimonialIndex]);
        renderTestimonialListAndPreview();
      });

      listFragment.appendChild(row);
    });

    testimonialListEl.replaceChildren(listFragment);

    // Live preview
    const previewFragment = document.createDocumentFragment();
    testimonials.forEach((item) => {
      const card = createTestimonialCardElement(item);
      previewFragment.appendChild(card);
    });
    testimonialPreviewEl.replaceChildren(previewFragment);

    deleteTestimonialBtn.disabled = testimonials.length <= 1;
  }

  /**
   * @param {Testimonial} item
   */
  function populateTestimonialForm(item) {
    if (!item) return;
    const elements = /** @type {any} */ (testimonialFormEl.elements);
    elements.id.value = item.id;
    elements.order.value = String(item.order ?? 1);
    elements.status.value = item.status ?? "published";
    elements.journey.value = item.journey;
    elements.author.value = item.author;
    elements.role.value = item.role;
    elements.location.value = item.location;
    elements.quote.value = item.quote;
    validateTestimonialVoice(item.quote);
  }

  /**
   * @param {string} text
   */
  function validateTestimonialVoice(text) {
    const violations = findForbiddenTerms(text);
    if (violations.length > 0) {
      testimonialAlertEl.hidden = false;
      testimonialAlertEl.innerHTML = `<strong>Brand Voice Alert:</strong> The terms <em>"${violations.join('", "')}"</em> conflict with CONTEXT.md. Please rephrase in quiet luxury tone.`;
      return false;
    }
    testimonialAlertEl.hidden = true;
    testimonialAlertEl.textContent = "";
    return true;
  }

  testimonialFormEl.quote.addEventListener("input", () => {
    validateTestimonialVoice(testimonialFormEl.quote.value);
  });

  function applyTestimonialFormChanges() {
    const current = testimonials[activeTestimonialIndex];
    if (!current) return false;

    const elements = /** @type {any} */ (testimonialFormEl.elements);
    const quote = elements.quote.value.trim();

    if (!validateTestimonialVoice(quote)) return false;

    current.id = elements.id.value.trim();
    current.order = Number(elements.order.value) || 1;
    current.status = elements.status.value;
    current.journey = elements.journey.value.trim();
    current.author = elements.author.value.trim();
    current.role = elements.role.value.trim();
    current.location = elements.location.value.trim();
    current.quote = quote;

    renderTestimonialListAndPreview();
    return true;
  }

  async function persistTestimonials() {
    normalizeTestimonialOrders();
    const jsonString = JSON.stringify({ testimonials }, null, 2) + "\n";

    try {
      const response = await fetch("/api/testimonials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: jsonString,
      });
      if (response.ok) {
        testimonialStatusEl.textContent =
          "Saved directly to data/testimonials.json on server!";
        setTimeout(() => {
          testimonialStatusEl.textContent = "";
        }, 5000);
        return;
      }
    } catch {
      // Client download fallback
    }

    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "testimonials.json";
    link.click();
    URL.revokeObjectURL(url);
    testimonialStatusEl.textContent = "Downloaded testimonials.json. Commit to repo.";
  }

  testimonialFormEl.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!applyTestimonialFormChanges()) return;
    await persistTestimonials();
  });

  addTestimonialBtn.addEventListener("click", () => {
    const nextOrder = testimonials.length + 1;
    /** @type {Testimonial} */
    const newTestimonial = {
      id: `reflection-${nextOrder}`,
      order: nextOrder,
      status: "published",
      author: "New Contributor",
      role: "Visiting Professional",
      location: "London, United Kingdom",
      journey: "Praia de Algodões, Bahia",
      quote:
        "A spacious atmosphere where the quiet pace of the landscape invited deep contemplative presence.",
    };
    testimonials.push(newTestimonial);
    activeTestimonialIndex = testimonials.length - 1;
    populateTestimonialForm(newTestimonial);
    renderTestimonialListAndPreview();
  });

  deleteTestimonialBtn.addEventListener("click", () => {
    if (testimonials.length <= 1) return;
    testimonials.splice(activeTestimonialIndex, 1);
    normalizeTestimonialOrders();
    activeTestimonialIndex = Math.max(0, activeTestimonialIndex - 1);
    populateTestimonialForm(testimonials[activeTestimonialIndex]);
    renderTestimonialListAndPreview();
  });

  saveTestimonialsBtn.addEventListener("click", async () => {
    if (!applyTestimonialFormChanges()) return;
    await persistTestimonials();
  });

  populateTestimonialForm(testimonials[activeTestimonialIndex]);
  renderTestimonialListAndPreview();
});
