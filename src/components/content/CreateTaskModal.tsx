"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import Modal from "@/components/common/Modal";
import Button from "@/components/common/Button";
import { Loader2, Rocket, FileText, Image, MessageSquare, Briefcase, Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface ContentAngle {
  title: string;
  description: string;
  targetAudience: string;
  tone: string;
  hookLine: string;
}

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedAngle: ContentAngle | null;
  researchId: Id<"contentResearch">;
}

const contentTypes = [
  { key: "blog_post", label: "📝 Blog Post", icon: FileText },
  { key: "social_image", label: "🖼️ Social Image", icon: Image },
  { key: "x_thread", label: "𝕏 Thread", icon: MessageSquare },
  { key: "linkedin_post", label: "💼 LinkedIn", icon: Briefcase },
] as const;

type ContentType = (typeof contentTypes)[number]["key"];

const workflowStepsMap: Record<ContentType, string[]> = {
  blog_post: [
    "Sentiment Scraping",
    "News Scraping",
    "Blog Writing",
    "SEO Optimization",
    "Final Review",
  ],
  social_image: [
    "Sentiment Scraping",
    "Visual Research",
    "Image Generation",
    "Caption Writing",
    "Final Review",
  ],
  x_thread: [
    "Sentiment Scraping",
    "News Scraping",
    "Thread Writing",
    "Hook Optimization",
    "Final Review",
  ],
  linkedin_post: [
    "Sentiment Scraping",
    "News Scraping",
    "Post Writing",
    "Professional Tone Review",
    "Final Review",
  ],
};

