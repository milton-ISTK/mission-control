import { NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

interface CronJob {
  id: string;
  name: string;
  schedule: string;
  lastRun?: string;
  nextRun?: string;
  status: "active" | "paused";
}

export async function GET() {
  try {
    // Try to run openclaw cron list
    const { stdout } = await execAsync("openclaw cron list 2>/dev/null || echo '[]'");
    const trimmed = stdout.trim();

    // Parse JSON output if available
    let crons: CronJob[] = [];
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        crons = parsed.map((c: any) => ({
          id: c.id || c.name || "unknown",
          name: c.name || c.label || "Unnamed Cron",
          schedule: c.schedule || c.cron || "* * * * *",
          lastRun: c.lastRun || c.last_run,
          nextRun: c.nextRun || c.next_run,
          status: c.paused ? "paused" : "active",
        }));
      }
    } catch {
      // If not JSON, try to parse text output
      // Format might be tabular — just return empty for now
    }

    return NextResponse.json({ crons, timestamp: new Date().toISOString() });
  } catch {
    // openclaw CLI not available or no crons
    return NextResponse.json({ crons: [], timestamp: new Date().toISOString() });
  }
}
