"use client";

import { useEffect, useRef } from "react";

interface ValueCol {
  icon: string;
  title: string;
  desc: string;
}

const valueCols: ValueCol[] = [
  {
    icon: "✦",
    title: "Stand out & earn trust",
    desc: "A distinctive identity sets you apart from competitors and builds immediate credibility with your audience.",
  },
  {
    icon: "⏱",
    title: "Brand identity in just 14 days",
    desc: "My sprint process delivers a complete brand system fast — without cutting corners.",
  },
  {
    icon: "↗",
    title: "Launch faster & save capital",
    desc: "Stop burning budget on slow, drawn-out processes. Move fast, validate early, iterate with confidence.",
  },
];

export default function ValuePropSection() {
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const colsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const elements = [headlineRef.current, colsRef.current].filter(
      Boolean
    ) as Element[];

    const observers: IntersectionObserver[] = elements.map((el) => {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("visible");
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.15 }
      );

      observer.observe(el);
      return observer;
    });

    return () => {
      observers.forEach((obs) => obs.disconnect());
    };
  }, []);

  return (
    <section className="value-section">
      <h2 ref={headlineRef} className="value-headline reveal">
        In <span className="value-highlight">14 days</span>, I shape a
        complete brand identity that moves with confidence.
      </h2>
      <div ref={colsRef} className="value-cols reveal">
        {valueCols.map((col) => (
          <div key={col.title} className="value-col">
            <span className="value-col-icon">{col.icon}</span>
            <h3 className="value-col-title">{col.title}</h3>
            <p className="value-col-desc">{col.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
