import { type ClassValue, clsx } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatRelative(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return formatDate(isoString);
}

export const priorityColors: Record<string, string> = {
  critical: "bg-istk-danger text-white",
  high: "bg-istk-accent text-white",
  medium: "bg-istk-warning text-istk-bg",
  low: "bg-istk-info text-white",
};

export const statusColors: Record<string, string> = {
  active: "bg-istk-success",
  paused: "bg-istk-warning",
  completed: "bg-istk-textDim",
  idle: "bg-istk-warning",
  offline: "bg-istk-textDim",
};

export const eventTypeColors: Record<string, string> = {
  cron: "border-istk-info bg-istk-info/10 text-istk-info",
  deadline: "border-istk-danger bg-istk-danger/10 text-istk-danger",
  oneshot: "border-istk-success bg-istk-success/10 text-istk-success",
};
// Convex rebuild trigger: Mon 23 Feb 2026 10:09:46 GMT
