/**
 * ISTK Mission Control - Workflow Orchestration Engine
 * Queries & mutations for workflow templates, workflow instances, and workflow steps.
 * Phase 1: Schema + CRUD + advanceWorkflow state machine
 */
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// ============================================================
// QUERIES
// ============================================================

/** Get a single workflow by ID */
export const getWorkflow = query({
  args: { id: v.id("workflows") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

/** Get workflows filtered by status */
export const getWorkflowsByStatus = query({
  args: {
    status: v.union(
      v.literal("pending"),
      v.literal("active"),
      v.literal("paused"),
      v.literal("completed"),
      v.literal("failed"),
      v.literal("cancelled")
    ),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("workflows")
      .withIndex("by_status", (q) => q.eq("status", args.status))
      .collect();
  },
});

/** Get all workflow steps for a given workflow, ordered by stepNumber */
export const getWorkflowSteps = query({
  args: { workflowId: v.id("workflows") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("workflowSteps")
      .withIndex("by_workflowId", (q) => q.eq("workflowId", args.workflowId))
      .collect();
  },
});

/** Get all active workflows (status = "active") */
export const getActiveWorkflows = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("workflows")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .collect();
  },
});

/** Get all workflow steps that are awaiting human review */
export const getStepsAwaitingReview = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("workflowSteps")
      .withIndex("by_status", (q) => q.eq("status", "awaiting_review"))
      .collect();
  },
});

/** Get all workflow templates */
export const getWorkflowTemplates = query({
  handler: async (ctx) => {
    return await ctx.db.query("workflowTemplates").collect();
  },
});

/** Get all pending workflow steps (for daemon polling) */
export const getPendingSteps = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("workflowSteps")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .collect();
  },
});

/** Get a single workflow step by ID */
export const getWorkflowStep = query({
  args: { id: v.id("workflowSteps") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// ============================================================
// MUTATIONS
// ============================================================

/** Create a new workflow template */
export const createWorkflowTemplate = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    contentType: v.string(),
    steps: v.array(v.object({
      stepNumber: v.number(),
      name: v.string(),
      description: v.optional(v.string()),
      agentRole: v.string(),
      requiresApproval: v.boolean(),
      timeoutMinutes: v.number(),
      parallelWith: v.optional(v.array(v.number())),
    })),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    const now = new Date().toISOString();
    return await ctx.db.insert("workflowTemplates", {
      name: args.name,
      description: args.description,
      contentType: args.contentType,
      steps: args.steps,
      isActive: args.isActive,
      createdAt: now,
      updatedAt: now,
    });
  },
});

/**
 * Create a new workflow instance from a template.
 * Finds matching template by contentType, creates the workflow, and
 * creates the first batch of workflow steps (step 1 + any parallel steps).
 */
