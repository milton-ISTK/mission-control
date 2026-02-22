"use client";

import { Bot, User, Cpu } from "lucide-react";
import Badge from "@/components/common/Badge";
import { cn, formatRelative } from "@/lib/utils";
import { Id } from "../../../convex/_generated/dataModel";

interface Agent {
  _id: Id<"agents">;
  name: string;
  role: string;
  description?: string;
  notes?: string;
  model?: string;
  modelId?: string;
  provider?: string;
  avatar?: string;
  status: "active" | "idle" | "offline";
  lastActive?: string;
  hoursThisMonth?: number;
  recentTasks?: string[];
  isSubagent: boolean;
  createdAt: string;
  agentType?: string;
  department?: string;
  parentAgentIds?: Id<"agents">[];
}

interface AgentCardProps {
  agent: Agent;
  isSelected: boolean;
  onClick: () => void;
  allAgents?: Agent[];
}

const statusConfig = {
  active: { dot: "status-active", label: "Active", variant: "success" as const },
  idle: { dot: "status-idle", label: "Idle", variant: "warning" as const },
  offline: { dot: "status-offline", label: "Offline", variant: "default" as const },
};

// Map avatar strings to emoji or fallback
function getAvatarDisplay(avatar?: string, name?: string) {
  if (avatar) return avatar;
  if (name === "Milton") return "🤖";
  return "🔮";
}

export default function AgentCard({ agent, isSelected, onClick, allAgents = [] }: AgentCardProps) {
  const status = statusConfig[agent.status];
  const avatarEmoji = getAvatarDisplay(agent.avatar, agent.name);
  const isAgent = !agent.isSubagent;
  
  // Get parent agent names for subagents
  const parentNames = (agent.parentAgentIds ?? [])
    .map((parentId) => allAgents.find((a) => a._id === parentId)?.name)
    .filter((name): name is string => name !== undefined);

  // Colour-coded borders: agents = amber/orange, subagents = cyan/blue
  const borderColor = isAgent
    ? "border-amber-500/25"
    : "border-cyan-500/25";
  const selectedBorder = isAgent
    ? "neon-border-orange"
    : "border-cyan-400/50 shadow-[0_0_15px_rgba(0,200,255,0.15)]";
  const avatarStyle = isAgent
    ? {
        background: "rgba(255,107,0,0.04)",
        border: "1px solid rgba(255,107,0,0.15)",
        boxShadow: isSelected ? "0 0 12px rgba(255,107,0,0.12)" : undefined,
      }
    : {
        background: "rgba(0,200,255,0.04)",
        border: "1px solid rgba(0,200,255,0.15)",
        boxShadow: isSelected ? "0 0 12px rgba(0,200,255,0.12)" : undefined,
      };

  return (
    <button
      onClick={onClick}
      className={cn(
        "glass-card p-5 text-left w-full group transition-all border",
        borderColor,
        isSelected && selectedBorder
      )}
    >
      {/* Top Row */}
      <div className="flex items-start gap-3 mb-3">
        {/* Avatar */}
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
          style={avatarStyle}
        >
          {avatarEmoji}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="text-sm font-bold text-istk-text truncate group-hover:text-istk-accent transition-colors">
              {agent.name}
            </h4>
            {/* Category Badge */}
            {isAgent ? (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/25">
                Agent
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-semibold bg-cyan-500/15 text-cyan-400 border border-cyan-500/25">
                Subagent
              </span>
            )}
          </div>
          <p className="text-xs text-istk-textMuted truncate">{agent.role}</p>
        </div>
      </div>

      {/* Status + Model */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={cn("status-dot", status.dot)} />
          <span className="text-[11px] text-istk-textMuted">{status.label}</span>
        </div>
        {(agent.modelId || agent.model) && (
          <div className="flex items-center gap-1 text-[10px] text-istk-textDim">
            <Cpu className="w-3 h-3" />
            <span className="truncate max-w-[120px]" title={agent.modelId || agent.model}>
              {agent.modelId || agent.model}
            </span>
            {agent.provider && (
              <span className="text-[9px] text-istk-textMuted ml-1">({agent.provider})</span>
            )}
          </div>
        )}
      </div>

      {/* Department + Reports To */}
      <div className="mt-2 flex items-center gap-2 flex-wrap">
        {agent.department && (
          <span className="text-[10px] text-istk-textMuted capitalize">
            {agent.department.replace(/_/g, " ")}
          </span>
        )}
        {!agent.isSubagent && agent.department && <span className="text-[10px] text-istk-textDim">·</span>}
        {agent.isSubagent && parentNames.length > 0 && (
          <span className="text-[10px] text-istk-textMuted">
            Reports to: {parentNames.join(", ")}
          </span>
        )}
      </div>

      {/* Description preview */}
      {agent.description && (
        <p className="text-[10px] text-istk-textMuted mt-2 line-clamp-2">
          {agent.description}
        </p>
      )}

      {/* Last Active */}
      {agent.lastActive && (
        <p className="text-[10px] text-istk-textDim mt-2">
          Last active: {formatRelative(agent.lastActive)}
        </p>
      )}
    </button>
  );
}
