// ==========================================================================
// lightbox.js — accessible modal gallery
// ==========================================================================

const lightbox = document.getElementById("lightbox");
const closeBtn = lightbox?.querySelector(".lightbox__close");
const prevBtn = lightbox?.querySelector(".lightbox__nav--prev");
const nextBtn = lightbox?.querySelector(".lightbox__nav--next");
const mediaMount = lightbox?.querySelector("[data-lightbox-media]");
const counterMount = lightbox?.querySelector("[data-lightbox-counter]");
const eyebrowMount = lightbox?.querySelector("[data-lightbox-eyebrow]");
const titleMount = lightbox?.querySelector("[data-lightbox-title]");
const metaMount = lightbox?.querySelector("[data-lightbox-meta]");
const synopsisMount = lightbox?.querySelector("[data-lightbox-synopsis]");
const creditsMount = lightbox?.querySelector("[data-lightbox-credits]");

let currentProject = null;
let currentIndex = 0;
let lastFocused = null;

function buildMedia(project, index) {
  // If project has a trailer, the first slide is the video
  const slides = [];
  if (project.trailer?.mp4 || project.trailer?.webm) {
    slides.push({ type: "video", trailer: project.trailer });
  }
  if (project.gallery?.length) {
    project.gallery.forEach((src) => slides.push({ type: "image", src }));
  } else if (project.poster) {
    slides.push({ type: "image", src: project.poster });
  }
  return slides;
}

function renderSlide(slides, index) {
  if (!mediaMount) return;
  const slide = slides[index];
  mediaMount.innerHTML = "";

  if (!slide) {
    mediaMount.innerHTML = `<div class="placeholder" data-label="Sin material todavía"></div>`;
    return;
  }

  if (slide.type === "video") {
    const video = document.createElement("video");
    video.className = "lightbox__media-video";
    video.controls = true;
    video.playsInline = true;
    video.preload = "metadata";
    if (slide.trailer.poster) video.poster = slide.trailer.poster;
    if (slide.trailer.webm) {
      const s = document.createElement("source");
      s.src = slide.trailer.webm;
      s.type = "video/webm";
      video.appendChild(s);
    }
    if (slide.trailer.mp4) {
      const s = document.createElement("source");
      s.src = slide.trailer.mp4;
      s.type = "video/mp4";
      video.appendChild(s);
    }
    mediaMount.appendChild(video);
  } else {
    const img = document.createElement("img");
    img.className = "lightbox__media-item";
    img.src = slide.src;
    img.alt = currentProject?.title || "";
    img.loading = "eager";
    img.onerror = () => {
      mediaMount.innerHTML = `<div class="placeholder" data-label="Imagen pendiente"></div>`;
    };
    mediaMount.appendChild(img);
  }

  if (counterMount) {
    counterMount.textContent = `${index + 1} / ${slides.length}`;
  }
}

function renderProject(project) {
  if (!project || !lightbox) return;
  currentProject = project;
  currentIndex = 0;

  const slides = buildMedia(project);

  if (eyebrowMount) {
    const parts = [];
    if (project.format) parts.push(project.format);
    if (project.year) parts.push(project.year);
    if (project.month && project.year) {
      eyebrowMount.textContent = `${project.format || ""} · ${project.month} ${project.year}`;
    } else {
      eyebrowMount.textContent = parts.join(" · ");
    }
  }

  if (titleMount) titleMount.textContent = project.title;

  if (metaMount) {
    const items = [];
    if (project.role) items.push({ label: "Rol", value: project.role });
    if (project.artist) items.push({ label: "Artista", value: project.artist });
    if (project.year) items.push({ label: "Año", value: project.year });
    metaMount.innerHTML = items
      .map(
        (i) => `
      <div class="lightbox__meta-item">
        <span class="lightbox__meta-label">${i.label}</span>
        <span class="lightbox__meta-value">${i.value}</span>
      </div>
    `
      )
      .join("");
  }

  if (synopsisMount) synopsisMount.textContent = project.synopsis || "";

  if (creditsMount) {
    if (project.collaborators?.length) {
      creditsMount.innerHTML = `
        <p class="lightbox__credits-title">Equipo</p>
        ${project.collaborators
          .map(
            (c) => `
          <div class="lightbox__credit">
            <span>${c.role || ""}</span>
            <span class="lightbox__credit-name">${c.name}</span>
          </div>
        `
          )
          .join("")}
      `;
    } else {
      creditsMount.innerHTML = "";
    }
  }

  // Show/hide nav
  if (prevBtn && nextBtn) {
    const show = slides.length > 1;
    prevBtn.style.display = show ? "" : "none";
    nextBtn.style.display = show ? "" : "none";
  }

  renderSlide(slides, 0);
}

function openLightbox(project) {
  if (!lightbox) return;
  lastFocused = document.activeElement;
  renderProject(project);
  lightbox.classList.add("is-open");
  lightbox.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  closeBtn?.focus();
}

function closeLightbox() {
  if (!lightbox) return;
  lightbox.classList.remove("is-open");
  lightbox.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
  // Stop any playing video
  const video = mediaMount?.querySelector("video");
  if (video) video.pause();
  lastFocused?.focus?.();
  currentProject = null;
}

function navSlide(dir) {
  if (!currentProject) return;
  const slides = buildMedia(currentProject);
  if (slides.length < 2) return;
  currentIndex = (currentIndex + dir + slides.length) % slides.length;
  renderSlide(slides, currentIndex);
}

// ----- Wire events -----

closeBtn?.addEventListener("click", closeLightbox);
prevBtn?.addEventListener("click", () => navSlide(-1));
nextBtn?.addEventListener("click", () => navSlide(1));

lightbox?.addEventListener("click", (e) => {
  if (e.target === lightbox) closeLightbox();
});

document.addEventListener("keydown", (e) => {
  if (!lightbox?.classList.contains("is-open")) return;
  if (e.key === "Escape") closeLightbox();
  else if (e.key === "ArrowLeft") navSlide(-1);
  else if (e.key === "ArrowRight") navSlide(1);
});

export { openLightbox, closeLightbox };
