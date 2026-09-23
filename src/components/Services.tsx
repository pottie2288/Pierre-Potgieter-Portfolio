import Image from "next/image";
import { SERVICES } from "@/content/site";

// Desktop: pinned for (n × viewport) of scroll. Each step collapses the current
// service's visual, slides its image out to the right while the next image
// wipes in, and nudges the list up (lib/animations/services.ts).
// Tablet: visuals collapse/expand in place. Mobile: a plain stacked list.
export default function Services() {
  return (
    <section data-theme-section="light" data-services="" className="services">
      <div className="services-wrapper">
        <div className="services-sticky">
          <div data-services-list="" className="services-list">
            {SERVICES.map((service) => (
              <div key={service.number} data-services-item="" className="service-item">
                <div data-services-row="" className="service-row">
                  <div className="service-number">{service.number}</div>
                  <h3 className="service-title">{service.title}</h3>
                </div>
                <div data-services-visual="" className="service-visual">
                  <div className="service-description">
                    <p>{service.description}</p>
                  </div>
                  <div data-services-image-wrap="" className="service-image-wrap">
                    <Image
                      className="service-image"
                      src={service.image}
                      alt={service.imageAlt}
                      width={2400}
                      height={1350}
                      sizes="(max-width: 991px) 100vw, 71vw"
                      quality={85}
                      draggable={false}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
