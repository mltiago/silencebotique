// @ts-check
// loader.js — Page reveal controller once the hero film is ready.

/**
 * Waits for the hero Vimeo iframe load event (or 3s fail-safe) before lifting the loader veil.
 * Resolves immediately when prefers-reduced-motion is enabled.
 * @param {string} [iframeSelector=".hero-video-frame iframe"]
 * @returns {Promise<void>}
 */
export async function initLoader(iframeSelector = ".hero-video-frame iframe") {
  const body = document.body;
  body.classList.add("is-loading");

  return new Promise((resolve) => {
    let done = false;
    /** @type { ReturnType<typeof setTimeout> | null } */
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
    fallbackTimer = setTimeout(reveal, 1200);
  });
}