"use client";

import { useState } from "react";
import {
  X,
  Cpu,
  Clock,
  Pencil,
  Trash2,
  CheckCircle2,
  Bot,
  Activity,
  Shield,
} from "lucide-react";
import { useTasksByAssignee } from "@/hooks/useTasks";
import { useSubagents, useDeleteSubagent } from "@/hooks/useAgents";
import { useUpdateAgentStatus, useDeleteAgent, useUpsertAgent } from "@/hooks/useAgents";
import Button from "@/components/common/Button";
import Badge, { StatusBadge } from "@/components/common/Badge";
import Modal from "@/components/common/Modal";
import { Input, Select } from "@/components/common/Input";
import { cn, formatRelative, formatDate } from "@/lib/utils";
import { Id } from "../../../convex/_generated/dataModel";

interface Agent {
  _id: Id<"agents">;
  name: string;
  role: string;
  model?: string;
  avatar?: string;
  status: "active" | "idle" | "offline";
  lastActive?: string;
  hoursThisMonth?: number;
  recentTasks?: string[];
  isSubagent: boolean;
  createdAt: string;
}

interface AgentDetailsProps {
  agent: Agent;
  onClose: () => void;
}

const STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "idle", label: "Idle" },
  { value: "offline", label: "Offline" },
];

const statusConfig = {
  active: { color: "text-istk-success", bg: "bg-istk-success/10", label: "Active" },
  idle: { color: "text-istk-warning", bg: "bg-istk-warning/10", label: "Idle" },
  offline: { color: "text-istk-textDim", bg: "bg-istk-surfaceLight", label: "Offline" },
};

