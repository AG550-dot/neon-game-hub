import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

import { useAuth } from "@/hooks/use-auth";
import { ArrowRight, ArrowLeft, Gamepad2, Loader2, Mail, Sparkles, UserX, Zap } from "lucide-react";
import { useEffect, useState, Suspense } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";

interface AuthProps {
  redirectAfterAuth?: string;
}

function resolveRedirectAfterAuth(
  returnTo: string | null,
  fallback = "/dashboard",
) {
  if (returnTo?.startsWith("/") && !returnTo.startsWith("//")) {
    return returnTo;
  }
  return fallback;
}

function AuthInner({ redirectAfterAuth }: { redirectAfterAuth?: string }) {
  const { isLoading: authLoading, isAuthenticated, signIn } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = resolveRedirectAfterAuth(
    searchParams.get("returnTo"),
    redirectAfterAuth,
  );

  const [mode, setMode] = useState<"signIn" | "signUp">("signIn");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Legacy email-OTP flow (kept as an alternative way in)
  const [otpEmail, setOtpEmail] = useState<string | null>(null);
  const [otp, setOtp] = useState("");

  const handleCredentialsSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const formData = new FormData(event.currentTarget);
      if (mode === "signUp") {
        await signIn("password", {
          flow: "signUp",
          email: String(formData.get("email") ?? ""),
          username: String(formData.get("username") ?? ""),
          password: String(formData.get("password") ?? ""),
        });
      } else {
        await signIn("password", {
          flow: "signIn",
          email: String(formData.get("email") ?? ""),
          password: String(formData.get("password") ?? ""),
        });
      }
      navigate(redirect);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message.replace(/^Error:\s*/, "")
          : "Something went wrong. Please try again.",
      );
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.set("email", otpEmail ?? "");
      formData.set("code", otp);
      await signIn("email-otp", formData);
      navigate(redirect);
    } catch {
      setError("The verification code you entered is incorrect.");
      setIsLoading(false);
      setOtp("");
    }
  };

  const handleGuestLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await signIn("anonymous");
      navigate(redirect);
    } catch (err) {
      console.error("Guest login error:", err);
      setError("Failed to sign in as guest. Please try again.");
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate(redirect);
    }
  }, [authLoading, isAuthenticated, navigate, redirect]);

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden">
      {/* Ambient neon backdrop */}
      <div className="bg-grid pointer-events-none absolute inset-0 opacity-60" />
      <div className="pointer-events-none absolute -left-32 top-0 size-96 rounded-full bg-[#ff2ea6]/15 blur-[130px]" />
      <div className="pointer-events-none absolute -right-32 bottom-0 size-96 rounded-full bg-[#00e5ff]/15 blur-[130px]" />

      {/* Mini header */}
      <header className="relative z-10">
        <div className="h-[2px] w-full bg-rainbow" />
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link to="/" className="group flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-xl border border-[#b026ff66] bg-[#0b0520] shadow-[0_0_18px_rgba(176,38,255,0.45)] transition-shadow group-hover:shadow-[0_0_26px_rgba(0,229,255,0.5)]">
              <Gamepad2 className="size-5 text-[#00e5ff]" />
            </span>
            <span className="font-display text-lg font-bold tracking-tight">
              <span className="text-rainbow">UltraVector</span>
            </span>
          </Link>
          <Button asChild variant="ghost" className="btn-ghost-neon">
            <Link to="/games">
              <Zap className="mr-2 size-4 text-[#ffe14d]" />
              Just play instead
            </Link>
          </Button>
        </div>
      </header>

      {/* Auth content */}
      <main className="relative z-10 flex flex-1 items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <Card className="rainbow-ring border-none bg-[#100824]/90 shadow-[0_0_60px_rgba(176,38,255,0.25)] backdrop-blur-xl">
            {otpEmail ? (
              <>
                <CardHeader className="text-center">
                  <CardTitle className="font-display text-2xl">
                    Check your <span className="text-rainbow">email</span>
                  </CardTitle>
                  <CardDescription>
                    We&apos;ve sent a neon code to {otpEmail}
                  </CardDescription>
                </CardHeader>
                <form onSubmit={handleOtpSubmit}>
                  <CardContent className="pb-4">
                    <div className="flex justify-center">
                      <InputOTP
                        value={otp}
                        onChange={setOtp}
                        maxLength={6}
                        disabled={isLoading}
                        onKeyDown={(e) => {
                          if (
                            e.key === "Enter" &&
                            otp.length === 6 &&
                            !isLoading
                          ) {
                            const form = (e.target as HTMLElement).closest(
                              "form",
                            );
                            if (form) {
                              form.requestSubmit();
                            }
                          }
                        }}
                      >
                        <InputOTPGroup>
                          {Array.from({ length: 6 }).map((_, index) => (
                            <InputOTPSlot key={index} index={index} />
                          ))}
                        </InputOTPGroup>
                      </InputOTP>
                    </div>
                    {error && (
                      <p className="mt-2 text-center text-sm text-[#ff2e63]">
                        {error}
                      </p>
                    )}
                    <p className="mt-4 text-center text-sm text-muted-foreground">
                      Didn&apos;t receive a code?{" "}
                      <Button
                        variant="link"
                        className="h-auto p-0 text-[#00e5ff]"
                        onClick={() => setOtpEmail(null)}
                      >
                        Try again
                      </Button>
                    </p>
                  </CardContent>
                  <CardFooter className="flex-col gap-2">
                    <Button
                      type="submit"
                      className="btn-neon w-full"
                      disabled={isLoading || otp.length !== 6}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-4 w-4" />
                          Verify code
                        </>
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setOtpEmail(null)}
                      disabled={isLoading}
                      className="btn-ghost-neon w-full"
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Use different email
                    </Button>
                  </CardFooter>
                </form>
              </>
            ) : (
              <>
                <CardHeader className="text-center">
                  <div className="mb-2 flex justify-center">
                    <span className="animate-float flex size-14 items-center justify-center rounded-2xl border border-[#b026ff66] bg-[#0b0520] shadow-[0_0_24px_rgba(176,38,255,0.5)]">
                      <Gamepad2 className="size-7 text-[#00e5ff]" />
                    </span>
                  </div>
                  <CardTitle className="font-display text-2xl">
                    {mode === "signUp" ? (
                      <>
                        Join the <span className="text-rainbow">vault</span>
                      </>
                    ) : (
                      <>
                        Enter the <span className="text-rainbow">members&apos; lounge</span>
                      </>
                    )}
                  </CardTitle>
                  <CardDescription>
                    {mode === "signUp"
                      ? "Pick a username, verify your email, save scores and climb the leaderboards."
                      : "Sign in with your username or email and password."}
                  </CardDescription>
                </CardHeader>

                <form onSubmit={handleCredentialsSubmit}>
                  <CardContent className="space-y-3">
                    {mode === "signUp" && (
                      <div className="relative">
                        <Gamepad2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          name="username"
                          placeholder="username (letters, numbers, _)"
                          autoComplete="username"
                          minLength={3}
                          maxLength={16}
                          pattern="[A-Za-z0-9_]+"
                          title="3–16 letters, numbers or underscores"
                          className="border-[#b026ff4d] bg-[#0b0520] pl-9 focus-visible:ring-[#00e5ff]"
                          disabled={isLoading}
                          required
                        />
                      </div>
                    )}
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        name="email"
                        placeholder={mode === "signUp" ? "email" : "username or email"}
                        type={mode === "signUp" ? "email" : "text"}
                        autoComplete="email"
                        className="border-[#b026ff4d] bg-[#0b0520] pl-9 focus-visible:ring-[#00e5ff]"
                        disabled={isLoading}
                        required
                      />
                    </div>
                    <div className="relative">
                      <Sparkles className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        name="password"
                        placeholder="password (8+ characters)"
                        type="password"
                        autoComplete={mode === "signUp" ? "new-password" : "current-password"}
                        minLength={8}
                        className="border-[#b026ff4d] bg-[#0b0520] pl-9 focus-visible:ring-[#00e5ff]"
                        disabled={isLoading}
                        required
                      />
                    </div>
                    {error && (
                      <p className="text-sm text-[#ff2e63]">{error}</p>
                    )}
                    <Button
                      type="submit"
                      className="btn-neon w-full"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : mode === "signUp" ? (
                        <>
                          Create account
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      ) : (
                        <>
                          Sign in
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>

                    <p className="text-center text-xs text-muted-foreground">
                      {mode === "signUp" ? "Already have an account?" : "New here?"}{" "}
                      <button
                        type="button"
                        onClick={() => {
                          setMode(mode === "signUp" ? "signIn" : "signUp");
                          setError(null);
                        }}
                        className="font-semibold text-[#00e5ff] hover:underline"
                      >
                        {mode === "signUp" ? "Sign in" : "Create one free"}
                      </button>
                    </p>

                    <div className="relative mt-2">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-[#b026ff3d]" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-[#100824] px-2 text-muted-foreground">
                          Or
                        </span>
                      </div>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      className="btn-ghost-neon w-full border-[#b026ff4d]"
                      onClick={handleGuestLogin}
                      disabled={isLoading}
                    >
                      <UserX className="mr-2 h-4 w-4 text-[#ff2ea6]" />
                      Continue as Guest
                    </Button>
                  </CardContent>
                </form>
              </>
            )}
          </Card>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            No account? No problem —{" "}
            <Link
              to="/games"
              className="font-semibold text-[#00e5ff] hover:underline"
            >
              the games are free without one
            </Link>
            .
          </p>
        </div>
      </main>

      <footer className="relative z-10 border-t border-[#b026ff26] py-5 text-center text-xs text-muted-foreground">
        UltraVector — free unblocked games for school
      </footer>
    </div>
  );
}

export default function AuthPage(props: AuthProps) {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading…</div>}>
      <AuthInner {...props} />
    </Suspense>
  );
}
