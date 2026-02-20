/**
 * ISTK Mission Control - System Status
 * Tracks daemon health, sync status, and infrastructure state.
 * Updated by the Mac mini sync script every 60 seconds.
 */
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// ---- Queries ----

/** Get daemon health status */
export const getDaemonStatus = query({
  handler: async (ctx) => {
    const entry = await ctx.db
      .query("systemStatus")
      .withIndex("by_key", (q) => q.eq("key", "daemon_health"))
      .first();

    if (!entry) {
      return { status: "unknown" as const, updatedAt: null, details: null };
    }

    // If entry hasn't been updated in 3 minutes, consider it offline
    const updatedAt = new Date(entry.updatedAt).getTime();
    const now = Date.now();
    const staleThresholdMs = 3 * 60 * 1000;

    const isStale = now - updatedAt > staleThresholdMs;
    const effectiveStatus = isStale ? "offline" : entry.status;

    return {
      status: effectiveStatus as "online" | "offline" | "unknown",
      updatedAt: entry.updatedAt,
      details: entry.details ?? null,
    };
  },
});

// ---- Mutations ----

/** Upsert a system status entry (called by sync script) */
export const upsertStatus = mutation({
  args: {
    key: v.string(),
    status: v.string(),
    details: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = new Date().toISOString();
    const existing = await ctx.db
      .query("systemStatus")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        status: args.status,
        details: args.details,
        updatedAt: now,
      });
      return existing._id;
    }

    return await ctx.db.insert("systemStatus", {
      key: args.key,
      status: args.status,
      details: args.details,
      updatedAt: now,
    });
  },
});
