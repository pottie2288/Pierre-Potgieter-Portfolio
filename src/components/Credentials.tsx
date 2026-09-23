import { CREDENTIALS } from "@/content/site";

// Scatter-to-assemble heading: each letter starts randomly offset, rotated and
// blurred, and scrubs into place with scroll (textEffects.ts → initSplitRandom).
export default function Credentials() {
  return (
    <section data-theme-section="dark" className="certification">
      <div className="certification-header-w">
        <h2 data-split-random="" className="certified-big-txt">
          {CREDENTIALS.heading}
        </h2>
      </div>
      <div className="certification-content-w">
        <p>{CREDENTIALS.body}</p>
      </div>
      <div className="certifications-logos">
        <div className="credential-mark">
          <span className="credential-mark__badge">IMM</span>
          <span className="credential-mark__name">Marketing Degree</span>
          <span className="credential-mark__sub">class of 2025</span>
        </div>
        <div className="credential-mark">
          <span className="credential-mark__badge">NG</span>
          <span className="credential-mark__name">NextGenSolution</span>
          <span className="credential-mark__sub">founder</span>
        </div>
      </div>
    </section>
  );
}
