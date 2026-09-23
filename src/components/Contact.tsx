import Button007 from "./Button007";
import { CONTACT, SITE } from "@/content/site";

// 250vh section with a sticky viewport. The content blurs/scales in, then
// "CONTACT" in many languages flies past the camera in 3D as you scroll
// (lib/animations/contact.ts populates [data-contact-words]).
export default function Contact() {
  return (
    <section id="contact" data-theme-section="light" data-contact="" className="contact">
      <div data-contact-sticky="" className="contact-sticky">
        <div aria-hidden="true" data-contact-words="" className="contact-words" />
        <div data-contact-content="" className="contact-content">
          <h2 className="contact-heading">{CONTACT.heading}</h2>
          <p className="contact-text">{CONTACT.body}</p>
          <div className="button-group">
            <Button007 id="contact-email" label="Email me" href={SITE.emailHref} variant="light-silver" />
            <Button007 id="contact-quote" label="Get a quote" href={SITE.whatsappHref} variant="dark-blue" external />
          </div>
        </div>
      </div>
    </section>
  );
}
