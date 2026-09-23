import { gsap, getLenis, registerGsap, runAll, ScrollTrigger, type Cleanup } from "./core";
import { initLenis } from "./lenis";
import { runPageIntro } from "./pageIntro";
import { initLogoScroll, initScrollToAnchor, initThemeNav, prepareLogoScroll } from "./navigation";
import { initButton007 } from "./button007";
import { initDynamicCurrentYear, initFooterParallax, initGlobalParallax, initScrollDrawTransition } from "./scrollEffects";
import { initServicesScroll } from "./services";
import { initPortfolioOrbit } from "./portfolioOrbit";
import { initBracketHeading, initSplitLines, initSplitRandom, initSplitRolling } from "./textEffects";
import { initContactSection } from "./contact";

// Initialisers in page order. ScrollTrigger measures in creation order, so
// anything that sits below a pinned section must be created after that pin.
const PAGE_EFFECTS: ReadonlyArray<() => Cleanup> = [
  initThemeNav,
  initButton007,
  initLogoScroll,
  initScrollToAnchor,
  initGlobalParallax,
  initScrollDrawTransition,
  initServicesScroll,
  initPortfolioOrbit,
  initBracketHeading,
  initSplitLines,
  initSplitRolling,
  initSplitRandom,
  initContactSection,
  initFooterParallax,
  initDynamicCurrentYear,
];

/** Boots smooth scroll, the intro, and every scroll/hover effect. Returns a full teardown. */
export function initSite(container: HTMLElement): Cleanup {
  registerGsap();
  history.scrollRestoration = "manual";
  const cleanups: Cleanup[] = [];
  let disposed = false;

  cleanups.push(initLenis());
  prepareLogoScroll();
  cleanups.push(() => {
    const logo = document.querySelector("[data-logo-scroll]");
    if (logo) gsap.set(logo, { clearProps: "width,transform" });
  });

  let intro: gsap.core.Timeline | null = null;
  cleanups.push(() => intro?.kill());

  // Split-text measurements need the real font metrics. All the heavy setup
  // (text splitting, pins, ScrollTrigger refresh) runs while the blue overlay
  // is still static, and the signature only starts two frames later, so no
  // setup work can land mid-stroke and cause a stutter.
  document.fonts.ready.then(() => {
    if (disposed) return;
    for (const init of PAGE_EFFECTS) {
      try {
        cleanups.push(init());
      } catch (error) {
        console.error(`[animations] ${init.name} failed`, error);
      }
    }
    getLenis()?.resize();
    ScrollTrigger.refresh();
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        if (!disposed) intro = runPageIntro(container);
      }),
    );
  });

  return () => {
    disposed = true;
    runAll(cleanups);
    ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
  };
}
