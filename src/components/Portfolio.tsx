import Image from "next/image";
import BracketHeading from "./BracketHeading";
import Button007 from "./Button007";
import { PORTFOLIO_HEADER, PROJECTS, SITE } from "@/content/site";

const ARROW = "M6.28871 12L7.53907 10.9111L3.48697 6.77778H16.5V5.22222H3.48697L7.53907 1.08889L6.28871 0L0.5 6L6.28871 12Z";

function NavButton({ direction }: { direction: "prev" | "next" }) {
  return (
    <button
      type="button"
      aria-label={direction === "prev" ? "previous project" : "next project"}
      data-portfolio-button={direction}
      className="portfolio-orbit__btn"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="100%"
        viewBox="0 0 17 12"
        fill="none"
        className={`portfolio-orbit__btn-arrow${direction === "next" ? " next" : ""}`}
      >
        <path d={ARROW} fill="currentColor" />
      </svg>
      <div className="portfolio-orbit__btn-overlay">
        <div className="portfolio-orbit__btn-overlay-corner" />
        <div className="portfolio-orbit__btn-overlay-corner top-right" />
        <div className="portfolio-orbit__btn-overlay-corner bottom-left" />
        <div className="portfolio-orbit__btn-overlay-corner bottom-right" />
      </div>
    </button>
  );
}

// Orbit carousel: cards sit on a slowly rotating axis, scaled and blurred by
// depth; prev/next (or arrow keys) spin the orbit and swap the project copy
// with a masked line reveal (lib/animations/portfolioOrbit.ts).
export default function Portfolio() {
  const total = String(PROJECTS.length).padStart(2, "0");
  return (
    <section id="portfolio" data-theme-section="dark" className="portfolio">
      <div className="portfolio-header-w">
        <BracketHeading>Portfolio</BracketHeading>
        <p data-split-rolling="" className="portfolio-header__p">
          {PORTFOLIO_HEADER.line}
          <br />
          {PORTFOLIO_HEADER.lineTwo}
        </p>
      </div>
      <div data-portfolio-orbit-init="" className="portfolio-orbit">
        <div className="portfolio-orbit__content">
          <div className="portfolio-orbit__info">
            <div className="portfolio-orbit__count">
              <div className="portfolio-orbit__count-col">
                <p data-portfolio-count="current" className="portfolio-orbit__count-txt">
                  01
                </p>
              </div>
              <div className="portfolio-orbit__count-divider" />
              <div className="portfolio-orbit__count-col">
                <p data-portfolio-count="total" className="portfolio-orbit__count-txt">
                  {total}
                </p>
              </div>
            </div>
            <div className="portfolio-orbit__info-bottom">
              <div className="portfolio-orbit__description">
                {PROJECTS.map((project) => (
                  <div key={project.id} data-portfolio-content="" className="portfolio-orbit__content-item">
                    <h3 data-portfolio-content-reveal="">{project.title}</h3>
                    <p data-portfolio-content-reveal="">{project.description}</p>
                  </div>
                ))}
              </div>
              <div className="portfolio-orbit__overlay-nav">
                <NavButton direction="prev" />
                <NavButton direction="next" />
              </div>
            </div>
          </div>
          <div data-orbit-tiles-collection="" className="portfolio-orbit__collection">
            <div data-orbit-tiles-list="" className="portfolio-orbit__list">
              {PROJECTS.map((project) => (
                <div key={project.id} data-orbit-tiles-item="" className="portfolio-orbit__item">
                  <a
                    aria-label={project.title}
                    data-orbit-card=""
                    {...(project.href ? { href: project.href, target: "_blank", rel: "noopener noreferrer" } : {})}
                    className="portfolio-orbit__card inline-block"
                  >
                    <div data-orbit-tiles-mask="" className="portfolio-orbit__image-mask">
                      <Image
                        className="portfolio-orbit__placeholder"
                        src={project.image}
                        alt={`${project.title} website`}
                        width={2400}
                        height={1506}
                        sizes="(max-width: 767px) 70vw, 32vw"
                        quality={85}
                        draggable={false}
                      />
                    </div>
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="portfolio-cta">
        <Button007 id="portfolio-quote" label="Get a quote" href={SITE.whatsappHref} variant="ink-black" external />
      </div>
    </section>
  );
}
