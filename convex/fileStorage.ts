import { action, internalMutation, internalQuery, mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

// How many embedding rows we delete per batch. Each batch runs as its own
// function execution, so we stay well under Convex's 16MB read limit per
// execution (each row contains a 3072-dimension vector).
const DOCUMENTS_DELETE_BATCH_SIZE = 25;

export const generateUploadUrl = mutation({
    args: {},
    handler: async (ctx) => {
        return await ctx.storage.generateUploadUrl();
    },
});

export const AddFileEntryToDB = mutation({
    args: {
        fileId: v.string(),
        storageId: v.string(),
        fileName: v.string(),
        createdBy: v.string(),
        fileUrl: v.string()
    },

    handler: async (ctx, args) => {
        const result = await ctx.db.insert("pdfFiles", {
            fileId: args.fileId,
            storageId: args.storageId,
            fileName: args.fileName,
            createdBy: args.createdBy,
            fileUrl: args.fileUrl
        });
        return "inserted";
    },
});

export const getFileUrl = mutation({
    args: {
        storageId: v.string()
    },
    handler: async (ctx, args) => {
        const url = await ctx.storage.getUrl(args.storageId)
        return url;
    }
})

export const getFileData = query({

    args: {
        fileId: v.string()
    },
    handler: async (ctx, args) => {
        const file = await ctx.db.query("pdfFiles").filter((q) => q.eq(q.field("fileId"), args.fileId)).collect();
        return file;
    }
})

// Looks up the file record for deletion (used by the DeleteFile action).
export const getFileForDelete = internalQuery({
    args: {
        fileId: v.string()
    },
    handler: async (ctx, args) => {
        return await ctx.db.query("pdfFiles")
            .filter((q) => q.eq(q.field("fileId"), args.fileId))
            .first();
    },
});

// Deletes one small batch of AI embeddings for a file. Called repeatedly by
// the DeleteFile action so every execution stays under the read limit.
export const deleteDocumentsBatch = internalMutation({
    args: {
        fileId: v.string()
    },
    handler: async (ctx, args) => {
        const documents = await ctx.db.query("documents")
            .withIndex("by_file_id", (q) => q.eq("metadata.fileId", args.fileId))
            .take(DOCUMENTS_DELETE_BATCH_SIZE);

        for (const doc of documents) {
            await ctx.db.delete(doc._id);
        }

        return documents.length;
    },
});

// Removes the notes, the file record and the stored file itself.
export const finalizeFileDelete = internalMutation({
    args: {
        fileId: v.string(),
        userEmail: v.string()
    },
    handler: async (ctx, args) => {
        const file = await ctx.db.query("pdfFiles")
            .filter((q) => q.eq(q.field("fileId"), args.fileId))
            .first();

        if (!file) {
            return "not_found";
        }

        if (file.createdBy !== args.userEmail) {
            throw new Error("You are not allowed to delete this file");
        }

        // Delete the notes for this file
        const notes = await ctx.db.query("notes")
            .filter((q) => q.eq(q.field("fileId"), args.fileId))
            .collect();
        for (const note of notes) {
            await ctx.db.delete(note._id);
        }

        // Delete the file record and the stored file itself
        await ctx.db.delete(file._id);
        await ctx.storage.delete(file.storageId);

        return "deleted";
    },
});

export const DeleteFile = action({
    args: {
        fileId: v.string(),
        userEmail: v.string()
    },
    handler: async (ctx, args) => {
        const file = await ctx.runQuery(internal.fileStorage.getFileForDelete, {
            fileId: args.fileId
        });

        if (!file) {
            throw new Error("File not found");
        }

        if (file.createdBy !== args.userEmail) {
            throw new Error("You are not allowed to delete this file");
        }

        // Delete the AI embeddings in batches — each batch runs as its own
        // mutation execution with its own read budget, so large files don't
        // blow Convex's per-execution 16MB read limit.
        let deleted = DOCUMENTS_DELETE_BATCH_SIZE;
        while (deleted === DOCUMENTS_DELETE_BATCH_SIZE) {
            deleted = await ctx.runMutation(internal.fileStorage.deleteDocumentsBatch, {
                fileId: args.fileId
            });
        }

        await ctx.runMutation(internal.fileStorage.finalizeFileDelete, {
            fileId: args.fileId,
            userEmail: args.userEmail
        });

        return "deleted";
    },
});

export const getUserFiles = query({
    args:{
        userEmail: v.string()
    },
    handler: async (ctx, args)=>{
        const result = await ctx.db.query("pdfFiles").
        filter((q)=>q.eq(q.field("createdBy"), args.userEmail)).collect();

        return result;
    }
})