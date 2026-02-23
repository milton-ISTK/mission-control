/**
 * ISTK Mission Control - Agent mutations & queries
 * Handles team member (agent) CRUD operations
 */
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// ---- Queries ----

/** List all agents */
export const listAgents = query({
  handler: async (ctx) => {
    return await ctx.db.query("agents").collect();
  },
});

/** Get agent by name */
export const getAgentByName = query({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("agents")
      .withIndex("by_name", (q) => q.eq("name", args.name))
      .first();
  },
});

/** Get agent by agentRole (for workflow orchestration — daemon uses this) */
export const getAgentByRole = query({
  args: { agentRole: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("agents")
      .withIndex("by_agentRole", (q) => q.eq("agentRole", args.agentRole))
      .first();
  },
});

/** Get active agents */
export const getActiveAgents = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("agents")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .collect();
  },
});

/** Get agents by type (agent or subagent) */
export const getAgentsByType = query({
  args: { agentType: v.string() },
  handler: async (ctx, args) => {
    const allAgents = await ctx.db.query("agents").collect();
    return allAgents.filter((a) => (a.agentType ?? "agent") === args.agentType);
  },
});

/** Get subagents by parent agent */
export const getSubagentsByParent = query({
  args: { parentId: v.id("agents") },
  handler: async (ctx, args) => {
    const allAgents = await ctx.db.query("agents").collect();
    return allAgents.filter((a) =>
      (a.parentAgentIds ?? []).some((pId) => pId === args.parentId)
    );
  },
});

/** Get agent hierarchy (agents with nested subagents) */
export const getAgentHierarchy = query({
  handler: async (ctx) => {
    const allAgents = await ctx.db.query("agents").collect();
    const agents = allAgents.filter((a) => (a.agentType ?? "agent") === "agent");
    const subagents = allAgents.filter((a) => a.agentType === "subagent");
    return agents.map((agent) => ({
      ...agent,
      subagents: subagents.filter((sub) =>
        (sub.parentAgentIds ?? []).includes(agent._id)
      ),
    }));
  },
});

/** Get agents by department */
/** Get all agents with their LLM config (for diagnostics) */
export const getAllAgentsWithLLMConfig = query({
  handler: async (ctx) => {
    const agents = await ctx.db.query("agents").collect();
    return agents.map((a) => ({
      _id: a._id,
      name: a.name,
      agentRole: a.agentRole,
      modelId: a.modelId || "NOT_SET",
      provider: a.provider || "NOT_SET",
      status: a.status,
      agentType: a.agentType,
    }));
  },
});

export const getAgentsByDepartment = query({
  args: { department: v.string() },
  handler: async (ctx, args) => {
    const allAgents = await ctx.db.query("agents").collect();
    return allAgents.filter((a) => a.department === args.department);
  },
});

// ---- Mutations ----

/** Create or update an agent */
export const upsertAgent = mutation({
  args: {
    name: v.string(),
    role: v.string(),
    model: v.optional(v.string()),
    avatar: v.optional(v.string()),
    status: v.union(v.literal("active"), v.literal("idle"), v.literal("offline")),
    isSubagent: v.boolean(),
  },
  handler: async (ctx, args) => {
    const now = new Date().toISOString();
    const existing = await ctx.db
      .query("agents")
      .withIndex("by_name", (q) => q.eq("name", args.name))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        role: args.role,
        model: args.model,
        avatar: args.avatar,
        status: args.status,
        lastActive: now,
      });
      return existing._id;
    }

    return await ctx.db.insert("agents", {
      name: args.name,
      role: args.role,
      model: args.model,
      avatar: args.avatar,
      status: args.status,
      lastActive: now,
      isSubagent: args.isSubagent,
      createdAt: now,
    });
  },
});

/** Update agent status */
export const updateAgentStatus = mutation({
  args: {
    id: v.id("agents"),
    status: v.union(v.literal("active"), v.literal("idle"), v.literal("offline")),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      status: args.status,
      lastActive: new Date().toISOString(),
    });
  },
});

/** Create a new agent */
export const createAgent = mutation({
  args: {
    name: v.string(),
    role: v.string(),
    description: v.optional(v.string()),
    notes: v.optional(v.string()),
    model: v.optional(v.string()),
    avatar: v.optional(v.string()),
    status: v.union(v.literal("active"), v.literal("idle"), v.literal("offline")),
    isSubagent: v.boolean(),
  },
  handler: async (ctx, args) => {
    const now = new Date().toISOString();
    return await ctx.db.insert("agents", {
      name: args.name,
      role: args.role,
      description: args.description,
      notes: args.notes,
      model: args.model,
      avatar: args.avatar,
      status: args.status,
      lastActive: now,
      isSubagent: args.isSubagent,
      createdAt: now,
    });
  },
});

