"use client";

import { ArrowLeft, Calendar, Tag, FileText, Trash2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import Badge from "@/components/common/Badge";
import Button from "@/components/common/Button";
import { useDeleteMemory } from "@/hooks/useMemories";
import { formatDate, formatRelative } from "@/lib/utils";
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

interface MemoryDetailsProps {
  memory: Memory;
  onBack: () => void;
}

export default function MemoryDetails({ memory, onBack }: MemoryDetailsProps) {
  const deleteMemory = useDeleteMemory();

  const handleDelete = async () => {
    if (confirm("Delete this memory?")) {
      await deleteMemory({ id: memory._id });
      onBack();
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      {/* Back Button + Actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-istk-textMuted hover:text-istk-accent transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Memories
        </button>
        <Button variant="danger" onClick={handleDelete}>
          <span className="flex items-center gap-2">
            <Trash2 className="w-4 h-4" />
            Delete
          </span>
        </Button>
      </div>

      {/* Header Card */}
      <div className="neu-panel">
        <div className="flex items-start gap-4 mb-4">
          <div className="w-12 h-12 rounded-xl bg-istk-accent/10 flex items-center justify-center shrink-0">
            <FileText className="w-6 h-6 text-istk-accent" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-istk-text mb-2">
              {memory.title}
            </h1>
            <div className="flex items-center gap-4 flex-wrap">
              {/* Date */}
              <div className="flex items-center gap-1.5 text-sm text-istk-textMuted">
                <Calendar className="w-4 h-4" />
                {formatDate(memory.date)}
              </div>

              {/* Source */}
              <span className="text-sm text-istk-textDim font-mono">
                {memory.source}
              </span>

              {/* Category */}
              {memory.category && (
                <Badge
                  variant={memory.category === "long-term" ? "info" : "purple"}
                >
                  {memory.category}
                </Badge>
              )}

              {memory.isToday && <Badge variant="success">Today</Badge>}
            </div>
          </div>
        </div>

        {/* Tags */}
        {memory.tags.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap mt-4 pt-4 border-t border-istk-border/20">
            <Tag className="w-4 h-4 text-istk-textDim" />
            {memory.tags.map((tag) => (
              <Badge key={tag} variant="default">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="neu-panel">
        <div className="prose prose-invert prose-sm max-w-none
          prose-headings:text-istk-text prose-headings:font-bold
          prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg
          prose-p:text-istk-textMuted prose-p:leading-relaxed
          prose-a:text-istk-accent prose-a:no-underline hover:prose-a:underline
          prose-strong:text-istk-text
          prose-code:text-istk-accent prose-code:bg-istk-bg prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
          prose-pre:bg-istk-bg prose-pre:border prose-pre:border-istk-border/20 prose-pre:rounded-xl
          prose-ul:text-istk-textMuted prose-ol:text-istk-textMuted
          prose-li:text-istk-textMuted
          prose-blockquote:border-istk-accent prose-blockquote:text-istk-textMuted
          prose-hr:border-istk-border/20
        ">
          <ReactMarkdown>{memory.content}</ReactMarkdown>
        </div>
      </div>

      {/* Metadata Footer */}
      <div className="flex items-center justify-between text-xs text-istk-textDim">
        <span>Created: {formatRelative(memory.createdAt)}</span>
        <span>Updated: {formatRelative(memory.updatedAt)}</span>
      </div>
    </div>
  );
}
