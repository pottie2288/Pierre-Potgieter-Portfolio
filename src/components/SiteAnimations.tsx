"use client";

import { useEffect } from "react";
import { initSite } from "@/lib/animations";

// Client-only entry point for all GSAP/Lenis behaviour. Renders nothing.
export default function SiteAnimations() {
  useEffect(() => {
    const container = document.querySelector<HTMLElement>("[data-page-container]");
    if (!container) return;
    return initSite(container);
  }, []);
  return null;
}
