import { type NeonGame } from "@/lib/games";
import { Play } from "lucide-react";
import { Link } from "react-router";

/** Compact tile with the animated conic rainbow ring on hover. */
export default function GameTile({ game }: { game: NeonGame }) {
  return (
    <Link
      to={`/play/${game.slug}`}
      className="rainbow-ring group flex w-full flex-col gap-3 rounded-2xl bg-[#100824]/80 p-4 transition-transform duration-300 hover:-translate-y-1"
    >
      <div
        className={`relative flex h-24 items-center justify-center rounded-xl bg-gradient-to-br ${game.artGradient}`}
      >
        <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-[#0b0520]/85">
          <span
            className={`font-display text-4xl font-extrabold bg-gradient-to-r ${game.artGradient} bg-clip-text text-transparent`}
          >
            {game.title.charAt(0)}
          </span>
        </div>
        <span className="absolute right-2 top-2 flex size-7 items-center justify-center rounded-full bg-[#070214]/80 opacity-0 transition-opacity group-hover:opacity-100">
          <Play className="size-3.5 fill-current text-[#00e5ff]" />
        </span>
      </div>
      <div>
        <p className="font-display text-sm font-bold text-foreground group-hover:text-[#00e5ff] transition-colors">
          {game.title}
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">{game.genre}</p>
      </div>
    </Link>
  );
}
