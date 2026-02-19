"use client";

import { useEffect, useRef } from "react";
import { useSyncCronEvent } from "@/hooks/useEvents";

interface CronJobData {
  id: string;
  name: string;
  schedule: string;
  lastRun?: string;
  nextRun?: string;
  status: "active" | "paused";
}

/**
 * CronPoller: Polls /api/cron every 60 seconds and syncs
 * cron job data to Convex via the syncCronEvent mutation.
 * Renders nothing — pure side-effect component.
 */
export default function CronPoller() {
  const syncCron = useSyncCronEvent();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastFetchRef = useRef<string>("");

  useEffect(() => {
    async function pollCrons() {
      try {
        const res = await fetch("/api/cron");
        if (!res.ok) return;

        const data: { crons: CronJobData[]; timestamp: string } = await res.json();

        // Skip if no changes (same timestamp)
        if (data.timestamp === lastFetchRef.current) return;
        lastFetchRef.current = data.timestamp;

        // Sync each cron job to Convex
        for (const cron of data.crons) {
          await syncCron({
            title: cron.name,
            schedule: cron.schedule,
            startDate: cron.lastRun || new Date().toISOString(),
            lastRun: cron.lastRun,
            nextRun: cron.nextRun,
            status: cron.status,
          });
        }
      } catch {
        // Silently fail — cron API may not be available
      }
    }

    // Initial poll
    pollCrons();

    // Poll every 60 seconds
    intervalRef.current = setInterval(pollCrons, 60_000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [syncCron]);

  // Renders nothing
  return null;
}
