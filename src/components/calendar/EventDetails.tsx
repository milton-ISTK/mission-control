"use client";

import { X, Clock, Calendar, Play, Pause, Trash2, RefreshCw, ChevronRight } from "lucide-react";
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

// Union props: either a single event OR a cron group
type EventDetailsProps =
  | {
      event: CalEvent;
      cronGroup?: never;
      onClose: () => void;
      onSelectEvent?: never;
    }
  | {
      event?: never;
      cronGroup: CalEvent[];
      onClose: () => void;
      onSelectEvent: (evt: CalEvent) => void;
    };

export default function EventDetails(props: EventDetailsProps) {
  const { onClose } = props;

  if (props.cronGroup) {
    return <CronGroupPanel cronEvents={props.cronGroup} onClose={onClose} onSelectEvent={props.onSelectEvent} />;
  }

  return <SingleEventPanel event={props.event} onClose={onClose} />;
}

// ─── Cron Group Panel ────────────────────────────────────────────────────────

function CronGroupPanel({
  cronEvents,
  onClose,
  onSelectEvent,
}: {
  cronEvents: CalEvent[];
  onClose: () => void;
  onSelectEvent: (evt: CalEvent) => void;
}) {
  const active = cronEvents.filter((e) => e.status === "active").length;
  const paused = cronEvents.length - active;

  return (
    <div className="w-80 shrink-0 neu-panel flex flex-col gap-5 animate-in slide-in-from-right-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="info">cron summary</Badge>
          </div>
          <h3 className="text-lg font-bold text-istk-text">
            🔄 {cronEvents.length} Cron Job{cronEvents.length !== 1 ? "s" : ""}
          </h3>
          <p className="text-xs text-istk-textMuted mt-1">
            {active} active{paused > 0 ? ` · ${paused} paused` : ""}
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-istk-surfaceLight text-istk-textDim hover:text-istk-text transition-colors shrink-0"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Cron Job List */}
      <div className="flex flex-col gap-2 overflow-y-auto max-h-[60vh]">
        {cronEvents.map((evt) => (
          <button
            key={evt._id}
            onClick={() => onSelectEvent(evt)}
            className="flex items-start gap-3 p-3 rounded-xl text-left w-full transition-colors hover:bg-istk-surfaceLight/50 group"
            style={{
              background: "rgba(20, 15, 10, 0.5)",
              border: "1px solid rgba(59, 130, 246, 0.12)",
            }}
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-semibold text-istk-text truncate">{evt.title}</h4>
                <StatusBadge status={evt.status} />
              </div>
              {evt.description && (
                <p className="text-xs text-istk-textMuted mt-1 line-clamp-2">{evt.description}</p>
              )}
              {evt.schedule && (
                <p className="text-[10px] font-mono mt-1.5" style={{ color: "rgba(147, 197, 253, 0.6)" }}>
                  {evt.schedule}
                </p>
              )}
            </div>
            <ChevronRight className="w-4 h-4 text-istk-textDim shrink-0 mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Single Event Panel ──────────────────────────────────────────────────────

function SingleEventPanel({
  event,
  onClose,
}: {
  event: CalEvent;
  onClose: () => void;
}) {
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
          <div
            className="flex items-center gap-3 p-3 rounded-xl"
            style={{ background: "rgba(20, 15, 10, 0.5)", border: "1px solid rgba(217, 119, 6, 0.12)" }}
          >
            <RefreshCw className="w-4 h-4 text-istk-info shrink-0" />
            <div>
              <p className="text-[10px] text-istk-textDim uppercase tracking-wider">Schedule</p>
              <p className="text-sm font-mono text-istk-text">{event.schedule}</p>
            </div>
          </div>
        )}

        {/* Start Date */}
        <div
          className="flex items-center gap-3 p-3 rounded-xl"
          style={{ background: "rgba(20, 15, 10, 0.5)", border: "1px solid rgba(217, 119, 6, 0.12)" }}
        >
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
          <div
            className="flex items-center gap-3 p-3 rounded-xl"
            style={{ background: "rgba(20, 15, 10, 0.5)", border: "1px solid rgba(217, 119, 6, 0.12)" }}
          >
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
          <div
            className="flex items-center gap-3 p-3 rounded-xl"
            style={{ background: "rgba(20, 15, 10, 0.5)", border: "1px solid rgba(217, 119, 6, 0.12)" }}
          >
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
