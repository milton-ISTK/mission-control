import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // ISTK Brand Colors - extracted from intellistake.com
        istk: {
          bg: "#0D0D14",           // Deep dark background
          surface: "#151521",      // Card/panel surface
          surfaceLight: "#1C1C2E", // Lighter surface variant
          border: "#2A2A3D",       // Subtle borders
          primary: "#1E293B",      // Primary dark blue
          secondary: "#0F172A",    // Secondary navy
          accent: "#F97316",       // Bold orange (primary CTA)
          accentHover: "#FB923C",  // Orange hover state
          accentDim: "#C2410C",    // Orange muted
          text: "#E2E8F0",         // Primary text (light gray)
          textMuted: "#94A3B8",    // Secondary text
          textDim: "#64748B",      // Dim text
          success: "#22C55E",      // Green for done/success
          warning: "#EAB308",      // Yellow for warnings
          danger: "#EF4444",       // Red for deadlines/danger
          info: "#3B82F6",         // Blue for info/cron
          purple: "#A855F7",       // Purple for special
        },
      },
      boxShadow: {
        // Neumorphic shadows for dark theme
        "neu": "6px 6px 12px #0a0a10, -6px -6px 12px #1a1a28",
        "neu-sm": "3px 3px 6px #0a0a10, -3px -3px 6px #1a1a28",
        "neu-lg": "10px 10px 20px #0a0a10, -10px -10px 20px #1a1a28",
        "neu-inset": "inset 3px 3px 6px #0a0a10, inset -3px -3px 6px #1a1a28",
        "neu-inset-sm": "inset 2px 2px 4px #0a0a10, inset -2px -2px 4px #1a1a28",
        "neu-glow": "0 0 15px rgba(249, 115, 22, 0.3), 6px 6px 12px #0a0a10, -6px -6px 12px #1a1a28",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "glow": "glow 2s ease-in-out infinite alternate",
      },
      keyframes: {
        glow: {
          "0%": { boxShadow: "0 0 5px rgba(249, 115, 22, 0.2)" },
          "100%": { boxShadow: "0 0 20px rgba(249, 115, 22, 0.4)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
