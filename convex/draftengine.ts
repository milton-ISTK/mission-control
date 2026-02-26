/**
 * ISTK Mission Control - DraftEngine B2C Platform
 * Queries and mutations for managing DraftEngine projects (user blog creation sessions)
 */
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// ---- Queries ----

/** Get all DraftEngine projects */
export const listProjects = query({
  handler: async (ctx) => {
    return await ctx.db.query("draftEngineProjects").collect();
  },
});

/** Get a specific project by ID */
export const getProject = query({
  args: { projectId: v.id("draftEngineProjects") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.projectId);
  },
});

/** Get project by workflow ID (lookup the project associated with a workflow) */
export const getProjectByWorkflow = query({
  args: { workflowId: v.id("workflows") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("draftEngineProjects")
      .withIndex("by_workflowId", (q) => q.eq("workflowId", args.workflowId))
      .first();
  },
});

/** Get projects by current screen (for filtering/debugging) */
export const getProjectsByScreen = query({
  args: { currentScreen: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("draftEngineProjects")
      .withIndex("by_currentScreen", (q) => q.eq("currentScreen", args.currentScreen))
      .collect();
  },
});

/** Get projects by user ID (for future auth support) */
export const getProjectsByUser = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("draftEngineProjects")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();
  },
});

// ---- Mutations ----

/** Create a new DraftEngine project */
export const createProject = mutation({
  args: {
    topic: v.string(),
    userId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const projectId = await ctx.db.insert("draftEngineProjects", {
      topic: args.topic,
      userId: args.userId,
      currentScreen: "researching",
      createdAt: now,
      updatedAt: now,
    });
    return { _id: projectId, ...args, currentScreen: "researching", createdAt: now, updatedAt: now };
  },
});

/** Update a project's selections and state */
export const updateProject = mutation({
  args: {
    projectId: v.id("draftEngineProjects"),
    updates: v.object({
      workflowId: v.optional(v.id("workflows")),
      selectedHeadlineIndex: v.optional(v.number()),
      selectedHeadline: v.optional(v.string()),
      imageStyle: v.optional(v.string()),
      imageSceneDescription: v.optional(v.string()),
      selectedImageIndex: v.optional(v.number()),
      selectedImageUrl: v.optional(v.string()),
      themeId: v.optional(v.string()),
      accentColor: v.optional(v.string()),
      paletteName: v.optional(v.string()),
      currentScreen: v.optional(v.string()),
      blogContent: v.optional(v.string()),
      finalHtmlUrl: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.projectId);
    if (!project) {
      throw new Error("Project not found");
    }

    const updated = {
      ...project,
      ...args.updates,
      updatedAt: Date.now(),
    };

    await ctx.db.replace(args.projectId, updated);
    return updated;
  },
});

/** Mark a project as completed */
export const completeProject = mutation({
  args: {
    projectId: v.id("draftEngineProjects"),
    finalHtmlUrl: v.string(),
  },
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.projectId);
    if (!project) {
      throw new Error("Project not found");
    }

    const updated = {
      ...project,
      currentScreen: "complete",
      finalHtmlUrl: args.finalHtmlUrl,
      completedAt: Date.now(),
      updatedAt: Date.now(),
    };

    await ctx.db.replace(args.projectId, updated);
    return updated;
  },
});

/** Delete a project (for cleanup) */
export const deleteProject = mutation({
  args: { projectId: v.id("draftEngineProjects") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.projectId);
    return { deleted: true };
  },
});
