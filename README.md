# pierrepotgieter.co.za v2

Portfolio site for Pierre Potgieter. Next.js 16 (App Router, static export-friendly), GSAP 3.15 and Lenis.

The layout, motion and interaction design are recreated from the reference site
https://alejandroha.com/en (design by Luan Studio, development by Alejandro HA). See
`docs/research/BEHAVIORS.md` for how every effect works and `docs/research/PAGE_TOPOLOGY.md` for the
page structure.

## Run

```bash
npm install
npm run dev      # http://localhost:3000
npm run build && npm start
```

## Where things live

| What | Where |
|---|---|
| All copy, contact details, services and projects | `src/content/site.ts` |
| Wordmark + signature vectors (generated) | `src/content/vectors.ts` |
| Section components | `src/components/` |
| Animation modules (one per effect family) | `src/lib/animations/` |
| Styles (base, effects, button, sections, responsive) | `src/styles/` |
| Images | `public/images/`, `public/work/` |

## Changing content

- Text, links, services and projects: edit `src/content/site.ts`. The portfolio counter and orbit
  adapt to any number of projects (2 or more).
- Project screenshots: drop a 3:2 or wider JPG into `public/work/` and reference it in `PROJECTS`.

## Regenerating assets

The scripts in `scripts/` were run once to produce the assets; they need Python (Pillow, numpy) and
Node (`fontkit`, `hersheytext`) plus the Archivo and Allura TTFs from google/fonts.

- `hero.py` composites `portrait.png` (transparent cut-out) onto a studio-grey backdrop at 2880×2160.
- `logo.js nav 300` / `logo.js footer 400` build the wordmarks from Archivo glyph outlines.
- `signature.js 34` builds the intro signature: Allura (OFL) filled letterforms plus "pen" strokes traced
  from EMS Allure centrelines (fitted per letter). The pens are drawn inside an SVG mask, so the smooth
  calligraphic outlines appear to be written. Needs `Allura-Regular.ttf` from google/fonts.

Paste the JSON output into `src/content/vectors.ts`.

## Fonts

The reference uses Atyp BL (Adobe Fonts, licensed). v2 uses Archivo (Google Fonts, OFL) with its width
axis: 108% width for body text, 100% width at weight 800 for display type, which matches Atyp's
measured line lengths.
