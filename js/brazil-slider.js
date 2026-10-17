// @ts-check
// brazil-slider.js — Contemplative Brazilian nature slideshow for Section 02 (#brazil).
// Scoped to the slider container; supports slow auto-advance, keyboard arrows,
// pause-on-hover/focus, and respects prefers-reduced-motion.

/**
 * Initializes the Brazilian nature carousel inside Section 02.
 * @param {string} [selector="#brazil-slider"] - Root selector for the slider container.
 * @param {number} [intervalMs=6000] - Auto-advance interval in milliseconds.
 * @returns {void}
 */
export function initBrazilSlider(selector = "#brazil-slider", intervalMs = 6000) {
  const container = /** @type {HTMLElement | null} */ (
    document.querySelector(selector)
  );
  if (!container) return;

  const slides = /** @type {NodeListOf<HTMLElement>} */ (
    container.querySelectorAll(".brazil-slide")
  );
  const dots = /** @type {NodeListOf<HTMLButtonElement>} */ (
    container.querySelectorAll(".brazil-slider-dot")
  );
  const prevBtn = /** @type {HTMLButtonElement | null} */ (
    container.querySelector("[data-slide-prev]")
  );
  const nextBtn = /** @type {HTMLButtonElement | null} */ (
    container.querySelector("[data-slide-next]")
  );

  if (slides.length <= 1) return;

  let currentIndex = 0;
  let isHovered = false;
  let isFocused = false;
  /** @type {number | null} */
  let timerId = null;
  const reducedMotionQuery = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );

  /**
   * Activates a specific slide index and updates ARIA states.
   * @param {number} targetIndex
   */
  function goToSlide(targetIndex) {
    const total = slides.length;
    currentIndex = ((targetIndex % total) + total) % total;

    slides.forEach((slide, idx) => {
      const isActive = idx === currentIndex;
      slide.classList.toggle("is-active", isActive);
      slide.setAttribute("aria-hidden", isActive ? "false" : "true");
    });

    dots.forEach((dot, idx) => {
      const isActive = idx === currentIndex;
      dot.classList.toggle("is-active", isActive);
      dot.setAttribute("aria-current", isActive ? "true" : "false");
    });
  }

  function stopAutoPlay() {
    if (timerId !== null) {
      window.clearInterval(timerId);
      timerId = null;
    }
  }

  function startAutoPlay() {
    stopAutoPlay();
    if (reducedMotionQuery.matches || isHovered || isFocused) return;
    timerId = window.setInterval(() => {
      goToSlide(currentIndex + 1);
    }, intervalMs);
  }

  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      goToSlide(currentIndex - 1);
      startAutoPlay();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      goToSlide(currentIndex + 1);
      startAutoPlay();
    });
  }

  dots.forEach((dot, idx) => {
    dot.addEventListener("click", () => {
      goToSlide(idx);
      startAutoPlay();
    });
  });

  container.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      goToSlide(currentIndex - 1);
      startAutoPlay();
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      goToSlide(currentIndex + 1);
      startAutoPlay();
    }
  });

  container.addEventListener("mouseenter", () => {
    isHovered = true;
    stopAutoPlay();
  });

  container.addEventListener("mouseleave", () => {
    isHovered = false;
    startAutoPlay();
  });

  container.addEventListener("focusin", () => {
    isFocused = true;
    stopAutoPlay();
  });

  container.addEventListener("focusout", (event) => {
    const nextFocus = /** @type {Node | null} */ (event.relatedTarget);
    if (!nextFocus || !container.contains(nextFocus)) {
      isFocused = false;
      startAutoPlay();
    }
  });

  reducedMotionQuery.addEventListener("change", () => {
    if (reducedMotionQuery.matches) {
      stopAutoPlay();
    } else {
      startAutoPlay();
    }
  });

  startAutoPlay();
}
