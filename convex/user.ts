import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const createUser = mutation({
  args: {
    email: v.string(),
    userName: v.string(),
    imageUrl: v.string(),
  },
  handler: async (ctx, args) => {
    const users = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), args.email))
      .collect();

    if (users.length === 0) {
      await ctx.db.insert("users", {
        email: args.email,
        userName: args.userName,
        imageUrl: args.imageUrl,
      });

      return "Inserted new user";
    }

    return "User already exists";
  },
});
