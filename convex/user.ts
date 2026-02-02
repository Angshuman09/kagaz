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
        upgrade: false
      });

      return "Inserted new user";
    }

    return "User already exists";
  },
});

export const upgradeUser = mutation({
  args:{
    userEmail: v.string()
  },
  handler: async (ctx, args)=>{
    const result = await ctx.db.query('users').filter(q=>q.eq(q.field('email'), args.userEmail)).collect();

    if(result){
      ctx.db.patch(result[0]._id,{upgrade:true});
      return "success"
    }
    return "payment failed"
  }
})