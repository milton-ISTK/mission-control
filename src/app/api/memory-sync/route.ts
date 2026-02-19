import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

const WORKSPACE_DIR =
  process.env.MEMORY_DIR || "/Users/milton/.openclaw/workspace";

interface MemoryFile {
  path: string;
  title: string;
  content: string;
  date: string;
  category?: string;
  tags: string[];
}

function extractHeaders(content: string): string[] {
  const headers = content.match(/^#{1,3}\s+(.+)$/gm);
  if (!headers) return [];
  return headers.map((h) => h.replace(/^#{1,3}\s+/, "").trim());
}

function extractDate(filePath: string, content: string): string {
  // Try to extract date from filename like 2026-02-19.md
  const dateMatch = path.basename(filePath).match(/(\d{4}-\d{2}-\d{2})/);
  if (dateMatch) return dateMatch[1];
  // Fallback to today
  return new Date().toISOString().split("T")[0];
}

function categorize(filePath: string): string {
  if (filePath.includes("MEMORY.md")) return "long-term";
  if (filePath.includes("memory/")) return "daily-log";
  return "general";
}

export async function GET() {
  try {
    const files: MemoryFile[] = [];

    // Read MEMORY.md
    const memoryMdPath = path.join(WORKSPACE_DIR, "MEMORY.md");
    try {
      const content = await fs.readFile(memoryMdPath, "utf-8");
      files.push({
        path: "MEMORY.md",
        title: "Long-Term Memory",
        content,
        date: new Date().toISOString().split("T")[0],
        category: "long-term",
        tags: extractHeaders(content),
      });
    } catch {
      // File may not exist
    }

    // Read memory/*.md files
    const memoryDir = path.join(WORKSPACE_DIR, "memory");
    try {
      const entries = await fs.readdir(memoryDir);
      const mdFiles = entries.filter((f) => f.endsWith(".md"));

      for (const file of mdFiles) {
        const filePath = path.join(memoryDir, file);
        const content = await fs.readFile(filePath, "utf-8");
        const date = extractDate(filePath, content);

        files.push({
          path: `memory/${file}`,
          title: file.replace(".md", ""),
          content,
          date,
          category: "daily-log",
          tags: extractHeaders(content),
        });
      }
    } catch {
      // Directory may not exist
    }

    // Create hash of all content for change detection
    const allContent = files.map((f) => f.content).join("");
    const hash = crypto.createHash("md5").update(allContent).digest("hex");

    return NextResponse.json({ files, hash });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to read memory files", files: [], hash: "" },
      { status: 500 }
    );
  }
}
