import GameTile from "@/components/GameTile";
import NeonHeader from "@/components/NeonHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { GAMES } from "@/lib/games";
import { motion } from "framer-motion";
import {
  Clock,
  Gamepad2,
  Heart,
  LogOut,
  Sparkles,
  Trophy,
  Zap,
} from "lucide-react";
import { Link, useNavigate } from "react-router";

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="flex min-h-screen flex-col">
      <NeonHeader />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 pb-16 pt-10 sm:px-6">
        {/* Greeting */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#00e5ff]">
              Member hub
            </p>
            <h1 className="mt-1 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
              Welcome back,{" "}
              <span className="text-rainbow">
                {user?.name?.split(" ")[0] || "Player"}
              </span>
            </h1>
            <p className="mt-2 text-muted-foreground">
              The arcade is open. Your games are warmed up and ready to launch.
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            className="btn-ghost-neon gap-2 self-start"
            onClick={handleSignOut}
          >
            <LogOut className="size-4" />
            Sign out
          </Button>
        </motion.div>

        {/* Quick launch */}
        <section className="mb-10">
          <div className="mb-4 flex items-center gap-3">
            <Zap className="size-5 text-[#ffe14d]" />
            <h2 className="font-display text-xl font-bold">Quick launch</h2>
            <div className="h-px flex-1 bg-gradient-to-r from-[#b026ff55] to-transparent" />
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {GAMES.slice(0, 8).map((game) => (
              <GameTile key={game.slug} game={game} />
            ))}
          </div>
        </section>

        {/* Member perks */}
        <div className="grid gap-6 lg:grid-cols-3">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.1 }}
            className="lg:col-span-2"
          >
            <Card className="neon-card h-full border-none">
              <CardHeader>
                <span className="mb-3 flex size-10 items-center justify-center rounded-xl border border-[#ffe14d55] bg-[#ffe14d1a]">
                  <Trophy className="size-5 text-[#ffe14d]" />
                </span>
                <CardTitle className="font-display">
                  Your neon perks are active
                </CardTitle>
                <CardDescription>
                  Everything a free NeonPlay membership unlocks.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-3">
                {PERKS.map((p) => (
                  <div
                    key={p.title}
                    className="rounded-xl border border-[#b026ff26] bg-[#0b0520]/60 p-4"
                  >
                    <p.icon className={`mb-2 size-5 ${p.tone}`} />
                    <p className="text-sm font-semibold">{p.title}</p>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                      {p.body}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.2 }}
          >
            <Card className="neon-card h-full border-none">
              <CardHeader>
                <span className="mb-3 flex size-10 items-center justify-center rounded-xl border border-[#ff2ea655] bg-[#ff2ea61a]">
                  <Sparkles className="size-5 text-[#ff2ea6]" />
                </span>
                <CardTitle className="font-display">
                  Arcade status
                </CardTitle>
                <CardDescription>
                  Live stats from the NeonPlay vault.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {STATUS.map((s) => (
                  <div
                    key={s.label}
                    className="flex items-center justify-between rounded-lg border border-[#b026ff26] bg-[#0b0520]/60 px-4 py-3"
                  >
                    <span className="text-sm text-muted-foreground">
                      {s.label}
                    </span>
                    <span className="font-display text-sm font-bold text-rainbow">
                      {s.value}
                    </span>
                  </div>
                ))}
                <Badge
                  variant="outline"
                  className="neon-chip w-full justify-center border-none py-2 text-xs font-semibold"
                >
                  <Clock className="mr-1.5 size-3.5" />
                  Arcade runs 24/7 — even during math class
                </Badge>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* CTA strip */}
        <div className="rainbow-ring mt-10 rounded-2xl bg-[#100824]/80 p-8 text-center backdrop-blur-xl">
          <Gamepad2 className="animate-float mx-auto size-10 text-[#00e5ff]" />
          <h2 className="mt-4 font-display text-2xl font-bold">
            One more round before the bell?
          </h2>
          <Button asChild className="btn-neon mt-5 h-11 px-7">
            <Link to="/games">
              <Zap className="mr-2 size-4" />
              Back to the arcade
            </Link>
          </Button>
        </div>
      </main>

      <footer className="border-t border-[#b026ff26] py-6 text-center text-xs text-muted-foreground">
        NeonPlay Arcade — free unblocked games for school. Play responsibly 😉
      </footer>
    </div>
  );
}

const PERKS = [
  {
    icon: Heart,
    tone: "text-[#ff2ea6]",
    title: "Favorites",
    body: "Pin the games you love to the top of your arcade.",
  },
  {
    icon: Trophy,
    tone: "text-[#ffe14d]",
    title: "Score tracking",
    body: "Keep your personal bests across devices when signed in.",
  },
  {
    icon: Zap,
    tone: "text-[#00e5ff]",
    title: "Instant launches",
    body: "Your quick-launch bar remembers what you played last.",
  },
];

const STATUS = [
  { label: "Games online", value: "12 / 12" },
  { label: "Your membership", value: "Free" },
  { label: "Ads served", value: "0" },
  { label: "Vibe level", value: "MAX" },
];
