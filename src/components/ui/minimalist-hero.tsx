"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { FloatingPaths } from "./background-paths";
import ProfileCard from "@/components/ProfileCard";
import TextType from "@/components/TextType";
import { WHATSAPP_URL } from "@/lib/site";

interface MinimalistHeroProps {
  logoText: string;
  navLinks: { label: string; href: string }[];
  mainText: string;
  readMoreLink: string;
  imageSrc: string;
  imageAlt: string;
  headlineTexts: string[];
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
  headlineTexts,
  className,
}: MinimalistHeroProps) {
  return (
    <div
      className={cn(
        "relative flex h-screen w-full flex-col items-center justify-between overflow-hidden bg-background px-8 pt-8 pb-0 font-sans md:px-12 md:pt-12 md:pb-0",
        className
      )}
    >
      {/* Animated background paths — behind all content */}
      <div className="absolute inset-0 z-0">
        <FloatingPaths position={1} />
        <FloatingPaths position={-1} />
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
          <TextType
            as="h1"
            text={headlineTexts}
            className="font-extrabold text-foreground"
            style={{
              fontSize: "clamp(2rem, 3.5vw, 4.5rem)",
              lineHeight: 1.08,
              letterSpacing: "-0.02em",
              textShadow: "0 2px 24px rgba(0,0,0,0.55)",
            }}
            typingSpeed={65}
            deletingSpeed={35}
            pauseDuration={1800}
            initialDelay={1200}
            loop
            showCursor
            cursorCharacter="|"
            cursorClassName="text-lime"
          />
        </motion.div>

        <motion.div
          className="relative order-2 z-10 flex h-full items-center justify-center"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.4 }}
        >
          <ProfileCard
            avatarUrl={imageSrc}
            miniAvatarUrl={imageSrc}
            iconUrl="/profile-card-pattern.svg"
            name="Pierre Potgieter"
            title="Brand Identity & Web Designer"
            handle="pierre_potgieter1"
            status="Available for work"
            contactText="Let's Talk"
            showUserInfo
            enableTilt
            enableMobileTilt={false}
            behindGlowEnabled
            behindGlowColor="rgba(207, 255, 106, 0.45)"
            innerGradient="linear-gradient(145deg,#1a1a1a8c 0%,#cfff6a33 100%)"
            onContactClick={() => {
              window.open(WHATSAPP_URL, "_blank", "noopener,noreferrer");
            }}
          />
        </motion.div>

        {/* right column intentionally empty — desktop only. On mobile this
            would become its own stretched grid row and eat vertical space
            as a blank gap, pushing the portrait away from the bottom. */}
        <div className="order-3 hidden md:block" />
      </div>
    </div>
  );
}
