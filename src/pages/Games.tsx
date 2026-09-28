import GameCard from "@/components/GameCard";
import NeonHeader from "@/components/NeonHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GAMES } from "@/lib/games";
import { motion } from "framer-motion";
import { ChevronDown, Gamepad2, Search, Sparkles, Zap } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";

export default function Games() {
  const [query, setQuery] = useState("");
  const [genre, setGenre] = useState<string>("All");
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    document.title =
      "All Unblocked Games — Slope, Retro Bowl, Run 3 & More | NeonPlay Arcade";
    return () => {
      document.title = "NeonPlay Arcade — Unblocked Games for School";
    };
  }, []);

  // Prefill the search box when arriving via /games?q=...
  useEffect(() => {
    const q = searchParams.get("q");
    if (q) {
      setQuery(q);
      navigate("/games", { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const genres = useMemo(
    () => ["All", ...new Set(GAMES.map((g) => g.genre.split(" · ")[0]))],
    [],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return GAMES.filter((g) => {
      const matchesGenre = genre === "All" || g.genre.startsWith(genre);
      const matchesQuery =
        q === "" ||
        g.title.toLowerCase().includes(q) ||
        g.tagline.toLowerCase().includes(q) ||
        g.genre.toLowerCase().includes(q);
      return matchesGenre && matchesQuery;
    });
  }, [query, genre]);

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
                The full arcade
              </Badge>
              <h1 className="font-display text-4xl font-extrabold tracking-tight sm:text-5xl">
                <span className="text-rainbow">All Unblocked Games</span>
              </h1>
              <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
                Every game in the NeonPlay vault — free, instant, and unblocked
                at school. No downloads, no sign-up wall, just pure play.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Search + filter bar */}
        <section className="sticky top-16 z-40 border-y border-[#b026ff26] bg-[#070214]/85 px-4 py-3 backdrop-blur-xl sm:px-6">
          <div className="mx-auto flex max-w-7xl flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search games — try “slope” or “football”…"
                className="border-[#b026ff4d] bg-[#100824] pl-9 placeholder:text-muted-foreground/70 focus-visible:ring-[#00e5ff]"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {genres.map((g) => (
                <button
                  key={g}
                  onClick={() => setGenre(g)}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
                    genre === g
                      ? "btn-neon"
                      : "border border-[#b026ff4d] text-muted-foreground hover:border-[#00e5ff80] hover:text-foreground"
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Game grid */}
        <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6">
          {filtered.length === 0 ? (
            <div className="neon-card mx-auto max-w-md rounded-2xl p-10 text-center">
              <p className="font-display text-lg font-bold">No games found</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Nothing matches “{query}” in that genre. Try clearing the
                filters.
              </p>
              <Button
                variant="ghost"
                className="btn-ghost-neon mt-4"
                onClick={() => {
                  setQuery("");
                  setGenre("All");
                }}
              >
                Reset filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((game) => (
                <GameCard key={game.slug} game={game} />
              ))}
            </div>
          )}
        </section>

        {/* SEO copy block */}
        <section className="mx-auto w-full max-w-7xl px-4 pb-12 sm:px-6">
          <div className="neon-card rounded-2xl p-6 sm:p-8">
            <h2 className="font-display text-2xl font-bold">
              Why play unblocked games on{" "}
              <span className="text-rainbow">NeonPlay Arcade?</span>
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
                  Slope, Retro Bowl 25, Run 3 and Cookie Clicker — proven
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
              browse the whole arcade
            </Link>
            .
          </p>
        </section>
      </main>

      <footer className="border-t border-[#b026ff26] py-6 text-center text-xs text-muted-foreground">
        NeonPlay Arcade — free unblocked games for school. Play responsibly 😉
      </footer>
    </div>
  );
}

const FAQS = [
  {
    q: "Are these games really unblocked at school?",
    a: "Yes. Every game on NeonPlay Arcade is built directly into the site itself, so it loads over standard web traffic with nothing extra to block — no third-party game hosts, no installs, no VPN, no sign-up required to play.",
  },
  {
    q: "Do I need to download or install anything?",
    a: "No. Every game runs directly in your browser — Chrome, Edge, Safari or Firefox — including school Chromebooks.",
  },
  {
    q: "Is NeonPlay Arcade free?",
    a: "Yes, completely free. You can create a free account to save favorites and track play stats, but the games themselves never require payment or a sign-up.",
  },
  {
    q: "Can I play on a Chromebook or school laptop?",
    a: "Absolutely. The whole arcade is built for Chromebooks — instant loading, keyboard controls, and a fullscreen mode for every game.",
  },
];
