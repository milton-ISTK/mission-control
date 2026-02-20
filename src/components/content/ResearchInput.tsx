"use client";

import { useState, useEffect, useCallback } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import {
  Search,
  Sparkles,
  Loader2,
  Brain,
  ChevronDown,
  AlertTriangle,
} from "lucide-react";
import {
  LLM_MODELS,
  DEFAULT_MODEL,
  getModelGroups,
  findModel,
  getStoredApiKey,
  getProviderDisplayName,
} from "@/lib/llm-models";

export default function ResearchInput() {
  const [topic, setTopic] = useState("");
  const [llmModel, setLlmModel] = useState(DEFAULT_MODEL);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiKeyAvailable, setApiKeyAvailable] = useState(true);
  const createResearch = useMutation(api.contentPipeline.createResearch);

  const selectedModel = findModel(llmModel);
  const groups = getModelGroups();

  // Re-check API key availability whenever the selected model changes
  const checkApiKey = useCallback(() => {
    if (!selectedModel) {
      setApiKeyAvailable(false);
      return;
    }
    const key = getStoredApiKey(selectedModel.provider);
    setApiKeyAvailable(key.length > 0);
  }, [selectedModel]);

  useEffect(() => {
    checkApiKey();
  }, [checkApiKey]);

  // Also re-check when window regains focus (user may have just saved keys in Settings)
  useEffect(() => {
    const onFocus = () => checkApiKey();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [checkApiKey]);

  const canSubmit = topic.trim().length > 0 && apiKeyAvailable && !isSubmitting;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || !selectedModel) return;

    setIsSubmitting(true);
    try {
      const storedKey = getStoredApiKey(selectedModel.provider);
      await createResearch({
        topic: topic.trim(),
        llmModel,
        llmProvider: selectedModel.provider,
        llmApiKey: storedKey || undefined,
      });
      setTopic("");
    } catch (err) {
      console.error("Failed to create research request:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const providerDisplayName = selectedModel
    ? getProviderDisplayName(selectedModel.provider)
    : "this provider";

  return (
    <div className="glass-panel">
      {/* Header */}
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
            Choose an LLM and submit a topic — the daemon will research it with
            Brave Search &amp; sentiment analysis
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        {/* LLM Selector — full width */}
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
                  <option key={m.id} value={m.id}>
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

        {/* Topic Input + Submit Button */}
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder={
                apiKeyAvailable
                  ? 'e.g. "Bitcoin ETF inflows Q1 2026" or "AI agent crypto narrative"'
                  : `⚠ No API key configured for ${providerDisplayName}`
              }
              className="glass-input pr-4 text-sm w-full transition-all duration-200"
              style={
                !apiKeyAvailable
                  ? {
                      borderColor: "rgba(239,68,68,0.7)",
                      boxShadow: "0 0 8px rgba(239,68,68,0.15), inset 0 0 4px rgba(239,68,68,0.05)",
                      background: "rgba(239,68,68,0.04)",
                    }
                  : undefined
              }
              disabled={isSubmitting}
            />
          </div>
          <button
            type="submit"
            disabled={!canSubmit}
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

        {/* API Key Warning */}
        {!apiKeyAvailable && (
          <div
            className="flex items-center gap-2.5 px-4 py-2.5 rounded-lg text-sm animate-in fade-in slide-in-from-top-1 duration-200"
            style={{
              background: "rgba(239,68,68,0.06)",
              border: "1px solid rgba(239,68,68,0.25)",
            }}
          >
            <AlertTriangle
              className="w-4 h-4 shrink-0"
              style={{ color: "rgb(248,113,113)" }}
            />
            <span style={{ color: "rgb(252,165,165)" }}>
              No API key configured for <strong>{providerDisplayName}</strong>.{" "}
              <a
                href="/settings"
                className="underline underline-offset-2 font-medium transition-colors"
                style={{ color: "rgb(248,113,113)" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "rgb(252,165,165)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "rgb(248,113,113)")}
              >
                Add it in Settings →
              </a>
            </span>
          </div>
        )}
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
