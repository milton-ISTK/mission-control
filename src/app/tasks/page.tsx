"use client";

import { useMemo } from "react";
import { useTasks } from "@/hooks/useTasks";
import TasksBoard from "@/components/tasks/TasksBoard";
import Badge from "@/components/common/Badge";

export default function TasksPage() {
  const allTasks = useTasks();

  const counts = useMemo(() => {
    if (!allTasks) return null;
    return {
      total: allTasks.length,
      todo: allTasks.filter((t) => t.status === "todo").length,
      inProgress: allTasks.filter((t) => t.status === "in_progress").length,
      done: allTasks.filter((t) => t.status === "done").length,
    };
  }, [allTasks]);

  return (
    <div className="flex flex-col gap-6">
      {/* Stats Bar */}
      {counts && (
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-sm text-istk-textMuted">Total:</span>
            <Badge variant="default">{counts.total}</Badge>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-istk-textMuted">Active:</span>
            <Badge variant="warning">{counts.todo + counts.inProgress}</Badge>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-istk-textMuted">Completed:</span>
            <Badge variant="success">{counts.done}</Badge>
          </div>
        </div>
      )}

      {/* Kanban Board */}
      <TasksBoard />
    </div>
  );
}
