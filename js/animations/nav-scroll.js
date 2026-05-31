// ==========================================================================
// nav-scroll.js — sticky nav state + active link tracking + mobile toggle
// ==========================================================================

export function initNavScroll() {
  const nav = document.getElementById("nav");
  const toggle = nav?.querySelector(".nav__toggle");
  const links = nav?.querySelectorAll(".nav__link");
  if (!nav) return;

  // Sticky scrolled state
  const onScroll = () => {
    if (window.scrollY > 30) nav.classList.add("is-scrolled");
    else nav.classList.remove("is-scrolled");
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // Mobile toggle
  toggle?.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(isOpen));
    document.body.style.overflow = isOpen ? "hidden" : "";
  });

  // Close on link click (mobile)
  links?.forEach((link) => {
    link.addEventListener("click", () => {
      if (nav.classList.contains("is-open")) {
        nav.classList.remove("is-open");
        toggle?.setAttribute("aria-expanded", "false");
        document.body.style.overflow = "";
      }
    });
  });

  // Active link on scroll
  const sections = document.querySelectorAll("main > section[id]");
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          links?.forEach((l) => {
            const href = l.getAttribute("href");
            if (href === `#${id}`) l.classList.add("is-active");
            else l.classList.remove("is-active");
          });
        }
      });
    },
    { rootMargin: "-40% 0px -55% 0px", threshold: 0 }
  );
  sections.forEach((s) => observer.observe(s));
}
