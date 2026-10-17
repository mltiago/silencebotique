// @ts-check
// main.js — SILENCE entry point.
// Orchestrates all UI modules according to the page lifecycle.

import { initLoader } from "./loader.js";
import { initHeader } from "./header.js";
import { initMenu } from "./menu.js";
import { initForm } from "./form.js";
import { initReveal } from "./reveal.js";
import { renderJourneys } from "./journeys.js";
import { initBrazilSlider } from "./brazil-slider.js";
import { renderTestimonials } from "./testimonials.js";
import { initScrollytelling } from "./scrolly.js";

document.addEventListener("DOMContentLoaded", async () => {
  // 1. Start hero loader gate and initialize interactive controls immediately
  const loaderPromise = initLoader();

  initHeader();
  initMenu();
  initForm();
  initBrazilSlider();

  // 2. Hydrate dynamic catalogs before attaching scroll observers
  await Promise.allSettled([
    renderJourneys(document.getElementById("journeys-grid")),
    renderTestimonials(document.getElementById("testimonials-grid")),
  ]);

  // 3. Attach initial reveal/scrolly states while loader veil still covers viewport
  initReveal();
  initScrollytelling();

  // 4. Wait for loader veil to lift
  await loaderPromise;
});