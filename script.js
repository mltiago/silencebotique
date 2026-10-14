const menuToggle = document.querySelector(".menu-toggle");
const siteNav = document.querySelector("#site-nav");

function closeMenu() {
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", "Open navigation");
  siteNav.classList.remove("is-open");
}

menuToggle.addEventListener("click", () => {
  const isExpanded = menuToggle.getAttribute("aria-expanded") === "true";
  menuToggle.setAttribute("aria-expanded", String(!isExpanded));
  menuToggle.setAttribute("aria-label", isExpanded ? "Open navigation" : "Close navigation");
  siteNav.classList.toggle("is-open", !isExpanded);
});

siteNav.addEventListener("click", (event) => {
  if (event.target.closest("a")) closeMenu();
});

const invitationForm = document.querySelector("#invitation-form");
const formSuccess = document.querySelector("#form-success");
const formProgress = document.querySelector("#progress-track");
const stepCount = document.querySelector("#step-count");

if (invitationForm) {
  const steps = [...invitationForm.querySelectorAll(".form-step")];
  let activeStep = 0;

  function showStep(index) {
    activeStep = index;
    steps.forEach((step, stepIndex) => {
      step.hidden = stepIndex !== activeStep;
    });

    const stepNumber = activeStep + 1;
    stepCount.textContent = `Step ${stepNumber} of ${steps.length}`;
    formProgress.setAttribute("aria-valuenow", String(stepNumber));
    formProgress.querySelector("span").style.width = `${(stepNumber / steps.length) * 100}%`;
    steps[activeStep].querySelector("input, select, textarea, button").focus();
  }

  function validateStep(step) {
    const invalidControl = [...step.querySelectorAll("input, select, textarea")]
      .find((control) => !control.checkValidity());

    if (!invalidControl) return true;
    invalidControl.reportValidity();
    invalidControl.focus();
    return false;
  }

  invitationForm.addEventListener("click", (event) => {
    if (event.target.closest("[data-next]")) {
      const currentStep = steps[activeStep];
      if (!validateStep(currentStep)) return;
      showStep(Math.min(activeStep + 1, steps.length - 1));
    }

    if (event.target.closest("[data-previous]")) {
      showStep(Math.max(activeStep - 1, 0));
    }
  });

  invitationForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!validateStep(steps[activeStep])) return;

    invitationForm.hidden = true;
    document.querySelector(".form-progress").hidden = true;
    formSuccess.hidden = false;
    formSuccess.focus();
  });
}

const revealTargets = document.querySelectorAll(
  ".philosophy-content, .experience-heading, .timeline, .journey-details, .brazil-copy, .audience-heading, .selection, .faq-heading, .faq-list",
);

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  revealTargets.forEach((target) => {
    target.classList.add("reveal");
    revealObserver.observe(target);
  });
} else {
  revealTargets.forEach((target) => target.classList.add("is-visible"));
}
