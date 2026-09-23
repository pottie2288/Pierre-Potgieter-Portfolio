import BrushStroke from "./BrushStroke";
import { SIGNATURE } from "@/content/vectors";

const MASK_ID = "signature-pen-mask";
const PEN_STROKES = SIGNATURE.pens.flatMap((d) => d.split(/(?=M)/)).filter(Boolean);

// Fixed overlay shown on first paint: a screen-filling blue stroke. On load the
// signature writes itself (pen strokes in the mask reveal the calligraphic
// letterforms), then the stroke un-draws to reveal the page
// (lib/animations/pageIntro.ts).
export default function PageTransition() {
  const [minX, minY, width, height] = SIGNATURE.viewBox.split(" ").map(Number);
  return (
    <div data-transition-wrap="" className="transition" aria-hidden="true">
      <div className="transition__shape">
        <BrushStroke strokeWidth="80%" />
      </div>
      <div data-transition-signature="" className="transition__signature">
        <svg xmlns="http://www.w3.org/2000/svg" width="100%" viewBox={SIGNATURE.viewBox} fill="none">
          <defs>
            <mask id={MASK_ID} maskUnits="userSpaceOnUse" x={minX} y={minY} width={width} height={height}>
              {/* Fades in once writing ends so no sliver of a letter is left hidden */}
              <rect data-signature-full="" x={minX} y={minY} width={width} height={height} fill="white" opacity="0" />
              {/* One path per pen stroke, in writing order; pageIntro.ts moves a
                  single pen position through them all */}
              {PEN_STROKES.map((d, i) => (
                <path
                  key={i}
                  data-signature-pen=""
                  d={d}
                  stroke="white"
                  strokeWidth={SIGNATURE.pen}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  visibility="hidden"
                />
              ))}
            </mask>
          </defs>
          <g mask={`url(#${MASK_ID})`} fill="currentColor">
            {SIGNATURE.fills.map((d) => (
              <path key={d} d={d} />
            ))}
          </g>
        </svg>
      </div>
    </div>
  );
}
