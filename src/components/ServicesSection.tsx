"use client";

import { useEffect, useRef } from "react";
import Logo from "./Logo";

interface Service {
  num: string;
  name: string;
  desc: string;
}

const services: Service[] = [
  {
    num: "01",
    name: "Brand Strategy & Identity",
    desc: "I define who you are, how you sound, and how you look — then build the system to express it consistently.",
  },
  {
    num: "02",
    name: "Web Design & Development",
    desc: "Fast, conversion-focused websites — from dealership inventory systems to recruitment platforms with live job feeds.",
  },
  {
    num: "03",
    name: "Product UX/UI Design",
    desc: "Clean, intuitive interfaces for service and e-commerce-style sites — inventory browsing, job boards, and brand storefronts.",
  },
  {
    num: "04",
    name: "Motion Design & Content",
    desc: "Animated logos, brand films, social content, and motion systems that bring your identity to life.",
  },
];

export default function ServicesSection() {
  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    rowRefs.current.forEach((el) => {
      if (!el) return;

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
      observers.push(observer);
    });

    return () => {
      observers.forEach((obs) => obs.disconnect());
    };
  }, []);

  return (
    <section id="about" className="section">
      <p className="section-label" style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Logo size={13} color="var(--grey)" />
        What I do
      </p>
      <h2
        style={{
          fontFamily: "var(--font-outfit)",
          fontSize: "clamp(32px, 5vw, 80px)",
          fontWeight: 700,
          letterSpacing: "-0.03em",
          marginBottom: "48px",
        }}
      >
        My capabilities
      </h2>
      <div className="services-list">
        {services.map((service, i) => (
          <div
            key={service.num}
            ref={(el) => {
              rowRefs.current[i] = el;
            }}
            className="service-row reveal"
            style={{ transitionDelay: `${i * 100}ms` }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLDivElement).style.backgroundColor =
                "rgba(242,242,242,0.03)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLDivElement).style.backgroundColor = "";
            }}
          >
            <span className="service-num">{service.num}</span>
            <span className="service-name">{service.name}</span>
            <span className="service-desc">{service.desc}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