export default function CreateTaskModal({
  isOpen,
  onClose,
  selectedAngle,
  researchId,
}: CreateTaskModalProps) {
  const [contentType, setContentType] = useState<ContentType | null>(null);
  const [authorId, setAuthorId] = useState<Id<"authors"> | null>(null);
  const [briefing, setBriefing] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const createWorkflow = useMutation(api.workflows.createWorkflow);
  const authors = useQuery(api.authors.getAuthors, {});

  const handleCreateTask = async () => {
    if (!selectedAngle || !contentType) return;
    
    // For blog posts, author is required
    if (contentType === "blog_post" && !authorId) {
      setError("Author is required for blog posts");
      return;
    }

    setIsCreating(true);
    setError(null);
    try {
      await createWorkflow({
        sourceResearchId: researchId,
        selectedAngle: selectedAngle.title,
        contentType,
        briefing: briefing || undefined,
        authorId: authorId || undefined,
      });

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setBriefing("");
        setContentType(null);
        onClose();
      }, 1500);
    } catch (err) {
      console.error("Failed to create workflow:", err);
      setError(err instanceof Error ? err.message : "Failed to create workflow");
    } finally {
      setIsCreating(false);
    }
  };

  const handleClose = () => {
    setBriefing("");
    setContentType(null);
    setError(null);
    setSuccess(false);
    onClose();
  };

  const steps = contentType ? workflowStepsMap[contentType] : [];

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Create Content Task" size="lg">
      <div className="flex flex-col gap-4">
        {/* Success state */}
        {success && (
          <div
            className="flex items-center gap-3 px-4 py-3 rounded-xl"
            style={{
              background: "rgba(52,211,153,0.08)",
              border: "1px solid rgba(52,211,153,0.20)",
            }}
          >
            <Rocket className="w-5 h-5 text-istk-success" />
            <span className="text-sm text-istk-success font-medium">
              Workflow created! Starting first step…
            </span>
          </div>
        )}

        {/* Show selected angle */}
        {selectedAngle && !success && (
          <>
            <div
              className="p-4 rounded-lg"
              style={{
                background: "rgba(255,107,0,0.04)",
                border: "1px solid rgba(255,107,0,0.15)",
              }}
            >
              <p className="text-sm font-semibold text-istk-accent">
                {selectedAngle.title}
              </p>
              <p className="text-sm text-istk-textMuted mt-1">
                {selectedAngle.description}
              </p>
              <p
                className="text-xs mt-2 italic"
                style={{ color: "rgba(255,107,0,0.7)" }}
              >
                &ldquo;{selectedAngle.hookLine}&rdquo;
              </p>
              <div className="flex items-center justify-between mt-2 text-xs text-istk-textDim">
                <span>🎯 {selectedAngle.targetAudience}</span>
                <span className="italic">{selectedAngle.tone}</span>
              </div>
            </div>

            {/* Content type selector */}
            <div>
              <label className="block text-sm font-medium text-istk-text mb-2">
                Content Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                {contentTypes.map((ct) => (
                  <button
                    key={ct.key}
                    onClick={() => setContentType(ct.key)}
                    className={cn(
                      "p-3 rounded-lg text-sm font-medium transition-all duration-200",
                      contentType === ct.key
                        ? "text-white"
                        : "text-istk-textMuted hover:text-istk-text"
                    )}
                    style={
                      contentType === ct.key
                        ? {
                            background: "rgba(255,107,0,0.25)",
                            border: "1px solid rgba(255,107,0,0.50)",
                            boxShadow: "0 0 12px rgba(255,107,0,0.15)",
                          }
                        : {
                            background: "rgba(255,255,255,0.02)",
                            border: "1px solid rgba(255,255,255,0.06)",
                          }
                    }
                  >
                    {ct.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Author selector (for blog posts) */}
            {contentType === "blog_post" && (
              <div>
                <label className="block text-sm font-medium text-istk-text mb-2">
                  Author <span className="text-istk-warning">*</span>
                </label>
                <select
                  value={authorId || ""}
                  onChange={(e) => setAuthorId((e.target.value as any) || null)}
                  className="w-full px-3 py-2 rounded-lg text-sm"
                  style={{
                    background: "rgba(10,10,14,0.60)",
                    border: "1px solid rgba(255,107,0,0.12)",
                    color: "rgb(240,240,245)",
                  }}
                >
                  <option value="">Select an author...</option>
                  {authors && authors.length > 0 ? (
                    authors
                      .filter((a: any) => a.isActive)
                      .map((author: any) => (
                        <option key={author._id} value={author._id}>
                          {author.name} — {author.title}
                        </option>
                      ))
                  ) : (
                    <option disabled>No authors available</option>
                  )}
                </select>
              </div>
            )}

            {/* Additional instructions */}
            <div>
              <label className="block text-sm font-medium text-istk-text mb-2">
                Additional Instructions (optional)
              </label>
              <textarea
                value={briefing}
                onChange={(e) => setBriefing(e.target.value)}
                placeholder="e.g., Focus on regulatory angle. Mention our PowerBank partnership."
                className="glass-input text-sm w-full min-h-[80px] rounded-lg p-3"
              />
            </div>

            {/* Show workflow steps preview */}
            {contentType && steps.length > 0 && (
              <div
                className="p-3 rounded-lg"
                style={{
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <p className="text-xs font-semibold text-istk-textDim uppercase mb-2">
                  Workflow Steps
                </p>
                <ol className="text-xs text-istk-textMuted space-y-1">
                  {steps.map((step, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <span
                        className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
                        style={{
                          background: "rgba(255,107,0,0.10)",
                          border: "1px solid rgba(255,107,0,0.20)",
                          color: "rgb(255,107,0)",
                        }}
                      >
                        {idx + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {/* Error message */}
            {error && (
              <div
                className="px-4 py-2 rounded-lg text-sm text-istk-danger"
                style={{
                  background: "rgba(248,113,113,0.06)",
                  border: "1px solid rgba(248,113,113,0.15)",
                }}
              >
                {error}
              </div>
            )}

            {/* Action buttons */}
            <div className="flex gap-3 justify-end mt-2">
              <Button variant="ghost" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                variant="accent"
                onClick={handleCreateTask}
                isLoading={isCreating}
                disabled={!contentType || isCreating}
              >
                🚀 Start Workflow
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
