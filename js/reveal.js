// @ts-check
// reveal.js — Scroll-triggered fade-in animations.

const DEFAULT_REVEAL_TARGETS = [
  ".philosophy-content",
  ".experience-heading",
  ".timeline",
  ".journey-details",
  ".brazil-copy",
  ".journeys-heading",
  ".journeys-grid",
  ".audience-heading",
  ".selection",
  ".faq-heading",
  ".faq-list",
  ".invitation-intro",
  ".invitation-form-wrap",
].join(", ");

/**
 * Observes content blocks and reveals them smoothly as they enter the viewport.
 * @param {string} [targetSelector=DEFAULT_REVEAL_TARGETS]
 * @returns {void}
 */
export function initReveal(targetSelector = DEFAULT_REVEAL_TARGETS) {
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