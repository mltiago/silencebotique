// @ts-check
// header.js — Scroll controller for hero-base to top-fixed header transition
// and active section indicator in the navigation bar.

/**
 * Monitors the hero section position so the header starts at the base of the hero,
 * rises with scroll, locks at the top when reaching the viewport top edge,
 * and highlights the active section link in the navigation bar.
 * @param {string} [headerSelector=".site-header"]
 * @param {string} [heroSelector=".hero"]
 * @returns {void}
 */
export function initHeader(
  headerSelector = ".site-header",
  heroSelector = ".hero"
) {
  const header = /** @type {HTMLElement | null} */ (
    document.querySelector(headerSelector)
  );
  const hero = /** @type {HTMLElement | null} */ (
    document.querySelector(heroSelector)
  );

  if (!header || !hero) return;

  const navLinks = /** @type {HTMLAnchorElement[]} */ ([
    ...header.querySelectorAll('.site-nav a[href^="#"]'),
  ]);

  const trackedSections = navLinks
    .map((link) => {
      const href = link.getAttribute("href");
      const section = href
        ? /** @type {HTMLElement | null} */ (
            header.ownerDocument.querySelector(href)
          )
        : null;
      return { link, section };
    })
    .filter((entry) => entry.section !== null);

  let ticking = false;

  function syncHeaderState() {
    if (!header || !hero) return;
    const heroRect = hero.getBoundingClientRect();
    const headerHeight = header.offsetHeight || 70;
    const heroHeight = hero.offsetHeight;
    const dockedTop = Math.max(0, heroHeight - headerHeight);

    header.style.setProperty("--hero-header-top", `${dockedTop}px`);

    const shouldLockTop = heroRect.bottom <= headerHeight;
    header.classList.toggle("is-scrolled", shouldLockTop);

    const focalY = headerHeight + window.innerHeight * 0.28;
    /** @type {HTMLElement | null} */
    let activeSection = null;

    if (shouldLockTop) {
      for (const { section } of trackedSections) {
        if (!section) continue;
        const rect = section.getBoundingClientRect();
        if (rect.top <= focalY && rect.bottom > headerHeight + 40) {
          activeSection = section;
        }
      }
    }

    for (const { link, section } of trackedSections) {
      const isCurrent = Boolean(activeSection && section === activeSection);
      link.classList.toggle("is-active", isCurrent);
      if (isCurrent) {
        link.setAttribute("aria-current", "location");
      } else {
        link.removeAttribute("aria-current");
      }
    }

    ticking = false;
  }

  window.addEventListener(
    "scroll",
    () => {
      if (!ticking) {
        window.requestAnimationFrame(syncHeaderState);
        ticking = true;
      }
    },
    { passive: true }
  );

  window.addEventListener("resize", syncHeaderState, { passive: true });
  if ("ResizeObserver" in window) {
    const resizeObserver = new ResizeObserver(syncHeaderState);
    resizeObserver.observe(hero);
  }
  syncHeaderState();
}