// @ts-check
// scrolly.js — Continuous storytelling scroll-driven text opacity reveal.
// Observes narrative elements and transitions them from a calm muted state
// to full presence as they enter the reading focal zone of the viewport.

/**
 * Default selectors targeted for scrollytelling opacity reveal.
 */
const SCROLLY_SELECTORS = [
  "[data-scrolly]",
  ".scrolly-reveal",
  "[data-scrolly-children] > *",
].join(", ");

/**
 * Initializes scroll-driven text opacity reveals across continuous editorial content.
 * Respects prefers-reduced-motion by immediately revealing all text elements.
 * @param {string} [selector=SCROLLY_SELECTORS] - CSS selector for observed elements
 * @param {HTMLElement | Document} [scope=document] - Root scope to search within
 * @returns {() => void} Cleanup function to disconnect the observer
 */
export function initScrollytelling(
  selector = SCROLLY_SELECTORS,
  scope = document
) {
  const elements = /** @type {HTMLElement[]} */ ([
    ...scope.querySelectorAll(selector),
  ]);

  if (elements.length === 0) {
    return () => {};
  }

  const prefersReducedMotion =
    "matchMedia" in window &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Immediately reveal all if reduced motion or IntersectionObserver is unsupported
  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    elements.forEach((el) => {
      el.classList.add("scrolly-reveal", "is-active");
    });
    return () => {};
  }

  // Reading focal area: triggers when the element enters the central 55% of the viewport
  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-active");
          obs.unobserve(entry.target);
        }
      });
    },
    {
      root: null,
      rootMargin: "-15% 0px -20% 0px",
      threshold: 0.1,
    }
  );

  elements.forEach((el) => {
    el.classList.add("scrolly-reveal");

    // If already in focal zone or above on load, activate immediately
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.75 && rect.bottom > 0) {
      el.classList.add("is-active");
    } else {
      observer.observe(el);
    }
  });

  return () => {
    observer.disconnect();
  };
}
