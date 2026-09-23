import { gsap, SplitText, type Cleanup } from "./core";

// "[ Heading ]": brackets start pushed out 160% of their width and scrub
// inwards between the heading entering the viewport and reaching 40% from top.
export function initBracketHeading(): Cleanup {
  const ctx = gsap.context(() => {
    document.querySelectorAll<HTMLElement>("[data-bracket-heading]").forEach((heading) => {
      const left = heading.querySelector("[data-bracket-left]");
      const right = heading.querySelector("[data-bracket-right]");
      if (!left || !right) return;
      const scrollTrigger = { trigger: heading, start: "top bottom", end: "top 40%", scrub: true };
      gsap.fromTo(left, { xPercent: -160 }, { xPercent: 0, ease: "none", scrollTrigger });
      gsap.fromTo(right, { xPercent: 160 }, { xPercent: 0, ease: "none", scrollTrigger: { ...scrollTrigger } });
    });
  });
  return () => ctx.revert();
}

// Masked line reveal: each line rises from 110% below its mask, staggered,
// once the block reaches 85% of the viewport.
export function initSplitLines(): Cleanup {
  const splits: SplitText[] = [];
  document.querySelectorAll<HTMLElement>("[data-split-lines]").forEach((el) => {
    splits.push(
      SplitText.create(el, {
        type: "lines",
        autoSplit: true,
        mask: "lines",
        onSplit: (self) => {
          gsap.set(self.lines, { yPercent: 110 });
          return gsap.to(self.lines, {
            yPercent: 0,
            duration: 0.8,
            ease: "power4.out",
            stagger: 0.1,
            scrollTrigger: { trigger: el, start: "top 85%", toggleActions: "play none none none" },
          });
        },
      }),
    );
  });
  return () => splits.forEach((split) => split.revert());
}

// Rolling characters: every glyph starts flipped back (-110° on X) and pushed
// down/away by 0.6em, then rolls upright with a 30ms stagger.
export function initSplitRolling(): Cleanup {
  const splits: SplitText[] = [];
  document.querySelectorAll<HTMLElement>("[data-split-rolling]").forEach((el) => {
    splits.push(
      SplitText.create(el, {
        type: "chars, lines",
        autoSplit: true,
        mask: "lines",
        onSplit: (self) => {
          const depth = 0.6 * parseFloat(window.getComputedStyle(el).fontSize);
          gsap.set(self.lines, { perspective: 500 });
          gsap.set(self.chars, {
            rotationX: -110,
            z: -depth,
            y: depth,
            opacity: 0,
            transformOrigin: `50% 50% -${depth}px`,
          });
          return gsap.to(self.chars, {
            rotationX: 0,
            z: 0,
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: "power4.out",
            stagger: 0.03,
            scrollTrigger: { trigger: el, start: "top 85%", toggleActions: "play none none none" },
          });
        },
      }),
    );
  });
  return () => splits.forEach((split) => split.revert());
}

// Scattered letters: each char starts at a random offset (up to 3em, capped at
// 20% of the viewport), random rotation ±90° and scale 0.5–1.4, blurred, and
// scrubs into place in random order as the heading travels up the screen.
export function initSplitRandom(): Cleanup {
  const splits: SplitText[] = [];
  document.querySelectorAll<HTMLElement>("[data-split-random]").forEach((el) => {
    const byFont = 3 * parseFloat(getComputedStyle(el).fontSize);
    const byViewport = 0.2 * Math.min(window.innerWidth, window.innerHeight);
    const range = Math.min(byFont, byViewport);
    splits.push(
      // "words" as well as "chars" so long headings wrap between words, never mid-word.
      SplitText.create(el, {
        type: "words, chars",
        charsClass: "split-char",
        onSplit: (self) => {
          gsap.set(self.chars, {
            x: () => gsap.utils.random(-range, range),
            y: () => gsap.utils.random(-range, range),
            rotation: () => gsap.utils.random(-90, 90),
            scale: () => gsap.utils.random(0.5, 1.4),
            filter: "blur(8px)",
          });
          return gsap.to(self.chars, {
            x: 0,
            y: 0,
            rotation: 0,
            scale: 1,
            filter: "blur(0px)",
            stagger: { each: 0.03, from: "random" },
            scrollTrigger: { trigger: el, start: "top bottom", end: "top 15%", scrub: true },
          });
        },
      }),
    );
  });
  return () => splits.forEach((split) => split.revert());
}
