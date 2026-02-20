"use client";

import { useState, useEffect, useCallback } from "react";
import { Bot, Shield, AlertTriangle } from "lucide-react";
import { useCreateSubagent } from "@/hooks/useAgents";
import Modal from "@/components/common/Modal";
import Button from "@/components/common/Button";
import { Input, Select, Textarea } from "@/components/common/Input";
import {
  LLM_MODELS,
  DEFAULT_MODEL,
  getModelGroups,
  findModel,
  getStoredApiKey,
  getProviderDisplayName,
} from "@/lib/llm-models";

interface CreateSubagentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/** Build grouped options for the Select component */
function buildLlmOptions() {
  const groups = getModelGroups();
  const options: { value: string; label: string; group?: string }[] = [];
  for (const group of groups) {
    const models = LLM_MODELS.filter((m) => m.group === group);
    for (const m of models) {
      options.push({ value: m.id, label: `${m.displayName}`, group });
    }
  }
  return options;
}

const LLM_OPTIONS = buildLlmOptions();

const ROLE_OPTIONS = [
  { value: "writer", label: "Writer" },
  { value: "designer", label: "Designer" },
  { value: "analyst", label: "Analyst" },
  { value: "developer", label: "Developer" },
  { value: "researcher", label: "Researcher" },
  { value: "assistant", label: "Assistant" },
  { value: "custom", label: "Custom" },
];

const initialForm = {
  name: "",
  llm: DEFAULT_MODEL,
  role: "assistant",
  description: "",
  apiKey: "",
  systemPrompt: "",
};

export default function CreateSubagentModal({ isOpen, onClose }: CreateSubagentModalProps) {
  const createSubagent = useCreateSubagent();
  const [form, setForm] = useState(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiKeyAvailable, setApiKeyAvailable] = useState(true);

  const selectedModel = findModel(form.llm);

  // Check API key availability whenever model changes
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

  // Re-check when window regains focus
  useEffect(() => {
    const onFocus = () => checkApiKey();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [checkApiKey]);

  const providerDisplayName = selectedModel
    ? getProviderDisplayName(selectedModel.provider)
    : "this provider";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.name.trim()) {
      setError("Name is required");
      return;
    }

    if (!apiKeyAvailable) {
      setError(`No API key configured for ${providerDisplayName}. Add it in Settings first.`);
      return;
    }

    setIsSubmitting(true);
    try {
      const config = form.systemPrompt.trim()
        ? JSON.stringify({ systemPrompt: form.systemPrompt.trim() })
        : undefined;

      await createSubagent({
        name: form.name.trim(),
        llm: form.llm,
        role: form.role,
        description: form.description.trim() || undefined,
        hasApiKey: !!form.apiKey.trim(),
        config,
      });

      setForm(initialForm);
      onClose();
    } catch (err) {
      console.error("Failed to create subagent:", err);
      setError("Failed to create subagent. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setForm(initialForm);
    setError(null);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Create New Subagent" size="lg">
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {/* Agent Identity */}
        <div className="flex items-center gap-3 p-4 rounded-xl bg-istk-purple/5 border border-istk-purple/20">
          <Bot className="w-8 h-8 text-istk-purple shrink-0" />
          <div>
            <p className="text-sm font-medium text-istk-text">New Subagent</p>
            <p className="text-xs text-istk-textMuted">
              Configure a specialized AI agent with a custom model, role, and system prompt.
            </p>
          </div>
        </div>

        {/* Name */}
        <Input
          label="Agent Name"
          placeholder="e.g., Content Writer, Data Analyst, Code Reviewer"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          error={error && !form.name.trim() ? "Name is required" : undefined}
          autoFocus
        />

        {/* Model + Role Row */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-istk-text mb-1.5">
              LLM Model
            </label>
            <div className="relative">
              <select
                value={form.llm}
                onChange={(e) => setForm({ ...form, llm: e.target.value })}
                className="glass-input text-sm appearance-none cursor-pointer w-full pr-8"
              >
                {getModelGroups().map((group) => (
                  <optgroup key={group} label={group}>
                    {LLM_MODELS.filter((m) => m.group === group).map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.displayName}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
          </div>
          <Select
            label="Role"
            options={ROLE_OPTIONS}
            value={form.role}
            onChange={(e: any) => setForm({ ...form, role: e.target.value })}
          />
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

        {/* System Prompt */}
        <Textarea
          label="System Prompt"
          placeholder="You are a specialized AI assistant that..."
          value={form.systemPrompt}
          onChange={(e) => setForm({ ...form, systemPrompt: e.target.value })}
          className="min-h-[120px]"
        />

        {/* Description */}
        <Textarea
          label="Description (optional)"
          placeholder="Brief description of what this subagent does..."
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="min-h-[80px]"
        />

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-istk-danger/10 border border-istk-danger/20">
            <AlertTriangle className="w-4 h-4 text-istk-danger shrink-0" />
            <span className="text-xs text-istk-danger">{error}</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 justify-end pt-2 border-t border-istk-border/10">
          <Button variant="ghost" type="button" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            variant="accent"
            type="submit"
            isLoading={isSubmitting}
            disabled={!apiKeyAvailable}
          >
            Create Subagent
          </Button>
        </div>
      </form>
    </Modal>
  );
}
