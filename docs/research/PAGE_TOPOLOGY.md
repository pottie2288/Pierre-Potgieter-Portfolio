# Page topology

Top to bottom. `theme` is the `data-theme-section` value that drives the header colour.

| # | Section | Component | Theme | Interaction model |
|---|---|---|---|---|
| 0 | Intro overlay (fixed, z 999) | `PageTransition` | n/a | time-driven, once on load |
| 1 | Header (fixed, z 99) + progressive blur (fixed, z 98) | `Header` | n/a | scroll-driven logo shrink; hover buttons |
| 2 | Hero: full-bleed portrait, badges, globe | `Hero` | dark | scroll parallax |
| 3 | About: rolling H1, line-reveal copy, [About me] | `About` | dark | scroll-triggered (play once) |
| 4 | "Design that speaks." + [Services], brush wipe | `ServicesIntro` | light | pinned 200%, scrubbed |
| 5 | Services list (4 items) | `Services` | light | pinned n × 100vh, scrubbed |
| 6 | [Portfolio] + orbit carousel (7 projects) + CTA | `Portfolio` | dark | click/keyboard + time (orbit spin) |
| 7 | "Education & Experience" | `Credentials` | dark | scrubbed letter scatter |
| 8 | Contact (250vh, sticky inner) | `Contact` | light | scrubbed 3D word flight |
| 9 | Footer (revealed from behind) | `Footer` | light | scrubbed parallax |

`main.main-wrapper` (max-width = scaling container, `overflow: clip`) wraps sections 1–9.
All GSAP/Lenis behaviour boots from `SiteAnimations` → `lib/animations/index.ts`, in the order above,
because ScrollTrigger measures positions in creation order around pinned sections.

Content lives in `src/content/site.ts`; generated vector art (wordmarks, signature) in
`src/content/vectors.ts`, produced by the scripts in `scripts/`.
