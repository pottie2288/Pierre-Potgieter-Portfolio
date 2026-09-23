import { gsap, getLenis, prefersReducedMotion, scrollEasing, type Cleanup } from "./core";

// Header colour follows whichever [data-theme-section] sits under the middle of
// the nav bar: "dark" sections get ink text, "light" sections get silver text.
export function initThemeNav(): Cleanup {
  const nav = document.querySelector<HTMLElement>("[data-nav-bar-height]");
  const probe = nav ? nav.offsetHeight / 2 : 0;
  const sections = document.querySelectorAll<HTMLElement>("[data-theme-section]");
  const targets = document.querySelectorAll<HTMLElement>("[data-theme-nav]");
  let current: string | null = null;
  let queued = false;

  const update = () => {
    for (const section of sections) {
      const { top, bottom } = section.getBoundingClientRect();
      if (top <= probe && bottom >= probe) {
        const theme = section.getAttribute("data-theme-section");
        if (theme && theme !== current) {
          targets.forEach((el) => el.setAttribute("data-theme-nav", theme));
          current = theme;
        }
        break;
      }
    }
    queued = false;
  };
  const schedule = () => {
    if (!queued) {
      queued = true;
      window.requestAnimationFrame(update);
    }
  };

  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule);
  update();
  return () => {
    window.removeEventListener("scroll", schedule);
    window.removeEventListener("resize", schedule);
  };
}

const LOGO_BREAKPOINTS = {
  desktop: { query: "(min-width: 1025px)", y: "90%" },
  tablet: { query: "(min-width: 768px) and (max-width: 1024px)", y: "120%" },
  mobile: { query: "(max-width: 767px)", y: "120%" },
} as const;

function logoStartY(): string {
  const match = Object.values(LOGO_BREAKPOINTS).find(({ query }) => window.matchMedia(query).matches);
  return match?.y ?? "90%";
}

/** Before the intro: stretch the wordmark across the hero so there's no jump. */
export function prepareLogoScroll(): void {
  const logo = document.querySelector<HTMLElement>("[data-logo-scroll]");
  if (!logo || prefersReducedMotion()) return;
  logo.dataset.logoScrollFinalWidth = getComputedStyle(logo).width;
  gsap.set(logo, { width: "100%", y: logoStartY() });
}

// While the hero scrolls out, the full-width wordmark scrubs down to its nav
// size. Once the hero has left, the logo becomes a back-to-top button.
export function initLogoScroll(): Cleanup {
  const logo = document.querySelector<HTMLElement>("[data-logo-scroll]");
  const trigger = document.querySelector<HTMLElement>("[data-logo-scroll-trigger]");
  if (!logo || !trigger) return () => {};
  if (prefersReducedMotion()) {
    gsap.set(logo, { clearProps: "width,transform" });
    return () => {};
  }

  const finalWidth = logo.dataset.logoScrollFinalWidth || getComputedStyle(logo).width;
  let backToTop = false;
  const activate = () => {
    backToTop = true;
    logo.setAttribute("data-back-to-top-active", "");
    logo.setAttribute("aria-label", "Back to top");
  };
  const deactivate = () => {
    backToTop = false;
    logo.removeAttribute("data-back-to-top-active");
    logo.removeAttribute("aria-label");
  };
  const onClick = (event: MouseEvent) => {
    event.preventDefault();
    if (backToTop) getLenis()?.scrollTo(0, { duration: 1.2, easing: scrollEasing });
  };

  deactivate();
  logo.addEventListener("click", onClick);
  const mm = gsap.matchMedia();
  Object.values(LOGO_BREAKPOINTS).forEach(({ query, y }) => {
    mm.add(query, () => {
      gsap.set(logo, { width: "100%", y });
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger,
          start: "top top",
          end: "bottom top",
          scrub: 1,
          invalidateOnRefresh: true,
          onLeave: activate,
          onEnterBack: deactivate,
        },
      });
      tl.to(logo, { width: finalWidth, y: 0, ease: "none" });
      return () => {
        deactivate();
        tl.scrollTrigger?.kill();
        tl.kill();
      };
    });
  });

  return () => {
    logo.removeEventListener("click", onClick);
    mm.revert();
    deactivate();
  };
}

// In-page links scroll with Lenis using the same eased 1.2s glide.
export function initScrollToAnchor(): Cleanup {
  const links = document.querySelectorAll<HTMLElement>("[data-anchor-target]");
  const handlers: Array<[HTMLElement, (e: Event) => void]> = [];
  links.forEach((link) => {
    const handler = (event: Event) => {
      const target = link.getAttribute("data-anchor-target");
      const lenis = getLenis();
      if (!target || !lenis) return;
      event.preventDefault();
      lenis.scrollTo(target, { duration: 1.2, offset: 0, easing: scrollEasing });
    };
    link.addEventListener("click", handler);
    handlers.push([link, handler]);
  });
  return () => handlers.forEach(([link, handler]) => link.removeEventListener("click", handler));
}
