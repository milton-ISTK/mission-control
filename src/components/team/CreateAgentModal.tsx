"use client";

import { useState } from "react";
import { Users, Bot } from "lucide-react";
import { useCreateAgent } from "@/hooks/useAgents";
import Modal from "@/components/common/Modal";
import Button from "@/components/common/Button";
import { Input, Textarea } from "@/components/common/Input";
import {
  LLM_MODELS,
  DEFAULT_MODEL,
  getModelGroups,
} from "@/lib/llm-models";

interface CreateAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCategory: "agent" | "subagent";
}

const initialForm = {
  name: "",
  role: "",
  description: "",
  notes: "",
  model: DEFAULT_MODEL,
};

export default function CreateAgentModal({
  isOpen,
  onClose,
  defaultCategory,
}: CreateAgentModalProps) {
  const createAgent = useCreateAgent();
  const [form, setForm] = useState(initialForm);
  const [category, setCategory] = useState<"agent" | "subagent">(defaultCategory);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset form when modal opens with new category
  const handleOpen = () => {
    setForm(initialForm);
    setCategory(defaultCategory);
    setError(null);
  };

  // Reset on category change from prop
  if (isOpen && category !== defaultCategory && !form.name) {
    setCategory(defaultCategory);
  }

  const isAgent = category === "agent";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.name.trim()) {
      setError("Name is required");
      return;
    }
    if (!form.role.trim()) {
      setError("Role/Title is required");
      return;
    }

    setIsSubmitting(true);
    try {
      await createAgent({
        name: form.name.trim(),
        role: form.role.trim(),
        description: form.description.trim() || undefined,
        notes: form.notes.trim() || undefined,
        model: form.model,
        status: "active",
        isSubagent: category === "subagent",
      });
      setForm(initialForm);
      onClose();
    } catch (err) {
      console.error("Failed to create agent:", err);
      setError("Failed to create. Please try again.");
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
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isAgent ? "Create New Agent" : "Create New Subagent"}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {/* Identity Header */}
        <div
          className={`flex items-center gap-3 p-4 rounded-xl border ${
            isAgent
              ? "bg-amber-500/5 border-amber-500/20"
              : "bg-cyan-500/5 border-cyan-500/20"
          }`}
        >
          {isAgent ? (
            <Users className="w-8 h-8 text-amber-400 shrink-0" />
          ) : (
            <Bot className="w-8 h-8 text-cyan-400 shrink-0" />
          )}
          <div>
            <p className="text-sm font-medium text-istk-text">
              New {isAgent ? "Agent" : "Subagent"}
            </p>
            <p className="text-xs text-istk-textMuted">
              {isAgent
                ? "Create a primary agent with a dedicated model and role."
                : "Create a specialized subagent for targeted tasks."}
            </p>
          </div>
        </div>

        {/* Category Toggle */}
        <div>
          <label className="block text-sm font-medium text-istk-text mb-1.5">
            Category
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setCategory("agent")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all border ${
                category === "agent"
                  ? "border-amber-500/40 bg-amber-500/10 text-amber-400 shadow-neu-sm"
                  : "border-istk-border/20 text-istk-textMuted hover:text-istk-text hover:bg-istk-surfaceLight"
              }`}
            >
              <Users className="w-4 h-4" />
              Agent
            </button>
            <button
              type="button"
              onClick={() => setCategory("subagent")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all border ${
                category === "subagent"
                  ? "border-cyan-500/40 bg-cyan-500/10 text-cyan-400 shadow-neu-sm"
                  : "border-istk-border/20 text-istk-textMuted hover:text-istk-text hover:bg-istk-surfaceLight"
              }`}
            >
              <Bot className="w-4 h-4" />
              Subagent
            </button>
          </div>
        </div>

        {/* Name */}
        <Input
          label="Name"
          placeholder="e.g., Milton, Gregory, Research Bot"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          autoFocus
        />

        {/* Role/Title */}
        <Input
          label="Role / Title"
          placeholder="e.g., Lead AI Agent, Content Writer, Data Analyst"
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value })}
        />

        {/* Model Dropdown */}
        <div>
          <label className="block text-sm font-medium text-istk-text mb-1.5">
            Model
          </label>
          <select
            value={form.model}
            onChange={(e) => setForm({ ...form, model: e.target.value })}
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

        {/* Description */}
        <Textarea
          label="Description"
          placeholder="Brief description of what this agent does..."
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="min-h-[80px]"
        />

        {/* Notes */}
        <Textarea
          label="Notes"
          placeholder="Internal notes, instructions, or context..."
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          className="min-h-[80px]"
        />

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-istk-danger/10 border border-istk-danger/20">
            <span className="text-xs text-istk-danger">{error}</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 justify-end pt-2 border-t border-istk-border/10">
          <Button variant="ghost" type="button" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="accent" type="submit" isLoading={isSubmitting}>
            Create {isAgent ? "Agent" : "Subagent"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
