import { useCallback, useEffect, useRef, useState } from "react";
import { useAnimationFrame } from "./useAnimationFrame";
import type { NativeGameProps } from "./registry";

const TILE = 44;
const LANES = 5; // floor tiles across the tunnel

type Tile = { lane: number; alive: boolean };
type Phase = "ready" | "run" | "dead";

/**
 * Built-in "Void Runner" — Run 3 style: you auto-run along a tunnel floor;
 * floor tiles crumble behind you; jump gaps; fall into the void = death.
 * The tunnel slowly rotates as distance grows (the classic Run 3 feel).
 */
export default function VoidRunner({ width, height }: NativeGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [phase, setPhase] = useState<Phase>("ready");

  const world = useRef({
    dist: 0,
    speed: 10,
    py: 0, // jump height
    vy: 0,
    onGround: true,
    tiles: [] as Tile[],
    rot: 0,
    rotSpeed: 0,
  });

  useEffect(() => {
    try {
      const raw = localStorage.getItem("neonplay.best.voidrunner");
      if (raw) setBest(parseInt(raw, 10) || 0);
    } catch {
      /* ignore */
    }
  }, []);

  // Build initial floor
  useEffect(() => {
    world.current.tiles = Array.from({ length: 40 }, (_, i) => ({
      lane: i % LANES,
      alive: true,
    }));
  }, []);

  const reset = useCallback(() => {
    world.current = {
      dist: 0,
      speed: 10,
      py: 0,
      vy: 0,
      onGround: true,
      tiles: Array.from({ length: 40 }, (_, i) => ({
        lane: i % LANES,
        alive: true,
      })),
      rot: 0,
      rotSpeed: 0,
    };
    setScore(0);
    setPhase("run");
  }, []);

  const jump = useCallback(() => {
    const g = world.current;
    if (phase !== "run") {
      reset();
      return;
    }
    if (g.onGround) {
      g.vy = 15;
      g.onGround = false;
    }
  }, [phase, reset]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === " " || e.key === "ArrowUp" || e.key === "w") {
        jump();
        e.preventDefault();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [jump]);

  useAnimationFrame(
    useCallback(
      (dt: number) => {
        const c = canvasRef.current;
        if (!c) return;
        const ctx = c.getContext("2d");
        if (!ctx) return;
        const w = c.width;
        const h = c.height;
        const g = world.current;

        if (phase === "run") {
          g.dist += g.speed * dt;
          g.speed = Math.min(22, g.speed + dt * 0.28);
          setScore(Math.floor(g.dist * 2));

          // rotation ramps up with distance — the signature Run 3 feel
          g.rotSpeed = Math.min(0.5, g.dist / 900);
          g.rot += g.rotSpeed * dt;

          // physics
          if (!g.onGround) {
            g.vy -= 42 * dt;
            g.py += g.vy * dt;
            if (g.py <= 0) {
              g.py = 0;
              g.vy = 0;
              g.onGround = true;
            }
          }

          // floor tile bookkeeping: remove tiles far behind, add ahead
          const total = g.tiles.length;
          const front = g.tiles[total - 1]?.lane ?? 0;
          while (total > 0 && g.tiles[0].lane < g.dist / TILE - 6) {
            g.tiles.shift();
            // ahead: gap chance grows with speed
            const gap = Math.random() < Math.min(0.22, 0.06 + g.speed / 90);
            g.tiles.push({
              lane: front + 1,
              alive: !gap,
            });
          }

          // fall check: is there floor under the runner?
          const idx = Math.floor(g.dist / TILE);
          const tile = g.tiles.find((t) => t.lane === idx);
          if (!tile || !tile.alive) {
            if (g.onGround) {
              setPhase("dead");
            }
          }
        }

        // ---- render
        const cx = w / 2;
        const cy = h * 0.62;
        ctx.fillStyle = "#05010f";
        ctx.fillRect(0, 0, w, h);

        // stars
        ctx.fillStyle = "rgba(255,255,255,0.35)";
        for (let i = 0; i < 40; i++) {
          const x = (i * 97.3) % w;
          const y = (i * 53.7) % (h * 0.55);
          ctx.fillRect(x, y, 1.5, 1.5);
        }

        // tunnel floor (drawn as a pseudo-3d strip of tiles)
        const drawTile = (lane: number, alive: boolean, idx: number) => {
          const rel = idx * TILE - g.dist;
          if (rel < -TILE || rel > w) return;
          const depth = Math.max(0.35, 1 - Math.abs(rel) / (w * 0.9));
          const x = cx + (lane - (LANES - 1) / 2) * TILE * 1.15 * depth;
          const y =
            cy + Math.sin((lane / LANES) * Math.PI) * 26 * depth - rel * 0.28;
          const size = TILE * depth;
          if (alive) {
            const hue = (lane * 47 + idx * 13) % 360;
            ctx.fillStyle = `hsl(${270 + (hue % 60)} 90% ${18 + depth * 14}%)`;
            ctx.strokeStyle = `hsla(${(280 + hue) % 360} 100% 65% / 0.85)`;
            ctx.lineWidth = 2;
            ctx.fillRect(x - size / 2, y - size / 2, size, size);
            ctx.strokeRect(x - size / 2, y - size / 2, size, size);
          } else {
            ctx.strokeStyle = "rgba(255,46,166,0.28)";
            ctx.lineWidth = 1.5;
            ctx.strokeRect(x - size / 2, y - size / 2, size, size);
          }
        };

        for (let i = 0; i < g.tiles.length; i++) {
          const t = g.tiles[i];
          drawTile(t.lane % LANES, t.alive, t.lane);
        }

        // runner
        const rx = cx;
        const ry =
          cy -
          g.py * 3 -
          Math.sin(((Math.floor(g.dist / TILE) % LANES) / LANES) * Math.PI) * 26;
        ctx.shadowColor = "#00e5ff";
        ctx.shadowBlur = 22;
        ctx.fillStyle = "#00e5ff";
        ctx.beginPath();
        ctx.arc(rx, ry - TILE * 0.4, Math.max(7, TILE * 0.3), 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        // trail
        ctx.fillStyle = "rgba(0,229,255,0.25)";
        ctx.beginPath();
        ctx.ellipse(rx - 26, ry - TILE * 0.35, 18, 6, 0, 0, Math.PI * 2);
        ctx.fill();

        // HUD
        ctx.fillStyle = "rgba(244,239,255,0.75)";
        ctx.font = "600 13px 'Space Grotesk', sans-serif";
        ctx.textAlign = "left";
        ctx.fillText(`distance ${Math.floor(g.dist * 2)}`, 14, 24);
        ctx.textAlign = "right";
        ctx.fillText(`best ${best}`, w - 14, 24);
        ctx.textAlign = "left";

        if (phase === "dead") {
          ctx.fillStyle = "rgba(7,2,20,0.74)";
          ctx.fillRect(0, 0, w, h);
          ctx.textAlign = "center";
          ctx.fillStyle = "#ff2ea6";
          ctx.font = "800 40px Unbounded, sans-serif";
          ctx.fillText("LOST TO THE VOID", w / 2, h / 2 - 8);
          ctx.fillStyle = "rgba(244,239,255,0.9)";
          ctx.font = "500 15px 'Space Grotesk', sans-serif";
          ctx.fillText(
            `distance ${Math.floor(g.dist * 2)} · best ${best}`,
            w / 2,
            h / 2 + 26,
          );
          ctx.fillText("SPACE / tap to retry", w / 2, h / 2 + 52);
          ctx.textAlign = "left";
        }
        if (phase === "ready") {
          ctx.fillStyle = "rgba(7,2,20,0.6)";
          ctx.fillRect(0, 0, w, h);
        }
      },
      [best, phase],
    ),
    phase === "dead",
  );

  return (
    <div
      className="relative h-full w-full"
      onPointerDown={jump}
      role="application"
      aria-label="Void Runner game"
    >
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="block h-full w-full touch-none select-none"
      />
      {phase === "ready" && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-[#070214]/85 p-6 text-center backdrop-blur-sm">
          <p className="font-display text-3xl font-extrabold text-rainbow">
            VOID RUNNER
          </p>
          <p className="text-sm text-muted-foreground">
            SPACE / tap to jump the gaps · the tunnel rotates as you go
          </p>
          <button
            onClick={reset}
            className="btn-neon mt-2 rounded-full px-6 py-2.5 text-sm"
          >
            Start running
          </button>
          {best > 0 && (
            <p className="text-xs text-muted-foreground">best: {best}</p>
          )}
        </div>
      )}
    </div>
  );
}
