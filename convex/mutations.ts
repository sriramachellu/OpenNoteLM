import { mutation, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { rateLimit } from "./rateLimiter";

export const createSession = mutation({
    args: { sessionId: v.string() },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("sessions")
            .withIndex("by_sessionId", (q) => q.eq("sessionId", args.sessionId))
            .first();
        if (!existing) {
            await ctx.db.insert("sessions", {
                sessionId: args.sessionId,
                createdAt: Date.now(),
                lastActiveAt: Date.now(),
            });
        }
    },
});

export const createNotebook = mutation({
    args: { sessionId: v.string(), title: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db.insert("notebooks", {
            sessionId: args.sessionId,
            title: args.title,
            createdAt: Date.now(),
        });
    },
});

export const updateStudioConfig = mutation({
    args: {
        notebookId: v.id("notebooks"),
        config: v.any(), // Map of actionTitle -> customPrompt
        sessionId: v.string()
    },
    handler: async (ctx, args) => {
        const nb = await ctx.db.get(args.notebookId);
        if (nb?.sessionId !== args.sessionId) throw new Error("Unauthorized");
        await ctx.db.patch(args.notebookId, { studioConfig: args.config });
    },
});

export const renameNotebook = mutation({
    args: { notebookId: v.id("notebooks"), title: v.string(), sessionId: v.string() },
    handler: async (ctx, args) => {
        const nb = await ctx.db.get(args.notebookId);
        if (nb?.sessionId !== args.sessionId) throw new Error("Unauthorized");
        await ctx.db.patch(args.notebookId, { title: args.title });
    },
});

export const deleteNotebook = mutation({
    args: { notebookId: v.id("notebooks"), sessionId: v.string() },
    handler: async (ctx, args) => {
        const nb = await ctx.db.get(args.notebookId);
        if (nb?.sessionId !== args.sessionId) throw new Error("Unauthorized");
        // Delete all messages in this notebook
        const messages = await ctx.db
            .query("messages")
            .withIndex("by_notebookId", (q) => q.eq("notebookId", args.notebookId))
            .collect();
        for (const msg of messages) {
            await ctx.db.delete(msg._id);
        }

        // Delete all documents in this notebook
        const docs = await ctx.db
            .query("documents")
            .withIndex("by_notebookId", (q) => q.eq("notebookId", args.notebookId))
            .collect();
        for (const doc of docs) {
            const chunks = await ctx.db
                .query("chunks")
                .withIndex("by_documentId", (q) => q.eq("documentId", doc._id))
                .collect();
            for (const chunk of chunks) {
                await ctx.db.delete(chunk._id);
            }
            await ctx.db.delete(doc._id);
        }

        // Delete the notebook itself
        await ctx.db.delete(args.notebookId);
    }
});

export const saveDocument = mutation({
    args: {
        sessionId: v.string(),
        notebookId: v.id("notebooks"),
        filename: v.string(),
        pageCount: v.number(),
        markdownContent: v.string(),
        storageId: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        // Enforce 10 document limit
        const existingDocs = await ctx.db
            .query("documents")
            .withIndex("by_notebookId", (q) => q.eq("notebookId", args.notebookId))
            .collect();
        if (existingDocs.length >= 10) {
            throw new Error("Maximum of 10 documents per notebook reached.");
        }

        return await ctx.db.insert("documents", {
            ...args,
            isEmbedded: false,
            createdAt: Date.now(),
        });
    },
});

export const generateUploadUrl = mutation(async (ctx) => {
    return await ctx.storage.generateUploadUrl();
});

export const deleteDocument = mutation({
    args: { documentId: v.id("documents"), sessionId: v.string() },
    handler: async (ctx, args) => {
        const doc = await ctx.db.get(args.documentId);
        if (doc?.sessionId !== args.sessionId) throw new Error("Unauthorized");
        const chunks = await ctx.db
            .query("chunks")
            .withIndex("by_documentId", (q) => q.eq("documentId", args.documentId))
            .collect();
        for (const chunk of chunks) {
            await ctx.db.delete(chunk._id);
        }
        await ctx.db.delete(args.documentId);
    }
});

