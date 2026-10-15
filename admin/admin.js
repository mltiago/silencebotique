// @ts-check
// admin.js — Git-Based CMS Local & Cloud Studio for SILENCE travel packages
// Reads and writes ../data/journeys.json and validates CONTEXT.md brand voice rules.

import { DEFAULT_JOURNEYS, createJourneyCardElement } from "../js/journeys.js";

/** @typedef {import("../js/journeys.js").JourneyPackage} JourneyPackage */

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
  const listEl = /** @type {HTMLElement} */ (document.getElementById("package-list"));
  const formEl = /** @type {HTMLFormElement} */ (document.getElementById("package-editor"));
  const previewEl = /** @type {HTMLElement} */ (document.getElementById("preview-grid"));
  const alertEl = /** @type {HTMLElement} */ (document.getElementById("voice-alert"));
  const statusEl = /** @type {HTMLElement} */ (document.getElementById("admin-status"));
  const addBtn = /** @type {HTMLButtonElement} */ (document.getElementById("add-journey-btn"));
  const deleteBtn = /** @type {HTMLButtonElement} */ (document.getElementById("delete-journey-btn"));
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

  function renderListAndPreview() {
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

      const badge = document.createElement("span");
      badge.className = "package-badge";
      badge.textContent = item.flagship ? "Flagship" : item.status;

      row.append(info, badge);
      row.addEventListener("click", () => {
        activeIndex = index;
        populateForm(journeys[activeIndex]);
        renderListAndPreview();
      });
      listFragment.appendChild(row);
    });
    listEl.replaceChildren(listFragment);

    const previewFragment = document.createDocumentFragment();
    journeys
      .filter((item) => item.status !== "archived")
      .forEach((item) => {
        previewFragment.appendChild(createJourneyCardElement(item, template));
      });
    previewEl.replaceChildren(previewFragment);
  }

  /**
   * Populates the form with the selected package.
   * @param {JourneyPackage} pkg
   */
  function populateForm(pkg) {
    if (!pkg) return;
    formEl.elements.namedItem("id").value = pkg.id || "";
    formEl.elements.namedItem("order").value = String(pkg.order ?? 1);
    formEl.elements.namedItem("status").value = pkg.status || "published";
    /** @type {HTMLInputElement} */ (formEl.elements.namedItem("flagship")).checked =
      Boolean(pkg.flagship);
    formEl.elements.namedItem("name").value = pkg.name || "";
    formEl.elements.namedItem("region").value = pkg.region || "";
    formEl.elements.namedItem("accommodation").value = pkg.accommodation || "";
    formEl.elements.namedItem("editionDates").value = pkg.editionDates || "";
    formEl.elements.namedItem("image").value = pkg.image || "";
    formEl.elements.namedItem("imageAlt").value = pkg.imageAlt || "";
    formEl.elements.namedItem("description").value = pkg.description || "";
    alertEl.hidden = true;
  }

  formEl.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!formEl.checkValidity()) {
      formEl.reportValidity();
      return;
    }

    const description = formEl.elements.namedItem("description").value.trim();
    const name = formEl.elements.namedItem("name").value.trim();
    const accommodation = formEl.elements.namedItem("accommodation").value.trim();
    const violations = findForbiddenTerms(`${name} ${accommodation} ${description}`);

    if (violations.length > 0) {
      alertEl.hidden = false;
      alertEl.textContent = `Brand voice guardrail (CONTEXT.md): please remove forbidden term(s): "${violations.join(", ")}".`;
      return;
    }

    alertEl.hidden = true;
    const isFlagship = /** @type {HTMLInputElement} */ (
      formEl.elements.namedItem("flagship")
    ).checked;

    if (isFlagship) {
      journeys.forEach((item, idx) => {
        if (idx !== activeIndex) item.flagship = false;
      });
    }

    const imageValue = formEl.elements.namedItem("image").value.trim();
    journeys[activeIndex] = {
      ...journeys[activeIndex],
      id: formEl.elements.namedItem("id").value.trim(),
      order: Number(formEl.elements.namedItem("order").value) || 1,
      status: formEl.elements.namedItem("status").value,
      flagship: isFlagship,
      name,
      region: formEl.elements.namedItem("region").value.trim(),
      accommodation,
      editionDates: formEl.elements.namedItem("editionDates").value.trim(),
      image: imageValue ? imageValue : null,
      imageAlt: formEl.elements.namedItem("imageAlt").value.trim(),
      description,
    };

    renderListAndPreview();
    statusEl.textContent = `Updated "${name}" in preview. Click "Save to data/journeys.json" to persist to repository.`;
  });

  addBtn.addEventListener("click", () => {
    const nextOrder = journeys.length + 1;
    /** @type {JourneyPackage} */
    const newPkg = {
      id: `destination-${nextOrder}`,
      order: nextOrder,
      status: "coming_soon",
      flagship: false,
      name: "New Destination",
      region: "Brazil",
      accommodation: "Boutique pousada",
      duration: "7 nights / 8 days",
      groupSize: "8–10 guests",
      editionDates: "In development",
      image: null,
      imageAlt: "Placeholder image for New Destination",
      description:
        "A considered base with unhurried days, where the landscape and architecture set a quiet pace.",
      ctaLabel: "Enquire about this journey",
    };
    journeys.push(newPkg);
    activeIndex = journeys.length - 1;
    populateForm(newPkg);
    renderListAndPreview();
    statusEl.textContent = "Added new journey draft.";
  });

  deleteBtn.addEventListener("click", () => {
    if (journeys.length <= 1) {
      statusEl.textContent = "At least one journey package must remain in the catalog.";
      return;
    }
    const removed = journeys.splice(activeIndex, 1)[0];
    activeIndex = Math.max(0, activeIndex - 1);
    populateForm(journeys[activeIndex]);
    renderListAndPreview();
    statusEl.textContent = `Removed "${removed.name}".`;
  });

  saveBtn.addEventListener("click", async () => {
    const jsonString = JSON.stringify({ journeys }, null, 2) + "\n";

    if ("showSaveFilePicker" in window) {
      try {
        // @ts-ignore — File System Access API for direct repo file write
        const handle = await window.showSaveFilePicker({
          suggestedName: "journeys.json",
          types: [
            {
              description: "JSON Catalog File",
              accept: { "application/json": [".json"] },
            },
          ],
        });
        const writable = await handle.createWritable();
        await writable.write(jsonString);
        await writable.close();
        statusEl.textContent =
          "Saved directly to journeys.json! Ready for git add & git commit.";
        return;
      } catch (err) {
        if (err && err.name === "AbortError") return;
      }
    }

    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "journeys.json";
    link.click();
    URL.revokeObjectURL(url);
    statusEl.textContent =
      "Downloaded journeys.json. Place it in data/journeys.json and commit.";
  });

  populateForm(journeys[activeIndex]);
  renderListAndPreview();
});
