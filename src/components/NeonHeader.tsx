import GameLogo from "@/components/GameLogo";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { GAMES, getGenreStats, searchGames } from "@/lib/games";
import {
  ChevronDown,
  Gamepad2,
  LayoutGrid,
  LogOut,
  Menu,
  Search,
  User,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";

const genreStats = getGenreStats();

export default function NeonHeader() {
  const { isAuthenticated, user, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [genresOpen, setGenresOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const searchRef = useRef<HTMLDivElement>(null);

  // Close any open menus when the route changes
  useEffect(() => {
    setMenuOpen(false);
    setGenresOpen(false);
    setQuery("");
  }, [location.pathname]);

  // Click-outside closes the genres dropdown
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (
        genresOpen &&
        searchRef.current &&
        !searchRef.current.contains(e.target as Node)
      ) {
        setGenresOpen(false);
      }
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [genresOpen]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const suggestions = query.trim() ? searchGames(query).slice(0, 6) : [];
  const showSuggestions = focused && suggestions.length > 0;
  const exactNone = focused && query.trim() && suggestions.length === 0;

  const submitSearch = (q: string) => {
    const trimmed = q.trim();
    if (!trimmed) return;
    navigate(`/games?q=${encodeURIComponent(trimmed)}`);
    setQuery("");
    setFocused(false);
    (document.activeElement as HTMLElement)?.blur();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#b026ff33] bg-[#070214]/80 backdrop-blur-xl">
      <div className="h-[2px] w-full bg-rainbow" />

      <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-3 px-4 sm:px-6">
        {/* Logo */}
        <Link to="/" className="group flex shrink-0 items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-xl border border-[#b026ff66] bg-[#0b0520] shadow-[0_0_18px_rgba(176,38,255,0.45)] transition-shadow group-hover:shadow-[0_0_26px_rgba(0,229,255,0.5)]">
            <Gamepad2 className="size-5 text-[#00e5ff]" />
          </span>
          <span className="hidden font-display text-lg font-bold tracking-tight sm:inline">
            <span className="text-rainbow">NeonPlay</span>{" "}
            <span className="text-foreground/80">Arcade</span>
          </span>
        </Link>

        {/* Search (desktop) */}
        <div ref={searchRef} className="relative hidden flex-1 md:block">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              submitSearch(query);
            }}
          >
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setTimeout(() => setFocused(false), 150)}
              placeholder={`Search ${GAMES.length} games — fnaf, papa's, puzzle…`}
              className="h-10 w-full rounded-full border border-[#b026ff4d] bg-[#100824] pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground/70 outline-none transition-all focus:border-[#00e5ff88] focus:shadow-[0_0_18px_rgba(0,229,255,0.2)]"
              aria-label="Search games"
            />
          </form>

          {/* Live suggestions */}
          {(showSuggestions || exactNone) && (
            <div className="absolute left-0 right-0 top-12 overflow-hidden rounded-xl border border-[#b026ff44] bg-[#150b31]/97 shadow-[0_12px_40px_rgba(0,0,0,0.5)] backdrop-blur-xl">
              {showSuggestions ? (
                <ul className="py-1.5">
                  {suggestions.map((g) => (
                    <li key={g.slug}>
                      <Link
                        to={`/play/${g.slug}`}
                        className="flex items-center gap-3 px-3.5 py-2.5 transition-colors hover:bg-[#b026ff1f]"
                        onClick={() => {
                          setQuery("");
                          setFocused(false);
                        }}
                      >
                        <span
                          className={`flex size-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${g.artGradient} p-[1.5px]`}
                        >
                          <span className="flex size-full items-center justify-center overflow-hidden rounded-[6px] bg-[#0b0520]">
                            <GameLogo game={g} className="max-h-5 max-w-5" letterClassName="text-xs" />
                          </span>
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-semibold text-foreground">
                            {g.title}
                          </span>
                          <span className="block truncate text-xs text-muted-foreground">
                            {g.genre} · {g.tagline}
                          </span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="px-4 py-3 text-sm text-muted-foreground">
                  No games match “{query}” — try “runner”, “puzzle” or “retro”.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Genres dropdown (desktop) */}
        <div className="relative hidden md:block">
          <button
            onClick={() => setGenresOpen((v) => !v)}
            className={`flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-semibold transition-all ${
              genresOpen
                ? "border-[#00e5ff88] bg-[#00e5ff14] text-foreground"
                : "border-[#b026ff4d] text-muted-foreground hover:border-[#00e5ff80] hover:text-foreground"
            }`}
            aria-expanded={genresOpen}
          >
            <LayoutGrid className="size-4 text-[#ff2ea6]" />
            Genres
            <ChevronDown
              className={`size-3.5 transition-transform ${genresOpen ? "rotate-180" : ""}`}
            />
          </button>

          {genresOpen && (
            <div className="absolute right-0 top-12 w-64 overflow-hidden rounded-xl border border-[#b026ff44] bg-[#150b31]/97 p-2 shadow-[0_12px_40px_rgba(0,0,0,0.5)] backdrop-blur-xl">
              {genreStats.map(({ genre, count }) => (
                <Link
                  key={genre}
                  to={`/genre/${encodeURIComponent(genre.toLowerCase())}`}
                  className="flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-[#b026ff1f] hover:text-foreground"
                >
                  {genre}
                  <span className="rounded-full bg-[#00e5ff14] px-2 py-0.5 text-[10px] font-bold text-[#9bf3ff]">
                    {count}
                  </span>
                </Link>
              ))}
              <div className="mt-1 border-t border-[#b026ff26] pt-2">
                <Link
                  to="/games"
                  className="block rounded-lg px-3 py-2 text-sm font-bold text-[#00e5ff] transition-colors hover:bg-[#00e5ff14]"
                >
                  View all games →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Right actions */}
        <div className="ml-auto flex shrink-0 items-center gap-2">
          {isAuthenticated ? (
            <>
              <span className="hidden items-center gap-2 rounded-full border border-[#00e5ff4d] bg-[#00e5ff0d] px-3 py-1.5 text-xs font-semibold text-[#9bf3ff] xl:flex">
                <User className="size-3.5" />
                {user?.name || user?.email || "Player"}
              </span>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Sign out"
                className="btn-ghost-neon hidden sm:inline-flex"
                onClick={handleSignOut}
              >
                <LogOut className="size-4" />
              </Button>
            </>
          ) : (
            <Button
              asChild
              variant="ghost"
              className="btn-ghost-neon hidden sm:inline-flex"
            >
              <Link to="/auth">Sign in</Link>
            </Button>
          )}

          <Button asChild className="btn-neon hidden sm:inline-flex">
            <Link to="/games">Play now</Link>
          </Button>

          {/* Mobile burger */}
          <Button
            variant="ghost"
            size="icon"
            className="btn-ghost-neon md:hidden"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen((v) => !v)}
          >
            {menuOpen ? <X className="size-4" /> : <Menu className="size-4" />}
          </Button>
        </div>
      </div>

      {/* ================= Mobile menu ================= */}
      {menuOpen && (
        <div className="border-t border-[#b026ff33] bg-[#0b0520]/97 px-4 py-4 backdrop-blur-xl md:hidden">
          {/* Search */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              submitSearch(query);
            }}
            className="relative"
          >
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search games…"
              className="h-10 w-full rounded-full border border-[#b026ff4d] bg-[#100824] pl-9 pr-4 text-sm outline-none focus:border-[#00e5ff88]"
              aria-label="Search games"
            />
          </form>

          {/* Genres */}
          <p className="mb-2 mt-4 px-1 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/70">
            Genres
          </p>
          <div className="flex flex-wrap gap-2">
            {genreStats.map(({ genre, count }) => (
              <Link
                key={genre}
                to={`/genre/${encodeURIComponent(genre.toLowerCase())}`}
                className="rounded-full border border-[#b026ff4d] px-3 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:border-[#00e5ff80] hover:text-foreground"
              >
                {genre}
                <span className="ml-1.5 text-[10px] text-[#9bf3ff]">{count}</span>
              </Link>
            ))}
          </div>

          {/* All games */}
          <p className="mb-2 mt-5 px-1 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/70">
            All games
          </p>
          <nav className="flex flex-col gap-1">
            {searchGames("").slice(0, 30).map((g) => (
              <Link
                key={g.slug}
                to={`/play/${g.slug}`}
                className="flex items-center gap-3 rounded-lg px-2 py-2 text-sm font-medium text-muted-foreground hover:bg-[#b026ff1a] hover:text-foreground"
              >
                <span
                  className={`flex size-7 shrink-0 items-center justify-center rounded-md bg-gradient-to-br ${g.artGradient} p-[1.5px]`}
                >
                  <span className="flex size-full items-center justify-center overflow-hidden rounded-[5px] bg-[#0b0520]">
                    <GameLogo game={g} className="max-h-4 max-w-4" letterClassName="text-[10px]" />
                  </span>
                </span>
                {g.title}
                <span className="ml-auto text-[10px] text-muted-foreground/60">
                  {g.genre}
                </span>
              </Link>
            ))}
          </nav>

          <div className="mt-4 flex flex-col gap-2">
            <Button asChild className="btn-neon w-full">
              <Link to="/games">Play now</Link>
            </Button>
            {!isAuthenticated && (
              <Button asChild variant="ghost" className="btn-ghost-neon w-full">
                <Link to="/auth">Sign in</Link>
              </Button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
