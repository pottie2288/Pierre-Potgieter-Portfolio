// Pill button with a scribbled hover fill. The markup mirrors the reference:
// an SVG mask (scribble path) reveals a hover-coloured copy of the label while a
// second copy of the scribble paints the hover background. GSAP draws both paths
// on pointerenter (see lib/animations/button007.ts). Mask ids are static so the
// hover label stays hidden before any JS runs.

const SCRIBBLE =
  "M16.332 39.1765C25.6381 35.2853 34.9441 31.3941 40.6554 29.173C50.662 25.2814 21.2379 53.1954 17.526 58.4408C14.8321 62.2478 16.2337 62.0854 17.6851 61.7242C19.1364 61.363 20.5951 60.8079 30.413 55.6381C40.231 50.4684 58.3639 40.7009 68.2847 35.2711C78.2055 29.8412 79.3646 29.0451 79.7292 28.7446C80.0938 28.4441 79.6289 28.6635 73.9175 35.9463C68.2062 43.2292 57.2628 57.5688 51.5744 65.2375C45.886 72.9063 45.7844 73.4697 46.1047 73.6339C46.6385 73.9077 67.9122 61.8313 68.2066 61.6541C82.3093 53.1624 107.339 37.7974 121.861 29.1143C136.382 20.4312 139.637 18.8959 142.043 17.8274C142.799 17.4917 148.024 14.9173 147.361 16.5225C147.121 17.1044 146.542 18.1091 138.743 26.8865C130.945 35.6639 93.8491 65.9527 86.0769 74.6334C78.305 83.3141 78.216 83.6554 78.3741 83.9179C78.5321 84.1803 78.94 84.3537 93.1516 75.4023C107.363 66.451 157.462 34.6003 162.031 35.1974C166.6 35.7944 144.497 73.6977 144.599 78.2813C144.701 82.8649 173.88 53.6113 184.999 47.6105";

export type ButtonVariant = "ink-black" | "dark-blue" | "light-silver";

interface Button007Props {
  /** Unique, stable id used for the SVG mask. */
  id: string;
  label: string;
  href: string;
  variant?: ButtonVariant;
  external?: boolean;
}

export default function Button007({ id, label, href, variant = "ink-black", external = false }: Button007Props) {
  const maskId = `button-007-mask-${id}`;
  return (
    <a
      className="button-007"
      href={href}
      data-button-007=""
      data-button-variant={variant}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      <span className="button-007__inner">
        <span className="button-007__text is--hover" aria-hidden="true">
          <svg aria-hidden="true" className="button-007__svg">
            <mask id={maskId} maskUnits="userSpaceOnUse" style={{ maskType: "alpha" }} data-button-007-mask="">
              <svg
                aria-hidden="true"
                data-button-007-svg=""
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 201 100"
                preserveAspectRatio="none"
              >
                <path d={SCRIBBLE} stroke="currentColor" strokeWidth="0" strokeLinecap="round" />
              </svg>
            </mask>
            <foreignObject
              width="100%"
              height="100%"
              mask={`url(#${maskId})`}
              data-button-007-mask-object=""
              className="button-007__svg-object"
            >
              <div className="button-007__svg-inner">
                <div className="button-007__svg-text-wrap">
                  <span className="button-007__svg-text">{label}</span>
                </div>
              </div>
            </foreignObject>
          </svg>
        </span>
        <svg
          aria-hidden="true"
          data-button-007-svg=""
          xmlns="http://www.w3.org/2000/svg"
          width="100%"
          height="100%"
          fill="none"
          viewBox="0 0 201 100"
          preserveAspectRatio="none"
          className="button-007__svg-overlay"
        >
          <path d={SCRIBBLE} stroke="currentColor" strokeWidth="0" strokeLinecap="round" />
        </svg>
        <span className="button-007__text is--default">{label}</span>
      </span>
      <span className="button-007__bg" />
    </a>
  );
}
