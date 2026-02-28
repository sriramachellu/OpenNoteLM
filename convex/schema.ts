import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';
import { rateLimitTables } from "convex-helpers/server/rateLimit";

export default defineSchema({
    ...rateLimitTables,
    sessions: defineTable({
        sessionId: v.string(),   // UUID from sessionStorage
        userName: v.optional(v.string()),
        createdAt: v.number(),
        lastActiveAt: v.number(),
    }).index('by_sessionId', ['sessionId']),
    notebooks: defineTable({
        title: v.string(),
        sessionId: v.string(),
        isStarred: v.optional(v.boolean()),
        createdAt: v.number(),
        studioConfig: v.optional(v.any()), // Map of actionTitle -> customPrompt
    }).index("by_sessionId", ["sessionId"]),
    documents: defineTable({
        sessionId: v.string(),
        notebookId: v.optional(v.id("notebooks")), // Optional for migration
        filename: v.string(),
        type: v.optional(v.string()), // "pdf", "web", "youtube"
        pageCount: v.number(),
        markdownContent: v.string(),
        storageId: v.optional(v.string()),
        isEmbedded: v.boolean(),
        createdAt: v.number(),
        sourceMetadata: v.optional(v.any()), // URL, etc.
    }).index("by_sessionId", ["sessionId"])
        .index("by_notebookId", ["notebookId"]),
    chunks: defineTable({
        documentId: v.id('documents'),
        sessionId: v.optional(v.string()), // Added for session isolation/dedup
        chunkText: v.string(),
        chunkIndex: v.number(),
        embedding: v.array(v.float64()),
        pageNumber: v.optional(v.number()),
        charRange: v.optional(v.any()), // { start, end }
        hash: v.optional(v.string()), // SHA-256 hash for deduplication
    }).index('by_documentId', ['documentId'])
        .index('by_sessionId_hash', ['sessionId', 'hash'])
        .vectorIndex('by_embedding', {
            vectorField: 'embedding',
            dimensions: 768,  // Google text-embedding-004
            filterFields: ['documentId', 'sessionId'],
        })
        .searchIndex('search_body', {
            searchField: 'chunkText',
            filterFields: ['documentId', 'sessionId'],
        }),
    messages: defineTable({
        sessionId: v.string(),
        notebookId: v.optional(v.id("notebooks")), // Optional for migration
        documentId: v.optional(v.id("documents")),
        role: v.union(v.literal("user"), v.literal("assistant")),
        content: v.string(),
        isStreaming: v.boolean(),
        streamId: v.optional(v.string()),
        tokenCount: v.optional(v.number()),
        latencyMs: v.optional(v.number()),
        citations: v.optional(v.any()), // Map of [n] -> source info
        createdAt: v.number(),
    }).index("by_sessionId", ["sessionId"])
        .index("by_notebookId", ["notebookId"])
        .index("by_streamId", ["streamId"]),
    notes: defineTable({
        sessionId: v.string(),
        notebookId: v.id("notebooks"),
        type: v.string(), // e.g., "Quiz", "Flashcard", "Mind Map"
        title: v.string(),
        content: v.string(),
        createdAt: v.number(),
    }).index("by_sessionId", ["sessionId"])
        .index("by_notebookId", ["notebookId"]),
});