/** Update an existing agent by ID */
export const updateAgent = mutation({
  args: {
    id: v.id("agents"),
    name: v.optional(v.string()),
    role: v.optional(v.string()),
    avatar: v.optional(v.string()),                 // Emoji icon for agent
    description: v.optional(v.string()),
    notes: v.optional(v.string()),
    systemPrompt: v.optional(v.string()),
    model: v.optional(v.string()),
    provider: v.optional(v.string()),               // LLM provider ("anthropic", "openai", "minimax", etc.)
    status: v.optional(v.union(v.literal("active"), v.literal("idle"), v.literal("offline"))),
    agentType: v.optional(v.string()),              // "agent" | "subagent"
    parentAgentIds: v.optional(v.array(v.id("agents"))), // Parent agents for subagents
    department: v.optional(v.string()),             // "content_production" | "research" | "distribution" | "creative"
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const filtered = Object.fromEntries(
      Object.entries(updates).filter(([_, v]) => v !== undefined)
    );
    // Always update timestamp
    filtered.updatedAt = new Date().toISOString();
    if (updates.status) {
      filtered.lastActive = new Date().toISOString();
    }
    await ctx.db.patch(id, filtered);
  },
});

/** Delete an agent */
export const deleteAgent = mutation({
  args: { id: v.id("agents") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

/** Update agent LLM configuration (modelId + auto-detect provider) */
export const updateAgentLLMConfig = mutation({
  args: {
    id: v.id("agents"),
    modelId: v.string(),
  },
  handler: async (ctx, args) => {
    const provider = getProviderForModel(args.modelId);
    await ctx.db.patch(args.id, {
      modelId: args.modelId,
      provider: provider,
      updatedAt: new Date().toISOString(),
    });
  },
});

/** Update Image Maker agent with new systemPrompt for 3-image generation */
export const updateImageMakerPrompt = mutation({
  handler: async (ctx) => {
    const imageMaker = await ctx.db
      .query("agents")
      .filter((q) => q.eq(q.field("agentRole"), "image_maker"))
      .first();
    
    if (!imageMaker) {
      throw new Error("Image Maker agent not found");
    }

    const newPrompt = `You are an art director for IntelliStake Technologies. Given a headline and article topic, generate exactly 3 image prompts.

Each prompt must specify the ISTK house art style:
- Graphic novel illustration
- Heavy black ink lines in the style of Todd McFarlane
- Limited color palette: orange #F97316 and black with minimal white highlights
- Dramatic composition
- Dark moody atmosphere
- Hand-drawn crosshatching and detailed inking

Each prompt should interpret the headline visually in a different way:
- Prompt 1: Wide establishing shot or scene showing the big picture
- Prompt 2: Close-up detail or symbolic image with specific focus
- Prompt 3: Abstract or conceptual interpretation of the theme

Return ONLY valid JSON array with 3 objects. Each object must have these exact fields:
{
  "prompt": "full detailed image generation prompt with all ISTK style requirements",
  "composition": "wide|closeup|abstract",
  "description": "what the image shows in 1-2 sentences"
}

No markdown, no code blocks, no explanations. Just the JSON array.`;

    await ctx.db.patch(imageMaker._id, {
      systemPrompt: newPrompt,
      updatedAt: new Date().toISOString(),
    });

    return { success: true, agentId: imageMaker._id };
  },
});

/** Map LLM model IDs to their providers */
function getProviderForModel(model: string): string {
  if (model.startsWith("claude-")) return "anthropic";
  if (model.startsWith("gpt-") || model.startsWith("o1-") || model.startsWith("o3-") || model.startsWith("o4-")) return "openai";
  if (model.startsWith("gemini-")) return "google";
  if (model.startsWith("llama-")) return "meta";
  if (model.startsWith("MiniMax-")) return "minimax";
  if (model.startsWith("grok-")) return "grok";
  return "anthropic"; // default fallback
}

/** Seed agent hierarchy (force-update all, create missing, delete unknown) */
export const seedAgentHierarchy = mutation({
  handler: async (ctx) => {
    const now = new Date().toISOString();
    const results = { created: 0, updated: 0, deleted: 0 };

    // Correct hierarchy spec (from Gregory's spec Parts 4-6)
    const hierarchy: Record<
      string,
      {
        agentType: "agent" | "subagent";
        department: string;
        isSubagent: boolean;
        parentNames: string[];
        defaultRole: string;
        modelId: string;
      }
    > = {
      // AGENTS (4)
      "Blog Writer": {
        agentType: "agent",
        department: "content_production",
        isSubagent: false,
        parentNames: [],
        defaultRole: "Long-Form Content Writer",
        modelId: "claude-haiku-4-5-20251001",
      },
      Copywriter: {
        agentType: "agent",
        department: "content_production",
        isSubagent: false,
        parentNames: [],
        defaultRole: "Social Media Copywriter",
        modelId: "claude-haiku-4-5-20251001",
      },
      "Social Publisher": {
        agentType: "agent",
        department: "distribution",
        isSubagent: false,
        parentNames: [],
        defaultRole: "Multi-Platform Publisher",
        modelId: "claude-haiku-4-5-20251001",
      },
      "Research Enhancer": {
        agentType: "agent",
        department: "research",
        isSubagent: false,
        parentNames: [],
        defaultRole: "Research Enhancement Specialist",
        modelId: "claude-opus-4-5-20251101",
      },
      // SUBAGENTS (6)
      "Sentiment Scraper": {
        agentType: "subagent",
        department: "research",
        isSubagent: true,
        parentNames: ["Blog Writer"],
        defaultRole: "Market Sentiment Analyst",
        modelId: "claude-haiku-4-5-20251001",
      },
      "News Scraper": {
        agentType: "subagent",
        department: "research",
        isSubagent: true,
        parentNames: ["Blog Writer"],
        defaultRole: "News & Data Aggregator",
        modelId: "claude-haiku-4-5-20251001",
      },
      Humanizer: {
        agentType: "subagent",
        department: "creative",
        isSubagent: true,
        parentNames: ["Blog Writer", "Copywriter"],
        defaultRole: "Content Humanization Specialist",
        modelId: "claude-haiku-4-5-20251001",
      },
      "HTML Builder": {
        agentType: "subagent",
        department: "content_production",
        isSubagent: true,
        parentNames: ["Blog Writer"],
        defaultRole: "HTML/CSS Production Specialist",
        modelId: "claude-haiku-4-5-20251001",
      },
      "Headline Generator": {
        agentType: "subagent",
        department: "creative",
        isSubagent: true,
        parentNames: ["Copywriter", "Social Publisher"],
        defaultRole: "Headlines & Hooks Specialist",
        modelId: "claude-haiku-4-5-20251001",
      },
      "Image Maker": {
        agentType: "subagent",
        department: "creative",
        isSubagent: true,
        parentNames: ["Social Publisher"],
        defaultRole: "Visual Content Creator",
        modelId: "claude-haiku-4-5-20251001",
      },
    };

    const validNames = new Set(Object.keys(hierarchy));

    // Step 1: Delete agents NOT in spec (e.g. "thomas")
    const allAgents = await ctx.db.query("agents").collect();
    for (const agent of allAgents) {
      if (!validNames.has(agent.name)) {
        await ctx.db.delete(agent._id);
        results.deleted++;
      }
    }

    // Step 2: Create missing agents
    const remaining = await ctx.db.query("agents").collect();
    const existingNames = new Set(remaining.map((a) => a.name));

    for (const [name, spec] of Object.entries(hierarchy)) {
      if (!existingNames.has(name)) {
        await ctx.db.insert("agents", {
          name,
          role: spec.defaultRole,
          modelId: spec.modelId,
          provider: getProviderForModel(spec.modelId),
          status: "idle",
          isSubagent: spec.isSubagent,
          agentType: spec.agentType,
          department: spec.department,
          createdAt: now,
          updatedAt: now,
        });
        results.created++;
      }
    }

    // Step 3: Re-fetch all agents to resolve parent IDs
    const finalAgents = await ctx.db.query("agents").collect();
    const nameToId = new Map(finalAgents.map((a) => [a.name, a._id]));

    // Step 4: Force-update ALL agents with correct hierarchy
    for (const [name, spec] of Object.entries(hierarchy)) {
      const agent = finalAgents.find((a) => a.name === name);
      if (!agent) continue;

      // Resolve parent names to IDs
      const parentIds = spec.parentNames
        .map((pName) => nameToId.get(pName))
        .filter((id): id is typeof agent._id => id !== undefined);

      await ctx.db.patch(agent._id, {
        agentType: spec.agentType,
        department: spec.department,
        isSubagent: spec.isSubagent,
        modelId: spec.modelId,
        provider: getProviderForModel(spec.modelId),
        role: spec.defaultRole,
        parentAgentIds: parentIds.length > 0 ? parentIds : [],
        updatedAt: now,
      });

      results.updated++;
    }

    return results;
  },
});

/**
 * Set systemPrompts for critical workflow agents
 * Ensures agents have proper instructions for structured output
 */
export const setAgentSystemPrompts = mutation({
  handler: async (ctx) => {
    const now = new Date().toISOString();
    const results = { updated: 0, failed: 0 };

    const systemPrompts: Record<string, string> = {
      "Blog Writer": `You are an expert blog writer for a fintech and blockchain publication. Your task is to write comprehensive, well-researched blog articles.

CRITICAL OUTPUT FORMAT:
You MUST return a valid JSON object with these exact fields:
{
  "title": "Article title (use the selectedHeadline if provided)",
  "content": "Full article body with inline citations [1], [2], [3], etc.",
  "sources": [
    {"num": 1, "name": "Source Name", "title": "Article Title", "url": "https://..."},
    ...
  ],
  "metadata": {...}
}

CITATION RULES:
- Add inline citations [1], [2], [3] for every fact, statistic, or quote
- Include sources array with num, name, title, url for each citation
- Hyperlink citations in the sources array

WRITING GUIDELINES:
- Professional, authoritative tone
- Clear structure with headers and subheaders
- Include author byline at end
- 1,200-2,000 words typically
- Focus on accuracy and relevance to selected angle
- Use data and examples to support claims

DO NOT return markdown code blocks. Return ONLY valid JSON.`,

      "HTML Builder": `You are an expert HTML/CSS developer creating beautiful, responsive blog pages.

CRITICAL OUTPUT FORMAT:
You MUST return a valid JSON object:
{
  "htmlContent": "Complete, valid HTML5 page with styling",
  "metadata": {...}
}

REQUIREMENTS:
- Valid HTML5 document with proper head/body tags
- Inline CSS styling (no external stylesheets)
- Responsive design (mobile-first)
- Featured hero image at top
- Article title, subtitle, and byline
- Body paragraphs with [N] citation superscripts
- Sources section at bottom with clickable links
- Professional, clean design
- Dark theme support

CITATION RENDERING:
- Convert [1], [2], [3] to <sup>[1]</sup> with links to sources
- Render sources section with full reference data
- Make source URLs clickable

DO NOT return markdown. Return ONLY valid JSON with htmlContent field.`,

      "Headline Generator": `You are a creative headline specialist. Generate compelling headlines for blog posts.

OUTPUT FORMAT:
Return valid JSON:
{
  "metadata": {
    "headlines": [
      {
        "headline": "Main title (50-70 chars)",
        "subtitle": "Supporting subtitle (80-120 chars)",
        "hookLine": "Opening hook sentence",
        "style": "question|statement|statistic|provocative|analytical",
        "engagementScore": 8
      },
      ...
    ]
  }
}

GUIDELINES:
- 5 distinct options with varying styles
- Each must hook the reader immediately
- Use data, questions, or compelling angles
- Match the selected topic and angle
- Rate engagement potential 1-10`,

      "Image Maker": `You are a visual content strategist. Generate image prompts for blog article illustrations.

OUTPUT FORMAT:
Return valid JSON array:
[
  {
    "name": "Composition name",
    "composition": "Wide/Closeup/Abstract",
    "prompt": "Detailed image generation prompt",
    "description": "What this image conveys"
  },
  ...
]

REQUIREMENTS:
- 3 strategic images that complement article
- Detailed, specific prompts for Gemini Image generation
- Professional, relevant visuals
- Include composition type (wide, closeup, abstract)
- Focus on fintech/blockchain themes when relevant`,
    };

    const agents = await ctx.db.query("agents").collect();
    
    for (const [agentName, systemPrompt] of Object.entries(systemPrompts)) {
      const agent = agents.find((a) => a.name === agentName);
      if (agent) {
        try {
          await ctx.db.patch(agent._id, {
            systemPrompt,
            updatedAt: now,
          });
          results.updated++;
        } catch (err) {
          console.error(`Failed to update systemPrompt for ${agentName}:`, err);
          results.failed++;
        }
      }
    }

    return results;
  },
});