export const deleteAllDocuments = mutation({
    args: { notebookId: v.id("notebooks"), sessionId: v.string() },
    handler: async (ctx, args) => {
        const nb = await ctx.db.get(args.notebookId);
        if (nb?.sessionId !== args.sessionId) throw new Error("Unauthorized");
        const docs = await ctx.db
            .query("documents")
            .withIndex("by_notebookId", (q) => q.eq("notebookId", args.notebookId))
            .collect();
        for (const doc of docs) {
            const chunks = await ctx.db
                .query("chunks")
                .withIndex("by_documentId", (q) => q.eq("documentId", doc._id))
                .collect();
            for (const chunk of chunks) {
                await ctx.db.delete(chunk._id);
            }
            await ctx.db.delete(doc._id);
        }
    }
});

export const saveChunk = internalMutation({
    args: {
        documentId: v.id("documents"),
        chunkText: v.string(),
        chunkIndex: v.number(),
        embedding: v.array(v.float64()),
        pageNumber: v.optional(v.number()),
        sessionId: v.optional(v.string()),
        hash: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("chunks", args);
    },
});

export const finalizeDocument = internalMutation({
    args: { documentId: v.id("documents") },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.documentId, { isEmbedded: true });
    },
});

export const createMessage = mutation({
    args: {
        sessionId: v.string(),
        notebookId: v.id("notebooks"),
        documentId: v.optional(v.id("documents")),
        role: v.union(v.literal("user"), v.literal("assistant")),
        content: v.string(),
        isStreaming: v.boolean(),
        streamId: v.optional(v.string()),
        citations: v.optional(v.any()),
    },
    handler: async (ctx, args) => {
        const nb = await ctx.db.get(args.notebookId);
        if (nb?.sessionId !== args.sessionId) throw new Error("Unauthorized");
        const messageId = await ctx.db.insert("messages", {
            ...args,
            createdAt: Date.now(),
        });
        return messageId;
    },
});

export const appendMessageToken = internalMutation({
    args: {
        streamId: v.string(),
        token: v.string(),
    },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("messages")
            .withIndex("by_streamId", (q) => q.eq("streamId", args.streamId))
            .first();
        if (existing && existing.isStreaming) {
            await ctx.db.patch(existing._id, {
                content: existing.content + args.token,
            });
        }
    },
});

export const finalizeMessage = internalMutation({
    args: {
        streamId: v.string(),
        latencyMs: v.optional(v.number()),
        citations: v.optional(v.any()),
    },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("messages")
            .withIndex("by_streamId", (q) => q.eq("streamId", args.streamId))
            .first();
        if (existing) {
            await ctx.db.patch(existing._id, {
                isStreaming: false,
                latencyMs: args.latencyMs,
                citations: args.citations,
            });
        }
    }
});

export const touchSession = mutation({
    args: { sessionId: v.string() },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("sessions")
            .withIndex("by_sessionId", (q) => q.eq("sessionId", args.sessionId))
            .first();
        if (existing) {
            await ctx.db.patch(existing._id, { lastActiveAt: Date.now() });
        }
    }
});

export const consumeLlmRateLimit = internalMutation({
    args: { sessionId: v.string() },
    handler: async (ctx, args) => {
        return await rateLimit(ctx, { name: "llmCall", key: args.sessionId });
    }
});

