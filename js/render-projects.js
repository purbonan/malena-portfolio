// ==========================================================================
// render-projects.js — templates per category
// ==========================================================================

import { projectsByCategory } from "./data-loader.js";

// ----- Helpers -----

function el(html) {
  const tpl = document.createElement("template");
  tpl.innerHTML = html.trim();
  return tpl.content.firstElementChild;
}

function placeholder(label) {
  return `<div class="placeholder" data-label="${label}"></div>`;
}

function imgOrPlaceholder(src, alt, label, className = "") {
  if (!src) return placeholder(label);
  const cls = className ? ` class="${className}"` : "";
  return `<img${cls} src="${src}" alt="${alt}" loading="lazy" decoding="async" onerror="this.outerHTML='<div class=\\'placeholder\\' data-label=\\'${label}\\'></div>'">`;
}

function metaLine(project) {
  const parts = [];
  if (project.role) parts.push(project.role);
  if (project.year) parts.push(project.year);
  if (project.format) parts.push(project.format);
  return parts
    .map((p, i) =>
      i === 0
        ? p
        : `<span class="project-card__meta-sep">·</span> ${p}`
    )
    .join(" ");
}

// ----- Generic project card -----

export function projectCard(project, options = {}) {
  const { extraClass = "", index = "" } = options;
  const indexLabel = index ? `${String(index).padStart(2, "0")}` : "";

  const card = el(`
    <button class="project-card ${extraClass}" type="button" data-project-id="${project.id}">
      <div class="project-card__media">
        ${indexLabel ? `<span class="project-card__corner">${indexLabel}</span>` : ""}
        ${imgOrPlaceholder(project.poster, project.title + " — póster", project.title, "project-card__poster")}
        <div class="project-card__overlay" aria-hidden="true"></div>
        <span class="project-card__cta">Ver proyecto →</span>
      </div>
      <div class="project-card__info">
        <h3 class="project-card__title">${project.title}</h3>
        <p class="project-card__meta">${metaLine(project)}</p>
      </div>
    </button>
  `);
  return card;
}

// ----- Cortos: horizontal track -----

export function renderCortos(data, openLightbox) {
  const track = document.querySelector("[data-cortos-track]");
  if (!track) return;
  const cortos = projectsByCategory(data, "cortos");
  track.innerHTML = "";
  cortos.forEach((project, i) => {
    const card = projectCard(project, {
      extraClass: "cortos__card",
      index: i + 1,
    });
    card.addEventListener("click", () => openLightbox(project));
    track.appendChild(card);
  });
}

// ----- Videoclips: split screen -----

export function renderVideoclips(data, openLightbox) {
  const mount = document.querySelector("[data-videoclips-mount]");
  if (!mount) return;
  const videoclips = projectsByCategory(data, "videoclips");
  if (videoclips.length === 0) return;

  mount.innerHTML = "";

  videoclips.forEach((project) => {
    mount.appendChild(
      el(`
      <div class="videoclips__info">
        <p class="videoclips__eyebrow">Videoclip · ${project.month || ""} ${project.year || ""}</p>
        <h3 class="videoclips__title">${project.title}</h3>
        <p class="videoclips__artist">${project.artist || ""}</p>
        <p class="videoclips__role">${project.role || ""}</p>
        <p class="videoclips__synopsis">${project.synopsis || ""}</p>
      </div>
    `)
    );

    const media = el(`
      <button class="videoclips__media" type="button" aria-label="Ver ${project.title}">
        ${imgOrPlaceholder(project.poster, project.title, project.title)}
        <div class="videoclips__play" aria-hidden="true">
          <div class="videoclips__play-inner"></div>
        </div>
      </button>
    `);
    media.addEventListener("click", () => openLightbox(project));
    mount.appendChild(media);
  });
}

// ----- Fashion: asymmetric grid -----

