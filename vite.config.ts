import { vlyPlugin } from "@vly-ai/integrations";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { writeFileSync } from "node:fs";
import path from "path";
import { defineConfig, type Plugin } from "vite";
import { GAMES, GENRES } from "./src/lib/games";

// GitHub Pages (or any static host) support:
//   PAGES_BASE=/repo/ bun run build:pages
//   → assets and the router are prefixed with /repo/ so the app works on a
//   project site like https://user.github.io/repo/
// Leave PAGES_BASE unset for root deployments (user site, custom domain).
// The default `bun run build` behaves exactly as before.
const pagesBase = process.env.PAGES_BASE;
const vlyEnabled = process.env.DISABLE_VLY_PLUGIN !== "1";

/**
 * Generates dist/sitemap.xml and dist/robots.txt at build time from the live
 * catalog, using SITE_URL (the site's final public URL, no trailing slash).
 * Defaults to https://ultravector.gg — override it for github.io or other
 * deployments so search engines index the right absolute URLs.
 */
function seoFilesPlugin(): Plugin {
  const site = (process.env.SITE_URL || "https://ultravector.gg").replace(
    /\/+$/,
    "",
  );
  const today = new Date().toISOString().slice(0, 10);
  const urls = [
    { path: "/", priority: "1.0", freq: "daily" },
    { path: "/games", priority: "0.9", freq: "daily" },
    {
      path: "/two-player-games",
      priority: "0.9",
      freq: "daily",
    },
    ...GENRES.map((g) => ({
      path: `/genre/${encodeURIComponent(g.toLowerCase())}`,
      priority: "0.8",
      freq: "weekly",
    })),
    ...GAMES.map((g) => ({
      path: `/play/${g.slug}`,
      priority: "0.7",
      freq: "weekly",
    })),
  ];
  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    urls
      .map(
        ({ path: p, priority, freq }) =>
          `  <url>\n    <loc>${site}${p === "/" ? "/" : p}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${freq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`,
      )
      .join("\n") +
    `\n</urlset>\n`;
  return {
    name: "ultravector-seo-files",
    apply: "build",
    closeBundle() {
      writeFileSync(path.resolve(__dirname, "dist", "sitemap.xml"), xml);
      writeFileSync(
        path.resolve(__dirname, "dist", "robots.txt"),
        `User-agent: *\nAllow: /\n\nSitemap: ${site}/sitemap.xml\n`,
      );
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  base: pagesBase || "/",
  plugins: vlyEnabled
    ? [react(), vlyPlugin(), tailwindcss(), seoFilesPlugin()]
    : [react(), tailwindcss(), seoFilesPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    // Force a single copy of React across all packages (including vlyPlugin).
    // Without this, @vly-ai/integrations can resolve its own React copy, which
    // triggers "Invalid hook call" errors at runtime.
    dedupe: ["react", "react/jsx-runtime", "react-dom", "react-dom/client"],
  },
  build: {
    // Enable source maps for better debugging (disable in production if needed)
    sourcemap: false,
    // Optimize chunk splitting
    rollupOptions: {
      output: {
        // Manual chunk splitting for better caching and lazy loading
        manualChunks: {
          // Vendor chunks for large libraries
          'react-vendor': ['react', 'react-dom', 'react-router'],
          'convex-vendor': ['convex'],
          // Large UI library chunks
          'radix-ui': [
            '@radix-ui/react-accordion',
            '@radix-ui/react-alert-dialog',
            '@radix-ui/react-avatar',
            '@radix-ui/react-checkbox',
            '@radix-ui/react-collapsible',
            '@radix-ui/react-context-menu',
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-hover-card',
            '@radix-ui/react-label',
            '@radix-ui/react-menubar',
            '@radix-ui/react-navigation-menu',
            '@radix-ui/react-popover',
            '@radix-ui/react-progress',
            '@radix-ui/react-radio-group',
            '@radix-ui/react-scroll-area',
            '@radix-ui/react-select',
            '@radix-ui/react-separator',
            '@radix-ui/react-slider',
            '@radix-ui/react-switch',
            '@radix-ui/react-tabs',
            '@radix-ui/react-toggle',
            '@radix-ui/react-toggle-group',
            '@radix-ui/react-tooltip',
          ],
          // Heavy optional libraries - separate chunks for better lazy loading
          'framer-motion': ['framer-motion'],
          'charts': ['recharts'],
          'forms': ['react-hook-form', '@hookform/resolvers', 'zod'],
        },
        // Optimize chunk size
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
    // Increase chunk size warning limit for better chunking
    chunkSizeWarningLimit: 1000,
    // Target modern browsers for better optimization
    target: 'esnext',
    // Minify options - using esbuild (faster than terser)
    minify: 'esbuild',
  },
  // Optimize dependencies
  optimizeDeps: {
    // Only scan the app entry HTML; avoids crawling unrelated *.html files
    // if a legacy snapshot accidentally contains leaked package folders.
    entries: ['index.html'],
    include: [
      'react',
      'react/jsx-runtime',
      'react-dom',
      'react-dom/client',
      'react-router',
      '@convex-dev/auth/react',
      'framer-motion',
      // vlyPlugin() injects this import at serve time, so the dep scanner
      // never sees it. Without it here the first page load discovers it,
      // re-optimizes and full-reloads the preview mid-screenshot.
      ...(vlyEnabled ? ['@vly-ai/integrations' as const] : []),
    ],
  },
  // Performance hints
  server: { allowedHosts: true,
    // Bind to all interfaces so the browser runtime's server-ready event fires.
    host: true,
    port: 5173,
    // Keep HMR on, but disable full-screen error overlay
    hmr: {
      overlay: false,
    },
  },
});
