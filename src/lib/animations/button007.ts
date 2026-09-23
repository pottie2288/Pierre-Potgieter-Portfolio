import { gsap, type Cleanup } from "./core";

const HOVER_QUERY = "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)";

function strokeWidthFor(button: HTMLElement): number {
  const value = getComputedStyle(button).getPropertyValue("--button-007-stroke-width").trim();
  return parseFloat(value) || 0;
}

// Hover in: the scribble draws across the pill while its stroke fattens (0 →
// 60), painting the hover colour and unmasking the hover label. Hover out: the
// stroke un-draws from the start and thins to 4. A hover that arrives mid
// exit-animation is queued and replayed once the exit is nearly done.
function bindButton(button: HTMLElement): Cleanup {
  const svgs = button.querySelectorAll<SVGSVGElement>("[data-button-007-svg]");
  const paths = button.querySelectorAll<SVGPathElement>("[data-button-007-svg] path");
  const maskObject = button.querySelector<SVGForeignObjectElement>("[data-button-007-mask-object]");
  if (!svgs.length || !paths.length || !maskObject) return () => {};

  const hoverTarget = button.closest<HTMLElement>("[data-hover]") || button;
  const targetWidth = strokeWidthFor(button);
  let entering = false;
  let pending = false;
  let tween: gsap.core.Animation | null = null;

  const syncMaskHeight = () => {
    const host = svgs[0].parentNode?.parentNode as Element | null;
    const height = host?.getBoundingClientRect().height;
    if (height) maskObject.setAttribute("height", String(height));
  };

  gsap.set(paths, { drawSVG: "0% 0%", strokeWidth: 0 });
  syncMaskHeight();

  const enter = () => {
    if (entering) {
      pending = true;
      return;
    }
    entering = true;
    tween?.kill();
    gsap.set(paths, { drawSVG: "0% 0%", strokeWidth: 0 });
    tween = gsap.to(paths, {
      strokeWidth: targetWidth,
      drawSVG: "100% 0%",
      duration: 0.8,
      ease: "button-007-ease",
      overwrite: true,
    });
  };

  const leave = () => {
    tween?.kill();
    pending = false;
    const tl = gsap.timeline();
    tl.to(paths, { strokeWidth: 4, duration: 0.8, ease: "button-007-ease" }, 0);
    tl.to(paths, { drawSVG: "100% 100%", duration: 0.8, ease: "button-007-ease" }, 0);
    tl.call(
      () => {
        entering = false;
        if (pending) {
          pending = false;
          enter();
        }
      },
      undefined,
      "-=0.2",
    );
    tween = tl;
  };

  const focusIn = () => {
    if (hoverTarget.matches(":focus-visible")) enter();
  };

  hoverTarget.addEventListener("pointerenter", enter);
  hoverTarget.addEventListener("pointerleave", leave);
  hoverTarget.addEventListener("focusin", focusIn);
  hoverTarget.addEventListener("focusout", leave);
  window.addEventListener("resize", syncMaskHeight);

  return () => {
    hoverTarget.removeEventListener("pointerenter", enter);
    hoverTarget.removeEventListener("pointerleave", leave);
    hoverTarget.removeEventListener("focusin", focusIn);
    hoverTarget.removeEventListener("focusout", leave);
    window.removeEventListener("resize", syncMaskHeight);
    tween?.kill();
  };
}

export function initButton007(): Cleanup {
  const buttons = document.querySelectorAll<HTMLElement>("[data-button-007]");
  if (!buttons.length) return () => {};
  const mm = gsap.matchMedia();
  mm.add(HOVER_QUERY, () => {
    const unbinds = [...buttons].map(bindButton);
    return () => unbinds.forEach((unbind) => unbind());
  });
  return () => mm.revert();
}
