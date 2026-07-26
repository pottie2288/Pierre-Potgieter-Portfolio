"use client";

import { useEffect, useRef, useState } from "react";

interface BackgroundMusicProps {
  src: string;
  volume?: number;
}

/**
 * Starts looping background music on the visitor's first click/keydown/touch
 * (browsers block unmuted autoplay before any interaction), and exposes a
 * floating toggle to mute/unmute or restart it afterwards.
 */
export default function BackgroundMusic({ src, volume = 0.35 }: BackgroundMusicProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = volume;

    const startOnInteraction = () => {
      audio
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    };

    const events: Array<keyof WindowEventMap> = ["click", "keydown", "touchstart"];
    events.forEach((event) => window.addEventListener(event, startOnInteraction, { once: true }));

    return () => {
      events.forEach((event) => window.removeEventListener(event, startOnInteraction));
    };
  }, [volume]);

  const toggleMusic = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    }
  };

  return (
    <>
      {/* preload="none": the track is 8 MB and never plays until the visitor's
          first interaction, so eagerly fetching and decoding it on load only
          competed for bandwidth and main-thread time with the rest of the page
          (notably the canvas game). play() below starts the fetch on demand. */}
      <audio ref={audioRef} src={src} loop preload="none" />
      <button
        type="button"
        onClick={toggleMusic}
        aria-label={isPlaying ? "Mute background music" : "Play background music"}
        aria-pressed={isPlaying}
        style={{
          position: "fixed",
          bottom: "1.5rem",
          right: "1.5rem",
          zIndex: 10000,
          width: "44px",
          height: "44px",
          borderRadius: "50%",
          border: "1px solid rgba(255,255,255,0.2)",
          background: "rgba(0,0,0,0.6)",
          color: "#cfff6a",
          backdropFilter: "blur(6px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
        }}
      >
        {isPlaying ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 4h4v16H6zM14 4h4v16h-4z" />
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z" />
          </svg>
        )}
      </button>
    </>
  );
}
