"use client";

import { useState, useMemo } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
  startOfDay,
  addDays,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCalendarEvents, useActiveCrons } from "@/hooks/useEvents";
import Button from "@/components/common/Button";
import { PageLoader } from "@/components/common/LoadingSpinner";
import EmptyState from "@/components/common/EmptyState";
import EventDetails from "./EventDetails";
import { cn, eventTypeColors } from "@/lib/utils";
import { Id } from "../../../convex/_generated/dataModel";

type ViewMode = "month" | "week" | "day";

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

export default function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const [selectedEvent, setSelectedEvent] = useState<CalEvent | null>(null);

  // Calculate date range for the current view
  const dateRange = useMemo(() => {
    if (viewMode === "month") {
      const monthStart = startOfMonth(currentDate);
      const monthEnd = endOfMonth(currentDate);
      const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
      const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
      return { start: calStart, end: calEnd };
    } else if (viewMode === "week") {
      const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
      const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
      return { start: weekStart, end: weekEnd };
    } else {
      return { start: startOfDay(currentDate), end: addDays(startOfDay(currentDate), 1) };
    }
  }, [currentDate, viewMode]);

  const events = useCalendarEvents(
    dateRange.start.toISOString(),
    dateRange.end.toISOString()
  );
  const activeCrons = useActiveCrons();

  const days = useMemo(() => {
    return eachDayOfInterval({ start: dateRange.start, end: dateRange.end });
  }, [dateRange]);

  const navigate = (direction: "prev" | "next") => {
    if (viewMode === "month") {
      setCurrentDate(direction === "prev" ? subMonths(currentDate, 1) : addMonths(currentDate, 1));
    } else if (viewMode === "week") {
      setCurrentDate(direction === "prev" ? addDays(currentDate, -7) : addDays(currentDate, 7));
    } else {
      setCurrentDate(direction === "prev" ? addDays(currentDate, -1) : addDays(currentDate, 1));
    }
  };

  const getEventsForDay = (day: Date): CalEvent[] => {
    if (!events) return [];
    return events.filter((e) => {
      const eventDate = new Date(e.startDate);
      return isSameDay(eventDate, day);
    }) as CalEvent[];
  };

  const eventClass = (type: string) => {
    switch (type) {
      case "cron":
        return "cal-event-cron";
      case "deadline":
        return "cal-event-deadline";
      case "oneshot":
        return "cal-event-oneshot";
      default:
        return "cal-event-cron";
    }
  };

  if (events === undefined) {
    return <PageLoader label="Loading calendar..." />;
  }

  const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <div className="flex gap-6">
      {/* Main Calendar */}
      <div className="flex-1 flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-istk-text">
              {format(currentDate, viewMode === "day" ? "EEEE, d MMMM yyyy" : "MMMM yyyy")}
            </h2>
            <div className="flex items-center gap-1">
              <button
                onClick={() => navigate("prev")}
                className="p-2 rounded-lg hover:bg-istk-surfaceLight text-istk-textMuted hover:text-istk-text transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => setCurrentDate(new Date())}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-istk-textMuted hover:text-istk-text hover:bg-istk-surfaceLight transition-colors"
              >
                Today
              </button>
              <button
                onClick={() => navigate("next")}
                className="p-2 rounded-lg hover:bg-istk-surfaceLight text-istk-textMuted hover:text-istk-text transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-1 bg-istk-bg rounded-xl p-1 shadow-neu-inset-sm">
            {(["month", "week", "day"] as ViewMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={cn(
                  "px-4 py-1.5 rounded-lg text-xs font-medium transition-all",
                  viewMode === mode
                    ? "bg-istk-accent text-white shadow-neu-sm"
                    : "text-istk-textMuted hover:text-istk-text"
                )}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="neu-card-flat p-4">
          {/* Weekday Headers */}
          <div className="grid grid-cols-7 gap-px mb-2">
            {weekDays.map((day) => (
              <div
                key={day}
                className="text-center text-xs font-semibold text-istk-textDim uppercase tracking-wider py-2"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Day Cells */}
          {viewMode === "month" && (
            <div className="grid grid-cols-7 gap-px">
              {days.map((day) => {
                const dayEvents = getEventsForDay(day);
                const inMonth = isSameMonth(day, currentDate);
                const today = isToday(day);

                return (
                  <div
                    key={day.toISOString()}
                    className={cn(
                      "min-h-[100px] p-2 rounded-lg border border-istk-border/10 transition-colors",
                      inMonth
                        ? "bg-istk-surface/50"
                        : "bg-istk-bg/30 opacity-40",
                      today && "ring-1 ring-istk-accent/40"
                    )}
                  >
                    <span
                      className={cn(
                        "text-xs font-medium",
                        today
                          ? "text-istk-accent font-bold"
                          : inMonth
                          ? "text-istk-textMuted"
                          : "text-istk-textDim"
                      )}
                    >
                      {format(day, "d")}
                    </span>
                    <div className="mt-1 flex flex-col gap-0.5">
                      {dayEvents.slice(0, 3).map((evt) => (
                        <button
                          key={evt._id}
                          onClick={() => setSelectedEvent(evt)}
                          className={cn(
                            "text-[10px] px-1.5 py-0.5 rounded truncate text-left w-full",
                            eventClass(evt.type)
                          )}
                        >
                          {evt.title}
                        </button>
                      ))}
                      {dayEvents.length > 3 && (
                        <span className="text-[10px] text-istk-textDim pl-1">
                          +{dayEvents.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Week View */}
          {viewMode === "week" && (
            <div className="grid grid-cols-7 gap-2">
              {days.map((day) => {
                const dayEvents = getEventsForDay(day);
                const today = isToday(day);

                return (
                  <div
                    key={day.toISOString()}
                    className={cn(
                      "min-h-[300px] p-3 rounded-xl border border-istk-border/10 bg-istk-surface/50",
                      today && "ring-1 ring-istk-accent/40"
                    )}
                  >
                    <div className="text-center mb-2">
                      <span className="text-xs text-istk-textDim">{format(day, "EEE")}</span>
                      <div
                        className={cn(
                          "text-lg font-bold",
                          today ? "text-istk-accent" : "text-istk-text"
                        )}
                      >
                        {format(day, "d")}
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      {dayEvents.map((evt) => (
                        <button
                          key={evt._id}
                          onClick={() => setSelectedEvent(evt)}
                          className={cn(
                            "text-[11px] px-2 py-1 rounded truncate text-left w-full",
                            eventClass(evt.type)
                          )}
                        >
                          {evt.title}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Day View */}
          {viewMode === "day" && (
            <div className="min-h-[400px] p-4">
              {(() => {
                const dayEvents = getEventsForDay(currentDate);
                if (dayEvents.length === 0) {
                  return (
                    <EmptyState
                      title="No events today"
                      description="No events scheduled for this day"
                    />
                  );
                }
                return (
                  <div className="flex flex-col gap-3">
                    {dayEvents.map((evt) => (
                      <button
                        key={evt._id}
                        onClick={() => setSelectedEvent(evt)}
                        className={cn(
                          "p-4 rounded-xl text-left w-full border-l-4 bg-istk-surface/80",
                          evt.type === "cron"
                            ? "border-istk-info"
                            : evt.type === "deadline"
                            ? "border-istk-danger"
                            : "border-istk-success"
                        )}
                      >
                        <h4 className="font-semibold text-istk-text">{evt.title}</h4>
                        {evt.description && (
                          <p className="text-sm text-istk-textMuted mt-1">{evt.description}</p>
                        )}
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-xs text-istk-textDim capitalize">{evt.type}</span>
                          {evt.schedule && (
                            <span className="text-xs font-mono text-istk-textDim">{evt.schedule}</span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                );
              })()}
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-6 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-istk-info" />
            <span className="text-istk-textMuted">Cron Job</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-istk-danger" />
            <span className="text-istk-textMuted">Deadline</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-istk-success" />
            <span className="text-istk-textMuted">One-shot</span>
          </div>
        </div>
      </div>

      {/* Event Details Side Panel */}
      {selectedEvent && (
        <EventDetails
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
        />
      )}
    </div>
  );
}
