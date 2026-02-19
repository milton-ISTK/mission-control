"use client";

import { useEffect, useRef, useCallback } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

interface MemoryFile {
  path: string;
  title: string;
  content: string;
  date: string;
  category?: string;
  tags: string[];
}

/**
 * Polls the /api/memory-sync endpoint every intervalMs
 * and syncs the results to Convex via the syncMemory mutation.
 */
export function useFileWatcher(intervalMs: number = 2000) {
  const syncMemory = useMutation(api.memories.syncMemory);
  const lastHashRef = useRef<string>("");

  const syncFiles = useCallback(async () => {
    try {
      const res = await fetch("/api/memory-sync");
      if (!res.ok) return;

      const data: { files: MemoryFile[]; hash: string } = await res.json();

      // Skip if nothing changed
      if (data.hash === lastHashRef.current) return;
      lastHashRef.current = data.hash;

      // Sync each file to Convex
      for (const file of data.files) {
        await syncMemory({
          title: file.title,
          content: file.content,
          source: file.path,
          category: file.category,
          tags: file.tags,
          date: file.date,
        });
      }
    } catch {
      // Silently fail — API route may not be running
    }
  }, [syncMemory]);

  useEffect(() => {
    // Initial sync
    syncFiles();

    // Set up polling
    const interval = setInterval(syncFiles, intervalMs);
    return () => clearInterval(interval);
  }, [syncFiles, intervalMs]);
}
