// @ts-check
// form.js — Invitation form wizard & destination context binding.
// Scopes all DOM queries to the invitation section container (zero global selector leaks).

/**
 * Initializes the multi-step invitation form and binds [data-journey] CTA links.
 * @param {string} [sectionSelector="#invitation"]
 * @returns {void}
 */
export function initForm(sectionSelector = "#invitation") {
  const section = document.querySelector(sectionSelector);
  if (!section) return;

  const form = /** @type {HTMLFormElement | null} */ (
    section.querySelector(".invitation-form")
  );
  const progressWrap = /** @type {HTMLElement | null} */ (
    section.querySelector(".form-progress")
  );
  const formProgress = /** @type {HTMLElement | null} */ (
    section.querySelector("#progress-track")
  );
  const stepCount = /** @type {HTMLElement | null} */ (
    section.querySelector("#step-count")
  );
  const formSuccess = /** @type {HTMLElement | null} */ (
    section.querySelector("#form-success")
  );
  const journeySelect = /** @type {HTMLSelectElement | null} */ (
    section.querySelector("#journey-select")
  );

  if (!form || !formProgress || !stepCount || !formSuccess) return;

  const steps = /** @type {HTMLFieldSetElement[]} */ ([
    ...form.querySelectorAll(".form-step"),
  ]);
  const progressFill = /** @type {HTMLElement | null} */ (
    formProgress.querySelector("span")
  );
  let activeStep = 0;

  /**
   * Transitions the wizard to a target step index.
   * @param {number} index
   * @param {{ focus?: boolean }} [options]
   */
  function showStep(index, { focus = false } = {}) {
    activeStep = index;
    steps.forEach((step, stepIndex) => {
      step.hidden = stepIndex !== activeStep;
    });

    const stepNumber = activeStep + 1;
    stepCount.textContent = `Step ${stepNumber} of ${steps.length}`;
    formProgress.setAttribute("aria-valuenow", String(stepNumber));
    formProgress.setAttribute("aria-valuemax", String(steps.length));
    if (progressFill) {
      progressFill.style.width = `${(stepNumber / steps.length) * 100}%`;
    }

    if (focus) {
      const firstControl = /** @type {HTMLElement | null} */ (
        steps[activeStep].querySelector("input, select, textarea, button")
      );
      if (firstControl) firstControl.focus();
    }
  }

  /**
   * Validates all form controls within a given step fieldset.
   * @param {HTMLFieldSetElement} step
   * @returns {boolean}
   */
  function validateStep(step) {
    const controls = /** @type {(HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement)[]} */ ([
      ...step.querySelectorAll("input, select, textarea"),
    ]);
    const invalidControl = controls.find((control) => !control.checkValidity());

    if (!invalidControl) return true;
    invalidControl.reportValidity();
    invalidControl.focus();
    return false;
  }

  // Delegate Next / Back button clicks inside the form
  form.addEventListener("click", (event) => {
    const target = /** @type {HTMLElement | null} */ (event.target);
    if (!target) return;

    if (target.closest("[data-next]")) {
      if (!validateStep(steps[activeStep])) return;
      showStep(Math.min(activeStep + 1, steps.length - 1), { focus: true });
    }

    if (target.closest("[data-previous]")) {
      showStep(Math.max(activeStep - 1, 0), { focus: true });
    }
  });

  // Advance step on Enter key in text/email/select inputs instead of premature submit
  form.addEventListener("keydown", (event) => {
    const target = /** @type {HTMLElement | null} */ (event.target);
    if (
      event.key === "Enter" &&
      activeStep < steps.length - 1 &&
      target &&
      !target.matches("textarea, button")
    ) {
      event.preventDefault();
      if (!validateStep(steps[activeStep])) return;
      showStep(activeStep + 1, { focus: true });
    }
  });

  // Bind [data-journey] links anywhere on the page to pre-select destination
  document.addEventListener("click", (event) => {
    const target = /** @type {HTMLElement | null} */ (event.target);
    const journeyTrigger = /** @type {HTMLElement | null} */ (
      target ? target.closest("[data-journey]") : null
    );
    if (!journeyTrigger || !journeySelect) return;

    const journeyId = journeyTrigger.dataset.journey;
    if (journeyId) {
      journeySelect.value = journeyId;
    }
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    // Anti-spam honeypot check
    const honeypot = /** @type {HTMLInputElement | null} */ (
      form.elements.namedItem("website")
    );
    if (honeypot && honeypot.value.trim() !== "") return;

    if (!validateStep(steps[activeStep])) return;

    if (activeStep < steps.length - 1) {
      showStep(activeStep + 1, { focus: true });
      return;
    }

    form.hidden = true;
    if (progressWrap) progressWrap.hidden = true;
    formSuccess.hidden = false;
    formSuccess.focus();
  });

  showStep(0);
}