// No hooks or browser APIs — pure server component
// The marquee animation is driven entirely by the CSS keyframe defined in globals.css

import Logo from "./Logo";

const row1Phrase = [
  { word: "A", variant: "dark" },
  { word: "brand", variant: "light" },
  { word: "is", variant: "dark" },
  { word: "recognized", variant: "light" },
  { word: "before", variant: "dark" },
  { word: "it", variant: "light" },
  { word: "is", variant: "dark" },
  { word: "understood", variant: "light" },
] as const;

const row2Phrase = [
  { word: "Your", variant: "dark" },
  { word: "visual", variant: "light" },
  { word: "identity", variant: "dark" },
  { word: "shapes", variant: "light" },
  { word: "how", variant: "dark" },
  { word: "people", variant: "light" },
  { word: "recognize", variant: "accent" },
  { word: "trust", variant: "light" },
  { word: "and", variant: "dark" },
  { word: "remember", variant: "accent" },
  { word: "you", variant: "light" },
] as const;

// Repeat phrase N times so the marquee never shows a gap
const REPEATS = 4;

function buildTrack(
  phrase: ReadonlyArray<{ word: string; variant: string }>
): Array<{ word: string; variant: string; key: string }> {
  const result: Array<{ word: string; variant: string; key: string }> = [];
  for (let r = 0; r < REPEATS; r++) {
    phrase.forEach((item, i) => {
      result.push({ ...item, key: `${r}-${i}` });
    });
  }
  return result;
}

const row1Words = buildTrack(row1Phrase);
const row2Words = buildTrack(row2Phrase);

export default function PhilosophySection() {
  return (
    <div className="philosophy-section">
      {/* Row 1 — forward marquee */}
      <div className="philosophy-marquee-row">
        <div className="philosophy-text">
          {row1Words.map(({ word, variant, key }) => (
            <span
              key={key}
              className={`philosophy-word ${variant}`}
            >
              {word}
            </span>
          ))}
        </div>
      </div>

      {/* Divider mark */}
      <div style={{ display: "flex", justifyContent: "center", padding: "20px 0" }}>
        <Logo size={22} color="var(--lime)" style={{ opacity: 0.6 }} />
      </div>

      {/* Row 2 — reverse marquee */}
      <div className="philosophy-marquee-row">
        <div className="philosophy-text reverse">
          {row2Words.map(({ word, variant, key }) => (
            <span
              key={key}
              className={`philosophy-word ${variant}`}
            >
              {word}
            </span>
          ))}
        </div>
      </div>

      {/* Body copy */}
      <div className="philosophy-body">
        <p>
          A brand is recognized before it is understood. Your visual identity
          shapes how people recognize you, trust you, and remember you. I help
          define that difference.
        </p>
      </div>
    </div>
  );
}
