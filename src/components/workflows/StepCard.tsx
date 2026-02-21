"use client";

import { cn } from "@/lib/utils";

interface WorkflowStep {
  _id: string;
  stepNumber: number;
  name: string;
  agentRole: string;
  status: string;
  input?: string;
  output?: string;
  errorMessage?: string;
  thinkingLine1?: string;
  thinkingLine2?: string;
  startedAt?: string;
  completedAt?: string;
  reviewNotes?: string;
  reviewedAt?: string;
  selectedOption?: string;
}

interface StepCardProps {
  step: WorkflowStep;
  totalSteps: number;
  onApprove?: () => void;
  onReject?: () => void;
  isLoading?: boolean;
}

const statusConfig = {
  pending: { bg: "bg-zinc-900/40", border: "border-zinc-700/50", badge: "bg-zinc-700 text-zinc-300", icon: "⏳", label: "Pending" },
  agent_working: { bg: "bg-blue-900/20", border: "border-blue-700/50", badge: "bg-blue-600 text-blue-100", icon: "⚙️", label: "Working" },
  completed: { bg: "bg-green-900/20", border: "border-green-700/50", badge: "bg-green-600 text-green-100", icon: "✅", label: "Completed" },
  awaiting_review: { bg: "bg-amber-900/20", border: "border-amber-700/50", badge: "bg-amber-600 text-amber-100", icon: "⏸️", label: "Awaiting Review" },
  approved: { bg: "bg-green-900/20", border: "border-green-700/50", badge: "bg-green-600 text-green-100", icon: "✓", label: "Approved" },
  rejected: { bg: "bg-red-900/20", border: "border-red-700/50", badge: "bg-red-600 text-red-100", icon: "✕", label: "Rejected" },
  failed: { bg: "bg-red-900/20", border: "border-red-700/50", badge: "bg-red-600 text-red-100", icon: "❌", label: "Failed" },
  skipped: { bg: "bg-zinc-900/20", border: "border-zinc-700/50", badge: "bg-zinc-600 text-zinc-100", icon: "⊘", label: "Skipped" },
};

export default function StepCard({
  step,
  totalSteps,
  onApprove,
  onReject,
  isLoading = false,
}: StepCardProps) {
  const config = statusConfig[step.status as keyof typeof statusConfig] || statusConfig.pending;

  return (
    <div className={cn("p-5 rounded-xl border transition-all duration-300", config.bg, config.border)}>
      {/* Header: Step Number + Name + Status */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          {/* Step Number Circle */}
          <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-bold text-sm bg-zinc-900/60 border border-zinc-700/50 text-istk-text">
            {step.stepNumber}
          </div>

          {/* Step Info */}
          <div className="min-w-0 flex-1">
            <h4 className="font-bold text-istk-text mb-1">{step.name}</h4>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-istk-textMuted">Agent: <span className="font-mono text-istk-accent">{step.agentRole}</span></span>
              <span className={cn("px-2 py-0.5 rounded text-xs font-semibold", config.badge)}>
                {config.icon} {config.label}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Thinking Lines (if working/completed) */}
      {(step.thinkingLine1 || step.thinkingLine2) && (
        <div className="mb-4 p-3 rounded-lg bg-zinc-800/30 border border-zinc-700/30">
          <p className="text-xs text-istk-textMuted font-mono">
            {step.thinkingLine1 && <div>{step.thinkingLine1}</div>}
            {step.thinkingLine2 && <div>{step.thinkingLine2}</div>}
          </p>
        </div>
      )}

      {/* Error Message (if failed) */}
      {step.errorMessage && (
        <div className="mb-4 p-3 rounded-lg bg-red-900/20 border border-red-700/30">
          <p className="text-xs text-red-300 font-mono">{step.errorMessage}</p>
        </div>
      )}

      {/* Output (if completed/approved) */}
      {step.output && (
        <div className="mb-4 p-4 rounded-lg bg-zinc-800/20 border border-zinc-700/30 max-h-60 overflow-y-auto">
          <p className="text-xs text-istk-textMuted font-mono whitespace-pre-wrap break-words">
            {step.output.substring(0, 500)}
            {step.output.length > 500 && "..."}
          </p>
        </div>
      )}

      {/* Review Notes (if reviewed) */}
      {step.reviewNotes && (
        <div className="mb-4 p-3 rounded-lg bg-amber-900/10 border border-amber-700/30">
          <p className="text-xs text-amber-300 mb-1 font-semibold">Review Notes:</p>
          <p className="text-xs text-amber-200">{step.reviewNotes}</p>
        </div>
      )}

      {/* Timestamps */}
      <div className="flex items-center justify-between text-xs text-istk-textDim mb-4 pt-3 border-t border-zinc-700/30">
        {step.startedAt && <span>Started: {new Date(step.startedAt).toLocaleTimeString()}</span>}
        {step.completedAt && <span>Completed: {new Date(step.completedAt).toLocaleTimeString()}</span>}
        {step.reviewedAt && <span>Reviewed: {new Date(step.reviewedAt).toLocaleTimeString()}</span>}
      </div>

      {/* Review Gate Buttons (if awaiting_review) */}
      {step.status === "awaiting_review" && (
        <div className="flex gap-2 pt-3 border-t border-amber-700/30">
          <button
            onClick={onReject}
            disabled={isLoading}
            className="flex-1 px-3 py-2 rounded-lg text-xs font-semibold bg-red-600/20 text-red-300 border border-red-600/40 hover:bg-red-600/30 hover:border-red-600/60 transition-all disabled:opacity-50"
          >
            {isLoading ? "Processing..." : "Reject"}
          </button>
          <button
            onClick={onApprove}
            disabled={isLoading}
            className="flex-1 px-3 py-2 rounded-lg text-xs font-semibold bg-green-600/20 text-green-300 border border-green-600/40 hover:bg-green-600/30 hover:border-green-600/60 transition-all disabled:opacity-50"
          >
            {isLoading ? "Processing..." : "Approve"}
          </button>
        </div>
      )}
    </div>
  );
}
