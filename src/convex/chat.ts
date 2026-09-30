import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { filterProfanity } from "./profanity";

const MAX_LENGTH = 280;
const SEND_COOLDOWN_MS = 2500;

/** Latest chat messages in chronological order (oldest → newest). */
export const listMessages = query({
  args: {},
  handler: async (ctx) => {
    const rows = await ctx.db
      .query("chatMessages")
      .withIndex("by_created")
      .order("desc")
      .take(80);
    return rows.reverse();
  },
});

/** Send a chat message. Requires a real (non-anonymous), verified account. */
export const sendMessage = mutation({
  args: { text: v.string() },
  handler: async (ctx, { text }) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Sign in to chat");
    const user = await ctx.db.get(userId);
    if (!user) throw new Error("Account not found");
    if (user.isAnonymous) {
      throw new Error("Create a free account to chat");
    }
    if (!user.emailVerificationTime) {
      throw new Error("Verify your email to chat");
    }

    const clean = text.trim().slice(0, MAX_LENGTH);
    if (!clean) throw new Error("Message is empty");

    const last = await ctx.db
      .query("chatMessages")
      .withIndex("by_user_created", (q) => q.eq("userId", userId))
      .order("desc")
      .first();
    if (last && Date.now() - last.createdAt < SEND_COOLDOWN_MS) {
      throw new Error("Slow down a little");
    }

    return await ctx.db.insert("chatMessages", {
      userId,
      username: user.username ?? user.name ?? "player",
      text: filterProfanity(clean),
      createdAt: Date.now(),
    });
  },
});
