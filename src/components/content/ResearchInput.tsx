"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Search, Sparkles, Loader2 } from "lucide-react";

export default function ResearchInput() {
  const [topic, setTopic] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const createResearch = useMutation(api.contentPipeline.createResearch);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await createResearch({ topic: topic.trim() });
      setTopic("");
    } catch (err) {
      console.error("Failed to create research request:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="glass-panel">
      <div className="flex items-center gap-3 mb-4">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{
            background: "rgba(255,107,0,0.08)",
            border: "1px solid rgba(255,107,0,0.18)",
            boxShadow: "0 0 10px rgba(255,107,0,0.08)",
          }}
        >
          <Search className="w-5 h-5 text-istk-accent drop-shadow-[0_0_6px_rgba(255,107,0,0.4)]" />
        </div>
        <div>
          <h3
            className="font-semibold text-istk-text"
            style={{ textShadow: "0 0 12px rgba(255,107,0,0.12)" }}
          >
            Research a Topic
          </h3>
          <p className="text-xs text-istk-textDim">
            Enter a topic or idea — Opus will research it with Brave Search &amp;
            X.com sentiment analysis
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-3">
        <div className="flex-1 relative">
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder='e.g. "Bitcoin ETF inflows Q1 2026" or "AI agent crypto narrative"'
            className="glass-input pr-4 text-sm"
            disabled={isSubmitting}
          />
        </div>
        <button
          type="submit"
          disabled={!topic.trim() || isSubmitting}
          className="glass-button-accent flex items-center gap-2 whitespace-nowrap disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Submitting…
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Research This Idea
            </>
          )}
        </button>
      </form>

      <div className="flex items-center gap-4 mt-3 text-[10px] text-istk-textDim">
        <span className="flex items-center gap-1">
          <span
            className="w-1.5 h-1.5 rounded-full bg-istk-cyan"
            style={{ boxShadow: "0 0 4px rgba(0,217,255,0.4)" }}
          />
          Brave Search (7-day news)
        </span>
        <span className="flex items-center gap-1">
          <span
            className="w-1.5 h-1.5 rounded-full bg-istk-purple"
            style={{ boxShadow: "0 0 4px rgba(178,75,243,0.4)" }}
          />
          X.com Sentiment
        </span>
        <span className="flex items-center gap-1">
          <span
            className="w-1.5 h-1.5 rounded-full bg-istk-accent"
            style={{ boxShadow: "0 0 4px rgba(255,107,0,0.4)" }}
          />
          Claude Opus 4 Analysis
        </span>
      </div>
    </div>
  );
}