export function renderFashion(data, openLightbox) {
  const mount = document.querySelector("[data-fashion-mount]");
  if (!mount) return;
  const items = projectsByCategory(data, "fashion");
  mount.innerHTML = "";
  items.forEach((project, i) => {
    const card = projectCard(project, { index: i + 1 });
    card.addEventListener("click", () => openLightbox(project));
    mount.appendChild(card);
  });
}

// ----- Bodegones: masonry -----

export function renderBodegones(data, openLightbox) {
  const mount = document.querySelector("[data-bodegones-mount]");
  if (!mount) return;
  const items = projectsByCategory(data, "bodegones");
  mount.innerHTML = "";
  items.forEach((project, i) => {
    const card = projectCard(project, { index: i + 1 });
    card.addEventListener("click", () => openLightbox(project));
    mount.appendChild(card);
  });
}

// ----- Construcción: polaroid sketchbook -----

export function renderConstruccion(data, openLightbox) {
  const mount = document.querySelector("[data-construccion-mount]");
  if (!mount) return;
  const items = projectsByCategory(data, "construccion");
  mount.innerHTML = "";
  items.forEach((project) => {
    const card = el(`
      <button class="construccion__card" type="button" data-project-id="${project.id}">
        <div class="construccion__media">
          ${imgOrPlaceholder(project.poster, project.title, project.title)}
        </div>
        <p class="construccion__caption">
          ${project.title}
          <span class="construccion__caption-meta">${project.role || project.format || ""}</span>
        </p>
      </button>
    `);
    card.addEventListener("click", () => openLightbox(project));
    mount.appendChild(card);
  });
}

// ----- About section -----

export function renderAbout(aboutData) {
  // Bio
  const bioMount = document.querySelector("[data-about-bio]");
  if (bioMount && aboutData.bio) {
    bioMount.innerHTML = aboutData.bio
      .map((p) => `<p>${p}</p>`)
      .join("");
  }

  // Manifesto
  const manifestoMount = document.querySelector("[data-about-manifesto]");
  if (manifestoMount && aboutData.manifesto) {
    manifestoMount.textContent = aboutData.manifesto;
  }

  // Education
  const eduMount = document.querySelector("[data-about-education]");
  if (eduMount && aboutData.education) {
    eduMount.innerHTML = aboutData.education
      .map(
        (e) => `
      <li>
        <strong>${e.title}</strong>
        ${e.institution} · <span class="about__block-period">${e.period}</span>
      </li>
    `
      )
      .join("");
  }

  // Languages
  const langMount = document.querySelector("[data-about-languages]");
  if (langMount && aboutData.languages) {
    langMount.innerHTML = aboutData.languages
      .map(
        (l) => `
      <div class="about__language">
        <span class="about__language-name">${l.name}</span>
        <span class="about__language-level">${l.level}</span>
      </div>
    `
      )
      .join("");
  }

  // Skills
  const skillsMount = document.querySelector("[data-about-skills]");
  if (skillsMount && aboutData.skills) {
    skillsMount.innerHTML = aboutData.skills
      .map(
        (s) => `
      <div class="about__skill">
        <h3 class="about__skill-title">${s.title}</h3>
        <p class="about__skill-desc">${s.description}</p>
      </div>
    `
      )
      .join("");
  }

  // Tools
  const toolsMount = document.querySelector("[data-about-tools]");
  if (toolsMount && aboutData.tools) {
    toolsMount.innerHTML = aboutData.tools
      .map((t) => `<li>${t}</li>`)
      .join("");
  }

  // References
  const refMount = document.querySelector("[data-about-references]");
  if (refMount && aboutData.references) {
    refMount.innerHTML = aboutData.references
      .map((r) => `<li>${r}</li>`)
      .join("");
  }

  // Portrait
  const portraitMount = document.querySelector(".about__portrait .placeholder");
  if (portraitMount && aboutData.portrait) {
    const img = el(
      `<img src="${aboutData.portrait}" alt="Retrato de ${aboutData.name}" loading="lazy" onerror="this.outerHTML='<div class=\\'placeholder\\' data-label=\\'Retrato — añade assets/img/about/malena.webp\\'></div>'">`
    );
    portraitMount.replaceWith(img);
  }

  // Tools marquee
  const marqueeMount = document.querySelector("[data-tools-marquee]");
  if (marqueeMount && aboutData.tools) {
    const items = aboutData.tools.concat(aboutData.tools); // duplicate for infinite loop
    marqueeMount.innerHTML = `
      <div class="marquee__track">
        ${items.map((t) => `<span class="marquee__item">${t}</span>`).join("")}
      </div>
    `;
  }
}

