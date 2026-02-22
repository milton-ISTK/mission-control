/**
 * ISTK Mission Control - File Storage API
 * Manages Convex file uploads for images and documents.
 */
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Generate a short-lived upload URL (expires in 1 hour)
 * Used by daemon to upload image files
 */
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

/**
 * Get the permanent serving URL for a stored file
 */
export const getFileUrl = query({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  },
});

/**
 * Get multiple file URLs at once
 */
export const getFileUrls = query({
  args: { storageIds: v.array(v.id("_storage")) },
  handler: async (ctx, args) => {
    const urls = await Promise.all(
      args.storageIds.map(async (id) => ({
        storageId: id,
        url: await ctx.storage.getUrl(id),
      }))
    );
    return urls;
  },
});
