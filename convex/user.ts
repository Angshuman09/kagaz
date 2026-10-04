import { mutation, query } from "./_generated/server";
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
  args: {
    email: v.string(),
    upgrade: v.boolean(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .filter((q)=>q.eq(q.field("email"),args.email))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    await ctx.db.patch(user._id, {
      upgrade: args.upgrade,
    });

    return { success: true, userId: user._id };
  },
});

export const updateStripeInfo = mutation({
  args: {
    email: v.string(),
    stripeCustomerId: v.string(),
    subscriptionId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .filter((q)=>q.eq(q.field("email"),args.email))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    await ctx.db.patch(user._id, {
      stripeCustomerId: args.stripeCustomerId,
      subscriptionId: args.subscriptionId,
    });

    return { success: true };
  },
});

export const getUser = query({
  args: {
    email: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (!args?.email) {
      return;
    }
    const user = await ctx.db
      .query("users").filter((q)=>q.eq(q.field("email"),args?.email)).first();

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  },
});

export const getUserByStripeCustomerId = query({
  args: {
    stripeCustomerId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_stripe_customer", (q) => q.eq("stripeCustomerId", args.stripeCustomerId))
      .first();

    return user;
  },
});

export const updateDodoInfo = mutation({
  args: {
    email: v.string(),
    customerId: v.optional(v.string()),
    subscriptionId: v.optional(v.string()),
    paymentId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), args.email))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    await ctx.db.patch(user._id, {
      ...(args.subscriptionId ? { subscriptionId: args.subscriptionId } : {}),
      ...(args.customerId ? { dodoCustomerId: args.customerId } : {}),
      ...(args.paymentId ? { dodoPaymentId: args.paymentId } : {}),
    });

    return { success: true };
  },
});

export const getUserByDodoCustomerId = query({
  args: {
    dodoCustomerId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_dodo_customer", (q) => q.eq("dodoCustomerId", args.dodoCustomerId))
      .first();

    return user;
  },
});