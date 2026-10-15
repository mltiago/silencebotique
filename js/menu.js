// menu.js — mobile menu toggle
// Exports: initMenu(toggleSelector: string, navSelector: string) => void

export function initMenu(
  toggleSelector = ".menu-toggle",
  navSelector = "#site-nav"
) {
  const menuToggle = document.querySelector(toggleSelector);
  const siteNav = document.querySelector(navSelector);

  if (!menuToggle || !siteNav) return;

  function closeMenu() {
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open navigation");
    siteNav.classList.remove("is-open");
  }

  menuToggle.addEventListener("click", () => {
    const isExpanded =
      menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!isExpanded));
    menuToggle.setAttribute(
      "aria-label",
      isExpanded ? "Open navigation" : "Close navigation"
    );
    siteNav.classList.toggle("is-open", !isExpanded);
  });

  siteNav.addEventListener("click", (event) => {
    if (event.target.closest("a")) closeMenu();
  });
}