export const consumeEmbedRateLimit = internalMutation({
    args: { sessionId: v.string() },
    handler: async (ctx, args) => {
        return await rateLimit(ctx, { name: "embedCall", key: args.sessionId });
    }
});
export const wipeAllData = mutation({
    args: { sessionId: v.string() },
    handler: async (ctx, args) => {
        // 1. Delete all messages
        const messages = await ctx.db
            .query("messages")
            .withIndex("by_sessionId", (q) => q.eq("sessionId", args.sessionId))
            .collect();
        for (const msg of messages) {
            await ctx.db.delete(msg._id);
        }

        // 2. Delete all documents (and their chunks)
        const docs = await ctx.db
            .query("documents")
            .withIndex("by_sessionId", (q) => q.eq("sessionId", args.sessionId))
            .collect();
        for (const doc of docs) {
            const chunks = await ctx.db
                .query("chunks")
                .withIndex("by_documentId", (q) => q.eq("documentId", doc._id))
                .collect();
            for (const chunk of chunks) {
                await ctx.db.delete(chunk._id);
            }
            await ctx.db.delete(doc._id);
        }

        // 3. Delete all notebooks
        const notebooks = await ctx.db
            .query("notebooks")
            .withIndex("by_sessionId", (q) => q.eq("sessionId", args.sessionId))
            .collect();
        for (const nb of notebooks) {
            await ctx.db.delete(nb._id);
        }

        // 4. Delete the session
        const session = await ctx.db
            .query("sessions")
            .withIndex("by_sessionId", (q) => q.eq("sessionId", args.sessionId))
            .first();
        if (session) {
            await ctx.db.delete(session._id);
        }

        // 5. Delete all notes
        const notes = await ctx.db
            .query("notes")
            .withIndex("by_sessionId", (q) => q.eq("sessionId", args.sessionId))
            .collect();
        for (const note of notes) {
            await ctx.db.delete(note._id);
        }
    }
});
export const clearMessages = mutation({
    args: { notebookId: v.id("notebooks"), sessionId: v.string() },
    handler: async (ctx, args) => {
        const nb = await ctx.db.get(args.notebookId);
        if (nb?.sessionId !== args.sessionId) throw new Error("Unauthorized");
        const messages = await ctx.db
            .query("messages")
            .withIndex("by_notebookId", (q) => q.eq("notebookId", args.notebookId))
            .collect();
        for (const msg of messages) {
            await ctx.db.delete(msg._id);
        }
    }
});

export const createNote = mutation({
    args: {
        sessionId: v.string(),
        notebookId: v.id("notebooks"),
        type: v.string(),
        title: v.string(),
        content: v.string(),
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("notes", {
            ...args,
            createdAt: Date.now(),
        });
    },
});

export const deleteNote = mutation({
    args: { noteId: v.id("notes"), sessionId: v.string() },
    handler: async (ctx, args) => {
        const note = await ctx.db.get(args.noteId);
        if (note?.sessionId !== args.sessionId) throw new Error("Unauthorized");
        await ctx.db.delete(args.noteId);
    },
});

export const updateNote = mutation({
    args: {
        noteId: v.id("notes"),
        title: v.optional(v.string()),
        content: v.optional(v.string()),
        sessionId: v.string()
    },
    handler: async (ctx, args) => {
        const { noteId, sessionId, ...updates } = args;
        const note = await ctx.db.get(noteId);
        if (note?.sessionId !== sessionId) throw new Error("Unauthorized");
        await ctx.db.patch(noteId, updates);
    },
});


export const updateSessionName = mutation({
    args: { sessionId: v.string(), userName: v.string() },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("sessions")
            .withIndex("by_sessionId", (q) => q.eq("sessionId", args.sessionId))
            .first();
        if (existing) {
            await ctx.db.patch(existing._id, { userName: args.userName });
        }
    },
});

export const toggleStarNotebook = mutation({
    args: { notebookId: v.id("notebooks"), sessionId: v.string() },
    handler: async (ctx, args) => {
        const nb = await ctx.db.get(args.notebookId);
        if (nb?.sessionId !== args.sessionId) throw new Error("Unauthorized");
        if (nb) {
            await ctx.db.patch(args.notebookId, { isStarred: !nb.isStarred });
        }
    },
});
