"use client";

import { useState, useEffect, FormEvent } from "react";
import Modal from "@/components/common/Modal";
import { Input, Textarea, Select } from "@/components/common/Input";
import Button from "@/components/common/Button";
import { useCreateTask, useUpdateTask, useTask } from "@/hooks/useTasks";
import { Id } from "../../../convex/_generated/dataModel";

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  editTaskId?: Id<"tasks"> | null;
}

const priorityOptions = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "critical", label: "Critical" },
];

const assigneeOptions = [
  { value: "Gregory", label: "Gregory" },
  { value: "Milton", label: "Milton" },
];

export default function TaskModal({ isOpen, onClose, editTaskId }: TaskModalProps) {
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const existingTask = editTaskId ? useTask(editTaskId) : null;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<string>("medium");
  const [assignee, setAssignee] = useState<string>("Gregory");
  const [dueDate, setDueDate] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isEditing = !!editTaskId;

  // Populate form when editing
  useEffect(() => {
    if (existingTask && isEditing) {
      setTitle((existingTask?.title) || "");
      setDescription((existingTask?.description) || "");
      setPriority((existingTask?.priority) || "medium");
      setAssignee((existingTask?.assignee) || "Gregory");
      setDueDate((existingTask?.dueDate) || "");
      setTagsInput(Array.isArray(existingTask?.tags) ? existingTask.tags.join(", ") : "");
    } else if (!isEditing) {
      resetForm();
    }
  }, [existingTask, isEditing]);

  function resetForm() {
    setTitle("");
    setDescription("");
    setPriority("medium");
    setAssignee("Gregory");
    setDueDate("");
    setTagsInput("");
    setErrors({});
  }

  function validate(): boolean {
    const newErrors: Record<string, string> = {};
    if (!title.trim()) {
      newErrors.title = "Title is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    try {
      if (isEditing && editTaskId) {
        await updateTask({
          id: editTaskId,
          title: title.trim(),
          description: description.trim() || undefined,
          priority: priority as "critical" | "high" | "medium" | "low",
          assignee: assignee as "Gregory" | "Milton",
          dueDate: dueDate || undefined,
          tags,
        });
      } else {
        await createTask({
          title: title.trim(),
          description: description.trim() || undefined,
          priority: priority as "critical" | "high" | "medium" | "low",
          assignee: assignee as "Gregory" | "Milton",
          dueDate: dueDate || undefined,
          tags,
        });
      }

      resetForm();
      onClose();
    } catch (err) {
      console.error("Failed to save task:", err);
      setErrors({ submit: "Failed to save task. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Edit Task" : "Create New Task"}
      size="md"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Title"
          placeholder="What needs to be done?"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          error={errors.title}
          autoFocus
        />

        <Textarea
          label="Description"
          placeholder="Add details..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Priority"
            options={priorityOptions}
            value={priority}
            onChange={(e: any) => setPriority(e.target.value)}
          />
          <Select
            label="Assignee"
            options={assigneeOptions}
            value={assignee}
            onChange={(e: any) => setAssignee(e.target.value)}
          />
        </div>

        <Input
          label="Due Date"
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />

        <Input
          label="Tags"
          placeholder="Comma-separated: design, frontend, urgent"
          value={tagsInput}
          onChange={(e) => setTagsInput(e.target.value)}
        />

        {errors.submit && (
          <p className="text-sm text-istk-danger">{errors.submit}</p>
        )}

        <div className="flex items-center justify-end gap-3 mt-2">
          <Button variant="ghost" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="accent" type="submit" isLoading={isSubmitting}>
            {isEditing ? "Update Task" : "Create Task"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
