"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

export function useMemories(category?: string, date?: string) {
  return useQuery(api.memories.listMemories, {
    category: category || undefined,
    date: date || undefined,
  });
}

export function useSearchMemories(query: string, category?: string) {
  return useQuery(
    api.memories.searchMemories,
    query.length >= 2 ? { searchQuery: query, category } : "skip"
  );
}

export function useTodaysMemories() {
  return useQuery(api.memories.getTodaysMemories);
}

export function useMemoryCategories() {
  return useQuery(api.memories.getCategories);
}

export function useMemoryTags() {
  return useQuery(api.memories.getAllTags);
}

export function useAddMemory() {
  return useMutation(api.memories.addMemory);
}

export function useSyncMemory() {
  return useMutation(api.memories.syncMemory);
}

export function useUpdateMemory() {
  return useMutation(api.memories.updateMemory);
}

export function useDeleteMemory() {
  return useMutation(api.memories.deleteMemory);
}
