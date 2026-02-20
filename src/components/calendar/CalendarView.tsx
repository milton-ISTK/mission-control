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

// --- Dark Obsidian Theme Styles ---
const cellStyles = {
  base: {
    background: "rgba(20, 15, 10, 0.6)",
    backdropFilter: "blur(8px)",
    border: "1px solid rgba(217, 119, 6, 0.18)",
    boxShadow: "0 0 6px rgba(217, 119, 6, 0.06), inset 0 1px 0 rgba(217, 119, 6, 0.04)",
    transition: "box-shadow 0.2s, border-color 0.2s",
  },
  today: {
    background: "rgba(30, 22, 12, 0.75)",
    backdropFilter: "blur(8px)",
    border: "1px solid rgba(245, 158, 11, 0.45)",
    boxShadow: "0 0 14px rgba(245, 158, 11, 0.18), 0 0 4px rgba(245, 158, 11, 0.12), inset 0 1px 0 rgba(245, 158, 11, 0.08)",
  },
  outsideMonth: {
    background: "rgba(12, 10, 8, 0.35)",
    backdropFilter: "blur(4px)",
    border: "1px solid rgba(217, 119, 6, 0.06)",
    boxShadow: "none",
    opacity: 0.4,
  },
} as const;

const gridBorderColor = "rgba(217, 119, 6, 0.10)";

