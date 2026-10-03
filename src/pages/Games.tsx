import GameCard from "@/components/GameCard";
import NeonHeader from "@/components/NeonHeader";
import AdBanner, { AdBannerLeaderboard, AdBannerTower } from "@/components/AdBanner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GAMES, getGenreStats, searchGames } from "@/lib/games";
import { motion } from "framer-motion";
import { ArrowRight, ChevronDown, Gamepad2, LayoutGrid, Sparkles, Zap } from "lucide-react";
import { Suspense, Fragment, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";

const genreStats = getGenreStats();

// In-grid leaderboard cadence: one ad row every 16 games, capped at 3 per page
const GRID_AD_EVERY = 16;
const GRID_AD_MAX = 3;
const GRID_AD_SLOTS = new Set(
  Array.from({ length: GRID_AD_MAX }, (_, n) => (n + 1) * GRID_AD_EVERY - 1),
);

function GamesInner() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const navigate = useNavigate();

  useEffect(() => {
    document.title =
      "All Unblocked Games — Slope, Retro Bowl, Eaglercraft & More | UltraVector";
    return () => {
      document.title = "UltraVector — Unblocked Games for School";
    };
  }, []);

  // Keep the input in sync when the header search navigates here with ?q=
  useEffect(() => {
    const q = searchParams.get("q");
    if (q !== null) setQuery(q);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const results = useMemo(() => searchGames(query), [query]);
  // Big library: render in chunks so first paint stays fast.
  const [visible, setVisible] = useState(60);
  useEffect(() => setVisible(60), [query]);
  const shown = results.slice(0, visible);

  const updateUrl = (q: string) => {
    if (q.trim()) setSearchParams({ q: q.trim() });
    else setSearchParams({});
  };

  return (
    <div className="flex min-h-screen flex-col">
      <NeonHeader />

      <main className="flex-1">
        {/* Page hero */}
        <section className="bg-grid relative overflow-hidden px-4 py-12 sm:px-6">
          <div className="pointer-events-none absolute -top-24 left-1/2 size-[480px] -translate-x-1/2 rounded-full bg-[#b026ff]/20 blur-[120px]" />
          <div className="relative mx-auto max-w-7xl">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <Badge
                variant="outline"
                className="neon-chip mb-4 border-none px-3 py-1 text-xs font-semibold"
              >
                <Gamepad2 className="mr-1.5 size-3.5" />
                {results.length === GAMES.length
                  ? `${GAMES.length} free games · 17 genres`
                  : `${results.length} of ${GAMES.length} games`}
              </Badge>
              <h1 className="font-display text-4xl font-extrabold tracking-tight sm:text-5xl">
                <span className="text-rainbow">All Unblocked Games</span>
              </h1>
              <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
                Every game in the UltraVector vault — free, instant, and
                unblocked at school. No downloads, no sign-up wall, just pure
                play.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Genre shelves */}
        <section className="mx-auto w-full max-w-7xl px-4 sm:px-6">
          <div className="neon-card rounded-2xl p-5 sm:p-6">
            <div className="mb-4 flex items-center gap-3">
              <LayoutGrid className="size-5 text-[#ff2ea6]" />
              <h2 className="font-display text-lg font-bold">
                Browse by <span className="text-rainbow">genre</span>
              </h2>
              <div className="h-px flex-1 bg-gradient-to-r from-[#b026ff55] to-transparent" />
            </div>
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
              {genreStats.map(({ genre, count }) => (
                <Link
                  key={genre}
                  to={`/genre/${encodeURIComponent(genre.toLowerCase())}`}
                  className="group flex items-center justify-between rounded-xl border border-[#b026ff33] bg-[#0b0520]/60 px-3.5 py-3 transition-all hover:-translate-y-0.5 hover:border-[#00e5ff88] hover:shadow-[0_0_18px_rgba(0,229,255,0.15)]"
                >
                  <span className="text-sm font-bold">{genre}</span>
                  <span className="flex items-center gap-1.5">
                    <span className="rounded-full bg-[#00e5ff14] px-2 py-0.5 text-[10px] font-bold text-[#9bf3ff]">
                      {count}
                    </span>
                    <ArrowRight className="size-3.5 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-[#00e5ff]" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Search + filter bar */}
        <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
          <div className="relative">
            <SearchIcon />
            <Input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                updateUrl(e.target.value);
              }}
              placeholder={`Search ${GAMES.length} games — try “fnaf”, “papa's”, “puzzle”, “retro”…`}
              className="h-12 rounded-full border-[#b026ff4d] bg-[#100824] pl-11 pr-5 text-base placeholder:text-muted-foreground/70 focus-visible:ring-[#00e5ff]"
              aria-label="Search games"
            />
          </div>
        </section>

        {/* Leaderboard — below search, above results */}
        <AdBannerLeaderboard className="mx-auto max-w-7xl px-4 sm:px-6" />

        {/* Game grid + side rail */}
        <section className="mx-auto w-full max-w-7xl px-4 pb-10 sm:px-6">
          <div className="flex items-start gap-6">
            <div className="min-w-0 flex-1">
              {results.length === 0 ? (
                <div className="neon-card mx-auto max-w-md rounded-2xl p-10 text-center">
                  <p className="font-display text-lg font-bold">No games found</p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Nothing matches “{query}”. Try “runner”, “puzzle” or “retro”.
                  </p>
                  <Button
                    variant="ghost"
                    className="btn-ghost-neon mt-4"
                    onClick={() => {
                      setQuery("");
                      updateUrl("");
                    }}
                  >
                    Clear search
                  </Button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {shown.map((game, i) => (
                      <Fragment key={game.slug}>
                        <GameCard game={game} />
                        {GRID_AD_SLOTS.has(i) && (
                          <div className="col-span-full flex justify-center">
                            <AdBannerLeaderboard className="w-full" />
                          </div>
                        )}
                      </Fragment>
                    ))}
                  </div>
                  <AdBanner className="my-8" />
                  {results.length > shown.length && (
                    <div className="mt-10 text-center">
                      <Button
                        size="lg"
                        variant="ghost"
                        className="btn-ghost-neon h-12 px-8"
                        onClick={() => setVisible((v) => v + 60)}
                      >
                        Load more games ({results.length - shown.length} left)
                        <ChevronDown className="ml-2 size-5" />
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
            <aside className="hidden w-[160px] shrink-0 xl:block">
              <div className="sticky top-20">
                <AdBannerTower />
              </div>
            </aside>
          </div>
        </section>

        {/* SEO copy block */}
        <section className="mx-auto w-full max-w-7xl px-4 pb-12 sm:px-6">
          <div className="neon-card rounded-2xl p-6 sm:p-8">
            <h2 className="font-display text-2xl font-bold">
              Why play unblocked games on{" "}
              <span className="text-rainbow">UltraVector?</span>
            </h2>
            <div className="mt-5 grid gap-6 md:grid-cols-3">
              <div>
                <h3 className="flex items-center gap-2 font-display text-base font-bold text-[#00e5ff]">
                  <Zap className="size-4" /> Instant play
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Every title loads right in the browser — no launcher, no
                  installer, no waiting. Click a game and you&apos;re playing in
                  seconds, even on a school Chromebook.
                </p>
              </div>
              <div>
                <h3 className="flex items-center gap-2 font-display text-base font-bold text-[#ff2ea6]">
                  <Sparkles className="size-4" /> Built for school networks
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Our games are hosted on standard web pages that typically slip
                  past school filters, so the arcade stays available where app
                  stores and downloads are blocked.
                </p>
              </div>
              <div>
                <h3 className="flex items-center gap-2 font-display text-base font-bold text-[#3dff8b]">
                  <Gamepad2 className="size-4" /> Curated classics
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Slope, Eaglercraft, Pac-Man, Retro Bowl and more — proven
                  legends with millions of fans. We only list games worth your
                  free period.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="mx-auto w-full max-w-4xl px-4 pb-20 sm:px-6">
          <h2 className="mb-6 text-center font-display text-2xl font-bold">
            Frequently asked{" "}
            <span className="text-rainbow">questions</span>
          </h2>
          <div className="space-y-3">
            {FAQS.map((faq) => (
              <details
                key={faq.q}
                className="neon-card group rounded-xl px-5 py-4 [&_summary::-webkit-details-marker]:hidden"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold">
                  {faq.q}
                  <ChevronDown className="size-4 shrink-0 text-[#00e5ff] transition-transform group-open:rotate-180" />
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {faq.a}
                </p>
              </details>
            ))}
          </div>
          <p className="mt-8 text-center text-sm text-muted-foreground">
            Ready to play?{" "}
            <Link to="/play/slope" className="font-semibold text-[#00e5ff] hover:underline">
              Jump into Slope
            </Link>{" "}
            or{" "}
            <Link to="/games" className="font-semibold text-[#ff2ea6] hover:underline">
              browse the whole vault
            </Link>
            .
          </p>
        </section>
      </main>

      <footer className="border-t border-[#b026ff26] py-6 text-center text-xs text-muted-foreground">
        UltraVector — free unblocked games for school. Play responsibly 😉
      </footer>
    </div>
  );
}

function SearchIcon() {
  return (
    <svg
      className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

const FAQS = [
  {
    q: "Are these games really unblocked at school?",
    a: "Yes. UltraVector runs games over standard web traffic, so they typically work on school networks where app stores and downloads are blocked. No installs, no VPN, no sign-up required to play.",
  },
  {
    q: "Do I need to download or install anything?",
    a: "No. Every game runs directly in your browser — Chrome, Edge, Safari or Firefox — including school Chromebooks.",
  },
  {
    q: "Is UltraVector free?",
    a: "Yes, completely free. You can create a free account to save favorites and track play stats, but the games themselves never require payment or a sign-up.",
  },
  {
    q: "Can I play on a Chromebook or school laptop?",
    a: "Absolutely. The whole arcade is built for Chromebooks — instant loading, keyboard controls, and a fullscreen mode for every game.",
  },
];

export default function Games() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading games…</div>}>
      <GamesInner />
    </Suspense>
  );
}
