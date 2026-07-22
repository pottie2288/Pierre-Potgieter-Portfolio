import Logo from "./Logo";
import { FloatingPaths } from "./ui/background-paths";
import { CONTACT_EMAIL } from "@/lib/site";

export default function ContactSection() {
  return (
    <section
      id="contact"
      className="section"
      style={{ position: "relative", overflow: "hidden", textAlign: "center" }}
    >
      {/* Floating Pulse background — same branded effect as the hero */}
      <div className="absolute inset-0" style={{ zIndex: 0 }}>
        <FloatingPaths position={1} />
        <FloatingPaths position={-1} />
      </div>

      <div style={{ position: "relative", zIndex: 1, maxWidth: 640, margin: "0 auto" }}>
        <p
          className="section-label"
          style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
        >
          <Logo size={13} color="var(--grey)" />
          Get In Touch
        </p>

        <h2
          style={{
            fontFamily: "var(--font-outfit), sans-serif",
            fontSize: "clamp(32px, 6vw, 72px)",
            fontWeight: 700,
            letterSpacing: "-0.03em",
            lineHeight: 1.1,
            color: "var(--white-smoke)",
            marginBottom: "24px",
          }}
        >
          Let&apos;s build something worth talking about.
        </h2>

        <p
          style={{
            fontFamily: "var(--font-outfit), sans-serif",
            fontSize: "clamp(15px, 1.3vw, 19px)",
            lineHeight: 1.6,
            color: "var(--grey)",
            marginBottom: "40px",
          }}
        >
          Drop me an email and I&apos;ll get back to you as soon as I can.
        </p>

        <a
          href={`mailto:${CONTACT_EMAIL}`}
          className="hero-cta-btn"
          style={{ fontSize: 14, padding: "14px 32px" }}
        >
          Email Me — {CONTACT_EMAIL}
        </a>
      </div>
    </section>
  );
}
