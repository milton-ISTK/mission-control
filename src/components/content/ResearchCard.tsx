"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Doc } from "../../../convex/_generated/dataModel";
import ReactMarkdown from "react-markdown";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Clock,
  Loader2,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
  Trash2,
  Copy,
  Check,
  Sparkles,
  FileText,
  MessageSquare,
  Linkedin,
  Zap,
  Target,
  Quote,
  BarChart3,
  Lightbulb,
} from "lucide-react";
import Badge from "@/components/common/Badge";
import { cn, formatRelative } from "@/lib/utils";

type Research = Doc<"contentResearch">;

const sentimentConfig = {
  bullish: {
    icon: TrendingUp,
    color: "text-istk-success",
    bg: "rgba(52,211,153,0.08)",
    border: "rgba(52,211,153,0.20)",
    glow: "0 0 8px rgba(52,211,153,0.15)",
    label: "Bullish",
    variant: "success" as const,
  },
  neutral: {
    icon: Minus,
    color: "text-istk-warning",
    bg: "rgba(251,191,36,0.08)",
    border: "rgba(251,191,36,0.20)",
    glow: "0 0 8px rgba(251,191,36,0.15)",
    label: "Neutral",
    variant: "warning" as const,
  },
  bearish: {
    icon: TrendingDown,
    color: "text-istk-danger",
    bg: "rgba(248,113,113,0.08)",
    border: "rgba(248,113,113,0.20)",
    glow: "0 0 8px rgba(248,113,113,0.15)",
    label: "Bearish",
    variant: "critical" as const,
  },
};

const statusConfig: Record<
  string,
  { label: string; variant: string; icon: typeof Clock }
> = {
  pending: { label: "Pending", variant: "warning", icon: Clock },
  researching: { label: "Researching…", variant: "cyan", icon: Loader2 },
  ready: { label: "Ready for Review", variant: "high", icon: FileText },
  approved: { label: "Approved", variant: "success", icon: CheckCircle2 },
  rejected: { label: "Rejected", variant: "default", icon: XCircle },
  cancelled: { label: "Cancelled", variant: "default", icon: XCircle },
  generating: { label: "Generating Content…", variant: "purple", icon: Sparkles },
  complete: { label: "Complete", variant: "success", icon: CheckCircle2 },
};

