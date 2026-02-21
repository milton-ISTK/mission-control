/**
 * ISTK Mission Control - Dashboard aggregate queries
 * Provides stats and overview data for the main dashboard
 */
import { query } from "./_generated/server";

/** Get dashboard stats: task counts, event counts, memory counts */
export const getStats = query({
  handler: async (ctx) => {
    const tasks = await ctx.db.query("tasks").collect();
    const events = await ctx.db.query("events").collect();
    const memories = await ctx.db.query("memories").collect();
    const agents = await ctx.db.query("agents").collect();

    const today = new Date().toISOString().split("T")[0];
    const todayMemories = memories.filter((m) => m.date === today);

    return {
      tasks: {
        total: tasks.length,
        todo: tasks.filter((t) => t.status === "todo").length,
        inProgress: tasks.filter((t) => t.status === "in_progress").length,
        done: tasks.filter((t) => t.status === "done").length,
        critical: tasks.filter((t) => t.priority === "critical").length,
        gregorys: tasks.filter((t) => t.assignee === "Gregory").length,
        miltons: tasks.filter((t) => t.assignee === "Milton").length,
      },
      events: {
        total: events.length,
        active: events.filter((e) => e.status === "active").length,
        crons: events.filter((e) => e.type === "cron").length,
        deadlines: events.filter((e) => e.type === "deadline").length,
      },
      memories: {
        total: memories.length,
        today: todayMemories.length,
      },
      agents: {
        total: agents.length,
        active: agents.filter((a) => a.status === "active").length,
      },
    };
  },
});

/** Get recent activity across all tables */
export const getRecentActivity = query({
  handler: async (ctx) => {
    const tasks = await ctx.db.query("tasks").order("desc").take(5);
    const memories = await ctx.db.query("memories").order("desc").take(5);

    const activity = [
      ...tasks.map((t) => ({
        type: "task" as const,
        title: t.title,
        detail: `${t.status} · ${t.assignee}`,
        timestamp: t.updatedAt,
        priority: t.priority,
      })),
      ...memories.map((m) => ({
        type: "memory" as const,
        title: m.title,
        detail: m.source,
        timestamp: m.updatedAt,
        priority: undefined,
      })),
    ];

    return activity
      .sort((a, b) => {
        const aTime = typeof a.timestamp === "number" ? a.timestamp : new Date(a.timestamp).getTime();
        const bTime = typeof b.timestamp === "number" ? b.timestamp : new Date(b.timestamp).getTime();
        return bTime - aTime;
      })
      .slice(0, 10);
  },
});
