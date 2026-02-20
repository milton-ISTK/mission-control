"use client";

import { useEffect, useState, useRef } from "react";

interface TypewriterEffectProps {
  text: string;
  speed?: number; // ms per character
}

/**
 * Typewriter animation — types out text character by character.
 * When `text` changes, cancels the current animation and restarts with new text.
 * Default speed: 30ms per character.
 */
export function TypewriterEffect({ text, speed = 30 }: TypewriterEffectProps) {
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const animFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    if (!text) {
      setDisplayedText("");
      setIsTyping(false);
      return;
    }

    // Cancel any running animation
    if (animFrameRef.current !== null) {
      cancelAnimationFrame(animFrameRef.current);
    }

    setDisplayedText("");
    setIsTyping(true);
    startTimeRef.current = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTimeRef.current;
      const charsToShow = Math.min(
        Math.floor(elapsed / speed) + 1,
        text.length
      );

      setDisplayedText(text.substring(0, charsToShow));

      if (charsToShow < text.length) {
        animFrameRef.current = requestAnimationFrame(animate);
      } else {
        setIsTyping(false);
        animFrameRef.current = null;
      }
    };

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animFrameRef.current !== null) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
    };
  }, [text, speed]);

  return <span>{displayedText}</span>;
}

export default TypewriterEffect;
