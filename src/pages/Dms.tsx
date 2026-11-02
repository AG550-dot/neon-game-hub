import NeonHeader from "@/components/NeonHeader";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { ArrowLeft, Crown, Loader2, Search, Send, Users } from "lucide-react";
import { useEffect, useRef, useState, Suspense } from "react";

function DmsInner() {
  const { user } = useAuth();
  const people = useQuery(api.dms.listUsers);
  const send = useMutation(api.dms.send);

  const [selected, setSelected] = useState<Id<"users"> | null>(null);
  const [search, setSearch] = useState("");
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const thread = useQuery(
    api.dms.thread,
    selected ? { otherId: selected } : "skip",
  );

  const selectedUser = people?.find((p) => p.userId === selected);

  useEffect(() => {
    document.title = "Messages — UltraVector";
    return () => {
      document.title = "UltraVector — Unblocked Games for School";
    };
  }, []);

  useEffect(() => {
    if (thread && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [thread?.length, selected]);

  const filtered = (people ?? []).filter((p) =>
    p.username.toLowerCase().includes(search.trim().toLowerCase()),
  );

  const handleSend = async () => {
    const text = draft.trim();
    if (!selected || !text || sending) return;
    setSending(true);
    setError(null);
    try {
      await send({ otherId: selected, text });
      setDraft("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not send");
    } finally {
      setSending(false);
    }
  };

  const tierDot = (tier: string | null) =>
    tier === "demon" ? (
      <span title="Demon admin — site owner" className="text-sm">👹</span>
    ) : tier === "legend" ? (
      <span title="Legend subscriber" className="text-sm">👑</span>
    ) : null;

  const nameClass = (tier: string | null) =>
    tier === "demon"
      ? "bg-gradient-to-r from-[#ff2e63] to-[#b026ff] bg-clip-text font-extrabold text-transparent"
      : tier === "legend"
        ? "bg-gradient-to-r from-[#ffe14d] to-[#ff9d5c] bg-clip-text font-extrabold text-transparent"
        : "";

  return (
    <div className="flex min-h-screen flex-col">
      <NeonHeader />

      <main className="container mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6">
        <div className="neon-card grid h-[calc(100vh-150px)] min-h-[480px] grid-cols-1 gap-0 overflow-hidden rounded-2xl lg:grid-cols-[300px,1fr]">
          {/* Directory */}
          <div
            className={`flex min-h-0 flex-col border-b border-[#b026ff33] lg:border-b-0 lg:border-r ${
              selected ? "hidden lg:flex" : "flex"
            }`}
          >
            <div className="flex items-center gap-2 border-b border-[#b026ff26] px-4 py-3">
              <Users className="size-4 text-[#00e5ff]" />
              <p className="font-display text-sm font-bold">Everyone</p>
              <span className="ml-auto text-[10px] text-muted-foreground">
                {filtered.length}
              </span>
            </div>
            <div className="relative border-b border-[#b026ff26] px-3 py-2.5">
              <Search className="pointer-events-none absolute left-6 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search players…"
                className="h-9 w-full rounded-full border border-[#b026ff4d] bg-[#100824] pl-8 pr-3 text-sm outline-none focus:border-[#00e5ff88]"
                aria-label="Search players"
              />
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto">
              {people === undefined ? (
                <Loader2 className="mx-auto mt-8 size-5 animate-spin text-muted-foreground" />
              ) : filtered.length === 0 ? (
                <p className="mt-8 px-4 text-center text-xs text-muted-foreground">
                  Nobody here yet — invite a friend to sign up.
                </p>
              ) : (
                filtered.map((p) => (
                  <button
                    key={p.userId}
                    onClick={() => setSelected(p.userId)}
                    className={`flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors hover:bg-[#b026ff1a] ${
                      selected === p.userId ? "bg-[#00e5ff14]" : ""
                    }`}
                  >
                    {tierDot(p.tier)}
                    <span className={`min-w-0 flex-1 truncate ${nameClass(p.tier)}`}>
                      {p.username}
                    </span>
                    {p.userId === user?._id && (
                      <span className="text-[10px] text-muted-foreground/60">you</span>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Thread */}
          <div className={`flex min-h-0 flex-col ${selected ? "flex" : "hidden lg:flex"}`}>
            {!selected ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
                <Users className="size-10 text-muted-foreground" />
                <p className="font-display text-lg font-bold">Pick someone to chat with</p>
                <p className="max-w-sm text-sm text-muted-foreground">
                  Every player's username is in the left panel — tap one to open a
                  private DM thread. 👹 = site owner, 👑 = Legend.
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3 border-b border-[#b026ff26] px-4 py-3">
                  <button
                    onClick={() => setSelected(null)}
                    className="btn-ghost-neon inline-flex size-8 items-center justify-center rounded-full lg:hidden"
                    aria-label="Back to list"
                  >
                    <ArrowLeft className="size-4" />
                  </button>
                  {tierDot(selectedUser?.tier ?? null)}
                  <p
                    className={`truncate font-display text-sm font-bold ${
                      nameClass(selectedUser?.tier ?? null)
                    }`}
                  >
                    {selectedUser?.username ?? "Loading…"}
                  </p>
                  <span className="ml-auto flex items-center gap-1 text-[10px] text-muted-foreground">
                    <span className="size-1.5 rounded-full bg-[#3dff8b]" /> live
                  </span>
                </div>

                <div ref={scrollRef} className="min-h-0 flex-1 space-y-2 overflow-y-auto px-4 py-4">
                  {thread === undefined ? (
                    <Loader2 className="mx-auto mt-6 size-5 animate-spin text-muted-foreground" />
                  ) : thread.length === 0 ? (
                    <p className="mt-8 text-center text-xs text-muted-foreground">
                      No messages yet — say hi 👋
                    </p>
                  ) : (
                    thread.map((m) => (
                      <div key={m._id} className={`flex ${m.mine ? "justify-end" : "justify-start"}`}>
                        <div
                          className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-sm ${
                            m.mine
                              ? "bg-gradient-to-br from-[#00e5ff22] to-[#b026ff22] text-foreground"
                              : "bg-[#100824] text-foreground/90"
                          }`}
                        >
                          <p className="break-words whitespace-pre-wrap">{m.text}</p>
                          <p className="mt-0.5 text-right text-[9px] text-muted-foreground/60">
                            {new Date(m.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="border-t border-[#b026ff33] px-4 py-3">
                  <div className="flex gap-2">
                    <input
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          void handleSend();
                        }
                      }}
                      placeholder={`Message ${selectedUser?.username ?? "…"}…`}
                      maxLength={500}
                      aria-label="Message"
                      className="h-10 min-w-0 flex-1 rounded-full border border-[#b026ff4d] bg-[#100824] px-4 text-sm outline-none focus:border-[#00e5ff88]"
                    />
                    <button
                      onClick={() => void handleSend()}
                      disabled={sending || !draft.trim()}
                      className="btn-neon flex size-10 shrink-0 items-center justify-center rounded-full disabled:opacity-50"
                      aria-label="Send message"
                    >
                      {sending ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <Send className="size-4" />
                      )}
                    </button>
                  </div>
                  {error && (
                    <p className="mt-1.5 text-[11px] text-[#ff2e63]">{error}</p>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function Dms() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center text-muted-foreground">Loading messages…</div>}>
      <DmsInner />
    </Suspense>
  );
}
