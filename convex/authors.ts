import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/** Get all active authors */
export const getAuthors = query({
  args: { includeInactive: v.optional(v.boolean()) },
  handler: async (ctx, args) => {
    if (args.includeInactive) {
      return await ctx.db.query("authors").collect();
    }
    return await ctx.db
      .query("authors")
      .withIndex("by_isActive", (q) => q.eq("isActive", true))
      .collect();
  },
});

/** Get single author by ID */
export const getAuthorById = query({
  args: { id: v.id("authors") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

/** Create a new author */
export const createAuthor = mutation({
  args: {
    name: v.string(),
    title: v.string(),
    bio: v.optional(v.string()),
    writingStyle: v.optional(v.string()),
    voiceNotes: v.optional(v.string()),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const authorId = await ctx.db.insert("authors", {
      name: args.name,
      title: args.title,
      bio: args.bio,
      writingStyle: args.writingStyle,
      voiceNotes: args.voiceNotes,
      isActive: args.isActive,
      createdAt: now,
      updatedAt: now,
    });
    return authorId;
  },
});

/** Update an existing author */
export const updateAuthor = mutation({
  args: {
    id: v.id("authors"),
    name: v.optional(v.string()),
    title: v.optional(v.string()),
    bio: v.optional(v.string()),
    writingStyle: v.optional(v.string()),
    voiceNotes: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const filtered = Object.fromEntries(
      Object.entries(updates).filter(([_, v]) => v !== undefined)
    ) as Record<string, any>;
    filtered.updatedAt = Date.now();
    await ctx.db.patch(id, filtered as any);
    return id;
  },
});

/** Delete an author */
export const deleteAuthor = mutation({
  args: { id: v.id("authors") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

/** Seed default authors (called once during setup) */
export const seedAuthors = mutation({
  handler: async (ctx) => {
    const now = Date.now();
    
    // Check if authors already exist
    const existing = await ctx.db.query("authors").collect();
    if (existing.length > 0) {
      return { message: "Authors already seeded", count: existing.length };
    }

    // Create Jason Dussault
    await ctx.db.insert("authors", {
      name: "Jason Dussault",
      title: "CEO, IntelliStake Technologies",
      bio: "CEO with deep expertise in public markets and financial technology.",
      writingStyle: "Confident, authoritative, uses financial terminology naturally. Speaks from experience running a public company. Direct, doesn't hedge opinions.",
      voiceNotes: "Think like a seasoned executive. Be bold. Reference market data. Speak with conviction.",
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });

    // Create Gregory Cowles
    await ctx.db.insert("authors", {
      name: "Gregory Cowles",
      title: "CSO, IntelliStake Technologies",
      bio: "Chief Strategy Officer with a technical background. Thinks deeply about market dynamics.",
      writingStyle: "Technical but accessible, curious tone, asks rhetorical questions. Thinks out loud. Mixes data with personal observations. Smart casual.",
      voiceNotes: "Question assumptions. Cite data but make it conversational. Sound thoughtful, not preachy. Include insights from research.",
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });

    return { message: "Authors seeded successfully", count: 2 };
  },
});