export default function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const [selectedEvent, setSelectedEvent] = useState<CalEvent | null>(null);
  const [selectedCronGroup, setSelectedCronGroup] = useState<CalEvent[] | null>(null);

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

  /** Split a day's events into consolidated cron group + individual events */
  const getProcessedEventsForDay = (day: Date): { cronEvents: CalEvent[]; otherEvents: CalEvent[] } => {
    if (!events) return { cronEvents: [], otherEvents: [] };
    const dayEvents = events.filter((e) => {
      const eventDate = new Date(e.startDate);
      return isSameDay(eventDate, day);
    }) as CalEvent[];

    const cronEvents = dayEvents.filter((e) => e.type === "cron");
    const otherEvents = dayEvents.filter((e) => e.type !== "cron");
    return { cronEvents, otherEvents };
  };

  const handleCronChipClick = (cronEvents: CalEvent[]) => {
    setSelectedEvent(null);
    setSelectedCronGroup(cronEvents);
  };

  const handleEventClick = (evt: CalEvent) => {
    setSelectedCronGroup(null);
    setSelectedEvent(evt);
  };

  const handleClosePanel = () => {
    setSelectedEvent(null);
    setSelectedCronGroup(null);
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
        <div
          className="neu-card-flat p-4 rounded-2xl"
          style={{ background: "rgba(12, 10, 8, 0.45)", border: `1px solid ${gridBorderColor}` }}
        >
          {/* Weekday Headers */}
          <div
            className="grid grid-cols-7 mb-2"
            style={{ gap: "1px", background: gridBorderColor }}
          >
            {weekDays.map((day) => (
              <div
                key={day}
                className="text-center text-xs font-semibold uppercase tracking-wider py-2"
                style={{ color: "rgba(245, 158, 11, 0.55)", background: "rgba(12, 10, 8, 0.7)" }}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Month View */}
          {viewMode === "month" && (
            <div
              className="grid grid-cols-7"
              style={{ gap: "1px", background: gridBorderColor }}
            >
              {days.map((day) => {
                const { cronEvents, otherEvents } = getProcessedEventsForDay(day);
                const inMonth = isSameMonth(day, currentDate);
                const today = isToday(day);
                const style = today
                  ? cellStyles.today
                  : inMonth
                  ? cellStyles.base
                  : cellStyles.outsideMonth;

                // How many non-cron chips to show before "+N more"
                const maxChips = cronEvents.length > 0 ? 2 : 3;

                return (
                  <div
                    key={day.toISOString()}
                    className="min-h-[100px] p-2 rounded-lg"
                    style={style}
                  >
                    <span
                      className={cn(
                        "text-xs font-medium",
                        today
                          ? "font-bold"
                          : ""
                      )}
                      style={{
                        color: today
                          ? "rgb(245, 158, 11)"
                          : inMonth
                          ? "rgba(255, 255, 255, 0.55)"
                          : "rgba(255, 255, 255, 0.3)",
                      }}
                    >
                      {format(day, "d")}
                    </span>
                    <div className="mt-1 flex flex-col gap-0.5">
                      {/* Consolidated cron chip */}
                      {cronEvents.length > 0 && (
                        <button
                          onClick={() => handleCronChipClick(cronEvents)}
                          className="text-[10px] px-1.5 py-0.5 rounded truncate text-left w-full font-medium"
                          style={{
                            background: "rgba(59, 130, 246, 0.15)",
                            color: "rgba(147, 197, 253, 0.95)",
                            border: "1px solid rgba(59, 130, 246, 0.2)",
                          }}
                        >
                          🔄 {cronEvents.length} cron job{cronEvents.length !== 1 ? "s" : ""}
                        </button>
                      )}
                      {/* Individual non-cron events */}
                      {otherEvents.slice(0, maxChips).map((evt) => (
                        <button
                          key={evt._id}
                          onClick={() => handleEventClick(evt)}
                          className="text-[10px] px-1.5 py-0.5 rounded truncate text-left w-full"
                          style={{
                            background:
                              evt.type === "deadline"
                                ? "rgba(239, 68, 68, 0.15)"
                                : "rgba(34, 197, 94, 0.15)",
                            color:
                              evt.type === "deadline"
                                ? "rgba(252, 165, 165, 0.95)"
                                : "rgba(134, 239, 172, 0.95)",
                            border:
                              evt.type === "deadline"
                                ? "1px solid rgba(239, 68, 68, 0.2)"
                                : "1px solid rgba(34, 197, 94, 0.2)",
                          }}
                        >
                          {evt.title}
                        </button>
                      ))}
                      {otherEvents.length > maxChips && (
                        <span className="text-[10px] pl-1" style={{ color: "rgba(255, 255, 255, 0.3)" }}>
                          +{otherEvents.length - maxChips} more
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
            <div
              className="grid grid-cols-7"
              style={{ gap: "2px" }}
            >
              {days.map((day) => {
                const { cronEvents, otherEvents } = getProcessedEventsForDay(day);
                const today = isToday(day);
                const style = today ? cellStyles.today : cellStyles.base;

                return (
                  <div
                    key={day.toISOString()}
                    className="min-h-[300px] p-3 rounded-xl"
                    style={style}
                  >
                    <div className="text-center mb-2">
                      <span className="text-xs" style={{ color: "rgba(245, 158, 11, 0.5)" }}>
                        {format(day, "EEE")}
                      </span>
                      <div
                        className="text-lg font-bold"
                        style={{ color: today ? "rgb(245, 158, 11)" : "rgba(255, 255, 255, 0.85)" }}
                      >
                        {format(day, "d")}
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      {/* Consolidated cron chip */}
                      {cronEvents.length > 0 && (
                        <button
                          onClick={() => handleCronChipClick(cronEvents)}
                          className="text-[11px] px-2 py-1 rounded truncate text-left w-full font-medium"
                          style={{
                            background: "rgba(59, 130, 246, 0.15)",
                            color: "rgba(147, 197, 253, 0.95)",
                            border: "1px solid rgba(59, 130, 246, 0.2)",
                          }}
                        >
                          🔄 {cronEvents.length} cron job{cronEvents.length !== 1 ? "s" : ""}
                        </button>
                      )}
                      {/* Individual non-cron events */}
                      {otherEvents.map((evt) => (
                        <button
                          key={evt._id}
                          onClick={() => handleEventClick(evt)}
                          className="text-[11px] px-2 py-1 rounded truncate text-left w-full"
                          style={{
                            background:
                              evt.type === "deadline"
                                ? "rgba(239, 68, 68, 0.15)"
                                : "rgba(34, 197, 94, 0.15)",
                            color:
                              evt.type === "deadline"
                                ? "rgba(252, 165, 165, 0.95)"
                                : "rgba(134, 239, 172, 0.95)",
                            border:
                              evt.type === "deadline"
                                ? "1px solid rgba(239, 68, 68, 0.2)"
                                : "1px solid rgba(34, 197, 94, 0.2)",
                          }}
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
                const { cronEvents, otherEvents } = getProcessedEventsForDay(currentDate);
                const hasAnything = cronEvents.length > 0 || otherEvents.length > 0;

                if (!hasAnything) {
                  return (
                    <EmptyState
                      title="No events today"
                      description="No events scheduled for this day"
                    />
                  );
                }
                return (
                  <div className="flex flex-col gap-3">
                    {/* Consolidated cron summary card */}
                    {cronEvents.length > 0 && (
                      <button
                        onClick={() => handleCronChipClick(cronEvents)}
                        className="p-4 rounded-xl text-left w-full border-l-4"
                        style={{
                          background: "rgba(20, 15, 10, 0.6)",
                          borderLeftColor: "rgb(59, 130, 246)",
                          border: "1px solid rgba(59, 130, 246, 0.2)",
                          borderLeft: "4px solid rgb(59, 130, 246)",
                          boxShadow: "0 0 8px rgba(59, 130, 246, 0.08)",
                        }}
                      >
                        <h4 className="font-semibold" style={{ color: "rgba(147, 197, 253, 0.95)" }}>
                          🔄 {cronEvents.length} Cron Job{cronEvents.length !== 1 ? "s" : ""}
                        </h4>
                        <p className="text-sm mt-1" style={{ color: "rgba(255, 255, 255, 0.45)" }}>
                          {cronEvents.map((c) => c.title).join(", ")}
                        </p>
                      </button>
                    )}
                    {/* Individual non-cron events */}
                    {otherEvents.map((evt) => (
                      <button
                        key={evt._id}
                        onClick={() => handleEventClick(evt)}
                        className="p-4 rounded-xl text-left w-full"
                        style={{
                          background: "rgba(20, 15, 10, 0.6)",
                          borderLeft:
                            evt.type === "deadline"
                              ? "4px solid rgb(239, 68, 68)"
                              : "4px solid rgb(34, 197, 94)",
                          border:
                            evt.type === "deadline"
                              ? "1px solid rgba(239, 68, 68, 0.2)"
                              : "1px solid rgba(34, 197, 94, 0.2)",
                          boxShadow:
                            evt.type === "deadline"
                              ? "0 0 8px rgba(239, 68, 68, 0.08)"
                              : "0 0 8px rgba(34, 197, 94, 0.08)",
                        }}
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
            <span className="w-3 h-3 rounded" style={{ background: "rgba(59, 130, 246, 0.7)" }} />
            <span className="text-istk-textMuted">Cron Jobs</span>
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
          onClose={handleClosePanel}
        />
      )}

      {/* Cron Group Side Panel */}
      {selectedCronGroup && selectedCronGroup.length > 0 && (
        <EventDetails
          cronGroup={selectedCronGroup}
          onClose={handleClosePanel}
          onSelectEvent={(evt) => {
            setSelectedCronGroup(null);
            setSelectedEvent(evt);
          }}
        />
      )}
    </div>
  );
}
