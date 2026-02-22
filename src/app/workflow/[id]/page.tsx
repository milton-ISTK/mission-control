"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { ArrowLeft, Clock } from "lucide-react";
import Link from "next/link";
import StepCard from "@/components/workflows/StepCard";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import WorkflowProgress from "@/components/workflows/WorkflowProgress";
import { cn } from "@/lib/utils";

const statusBadgeStyles = {
  active: "bg-blue-500/20 border-blue-500/40 text-blue-300",
  paused_for_review: "bg-amber-500/20 border-amber-500/40 text-amber-300",
  completed: "bg-green-500/20 border-green-500/40 text-green-300",
  failed: "bg-red-500/20 border-red-500/40 text-red-300",
  pending: "bg-zinc-500/20 border-zinc-500/40 text-zinc-300",
  cancelled: "bg-zinc-500/20 border-zinc-500/40 text-zinc-300",
  paused: "bg-amber-500/20 border-amber-500/40 text-amber-300",
  running: "bg-blue-500/20 border-blue-500/40 text-blue-300",
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

export default function WorkflowDetailPage() {
  const params = useParams();
  const workflowId = (params?.id as string) || "";

  const [feedbackText, setFeedbackText] = useState("");
  const [selectedHeadlineIndex, setSelectedHeadlineIndex] = useState<number | null>(null);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [pendingStepId, setPendingStepId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const workflow = useQuery(api.workflows.getWorkflow, { id: workflowId as any });
  const steps = useQuery(api.workflows.getWorkflowSteps, { workflowId: workflowId as any });
  const templates = useQuery(api.workflows.getWorkflowTemplates, {});

  const approveStep = useMutation(api.workflows.approveStepFromUI);
  const rejectStep = useMutation(api.workflows.rejectStepFromUI);

  if (workflow === undefined || steps === undefined || templates === undefined) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="animate-pulse text-istk-textDim">Loading workflow...</div>
      </div>
    );
  }

  if (!workflow) {
    return (
      <div className="p-8">
        <div className="text-istk-textMuted">Workflow not found</div>
        <Link href="/workflows" className="mt-4 text-istk-accent hover:underline">
          Back to Workflows
        </Link>
      </div>
    );
  }

  // Find the template for this workflow
  const template = templates?.find((t) => t._id === workflow.templateId);

  const contentTypeLabel = {
    blog_post: "📝 Blog Post",
    social_image: "🖼️ Social Image",
    x_thread: "𝕏 Thread",
    linkedin_post: "💼 LinkedIn Post",
  }[workflow.contentType] || workflow.contentType;

  const title = `${contentTypeLabel}: ${workflow.selectedAngle}`;
  const statusBadge = statusBadgeStyles[workflow.status as keyof typeof statusBadgeStyles] || statusBadgeStyles.pending;
  const awaitingReviewStep = steps.find((s) => s.status === "awaiting_review");

  const handleApproveClick = (stepId: string) => {
    setPendingStepId(stepId);
    setFeedbackText("");
    setApproveDialogOpen(true);
  };

  const handleRejectClick = (stepId: string) => {
    setPendingStepId(stepId);
    setFeedbackText("");
    setRejectDialogOpen(true);
  };

  const handleConfirmApprove = async () => {
    if (!pendingStepId) return;

    setIsProcessing(true);
    try {
      await approveStep({
        stepId: pendingStepId as any,
        reviewNotes: feedbackText || undefined,
        selectedOption: selectedHeadlineIndex !== null ? selectedHeadlineIndex : undefined,
      });
      setApproveDialogOpen(false);
      setPendingStepId(null);
      setFeedbackText("");
      setSelectedHeadlineIndex(null);
    } catch (err) {
      console.error("Error approving step:", err);
      alert("Failed to approve step");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmReject = async () => {
    if (!pendingStepId) return;

    setIsProcessing(true);
    try {
      await rejectStep({
        stepId: pendingStepId as any,
        reviewNotes: feedbackText || "Rejected by reviewer",
      });
      setRejectDialogOpen(false);
      setPendingStepId(null);
      setFeedbackText("");
    } catch (err) {
      console.error("Error rejecting step:", err);
      alert("Failed to reject step");
    } finally {
      setIsProcessing(false);
    }
  };

  // Sort steps by stepNumber for display
  const sortedSteps = [...steps].sort((a, b) => a.stepNumber - b.stepNumber);

  return (
    <div className="p-8 space-y-6 max-w-4xl">
      {/* Back Button */}
      <Link
        href="/workflows"
        className="inline-flex items-center gap-2 text-sm text-istk-textMuted hover:text-istk-accent transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Workflows
      </Link>

      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-3xl font-bold text-gradient text-glow mb-2">{title}</h1>
            <div className="flex items-center gap-3 flex-wrap">
              <div className={cn("px-3 py-1 rounded-lg text-sm font-semibold border", statusBadge)}>
                {workflow.status === "paused_for_review" ? "⏸️ Paused for Review" : workflow.status}
              </div>
              <div className="flex items-center gap-1 text-sm text-istk-textMuted">
                <Clock className="w-4 h-4" />
                <span>Created {timeAgo(workflow.createdAt)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800/50">
          <p className="text-xs text-istk-textMuted mb-3 font-semibold uppercase tracking-wider">Progress</p>
          <WorkflowProgress
            totalSteps={template?.steps?.length || 0}
            currentStep={workflow.currentStepNumber}
            status={workflow.status}
          />
          <p className="text-xs text-istk-textMuted mt-3">
            Step {workflow.currentStepNumber} of {template?.steps?.length || 0}
          </p>
        </div>
      </div>

      {/* Pause Alert */}
      {workflow.status === "paused_for_review" && awaitingReviewStep && (
        <div className="p-4 rounded-xl bg-amber-900/30 border border-amber-700/50">
          <p className="text-sm font-semibold text-amber-300 mb-2">⏸️ Workflow Paused</p>
          <p className="text-xs text-amber-200">
            Step {awaitingReviewStep.stepNumber} ({awaitingReviewStep.name}) is awaiting your review and approval.
          </p>
        </div>
      )}

      {/* Steps */}
      <div className="space-y-3">
        <h2 className="text-lg font-bold text-istk-text">Workflow Steps</h2>

        {sortedSteps.length === 0 ? (
          <div className="text-sm text-istk-textMuted text-center py-8">No steps found</div>
        ) : (
          sortedSteps.map((step) => (
            <StepCard
              key={step._id}
              step={step}
              allSteps={sortedSteps}
              onApprove={() => handleApproveClick(step._id)}
              onReject={() => handleRejectClick(step._id)}
              feedbackText={feedbackText}
              onFeedbackChange={setFeedbackText}
              selectedHeadlineIndex={pendingStepId === step._id ? selectedHeadlineIndex : null}
              onHeadlineSelect={pendingStepId === step._id ? setSelectedHeadlineIndex : undefined}
              isSubmitting={isProcessing && pendingStepId === step._id}
            />
          ))
        )}
      </div>

      {/* Approve Dialog */}
      <ConfirmDialog
        isOpen={approveDialogOpen}
        onClose={() => !isProcessing && setApproveDialogOpen(false)}
        onConfirm={handleConfirmApprove}
        title="Approve Step"
        message="Content approved. The workflow will advance to the next step."
        isDangerous={false}
        isLoading={isProcessing}
      />

      {/* Reject Dialog */}
      <ConfirmDialog
        isOpen={rejectDialogOpen}
        onClose={() => !isProcessing && setRejectDialogOpen(false)}
        onConfirm={handleConfirmReject}
        title="Reject Step"
        message={`This content will be sent back for revision.\n\nFeedback: ${feedbackText || "(none)"}`}
        isDangerous={true}
        isLoading={isProcessing}
      />
    </div>
  );
}
