"use node";

import { createAccount } from "@convex-dev/auth/server";
import { action } from "./_generated/server";
import { internal } from "./_generated/api";

/**
 * The site owner's admin account. Created automatically the first time the
 * app loads (idempotent). Change the password here whenever you like.
 */
export const ADMIN_USERNAME = "admin";
export const ADMIN_EMAIL = "admin@ultravector.gg";
export const ADMIN_PASSWORD = "UV-Admin!2026-x7Km9Qz";

export const ensureAdmin = action({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.runQuery(
      internal.adminData.findUserByUsernameInternal,
      { username: ADMIN_USERNAME },
    );
    if (existing) {
      if (existing.role !== "admin") {
        await ctx.runMutation(internal.adminData.setAdminRoleInternal, {
          userId: existing._id,
        });
      }
      return { created: false };
    }
    try {
      await createAccount(ctx, {
        provider: "password",
        account: { id: ADMIN_EMAIL, secret: ADMIN_PASSWORD },
        profile: {
          email: ADMIN_EMAIL,
          name: ADMIN_USERNAME,
          username: ADMIN_USERNAME,
          role: "admin",
          emailVerificationTime: Date.now(),
        },
      });
      return { created: true };
    } catch {
      // A concurrent request may have created it first — that's fine.
      return { created: false };
    }
  },
});
