import { type NeonGame } from "@/lib/games";
import { useState } from "react";

/**
 * The game's official logo with graceful degradation: if the image fails
 * to load (offline, hotlink blocked, dead host) we swap back to the
 * gradient letter art every card used before logos existed.
 */
export default function GameLogo({
  game,
  className = "size-16",
  letterClassName = "text-3xl",
}: {
  game: NeonGame;
  /** Tailwind size classes for the <img> */
  className?: string;
  /** Tailwind font-size class for the fallback letter */
  letterClassName?: string;
}) {
  const [failed, setFailed] = useState(false);

  if (!game.logo || failed) {
    return (
      <span
        className={`font-display font-extrabold bg-gradient-to-r ${game.artGradient} bg-clip-text text-transparent select-none`}
      >
        {game.title.charAt(0)}
      </span>
    );
  }

  return (
    <img
      src={game.logo}
      alt={`${game.title} logo`}
      loading="lazy"
      draggable={false}
      onError={() => setFailed(true)}
      className={`${className} rounded-lg object-contain select-none`}
    />
  );
}
