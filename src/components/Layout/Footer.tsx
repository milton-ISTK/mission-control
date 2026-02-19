"use client";

export default function Footer() {
  return (
    <footer className="py-4 px-6 text-center border-t border-istk-border/10">
      <p className="text-xs text-istk-textDim">
        ISTK: Agentic Mission Control · Phase 1 MVP ·{" "}
        <span className="text-istk-textMuted">
          Issues? Contact{" "}
          <a
            href="mailto:gregory@intellistake.ai"
            className="text-istk-accent hover:text-istk-accentHover transition-colors underline underline-offset-2"
          >
            gregory@intellistake.ai
          </a>
        </span>
      </p>
    </footer>
  );
}
