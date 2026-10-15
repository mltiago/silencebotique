// reveal.js — scroll-triggered animations
// Exports: initReveal(targetSelector: string) => void

export function initReveal(
  targetSelector =
    ".philosophy-content, .experience-heading, .timeline, .journey-details, .brazil-copy, .journeys-heading, .journeys-grid, .audience-heading, .selection, .faq-heading, .faq-list, .invitation-intro, .invitation-form-wrap"
) {
  const revealTargets = document.querySelectorAll(targetSelector);
  const prefersReducedMotion =
    "matchMedia" in window &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if ("IntersectionObserver" in window && !prefersReducedMotion) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    revealTargets.forEach((target) => {
      target.classList.add("reveal");
      revealObserver.observe(target);
    });
  } else {
    revealTargets.forEach((target) => target.classList.add("is-visible"));
  }
}