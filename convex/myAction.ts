'use node';
import { WebPDFLoader } from "@langchain/community/document_loaders/web/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { action, ActionCtx } from "./_generated/server.js";
import { api, internal } from "./_generated/api.js";
import type { Doc } from "./_generated/dataModel";
import { v } from "convex/values";

const INSERT_BATCH_SIZE = 16;
const DELETE_BATCH_SIZE = 25;
const SEARCH_LIMIT = 15;

// Embeddings run through OpenRouter (Nemotron, free tier) instead of Google —
// Google's free tier caps embedding at 100 requests/minute and quota failures
// were breaking ingestion. CRITICAL: LangChain's embeddings wrapper silently
// converts failed calls into EMPTY vectors that get stored as valid-looking
// rows and can never be found by vector search, so we never use it here —
// embedding failures must throw loudly or the PDF looks ingested but is
// unsearchable. OpenRouter's :free models have their own rate limits, so
// requests are batched generously, sequenced, and retried with backoff.
const OPENROUTER_EMBED_URL = "https://openrouter.ai/api/v1/embeddings";
const DEFAULT_EMBED_MODEL = "nvidia/nemotron-3-embed-1b:free";
const EMBED_BATCH_SIZE = 64; // one request per ~64 chunks (32K token context)
const EMBED_BATCH_DELAY_MS = 1500; // pace batch requests to respect rate limits
const EMBED_MAX_ATTEMPTS = 4;

function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function embedModel(): string {
    return process.env.OPENROUTER_EMBED_MODEL || DEFAULT_EMBED_MODEL;
}

// Calls OpenRouter's embeddings endpoint. Throws a descriptive error if the
// response is incomplete — ingestion must never store garbage embeddings.
async function callEmbeddings(input: string[]): Promise<number[][]> {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
        throw new Error("OPENROUTER_API_KEY is not set in the Convex environment");
    }

    let lastError = "unknown error";
    for (let attempt = 1; attempt <= EMBED_MAX_ATTEMPTS; attempt++) {
        try {
            const res = await fetch(OPENROUTER_EMBED_URL, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ model: embedModel(), input }),
            });

            if (!res.ok) {
                const bodyText = await res.text();
                throw new Error(`HTTP ${res.status}: ${bodyText.slice(0, 300)}`);
            }

            const payload = (await res.json()) as { data?: Array<{ embedding?: number[] }> };
            const embeddings = (payload.data ?? []).map((item) => item.embedding ?? []);
            if (
                embeddings.length !== input.length ||
                embeddings.some((vector) => vector.length === 0)
            ) {
                throw new Error("API returned incomplete embeddings");
            }
            return embeddings;
        } catch (error) {
            lastError = (error as Error).message;
            if (attempt === EMBED_MAX_ATTEMPTS) break;
            const match = lastError.match(/retry in ([\d.]+)s/);
            await sleep(match ? Math.ceil(Number(match[1]) * 1000) + 2000 : 4000 * attempt);
        }
    }
    throw new Error(
        `Embedding failed after ${EMBED_MAX_ATTEMPTS} attempts (${embedModel()}): ${lastError}`
    );
}

// Embeds texts in paced batches; returns one vector per text, in order.
async function embedTexts(texts: string[]): Promise<number[][]> {
    const vectors: number[][] = [];

    for (let start = 0; start < texts.length; start += EMBED_BATCH_SIZE) {
        const slice = texts.slice(start, start + EMBED_BATCH_SIZE);
        vectors.push(...(await callEmbeddings(slice)));

        if (start + EMBED_BATCH_SIZE < texts.length) {
            await sleep(EMBED_BATCH_DELAY_MS);
        }
    }

    if (vectors.length !== texts.length || vectors.some((vector) => vector.length === 0)) {
        throw new Error(`Embedding failed: ${vectors.length}/${texts.length} vectors returned.`);
    }
    return vectors;
}

// Replaces any previously ingested embeddings for this file so ingestion is
// retry-safe and never leaves duplicate or orphaned chunks behind.
async function replaceFileEmbeddings(
    ctx: ActionCtx,
    fileId: string,
    texts: string[],
    vectors: number[][]
) {
    let deleted = DELETE_BATCH_SIZE;
    while (deleted === DELETE_BATCH_SIZE) {
        deleted = await ctx.runMutation(internal.fileStorage.deleteDocumentsBatch, { fileId });
    }

    for (let i = 0; i < texts.length; i += INSERT_BATCH_SIZE) {
        await Promise.all(
            texts.slice(i, i + INSERT_BATCH_SIZE).map((text, offset) =>
                ctx.runMutation(internal.langchain.db.insert, {
                    table: "documents",
                    document: {
                        text,
                        embedding: vectors[i + offset],
                        metadata: { fileId },
                    },
                })
            )
        );
    }
}

export const ingest = action({
    args: {
        splitText: v.array(v.string()),
        fileId: v.string()
    },
    handler: async (ctx, args) => {
        if (args.splitText.length === 0) {
            throw new Error("No text was extracted from the PDF");
        }

        const vectors = await embedTexts(args.splitText);
        await replaceFileEmbeddings(ctx, args.fileId, args.splitText, vectors);

        return `embedded ${args.splitText.length} chunks`;
    },
});

// Re-extracts and re-embeds an already-uploaded file. Repairs files whose
// embeddings were lost to a failed or silently-corrupted upload.
export const reingestFile = action({
    args: {
        fileId: v.string()
    },
    handler: async (ctx, args) => {
        const files = await ctx.runQuery(api.fileStorage.getFileData, { fileId: args.fileId });
        const file = files[0];
        if (!file) {
            throw new Error("File not found");
        }

        const response = await fetch(file.fileUrl);
        if (!response.ok) {
            throw new Error(`Failed to download the PDF (${response.status})`);
        }

        const loader = new WebPDFLoader(await response.blob());
        const docs = await loader.load();
        const splitter = new RecursiveCharacterTextSplitter({ chunkSize: 1000, chunkOverlap: 0 });
        const splitDocs = await splitter.splitDocuments(docs);
        const texts = splitDocs
            .map((doc) => doc.pageContent)
            .filter((text) => text.trim().length > 0);

        if (texts.length === 0) {
            throw new Error("No text could be extracted from the PDF");
        }

        const vectors = await embedTexts(texts);
        await replaceFileEmbeddings(ctx, args.fileId, texts, vectors);

        return `embedded ${texts.length} chunks`;
    },
});

export const search = action({
    args: {
        query: v.string(),
        fileId: v.string()
    },
    handler: async (ctx, args): Promise<string> => {
        if (!args.query) {
            return "";
        }

        const [vector] = await callEmbeddings([args.query]);
        if (!vector || vector.length === 0) {
            throw new Error("Failed to embed the query.");
        }

        // The fileId filter runs at the vector-index level, so results are
        // always scoped to this file, no matter how many other files exist.
        const matches = await ctx.vectorSearch("documents", "byEmbedding", {
            vector,
            limit: SEARCH_LIMIT,
            filter: (q) => q.eq("metadata.fileId", args.fileId),
        });

        const documents: Array<Doc<"documents"> | null> = await Promise.all(
            matches.map(
                ({ _id }) =>
                    ctx.runQuery(internal.langchain.db.get, { id: _id }) as Promise<Doc<"documents"> | null>
            )
        );

        const context: string = documents
            .filter((doc): doc is Doc<"documents"> =>
                doc !== null && doc.metadata?.fileId === args.fileId)
            .map((doc) => doc.text)
            .join("\n\n");

        console.log(`search: ${matches.length} matches -> ${context.length} chars of context`);
        return context;
    },
});
