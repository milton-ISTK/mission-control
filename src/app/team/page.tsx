"use client";

import { useState } from "react";
import { Plus, Users, Bot, ArrowUpDown, LayoutGrid, Network } from "lucide-react";
import TeamGrid from "@/components/team/TeamGrid";
import SubagentList from "@/components/team/SubagentList";
import OrgChart from "@/components/team/OrgChart";
import CreateAgentModal from "@/components/team/CreateAgentModal";
import Button from "@/components/common/Button";
import { useAgents, useSubagents } from "@/hooks/useAgents";

export type SortOption =
  | "name-asc"
  | "name-desc"
  | "category-agents"
  | "category-subagents"
  | "status-active"
  | "date-newest"
  | "date-oldest";

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "name-asc", label: "Name (A-Z)" },
  { value: "name-desc", label: "Name (Z-A)" },
  { value: "category-agents", label: "Category (Agents first)" },
  { value: "category-subagents", label: "Category (Subagents first)" },
  { value: "status-active", label: "Status (Active first)" },
  { value: "date-newest", label: "Date Created (Newest)" },
  { value: "date-oldest", label: "Date Created (Oldest)" },
];

export default function TeamPage() {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createCategory, setCreateCategory] = useState<"agent" | "subagent">("agent");
  const [activeTab, setActiveTab] = useState<"agents" | "subagents">("agents");
  const [viewMode, setViewMode] = useState<"list" | "orgchart">("list");
  const [sortOption, setSortOption] = useState<SortOption>("status-active");
  const agents = useAgents();
  const subagents = useSubagents();

  const agentCount = agents?.length ?? 0;
  const subagentCount = subagents?.length ?? 0;

  const handleCreateAgent = () => {
    setCreateCategory("agent");
    setCreateModalOpen(true);
  };

  const handleCreateSubagent = () => {
    setCreateCategory("subagent");
    setCreateModalOpen(true);
  };

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
        <div className="flex items-center gap-2">
          <Button variant="accent" onClick={handleCreateAgent}>
            <span className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Create Agent
            </span>
          </Button>
          <Button variant="ghost" onClick={handleCreateSubagent}>
            <span className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Create Subagent
            </span>
          </Button>
        </div>
      </div>

      {/* Tab Switcher + Controls */}
      <div className="flex items-center justify-between flex-wrap gap-3">
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

        {/* View Toggle + Sort (Agents tab only) */}
        {activeTab === "agents" && (
          <div className="flex items-center gap-2 flex-wrap">
            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 bg-istk-bg rounded-lg p-1">
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded text-sm transition-all ${
                  viewMode === "list"
                    ? "bg-istk-accent text-white"
                    : "text-istk-textMuted hover:text-istk-text"
                }`}
                title="List View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("orgchart")}
                className={`p-2 rounded text-sm transition-all ${
                  viewMode === "orgchart"
                    ? "bg-istk-accent text-white"
                    : "text-istk-textMuted hover:text-istk-text"
                }`}
                title="Org Chart"
              >
                <Network className="w-4 h-4" />
              </button>
            </div>

            {/* Sort Dropdown (List view only) */}
            {viewMode === "list" && (
              <div className="flex items-center gap-2">
                <ArrowUpDown className="w-4 h-4 text-istk-textDim" />
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value as SortOption)}
                  className="glass-input text-xs appearance-none cursor-pointer pr-8 py-1.5 pl-3 rounded-lg"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      {activeTab === "agents" ? (
        viewMode === "list" ? (
          <TeamGrid sortOption={sortOption} />
        ) : (
          <OrgChart agents={agents} />
        )
      ) : (
        <SubagentList sortOption={sortOption} />
      )}

      {/* Create Modal */}
      <CreateAgentModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        defaultCategory={createCategory}
      />
    </div>
  );
}
