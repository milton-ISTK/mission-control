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
    model: v.optional(v.string()),
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

/** Seed agent hierarchy (idempotent) */
export const seedAgentHierarchy = mutation({
  handler: async (ctx) => {
    const allAgents = await ctx.db.query("agents").collect();
    const results = { updated: 0, skipped: 0 };

    // Define hierarchy structure: name -> { agentType, department, role, parentRoles }
    const hierarchy: Record<
      string,
      {
        agentType: string;
        department: string;
        role: string;
        parentRoles: string[];
      }
    > = {
      // Top-level agents
      "Blog Writer": {
        agentType: "agent",
        department: "content_production",
        role: "blog_writer",
        parentRoles: [],
      },
      Copywriter: {
        agentType: "agent",
        department: "content_production",
        role: "copywriter",
        parentRoles: [],
      },
      "Social Publisher": {
        agentType: "agent",
        department: "distribution",
        role: "social_publisher",
        parentRoles: [],
      },
      "Research Enhancer": {
        agentType: "agent",
        department: "research",
        role: "research_enhancer",
        parentRoles: [],
      },
      // Subagents
      "Sentiment Scraper": {
        agentType: "subagent",
        department: "research",
        role: "sentiment_scraper",
        parentRoles: ["blog_writer"],
      },
      "News Scraper": {
        agentType: "subagent",
        department: "research",
        role: "news_scraper",
        parentRoles: ["blog_writer"],
      },
      Humanizer: {
        agentType: "subagent",
        department: "content_production",
        role: "humanizer",
        parentRoles: ["blog_writer", "copywriter"],
      },
      "HTML Builder": {
        agentType: "subagent",
        department: "content_production",
        role: "html_builder",
        parentRoles: ["blog_writer"],
      },
      "Headline Generator": {
        agentType: "subagent",
        department: "creative",
        role: "headline_generator",
        parentRoles: ["copywriter", "social_publisher"],
      },
      "Image Maker": {
        agentType: "subagent",
        department: "creative",
        role: "image_maker",
        parentRoles: ["social_publisher"],
      },
    };

    // Update each agent
    for (const agent of allAgents) {
      const spec = hierarchy[agent.name];
      if (!spec) {
        results.skipped++;
        continue;
      }

      // Skip if already seeded
      if (agent.agentType && agent.department) {
        results.skipped++;
        continue;
      }

      // Resolve parent roles to parent IDs
      const parentIds = spec.parentRoles
        .map((parentRole) => {
          const parent = allAgents.find((a) => a.agentRole === parentRole);
          return parent ? parent._id : null;
        })
        .filter((id) => id !== null) as any[];

      // Update agent with hierarchy info
      await ctx.db.patch(agent._id, {
        agentType: spec.agentType,
        department: spec.department,
        parentAgentIds: parentIds.length > 0 ? parentIds : undefined,
        updatedAt: new Date().toISOString(),
      });

      results.updated++;
    }

    return results;
  },
});
