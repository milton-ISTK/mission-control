"use client";

import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  label?: string;
}

export default function LoadingSpinner({ size = "md", className, label }: LoadingSpinnerProps) {
  const sizes = {
    sm: "w-5 h-5 border-2",
    md: "w-8 h-8 border-[2.5px]",
    lg: "w-12 h-12 border-[3px]",
  };

  return (
    <div className={cn("flex flex-col items-center justify-center gap-3", className)}>
      <div
        className={cn(
          "rounded-full animate-spin",
          sizes[size]
        )}
        style={{
          borderColor: "rgba(255,107,0,0.15)",
          borderTopColor: "#FF6B00",
          filter: "drop-shadow(0 0 8px rgba(255,107,0,0.3))",
        }}
      />
      {label && (
        <p className="text-sm text-istk-textMuted" style={{ textShadow: "0 0 8px rgba(255,107,0,0.1)" }}>
          {label}
        </p>
      )}
    </div>
  );
}

// Full page loading state
export function PageLoader({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <LoadingSpinner size="lg" label={label} />
    </div>
  );
}
