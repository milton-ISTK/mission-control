"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

export type TaskStatus = "todo" | "in_progress" | "done";
export type TaskPriority = "critical" | "high" | "medium" | "low";
export type Assignee = "Gregory" | "Milton";

export function useTasks(status?: TaskStatus) {
  return useQuery(api.tasks.listTasks, status ? { status } : {});
}

export function useTask(id: Id<"tasks"> | null | undefined) {
  return useQuery(api.tasks.getTask, id ? { id } : "skip");
}

export function useTasksByAssignee(assignee: Assignee) {
  return useQuery(api.tasks.tasksByAssignee, { assignee });
}

export function useCreateTask() {
  return useMutation(api.tasks.createTask);
}

export function useUpdateTask() {
  return useMutation(api.tasks.updateTask);
}

export function useUpdateTaskStatus() {
  return useMutation(api.tasks.updateTaskStatus);
}

export function useToggleAssignee() {
  return useMutation(api.tasks.toggleAssignee);
}

export function useDeleteTask() {
  return useMutation(api.tasks.deleteTask);
}

// Group tasks by status for Kanban board
export function useTasksByStatus() {
  const allTasks = useTasks();

  if (!allTasks) return undefined;

  const grouped = {
    todo: allTasks
      .filter((t) => t.status === "todo")
      .sort((a, b) => a.order - b.order),
    in_progress: allTasks
      .filter((t) => t.status === "in_progress")
      .sort((a, b) => a.order - b.order),
    done: allTasks
      .filter((t) => t.status === "done")
      .sort((a, b) => a.order - b.order),
  };

  return grouped;
}
