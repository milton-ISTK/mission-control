"use client";

import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "critical" | "high" | "medium" | "low" | "success" | "warning" | "info" | "purple" | "cyan";
  className?: string;
  glow?: boolean;
}

const variantStyles: Record<string, string> = {
  default: "bg-[rgba(255,255,255,0.04)] text-istk-textMuted border-[rgba(255,255,255,0.08)]",
  critical: "bg-[rgba(248,113,113,0.10)] text-istk-danger border-[rgba(248,113,113,0.25)] shadow-[0_0_6px_rgba(248,113,113,0.1)]",
  high: "bg-[rgba(255,107,0,0.10)] text-istk-accent border-[rgba(255,107,0,0.25)] shadow-[0_0_6px_rgba(255,107,0,0.1)]",
  medium: "bg-[rgba(251,191,36,0.10)] text-istk-warning border-[rgba(251,191,36,0.25)] shadow-[0_0_6px_rgba(251,191,36,0.08)]",
  low: "bg-[rgba(96,165,250,0.10)] text-istk-info border-[rgba(96,165,250,0.25)] shadow-[0_0_6px_rgba(96,165,250,0.08)]",
  success: "bg-[rgba(52,211,153,0.10)] text-istk-success border-[rgba(52,211,153,0.25)] shadow-[0_0_6px_rgba(52,211,153,0.1)]",
  warning: "bg-[rgba(251,191,36,0.10)] text-istk-warning border-[rgba(251,191,36,0.25)] shadow-[0_0_6px_rgba(251,191,36,0.08)]",
  info: "bg-[rgba(96,165,250,0.10)] text-istk-info border-[rgba(96,165,250,0.25)] shadow-[0_0_6px_rgba(96,165,250,0.08)]",
  purple: "bg-[rgba(178,75,243,0.10)] text-istk-purple border-[rgba(178,75,243,0.25)] shadow-[0_0_6px_rgba(178,75,243,0.1)]",
  cyan: "bg-[rgba(0,217,255,0.10)] text-istk-cyan border-[rgba(0,217,255,0.25)] shadow-[0_0_6px_rgba(0,217,255,0.1)]",
};

export default function Badge({ children, variant = "default", className, glow }: BadgeProps) {
  return (
    <span
      className={cn(
        "glass-badge",
        variantStyles[variant],
        glow && "animate-pulse-neon",
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
