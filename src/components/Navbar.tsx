"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { InstagramIcon } from "./icons";
import { WHATSAPP_URL } from "@/lib/site";

// Root-relative so these still resolve correctly from pages other than the
// homepage (e.g. /contact) instead of just scrolling the current page.
const NAV_LINKS = [
  { label: "Work",     href: "/#work"    },
  { label: "About Me", href: "/#about"   },
  { label: "Contact",  href: "/#contact" },
];

export default function Navbar() {
  const navRef   = useRef<HTMLElement>(null);
  const chipRef  = useRef<HTMLDivElement>(null);
  const shellRef = useRef<HTMLDivElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobile,   setMobile]   = useState(false);

  useEffect(() => {
    const check = () => setMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      if (navRef.current)  navRef.current.style.opacity  = "1";
      if (chipRef.current) chipRef.current.style.opacity = "1";
    }, 1200);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const fn = () => shellRef.current?.classList.toggle("scrolled", window.scrollY > 40);
    fn();
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  const close = () => setMenuOpen(false);

  return (
    <>
      {/* ── UIverse hamburger CSS ─────────────────────────────────────── */}
      <style>{`
        #nav-checkbox { display: none; }
        .nav-toggle {
          position: relative;
          width: 30px;
          height: 30px;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 7px;
          transition-duration: .3s;
        }
        .nav-bars {
          width: 100%;
          height: 3px;
          background-color: rgb(253, 255, 243);
          border-radius: 5px;
          transition-duration: .3s;
        }
        #nav-checkbox:checked + .nav-toggle #nav-bar2 {
          transform: translateY(10px) rotate(60deg);
          margin-left: 0;
          transform-origin: right;
          transition-duration: .3s;
          z-index: 2;
        }
        #nav-checkbox:checked + .nav-toggle #nav-bar1 {
          transform: translateY(20px) rotate(-60deg);
          transition-duration: .3s;
          transform-origin: left;
          z-index: 1;
        }
        #nav-checkbox:checked + .nav-toggle {
          transform: rotate(-90deg);
        }
      `}</style>

      {/* When the overlay is open, raise the shell above it so the hamburger stays clickable */}
      <div
        ref={shellRef}
        className="navbar-shell"
        style={mobile ? { zIndex: menuOpen ? 1100 : 1000 } : undefined}
      >
        {/* Logo chip — outside mix-blend so it stays true-colour */}
        <div
          ref={chipRef}
          className="navbar-logo-chip"
          style={{ opacity: 0, transition: "opacity 0.6s ease" }}
        >
          <Link href="/" aria-label="Pierre Potgieter — Home" style={{ display: "flex", width: "100%", height: "100%", alignItems: "center", justifyContent: "center" }}>
            <Image
              src="/logo.png"
              alt="Pierre Potgieter"
              width={24}
              height={24}
              style={{ width: "62%", height: "62%", objectFit: "contain" }}
              priority
            />
          </Link>
        </div>

        <nav
          ref={navRef}
          className="navbar"
          style={{
            opacity: 0,
            transition: "opacity 0.6s ease",
            // Disable difference blend on mobile so element colours stay predictable
            mixBlendMode: mobile ? "normal" : "difference",
          }}
        >
          {/* Brand name */}
          <div className="navbar-logo" style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <span className="navbar-logo-spacer" aria-hidden="true" />
            <Link href="/" className="name-hover" style={{ color: "inherit", textDecoration: "none" }}>
              <span className="name-hover-actual">PIERRE POTGIETER</span>
              <span aria-hidden="true" className="name-hover-front">PIERRE POTGIETER</span>
            </Link>
            {!mobile && (
              <span style={{ color: "var(--grey)", fontWeight: 400 }}>
                | Design that Speaks
              </span>
            )}
          </div>

          {/* Desktop nav links */}
          {!mobile && (
            <ul className="navbar-links">
              {NAV_LINKS.map(({ label, href }) => (
                <li key={label}><a href={href}>{label}</a></li>
              ))}
            </ul>
          )}

          {/* Desktop CTA + Instagram */}
          {!mobile && (
            <div className="navbar-actions">
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="navbar-cta"
              >
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
          )}

          {/* Mobile hamburger — lives inside <nav> so flex centres it automatically */}
          {mobile && (
            <>
              <input
                id="nav-checkbox"
                type="checkbox"
                checked={menuOpen}
                onChange={() => setMenuOpen(o => !o)}
              />
              <label className="nav-toggle" htmlFor="nav-checkbox">
                <div id="nav-bar1" className="nav-bars" />
                <div id="nav-bar2" className="nav-bars" />
                <div id="nav-bar3" className="nav-bars" />
              </label>
            </>
          )}
        </nav>
      </div>

      {/* ── Mobile full-screen overlay ───────────────────────────────── */}
      {mobile && (
        <div
          role="dialog"
          aria-modal="true"
          aria-hidden={!menuOpen}
          style={{
            position:      "fixed",
            inset:         0,
            background:    "rgba(10,10,10,0.97)",
            backdropFilter:"blur(20px)",
            WebkitBackdropFilter:"blur(20px)",
            zIndex:        1050,
            display:       "flex",
            flexDirection: "column",
            justifyContent:"space-between",
            padding:       "100px 32px 56px",
            transform:     menuOpen ? "translateX(0)" : "translateX(100%)",
            opacity:       menuOpen ? 1 : 0,
            transition:    "transform 0.4s cubic-bezier(0.16,1,0.3,1), opacity 0.3s ease",
            pointerEvents: menuOpen ? "auto" : "none",
          }}
        >
          {/* Nav links */}
          <nav style={{ display: "flex", flexDirection: "column" }}>
            {NAV_LINKS.map(({ label, href }, i) => (
              <a
                key={label}
                href={href}
                onClick={close}
                style={{
                  fontFamily:    "var(--font-outfit), sans-serif",
                  fontSize:      "clamp(38px, 10vw, 56px)",
                  fontWeight:    700,
                  letterSpacing: "-0.03em",
                  color:         "var(--white-smoke)",
                  textDecoration:"none",
                  lineHeight:    1.2,
                  padding:       "14px 0",
                  borderBottom:  "1px solid rgba(242,242,242,0.08)",
                  display:       "block",
                  transform:     menuOpen ? "translateX(0)"  : "translateX(24px)",
                  opacity:       menuOpen ? 1 : 0,
                  transition:    `transform 0.4s ease ${i * 60}ms, opacity 0.35s ease ${i * 60}ms, color 0.2s ease`,
                }}
                onMouseEnter={e => (e.currentTarget.style.color = "var(--lime)")}
                onMouseLeave={e => (e.currentTarget.style.color = "var(--white-smoke)")}
              >
                {label}
              </a>
            ))}
          </nav>

          {/* Bottom — CTA + Instagram */}
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={close}
              className="navbar-cta"
              style={{ fontSize: 13 }}
            >
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
        </div>
      )}
    </>
  );
}
