import Button007 from "./Button007";
import { LOGO_WORDMARK } from "@/content/vectors";
import { SITE } from "@/content/site";

// Fixed header. The wordmark starts full-width across the hero and shrinks into
// the nav as the hero scrolls away (lib/animations/logoScroll.ts); after that it
// doubles as a back-to-top button.
export default function Header() {
  return (
    <>
      <header data-nav-bar-height="" className="header">
        <div className="navbar_wrapper">
          <div className="brand_wrapper">
            <button data-logo-scroll="" className="brand" type="button">
              <span className="visually-hidden">{SITE.name}</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="100%" viewBox={LOGO_WORDMARK.viewBox} fill="none" aria-hidden="true">
                {LOGO_WORDMARK.paths.map((d) => (
                  <path key={d} d={d} fill="currentColor" />
                ))}
              </svg>
            </button>
          </div>
          <div className="nav-button">
            <Button007 id="nav-email" label="Email me" href={SITE.emailHref} variant="ink-black" />
            <Button007 id="nav-quote" label="Get a quote" href={SITE.whatsappHref} variant="dark-blue" external />
          </div>
        </div>
      </header>
      <div className="progressive-blur" aria-hidden="true">
        <div className="progressive-blur__layer is--1" />
        <div className="progressive-blur__layer is--2" />
        <div className="progressive-blur__layer is--3" />
        <div className="progressive-blur__layer is--4" />
        <div className="progressive-blur__layer is--5" />
      </div>
    </>
  );
}
