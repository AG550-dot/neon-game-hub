import GameTile from "@/components/GameTile";
import NeonHeader from "@/components/NeonHeader";
import AdBanner, { AdBannerSmall } from "@/components/AdBanner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GAMES, getGame } from "@/lib/games";
import { getNativeGame } from "@/games/registry";
import {
  ArrowLeft,
  ChevronRight,
  ExternalLink,
  Globe,
  Keyboard,
  Maximize2,
  Monitor,
  Zap,
} from "lucide-react";
import { Suspense, lazy, useCallback, useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router";

type Mode = "builtin" | "hosted";

export default function Play() {
  const { slug } = useParams<{ slug: string }>();
  const game = getGame(slug);
  const Native = getNativeGame(slug);
  const shellRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<Mode>(Native ? "builtin" : "hosted");
  const [size, setSize] = useState({ w: 960, h: 540 });
  const [fsActive, setFsActive] = useState(false);
  const [hostedLoaded, setHostedLoaded] = useState(false);
  const [hostedKey, setHostedKey] = useState(0);

  // When switching games, pick the best default mode for that game
  useEffect(() => {
    setMode(getNativeGame(game?.slug) ? "builtin" : "hosted");
  }, [game?.slug]);

  // Reset embed state when switching games / modes
  useEffect(() => {
    setHostedLoaded(false);
    setHostedKey((k) => k + 1);
    if (game) {
      document.title = `${game.title} — Unblocked & Free | NeonPlay Arcade`;
    }
    return () => {
      document.title = "NeonPlay Arcade — Unblocked Games for School";
    };
  }, [game?.slug, mode]);

  // Track fullscreen for the letterbox overlay
  useEffect(() => {
    const onChange = () => setFsActive(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  // Observe the stage so native canvas games always fill it exactly
  const measure = useCallback(() => {
    const el = stageRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setSize({ w: Math.max(320, Math.round(r.width)), h: Math.max(240, Math.round(r.height)) });
  }, []);

  useEffect(() => {
    measure();
    const ro = new ResizeObserver(measure);
    if (stageRef.current) ro.observe(stageRef.current);
    return () => ro.disconnect();
  }, [measure]);

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

  // Related games: same genre first, then the rest of the vault
  const others = [
    ...GAMES.filter((g) => g.slug !== game.slug && g.genre === game.genre),
    ...GAMES.filter((g) => g.slug !== game.slug && g.genre !== game.genre),
  ];

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
            <div className="mb-1.5 flex flex-wrap items-center gap-2">
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
                Built-in · works everywhere
              </Badge>
            </div>
            <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
              <span className="text-rainbow">{game.title}</span>{" "}
              <span className="text-foreground/70">Unblocked</span>
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="ghost"
              className="btn-ghost-neon gap-2"
              onClick={toggleFullscreen}
            >
              <Maximize2 className="size-4 text-[#00e5ff]" />
              Fullscreen
            </Button>
            <a
              href={game.fallbackUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost-neon inline-flex h-10 items-center gap-2 rounded-md px-4 text-sm font-medium"
            >
              <ExternalLink className="size-4 text-[#3dff8b]" />
              Open in new tab
            </a>
          </div>
        </div>

        {/* Game stage */}
        <div ref={shellRef} className="rainbow-ring relative rounded-2xl">
          <div className="relative w-full overflow-hidden rounded-2xl bg-[#0b0520]">
            <div
              className={`relative w-full ${
                fsActive ? "h-screen" : "aspect-[16/10] sm:aspect-video"
              }`}
            >
              {mode === "builtin" ? (
                <Suspense
                  fallback={
                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-[#0b0520]">
                      <div className="size-12 animate-spin rounded-full border-2 border-[#b026ff33] border-t-[#00e5ff]" />
                      <p className="text-sm text-muted-foreground">
                        Loading {game.title}…
                      </p>
                    </div>
                  }
                >
                  {Native ? (
                    <div ref={stageRef} className="absolute inset-0">
                      <Native width={size.w} height={size.h} />
                    </div>
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                      Built-in version coming soon
                    </div>
                  )}
                </Suspense>
              ) : (
                <>
                  <iframe
                    key={hostedKey}
                    src={game.src}
                    title={`${game.title} — play unblocked (hosted)`}
                    className="absolute inset-0 size-full border-0"
                    allow="fullscreen; autoplay; gamepad; pointer-lock"
                    sandbox={game.sandbox}
                    loading="eager"
                    onLoad={() => setHostedLoaded(true)}
                  />
                  {!hostedLoaded && (
                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-[#0b0520]">
                      <div className="size-12 animate-spin rounded-full border-2 border-[#b026ff33] border-t-[#00e5ff]" />
                      <p className="text-sm text-muted-foreground">
                        Connecting to {game.title}…
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Mode toggle */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
          {Native && (
            <button
              onClick={() => setMode("builtin")}
              className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all ${
                mode === "builtin"
                  ? "btn-neon"
                  : "border border-[#b026ff4d] text-muted-foreground hover:border-[#00e5ff80] hover:text-foreground"
              }`}
            >
              ⚡ Built-in game
            </button>
          )}
          <button
            onClick={() => setMode("hosted")}
            className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all ${
              mode === "hosted"
                ? "btn-neon"
                : "border border-[#b026ff4d] text-muted-foreground hover:border-[#00e5ff80] hover:text-foreground"
            }`}
          >
            <Globe className="mr-1 inline size-3.5" />
            Hosted version
          </button>
          <span className="ml-2 hidden text-xs text-muted-foreground sm:inline">
            Built-in runs offline-fast inside this site — hosted loads the
            original from the web.
          </span>
        </div>

        {/* Ad banner — right under the game (highest-visibility slot) */}
        <AdBanner className="mt-4" />

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
          <div className="neon-card flex items-start gap-3 rounded-xl p-4">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-[#3dff8b55] bg-[#3dff8b1a]">
              <Zap className="size-4 text-[#3dff8b]" />
            </span>
            <div>
              <p className="text-sm font-semibold">Never blocked</p>
              <p className="mt-0.5 text-sm text-muted-foreground">
                The built-in version is served by this site itself — no
                third-party host to get filtered.
              </p>
            </div>
          </div>
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
            Arcade includes it built-in — playable instantly in your browser,
            free, with no downloads and no sign-up required. Works great on
            Chromebooks and school laptops.
          </p>
        </section>

        {/* Ad banner #2 — 320×50, isolated iframe */}
        <AdBannerSmall className="mt-6" />

        {/* Related games */}
        <section className="mt-10">
          <div className="mb-4 flex items-center gap-3">
            <ChevronRight className="size-5 text-[#ff2ea6]" />
            <h2 className="font-display text-xl font-bold">More {game.genre.toLowerCase()} games</h2>
            <div className="h-px flex-1 bg-gradient-to-r from-[#b026ff55] to-transparent" />
            <Link
              to={`/genre/${encodeURIComponent(game.genre.toLowerCase())}`}
              className="text-xs font-semibold text-[#00e5ff] hover:underline"
            >
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {others.slice(0, 4).map((g) => (
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
