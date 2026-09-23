import BracketHeading from "./BracketHeading";
import BrushStroke from "./BrushStroke";
import { SERVICES_HEADER } from "@/content/site";

// Pinned "Design that speaks." panel. While pinned, the blue brush stroke draws
// over it and thickens until the screen is blue, handing off seamlessly to the
// blue Services section below (lib/animations/scrollDraw.ts).
export default function ServicesIntro() {
  return (
    <>
      <div id="services" className="anchor" />
      <div data-theme-section="light" data-scroll-draw-transition="" className="scroll-draw-transition">
        <section data-scroll-draw-section="" className="services-header__w">
          <p data-split-rolling="" className="services-big-txt">
            {SERVICES_HEADER.line} <span className="services-big-txt__span">{SERVICES_HEADER.emphasis}</span>
          </p>
          <BracketHeading className="txt-color-blue">Services</BracketHeading>
        </section>
        <div data-scroll-draw-overlay="" className="scroll-draw-transition__overlay">
          <div className="scroll-draw-transition__shape">
            <BrushStroke strokeWidth="0" />
          </div>
        </div>
      </div>
    </>
  );
}
