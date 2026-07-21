"use client";

import { useMemo, useRef } from "react";
import { motion, useInView } from "framer-motion";

// Deterministic pseudo-random duration per path index — avoids calling
// Math.random() during render (impure; React flags this as a purity
// violation) and keeps durations stable across re-renders instead of
// reshuffling every time.
function seededDuration(seed: number): number {
  const fractional = Math.sin(seed * 12.9898) * 43758.5453;
  return 20 + (fractional - Math.floor(fractional)) * 10;
}

export function FloatingPaths({ position }: { position: number }) {
  const containerRef = useRef<HTMLDivElement>(null);
  // Generous margin so the animation doesn't visibly pop in/out right at
  // the viewport edge, while still fully pausing well before/after it's
  // actually visible — this is the main lever for scroll performance:
  // off-screen instances (e.g. the hero's paths once you've scrolled past
  // it) no longer run their per-frame JS animation loop at all.
  const isInView = useInView(containerRef, { margin: "200px" });

  // Cut down from the original 36 paths — with two <FloatingPaths/>
  // instances per section (this one plus a mirrored `position={-1}`), and
  // this component mounted in both the hero and Featured Work, 36 paths
  // meant 144 concurrently JS-animated SVG paths running at all times.
  const paths = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => ({
        id: i,
        d: `M-${380 - i * 5 * position} -${189 + i * 6}C-${
          380 - i * 5 * position
        } -${189 + i * 6} -${312 - i * 5 * position} ${216 - i * 6} ${
          152 - i * 5 * position
        } ${343 - i * 6}C${616 - i * 5 * position} ${470 - i * 6} ${
          684 - i * 5 * position
        } ${875 - i * 6} ${684 - i * 5 * position} ${875 - i * 6}`,
        width: 0.5 + i * 0.03,
        duration: seededDuration(i),
      })),
    [position]
  );

  return (
    <div ref={containerRef} className="absolute inset-0 pointer-events-none">
      <svg
        className="w-full h-full"
        viewBox="0 0 696 316"
        fill="none"
        preserveAspectRatio="xMidYMid slice"
      >
        <title>Background Paths</title>
        {paths.map((path) => (
          <motion.path
            key={path.id}
            d={path.d}
            stroke="white"
            strokeWidth={path.width}
            strokeOpacity={0.04 + path.id * 0.006}
            initial={{ pathLength: 0.3, opacity: 0.6 }}
            animate={
              isInView
                ? {
                    pathLength: 1,
                    opacity: [0.3, 0.6, 0.3],
                    pathOffset: [0, 1, 0],
                  }
                : undefined
            }
            transition={{
              duration: path.duration,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            }}
          />
        ))}
      </svg>
    </div>
  );
}
