"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Pencil, Trash2, Calendar } from "lucide-react";
import { cn, formatRelative } from "@/lib/utils";
import { PriorityBadge } from "@/components/common/Badge";
import { useDeleteTask, useToggleAssignee } from "@/hooks/useTasks";
import { Id } from "../../../convex/_generated/dataModel";

interface Task {
  _id: Id<"tasks">;
  title: string;
  description?: string;
  status: string;
  priority: string;
  assignee: string;
  dueDate?: string;
  tags?: string[];
  order: number;
  createdAt: string;
  updatedAt: string;
}

interface TaskCardProps {
  task: Task;
  onEdit: () => void;
}

export default function TaskCard({ task, onEdit }: TaskCardProps) {
  const deleteTask = useDeleteTask();
  const toggleAssignee = useToggleAssignee();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Delete this task?")) {
      await deleteTask({ id: task._id });
    }
  };

  const handleToggleAssignee = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await toggleAssignee({ id: task._id });
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "neu-card p-4 cursor-grab active:cursor-grabbing group",
        isDragging && "opacity-50 scale-105 shadow-neu-lg"
      )}
    >
      {/* Top Row: Grip + Actions */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <button
            className="text-istk-textDim hover:text-istk-textMuted shrink-0 cursor-grab"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="w-4 h-4" />
          </button>
          <h4 className="text-sm font-semibold text-istk-text truncate">
            {task.title}
          </h4>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <button
            onClick={onEdit}
            className="p-1.5 rounded-lg hover:bg-istk-surfaceLight text-istk-textDim hover:text-istk-text transition-colors"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleDelete}
            className="p-1.5 rounded-lg hover:bg-istk-danger/10 text-istk-textDim hover:text-istk-danger transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Description */}
      {task.description && (
        <p className="text-xs text-istk-textMuted mb-3 line-clamp-2 pl-6">
          {task.description}
        </p>
      )}

      {/* Tags */}
      {task.tags && task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3 pl-6">
          {task.tags.map((tag) => (
            <span
              key={tag}
              className="text-[10px] px-1.5 py-0.5 rounded bg-istk-surfaceLight text-istk-textDim"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Footer: Priority + Assignee + Due Date */}
      <div className="flex items-center justify-between pl-6">
        <div className="flex items-center gap-2">
          <PriorityBadge priority={task.priority} />
          <button
            onClick={handleToggleAssignee}
            className={cn(
              "text-[10px] px-2 py-0.5 rounded-full font-medium transition-colors",
              task.assignee === "Gregory"
                ? "bg-istk-purple/20 text-istk-purple hover:bg-istk-purple/30"
                : "bg-istk-accent/20 text-istk-accent hover:bg-istk-accent/30"
            )}
          >
            {task.assignee}
          </button>
        </div>
        {task.dueDate && (
          <div className="flex items-center gap-1 text-[10px] text-istk-textDim">
            <Calendar className="w-3 h-3" />
            {task.dueDate}
          </div>
        )}
      </div>
    </div>
  );
}
