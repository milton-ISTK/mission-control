"use client";

import { useDroppable } from "@dnd-kit/core";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface TaskColumnProps {
  id: string;
  title: string;
  color: string;
  count: number;
  children: ReactNode;
}

export default function TaskColumn({ id, title, color, count, children }: TaskColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "kanban-column flex flex-col gap-3",
        isOver && "drag-over"
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <h3 className={cn("text-sm font-bold uppercase tracking-wider", color)}>
            {title}
          </h3>
          <span
            className="text-xs text-istk-textDim px-2 py-0.5 rounded-full"
            style={{
              background: "rgba(255,107,0,0.04)",
              border: "1px solid rgba(255,107,0,0.10)",
            }}
          >
            {count}
          </span>
        </div>
      </div>
      <div className="flex flex-col gap-3 flex-1">{children}</div>
    </div>
  );
}
