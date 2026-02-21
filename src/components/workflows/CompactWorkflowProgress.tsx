"use client";

import { cn } from "@/lib/utils";

interface CompactWorkflowProgressProps {
  totalSteps: number;
  currentStep: number;
  status: string;
}

export default function CompactWorkflowProgress({
  totalSteps,
  currentStep,
  status,
}: CompactWorkflowProgressProps) {
  const percentage = totalSteps > 0 ? (currentStep / totalSteps) * 100 : 0;

  // Determine status text and color
  let statusText = "In Progress";
  let statusColor = "text-blue-400";
  let fillColor = "bg-blue-500";
  let icon = "";

  if (status === "completed") {
    statusText = "Complete";
    statusColor = "text-green-400";
    fillColor = "bg-green-500";
  } else if (status === "paused_for_review") {
    statusText = "Needs Review";
    statusColor = "text-amber-400";
    fillColor = "bg-amber-500";
    icon = "⏸️ ";
  } else if (status === "active" || status === "running") {
    statusText = "In Progress";
    statusColor = "text-blue-400";
    fillColor = "bg-blue-500";
  }

  return (
    <div className="space-y-1">
      {/* Progress Bar */}
      <div className="w-full h-1 bg-zinc-700 rounded-full overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-300", fillColor)}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Status Text */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-istk-textMuted">
          Step {currentStep}/{totalSteps}
        </span>
        <span className={cn("text-xs font-semibold", statusColor)}>
          {icon}{statusText}
        </span>
      </div>
    </div>
  );
}
