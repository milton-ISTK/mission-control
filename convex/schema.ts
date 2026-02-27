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
    assignee: v.string(), // Can be any agent name, not just Gregory/Milton
    dueDate: v.optional(v.string()), // ISO date string
    tags: v.optional(v.array(v.string())),
    order: v.number(), // For drag-and-drop ordering
    createdAt: v.number(),
    updatedAt: v.number(),
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
    description: v.optional(v.string()),
    notes: v.optional(v.string()),
    model: v.optional(v.string()),
    avatar: v.optional(v.string()),  // Emoji or icon identifier
    status: v.union(v.literal("active"), v.literal("idle"), v.literal("offline")),
    lastActive: v.optional(v.string()),
    hoursThisMonth: v.optional(v.number()),
    recentTasks: v.optional(v.array(v.string())), // Last 5 task titles
    isSubagent: v.boolean(),
    createdAt: v.string(),
    updatedAt: v.optional(v.string()),
    // ---- Workflow Orchestration additions (Phase 1) ----
    agentRole: v.optional(v.string()),              // Workflow routing key (e.g. "blog_writer", "sentiment_scraper")
    capabilities: v.optional(v.array(v.string())),  // List of agent capabilities
    systemPrompt: v.optional(v.string()),           // Full system prompt for LLM
    modelId: v.optional(v.string()),                // Exact LLM model ID (from llm-models.ts)
    provider: v.optional(v.string()),               // LLM provider ("anthropic", "openai", etc.)
    isAutonomous: v.optional(v.boolean()),          // Can work without human intervention
    maxConcurrentTasks: v.optional(v.number()),     // Max parallel tasks this agent can handle
    // ---- Agent Hierarchy (Phase 3) ----
    agentType: v.optional(v.string()),              // "agent" | "subagent" — default "agent"
    parentAgentIds: v.optional(v.array(v.id("agents"))), // Which agents this subagent reports to
    department: v.optional(v.string()),             // "content_production" | "research" | "distribution" | "creative"
    // ---- Product Assignment ----
    teamType: v.optional(v.string()),               // "mission_control" | "draftengine" — separates agents by product
  })
    .index("by_status", ["status"])
    .index("by_name", ["name"])
    .index("by_agentRole", ["agentRole"])
    .index("by_teamType", ["teamType"]),

  // ---- System Status (daemon health, sync status, etc.) ----
  systemStatus: defineTable({
    key: v.string(),                    // e.g. "daemon_health"
    status: v.string(),                 // "online" | "offline"
    details: v.optional(v.string()),    // JSON string with extra info
    updatedAt: v.string(),
  }).index("by_key", ["key"]),

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
      v.literal("declined"),
      v.literal("generating"),
      v.literal("complete")
    ),
    // LLM configuration (per-request)
    llmModel: v.optional(v.string()),             // Model ID (e.g. "claude-4-5-haiku")
    llmProvider: v.optional(v.string()),          // Provider key (e.g. "anthropic", "openai", "google")
    llmApiKey: v.optional(v.string()),            // DEPRECATED: API keys now stored in apiKeys table, not here
    // NOTE: API keys are NOT stored in Convex. They're stored locally on Milton's disk only (~/config/mission-control/api-keys.json)
    // Research results
    summary: v.optional(v.string()),
    sentiment: v.optional(v.string()),           // bullish | neutral | bearish
    narratives: v.optional(v.array(v.string())),  // Key themes
    angles: v.optional(v.array(v.string())),      // Positioning angles
    quotes: v.optional(v.array(v.string())),      // Quote opportunities
    sources: v.optional(v.string()),              // JSON array of source objects
    fullReport: v.optional(v.string()),           // Full markdown report
    // Error handling
    errorMessage: v.optional(v.string()),        // Reason for rejection (API error, timeout, etc.)
    // Live thinking feed (while researching) — displayed with typewriter animation
    thinkingLine1: v.optional(v.string()),       // Primary action line (e.g. "Scraping CoinDesk — found 3 articles on ETF flows...")
    thinkingLine2: v.optional(v.string()),       // Secondary insight line (e.g. "Cross-referencing 847 tweets — sentiment 64% bullish...")
    // Content generation
    selectedAngle: v.optional(v.string()),
    xPosts: v.optional(v.array(v.string())),
    linkedinPosts: v.optional(v.array(v.string())),
    // Retry tracking
    retryCount: v.optional(v.number()),
    // Meta
    requestedBy: v.string(),
    createdAt: v.string(),
    updatedAt: v.string(),
    // ---- Workflow Orchestration additions (Phase 1) ----
    suggestedAngles: v.optional(v.array(v.object({
      title: v.string(),
      description: v.string(),
      targetAudience: v.string(),
      tone: v.string(),
      hookLine: v.string(),
    }))),
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

  // ---- API Keys Storage (for Content Pipeline) ----
  // Keys are stored in Convex as source of truth, but sync script reads and writes to local file
  apiKeys: defineTable({
    provider: v.string(),          // anthropic, openai, google, meta, minimax, grok
    keyPlaintext: v.string(),      // API key (stored here, sync script moves to local file)
    isActive: v.boolean(),
    lastSynced: v.optional(v.string()), // ISO timestamp when sync daemon last picked up this key
    createdAt: v.string(),
    updatedAt: v.string(),
  }).index("by_provider", ["provider"]),

  // ==== Workflow Orchestration Engine (Phase 1) ====

  // ---- Workflow Templates ----
  // Defines reusable workflow blueprints (e.g. "Blog Post", "X Thread")
  workflowTemplates: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    contentType: v.string(), // blog_post, social_image, x_thread, linkedin_post
    steps: v.array(v.object({
      stepNumber: v.number(),
      name: v.string(),
      description: v.optional(v.string()),
      agentRole: v.string(),
      requiresApproval: v.boolean(),
      approvalPrompt: v.optional(v.string()), // Custom message shown during approval review
      timeoutMinutes: v.number(),
      parallelWith: v.optional(v.array(v.number())),
    })),
    isActive: v.boolean(),
    createdAt: v.string(),
    updatedAt: v.string(),
  })
    .index("by_contentType", ["contentType"])
    .index("by_isActive", ["isActive"]),

  // ---- Workflows ----
  // Running instances of workflow templates
  workflows: defineTable({
    templateId: v.id("workflowTemplates"),
    sourceResearchId: v.optional(v.id("contentResearch")), // Optional for DraftEngine workflows
    taskId: v.optional(v.id("tasks")), // Link to Task Board
    selectedAngle: v.string(),
    contentType: v.string(),
    briefing: v.optional(v.string()),
    authorId: v.optional(v.id("authors")), // Blog author for this workflow
    status: v.union(
      v.literal("pending"),
      v.literal("active"),
      v.literal("paused"),
      v.literal("paused_for_review"),
      v.literal("completed"),
      v.literal("failed"),
      v.literal("cancelled")
    ),
    currentStepNumber: v.number(),
    createdAt: v.string(),
    updatedAt: v.string(),
    completedAt: v.optional(v.string()),
  })
    .index("by_status", ["status"])
    .index("by_templateId", ["templateId"])
    .index("by_sourceResearchId", ["sourceResearchId"]),

  // ---- Workflow Steps ----
  // Individual step execution records within a workflow
  workflowSteps: defineTable({
    workflowId: v.id("workflows"),
    stepNumber: v.number(),
    name: v.string(),
    agentRole: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("agent_working"),
      v.literal("completed"),
      v.literal("approved"),
      v.literal("failed"),
      v.literal("awaiting_review"),
      v.literal("rejected"),
      v.literal("skipped")
    ),
    input: v.optional(v.string()),          // JSON string — input data from previous step
    output: v.optional(v.string()),         // JSON string — output data from this step
    outputOptions: v.optional(v.array(v.string())), // Array of JSON strings — selectable options for review (images, headlines, etc)
    thinkingLine1: v.optional(v.string()),  // Live thinking feed line 1
    thinkingLine2: v.optional(v.string()),  // Live thinking feed line 2
    requiresApproval: v.boolean(),
    approvalPrompt: v.optional(v.string()), // Custom prompt shown to user during approval
    reviewNotes: v.optional(v.string()),
    selectedOption: v.optional(v.string()),
    reviewedAt: v.optional(v.string()),
    errorMessage: v.optional(v.string()),
    startedAt: v.optional(v.string()),
    completedAt: v.optional(v.string()),
    timeoutMinutes: v.number(),
    retryCount: v.optional(v.number()),
    createdAt: v.string(),
    updatedAt: v.string(),
  })
    .index("by_workflowId", ["workflowId"])
    .index("by_status", ["status"])
    .index("by_workflowId_stepNumber", ["workflowId", "stepNumber"]),

  // ---- Published Content ----
  // Final output from completed workflows
  publishedContent: defineTable({
    workflowId: v.id("workflows"),
    contentType: v.string(),
    title: v.optional(v.string()),
    body: v.optional(v.string()),
    htmlContent: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    platform: v.optional(v.string()),     // x, linkedin, blog, etc.
    publishedUrl: v.optional(v.string()),
    publishedAt: v.optional(v.string()),
    status: v.union(
      v.literal("draft"),
      v.literal("published"),
      v.literal("scheduled"),
      v.literal("failed")
    ),
    createdAt: v.string(),
    updatedAt: v.string(),
  })
    .index("by_workflowId", ["workflowId"])
    .index("by_status", ["status"])
    .index("by_platform", ["platform"]),

  // ---- Blog Authors ----
  // Author profiles for blog post generation
  authors: defineTable({
    name: v.string(),
    title: v.string(),
    bio: v.optional(v.string()),
    writingStyle: v.optional(v.string()),
    voiceNotes: v.optional(v.string()),
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_isActive", ["isActive"])
    .index("by_name", ["name"]),

  // ==== DraftEngine B2C Platform ====

  // ---- DraftEngine Projects ----
  // Tracks a user's DraftEngine blog creation session from topic to final output
  draftEngineProjects: defineTable({
    // Identity
    userId: v.optional(v.string()),       // For future auth — can be anonymous for demo
    topic: v.string(),                    // What the user typed
    authorName: v.optional(v.string()),   // Author name for blog byline (default: "DraftEngine")
    // Linked workflow
    workflowId: v.optional(v.id("workflows")),
    // User selections (stored as they make them)
    selectedHeadlineIndex: v.optional(v.number()),
    selectedHeadline: v.optional(v.string()),
    // Image choices
    imageStyle: v.optional(v.string()),   // "photograph" | "illustrated" | "cgi" | "watercolour" | "minimalist" | "abstract"
    imageSceneDescription: v.optional(v.string()),
    selectedImageIndex: v.optional(v.number()),
    selectedImageUrl: v.optional(v.string()),
    // Theme choices
    themeId: v.optional(v.string()),      // "clean_light" | "dark_editorial" | "bold_gradient" | "magazine" | "minimalist" | "corporate"
    accentColor: v.optional(v.string()),  // Hex colour code
    paletteName: v.optional(v.string()),  // "warm_sunset", "ocean_blue", etc.
    // Output
    finalHtmlUrl: v.optional(v.string()),
    blogContent: v.optional(v.string()),  // Approved blog content (JSON)
    // State
    currentScreen: v.string(),             // Which wizard screen: topic_input | researching | headline_select | image_style | creating | blog_review | image_review | theme_select | preview | complete
    // Timestamps
    createdAt: v.number(),
    updatedAt: v.number(),
    completedAt: v.optional(v.number()),
  })
    .index("by_userId", ["userId"])
    .index("by_workflowId", ["workflowId"])
    .index("by_currentScreen", ["currentScreen"]),
});
