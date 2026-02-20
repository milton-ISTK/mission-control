/**
 * ISTK Mission Control - Content Pipeline
 * Research requests, report storage, content generation
 */
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// ---- Queries ----

/** List all research items, ordered by creation date (newest first) */
export const listResearch = query({
  args: {
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (args.status) {
      return await ctx.db
        .query("contentResearch")
        .withIndex("by_status", (q) =>
          q.eq(
            "status",
            args.status as
              | "pending"
              | "researching"
              | "ready"
              | "approved"
              | "rejected"
              | "generating"
              | "complete"
          )
        )
        .order("desc")
        .collect();
    }
    return await ctx.db
      .query("contentResearch")
      .order("desc")
      .collect();
  },
});

/** Get a single research item by ID */
export const getResearch = query({
  args: { id: v.id("contentResearch") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

/** Get pending research items (for daemon polling) */
export const getPendingResearch = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("contentResearch")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .collect();
  },
});

/** Get daemon health status from systemStatus */
export const getDaemonStatus = query({
  handler: async (ctx) => {
    const status = await ctx.db
      .query("systemStatus")
      .withIndex("by_key", (q) => q.eq("key", "daemon_health"))
      .unique();
    return status ?? { key: "daemon_health", status: "unknown", details: "" };
  },
});

/** Get approved research items awaiting content generation */
export const getApprovedResearch = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("contentResearch")
      .withIndex("by_status", (q) => q.eq("status", "approved"))
      .collect();
  },
});

/** Get content pipeline stats */
export const getStats = query({
  handler: async (ctx) => {
    const all = await ctx.db.query("contentResearch").collect();
    return {
      total: all.length,
      pending: all.filter((r) => r.status === "pending").length,
      researching: all.filter((r) => r.status === "researching").length,
      ready: all.filter((r) => r.status === "ready").length,
      approved: all.filter((r) => r.status === "approved").length,
      generating: all.filter((r) => r.status === "generating").length,
      complete: all.filter((r) => r.status === "complete").length,
      rejected: all.filter((r) => r.status === "rejected").length,
      cancelled: all.filter((r) => r.status === "cancelled").length,
    };
  },
});

// ---- Mutations ----

/** Create a new research request */
export const createResearch = mutation({
  args: {
    topic: v.string(),
    requestedBy: v.optional(v.string()),
    llmModel: v.optional(v.string()),
    llmProvider: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = new Date().toISOString();
    return await ctx.db.insert("contentResearch", {
      topic: args.topic,
      status: "pending",
      requestedBy: args.requestedBy ?? "Gregory",
      llmModel: args.llmModel,
      llmProvider: args.llmProvider,
      // API key is NOT stored here. It lives on Milton's disk only (~/config/mission-control/api-keys.json)
      createdAt: now,
      updatedAt: now,
    });
  },
});

/** Update research status (used by daemon when picking up work) */
export const updateStatus = mutation({
  args: {
    id: v.id("contentResearch"),
    status: v.union(
      v.literal("pending"),
      v.literal("researching"),
      v.literal("ready"),
      v.literal("approved"),
      v.literal("rejected"),
      v.literal("cancelled"),
      v.literal("generating"),
      v.literal("complete")
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      status: args.status,
      updatedAt: new Date().toISOString(),
    });
  },
});

/** Submit research results (called by subagent via HTTP) */
export const submitResults = mutation({
  args: {
    id: v.id("contentResearch"),
    summary: v.string(),
    sentiment: v.string(),
    narratives: v.array(v.string()),
    angles: v.array(v.string()),
    quotes: v.array(v.string()),
    sources: v.optional(v.string()),
    fullReport: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...data } = args;
    await ctx.db.patch(id, {
      ...data,
      status: "ready",
      updatedAt: new Date().toISOString(),
    });
  },
});

/** Approve research with selected angle */
export const approveResearch = mutation({
  args: {
    id: v.id("contentResearch"),
    selectedAngle: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      status: "approved",
      selectedAngle: args.selectedAngle,
      updatedAt: new Date().toISOString(),
    });
  },
});

/** Reject research with optional error message */
export const rejectResearch = mutation({
  args: {
    id: v.id("contentResearch"),
    errorMessage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      status: "rejected",
      errorMessage: args.errorMessage,
      updatedAt: new Date().toISOString(),
    });
  },
});

/** Submit generated content */
export const submitContent = mutation({
  args: {
    id: v.id("contentResearch"),
    xPosts: v.array(v.string()),
    linkedinPosts: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      xPosts: args.xPosts,
      linkedinPosts: args.linkedinPosts,
      status: "complete",
      updatedAt: new Date().toISOString(),
    });
  },
});

/** Update live thinking feed during research */
export const updateProgress = mutation({
  args: {
    id: v.id("contentResearch"),
    thinkingLine1: v.optional(v.string()),
    thinkingLine2: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const patch: Record<string, string | undefined> = {
      updatedAt: new Date().toISOString(),
    };
    if (args.thinkingLine1 !== undefined) patch.thinkingLine1 = args.thinkingLine1;
    if (args.thinkingLine2 !== undefined) patch.thinkingLine2 = args.thinkingLine2;
    await ctx.db.patch(args.id, patch);
  },
});

/** Cancel a research item (stops active research, marks as cancelled) */
export const cancelResearch = mutation({
  args: { id: v.id("contentResearch") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      status: "cancelled",
      updatedAt: new Date().toISOString(),
    });
  },
});

/** Delete a research item */
export const deleteResearch = mutation({
  args: { id: v.id("contentResearch") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

// ---- API Key Management ----

/** Save or update API key for a provider */
export const saveApiKey = mutation({
  args: {
    provider: v.string(),
    key: v.string(),
  },
  handler: async (ctx, args) => {
    const now = new Date().toISOString();
    const existing = await ctx.db
      .query("apiKeys")
      .withIndex("by_provider", (q) => q.eq("provider", args.provider))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        keyPlaintext: args.key,
        isActive: true,
        updatedAt: now,
      });
      return existing._id;
    } else {
      return await ctx.db.insert("apiKeys", {
        provider: args.provider,
        keyPlaintext: args.key,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      });
    }
  },
});

/** Delete API key for a provider */
export const deleteApiKey = mutation({
  args: { provider: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("apiKeys")
      .withIndex("by_provider", (q) => q.eq("provider", args.provider))
      .unique();

    if (existing) {
      await ctx.db.delete(existing._id);
    }
  },
});

/** Get all API keys (for sync daemon) — returns keys unencrypted so daemon can save locally */
export const getAllApiKeys = query({
  handler: async (ctx) => {
    const keys = await ctx.db.query("apiKeys").collect();
    return keys.map((k) => ({
      _id: k._id,
      provider: k.provider,
      keyPlaintext: k.keyPlaintext,
      isActive: k.isActive,
      lastSynced: k.lastSynced,
    }));
  },
});

/** Get API key for a specific provider */
export const getApiKey = query({
  args: { provider: v.string() },
  handler: async (ctx, args) => {
    const key = await ctx.db
      .query("apiKeys")
      .withIndex("by_provider", (q) => q.eq("provider", args.provider))
      .unique();
    return key;
  },
});

/** Update lastSynced timestamp (called by daemon after picking up key) */
export const markApiKeySynced = mutation({
  args: { provider: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("apiKeys")
      .withIndex("by_provider", (q) => q.eq("provider", args.provider))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        lastSynced: new Date().toISOString(),
      });
    }
  },
});
