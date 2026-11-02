import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQuery } from "convex/react";
import { Loader2, Lock, ShieldCheck, Timer } from "lucide-react";
import { useEffect, useRef, useState, Suspense } from "react";

/**
 * Screen lock. The player throws the lock (header padlock) so nobody can
 * touch their account if they walk away from the device. The PIN is hashed
 * with SHA-256 in the browser; only the hash is ever sent to the server.
 * While locked, a full-screen overlay blocks the whole app — even reloads,
 * because the locked state lives on the user record.
 */

async function sha256Hex(input: string): Promise<string> {
  const buf = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(input),
  );
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

const pinOk = (pin: string) => /^\d{4,8}$/.test(pin);

function ScreenLockInner() {
  const { isAuthenticated } = useAuth();
  const status = useQuery(api.screenlock.status);
  const setPinMutation = useMutation(api.screenlock.setPin);
  const lock = useMutation(api.screenlock.lock);
  const unlock = useMutation(api.screenlock.unlock);

  const [now, setNow] = useState(() => new Date());
  const [setupOpen, setSetupOpen] = useState(false);
  const [pin, setPin] = useState("");
  const [pin2, setPin2] = useState("");
  const [entry, setEntry] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [setupError, setSetupError] = useState<string | null>(null);
  const [lockedHint, setLockedHint] = useState<string | null>(null);
  const entryRef = useRef<HTMLInputElement>(null);

  // "Lock screen" is triggered from the header padlock via a window event,
  // which keeps the header dumb and avoids extra context plumbing.
  useEffect(() => {
    const onRequest = () => {
      if (!isAuthenticated) return;
      setSetupOpen(true);
      if (status?.hasPin) {
        setSetupOpen(false);
        void (async () => {
          try {
            await lock({});
          } catch (e) {
            setLockedHint(
              e instanceof Error ? e.message : "Could not lock",
            );
          }
        })();
      }
    };
    window.addEventListener("uv-lock-screen", onRequest);
    return () => window.removeEventListener("uv-lock-screen", onRequest);
  }, [isAuthenticated, status?.hasPin, lock]);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Focus the PIN field whenever the lock is on.
  useEffect(() => {
    if (status?.screenLocked) setTimeout(() => entryRef.current?.focus(), 50);
  }, [status?.screenLocked]);

  const handleSetup = async () => {
    if (!pinOk(pin) || busy) return;
    if (pin !== pin2) {
      setSetupError("PINs don't match");
      return;
    }
    setBusy(true);
    setSetupError(null);
    try {
      await setPinMutation({ pinHash: await sha256Hex(pin) });
      await lock({});
      setSetupOpen(false);
      setPin("");
      setPin2("");
    } catch (e) {
      setSetupError(e instanceof Error ? e.message : "Could not set PIN");
    } finally {
      setBusy(false);
    }
  };

  const handleUnlock = async () => {
    if (!pinOk(entry) || busy) return;
    setBusy(true);
    setError(null);
    try {
      await unlock({ pinHash: await sha256Hex(entry) });
      setEntry("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Wrong PIN");
    } finally {
      setBusy(false);
    }
  };

  if (status === undefined) return null;

  return (
    <>
      {/* ================= Lock overlay ================= */}
      {status.screenLocked && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#070214]/97 px-6 backdrop-blur-xl">
          <div className="rainbow-ring flex w-full max-w-sm flex-col items-center rounded-3xl bg-[#100824]/90 p-8 text-center">
            <span className="flex size-16 items-center justify-center rounded-2xl border border-[#b026ff66] bg-[#0b0520] shadow-[0_0_30px_rgba(176,38,255,0.5)]">
              <Lock className="size-8 text-[#00e5ff]" />
            </span>
            <p className="mt-4 font-display text-2xl font-extrabold">
              Screen locked
            </p>
            <p className="mt-1 flex items-center gap-1.5 font-display text-5xl font-extrabold text-rainbow tabular-nums">
              <Timer className="size-6 text-muted-foreground" />
              {now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Enter your PIN to get back in.
            </p>

            <input
              ref={entryRef}
              type="password"
              inputMode="numeric"
              value={entry}
              onChange={(e) => setEntry(e.target.value.replace(/\D/g, "").slice(0, 8))}
              onKeyDown={(e) => {
                if (e.key === "Enter") void handleUnlock();
              }}
              placeholder="••••"
              aria-label="Screen lock PIN"
              className="mt-6 h-12 w-full rounded-full border border-[#b026ff4d] bg-[#0b0520] text-center text-2xl tracking-[0.5em] outline-none focus:border-[#00e5ff88]"
            />
            <button
              onClick={() => void handleUnlock()}
              disabled={busy || !pinOk(entry)}
              className="btn-neon mt-4 flex h-11 w-full items-center justify-center rounded-full text-sm font-bold disabled:opacity-50"
            >
              {busy ? (
                <Loader2 className="size-5 animate-spin" />
              ) : (
                <>
                  <ShieldCheck className="mr-2 size-5" />
                  Unlock
                </>
              )}
            </button>
            {error && (
              <p className="mt-3 text-sm font-semibold text-[#ff2e63]">{error}</p>
            )}
            {lockedHint && (
              <p className="mt-3 text-xs text-muted-foreground">{lockedHint}</p>
            )}
          </div>
        </div>
      )}

      {/* ================= First-time PIN setup ================= */}
      {setupOpen && isAuthenticated && !status.screenLocked && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#070214]/80 px-4 backdrop-blur-md">
          <div className="neon-card w-full max-w-sm rounded-3xl p-7">
            <div className="mb-4 flex items-center gap-2.5">
              <span className="flex size-10 items-center justify-center rounded-xl border border-[#b026ff66] bg-[#0b0520]">
                <Lock className="size-5 text-[#00e5ff]" />
              </span>
              <div>
                <p className="font-display text-lg font-bold">Screen lock PIN</p>
                <p className="text-xs text-muted-foreground">
                  4–8 digits. Locked screens are private to you.
                </p>
              </div>
            </div>
            <input
              autoFocus
              type="password"
              inputMode="numeric"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 8))}
              placeholder="New PIN"
              className="h-11 w-full rounded-full border border-[#b026ff4d] bg-[#0b0520] px-4 text-center text-lg tracking-[0.4em] outline-none focus:border-[#00e5ff88]"
            />
            <input
              type="password"
              inputMode="numeric"
              value={pin2}
              onChange={(e) => setPin2(e.target.value.replace(/\D/g, "").slice(0, 8))}
              onKeyDown={(e) => {
                if (e.key === "Enter") void handleSetup();
              }}
              placeholder="Confirm PIN"
              className="mt-2.5 h-11 w-full rounded-full border border-[#b026ff4d] bg-[#0b0520] px-4 text-center text-lg tracking-[0.4em] outline-none focus:border-[#00e5ff88]"
            />
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => {
                  setSetupOpen(false);
                  setPin("");
                  setPin2("");
                  setSetupError(null);
                }}
                className="btn-ghost-neon flex-1 rounded-full py-2 text-sm font-bold"
              >
                Cancel
              </button>
              <button
                onClick={() => void handleSetup()}
                disabled={busy || !pinOk(pin) || !pinOk(pin2)}
                className="btn-neon flex-1 rounded-full py-2 text-sm font-bold disabled:opacity-50"
              >
                {busy ? <Loader2 className="mx-auto size-4 animate-spin" /> : "Lock now"}
              </button>
            </div>
            {setupError && (
              <p className="mt-3 text-center text-xs font-semibold text-[#ff2e63]">
                {setupError}
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default function ScreenLock() {
  return (
    <Suspense fallback={null}>
      <ScreenLockInner />
    </Suspense>
  );
}
