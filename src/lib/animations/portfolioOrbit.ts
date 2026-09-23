import { gsap, ScrollTrigger, SplitText, prefersReducedMotion, type Cleanup } from "./core";

const CARD_RADIUS = "0.65em";
const ACTIVE_SCALE = 1.15; // active card grows to 115% of its natural width
const ROTATION_PERIOD = 24; // seconds per full turn of the orbit axis

interface ContentBlock {
  wrapper: HTMLElement;
  splits: SplitText[];
  lines: Element[];
}

// Orbit carousel. Cards sit on a line through the centre (x = sin(angle) × r)
// that slowly rotates; depth = (cos(angle)+1)/2 drives scale 0.2→1, blur and
// z-order. The active card grows, its clip-path opens from an 18% inset, the
// counter rolls and the copy swaps with a masked line reveal.
function initOrbit(root: HTMLElement): Cleanup {
  const list = root.querySelector<HTMLElement>("[data-orbit-tiles-list]");
  const items = gsap.utils.toArray<HTMLElement>(root.querySelectorAll("[data-orbit-tiles-item]"));
  const cards = items.map((item) => item.querySelector<HTMLElement>("[data-orbit-card]"));
  const masks = items.map((item) => item.querySelector<HTMLElement>("[data-orbit-tiles-mask]"));
  const videos = items.map((item) => item.querySelector<HTMLVideoElement>("[data-orbit-video]"));
  const contents = gsap.utils.toArray<HTMLElement>(root.querySelectorAll("[data-portfolio-content]"));
  const countCurrent = root.querySelector<HTMLElement>('[data-portfolio-count="current"]');
  const countTotal = root.querySelector<HTMLElement>('[data-portfolio-count="total"]');
  const total = items.length;
  if (!list || total < 2 || cards.some((c) => !c) || masks.some((m) => !m)) return () => {};
  const cardEls = cards as HTMLElement[];

  const reduced = prefersReducedMotion();
  const progress = { step: 0 };
  const spin = { rotation: 0 };
  const wrapIndex = gsap.utils.wrap(0, total);
  let targetStep = 0;
  let shownContent = -1;
  let active = 0;
  let orbitWidth = 0;
  let inView = false;
  let keysEnabled = false;
  let contentTl: gsap.core.Timeline | null = null;
  let activateTl: gsap.core.Timeline | null = null;
  let stepTween: gsap.core.Tween | null = null;
  let widthTween: gsap.core.Tween | null = null;

  videos.forEach((video) => {
    if (!video) return;
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
  });
  const pauseVideos = () => videos.forEach((video) => video?.pause());
  const playActiveVideo = () => {
    if (!inView) return;
    videos.forEach((video, i) => {
      if (video && i !== active) video.pause();
    });
    videos[active]?.play().catch(() => {});
  };

  const blocks: ContentBlock[] = contents.map((wrapper) => {
    const splits = gsap.utils
      .toArray<HTMLElement>(wrapper.querySelectorAll("[data-portfolio-content-reveal]"))
      .map((el) => SplitText.create(el, { type: "lines", mask: "lines", autoSplit: false }));
    return { wrapper, splits, lines: splits.flatMap((s) => s.lines) };
  });

  const naturalWidth = (card: HTMLElement) => {
    const stored = Number(card.dataset.orbitNaturalWidth);
    return Number.isFinite(stored) && stored > 0 ? stored : card.offsetWidth || card.getBoundingClientRect().width;
  };
  const measure = () => {
    cardEls.forEach((card) => {
      gsap.set(card, { clearProps: "width" });
      card.dataset.orbitNaturalWidth = String(card.offsetWidth || card.getBoundingClientRect().width);
    });
    orbitWidth = Math.max(...cardEls.map(naturalWidth));
  };
  const activeTargetWidth = () =>
    ACTIVE_SCALE * (cardEls[active].offsetWidth || cardEls[active].getBoundingClientRect().width);
  const revealOf = (card: HTMLElement) => {
    const raw = gsap.getProperty(card, "--orbit-card-reveal");
    const value = typeof raw === "number" ? raw : parseFloat(String(raw));
    return Number.isFinite(value) ? gsap.utils.clamp(0, 1, value) : 0;
  };
  const applyClip = (card: HTMLElement) => {
    const mask = card.querySelector<HTMLElement>("[data-orbit-tiles-mask]");
    if (!mask) return;
    const raw = 0.18 * (card.offsetHeight || card.getBoundingClientRect().height) * (1 - revealOf(card));
    const inset = raw <= 0.5 ? 0 : raw;
    const clip = `inset(${inset}px 0px ${inset}px 0px round ${CARD_RADIUS})`;
    gsap.set(mask, { clipPath: clip, webkitClipPath: clip });
  };

  const syncStatus = () => {
    const current = wrapIndex(Math.round(progress.step));
    items.forEach((item, i) => {
      const isActive = i === current;
      const card = cardEls[i];
      item.setAttribute("data-orbit-tiles-item-status", isActive ? "active" : "not-active");
      if (!card.dataset.orbitHref) {
        const href = card.getAttribute("href");
        if (href) card.dataset.orbitHref = href;
      }
      if (isActive) {
        if (card.dataset.orbitHref) card.setAttribute("href", card.dataset.orbitHref);
        card.style.pointerEvents = "auto";
        card.style.cursor = card.dataset.orbitHref ? "pointer" : "default";
        card.removeAttribute("aria-disabled");
        card.removeAttribute("tabindex");
      } else {
        card.removeAttribute("href");
        card.style.pointerEvents = "none";
        card.style.cursor = "default";
        card.setAttribute("aria-disabled", "true");
        card.setAttribute("tabindex", "-1");
      }
    });
  };

  const render = () => {
    if (!orbitWidth) return;
    syncStatus();
    const radius = 0.7 * orbitWidth;
    const maxBlur = 0.04 * orbitWidth;
    gsap.set(list, { rotation: spin.rotation });
    items.forEach((item, i) => {
      const angle = ((i - progress.step) / total) * Math.PI * 2;
      const depth = Math.pow((Math.cos(angle) + 1) / 2, 1.3);
      gsap.set(item, {
        x: Math.sin(angle) * radius,
        y: 0,
        scale: gsap.utils.interpolate(0.2, 1, depth),
        opacity: 1,
        rotation: -spin.rotation,
        filter: `blur(${gsap.utils.interpolate(maxBlur, 0, depth)}px)`,
        zIndex: Math.round(1000 * depth),
      });
    });
  };

  const activateCard = (index: number, animate = true) => {
    const card = cardEls[index];
    const target = activeTargetWidth();
    activateTl?.kill();
    widthTween?.kill();
    gsap.killTweensOf(card);
    if (!animate || reduced) {
      orbitWidth = target;
      gsap.set(card, { width: target, "--orbit-card-reveal": 1 });
      applyClip(card);
      render();
      return;
    }
    const proxy = { width: orbitWidth || card.offsetWidth || naturalWidth(card) };
    gsap.set(card, { "--orbit-card-reveal": revealOf(card) });
    activateTl = gsap.timeline();
    activateTl.to(
      proxy,
      {
        width: target,
        duration: 0.75,
        ease: "osmo",
        onUpdate: () => {
          orbitWidth = proxy.width;
          render();
        },
      },
      0,
    );
    activateTl.to(
      card,
      {
        width: target,
        "--orbit-card-reveal": 1,
        duration: 0.75,
        ease: "osmo",
        overwrite: true,
        onUpdate: () => applyClip(card),
        onComplete: () => {
          orbitWidth = target;
          applyClip(card);
          render();
        },
      },
      0,
    );
  };

  const deactivateCard = (index: number, animate = true) => {
    const card = cardEls[index];
    const width = naturalWidth(card);
    gsap.killTweensOf(card);
    if (!animate || reduced) {
      gsap.set(card, { width, "--orbit-card-reveal": 0 });
      applyClip(card);
      gsap.set(card, { clearProps: "width" });
      return;
    }
    gsap.to(card, {
      width,
      "--orbit-card-reveal": 0,
      duration: 0.55,
      ease: "osmo",
      overwrite: true,
      onUpdate: () => applyClip(card),
      onComplete: () => {
        gsap.set(card, { clearProps: "width" });
        gsap.set(card, { "--orbit-card-reveal": 0 });
        applyClip(card);
      },
    });
  };

  const setCounter = (index: number, animate = true) => {
    if (!countCurrent) return;
    const label = String(index + 1).padStart(2, "0");
    gsap.killTweensOf(countCurrent);
    if (!animate) {
      countCurrent.textContent = label;
      gsap.set(countCurrent, { autoAlpha: 1, yPercent: 0 });
      return;
    }
    gsap
      .timeline()
      .to(countCurrent, { autoAlpha: 0, yPercent: -100, duration: 0.3, ease: "power3.in" })
      .call(() => {
        countCurrent.textContent = label;
      })
      .set(countCurrent, { yPercent: 100 })
      .to(countCurrent, { autoAlpha: 1, yPercent: 0, duration: 0.4, ease: "power3.out" });
  };

  const showContent = (index: number, animate = true) => {
    if (!blocks.length || index === shownContent) return;
    const previous = shownContent >= 0 ? blocks[shownContent] : null;
    const next = blocks[index];
    if (!next) return;
    contentTl?.kill();
    shownContent = index;
    if (!animate) {
      gsap.set(contents, { autoAlpha: 0 });
      blocks.forEach((block) => gsap.set(block.lines, { yPercent: 110 }));
      gsap.set(next.wrapper, { autoAlpha: 1 });
      gsap.set(next.lines, { yPercent: 0 });
      return;
    }
    blocks.forEach((block, i) => {
      if (i === index) return;
      gsap.set(block.wrapper, { autoAlpha: 0 });
      gsap.set(block.lines, { yPercent: 110 });
    });
    contentTl = gsap.timeline();
    if (previous) {
      contentTl.to(previous.lines, { yPercent: -110, duration: 0.35, stagger: 0.025, ease: "power3.in" });
    }
    contentTl
      .set(next.wrapper, { autoAlpha: 1 })
      .fromTo(
        next.lines,
        { yPercent: 110 },
        { yPercent: 0, duration: 0.7, stagger: 0.055, ease: "power4.out" },
        previous ? "-=0.1" : 0,
      );
  };

  const select = (index: number, animate = true) => {
    const wrapped = wrapIndex(index);
    setCounter(wrapped, animate);
    showContent(wrapped, animate);
    contents.forEach((el, i) =>
      el.setAttribute("data-portfolio-content-status", i === wrapped ? "active" : "not-active"),
    );
  };

  const navigate = (direction: 1 | -1) => {
    const previous = active;
    pauseVideos();
    targetStep += direction;
    const next = wrapIndex(targetStep);
    stepTween?.kill();
    activateTl?.kill();
    widthTween?.kill();
    deactivateCard(previous, true);
    cardEls.forEach((card, i) => {
      if (i !== previous && i !== next && revealOf(card) > 0) deactivateCard(i, true);
    });
    active = next;
    select(next, true);

    const proxy = { width: orbitWidth };
    const nextWidth = naturalWidth(cardEls[next]);
    widthTween = gsap.to(proxy, {
      width: nextWidth,
      duration: 0.55,
      ease: "osmo",
      overwrite: true,
      onUpdate: () => {
        orbitWidth = proxy.width;
        render();
      },
      onComplete: () => {
        orbitWidth = nextWidth;
        render();
      },
    });
    stepTween = gsap.to(progress, {
      step: targetStep,
      duration: 0.7,
      ease: "osmo",
      overwrite: true,
      onUpdate: render,
      onComplete: () => {
        if (active === next) {
          activateCard(next, true);
          playActiveVideo();
        }
      },
    });
  };

  const onClick = (event: MouseEvent) => {
    const button = (event.target as Element).closest("[data-portfolio-button]");
    if (!button || !root.contains(button)) return;
    const dir = button.getAttribute("data-portfolio-button");
    if (dir === "prev" || dir === "next") {
      event.preventDefault();
      navigate(dir === "next" ? 1 : -1);
    }
  };
  const onKey = (event: KeyboardEvent) => {
    if (!keysEnabled) return;
    const focused = document.activeElement;
    if (focused?.matches("input, textarea, select, [contenteditable='true']")) return;
    if (event.key === "ArrowRight") {
      event.preventDefault();
      navigate(1);
    }
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      navigate(-1);
    }
  };

  root.addEventListener("click", onClick);
  window.addEventListener("keydown", onKey);
  if (countTotal) countTotal.textContent = String(total).padStart(2, "0");
  gsap.set(contents, { autoAlpha: 0 });
  blocks.forEach((block) => gsap.set(block.lines, { yPercent: 110 }));
  measure();
  cardEls.forEach((card) => {
    const href = card.getAttribute("href");
    if (href) card.dataset.orbitHref = href;
    gsap.set(card, { "--orbit-card-reveal": 0 });
    applyClip(card);
  });
  select(0, false);
  active = 0;
  targetStep = 0;
  progress.step = 0;
  activateCard(0, false);
  render();

  const spinTween = gsap.to(spin, {
    rotation: 360,
    duration: ROTATION_PERIOD,
    ease: "none",
    repeat: -1,
    paused: reduced,
    onUpdate: render,
  });

  const resizeObserver = new ResizeObserver(() => {
    stepTween?.kill();
    activateTl?.kill();
    widthTween?.kill();
    cardEls.forEach((card, i) => {
      if (i !== active) gsap.set(card, { clearProps: "width" });
    });
    measure();
    const card = cardEls[active];
    const width = activeTargetWidth();
    orbitWidth = width;
    gsap.set(card, { width, "--orbit-card-reveal": 1 });
    applyClip(card);
    render();
  });
  resizeObserver.observe(root);

  const viewTrigger = ScrollTrigger.create({
    trigger: root,
    start: "top bottom",
    end: "bottom top",
    onToggle: ({ isActive }) => {
      inView = isActive;
      if (isActive) {
        if (!reduced) spinTween.play();
        playActiveVideo();
      } else {
        if (!reduced) spinTween.pause();
        pauseVideos();
      }
    },
  });
  inView = viewTrigger.isActive;
  if (inView) playActiveVideo();
  const keyTrigger = ScrollTrigger.create({
    trigger: root,
    start: "top center",
    end: "bottom center",
    onToggle: ({ isActive }) => {
      keysEnabled = isActive;
    },
  });

  return () => {
    root.removeEventListener("click", onClick);
    window.removeEventListener("keydown", onKey);
    resizeObserver.disconnect();
    viewTrigger.kill();
    keyTrigger.kill();
    [spinTween, stepTween, widthTween, activateTl, contentTl].forEach((t) => t?.kill());
    gsap.killTweensOf([...cardEls, ...items, list, countCurrent].filter(Boolean));
    blocks.forEach((block) => block.splits.forEach((split) => split.revert()));
    gsap.set([...items, ...cardEls, ...(masks as HTMLElement[]), list, ...contents], { clearProps: "all" });
  };
}

export function initPortfolioOrbit(): Cleanup {
  const cleanups = [...document.querySelectorAll<HTMLElement>("[data-portfolio-orbit-init]")].map(initOrbit);
  return () => cleanups.forEach((fn) => fn());
}
