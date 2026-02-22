"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import ContentLightbox from "@/components/workflows/ContentLightbox";

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
  createdAt?: string;
  reviewNotes?: string;
  reviewedAt?: string;
}

interface StepCardProps {
  step: WorkflowStep;
  allSteps?: WorkflowStep[];
  onApprove?: () => void;
  onReject?: () => void;
  feedbackText?: string;
  onFeedbackChange?: (text: string) => void;
  selectedHeadlineIndex?: number | null;
  onHeadlineSelect?: (index: number) => void;
  onSaveEditedContent?: (stepId: string, editedContent: string) => Promise<void>;
  isSubmitting?: boolean;
}

const statusConfig = {
  pending: {
    icon: "○",
    color: "text-zinc-400",
    bg: "bg-zinc-900/40",
    border: "border-zinc-700/50",
    badge: "bg-zinc-700 text-zinc-300",
  },
  agent_working: {
    icon: "⏳",
    color: "text-blue-400",
    bg: "bg-blue-900/20",
    border: "border-blue-700/40",
    badge: "bg-blue-600 text-blue-100 animate-pulse",
  },
  completed: {
    icon: "✅",
    color: "text-green-400",
    bg: "bg-green-900/20",
    border: "border-green-700/40",
    badge: "bg-green-600 text-green-100",
  },
  awaiting_review: {
    icon: "⏸️",
    color: "text-amber-400",
    bg: "bg-amber-900/30",
    border: "border-amber-700/50",
    badge: "bg-amber-600 text-amber-100",
  },
  approved: {
    icon: "✓",
    color: "text-green-400",
    bg: "bg-green-900/20",
    border: "border-green-700/40",
    badge: "bg-green-600 text-green-100",
  },
  rejected: {
    icon: "✕",
    color: "text-red-400",
    bg: "bg-red-900/20",
    border: "border-red-700/40",
    badge: "bg-red-600 text-red-100",
  },
  failed: {
    icon: "❌",
    color: "text-red-400",
    bg: "bg-red-900/20",
    border: "border-red-700/40",
    badge: "bg-red-600 text-red-100",
  },
  skipped: {
    icon: "⊘",
    color: "text-zinc-400",
    bg: "bg-zinc-900/20",
    border: "border-zinc-700/40",
    badge: "bg-zinc-600 text-zinc-100",
  },
};

