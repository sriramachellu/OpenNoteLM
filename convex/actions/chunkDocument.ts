"use node";
import { action } from "../_generated/server";
import { v } from "convex/values";
import { encode, decode } from "gpt-tokenizer";
import { api } from "../_generated/api";

interface Chunk {
    text: string;
    pageNumber?: number;
}

function chunkMarkdown(text: string, size = 1000, overlap = 120): Chunk[] {
    const pageMarkerRegex = /(?:\[Page\s*(\d+)\]|---\s*Page\s*(\d+)\s*---)/i;
    const lines = text.split("\n");
    let currentPage = 1;
    const result: Chunk[] = [];
    let currentChunkTokens: number[] = [];

    // Process in blocks to reduce encode calls
    const BLOCK_SIZE = 50;
    for (let i = 0; i < lines.length; i += BLOCK_SIZE) {
        const block = lines.slice(i, i + BLOCK_SIZE);
        let blockText = "";

        for (const line of block) {
            const pageMatch = line.match(pageMarkerRegex);
            if (pageMatch) {
                // If we hit a page marker, we must process the accumulated blockText first
                if (blockText) {
                    currentChunkTokens.push(...encode(blockText));
                    blockText = "";
                }
                currentPage = parseInt(pageMatch[1] || pageMatch[2]);

                // If we already have enough tokens, finalize the chunk
                while (currentChunkTokens.length >= size) {
                    const chunkText = decode(currentChunkTokens.slice(0, size)).trim();
                    if (chunkText.length > 0) {
                        result.push({
                            text: chunkText,
                            pageNumber: currentPage
                        });
                    }
                    currentChunkTokens = currentChunkTokens.slice(size - overlap);
                }
                continue;
            }
            blockText += line + "\n";
        }

        if (blockText) {
            currentChunkTokens.push(...encode(blockText));
        }

        while (currentChunkTokens.length >= size) {
            const chunkText = decode(currentChunkTokens.slice(0, size)).trim();
            if (chunkText.length > 0) {
                result.push({
                    text: chunkText,
                    pageNumber: currentPage
                });
            }
            currentChunkTokens = currentChunkTokens.slice(size - overlap);
        }
    }

    if (currentChunkTokens.length > 0) {
        const chunkText = decode(currentChunkTokens).trim();
        if (chunkText.length > 0) {
            result.push({
                text: chunkText,
                pageNumber: currentPage
            });
        }
    }

    return result;
}

export const chunkDocument = action({
    args: { documentId: v.id("documents"), markdownContent: v.string(), sessionId: v.string() },
    handler: async (ctx, args) => {
        const chunks = chunkMarkdown(args.markdownContent);
        await ctx.runAction(api.actions.embedDocument.embedDocument, {
            documentId: args.documentId,
            sessionId: args.sessionId,
            chunks,
        });
    },
});
