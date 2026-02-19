"use client";

import { useState } from "react";
import { useAgents } from "@/hooks/useAgents";
import AgentCard from "./AgentCard";
import AgentDetails from "./AgentDetails";
import { PageLoader } from "@/components/common/LoadingSpinner";
import EmptyState from "@/components/common/EmptyState";
import { Users } from "lucide-react";
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

export default function TeamGrid() {
  const agents = useAgents();
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);

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

  // Sort: main agent first, then by status, then alphabetical
  const sorted = [...agents].sort((a, b) => {
    // Main agent first
    if (!a.isSubagent && b.isSubagent) return -1;
    if (a.isSubagent && !b.isSubagent) return 1;
    // Active before idle before offline
    const statusOrder = { active: 0, idle: 1, offline: 2 };
    const statusDiff = statusOrder[a.status] - statusOrder[b.status];
    if (statusDiff !== 0) return statusDiff;
    return a.name.localeCompare(b.name);
  }) as Agent[];

  return (
    <div className="flex gap-6">
      {/* Grid */}
      <div className="flex-1">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sorted.map((agent) => (
            <AgentCard
              key={agent._id}
              agent={agent}
              isSelected={selectedAgent?._id === agent._id}
              onClick={() =>
                setSelectedAgent(
                  selectedAgent?._id === agent._id ? null : agent
                )
              }
            />
          ))}
        </div>
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
