"use client";

/**
 * Dark Obsidian Textured Background
 * Static dark charcoal background with subtle texture
 * No animation - clean, professional aesthetic
 */

export default function FluidBackground() {
  return (
    <div
      className="fixed inset-0 -z-10 bg-obsidian overflow-hidden"
      style={{
        backgroundImage: `
          repeating-linear-gradient(
            90deg,
            transparent,
            transparent 2px,
            rgba(255,255,255,0.02) 2px,
            rgba(255,255,255,0.02) 4px
          ),
          repeating-linear-gradient(
            0deg,
            transparent,
            transparent 1px,
            rgba(255,255,255,0.01) 1px,
            rgba(255,255,255,0.01) 2px
          )
        `,
      }}
    />
  );
}
