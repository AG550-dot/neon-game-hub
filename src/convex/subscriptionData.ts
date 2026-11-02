import { v } from "convex/values";
import { internalMutation, internalQuery } from "./_generated/server";

/**
 * Internal helpers used by the AI-scan action (subscriptionAi.ts). Split into
 * a separate "use entries"-style module so actions can runQuery/runMutation
 * against them.
 */

/** The caller's most recent subscription request (any status). */
export const latestRequestInternal = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    return await ctx.db
      .query("subscriptionRequests")
      .withIndex("by_user_created", (q) => q.eq("userId", userId))
      .order("desc")
      .first();
  },
});

/** Public read URL for the proof screenshot. */
export const storageUrlInternal = internalQuery({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, { storageId }) => {
    return (await ctx.storage.getUrl(storageId)) ?? null;
  },
});

/** Persist the AI verdict on the request. */
export const recordScanInternal = internalMutation({
  args: {
    id: v.id("subscriptionRequests"),
    aiPassed: v.boolean(),
    aiVerdict: v.string(),
  },
  handler: async (ctx, { id, aiPassed, aiVerdict }) => {
    await ctx.db.patch(id, {
      aiPassed,
      aiVerdict: aiVerdict.slice(0, 300),
    });
  },
});

/** Mark that the automated scan could not run (falls back to admin review). */
export const recordNoAiInternal = internalMutation({
  args: { id: v.id("subscriptionRequests") },
  handler: async (ctx, { id }) => {
    await ctx.db.patch(id, {
      aiVerdict: "AI scan unavailable — admin will review manually",
    });
  },
});
