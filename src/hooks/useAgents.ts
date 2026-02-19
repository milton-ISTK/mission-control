"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

export function useAgents() {
  return useQuery(api.agents.listAgents);
}

export function useActiveAgents() {
  return useQuery(api.agents.getActiveAgents);
}

export function useAgentByName(name: string) {
  return useQuery(api.agents.getAgentByName, { name });
}

export function useUpsertAgent() {
  return useMutation(api.agents.upsertAgent);
}

export function useUpdateAgentStatus() {
  return useMutation(api.agents.updateAgentStatus);
}

export function useDeleteAgent() {
  return useMutation(api.agents.deleteAgent);
}

// Subagent hooks
export function useSubagents() {
  return useQuery(api.subagents.listSubagents);
}

export function useActiveSubagents() {
  return useQuery(api.subagents.getActiveSubagents);
}

export function useCreateSubagent() {
  return useMutation(api.subagents.createSubagent);
}

export function useUpdateSubagent() {
  return useMutation(api.subagents.updateSubagent);
}

export function useToggleSubagent() {
  return useMutation(api.subagents.toggleSubagent);
}

export function useDeleteSubagent() {
  return useMutation(api.subagents.deleteSubagent);
}
