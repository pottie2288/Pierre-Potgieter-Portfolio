import { gsap, prefersReducedMotion, type Cleanup } from "./core";

interface ServiceParts {
  item: HTMLElement;
  row: HTMLElement;
  visual: HTMLElement;
  description: HTMLElement;
  imageWrap: HTMLElement;
}

const CLEAR_PROPS = "transform,height,width,left,top,zIndex,overflow,clipPath,webkitClipPath,opacity,visibility";

function collectParts(section: HTMLElement): ServiceParts[] | null {
  const items = gsap.utils.toArray<HTMLElement>(section.querySelectorAll("[data-services-item]"));
  const parts = items.map((item) => ({
    item,
    row: item.querySelector<HTMLElement>("[data-services-row]"),
    visual: item.querySelector<HTMLElement>("[data-services-visual]"),
    description: item.querySelector<HTMLElement>(".service-description"),
    imageWrap: item.querySelector<HTMLElement>("[data-services-image-wrap]"),
  }));
  if (!parts.length || parts.some((p) => !p.row || !p.visual || !p.description || !p.imageWrap)) return null;
  return parts as ServiceParts[];
}

// Desktop (≥992px): the section pins for n × viewport. Each visual is sized so
// that its row + the previous row + visual fill exactly one screen. Per step:
// the current visual collapses to 0, its image slides off to the right
// (left 29% → 100%) as the next image wipes in (width 0 → 71%), and the list
// shifts up by the rows that have scrolled past.
function desktop(section: HTMLElement, list: HTMLElement, parts: ServiceParts[]): Cleanup {
  const sizeVisuals = () => {
    parts.forEach(({ row, visual }, i) => {
      const prevRow = i > 0 ? parts[i - 1].row.offsetHeight : 0;
      gsap.set(visual, { height: Math.max(window.innerHeight - row.offsetHeight - prevRow, 0) });
    });
  };
  sizeVisuals();

  const listOffset = (index: number) => {
    if (index < 2) return 0;
    let offset = 0;
    for (let i = 0; i <= index - 2; i += 1) offset += parts[i].row.offsetHeight;
    return -offset;
  };

  const ctx = gsap.context(() => {
    gsap.set(list, { y: 0 });
    parts.forEach(({ visual, imageWrap }, i) => {
      gsap.set(visual, { overflow: "hidden" });
      gsap.set(imageWrap, { left: "29%", width: i === 0 ? "71%" : "0%" });
    });
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: "top top",
        end: () => "+=" + window.innerHeight * parts.length,
        scrub: true,
        pin: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onRefreshInit: sizeVisuals,
      },
    });
    parts.slice(0, -1).forEach((current, i) => {
      const next = parts[i + 1];
      tl.to(current.visual, { height: 0, duration: 1, ease: "none" }, i)
        .to(current.imageWrap, { left: "100%", width: "0%", duration: 1, ease: "none" }, i)
        .to(next.imageWrap, { left: "29%", width: "71%", duration: 1, ease: "none" }, i)
        .to(list, { y: () => listOffset(i + 1), duration: 1, ease: "none" }, i);
    });
  }, section);
  return () => ctx.revert();
}

// Tablet (768–991px): pinned accordion. One visual open at a time; scrolling
// collapses the current one while the next expands to its natural height.
function tablet(section: HTMLElement, list: HTMLElement, parts: ServiceParts[]): Cleanup {
  let heights: number[] = [];
  const measure = () => {
    heights = parts.map(({ visual }) => visual.scrollHeight);
  };
  const reset = () => {
    gsap.set(list, { y: 0 });
    parts.forEach(({ item, visual, imageWrap, description }, i) => {
      gsap.set(item, { clearProps: "transform,zIndex" });
      gsap.set(visual, { height: i === 0 ? heights[i] : 0, overflow: "hidden" });
      gsap.set(imageWrap, { clearProps: "transform,width,left,top,clipPath,webkitClipPath,opacity,visibility" });
      gsap.set(description, { clearProps: "transform,opacity,visibility" });
    });
  };
  measure();

  const ctx = gsap.context(() => {
    reset();
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: "top top",
        end: () => "+=" + window.innerHeight * (parts.length - 1),
        scrub: true,
        pin: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onRefreshInit: () => {
          measure();
          reset();
        },
      },
    });
    parts.slice(0, -1).forEach((current, i) => {
      tl.to(current.visual, { height: 0, duration: 1, ease: "none" }, i).to(
        parts[i + 1].visual,
        { height: () => heights[i + 1], duration: 1, ease: "none" },
        i,
      );
    });
  }, section);
  return () => ctx.revert();
}

export function initServicesScroll(): Cleanup {
  const mm = gsap.matchMedia();
  document.querySelectorAll<HTMLElement>("[data-services]").forEach((section) => {
    const list = section.querySelector<HTMLElement>("[data-services-list]");
    const parts = collectParts(section);
    if (!list || !parts) return;

    const clearAll = () => {
      const targets = [
        section,
        list,
        ...parts.map((p) => p.item),
        ...parts.map((p) => p.visual),
        ...parts.map((p) => p.imageWrap),
        ...parts.map((p) => p.description),
      ];
      gsap.set(targets, { clearProps: CLEAR_PROPS });
    };

    mm.add("(min-width: 992px)", () => {
      if (prefersReducedMotion()) {
        clearAll();
        return;
      }
      const revert = desktop(section, list, parts);
      return () => {
        revert();
        clearAll();
      };
    });
    mm.add("(min-width: 768px) and (max-width: 991px)", () => {
      if (prefersReducedMotion()) {
        clearAll();
        return;
      }
      const revert = tablet(section, list, parts);
      return () => {
        revert();
        clearAll();
      };
    });
    mm.add("(max-width: 767px)", () => {
      clearAll();
      return clearAll;
    });
  });
  return () => mm.revert();
}
