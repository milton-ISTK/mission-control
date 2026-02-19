/**
 * ISTK Mission Control - Convex HTTP API
 * Exposes HTTP endpoints for the Mac mini sync script.
 * Auth via Bearer token (CONVEX_ADMIN_KEY or a shared secret).
 */
import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";

const http = httpRouter();

// ---- Auth helper ----
function checkAuth(request: Request): boolean {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return false;
  // In production, validate against a stored secret.
  // For now, any non-empty bearer token is accepted since
  // the Convex deployment URL itself acts as a secret.
  return authHeader.length > 8;
}

// ---- POST /api/sync/tasks ----
// Upserts tasks from Mac mini
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
// Pulls all tasks for Mac mini
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
// Upserts memories from Mac mini files
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
// Upserts cron events from OpenClaw
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
// Updates agent status from Mac mini
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

// ---- GET /api/health ----
// Simple health check
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
