"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { InstagramIcon } from "./icons";

const NAV_LINKS: { label: string; href: string }[] = [
  { label: "Work", href: "#work" },
  { label: "About", href: "#about" },
  { label: "Journal", href: "#journal" },
  { label: "Contact", href: "#contact" },
];

export default function Navbar() {
  const navRef = useRef<HTMLElement>(null);
  const chipRef = useRef<HTMLDivElement>(null);
  const shellRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (navRef.current) {
        navRef.current.style.opacity = "1";
      }
      if (chipRef.current) {
        chipRef.current.style.opacity = "1";
      }
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const onScroll = () => {
      shellRef.current?.classList.toggle("scrolled", window.scrollY > 40);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div ref={shellRef} className="navbar-shell">
      {/* True-color logo mark, kept outside the difference blend so it never inverts */}
      <div
        ref={chipRef}
        className="navbar-logo-chip"
        style={{ opacity: 0, transition: "opacity 0.6s ease" }}
      >
        <Image src="/logo.png" alt="Pierre Potgieter" width={24} height={24} style={{ width: "62%", height: "62%", objectFit: "contain" }} priority />
      </div>

      <nav
        ref={navRef}
        className="navbar"
        style={{
          opacity: 0,
          transition: "opacity 0.6s ease",
        }}
      >
        {/* Logo */}
        <div
          className="navbar-logo"
          style={{ display: "flex", alignItems: "center", gap: 14 }}
        >
          <span className="navbar-logo-spacer" aria-hidden="true" />
          <span className="name-hover">
            <span className="name-hover-actual">PIERRE POTGIETER</span>
            <span aria-hidden="true" className="name-hover-front">PIERRE POTGIETER</span>
          </span>{" "}
          <span style={{ color: "var(--grey)", fontWeight: 400 }}>
            | Design that Speaks
          </span>
        </div>

        {/* Center nav links — hidden on mobile */}
        <ul
          className="navbar-links"
        >
          {NAV_LINKS.map(({ label, href }) => (
            <li key={label}>
              <a href={href}>{label}</a>
            </li>
          ))}
        </ul>

        {/* CTA + Instagram */}
        <div className="navbar-actions">
          <a href="#contact" className="navbar-cta">
            Let&apos;s Talk
          </a>
          <a
            href="https://www.instagram.com/pierre_potgieter1"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className="navbar-instagram"
          >
            <InstagramIcon className="navbar-instagram-icon" />
          </a>
        </div>

        <style>{`
          @media (max-width: 767px) {
            .navbar-links { display: none !important; }
          }
        `}</style>
      </nav>
    </div>
  );
}
