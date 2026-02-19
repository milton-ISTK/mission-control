/**
 * ISTK Mission Control - Memory mutations & queries
 * Handles memory card CRUD, search, and sync from markdown files
 */
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// ---- Queries ----

/** List all memories, optionally filtered by category or date */
export const listMemories = query({
  args: {
    category: v.optional(v.string()),
    date: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let q = ctx.db.query("memories");

    if (args.category) {
      return await ctx.db
        .query("memories")
        .withIndex("by_category", (q) => q.eq("category", args.category!))
        .order("desc")
        .collect();
    }

    if (args.date) {
      return await ctx.db
        .query("memories")
        .withIndex("by_date", (q) => q.eq("date", args.date!))
        .order("desc")
        .collect();
    }

    return await q.order("desc").collect();
  },
});

/** Full-text search across memory content */
export const searchMemories = query({
  args: {
    searchQuery: v.string(),
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let searchBuilder = ctx.db
      .query("memories")
      .withSearchIndex("search_memories", (q) => {
        let search = q.search("content", args.searchQuery);
        if (args.category) {
          search = search.eq("category", args.category);
        }
        return search;
      });

    return await searchBuilder.collect();
  },
});

/** Get today's memories */
export const getTodaysMemories = query({
  handler: async (ctx) => {
    const today = new Date().toISOString().split("T")[0];
    return await ctx.db
      .query("memories")
      .withIndex("by_date", (q) => q.eq("date", today))
      .order("desc")
      .collect();
  },
});

/** Get unique categories */
export const getCategories = query({
  handler: async (ctx) => {
    const memories = await ctx.db.query("memories").collect();
    const categories = new Set<string>();
    memories.forEach((m) => {
      if (m.category) categories.add(m.category);
    });
    return Array.from(categories).sort();
  },
});

/** Get all unique tags */
export const getAllTags = query({
  handler: async (ctx) => {
    const memories = await ctx.db.query("memories").collect();
    const tags = new Set<string>();
    memories.forEach((m) => {
      m.tags.forEach((t) => tags.add(t));
    });
    return Array.from(tags).sort();
  },
});

// ---- Mutations ----

/** Add a new memory entry */
export const addMemory = mutation({
  args: {
    title: v.string(),
    content: v.string(),
    source: v.string(),
    category: v.optional(v.string()),
    tags: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const now = new Date().toISOString();
    const today = now.split("T")[0];

    return await ctx.db.insert("memories", {
      title: args.title,
      content: args.content,
      source: args.source,
      category: args.category,
      tags: args.tags,
      isToday: true,
      date: today,
      createdAt: now,
      updatedAt: now,
    });
  },
});

/** Sync memory from file system - upsert by source path */
export const syncMemory = mutation({
  args: {
    title: v.string(),
    content: v.string(),
    source: v.string(),
    category: v.optional(v.string()),
    tags: v.array(v.string()),
    date: v.string(),
  },
  handler: async (ctx, args) => {
    const now = new Date().toISOString();
    const today = now.split("T")[0];

    // Check if memory from this source already exists
    const existing = await ctx.db
      .query("memories")
      .withIndex("by_source", (q) => q.eq("source", args.source))
      .first();

    if (existing) {
      // Update existing memory
      await ctx.db.patch(existing._id, {
        title: args.title,
        content: args.content,
        category: args.category,
        tags: args.tags,
        isToday: args.date === today,
        date: args.date,
        updatedAt: now,
      });
      return existing._id;
    } else {
      // Create new memory
      return await ctx.db.insert("memories", {
        title: args.title,
        content: args.content,
        source: args.source,
        category: args.category,
        tags: args.tags,
        isToday: args.date === today,
        date: args.date,
        createdAt: now,
        updatedAt: now,
      });
    }
  },
});

/** Delete a memory */
export const deleteMemory = mutation({
  args: { id: v.id("memories") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

/** Update a memory */
export const updateMemory = mutation({
  args: {
    id: v.id("memories"),
    title: v.optional(v.string()),
    content: v.optional(v.string()),
    category: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const filtered = Object.fromEntries(
      Object.entries(updates).filter(([_, v]) => v !== undefined)
    );
    await ctx.db.patch(id, { ...filtered, updatedAt: new Date().toISOString() });
  },
});
