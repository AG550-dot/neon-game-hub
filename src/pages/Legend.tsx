import NeonHeader from "@/components/NeonHeader";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useAction, useMutation, useQuery } from "convex/react";
import {
  BadgeCheck,
  Ban,
  CheckCircle2,
  Crown,
  Loader2,
  ScanSearch,
  Send,
  ShieldCheck,
  Sparkles,
  Upload,
  Wallet,
  Zap,
} from "lucide-react";
import { useEffect, useRef, useState, Suspense } from "react";
import { Link } from "react-router";

const BANK = {
  name: "Pallavi Manuboti",
  account: "64195214",
  sortCode: "04-00-05",
  amount: "£10.00",
};

function LegendInner() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const state = useQuery(api.subscriptions.myStatus);
  const pending = useQuery(api.subscriptions.listPending); // null unless admin
  const generateUploadUrl = useMutation(api.subscriptions.generateUploadUrl);
  const submitRequest = useMutation(api.subscriptions.request);
  const runScan = useAction(api.subscriptionAi.runScan);
  const review = useMutation(api.subscriptions.review);

  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    document.title = "Legend Subscription — £10 | UltraVector";
    return () => {
      document.title = "UltraVector — Unblocked Games for School";
    };
  }, []);

  const myName = user?.username ?? user?.name ?? "player";

  const handleUpload = async (file: File) => {
    setError(null);
    setNotice(null);
    if (file.size > 6 * 1024 * 1024) {
      setError("That image is over 6 MB — screenshot it instead.");
      return;
    }
    setUploading(true);
    try {
      const url = await generateUploadUrl({});
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": file.type || "application/octet-stream" },
        body: file,
      });
      const { storageId } = (await res.json()) as { storageId: string };
      await submitRequest({
        storageId: storageId as Id<"_storage">,
        note: "£10 bank transfer",
      });
      setNotice("Received — running the AI check next…");
      setUploading(false);
      setScanning(true);
      try {
        const result = await runScan({});
        if (!result.scanned && result.reason === "no-api-key") {
          setNotice("Saved. The AI checker isn't set up yet — an admin will review it manually.");
        } else {
          setNotice(
            result.passed
              ? "AI check passed! An admin will finalise your Legend status shortly."
              : "AI check flagged this screenshot — double-check it shows a £10 transfer, then ask an admin to look.",
          );
        }
      } finally {
        setScanning(false);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
      setUploading(false);
      setScanning(false);
    }
  };

  const ref = myName;

  return (
    <div className="flex min-h-screen flex-col">
      <NeonHeader />

      <main className="flex-1">
        {/* Hero */}
        <section className="bg-grid relative overflow-hidden px-4 py-12 sm:px-6">
          <div className="pointer-events-none absolute -top-24 left-1/2 size-[420px] -translate-x-1/2 rounded-full bg-[#ffe14d]/15 blur-[120px]" />
          <div className="relative mx-auto max-w-4xl text-center">
            <Badge variant="outline" className="neon-chip mb-4 border-none px-3 py-1 text-xs font-semibold">
              <Crown className="mr-1.5 size-3.5 text-[#ffe14d]" />
              Legend subscription · one-time
            </Badge>
            <h1 className="font-display text-4xl font-extrabold tracking-tight sm:text-5xl">
              Become a <span className="text-rainbow glow-text">Legend</span>
            </h1>
            <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
              £10 gets you a permanent gold chat banner, styled chat text and a
              permanent slot on the Legends leaderboard. Paid by bank transfer —
              screenshot the confirmation, our AI checks it, an admin approves it.
            </p>
          </div>
        </section>

        <section className="mx-auto w-full max-w-4xl px-4 pb-16 sm:px-6">
          {/* Perks */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="neon-card rounded-2xl p-6 text-center">
              <Crown className="mx-auto size-8 text-[#ffe14d]" />
              <h3 className="mt-3 font-display text-base font-bold">Gold chat banner</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Your name turns gold with a 👑 LEGEND crown in chat.
              </p>
            </div>
            <div className="neon-card rounded-2xl p-6 text-center">
              <Sparkles className="mx-auto size-8 text-[#ff2ea6]" />
              <h3 className="mt-3 font-display text-base font-bold">Cool chat text</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Your messages glow with premium rainbow styling.
              </p>
            </div>
            <div className="neon-card rounded-2xl p-6 text-center">
              <Zap className="mx-auto size-8 text-[#00e5ff]" />
              <h3 className="mt-3 font-display text-base font-bold">Legends leaderboard</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                A permanent slot on the Legends board — forever.
              </p>
            </div>
          </div>

          {/* Payment card */}
          <div className="neon-card mt-8 rounded-2xl p-6 sm:p-8">
            <div className="flex items-center gap-3">
              <Wallet className="size-6 text-[#3dff8b]" />
              <h2 className="font-display text-xl font-bold">
                Step 1 — send the <span className="text-rainbow">£10 bank transfer</span>
              </h2>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-[#b026ff33] bg-[#0b0520]/70 p-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Account name</p>
                <p className="mt-1 font-display text-lg font-bold">{BANK.name}</p>
              </div>
              <div className="rounded-xl border border-[#b026ff33] bg-[#0b0520]/70 p-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Account number</p>
                <p className="mt-1 font-display text-lg font-bold tracking-wider">{BANK.account}</p>
              </div>
              <div className="rounded-xl border border-[#b026ff33] bg-[#0b0520]/70 p-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Sort code</p>
                <p className="mt-1 font-display text-lg font-bold tracking-wider">{BANK.sortCode}</p>
              </div>
              <div className="rounded-xl border border-[#3dff8b55] bg-[#3dff8b0d] p-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Amount</p>
                <p className="mt-1 font-display text-lg font-bold text-[#3dff8b]">{BANK.amount}</p>
              </div>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              📝 <span className="font-semibold text-foreground">Reference:</span>{" "}
              <span className="font-mono font-bold text-[#00e5ff]">{ref}</span>{" "}
              — use your username so we can match the payment.
            </p>
          </div>

          {/* Step 2 — upload */}
          <div className="neon-card mt-6 rounded-2xl p-6 sm:p-8">
            <div className="flex items-center gap-3">
              <Upload className="size-6 text-[#00e5ff]" />
              <h2 className="font-display text-xl font-bold">Step 2 — upload your screenshot</h2>
            </div>

            {isLoading ? (
              <Loader2 className="mx-auto mt-6 size-5 animate-spin text-muted-foreground" />
            ) : !isAuthenticated ? (
              <div className="mt-5 text-center">
                <p className="text-sm text-muted-foreground">
                  Sign in so your upload connects to your account.
                </p>
                <Link to="/auth?returnTo=%2Flegend" className="btn-neon mt-3 inline-flex rounded-full px-6 py-2.5 text-sm font-bold">
                  Sign in to continue
                </Link>
              </div>
            ) : state?.subscription ? (
              <div className="mt-5 rounded-xl border border-[#3dff8b55] bg-[#3dff8b0d] p-5 text-center">
                <CheckCircle2 className="mx-auto size-8 text-[#3dff8b]" />
                <p className="mt-2 font-display text-lg font-bold text-[#3dff8b]">
                  You're a Legend! 🎉
                </p>
                <p className="text-sm text-muted-foreground">
                  Your gold banner is live in chat and your name is on{" "}
                  <Link to="/legends" className="font-semibold text-[#00e5ff] hover:underline">
                    the Legends board
                  </Link>
                  .
                </p>
              </div>
            ) : (
              <>
                <p className="mt-4 text-sm text-muted-foreground">
                  2️⃣ Screenshot the confirmation after the transfer, then upload it
                  here. The AI checker reads it automatically, and the admin gives
                  the final green light.
                </p>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) void handleUpload(f);
                  }}
                />
                <button
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading || scanning}
                  className="btn-neon mt-5 flex h-12 w-full items-center justify-center rounded-full text-sm font-bold disabled:opacity-60"
                >
                  {uploading ? (
                    <Loader2 className="mr-2 size-5 animate-spin" />
                  ) : (
                    <Upload className="mr-2 size-5" />
                  )}
                  {uploading ? "Uploading…" : "Choose screenshot"}
                </button>

                {(uploading || scanning || state?.request) && (
                  <div className="mt-5 rounded-xl border border-[#b026ff33] bg-[#0b0520]/70 p-5">
                    <p className="flex items-center gap-2 font-display text-sm font-bold">
                      <ScanSearch className="size-4 text-[#00e5ff]" />
                      Verification status
                    </p>
                    <div className="mt-3 grid gap-4 sm:grid-cols-[160px,1fr]">
                      {state?.imageUrl && (
                        <img
                          src={state.imageUrl}
                          alt="Uploaded transfer proof"
                          className="h-32 w-full rounded-lg border border-[#b026ff33] object-cover"
                        />
                      )}
                      <div className="text-sm">
                        {scanning ? (
                          <p className="flex items-center gap-2 text-muted-foreground">
                            <Loader2 className="size-4 animate-spin" />
                            AI is reading your screenshot…
                          </p>
                        ) : state?.request ? (
                          <>
                            <p>
                              <span className="text-muted-foreground">Status:</span>{" "}
                              <span className="font-bold">
                                {state.request.status === "ai_passed"
                                  ? "AI check passed ✅ — awaiting admin approval"
                                  : state.request.status === "ai_flagged"
                                    ? "Flagged by AI ⚠️ — admin will double-check"
                                    : "Pending review"}
                              </span>
                            </p>
                            {state.request.aiVerdict && (
                              <p className="mt-2 text-xs text-muted-foreground">
                                AI: “{state.request.aiVerdict}”
                              </p>
                            )}
                          </>
                        ) : (
                          <p className="text-muted-foreground">
                            Waiting for your screenshot…
                          </p>
                        )}
                        {notice && (
                          <p className="mt-2 text-xs text-[#3dff8b]">{notice}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {error && (
                  <p className="mt-3 flex items-center gap-1.5 text-sm font-semibold text-[#ff2e63]">
                    <Ban className="size-4" /> {error}
                  </p>
                )}
                <p className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <ShieldCheck className="size-3.5 text-[#3dff8b]" />
                  It's a real picture check by AI — make sure the £10 amount and
                  the account name are visible.
                </p>
              </>
            )}
          </div>

          {/* Admin queue */}
          {pending && pending.length > 0 && (
            <div className="neon-card mt-6 rounded-2xl p-6 sm:p-8">
              <h2 className="font-display text-xl font-bold">
                👮 Admin queue — {pending.length} pending
              </h2>
              <div className="mt-4 space-y-4">
                {pending.map((p) => (
                  <div key={p._id} className="grid gap-4 rounded-xl border border-[#b026ff33] bg-[#0b0520]/70 p-4 sm:grid-cols-[160px,1fr]">
                    {p.imageUrl && (
                      <img
                        src={p.imageUrl}
                        alt={`Proof from ${p.username}`}
                        className="h-32 w-full rounded-lg border border-[#b026ff33] object-cover"
                      />
                    )}
                    <div>
                      <p className="font-bold">
                        {p.username}{" "}
                        <span className="text-xs font-normal text-muted-foreground">
                          {new Date(p.createdAt).toLocaleString()}
                        </span>
                      </p>
                      {p.aiVerdict && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          AI {p.aiPassed === true ? "✅ passed" : p.aiPassed === false ? "⚠️ flagged" : "— not scanned"}:{" "}
                          “{p.aiVerdict}”
                        </p>
                      )}
                      {p.note && <p className="mt-1 text-xs text-muted-foreground">Note: {p.note}</p>}
                      <div className="mt-3 flex gap-2">
                        <button
                          onClick={() => void review({ id: p._id, approve: true }).catch(() => {})}
                          className="btn-neon flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-bold"
                        >
                          <BadgeCheck className="size-3.5" /> Approve
                        </button>
                        <button
                          onClick={() => void review({ id: p._id, approve: false }).catch(() => {})}
                          className="btn-ghost-neon rounded-full px-4 py-1.5 text-xs font-bold text-[#ff2e63]"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <p className="mt-8 text-center text-xs text-muted-foreground">
            Payments are reviewed by hand. Legend status is permanent once approved.
          </p>
        </section>
      </main>

      <footer className="border-t border-[#b026ff26] py-6 text-center text-xs text-muted-foreground">
        UltraVector — free unblocked games for school. Play responsibly 😉
      </footer>
    </div>
  );
}

export default function Legend() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center text-muted-foreground">Loading…</div>}>
      <LegendInner />
    </Suspense>
  );
}
