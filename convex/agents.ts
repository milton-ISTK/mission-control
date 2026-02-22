/**
 * ISTK Mission Control - Agent mutations & queries
 * Handles team member (agent) CRUD operations
 */
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// ---- Queries ----

/** List all agents */
export const listAgents = query({
  handler: async (ctx) => {
    return await ctx.db.query("agents").collect();
  },
});

/** Get agent by name */
export const getAgentByName = query({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("agents")
      .withIndex("by_name", (q) => q.eq("name", args.name))
      .first();
  },
});

/** Get agent by agentRole (for workflow orchestration — daemon uses this) */
export const getAgentByRole = query({
  args: { agentRole: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("agents")
      .withIndex("by_agentRole", (q) => q.eq("agentRole", args.agentRole))
      .first();
  },
});

/** Get active agents */
export const getActiveAgents = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("agents")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .collect();
  },
});

/** Get agents by type (agent or subagent) */
export const getAgentsByType = query({
  args: { agentType: v.string() },
  handler: async (ctx, args) => {
    const allAgents = await ctx.db.query("agents").collect();
    return allAgents.filter((a) => (a.agentType ?? "agent") === args.agentType);
  },
});

/** Get subagents by parent agent */
export const getSubagentsByParent = query({
  args: { parentId: v.id("agents") },
  handler: async (ctx, args) => {
    const allAgents = await ctx.db.query("agents").collect();
    return allAgents.filter((a) =>
      (a.parentAgentIds ?? []).some((pId) => pId === args.parentId)
    );
  },
});

/** Get agent hierarchy (agents with nested subagents) */
export const getAgentHierarchy = query({
  handler: async (ctx) => {
    const allAgents = await ctx.db.query("agents").collect();
    const agents = allAgents.filter((a) => (a.agentType ?? "agent") === "agent");
    const subagents = allAgents.filter((a) => a.agentType === "subagent");
    return agents.map((agent) => ({
      ...agent,
      subagents: subagents.filter((sub) =>
        (sub.parentAgentIds ?? []).includes(agent._id)
      ),
    }));
  },
});

/** Get agents by department */
/** Get all agents with their LLM config (for diagnostics) */
export const getAllAgentsWithLLMConfig = query({
  handler: async (ctx) => {
    const agents = await ctx.db.query("agents").collect();
    return agents.map((a) => ({
      _id: a._id,
      name: a.name,
      agentRole: a.agentRole,
      modelId: a.modelId || "NOT_SET",
      provider: a.provider || "NOT_SET",
      status: a.status,
      agentType: a.agentType,
    }));
  },
});

export const getAgentsByDepartment = query({
  args: { department: v.string() },
  handler: async (ctx, args) => {
    const allAgents = await ctx.db.query("agents").collect();
    return allAgents.filter((a) => a.department === args.department);
  },
});

// ---- Mutations ----

/** Create or update an agent */
export const upsertAgent = mutation({
  args: {
    name: v.string(),
    role: v.string(),
    model: v.optional(v.string()),
    avatar: v.optional(v.string()),
    status: v.union(v.literal("active"), v.literal("idle"), v.literal("offline")),
    isSubagent: v.boolean(),
  },
  handler: async (ctx, args) => {
    const now = new Date().toISOString();
    const existing = await ctx.db
      .query("agents")
      .withIndex("by_name", (q) => q.eq("name", args.name))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        role: args.role,
        model: args.model,
        avatar: args.avatar,
        status: args.status,
        lastActive: now,
      });
      return existing._id;
    }

    return await ctx.db.insert("agents", {
      name: args.name,
      role: args.role,
      model: args.model,
      avatar: args.avatar,
      status: args.status,
      lastActive: now,
      isSubagent: args.isSubagent,
      createdAt: now,
    });
  },
});

/** Update agent status */
export const updateAgentStatus = mutation({
  args: {
    id: v.id("agents"),
    status: v.union(v.literal("active"), v.literal("idle"), v.literal("offline")),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      status: args.status,
      lastActive: new Date().toISOString(),
    });
  },
});

