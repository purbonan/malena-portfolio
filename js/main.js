// ==========================================================================
// main.js — entry point
// ==========================================================================

import { loadData } from "./data-loader.js?v=6";
import {
  renderCortos,
  renderVideoclips,
  renderFashion,
  renderBodegones,
  renderConstruccion,
  renderAbout,
  renderTFG,
  renderContact,
} from "./render-projects.js";
import { openLightbox } from "./lightbox.js";
import { initScrollReveal } from "./animations/scroll-reveal.js";
import { initHeroAnim } from "./animations/hero-anim.js";
import { initNavScroll } from "./animations/nav-scroll.js";
import { initCortosMarquee } from "./animations/cortos-marquee.js?v=5";

async function init() {
  // Footer year
  const yearMount = document.querySelector("[data-year]");
  if (yearMount) yearMount.textContent = String(new Date().getFullYear());

  // Document title from site.json
  let data;
  try {
    data = await loadData();
  } catch (err) {
    document.body.innerHTML = `
      <div style="padding: 4rem 2rem; font-family: monospace; color: #E8D9C4; background: #0E0B0A; min-height: 100vh;">
        <h1 style="color: #A51D24;">Error al cargar datos</h1>
        <p>${err.message}</p>
        <p>Asegúrate de servir el sitio con un servidor HTTP local (los <code>fetch()</code> no funcionan con <code>file://</code>).</p>
        <p><strong>Comando:</strong> <code>python -m http.server 8000</code> en la carpeta del proyecto, luego visitar <code>http://localhost:8000</code>.</p>
      </div>
    `;
    return;
  }

  const { projects, about, site } = data;

  document.title = site.siteTitle || document.title;

  // Render all sections
  renderAbout(about);
  renderCortos(projects, openLightbox);
  renderVideoclips(projects, openLightbox);
  renderFashion(projects, openLightbox);
  renderBodegones(projects, openLightbox);
  renderConstruccion(projects, openLightbox);
  renderTFG(site);
  renderContact(site);

  // Init UI behaviours
  initNavScroll();
  initHeroAnim();
  initScrollReveal();

  // Cortos carousel with arrow navigation
  initCortosMarquee();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
