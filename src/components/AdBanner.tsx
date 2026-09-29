import { useEffect, useRef } from "react";

const AD_SCRIPT_SRC =
  "https://pl31577538.profitableratecpmnetwork.com/bce9373757031b7d234b7e0e7e03836d/invoke.js";
const AD_CONTAINER_ID = "container-bce9373757031b7d234b7e0e7e03836d";

/**
 * Third-party ad banner slot.
 *
 * Injects the network's invoke.js when this component mounts and removes it
 * on unmount, so SPA route changes always leave exactly one live container
 * for the network to fill. Reserves vertical space up front to prevent
 * layout shift while the ad loads.
 */
export default function AdBanner({
  className = "",
  minHeight = 90,
}: {
  /** Extra wrapper classes (margins etc.) */
  className?: string;
  /** Reserved height before the ad fills the slot */
  minHeight?: number;
}) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    // Create a fresh container + script for this mount
    const container = document.createElement("div");
    container.id = AD_CONTAINER_ID;
    host.appendChild(container);

    const script = document.createElement("script");
    script.async = true;
    script.setAttribute("data-cfasync", "false");
    script.src = AD_SCRIPT_SRC;
    host.appendChild(script);

    return () => {
      script.remove();
      container.remove();
    };
  }, []);

  return (
    <div
      ref={hostRef}
      className={`flex min-h-[90px] w-full items-center justify-center overflow-hidden ${className}`}
      style={{ minHeight }}
      aria-hidden="true"
    />
  );
}

const SMALL_AD_SRCDOC = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <style>
      html, body { margin: 0; padding: 0; background: transparent; overflow: hidden; }
    </style>
  </head>
  <body>
    <script type="text/javascript">
      atOptions = {
        'key' : 'f1298da421358782c72482936522ba55',
        'format' : 'iframe',
        'height' : 50,
        'width' : 320,
        'params' : {}
      };
    <\/script>
    <script type="text/javascript" src="https://www.highrevenueformat.com/f1298da421358782c72482936522ba55/invoke.js"><\/script>
  </body>
</html>`;

/**
 * Second ad slot — 320×50 iframe-format banner.
 *
 * This network's invoke.js writes its markup with document.write, which must
 * never run against the main document in an SPA (it would wipe the page).
 * The snippet is therefore injected verbatim into an isolated srcDoc iframe,
 * so document.write only touches that iframe's own tiny document.
 */
export function AdBannerSmall({ className = "" }: { className?: string }) {
  return (
    <div
      className={`flex min-h-[78px] w-full items-center justify-center overflow-hidden ${className}`}
      aria-hidden="true"
    >
      <iframe
        srcDoc={SMALL_AD_SRCDOC}
        title="Advertisement"
        width={320}
        height={50}
        scrolling="no"
        frameBorder={0}
        sandbox="allow-scripts allow-popups allow-same-origin"
        loading="lazy"
        className="block bg-transparent"
      />
    </div>
  );
}

const LEADERBOARD_SRCDOC = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <style>
      html, body { margin: 0; padding: 0; background: transparent; overflow: hidden; }
    </style>
  </head>
  <body>
    <script type="text/javascript">
      atOptions = {
        'key' : '308649f82cdb0b29c2b0ed201d64dee4',
        'format' : 'iframe',
        'height' : 90,
        'width' : 728,
        'params' : {}
      };
    <\/script>
    <script type="text/javascript" src="https://www.highrevenueformat.com/308649f82cdb0b29c2b0ed201d64dee4/invoke.js"><\/script>
  </body>
</html>`;

const TOWER_SRCDOC = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <style>
      html, body { margin: 0; padding: 0; background: transparent; overflow: hidden; }
    </style>
  </head>
  <body>
    <script type="text/javascript">
      atOptions = {
        'key' : 'd7b91bc2d2ee585ebcce8f047190a80d',
        'format' : 'iframe',
        'height' : 600,
        'width' : 160,
        'params' : {}
      };
    <\/script>
    <script type="text/javascript" src="https://www.highrevenueformat.com/d7b91bc2d2ee585ebcce8f047190a80d/invoke.js"><\/script>
  </body>
</html>`;

/**
 * 728×90 leaderboard banner, same isolated-iframe technique as AdBannerSmall
 * (the network's invoke.js uses document.write, so it must never touch the
 * main document). Scales down on narrow screens instead of overflowing.
 */
export function AdBannerLeaderboard({ className = "" }: { className?: string }) {
  return (
    <div
      className={`flex min-h-[104px] max-lg:min-h-[46px] w-full items-center justify-center overflow-hidden ${className}`}
      aria-hidden="true"
    >
      <iframe
        srcDoc={LEADERBOARD_SRCDOC}
        title="Advertisement"
        width={728}
        height={90}
        scrolling="no"
        frameBorder={0}
        sandbox="allow-scripts allow-popups allow-same-origin"
        loading="lazy"
        className="block max-lg:origin-center max-lg:scale-[0.44] shrink-0 bg-transparent"
      />
    </div>
  );
}

/**
 * 160×600 skyscraper for wide desktop layouts (hidden below xl). Designed to
 * sit in a sticky side rail next to long game grids.
 */
export function AdBannerTower({ className = "" }: { className?: string }) {
  return (
    <div
      className={`hidden w-[160px] shrink-0 xl:block ${className}`}
      aria-hidden="true"
    >
      <iframe
        srcDoc={TOWER_SRCDOC}
        title="Advertisement"
        width={160}
        height={600}
        scrolling="no"
        frameBorder={0}
        sandbox="allow-scripts allow-popups allow-same-origin"
        loading="lazy"
        className="block bg-transparent"
      />
    </div>
  );
}

const POPUNDER_SRC =
  "https://pl31577562.profitableratecpmnetwork.com/32/7a/23/327a235c9d3e07f831e6cc2683d2ac5e.js";
const POPUNDER_INTERVAL_MS = 60 * 60 * 1000;
const POPUNDER_KEY = "ultravector.popunder.last";

/**
 * Site-wide popunder script, triggered at most once per hour per visitor.
 * Renders nothing — it only mounts the network's script when the hourly
 * window has elapsed (tracked in localStorage), so casual browsing stays
 * quiet and returning visitors aren't hammered.
 */
export function AdPopunder() {
  useEffect(() => {
    let last = 0;
    try {
      last = Number(localStorage.getItem(POPUNDER_KEY) || 0);
    } catch {
      /* storage unavailable — treat as never fired */
    }
    if (
      Number.isFinite(last) &&
      last > 0 &&
      Date.now() - last < POPUNDER_INTERVAL_MS
    ) {
      return;
    }

    const script = document.createElement("script");
    script.async = true;
    script.setAttribute("data-cfasync", "false");
    script.src = POPUNDER_SRC;
    document.body.appendChild(script);

    try {
      localStorage.setItem(POPUNDER_KEY, String(Date.now()));
    } catch {
      /* ignore */
    }

    return () => {
      script.remove();
    };
  }, []);

  return null;
}
