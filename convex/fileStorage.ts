import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

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