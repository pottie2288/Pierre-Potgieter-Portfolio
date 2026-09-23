import { FOOTER_WORDMARK } from "@/content/vectors";
import { NAV_LINKS, SITE } from "@/content/site";

// Footer slides up from behind the contact section (parallax, footer.ts).
export default function Footer() {
  return (
    <div data-theme-section="light" data-footer="" className="footer-wrap">
      <footer data-footer-inner="" className="footer">
        <div className="footer-top">
          <div className="footer-bracket" />
          <div className="footer-bracket is--2" />
          <div className="footer-content-w">
            <div className="footer__col">
              <p className="footer__links-label">[ Socials ]</p>
              <ul className="footer__links-list">
                <li>
                  <a data-underline-link="" href={SITE.instagramHref} target="_blank" rel="noopener noreferrer" className="footer__links-txt">
                    Instagram
                  </a>
                </li>
                <li>
                  <a data-underline-link="" href={SITE.whatsappHref} target="_blank" rel="noopener noreferrer" className="footer__links-txt">
                    WhatsApp
                  </a>
                </li>
              </ul>
            </div>
            <div className="footer__col">
              <p className="footer__links-label">[ Nav ]</p>
              <ul className="footer__links-list">
                {NAV_LINKS.map((link) => (
                  <li key={link.target}>
                    <a href={link.target} data-anchor-target={link.target}>
                      <span data-underline-link="" className="footer__links-txt">
                        {link.label}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div className="footer__col">
              <p className="footer__links-label">[ Contact ]</p>
              <ul className="footer__links-list">
                <li>
                  <a data-underline-link="" href={SITE.emailHref} className="footer__links-txt">
                    {SITE.email}
                  </a>
                </li>
                <li>
                  <a data-underline-link="" href={SITE.whatsappHref} target="_blank" rel="noopener noreferrer" className="footer__links-txt">
                    {SITE.phoneDisplay}
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="footer-wordmark txt-color-astronaut">
            <svg xmlns="http://www.w3.org/2000/svg" width="100%" viewBox={FOOTER_WORDMARK.viewBox} fill="none" aria-hidden="true">
              {FOOTER_WORDMARK.paths.map((d) => (
                <path key={d} d={d} fill="currentColor" />
              ))}
            </svg>
          </div>
        </div>
        <div className="footer-copy">
          <div className="footer-copy__left">
            <p className="footer-copy__label">{SITE.tagline}</p>
            <p className="footer-copy__label">
              © <span data-current-year="">{new Date().getFullYear()}</span>, {SITE.name}
            </p>
          </div>
          <p className="footer-copy__label">{SITE.location}</p>
        </div>
      </footer>
    </div>
  );
}
