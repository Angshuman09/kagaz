'use node';
import { ConvexVectorStore } from "@langchain/community/vectorstores/convex";
import { action } from "./_generated/server.js";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { TaskType } from "@google/generative-ai";
import { v } from "convex/values";

export const ingest = action({
    args: {
        splitText: v.array(v.string()),
        fileId: v.string()
    },
    handler: async (ctx, args) => {
        await ConvexVectorStore.fromTexts(
            args.splitText,
            args.splitText.map(() => ({ fileId: args.fileId })),
            new GoogleGenerativeAIEmbeddings({
                apiKey: process.env.GOOGLE_API_KEY,
                model: "gemini-embedding-001", // 3072 dimensions
                taskType: TaskType.RETRIEVAL_DOCUMENT,
                title: "Document title",
            }),
            { ctx }
        );

        return "embedded";
    },
});


export const search = action({
    args: {
        query: v.string(),
        fileId: v.string()
    },
    handler: async (ctx, args) => {
        if (!args.query) {
            return [];
        }

        const vectorStore = new ConvexVectorStore(new GoogleGenerativeAIEmbeddings({
            apiKey: process.env.GOOGLE_API_KEY,
            model: "gemini-embedding-001", // 3072 dimensions
            taskType: TaskType.RETRIEVAL_DOCUMENT,
            title: "Document title",
        }), { ctx });

        const result = (await vectorStore.similaritySearch(args.query, 1)).filter(q => q.metadata.fileId === args.fileId);
        console.log(result);

        const resultOne = result.map(doc => ({ pageContent: doc.pageContent, metadata: doc.metadata }));

        return resultOne;
    },
});