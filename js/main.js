// @ts-check
// main.js — SILENCE entry point.
// Orchestrates all UI modules according to the page lifecycle.

import { initLoader } from "./loader.js";
import { initHeader } from "./header.js";
import { initMenu } from "./menu.js";
import { initForm } from "./form.js";
import { initReveal } from "./reveal.js";
import { renderJourneys } from "./journeys.js";

document.addEventListener("DOMContentLoaded", async () => {
  // 1. Initialize interactive UI controls and dynamic catalog immediately
  initHeader();
  initMenu();
  initForm();
  await renderJourneys(document.getElementById("journeys-grid"));

  // 2. Wait for hero film reveal before starting scroll-triggered transitions
  await initLoader();
  initReveal();
});