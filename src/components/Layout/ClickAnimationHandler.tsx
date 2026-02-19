"use client";

import { useEffect } from "react";

/**
 * Adds click animation handlers to interactive cards
 * Applies orangePulse animation on click
 */
export default function ClickAnimationHandler() {
  useEffect(() => {
    const handleCardClick = (e: MouseEvent) => {
      const card = (e.target as HTMLElement).closest(
        ".glass-card, [data-clickable], button, [role='button']"
      );
      if (!card) return;

      // Add animation class
      card.classList.add("orange-pulse-active");

      // Remove after animation completes
      setTimeout(() => {
        card.classList.remove("orange-pulse-active");
      }, 400);
    };

    document.addEventListener("click", handleCardClick, true);
    return () => document.removeEventListener("click", handleCardClick, true);
  }, []);

  return null;
}
