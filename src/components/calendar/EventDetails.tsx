"use client";

import { X, Clock, Calendar, Play, Pause, Trash2, RefreshCw } from "lucide-react";
import Badge, { StatusBadge } from "@/components/common/Badge";
import Button from "@/components/common/Button";
import { useToggleEventStatus, useDeleteEvent } from "@/hooks/useEvents";
import { formatDate, formatTime, cn } from "@/lib/utils";
import { Id } from "../../../convex/_generated/dataModel";

interface CalEvent {
  _id: Id<"events">;
  title: string;
  description?: string;
  type: "cron" | "deadline" | "oneshot";
  schedule?: string;
  startDate: string;
  endDate?: string;
  lastRun?: string;
  nextRun?: string;
  status: string;
  color?: string;
  createdAt: string;
}

interface EventDetailsProps {
  event: CalEvent;
  onClose: () => void;
}

export default function EventDetails({ event, onClose }: EventDetailsProps) {
  const toggleStatus = useToggleEventStatus();
  const deleteEvent = useDeleteEvent();

  const handleToggle = async () => {
    await toggleStatus({ id: event._id });
  };

  const handleDelete = async () => {
    if (confirm("Delete this event?")) {
      await deleteEvent({ id: event._id });
      onClose();
    }
  };

  const typeColors = {
    cron: "text-istk-info",
    deadline: "text-istk-danger",
    oneshot: "text-istk-success",
  };

  const typeBg = {
    cron: "bg-istk-info/10 border-istk-info/20",
    deadline: "bg-istk-danger/10 border-istk-danger/20",
    oneshot: "bg-istk-success/10 border-istk-success/20",
  };

  return (
    <div className="w-80 shrink-0 neu-panel flex flex-col gap-5 animate-in slide-in-from-right-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <Badge
              variant={
                event.type === "cron"
                  ? "info"
                  : event.type === "deadline"
                  ? "critical"
                  : "success"
              }
            >
              {event.type}
            </Badge>
            <StatusBadge status={event.status} />
          </div>
          <h3 className="text-lg font-bold text-istk-text truncate">{event.title}</h3>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-istk-surfaceLight text-istk-textDim hover:text-istk-text transition-colors shrink-0"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Description */}
      {event.description && (
        <p className="text-sm text-istk-textMuted">{event.description}</p>
      )}

      {/* Details */}
      <div className="flex flex-col gap-3">
        {/* Schedule */}
        {event.schedule && (
          <div className="flex items-center gap-3 p-3 rounded-xl bg-istk-bg border border-istk-border/20">
            <RefreshCw className="w-4 h-4 text-istk-info shrink-0" />
            <div>
              <p className="text-[10px] text-istk-textDim uppercase tracking-wider">Schedule</p>
              <p className="text-sm font-mono text-istk-text">{event.schedule}</p>
            </div>
          </div>
        )}

        {/* Start Date */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-istk-bg border border-istk-border/20">
          <Calendar className="w-4 h-4 text-istk-accent shrink-0" />
          <div>
            <p className="text-[10px] text-istk-textDim uppercase tracking-wider">Start Date</p>
            <p className="text-sm text-istk-text">
              {formatDate(event.startDate)} · {formatTime(event.startDate)}
            </p>
          </div>
        </div>

        {/* Last Run */}
        {event.lastRun && (
          <div className="flex items-center gap-3 p-3 rounded-xl bg-istk-bg border border-istk-border/20">
            <Clock className="w-4 h-4 text-istk-success shrink-0" />
            <div>
              <p className="text-[10px] text-istk-textDim uppercase tracking-wider">Last Run</p>
              <p className="text-sm text-istk-text">
                {formatDate(event.lastRun)} · {formatTime(event.lastRun)}
              </p>
            </div>
          </div>
        )}

        {/* Next Run */}
        {event.nextRun && (
          <div className="flex items-center gap-3 p-3 rounded-xl bg-istk-bg border border-istk-border/20">
            <Clock className="w-4 h-4 text-istk-warning shrink-0" />
            <div>
              <p className="text-[10px] text-istk-textDim uppercase tracking-wider">Next Run</p>
              <p className="text-sm text-istk-text">
                {formatDate(event.nextRun)} · {formatTime(event.nextRun)}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-2 mt-auto pt-4 border-t border-istk-border/20">
        <Button
          variant="default"
          onClick={handleToggle}
          className="w-full justify-center"
        >
          <span className="flex items-center gap-2">
            {event.status === "active" ? (
              <>
                <Pause className="w-4 h-4" />
                Pause Event
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Resume Event
              </>
            )}
          </span>
        </Button>
        <Button
          variant="danger"
          onClick={handleDelete}
          className="w-full justify-center"
        >
          <span className="flex items-center gap-2">
            <Trash2 className="w-4 h-4" />
            Delete Event
          </span>
        </Button>
      </div>
    </div>
  );
}
