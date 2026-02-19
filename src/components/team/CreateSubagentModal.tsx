"use client";

import { useState } from "react";
import { Bot, Shield, AlertTriangle } from "lucide-react";
import { useCreateSubagent } from "@/hooks/useAgents";
import Modal from "@/components/common/Modal";
import Button from "@/components/common/Button";
import { Input, Select, Textarea } from "@/components/common/Input";

interface CreateSubagentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LLM_OPTIONS = [
  { value: "claude-opus-4", label: "Claude Opus 4" },
  { value: "claude-haiku-4", label: "Claude Haiku 4" },
  { value: "claude-3.5-sonnet", label: "Claude 3.5 Sonnet" },
  { value: "gpt-4o", label: "GPT-4o" },
  { value: "gpt-4-turbo", label: "GPT-4 Turbo" },
  { value: "llama-3.1-70b", label: "Meta Llama 3.1 70B" },
  { value: "minimax-01", label: "Minimax 01" },
  { value: "custom", label: "Custom Model" },
];

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
  llm: "claude-opus-4",
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.name.trim()) {
      setError("Name is required");
      return;
    }

    setIsSubmitting(true);
    try {
      // Build config JSON if system prompt is provided
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
          <Select
            label="LLM Model"
            options={LLM_OPTIONS}
            value={form.llm}
            onChange={(e: any) => setForm({ ...form, llm: e.target.value })}
          />
          <Select
            label="Role"
            options={ROLE_OPTIONS}
            value={form.role}
            onChange={(e: any) => setForm({ ...form, role: e.target.value })}
          />
        </div>

        {/* API Key */}
        <div>
          <Input
            label="API Key (optional)"
            type="password"
            placeholder="sk-..."
            value={form.apiKey}
            onChange={(e) => setForm({ ...form, apiKey: e.target.value })}
          />
          <div className="flex items-center gap-1.5 mt-1.5">
            <Shield className="w-3 h-3 text-istk-success" />
            <span className="text-[10px] text-istk-textDim">
              API keys are hashed before storage. Plaintext keys are never persisted.
            </span>
          </div>
        </div>

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
          <Button variant="accent" type="submit" isLoading={isSubmitting}>
            Create Subagent
          </Button>
        </div>
      </form>
    </Modal>
  );
}
