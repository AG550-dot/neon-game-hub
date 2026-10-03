import GameCard from "@/components/GameCard";
import NeonHeader from "@/components/NeonHeader";
import { AdBannerLeaderboard, AdBannerSmall } from "@/components/AdBanner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getGamesByGenre } from "@/lib/games";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { useEffect, Suspense } from "react";
import { Link, useParams } from "react-router";

const GENRE_META: Record<string, { blurb: string; seo: string }> = {
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
    seo: "2 player fighting games unblocked — get-on-top, gun mayhem & more",
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
    seo: "unblocked action games & shooter games for school",
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
    seo: "all horror games unblocked — FNAF, Poppy, Granny & more scary games",
  },
};

/**
 * Extra SEO paragraphs for the highest-value genre pages. Rendered under the
 * game grid as keyword-rich, human-readable copy.
 */
const GENRE_SEO_COPY: Record<string, { heading: string; body: string }> = {
  Horror: {
    heading: "All horror games unblocked — free scary games for school",
    body: "Welcome to the darkest shelf in the vault. Every horror game here is unblocked, free and playable instantly in your browser — FNAF Shooter, Poppy Glamrock, Escape From School, Level Devil 1 & 2 and more scary games added all the time. No downloads, no sign-up, no keys under the door: just you, a Chromebook, and whatever is making that noise behind you. Play with headphones on if you dare — and don't blame us when the bell makes you jump.",
  },
  Shooter: {
    heading: "Unblocked action games — shooters, brawlers & battle arenas",
    body: "This is the action games wing of UltraVector: fast, loud and 100% unblocked at school. Pick a shooter like FNAF Shooter or an online arena battle, lock and load, and prove your aim — all free in the browser with no downloads or installs. Every game runs on school Chromebooks and laptops, so the only thing standing between you and victory is study hall.",
  },
  Fighting: {
    heading: "2 player fighting games unblocked — one keyboard, two champions",
    body: "Nothing settles a rivalry like a physics duel. These 2 player fighting games run on a single keyboard, so you and a friend can throw down at the same computer — Get On Top, stickman brawlers, gladiator chaos and more, all unblocked and free. Winner keeps the crown, loser buys the snacks.",
  },
  Sports: {
    heading: "Unblocked sports games — including 2 player classics",
    body: "From Retro Bowl 25 to Basketball Stars, the sports shelf is where champions are made. Many titles are full 2 player games — grab a friend, share a keyboard, and dunk, pass and score your way to glory. All unblocked, all free, all instant in your browser.",
  },
  Multiplayer: {
    heading: "Free multiplayer & 2 player games unblocked",
    body: "Real rivals, real arenas. These multiplayer games pit you against live opponents in .io battles, 1v1 duels and co-op challenges — unblocked at school and free forever. Play on one keyboard with a friend or hop into an online match from any Chromebook.",
  },
};

function GenreInner() {
  const { genre: genreParam } = useParams<{ genre: string }>();
  const games = getGamesByGenre(genreParam ?? "");
  const meta = GENRE_META[genreParam ?? ""];
  const exists = games.length > 0;
  const genre = exists ? (genreParam ?? "") : "";

  useEffect(() => {
    if (exists) {
      const keyword =
        genre === "Horror"
          ? "All Horror Games Unblocked"
          : genre === "Shooter"
            ? "Action & Shooter Games Unblocked"
            : genre === "Fighting"
              ? "2 Player Fighting Games Unblocked"
              : `${genre} Games Unblocked`;
      document.title = `${keyword} — Free & Instant | UltraVector`;
    }
    return () => {
      document.title = "UltraVector — Unblocked Games for School";
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

        {/* Leaderboard — prime slot under the genre hero */}
        <AdBannerLeaderboard className="mx-auto max-w-7xl px-4 sm:px-6" />

        {/* Games */}
        <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {games.map((game) => (
              <GameCard key={game.slug} game={game} />
            ))}
          </div>
        </section>

        {/* Ad banner #2 — 320×50, isolated iframe */}
        <AdBannerSmall className="mb-10" />

        {/* SEO copy */}
        <section className="mx-auto w-full max-w-4xl px-4 pb-16 sm:px-6">
          <div className="neon-card rounded-2xl p-6">
            <h2 className="font-display text-xl font-bold">
              {GENRE_SEO_COPY[genre]?.heading ?? (
                <>
                  Free online{" "}
                  <span className="text-rainbow">{genre.toLowerCase()} games</span>{" "}
                  for school
                </>
              )}
            </h2>
            <p className="mt-3 leading-relaxed text-muted-foreground">
              {GENRE_SEO_COPY[genre]?.body ??
                `Every ${genre.toLowerCase()} game in the UltraVector vault, playable free in your browser — no downloads, no sign-up, no installs. These ${meta?.seo ?? "unblocked games"} work on school Chromebooks and laptops, loading instantly with fullscreen support. Pick a game and hit play — the vault is open.`}
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

export default function Genre() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading genre…</div>}>
      <GenreInner />
    </Suspense>
  );
}
