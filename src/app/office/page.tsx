"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import AgentOffice from "@/components/Office/AgentOffice";
import { Loader2 } from "lucide-react";

export default function OfficePage() {
  const agentActivity = useQuery(api.office.getAgentActivity);

  if (!agentActivity) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-istk-accent animate-spin" />
          <p className="text-istk-textMuted">Initializing office systems...</p>
        </div>
      </div>
    );
  }

  // Convert Convex data to component format, matching AGENTS array IDs
  const agentRoleToId: Record<string, string> = {
    "blog_writer": "blogwriter",
    "headline_generator": "headline",
    "image_maker": "imagemaker",
    "html_builder": "htmlbuilder",
    "news_scraper": "newsscraper",
    "sentiment_scraper": "sentiment",
  };

  const agents = agentActivity.map((agent) => ({
    id: agentRoleToId[agent.agentRole || ""] || agent.id,
    name: agent.name,
    role: agent.role,
    emoji: agent.avatar || "🤖",
    type: (agent.agentType === "subagent" ? "subagent" : "agent") as "agent" | "subagent",
    color: agent.agentType === "subagent" ? "#06B6D4" : "#F97316",
    activity: agent.activity,
  }));

  return (
    <div className="w-full h-full">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gradient mb-2">Agent Operations Center</h1>
        <p className="text-istk-textMuted">
          Real-time visualization of agent activity across all workflows
        </p>
      </div>

      {/* Office Component */}
      <AgentOffice agents={agents} />
    </div>
  );
}
