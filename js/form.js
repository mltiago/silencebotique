// form.js — invitation form wizard
// Exports: initForm(formSelector: string) => void

export function initForm(formSelector = "#invitation-form") {
  const form = document.querySelector(formSelector);
  if (!form) return;

  const formProgress = document.querySelector("#progress-track");
  const stepCount = document.querySelector("#step-count");
  const formSuccess = document.querySelector("#form-success");

  const steps = [...form.querySelectorAll(".form-step")];
  let activeStep = 0;

  function showStep(index, { focus = false } = {}) {
    activeStep = index;
    steps.forEach((step, stepIndex) => {
      step.hidden = stepIndex !== activeStep;
    });

    const stepNumber = activeStep + 1;
    stepCount.textContent = `Step ${stepNumber} of ${steps.length}`;
    formProgress.setAttribute("aria-valuenow", String(stepNumber));
    formProgress.setAttribute("aria-valuemax", String(steps.length));
    formProgress.querySelector("span").style.width = `${(stepNumber / steps.length) * 100}%`;
    if (focus) {
      steps[activeStep].querySelector("input, select, textarea, button").focus();
    }
  }

  function validateStep(step) {
    const invalidControl = [...step.querySelectorAll("input, select, textarea")].find(
      (control) => !control.checkValidity()
    );

    if (!invalidControl) return true;
    invalidControl.reportValidity();
    invalidControl.focus();
    return false;
  }

  form.addEventListener("click", (event) => {
    if (event.target.closest("[data-next]")) {
      const currentStep = steps[activeStep];
      if (!validateStep(currentStep)) return;
      showStep(Math.min(activeStep + 1, steps.length - 1), { focus: true });
    }

    if (event.target.closest("[data-previous]")) {
      showStep(Math.max(activeStep - 1, 0), { focus: true });
    }
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!validateStep(steps[activeStep])) return;

    form.hidden = true;
    document.querySelector(".form-progress").hidden = true;
    formSuccess.hidden = false;
    formSuccess.focus();
  });

  // Initialize first step
  showStep(0);
}