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
  // Critical: loader first (blocks page reveal)
  await initLoader();

  // Non-critical: can run in parallel
  initHeader();
  initMenu();
  initForm();
  initReveal();
  renderJourneys(document.getElementById("journeys-grid"));
});