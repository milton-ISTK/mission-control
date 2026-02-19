"use client";

import { Bot, User, Cpu } from "lucide-react";
import Badge from "@/components/common/Badge";
import { cn, formatRelative } from "@/lib/utils";
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

interface AgentCardProps {
  agent: Agent;
  isSelected: boolean;
  onClick: () => void;
}

const statusConfig = {
  active: { dot: "status-active", label: "Active", variant: "success" as const },
  idle: { dot: "status-idle", label: "Idle", variant: "warning" as const },
  offline: { dot: "status-offline", label: "Offline", variant: "default" as const },
};

// Map avatar strings to emoji or fallback
function getAvatarDisplay(avatar?: string, name?: string) {
  if (avatar) return avatar;
  // Default avatars by name
  if (name === "Milton") return "🤖";
  return "🔮";
}

export default function AgentCard({ agent, isSelected, onClick }: AgentCardProps) {
  const status = statusConfig[agent.status];
  const avatarEmoji = getAvatarDisplay(agent.avatar, agent.name);

  return (
    <button
      onClick={onClick}
      className={cn(
        "glass-card p-5 text-left w-full group transition-all",
        isSelected && "ring-1 ring-istk-accent/30 accent-border-glow"
      )}
    >
      {/* Top Row */}
      <div className="flex items-start gap-3 mb-3">
        {/* Avatar */}
        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)]">
          {avatarEmoji}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-bold text-istk-text truncate group-hover:text-istk-accent transition-colors">
              {agent.name}
            </h4>
            {!agent.isSubagent && (
              <Badge variant="info" className="text-[9px]">
                Main
              </Badge>
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
        {agent.model && (
          <div className="flex items-center gap-1 text-[10px] text-istk-textDim">
            <Cpu className="w-3 h-3" />
            <span className="truncate max-w-[100px]">{agent.model}</span>
          </div>
        )}
      </div>

      {/* Last Active */}
      {agent.lastActive && (
        <p className="text-[10px] text-istk-textDim mt-2">
          Last active: {formatRelative(agent.lastActive)}
        </p>
      )}
    </button>
  );
}
