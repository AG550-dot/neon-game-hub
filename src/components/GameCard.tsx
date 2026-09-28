import GameLogo from "@/components/GameLogo";
import { GAMES, type NeonGame } from "@/lib/games";
import { motion } from "framer-motion";
import { Play, Users } from "lucide-react";
import { Link } from "react-router";

function GameCardInner({ game }: { game: NeonGame }) {
  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
      className="h-full"
    >
      <Link
        to={`/play/${game.slug}`}
        className="neon-card group relative flex h-full flex-col overflow-hidden rounded-2xl p-5"
      >
        {/* Art block */}
        <div
          className={`relative mb-4 flex h-40 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br ${game.artGradient} p-[2px]`}
        >
          <div className="flex h-full w-full flex-col items-center justify-center gap-3 rounded-[10px] bg-[#0b0520]/90 p-3">
            <span className="flex h-24 items-center justify-center transition-transform duration-300 group-hover:scale-110">
              <GameLogo game={game} className="max-h-24 max-w-44" letterClassName="text-6xl" />
            </span>
            <span className="px-3 text-center text-xs font-semibold tracking-wide text-foreground/80">
              {game.tagline}
            </span>
          </div>
          {/* Hover play badge */}
          <div className="absolute inset-0 flex items-center justify-center bg-[#070214]/70 opacity-0 backdrop-blur-[2px] transition-opacity duration-300 group-hover:opacity-100">
            <span className="flex items-center gap-2 rounded-full bg-foreground px-4 py-2 text-sm font-bold text-background shadow-[0_0_24px_rgba(0,229,255,0.45)]">
              <Play className="size-4 fill-current" />
              Play now
            </span>
          </div>
          {/* Corner glow */}
          <div className="pointer-events-none absolute -right-6 -top-6 size-24 rounded-full bg-white/10 blur-2xl" />
        </div>

        <div className="flex flex-1 flex-col">
          <div className="mb-1 flex items-center justify-between gap-2">
            <h3 className="font-display text-lg font-bold text-foreground">
              {game.title}
            </h3>
            <span
              className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold text-[#0a0320] ${game.accentChip}`}
            >
              {game.genre}
            </span>
          </div>
          <p className="mb-3 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
            {game.description}
          </p>
          <div className="mb-3 flex flex-wrap gap-1.5">
            {game.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-[#b026ff3d] bg-[#b026ff0d] px-2 py-0.5 text-[10px] font-semibold text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
          <div className="mt-auto flex items-center justify-between border-t border-[#b026ff26] pt-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Users className="size-3.5" />
              {game.players}
            </span>
            <span className={`font-semibold ${game.accentText}`}>
              Play free →
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export function GameCard({ game }: { game: NeonGame }) {
  return <GameCardInner game={game} />;
}

export function GameCardGrid() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {GAMES.map((game) => (
        <GameCardInner key={game.slug} game={game} />
      ))}
    </div>
  );
}

export default GameCard;