// ----- TFG section -----

export function renderTFG(siteData) {
  const tfg = siteData.tfg;
  if (!tfg) return;

  document.querySelector("[data-tfg-title]")?.replaceChildren(
    document.createTextNode(tfg.title || "")
  );
  document.querySelector("[data-tfg-fulltitle]")?.replaceChildren(
    document.createTextNode(tfg.fullTitle || "")
  );

  const quoteMount = document.querySelector("[data-tfg-quote]");
  if (quoteMount && tfg.pullQuote) quoteMount.textContent = tfg.pullQuote;

  const introMount = document.querySelector("[data-tfg-intro]");
  if (introMount && tfg.intro) {
    introMount.innerHTML = tfg.intro.map((p) => `<p>${p}</p>`).join("");
  }

  const viewBtn = document.querySelector("[data-tfg-view]");
  if (viewBtn) {
    if (tfg.viewerUrl) {
      viewBtn.setAttribute("href", tfg.viewerUrl);
    } else {
      viewBtn.setAttribute("href", "#");
      viewBtn.setAttribute("aria-disabled", "true");
      viewBtn.title = "Pendiente: añadir URL de Google Drive en site.json";
    }
  }

  const dlBtn = document.querySelector("[data-tfg-download]");
  if (dlBtn) {
    if (tfg.downloadUrl) {
      dlBtn.setAttribute("href", tfg.downloadUrl);
    } else {
      dlBtn.setAttribute("href", "#");
      dlBtn.setAttribute("aria-disabled", "true");
      dlBtn.title = "Pendiente: añadir URL de descarga en site.json";
    }
  }

  // Cover
  const coverMount = document.querySelector(".tfg__cover .placeholder");
  if (coverMount && tfg.coverImage) {
    const img = el(
      `<img src="${tfg.coverImage}" alt="Portada del TFG" loading="lazy" onerror="this.outerHTML='<div class=\\'placeholder\\' data-label=\\'Portada del TFG\\'></div>'">`
    );
    coverMount.replaceWith(img);
  }
}

// ----- Contact section -----

export function renderContact(siteData) {
  const c = siteData.contact;
  if (!c) return;

  const headlineMount = document.querySelector("[data-contact-headline]");
  if (headlineMount) headlineMount.textContent = c.headline;

  const introMount = document.querySelector("[data-contact-intro]");
  if (introMount) introMount.textContent = c.intro;

  const mount = document.querySelector("[data-contact-mount]");
  if (!mount) return;

  const channels = [
    {
      label: "Email",
      value: c.email,
      href: `mailto:${c.email}`,
    },
    {
      label: "Teléfono",
      value: c.phone,
      href: `tel:${c.phoneRaw}`,
    },
    {
      label: "Instagram",
      value: `@${c.instagram}`,
      href: c.instagramUrl,
    },
  ];

  mount.innerHTML = channels
    .map(
      (ch) => `
    <a class="contact__channel" href="${ch.href}" ${
        ch.label === "Instagram" ? 'target="_blank" rel="noopener"' : ""
      }>
      <span class="contact__channel-label">${ch.label}</span>
      <span class="contact__channel-value">${ch.value}</span>
      <span class="contact__channel-arrow">↗</span>
    </a>
  `
    )
    .join("");
}
