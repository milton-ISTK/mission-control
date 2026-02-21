"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Clock } from "lucide-react";
import WorkflowProgress from "@/components/workflows/WorkflowProgress";
import { cn } from "@/lib/utils";

type WorkflowStatus = "all" | "active" | "paused_for_review" | "completed" | "failed";

const statusFilters: { label: string; value: WorkflowStatus }[] = [
  { label: "All", value: "all" },
  { label: "Active", value: "active" },
  { label: "Paused", value: "paused_for_review" },
  { label: "Completed", value: "completed" },
  { label: "Failed", value: "failed" },
];

const statusBadgeStyles = {
  active: "bg-blue-500/20 border-blue-500/40 text-blue-300",
  paused_for_review: "bg-amber-500/20 border-amber-500/40 text-amber-300",
  completed: "bg-green-500/20 border-green-500/40 text-green-300",
  failed: "bg-red-500/20 border-red-500/40 text-red-300",
  pending: "bg-zinc-500/20 border-zinc-500/40 text-zinc-300",
  cancelled: "bg-zinc-500/20 border-zinc-500/40 text-zinc-300",
  paused: "bg-amber-500/20 border-amber-500/40 text-amber-300",
  "running": "bg-blue-500/20 border-blue-500/40 text-blue-300",
};

function timeAgo(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export default function WorkflowsPage() {
  const [selectedStatus, setSelectedStatus] = useState<WorkflowStatus>("all");

  const workflows = useQuery(api.workflows.getAllWorkflows, {
    status: selectedStatus === "all" ? undefined : selectedStatus,
  });

  if (workflows === undefined) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="animate-pulse text-istk-textDim">Loading workflows...</div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gradient text-glow">Workflows</h1>
        <p className="text-istk-textMuted mt-1">
          {workflows.length} workflow{workflows.length !== 1 ? "s" : ""} found
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-zinc-800/50 pb-4">
        {statusFilters.map((filter) => (
          <button
            key={filter.value}
            onClick={() => setSelectedStatus(filter.value)}
            className={cn(
              "px-4 py-2 rounded-lg font-medium transition-all duration-300",
              selectedStatus === filter.value
                ? "bg-istk-accent/20 text-istk-accent border border-istk-accent/40"
                : "text-istk-textMuted hover:text-istk-text hover:bg-zinc-800/30 border border-transparent"
            )}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Workflow Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {workflows.map((workflow) => {
          const contentTypeLabel = {
            blog_post: "📝 Blog Post",
            social_image: "🖼️ Social Image",
            x_thread: "𝕏 Thread",
            linkedin_post: "💼 LinkedIn Post",
          }[workflow.contentType] || workflow.contentType;

          const title = `${contentTypeLabel}: ${workflow.selectedAngle}`;
          const statusBadge = statusBadgeStyles[workflow.status as keyof typeof statusBadgeStyles] || statusBadgeStyles.pending;

          return (
            <Link
              key={workflow._id}
              href={`/workflow/${workflow._id}`}
              className="group relative p-5 rounded-xl border border-zinc-800/50 bg-gradient-to-br from-zinc-900/50 to-zinc-800/20 hover:from-zinc-900/70 hover:to-zinc-800/40 transition-all duration-300 hover:border-istk-accent/30 hover:shadow-[0_0_20px_rgba(255,107,0,0.1)]"
            >
              {/* Content */}
              <div className="space-y-3">
                {/* Title + Status */}
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-sm font-bold text-istk-text group-hover:text-istk-accent transition-colors flex-1 line-clamp-2">
                    {title}
                  </h3>
                  <div
                    className={cn(
                      "px-2.5 py-1 rounded-lg text-xs font-semibold border whitespace-nowrap shrink-0",
                      statusBadge
                    )}
                  >
                    {workflow.status === "paused_for_review" ? "Paused" : workflow.status}
                  </div>
                </div>

                {/* Progress */}
                <WorkflowProgress
                  totalSteps={workflow.template?.steps?.length || 0}
                  currentStep={workflow.currentStepNumber}
                  status={workflow.status}
                />

                {/* Meta: Steps + Time */}
                <div className="flex items-center justify-between text-xs text-istk-textDim pt-2">
                  <span>Step {workflow.currentStepNumber} of {workflow.template?.steps?.length || 0}</span>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{timeAgo(workflow.createdAt)}</span>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Empty State */}
      {workflows.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="text-zinc-600 text-sm">No workflows found</div>
          <Link
            href="/content"
            className="mt-4 px-4 py-2 rounded-lg bg-istk-accent/20 text-istk-accent hover:bg-istk-accent/30 text-xs font-medium transition-colors"
          >
            Create a workflow
          </Link>
        </div>
      )}
    </div>
  );
}
