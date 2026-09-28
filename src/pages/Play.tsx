import GameTile from "@/components/GameTile";
import NeonHeader from "@/components/NeonHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GAMES, getGame } from "@/lib/games";
import {
  ArrowLeft,
  ChevronRight,
  ExternalLink,
  Keyboard,
  Maximize2,
  Monitor,
  Zap,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router";

export default function Play() {
  const { slug } = useParams<{ slug: string }>();
  const game = getGame(slug);
  const shellRef = useRef<HTMLDivElement>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const [loaded, setLoaded] = useState(false);
  const [loadKey, setLoadKey] = useState(0);
  const [fsActive, setFsActive] = useState(false);

  // Reset load state when switching games
  useEffect(() => {
    setLoaded(false);
    setLoadKey((k) => k + 1);
    if (game) {
      document.title = `${game.title} — Unblocked & Free | NeonPlay Arcade`;
    }
    return () => {
      document.title = "NeonPlay Arcade — Unblocked Games for School";
    };
  }, [game?.slug]);

  // Prefill the library search when jumping over via the header CTA
  useEffect(() => {
    const q = searchParams.get("q");
    if (q) setSearchParams({});
  }, [searchParams, setSearchParams]);


  // Track fullscreen state for the letterbox overlay
  useEffect(() => {
    const onChange = () => setFsActive(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  if (!game) {
    return (
      <div className="flex min-h-screen flex-col">
        <NeonHeader />
        <main className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-24 text-center">
          <p className="font-display text-5xl font-extrabold text-rainbow">404</p>
          <h1 className="font-display text-2xl font-bold">Game not found</h1>
          <p className="max-w-md text-muted-foreground">
            That game isn&apos;t in the arcade. Pick one of our legendary
            unblocked titles instead.
          </p>
          <Button asChild className="btn-neon mt-2">
            <Link to="/games">Browse all games</Link>
          </Button>
        </main>
      </div>
    );
  }

  const toggleFullscreen = () => {
    const el = shellRef.current;
    if (!el) return;
    if (document.fullscreenElement) {
      void document.exitFullscreen();
    } else {
      void el.requestFullscreen();
    }
  };

  const others = GAMES.filter((g) => g.slug !== game.slug);

  return (
    <div className="flex min-h-screen flex-col">
      <NeonHeader />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 pb-16 pt-6 sm:px-6">
        <Link
          to="/games"
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-[#00e5ff]"
        >
          <ArrowLeft className="size-4" />
          All games
        </Link>

        {/* Title row */}
        <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="mb-1.5 flex items-center gap-2">
              <Badge
                variant="outline"
                className="neon-chip border-none text-[10px] font-semibold"
              >
                {game.genre}
              </Badge>
              <Badge
                variant="outline"
                className="neon-chip border-none text-[10px] font-semibold"
              >
                Unblocked
              </Badge>
            </div>
            <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
              <span className="text-rainbow">{game.title}</span>{" "}
              <span className="text-foreground/70">Unblocked</span>
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              className="btn-ghost-neon gap-2"
              onClick={() => setLoadKey((k) => k + 1)}
            >
              <Zap className="size-4 text-[#ffe14d]" />
              Restart
            </Button>
            <Button
              variant="ghost"
              className="btn-ghost-neon gap-2"
              onClick={toggleFullscreen}
            >
              <Maximize2 className="size-4 text-[#00e5ff]" />
              Fullscreen
            </Button>
          </div>
        </div>

        {/* Game shell */}
        <div
          ref={shellRef}
          className="rainbow-ring relative rounded-2xl"
        >
          <div className="relative w-full overflow-hidden rounded-2xl bg-[#0b0520]">
            {/* Letterbox to 16:9 in fullscreen; tall aspect otherwise */}
            <div
              className={`relative w-full ${
                fsActive
                  ? "flex h-screen items-center"
                  : "aspect-[16/10] sm:aspect-video"
              }`}
            >
            <iframe
              key={loadKey}
              src={game.src}
              title={`${game.title} — play unblocked`}
              className="absolute inset-0 size-full border-0"
              allow="fullscreen; autoplay; gamepad; pointer-lock"
              sandbox={game.sandbox}
              loading="eager"
              onLoad={() => setLoaded(true)}
            />
            {/* Loading overlay */}
            {!loaded && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-[#0b0520]">
                <div className="size-12 animate-spin rounded-full border-2 border-[#b026ff33] border-t-[#00e5ff]" />
                <p className="text-sm text-muted-foreground">
                  Booting {game.title}…
                </p>
              </div>
            )}
            </div>
          </div>
        </div>

        {/* Info strip */}
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="neon-card flex items-start gap-3 rounded-xl p-4">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-[#b026ff55] bg-[#b026ff1a]">
              <Keyboard className="size-4 text-[#c04bff]" />
            </span>
            <div>
              <p className="text-sm font-semibold">Controls</p>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {game.controls}
              </p>
            </div>
          </div>
          <div className="neon-card flex items-start gap-3 rounded-xl p-4">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-[#00e5ff55] bg-[#00e5ff1a]">
              <Monitor className="size-4 text-[#00e5ff]" />
            </span>
            <div>
              <p className="text-sm font-semibold">Runs on anything</p>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Chromebooks, school laptops, phones — no download needed.
              </p>
            </div>
          </div>
          <a
            href={game.fallbackUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="neon-card group flex items-start gap-3 rounded-xl p-4"
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-[#3dff8b55] bg-[#3dff8b1a]">
              <ExternalLink className="size-4 text-[#3dff8b]" />
            </span>
            <div>
              <p className="text-sm font-semibold group-hover:text-[#3dff8b]">
                Not loading?
              </p>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Open {game.title} in a new tab — works even behind strict
                school filters.
              </p>
            </div>
          </a>
        </div>

        {/* About section — SEO copy */}
        <section className="neon-card mt-6 rounded-2xl p-6">
          <h2 className="font-display text-xl font-bold">
            About <span className="text-rainbow">{game.title}</span>
          </h2>
          <p className="mt-3 max-w-3xl leading-relaxed text-muted-foreground">
            {game.description}
          </p>
          <p className="mt-3 max-w-3xl leading-relaxed text-muted-foreground">
            Looking for {game.title.toLowerCase()} unblocked at school? NeonPlay
            Arcade loads it instantly in your browser — free, with no downloads
            and no sign-up required. Works great on Chromebooks and school
            laptops.
          </p>
        </section>

        {/* Related games */}
        <section className="mt-10">
          <div className="mb-4 flex items-center gap-3">
            <ChevronRight className="size-5 text-[#ff2ea6]" />
            <h2 className="font-display text-xl font-bold">More unblocked games</h2>
            <div className="h-px flex-1 bg-gradient-to-r from-[#b026ff55] to-transparent" />
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {others.map((g) => (
              <GameTile key={g.slug} game={g} />
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-[#b026ff26] py-6 text-center text-xs text-muted-foreground">
        NeonPlay Arcade — free unblocked games for school. Play responsibly 😉
      </footer>
    </div>
  );
}
