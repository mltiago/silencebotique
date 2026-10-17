// @ts-check
// admin.js — Git-Based CMS Local & Cloud Studio for SILENCE
// Manages both The Journeys (../data/journeys.json) and Testimonials (../data/testimonials.json).
// Validates CONTEXT.md brand voice rules, HTML5 constraints, and unique slugs in real time.

import {
  DEFAULT_JOURNEYS,
  createJourneyCardElement,
  loadJourneysCatalog,
} from "../js/journeys.js";
import {
  DEFAULT_TESTIMONIALS,
  createTestimonialCardElement,
  loadTestimonialsCatalog,
} from "../js/testimonials.js";

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

const IMAGE_PREFIX = "../";

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

/**
 * Renders a brand voice alert message using safe DOM nodes (no innerHTML).
 * @param {HTMLElement} alertEl
 * @param {string[]} violations
 * @param {string} [customError]
 */
function renderVoiceAlert(alertEl, violations, customError = "") {
  if (violations.length === 0 && !customError) {
    alertEl.hidden = true;
    alertEl.replaceChildren();
    return;
  }

  alertEl.hidden = false;
  alertEl.replaceChildren();

  const strong = document.createElement("strong");
  strong.textContent = customError
    ? "Validation Alert: "
    : "Brand Voice Alert: ";
  alertEl.appendChild(strong);

  if (customError) {
    alertEl.appendChild(document.createTextNode(customError));
    return;
  }

  alertEl.appendChild(document.createTextNode("The terms "));
  const em = document.createElement("em");
  em.textContent = `"${violations.join('", "')}"`;
  alertEl.appendChild(em);
  alertEl.appendChild(
    document.createTextNode(
      " conflict with CONTEXT.md. Please rephrase in quiet luxury tone."
    )
  );
}

