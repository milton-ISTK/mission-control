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

// ---- Content Pipeline: POST /api/content/clear-key ----
http.route({
  path: "/api/content/clear-key",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    if (!checkAuth(request)) {
      return new Response("Unauthorized", { status: 401 });
    }
    try {
      const body = await request.json();
      await ctx.runMutation(api.contentPipeline.clearApiKey, {
        id: body.id,
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

export default http;
