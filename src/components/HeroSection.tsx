"use client";

import { MinimalistHero } from "./ui/minimalist-hero";

export default function HeroSection() {
  return (
    <MinimalistHero
      logoText=""
      navLinks={[]}
      mainText="I build brand identities for companies that care how things feel and how they are perceived over time."
      readMoreLink="#work"
      imageSrc="/portrait.png"
      imageAlt="Portrait of Pierre Potgieter"
      headlineTexts={["Welcome to my website", "if you're reading this", "I want you to know...", "that god loves you"]}
    />
  );
}
