"use node";
import { action } from "../_generated/server";
import { v } from "convex/values";
import { api, internal } from "../_generated/api";
import { GoogleAuth } from "google-auth-library";
import * as crypto from "crypto";

async function getVertexAccessToken() {
    const key = process.env.GCP_SERVICE_ACCOUNT_KEY;
    if (!key) {
        throw new Error("GCP_SERVICE_ACCOUNT_KEY is not set.");
    }
    const credentials = JSON.parse(key);
    const auth = new GoogleAuth({
        credentials,
        scopes: "https://www.googleapis.com/auth/cloud-platform",
    });
    const client = await auth.getClient();
    const token = await client.getAccessToken();
    return token.token;
}

export const embedDocument = action({
    args: {
        documentId: v.id("documents"),
        chunks: v.array(v.object({ text: v.string(), pageNumber: v.optional(v.number()) })),
        sessionId: v.string()
    },
    handler: async (ctx, args) => {
        const status = await ctx.runMutation(internal.mutations.consumeEmbedRateLimit, { sessionId: args.sessionId });
        if (!status.ok) throw new Error(`Rate limited.`);

        const projectId = process.env.GCP_PROJECT_ID;
        const region = process.env.GCP_REGION || "us-central1";
        const token = await getVertexAccessToken();
        const BATCH_SIZE = 15; // Reduced from 100 to stay under 20,000 token limit per request

        async function fetchWithRetry(url: string, body: any, retries = 3) {
            let backoff = 1000;
            for (let i = 0; i < retries; i++) {
                const response = await fetch(url, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`,
                    } as any,
                    body: JSON.stringify(body),
                });

                if (response.ok) return response;

                const responseText = await response.text();
                console.error(`Vertex attempt ${i + 1} failed: ${response.status} ${responseText}`);

                if (response.status === 429 || response.status >= 500) {
                    if (i < retries - 1) {
                        await new Promise(r => setTimeout(r, backoff));
                        backoff *= 2;
                        continue;
                    }
                }
                throw new Error(`Vertex error: ${responseText}`);
            }
            throw new Error("Max retries exceeded");
        }

        for (let i = 0; i < args.chunks.length; i += BATCH_SIZE) {
            const batch = args.chunks.slice(i, i + BATCH_SIZE);

            const chunksWithHashes = batch.map(chunk => {
                const normalizedText = chunk.text.trim().toLowerCase().replace(/\s+/g, " ");
                const hash = crypto.createHash("sha256").update(normalizedText).digest("hex");
                return { ...chunk, hash };
            });

            const hashes = chunksWithHashes.map(c => c.hash);
            const duplicates = await ctx.runQuery(api.queries.checkDuplicateChunks, {
                sessionId: args.sessionId,
                hashes
            });
            const dupMap = new Map();
            for (const dup of duplicates) {
                dupMap.set(dup.hash, dup.embedding);
            }

            const chunksToEmbed: { chunkIdx: number; text: string }[] = [];
            for (let j = 0; j < chunksWithHashes.length; j++) {
                if (!dupMap.has(chunksWithHashes[j].hash)) {
                    chunksToEmbed.push({ chunkIdx: j, text: chunksWithHashes[j].text });
                }
            }

            let vertexEmbeddings: any[] = [];
            if (chunksToEmbed.length > 0) {
                const vertexResponse = await fetchWithRetry(
                    `https://${region}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${region}/publishers/google/models/text-embedding-004:predict`,
                    {
                        instances: chunksToEmbed.map(c => ({ content: c.text })),
                        parameters: { taskType: "RETRIEVAL_DOCUMENT" },
                    }
                );

                const data = await vertexResponse.json() as any;
                vertexEmbeddings = data.predictions.map((p: any) => p.embeddings.values as number[]);
            }

            const mutations = chunksWithHashes.map((chunk, batchIdx) => {
                const absoluteIdx = i + batchIdx;
                let embedding;
                if (dupMap.has(chunk.hash)) {
                    embedding = dupMap.get(chunk.hash);
                } else {
                    const embedIdx = chunksToEmbed.findIndex(c => c.chunkIdx === batchIdx);
                    embedding = vertexEmbeddings[embedIdx];
                }

                return ctx.runMutation(internal.mutations.saveChunk, {
                    documentId: args.documentId,
                    chunkText: chunk.text,
                    chunkIndex: absoluteIdx,
                    embedding,
                    pageNumber: chunk.pageNumber,
                    sessionId: args.sessionId,
                    hash: chunk.hash,
                });
            });

            await Promise.all(mutations);
        }

        await ctx.runMutation(internal.mutations.finalizeDocument, { documentId: args.documentId });
    },
});
