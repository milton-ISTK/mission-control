"use client";

import { useState } from "react";
import { Plus, Clock, AlertCircle, Zap } from "lucide-react";
import CalendarView from "@/components/calendar/CalendarView";
import CronPoller from "@/components/calendar/CronPoller";
import Button from "@/components/common/Button";
import Modal from "@/components/common/Modal";
import { Input, Select, Textarea } from "@/components/common/Input";
import { useCreateEvent, useActiveCrons } from "@/hooks/useEvents";
import Badge from "@/components/common/Badge";

const EVENT_TYPE_OPTIONS = [
  { value: "oneshot", label: "One-time Event" },
  { value: "deadline", label: "Deadline" },
  { value: "cron", label: "Cron Job" },
];

export default function CalendarPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const createEvent = useCreateEvent();
  const activeCrons = useActiveCrons();

  const [form, setForm] = useState({
    title: "",
    description: "",
    type: "oneshot" as "oneshot" | "deadline" | "cron",
    startDate: "",
    schedule: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.startDate) return;

    setIsSubmitting(true);
    try {
      await createEvent({
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        type: form.type,
        startDate: new Date(form.startDate).toISOString(),
        schedule: form.type === "cron" ? form.schedule : undefined,
      });
      setForm({ title: "", description: "", type: "oneshot", startDate: "", schedule: "" });
      setModalOpen(false);
    } catch (err) {
      console.error("Failed to create event:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const cronCount = activeCrons?.length ?? 0;

  return (
    <div className="flex flex-col gap-6">
      {/* Header Bar */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-4">
          {cronCount > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-istk-info/10 border border-istk-info/20">
              <Clock className="w-4 h-4 text-istk-info" />
              <span className="text-xs font-medium text-istk-info">
                {cronCount} active cron{cronCount !== 1 ? "s" : ""}
              </span>
            </div>
          )}
        </div>
        <Button variant="accent" onClick={() => setModalOpen(true)}>
          <span className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Quick Event
          </span>
        </Button>
      </div>

      {/* Calendar + Cron Poller */}
      <CronPoller />
      <CalendarView />

      {/* Quick Event Creation Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Create Event"
        size="md"
      >
        <form onSubmit={handleCreate} className="flex flex-col gap-4">
          <Input
            label="Title"
            placeholder="Event title..."
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            autoFocus
          />

          <Select
            label="Type"
            options={EVENT_TYPE_OPTIONS}
            value={form.type}
            onChange={(e: any) => setForm({ ...form, type: e.target.value })}
          />

          <Input
            label="Date & Time"
            type="datetime-local"
            value={form.startDate}
            onChange={(e) => setForm({ ...form, startDate: e.target.value })}
          />

          {form.type === "cron" && (
            <Input
              label="Cron Schedule"
              placeholder="*/30 * * * * (every 30 minutes)"
              value={form.schedule}
              onChange={(e) => setForm({ ...form, schedule: e.target.value })}
            />
          )}

          <Textarea
            label="Description (optional)"
            placeholder="Details about this event..."
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />

          <div className="flex gap-3 justify-end mt-2">
            <Button variant="ghost" type="button" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="accent" type="submit" isLoading={isSubmitting}>
              Create Event
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
