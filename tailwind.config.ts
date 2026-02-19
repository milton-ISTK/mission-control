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
        // ISTK Brand Colors — Neon Lava Dark Theme
        istk: {
          // Base surfaces — deeper charcoal for lava contrast
          bg: "#0A0A0A",
          surface: "rgba(255,255,255,0.04)",
          surfaceLight: "rgba(255,255,255,0.07)",
          surfaceHover: "rgba(255,255,255,0.10)",

          // Borders — neon glow style
          border: "rgba(255,107,0,0.12)",
          borderLight: "rgba(255,107,0,0.20)",
          borderShimmer: "rgba(255,107,0,0.30)",
          borderCool: "rgba(0,217,255,0.15)",

          // Brand accent — Lava tangerine
          accent: "#FF6B00",
          accentHover: "#FF8534",
          accentDim: "#CC5500",
          accentGlow: "rgba(255,107,0,0.25)",
          accentBright: "#FF9548",

          // Secondary lava
          lava: "#FF4500",
          lavaGlow: "rgba(255,69,0,0.20)",

          // Cool accents — cyan + purple
          cyan: "#00D9FF",
          cyanGlow: "rgba(0,217,255,0.20)",
          cyanDim: "#0099B3",
          purple: "#B24BF3",
          purpleGlow: "rgba(178,75,243,0.20)",
          purpleDim: "#8B3BC2",

          // Text
          text: "#F0F0F5",
          textMuted: "#9E9EB0",
          textDim: "#55556A",

          // Semantic
          success: "#34D399",
          successGlow: "rgba(52,211,153,0.20)",
          warning: "#FBBF24",
          warningGlow: "rgba(251,191,36,0.20)",
          danger: "#F87171",
          dangerGlow: "rgba(248,113,113,0.20)",
          info: "#60A5FA",
          infoGlow: "rgba(96,165,250,0.20)",
        },
      },
      boxShadow: {
        // Neon glow shadows
        "neon-orange": "0 0 10px rgba(255,107,0,0.3), 0 0 30px rgba(255,107,0,0.15), 0 0 60px rgba(255,107,0,0.05)",
        "neon-orange-sm": "0 0 5px rgba(255,107,0,0.25), 0 0 15px rgba(255,107,0,0.10)",
        "neon-orange-lg": "0 0 15px rgba(255,107,0,0.4), 0 0 45px rgba(255,107,0,0.2), 0 0 90px rgba(255,107,0,0.08)",
        "neon-orange-intense": "0 0 20px rgba(255,107,0,0.5), 0 0 60px rgba(255,107,0,0.3), 0 0 120px rgba(255,107,0,0.1)",
        "neon-cyan": "0 0 10px rgba(0,217,255,0.3), 0 0 30px rgba(0,217,255,0.15), 0 0 60px rgba(0,217,255,0.05)",
        "neon-cyan-sm": "0 0 5px rgba(0,217,255,0.2), 0 0 15px rgba(0,217,255,0.08)",
        "neon-purple": "0 0 10px rgba(178,75,243,0.3), 0 0 30px rgba(178,75,243,0.15), 0 0 60px rgba(178,75,243,0.05)",
        "neon-purple-sm": "0 0 5px rgba(178,75,243,0.2), 0 0 15px rgba(178,75,243,0.08)",
        "neon-red": "0 0 10px rgba(255,69,0,0.3), 0 0 30px rgba(255,69,0,0.15)",
        "neon-success": "0 0 8px rgba(52,211,153,0.3), 0 0 20px rgba(52,211,153,0.12)",
        "neon-danger": "0 0 8px rgba(248,113,113,0.3), 0 0 20px rgba(248,113,113,0.12)",
        // Glass depth shadows
        "glass": "0 2px 4px rgba(0,0,0,0.5), 0 8px 32px rgba(0,0,0,0.3)",
        "glass-sm": "0 1px 2px rgba(0,0,0,0.4), 0 4px 16px rgba(0,0,0,0.2)",
        "glass-lg": "0 4px 8px rgba(0,0,0,0.5), 0 16px 64px rgba(0,0,0,0.35)",
        "glass-inset": "inset 0 1px 0 rgba(255,255,255,0.06)",
        "glass-ring": "0 0 0 1px rgba(255,107,0,0.12)",
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
        "pulse-neon": "pulseNeon 2s ease-in-out infinite",
        "pulse-glow": "pulseGlow 3s ease-in-out infinite",
        "glow": "glow 2s ease-in-out infinite alternate",
        "glow-intense": "glowIntense 1.5s ease-in-out infinite alternate",
        "glow-cyan": "glowCyan 2.5s ease-in-out infinite alternate",
        "glow-purple": "glowPurple 3s ease-in-out infinite alternate",
        "border-glow": "borderGlow 2s ease-in-out infinite alternate",
        "neon-flicker": "neonFlicker 4s ease-in-out infinite",
        "float": "float 6s ease-in-out infinite",
        "glass-shimmer": "glassShimmer 3s ease-in-out infinite",
        "fade-in": "fadeIn 0.3s ease-out",
        "slide-up": "slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
        "scale-in": "scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        "spark": "spark 1.5s ease-out forwards",
      },
      keyframes: {
        pulseNeon: {
          "0%, 100%": { boxShadow: "0 0 5px rgba(255,107,0,0.2), 0 0 15px rgba(255,107,0,0.1)" },
          "50%": { boxShadow: "0 0 15px rgba(255,107,0,0.4), 0 0 40px rgba(255,107,0,0.2)" },
        },
        pulseGlow: {
          "0%, 100%": { opacity: "0.6" },
          "50%": { opacity: "1" },
        },
        glow: {
          "0%": { boxShadow: "0 0 5px rgba(255,107,0,0.15), 0 0 15px rgba(255,107,0,0.05)" },
          "100%": { boxShadow: "0 0 15px rgba(255,107,0,0.3), 0 0 40px rgba(255,107,0,0.12)" },
        },
        glowIntense: {
          "0%": { boxShadow: "0 0 10px rgba(255,107,0,0.3), 0 0 25px rgba(255,107,0,0.15)" },
          "100%": { boxShadow: "0 0 25px rgba(255,107,0,0.5), 0 0 60px rgba(255,107,0,0.25)" },
        },
        glowCyan: {
          "0%": { boxShadow: "0 0 5px rgba(0,217,255,0.15), 0 0 15px rgba(0,217,255,0.05)" },
          "100%": { boxShadow: "0 0 15px rgba(0,217,255,0.3), 0 0 40px rgba(0,217,255,0.12)" },
        },
        glowPurple: {
          "0%": { boxShadow: "0 0 5px rgba(178,75,243,0.15), 0 0 15px rgba(178,75,243,0.05)" },
          "100%": { boxShadow: "0 0 15px rgba(178,75,243,0.3), 0 0 40px rgba(178,75,243,0.12)" },
        },
        borderGlow: {
          "0%": { borderColor: "rgba(255,107,0,0.15)" },
          "100%": { borderColor: "rgba(255,107,0,0.35)" },
        },
        neonFlicker: {
          "0%, 100%": { opacity: "1" },
          "33%": { opacity: "0.95" },
          "66%": { opacity: "1" },
          "77%": { opacity: "0.9" },
          "88%": { opacity: "1" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-6px)" },
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
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        spark: {
          "0%": { opacity: "1", transform: "translateY(0) scale(1)" },
          "100%": { opacity: "0", transform: "translateY(-30px) scale(0)" },
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
