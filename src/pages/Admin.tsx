import { useAuth } from "@/hooks/use-auth";
import { api } from "@/convex/_generated/api";
import { useAction, useMutation, useQuery } from "convex/react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { BadgeCheck, Loader2, Mail, ShieldOff, Trash2, Users } from "lucide-react";

/**
 * Site-owner control panel. Every query behind it re-checks the admin role
 * server-side; the page itself only renders for admins.
 */
export default function Admin() {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const overview = useQuery(api.adminData.overview);
  const users = useQuery(api.adminData.listUsers);
  const messages = useQuery(api.chat.listMessages);
  const deleteMessage = useMutation(api.adminData.deleteChatMessage);
  const sendCode = useAction(api.accounts.sendVerificationEmail);
  const verifyCode = useMutation(api.accounts.verifyEmailCode);

  const [codeSent, setCodeSent] = useState(false);
  const [code, setCode] = useState("");
  const [verifyError, setVerifyError] = useState<string | null>(null);

  useEffect(() => {
    document.title = "Admin — UltraVector";
    return () => {
      document.title = "UltraVector — Unblocked Games for School";
    };
  }, []);

  // Non-admins never see the panel — bounce them home.
  useEffect(() => {
    if (!isLoading && (!user || user.role !== "admin")) {
      navigate("/", { replace: true });
    }
  }, [isLoading, user, navigate]);

  if (isLoading || user === undefined) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </main>
    );
  }
  if (!user || user.role !== "admin") return null;

  const myEmailVerified = !!user.emailVerificationTime;

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
    if (code.trim().length !== 6) return;
    setVerifyError(null);
    try {
      await verifyCode({ code: code.trim() });
      setCodeSent(false);
      setCode("");
    } catch (e) {
      setVerifyError(e instanceof Error ? e.message : "Verification failed");
    }
  };

  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 pb-16 pt-10 sm:px-6">
      <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#00e5ff]">
        Control room
      </p>
      <h1 className="mt-1 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
        Admin <span className="text-rainbow">dashboard</span>
      </h1>

      {/* Email verification prompt for the admin's own account */}
      {!myEmailVerified && (
        <div className="neon-card mt-6 rounded-2xl border-[#ffe14d55] p-5">
          <p className="flex items-start gap-2 text-sm text-muted-foreground">
            <Mail className="mt-0.5 size-4 shrink-0 text-[#ffe14d]" />
            Verify your admin email to post in chat and appear fully verified in
            the directory. We&apos;ll email a 6-digit code to{" "}
            <span className="font-semibold text-foreground">{user.email}</span>.
          </p>
          {!codeSent ? (
            <button
              onClick={handleSendCode}
              className="btn-neon mt-3 rounded-full px-4 py-2 text-xs font-bold"
            >
              Email me a verification code
            </button>
          ) : (
            <div className="mt-3 flex gap-2">
              <input
                value={code}
                onChange={(e) =>
                  setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                placeholder="123456"
                inputMode="numeric"
                className="h-10 w-40 rounded-full border border-[#b026ff4d] bg-[#100824] px-4 text-sm tracking-[0.3em] outline-none focus:border-[#00e5ff88]"
              />
              <button
                onClick={handleVerify}
                disabled={code.length !== 6}
                className="btn-neon rounded-full px-4 py-2 text-xs font-bold disabled:opacity-50"
              >
                Verify
              </button>
            </div>
          )}
          {verifyError && (
            <p className="mt-2 text-xs text-[#ff2e63]">{verifyError}</p>
          )}
        </div>
      )}

      {/* Stats */}
      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: "Total users", value: overview?.totalUsers ?? "…" },
          { label: "Verified emails", value: overview?.verifiedUsers ?? "…" },
          { label: "Chat messages", value: overview?.totalMessages ?? "…" },
          { label: "Saved scores", value: overview?.totalScores ?? "…" },
        ].map((s) => (
          <div key={s.label} className="neon-card rounded-2xl p-5 text-center">
            <p className="font-display text-3xl font-extrabold text-rainbow">
              {s.value}
            </p>
            <p className="mt-1 text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
              {s.label}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-5">
        {/* User directory */}
        <section className="neon-card rounded-2xl p-6 lg:col-span-3">
          <div className="mb-4 flex items-center gap-2">
            <Users className="size-5 text-[#00e5ff]" />
            <h2 className="font-display text-lg font-bold">
              Account <span className="text-rainbow">directory</span>
            </h2>
          </div>
          {users === undefined ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Loading…
            </p>
          ) : (
            <div className="max-h-[480px] overflow-y-auto">
              <table className="w-full text-left text-sm">
                <thead className="sticky top-0 bg-[#0b0520] text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
                  <tr>
                    <th className="px-2 py-2">Username</th>
                    <th className="px-2 py-2">Email</th>
                    <th className="px-2 py-2">Status</th>
                    <th className="px-2 py-2">Role</th>
                    <th className="px-2 py-2">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr
                      key={u._id}
                      className="border-t border-[#b026ff1a] align-middle"
                    >
                      <td className="px-2 py-2 font-semibold">{u.username}</td>
                      <td className="max-w-[220px] truncate px-2 py-2 text-muted-foreground">
                        {u.email}
                      </td>
                      <td className="px-2 py-2">
                        {u.isAnonymous ? (
                          <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                            <ShieldOff className="size-3" /> guest
                          </span>
                        ) : u.emailVerified ? (
                          <span className="flex items-center gap-1 text-[11px] text-[#3dff8b]">
                            <BadgeCheck className="size-3" /> verified
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-[11px] text-[#ffe14d]">
                            <Mail className="size-3" /> unverified
                          </span>
                        )}
                      </td>
                      <td className="px-2 py-2">
                        {u.role ? (
                          <span className="rounded-full bg-[#b026ff33] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#c04bff]">
                            {u.role}
                          </span>
                        ) : (
                          <span className="text-[11px] text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-2 py-2 text-[11px] text-muted-foreground">
                        {new Date(u.joinedAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Chat moderation */}
        <section className="neon-card rounded-2xl p-6 lg:col-span-2">
          <div className="mb-4 flex items-center gap-2">
            <Trash2 className="size-5 text-[#ff2ea6]" />
            <h2 className="font-display text-lg font-bold">
              Chat <span className="text-rainbow">moderation</span>
            </h2>
          </div>
          {messages === undefined ? (
            <p className="py-6 text-center text-sm text-muted-foreground">Loading…</p>
          ) : messages.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No messages yet.
            </p>
          ) : (
            <div className="max-h-[480px] space-y-2 overflow-y-auto">
              {[...messages].reverse().map((m) => (
                <div
                  key={m._id}
                  className="flex items-start gap-2 rounded-xl border border-[#b026ff26] bg-[#0b0520]/60 px-3 py-2"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-[#00e5ff]">
                      {m.username}
                      <span className="ml-2 font-normal text-muted-foreground/60">
                        {new Date(m.createdAt).toLocaleString()}
                      </span>
                    </p>
                    <p className="break-words text-sm text-foreground/90">
                      {m.text}
                    </p>
                  </div>
                  <button
                    onClick={() => void deleteMessage({ messageId: m._id })}
                    className="shrink-0 rounded-lg border border-[#ff2ea655] p-1.5 text-[#ff2ea6] transition-colors hover:bg-[#ff2ea61a]"
                    aria-label="Delete message"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
          <p className="mt-3 text-[11px] text-muted-foreground">
            Deleting removes the message for everyone instantly.
          </p>
        </section>
      </div>
    </main>
  );
}
