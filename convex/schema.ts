/**
 * ISTK: Agentic Mission Control - Convex Schema
 * Defines all database tables for the MVP dashboard.
 */
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // ---- Tasks (Kanban Board) ----
  tasks: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    status: v.union(v.literal("todo"), v.literal("in_progress"), v.literal("done")),
    priority: v.union(
      v.literal("critical"),
      v.literal("high"),
      v.literal("medium"),
      v.literal("low")
    ),
    assignee: v.union(v.literal("Gregory"), v.literal("Milton")),
    dueDate: v.optional(v.string()), // ISO date string
    tags: v.optional(v.array(v.string())),
    order: v.number(), // For drag-and-drop ordering
    createdAt: v.string(),
    updatedAt: v.string(),
  })
    .index("by_status", ["status"])
    .index("by_assignee", ["assignee"])
    .index("by_priority", ["priority"]),

  // ---- Calendar Events ----
  events: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    type: v.union(v.literal("cron"), v.literal("deadline"), v.literal("oneshot")),
    schedule: v.optional(v.string()),    // Cron expression
    startDate: v.string(),               // ISO datetime
    endDate: v.optional(v.string()),     // ISO datetime
    lastRun: v.optional(v.string()),     // Last execution time
    nextRun: v.optional(v.string()),     // Next scheduled time
    status: v.union(v.literal("active"), v.literal("paused"), v.literal("completed")),
    color: v.optional(v.string()),
    createdAt: v.string(),
  })
    .index("by_type", ["type"])
    .index("by_status", ["status"])
    .index("by_date", ["startDate"]),

  // ---- Memories ----
  memories: defineTable({
    title: v.string(),
    content: v.string(),
    source: v.string(),           // File path or "manual"
    category: v.optional(v.string()),
    tags: v.array(v.string()),
    isToday: v.boolean(),         // Flag for "Today's Log"
    date: v.string(),             // ISO date
    createdAt: v.string(),
    updatedAt: v.string(),
  })
    .index("by_date", ["date"])
    .index("by_category", ["category"])
    .index("by_source", ["source"])
    .searchIndex("search_memories", {
      searchField: "content",
      filterFields: ["category", "date"],
    }),

  // ---- Team / Agents ----
  agents: defineTable({
    name: v.string(),
    role: v.string(),
    model: v.optional(v.string()),
    avatar: v.optional(v.string()),  // Emoji or icon identifier
    status: v.union(v.literal("active"), v.literal("idle"), v.literal("offline")),
    lastActive: v.optional(v.string()),
    hoursThisMonth: v.optional(v.number()),
    recentTasks: v.optional(v.array(v.string())), // Last 5 task titles
    isSubagent: v.boolean(),
    createdAt: v.string(),
  })
    .index("by_status", ["status"])
    .index("by_name", ["name"]),

  // ---- Content Pipeline: Research & Content Generation ----
  contentResearch: defineTable({
    topic: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("researching"),
      v.literal("ready"),
      v.literal("approved"),
      v.literal("rejected"),
      v.literal("cancelled"),
      v.literal("generating"),
      v.literal("complete")
    ),
    // LLM configuration (per-request)
    llmModel: v.optional(v.string()),             // Model ID (e.g. "claude-haiku-4-5-20250315")
    llmApiKey: v.optional(v.string()),            // API key (cleared after processing)
    // Research results
    summary: v.optional(v.string()),
    sentiment: v.optional(v.string()),           // bullish | neutral | bearish
    narratives: v.optional(v.array(v.string())),  // Key themes
    angles: v.optional(v.array(v.string())),      // Positioning angles
    quotes: v.optional(v.array(v.string())),      // Quote opportunities
    sources: v.optional(v.string()),              // JSON array of source objects
    fullReport: v.optional(v.string()),           // Full markdown report
    // Content generation
    selectedAngle: v.optional(v.string()),
    xPosts: v.optional(v.array(v.string())),
    linkedinPosts: v.optional(v.array(v.string())),
    // Meta
    requestedBy: v.string(),
    createdAt: v.string(),
    updatedAt: v.string(),
  })
    .index("by_status", ["status"])
    .index("by_date", ["createdAt"]),

  // ---- Subagent Configurations ----
  subagents: defineTable({
    name: v.string(),
    llm: v.string(),               // Selected LLM model
    role: v.string(),              // Writer, Designer, Analyst, etc.
    description: v.optional(v.string()),
    apiKeyHash: v.optional(v.string()), // Hashed API key (never store plaintext)
    hasApiKey: v.boolean(),        // Flag if external API key is configured
    isActive: v.boolean(),
    config: v.optional(v.string()), // JSON string for additional config
    createdAt: v.string(),
    updatedAt: v.string(),
  })
    .index("by_active", ["isActive"])
    .index("by_name", ["name"]),
});
