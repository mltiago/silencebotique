// @ts-check
// header.js — Scroll observer for sticky header transition.

/**
 * Observes the hero section to toggle the solid header state on scroll.
 * @param {string} [headerSelector=".site-header"]
 * @param {string} [heroSelector=".hero"]
 * @returns {void}
 */
export function initHeader(
  headerSelector = ".site-header",
  heroSelector = ".hero"
) {
  const header = document.querySelector(headerSelector);
  const hero = document.querySelector(heroSelector);

  if (!header || !hero || !("IntersectionObserver" in window)) return;

  const headerObserver = new IntersectionObserver(
    ([entry]) => {
      header.classList.toggle("is-scrolled", !entry.isIntersecting);
    },
    { rootMargin: "-80px 0px 0px 0px" }
  );

  headerObserver.observe(hero);
}