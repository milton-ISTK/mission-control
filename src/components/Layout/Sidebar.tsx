"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  KanbanSquare,
  Calendar,
  Brain,
  Users,
  Bot,
  Zap,
  Sparkles,
  Settings,
  LogOut,
  Network,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthContext } from "@/components/auth/AuthGuard";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/content", label: "Content Pipeline", icon: Sparkles },
  { href: "/workflows", label: "Workflows", icon: Network },
  { href: "/tasks", label: "Tasks", icon: KanbanSquare },
  { href: "/calendar", label: "Calendar", icon: Calendar },
  { href: "/memories", label: "Memories", icon: Brain },
  { href: "/office", label: "Office View", icon: Bot, color: "#06B6D4" },
  { href: "/team", label: "Team", icon: Users },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { logout } = useAuthContext();

  return (
    <aside className="w-64 h-screen sticky top-0 flex flex-col glass-sidebar p-4 gap-2 shrink-0">
      {/* Logo — Neon glow */}
      <div className="flex items-center gap-3 px-3 py-4 mb-4">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center animate-pulse-neon"
          style={{
            background: "rgba(255,107,0,0.12)",
            border: "1px solid rgba(255,107,0,0.25)",
          }}
        >
          <Zap className="w-6 h-6 text-istk-accent drop-shadow-[0_0_8px_rgba(255,107,0,0.5)]" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-gradient text-glow">ISTK</h1>
          <p className="text-[10px] text-istk-textDim uppercase tracking-widest">
            Mission Control
          </p>
        </div>
      </div>

      {/* Nav — Neon active states */}
      <nav className="flex-1 flex flex-col gap-1">
        {navItems.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname?.startsWith(item.href) ?? false;
          const color = (item as any).color || "rgba(255,107,0,0.3)";
          const bgColor = (item as any).color ? (item as any).color + "0a" : "rgba(255,107,0,0.04)";
          const shadowColor = (item as any).color ? (item as any).color : "rgba(255,107,0,0.3)";
          const hoverBorderColor = (item as any).color ? (item as any).color + "14" : "rgba(255,107,0,0.08)";
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300",
                isActive
                  ? "border neon-border-orange"
                  : "text-istk-textMuted hover:text-istk-text border border-transparent"
              )}
              style={isActive ? {
                color: color === "rgba(255,107,0,0.3)" ? "#F97316" : "#06B6D4",
                background: bgColor,
                textShadow: `0 0 10px ${shadowColor}`,
                borderColor: shadowColor,
              } : {
                borderColor: "transparent",
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.background = bgColor;
                  (e.currentTarget as HTMLElement).style.borderColor = hoverBorderColor;
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.background = "transparent";
                  (e.currentTarget as HTMLElement).style.borderColor = "transparent";
                }
              }}
            >
              <item.icon
                className={cn(
                  "w-5 h-5 transition-all",
                  isActive && "drop-shadow-[0_0_6px_rgba(255,107,0,0.4)]"
                )}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer — Neon status + Logout */}
      <div className="px-3 py-4 text-xs text-istk-textDim mt-2" style={{ borderTop: "1px solid rgba(255,107,0,0.08)" }}>
        <p className="text-neon-orange text-[10px] font-semibold tracking-wider">IntelliStake · Phase 2</p>
        <p className="mt-2 flex items-center gap-1.5">
          <span className="status-dot status-active" />
          <span className="text-istk-textMuted">System Online</span>
        </p>
        <button
          onClick={logout}
          className="flex items-center gap-2 mt-3 px-3 py-2 rounded-lg w-full transition-all duration-300 group"
          style={{
            background: "rgba(248,113,113,0.03)",
            border: "1px solid rgba(248,113,113,0.08)",
          }}
        >
          <LogOut className="w-3.5 h-3.5 text-istk-textDim group-hover:text-istk-danger transition-colors" />
          <span className="text-[11px] text-istk-textDim group-hover:text-istk-danger font-medium transition-colors">
            Sign Out
          </span>
        </button>
      </div>
    </aside>
  );
}
