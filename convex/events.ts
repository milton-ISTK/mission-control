/**
 * ISTK Mission Control - Calendar Event mutations & queries
 * Handles calendar events: cron jobs, deadlines, one-shot events
 */
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// ---- Queries ----

/** List all events */
export const listEvents = query({
  args: {
    type: v.optional(v.union(v.literal("cron"), v.literal("deadline"), v.literal("oneshot"))),
  },
  handler: async (ctx, args) => {
    if (args.type) {
      return await ctx.db
        .query("events")
        .withIndex("by_type", (q) => q.eq("type", args.type!))
        .collect();
    }
    return await ctx.db.query("events").collect();
  },
});

/** Get events for a date range (for calendar rendering) */
export const getCalendarEvents = query({
  args: {
    startDate: v.string(),
    endDate: v.string(),
  },
  handler: async (ctx, args) => {
    const events = await ctx.db.query("events").collect();
    return events.filter((e) => {
      return e.startDate >= args.startDate && e.startDate <= args.endDate;
    });
  },
});

/** Get active cron events */
export const getActiveCrons = query({
  handler: async (ctx) => {
    const crons = await ctx.db
      .query("events")
      .withIndex("by_type", (q) => q.eq("type", "cron"))
      .collect();
    return crons.filter((c) => c.status === "active");
  },
});

// ---- Mutations ----

/** Create a calendar event */
export const createEvent = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    type: v.union(v.literal("cron"), v.literal("deadline"), v.literal("oneshot")),
    schedule: v.optional(v.string()),
    startDate: v.string(),
    endDate: v.optional(v.string()),
    nextRun: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = new Date().toISOString();
    return await ctx.db.insert("events", {
      title: args.title,
      description: args.description,
      type: args.type,
      schedule: args.schedule,
      startDate: args.startDate,
      endDate: args.endDate,
      nextRun: args.nextRun,
      status: "active",
      createdAt: now,
    });
  },
});

/** Update event from cron poll */
export const syncCronEvent = mutation({
  args: {
    title: v.string(),
    schedule: v.optional(v.string()),
    startDate: v.string(),
    lastRun: v.optional(v.string()),
    nextRun: v.optional(v.string()),
    status: v.union(v.literal("active"), v.literal("paused"), v.literal("completed")),
  },
  handler: async (ctx, args) => {
    // Find existing event by title and type
    const events = await ctx.db
      .query("events")
      .withIndex("by_type", (q) => q.eq("type", "cron"))
      .collect();
    const existing = events.find((e) => e.title === args.title);

    if (existing) {
      await ctx.db.patch(existing._id, {
        schedule: args.schedule,
        lastRun: args.lastRun,
        nextRun: args.nextRun,
        status: args.status,
      });
      return existing._id;
    } else {
      return await ctx.db.insert("events", {
        title: args.title,
        type: "cron",
        schedule: args.schedule,
        startDate: args.startDate,
        lastRun: args.lastRun,
        nextRun: args.nextRun,
        status: args.status,
        createdAt: new Date().toISOString(),
      });
    }
  },
});

/** Toggle event status (pause/resume) */
export const toggleEventStatus = mutation({
  args: { id: v.id("events") },
  handler: async (ctx, args) => {
    const event = await ctx.db.get(args.id);
    if (!event) throw new Error("Event not found");
    const newStatus = event.status === "active" ? "paused" : "active";
    await ctx.db.patch(args.id, { status: newStatus });
  },
});

/** Delete an event */
export const deleteEvent = mutation({
  args: { id: v.id("events") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
