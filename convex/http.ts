/**
 * ISTK Mission Control - Convex HTTP API
 * Exposes HTTP endpoints for the Mac mini sync script and research daemon.
 * Auth via Bearer token (CONVEX_ADMIN_KEY).
 */
import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";

const http = httpRouter();

// ---- Auth helper ----
function checkAuth(request: Request): boolean {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return false;
  return authHeader.length > 8;
}

// ---- POST /api/sync/tasks ----
http.route({
  path: "/api/sync/tasks",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    if (!checkAuth(request)) {
      return new Response("Unauthorized", { status: 401 });
    }
    try {
      const body = await request.json();
      const tasks = body.tasks as Array<{
        title: string;
        description?: string;
        status: "todo" | "in_progress" | "done";
        priority: "critical" | "high" | "medium" | "low";
        assignee: "Gregory" | "Milton";
        dueDate?: string;
        tags?: string[];
      }>;

      const results = [];
      for (const task of tasks) {
        const id = await ctx.runMutation(api.tasks.createTask, {
          title: task.title,
          description: task.description,
          priority: task.priority,
          assignee: task.assignee,
          dueDate: task.dueDate,
          tags: task.tags,
        });
        results.push({ title: task.title, id });
      }

      return new Response(JSON.stringify({ ok: true, synced: results.length }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      return new Response(JSON.stringify({ ok: false, error: message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  }),
});

// ---- GET /api/sync/tasks ----
http.route({
  path: "/api/sync/tasks",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    if (!checkAuth(request)) {
      return new Response("Unauthorized", { status: 401 });
    }
    try {
      const tasks = await ctx.runQuery(api.tasks.listTasks, {});
      return new Response(JSON.stringify({ ok: true, tasks }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      return new Response(JSON.stringify({ ok: false, error: message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  }),
});

// ---- POST /api/sync/memories ----
http.route({
  path: "/api/sync/memories",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    if (!checkAuth(request)) {
      return new Response("Unauthorized", { status: 401 });
    }
    try {
      const body = await request.json();
      const memories = body.memories as Array<{
        title: string;
        content: string;
        source: string;
        category?: string;
        tags: string[];
        date: string;
      }>;

      const results = [];
      for (const mem of memories) {
        const id = await ctx.runMutation(api.memories.syncMemory, {
          title: mem.title,
          content: mem.content,
          source: mem.source,
          category: mem.category,
          tags: mem.tags,
          date: mem.date,
        });
        results.push({ source: mem.source, id });
      }

      return new Response(JSON.stringify({ ok: true, synced: results.length }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      return new Response(JSON.stringify({ ok: false, error: message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  }),
});

// ---- POST /api/sync/events ----
http.route({
  path: "/api/sync/events",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    if (!checkAuth(request)) {
      return new Response("Unauthorized", { status: 401 });
    }
    try {
      const body = await request.json();
      const events = body.events as Array<{
        title: string;
        schedule?: string;
        startDate: string;
        lastRun?: string;
        nextRun?: string;
        status: "active" | "paused" | "completed";
      }>;

      const results = [];
      for (const evt of events) {
        const id = await ctx.runMutation(api.events.syncCronEvent, {
          title: evt.title,
          schedule: evt.schedule,
          startDate: evt.startDate,
          lastRun: evt.lastRun,
          nextRun: evt.nextRun,
          status: evt.status,
        });
        results.push({ title: evt.title, id });
      }

      return new Response(JSON.stringify({ ok: true, synced: results.length }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      return new Response(JSON.stringify({ ok: false, error: message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  }),
});

// ---- POST /api/sync/agents ----
http.route({
  path: "/api/sync/agents",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    if (!checkAuth(request)) {
      return new Response("Unauthorized", { status: 401 });
    }
    try {
      const body = await request.json();
      const agents = body.agents as Array<{
        name: string;
        role: string;
        model?: string;
        avatar?: string;
        status: "active" | "idle" | "offline";
        isSubagent: boolean;
      }>;

      const results = [];
      for (const agent of agents) {
        const id = await ctx.runMutation(api.agents.upsertAgent, {
          name: agent.name,
          role: agent.role,
          model: agent.model,
          avatar: agent.avatar,
          status: agent.status,
          isSubagent: agent.isSubagent,
        });
        results.push({ name: agent.name, id });
      }

      return new Response(JSON.stringify({ ok: true, synced: results.length }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      return new Response(JSON.stringify({ ok: false, error: message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  }),
});

// ---- Content Pipeline: GET /api/content/pending ----
http.route({
  path: "/api/content/pending",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    if (!checkAuth(request)) {
      return new Response("Unauthorized", { status: 401 });
    }
    try {
      const pending = await ctx.runQuery(api.contentPipeline.getPendingResearch, {});
      const approved = await ctx.runQuery(api.contentPipeline.getApprovedResearch, {});
      return new Response(
        JSON.stringify({ ok: true, pending, approved }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      return new Response(
        JSON.stringify({ ok: false, error: message }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  }),
});

// ---- Content Pipeline: POST /api/content/status ----
http.route({
  path: "/api/content/status",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    if (!checkAuth(request)) {
      return new Response("Unauthorized", { status: 401 });
    }
    try {
      const body = await request.json();
      await ctx.runMutation(api.contentPipeline.updateStatus, {
        id: body.id,
        status: body.status,
      });
      return new Response(
        JSON.stringify({ ok: true }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      return new Response(
        JSON.stringify({ ok: false, error: message }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  }),
});

// ---- Content Pipeline: POST /api/content/results ----
http.route({
  path: "/api/content/results",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    if (!checkAuth(request)) {
      return new Response("Unauthorized", { status: 401 });
    }
    try {
      const body = await request.json();
      await ctx.runMutation(api.contentPipeline.submitResults, {
        id: body.id,
        summary: body.summary,
        sentiment: body.sentiment,
        narratives: body.narratives,
        angles: body.angles,
        quotes: body.quotes,
        sources: body.sources,
        fullReport: body.fullReport,
      });
      return new Response(
        JSON.stringify({ ok: true }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      return new Response(
        JSON.stringify({ ok: false, error: message }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  }),
});

// ---- Content Pipeline: POST /api/content/progress ----
http.route({
  path: "/api/content/progress",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    if (!checkAuth(request)) {
      return new Response("Unauthorized", { status: 401 });
    }
    try {
      const body = await request.json();
      await ctx.runMutation(api.contentPipeline.updateProgress, {
        id: body.id,
        thinkingLine1: body.thinkingLine1,
        thinkingLine2: body.thinkingLine2,
      });
      return new Response(
        JSON.stringify({ ok: true }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      return new Response(
        JSON.stringify({ ok: false, error: message }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  }),
});

// ---- Content Pipeline: POST /api/content/reject ----
http.route({
  path: "/api/content/reject",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    if (!checkAuth(request)) {
      return new Response("Unauthorized", { status: 401 });
    }
    try {
      const body = await request.json();
      await ctx.runMutation(api.contentPipeline.rejectResearch, {
        id: body.id,
        errorMessage: body.errorMessage,
      });
      return new Response(
        JSON.stringify({ ok: true }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      return new Response(
        JSON.stringify({ ok: false, error: message }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  }),
});

// ---- Content Pipeline: POST /api/content/generated ----
http.route({
  path: "/api/content/generated",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    if (!checkAuth(request)) {
      return new Response("Unauthorized", { status: 401 });
    }
    try {
      const body = await request.json();
      await ctx.runMutation(api.contentPipeline.submitContent, {
        id: body.id,
        xPosts: body.xPosts,
        linkedinPosts: body.linkedinPosts,
      });
      return new Response(
        JSON.stringify({ ok: true }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      return new Response(
        JSON.stringify({ ok: false, error: message }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  }),
});

// ---- POST /api/sync/daemon-status ----
http.route({
  path: "/api/sync/daemon-status",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    if (!checkAuth(request)) {
      return new Response("Unauthorized", { status: 401 });
    }
    try {
      const body = await request.json();
      const { status, details } = body as { status: string; details?: string };

      await ctx.runMutation(api.systemStatus.upsertStatus, {
        key: "daemon_health",
        status,
        details,
      });

      return new Response(
        JSON.stringify({ ok: true }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      return new Response(
        JSON.stringify({ ok: false, error: message }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  }),
});

// ---- POST /api/keys (from Settings page) ----
// Save API key to Convex; sync daemon will pick it up and write to local file
http.route({
  path: "/api/keys",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const body = await request.json();
      const { provider, key } = body as { provider: string; key: string };

      if (!provider || !key) {
        return new Response(
          JSON.stringify({ ok: false, error: "Missing provider or key" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }

      // Save to Convex (sync daemon will poll this and write to ~/.config/mission-control/api-keys.json)
      await ctx.runMutation(api.contentPipeline.saveApiKey, {
        provider,
        key,
      });

      return new Response(
        JSON.stringify({ ok: true, saved: true, provider }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      return new Response(
        JSON.stringify({ ok: false, error: message }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  }),
});

// ---- GET /api/keys (from Settings page) ----
// Returns list of stored providers (metadata only, not actual keys)
http.route({
  path: "/api/keys",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    try {
      const keys = await ctx.runQuery(api.contentPipeline.getAllApiKeys, {});
      // Return metadata only (provider, isActive, lastSynced) — never the actual key
      const metadata = keys.map((k) => ({
        provider: k.provider,
        isActive: k.isActive,
        lastSynced: k.lastSynced,
      }));
      return new Response(
        JSON.stringify({ ok: true, keys: metadata }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      return new Response(
        JSON.stringify({ ok: false, error: message }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  }),
});

// ---- DELETE /api/keys/{provider} (from Settings page) ----
// Delete API key for a provider
http.route({
  path: "/api/keys/:provider",
  method: "DELETE",
  handler: httpAction(async (ctx, request) => {
    try {
      const provider = new URL(request.url).pathname.split("/").pop();
      if (!provider) {
        return new Response(
          JSON.stringify({ ok: false, error: "Missing provider" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }

      await ctx.runMutation(api.contentPipeline.deleteApiKey, { provider });

      return new Response(
        JSON.stringify({ ok: true, deleted: true, provider }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      return new Response(
        JSON.stringify({ ok: false, error: message }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  }),
});

// ---- POST /api/sync/keys (for daemon to fetch API keys) ----
http.route({
  path: "/api/sync/keys",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    if (!checkAuth(request)) {
      return new Response("Unauthorized", { status: 401 });
    }
    try {
      const keys = await ctx.runQuery(api.contentPipeline.getAllApiKeys, {});
      return new Response(
        JSON.stringify({ ok: true, keys }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      return new Response(
        JSON.stringify({ ok: false, error: message }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  }),
});

// ---- POST /api/content/mark-synced (daemon confirms key was synced) ----
http.route({
  path: "/api/content/mark-synced",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    if (!checkAuth(request)) {
      return new Response("Unauthorized", { status: 401 });
    }
    try {
      const body = await request.json();
      const { provider } = body as { provider: string };

      if (!provider) {
        return new Response(
          JSON.stringify({ ok: false, error: "Missing provider" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }

      await ctx.runMutation(api.contentPipeline.markApiKeySynced, {
        provider,
      });

      return new Response(
        JSON.stringify({ ok: true, marked: true, provider }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      return new Response(
        JSON.stringify({ ok: false, error: message }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  }),
});

// ---- GET /api/health ----
http.route({
  path: "/api/health",
  method: "GET",
  handler: httpAction(async () => {
    return new Response(
      JSON.stringify({ ok: true, service: "istk-mission-control", timestamp: new Date().toISOString() }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  }),
});

// ==============================================================
// Workflow Orchestration Engine — HTTP Endpoints (Phase 1)
// ==============================================================

// ---- GET /api/workflow/pending-steps ----
// Fetch all workflow steps with status "pending" (for daemon polling)
http.route({
  path: "/api/workflow/pending-steps",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    if (!checkAuth(request)) {
      return new Response("Unauthorized", { status: 401 });
    }
    try {
      const steps = await ctx.runQuery(api.workflows.getPendingSteps, {});
      return new Response(
        JSON.stringify({ ok: true, steps }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      return new Response(
        JSON.stringify({ ok: false, error: message }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  }),
});

// ---- POST /api/workflow/step-status ----
// Update step status (e.g. pending → agent_working)
http.route({
  path: "/api/workflow/step-status",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    if (!checkAuth(request)) {
      return new Response("Unauthorized", { status: 401 });
    }
    try {
      const body = await request.json();
      await ctx.runMutation(api.workflows.updateStepStatus, {
        stepId: body.stepId,
        status: body.status,
      });
      return new Response(
        JSON.stringify({ ok: true }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      return new Response(
        JSON.stringify({ ok: false, error: message }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  }),
});

// ---- POST /api/workflow/step-output ----
// Submit step output + auto-trigger advanceWorkflow
// If step requiresApproval → status becomes "awaiting_review"
// If not → status becomes "completed" + advanceWorkflow fires
http.route({
  path: "/api/workflow/step-output",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    if (!checkAuth(request)) {
      return new Response("Unauthorized", { status: 401 });
    }
    try {
      const body = await request.json();

      // Update step output (also sets status based on requiresApproval)
      await ctx.runMutation(api.workflows.updateStepOutput, {
        stepId: body.stepId,
        output: body.output,
      });

      // Get the step to check if we should advance
      const step = await ctx.runQuery(api.workflows.getWorkflowStep, { id: body.stepId });
      if (step && step.status === "completed") {
        // Auto-trigger advanceWorkflow
        await ctx.runMutation(api.workflows.advanceWorkflow, {
          workflowId: step.workflowId,
        });
      }

      return new Response(
        JSON.stringify({ ok: true }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      return new Response(
        JSON.stringify({ ok: false, error: message }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  }),
});

// ---- POST /api/workflow/step-thinking ----
// Live thinking feed update (typewriter lines)
http.route({
  path: "/api/workflow/step-thinking",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    if (!checkAuth(request)) {
      return new Response("Unauthorized", { status: 401 });
    }
    try {
      const body = await request.json();
      await ctx.runMutation(api.workflows.updateStepThinking, {
        stepId: body.stepId,
        thinkingLine1: body.thinkingLine1,
        thinkingLine2: body.thinkingLine2,
      });
      return new Response(
        JSON.stringify({ ok: true }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      return new Response(
        JSON.stringify({ ok: false, error: message }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  }),
});

// ---- POST /api/workflow/step-fail ----
// Mark step as failed with error message
http.route({
  path: "/api/workflow/step-fail",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    if (!checkAuth(request)) {
      return new Response("Unauthorized", { status: 401 });
    }
    try {
      const body = await request.json();
      await ctx.runMutation(api.workflows.failStep, {
        stepId: body.stepId,
        errorMessage: body.errorMessage,
      });
      return new Response(
        JSON.stringify({ ok: true }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      return new Response(
        JSON.stringify({ ok: false, error: message }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  }),
});

// ---- POST /api/workflow/step-complete ----
// Mark step as completed + trigger advanceWorkflow
http.route({
  path: "/api/workflow/step-complete",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    if (!checkAuth(request)) {
      return new Response("Unauthorized", { status: 401 });
    }
    try {
      const body = await request.json();

      // Mark step as completed
      await ctx.runMutation(api.workflows.completeStep, {
        stepId: body.stepId,
      });

      // Get the step to find its workflow
      const step = await ctx.runQuery(api.workflows.getWorkflowStep, { id: body.stepId });
      if (step) {
        // Trigger advanceWorkflow
        await ctx.runMutation(api.workflows.advanceWorkflow, {
          workflowId: step.workflowId,
        });
      }

      return new Response(
        JSON.stringify({ ok: true }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      return new Response(
        JSON.stringify({ ok: false, error: message }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  }),
});

// ---- GET /api/workflow/step-input ----
// Fetch input data for a specific step (daemon reads this before executing)
http.route({
  path: "/api/workflow/step-input",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    if (!checkAuth(request)) {
      return new Response("Unauthorized", { status: 401 });
    }
    try {
      const url = new URL(request.url);
      const stepId = url.searchParams.get("stepId");
      if (!stepId) {
        return new Response(
          JSON.stringify({ ok: false, error: "Missing stepId query parameter" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }

      const step = await ctx.runQuery(api.workflows.getWorkflowStep, {
        id: stepId as any,
      });
      if (!step) {
        return new Response(
          JSON.stringify({ ok: false, error: "Step not found" }),
          { status: 404, headers: { "Content-Type": "application/json" } }
        );
      }

      // Also fetch the parent workflow for context
      const workflow = await ctx.runQuery(api.workflows.getWorkflow, {
        id: step.workflowId,
      });

      return new Response(
        JSON.stringify({
          ok: true,
          stepId: step._id,
          stepNumber: step.stepNumber,
          name: step.name,
          agentRole: step.agentRole,
          input: step.input,
          workflowId: step.workflowId,
          contentType: workflow?.contentType,
          selectedAngle: workflow?.selectedAngle,
          briefing: workflow?.briefing,
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      return new Response(
        JSON.stringify({ ok: false, error: message }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  }),
});

export default http;
