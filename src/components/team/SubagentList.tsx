"use client";

import { useState, useMemo } from "react";
import {
  Bot,
  Cpu,
  Power,
  PowerOff,
  Pencil,
  Trash2,
  Shield,
} from "lucide-react";
import { useSubagents, useToggleSubagent, useDeleteSubagent, useUpdateSubagent } from "@/hooks/useAgents";
import Button from "@/components/common/Button";
import Badge from "@/components/common/Badge";
import Modal from "@/components/common/Modal";
import { Input, Select, Textarea } from "@/components/common/Input";
import { PageLoader } from "@/components/common/LoadingSpinner";
import EmptyState from "@/components/common/EmptyState";
import { cn, formatDate } from "@/lib/utils";
import { Id } from "../../../convex/_generated/dataModel";
import {
  LLM_MODELS,
  getModelGroups,
} from "@/lib/llm-models";
import type { SortOption } from "@/app/team/page";

interface SubagentListProps {
  sortOption: SortOption;
}

interface Subagent {
  _id: Id<"subagents">;
  name: string;
  llm: string;
  role: string;
  description?: string;
  hasApiKey: boolean;
  isActive: boolean;
  config?: string;
  createdAt: string;
  updatedAt: string;
}

const ROLE_OPTIONS = [
  { value: "writer", label: "Writer" },
  { value: "designer", label: "Designer" },
  { value: "analyst", label: "Analyst" },
  { value: "developer", label: "Developer" },
  { value: "researcher", label: "Researcher" },
  { value: "assistant", label: "Assistant" },
  { value: "custom", label: "Custom" },
];