/** Create a new agent */
export const createAgent = mutation({
  args: {
    name: v.string(),
    role: v.string(),
    description: v.optional(v.string()),
    notes: v.optional(v.string()),
    model: v.optional(v.string()),
    avatar: v.optional(v.string()),
    status: v.union(v.literal("active"), v.literal("idle"), v.literal("offline")),
    isSubagent: v.boolean(),
  },
  handler: async (ctx, args) => {
    const now = new Date().toISOString();
    return await ctx.db.insert("agents", {
      name: args.name,
      role: args.role,
      description: args.description,
      notes: args.notes,
      model: args.model,
      avatar: args.avatar,
      status: args.status,
      lastActive: now,
      isSubagent: args.isSubagent,
      createdAt: now,
    });
  },
});

/** Update an existing agent by ID */
export const updateAgent = mutation({
  args: {
    id: v.id("agents"),
    name: v.optional(v.string()),
    role: v.optional(v.string()),
    description: v.optional(v.string()),
    notes: v.optional(v.string()),
    systemPrompt: v.optional(v.string()),
    model: v.optional(v.string()),
    provider: v.optional(v.string()),               // LLM provider ("anthropic", "openai", "minimax", etc.)
    status: v.optional(v.union(v.literal("active"), v.literal("idle"), v.literal("offline"))),
    agentType: v.optional(v.string()),              // "agent" | "subagent"
    parentAgentIds: v.optional(v.array(v.id("agents"))), // Parent agents for subagents
    department: v.optional(v.string()),             // "content_production" | "research" | "distribution" | "creative"
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const filtered = Object.fromEntries(
      Object.entries(updates).filter(([_, v]) => v !== undefined)
    );
    // Always update timestamp
    filtered.updatedAt = new Date().toISOString();
    if (updates.status) {
      filtered.lastActive = new Date().toISOString();
    }
    await ctx.db.patch(id, filtered);
  },
});

