"use client";

export default function Footer() {
  return (
    <footer
      className="py-4 px-6 text-center"
      style={{
        borderTop: "1px solid rgba(255,107,0,0.06)",
        background: "rgba(10,10,14,0.40)",
        backdropFilter: "blur(12px)",
      }}
    >
      <p className="text-xs text-istk-textDim">
        <span className="text-neon-orange font-medium" style={{ textShadow: "0 0 6px rgba(255,107,0,0.2)" }}>
          ISTK
        </span>
        {" · "}Agentic Mission Control · Phase 1 MVP ·{" "}
        <span className="text-istk-textMuted">
          Issues? Contact{" "}
          <a
            href="mailto:gregory@intellistake.ai"
            className="text-istk-accent hover:text-istk-accentHover transition-colors underline underline-offset-2"
            style={{ textShadow: "0 0 8px rgba(255,107,0,0.2)" }}
          >
            gregory@intellistake.ai
          </a>
        </span>
      </p>
    </footer>
  );
}
