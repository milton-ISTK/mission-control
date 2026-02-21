"use client";

import { cn } from "@/lib/utils";

interface WorkflowProgressProps {
  totalSteps: number;
  currentStep: number;
  status: string;
}

export default function WorkflowProgress({
  totalSteps,
  currentStep,
  status,
}: WorkflowProgressProps) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: totalSteps }).map((_, i) => {
        const stepNum = i + 1;
        const isCompleted = stepNum < currentStep;
        const isCurrent = stepNum === currentStep;
        const isPending = stepNum > currentStep;

        let dotClass = "";
        let dotContent = "";

        if (isCompleted) {
          // Completed: filled orange circle
          dotClass =
            "w-6 h-6 rounded-full bg-istk-accent text-white flex items-center justify-center text-xs font-bold";
          dotContent = "●";
        } else if (isCurrent) {
          if (status === "paused_for_review") {
            // Paused: amber/yellow circle
            dotClass =
              "w-6 h-6 rounded-full bg-amber-500/40 border border-amber-400 flex items-center justify-center text-xs text-amber-400 font-bold";
            dotContent = "⏸️";
          } else if (status === "active" || status === "running") {
            // Running: pulsing blue circle
            dotClass =
              "w-6 h-6 rounded-full bg-blue-500/40 border border-blue-400 flex items-center justify-center text-xs text-blue-400 font-bold animate-pulse";
            dotContent = "◐";
          } else {
            // Default current
            dotClass =
              "w-6 h-6 rounded-full bg-blue-500/40 border border-blue-400 flex items-center justify-center text-xs text-blue-400 font-bold";
            dotContent = "◐";
          }
        } else {
          // Pending: gray hollow circle
          dotClass =
            "w-6 h-6 rounded-full border border-zinc-600 flex items-center justify-center text-xs text-zinc-500 font-bold";
          dotContent = "○";
        }

        return (
          <div key={stepNum} className="flex items-center gap-2">
            <div className={cn(dotClass)}>{dotContent}</div>
            {/* Connect dots with lines (except after last) */}
            {stepNum < totalSteps && (
              <div
                className={cn(
                  "h-0.5 w-6",
                  isCompleted
                    ? "bg-istk-accent"
                    : isCurrent && status === "paused_for_review"
                      ? "bg-amber-500/50"
                      : isCurrent && (status === "active" || status === "running")
                        ? "bg-blue-500/50"
                        : "bg-zinc-700"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
