import { GENRES, SANDBOX, type Genre, type NeonGame } from "./games-types";
import { PREMIUM_GAMES } from "./games-premium";
import { NEW_GAMES } from "./games-new";

export type { NeonGame, Genre } from "./games-types";
export { GENRES, SANDBOX } from "./games-types";

/**
 * Full catalog: 31 hand-curated flagships first, then the expanded
 * verified library. Premium games lead every "featured" surface.
 */
export const GAMES: NeonGame[] = [...PREMIUM_GAMES, ...NEW_GAMES];

export function getGame(slug: string | undefined): NeonGame | undefined {
  return GAMES.find((g) => g.slug === slug);
}

/** Games whose primary genre matches, sorted alphabetically by title. */
export function getGamesByGenre(genre: string): NeonGame[] {
  return GAMES.filter(
    (g) => g.genre.toLowerCase() === genre.toLowerCase(),
  ).sort((a, b) => a.title.localeCompare(b.title));
}

/** Genres that actually have games, with counts, biggest first. */
export function getGenreStats(): { genre: Genre; count: number }[] {
  return GENRES.map((genre) => ({
    genre,
    count: GAMES.filter((g) => g.genre === genre).length,
  }))
    .filter((s) => s.count > 0)
    .sort((a, b) => b.count - a.count);
}

/** Case-insensitive text search across title, tagline, genre and tags. */
export function searchGames(query: string): NeonGame[] {
  const q = query.trim().toLowerCase();
  if (!q) return GAMES;
  return GAMES.filter(
    (g) =>
      g.title.toLowerCase().includes(q) ||
      g.tagline.toLowerCase().includes(q) ||
      g.genre.toLowerCase().includes(q) ||
      g.tags.some((t) => t.toLowerCase().includes(q)),
  ).sort((a, b) => a.title.localeCompare(b.title));
}

// Re-exported so premium-only imports (e.g. registry) keep working.
export { PREMIUM_GAMES };
