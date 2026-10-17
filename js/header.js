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
  let dockedHeaderHeight = 74;
  let lastDockedTop = -1;

  function measureDockedMetrics() {
    if (!header || !hero) return;
    const isMobile =
      "matchMedia" in window && window.matchMedia("(max-width: 680px)").matches;
    dockedHeaderHeight = isMobile ? 70 : 74;
    const heroHeight = hero.offsetHeight;
    const dockedTop = Math.max(0, heroHeight - dockedHeaderHeight);

    if (dockedTop !== lastDockedTop) {
      lastDockedTop = dockedTop;
      header.style.setProperty("--hero-header-top", `${dockedTop}px`);
    }
  }

  function syncHeaderState() {
    if (!header || !hero) return;
    const heroRect = hero.getBoundingClientRect();
    const shouldLockTop = heroRect.bottom <= dockedHeaderHeight;

    header.classList.toggle("is-scrolled", shouldLockTop);

    // If the docked header is in the upper half of the viewport on mobile,
    // signal the mobile drawer to open downward instead of clipping off the top edge.
    const isNearViewportTop = heroRect.bottom <= 380;
    header.classList.toggle("is-near-top", isNearViewportTop);

    const activeHeaderHeight = shouldLockTop ? 82 : dockedHeaderHeight;
    const focalY = activeHeaderHeight + window.innerHeight * 0.28;
    const atPageBottom =
      window.innerHeight + window.scrollY >=
      document.documentElement.scrollHeight - 24;

    /** @type {HTMLElement | null} */
    let activeSection = null;

    if (shouldLockTop) {
      if (atPageBottom && trackedSections.length > 0) {
        activeSection =
          trackedSections[trackedSections.length - 1].section || null;
      } else {
        for (const { section } of trackedSections) {
          if (!section) continue;
          const rect = section.getBoundingClientRect();
          if (rect.top <= focalY && rect.bottom > activeHeaderHeight + 40) {
            activeSection = section;
          }
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

  function handleResize() {
    measureDockedMetrics();
    syncHeaderState();
  }

  window.addEventListener("resize", handleResize, { passive: true });
  if ("ResizeObserver" in window) {
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(hero);
  }

  measureDockedMetrics();
  syncHeaderState();
}