export default function SubagentList({ sortOption }: SubagentListProps) {
  const subagents = useSubagents();
  const toggleSubagent = useToggleSubagent();
  const deleteSubagent = useDeleteSubagent();
  const updateSubagent = useUpdateSubagent();

  const [editingAgent, setEditingAgent] = useState<Subagent | null>(null);
  const [deletingId, setDeletingId] = useState<Id<"subagents"> | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    llm: "",
    role: "",
    description: "",
  });

  const handleToggle = async (id: Id<"subagents">) => {
    try {
      await toggleSubagent({ id });
    } catch (err) {
      console.error("Failed to toggle subagent:", err);
    }
  };

  const handleEdit = (agent: Subagent) => {
    setEditForm({
      name: agent.name || "",
      llm: agent.llm || "",
      role: agent.role || "",
      description: (agent.description ?? "") as string,
    });
    setEditingAgent(agent);
  };

  const handleSaveEdit = async () => {
    if (!editingAgent) return;
    try {
      await updateSubagent({
        id: editingAgent._id,
        name: editForm.name,
        llm: editForm.llm,
        role: editForm.role,
        description: editForm.description || undefined,
      });
      setEditingAgent(null);
    } catch (err) {
      console.error("Failed to update subagent:", err);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await deleteSubagent({ id: deletingId });
      setDeletingId(null);
    } catch (err) {
      console.error("Failed to delete subagent:", err);
    }
  };

  if (subagents === undefined) {
    return <PageLoader label="Loading subagents..." />;
  }

  if (!subagents || subagents.length === 0) {
    return (
      <EmptyState
        icon={Bot}
        title="No subagents configured"
        description="Create a subagent to expand your team with specialized AI models and roles."
      />
    );
  }

  const rawAgents = subagents as Subagent[];
  const activeCount = rawAgents.filter((a) => a.isActive).length;

  // Apply sorting
  const agents = useMemo(() => {
    const list = [...rawAgents];
    switch (sortOption) {
      case "name-asc":
        return list.sort((a, b) => a.name.localeCompare(b.name));
      case "name-desc":
        return list.sort((a, b) => b.name.localeCompare(a.name));
      case "status-active":
        return list.sort((a, b) => {
          if (a.isActive && !b.isActive) return -1;
          if (!a.isActive && b.isActive) return 1;
          return a.name.localeCompare(b.name);
        });
      case "date-newest":
        return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      case "date-oldest":
        return list.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
      default:
        return list.sort((a, b) => a.name.localeCompare(b.name));
    }
  }, [rawAgents, sortOption]);

  return (
    <div className="flex flex-col gap-4">
      {/* Summary */}
      <div className="flex items-center gap-3 text-sm text-istk-textMuted">
        <span>
          {agents.length} subagent{agents.length !== 1 ? "s" : ""}
        </span>
        <span className="text-istk-textDim">·</span>
        <span className="flex items-center gap-1.5">
          <span className="status-dot status-active" />
          {activeCount} active
        </span>
      </div>

      {/* Subagent Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {agents.map((agent) => (
          <div
            key={agent._id}
            className={cn(
              "neu-card p-5 transition-all",
              !agent.isActive && "opacity-60"
            )}
          >
            {/* Top Row */}
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-istk-purple/10 flex items-center justify-center shadow-neu-sm">
                  <Bot className="w-5 h-5 text-istk-purple" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-istk-text">{agent.name}</h4>
                  <p className="text-xs text-istk-textMuted capitalize">{agent.role}</p>
                </div>
              </div>
              <Badge variant={agent.isActive ? "success" : "default"}>
                {agent.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>

            {/* Model & API Key */}
            <div className="flex items-center gap-3 mb-3 flex-wrap">
              <div className="flex items-center gap-1.5 text-xs text-istk-textDim">
                <Cpu className="w-3.5 h-3.5" />
                <span className="font-mono">{agent.llm}</span>
              </div>
              {agent.hasApiKey && (
                <div className="flex items-center gap-1 text-xs text-istk-success">
                  <Shield className="w-3 h-3" />
                  <span>API Key Set</span>
                </div>
              )}
            </div>

            {/* Description */}
            {agent.description && (
              <p className="text-xs text-istk-textMuted mb-3 line-clamp-2">
                {agent.description}
              </p>
            )}

            {/* Footer: Created + Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-istk-border/10">
              <span className="text-[10px] text-istk-textDim">
                Created {formatDate(agent.createdAt)}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleToggle(agent._id)}
                  className={cn(
                    "p-1.5 rounded-lg transition-colors",
                    agent.isActive
                      ? "hover:bg-istk-warning/10 text-istk-textDim hover:text-istk-warning"
                      : "hover:bg-istk-success/10 text-istk-textDim hover:text-istk-success"
                  )}
                  title={agent.isActive ? "Deactivate" : "Activate"}
                >
                  {agent.isActive ? (
                    <PowerOff className="w-4 h-4" />
                  ) : (
                    <Power className="w-4 h-4" />
                  )}
                </button>
                <button
                  onClick={() => handleEdit(agent)}
                  className="p-1.5 rounded-lg hover:bg-istk-surfaceLight text-istk-textDim hover:text-istk-text transition-colors"
                  title="Edit"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeletingId(agent._id)}
                  className="p-1.5 rounded-lg hover:bg-istk-danger/10 text-istk-textDim hover:text-istk-danger transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      <Modal
        isOpen={!!editingAgent}
        onClose={() => setEditingAgent(null)}
        title="Edit Subagent"
        size="md"
      >
        <div className="flex flex-col gap-4">
          <Input
            label="Name"
            value={editForm.name}
            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
          />
          <div>
            <label className="block text-sm font-medium text-istk-text mb-1.5">
              Model
            </label>
            <select
              value={editForm.llm}
              onChange={(e) => setEditForm({ ...editForm, llm: e.target.value })}
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
          <Select
            label="Role"
            options={ROLE_OPTIONS}
            value={editForm.role}
            onChange={(e: any) => setEditForm({ ...editForm, role: e.target.value })}
          />
          <Textarea
            label="Description"
            value={editForm.description}
            onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
            placeholder="What does this subagent do?"
          />
          <div className="flex gap-3 justify-end mt-2">
            <Button variant="ghost" onClick={() => setEditingAgent(null)}>
              Cancel
            </Button>
            <Button variant="accent" onClick={handleSaveEdit}>
              Save Changes
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        title="Delete Subagent"
        size="sm"
      >
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3 p-4 rounded-xl bg-istk-danger/10 border border-istk-danger/20">
            <Shield className="w-6 h-6 text-istk-danger shrink-0" />
            <p className="text-sm text-istk-text">
              Are you sure you want to delete this subagent? This will remove all its configuration permanently.
            </p>
          </div>
          <div className="flex gap-3 justify-end">
            <Button variant="ghost" onClick={() => setDeletingId(null)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              Delete Subagent
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
