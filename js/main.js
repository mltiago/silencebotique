// main.js — SILENCE entry point
// Orchestrates all UI modules

import { initLoader } from "./loader.js";
import { initHeader } from "./header.js";
import { initMenu } from "./menu.js";
import { initForm } from "./form.js";
import { initReveal } from "./reveal.js";
import { renderJourneys } from "./journeys.js";

// Initialize all modules
document.addEventListener("DOMContentLoaded", async () => {
  // Build dynamic DOM and attach interactive controls immediately
  renderJourneys(document.getElementById("journeys-grid"));
  initHeader();
  initMenu();
  initForm();

  // Wait for hero reveal before triggering scroll-reveal transitions
  await initLoader();
  initReveal();
});