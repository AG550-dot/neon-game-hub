import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Legend subscription — £10 one-time bank transfer. The player sends the
 * transfer, uploads a screenshot of the confirmation here, an AI vision scan
 * pre-checks it, and the site admin gives the final approval. Approved
 * players get the gold LEGEND chat banner, styled chat text and a permanent
 * slot on the Legends leaderboard.
 *
 * Bank details: Pallavi Manuboti · account 64195214 · sort code 04-00-05.
 */

/** Price in pounds — shown on the subscription page. */
export const LEGEND_PRICE = 10;

/** A fresh upload URL for the proof screenshot (image only). */
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Sign in first");
    return await ctx.storage.generateUploadUrl();
  },
});

/** Register an uploaded screenshot as a pending subscription request. */
export const request = mutation({
  args: {
    storageId: v.id("_storage"),
    note: v.optional(v.string()),
  },
  handler: async (ctx, { storageId, note }) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Sign in first");
    const user = await ctx.db.get(userId);
    if (!user) throw new Error("Account not found");
    if (user.isAnonymous) throw new Error("Create a free account first");
    if (user.subscription) throw new Error("You are already a Legend");

    const meta = await ctx.storage.getMetadata(storageId);
    if (!meta) throw new Error("Screenshot missing — upload it again");
    if (!meta.contentType?.startsWith("image/")) {
      throw new Error("Proof must be an image (screenshot of the transfer)");
    }
    if (meta.size > 6 * 1024 * 1024) {
      throw new Error("Image must be under 6 MB");
    }

    await ctx.db.insert("subscriptionRequests", {
      userId,
      username: user.username ?? user.name ?? "player",
      storageId,
      note: note?.trim().slice(0, 200) || undefined,
      status: "pending",
      createdAt: Date.now(),
    });
    return true;
  },
});

/** The signed-in player's subscription state + latest request. */
export const myStatus = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      return { subscription: null, request: null, imageUrl: null };
    }
    const user = await ctx.db.get(userId);
    const req = await ctx.db
      .query("subscriptionRequests")
      .withIndex("by_user_created", (q) => q.eq("userId", userId))
      .order("desc")
      .first();
    return {
      subscription: user?.subscription ?? null,
      request: req
        ? {
            status: req.status,
            aiVerdict: req.aiVerdict ?? null,
            aiPassed: req.aiPassed ?? null,
            createdAt: req.createdAt,
            note: req.note ?? null,
          }
        : null,
      imageUrl: req ? ((await ctx.storage.getUrl(req.storageId)) ?? null) : null,
    };
  },
});

/** Pending requests for the admin review queue (null if not admin). */
export const listPending = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return null;
    const me = await ctx.db.get(userId);
    if (me?.role !== "admin") return null;

    const rows = await ctx.db
      .query("subscriptionRequests")
      .withIndex("by_status_created", (q) => q.eq("status", "pending"))
      .order("desc")
      .take(100);

    const out = [];
    for (const r of rows) {
      out.push({
        _id: r._id,
        username: r.username,
        note: r.note ?? null,
        aiVerdict: r.aiVerdict ?? null,
        aiPassed: r.aiPassed ?? null,
        createdAt: r.createdAt,
        imageUrl: (await ctx.storage.getUrl(r.storageId)) ?? null,
      });
    }
    return out;
  },
});

/** Admin verdict — final approval grants the Legend tier. */
export const review = mutation({
  args: { id: v.id("subscriptionRequests"), approve: v.boolean() },
  handler: async (ctx, { id, approve }) => {
    const adminId = await getAuthUserId(ctx);
    if (adminId === null) throw new Error("Sign in first");
    const admin = await ctx.db.get(adminId);
    if (admin?.role !== "admin") throw new Error("Admins only");

    const req = await ctx.db.get(id);
    if (!req) throw new Error("Request not found");
    if (req.status === "approved" || req.status === "rejected") {
      throw new Error("Already reviewed");
    }

    if (approve) {
      await ctx.db.patch(req.userId, {
        subscription: { tier: "legend", since: Date.now() },
      });
      await ctx.db.patch(id, { status: "approved" });
    } else {
      await ctx.db.patch(id, { status: "rejected" });
    }
    return true;
  },
});

/** The public Legends leaderboard — everyone with an active subscription. */
export const listLegends = query({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").take(5000);
    const legends = users
      .filter((u) => u.subscription?.tier === "legend")
      .map((u) => ({
        userId: u._id,
        username: u.username ?? u.name ?? "player",
        since: u.subscription!.since,
      }))
      .sort((a, b) => a.since - b.since)
      .slice(0, 200);
    const owner = users.find((u) => u.role === "admin");
    return {
      legends,
      owner: owner
        ? {
            username: owner.username ?? owner.name ?? "admin",
            since: owner.subscription?.since ?? null,
          }
        : null,
    };
  },
});
