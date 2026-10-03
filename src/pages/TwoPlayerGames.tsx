import GameCard from "@/components/GameCard";
import NeonHeader from "@/components/NeonHeader";
import { AdBannerLeaderboard, AdBannerSmall } from "@/components/AdBanner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getTwoPlayerGames, GAMES } from "@/lib/games";
import { motion } from "framer-motion";
import { Users } from "lucide-react";
import { useEffect, Suspense } from "react";
import { Link } from "react-router";

function TwoPlayerInner() {
  const games = getTwoPlayerGames();

  useEffect(() => {
    document.title =
      "2 Player Games Unblocked — Play with a Friend at School | UltraVector";
    return () => {
      document.title = "UltraVector — Unblocked Games for School";
    };
  }, []);

  return (
    <div className="flex min-h-screen flex-col">
      <NeonHeader />

      <main className="flex-1">
        {/* Hero */}
        <section className="bg-grid relative overflow-hidden px-4 py-12 sm:px-6">
          <div className="pointer-events-none absolute -top-24 left-1/2 size-[420px] -translate-x-1/2 rounded-full bg-[#00e5ff]/20 blur-[120px]" />
          <div className="relative mx-auto max-w-7xl">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <Badge
                variant="outline"
                className="neon-chip mb-3 border-none px-3 py-1 text-xs font-semibold"
              >
                <Users className="mr-1.5 size-3.5" />
                {games.length} games · one keyboard · two players
              </Badge>
              <h1 className="font-display text-4xl font-extrabold tracking-tight sm:text-5xl">
                <span className="text-rainbow">2 Player Games</span> Unblocked
              </h1>
              <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
                Grab a friend and share a keyboard — Basketball Stars, Get On
                Top, Fireboy &amp; Watergirl and every co-op and versus classic,
                free and unblocked at school. No downloads, no sign-up.
              </p>
              <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
                <Button asChild variant="ghost" size="sm" className="btn-ghost-neon">
                  <Link to="/genre/fighting">Fighting duels →</Link>
                </Button>
                <Button asChild variant="ghost" size="sm" className="btn-ghost-neon">
                  <Link to="/genre/multiplayer">Online multiplayer →</Link>
                </Button>
                <Button asChild variant="ghost" size="sm" className="btn-ghost-neon">
                  <Link to="/genre/sports">Sports showdowns →</Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        <AdBannerLeaderboard className="mx-auto max-w-7xl px-4 sm:px-6" />

        {/* Grid */}
        <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {games.map((game) => (
              <GameCard key={game.slug} game={game} />
            ))}
          </div>
        </section>

        <AdBannerSmall className="mb-10" />

        {/* SEO copy */}
        <section className="mx-auto w-full max-w-4xl px-4 pb-16 sm:px-6">
          <div className="neon-card rounded-2xl p-6">
            <h2 className="font-display text-xl font-bold">
              Free <span className="text-rainbow">2 player games</span> unblocked
              at school
            </h2>
            <p className="mt-3 leading-relaxed text-muted-foreground">
              Two players, one keyboard, zero downloads. This collection gathers
              every versus and co-op game in the UltraVector vault — basketball
              duels, wrestling physics, stickman battles, tower defense with a
              squad and plenty of fireboy-watergirl-style teamwork. Every game
              is unblocked on school networks and runs instantly in the browser
              on Chromebooks and laptops, so the only thing you need is a friend
              (and one of you has to share the arrow keys).
            </p>
            <p className="mt-3 leading-relaxed text-muted-foreground">
              Prefer competing across the room instead of across the keyboard?
              Head to the{" "}
              <Link
                to="/genre/multiplayer"
                className="font-semibold text-[#00e5ff] hover:underline"
              >
                online multiplayer games
              </Link>{" "}
              shelf for live arenas like 1v1.LOL and Shell Shockers — or browse{" "}
              <Link
                to="/games"
                className="font-semibold text-[#ff2ea6] hover:underline"
              >
                all {GAMES.length} unblocked games
              </Link>{" "}
              for horror, action, racing and more.
            </p>
          </div>
        </section>
      </main>

      <footer className="border-t border-[#b026ff26] py-6 text-center text-xs text-muted-foreground">
        UltraVector — free unblocked games for school. Play responsibly 😉
      </footer>
    </div>
  );
}

export default function TwoPlayerGames() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center text-muted-foreground">
          Loading 2 player games…
        </div>
      }
    >
      <TwoPlayerInner />
    </Suspense>
  );
}
