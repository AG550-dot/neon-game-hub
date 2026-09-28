import { useCallback, useEffect, useRef, useState } from "react";
import { useAnimationFrame } from "./useAnimationFrame";
import type { NativeGameProps } from "./registry";

const COLORS = {
  bg1: "#0d0524",
  grid: "#b026ff",
  grid2: "#00e5ff",
  ball: "#00e5ff",
  obstacle: "#ff2ea6",
  ground: "#150b31",
};

type Obstacle = { x: number; z: number; hue: "pink" | "cyan" };

type SlopeWorld = {
  ballX: number;
  z: number;
  speed: number;
  obstacles: Obstacle[];
  nextSpawn: number;
  dead: boolean;
};

/** Built-in "Slope": perspective endless slope with neon obstacles. */
export default function NeonSlope({ width, height }: NativeGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [running, setRunning] = useState(false);
  const [dead, setDead] = useState(false);

  const world = useRef<SlopeWorld>({
    ballX: 0,
    z: 0,
    speed: 14,
    obstacles: [],
    nextSpawn: 1.2,
    dead: false,
  });

  const reset = useCallback(() => {
    world.current = {
      ballX: 0,
      z: 0,
      speed: 14,
      obstacles: [],
      nextSpawn: 1.2,
      dead: false,
    };
    setScore(0);
    setDead(false);
    setRunning(true);
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("neonplay.best.slope");
      if (raw) setBest(parseInt(raw, 10) || 0);
    } catch {
      /* storage unavailable */
    }
  }, []);

  useEffect(() => {
    if (score > best) {
      setBest(score);
      try {
        localStorage.setItem("neonplay.best.slope", String(score));
      } catch {
        /* storage unavailable */
      }
    }
  }, [score, best]);

  const keyHeld = useRef<Record<string, boolean>>({});

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      keyHeld.current[e.key] = true;
      if (e.key === " " || e.key === "Enter") {
        if (dead) reset();
        else if (!running) setRunning(true);
        e.preventDefault();
      }
      if (["ArrowLeft", "ArrowRight"].includes(e.key)) e.preventDefault();
    };
    const up = (e: KeyboardEvent) => {
      keyHeld.current[e.key] = false;
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, [running, dead, reset]);

  const die = useCallback(() => {
    world.current.dead = true;
    setDead(true);
    setRunning(false);
  }, []);

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

        // ---- simulation
        if (!g.dead) {
          if (keyHeld.current.ArrowLeft || keyHeld.current.a)
            g.ballX -= dt * 2.4;
          if (keyHeld.current.ArrowRight || keyHeld.current.d)
            g.ballX += dt * 2.4;
          g.ballX = Math.max(-1, Math.min(1, g.ballX));
          g.z += g.speed * dt;
          g.speed = Math.min(34, g.speed + dt * 0.55);

          if (g.z > g.nextSpawn) {
            g.nextSpawn = g.z + 26 + Math.random() * 30;
            g.obstacles.push({
              x: ((Math.random() * 5) | 0) / 2.4 - 1,
              z: 62,
              hue: Math.random() < 0.5 ? "pink" : "cyan",
            });
          }
          for (const o of g.obstacles) o.z -= g.speed * dt;
          g.obstacles = g.obstacles.filter((o) => o.z > -8);

          for (const o of g.obstacles) {
            if (o.z < 2.4 && o.z > 0.4 && Math.abs(o.x - g.ballX * 0.55) < 0.24) {
              die();
              break;
            }
          }

          setScore(Math.floor(g.z));
        }

        // ---- render
        const horizon = h * 0.3;
        ctx.fillStyle = COLORS.bg1;
        ctx.fillRect(0, 0, w, h);
        const sky = ctx.createLinearGradient(0, 0, 0, horizon);
        sky.addColorStop(0, "#1a0b3f");
        sky.addColorStop(1, "#070214");
        ctx.fillStyle = sky;
        ctx.fillRect(0, 0, w, horizon);

        const proj = (x: number, z: number): [number, number, number] => {
          const s = 1 / Math.max(z, 0.6);
          return [
            w / 2 + x * w * 0.9 * s,
            horizon + (h - horizon) * s * 1.25,
            s,
          ];
        };

        // ground
        ctx.fillStyle = COLORS.ground;
        ctx.fillRect(0, horizon, w, h - horizon);

        // scrolling grid rows
        const rows = 26;
        for (let i = 0; i < rows; i++) {
          const z = i * 4 + (g.z % 4);
          if (z <= 0.5) continue;
          const [, gy, s] = proj(0, z);
          ctx.globalAlpha = Math.min(0.5, s * 1.5);
          ctx.strokeStyle = i % 2 ? COLORS.grid : COLORS.grid2;
          ctx.lineWidth = Math.max(1, 2.4 * s);
          const halfW = w * 0.9 * s;
          ctx.beginPath();
          ctx.moveTo(w / 2 - halfW, gy);
          ctx.lineTo(w / 2 + halfW, gy);
          ctx.stroke();
        }
        // vertical lane lines
        for (let l = -2; l <= 2; l++) {
          ctx.globalAlpha = 0.25;
          ctx.strokeStyle = COLORS.grid2;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          for (let z = 1; z <= 60; z += 2) {
            const [px, py] = proj(l * 0.45, z);
            if (z === 1) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.stroke();
        }

        // rails
        ctx.globalAlpha = 0.95;
        for (const side of [-1, 1]) {
          ctx.strokeStyle = COLORS.grid2;
          ctx.lineWidth = 3;
          ctx.shadowColor = COLORS.grid2;
          ctx.shadowBlur = 12;
          ctx.beginPath();
          for (let z = 1; z <= 60; z += 1.5) {
            const [px, py] = proj(side * 0.98, z);
            if (z === 1) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.stroke();
        }
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;

        // obstacles
        for (const o of g.obstacles) {
          const [ox, oy, s] = proj(o.x, o.z);
          const size = Math.max(4, 44 * s * 2.6);
          ctx.globalAlpha = Math.min(1, s * 2.8);
          ctx.shadowColor = o.hue === "pink" ? COLORS.obstacle : COLORS.grid2;
          ctx.shadowBlur = 18;
          ctx.fillStyle = o.hue === "pink" ? COLORS.obstacle : COLORS.grid2;
          ctx.fillRect(ox - size / 2, oy - size, size, size);
        }
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;

        // ball
        const [bx, by, bs] = proj(g.ballX * 0.55, 2.6);
        ctx.shadowColor = "rgba(0,229,255,0.6)";
        ctx.shadowBlur = 26;
        ctx.fillStyle = COLORS.ball;
        ctx.beginPath();
        ctx.arc(bx, by - 12 * bs * 2, Math.max(6, 15 * bs * 2.4), 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // speed HUD
        ctx.fillStyle = "rgba(244,239,255,0.7)";
        ctx.font = "600 13px 'Space Grotesk', sans-serif";
        ctx.textAlign = "left";
        ctx.fillText(`speed ${Math.round(g.speed * 10)}`, 14, 24);

        // game over overlay
        if (g.dead) {
          ctx.fillStyle = "rgba(7,2,20,0.74)";
          ctx.fillRect(0, 0, w, h);
          ctx.textAlign = "center";
          ctx.fillStyle = "#ff2ea6";
          ctx.font = "800 40px Unbounded, sans-serif";
          ctx.fillText("WASTED", w / 2, h / 2 - 8);
          ctx.fillStyle = "rgba(244,239,255,0.9)";
          ctx.font = "500 15px 'Space Grotesk', sans-serif";
          ctx.fillText(
            `score ${Math.floor(g.z)} · best ${best}`,
            w / 2,
            h / 2 + 26,
          );
          ctx.fillText("SPACE / tap to retry", w / 2, h / 2 + 52);
          ctx.textAlign = "left";
        }
      },
      [best, die],
    ),
    !running && !dead,
  );

  const handlePointer = (e: React.PointerEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    if (dead || !running) {
      reset();
      return;
    }
    const x = (e.clientX - rect.left) / rect.width;
    keyHeld.current.ArrowLeft = x < 0.38;
    keyHeld.current.ArrowRight = x > 0.62;
  };

  return (
    <div className="relative h-full w-full">
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="block h-full w-full touch-none select-none"
        onPointerDown={handlePointer}
      />
      {!running && !dead && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-[#070214]/85 p-6 text-center backdrop-blur-sm">
          <p className="font-display text-3xl font-extrabold text-rainbow">
            NEON SLOPE
          </p>
          <p className="text-sm text-muted-foreground">
            ← → or A/D to steer · dodge the pink blocks
          </p>
          <button
            onClick={reset}
            className="btn-neon mt-2 rounded-full px-6 py-2.5 text-sm"
          >
            Start — or press SPACE
          </button>
          {best > 0 && (
            <p className="text-xs text-muted-foreground">best: {best}</p>
          )}
        </div>
      )}
    </div>
  );
}
