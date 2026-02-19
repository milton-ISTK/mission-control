"use client";

import { useState, useCallback } from "react";
import {
  DndContext,
  DragOverlay,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Plus } from "lucide-react";
import { useTasksByStatus, useUpdateTaskStatus, TaskStatus } from "@/hooks/useTasks";
import TaskColumn from "./TaskColumn";
import TaskCard from "./TaskCard";
import TaskModal from "./TaskModal";
import Button from "@/components/common/Button";
import { PageLoader } from "@/components/common/LoadingSpinner";
import { Id } from "../../../convex/_generated/dataModel";

const columns: { id: TaskStatus; title: string; color: string }[] = [
  { id: "todo", title: "To Do", color: "text-istk-info" },
  { id: "in_progress", title: "In Progress", color: "text-istk-warning" },
  { id: "done", title: "Done", color: "text-istk-success" },
];

export default function TasksBoard() {
  const tasksByStatus = useTasksByStatus();
  const updateTaskStatus = useUpdateTaskStatus();
  const [modalOpen, setModalOpen] = useState(false);
  const [editTaskId, setEditTaskId] = useState<Id<"tasks"> | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor)
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  }, []);

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveId(null);

      if (!over) return;

      const taskId = active.id as string;
      const overId = over.id as string;

      // Determine target column
      let targetStatus: TaskStatus | undefined;

      // Check if dropped on a column directly
      if (["todo", "in_progress", "done"].includes(overId)) {
        targetStatus = overId as TaskStatus;
      } else {
        // Dropped on another card — find what column it's in
        if (!tasksByStatus) return;
        for (const [status, tasks] of Object.entries(tasksByStatus)) {
          if (tasks.some((t) => t._id === overId)) {
            targetStatus = status as TaskStatus;
            break;
          }
        }
      }

      if (!targetStatus) return;

      // Find the current task
      if (!tasksByStatus) return;
      let currentTask = null;
      for (const tasks of Object.values(tasksByStatus)) {
        currentTask = tasks.find((t) => t._id === taskId);
        if (currentTask) break;
      }

      if (!currentTask || currentTask.status === targetStatus) return;

      // Calculate new order (append to end of target column)
      const targetTasks = tasksByStatus[targetStatus] || [];
      const newOrder =
        targetTasks.length > 0
          ? Math.max(...targetTasks.map((t) => t.order)) + 1
          : 0;

      try {
        await updateTaskStatus({
          id: taskId as Id<"tasks">,
          status: targetStatus,
          order: newOrder,
        });
      } catch (err) {
        console.error("Failed to update task status:", err);
      }
    },
    [tasksByStatus, updateTaskStatus]
  );

  const handleEditTask = useCallback((taskId: Id<"tasks">) => {
    setEditTaskId(taskId);
    setModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setModalOpen(false);
    setEditTaskId(null);
  }, []);

  if (!tasksByStatus) {
    return <PageLoader label="Loading tasks..." />;
  }

  // Find the active task for the drag overlay
  let activeTask = null;
  if (activeId && tasksByStatus) {
    for (const tasks of Object.values(tasksByStatus)) {
      activeTask = tasks.find((t) => t._id === activeId);
      if (activeTask) break;
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-istk-text">Task Board</h1>
          <p className="text-sm text-istk-textMuted mt-1">
            Drag and drop tasks between columns to update status
          </p>
        </div>
        <Button variant="accent" onClick={() => setModalOpen(true)}>
          <span className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Task
          </span>
        </Button>
      </div>

      {/* Kanban Columns */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {columns.map((col) => {
            const tasks = tasksByStatus[col.id] || [];
            return (
              <TaskColumn
                key={col.id}
                id={col.id}
                title={col.title}
                color={col.color}
                count={tasks.length}
              >
                <SortableContext
                  items={tasks.map((t) => t._id)}
                  strategy={verticalListSortingStrategy}
                >
                  {tasks.map((task) => (
                    <TaskCard
                      key={task._id}
                      task={task}
                      onEdit={() => handleEditTask(task._id)}
                    />
                  ))}
                </SortableContext>
              </TaskColumn>
            );
          })}
        </div>

        <DragOverlay>
          {activeTask ? (
            <div className="opacity-80 rotate-2">
              <TaskCard task={activeTask} onEdit={() => {}} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Task Modal */}
      <TaskModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        editTaskId={editTaskId}
      />
    </div>
  );
}
