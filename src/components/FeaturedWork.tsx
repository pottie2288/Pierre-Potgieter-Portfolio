"use client";

import { useEffect, useRef } from "react";
import AnimatedCardStack, { type StackProject } from "./ui/animate-card-animation";
import { FloatingPaths } from "./ui/background-paths";

const projects: StackProject[] = [
  {
    id: "kingcars",
    title: "King Cars",
    tagline: "Automotive · Inventory System",
    image: "/work/kingcars-v2.png",
    href: "https://www.kingcars.co.za",
  },
  {
    id: "dongfeng",
    title: "Dongfeng South Africa",
    tagline: "Automotive · EV Brand",
    image: "/work/dongfeng-v2.png",
    href: "https://www.dongfengmotors.co.za",
  },
  {
    id: "jsm",
    title: "JSM Business Services",
    tagline: "Recruitment · Live Data",
    image: "/work/jsm-v2.png",
    href: "https://jsm-website.vercel.app",
  },
  {
    id: "brooks",
    title: "Brooks Hard Seltzer",
    tagline: "Branding · Packaging",
    image: "/work/brooks-v2.png",
    href: "https://brooks-website.vercel.app",
  },
  {
    id: "nawtywater",
    title: "Nawty Water",
    tagline: "Branding · Beverage",
    image: "/work/nawtywater.png",
    href: "https://nawtywater.vercel.app",
  },
  {
    id: "praat",
    title: "Praat",
    tagline: "Web App",
    image: "/work/praat-v2.png",
    href: "#",
  },
  {
    id: "angusbot",
    title: "Angus Bot",
    tagline: "AI · Automation",
    image: "/work/angusbot-v2.png",
    href: "#",
  },
];

export default function FeaturedWork() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const reveals = section.querySelectorAll<HTMLElement>(".reveal");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    reveals.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <section id="work" className="section relative overflow-hidden" ref={sectionRef}>
      {/* Animated background paths */}
      <div className="pointer-events-none absolute inset-0" style={{ zIndex: 0 }}>
        <FloatingPaths position={1} />
        <FloatingPaths position={-1} />
      </div>

      <h2 className="section-heading" style={{ position: "relative", zIndex: 1 }}>
        My Projects
      </h2>

      <div style={{ position: "relative", zIndex: 1 }}>
        <AnimatedCardStack projects={projects} />
      </div>
    </section>
  );
}
