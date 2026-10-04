import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    userName: v.string(),
    email: v.string(),
    imageUrl: v.string(),
    upgrade: v.boolean(),
    stripeCustomerId: v.optional(v.string()), 
    subscriptionId: v.optional(v.string()), 
    dodoCustomerId: v.optional(v.string()),
    dodoPaymentId: v.optional(v.string()),
  }).index("by_email", ["email"])              
    .index("by_stripe_customer", ["stripeCustomerId"])
    .index("by_dodo_customer", ["dodoCustomerId"]),
    
  pdfFiles: defineTable({
    fileId: v.string(),
    storageId: v.string(),
    fileName: v.string(),
    createdBy: v.string(),
    fileUrl: v.string()
  }),

  documents: defineTable({
    embedding: v.array(v.number()),
    text: v.string(),
    metadata: v.any(),
  }).vectorIndex("byEmbedding", {
    vectorField: "embedding",
    dimensions: 3072,
  }),

  notes: defineTable({
    fileId: v.string(),
    note: v.string(),
    createBy: v.string()
  })
});