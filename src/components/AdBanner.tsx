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
