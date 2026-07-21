"use client";

import { useEffect, useRef } from "react";
import Logo from "./Logo";

const FACTS = [
  { label: "Based in",  value: "Cape Town, South Africa" },
  { label: "Education", value: "IMM — Marketing Degree, 2025" },
  { label: "Currently",  value: "Founder, NextGenSolution" },
];

export default function AboutMeSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const reveals = section.querySelectorAll<HTMLElement>(".reveal");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    reveals.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <section id="about" className="section" ref={sectionRef}>
      <p className="section-label" style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Logo size={13} color="var(--grey)" />
        Who I Am
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
        {/* Left — story */}
        <div className="lg:col-span-7 reveal">
          <h2
            style={{
              fontFamily: "var(--font-outfit), sans-serif",
              fontSize: "clamp(32px, 5vw, 80px)",
              fontWeight: 700,
              letterSpacing: "-0.03em",
              marginBottom: "32px",
            }}
          >
            My Story
          </h2>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "20px",
              fontSize: "clamp(15px, 1.2vw, 18px)",
              lineHeight: 1.7,
              color: "var(--grey)",
              maxWidth: "620px",
            }}
          >
            <p>
              I grew up in Cape Town with a pull toward anything creative.
              Web design was the natural landing point — the one place where
              craft and story turn into something people actually use.
            </p>
            <p>
              That instinct sharpened into a marketing degree at IMM,
              graduating in 2025 with a clearer read on how brands actually
              earn attention — and keep it.
            </p>
            <p>
              Today I run{" "}
              <span style={{ color: "var(--white-smoke)", fontWeight: 600 }}>
                NextGenSolution
              </span>
              , a marketing agency built to cover the full picture: social
              media management, website development, Google &amp; Meta ads,
              and design — all under one roof.
            </p>
          </div>

          {/* Facts row */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "24px",
              marginTop: "40px",
              paddingTop: "32px",
              borderTop: "1px solid var(--border)",
            }}
          >
            {FACTS.map(({ label, value }) => (
              <div key={label}>
                <p
                  style={{
                    fontFamily: "var(--font-mono), monospace",
                    fontSize: "10px",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: "var(--grey)",
                    marginBottom: "6px",
                  }}
                >
                  {label}
                </p>
                <p style={{ color: "var(--white-smoke)", fontSize: "15px", fontWeight: 500 }}>
                  {value}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Right — customer-service pull quote */}
        <div className="lg:col-span-5 reveal" style={{ transitionDelay: "0.15s" }}>
          <div
            style={{
              border: "1px solid var(--border)",
              borderRadius: "24px",
              padding: "clamp(32px, 4vw, 48px)",
              background: "rgba(242,242,242,0.02)",
              height: "100%",
            }}
          >
            <span
              aria-hidden="true"
              style={{
                display: "block",
                fontFamily: "var(--font-outfit), sans-serif",
                fontSize: "64px",
                lineHeight: 1,
                color: "var(--lime)",
                marginBottom: "8px",
              }}
            >
              &ldquo;
            </span>
            <p
              style={{
                fontFamily: "var(--font-outfit), sans-serif",
                fontSize: "clamp(24px, 2.4vw, 34px)",
                fontWeight: 600,
                letterSpacing: "-0.02em",
                lineHeight: 1.25,
                color: "var(--white-smoke)",
                marginBottom: "20px",
              }}
            >
              Customer service is always my top priority.
            </p>
            <p style={{ color: "var(--grey)", fontSize: "15px", lineHeight: 1.6 }}>
              Every project runs through that filter first — the work only
              counts if the person on the other end feels it.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
