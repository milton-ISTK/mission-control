"use client";

import { LucideIcon, Inbox } from "lucide-react";
import Button from "./Button";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 backdrop-blur-sm"
        style={{
          background: "rgba(255,107,0,0.04)",
          border: "1px solid rgba(255,107,0,0.10)",
          boxShadow: "0 0 12px rgba(255,107,0,0.06)",
        }}
      >
        <Icon className="w-8 h-8 text-istk-textDim" />
      </div>
      <h3
        className="text-lg font-semibold text-istk-text mb-1"
        style={{ textShadow: "0 0 12px rgba(255,107,0,0.1)" }}
      >
        {title}
      </h3>
      {description && (
        <p className="text-sm text-istk-textMuted text-center max-w-sm mb-4">
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <Button variant="accent" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
