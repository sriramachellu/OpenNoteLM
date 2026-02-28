import { query } from "./_generated/server";
import { v } from "convex/values";

export const getSession = query({
    args: { sessionId: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("sessions")
            .withIndex("by_sessionId", (q) => q.eq("sessionId", args.sessionId))
            .first();
    },
});

export const getNotebooks = query({
    args: { sessionId: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("notebooks")
            .withIndex("by_sessionId", (q) => q.eq("sessionId", args.sessionId))
            .order("desc")
            .collect();
    },
});

export const getNotebook = query({
    args: { notebookId: v.id("notebooks") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.notebookId);
    },
});

export const getDocuments = query({
    args: { notebookId: v.id("notebooks") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("documents")
            .withIndex("by_notebookId", (q) => q.eq("notebookId", args.notebookId))
            .order("desc")
            .collect();
    },
});

export const getMessages = query({
    args: { notebookId: v.id("notebooks") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("messages")
            .withIndex("by_notebookId", (q) => q.eq("notebookId", args.notebookId))
            .order("asc")
            .collect();
    },
});

export const getNotes = query({
    args: { notebookId: v.id("notebooks") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("notes")
            .withIndex("by_notebookId", (q) => q.eq("notebookId", args.notebookId))
            .order("desc")
            .collect();
    },
});

export const getChunksByIds = query({
    args: { chunkIds: v.array(v.id("chunks")) },
    handler: async (ctx, args) => {
        const enrichedChunks = [];
        for (const id of args.chunkIds) {
            const chunk = await ctx.db.get(id);
            if (chunk) {
                const doc = await ctx.db.get(chunk.documentId);
                enrichedChunks.push({
                    ...chunk,
                    filename: doc?.filename || "Unknown Source"
                });
            }
        }
        return enrichedChunks;
    },
});

export const getChunkWithDoc = query({
    args: { chunkId: v.id("chunks") },
    handler: async (ctx, args) => {
        const chunk = await ctx.db.get(args.chunkId);
        if (!chunk) return null;
        const doc = await ctx.db.get(chunk.documentId);
        return {
            ...chunk,
            notebookId: doc?.notebookId,
            filename: doc?.filename || "Unknown",
            pageNumber: chunk.pageNumber,
        };
    },
});
export const getFileUrl = query({
    args: { storageId: v.string() },
    handler: async (ctx, args) => {
        return await ctx.storage.getUrl(args.storageId);
    },
});

export const checkDuplicateChunks = query({
    args: {
        sessionId: v.string(),
        hashes: v.array(v.string())
    },
    handler: async (ctx, args) => {
        const results = [];
        for (const hash of args.hashes) {
            const existing = await ctx.db
                .query("chunks")
                .withIndex("by_sessionId_hash", q => q.eq("sessionId", args.sessionId).eq("hash", hash))
                .first();
            if (existing) {
                results.push({ hash, embedding: existing.embedding });
            }
        }
        return results;
    }
});

export const searchChunksText = query({
    args: {
        sessionId: v.string(),
        query: v.string(),
        limit: v.number()
    },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("chunks")
            .withSearchIndex("search_body", q => q.search("chunkText", args.query).eq("sessionId", args.sessionId))
            .take(args.limit);
    }
});
