import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { action, internalMutation, internalQuery, mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";

const CODE_TTL_MS = 15 * 60 * 1000;
const RESEND_COOLDOWN_MS = 60 * 1000;

/** Resolve a username to its account email (used to sign in with a username). */
export const lookupUsername = query({
  args: { username: v.string() },
  handler: async (ctx, { username }) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_username", (q) =>
        q.eq("username", username.trim().toLowerCase()),
      )
      .first();
    if (!user) return null;
    return { email: user.email ?? null, username: user.username ?? null };
  },
});

/** Live availability check for the sign-up form. */
export const isUsernameAvailable = query({
  args: { username: v.string() },
  handler: async (ctx, { username }) => {
    const normalized = username.trim().toLowerCase();
    if (!/^[a-z0-9_]{3,16}$/.test(normalized)) return false;
    const existing = await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", normalized))
      .first();
    return existing === null;
  },
});

/** Internal: find a user doc by username (used by the auth provider). */
export const getUserByUsernameInternal = internalQuery({
  args: { username: v.string() },
  handler: async (ctx, { username }) => {
    return await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", username))
      .first();
  },
});

/** Internal: read the fields the email action needs. */
export const getUserBasicInternal = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const user = await ctx.db.get(userId);
    if (!user) return null;
    return {
      email: user.email ?? null,
      emailVerificationTime: user.emailVerificationTime ?? null,
    };
  },
});

/** Internal: generate + store a fresh code (enforces the resend cooldown). */
export const issueEmailCodeInternal = internalMutation({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const existing = await ctx.db
      .query("emailCodes")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
    const now = Date.now();
    if (existing && now - existing.createdAt < RESEND_COOLDOWN_MS) {
      throw new Error("Wait a minute before requesting another code");
    }
    const code = String(Math.floor(100000 + Math.random() * 900000));
    if (existing) {
      await ctx.db.patch(existing._id, { code, createdAt: now });
    } else {
      await ctx.db.insert("emailCodes", { userId, code, createdAt: now });
    }
    return code;
  },
});

/** Email the signed-in user a 6-digit verification code (valid 15 minutes). */
export const sendVerificationEmail = action({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Sign in first");

    const user = await ctx.runQuery(internal.accounts.getUserBasicInternal, {
      userId,
    });
    if (!user?.email) throw new Error("Your account has no email address");
    if (user.emailVerificationTime) throw new Error("Email already verified");

    const code = await ctx.runMutation(internal.accounts.issueEmailCodeInternal, {
      userId,
    });

    const res = await fetch("https://auth.freebuff.app/send_otp", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": "fb_email_2crN1hqIArZP2bEfvjp5Qik4",
      },
      body: JSON.stringify({
        to: user.email,
        otp: code,
        appName: process.env.VLY_APP_NAME || "UltraVector",
      }),
    });
    if (!res.ok) {
      throw new Error(`Could not send the email (${res.status})`);
    }
    return { sent: true };
  },
});

/** Confirm a verification code and mark the account's email verified. */
export const verifyEmailCode = mutation({
  args: { code: v.string() },
  handler: async (ctx, { code }) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Sign in first");
    const user = await ctx.db.get(userId);
    if (!user) throw new Error("Account not found");
    if (user.emailVerificationTime) return { verified: true };

    const row = await ctx.db
      .query("emailCodes")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
    if (!row) throw new Error("No code on file — request a new one");
    if (Date.now() - row.createdAt > CODE_TTL_MS) {
      await ctx.db.delete(row._id);
      throw new Error("That code expired — request a new one");
    }
    if (row.code !== code.trim()) throw new Error("Incorrect code");

    await ctx.db.patch(userId, { emailVerificationTime: Date.now() });
    await ctx.db.delete(row._id);
    return { verified: true };
  },
});