function formatDuration(startedAt?: string, completedAt?: string): string {
  if (!startedAt || !completedAt) return "";
  const start = new Date(startedAt).getTime();
  const end = new Date(completedAt).getTime();
  const seconds = Math.floor((end - start) / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h`;
}

function parseContent(content?: string): { type: "json" | "text"; data: any } {
  if (!content) return { type: "text", data: "" };
  try {
    const parsed = JSON.parse(content);
    return { type: "json", data: parsed };
  } catch {
    return { type: "text", data: content };
  }
}

function renderContent(content?: string, agentRole?: string, isInput: boolean = false): React.ReactNode {
  const { type, data } = parseContent(content);

  if (type === "json") {
    // JSON display
    if (Array.isArray(data)) {
      return (
        <div className="space-y-2">
          {data.map((item, idx) => (
            <div key={idx} className="text-xs text-istk-textMuted">
              <span className="font-semibold text-istk-accent">{idx + 1}.</span> {JSON.stringify(item).substring(0, 100)}...
            </div>
          ))}
        </div>
      );
    } else if (typeof data === "object") {
      return <pre className="text-xs text-istk-textMuted overflow-x-auto">{JSON.stringify(data, null, 2).substring(0, 500)}...</pre>;
    }
  }

  // Text/HTML display
  if (typeof data === "string") {
    // Check if it's HTML
    if (data.includes("<") && data.includes(">")) {
      return <div className="text-xs text-istk-textMuted whitespace-pre-wrap break-words">{data.substring(0, 300)}...</div>;
    }
    // Plain text
    return <div className="text-xs text-istk-textMuted whitespace-pre-wrap break-words max-h-40 overflow-y-auto">{data}</div>;
  }

  return <div className="text-xs text-istk-textDim">No content</div>;
}

export default function StepCard({
  step,
  allSteps,
  onApprove,
  onReject,
  feedbackText = "",
  onFeedbackChange,
  selectedHeadlineIndex = null,
  onHeadlineSelect,
  onSaveEditedContent,
  isSubmitting = false,
}: StepCardProps) {
  const [isExpanded, setIsExpanded] = useState(step.status === "awaiting_review" || step.status === "agent_working");
  const [showLightbox, setShowLightbox] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const config = statusConfig[step.status as keyof typeof statusConfig] || statusConfig.pending;

  const duration = formatDuration(step.startedAt, step.completedAt);
  const isCompletedOrApproved = step.status === "completed" || step.status === "approved";
  const isAwaitingReview = step.status === "awaiting_review";

  // Determine if this is a blog content step
  const isBlogContentStep = ["blog_writer", "humanizer"].includes(step.agentRole) || step.name === "Content Review";
  const isHtmlStep = step.agentRole === "html_builder";

  // Helper to clean escape sequences
  const cleanEscapes = (text: string): string => {
    return text
      .replace(/\\n/g, "\n")
      .replace(/\\u2014/g, "—")
      .replace(/\\u2019/g, "'")
      .replace(/\\u201c/g, "\u201c")
      .replace(/\\u201d/g, "\u201d")
      .replace(/\\"/g, '"')
      .replace(/\\(?![n"u])/g, ''); // Remove stray backslashes
  };

  // Helper: recursively parse value if it's a JSON string
  const tryParseJsonString = (value: any): any => {
    if (typeof value !== "string" || !value.startsWith("{")) {
      return value;
    }
    try {
      const inner = JSON.parse(value);
      // Check if the inner object has content fields
      if (typeof inner === "object" && inner !== null) {
        const content =
          inner.revisedContent ||
          inner.content ||
          inner.result?.revisedContent ||
          inner.result?.content;
        if (content) return content;
        return inner;
      }
      return inner;
    } catch {
      return value; // Not JSON, keep as-is
    }
  };

  // Extract images from input (for Image Review step)
  const extractImages = (): Array<{ prompt: string; imageUrl: string; composition: string; description: string }> => {
    let source = step.input;
    if (!source) return [];

    try {
      const data = JSON.parse(source);
      if (Array.isArray(data)) {
        return data.filter(
          (item) =>
            item.prompt && item.imageUrl && item.composition && item.description
        );
      }
    } catch {
      // Not JSON, skip
    }
    return [];
  };

  // Extract blog content from output OR input (for review steps)
  const extractBlogContent = (): string => {
    // For review steps (agentRole 'none'), use the previous step's output
    let source = step.output;
    if ((step.agentRole === "none" || step.status === "awaiting_review") && allSteps) {
      const previousStep = allSteps.find((s) => s.stepNumber === step.stepNumber - 1);
      if (previousStep?.output) {
        source = previousStep.output;
      }
    }
    if (!source) return "";

    // DEBUG: Log raw source
    console.log("[StepCard extractBlogContent] Raw source length:", source.length);
    console.log("[StepCard extractBlogContent] First 300 chars:", source.substring(0, 300));

    // Keep parsing until we get to actual content (handle double-wrapped JSON)
    let data = source;
    for (let i = 0; i < 5; i++) {
      console.log(`[StepCard] Parse iteration ${i}, data type:`, typeof data, data.length || "N/A");
      try {
        const parsed = JSON.parse(data);
        if (typeof parsed === "string") {
          console.log(`[StepCard] Iteration ${i}: Found JSON string, unwrapping...`);
          data = parsed; // It was a JSON-encoded string, unwrap it
          continue;
        }
        
        // It's an object — look for content fields
        // Check ALL possible nested paths for blog content
        let value =
          // Direct fields
          parsed.revisedContent ||
          parsed.content ||
          parsed.blogContent ||
          parsed.text ||
          // Nested under "output"
          parsed.output?.revisedContent ||
          parsed.output?.content ||
          parsed.output?.blogContent ||
          // Nested under "result"
          parsed.result?.revisedContent ||
          parsed.result?.content ||
          parsed.result?.blogContent ||
          parsed.result?.output?.revisedContent ||
          parsed.result?.output?.content ||
          // Humanizer output
          parsed.humanizedOutput?.revisedContent ||
          parsed.humanizedOutput?.content ||
          parsed.humanizedOutput?.result?.content ||
          parsed.humanizedOutput?.result?.revisedContent ||
          // Blog writer output
          parsed.blogOutput?.content ||
          parsed.blogOutput?.result?.content ||
          parsed.blogOutput?.revisedContent ||
          // Sentiment/News output
          parsed.sentimentOutput?.content ||
          parsed.sentimentOutput?.result?.content ||
          // Fallback: JSON stringify
          JSON.stringify(parsed);

        console.log(`[StepCard] Found content field at iteration ${i}, length: ${typeof value === 'string' ? value.length : 'N/A'}`);

        // If the value is itself a JSON string, parse it again
        value = tryParseJsonString(value);

        data = value;
        break;
      } catch (e) {
        console.log(`[StepCard] Iteration ${i}: Not valid JSON, stopping parse loop. Error:`, e instanceof Error ? e.message : String(e));
        break; // Not JSON, we have the raw content
      }
    }

    // Clean escape sequences and return
    const finalContent = typeof data === "string" ? data : JSON.stringify(data, null, 2);
    console.log("[StepCard] Final extracted content length:", finalContent.length);
    return cleanEscapes(finalContent);
  };

  // Extract HTML content from a step's output
  const extractHtmlFromStep = (stepToExtract: WorkflowStep): string => {
    if (!stepToExtract.output) return "";
    try {
      const parsed = JSON.parse(stepToExtract.output);
      const html =
        parsed.html ||
        parsed.htmlContent ||
        parsed.result?.html ||
        parsed.result?.htmlContent ||
        parsed.output?.result?.html ||
        parsed.output?.result?.htmlContent ||
        stepToExtract.output;
      return typeof html === "string" ? html : JSON.stringify(html, null, 2);
    } catch {
      return stepToExtract.output;
    }
  };

  // Extract HTML content from current step
  const extractHtmlContent = (): string => {
    return extractHtmlFromStep(step);
  };

  const handlePreviewHtml = () => {
    const html = extractHtmlContent();
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
  };

  const handlePreviewPreviousStepHtml = () => {
    if (!allSteps) return;
    const previousStep = allSteps.find((s) => s.stepNumber === step.stepNumber - 1);
    if (!previousStep) return;
    const html = extractHtmlFromStep(previousStep);
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
  };

  const handleCopyHtml = () => {
    const html = extractHtmlContent();
    navigator.clipboard.writeText(html).then(() => {
      alert("HTML copied to clipboard!");
    });
  };

  const handleSaveEditedContent = async (editedContent: string) => {
    if (!onSaveEditedContent) return;
    setIsSaving(true);
    try {
      await onSaveEditedContent(step._id, editedContent);
      setEditMode(false);
      setShowLightbox(false);
      // Auto-approve after saving
      onApprove?.();
    } catch (err) {
      console.error("Failed to save edited content:", err);
      alert("Failed to save edited content");
    } finally {
      setIsSaving(false);
    }
  };

  // Parse headline_generator output to extract headline options
  const extractHeadlineOptions = (): Array<{
    headline: string;
    subtitle?: string;
    hookLine?: string;
    style?: string;
    engagementScore?: number;
  }> => {
    if (!step.output) return [];
    try {
      const parsed = JSON.parse(step.output);
      if (parsed.headlines && Array.isArray(parsed.headlines)) {
        return parsed.headlines;
      }
      return [];
    } catch {
      return [];
    }
  };

  // Detect if previous step is html_builder
  const previousStep = allSteps ? allSteps.find((s) => s.stepNumber === step.stepNumber - 1) : null;
  const previousStepIsHtmlBuilder = previousStep?.agentRole === "html_builder";

  return (
    <div className={cn("rounded-xl border transition-all", config.bg, config.border)}>
      {/* Header — Always visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          "w-full p-4 flex items-start justify-between gap-3 hover:bg-white/[0.02] transition-colors",
          isExpanded && "border-b",
          config.border
        )}
      >
        {/* Left: Icon + Info */}
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className={cn("text-xl shrink-0 mt-0.5", config.color)}>{config.icon}</div>
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline gap-2 mb-1 flex-wrap">
              <h4 className="font-bold text-istk-text">Step {step.stepNumber}: {step.name}</h4>
              <span className={cn("px-2 py-0.5 rounded text-xs font-semibold", config.badge)}>
                {step.status === "agent_working" ? "Working" : step.status}
              </span>
            </div>
            <p className="text-xs text-istk-textMuted">
              Agent: <span className="font-mono text-istk-accent">{step.agentRole}</span>
              {duration && <span className="ml-2">• {duration}</span>}
            </p>
          </div>
        </div>

        {/* Right: Expand toggle */}
        <div className={cn("text-istk-textMuted transition-transform shrink-0", isExpanded && "rotate-180")}>
          ▼
        </div>
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="p-4 space-y-4 border-t border-white/5">
          {/* Headline Picker (for headline_generator awaiting review) */}
          {step.agentRole === "headline_generator" && isAwaitingReview && (() => {
            const headlines = extractHeadlineOptions();
            return (
              <div>
                <p className="text-xs font-semibold text-istk-text mb-3">📰 Select a headline option:</p>
                <div className="grid grid-cols-1 gap-3">
                  {headlines.map((option, idx) => (
                    <button
                      key={idx}
                      onClick={() => onHeadlineSelect?.(idx)}
                      className={cn(
                        "p-4 rounded-lg text-left transition-all border-2",
                        selectedHeadlineIndex === idx
                          ? "border-istk-accent bg-istk-accent/10 shadow-lg shadow-istk-accent/20"
                          : "border-zinc-700/50 bg-zinc-900/30 hover:border-istk-accent/50"
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={cn(
                            "w-5 h-5 rounded-full border-2 shrink-0 mt-0.5 flex items-center justify-center",
                            selectedHeadlineIndex === idx
                              ? "border-istk-accent bg-istk-accent"
                              : "border-zinc-600"
                          )}
                        >
                          {selectedHeadlineIndex === idx && (
                            <span className="text-xs font-bold text-black">✓</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-istk-text text-sm mb-1">
                            {option.headline}
                          </h3>
                          {option.subtitle && (
                            <p className="text-xs text-istk-textMuted mb-2">
                              {option.subtitle}
                            </p>
                          )}
                          {option.hookLine && (
                            <p className="text-xs italic text-istk-textDim">
                              "{option.hookLine}"
                            </p>
                          )}
                          <div className="flex items-center gap-3 mt-2 text-xs text-istk-textMuted">
                            {option.style && (
                              <span className="px-2 py-1 rounded bg-zinc-800/50">
                                {option.style}
                              </span>
                            )}
                            {option.engagementScore !== undefined && (
                              <span>⭐ {option.engagementScore}/10</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            );
          })()}

          {/* Thinking Lines */}
          {(step.thinkingLine1 || step.thinkingLine2) && step.status === "agent_working" && (
            <div className="p-3 rounded-lg bg-blue-900/20 border border-blue-700/30">
              <p className="text-xs text-blue-300 font-mono">
                {step.thinkingLine1}
                {step.thinkingLine1 && step.thinkingLine2 && <br />}
                {step.thinkingLine2}
              </p>
            </div>
          )}

          {/* Error Message */}
          {step.errorMessage && (
            <div className="p-3 rounded-lg bg-red-900/20 border border-red-700/30">
              <p className="text-xs text-red-300 font-semibold mb-1">Error:</p>
              <p className="text-xs text-red-200 font-mono">{step.errorMessage}</p>
            </div>
          )}

          {/* Input Content (for review steps) */}
          {isAwaitingReview && step.input && (
            <div className="p-3 rounded-lg bg-amber-900/10 border border-amber-700/30">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-amber-300">📄 Content to Review:</p>
                {previousStepIsHtmlBuilder ? (
                  <button
                    onClick={handlePreviewPreviousStepHtml}
                    className="text-xs px-2 py-1 rounded bg-green-600/20 text-green-300 border border-green-600/40 hover:bg-green-600/30 transition-all"
                  >
                    🌐 Preview HTML Page
                  </button>
                ) : isBlogContentStep ? (
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditMode(false);
                        setShowLightbox(true);
                      }}
                      className="text-xs px-2 py-1 rounded bg-amber-600/20 text-amber-300 border border-amber-600/40 hover:bg-amber-600/30 transition-all"
                    >
                      📖 Read Content
                    </button>
                    {previousStepIsHtmlBuilder === false && step.stepNumber > 1 && (
                      <button
                        onClick={() => {
                          setEditMode(true);
                          setShowLightbox(true);
                        }}
                        className="text-xs px-2 py-1 rounded bg-orange-600/20 text-orange-300 border border-orange-600/40 hover:bg-orange-600/30 transition-all"
                      >
                        ✏️ Edit Content
                      </button>
                    )}
                  </div>
                ) : null}
              </div>
              <div className="text-xs text-amber-100 max-h-60 overflow-y-auto">{renderContent(step.input, step.agentRole, true)}</div>
            </div>
          )}

          {/* Output Content */}
          {step.output && !isAwaitingReview && (
            <div className="p-3 rounded-lg bg-zinc-800/30 border border-zinc-700/30">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-istk-textMuted">📋 Output:</p>
                {isBlogContentStep && (
                  <button
                    onClick={() => setShowLightbox(true)}
                    className="text-xs px-2 py-1 rounded bg-blue-600/20 text-blue-300 border border-blue-600/40 hover:bg-blue-600/30 transition-all"
                  >
                    📖 Read Content
                  </button>
                )}
                {isHtmlStep && (
                  <div className="flex gap-2">
                    <button
                      onClick={handlePreviewHtml}
                      className="text-xs px-2 py-1 rounded bg-green-600/20 text-green-300 border border-green-600/40 hover:bg-green-600/30 transition-all"
                    >
                      🌐 Preview HTML Page
                    </button>
                    <button
                      onClick={handleCopyHtml}
                      className="text-xs px-2 py-1 rounded bg-blue-600/20 text-blue-300 border border-blue-600/40 hover:bg-blue-600/30 transition-all"
                    >
                      📋 Copy HTML
                    </button>
                  </div>
                )}
              </div>
              <div className="text-xs text-istk-textMuted max-h-60 overflow-y-auto">{renderContent(step.output, step.agentRole)}</div>
            </div>
          )}

          {/* Review Notes */}
          {step.reviewNotes && (
            <div className="p-3 rounded-lg bg-blue-900/10 border border-blue-700/30">
              <p className="text-xs font-semibold text-blue-300 mb-1">💬 Review Notes:</p>
              <p className="text-xs text-blue-200">{step.reviewNotes}</p>
            </div>
          )}

          {/* Image Picker (for Image Review step) */}
          {isAwaitingReview && step.name === "Image Review" && (() => {
            const images = extractImages();
            return images.length > 0 ? (
              <div className="space-y-3">
                <p className="text-xs font-semibold text-istk-text mb-2">Select your preferred image:</p>
                <div className="grid grid-cols-3 gap-2">
                  {images.map((image, idx) => (
                    <div
                      key={idx}
                      onClick={() => setSelectedImageIndex(idx)}
                      className={cn(
                        "relative cursor-pointer rounded-lg overflow-hidden transition-all",
                        selectedImageIndex === idx
                          ? "ring-2 ring-istk-accent"
                          : "ring-1 ring-zinc-700 hover:ring-istk-accent/50"
                      )}
                    >
                      {/* Image */}
                      <img
                        src={image.imageUrl}
                        alt={image.composition}
                        className="w-full aspect-square object-cover"
                      />
                      
                      {/* Overlay with info */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-2">
                        <p className="text-xs font-semibold text-istk-accent capitalize">{image.composition}</p>
                        <p className="text-[10px] text-istk-textMuted line-clamp-2">{image.description}</p>
                      </div>
                      
                      {/* Selection indicator */}
                      {selectedImageIndex === idx && (
                        <div className="absolute top-1 right-1 w-6 h-6 rounded-full bg-istk-accent flex items-center justify-center">
                          <span className="text-xs font-bold text-black">✓</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : null;
          })()}

          {/* Feedback Textarea (for awaiting_review, non-image steps) */}
          {isAwaitingReview && step.name !== "Image Review" && (
            <textarea
              value={feedbackText}
              onChange={(e) => onFeedbackChange?.(e.target.value)}
              placeholder="Leave feedback for approval or rejection..."
              className="w-full p-3 rounded-lg bg-zinc-800 border border-zinc-700 text-xs text-istk-text placeholder-istk-textDim focus:outline-none focus:ring-2 focus:ring-istk-accent/50 resize-none h-20"
            />
          )}

          {/* Timestamps */}
          <div className="flex items-center justify-between text-xs text-istk-textDim pt-2 border-t border-white/5">
            {step.startedAt && <span>Started: {new Date(step.startedAt).toLocaleTimeString()}</span>}
            {step.completedAt && <span>Completed: {new Date(step.completedAt).toLocaleTimeString()}</span>}
            {step.reviewedAt && <span>Reviewed: {new Date(step.reviewedAt).toLocaleTimeString()}</span>}
          </div>

          {/* Action Buttons (for awaiting_review) */}
          {isAwaitingReview && (
            <div className="flex gap-2 pt-2">
              <button
                onClick={onReject}
                disabled={isSubmitting}
                className="flex-1 px-3 py-2 rounded-lg text-xs font-semibold bg-red-600/20 text-red-300 border border-red-600/40 hover:bg-red-600/30 transition-all disabled:opacity-50"
              >
                {isSubmitting ? "Processing..." : "❌ Reject & Redo"}
              </button>
              <button
                onClick={onApprove}
                disabled={isSubmitting}
                className="flex-1 px-3 py-2 rounded-lg text-xs font-semibold bg-green-600/20 text-green-300 border border-green-600/40 hover:bg-green-600/30 transition-all disabled:opacity-50"
              >
                {isSubmitting ? "Processing..." : "✅ Approve & Continue"}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Content Lightbox */}
      <ContentLightbox
        isOpen={showLightbox}
        onClose={() => setShowLightbox(false)}
        title={editMode ? "✏️ Edit Blog Content" : isBlogContentStep ? "📖 Blog Content" : "Content"}
        content={isBlogContentStep ? extractBlogContent() : ""}
        mode={editMode ? "edit" : "html"}
        onSave={editMode ? handleSaveEditedContent : undefined}
        isSaving={isSaving}
        children={
          isAwaitingReview ? (
            <div className="flex gap-2 w-full">
              <button
                onClick={onReject}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 rounded-lg text-sm font-semibold bg-red-600/20 text-red-600 border border-red-600/40 hover:bg-red-600/30 transition-all disabled:opacity-50"
              >
                ❌ Reject & Redo
              </button>
              <button
                onClick={onApprove}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 rounded-lg text-sm font-semibold bg-green-600/20 text-green-600 border border-green-600/40 hover:bg-green-600/30 transition-all disabled:opacity-50"
              >
                ✅ Approve & Continue
              </button>
            </div>
          ) : null
        }
      />
    </div>
  );
}
