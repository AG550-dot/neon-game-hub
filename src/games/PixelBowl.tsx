import { useCallback, useEffect, useRef, useState } from "react";
import { useAnimationFrame } from "./useAnimationFrame";
import type { NativeGameProps } from "./registry";

type Defender = { x: number; y: number; vx: number; vy: number };
type Phase = "aim" | "flight" | "result" | "down";

const FIELD_W = 100; // abstract units
const H = 60;

/** Built-in "Pixel Bowl": retro football passing game. */
export default function PixelBowl({ width, height }: NativeGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [down, setDown] = useState(1);
  const [msg, setMsg] = useState("1st & 10 — drag to throw!");
  const phase = useRef<Phase>("aim");
  const ball = useRef({ x: 12, y: H / 2, tx: 0, ty: 0, t: 0 });
  const defenders = useRef<Defender[]>([]);
  const aiming = useRef<{ active: boolean; x: number; y: number }>({
    active: false,
    x: 0,
    y: 0,
  });
  const markerX = useRef(72); // first down line
  const ballSpot = useRef(12);
  const resultTimer = useRef(0);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("neonplay.best.pixelbowl");
      if (raw) setBest(parseInt(raw, 10) || 0);
    } catch {
      /* ignore */
    }
  }, []);

  const spawnDefense = useCallback((n: number) => {
    defenders.current = Array.from({ length: n }, (_, i) => ({
      x: 30 + Math.random() * 45,
      y: ((H * (i + 1)) / (n + 1)) | 0,
      vx: (Math.random() - 0.5) * 10,
      vy: (Math.random() - 0.5) * 8,
    }));
  }, []);

  const newDown = useCallback(
    (downNum: number, spot: number) => {
      ballSpot.current = spot;
      markerX.current = Math.min(96, spot + 10);
      ball.current = { x: spot, y: H / 2, tx: 0, ty: 0, t: 0 };
      phase.current = "aim";
      setDown(downNum);
      spawnDefense(Math.min(6, 2 + downNum));
      const label =
        downNum === 1
          ? "1st"
          : downNum === 2
            ? "2nd"
            : downNum === 3
              ? "3rd"
              : "4th";
      setMsg(`${label} & ${Math.max(1, Math.round(markerX.current - spot))}`);
    },
    [spawnDefense],
  );

  const startDrive = useCallback(() => {
    setScore(0);
    newDown(1, 12);
  }, [newDown]);

  useEffect(() => {
    startDrive();
  }, [startDrive]);

  const throwBall = useCallback((tx: number, ty: number) => {
    if (phase.current !== "aim") return;
    ball.current.tx = Math.max(20, Math.min(97, tx));
    ball.current.ty = Math.max(4, Math.min(H - 4, ty));
    ball.current.t = 0;
    phase.current = "flight";
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
        const sx = w / FIELD_W;
        const sy = h / H;

        // ---- simulate
        if (phase.current === "aim") {
          for (const d of defenders.current) {
            d.x += d.vx * dt;
            d.y += d.vy * dt;
            if (d.x < 26 || d.x > 82) d.vx *= -1;
            if (d.y < 6 || d.y > H - 6) d.vy *= -1;
          }
          if (resultTimer.current > 0) {
            resultTimer.current -= dt;
          }
        } else if (phase.current === "flight") {
          ball.current.t += dt * 1.6;
          const t = Math.min(1, ball.current.t);
          ball.current.x =
            ballSpot.current + (ball.current.tx - ballSpot.current) * t;
          ball.current.y = H / 2 + (ball.current.ty - H / 2) * t;
          if (t >= 1) {
            // completed or intercepted?
            const caught = defenders.current.some(
              (d) =>
                Math.hypot(d.x - ball.current.tx, d.y - ball.current.ty) < 5.5,
            );
            if (caught) {
              setMsg("INTERCEPTED!");
              phase.current = "result";
              resultTimer.current = 1.4;
              setTimeout(() => startDrive(), 1500);
            } else {
              const gained = ball.current.tx - ballSpot.current;
              ballSpot.current = ball.current.tx;
              if (ballSpot.current >= markerX.current) {
                setScore((s) => s + 7);
                setMsg("TOUCHDOWN! +7");
                phase.current = "result";
                resultTimer.current = 1.4;
                setTimeout(() => newDown(1, Math.min(80, ballSpot.current)), 1500);
              } else if (gained >= 10) {
                setMsg("First down!");
                phase.current = "result";
                resultTimer.current = 1.1;
                setTimeout(() => newDown(1, ballSpot.current), 1200);
              } else {
                const nd = down + 1;
                if (nd > 4) {
                  setMsg("TURNOVER ON DOWNS");
                  phase.current = "result";
                  setTimeout(() => startDrive(), 1500);
                } else {
                  newDown(nd, ballSpot.current);
                }
              }
            }
          }
        }

        // ---- render field
        ctx.fillStyle = "#0d2818";
        ctx.fillRect(0, 0, w, h);
        // neon field stripes
        for (let i = 0; i < 10; i++) {
          ctx.fillStyle = i % 2 ? "#0f3520" : "#0d2818";
          ctx.fillRect(((i * 10 * w) / 100) | 0, 0, (10 * w) / 100, h);
        }
        // yard lines
        ctx.strokeStyle = "rgba(61,255,139,0.5)";
        ctx.lineWidth = 1;
        for (let x = 10; x < 100; x += 10) {
          ctx.beginPath();
          ctx.moveTo(x * sx, 0);
          ctx.lineTo(x * sx, h);
          ctx.stroke();
        }
        // first down marker (glowing)
        ctx.strokeStyle = "#ffe14d";
        ctx.lineWidth = 3;
        ctx.shadowColor = "#ffe14d";
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.moveTo(markerX.current * sx, 0);
        ctx.lineTo(markerX.current * sx, h);
        ctx.stroke();
        ctx.shadowBlur = 0;

        // endzone
        ctx.fillStyle = "rgba(255,46,166,0.25)";
        ctx.fillRect(0.9 * w, 0, 0.1 * w, h);
        ctx.fillStyle = "#ff2ea6";
        ctx.font = `800 ${Math.round(h * 0.14)}px Unbounded, sans-serif`;
        ctx.textAlign = "center";
        ctx.fillText("TD", 0.95 * w, h / 2 + h * 0.05);

        // defenders
        for (const d of defenders.current) {
          ctx.fillStyle = "#ff2ea6";
          ctx.shadowColor = "#ff2ea6";
          ctx.shadowBlur = 10;
          ctx.beginPath();
          ctx.arc(d.x * sx, d.y * sy, Math.max(5, h * 0.035), 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.shadowBlur = 0;

        // QB
        ctx.fillStyle = "#00e5ff";
        ctx.beginPath();
        ctx.arc(ballSpot.current * sx, (H / 2) * sy, Math.max(6, h * 0.04), 0, Math.PI * 2);
        ctx.fill();

        // aim line while aiming
        if (phase.current === "aim" && aiming.current.active) {
          ctx.strokeStyle = "rgba(0,229,255,0.6)";
          ctx.setLineDash([6, 6]);
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(ballSpot.current * sx, (H / 2) * sy);
          ctx.lineTo(aiming.current.x * sx, aiming.current.y * sy);
          ctx.stroke();
          ctx.setLineDash([]);
        }

        // ball in flight
        if (phase.current === "flight" || phase.current === "result") {
          ctx.fillStyle = "#ffe14d";
          ctx.shadowColor = "#ffe14d";
          ctx.shadowBlur = 14;
          ctx.beginPath();
          ctx.ellipse(
            ball.current.x * sx,
            ball.current.y * sy,
            Math.max(4, h * 0.022),
            Math.max(2.5, h * 0.013),
            0,
            0,
            Math.PI * 2,
          );
          ctx.fill();
          ctx.shadowBlur = 0;
        }

        // scoreboard
        ctx.fillStyle = "rgba(7,2,20,0.75)";
        ctx.fillRect(0, 0, w, 34);
        ctx.fillStyle = "#3dff8b";
        ctx.font = "700 14px 'Space Grotesk', sans-serif";
        ctx.textAlign = "left";
        ctx.fillText(`SCORE ${score}`, 12, 22);
        ctx.fillStyle = "#ffe14d";
        ctx.textAlign = "center";
        ctx.fillText(msg, w / 2, 22);
        ctx.fillStyle = "#00e5ff";
        ctx.textAlign = "right";
        ctx.fillText(`BEST ${best}`, w - 12, 22);
        ctx.textAlign = "left";
      },
      [best, down, msg, newDown, startDrive],
    ),
    false,
  );

  const toField = (e: React.PointerEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return null;
    return {
      x: ((e.clientX - rect.left) / rect.width) * FIELD_W,
      y: ((e.clientY - rect.top) / rect.height) * H,
    };
  };

  const onDown = (e: React.PointerEvent) => {
    const p = toField(e);
    if (!p) return;
    aiming.current = { active: true, x: p.x, y: p.y };
  };
  const onMove = (e: React.PointerEvent) => {
    if (!aiming.current.active) return;
    const p = toField(e);
    if (p) aiming.current = { ...aiming.current, x: p.x, y: p.y };
  };
  const onUp = (e: React.PointerEvent) => {
    if (!aiming.current.active) return;
    const p = toField(e);
    aiming.current.active = false;
    if (p) throwBall(p.x, p.y);
  };

  return (
    <div className="relative h-full w-full">
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="block h-full w-full cursor-crosshair touch-none select-none"
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
      />
    </div>
  );
}
