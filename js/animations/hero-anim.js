// ==========================================================================
// hero-anim.js — hero entrance + scroll behaviour
// ==========================================================================

export function initHeroAnim() {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const titleSpans = document.querySelectorAll(".hero__title-line span");
  const subtitle = document.querySelector(".hero__subtitle");
  const pre = document.querySelector(".hero__pre");
  const meta = document.querySelector(".hero__meta");

  if (reduced) {
    [pre, ...titleSpans, subtitle, meta].forEach((el) => {
      if (el) el.style.opacity = "1";
    });
    return;
  }

  // Set initial state
  [pre, subtitle, meta].forEach((el) => {
    if (el) {
      el.style.opacity = "0";
      el.style.transform = "translateY(20px)";
      el.style.transition =
        "opacity 0.9s cubic-bezier(0.16, 1, 0.3, 1), transform 0.9s cubic-bezier(0.16, 1, 0.3, 1)";
    }
  });

  titleSpans.forEach((span) => {
    span.style.display = "inline-block";
    span.style.transform = "translateY(110%)";
    span.style.transition =
      "transform 1.1s cubic-bezier(0.16, 1, 0.3, 1)";
  });

  // Sequence
  const sequence = () => {
    if (pre) {
      pre.style.opacity = "1";
      pre.style.transform = "translateY(0)";
    }

    titleSpans.forEach((span, i) => {
      setTimeout(() => {
        span.style.transform = "translateY(0)";
      }, 200 + i * 120);
    });

    setTimeout(() => {
      if (subtitle) {
        subtitle.style.opacity = "1";
        subtitle.style.transform = "translateY(0)";
      }
    }, 200 + titleSpans.length * 120 + 200);

    setTimeout(() => {
      if (meta) {
        meta.style.opacity = "1";
        meta.style.transform = "translateY(0)";
      }
    }, 200 + titleSpans.length * 120 + 400);
  };

  // Wait for next frame to ensure styles are applied
  requestAnimationFrame(() => requestAnimationFrame(sequence));
}
