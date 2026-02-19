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
        // ISTK Brand Colors — Dark Lava Vein Theme
        istk: {
          // Base surfaces — deep charcoal
          bg: "#0A0A0A",
          surface: "rgba(255,255,255,0.03)",
          surfaceLight: "rgba(255,255,255,0.05)",
          surfaceHover: "rgba(255,255,255,0.08)",

          // Borders — subtle, professional
          border: "rgba(255,107,0,0.08)",
          borderLight: "rgba(255,107,0,0.15)",
          borderShimmer: "rgba(255,107,0,0.22)",
          borderCool: "rgba(0,217,255,0.10)",

          // Brand accent — Lava tangerine
          accent: "#FF6B00",
          accentHover: "#FF8534",
          accentDim: "#CC5500",
          accentGlow: "rgba(255,107,0,0.18)",
          accentBright: "#FF9548",

          // Secondary lava
          lava: "#FF4500",
          lavaGlow: "rgba(255,69,0,0.15)",

          // Cool accents — cyan + purple
          cyan: "#00D9FF",
          cyanGlow: "rgba(0,217,255,0.15)",
          cyanDim: "#0099B3",
          purple: "#B24BF3",
          purpleGlow: "rgba(178,75,243,0.15)",
          purpleDim: "#8B3BC2",

          // Text
          text: "#F0F0F5",
          textMuted: "#9E9EB0",
          textDim: "#55556A",

          // Semantic
          success: "#34D399",
          successGlow: "rgba(52,211,153,0.15)",
          warning: "#FBBF24",
          warningGlow: "rgba(251,191,36,0.15)",
          danger: "#F87171",
          dangerGlow: "rgba(248,113,113,0.15)",
          info: "#60A5FA",
          infoGlow: "rgba(96,165,250,0.15)",
        },
      },
      boxShadow: {
        // Professional depth shadows
        "card": "0 2px 4px rgba(0,0,0,0.5), 0 8px 24px rgba(0,0,0,0.4), 0 16px 48px rgba(0,0,0,0.2)",
        "card-hover": "0 0 20px rgba(255,107,0,0.12), 0 0 40px rgba(255,107,0,0.06), 0 4px 8px rgba(0,0,0,0.5), 0 16px 48px rgba(0,0,0,0.35)",
        // Neon glow shadows (toned down)
        "neon-orange": "0 0 8px rgba(255,107,0,0.2), 0 0 20px rgba(255,107,0,0.10), 0 0 40px rgba(255,107,0,0.04)",
        "neon-orange-sm": "0 0 4px rgba(255,107,0,0.18), 0 0 10px rgba(255,107,0,0.06)",
        "neon-orange-lg": "0 0 12px rgba(255,107,0,0.3), 0 0 35px rgba(255,107,0,0.12), 0 0 70px rgba(255,107,0,0.05)",
        "neon-orange-intense": "0 0 15px rgba(255,107,0,0.4), 0 0 45px rgba(255,107,0,0.2), 0 0 90px rgba(255,107,0,0.08)",
        "neon-cyan": "0 0 8px rgba(0,217,255,0.2), 0 0 20px rgba(0,217,255,0.10), 0 0 40px rgba(0,217,255,0.04)",
        "neon-cyan-sm": "0 0 4px rgba(0,217,255,0.15), 0 0 10px rgba(0,217,255,0.06)",
        "neon-purple": "0 0 8px rgba(178,75,243,0.2), 0 0 20px rgba(178,75,243,0.10), 0 0 40px rgba(178,75,243,0.04)",
        "neon-purple-sm": "0 0 4px rgba(178,75,243,0.15), 0 0 10px rgba(178,75,243,0.06)",
        "neon-red": "0 0 8px rgba(255,69,0,0.2), 0 0 20px rgba(255,69,0,0.10)",
        "neon-success": "0 0 6px rgba(52,211,153,0.2), 0 0 15px rgba(52,211,153,0.08)",
        "neon-danger": "0 0 6px rgba(248,113,113,0.2), 0 0 15px rgba(248,113,113,0.08)",
        // Glass depth shadows
        "glass": "0 2px 4px rgba(0,0,0,0.5), 0 8px 24px rgba(0,0,0,0.35)",
        "glass-sm": "0 1px 2px rgba(0,0,0,0.4), 0 4px 12px rgba(0,0,0,0.25)",
        "glass-lg": "0 4px 8px rgba(0,0,0,0.5), 0 16px 48px rgba(0,0,0,0.4)",
        "glass-inset": "inset 0 1px 0 rgba(255,255,255,0.04)",
        "glass-ring": "0 0 0 1px rgba(255,107,0,0.08)",
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
        "orange-pulse": "orangePulse 0.4s ease-out",
        "glow": "glow 2s ease-in-out infinite alternate",
        "glow-subtle": "glowSubtle 2.5s ease-in-out infinite alternate",
        "glow-cyan": "glowCyan 2.5s ease-in-out infinite alternate",
        "glow-purple": "glowPurple 3s ease-in-out infinite alternate",
        "border-glow": "borderGlow 2s ease-in-out infinite alternate",
        "float": "float 6s ease-in-out infinite",
        "glass-shimmer": "glassShimmer 3s ease-in-out infinite",
        "fade-in": "fadeIn 0.3s ease-out",
        "slide-up": "slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
        "scale-in": "scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        "spark": "spark 1.5s ease-out forwards",
      },
      keyframes: {
        pulseNeon: {
          "0%, 100%": { boxShadow: "0 0 4px rgba(255,107,0,0.12), 0 0 10px rgba(255,107,0,0.06)" },
          "50%": { boxShadow: "0 0 10px rgba(255,107,0,0.25), 0 0 30px rgba(255,107,0,0.12)" },
        },
        pulseGlow: {
          "0%, 100%": { opacity: "0.6" },
          "50%": { opacity: "1" },
        },
        orangePulse: {
          "0%": { boxShadow: "inset 0 0 0 rgba(255,107,0,0), 0 0 0 rgba(255,107,0,0)" },
          "30%": { boxShadow: "inset 0 0 8px rgba(255,107,0,0.10), 0 0 30px rgba(255,107,0,0.25), 0 0 60px rgba(255,107,0,0.10)" },
          "100%": { boxShadow: "inset 0 0 0 rgba(255,107,0,0), 0 0 0 rgba(255,107,0,0)" },
        },
        glow: {
          "0%": { boxShadow: "0 0 4px rgba(255,107,0,0.10), 0 0 12px rgba(255,107,0,0.04)" },
          "100%": { boxShadow: "0 0 10px rgba(255,107,0,0.2), 0 0 30px rgba(255,107,0,0.08)" },
        },
        glowSubtle: {
          "0%": { boxShadow: "0 0 4px rgba(255,107,0,0.08), 0 0 10px rgba(255,107,0,0.03)" },
          "100%": { boxShadow: "0 0 8px rgba(255,107,0,0.15), 0 0 25px rgba(255,107,0,0.06)" },
        },
        glowCyan: {
          "0%": { boxShadow: "0 0 4px rgba(0,217,255,0.10), 0 0 12px rgba(0,217,255,0.04)" },
          "100%": { boxShadow: "0 0 10px rgba(0,217,255,0.2), 0 0 30px rgba(0,217,255,0.08)" },
        },
        glowPurple: {
          "0%": { boxShadow: "0 0 4px rgba(178,75,243,0.10), 0 0 12px rgba(178,75,243,0.04)" },
          "100%": { boxShadow: "0 0 10px rgba(178,75,243,0.2), 0 0 30px rgba(178,75,243,0.08)" },
        },
        borderGlow: {
          "0%": { borderColor: "rgba(255,107,0,0.10)" },
          "100%": { borderColor: "rgba(255,107,0,0.25)" },
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
