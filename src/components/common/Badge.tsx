"use client";

import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "critical" | "high" | "medium" | "low" | "success" | "warning" | "info" | "purple";
  className?: string;
}

const variantStyles: Record<string, string> = {
  default: "bg-istk-surfaceLight text-istk-textMuted",
  critical: "bg-istk-danger/20 text-istk-danger border-istk-danger/30",
  high: "bg-istk-accent/20 text-istk-accent border-istk-accent/30",
  medium: "bg-istk-warning/20 text-istk-warning border-istk-warning/30",
  low: "bg-istk-info/20 text-istk-info border-istk-info/30",
  success: "bg-istk-success/20 text-istk-success border-istk-success/30",
  warning: "bg-istk-warning/20 text-istk-warning border-istk-warning/30",
  info: "bg-istk-info/20 text-istk-info border-istk-info/30",
  purple: "bg-istk-purple/20 text-istk-purple border-istk-purple/30",
};

export default function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "neu-badge",
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
