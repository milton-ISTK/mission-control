"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

export type EventType = "cron" | "deadline" | "oneshot";

export function useEvents(type?: EventType) {
  return useQuery(api.events.listEvents, type ? { type } : {});
}

export function useCalendarEvents(startDate: string, endDate: string) {
  return useQuery(api.events.getCalendarEvents, { startDate, endDate });
}

export function useActiveCrons() {
  return useQuery(api.events.getActiveCrons);
}

export function useCreateEvent() {
  return useMutation(api.events.createEvent);
}

export function useSyncCronEvent() {
  return useMutation(api.events.syncCronEvent);
}

export function useToggleEventStatus() {
  return useMutation(api.events.toggleEventStatus);
}

export function useDeleteEvent() {
  return useMutation(api.events.deleteEvent);
}
