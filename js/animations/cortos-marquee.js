// ==========================================================================
// cortos-marquee.js — horizontal carousel with arrow navigation
// No scroll pinning — free page scrolling preserved
// ==========================================================================

export function initCortosMarquee() {
  const viewport = document.querySelector("[data-cortos-viewport]");
  const track = document.querySelector("[data-cortos-track]");
  if (!viewport || !track) return;

  // Wait for cards to be rendered
  if (!track.children.length) {
    requestAnimationFrame(() => initCortosMarquee());
    return;
  }

  const prevBtn = document.querySelector("[data-cortos-prev]");
  const nextBtn = document.querySelector("[data-cortos-next]");
  if (!prevBtn || !nextBtn) return;

  // Scroll by one card width + gap
  function getScrollAmount() {
    const card = track.querySelector(".cortos__card");
    if (!card) return 400;
    const style = getComputedStyle(track);
    const gap = parseFloat(style.gap) || 0;
    return card.offsetWidth + gap;
  }

  // Smooth scroll fallback using requestAnimationFrame
  let scrollAnim = null;
  function smoothScroll(target) {
    if (scrollAnim) cancelAnimationFrame(scrollAnim);
    const start = viewport.scrollLeft;
    const distance = target - start;
    const duration = 400;
    let startTime = null;

    function step(ts) {
      if (!startTime) startTime = ts;
      const elapsed = ts - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const ease = 1 - Math.pow(1 - progress, 3);
      viewport.scrollLeft = start + distance * ease;
      if (progress < 1) {
        scrollAnim = requestAnimationFrame(step);
      }
    }
    scrollAnim = requestAnimationFrame(step);
  }

  function updateButtons() {
    const atStart = viewport.scrollLeft <= 5;
    const atEnd = viewport.scrollLeft + viewport.clientWidth >= viewport.scrollWidth - 5;
    prevBtn.disabled = atStart;
    nextBtn.disabled = atEnd;
    prevBtn.classList.toggle("is-disabled", atStart);
    nextBtn.classList.toggle("is-disabled", atEnd);
  }

  prevBtn.addEventListener("click", () => {
    const target = Math.max(0, viewport.scrollLeft - getScrollAmount());
    smoothScroll(target);
  });

  nextBtn.addEventListener("click", () => {
    const max = viewport.scrollWidth - viewport.clientWidth;
    const target = Math.min(max, viewport.scrollLeft + getScrollAmount());
    smoothScroll(target);
  });

  viewport.addEventListener("scroll", updateButtons, { passive: true });
  updateButtons();

  window.addEventListener("resize", updateButtons, { passive: true });
}
