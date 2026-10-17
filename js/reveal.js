// @ts-check
// reveal.js — Scroll-triggered fade-in animations for structural blocks.
// Operates exclusively on non-scrollytelling containers to avoid conflicting
// with scrolly.js ([data-scrolly]) transitions.

const DEFAULT_REVEAL_TARGETS = [
  ".breather",
  ".brazil-image",
  ".invitation-form-wrap",
].join(", ");

/**
 * Observes structural blocks and reveals them smoothly as they enter the viewport.
 * Automatically skips elements managed by scrolly.js ([data-scrolly]).
 * @param {string} [targetSelector=DEFAULT_REVEAL_TARGETS]
 * @returns {() => void} Cleanup function to disconnect the observer
 */
export function initReveal(targetSelector = DEFAULT_REVEAL_TARGETS) {
  const candidates = /** @type {HTMLElement[]} */ ([
    ...document.querySelectorAll(targetSelector),
  ]);

  const revealTargets = candidates.filter(
    (el) =>
      !el.hasAttribute("data-scrolly") &&
      !el.hasAttribute("data-scrolly-children") &&
      !el.querySelector("[data-scrolly]")
  );

  if (revealTargets.length === 0) {
    return () => {};
  }

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
      const rect = target.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.88 && rect.bottom > 0) {
        target.classList.add("is-visible");
      } else {
        revealObserver.observe(target);
      }
    });

    return () => {
      revealObserver.disconnect();
    };
  }

  revealTargets.forEach((target) => target.classList.add("is-visible"));
  return () => {};
}