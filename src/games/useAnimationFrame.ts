import { useEffect, useRef } from "react";

type Tick = (dt: number) => void;

/**
 * Runs `tick(dtSeconds)` every animation frame while `paused` is false.
 * The callback ref is kept fresh so games can close over changing state
 * without re-subscribing the loop. Cleanup cancels the frame on unmount.
 */
export function useAnimationFrame(tick: Tick, paused = false) {
  const tickRef = useRef(tick);
  tickRef.current = tick;

  useEffect(() => {
    if (paused) return;
    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      try {
        tickRef.current(dt);
      } catch (err) {
        console.error("[game loop]", err);
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [paused]);
}
