import { gsap, getLenis, prefersReducedMotion } from "./core";

// Scroll handling around the intro. The page is pinned to the top only while
// the overlay fully covers it, and handed back the instant the brush starts
// revealing the hero. The intro never touches the scroll position after that:
// resetting it at the end (as the reference does) yanked visitors who had
// already started scrolling back to the top.
function lockAtTop(): void {
  const lenis = getLenis();
  if (lenis) {
    lenis.scrollTo(0, { immediate: true, force: true });
    lenis.stop();
  } else {
    window.scrollTo(0, 0);
  }
}

function unlockScroll(): void {
  const lenis = getLenis();
  if (lenis) {
    lenis.resize();
    lenis.start();
  }
}

function finishIntro(container: HTMLElement): void {
  gsap.set(container, { clearProps: "position,top,left,right" });
  unlockScroll();
}

const WRITE_DURATION = 2.3; // seconds for the whole signature

const ERASE_DURATION = 0.8;

interface Pen {
  state: { head: number; tail: number };
  total: number;
  render: () => void;
}

// One pen position ("head", in arc length across every stroke in writing
// order) drives all stroke paths from a single tween. Each stroke shows the
// part of itself between "tail" and "head", so the pen flows from stroke to
// stroke with no per-letter tweens and no hand-off hitches. Lengths are
// measured once up front; each frame only touches strokes that changed.
function createPen(paths: SVGPathElement[]): Pen {
  const lengths = paths.map((path) => path.getTotalLength());
  const offsets: number[] = [];
  let total = 0;
  lengths.forEach((len) => {
    offsets.push(total);
    total += len;
  });
  const state = { head: 0, tail: 0 };
  const lastKey: string[] = [];

  const render = () => {
    paths.forEach((path, i) => {
      const len = lengths[i];
      const from = gsap.utils.clamp(0, len, state.tail - offsets[i]);
      const to = gsap.utils.clamp(0, len, state.head - offsets[i]);
      const visible = Math.max(0, to - from);
      const key = `${visible.toFixed(2)}|${from.toFixed(2)}`;
      if (key === lastKey[i]) return;
      lastKey[i] = key;
      // Hidden when empty: a zero-length dash would still paint a round cap dot
      path.setAttribute("visibility", visible > 0.01 ? "visible" : "hidden");
      path.style.strokeDasharray = `${visible} ${len * 2 + 1}`;
      path.style.strokeDashoffset = String(-from);
    });
  };
  render();
  return { state, total, render };
}

// First-load sequence: the signature writes itself, holds, erases, and the
// screen-filling brush stroke un-draws and thins out while the hero badges
// fade up.
export function runPageIntro(container: HTMLElement): gsap.core.Timeline {
  const wrap = document.querySelector<HTMLElement>("[data-transition-wrap]");
  const shapePaths = wrap?.querySelectorAll<SVGPathElement>(".transition__shape svg path");
  const signature = wrap?.querySelector<HTMLElement>("[data-transition-signature]");
  const signaturePaths = signature?.querySelectorAll<SVGPathElement>("[data-signature-pen]");
  const fullReveal = signature?.querySelector<SVGRectElement>("[data-signature-full]");
  const reveals = container.querySelectorAll<HTMLElement>("[data-transition-reveal]");
  const tl = gsap.timeline();

  if (!wrap || !shapePaths?.length || !signature || !signaturePaths?.length) {
    tl.call(finishIntro, [container]);
    return tl;
  }

  if (prefersReducedMotion()) {
    tl.set(container, { autoAlpha: 1 });
    tl.set(signature, { autoAlpha: 0 });
    tl.set(shapePaths, { drawSVG: "100% 100%", strokeWidth: "5%" });
    tl.call(finishIntro, [container]);
    return tl;
  }

  lockAtTop();
  const pen = createPen([...signaturePaths]);
  tl.set(container, { autoAlpha: 1 });
  tl.set(shapePaths, { drawSVG: "0% 100%", strokeWidth: "80%" });
  tl.set(signature, { autoAlpha: 1 });

  tl.to(pen.state, { head: pen.total, duration: WRITE_DURATION, ease: "sine.inOut", onUpdate: pen.render });
  if (fullReveal) tl.to(fullReveal, { opacity: 1, duration: 0.15, ease: "none" }, "-=0.1");

  tl.to({}, { duration: 0.35 });
  if (fullReveal) tl.set(fullReveal, { opacity: 0 });
  tl.to(pen.state, { tail: pen.total, duration: ERASE_DURATION, ease: "power2.inOut", onUpdate: pen.render });
  tl.to(shapePaths, { drawSVG: "100% 100%", strokeWidth: "5%", duration: 1.25, ease: "power1.inOut" }, "< 0.35");
  tl.call(unlockScroll, undefined, "<"); // page starts showing: scrolling is the visitor's from here
  tl.set(signature, { autoAlpha: 0 });
  tl.fromTo(
    reveals,
    { yPercent: 25, autoAlpha: 0 },
    { yPercent: 0, autoAlpha: 1, duration: 1, stagger: 0.15, ease: "expo.out" },
    "< 0.15",
  );
  tl.add("pageReady");
  tl.call(finishIntro, [container], "pageReady");
  return tl;
}
