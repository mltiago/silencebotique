// @ts-check
// menu.js — Mobile navigation drawer controller.

/**
 * Initializes the mobile navigation toggle, keyboard Escape handling, and resize reset.
 * @param {string} [headerSelector=".site-header"]
 * @returns {void}
 */
export function initMenu(headerSelector = ".site-header") {
  const siteHeader = /** @type {HTMLElement | null} */ (
    document.querySelector(headerSelector)
  );
  if (!siteHeader) return;

  const menuToggle = /** @type {HTMLButtonElement | null} */ (
    siteHeader.querySelector(".menu-toggle")
  );
  const siteNav = /** @type {HTMLElement | null} */ (
    siteHeader.querySelector(".site-nav")
  );

  if (!menuToggle || !siteNav) return;

  const menuLabel = /** @type {HTMLElement | null} */ (
    menuToggle.querySelector(".menu-toggle-label")
  );

  /**
   * Updates menu open/closed state and ARIA attributes.
   * @param {boolean} isOpen
   * @param {{ restoreFocus?: boolean }} [options]
   */
  function setMenuState(isOpen, { restoreFocus = false } = {}) {
    if (!menuToggle || !siteNav || !siteHeader) return;

    if (isOpen) {
      const headerRect = siteHeader.getBoundingClientRect();
      siteHeader.classList.toggle("is-near-top", headerRect.top < 320);
    }

    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.setAttribute(
      "aria-label",
      isOpen ? "Close navigation" : "Open navigation"
    );
    if (menuLabel) {
      menuLabel.textContent = isOpen ? "Close" : "Menu";
    }
    siteNav.classList.toggle("is-open", isOpen);
    siteHeader.classList.toggle("is-menu-open", isOpen);

    if (!isOpen && restoreFocus) {
      menuToggle.focus();
    }
  }

  menuToggle.addEventListener("click", () => {
    const isExpanded = menuToggle.getAttribute("aria-expanded") === "true";
    setMenuState(!isExpanded);
  });

  // Close drawer when any navigation link (including header wordmark) is clicked
  siteHeader.addEventListener("click", (event) => {
    const target = /** @type {HTMLElement | null} */ (event.target);
    if (target && target.closest("a")) {
      setMenuState(false);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (
      event.key === "Escape" &&
      menuToggle.getAttribute("aria-expanded") === "true"
    ) {
      setMenuState(false, { restoreFocus: true });
    }
  });

  document.addEventListener("click", (event) => {
    const target = /** @type {Node | null} */ (event.target);
    if (
      menuToggle.getAttribute("aria-expanded") === "true" &&
      target &&
      !siteHeader.contains(target)
    ) {
      setMenuState(false);
    }
  });

  if ("matchMedia" in window) {
    const desktopQuery = window.matchMedia("(min-width: 681px)");
    desktopQuery.addEventListener("change", (event) => {
      if (event.matches) setMenuState(false);
    });
  }
}