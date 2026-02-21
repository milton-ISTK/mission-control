"use client";

import { useState, useMemo } from "react";
import { Users, Bot } from "lucide-react";
import { cn, formatDate } from "@/lib/utils";
import AgentDetails from "./AgentDetails";
import { Id } from "../../../convex/_generated/dataModel";

interface Agent {
  _id: Id<"agents">;
  name: string;
  role: string;
  description?: string;
  notes?: string;
  model?: string;
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

interface AgentWithSubagents extends Agent {
  subagents: Agent[];
}

interface OrgChartProps {
  agents?: Agent[];
}

const DEPARTMENT_ORDER: Record<string, number> = {
  content_production: 0,
  research: 1,
  distribution: 2,
  creative: 3,
};

const statusConfig = {
  active: { dot: "status-active", label: "Active" },
  idle: { dot: "status-idle", label: "Idle" },
  offline: { dot: "status-offline", label: "Offline" },
};

export default function OrgChart({ agents = [] }: OrgChartProps) {
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);

  // Build hierarchy
  const hierarchy = useMemo(() => {
    const topLevel = agents.filter((a) => (a.agentType ?? "agent") === "agent");
    const subagents = agents.filter((a) => a.agentType === "subagent");

    const withSubs: AgentWithSubagents[] = topLevel.map((agent) => ({
      ...agent,
      subagents: subagents.filter((sub) =>
        (sub.parentAgentIds ?? []).includes(agent._id)
      ),
    }));

    // Sort by department
    return withSubs.sort(
      (a, b) =>
        (DEPARTMENT_ORDER[a.department ?? ""] ?? 999) -
        (DEPARTMENT_ORDER[b.department ?? ""] ?? 999)
    );
  }, [agents]);

  // Group by department
  const byDept = useMemo(() => {
    const map: Record<string, AgentWithSubagents[]> = {
      content_production: [],
      research: [],
      distribution: [],
      creative: [],
    };
    hierarchy.forEach((agent) => {
      const dept = agent.department ?? "content_production";
      if (map[dept]) map[dept].push(agent);
    });
    return map;
  }, [hierarchy]);

  const deptLabels: Record<string, string> = {
    content_production: "CONTENT PRODUCTION",
    research: "RESEARCH",
    distribution: "DISTRIBUTION",
    creative: "CREATIVE",
  };

  if (!agents || agents.length === 0) {
    return <div className="text-istk-textMuted text-sm">No agents to display</div>;
  }

  return (
    <div className="flex gap-6">
      {/* Org Chart */}
      <div className="flex-1 space-y-6">
        {Object.keys(DEPARTMENT_ORDER).map((dept) => {
          const deptAgents = byDept[dept] ?? [];
          if (deptAgents.length === 0) return null;

          return (
            <div key={dept}>
              {/* Department Header */}
              <h3 className="text-xs font-semibold text-istk-textDim uppercase tracking-wider mb-4">
                {deptLabels[dept]}
              </h3>

              {/* Department Content */}
              <div className="space-y-4 pl-4 border-l border-istk-border/20">
                {deptAgents.map((agent) => (
                  <div key={agent._id}>
                    {/* Agent Card */}
                    <button
                      onClick={() => setSelectedAgent(agent)}
                      className={cn(
                        "w-full text-left p-4 rounded-lg transition-all border",
                        selectedAgent?._id === agent._id
                          ? "bg-amber-500/10 border-amber-500/40 shadow-[0_0_12px_rgba(255,107,0,0.15)]"
                          : "bg-istk-bg/50 border-amber-500/20 hover:border-amber-500/30 hover:bg-istk-surfaceLight"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">🤖</span>
                        <div>
                          <p className="text-sm font-bold text-istk-text">{agent.name}</p>
                          <p className="text-xs text-istk-textMuted">{agent.role}</p>
                        </div>
                        <div className="ml-auto flex items-center gap-2">
                          <span className={cn("status-dot", statusConfig[agent.status]?.dot)} />
                          <span className="text-[10px] text-istk-textMuted">
                            {statusConfig[agent.status]?.label}
                          </span>
                        </div>
                      </div>
                    </button>

                    {/* Subagents */}
                    {agent.subagents && agent.subagents.length > 0 && (
                      <div className="mt-3 ml-4 space-y-2 border-l border-istk-border/10 pl-4">
                        {agent.subagents.map((sub) => (
                          <button
                            key={sub._id}
                            onClick={() => setSelectedAgent(sub)}
                            className={cn(
                              "w-full text-left p-3 rounded-lg text-sm transition-all border",
                              selectedAgent?._id === sub._id
                                ? "bg-cyan-500/10 border-cyan-500/40 shadow-[0_0_10px_rgba(0,200,255,0.12)]"
                                : "bg-istk-bg/30 border-cyan-500/15 hover:border-cyan-500/25 hover:bg-istk-bg"
                            )}
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-lg">🔧</span>
                              <div className="flex-1">
                                <p className="text-xs font-semibold text-istk-text">{sub.name}</p>
                                <p className="text-[10px] text-istk-textMuted">{sub.role}</p>
                              </div>
                              <span className={cn("status-dot w-2 h-2", statusConfig[sub.status]?.dot)} />
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Details Panel */}
      {selectedAgent && (
        <AgentDetails
          agent={selectedAgent}
          onClose={() => setSelectedAgent(null)}
        />
      )}
    </div>
  );
}
