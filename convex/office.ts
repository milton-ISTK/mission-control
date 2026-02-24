import { query } from "./_generated/server";

/**
 * Get real-time agent activity for Office View
 * Maps each agent to their current state: "working" | "waiting" | "idle"
 */
export const getAgentActivity = query(async (ctx) => {
  // Fetch all agents
  const agents = await ctx.db.query("agents").collect();

  // Fetch all active workflow steps (pending, agent_working, awaiting_review)
  const allSteps = await ctx.db.query("workflowSteps").collect();
  const activeSteps = allSteps.filter(
    (s) => s.status === "agent_working" || s.status === "awaiting_review" || s.status === "pending"
  );

  // Build a map of agentRole → activity state
  const agentActivity: Record<string, "working" | "waiting" | "idle"> = {};

  // For each agent, determine state based on active steps
  for (const agent of agents) {
    const agentRole = agent.agentRole;
    if (!agentRole) {
      agentActivity[agent._id.toString()] = "idle";
      continue;
    }

    // Check if this agent has any active work
    const agentSteps = activeSteps.filter((s) => s.agentRole === agentRole);

    if (agentSteps.some((s) => s.status === "agent_working")) {
      // Agent is actively working
      agentActivity[agent._id.toString()] = "working";
    } else if (agentSteps.some((s) => s.status === "awaiting_review")) {
      // Agent has work waiting for review
      agentActivity[agent._id.toString()] = "waiting";
    } else {
      agentActivity[agent._id.toString()] = "idle";
    }
  }

  // Return agents with their activity state
  return agents.map((agent) => ({
    id: agent._id.toString(),
    name: agent.name,
    role: agent.role,
    avatar: agent.avatar,
    agentRole: agent.agentRole,
    agentType: agent.agentType || "agent",
    activity: agentActivity[agent._id.toString()] || "idle",
  }));
});