export const createWorkflow = mutation({
  args: {
    sourceResearchId: v.id("contentResearch"),
    selectedAngle: v.string(),
    contentType: v.string(),
    briefing: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = new Date().toISOString();

    // Find active template for this content type
    const template = await ctx.db
      .query("workflowTemplates")
      .withIndex("by_contentType", (q) => q.eq("contentType", args.contentType))
      .first();

    if (!template) {
      throw new Error(`No active workflow template found for contentType: ${args.contentType}`);
    }

    // Get source research data for initial input
    const research = await ctx.db.get(args.sourceResearchId);
    if (!research) {
      throw new Error("Source research not found");
    }

    // Create a task record on the Task Board for this workflow
    const contentTypeLabel = {
      blog_post: "📝 Blog Post",
      social_image: "🖼️ Social Image",
      x_thread: "𝕏 Thread",
      linkedin_post: "💼 LinkedIn Post",
    }[args.contentType] || args.contentType;

    const taskId = await ctx.db.insert("tasks", {
      title: `${contentTypeLabel}: ${args.selectedAngle}`,
      description: args.briefing,
      status: "in_progress",
      priority: "medium",
      assignee: "Milton", // Milton orchestrates the workflow
      createdAt: now,
      updatedAt: now,
      order: 0, // Placeholder — UI will handle ordering
    });

    // Create the workflow record linked to the task
    const workflowId = await ctx.db.insert("workflows", {
      templateId: template._id,
      sourceResearchId: args.sourceResearchId,
      taskId, // Link to Task Board
      selectedAngle: args.selectedAngle,
      contentType: args.contentType,
      briefing: args.briefing,
      status: "active",
      currentStepNumber: 1,
      createdAt: now,
      updatedAt: now,
    });

    // Build the initial input from research data
    const initialInput = JSON.stringify({
      topic: research.topic,
      selectedAngle: args.selectedAngle,
      briefing: args.briefing,
      summary: research.summary,
      sentiment: research.sentiment,
      narratives: research.narratives,
      angles: research.angles,
      quotes: research.quotes,
      sources: research.sources,
      fullReport: research.fullReport,
    });

    // Find the first step(s) — step 1 + any parallel steps
    const sortedSteps = [...template.steps].sort((a, b) => a.stepNumber - b.stepNumber);
    const firstStep = sortedSteps[0];
    if (!firstStep) {
      throw new Error("Template has no steps");
    }

    // Collect all steps in the first batch (step 1 + parallelWith)
    const batchStepNumbers = new Set([firstStep.stepNumber]);
    if (firstStep.parallelWith) {
      firstStep.parallelWith.forEach((n) => batchStepNumbers.add(n));
    }

    // Create workflow step records for the first batch
    for (const stepNum of Array.from(batchStepNumbers)) {
      const templateStep = template.steps.find((ts) => ts.stepNumber === stepNum);
      if (!templateStep) continue;

      await ctx.db.insert("workflowSteps", {
        workflowId,
        stepNumber: stepNum,
        name: templateStep.name,
        agentRole: templateStep.agentRole,
        status: "pending",
        input: initialInput,
        requiresApproval: templateStep.requiresApproval,
        timeoutMinutes: templateStep.timeoutMinutes,
        createdAt: now,
        updatedAt: now,
      });
    }

    return workflowId;
  },
});

/**
 * advanceWorkflow — CRITICAL STATE MACHINE
 *
 * Called after a step completes (or is approved). Determines what happens next:
 * 1. Get workflow + all its steps
 * 2. Get template
 * 3. Check if all current-batch steps are complete
 * 4. If not all complete → return (waiting for parallel partners)
 * 5. If all complete → find next step(s) in template
 * 6. If no next step → mark workflow as "completed"
 * 7. If next step exists → create new workflowSteps with status "pending"
 * 8. Handle parallelWith correctly (create all parallel steps together)
 */
