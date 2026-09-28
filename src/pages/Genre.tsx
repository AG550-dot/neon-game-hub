import GameCard from "@/components/GameCard";
import NeonHeader from "@/components/NeonHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getGamesByGenre, type Genre } from "@/lib/games";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { useEffect } from "react";
import { Link, useParams } from "react-router";

const GENRE_META: Record<
  string,
  { blurb: string; seo: string }
> = {
  "Endless Runner": {
    blurb: "Speed that never lets up. How far can you go before it does?",
    seo: "endless runner games unblocked at school",
  },
  Arcade: {
    blurb: "Pure pick-up-and-play. One life, infinite tries.",
    seo: "arcade games unblocked online free",
  },
  Sports: {
    blurb: "Pixel turf, championship dreams. Coach, throw, win.",
    seo: "unblocked sports games for school",
  },
  Platformer: {
    blurb: "Run, jump, rotate the world. Mind the void.",
    seo: "unblocked platformer games browser",
  },
  Idle: {
    blurb: "Numbers go up. Peace goes in. Perfect study-hall energy.",
    seo: "idle incremental games unblocked",
  },
  Fighting: {
    blurb: "Physics, fury and floppy limbs. Settle it in the arena.",
    seo: "2 player fighting games unblocked",
  },
  Sandbox: {
    blurb: "Infinite worlds, zero limits. Mine, build, survive.",
    seo: "sandbox building games unblocked browser",
  },
  Puzzle: {
    blurb: "Slow-burn brain teasers you can't put down.",
    seo: "unblocked puzzle games for school",
  },
  Racing: {
    blurb: "Anti-gravity speed with neon city views.",
    seo: "racing games unblocked online",
  },
  Retro: {
    blurb: "The legends that started everything — faithfully preserved.",
    seo: "classic retro arcade games unblocked",
  },
  Shooter: {
    blurb: "Lock, load, build. Precision chaos in every round.",
    seo: "unblocked shooter games for school",
  },
  Multiplayer: {
    blurb: "Live arenas packed with real rivals. No bots allowed.",
    seo: "free multiplayer io games unblocked",
  },
  Ragdoll: {
    blurb: "Floppy limbs, devious traps, spectacular failures.",
    seo: "ragdoll physics games unblocked",
  },
  Rhythm: {
    blurb: "Feel the beat. Miss the jump. Scream. Retry.",
    seo: "rhythm music games unblocked",
  },
  Trivia: {
    blurb: "Quiz games that question your sanity, not your knowledge.",
    seo: "trick question quiz games unblocked",
  },
  Cooking: {
    blurb: "Serve fast, build perfect, keep the customers happy.",
    seo: "cooking time management games unblocked",
  },
  Horror: {
    blurb: "Headphones on. Lights off. Good luck.",
    seo: "horror games unblocked online",
  },
};

export default function Genre() {
  const { genre: genreParam } = useParams<{ genre: string }>();
  const games = getGamesByGenre(genreParam ?? "");
  const meta = GENRE_META[genreParam ?? ""];
  const exists = games.length > 0;
  // After the guard below, TS knows genreParam is defined via these aliases
  const genre = exists ? (genreParam as string) : (genreParam ?? "");

  useEffect(() => {
    if (exists) {
      document.title = `${genre} Games Unblocked — Free & Instant | NeonPlay Arcade`;
    }
    return () => {
      document.title = "NeonPlay Arcade — Unblocked Games for School";
    };
  }, [exists, genre]);

  if (!exists) {
    return (
      <div className="flex min-h-screen flex-col">
        <NeonHeader />
        <main className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-24 text-center">
          <p className="font-display text-5xl font-extrabold text-rainbow">404</p>
          <h1 className="font-display text-2xl font-bold">Unknown genre</h1>
          <p className="max-w-md text-muted-foreground">
            We don&apos;t have a shelf for that one yet.
          </p>
          <Button asChild className="btn-neon mt-2">
            <Link to="/games">Browse all games</Link>
          </Button>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <NeonHeader />

      <main className="flex-1">
        {/* Hero */}
        <section className="bg-grid relative overflow-hidden px-4 py-12 sm:px-6">
          <div className="pointer-events-none absolute -top-24 left-1/2 size-[420px] -translate-x-1/2 rounded-full bg-[#b026ff]/20 blur-[120px]" />
          <div className="relative mx-auto max-w-7xl">
            <Link
              to="/games"
              className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-[#00e5ff]"
            >
              <ArrowLeft className="size-4" />
              All games
            </Link>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Badge
                variant="outline"
                className="neon-chip mb-3 border-none px-3 py-1 text-xs font-semibold"
              >
                {games.length} {games.length === 1 ? "game" : "games"}
              </Badge>
              <h1 className="font-display text-4xl font-extrabold tracking-tight sm:text-5xl">
                <span className="text-rainbow">{genre}</span>{" "}
                <span className="text-foreground/80">Games</span>
              </h1>
              <p className="mt-3 max-w-2xl text-muted-foreground">
                {meta?.blurb ?? "Free, unblocked and instant in your browser."}
              </p>
            </motion.div>
          </div>
        </section>

        {/* Games */}
        <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {games.map((game) => (
              <GameCard key={game.slug} game={game} />
            ))}
          </div>
        </section>

        {/* SEO copy */}
        <section className="mx-auto w-full max-w-4xl px-4 pb-16 sm:px-6">
          <div className="neon-card rounded-2xl p-6">
            <h2 className="font-display text-xl font-bold">
              Free online{" "}
              <span className="text-rainbow">{genre.toLowerCase()} games</span>{" "}
              for school
            </h2>
            <p className="mt-3 leading-relaxed text-muted-foreground">
              Every {genre.toLowerCase()} game in the NeonPlay vault, playable
              free in your browser — no downloads, no sign-up, no installs.
              These {meta?.seo ?? "unblocked games"} work on school Chromebooks
              and laptops, loading instantly with fullscreen support. Pick a
              game and hit play — the arcade is open.
            </p>
          </div>
        </section>
      </main>

      <footer className="border-t border-[#b026ff26] py-6 text-center text-xs text-muted-foreground">
        NeonPlay Arcade — free unblocked games for school. Play responsibly 😉
      </footer>
    </div>
  );
}
