// header.js — scroll observer for header
// Exports: initHeader(headerSelector: string, heroSelector: string) => void

export function initHeader(
  headerSelector = ".site-header",
  heroSelector = ".hero"
) {
  const header = document.querySelector(headerSelector);
  const hero = document.querySelector(heroSelector);

  if (!header || !hero || !("IntersectionObserver" in window)) return;

  const headerObserver = new IntersectionObserver(
    ([entry]) => header.classList.toggle("is-scrolled", !entry.isIntersecting),
    { rootMargin: "-80px 0px 0px 0px" }
  );
  headerObserver.observe(hero);
}