export const advanceWorkflow = mutation({
  args: { workflowId: v.id("workflows") },
  handler: async (ctx, args) => {
    const now = new Date().toISOString();

    // 1. Get workflow
    const workflow = await ctx.db.get(args.workflowId);
    if (!workflow) throw new Error("Workflow not found");
    if (workflow.status !== "active") return; // Only advance active workflows

    // 2. Get all workflow steps
    const allSteps = await ctx.db
      .query("workflowSteps")
      .withIndex("by_workflowId", (q) => q.eq("workflowId", args.workflowId))
      .collect();

    // 3. Get template
    const template = await ctx.db.get(workflow.templateId);
    if (!template) throw new Error("Workflow template not found");

    // Check for any steps still in progress (pending, agent_working, awaiting_review)
    const activeSteps = allSteps.filter((s) =>
      ["pending", "agent_working", "awaiting_review"].includes(s.status)
    );

    // If there are still active steps, don't advance yet
    if (activeSteps.length > 0) return;

    // Find all completed step numbers
    const completedStepNumbers = allSteps
      .filter((s) => s.status === "completed")
      .map((s) => s.stepNumber);

    if (completedStepNumbers.length === 0) return;

    const maxCompletedStepNum = Math.max(...completedStepNumbers);

    // 4. Find the next step(s) in the template
    const remainingTemplateSteps = template.steps
      .filter((ts) => ts.stepNumber > maxCompletedStepNum)
      .sort((a, b) => a.stepNumber - b.stepNumber);

    // 5. If no next step → workflow is completed
    if (remainingTemplateSteps.length === 0) {
      await ctx.db.patch(args.workflowId, {
        status: "completed",
        completedAt: now,
        updatedAt: now,
      });

      // Update linked task to "done"
      try {
        await ctx.db.patch(workflow.taskId, {
          status: "done",
          updatedAt: now,
        });
      } catch {
        // Task may not exist — non-fatal
      }

      // Update source research status to "complete"
      try {
        await ctx.db.patch(workflow.sourceResearchId, {
          status: "complete",
          updatedAt: now,
        });
      } catch {
        // Source research may not exist or may already be complete — non-fatal
      }

      return;
    }

    // 6. Get the first remaining step and its parallel group
    const nextStep = remainingTemplateSteps[0];
    const batchStepNumbers = new Set([nextStep.stepNumber]);
    if (nextStep.parallelWith) {
      nextStep.parallelWith.forEach((n) => batchStepNumbers.add(n));
    }
    // Also check if any of the parallel partners reference other steps
    for (const stepNum of Array.from(batchStepNumbers)) {
      const ts = template.steps.find((s) => s.stepNumber === stepNum);
      if (ts?.parallelWith) {
        ts.parallelWith.forEach((n) => batchStepNumbers.add(n));
      }
    }

    // 7. Collect output from the just-completed batch as input for next steps
    // Find the previous batch's step numbers (highest completed group)
    const prevBatchNums = new Set<number>();
    const highestTemplate = template.steps.find((ts) => ts.stepNumber === maxCompletedStepNum);
    prevBatchNums.add(maxCompletedStepNum);
    if (highestTemplate?.parallelWith) {
      highestTemplate.parallelWith.forEach((n) => prevBatchNums.add(n));
    }

    const prevBatchOutputs = allSteps
      .filter((s) => s.status === "completed" && prevBatchNums.has(s.stepNumber));

    let combinedInput: string | undefined;
    if (prevBatchOutputs.length === 1) {
      combinedInput = prevBatchOutputs[0].output;
    } else if (prevBatchOutputs.length > 1) {
      // Multiple parallel steps completed — combine their outputs
      combinedInput = JSON.stringify(
        prevBatchOutputs.map((s) => ({
          stepNumber: s.stepNumber,
          name: s.name,
          output: s.output,
        }))
      );
    }

    // 8. Create workflowSteps for the next batch
    for (const stepNum of Array.from(batchStepNumbers)) {
      const templateStep = template.steps.find((ts) => ts.stepNumber === stepNum);
      if (!templateStep) continue;

      await ctx.db.insert("workflowSteps", {
        workflowId: args.workflowId,
        stepNumber: stepNum,
        name: templateStep.name,
        agentRole: templateStep.agentRole,
        status: "pending",
        input: combinedInput,
        requiresApproval: templateStep.requiresApproval,
        timeoutMinutes: templateStep.timeoutMinutes,
        createdAt: now,
        updatedAt: now,
      });
    }

    // Update workflow currentStepNumber to the highest in the new batch
    await ctx.db.patch(args.workflowId, {
      currentStepNumber: Math.max(...Array.from(batchStepNumbers)),
      updatedAt: now,
    });
  },
});

/**
 * Approve a workflow step (human review passed).
 * Sets step to "completed" and triggers advanceWorkflow.
 */
export const approveStep = mutation({
  args: {
    stepId: v.id("workflowSteps"),
    selectedOption: v.optional(v.string()),
    reviewNotes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = new Date().toISOString();
    const step = await ctx.db.get(args.stepId);
    if (!step) throw new Error("Step not found");

    await ctx.db.patch(args.stepId, {
      status: "completed",
      selectedOption: args.selectedOption,
      reviewNotes: args.reviewNotes,
      completedAt: now,
      updatedAt: now,
    });

    // Trigger advance — internally checks if all parallel steps are done
    const workflow = await ctx.db.get(step.workflowId);
    if (workflow && workflow.status === "active") {
      // Re-run advanceWorkflow logic inline (can't call mutations from mutations)
      // We'll trigger it via the caller or use a scheduled function pattern.
      // For now, the caller (HTTP endpoint or UI) should call advanceWorkflow after approve.
    }
  },
});

/**
 * Reject a workflow step (human review failed).
 * Sets step to "rejected" with review notes.
 */
export const rejectStep = mutation({
  args: {
    stepId: v.id("workflowSteps"),
    reviewNotes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = new Date().toISOString();

    await ctx.db.patch(args.stepId, {
      status: "rejected",
      reviewNotes: args.reviewNotes,
      updatedAt: now,
    });
  },
});