document.addEventListener("DOMContentLoaded", async () => {
  /* -------------------------------------------------------------
   * 1. TAB SWITCHING (with WAI-ARIA keyboard arrow support)
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

  /**
   * @param {"journeys" | "testimonials"} target
   * @param {{ focusTab?: boolean }} [options]
   */
  function switchTab(target, { focusTab = false } = {}) {
    const isTestimonials = target === "testimonials";

    tabBtnJourneys.classList.toggle("is-active", !isTestimonials);
    tabBtnJourneys.setAttribute("aria-selected", String(!isTestimonials));
    tabBtnJourneys.tabIndex = isTestimonials ? -1 : 0;
    sectionJourneys.classList.toggle("is-active", !isTestimonials);
    sectionJourneys.hidden = isTestimonials;

    tabBtnTestimonials.classList.toggle("is-active", isTestimonials);
    tabBtnTestimonials.setAttribute("aria-selected", String(isTestimonials));
    tabBtnTestimonials.tabIndex = isTestimonials ? 0 : -1;
    sectionTestimonials.classList.toggle("is-active", isTestimonials);
    sectionTestimonials.hidden = !isTestimonials;

    if (focusTab) {
      (isTestimonials ? tabBtnTestimonials : tabBtnJourneys).focus();
    }
  }

  tabBtnJourneys.addEventListener("click", () => switchTab("journeys"));
  tabBtnTestimonials.addEventListener("click", () => switchTab("testimonials"));

  const tabList = tabBtnJourneys.parentElement;
  if (tabList) {
    tabList.addEventListener("keydown", (event) => {
      if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
        event.preventDefault();
        const nextTarget =
          document.activeElement === tabBtnJourneys
            ? "testimonials"
            : "journeys";
        switchTab(nextTarget, { focusTab: true });
      }
    });
  }

  /* -------------------------------------------------------------
   * 2. THE JOURNEYS CATALOG
   * ----------------------------------------------------------- */
  const listEl = /** @type {HTMLElement} */ (
    document.getElementById("package-list")
  );
  const formEl = /** @type {HTMLFormElement} */ (
    document.getElementById("package-editor")
  );
  const previewEl = /** @type {HTMLElement} */ (
    document.getElementById("preview-grid")
  );
  const alertEl = /** @type {HTMLElement} */ (
    document.getElementById("voice-alert")
  );
  const statusEl = /** @type {HTMLElement} */ (
    document.getElementById("admin-status")
  );
  const addBtn = /** @type {HTMLButtonElement} */ (
    document.getElementById("add-journey-btn")
  );
  const deleteBtn = /** @type {HTMLButtonElement} */ (
    document.getElementById("delete-journey-btn")
  );
  const saveBtn = /** @type {HTMLButtonElement} */ (
    document.getElementById("save-json-btn")
  );
  const journeyTemplate = /** @type {HTMLTemplateElement | null} */ (
    document.getElementById("journey-card-template")
  );

  /** @type {JourneyPackage[]} */
  let journeys = await loadJourneysCatalog("../data/journeys.json");
  if (!Array.isArray(journeys) || journeys.length === 0) {
    journeys = structuredClone(DEFAULT_JOURNEYS);
  }
  let activeIndex = 0;

  function normalizeJourneyOrders() {
    journeys.forEach((item, idx) => {
      item.order = idx + 1;
    });
  }

  /**
   * Moves a package up or down in the display order after syncing current form edits.
   * @param {number} index
   * @param {number} delta
   */
  function movePackage(index, delta) {
    syncCurrentJourneyFromForm();
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

  function renderJourneyPreviewOnly() {
    const previewFragment = document.createDocumentFragment();
    journeys.forEach((item) => {
      const card = createJourneyCardElement(
        item,
        journeyTemplate,
        IMAGE_PREFIX
      );
      previewFragment.appendChild(card);
    });
    previewEl.replaceChildren(previewFragment);
  }

  function renderJourneyListAndPreview() {
    const currentItem = journeys[activeIndex];
    journeys.sort((a, b) => (a.order || 0) - (b.order || 0));
    if (currentItem) {
      const newIdx = journeys.indexOf(currentItem);
      if (newIdx !== -1) activeIndex = newIdx;
    }

    const listFragment = document.createDocumentFragment();
    journeys.forEach((item, index) => {
      const row = document.createElement("div");
      row.className =
        index === activeIndex ? "package-item is-active" : "package-item";
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

      const selectRow = () => {
        syncCurrentJourneyFromForm();
        activeIndex = index;
        populateJourneyForm(journeys[activeIndex]);
        renderJourneyListAndPreview();
      };

      row.addEventListener("click", selectRow);
      row.addEventListener("keydown", (event) => {
        if (
          (event.key === "Enter" || event.key === " ") &&
          event.target === row
        ) {
          event.preventDefault();
          selectRow();
        }
      });

      listFragment.appendChild(row);
    });

    listEl.replaceChildren(listFragment);
    renderJourneyPreviewOnly();
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
    validateJourneyFormFields();
  }

  /**
   * Checks all text fields in the journey form against CONTEXT.md forbidden terms.
   * @returns {boolean}
   */
  function validateJourneyFormFields() {
    const elements = /** @type {any} */ (formEl.elements);
    const combined = [
      elements.name.value,
      elements.region.value,
      elements.accommodation.value,
      elements.editionDates.value,
      elements.axiom.value,
      elements.description.value,
      elements.highlights.value,
    ].join(" ");
    const violations = findForbiddenTerms(combined);
    renderVoiceAlert(alertEl, violations);
    return violations.length === 0;
  }

  function syncCurrentJourneyFromForm() {
    const current = journeys[activeIndex];
    if (!current) return;
    const elements = /** @type {any} */ (formEl.elements);
    current.id = elements.id.value.trim() || current.id;
    current.order = Number(elements.order.value) || current.order || 1;
    current.status = elements.status.value;
    current.flagship = elements.flagship.checked;
    current.name = elements.name.value.trim() || current.name;
    current.region = elements.region.value.trim() || current.region;
    current.accommodation =
      elements.accommodation.value.trim() || current.accommodation;
    current.axiom = elements.axiom.value.trim();
    current.duration = elements.duration.value.trim() || "7 nights / 8 days";
    current.groupSize = elements.groupSize.value.trim() || "8–10 guests";
    current.editionDates = elements.editionDates.value.trim();
    current.image = elements.image.value.trim() || null;
    current.imageAlt = elements.imageAlt.value.trim();
    current.description =
      elements.description.value.trim() || current.description;
    current.highlights = elements.highlights.value
      .split("\n")
      .map((/** @type {string} */ line) => line.trim())
      .filter((/** @type {string} */ line) => line.length > 0);
  }

  formEl.addEventListener("input", () => {
    validateJourneyFormFields();
    syncCurrentJourneyFromForm();
    renderJourneyPreviewOnly();
  });

  function applyJourneyFormChanges() {
    const current = journeys[activeIndex];
    if (!current) return false;

    if (!formEl.checkValidity()) {
      formEl.reportValidity();
      return false;
    }

    if (!validateJourneyFormFields()) return false;

    const elements = /** @type {any} */ (formEl.elements);
    const candidateId = elements.id.value.trim();
    const duplicate = journeys.some(
      (item, idx) => idx !== activeIndex && item.id === candidateId
    );
    if (duplicate) {
      renderVoiceAlert(
        alertEl,
        [],
        `Slug ID "${candidateId}" is already used by another journey.`
      );
      return false;
    }

    syncCurrentJourneyFromForm();
    renderJourneyListAndPreview();
    populateJourneyForm(journeys[activeIndex]);
    return true;
  }

  async function persistJourneys() {
    normalizeJourneyOrders();
    populateJourneyForm(journeys[activeIndex]);
    renderJourneyListAndPreview();
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
      const errPayload = await response.json().catch(() => null);
      if (errPayload && errPayload.error) {
        renderVoiceAlert(alertEl, [], errPayload.error);
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
    syncCurrentJourneyFromForm();
    const nextOrder = journeys.length + 1;
    let slugCounter = nextOrder;
    while (journeys.some((j) => j.id === `destination-${slugCounter}`)) {
      slugCounter += 1;
    }
    /** @type {JourneyPackage} */
    const newPkg = {
      id: `destination-${slugCounter}`,
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
   * 3. TESTIMONIALS (05 / TESTIMONIALS)
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
  const testimonialTemplate = /** @type {HTMLTemplateElement | null} */ (
    document.getElementById("testimonial-card-template")
  );

  /** @type {Testimonial[]} */
  let testimonials = await loadTestimonialsCatalog("../data/testimonials.json");
  if (!Array.isArray(testimonials) || testimonials.length === 0) {
    testimonials = structuredClone(DEFAULT_TESTIMONIALS);
  }
  let activeTestimonialIndex = 0;

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
    syncCurrentTestimonialFromForm();
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

  function renderTestimonialPreviewOnly() {
    const previewFragment = document.createDocumentFragment();
    testimonials.forEach((item) => {
      const card = createTestimonialCardElement(item, testimonialTemplate);
      previewFragment.appendChild(card);
    });
    testimonialPreviewEl.replaceChildren(previewFragment);
  }

  function renderTestimonialListAndPreview() {
    const currentItem = testimonials[activeTestimonialIndex];
    testimonials.sort((a, b) => (a.order || 0) - (b.order || 0));
    if (currentItem) {
      const newIdx = testimonials.indexOf(currentItem);
      if (newIdx !== -1) activeTestimonialIndex = newIdx;
    }

    const listFragment = document.createDocumentFragment();
    testimonials.forEach((item, index) => {
      const row = document.createElement("div");
      row.className =
        index === activeTestimonialIndex
          ? "package-item is-active"
          : "package-item";
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

      const selectRow = () => {
        syncCurrentTestimonialFromForm();
        activeTestimonialIndex = index;
        populateTestimonialForm(testimonials[activeTestimonialIndex]);
        renderTestimonialListAndPreview();
      };

      row.addEventListener("click", selectRow);
      row.addEventListener("keydown", (event) => {
        if (
          (event.key === "Enter" || event.key === " ") &&
          event.target === row
        ) {
          event.preventDefault();
          selectRow();
        }
      });

      listFragment.appendChild(row);
    });

    testimonialListEl.replaceChildren(listFragment);
    renderTestimonialPreviewOnly();
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
    validateTestimonialFormFields();
  }

  /**
   * @returns {boolean}
   */
  function validateTestimonialFormFields() {
    const elements = /** @type {any} */ (testimonialFormEl.elements);
    const combined = [
      elements.author.value,
      elements.role.value,
      elements.location.value,
      elements.journey.value,
      elements.quote.value,
    ].join(" ");
    const violations = findForbiddenTerms(combined);
    renderVoiceAlert(testimonialAlertEl, violations);
    return violations.length === 0;
  }

  function syncCurrentTestimonialFromForm() {
    const current = testimonials[activeTestimonialIndex];
    if (!current) return;
    const elements = /** @type {any} */ (testimonialFormEl.elements);
    current.id = elements.id.value.trim() || current.id;
    current.order = Number(elements.order.value) || current.order || 1;
    current.status = elements.status.value;
    current.journey = elements.journey.value.trim() || current.journey;
    current.author = elements.author.value.trim() || current.author;
    current.role = elements.role.value.trim() || current.role;
    current.location = elements.location.value.trim() || current.location;
    current.quote = elements.quote.value.trim() || current.quote;
  }

  testimonialFormEl.addEventListener("input", () => {
    validateTestimonialFormFields();
    syncCurrentTestimonialFromForm();
    renderTestimonialPreviewOnly();
  });

  function applyTestimonialFormChanges() {
    const current = testimonials[activeTestimonialIndex];
    if (!current) return false;

    if (!testimonialFormEl.checkValidity()) {
      testimonialFormEl.reportValidity();
      return false;
    }

    if (!validateTestimonialFormFields()) return false;

    const elements = /** @type {any} */ (testimonialFormEl.elements);
    const candidateId = elements.id.value.trim();
    const duplicate = testimonials.some(
      (item, idx) => idx !== activeTestimonialIndex && item.id === candidateId
    );
    if (duplicate) {
      renderVoiceAlert(
        testimonialAlertEl,
        [],
        `Slug ID "${candidateId}" is already used by another testimonial.`
      );
      return false;
    }

    syncCurrentTestimonialFromForm();
    renderTestimonialListAndPreview();
    populateTestimonialForm(testimonials[activeTestimonialIndex]);
    return true;
  }

  async function persistTestimonials() {
    normalizeTestimonialOrders();
    populateTestimonialForm(testimonials[activeTestimonialIndex]);
    renderTestimonialListAndPreview();
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
      const errPayload = await response.json().catch(() => null);
      if (errPayload && errPayload.error) {
        renderVoiceAlert(testimonialAlertEl, [], errPayload.error);
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
    testimonialStatusEl.textContent =
      "Downloaded testimonials.json. Commit to repo.";
  }

  testimonialFormEl.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!applyTestimonialFormChanges()) return;
    await persistTestimonials();
  });

  addTestimonialBtn.addEventListener("click", () => {
    syncCurrentTestimonialFromForm();
    const nextOrder = testimonials.length + 1;
    let slugCounter = nextOrder;
    while (testimonials.some((t) => t.id === `reflection-${slugCounter}`)) {
      slugCounter += 1;
    }
    /** @type {Testimonial} */
    const newTestimonial = {
      id: `reflection-${slugCounter}`,
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
