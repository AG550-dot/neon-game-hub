import { useEffect, useMemo, useRef, useState } from "react";
import type { NativeGameProps } from "./registry";

type Building = {
  id: string;
  name: string;
  icon: string;
  baseCost: number;
  cps: number;
  count: number;
};

const BUILDINGS: Omit<Building, "count">[] = [
  { id: "cursor", name: "Neon Cursor", icon: "🖱️", baseCost: 15, cps: 0.5 },
  { id: "grid", name: "Grid Grandma", icon: "👵", baseCost: 100, cps: 3 },
  { id: "farm", name: "Glow Farm", icon: "🌱", baseCost: 600, cps: 12 },
  { id: "reactor", name: "Neon Reactor", icon: "⚛️", baseCost: 3500, cps: 55 },
  { id: "portal", name: "Prism Portal", icon: "🌀", baseCost: 20000, cps: 260 },
  { id: "prism", name: "Time Prism", icon: "💠", baseCost: 120000, cps: 1400 },
];

const UPGRADES = [
  { id: "x2", name: "Overclock", desc: "Double all production", cost: 2500, mult: 2 },
  { id: "x3", name: "Hyperflux", desc: "Triple all production", cost: 50000, mult: 3 },
  { id: "x4", name: "Rainbow Singularity", desc: "Quadruple production", cost: 750000, mult: 4 },
];