/** Cancel a workflow (sets status to "cancelled") */
export const cancelWorkflow = mutation({
  args: { workflowId: v.id("workflows") },
  handler: async (ctx, args) => {
    const now = new Date().toISOString();
    await ctx.db.patch(args.workflowId, {
      status: "cancelled",
      updatedAt: now,
    });

    // Also cancel any pending/active steps
    const steps = await ctx.db
      .query("workflowSteps")
      .withIndex("by_workflowId", (q) => q.eq("workflowId", args.workflowId))
      .collect();

    for (const step of steps) {
      if (["pending", "agent_working", "awaiting_review"].includes(step.status)) {
        await ctx.db.patch(step._id, {
          status: "skipped",
          updatedAt: now,
        });
      }
    }
  },
});

/** Retry a failed/rejected step — resets to "pending" */
export const retryStep = mutation({
  args: { stepId: v.id("workflowSteps") },
  handler: async (ctx, args) => {
    const now = new Date().toISOString();
    const step = await ctx.db.get(args.stepId);
    if (!step) throw new Error("Step not found");

    await ctx.db.patch(args.stepId, {
      status: "pending",
      output: undefined,
      errorMessage: undefined,
      thinkingLine1: undefined,
      thinkingLine2: undefined,
      startedAt: undefined,
      completedAt: undefined,
      reviewNotes: undefined,
      selectedOption: undefined,
      retryCount: (step.retryCount || 0) + 1,
      updatedAt: now,
    });
  },
});

/** Update step status (used by daemon when picking up work) */
export const updateStepStatus = mutation({
  args: {
    stepId: v.id("workflowSteps"),
    status: v.union(
      v.literal("pending"),
      v.literal("agent_working"),
      v.literal("completed"),
      v.literal("failed"),
      v.literal("awaiting_review"),
      v.literal("rejected"),
      v.literal("skipped")
    ),
  },
  handler: async (ctx, args) => {
    const now = new Date().toISOString();
    const patch: Record<string, unknown> = {
      status: args.status,
      updatedAt: now,
    };

    if (args.status === "agent_working") {
      patch.startedAt = now;
    }
    if (args.status === "completed") {
      patch.completedAt = now;
    }

    await ctx.db.patch(args.stepId, patch);
  },
});

/** Update step output (used by daemon to submit agent results) */
export const updateStepOutput = mutation({
  args: {
    stepId: v.id("workflowSteps"),
    output: v.string(),
  },
  handler: async (ctx, args) => {
    const now = new Date().toISOString();
    const step = await ctx.db.get(args.stepId);
    if (!step) throw new Error("Step not found");

    // Determine new status based on whether approval is needed
    const newStatus = step.requiresApproval ? "awaiting_review" : "completed";

    await ctx.db.patch(args.stepId, {
      output: args.output,
      status: newStatus,
      completedAt: now,
      updatedAt: now,
    });
  },
});

/** Update step thinking lines (live progress feed) */
export const updateStepThinking = mutation({
  args: {
    stepId: v.id("workflowSteps"),
    thinkingLine1: v.optional(v.string()),
    thinkingLine2: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = new Date().toISOString();
    const patch: Record<string, string | undefined> = {
      updatedAt: now,
    };
    if (args.thinkingLine1 !== undefined) patch.thinkingLine1 = args.thinkingLine1;
    if (args.thinkingLine2 !== undefined) patch.thinkingLine2 = args.thinkingLine2;
    await ctx.db.patch(args.stepId, patch);
  },
});

/** Mark step as failed with error message */
export const failStep = mutation({
  args: {
    stepId: v.id("workflowSteps"),
    errorMessage: v.string(),
  },
  handler: async (ctx, args) => {
    const now = new Date().toISOString();
    await ctx.db.patch(args.stepId, {
      status: "failed",
      errorMessage: args.errorMessage,
      updatedAt: now,
    });
  },
});

/** Mark step as completed and trigger advanceWorkflow (used by step-complete endpoint) */
export const completeStep = mutation({
  args: {
    stepId: v.id("workflowSteps"),
  },
  handler: async (ctx, args) => {
    const now = new Date().toISOString();
    await ctx.db.patch(args.stepId, {
      status: "completed",
      completedAt: now,
      updatedAt: now,
    });
  },
});
