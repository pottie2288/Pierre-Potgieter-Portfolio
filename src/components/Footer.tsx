import Link from "next/link";
import Logo from "./Logo";

export default function Footer() {
  return (
    <>
      <div>
        <footer className="footer">
          {/* Col 1 — Brand */}
          <div>
            <p
              className="footer-brand"
              style={{ display: "flex", alignItems: "center", gap: 10 }}
            >
              <Logo size={24} />
              PIERRE POTGIETER
            </p>
            <p className="footer-tagline">
              Independent brand identity and web designer — building
              distinctive digital experiences for brands across South Africa
              and beyond.
            </p>
          </div>

          {/* Col 2 — Work */}
          <div>
            <p className="footer-col-title">Work/</p>
            <ul className="footer-links">
              <li><Link href="/#work">Featured Work</Link></li>
            </ul>
          </div>

          {/* Col 3 — About */}
          <div>
            <p className="footer-col-title">About/</p>
            <ul className="footer-links">
              <li><Link href="/#about">About Me</Link></li>
              <li><Link href="/contact">Contact</Link></li>
            </ul>
          </div>

          {/* Col 4 — Socials */}
          <div>
            <p className="footer-col-title">Socials/</p>
            <ul className="footer-links">
              <li>
                <a href="https://www.instagram.com/pierre_potgieter1" target="_blank" rel="noopener noreferrer">
                  Instagram
                </a>
              </li>
            </ul>
          </div>
        </footer>
      </div>

      <div className="footer-bottom">
        <p className="footer-copy">
          &copy; {new Date().getFullYear()} Pierre Potgieter. All rights reserved.
        </p>
        <p className="footer-copy">Privacy Policy &middot; Terms</p>
      </div>
    </>
  );
}
