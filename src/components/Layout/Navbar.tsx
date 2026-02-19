"use client";

import { usePathname } from "next/navigation";
import { Zap } from "lucide-react";

const pageTitles: Record<string, string> = {
  "/": "Dashboard",
  "/tasks": "Task Board",
  "/calendar": "Calendar",
  "/memories": "Memories",
  "/team": "Team",
  "/subagents": "Subagents",
};

export default function Navbar() {
  const pathname = usePathname();
  const title = (pathname ? pageTitles[pathname] : undefined) || "Mission Control";

  return (
    <header
      className="h-16 flex items-center justify-between px-6 sticky top-0 z-40"
      style={{
        background: "rgba(10,10,14,0.65)",
        borderBottom: "1px solid rgba(255,107,0,0.08)",
        backdropFilter: "blur(24px) saturate(180%)",
        WebkitBackdropFilter: "blur(24px) saturate(180%)",
        boxShadow: "0 1px 20px rgba(0,0,0,0.3), 0 1px 0 rgba(255,107,0,0.04)",
      }}
    >
      {/* Page Title — with neon glow */}
      <div className="flex items-center gap-3">
        <h2
          className="text-xl font-bold text-istk-text"
          style={{
            textShadow: "0 0 15px rgba(255,107,0,0.15)",
          }}
        >
          {title}
        </h2>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-4">
        {/* Live Status indicator — neon pulsing */}
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
          style={{
            background: "rgba(255,107,0,0.04)",
            border: "1px solid rgba(255,107,0,0.12)",
            boxShadow: "0 0 8px rgba(255,107,0,0.06)",
          }}
        >
          <span className="status-dot status-active" />
          <span className="text-xs text-istk-textMuted font-medium">Live</span>
        </div>

        {/* Brand — Neon accent */}
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-istk-accent drop-shadow-[0_0_6px_rgba(255,107,0,0.4)]" />
          <span className="text-xs font-semibold tracking-wider uppercase text-neon-orange">
            ISTK
          </span>
        </div>
      </div>
    </header>
  );
}
