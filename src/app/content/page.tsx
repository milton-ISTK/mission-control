"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import {
  Sparkles,
  Search,
  TrendingUp,
  TrendingDown,
  Minus,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  FileText,
  Copy,
  ChevronDown,
  ChevronUp,
  Trash2,
  Zap,
} from "lucide-react";
import Badge from "@/components/common/Badge";
import { PageLoader } from "@/components/common/LoadingSpinner";
import { cn, formatRelative } from "@/lib/utils";
import ResearchInput from "@/components/content/ResearchInput";
import ResearchCard from "@/components/content/ResearchCard";

export default function ContentPipelinePage() {
  const research = useQuery(api.contentPipeline.listResearch, {});
  const stats = useQuery(api.contentPipeline.getStats);

  if (research === undefined) {
    return <PageLoader label="Loading content pipeline..." />;
  }

  const activeItems = research.filter(
    (r) => !["rejected", "complete", "cancelled"].includes(r.status)
  );
  const completedItems = research.filter((r) => r.status === "complete");
  const rejectedItems = research.filter((r) => r.status === "rejected");
  const cancelledItems = research.filter((r) => r.status === "cancelled");

  return (
    <div className="flex flex-col gap-8">
      {/* Hero */}
      <div>
        <h1
          className="text-3xl font-bold text-gradient mb-2"
          style={{ filter: "drop-shadow(0 0 20px rgba(255,107,0,0.2))" }}
        >
          Content Pipeline
        </h1>
        <p className="text-istk-textMuted">
          Research topics, generate insights, and produce content for
          IntelliStake.
        </p>
      </div>

      {/* Stats Row */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {[
            { label: "Total", value: stats.total, color: "text-istk-text" },
            { label: "Pending", value: stats.pending, color: "text-istk-warning" },
            { label: "Researching", value: stats.researching, color: "text-istk-cyan" },
            { label: "Ready", value: stats.ready, color: "text-istk-accent" },
            { label: "Approved", value: stats.approved, color: "text-istk-success" },
            { label: "Complete", value: stats.complete, color: "text-istk-purple" },
            { label: "Rejected", value: stats.rejected, color: "text-istk-textDim" },
            { label: "Cancelled", value: stats.cancelled, color: "text-istk-textDim" },
          ].map((s) => (
            <div
              key={s.label}
              className="glass-card-flat px-4 py-3 text-center"
            >
              <p className={cn("text-2xl font-bold", s.color)}>{s.value}</p>
              <p className="text-[10px] text-istk-textDim uppercase tracking-wider mt-1">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Research Input */}
      <ResearchInput />

      {/* Active Research Items */}
      {activeItems.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-istk-text mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-istk-accent drop-shadow-[0_0_6px_rgba(255,107,0,0.4)]" />
            Active Research
          </h2>
          <div className="flex flex-col gap-4">
            {activeItems.map((item) => (
              <ResearchCard key={item._id} research={item} />
            ))}
          </div>
        </div>
      )}

      {/* Completed Items */}
      {completedItems.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-istk-text mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-istk-success drop-shadow-[0_0_6px_rgba(52,211,153,0.4)]" />
            Completed ({completedItems.length})
          </h2>
          <div className="flex flex-col gap-4">
            {completedItems.map((item) => (
              <ResearchCard key={item._id} research={item} />
            ))}
          </div>
        </div>
      )}

      {/* Rejected Items */}
      {rejectedItems.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-istk-textDim mb-4 flex items-center gap-2">
            <XCircle className="w-5 h-5 text-istk-textDim" />
            Rejected ({rejectedItems.length})
          </h2>
          <div className="flex flex-col gap-4 opacity-60">
            {rejectedItems.map((item) => (
              <ResearchCard key={item._id} research={item} />
            ))}
          </div>
        </div>
      )}

      {/* Cancelled Items */}
      {cancelledItems.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-istk-textDim mb-4 flex items-center gap-2">
            <XCircle className="w-5 h-5 text-istk-textDim" />
            Cancelled ({cancelledItems.length})
          </h2>
          <div className="flex flex-col gap-4 opacity-60">
            {cancelledItems.map((item) => (
              <ResearchCard key={item._id} research={item} />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {research.length === 0 && (
        <div className="glass-panel text-center py-16">
          <Sparkles className="w-12 h-12 text-istk-accent mx-auto mb-4 drop-shadow-[0_0_10px_rgba(255,107,0,0.3)]" />
          <h3 className="text-lg font-semibold text-istk-text mb-2">
            No research yet
          </h3>
          <p className="text-sm text-istk-textMuted max-w-md mx-auto">
            Enter a topic above and click &quot;Research This Idea&quot; to get
            started. Milton&apos;s Opus subagent will search the web, analyse
            sentiment, and deliver a structured report.
          </p>
        </div>
      )}
    </div>
  );
}
