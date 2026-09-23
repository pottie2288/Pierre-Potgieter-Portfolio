import BracketHeading from "./BracketHeading";
import Button007 from "./Button007";
import { ABOUT, SITE } from "@/content/site";

export default function About() {
  return (
    <section id="about" data-theme-section="dark" className="about">
      <div className="about-header-wrap">
        <h1 data-split-rolling="" className="about-header__h">
          {ABOUT.heading}
        </h1>
        <p data-split-lines="" className="about-header__p">
          {ABOUT.intro}
        </p>
      </div>
      <div className="about-content-wrap">
        <BracketHeading>About me</BracketHeading>
        {ABOUT.paragraphs.map((text) => (
          <p key={text} data-split-lines="">
            {text}
          </p>
        ))}
        <Button007 id="about-quote" label="Get a quote" href={SITE.whatsappHref} variant="dark-blue" external />
      </div>
    </section>
  );
}
