/**
 * ISTK Mission Control - Workflow Orchestration Engine
 * Queries & mutations for workflow templates, workflow instances, and workflow steps.
 * Phase 1: Schema + CRUD + advanceWorkflow state machine
 * Phase 3: Workflow enforcement for agent hierarchy
 */
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { QueryCtx } from "./_generated/server";

// ============================================================
// WORKFLOW ENFORCEMENT (Phase 3)
// ============================================================

/**
 * Validate that an agent is allowed to work on a step in a specific workflow.
 * - Top-level agents can work on any step
 * - Subagents can only work if one of their parent agents is in the workflow template
 */
async function validateAgentForStep(
  ctx: QueryCtx,
  agentRole: string,
  workflowId: string
): Promise<boolean> {
  // Find the agent with matching agentRole
  const allAgents = await ctx.db.query("agents").collect();
  const agent = allAgents.find((a) => a.agentRole === agentRole);

  if (!agent) {
    console.warn(`[workflow-enforce] Agent with role "${agentRole}" not found`);
    return false; // No agent found
  }

  // If it's a top-level agent, always allowed
  if ((agent.agentType ?? "agent") === "agent") {
    return true;
  }

  // If it's a subagent, check if any of its parents are in this workflow template
  const workflow = await ctx.db.query("workflows").collect().then((ws) => ws.find((w) => w._id.toString() === workflowId));
  if (!workflow) {
    console.warn(`[workflow-enforce] Workflow "${workflowId}" not found`);
    return false;
  }

  const template = await ctx.db.get(workflow.templateId);
  if (!template) {
    console.warn(`[workflow-enforce] Workflow template not found`);
    return false;
  }

  // Check if any parent agent has a role that appears in this workflow template
  const parentIds = agent.parentAgentIds ?? [];
  for (const parentId of parentIds) {
    const parent = await ctx.db.get(parentId);
    if (parent && parent.agentRole) {
      const parentInWorkflow = template.steps.some((s) => s.agentRole === parent.agentRole);
      if (parentInWorkflow) {
        return true; // Allowed — parent is in this workflow
      }
    }
  }

  console.warn(
    `[workflow-enforce] Subagent "${agent.name}" (role: ${agentRole}) is not bound to any agent in workflow template "${template.name}"`
  );
  return false;
}

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

/** Get all workflows with optional status filter, sorted newest first */
export const getAllWorkflows = query({
  args: { status: v.optional(v.string()) },
  handler: async (ctx, args) => {
    let workflows;
    if (args.status) {
      workflows = await ctx.db
        .query("workflows")
        .withIndex("by_status", (q) => q.eq("status", args.status as any))
        .collect();
    } else {
      workflows = await ctx.db.query("workflows").collect();
    }
    
    // Sort by createdAt descending (newest first)
    workflows.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    // Enrich with template and task
    const enriched = await Promise.all(
      workflows.map(async (w) => {
        const template = await ctx.db.get(w.templateId);
        const task = w.taskId ? await ctx.db.get(w.taskId) : null;
        return { ...w, template, task };
      })
    );
    
    return enriched;
  },
});

