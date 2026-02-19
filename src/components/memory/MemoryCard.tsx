"use client";

import { Calendar, Tag, FileText } from "lucide-react";
import Badge from "@/components/common/Badge";
import { formatDate, cn } from "@/lib/utils";
import { Id } from "../../../convex/_generated/dataModel";

interface Memory {
  _id: Id<"memories">;
  title: string;
  content: string;
  source: string;
  category?: string;
  tags: string[];
  isToday: boolean;
  date: string;
  createdAt: string;
  updatedAt: string;
}

interface MemoryCardProps {
  memory: Memory;
  onClick: () => void;
}

export default function MemoryCard({ memory, onClick }: MemoryCardProps) {
  // Extract a text excerpt from content (strip markdown syntax)
  const excerpt = memory.content
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/\*\*|__/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/`{1,3}[^`]*`{1,3}/g, "")
    .replace(/\n+/g, " ")
    .trim()
    .slice(0, 200);

  const categoryColor = memory.category === "long-term" ? "info" : "purple";

  return (
    <button
      onClick={onClick}
      className="neu-card p-5 text-left w-full group"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-istk-accent/10 flex items-center justify-center shrink-0">
            <FileText className="w-4 h-4 text-istk-accent" />
          </div>
          <h4 className="text-sm font-semibold text-istk-text truncate group-hover:text-istk-accent transition-colors">
            {memory.title}
          </h4>
        </div>
        {memory.isToday && (
          <Badge variant="success">Today</Badge>
        )}
      </div>

      {/* Excerpt */}
      <p className="text-xs text-istk-textMuted line-clamp-3 mb-3 leading-relaxed">
        {excerpt || "No content"}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Date */}
          <div className="flex items-center gap-1 text-[10px] text-istk-textDim">
            <Calendar className="w-3 h-3" />
            {formatDate(memory.date)}
          </div>

          {/* Category */}
          {memory.category && (
            <Badge variant={categoryColor as any} className="text-[10px]">
              {memory.category}
            </Badge>
          )}
        </div>

        {/* Tags (show first 2) */}
        {memory.tags.length > 0 && (
          <div className="flex items-center gap-1">
            {memory.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="text-[9px] px-1.5 py-0.5 rounded bg-istk-surfaceLight text-istk-textDim"
              >
                {tag}
              </span>
            ))}
            {memory.tags.length > 2 && (
              <span className="text-[9px] text-istk-textDim">
                +{memory.tags.length - 2}
              </span>
            )}
          </div>
        )}
      </div>
    </button>
  );
}
