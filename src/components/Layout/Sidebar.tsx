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
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/tasks", label: "Tasks", icon: KanbanSquare },
  { href: "/calendar", label: "Calendar", icon: Calendar },
  { href: "/memories", label: "Memories", icon: Brain },
  { href: "/team", label: "Team", icon: Users },
  { href: "/subagents", label: "Subagents", icon: Bot },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 h-screen sticky top-0 flex flex-col glass-sidebar p-4 gap-2 shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-3 px-3 py-4 mb-4">
        <div className="w-10 h-10 rounded-xl bg-[rgba(255,107,0,0.1)] flex items-center justify-center border border-[rgba(255,107,0,0.15)]">
          <Zap className="w-6 h-6 text-istk-accent" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-gradient">ISTK</h1>
          <p className="text-[10px] text-istk-textDim uppercase tracking-widest">
            Mission Control
          </p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 flex flex-col gap-1">
        {navItems.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname?.startsWith(item.href) ?? false;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-[rgba(255,107,0,0.08)] text-istk-accent border border-[rgba(255,107,0,0.15)]"
                  : "text-istk-textMuted hover:text-istk-text hover:bg-[rgba(255,255,255,0.04)] border border-transparent"
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 text-xs text-istk-textDim border-t border-[rgba(255,255,255,0.06)] mt-2">
        <p>IntelliStake · Phase 1 MVP</p>
        <p className="mt-1 flex items-center gap-1.5">
          <span className="status-dot status-active" />
          System Online
        </p>
      </div>
    </aside>
  );
}
