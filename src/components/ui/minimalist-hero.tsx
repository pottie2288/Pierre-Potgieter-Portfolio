"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import Ballpit from "@/components/Ballpit";

interface MinimalistHeroProps {
  logoText: string;
  navLinks: { label: string; href: string }[];
  mainText: string;
  readMoreLink: string;
  imageSrc: string;
  imageAlt: string;
  overlayText: {
    part1: string;
    part2: string;
  };
  className?: string;
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      className="text-sm font-medium tracking-widest text-foreground/60 transition-colors hover:text-foreground"
    >
      {children}
    </a>
  );
}

export function MinimalistHero({
  logoText,
  navLinks,
  mainText,
  readMoreLink,
  imageSrc,
  imageAlt,
  overlayText,
  className,
}: MinimalistHeroProps) {
  return (
    <div
      className={cn(
        "relative flex h-screen w-full flex-col items-center justify-between overflow-hidden bg-background px-8 pt-8 pb-0 font-sans md:px-12 md:pt-12 md:pb-0",
        className
      )}
    >
      {/* Physics ball-pit background — behind all content */}
      <div className="absolute inset-0 z-0">
        <Ballpit
          count={60}
          gravity={0.75}
          friction={0.995}
          wallBounce={0.95}
          maxVelocity={0.4}
          minSize={0.4}
          maxSize={0.9}
          colors={[0xffffff, 0xa9a9a9, 0xb8fa3d]}
          materialParams={{ metalness: 0.3, roughness: 0.4, clearcoat: 0.5, clearcoatRoughness: 0.2 }}
        />
      </div>

      {/* Hero has its own header only when logoText / navLinks are provided.
          This portfolio passes both as empty, so we skip it entirely. */}
      {(logoText || navLinks.length > 0) && (
        <header className="z-30 flex w-full max-w-7xl items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="text-xl font-bold tracking-wider"
          >
            {logoText}
          </motion.div>
          <div className="hidden items-center space-x-8 md:flex">
            {navLinks.map((link) => (
              <NavLink key={link.label} href={link.href}>
                {link.label}
              </NavLink>
            ))}
          </div>
        </header>
      )}

      <div className="relative grid w-full max-w-7xl flex-grow grid-cols-1 items-center md:grid-cols-3">
        {/* left column on desktop, top row on mobile — text anchored to the
            bottom of its cell */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.2 }}
          className="z-20 order-1 flex justify-center self-end pb-12 md:justify-start"
        >
          <h1
            className="font-extrabold text-foreground"
            style={{
              fontSize: "clamp(2rem, 3.5vw, 4.5rem)",
              lineHeight: 1.08,
              letterSpacing: "-0.02em",
              textShadow: "0 2px 24px rgba(0,0,0,0.55)",
            }}
          >
            {overlayText.part1}
            <br />
            {overlayText.part2}
          </h1>
        </motion.div>

        <div className="relative order-2 flex h-full items-end justify-center md:items-center">
          <motion.img
            src={imageSrc}
            alt={imageAlt}
            className="relative z-10 w-72 scale-150 object-cover md:w-80 lg:w-[24rem]"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.4 }}
          />
        </div>

        {/* right column intentionally empty — desktop only. On mobile this
            would become its own stretched grid row and eat vertical space
            as a blank gap, pushing the portrait away from the bottom. */}
        <div className="order-3 hidden md:block" />
      </div>
    </div>
  );
}