/** Delete an agent */
export const deleteAgent = mutation({
  args: { id: v.id("agents") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

/** Update agent LLM configuration (modelId + auto-detect provider) */
export const updateAgentLLMConfig = mutation({
  args: {
    id: v.id("agents"),
    modelId: v.string(),
  },
  handler: async (ctx, args) => {
    const provider = getProviderForModel(args.modelId);
    await ctx.db.patch(args.id, {
      modelId: args.modelId,
      provider: provider,
      updatedAt: new Date().toISOString(),
    });
  },
});

/** Map LLM model IDs to their providers */
function getProviderForModel(model: string): string {
  if (model.startsWith("claude-")) return "anthropic";
  if (model.startsWith("gpt-") || model.startsWith("o1-") || model.startsWith("o3-") || model.startsWith("o4-")) return "openai";
  if (model.startsWith("gemini-")) return "google";
  if (model.startsWith("llama-")) return "meta";
  if (model.startsWith("MiniMax-")) return "minimax";
  if (model.startsWith("grok-")) return "grok";
  return "anthropic"; // default fallback
}

/** Seed agent hierarchy (force-update all, create missing, delete unknown) */
export const seedAgentHierarchy = mutation({
  handler: async (ctx) => {
    const now = new Date().toISOString();
    const results = { created: 0, updated: 0, deleted: 0 };

    // Correct hierarchy spec (from Gregory's spec Parts 4-6)
    const hierarchy: Record<
      string,
      {
        agentType: "agent" | "subagent";
        department: string;
        isSubagent: boolean;
        parentNames: string[];
        defaultRole: string;
        modelId: string;
      }
    > = {
      // AGENTS (4)
      "Blog Writer": {
        agentType: "agent",
        department: "content_production",
        isSubagent: false,
        parentNames: [],
        defaultRole: "Long-Form Content Writer",
        modelId: "claude-haiku-4-5-20251001",
      },
      Copywriter: {
        agentType: "agent",
        department: "content_production",
        isSubagent: false,
        parentNames: [],
        defaultRole: "Social Media Copywriter",
        modelId: "claude-haiku-4-5-20251001",
      },
      "Social Publisher": {
        agentType: "agent",
        department: "distribution",
        isSubagent: false,
        parentNames: [],
        defaultRole: "Multi-Platform Publisher",
        modelId: "claude-haiku-4-5-20251001",
      },
      "Research Enhancer": {
        agentType: "agent",
        department: "research",
        isSubagent: false,
        parentNames: [],
        defaultRole: "Research Enhancement Specialist",
        modelId: "claude-opus-4-5-20251101",
      },
      // SUBAGENTS (6)
      "Sentiment Scraper": {
        agentType: "subagent",
        department: "research",
        isSubagent: true,
        parentNames: ["Blog Writer"],
        defaultRole: "Market Sentiment Analyst",
        modelId: "claude-haiku-4-5-20251001",
      },
      "News Scraper": {
        agentType: "subagent",
        department: "research",
        isSubagent: true,
        parentNames: ["Blog Writer"],
        defaultRole: "News & Data Aggregator",
        modelId: "claude-haiku-4-5-20251001",
      },
      Humanizer: {
        agentType: "subagent",
        department: "creative",
        isSubagent: true,
        parentNames: ["Blog Writer", "Copywriter"],
        defaultRole: "Content Humanization Specialist",
        modelId: "claude-haiku-4-5-20251001",
      },
      "HTML Builder": {
        agentType: "subagent",
        department: "content_production",
        isSubagent: true,
        parentNames: ["Blog Writer"],
        defaultRole: "HTML/CSS Production Specialist",
        modelId: "claude-haiku-4-5-20251001",
      },
      "Headline Generator": {
        agentType: "subagent",
        department: "creative",
        isSubagent: true,
        parentNames: ["Copywriter", "Social Publisher"],
        defaultRole: "Headlines & Hooks Specialist",
        modelId: "claude-haiku-4-5-20251001",
      },
      "Image Maker": {
        agentType: "subagent",
        department: "creative",
        isSubagent: true,
        parentNames: ["Social Publisher"],
        defaultRole: "Visual Content Creator",
        modelId: "claude-haiku-4-5-20251001",
      },
    };

    const validNames = new Set(Object.keys(hierarchy));

    // Step 1: Delete agents NOT in spec (e.g. "thomas")
    const allAgents = await ctx.db.query("agents").collect();
    for (const agent of allAgents) {
      if (!validNames.has(agent.name)) {
        await ctx.db.delete(agent._id);
        results.deleted++;
      }
    }

    // Step 2: Create missing agents
    const remaining = await ctx.db.query("agents").collect();
    const existingNames = new Set(remaining.map((a) => a.name));

    for (const [name, spec] of Object.entries(hierarchy)) {
      if (!existingNames.has(name)) {
        await ctx.db.insert("agents", {
          name,
          role: spec.defaultRole,
          modelId: spec.modelId,
          provider: getProviderForModel(spec.modelId),
          status: "idle",
          isSubagent: spec.isSubagent,
          agentType: spec.agentType,
          department: spec.department,
          createdAt: now,
          updatedAt: now,
        });
        results.created++;
      }
    }

    // Step 3: Re-fetch all agents to resolve parent IDs
    const finalAgents = await ctx.db.query("agents").collect();
    const nameToId = new Map(finalAgents.map((a) => [a.name, a._id]));

    // Step 4: Force-update ALL agents with correct hierarchy
    for (const [name, spec] of Object.entries(hierarchy)) {
      const agent = finalAgents.find((a) => a.name === name);
      if (!agent) continue;

      // Resolve parent names to IDs
      const parentIds = spec.parentNames
        .map((pName) => nameToId.get(pName))
        .filter((id): id is typeof agent._id => id !== undefined);

      await ctx.db.patch(agent._id, {
        agentType: spec.agentType,
        department: spec.department,
        isSubagent: spec.isSubagent,
        modelId: spec.modelId,
        provider: getProviderForModel(spec.modelId),
        role: spec.defaultRole,
        parentAgentIds: parentIds.length > 0 ? parentIds : [],
        updatedAt: now,
      });

      results.updated++;
    }

    return results;
  },
});
