import { gsap } from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import type Lenis from "lenis";

export { gsap, ScrollTrigger, SplitText };

export type Cleanup = () => void;

let registered = false;

// Plugins + the reference site's named eases and global tween defaults.
export function registerGsap(): void {
  if (registered) return;
  registered = true;
  gsap.registerPlugin(DrawSVGPlugin, CustomEase, ScrollTrigger, SplitText);
  CustomEase.create("osmo", "0.625, 0.05, 0, 1");
  CustomEase.create("button-007-ease", "0.78, 0.18, 0.18, 1");
  CustomEase.create("footerReveal", "M0,0 C0.65,0 0.15,1 1,1");
  gsap.defaults({ ease: "osmo", duration: 0.6 });
}

export function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** easeInOutQuart, used for every programmatic Lenis scroll. */
export const scrollEasing = (t: number): number =>
  t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2;

let lenisInstance: Lenis | null = null;

export function setLenis(instance: Lenis | null): void {
  lenisInstance = instance;
}

export function getLenis(): Lenis | null {
  return lenisInstance;
}

export function runAll(cleanups: Cleanup[]): void {
  for (const fn of cleanups.splice(0).reverse()) {
    try {
      fn();
    } catch (error) {
      console.error("[animations] cleanup failed", error);
    }
  }
}