/** Built-in "Neon Clicker": idle/incremental neon cookie-style game. */
export default function NeonClicker({ width, height, report }: NativeGameProps) {
  const [cookies, setCookies] = useState(0);
  const [total, setTotal] = useState(0);
  const [buildings, setBuildings] = useState<Building[]>(
    BUILDINGS.map((b) => ({ ...b, count: 0 })),
  );
  const [upgrades, setUpgrades] = useState<string[]>([]);
  const [perClick, setPerClick] = useState(1);
  const [pop, setPop] = useState<{ id: number; x: number; y: number; v: number }[]>([]);
  const popId = useRef(0);
  const [pulse, setPulse] = useState(false);

  // persisted state
  useEffect(() => {
    try {
      const raw = localStorage.getItem("ultravector.clicker.save");
      if (raw) {
        const s = JSON.parse(raw);
        setCookies(s.cookies ?? 0);
        setTotal(s.total ?? 0);
        setBuildings((prev) =>
          prev.map((b) => ({ ...b, count: s.buildings?.[b.id] ?? 0 })),
        );
        setUpgrades(s.upgrades ?? []);
        setPerClick(s.perClick ?? 1);
      }
    } catch {
      /* ignore */
    }
  }, []);

  const cps = useMemo(
    () =>
      buildings.reduce((sum, b) => sum + b.count * b.cps, 0) *
      upgrades.reduce((m, id) => {
        const u = UPGRADES.find((x) => x.id === id);
        return m * (u?.mult ?? 1);
      }, 1),
    [buildings, upgrades],
  );

  // ticking production
  useEffect(() => {
    const iv = setInterval(() => {
      setCookies((c) => {
        const gain = cps / 10;
        setTotal((t) => t + gain);
        return c + gain;
      });
    }, 100);
    return () => clearInterval(iv);
  }, [cps]);

  // save
  useEffect(() => {
    const t = setTimeout(() => {
      try {
        localStorage.setItem(
          "ultravector.clicker.save",
          JSON.stringify({
            cookies,
            total,
            upgrades,
            perClick,
            buildings: Object.fromEntries(
              buildings.map((b) => [b.id, b.count]),
            ),
          }),
        );
      } catch {
        /* ignore */
      }
    }, 500);
    return () => clearTimeout(t);
  }, [cookies, total, buildings, upgrades, perClick]);

  // Push lifetime orbs to the global leaderboard at most every 30 seconds
  const lastReport = useRef(0);
  useEffect(() => {
    const now = Date.now();
    if (total > 0 && now - lastReport.current > 30_000) {
      lastReport.current = now;
      report?.(Math.floor(total));
    }
  }, [total, report]);

  const cost = (b: Building) =>
    Math.floor(b.baseCost * Math.pow(1.15, b.count));

  const buy = (b: Building) => {
    const price = cost(b);
    if (cookies < price) return;
    setCookies((c) => c - price);
    setBuildings((prev) =>
      prev.map((x) => (x.id === b.id ? { ...x, count: x.count + 1 } : x)),
    );
  };

  const buyUpgrade = (id: string, c: number) => {
    if (cookies < c || upgrades.includes(id)) return;
    setCookies((v) => v - c);
    setUpgrades((u) => [...u, id]);
  };

  const click = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setCookies((c) => c + perClick);
    setTotal((t) => t + perClick);
    setPulse(true);
    setTimeout(() => setPulse(false), 120);
    const id = ++popId.current;
    setPop((p) => [...p.slice(-8), { id, x, y, v: perClick }]);
    setTimeout(() => setPop((p) => p.filter((q) => q.id !== id)), 800);
  };

  const fmt = (n: number) => {
    if (n < 1000) return Math.floor(n).toString();
    if (n < 1e6) return (n / 1e3).toFixed(1) + "K";
    if (n < 1e9) return (n / 1e6).toFixed(2) + "M";
    return (n / 1e9).toFixed(2) + "B";
  };

  // Responsive layout: wide = side-by-side, narrow = stacked
  const wide = width > 640;

  const clickerPane = (
    <div className="flex flex-col items-center justify-center gap-4 py-4">
      <p className="text-xs font-bold uppercase tracking-[0.25em] text-muted-foreground">
        {fmt(cookies)} neon orbs · {cps.toFixed(1)}/sec
      </p>
      <button
        onClick={click}
        className={`relative size-40 rounded-full transition-transform duration-100 sm:size-48 ${
          pulse ? "scale-95" : "scale-100"
        }`}
        style={{
          background:
            "radial-gradient(circle at 35% 30%, #ffe14d, #ff7a1a 45%, #ff2ea6 80%)",
          boxShadow:
            "0 0 40px rgba(255,225,77,0.5), 0 0 90px rgba(255,46,166,0.35), inset 0 0 30px rgba(255,255,255,0.25)",
        }}
        aria-label="Click to earn neon orbs"
      >
        <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-5xl">
          🍪
        </span>
      </button>
      <p className="text-xs text-muted-foreground">click the orb · +{fmt(perClick)}</p>
      {/* floating +N pops */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {pop.map((p) => (
          <span
            key={p.id}
            className="absolute animate-bounce font-display text-lg font-bold text-[#ffe14d]"
            style={{ left: p.x, top: p.y - 20, animation: "float-y 0.8s ease-out forwards" }}
          >
            +{fmt(p.v)}
          </span>
        ))}
      </div>
    </div>
  );

  const shopPane = (
    <div className="flex h-full flex-col gap-2 overflow-y-auto p-3">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#00e5ff]">
        Upgrades
      </p>
      <div className="flex flex-wrap gap-2">
        {UPGRADES.map((u) => {
          const owned = upgrades.includes(u.id);
          return (
            <button
              key={u.id}
              onClick={() => buyUpgrade(u.id, u.cost)}
              disabled={owned || cookies < u.cost}
              className={`rounded-lg border px-3 py-1.5 text-left text-xs font-semibold transition-all ${
                owned
                  ? "border-[#3dff8b55] bg-[#3dff8b1a] text-[#3dff8b]"
                  : cookies >= u.cost
                    ? "btn-ghost-neon"
                    : "border-[#b026ff33] text-muted-foreground opacity-50"
              }`}
              title={u.desc}
            >
              {u.name} — {fmt(u.cost)}
              {owned ? " ✓" : ""}
            </button>
          );
        })}
      </div>
      <p className="mt-1 text-xs font-bold uppercase tracking-[0.2em] text-[#ff2ea6]">
        Generators
      </p>
      <div className="grid gap-1.5">
        {buildings.map((b) => {
          const price = cost(b);
          const can = cookies >= price;
          return (
            <button
              key={b.id}
              onClick={() => buy(b)}
              disabled={!can}
              className={`flex items-center justify-between rounded-lg border px-3 py-2 text-left transition-all ${
                can
                  ? "neon-card hover:border-[#00e5ff88]"
                  : "border-[#b026ff26] opacity-50"
              }`}
            >
              <span className="flex items-center gap-2">
                <span className="text-xl">{b.icon}</span>
                <span>
                  <span className="block text-sm font-bold">{b.name}</span>
                  <span className="block text-[11px] text-muted-foreground">
                    {fmt(price)} · +{b.cps}/s
                  </span>
                </span>
              </span>
              <span className="font-display text-lg font-extrabold text-[#00e5ff]">
                {b.count}
              </span>
            </button>
          );
        })}
      </div>
      <p className="mt-2 text-center text-[11px] text-muted-foreground">
        lifetime orbs: {fmt(total)} · saved automatically
      </p>
    </div>
  );

  return (
    <div className="h-full w-full overflow-hidden bg-[#0b0520]">
      <div className={`grid h-full ${wide ? "grid-cols-[1fr_300px]" : "grid-rows-[1fr_auto]"}`}>
        {wide ? (
          <>
            {clickerPane}
            <div className="border-l border-[#b026ff33]">{shopPane}</div>
          </>
        ) : (
          <>
            {clickerPane}
            <div className="max-h-44 border-t border-[#b026ff33]">{shopPane}</div>
          </>
        )}
      </div>
    </div>
  );
}
