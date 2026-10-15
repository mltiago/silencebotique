// loader.js — page reveal once the hero film is ready.
// Hero uses Vimeo background mode (background=1&autoplay=1&muted=1) which needs
// ZERO player.js (skill 5e). We only wait for the iframe to load, then reveal.
// Exports: initLoader(iframeSelector?: string) => Promise<void>

export async function initLoader(iframeSelector = ".hero-video-frame iframe") {
  const body = document.body;
  body.classList.add("is-loading");

  return new Promise((resolve) => {
    let done = false;
    let fallbackTimer = null;

    function reveal() {
      if (done) return;
      done = true;
      if (fallbackTimer) clearTimeout(fallbackTimer);
      body.classList.remove("is-loading");
      body.classList.add("is-loaded");
      resolve();
    }

    const prefersReducedMotion =
      "matchMedia" in window &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const iframe = document.querySelector(iframeSelector);
    if (!iframe || prefersReducedMotion) {
      reveal();
      return;
    }

    iframe.addEventListener("load", reveal, { once: true });
    fallbackTimer = setTimeout(reveal, 3000); // Fail-safe: never keep the page hidden
  });
}