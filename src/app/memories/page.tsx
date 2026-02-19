"use client";

import { useMemo } from "react";
import { Brain, Database } from "lucide-react";
import MemoryScreen from "@/components/memory/MemoryScreen";
import { useMemories } from "@/hooks/useMemories";
import Badge from "@/components/common/Badge";

export default function MemoriesPage() {
  const memories = useMemories();

  const stats = useMemo(() => {
    if (!memories) return null;
    const today = new Date().toISOString().split("T")[0];
    const todayCount = memories.filter((m) => m.date === today).length;
    const categories = new Set(memories.map((m) => m.category).filter(Boolean));
    return {
      total: memories.length,
      today: todayCount,
      categories: categories.size,
    };
  }, [memories]);

  return (
    <div className="flex flex-col gap-6">
      {/* Stats Bar */}
      {stats && (
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-istk-textDim" />
            <span className="text-sm text-istk-textMuted">Total:</span>
            <Badge variant="default">{stats.total}</Badge>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-istk-textMuted">Today:</span>
            <Badge variant="success">{stats.today}</Badge>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-istk-textMuted">Categories:</span>
            <Badge variant="purple">{stats.categories}</Badge>
          </div>
        </div>
      )}

      {/* Memory Screen */}
      <MemoryScreen />
    </div>
  );
}
