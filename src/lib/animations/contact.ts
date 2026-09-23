import { gsap, prefersReducedMotion, type Cleanup } from "./core";
import { CONTACT } from "@/content/site";

const WORD_COUNT = 50;

// 16 anchor points (in vw/vh from centre) arranged in a ring around the copy.
const ANCHORS = [
  { x: -38, y: -38 }, { x: -14, y: -40 }, { x: 14, y: -40 }, { x: 38, y: -38 },
  { x: -42, y: -14 }, { x: -18, y: -18 }, { x: 18, y: -18 }, { x: 42, y: -14 },
  { x: -42, y: 14 }, { x: -18, y: 18 }, { x: 18, y: 18 }, { x: 42, y: 14 },
  { x: -38, y: 38 }, { x: -14, y: 40 }, { x: 14, y: 40 }, { x: 38, y: 38 },
];

const r = gsap.utils.random;

// Content: scrubs in (blur 0.5rem → 0, scale 0.96 → 1, up 25%) between the
// section top hitting 60% and 25% of the viewport.
// Words: 50 spans start deep in Z (-1100…-1600px) near the centre, fly out to
// their ring anchor at z 0 while sharpening, then rush past the camera
// (z +800…1200) and fade, all scrubbed across the 250vh section.
export function initContactSection(): Cleanup {
  const ctx = gsap.context(() => {});
  const created: HTMLElement[] = [];

  document.querySelectorAll<HTMLElement>("[data-contact]").forEach((section) => {
    const content = section.querySelector<HTMLElement>("[data-contact-content]");
    const wordsHost = section.querySelector<HTMLElement>("[data-contact-words]");
    if (!content || !wordsHost) return;

    ctx.add(() => {
      gsap.set(content, { autoAlpha: 0, yPercent: 25, scale: 0.96, filter: "blur(0.5rem)" });
      const reveal = gsap.to(content, {
        autoAlpha: 1,
        yPercent: 0,
        scale: 1,
        filter: "blur(0rem)",
        ease: "none",
        scrollTrigger: { trigger: section, start: "top 60%", end: "top 25%", scrub: true, invalidateOnRefresh: true },
      });

      if (prefersReducedMotion()) reveal.progress(1);

      // The word field always runs: it is scroll-scrubbed, so it only moves as
      // fast as the visitor scrolls, and it is a signature part of the section.
      const words: HTMLElement[] = [];
      for (let i = 0; i < WORD_COUNT; i++) {
        const span = document.createElement("span");
        span.setAttribute("data-contact-word", "");
        span.textContent = CONTACT.words[i % CONTACT.words.length];
        wordsHost.appendChild(span);
        words.push(span);
        created.push(span);
      }

      const tl = gsap.timeline({
        scrollTrigger: { trigger: section, start: "top top", end: "bottom bottom", scrub: 1, invalidateOnRefresh: true },
      });

      words.forEach((word, i) => {
        const anchor = ANCHORS[i % ANCHORS.length];
        const wave = 0.12 * Math.floor(i / ANCHORS.length);
        const at = r(0, 0.52) + wave;
        const inDur = r(0.12, 0.18);
        const outDur = r(0.12, 0.18);
        const startX = anchor.x * r(0.08, 0.22);
        const startY = anchor.y * r(0.08, 0.22);
        const midX = anchor.x + r(-4, 4);
        const midY = anchor.y + r(-4, 4);
        const endX = midX + r(-3, 3);
        const endY = midY + r(-3, 3);
        const scale = r(0.7, 1.3);
        const peakAlpha = r(0.25, 0.62);

        gsap.set(word, {
          xPercent: -50,
          yPercent: -50,
          x: `${startX}vw`,
          y: `${startY}vh`,
          z: r(-1600, -1100),
          scale: 0.35 * scale,
          autoAlpha: 0,
          filter: "blur(0.65rem)",
        });
        tl.to(
          word,
          { x: `${midX}vw`, y: `${midY}vh`, z: 0, scale, autoAlpha: peakAlpha, filter: "blur(0rem)", duration: inDur, ease: "power1.inOut" },
          at,
        );
        tl.to(
          word,
          {
            x: `${endX}vw`,
            y: `${endY}vh`,
            z: r(800, 1200),
            scale: scale * r(1.3, 1.65),
            autoAlpha: 0,
            filter: "blur(0.5rem)",
            duration: outDur,
            ease: "power1.in",
          },
          at + inDur,
        );
      });
    });
  });

  return () => {
    ctx.revert();
    created.forEach((el) => el.remove());
  };
}
