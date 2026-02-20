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
