"use client";

import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "critical" | "high" | "medium" | "low" | "success" | "warning" | "info" | "purple";
  className?: string;
}

const variantStyles: Record<string, string> = {
  default: "bg-[rgba(255,255,255,0.06)] text-istk-textMuted border-[rgba(255,255,255,0.08)]",
  critical: "bg-[rgba(248,113,113,0.12)] text-istk-danger border-[rgba(248,113,113,0.2)]",
  high: "bg-[rgba(255,107,0,0.12)] text-istk-accent border-[rgba(255,107,0,0.2)]",
  medium: "bg-[rgba(251,191,36,0.12)] text-istk-warning border-[rgba(251,191,36,0.2)]",
  low: "bg-[rgba(96,165,250,0.12)] text-istk-info border-[rgba(96,165,250,0.2)]",
  success: "bg-[rgba(52,211,153,0.12)] text-istk-success border-[rgba(52,211,153,0.2)]",
  warning: "bg-[rgba(251,191,36,0.12)] text-istk-warning border-[rgba(251,191,36,0.2)]",
  info: "bg-[rgba(96,165,250,0.12)] text-istk-info border-[rgba(96,165,250,0.2)]",
  purple: "bg-[rgba(167,139,250,0.12)] text-istk-purple border-[rgba(167,139,250,0.2)]",
};

export default function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "glass-badge",
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

// Priority badge helper
export function PriorityBadge({ priority }: { priority: string }) {
  const map: Record<string, "critical" | "high" | "medium" | "low"> = {
    critical: "critical",
    high: "high",
    medium: "medium",
    low: "low",
  };
  return <Badge variant={map[priority] || "default"}>{priority}</Badge>;
}

// Status badge helper
export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, BadgeProps["variant"]> = {
    active: "success",
    paused: "warning",
    completed: "default",
    idle: "warning",
    offline: "default",
    todo: "info",
    in_progress: "warning",
    done: "success",
  };
  const labels: Record<string, string> = {
    todo: "To Do",
    in_progress: "In Progress",
    done: "Done",
  };
  return (
    <Badge variant={map[status] || "default"}>
      {labels[status] || status}
    </Badge>
  );
}
