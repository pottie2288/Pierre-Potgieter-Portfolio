import { gsap, prefersReducedMotion, type Cleanup } from "./core";

// Generic data-attribute parallax. Defaults: yPercent 20 → -20 across the
// element's time in view; hero overrides to 0 → 40 starting at "top top".
export function initGlobalParallax(): Cleanup {
  const mm = gsap.matchMedia();
  mm.add(
    {
      isMobile: "(max-width:479px)",
      isMobileLandscape: "(max-width:767px)",
      isTablet: "(max-width:991px)",
      isDesktop: "(min-width:992px)",
    },
    (context) => {
      const { isMobile, isMobileLandscape, isTablet } = context.conditions as Record<string, boolean>;
      document.querySelectorAll<HTMLElement>('[data-parallax="trigger"]').forEach((trigger) => {
        const disable = trigger.getAttribute("data-parallax-disable");
        if (
          (disable === "mobile" && isMobile) ||
          (disable === "mobileLandscape" && isMobileLandscape) ||
          (disable === "tablet" && isTablet)
        ) {
          return;
        }
        const target = trigger.querySelector<HTMLElement>('[data-parallax="target"]') || trigger;
        const axis = trigger.getAttribute("data-parallax-direction") === "horizontal" ? "xPercent" : "yPercent";
        const scrubAttr = trigger.getAttribute("data-parallax-scrub");
        const scrub = scrubAttr ? parseFloat(scrubAttr) : true;
        const startAttr = trigger.getAttribute("data-parallax-start");
        const endAttr = trigger.getAttribute("data-parallax-end");
        const from = startAttr !== null ? parseFloat(startAttr) : 20;
        const to = endAttr !== null ? parseFloat(endAttr) : -20;
        const start = `clamp(${trigger.getAttribute("data-parallax-scroll-start") || "top bottom"})`;
        const end = `clamp(${trigger.getAttribute("data-parallax-scroll-end") || "bottom top"})`;
        gsap.fromTo(
          target,
          { [axis]: from },
          { [axis]: to, ease: "none", scrollTrigger: { trigger, start, end, scrub } },
        );
      });
    },
  );
  return () => mm.revert();
}

// Pins the "Design that speaks." panel for 200% of the viewport while the brush
// stroke draws over it (0 → 85% of its length) and thickens (5% → 80%).
export function initScrollDrawTransition(): Cleanup {
  if (prefersReducedMotion()) return () => {};
  const contexts: gsap.Context[] = [];
  document.querySelectorAll<HTMLElement>("[data-scroll-draw-transition]").forEach((wrap) => {
    const section = wrap.querySelector<HTMLElement>("[data-scroll-draw-section]");
    const overlay = wrap.querySelector<HTMLElement>("[data-scroll-draw-overlay]");
    const paths = overlay?.querySelectorAll<SVGPathElement>("svg path");
    if (!section || !overlay || !paths?.length) return;

    const sizeWrap = () => gsap.set(wrap, { height: Math.max(section.scrollHeight, window.innerHeight) });
    sizeWrap();
    contexts.push(
      gsap.context(() => {
        gsap.set(section, { position: "relative", zIndex: 0 });
        gsap.set(overlay, { zIndex: 1, pointerEvents: "none" });
        gsap.set(paths, { strokeWidth: "5%", drawSVG: "0% 0%" });
        gsap
          .timeline({
            scrollTrigger: {
              trigger: wrap,
              start: "top top",
              end: "+=200%",
              scrub: true,
              pin: true,
              anticipatePin: 1,
              invalidateOnRefresh: true,
              onRefreshInit: sizeWrap,
            },
          })
          .to(paths, { drawSVG: "0% 85%", duration: 1, ease: "none" }, 0)
          .to(paths, { strokeWidth: "80%", duration: 0.75, ease: "none" }, 0.25);
      }, wrap),
    );
  });
  return () => contexts.forEach((ctx) => ctx.revert());
}

// Footer is revealed from underneath: it starts shifted up by its own height
// and scrubs back to 0 as it scrolls into view (tablet and up).
export function initFooterParallax(): Cleanup {
  const footer = document.querySelector<HTMLElement>("[data-footer]");
  const inner = document.querySelector<HTMLElement>("[data-footer-inner]");
  if (!footer || !inner) return () => {};
  const mm = gsap.matchMedia();
  mm.add("(min-width: 768px)", () => {
    gsap.from(inner, {
      yPercent: -100,
      ease: "linear",
      scrollTrigger: { trigger: footer, start: "clamp(top bottom)", end: "clamp(top top)", scrub: true },
    });
  });
  return () => mm.revert();
}

export function initDynamicCurrentYear(): Cleanup {
  const year = String(new Date().getFullYear());
  document.querySelectorAll<HTMLElement>("[data-current-year]").forEach((el) => {
    el.textContent = year;
  });
  return () => {};
}
