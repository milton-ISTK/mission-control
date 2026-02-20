"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Search, Sparkles, Loader2, Brain, Key, ChevronDown } from "lucide-react";
import {
  LLM_MODELS,
  DEFAULT_MODEL,
  getModelGroups,
  findModel,
} from "@/lib/llm-models";

export default function ResearchInput() {
  const [topic, setTopic] = useState("");
  const [llmModel, setLlmModel] = useState(DEFAULT_MODEL);
  const [apiKey, setApiKey] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const createResearch = useMutation(api.contentPipeline.createResearch);

  const selectedModel = findModel(llmModel);
  const groups = getModelGroups();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await createResearch({
        topic: topic.trim(),
        llmModel,
        llmApiKey: apiKey.trim() || undefined,
      });
      setTopic("");
      // Don't clear API key — user likely wants to reuse it
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
            Choose an LLM, enter your API key, and submit a topic — the daemon
            will research it with Brave Search &amp; sentiment analysis
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        {/* LLM Selector + API Key Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* LLM Dropdown */}
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <Brain className="w-4 h-4 text-istk-cyan opacity-60" />
            </div>
            <select
              value={llmModel}
              onChange={(e) => setLlmModel(e.target.value)}
              className="glass-input pl-9 pr-8 text-sm appearance-none cursor-pointer w-full"
              disabled={isSubmitting}
            >
              {groups.map((group) => (
                <optgroup key={group} label={group}>
                  {LLM_MODELS.filter((m) => m.group === group).map((m) => (
                    <option key={m.modelId} value={m.modelId}>
                      {m.displayName}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <ChevronDown className="w-4 h-4 text-istk-textDim" />
            </div>
          </div>

          {/* API Key Input */}
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <Key className="w-4 h-4 text-istk-warning opacity-60" />
            </div>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="API Key (or leave blank for server default)"
              className="glass-input pl-9 text-sm w-full"
              disabled={isSubmitting}
              autoComplete="off"
            />
          </div>
        </div>

        {/* Topic Input + Submit Button */}
        <div className="flex gap-3">
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
        </div>
      </form>

      {/* Status badges */}
      <div className="flex flex-wrap items-center gap-4 mt-3 text-[10px] text-istk-textDim">
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
          {selectedModel
            ? `${selectedModel.displayName} Analysis`
            : "LLM Analysis"}
        </span>
      </div>
    </div>
  );
}
