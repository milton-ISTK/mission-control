"use client";

import { useState, useMemo } from "react";
import { Plus, Bot, Cpu, Filter } from "lucide-react";
import SubagentList from "@/components/team/SubagentList";
import CreateSubagentModal from "@/components/team/CreateSubagentModal";
import Button from "@/components/common/Button";
import { useAgents } from "@/hooks/useAgents";

export default function SubagentsPage() {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [filterActive, setFilterActive] = useState<boolean | null>(null);
  const allAgents = useAgents();
  
  // Filter for subagents (agentType === "subagent")
  const subagents = useMemo(() => {
    const filtered = (allAgents ?? []).filter((a: any) => a.agentType === "subagent");
    return filtered;
  }, [allAgents]);

  const totalCount = subagents?.length ?? 0;
  const activeCount = subagents?.filter((s: any) => s.status === "active").length ?? 0;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-istk-text">Subagents</h1>
          <p className="text-sm text-istk-textMuted mt-1">
            Create and manage custom AI agents with different LLM models
          </p>
        </div>
        <Button variant="accent" onClick={() => setCreateModalOpen(true)}>
          <span className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Create Subagent
          </span>
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="neu-card p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-istk-purple/10 flex items-center justify-center">
              <Bot className="w-5 h-5 text-istk-purple" />
            </div>
            <div>
              <p className="text-2xl font-bold text-istk-text">{totalCount}</p>
              <p className="text-xs text-istk-textMuted">Total Subagents</p>
            </div>
          </div>
        </div>
        <div className="neu-card p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-istk-success/10 flex items-center justify-center">
              <span className="status-dot status-active" />
            </div>
            <div>
              <p className="text-2xl font-bold text-istk-success">{activeCount}</p>
              <p className="text-xs text-istk-textMuted">Active</p>
            </div>
          </div>
        </div>
        <div className="neu-card p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-istk-info/10 flex items-center justify-center">
              <Cpu className="w-5 h-5 text-istk-info" />
            </div>
            <div>
              <p className="text-2xl font-bold text-istk-text">
                {new Set(subagents?.map((s: any) => s.model) ?? []).size}
              </p>
              <p className="text-xs text-istk-textMuted">Unique Models</p>
            </div>
          </div>
        </div>
      </div>

      {/* Subagent List */}
      <SubagentList sortOption="name-asc" />

      {/* Create Modal */}
      <CreateSubagentModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
      />
    </div>
  );
}
