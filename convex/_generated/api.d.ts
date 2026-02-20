/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as agents from "../agents.js";
import type * as contentPipeline from "../contentPipeline.js";
import type * as dashboard from "../dashboard.js";
import type * as events from "../events.js";
import type * as http from "../http.js";
import type * as memories from "../memories.js";
import type * as subagents from "../subagents.js";
import type * as systemStatus from "../systemStatus.js";
import type * as tasks from "../tasks.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  agents: typeof agents;
  contentPipeline: typeof contentPipeline;
  dashboard: typeof dashboard;
  events: typeof events;
  http: typeof http;
  memories: typeof memories;
  subagents: typeof subagents;
  systemStatus: typeof systemStatus;
  tasks: typeof tasks;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
