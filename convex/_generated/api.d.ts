/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as actions_callGemini from "../actions/callGemini.js";
import type * as actions_chunkDocument from "../actions/chunkDocument.js";
import type * as actions_embedDocument from "../actions/embedDocument.js";
import type * as mutations from "../mutations.js";
import type * as queries from "../queries.js";
import type * as rateLimiter from "../rateLimiter.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  "actions/callGemini": typeof actions_callGemini;
  "actions/chunkDocument": typeof actions_chunkDocument;
  "actions/embedDocument": typeof actions_embedDocument;
  mutations: typeof mutations;
  queries: typeof queries;
  rateLimiter: typeof rateLimiter;
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
