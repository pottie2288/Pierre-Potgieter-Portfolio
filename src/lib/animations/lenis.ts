import Lenis from "lenis";
import { gsap, ScrollTrigger, setLenis, type Cleanup } from "./core";

// Smooth scroll with the reference's feel: lerp 0.165, wheel x1.25, driven by
// GSAP's ticker so ScrollTrigger and Lenis stay in lockstep.
export function initLenis(): Cleanup {
  const lenis = new Lenis({ lerp: 0.165, wheelMultiplier: 1.25 });
  setLenis(lenis);
  lenis.on("scroll", ScrollTrigger.update);
  const tick = (time: number) => lenis.raf(time * 1000);
  gsap.ticker.add(tick);
  gsap.ticker.lagSmoothing(0);

  return () => {
    gsap.ticker.remove(tick);
    lenis.destroy();
    setLenis(null);
  };
}
