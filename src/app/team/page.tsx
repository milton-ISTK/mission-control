"use client";

import { useState } from "react";
import { Plus, Users, Bot } from "lucide-react";
import TeamGrid from "@/components/team/TeamGrid";
import SubagentList from "@/components/team/SubagentList";
import CreateSubagentModal from "@/components/team/CreateSubagentModal";
import Button from "@/components/common/Button";
import { useAgents, useSubagents } from "@/hooks/useAgents";

export default function TeamPage() {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"agents" | "subagents">("agents");
  const agents = useAgents();
  const subagents = useSubagents();

  const agentCount = agents?.length ?? 0;
  const subagentCount = subagents?.length ?? 0;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-istk-text">Team</h1>
          <p className="text-sm text-istk-textMuted mt-1">
            Manage your agents and subagent configurations
          </p>
        </div>
        <Button variant="accent" onClick={() => setCreateModalOpen(true)}>
          <span className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Create Subagent
          </span>
        </Button>
      </div>

      {/* Tab Switcher */}
      <div className="flex items-center gap-1 bg-istk-bg rounded-xl p-1 shadow-neu-inset-sm w-fit">
        <button
          onClick={() => setActiveTab("agents")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === "agents"
              ? "bg-istk-accent text-white shadow-neu-sm"
              : "text-istk-textMuted hover:text-istk-text"
          }`}
        >
          <Users className="w-4 h-4" />
          Agents ({agentCount})
        </button>
        <button
          onClick={() => setActiveTab("subagents")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === "subagents"
              ? "bg-istk-accent text-white shadow-neu-sm"
              : "text-istk-textMuted hover:text-istk-text"
          }`}
        >
          <Bot className="w-4 h-4" />
          Subagents ({subagentCount})
        </button>
      </div>

      {/* Content */}
      {activeTab === "agents" ? <TeamGrid /> : <SubagentList />}

      {/* Create Modal */}
      <CreateSubagentModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
      />
    </div>
  );
}
