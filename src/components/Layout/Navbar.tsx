"use client";

import { usePathname } from "next/navigation";
import { Bell, Search, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

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
    <header className="h-16 flex items-center justify-between px-6 border-b border-istk-border/20 bg-istk-surface/50 backdrop-blur-sm sticky top-0 z-40">
      {/* Page Title */}
      <div className="flex items-center gap-3">
        <h2 className="text-xl font-bold text-istk-text">{title}</h2>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-4">
        {/* Status indicator */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-istk-surfaceLight border border-istk-border/20">
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
