"use node";

import { getAuthUserId } from "@convex-dev/auth/server";
import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import type { Doc } from "./_generated/dataModel";

/**
 * AI pre-check of the uploaded bank-transfer screenshot.
 *
 * Sends the image to an OpenAI-compatible vision model and asks whether the
 * screenshot plausibly shows a £10 transfer to Pallavi Manuboti
 * (account 64195214, sort code 04-00-05). The result is stored on the request
 * as `aiPassed` / `aiVerdict`; the site admin still makes the final call.
 *
 * To enable the scan, add an `OPENAI_API_KEY` to the environment (Keys/API
 * keys panel). Without a key the request is flagged for manual admin review.
 */

const PROMPT = `You are reviewing a screenshot that a player uploaded as proof of a £10 bank transfer. The site owner's bank details are:
- Name: Pallavi Manuboti
- Account number: 64195214
- Sort code: 04-00-05
- Amount: £10.00

Look at the image and decide whether it plausibly shows a completed bank transfer or mobile-banking confirmation to those details for £10. You do not need to read every character perfectly — but flag images where the amount is clearly different, the recipient name is clearly different, the image contains no transfer information at all, or the screenshot looks obviously fake or template-like.

Reply ONLY with JSON in this exact shape:
{"passed": <true|false>, "reason": "<one short sentence explaining the verdict>"}`;

interface ScanResult {
  scanned: boolean;
  passed: boolean | null;
  reason: string | null;
}

export const runScan = action({
  args: {},
  handler: async (ctx): Promise<ScanResult> => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Sign in first");

    const apiKey: string | undefined = process.env.OPENAI_API_KEY;
    const req = (await ctx.runQuery(
      internal.subscriptionData.latestRequestInternal,
      { userId },
    )) as Doc<"subscriptionRequests"> | null;
    if (!req) {
      throw new Error("Upload a screenshot first");
    }
    if (req.status !== "pending") {
      throw new Error("This request has already been reviewed");
    }

    if (!apiKey) {
      await ctx.runMutation(internal.subscriptionData.recordNoAiInternal, {
        id: req._id,
      });
      return { scanned: false, passed: null, reason: "no-api-key" };
    }

    // Pull the image bytes out of storage.
    const url = (await ctx.runQuery(
      internal.subscriptionData.storageUrlInternal,
      { storageId: req.storageId },
    )) as string | null;
    if (!url) throw new Error("Screenshot missing");
    const imageRes: Response = await fetch(url);
    if (!imageRes.ok) throw new Error("Could not load the screenshot");
    const contentType: string = imageRes.headers.get("content-type") ?? "image/png";
    const bytes: ArrayBuffer = await imageRes.arrayBuffer();
    const dataUrl = `data:${contentType};base64,${Buffer.from(bytes).toString("base64")}`;

    // Vision call (OpenAI-compatible chat completions).
    const res: Response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: PROMPT },
              { type: "image_url", image_url: { url: dataUrl } },
            ],
          },
        ],
        max_tokens: 300,
      }),
    });

    if (!res.ok) {
      await ctx.runMutation(internal.subscriptionData.recordNoAiInternal, {
        id: req._id,
      });
      return { scanned: false, passed: null, reason: `api-error-${res.status}` };
    }

    const json = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const content = json.choices?.[0]?.message?.content ?? "{}";
    let verdict: { passed?: boolean; reason?: string };
    try {
      verdict = JSON.parse(content);
    } catch {
      verdict = { passed: false, reason: "Could not parse the AI reply" };
    }

    const passed = !!verdict.passed;
    const reason = String(verdict.reason ?? "Scanned").slice(0, 300);
    await ctx.runMutation(internal.subscriptionData.recordScanInternal, {
      id: req._id,
      aiPassed: passed,
      aiVerdict: reason,
    });
    return { scanned: true, passed, reason };
  },
});
