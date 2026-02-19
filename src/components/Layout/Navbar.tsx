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
        background: "rgba(5,5,7,0.6)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        backdropFilter: "blur(20px) saturate(180%)",
        WebkitBackdropFilter: "blur(20px) saturate(180%)",
      }}
    >
      {/* Page Title */}
      <div className="flex items-center gap-3">
        <h2 className="text-xl font-bold text-istk-text">{title}</h2>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-4">
        {/* Status indicator */}
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <span className="status-dot status-active" />
          <span className="text-xs text-istk-textMuted font-medium">Live</span>
        </div>

        {/* Brand */}
        <div className="flex items-center gap-2 text-istk-textDim">
          <Zap className="w-4 h-4 text-istk-accent" />
          <span className="text-xs font-semibold tracking-wider uppercase">
            ISTK
          </span>
        </div>
      </div>
    </header>
  );
}
