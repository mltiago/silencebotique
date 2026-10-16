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

document.addEventListener("DOMContentLoaded", async () => {
  // 1. Initialize interactive UI controls and dynamic catalog immediately
  initHeader();
  initMenu();
  initForm();
  initBrazilSlider();
  await Promise.all([
    renderJourneys(document.getElementById("journeys-grid")),
    renderTestimonials(document.getElementById("testimonials-grid")),
  ]);

  // 2. Wait for hero film reveal before starting scroll-triggered transitions
  await initLoader();
  initReveal();
});