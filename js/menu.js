// menu.js — mobile menu toggle
// Exports: initMenu(toggleSelector: string, navSelector: string) => void

export function initMenu(
  toggleSelector = ".menu-toggle",
  navSelector = "#site-nav"
) {
  const menuToggle = document.querySelector(toggleSelector);
  const siteNav = document.querySelector(navSelector);
  const siteHeader = menuToggle ? menuToggle.closest(".site-header") : null;

  if (!menuToggle || !siteNav) return;

  function setMenuState(isOpen, { restoreFocus = false } = {}) {
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.setAttribute(
      "aria-label",
      isOpen ? "Close navigation" : "Open navigation"
    );
    siteNav.classList.toggle("is-open", isOpen);
    if (siteHeader) {
      siteHeader.classList.toggle("is-menu-open", isOpen);
    }
    if (!isOpen && restoreFocus) {
      menuToggle.focus();
    }
  }

  menuToggle.addEventListener("click", () => {
    const isExpanded = menuToggle.getAttribute("aria-expanded") === "true";
    setMenuState(!isExpanded);
  });

  siteNav.addEventListener("click", (event) => {
    if (event.target.closest("a")) {
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
    if (
      menuToggle.getAttribute("aria-expanded") === "true" &&
      siteHeader &&
      !siteHeader.contains(event.target)
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