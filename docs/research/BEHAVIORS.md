# Behaviours: reference site (alejandroha.com/en) → v2

Extracted from the reference's own `js/custom-min.js`, `css/alejandroha.css` and embedded styles, then
verified with side-by-side screenshots at 1440×900, 834×1112 and 390×844
(`docs/design-references/original` vs `docs/design-references/clone`).

Stack on the reference: Webflow export + GSAP 3.15 (ScrollTrigger, SplitText, DrawSVG, CustomEase) +
Lenis 1.3.17 + Barba (page transitions only). v2 uses the same GSAP/Lenis versions; Barba is dropped
because v2 is a single page (only its first-load "once" transition is reproduced).

| Effect | Trigger | Values | v2 module |
|---|---|---|---|
| Smooth scroll | always | Lenis `lerp 0.165`, `wheelMultiplier 1.25`, driven by `gsap.ticker`, `lagSmoothing(0)` | `lenis.ts` |
| Global ease | all tweens | `osmo` = cubic-bezier(0.625, 0.05, 0, 1), default duration 0.6s | `core.ts` |
| Intro | page load | Screen covered by a brush stroke at 80% stroke width. Signature strokes draw one by one (0.25–0.5s each, scaled by length), 0.35s hold, erase (0.8s, stagger 0.03), brush un-draws to 100%/100% and thins to 5% (1.25s power1.inOut), hero badges rise from yPercent 25 (1s expo.out, stagger 0.15) | `pageIntro.ts` |
| Logo shrink | hero scroll `top top → bottom top`, scrub 1 | Wordmark starts `width:100%`, `y:90%` (120% below 1025px) and scrubs to its nav width at y 0. After leaving the hero it becomes back-to-top (Lenis scrollTo 0, 1.2s, easeInOutQuart) | `navigation.ts` |
| Nav colour | scroll/resize (rAF) | The `[data-theme-section]` under the header mid-line sets `data-theme-nav` on body: dark → ink text, light → silver text (0.2s colour transition) | `navigation.ts` |
| Hero parallax | `top top → bottom top`, scrub | Image yPercent 0 → 40, disabled ≤991px | `scrollEffects.ts` |
| Progressive blur | fixed | 5 stacked backdrop-filter layers (0.01–0.2em) with stepped gradient masks, 8em tall | CSS |
| Button 007 hover | pointerenter/leave, fine pointers only | Scribble path draws 0→100% while stroke-width 0→60 (0.8s `0.78,0.18,0.18,1`); leave un-draws to 100%/100%, width → 4; queued re-hover fires 0.2s before exit ends | `button007.ts` |
| Split lines | `top 85%`, plays once | Lines masked, yPercent 110 → 0, 0.8s power4.out, stagger 0.1 | `textEffects.ts` |
| Split rolling | `top 85%`, plays once | Chars rotateX -110°, z/y ±0.6em, opacity 0 → upright, 0.8s power4.out, stagger 0.03, line perspective 500 | `textEffects.ts` |
| Bracket heading | `top bottom → top 40%`, scrub | `[` xPercent -160 → 0, `]` 160 → 0 | `textEffects.ts` |
| Scroll draw wipe | pin `top top`, `+=200%`, scrub | Brush drawSVG 0 → 0–85%, stroke 5% → 80% (from 25% progress) over "Design that speaks." | `scrollEffects.ts` |
| Services (≥992px) | pin for n × viewport, scrub | Visual heights fill the screen; per step: visual → 0, image left 29% → 100% and width → 0, next image width 0 → 71%, list y shifts by past rows | `services.ts` |
| Services (768–991px) | pin for (n-1) × viewport | Accordion: current visual → 0, next → natural height | `services.ts` |
| Services (≤767px) | none | Static stacked list | CSS |
| Portfolio orbit | prev/next buttons, ←/→ keys when centred | Cards on an axis rotating 360° per 24s; depth (cos+1)/2^1.3 → scale 0.2–1, blur, z-index. Step tween 0.7s osmo. Active card grows to 115% and clip-path opens from an 18% inset (0.75s). Counter rolls out/in (0.3s/0.4s). Copy lines out (-110%, 0.35s) / in (0.7s, stagger 0.055) | `portfolioOrbit.ts` |
| Split random | `top bottom → top 15%`, scrub | Chars from random x/y (≤3em, ≤20% viewport), rotation ±90°, scale 0.5–1.4, blur 8px, stagger 0.03 from random | `textEffects.ts` |
| Contact | 250vh section, sticky 100vh | Content scrubs in `top 60% → top 25%` (blur .5rem, scale .96, yPercent 25). 50 words fly from z -1100…-1600 to a 16-point ring at z 0, then past the camera to z 800…1200 (scrub 1) | `contact.ts` |
| Footer reveal | `top bottom → top top`, scrub, ≥768px | Inner yPercent -100 → 0 (revealed from behind) | `scrollEffects.ts` |
| Underline links | hover | `::before` scaleX 0 → 1, origin right → left, 0.735s osmo | CSS |
| Globe | always | CSS keyframes: 10.8s rotate + 5.4s meridian morph | CSS |

Scaling: `font-size` on body = container width / (design width / 16), with design widths 1440 / 834 /
550 / 402 at the 991 / 767 / 479 breakpoints. Everything is sized in `em`, so the layout scales fluidly.

Reduced motion: every effect checks `prefers-reduced-motion` and falls back to the end state.
