import { ConvexCredentials } from "@convex-dev/auth/providers/ConvexCredentials";
import { createAccount, retrieveAccount } from "@convex-dev/auth/server";
import { Scrypt } from "lucia";
import { containsProfanity } from "./profanity";
import { internal } from "./_generated/api";

/**
 * Username + email + password credentials provider.
 *
 * Written directly on ConvexCredentials (instead of the Password wrapper) so
 * the sign-up flow can run async checks — unique username, profanity screen —
 * before the account is ever created. `authorize` runs in an action context,
 * so database reads go through internal queries.
 */
export const credentials = ConvexCredentials({
  id: "password",
  authorize: async (params, ctx) => {
    const flow = typeof params.flow === "string" ? params.flow : "";
    const email = String(params.email ?? "")
      .trim()
      .toLowerCase();
    const password =
      typeof params.password === "string" ? params.password : "";

    if (flow === "signUp") {
      if (!password || password.length < 8) {
        throw new Error("Password must be at least 8 characters");
      }
      const username = String(params.username ?? "")
        .trim()
        .toLowerCase();
      if (!/^[a-z0-9_]{3,16}$/.test(username)) {
        throw new Error(
          "Username must be 3–16 characters (letters, numbers, underscores)",
        );
      }
      if (containsProfanity(username)) {
        throw new Error("Please pick a different username");
      }
      const existing = await ctx.runQuery(
        internal.accounts.getUserByUsernameInternal,
        { username },
      );
      if (existing) {
        throw new Error("That username is already taken");
      }
      const { user } = await createAccount(ctx, {
        provider: "password",
        account: { id: email, secret: password },
        profile: { email, name: username, username },
      });
      return { userId: user._id };
    }

    if (flow === "signIn") {
      if (!password) throw new Error("Missing password");
      // Allow signing in with either the email or the username.
      let accountEmail = email;
      if (!email.includes("@")) {
        const byName = await ctx.runQuery(
          internal.accounts.getUserByUsernameInternal,
          { username: email },
        );
        if (!byName?.email) throw new Error("Invalid credentials");
        accountEmail = byName.email;
      }
      const retrieved = await retrieveAccount(ctx, {
        provider: "password",
        account: { id: accountEmail, secret: password },
      });
      if (retrieved === null) {
        throw new Error("Invalid credentials");
      }
      return { userId: retrieved.user._id };
    }

    throw new Error('Unsupported flow — use "signUp" or "signIn"');
  },
  crypto: {
    async hashSecret(password: string) {
      return await new Scrypt().hash(password);
    },
    async verifySecret(password: string, hash: string) {
      return await new Scrypt().verify(hash, password);
    },
  },
});
