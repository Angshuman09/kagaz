import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const saveNote = mutation({
    args: {
        fileId: v.string(),
        note: v.string(),
        createBy: v.string(),
    },

    handler: async (ctx, args) => {
        const record = await ctx.db.query("notes").filter((q) => q.eq(q.field("fileId"), args.fileId)).collect();

        if (record?.length === 0) {
            await ctx.db.insert("notes", {
                fileId: args.fileId,
                note: args.note,
                createBy: args.createBy
            })
        } else {
            await ctx.db.patch(record[0]._id, {
                note: args.note
            })
        }
    }
})

export const getNotes = query({
    args: {
        fileId: v.string()
    },
    handler: async (ctx, args) => {
        const record = await ctx.db.query("notes").filter((q) => q.eq(q.field("fileId"), args.fileId)).collect();
        return record;
    }
})