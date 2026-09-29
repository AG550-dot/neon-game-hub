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
