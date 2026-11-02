import NeonHeader from "@/components/NeonHeader";
import { Badge } from "@/components/ui/badge";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { Crown, Flame, Loader2, Trophy } from "lucide-react";
import { useEffect, Suspense } from "react";
import { Link } from "react-router";

function tierChip(tier: "legend" | "demon") {
  if (tier === "demon") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-[#ff2e6388] bg-[#ff2e631a] px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest text-[#ff5d84]">
        👹 DEMON ADMIN
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-[#ffe14d88] bg-[#ffe14d14] px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest text-[#ffe14d]">
      👑 LEGEND
    </span>
  );
}

function LegendsInner() {
  const data = useQuery(api.subscriptions.listLegends);

  useEffect(() => {
    document.title = "The Legends — UltraVector";
    return () => {
      document.title = "UltraVector — Unblocked Games for School";
    };
  }, []);

  return (
    <div className="flex min-h-screen flex-col">
      <NeonHeader />

      <main className="flex-1">
        <section className="bg-grid relative overflow-hidden px-4 py-12 sm:px-6">
          <div className="pointer-events-none absolute -top-24 left-1/2 size-[420px] -translate-x-1/2 rounded-full bg-[#ffe14d]/15 blur-[120px]" />
          <div className="relative mx-auto max-w-4xl text-center">
            <Badge variant="outline" className="neon-chip mb-4 border-none px-3 py-1 text-xs font-semibold">
              <Trophy className="mr-1.5 size-3.5 text-[#ffe14d]" />
              Hall of fame · permanent members
            </Badge>
            <h1 className="font-display text-4xl font-extrabold tracking-tight sm:text-5xl">
              The <span className="text-rainbow glow-text">Legends</span>
            </h1>
            <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
              Everyone here backed the arcade with the £10 Legend sub — their
              slot on this board is permanent, and their chat banner proves it.
              Want in?{" "}
              <Link to="/legend" className="font-semibold text-[#ffe14d] hover:underline">
                Become a Legend →
              </Link>
            </p>
          </div>
        </section>

        <section className="mx-auto w-full max-w-4xl px-4 pb-20 sm:px-6">
          {data === undefined ? (
            <p className="pt-10 text-center text-muted-foreground">
              <Loader2 className="mx-auto size-5 animate-spin" />
            </p>
          ) : (
            <div className="space-y-3">
              {data.owner && (
                <div
                  className="neon-card relative flex items-center gap-4 overflow-hidden rounded-2xl border-[#ff2e6355] p-5"
                  style={{
                    boxShadow:
                      "0 0 24px rgba(255,46,99,0.35), inset 0 0 30px rgba(255,46,99,0.08)",
                  }}
                >
                  <span className="demon-aura pointer-events-none absolute inset-0 opacity-40" />
                  <span className="relative flex size-14 shrink-0 items-center justify-center rounded-2xl border border-[#ff2e6388] bg-[#1a0a12] text-3xl">
                    👹
                  </span>
                  <div className="relative min-w-0 flex-1">
                    <p
                      className="animate-pulse bg-gradient-to-r from-[#ff2e63] via-[#ff5d84] to-[#b026ff] bg-clip-text font-display text-2xl font-extrabold text-transparent"
                    >
                      {data.owner.username}
                    </p>
                    <p className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Flame className="size-3.5 text-[#ff2e63]" />
                      Site owner · demon aura · rules the whole vault
                    </p>
                  </div>
                  <div className="relative">{tierChip("demon")}</div>
                </div>
              )}

              {data.legends.length === 0 ? (
                <div className="neon-card rounded-2xl p-10 text-center">
                  <Crown className="mx-auto size-10 text-[#ffe14d]" />
                  <p className="mt-3 font-display text-lg font-bold">
                    No Legends yet — the crown is unclaimed
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Be the very first name on this board.
                  </p>
                  <Link to="/legend" className="btn-neon mt-5 inline-flex rounded-full px-6 py-2.5 text-sm font-bold">
                    Become the first Legend →
                  </Link>
                </div>
              ) : (
                data.legends.map((l, i) => (
                  <div
                    key={l.userId}
                    className="neon-card flex items-center gap-4 rounded-2xl border-[#ffe14d33] p-4 shadow-[0_0_18px_rgba(255,225,77,0.12)]"
                  >
                    <span className="font-display text-2xl font-extrabold text-[#ffe14d]/60 tabular-nums">
                      #{i + 1}
                    </span>
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-[#ffe14d55] bg-[#1a1206] text-xl">
                      👑
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="bg-gradient-to-r from-[#ffe14d] to-[#ff9d5c] bg-clip-text font-display text-lg font-extrabold text-transparent">
                        {l.username}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Legend since{" "}
                        {new Date(l.since).toLocaleDateString(undefined, {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    {tierChip("legend")}
                  </div>
                ))
              )}
            </div>
          )}
        </section>
      </main>

      <footer className="border-t border-[#b026ff26] py-6 text-center text-xs text-muted-foreground">
        UltraVector — free unblocked games for school. Play responsibly 😉
      </footer>
    </div>
  );
}

export default function Legends() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center text-muted-foreground">Loading legends…</div>}>
      <LegendsInner />
    </Suspense>
  );
}
