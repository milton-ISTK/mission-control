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
        // ISTK Brand Colors — Glassmorphism Dark Theme
        istk: {
          // Base surfaces
          bg: "#050507",              // Near-black background
          surface: "rgba(255,255,255,0.05)",   // Glass surface (5% white)
          surfaceLight: "rgba(255,255,255,0.08)", // Lighter glass surface
          surfaceHover: "rgba(255,255,255,0.10)", // Hover state glass

          // Borders — glass shimmer
          border: "rgba(255,255,255,0.08)",     // Default glass border
          borderLight: "rgba(255,255,255,0.12)", // Lighter border
          borderShimmer: "rgba(255,255,255,0.15)", // Top/left edge shimmer

          // Brand accent
          accent: "#FF6B00",           // IntelliStake orange
          accentHover: "#FF8534",      // Orange hover (slightly lighter)
          accentDim: "#CC5500",        // Orange muted
          accentGlow: "rgba(255,107,0,0.15)", // Soft accent glow

          // Text
          text: "#F0F0F5",            // Primary text (crisp white-ish)
          textMuted: "#8E8EA0",       // Secondary text
          textDim: "#55556A",         // Dim text

          // Semantic
          success: "#34D399",         // Emerald green
          warning: "#FBBF24",         // Amber
          danger: "#F87171",          // Red
          info: "#60A5FA",            // Blue
          purple: "#A78BFA",          // Purple
        },
      },
      boxShadow: {
        // Glassmorphism shadows — subtle depth only
        "glass": "0 1px 2px rgba(0,0,0,0.3), 0 4px 16px rgba(0,0,0,0.2)",
        "glass-sm": "0 1px 2px rgba(0,0,0,0.2), 0 2px 8px rgba(0,0,0,0.15)",
        "glass-lg": "0 2px 4px rgba(0,0,0,0.3), 0 8px 32px rgba(0,0,0,0.25)",
        "glass-inset": "inset 0 1px 0 rgba(255,255,255,0.05)",
        "glass-glow": "0 0 20px rgba(255,107,0,0.15), 0 0 40px rgba(255,107,0,0.05)",
        "glass-ring": "0 0 0 1px rgba(255,255,255,0.08)",
      },
      backdropBlur: {
        xs: "2px",
        glass: "20px",
        "glass-lg": "40px",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        mono: ["JetBrains Mono", "SF Mono", "monospace"],
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "glow": "glow 2s ease-in-out infinite alternate",
        "glass-shimmer": "glassShimmer 3s ease-in-out infinite",
        "fade-in": "fadeIn 0.2s ease-out",
        "slide-up": "slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        "scale-in": "scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
      },
      keyframes: {
        glow: {
          "0%": { boxShadow: "0 0 5px rgba(255,107,0,0.1)" },
          "100%": { boxShadow: "0 0 20px rgba(255,107,0,0.2)" },
        },
        glassShimmer: {
          "0%, 100%": { opacity: "0.5" },
          "50%": { opacity: "1" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.96)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
      borderRadius: {
        "2xl": "16px",
        "3xl": "20px",
        "4xl": "24px",
      },
    },
  },
  plugins: [],
};

export default config;
