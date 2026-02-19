/**
 * ISTK Mission Control - Subagent Configuration mutations & queries
 * Handles subagent setup: LLM selection, role assignment, config
 */
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// ---- Queries ----

/** List all subagent configs */
export const listSubagents = query({
  handler: async (ctx) => {
    return await ctx.db.query("subagents").collect();
  },
});

/** List active subagents */
export const getActiveSubagents = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("subagents")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .collect();
  },
});

// ---- Mutations ----

/** Create a new subagent configuration */
export const createSubagent = mutation({
  args: {
    name: v.string(),
    llm: v.string(),
    role: v.string(),
    description: v.optional(v.string()),
    hasApiKey: v.boolean(),
    config: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = new Date().toISOString();
    return await ctx.db.insert("subagents", {
      name: args.name,
      llm: args.llm,
      role: args.role,
      description: args.description,
      hasApiKey: args.hasApiKey,
      isActive: true,
      config: args.config,
      createdAt: now,
      updatedAt: now,
    });
  },
});

/** Update subagent configuration */
export const updateSubagent = mutation({
  args: {
    id: v.id("subagents"),
    name: v.optional(v.string()),
    llm: v.optional(v.string()),
    role: v.optional(v.string()),
    description: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
    config: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const filtered = Object.fromEntries(
      Object.entries(updates).filter(([_, v]) => v !== undefined)
    );
    await ctx.db.patch(id, { ...filtered, updatedAt: new Date().toISOString() });
  },
});

/** Toggle subagent active state */
export const toggleSubagent = mutation({
  args: { id: v.id("subagents") },
  handler: async (ctx, args) => {
    const sub = await ctx.db.get(args.id);
    if (!sub) throw new Error("Subagent not found");
    await ctx.db.patch(args.id, {
      isActive: !sub.isActive,
      updatedAt: new Date().toISOString(),
    });
  },
});

/** Delete a subagent */
export const deleteSubagent = mutation({
  args: { id: v.id("subagents") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
