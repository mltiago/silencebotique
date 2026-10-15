// loader.js — page reveal once the hero film is ready.
// Hero uses Vimeo background mode (background=1&autoplay=1&muted=1) which needs
// ZERO player.js (skill 5e). We only wait for the iframe to load, then reveal.
// Exports: initLoader(iframeSelector?: string) => Promise<void>

export async function initLoader(iframeSelector = ".hero-video-frame iframe") {
  const body = document.body;
  body.classList.add("is-loading");

  return new Promise((resolve) => {
    function reveal() {
      body.classList.remove("is-loading");
      body.classList.add("is-loaded");
      resolve();
    }

    const iframe = document.querySelector(iframeSelector);
    if (!iframe) {
      reveal();
      return;
    }

    let done = false;
    const once = () => {
      if (!done) {
        done = true;
        reveal();
      }
    };

    iframe.addEventListener("load", once, { once: true });
    setTimeout(reveal, 3000); // Fail-safe: never keep the page hidden
  });
}