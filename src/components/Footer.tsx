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
              <li><a href="#work">Featured Work</a></li>
              <li><a href="#journal">Journal</a></li>
            </ul>
          </div>

          {/* Col 3 — About */}
          <div>
            <p className="footer-col-title">About/</p>
            <ul className="footer-links">
              <li><a href="#about">About</a></li>
              <li><a href="#contact">Contact</a></li>
            </ul>
          </div>

          {/* Col 4 — Socials */}
          <div>
            <p className="footer-col-title">Socials/</p>
            <ul className="footer-links">
              <li><a href="#">X (Twitter)</a></li>
              <li><a href="#">LinkedIn</a></li>
              <li><a href="#">YouTube</a></li>
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