export default function AgentDetails({ agent, onClose }: AgentDetailsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: agent.name,
    role: agent.role,
    model: agent.model || "",
    status: agent.status,
  });
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Fetch tasks assigned to this agent (Gregory or Milton)
  const assignedTasks = useTasksByAssignee(agent.name as "Gregory" | "Milton");

  // Fetch subagents to show linked subagents
  const subagents = useSubagents();

  const updateStatus = useUpdateAgentStatus();
  const upsertAgent = useUpsertAgent();
  const deleteAgent = useDeleteAgent();

  const status = statusConfig[agent.status];

  const handleStatusChange = async (newStatus: "active" | "idle" | "offline") => {
    try {
      await updateStatus({ id: agent._id, status: newStatus });
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  const handleSaveEdit = async () => {
    try {
      await upsertAgent({
        name: editForm.name,
        role: editForm.role,
        model: editForm.model || undefined,
        status: editForm.status as "active" | "idle" | "offline",
        isSubagent: agent.isSubagent,
      });
      setIsEditing(false);
    } catch (err) {
      console.error("Failed to update agent:", err);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteAgent({ id: agent._id });
      onClose();
    } catch (err) {
      console.error("Failed to delete agent:", err);
    }
  };

  // Group tasks by status
  const activeTasks = assignedTasks?.filter((t) => t.status !== "done") || [];
  const completedTasks = assignedTasks?.filter((t) => t.status === "done") || [];

  // Get related subagent configs
  const relatedSubagents = subagents?.filter(
    (s) => s.name.toLowerCase().includes(agent.name.toLowerCase())
  ) || [];

  return (
    <div className="w-96 shrink-0 neu-panel flex flex-col gap-5 max-h-[calc(100vh-12rem)] overflow-y-auto">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-xl bg-istk-surfaceLight flex items-center justify-center text-3xl shadow-neu-sm">
            {agent.avatar || (agent.name === "Milton" ? "🤖" : "🔮")}
          </div>
          <div>
            <h3 className="text-lg font-bold text-istk-text">{agent.name}</h3>
            <p className="text-sm text-istk-textMuted">{agent.role}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-lg hover:bg-istk-surfaceLight transition-colors text-istk-textMuted hover:text-istk-text"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Status & Model */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className={cn("flex items-center gap-2 px-3 py-1.5 rounded-lg", status.bg)}>
          <Activity className={cn("w-4 h-4", status.color)} />
          <span className={cn("text-sm font-medium", status.color)}>{status.label}</span>
        </div>
        {agent.model && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-istk-surfaceLight">
            <Cpu className="w-4 h-4 text-istk-textDim" />
            <span className="text-sm text-istk-textMuted">{agent.model}</span>
          </div>
        )}
        {!agent.isSubagent && (
          <Badge variant="info">Main Agent</Badge>
        )}
        {agent.isSubagent && (
          <Badge variant="purple">Subagent</Badge>
        )}
      </div>

      {/* Quick Status Switcher */}
      <div>
        <p className="text-xs font-medium text-istk-textDim uppercase tracking-wider mb-2">
          Quick Status
        </p>
        <div className="flex gap-2">
          {(["active", "idle", "offline"] as const).map((s) => (
            <button
              key={s}
              onClick={() => handleStatusChange(s)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-all border",
                agent.status === s
                  ? "border-istk-accent/40 bg-istk-accent/10 text-istk-accent shadow-neu-sm"
                  : "border-istk-border/20 text-istk-textMuted hover:text-istk-text hover:bg-istk-surfaceLight"
              )}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Meta Info */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 rounded-xl bg-istk-bg/50 border border-istk-border/10">
          <p className="text-[10px] text-istk-textDim uppercase tracking-wider mb-1">Last Active</p>
          <p className="text-sm text-istk-text font-medium">
            {agent.lastActive ? formatRelative(agent.lastActive) : "Never"}
          </p>
        </div>
        <div className="p-3 rounded-xl bg-istk-bg/50 border border-istk-border/10">
          <p className="text-[10px] text-istk-textDim uppercase tracking-wider mb-1">Created</p>
          <p className="text-sm text-istk-text font-medium">
            {formatDate(agent.createdAt)}
          </p>
        </div>
        {agent.hoursThisMonth !== undefined && (
          <div className="p-3 rounded-xl bg-istk-bg/50 border border-istk-border/10">
            <p className="text-[10px] text-istk-textDim uppercase tracking-wider mb-1">Hours/Month</p>
            <p className="text-sm text-istk-text font-medium">{agent.hoursThisMonth}h</p>
          </div>
        )}
        <div className="p-3 rounded-xl bg-istk-bg/50 border border-istk-border/10">
          <p className="text-[10px] text-istk-textDim uppercase tracking-wider mb-1">Active Tasks</p>
          <p className="text-sm text-istk-accent font-bold">{activeTasks.length}</p>
        </div>
      </div>

      {/* Assigned Tasks */}
      <div>
        <p className="text-xs font-medium text-istk-textDim uppercase tracking-wider mb-2">
          Assigned Tasks ({activeTasks.length} active, {completedTasks.length} done)
        </p>
        {assignedTasks === undefined ? (
          <div className="text-xs text-istk-textDim animate-pulse">Loading tasks...</div>
        ) : activeTasks.length === 0 ? (
          <p className="text-xs text-istk-textDim italic">No active tasks assigned</p>
        ) : (
          <div className="flex flex-col gap-1.5 max-h-40 overflow-y-auto">
            {activeTasks.slice(0, 8).map((task) => (
              <div
                key={task._id}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-istk-bg/50 border border-istk-border/10"
              >
                <div
                  className={cn(
                    "w-2 h-2 rounded-full shrink-0",
                    task.status === "in_progress" ? "bg-istk-warning" : "bg-istk-info"
                  )}
                />
                <span className="text-xs text-istk-text truncate flex-1">{task.title}</span>
                <StatusBadge status={task.status} />
              </div>
            ))}
            {activeTasks.length > 8 && (
              <p className="text-[10px] text-istk-textDim text-center">
                +{activeTasks.length - 8} more tasks
              </p>
            )}
          </div>
        )}
      </div>

      {/* Recent Tasks (from agent record) */}
      {agent.recentTasks && agent.recentTasks.length > 0 && (
        <div>
          <p className="text-xs font-medium text-istk-textDim uppercase tracking-wider mb-2">
            Recent Activity
          </p>
          <div className="flex flex-col gap-1">
            {agent.recentTasks.map((task, i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-istk-textMuted">
                <CheckCircle2 className="w-3 h-3 text-istk-success shrink-0" />
                <span className="truncate">{task}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Linked Subagent Configs */}
      {relatedSubagents.length > 0 && (
        <div>
          <p className="text-xs font-medium text-istk-textDim uppercase tracking-wider mb-2">
            Subagent Configurations
          </p>
          <div className="flex flex-col gap-1.5">
            {relatedSubagents.map((sub) => (
              <div
                key={sub._id}
                className="flex items-center justify-between px-3 py-2 rounded-lg bg-istk-bg/50 border border-istk-border/10"
              >
                <div className="flex items-center gap-2">
                  <Bot className="w-3.5 h-3.5 text-istk-purple" />
                  <span className="text-xs text-istk-text">{sub.name}</span>
                </div>
                <span className="text-[10px] font-mono text-istk-textDim">{sub.llm}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2 pt-2 border-t border-istk-border/10">
        <Button
          variant="ghost"
          className="flex-1 flex items-center justify-center gap-2 text-sm"
          onClick={() => setIsEditing(true)}
        >
          <Pencil className="w-4 h-4" />
          Edit
        </Button>
        <Button
          variant="danger"
          className="flex-1 flex items-center justify-center gap-2 text-sm"
          onClick={() => setConfirmDelete(true)}
        >
          <Trash2 className="w-4 h-4" />
          Delete
        </Button>
      </div>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditing}
        onClose={() => setIsEditing(false)}
        title="Edit Agent"
        size="sm"
      >
        <div className="flex flex-col gap-4">
          <Input
            label="Name"
            value={editForm.name}
            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
          />
          <Input
            label="Role"
            value={editForm.role}
            onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
          />
          <Input
            label="Model"
            value={editForm.model}
            onChange={(e) => setEditForm({ ...editForm, model: e.target.value })}
            placeholder="e.g., claude-opus-4"
          />
          <Select
            label="Status"
            options={STATUS_OPTIONS}
            value={editForm.status}
            onChange={(e: any) => setEditForm({ ...editForm, status: e.target.value })}
          />
          <div className="flex gap-3 justify-end mt-2">
            <Button variant="ghost" onClick={() => setIsEditing(false)}>
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
        isOpen={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title="Delete Agent"
        size="sm"
      >
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3 p-4 rounded-xl bg-istk-danger/10 border border-istk-danger/20">
            <Shield className="w-6 h-6 text-istk-danger shrink-0" />
            <p className="text-sm text-istk-text">
              Are you sure you want to delete <strong>{agent.name}</strong>? This action cannot be undone.
            </p>
          </div>
          <div className="flex gap-3 justify-end">
            <Button variant="ghost" onClick={() => setConfirmDelete(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              Delete Agent
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
