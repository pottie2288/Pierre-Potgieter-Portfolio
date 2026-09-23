import Image from "next/image";
import { HERO, SITE } from "@/content/site";

const TOOLTIP_TIP =
  "M103.284 3L121 3C122.657 3 124 1.65685 124 0L0 0C0 1.65685 1.34315 3 3 3L20.7157 3C26.0201 3 31.1071 5.10713 34.8579 8.85786L51.3934 25.3934C57.2513 31.2513 66.7487 31.2513 72.6066 25.3934L89.1421 8.85786C92.8929 5.10714 97.9799 3 103.284 3Z";

// Full-bleed portrait with a parallax drift (image moves down 40% of its height
// while the hero scrolls away), plus the badge row that fades up after the intro.
export default function Hero() {
  return (
    <section data-theme-section="dark" data-logo-scroll-trigger="" className="hero">
      <div
        data-parallax="trigger"
        data-parallax-disable="tablet"
        data-parallax-scroll-start="top top"
        data-parallax-start="0"
        data-parallax-end="40"
        className="hero-bg-wrap"
      >
        <Image
          src={HERO.imageSrc}
          alt={HERO.imageAlt}
          width={2880}
          height={2160}
          sizes="100vw"
          quality={85}
          priority
          draggable={false}
        />
      </div>
      <div className="hero-content-wrap">
        <div data-transition-reveal="" className="partner-wrap">
          <span className="hero-label">{HERO.badges[0]}</span>
          <div className="partner-dot" />
          <span className="hero-label">{HERO.badges[1]}</span>
        </div>
        <div data-transition-reveal="" className="locate-wrap">
          <div className="hero-label txt-align-right">
            {HERO.locationLine} <span className="block-span">{HERO.locationLineTwo}</span>
          </div>
          <a
            aria-label="Say hello on WhatsApp"
            href={SITE.whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="language-switch inline-block"
          >
            <div className="language-switch__tooltip">
              <div className="language-switch__tooltip-inner">
                <span className="language-switch__tooltip-text">{HERO.globeTooltip}</span>
              </div>
              <div className="language-switch__tooltip-tip">
                <svg xmlns="http://www.w3.org/2000/svg" width="100%" viewBox="0 0 124 30" fill="none">
                  <path d={TOOLTIP_TIP} fill="currentColor" />
                </svg>
              </div>
            </div>
            <div className="rotating-globe">
              <div className="globe">
                <div className="globe-wrap">
                  <div className="circle" />
                  <div className="circle" />
                  <div className="circle" />
                  <div className="circle-hor" />
                  <div className="circle-hor-middle" />
                </div>
              </div>
            </div>
          </a>
        </div>
      </div>
    </section>
  );
}