export default function ResearchCard({ research }: { research: Research }) {
  const [expanded, setExpanded] = useState(
    research.status === "ready" || research.status === "complete"
  );
  const [selectedAngle, setSelectedAngle] = useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [showContent, setShowContent] = useState(false);

  const approveResearch = useMutation(api.contentPipeline.approveResearch);
  const rejectResearch = useMutation(api.contentPipeline.rejectResearch);
  const cancelResearch = useMutation(api.contentPipeline.cancelResearch);
  const deleteResearch = useMutation(api.contentPipeline.deleteResearch);

  const sentiment = research.sentiment
    ? sentimentConfig[research.sentiment as keyof typeof sentimentConfig]
    : null;
  const status = statusConfig[research.status] || statusConfig.pending;
  const StatusIcon = status.icon;

  const copyToClipboard = async (text: string, index: number) => {
    await navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleApprove = async () => {
    if (!selectedAngle && research.angles && research.angles.length > 0) {
      setSelectedAngle(research.angles[0]);
    }
    const angle = selectedAngle || research.angles?.[0] || research.topic;
    await approveResearch({ id: research._id, selectedAngle: angle });
  };

  const handleReject = async () => {
    await rejectResearch({ id: research._id });
  };

  const handleCancel = async () => {
    await cancelResearch({ id: research._id });
  };

  const handleDelete = async () => {
    await deleteResearch({ id: research._id });
  };

  return (
    <div
      className={cn(
        "glass-card overflow-visible transition-all duration-300",
        research.status === "ready" && "neon-border-orange"
      )}
    >
      {/* Header */}
      <div
        className="flex items-start justify-between p-5 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <StatusIcon
              className={cn(
                "w-4 h-4 shrink-0",
                research.status === "researching" && "animate-spin text-istk-cyan",
                research.status === "generating" && "animate-spin text-istk-purple",
                research.status === "pending" && "text-istk-warning",
                research.status === "ready" && "text-istk-accent",
                research.status === "complete" && "text-istk-success",
                research.status === "approved" && "text-istk-success",
                research.status === "rejected" && "text-istk-textDim"
              )}
            />
            <Badge variant={status.variant as any}>{status.label}</Badge>
            {sentiment && (
              <Badge variant={sentiment.variant}>
                <span className="flex items-center gap-1">
                  <sentiment.icon className="w-3 h-3" />
                  {sentiment.label}
                </span>
              </Badge>
            )}
          </div>
          <h3 className="text-base font-semibold text-istk-text truncate">
            {research.topic}
          </h3>
          {research.summary && (
            <p className="text-sm text-istk-textMuted mt-1 line-clamp-2">
              {research.summary}
            </p>
          )}
        </div>

        <div className="flex items-center gap-3 shrink-0 ml-4">
          <span className="text-[10px] text-istk-textDim">
            {formatRelative(research.createdAt)}
          </span>
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-istk-textDim" />
          ) : (
            <ChevronDown className="w-4 h-4 text-istk-textDim" />
          )}
        </div>
      </div>

      {/* Expanded Content */}
      {expanded && (
        <div className="px-5 pb-5 animate-fade-in">
          {/* Pending / Researching States */}
          {(research.status === "pending" ||
            research.status === "researching") && (
            <div className="flex flex-col gap-3">
              <div
                className="flex items-center gap-3 px-4 py-3 rounded-xl"
                style={{
                  background:
                    research.status === "researching"
                      ? "rgba(0,217,255,0.04)"
                      : "rgba(251,191,36,0.04)",
                  border: `1px solid ${
                    research.status === "researching"
                      ? "rgba(0,217,255,0.12)"
                      : "rgba(251,191,36,0.12)"
                  }`,
                }}
              >
                {research.status === "researching" ? (
                  <Loader2 className="w-4 h-4 text-istk-cyan animate-spin" />
                ) : (
                  <Clock className="w-4 h-4 text-istk-warning" />
                )}
                <span className="text-sm text-istk-textMuted">
                  {research.status === "researching"
                    ? "Opus is researching this topic — Brave Search + X.com sentiment analysis in progress…"
                    : "Waiting for Milton's research daemon to pick up this request…"}
                </span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleCancel();
                }}
                className="glass-button flex items-center gap-2 text-sm text-istk-textMuted hover:text-istk-danger w-fit"
              >
                <XCircle className="w-4 h-4" />
                Cancel Research
              </button>
            </div>
          )}

          {/* Research Report */}
          {research.status !== "pending" &&
            research.status !== "researching" && (
              <div className="flex flex-col gap-4">
                {/* Sentiment + Summary */}
                {sentiment && (
                  <div
                    className="flex items-start gap-3 px-4 py-3 rounded-xl"
                    style={{
                      background: sentiment.bg,
                      border: `1px solid ${sentiment.border}`,
                      boxShadow: sentiment.glow,
                    }}
                  >
                    <sentiment.icon
                      className={cn("w-5 h-5 mt-0.5 shrink-0", sentiment.color)}
                    />
                    <div>
                      <p className={cn("text-sm font-semibold", sentiment.color)}>
                        Overall Sentiment: {sentiment.label}
                      </p>
                      {research.summary && (
                        <p className="text-sm text-istk-textMuted mt-1">
                          {research.summary}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Key Narratives */}
                {research.narratives && research.narratives.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-istk-text mb-2 flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-istk-cyan" />
                      Key Narratives
                    </h4>
                    <div className="flex flex-col gap-2">
                      {research.narratives.map((n, i) => (
                        <div
                          key={i}
                          className="flex items-start gap-2 px-3 py-2 rounded-lg"
                          style={{
                            background: "rgba(0,217,255,0.03)",
                            border: "1px solid rgba(0,217,255,0.08)",
                          }}
                        >
                          <span className="text-istk-cyan text-xs font-bold mt-0.5 shrink-0">
                            {i + 1}.
                          </span>
                          <span className="text-sm text-istk-textMuted">{n}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Positioning Angles */}
                {research.angles && research.angles.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-istk-text mb-2 flex items-center gap-2">
                      <Target className="w-4 h-4 text-istk-accent" />
                      Suggested Angles for IntelliStake
                    </h4>
                    <div className="flex flex-col gap-2">
                      {research.angles.map((a, i) => (
                        <div
                          key={i}
                          className={cn(
                            "flex items-start gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all",
                            selectedAngle === a
                              ? "neon-border-orange"
                              : ""
                          )}
                          style={{
                            background:
                              selectedAngle === a
                                ? "rgba(255,107,0,0.06)"
                                : "rgba(255,107,0,0.02)",
                            border:
                              selectedAngle === a
                                ? undefined
                                : "1px solid rgba(255,107,0,0.06)",
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedAngle(a);
                          }}
                        >
                          <Lightbulb
                            className={cn(
                              "w-4 h-4 mt-0.5 shrink-0",
                              selectedAngle === a
                                ? "text-istk-accent"
                                : "text-istk-textDim"
                            )}
                          />
                          <span className="text-sm text-istk-textMuted">
                            {a}
                          </span>
                          {research.status === "ready" && (
                            <span className="text-[10px] text-istk-textDim ml-auto shrink-0">
                              {selectedAngle === a ? "Selected" : "Click to select"}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quote Opportunities */}
                {research.quotes && research.quotes.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-istk-text mb-2 flex items-center gap-2">
                      <Quote className="w-4 h-4 text-istk-purple" />
                      Quote Opportunities
                    </h4>
                    <div className="flex flex-col gap-2">
                      {research.quotes.map((q, i) => (
                        <div
                          key={i}
                          className="px-4 py-2 rounded-lg italic"
                          style={{
                            background: "rgba(178,75,243,0.03)",
                            borderLeft: "2px solid rgba(178,75,243,0.25)",
                          }}
                        >
                          <span className="text-sm text-istk-textMuted">
                            &ldquo;{q}&rdquo;
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Full Report (collapsible markdown) */}
                {research.fullReport && (
                  <details className="group">
                    <summary className="text-sm font-semibold text-istk-textMuted cursor-pointer flex items-center gap-2 py-2 hover:text-istk-text transition-colors">
                      <FileText className="w-4 h-4" />
                      Full Research Report
                      <ChevronDown className="w-3 h-3 group-open:rotate-180 transition-transform" />
                    </summary>
                    <div
                      className="mt-2 px-4 py-3 rounded-xl text-sm prose prose-invert prose-sm max-w-none"
                      style={{
                        background: "rgba(10,10,14,0.60)",
                        border: "1px solid rgba(255,107,0,0.06)",
                      }}
                    >
                      <ReactMarkdown>{research.fullReport}</ReactMarkdown>
                    </div>
                  </details>
                )}

                {/* Action Buttons — only for "ready" status */}
                {research.status === "ready" && (
                  <div
                    className="flex items-center gap-3 pt-3 mt-2"
                    style={{
                      borderTop: "1px solid rgba(255,107,0,0.06)",
                    }}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleApprove();
                      }}
                      className="glass-button-accent flex items-center gap-2 text-sm"
                    >
                      <Sparkles className="w-4 h-4" />
                      Use This Angle
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleReject();
                      }}
                      className="glass-button flex items-center gap-2 text-sm text-istk-textMuted hover:text-istk-danger"
                    >
                      <XCircle className="w-4 h-4" />
                      Try Different Angle
                    </button>
                  </div>
                )}

                {/* Selected angle display */}
                {research.selectedAngle &&
                  ["approved", "generating", "complete"].includes(
                    research.status
                  ) && (
                    <div
                      className="flex items-start gap-2 px-3 py-2 rounded-lg"
                      style={{
                        background: "rgba(52,211,153,0.04)",
                        border: "1px solid rgba(52,211,153,0.12)",
                      }}
                    >
                      <CheckCircle2 className="w-4 h-4 text-istk-success mt-0.5 shrink-0" />
                      <div>
                        <span className="text-xs text-istk-success font-semibold">
                          Selected Angle:
                        </span>
                        <p className="text-sm text-istk-textMuted">
                          {research.selectedAngle}
                        </p>
                      </div>
                    </div>
                  )}

                {/* Generated Content */}
                {(research.status === "complete" ||
                  research.status === "generating") && (
                  <div>
                    {research.status === "generating" && (
                      <div
                        className="flex items-center gap-3 px-4 py-3 rounded-xl mb-4"
                        style={{
                          background: "rgba(178,75,243,0.04)",
                          border: "1px solid rgba(178,75,243,0.12)",
                        }}
                      >
                        <Loader2 className="w-4 h-4 text-istk-purple animate-spin" />
                        <span className="text-sm text-istk-textMuted">
                          Generating 5 X posts + 5 LinkedIn posts…
                        </span>
                      </div>
                    )}

                    {research.xPosts && research.xPosts.length > 0 && (
                      <div className="mb-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowContent(!showContent);
                          }}
                          className="text-sm font-semibold text-istk-text mb-3 flex items-center gap-2 hover:text-istk-accent transition-colors"
                        >
                          <MessageSquare className="w-4 h-4 text-istk-cyan" />
                          Generated Content ({(research.xPosts?.length || 0) + (research.linkedinPosts?.length || 0)} posts)
                          {showContent ? (
                            <ChevronUp className="w-3 h-3" />
                          ) : (
                            <ChevronDown className="w-3 h-3" />
                          )}
                        </button>

                        {showContent && (
                          <div className="flex flex-col gap-4 animate-fade-in">
                            {/* X Posts */}
                            <div>
                              <h5 className="text-xs font-semibold text-istk-textDim uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                <span className="w-4 h-4 flex items-center justify-center text-istk-text font-bold">𝕏</span>
                                Posts ({research.xPosts.length})
                              </h5>
                              <div className="flex flex-col gap-2">
                                {research.xPosts.map((post, i) => (
                                  <div
                                    key={i}
                                    className="relative group px-4 py-3 rounded-lg"
                                    style={{
                                      background: "rgba(10,10,14,0.60)",
                                      border: "1px solid rgba(255,255,255,0.05)",
                                    }}
                                  >
                                    <p className="text-sm text-istk-text whitespace-pre-wrap pr-8">
                                      {post}
                                    </p>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        copyToClipboard(post, i);
                                      }}
                                      className="absolute top-2 right-2 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[rgba(255,107,0,0.06)]"
                                    >
                                      {copiedIndex === i ? (
                                        <Check className="w-3.5 h-3.5 text-istk-success" />
                                      ) : (
                                        <Copy className="w-3.5 h-3.5 text-istk-textDim" />
                                      )}
                                    </button>
                                    <span className="text-[10px] text-istk-textDim mt-1 block">
                                      {post.length}/280 chars
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* LinkedIn Posts */}
                            {research.linkedinPosts &&
                              research.linkedinPosts.length > 0 && (
                                <div>
                                  <h5 className="text-xs font-semibold text-istk-textDim uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                    <Linkedin className="w-4 h-4 text-[#0A66C2]" />
                                    LinkedIn Posts ({research.linkedinPosts.length})
                                  </h5>
                                  <div className="flex flex-col gap-2">
                                    {research.linkedinPosts.map((post, i) => (
                                      <div
                                        key={i}
                                        className="relative group px-4 py-3 rounded-lg"
                                        style={{
                                          background: "rgba(10,10,14,0.60)",
                                          border:
                                            "1px solid rgba(255,255,255,0.05)",
                                        }}
                                      >
                                        <p className="text-sm text-istk-text whitespace-pre-wrap pr-8">
                                          {post}
                                        </p>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            copyToClipboard(
                                              post,
                                              1000 + i
                                            );
                                          }}
                                          className="absolute top-2 right-2 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[rgba(255,107,0,0.06)]"
                                        >
                                          {copiedIndex === 1000 + i ? (
                                            <Check className="w-3.5 h-3.5 text-istk-success" />
                                          ) : (
                                            <Copy className="w-3.5 h-3.5 text-istk-textDim" />
                                          )}
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

          {/* Delete button (bottom-right) */}
          {["rejected", "complete", "cancelled"].includes(research.status) && (
            <div className="flex justify-end mt-3 pt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.03)" }}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete();
                }}
                className="glass-button-sm flex items-center gap-1.5 text-xs text-istk-textDim hover:text-istk-danger"
              >
                <Trash2 className="w-3 h-3" />
                Delete
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
