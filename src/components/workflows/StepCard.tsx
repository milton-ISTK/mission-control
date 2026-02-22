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
  outputOptions?: string[];
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
  selectedImageIndex?: number | null;
  onImageSelect?: (index: number) => void;
  onSaveEditedContent?: (stepId: string, editedContent: string) => Promise<void>;
  isSubmitting?: boolean;
}

// Default emoji icons for agents (maps agentRole to emoji)
const AGENT_EMOJIS: Record<string, string> = {
  research_enhancer: "🔬",
  sentiment_scraper: "📊",
  news_scraper: "📰",
  blog_writer: "✍️",
  humanizer: "🧑",
  html_builder: "🏗️",
  headline_generator: "💡",
  image_maker: "🎨",
  copywriter: "📝",
  social_publisher: "📢",
  publisher: "📢",
  "none": "✓️", // Review gates
};

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
  selectedImageIndex: externalSelectedImageIndex = null,
  onImageSelect,
  onSaveEditedContent,
  isSubmitting = false,
}: StepCardProps) {
  const [isExpanded, setIsExpanded] = useState(step.status === "awaiting_review" || step.status === "agent_working");
  const [showLightbox, setShowLightbox] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [internalSelectedImageIndex, setInternalSelectedImageIndex] = useState<number | null>(null);
  
  // Use external selection if provided (from parent), otherwise use internal state
  const selectedImageIndex = externalSelectedImageIndex ?? internalSelectedImageIndex;
  const setSelectedImageIndex = onImageSelect ?? setInternalSelectedImageIndex;
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
  const extractImages = (): Array<{ name?: string; prompt?: string; url?: string; imageUrl?: string; storageId?: string; mimeType?: string; composition?: string; description?: string }> => {
    const images: any[] = [];
    
    // First priority: outputOptions (array of JSON strings)
    if (step.outputOptions && Array.isArray(step.outputOptions)) {
      for (const optStr of step.outputOptions) {
        try {
          const opt = JSON.parse(optStr);
          images.push(opt);
        } catch {
          // Skip invalid JSON
        }
      }
    }
    
    // Second: try to parse input as array of images
    if (images.length === 0 && step.input) {
      try {
        const data = JSON.parse(step.input);
        // Case 1: raw array of image objects
        if (Array.isArray(data) && data.length > 0) {
          images.push(...data);
        }
        // Case 2: object with "images" key
        else if (data.images && Array.isArray(data.images)) {
          images.push(...data.images);
        }
      } catch {
        // Not JSON, skip
      }
    }
    
    // Third: try output as array of images
    if (images.length === 0 && step.output) {
      try {
        const data = JSON.parse(step.output);
        // Case 1: raw array
        if (Array.isArray(data)) {
          images.push(...data);
        }
        // Case 2: object with "images" key
        else if (data.images && Array.isArray(data.images)) {
          images.push(...data.images);
        }
      } catch {
        // Not JSON, skip
      }
    }
    
    // Filter to only valid image objects (must have a URL field)
    return images.filter((item) => item && (item.url || item.imageUrl));
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

  // Check if this is an image review step (case-insensitive)
  const isImageReview = step.name?.toLowerCase().includes('image review');

  // Parse images from step data with flexible field detection
  const extractImageReviewImages = (): Array<{ name: string; prompt: string; url: string }> => {
    let images: Array<any> = [];
    
    // Try each field in order: output, input
    for (const field of [step.output, step.input]) {
      if (!field || typeof field !== 'string') continue;
      
      try {
        const parsed = JSON.parse(field);
        
        // Direct array of image objects
        if (Array.isArray(parsed) && parsed[0]?.url) {
          images = parsed;
          break;
        }
        
        // Object with images array
        if (parsed.images?.length) {
          images = parsed.images;
          break;
        }
        
        // Nested output field
        if (typeof parsed.output === 'string') {
          const inner = JSON.parse(parsed.output);
          if (Array.isArray(inner) && inner[0]?.url) {
            images = inner;
            break;
          }
          if (inner.images?.length) {
            images = inner.images;
            break;
          }
        }
      } catch {
        // Continue to next field
      }
    }
    
    return images.map((img) => ({
      name: img.name || img.composition || `Image`,
      prompt: img.prompt || img.description || '',
      url: img.url || img.imageUrl || '',
    })).filter((img) => img.url);
  };

  // Parse headline_generator output to extract headline options (flexible)
  const extractHeadlineOptions = (): Array<{
    headline: string;
    subtitle?: string;
    hookLine?: string;
    style?: string;
    engagementScore?: number;
  }> => {
    if (!step.output) {
      console.log("[StepCard] No step.output for headline extraction");
      return [];
    }

    let data: any = step.output;
    
    // Try to parse JSON (may be wrapped multiple times)
    for (let i = 0; i < 3; i++) {
      if (typeof data !== 'string') break;
      try {
        data = JSON.parse(data);
      } catch {
        break;
      }
    }

    console.log("[StepCard] Extracted headline data type:", typeof data, "is array?", Array.isArray(data));

    // Case 1: Direct array of headline objects
    if (Array.isArray(data) && data.length > 0 && data[0]?.headline) {
      console.log("[StepCard] Found direct array of headlines, count:", data.length);
      return data;
    }

    // Case 2: Object with headlines array
    if (typeof data === 'object' && data !== null && data.headlines && Array.isArray(data.headlines) && data.headlines.length > 0) {
      console.log("[StepCard] Found headlines in .headlines property, count:", data.headlines.length);
      return data.headlines;
    }

    // Case 3: Object with output.headlines
    if (typeof data === 'object' && data !== null && data.output?.headlines && Array.isArray(data.output.headlines)) {
      console.log("[StepCard] Found headlines in .output.headlines");
      return data.output.headlines;
    }

    // Case 4: Object with result property containing headlines
    if (typeof data === 'object' && data !== null && data.result?.headlines && Array.isArray(data.result.headlines)) {
      console.log("[StepCard] Found headlines in .result.headlines");
      return data.result.headlines;
    }

    // Case 5: Direct array of objects with headline field
    if (Array.isArray(data)) {
      console.log("[StepCard] Trying direct array even though no headline field detected");
      return data;
    }

    console.log("[StepCard] Could not extract headlines from data. Data keys:", typeof data === 'object' && data !== null ? Object.keys(data) : 'N/A');
    return [];
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
              Agent: 
              <span className="font-mono text-istk-accent ml-1">
                {AGENT_EMOJIS[step.agentRole] && <span className="mr-1">{AGENT_EMOJIS[step.agentRole]}</span>}
                {step.agentRole}
              </span>
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
            
            // Debug: if no headlines, show what we got
            if (headlines.length === 0) {
              return (
                <div className="p-3 rounded-lg bg-red-900/20 border border-red-700/30">
                  <p className="text-xs text-red-300 font-semibold mb-2">⚠️ No headlines extracted</p>
                  <p className="text-xs text-red-200 mb-2">Raw step.output:</p>
                  <pre className="text-xs text-red-100 bg-red-950/30 p-2 rounded overflow-x-auto max-h-40">
                    {step.output?.substring(0, 500)}
                  </pre>
                </div>
              );
            }
            
            return (
              <div>
                <p className="text-xs font-semibold text-istk-text mb-3">📰 Select a headline option:</p>
                <div className="grid grid-cols-1 gap-3">
                  {headlines.map((option, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        console.log("[DEBUG] Headline clicked - index:", idx, "option:", option);
                        onHeadlineSelect?.(idx);
                      }}
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

          {/* Input Content (for review steps) — Skip if image review or headline picker */}
          {isAwaitingReview && step.input && !isImageReview && step.agentRole !== "headline_generator" && (
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

          {/* Image Review UI (flexible detection + improved parsing) */}
          {isAwaitingReview && isImageReview && (() => {
            const images = extractImageReviewImages();
            if (images.length === 0) {
              return <div className="text-xs text-istk-textMuted">No images found in step output.</div>;
            }
            return (
              <div className="space-y-3">
                <p className="text-sm text-gray-400">🎨 Select your preferred hero image ({images.length} options)</p>
                {images.map((img, i) => (
                  <div
                    key={i}
                    onClick={() => setSelectedImageIndex(i)}
                    className={`rounded-lg border-2 p-3 cursor-pointer transition-all flex items-start gap-4 ${
                      selectedImageIndex === i
                        ? 'border-orange-500 bg-orange-500/10'
                        : 'border-gray-700 bg-gray-800/50 hover:border-gray-500'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full border-2 mt-1 flex-shrink-0 flex items-center justify-center ${
                        selectedImageIndex === i ? 'border-orange-500 bg-orange-500' : 'border-gray-600'
                      }`}
                    >
                      {selectedImageIndex === i && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                    <img
                      src={img.url}
                      alt={img.name}
                      className="w-24 h-16 rounded object-cover flex-shrink-0 bg-gray-900"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-white capitalize">{img.name}</h4>
                      <p className="text-xs text-gray-400 mt-1 line-clamp-2">{img.prompt}</p>
                    </div>
                    <a
                      href={img.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="px-3 py-1.5 text-xs font-medium rounded-md bg-gray-700 text-gray-200 hover:bg-gray-600 flex-shrink-0"
                    >
                      👁 View
                    </a>
                  </div>
                ))}
                {selectedImageIndex === null && (
                  <div className="text-sm text-amber-400/70 bg-amber-400/10 rounded-lg px-3 py-2">
                    👆 Select an image above to enable approval
                  </div>
                )}
              </div>
            );
          })()}

          {/* Feedback Textarea (for awaiting_review, non-image steps) */}
          {isAwaitingReview && step.name?.toLowerCase().includes("content review") && (
            <div>
              <label className="block text-xs font-semibold text-istk-text mb-2">
                ✏️ Revision Instructions for the Writer
              </label>
              <textarea
                value={feedbackText}
                onChange={(e) => onFeedbackChange?.(e.target.value)}
                placeholder="e.g. Include the DREC tokenization volume ($5M). Add this source: https://... Shorter intro. More emphasis on regulatory comparison."
                className="w-full p-3 rounded-lg bg-zinc-800 border border-zinc-700 text-xs text-istk-text placeholder-istk-textDim focus:outline-none focus:ring-2 focus:ring-istk-accent/50 resize-none min-h-[120px]"
              />
            </div>
          )}

          {/* Timestamps */}
          <div className="flex items-center justify-between text-xs text-istk-textDim pt-2 border-t border-white/5">
            {step.startedAt && <span>Started: {new Date(step.startedAt).toLocaleTimeString()}</span>}
            {step.completedAt && <span>Completed: {new Date(step.completedAt).toLocaleTimeString()}</span>}
            {step.reviewedAt && <span>Reviewed: {new Date(step.reviewedAt).toLocaleTimeString()}</span>}
          </div>

          {/* Action Buttons (for awaiting_review) */}
          {isAwaitingReview && (
            <div className="flex gap-2 pt-4">
              <button
                onClick={onReject}
                disabled={isSubmitting}
                className="flex-1 px-3 py-2 rounded-lg text-xs font-semibold bg-red-600/20 text-red-300 border border-red-600/40 hover:bg-red-600/30 transition-all disabled:opacity-50"
              >
                {isSubmitting ? "Processing..." : "❌ Reject & Redo"}
              </button>
              <button
                onClick={() => {
                  // For image review steps, pass selectedImageIndex as selectedOption
                  if (isImageReview && selectedImageIndex !== null) {
                    // Wrap the approve with selectedOption if image review
                    const originalOnApprove = onApprove;
                    // TODO: Pass selectedOption to parent (it should be handled via onImageSelect callback)
                  }
                  onApprove?.();
                }}
                disabled={
                  isSubmitting ||
                  (isImageReview && selectedImageIndex === null)
                }
                className={cn(
                  "flex-1 px-3 py-2 rounded-lg text-xs font-semibold transition-all",
                  isImageReview && selectedImageIndex === null
                    ? "bg-zinc-700/50 text-zinc-600 border border-zinc-700 cursor-not-allowed"
                    : "bg-green-600/20 text-green-300 border border-green-600/40 hover:bg-green-600/30 cursor-pointer"
                )}
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
