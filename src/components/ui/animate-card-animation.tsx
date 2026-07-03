"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

export interface StackProject {
  id: string;
  title: string;
  tagline: string;
  image: string;
  href: string;
}

interface StackCard {
  id: number;
  projectIndex: number;
}

const CARD_SIZE =
  "h-[340px] w-[92vw] max-w-[420px] sm:h-[380px] sm:w-[560px] sm:max-w-none md:h-[420px] md:w-[680px] lg:h-[460px] lg:w-[780px] xl:h-[500px] xl:w-[860px]";

const positionStyles = [
  { scale: 1, y: 18 },
  { scale: 0.95, y: -26 },
  { scale: 0.9, y: -60 },
];

const exitAnimation = {
  y: 600,
  scale: 1,
  zIndex: 10,
};

const enterAnimation = {
  y: -26,
  scale: 0.9,
};

function CardContent({ project }: { project: StackProject }) {
  return (
    <a
      href={project.href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`View the live ${project.title} site`}
      className="flex h-full w-full flex-col gap-2.5"
    >
      <div className="-outline-offset-1 relative min-h-0 flex-[7] overflow-hidden rounded-xl outline outline-white/10">
        <Image
          src={project.image}
          alt={project.title}
          fill
          sizes="(max-width: 640px) 92vw, 860px"
          className="select-none object-cover"
        />
      </div>
      <div className="flex min-h-0 flex-[1.4] w-full flex-col justify-start gap-0.5 px-4">
        <span className="truncate text-lg font-semibold tracking-tight text-foreground">
          {project.title}
        </span>
        <span className="truncate text-sm text-muted-foreground">{project.tagline}</span>
      </div>
    </a>
  );
}

function AnimatedCard({
  card,
  index,
  isAnimating,
  projects,
}: {
  card: StackCard;
  index: number;
  isAnimating: boolean;
  projects: StackProject[];
}) {
  const { scale, y } = positionStyles[index] ?? positionStyles[2];
  const zIndex = index === 0 && isAnimating ? 10 : 3 - index;

  const exitAnim = index === 0 ? exitAnimation : undefined;
  const initialAnim = index === 2 ? enterAnimation : undefined;

  return (
    <motion.div
      key={card.id}
      initial={initialAnim}
      animate={{ y, scale }}
      exit={exitAnim}
      transition={{
        type: "spring",
        duration: 1,
        bounce: 0,
      }}
      style={{
        zIndex,
        left: "50%",
        x: "-50%",
        bottom: 0,
      }}
      className={`absolute flex items-center justify-center overflow-hidden rounded-t-xl border-x border-t border-border bg-card p-1.5 shadow-lg will-change-transform ${CARD_SIZE}`}
    >
      <CardContent project={projects[card.projectIndex]} />
    </motion.div>
  );
}

export default function AnimatedCardStack({ projects }: { projects: StackProject[] }) {
  const initialCards: StackCard[] = projects
    .slice(0, 3)
    .map((_, i) => ({ id: i + 1, projectIndex: i }));

  const [cards, setCards] = useState(initialCards);
  const [isAnimating, setIsAnimating] = useState(false);
  const [nextId, setNextId] = useState(initialCards.length + 1);

  const handleAnimate = () => {
    setIsAnimating(true);

    const nextProjectIndex = (cards[2].projectIndex + 1) % projects.length;

    setCards([...cards.slice(1), { id: nextId, projectIndex: nextProjectIndex }]);
    setNextId((prev) => prev + 1);
    setIsAnimating(false);
  };

  return (
    <div className="flex w-full flex-col items-center justify-center pt-6">
      <div className="relative h-[400px] w-[92vw] max-w-[420px] overflow-hidden sm:h-[440px] sm:w-[560px] sm:max-w-none md:h-[480px] md:w-[680px] lg:h-[520px] lg:w-[780px] xl:h-[560px] xl:w-[860px]">
        <AnimatePresence initial={false}>
          {cards.slice(0, 3).map((card, index) => (
            <AnimatedCard
              key={card.id}
              card={card}
              index={index}
              isAnimating={isAnimating}
              projects={projects}
            />
          ))}
        </AnimatePresence>
      </div>

      <div className="relative z-10 -mt-px flex w-full items-center justify-center border-t border-border pb-8 pt-16">
        <button
          onClick={handleAnimate}
          className="group inline-flex h-14 min-w-[260px] cursor-pointer select-none items-center justify-center gap-3 whitespace-nowrap rounded-full border border-border bg-white/[0.04] px-16 font-mono text-sm uppercase tracking-[0.1em] text-foreground transition-all duration-200 hover:border-lime hover:bg-lime hover:text-background active:scale-[0.97]"
        >
          Next project
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.25"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-transform duration-500 ease-out group-hover:rotate-180"
          >
            <path d="M21 12a9 9 0 11-3-6.7M21 4v5h-5" />
          </svg>
        </button>
      </div>
    </div>
  );
}