/** Get workflow by linked taskId (returns first match or null) */
export const getWorkflowByTaskId = query({
  args: { taskId: v.id("tasks") },
  handler: async (ctx, args) => {
    const workflows = await ctx.db.query("workflows").collect();
    const workflow = workflows.find((w) => w.taskId && w.taskId.toString() === args.taskId.toString());
    
    if (!workflow) return null;
    
    const template = await ctx.db.get(workflow.templateId);
    return { ...workflow, template };
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
    authorId: v.optional(v.id("authors")),
  },
  handler: async (ctx, args) => {
    const nowTimestamp = Date.now();
    const nowIso = new Date().toISOString();

    // Find active template for this content type
    // If multiple exist (e.g., during migration), use the most recently created one
    const templates = await ctx.db
      .query("workflowTemplates")
      .withIndex("by_contentType", (q) => q.eq("contentType", args.contentType))
      .collect();
    
    const activeTemplates = templates.filter((t) => t.isActive !== false);
    if (activeTemplates.length === 0) {
      throw new Error(`No active workflow template found for contentType: ${args.contentType}`);
    }
    
    // Sort by createdAt descending to get the newest one
    const template = activeTemplates.sort((a, b) => {
      const aTime = new Date(a.createdAt).getTime();
      const bTime = new Date(b.createdAt).getTime();
      return bTime - aTime;
    })[0];

    // Get source research data for initial input
    const research = await ctx.db.get(args.sourceResearchId);
    if (!research) {
      throw new Error("Source research not found");
    }

    // Step 1: Create task record FIRST
    const contentTypeLabel = {
      blog_post: "📝 Blog Post",
      social_image: "🖼️ Social Image",
      x_thread: "𝕏 Thread",
      linkedin_post: "💼 LinkedIn Post",
    }[args.contentType] || args.contentType;

    console.log("ABOUT TO INSERT TASK");
    const taskId = await ctx.db.insert("tasks", {
      title: `${contentTypeLabel}: ${args.selectedAngle}`,
      description: args.briefing || "",
      status: "in_progress",
      priority: "medium",
      assignee: "Milton",
      createdAt: nowTimestamp,
      updatedAt: nowTimestamp,
      order: 0,
    });
    console.log("TASK INSERTED:", taskId);

    // Step 2: Create workflow record linked to the task
    const workflowId = await ctx.db.insert("workflows", {
      templateId: template._id,
      sourceResearchId: args.sourceResearchId,
      taskId,
      selectedAngle: args.selectedAngle,
      contentType: args.contentType,
      briefing: args.briefing,
      authorId: args.authorId,
      status: "active",
      currentStepNumber: 1,
      createdAt: nowIso,
      updatedAt: nowIso,
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

      // Validate agent hierarchy (Phase 3)
      const isAllowed = await validateAgentForStep(ctx, templateStep.agentRole, workflowId.toString());
      if (!isAllowed) {
        console.warn(`[workflow-create] Agent role "${templateStep.agentRole}" not allowed in this workflow; creating step anyway`);
      }

      await ctx.db.insert("workflowSteps", {
        workflowId,
        stepNumber: stepNum,
        name: templateStep.name,
        agentRole: templateStep.agentRole,
        status: "pending",
        input: initialInput,
        requiresApproval: templateStep.requiresApproval,
        timeoutMinutes: templateStep.timeoutMinutes,
        createdAt: nowIso,
        updatedAt: nowIso,
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
    const nowTimestamp = Date.now();

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

    // Check for any steps still in progress (pending, agent_working)
    const activeSteps = allSteps.filter((s) =>
      ["pending", "agent_working"].includes(s.status)
    );

    // If there are still active steps, don't advance yet
    if (activeSteps.length > 0) return;

    // Find all completed or approved step numbers (both count as done)
    const completedStepNumbers = allSteps
      .filter((s) => ["completed", "approved"].includes(s.status))
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
      if (workflow.taskId) {
        try {
          await ctx.db.patch(workflow.taskId, {
            status: "done",
            updatedAt: nowTimestamp,
          });
        } catch {
          // Task may not exist — non-fatal
        }
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
      .filter((s) => ["completed", "approved"].includes(s.status) && prevBatchNums.has(s.stepNumber));

    // Fetch author information if this workflow has an author
    let authorInfo: any = undefined;
    if (workflow.authorId) {
      const author = await ctx.db.get(workflow.authorId);
      if (author) {
        authorInfo = {
          name: author.name,
          title: author.title,
          writingStyle: author.writingStyle,
          voiceNotes: author.voiceNotes,
        };
      }
    }

    // Format current date as "February 23, 2026"
    const publishDate = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    let combinedInput: string | undefined;
    if (prevBatchOutputs.length === 1) {
      // Single previous step — wrap in dict so daemon always gets a dict
      combinedInput = JSON.stringify({
        output: prevBatchOutputs[0].output,
        publish_date: publishDate,
        ...(authorInfo && { author: authorInfo }),
      });
    } else if (prevBatchOutputs.length > 1) {
      // Multiple parallel steps completed — combine their outputs in an array wrapped in dict
      combinedInput = JSON.stringify({
        outputs: prevBatchOutputs.map((s) => ({
          stepNumber: s.stepNumber,
          name: s.name,
          agentRole: s.agentRole,
          output: s.output,
        })),
        publish_date: publishDate,
        ...(authorInfo && { author: authorInfo }),
      });
    }

    // 8. Create workflowSteps for the next batch
    for (const stepNum of Array.from(batchStepNumbers)) {
      const templateStep = template.steps.find((ts) => ts.stepNumber === stepNum);
      if (!templateStep) continue;

      // Validate agent hierarchy (Phase 3)
      const isAllowed = await validateAgentForStep(ctx, templateStep.agentRole, args.workflowId.toString());
      if (!isAllowed) {
        console.warn(`[workflow-advance] Agent role "${templateStep.agentRole}" not allowed in this workflow; creating step anyway`);
      }

      // Determine initial status: if this is a review gate (requiresApproval && agentRole === "none"), set to awaiting_review
      const isReviewGate = templateStep.requiresApproval && templateStep.agentRole === "none";
      const initialStatus = isReviewGate ? "awaiting_review" : "pending";

      // Guard: Check if this step already exists (prevent duplicates from race conditions)
      const existingStep = await ctx.db
        .query("workflowSteps")
        .withIndex("by_workflowId", (q) => q.eq("workflowId", args.workflowId))
        .filter((q) => q.eq(q.field("stepNumber"), stepNum))
        .first();

      if (existingStep) {
        console.log(`[workflow-advance] Step ${stepNum} already exists for workflow ${args.workflowId}, skipping duplicate creation`);
        continue; // Skip — step already exists
      }

      // Update workflow status to paused_for_review if this is a review gate
      if (isReviewGate) {
        await ctx.db.patch(args.workflowId, {
          status: "paused_for_review",
          updatedAt: now,
        });
      }

      // Special handling: For Image Review step, pass ONLY the image_maker output, not all parallel steps
      let stepInput = combinedInput;
      let outputOptions: string[] | undefined = undefined;
      
      if (templateStep.name === "Image Review" && prevBatchOutputs.length > 1) {
        const imageMakerStep = prevBatchOutputs.find((s) => s.agentRole === "image_maker");
        if (imageMakerStep?.output) {
          // Pass only the image_maker output as a direct array (for extractImages to parse)
          stepInput = imageMakerStep.output;
          
          // Also populate outputOptions with individual image JSON strings
          try {
            const imageOutput = JSON.parse(imageMakerStep.output);
            const images = Array.isArray(imageOutput) ? imageOutput : [];
            if (images.length > 0) {
              outputOptions = images.map((img: any) => JSON.stringify(img));
            }
          } catch (e) {
            console.error("[workflow-advance] Failed to parse image_maker output for outputOptions:", e);
          }
        }
      }

      const stepRecord: any = {
        workflowId: args.workflowId,
        stepNumber: stepNum,
        name: templateStep.name,
        agentRole: templateStep.agentRole,
        status: initialStatus,
        input: stepInput,
        requiresApproval: templateStep.requiresApproval,
        approvalPrompt: templateStep.approvalPrompt,
        timeoutMinutes: templateStep.timeoutMinutes,
        createdAt: now,
        updatedAt: now,
      };

      // Add outputOptions if present (for review gate steps with options)
      if (outputOptions) {
        stepRecord.outputOptions = outputOptions;
      }

      await ctx.db.insert("workflowSteps", stepRecord);
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
 * Sets step to "approved" and triggers advanceWorkflow.
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

    // Verify step is awaiting review
    if (step.status !== "awaiting_review") {
      throw new Error(`Step status is "${step.status}", expected "awaiting_review"`);
    }

    // Set step to approved with optional selectedOption and reviewNotes
    await ctx.db.patch(args.stepId, {
      status: "approved",
      selectedOption: args.selectedOption,
      reviewNotes: args.reviewNotes,
      reviewedAt: now,
      updatedAt: now,
    });

    // Note: The HTTP endpoint (POST /api/workflow/step-approve) should call advanceWorkflow after this
    // Mutations cannot call other mutations in Convex, so the caller must trigger the advance
  },
});

/**
 * Reject a workflow step (human review failed).
 * Sets step to "rejected" with review notes and creates a new retry step.
 */
export const rejectStep = mutation({
  args: {
    stepId: v.id("workflowSteps"),
    reviewNotes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = new Date().toISOString();
    const step = await ctx.db.get(args.stepId);
    if (!step) throw new Error("Step not found");

    // Verify step is awaiting review
    if (step.status !== "awaiting_review") {
      throw new Error(`Step status is "${step.status}", expected "awaiting_review"`);
    }

    // Mark this step as rejected
    await ctx.db.patch(args.stepId, {
      status: "rejected",
      reviewNotes: args.reviewNotes,
      reviewedAt: now,
      updatedAt: now,
    });

    // Get the workflow and template to create retry step
    const workflow = await ctx.db.get(step.workflowId);
    if (!workflow) throw new Error("Workflow not found");

    const template = await ctx.db.get(workflow.templateId);
    if (!template) throw new Error("Template not found");

    // Find the template step to get details for the retry
    const templateStep = template.steps.find((ts) => ts.stepNumber === step.stepNumber);
    if (!templateStep) throw new Error("Template step not found");

    // Guard: Check if a pending retry already exists for this step (prevent duplicate retries)
    const existingRetry = await ctx.db
      .query("workflowSteps")
      .withIndex("by_workflowId", (q) => q.eq("workflowId", step.workflowId))
      .filter((q) => q.eq(q.field("stepNumber"), step.stepNumber))
      .filter((q) => q.eq(q.field("status"), "pending"))
      .first();

    if (!existingRetry) {
      // Create a new workflowStep with same stepNumber for retry (status: pending)
      // The daemon will pick it up again and the agent can incorporate Gregory's feedback
      await ctx.db.insert("workflowSteps", {
        workflowId: step.workflowId,
        stepNumber: step.stepNumber,
        name: templateStep.name,
        agentRole: templateStep.agentRole,
        status: "pending",
        input: step.input, // Keep the same input; Gregory's feedback is in reviewNotes
        requiresApproval: templateStep.requiresApproval,
        timeoutMinutes: templateStep.timeoutMinutes,
        createdAt: now,
        updatedAt: now,
      });
    }

    // Set workflow back to "active" (running) so it can pick up the retry step
    await ctx.db.patch(step.workflowId, {
      status: "active",
      updatedAt: now,
    });
  },
});

/**
 * Approve a workflow step FROM THE UI (frontend wrapper).
 * Marks step approved and creates the next step in the workflow.
 */
export const approveStepFromUI = mutation({
  args: {
    stepId: v.id("workflowSteps"),
    reviewNotes: v.optional(v.string()),
    selectedOption: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = new Date().toISOString();
    const step = await ctx.db.get(args.stepId);
    if (!step) throw new Error("Step not found");

    // Verify step is awaiting review
    if (step.status !== "awaiting_review") {
      throw new Error(`Step status is "${step.status}", expected "awaiting_review"`);
    }

    // 1. Get workflow and template to understand next step
    const workflow = await ctx.db.get(step.workflowId);
    if (!workflow) throw new Error("Workflow not found");

    const template = await ctx.db.get(workflow.templateId);
    if (!template) throw new Error("Template not found");

    // 2. Mark step as approved
    await ctx.db.patch(args.stepId, {
      status: "approved",
      reviewNotes: args.reviewNotes,
      selectedOption: args.selectedOption ? args.selectedOption.toString() : undefined,
      reviewedAt: now,
      updatedAt: now,
    });

    // 3. Set workflow back to "active" (running)
    await ctx.db.patch(step.workflowId, {
      status: "active",
      updatedAt: now,
    });

    // 4. Create the next step
    const nextTemplateStep = template.steps.find((ts) => ts.stepNumber === step.stepNumber + 1);
    if (nextTemplateStep) {
      // If this is a review gate (agentRole: "none"), find the previous executed step's output
      let inputForNextStep = step.output;
      if (step.agentRole === "none") {
        // This is a review gate — look back to find the previous actual step's output
        const allSteps = await ctx.db
          .query("workflowSteps")
          .withIndex("by_workflowId", (q) => q.eq("workflowId", step.workflowId))
          .collect();
        
        // Find the highest stepNumber < current step that has "completed" or "approved" status
        const previousExecutedStep = allSteps
          .filter((s) => s.stepNumber < step.stepNumber && ["completed", "approved"].includes(s.status))
          .sort((a, b) => b.stepNumber - a.stepNumber)
          [0];
        
        if (previousExecutedStep) {
          inputForNextStep = previousExecutedStep.output;
        }
      }

      // Fetch author info if available
      let authorInfo: any = undefined;
      if (workflow.authorId) {
        const author = await ctx.db.get(workflow.authorId);
        if (author) {
          authorInfo = {
            name: author.name,
            title: author.title,
            writingStyle: author.writingStyle,
            voiceNotes: author.voiceNotes,
          };
        }
      }

      // Format current date as "February 23, 2026"
      const publishDate = new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      // Special handling for HTML Builder: include blog content + selected image URL
      let selectedImageUrl: string | undefined;
      let blogContent: string | undefined;
      if (nextTemplateStep.agentRole === "html_builder") {
        try {
          // Fetch all workflow steps once
          const allSteps = await ctx.db
            .query("workflowSteps")
            .withIndex("by_workflowId", (q) => q.eq("workflowId", step.workflowId))
            .collect();
          
          // 1. Get blog content from Step 4 (blog_writer)
          const blogWriterStep = allSteps.find((s) => s.stepNumber === 4 && s.agentRole === "blog_writer");
          if (blogWriterStep && blogWriterStep.output) {
            try {
              const blogData = JSON.parse(blogWriterStep.output);
              // Try multiple fields where blog content might be stored
              blogContent = 
                blogData.content || 
                blogData.revisedContent || 
                blogData.blogContent || 
                blogData.output || 
                blogData.result || 
                (typeof blogData === 'string' ? blogData : undefined);
            } catch {
              blogContent = blogWriterStep.output; // Raw text fallback
            }
          }
          
          // 2. Get selected image from Step 7 (Image Review)
          const imageReviewStep = allSteps.find((s) => s.stepNumber === 7 && s.name === "Image Review");
          if (imageReviewStep && imageReviewStep.selectedOption !== null && imageReviewStep.selectedOption !== undefined && imageReviewStep.output) {
            try {
              const imageIndex = parseInt(imageReviewStep.selectedOption as string);
              const images = JSON.parse(imageReviewStep.output);
              if (Array.isArray(images) && images[imageIndex]?.url) {
                selectedImageUrl = images[imageIndex].url;
              }
            } catch {
              // If parsing fails, continue without image URL
            }
          }
        } catch {
          // If anything fails, continue without image or blog content (daemon will handle gracefully)
        }
      }

      // Guard: Check if next step already exists (prevent duplicates)
      const nextStepExists = await ctx.db
        .query("workflowSteps")
        .withIndex("by_workflowId", (q) => q.eq("workflowId", step.workflowId))
        .filter((q) => q.eq(q.field("stepNumber"), nextTemplateStep.stepNumber))
        .first();

      if (!nextStepExists) {
        // Wrap input with author info, publish date, and selected image URL if available
        let finalInput = inputForNextStep;
        
        // Special case: For HTML Builder, merge blog content with existing context
        if (nextTemplateStep.agentRole === "html_builder") {
          try {
            const parsed = JSON.parse(inputForNextStep || "{}");
            const enriched: any = { ...parsed, publish_date: publishDate };
            
            // Add blog content from Step 4 (critical!)
            if (blogContent) {
              enriched.blogOutput = blogContent; // Blog content from Step 4
            }
            
            // Add selected image from Step 7
            if (selectedImageUrl) {
              enriched.selectedImageUrl = selectedImageUrl;
            }
            
            // Add author info
            if (authorInfo) {
              enriched.author = authorInfo;
            }
            
            finalInput = JSON.stringify(enriched);
          } catch {
            // Fallback if inputForNextStep isn't JSON
            const enriched: any = {
              publish_date: publishDate,
            };
            if (inputForNextStep) {
              enriched.previousStepOutput = inputForNextStep;
            }
            if (blogContent) {
              enriched.blogOutput = blogContent;
            }
            if (selectedImageUrl) {
              enriched.selectedImageUrl = selectedImageUrl;
            }
            if (authorInfo) {
              enriched.author = authorInfo;
            }
            finalInput = JSON.stringify(enriched);
          }
        } else {
          try {
            const parsed = JSON.parse(inputForNextStep || "{}");
            const enriched: any = { ...parsed, publish_date: publishDate };
            if (authorInfo) {
              enriched.author = authorInfo;
            }
            if (selectedImageUrl) {
              enriched.selectedImageUrl = selectedImageUrl;
            }
            finalInput = JSON.stringify(enriched);
          } catch {
            // If not JSON, wrap in object
            const enriched: any = {
              output: inputForNextStep,
              publish_date: publishDate,
            };
            if (authorInfo) {
              enriched.author = authorInfo;
            }
            if (selectedImageUrl) {
              enriched.selectedImageUrl = selectedImageUrl;
            }
            finalInput = JSON.stringify(enriched);
          }
        }

        await ctx.db.insert("workflowSteps", {
          workflowId: step.workflowId,
          stepNumber: nextTemplateStep.stepNumber,
          name: nextTemplateStep.name,
          agentRole: nextTemplateStep.agentRole,
          status: "pending",
          input: finalInput,
          requiresApproval: nextTemplateStep.requiresApproval,
          timeoutMinutes: nextTemplateStep.timeoutMinutes,
          createdAt: now,
          updatedAt: now,
        });
      }

      // Update workflow currentStepNumber
      await ctx.db.patch(step.workflowId, {
        currentStepNumber: nextTemplateStep.stepNumber,
        updatedAt: now,
      });
    }

    return { ok: true, message: "Step approved, workflow advancing" };
  },
});

/**
 * Reject a workflow step FROM THE UI (frontend wrapper).
 * Marks step as rejected, creates a retry step, and sets workflow to active.
 */
export const rejectStepFromUI = mutation({
  args: {
    stepId: v.id("workflowSteps"),
    reviewNotes: v.string(), // Required
  },
  handler: async (ctx, args) => {
    const now = new Date().toISOString();
    const step = await ctx.db.get(args.stepId);
    if (!step) throw new Error("Step not found");

    // Verify step is awaiting review
    if (step.status !== "awaiting_review") {
      throw new Error(`Step status is "${step.status}", expected "awaiting_review"`);
    }

    // 1. Mark this step as rejected
    await ctx.db.patch(args.stepId, {
      status: "rejected",
      reviewNotes: args.reviewNotes,
      reviewedAt: now,
      updatedAt: now,
    });

    // 2. Get workflow and template to understand the step we're retrying
    const workflow = await ctx.db.get(step.workflowId);
    if (!workflow) throw new Error("Workflow not found");

    const template = await ctx.db.get(workflow.templateId);
    if (!template) throw new Error("Template not found");

    // 3. Find the PREVIOUS agent step (before this review gate)
    // We need to re-execute the step that produced the content being reviewed
    const templateStep = template.steps.find((ts) => ts.stepNumber === step.stepNumber);
    if (!templateStep) throw new Error("Template step not found");

    // Find the step number before this one
    const prevStepNum = Math.max(...template.steps.filter((ts) => ts.stepNumber < step.stepNumber).map((ts) => ts.stepNumber));
    if (!prevStepNum) throw new Error("No previous step found to retry");

    const prevTemplateStep = template.steps.find((ts) => ts.stepNumber === prevStepNum);
    if (!prevTemplateStep) throw new Error("Previous template step not found");

    // Get the previous step that was completed
    const allSteps = await ctx.db
      .query("workflowSteps")
      .withIndex("by_workflowId", (q) => q.eq("workflowId", step.workflowId))
      .collect();
    const prevStep = allSteps.find((s) => s.stepNumber === prevStepNum && s.status === "completed");

    // 4. Create a new workflowStep to retry the previous agent's work
    // Include Gregory's rejection feedback as revisionNotes for the agent to use as a rewrite brief
    const prevInputObj = prevStep ? JSON.parse(prevStep.input || "{}") : {};
    const retryInput = JSON.stringify({
      ...prevInputObj,
      revisionNotes: args.reviewNotes, // This is the key field the daemon reads for rewrites
      _retryCount: (prevInputObj._retryCount || 0) + 1,
    });

    await ctx.db.insert("workflowSteps", {
      workflowId: step.workflowId,
      stepNumber: prevStepNum,
      name: prevTemplateStep.name,
      agentRole: prevTemplateStep.agentRole,
      status: "pending",
      input: retryInput,
      requiresApproval: prevTemplateStep.requiresApproval,
      timeoutMinutes: prevTemplateStep.timeoutMinutes,
      createdAt: now,
      updatedAt: now,
    });

    // 5. Set workflow back to "active" so daemon picks up the retry step
    await ctx.db.patch(step.workflowId, {
      status: "active",
      updatedAt: now,
    });

    return { ok: true, message: "Step rejected and retry queued for previous agent" };
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

/**
 * Delete all workflow templates (cleanup for re-seeding)
 */
export const deleteTemplateById = mutation({
  args: {
    templateId: v.id("workflowTemplates"),
  },
  handler: async (ctx, args) => {
    const template = await ctx.db.get(args.templateId);
    if (!template) throw new Error("Template not found");
    await ctx.db.delete(args.templateId);
    return { deleted: true, id: args.templateId };
  },
});

export const deleteAllTemplates = mutation({
  args: {},
  handler: async (ctx) => {
    const templates = await ctx.db.query("workflowTemplates").collect();
    for (const template of templates) {
      await ctx.db.delete(template._id);
    }
    return { deleted: templates.length };
  },
});

/**
 * Update a workflow template's steps by name
 */
export const updateTemplateSteps = mutation({
  args: {
    templateName: v.string(),
    steps: v.array(v.object({
      stepNumber: v.number(),
      name: v.string(),
      description: v.optional(v.string()),
      agentRole: v.string(),
      requiresApproval: v.boolean(),
      approvalPrompt: v.optional(v.string()),
      timeoutMinutes: v.number(),
      parallelWith: v.optional(v.array(v.number())),
    })),
  },
  handler: async (ctx, args) => {
    const template = await ctx.db
      .query("workflowTemplates")
      .filter((q) => q.eq(q.field("name"), args.templateName))
      .first();

    if (!template) throw new Error(`Template "${args.templateName}" not found`);

    await ctx.db.patch(template._id, {
      steps: args.steps,
      updatedAt: new Date().toISOString(),
    });

    return { updated: true, templateId: template._id, stepCount: args.steps.length };
  },
});

/**
 * Delete a workflow and all its associated steps and linked task
 */
export const deleteWorkflow = mutation({
  args: { workflowId: v.id("workflows") },
  handler: async (ctx, args) => {
    const workflow = await ctx.db.get(args.workflowId);
    if (!workflow) throw new Error("Workflow not found");

    // Delete all steps for this workflow
    const steps = await ctx.db
      .query("workflowSteps")
      .withIndex("by_workflowId", (q) => q.eq("workflowId", args.workflowId))
      .collect();

    for (const step of steps) {
      try {
        await ctx.db.delete(step._id);
      } catch (err) {
        console.warn(`Failed to delete step ${step._id}:`, err);
      }
    }

    // Delete linked task if it exists
    if (workflow.taskId) {
      try {
        const task = await ctx.db.get(workflow.taskId);
        if (task) {
          await ctx.db.delete(workflow.taskId);
        }
      } catch (err) {
        console.warn(`Failed to delete task ${workflow.taskId}:`, err);
      }
    }

    // Delete the workflow itself
    try {
      await ctx.db.delete(args.workflowId);
    } catch (err) {
      console.error(`Failed to delete workflow ${args.workflowId}:`, err);
      throw err;
    }

    return { ok: true, message: `Workflow deleted (${steps.length} steps removed)` };
  },
});

/**
 * Delete all workflows matching a status filter
 */
export const deleteWorkflowsByStatus = mutation({
  args: { status: v.optional(v.string()) },
  handler: async (ctx, args) => {
    let workflows;
    if (args.status) {
      workflows = await ctx.db
        .query("workflows")
        .withIndex("by_status", (q) => q.eq("status", args.status as any))
        .collect();
    } else {
      workflows = await ctx.db.query("workflows").collect();
    }

    let deletedCount = 0;

    for (const workflow of workflows) {
      try {
        // Delete all steps
        const steps = await ctx.db
          .query("workflowSteps")
          .withIndex("by_workflowId", (q) => q.eq("workflowId", workflow._id))
          .collect();

        for (const step of steps) {
          try {
            await ctx.db.delete(step._id);
          } catch (err) {
            console.warn(`Failed to delete step ${step._id}:`, err);
          }
        }

        // Delete linked task if exists
        if (workflow.taskId) {
          try {
            const task = await ctx.db.get(workflow.taskId);
            if (task) {
              await ctx.db.delete(workflow.taskId);
            }
          } catch (err) {
            console.warn(`Failed to delete task ${workflow.taskId}:`, err);
          }
        }

        // Delete workflow
        await ctx.db.delete(workflow._id);
        deletedCount++;
      } catch (err) {
        console.error(`Failed to delete workflow ${workflow._id}:`, err);
      }
    }

    return { ok: true, deleted: deletedCount, message: `Deleted ${deletedCount} workflow(s)` };
  },
});
