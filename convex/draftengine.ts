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

/** Get workflow stats for time tracking (elapsed time + time saved calculation) */
export const getWorkflowStats = query({
  args: { workflowId: v.id("workflows") },
  handler: async (ctx, args) => {
    const steps = await ctx.db
      .query("workflowSteps")
      .withIndex("by_workflowId", (q) => q.eq("workflowId", args.workflowId))
      .collect();

    // Sort by creation time
    const sortedSteps = steps.sort((a, b) => 
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    // Variable time saved rates (minutes saved per second of agent work) by agentRole
    const timeSavedRates: Record<string, number> = {
      "de_topic_research": 3,      // Topic Research: 3 min per second
      "de_trend_analyzer": 5,      // Trend Analysis: 5 min per second
      "de_news_scraper": 3,        // News Analysis: 3 min per second
      "de_blog_writer": 5,         // Blog Writing: 5 min per second
      "de_image_generator": 2,     // Image Generation: 2 min per second
      "de_html_builder": 3,        // HTML Page Build: 3 min per second
      // Default: 3 min per second for any other step
    };

    // Calculate agent work time (only count non-review steps) with variable rates
    let totalTimeSavedSeconds = 0;
    const activityLog: Array<{
      stepNumber: number;
      name: string;
      agentRole: string;
      durationSeconds: number;
      status: string;
      completedAt?: string;
    }> = [];

    for (const step of sortedSteps) {
      // Skip review gates (agentRole === "none")
      if (step.agentRole === "none") continue;

      if (step.status === "completed" && step.completedAt) {
        const createdMs = new Date(step.createdAt).getTime();
        const completedMs = new Date(step.completedAt).getTime();
        const durationSeconds = Math.round((completedMs - createdMs) / 1000);
        
        // Get rate for this agent role (default 3 min per second)
        const rate = timeSavedRates[step.agentRole] ?? 3;
        const timeSavedForThisStep = durationSeconds * rate * 60; // Convert to seconds
        totalTimeSavedSeconds += timeSavedForThisStep;

        activityLog.push({
          stepNumber: step.stepNumber,
          name: step.name,
          agentRole: step.agentRole,
          durationSeconds,
          status: "completed",
          completedAt: step.completedAt,
        });
      } else if (["pending", "agent_working"].includes(step.status)) {
        // Active step - show elapsed time so far
        const createdMs = new Date(step.createdAt).getTime();
        const nowMs = Date.now();
        const durationSeconds = Math.round((nowMs - createdMs) / 1000);
        
        activityLog.push({
          stepNumber: step.stepNumber,
          name: step.name,
          agentRole: step.agentRole,
          durationSeconds,
          status: step.status,
        });
      }
    }

    // Get first step creation time for elapsed time calculation
    const firstStep = sortedSteps.find(s => s.agentRole !== "none");
    const projectStartMs = firstStep ? new Date(firstStep.createdAt).getTime() : Date.now();
    const elapsedMs = Date.now() - projectStartMs;
    const elapsedSeconds = Math.round(elapsedMs / 1000);

    // Convert total time saved from seconds to hours and minutes
    const timeSavedMinutes = Math.round(totalTimeSavedSeconds / 60);
    const timeSavedHours = Math.floor(timeSavedMinutes / 60);
    const timeSavedMins = timeSavedMinutes % 60;

    return {
      elapsedSeconds,
      totalAgentSeconds: Math.round(totalTimeSavedSeconds / 60), // For backward compat, return in minutes
      timeSavedHours,
      timeSavedMinutes: timeSavedMins,
      timeSavedFormatted: `${timeSavedHours}h ${timeSavedMins}m saved`,
      activityLog,
    };
  },
});

// ---- Mutations ----

/** Create a new DraftEngine project AND initialize workflow */
export const createProject = mutation({
  args: {
    topic: v.string(),
    authorName: v.optional(v.string()),
    userId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = new Date().toISOString();
    const nowMs = Date.now();
    
    // Find the DraftEngine Blog template
    const templates = await ctx.db
      .query("workflowTemplates")
      .collect();
    const template = templates.find((t) => t.contentType === "draftengine_blog");
    
    if (!template) {
      throw new Error("DraftEngine Blog template not found. Please seed the database first.");
    }
    
    // Create a workflow for this DraftEngine session
    const workflowId = await ctx.db.insert("workflows", {
      templateId: template._id,
      // sourceResearchId is optional for DraftEngine workflows (no contentResearch record needed)
      selectedAngle: args.topic,
      contentType: "draftengine_blog",
      status: "active",
      currentStepNumber: 1,
      createdAt: now,
      updatedAt: now,
    });
    
    // Create the DraftEngine project
    const projectId = await ctx.db.insert("draftEngineProjects", {
      topic: args.topic,
      authorName: args.authorName || undefined,
      userId: args.userId,
      currentScreen: "researching",
      workflowId,
      createdAt: nowMs,
      updatedAt: nowMs,
    });
    
    // Create the first step (Topic Research)
    await ctx.db.insert("workflowSteps", {
      workflowId,
      stepNumber: 1,
      name: "Topic Research",
      agentRole: "research_enhancer",
      status: "pending",
      requiresApproval: false,
      input: JSON.stringify({ topic: args.topic }),
      timeoutMinutes: 120,
      createdAt: now,
      updatedAt: now,
    });
    
    return { 
      _id: projectId, 
      workflowId,
      topic: args.topic,
      authorName: args.authorName,
      currentScreen: "researching", 
      createdAt: nowMs, 
      updatedAt: nowMs 
    };
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

/** Update a project by workflow ID (used by daemon to update currentScreen) */
export const updateProjectByWorkflow = mutation({
  args: {
    workflowId: v.id("workflows"),
    updates: v.object({
      currentScreen: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    // Find project by workflowId
    const project = await ctx.db
      .query("draftEngineProjects")
      .filter((q) => q.eq(q.field("workflowId"), args.workflowId))
      .first();

    if (!project) {
      // Project not found (might not be a DraftEngine workflow)
      return { updated: false };
    }

    const updated = {
      ...project,
      ...args.updates,
      updatedAt: Date.now(),
    };

    await ctx.db.replace(project._id, updated);
    return { updated: true, project: updated };
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

// ---- Suggestion Requests (processed by daemon) ----

/** Request topic suggestions for a sector (frontend calls this) */
export const requestTopicSuggestions = mutation({
  args: { sector: v.string() },
  handler: async (ctx, args) => {
    const now = Date.now();
    const requestId = await ctx.db.insert("draftEngineSuggestionRequests", {
      type: "topic",
      sector: args.sector.trim(),
      status: "pending",
      createdAt: now,
    });
    return { requestId, status: "pending" };
  },
});

/** Request scene suggestions for a headline (frontend calls this) */
export const requestSceneSuggestions = mutation({
  args: { headline: v.string() },
  handler: async (ctx, args) => {
    const now = Date.now();
    const requestId = await ctx.db.insert("draftEngineSuggestionRequests", {
      type: "scene",
      headline: args.headline.trim(),
      status: "pending",
      createdAt: now,
    });
    return { requestId, status: "pending" };
  },
});

/** Get a suggestion request by ID (frontend polls this to get results) */
export const getSuggestionRequest = query({
  args: { requestId: v.id("draftEngineSuggestionRequests") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.requestId);
  },
});

/** Get pending suggestion requests (daemon polls this) */
export const getPendingSuggestionRequests = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const requests = await ctx.db
      .query("draftEngineSuggestionRequests")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .order("asc")
      .take(args.limit || 10);
    return requests;
  },
});

/** Update a suggestion request with results (daemon calls this) */
export const updateSuggestionRequest = mutation({
  args: {
    requestId: v.id("draftEngineSuggestionRequests"),
    suggestions: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const updated = await ctx.db.patch(args.requestId, {
      suggestions: args.suggestions,
      status: "completed",
      processedAt: now,
    });
    return { updated: true, suggestion: updated };
  },
});

/** Mark a suggestion request as failed (daemon calls this on error) */
export const failSuggestionRequest = mutation({
  args: {
    requestId: v.id("draftEngineSuggestionRequests"),
    error: v.string(),
  },
  handler: async (ctx, args) => {
    const updated = await ctx.db.patch(args.requestId, {
      status: "failed",
      error: args.error,
      processedAt: Date.now(),
    });
    return { updated: true };
  },
});
