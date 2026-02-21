"use client";

import { useState, useMemo } from "react";
import { useAgents } from "@/hooks/useAgents";
import AgentCard from "./AgentCard";
import AgentDetails from "./AgentDetails";
import { PageLoader } from "@/components/common/LoadingSpinner";
import EmptyState from "@/components/common/EmptyState";
import { Users } from "lucide-react";
import { Id } from "../../../convex/_generated/dataModel";
import type { SortOption } from "@/app/team/page";

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

interface TeamGridProps {
  sortOption: SortOption;
  agentTypeFilter?: "agent" | "subagent";
}

const STATUS_ORDER: Record<string, number> = { active: 0, idle: 1, offline: 2 };

export default function TeamGrid({ sortOption, agentTypeFilter }: TeamGridProps) {
  const agents = useAgents();
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);

  const sorted = useMemo(() => {
    if (!agents) return [];
    let list = [...agents] as Agent[];

    // Filter by agentType if specified
    if (agentTypeFilter) {
      console.log(`[TeamGrid] Filtering agents by agentType='${agentTypeFilter}'`);
      console.log(`[TeamGrid] Total agents before filter: ${list.length}`);
      console.log('[TeamGrid] Agent list:', list.map((a) => ({ name: a.name, agentType: a.agentType, isSubagent: a.isSubagent })));
      list = list.filter((a) => (a.agentType ?? "agent") === agentTypeFilter);
      console.log(`[TeamGrid] Agents after filter: ${list.length}`, list.map((a) => a.name));
    }

    switch (sortOption) {
      case "name-asc":
        return list.sort((a, b) => a.name.localeCompare(b.name));
      case "name-desc":
        return list.sort((a, b) => b.name.localeCompare(a.name));
      case "category-agents":
        return list.sort((a, b) => {
          if (!a.isSubagent && b.isSubagent) return -1;
          if (a.isSubagent && !b.isSubagent) return 1;
          return a.name.localeCompare(b.name);
        });
      case "category-subagents":
        return list.sort((a, b) => {
          if (a.isSubagent && !b.isSubagent) return -1;
          if (!a.isSubagent && b.isSubagent) return 1;
          return a.name.localeCompare(b.name);
        });
      case "status-active":
        return list.sort((a, b) => {
          const diff = (STATUS_ORDER[a.status] ?? 2) - (STATUS_ORDER[b.status] ?? 2);
          if (diff !== 0) return diff;
          return a.name.localeCompare(b.name);
        });
      case "date-newest":
        return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      case "date-oldest":
        return list.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
      default:
        return list;
    }
  }, [agents, sortOption]);

  // Keep selected agent synced with latest data
  const currentSelected = useMemo(() => {
    if (!selectedAgent || !agents) return null;
    return (agents as Agent[]).find((a) => a._id === selectedAgent._id) ?? null;
  }, [agents, selectedAgent]);

  if (agents === undefined) {
    return <PageLoader label="Loading team..." />;
  }

  if (!agents || agents.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="No agents registered"
        description="Agents will appear here as they come online. Milton (main) and subagents are tracked automatically."
      />
    );
  }

  return (
    <div className="flex gap-6">
      {/* Grid */}
      <div className="flex-1">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sorted.map((agent) => (
            <AgentCard
              key={agent._id}
              agent={agent}
              isSelected={currentSelected?._id === agent._id}
              onClick={() =>
                setSelectedAgent(
                  currentSelected?._id === agent._id ? null : agent
                )
              }
              allAgents={(agents as Agent[]) ?? []}
            />
          ))}
        </div>
      </div>

      {/* Details Panel */}
      {currentSelected && (
        <AgentDetails
          agent={currentSelected}
          onClose={() => setSelectedAgent(null)}
        />
      )}
    </div>
  );
}
