/**
 * ISTK Mission Control - Task mutations & queries
 * Handles Kanban board operations: CRUD + status updates + reordering
 */
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// ---- Queries ----

/** List all tasks, optionally filtered by status */
export const listTasks = query({
  args: {
    status: v.optional(
      v.union(v.literal("todo"), v.literal("in_progress"), v.literal("done"))
    ),
  },
  handler: async (ctx, args) => {
    if (args.status) {
      return await ctx.db
        .query("tasks")
        .withIndex("by_status", (q) => q.eq("status", args.status!))
        .collect();
    }
    return await ctx.db.query("tasks").collect();
  },
});

/** Get a single task by ID */
export const getTask = query({
  args: { id: v.id("tasks") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

/** List tasks by assignee */
export const tasksByAssignee = query({
  args: { assignee: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("tasks")
      .withIndex("by_assignee", (q) => q.eq("assignee", args.assignee))
      .collect();
  },
});

// ---- Mutations ----

/** Create a new task */
export const createTask = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    priority: v.union(
      v.literal("critical"),
      v.literal("high"),
      v.literal("medium"),
      v.literal("low")
    ),
    assignee: v.string(),
    dueDate: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    // Get current max order for todo column
    const todos = await ctx.db
      .query("tasks")
      .withIndex("by_status", (q) => q.eq("status", "todo"))
      .collect();
    const maxOrder = todos.length > 0
      ? Math.max(...todos.map((t) => t.order)) + 1
      : 0;

    return await ctx.db.insert("tasks", {
      title: args.title,
      description: args.description,
      status: "todo",
      priority: args.priority,
      assignee: args.assignee,
      dueDate: args.dueDate,
      tags: args.tags ?? [],
      order: maxOrder,
      createdAt: now,
      updatedAt: now,
    });
  },
});

/** Update task status (drag between columns) */
export const updateTaskStatus = mutation({
  args: {
    id: v.id("tasks"),
    status: v.union(v.literal("todo"), v.literal("in_progress"), v.literal("done")),
    order: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const updates: Record<string, unknown> = {
      status: args.status,
      updatedAt: now,
    };
    if (args.order !== undefined) {
      updates.order = args.order;
    }
    await ctx.db.patch(args.id, updates);
  },
});

/** Update task details */
export const updateTask = mutation({
  args: {
    id: v.id("tasks"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    priority: v.optional(
      v.union(
        v.literal("critical"),
        v.literal("high"),
        v.literal("medium"),
        v.literal("low")
      )
    ),
    assignee: v.optional(v.string()),
    dueDate: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const filtered = Object.fromEntries(
      Object.entries(updates).filter(([_, v]) => v !== undefined)
    );
    await ctx.db.patch(id, { ...filtered, updatedAt: Date.now() });
  },
});

/** Toggle assignee between Gregory and Milton */
export const toggleAssignee = mutation({
  args: { id: v.id("tasks") },
  handler: async (ctx, args) => {
    const task = await ctx.db.get(args.id);
    if (!task) throw new Error("Task not found");
    const newAssignee = task.assignee === "Gregory" ? "Milton" : "Gregory";
    await ctx.db.patch(args.id, {
      assignee: newAssignee,
      updatedAt: Date.now(),
    });
  },
});

/** Delete a task */
export const deleteTask = mutation({
  args: { id: v.id("tasks") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
