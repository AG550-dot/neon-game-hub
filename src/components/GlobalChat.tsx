import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import { useAction, useMutation, useQuery } from "convex/react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { BadgeCheck, Loader2, Mail, MessageCircle, Send, X } from "lucide-react";

/**
 * Floating global chat. Reading is open to everyone; posting requires a real
 * (non-anonymous) account with a verified email. The server profanity-filters
 * every message before it is stored.
 */
export default function GlobalChat() {
  const { user, isAuthenticated, isLoading } = useAuth();

  const [panelOpen, setPanelOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  // Email verification mini-flow state
  const [codeSent, setCodeSent] = useState(false);
  const [code, setCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);

  const messages = useQuery(api.chat.listMessages);
  const send = useMutation(api.chat.sendMessage);
  const sendCode = useAction(api.accounts.sendVerificationEmail);
  const verifyCode = useMutation(api.accounts.verifyEmailCode);

  const scrollRef = useRef<HTMLDivElement>(null);
  const lastReadId = useRef<string | null>(null);

  const latest = messages?.length ? messages[messages.length - 1] : null;

  // Auto-scroll to the newest message while the panel is open
  useEffect(() => {
    if (panelOpen && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages?.length, panelOpen]);

  // Track read state for the unread dot
  useEffect(() => {
    if (panelOpen && latest) lastReadId.current = latest._id;
  }, [panelOpen, latest]);
  const hasUnread = !panelOpen && !!latest && latest._id !== lastReadId.current;

  const canChat =
    isAuthenticated && !!user && !user.isAnonymous && !!user.emailVerificationTime;

  const handleSend = async () => {
    const text = draft.trim();
    if (!text || sending) return;
    setSending(true);
    setError(null);
    try {
      await send({ text });
      setDraft("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not send");
    } finally {
      setSending(false);
    }
  };

  const handleSendCode = async () => {
    setVerifyError(null);
    try {
      await sendCode({});
      setCodeSent(true);
    } catch (e) {
      setVerifyError(e instanceof Error ? e.message : "Could not send code");
    }
  };

  const handleVerify = async () => {
    if (code.trim().length !== 6 || verifying) return;
    setVerifying(true);
    setVerifyError(null);
    try {
      await verifyCode({ code: code.trim() });
      setCodeSent(false);
      setCode("");
    } catch (e) {
      setVerifyError(e instanceof Error ? e.message : "Verification failed");
    } finally {
      setVerifying(false);
    }
  };

  return (
    <>
      {/* Launcher button */}
      <button
        onClick={() => setPanelOpen((v) => !v)}
        className="btn-neon fixed bottom-5 right-5 z-50 flex h-12 items-center gap-2 rounded-full px-5 shadow-[0_0_24px_rgba(0,229,255,0.35)]"
        aria-label={panelOpen ? "Close chat" : "Open global chat"}
      >
        {panelOpen ? (
          <X className="size-5" />
        ) : (
          <>
            <MessageCircle className="size-5" />
            <span className="hidden text-sm font-bold sm:inline">Chat</span>
            {hasUnread && (
              <span className="absolute -right-1 -top-1 size-3.5 animate-pulse rounded-full border-2 border-[#070214] bg-[#ff2ea6]" />
            )}
          </>
        )}
      </button>

      {/* Panel */}
      {panelOpen && (
        <div className="neon-card fixed bottom-20 right-4 z-50 flex h-[480px] w-[min(92vw,380px)] flex-col overflow-hidden rounded-2xl border border-[#b026ff44] bg-[#0b0520]/97 shadow-[0_18px_60px_rgba(0,0,0,0.6)] backdrop-blur-xl sm:right-5">
          {/* Header */}
          <div className="flex items-center gap-2.5 border-b border-[#b026ff33] px-4 py-3">
            <MessageCircle className="size-4 text-[#00e5ff]" />
            <p className="font-display text-sm font-bold">Global Chat</p>
            <span className="ml-auto flex items-center gap-1 text-[10px] text-muted-foreground">
              <span className="size-1.5 rounded-full bg-[#3dff8b]" />
              live
            </span>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 space-y-2.5 overflow-y-auto px-4 py-3">
            {messages === undefined ? (
              <p className="pt-8 text-center text-xs text-muted-foreground">
                <Loader2 className="mx-auto size-4 animate-spin" />
              </p>
            ) : messages.length === 0 ? (
              <p className="pt-8 text-center text-xs text-muted-foreground">
                No messages yet — say hi! 👋
              </p>
            ) : (
              messages.map((m) => (
                <div key={m._id} className="text-sm leading-snug">
                  <span className="mr-2 font-bold text-[#00e5ff]">
                    {m.username}
                  </span>
                  <span className="text-[10px] text-muted-foreground/60">
                    {new Date(m.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  <p className="break-words text-foreground/90">{m.text}</p>
                </div>
              ))
            )}
          </div>

          {/* Composer / gates */}
          <div className="border-t border-[#b026ff33] px-4 py-3">
            {isLoading ? null : !isAuthenticated ? (
              <div className="text-center">
                <p className="text-xs text-muted-foreground">
                  Sign in to join the conversation.
                </p>
                <Link
                  to="/auth"
                  className="btn-neon mt-2 inline-flex rounded-full px-4 py-1.5 text-xs font-bold"
                >
                  Sign in
                </Link>
              </div>
            ) : user?.isAnonymous ? (
              <p className="text-center text-xs text-muted-foreground">
                You&apos;re in guest mode —{" "}
                <Link to="/auth" className="font-semibold text-[#00e5ff] hover:underline">
                  create a free account
                </Link>{" "}
                to chat.
              </p>
            ) : !user?.emailVerificationTime ? (
              <div>
                <p className="mb-2 flex items-start gap-1.5 text-[11px] text-muted-foreground">
                  <Mail className="mt-0.5 size-3.5 shrink-0 text-[#ffe14d]" />
                  Verify your email ({user?.email}) to chat. We&apos;ll send you
                  a 6-digit code.
                </p>
                {!codeSent ? (
                  <button
                    onClick={handleSendCode}
                    className="btn-neon w-full rounded-full px-3 py-1.5 text-xs font-bold"
                  >
                    Email me a code
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <input
                      value={code}
                      onChange={(e) =>
                        setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                      }
                      placeholder="123456"
                      inputMode="numeric"
                      className="h-9 min-w-0 flex-1 rounded-full border border-[#b026ff4d] bg-[#100824] px-3 text-sm tracking-[0.3em] outline-none focus:border-[#00e5ff88]"
                    />
                    <button
                      onClick={handleVerify}
                      disabled={verifying || code.length !== 6}
                      className="btn-neon shrink-0 rounded-full px-3.5 py-1.5 text-xs font-bold disabled:opacity-50"
                    >
                      {verifying ? <Loader2 className="size-3.5 animate-spin" /> : "Verify"}
                    </button>
                  </div>
                )}
                {verifyError && (
                  <p className="mt-1.5 text-[11px] text-[#ff2e63]">{verifyError}</p>
                )}
              </div>
            ) : (
              <>
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
                    placeholder="Say something…"
                    maxLength={280}
                    className="h-10 min-w-0 flex-1 rounded-full border border-[#b026ff4d] bg-[#100824] px-4 text-sm outline-none focus:border-[#00e5ff88]"
                    aria-label="Chat message"
                  />
                  <button
                    onClick={() => void handleSend()}
                    disabled={sending || !draft.trim()}
                    className="btn-neon flex size-10 shrink-0 items-center justify-center rounded-full disabled:opacity-50"
                    aria-label="Send"
                  >
                    {sending ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Send className="size-4" />
                    )}
                  </button>
                </div>
                {error && <p className="mt-1.5 text-[11px] text-[#ff2e63]">{error}</p>}
                <p className="mt-1.5 flex items-center gap-1 text-[10px] text-muted-foreground/70">
                  <BadgeCheck className="size-3 text-[#3dff8b]" />
                  Keep it friendly — messages are filtered.
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
