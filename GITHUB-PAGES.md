# Deploying UltraVector to GitHub Pages

The app is a client-side SPA backed by Convex (cloud), so GitHub Pages can
host everything **except** the Convex data layer — that keeps running from
your existing Convex deployment.

## 1. Deploy

1. Push this repo to GitHub.
2. Add your Convex URL as a repository secret:
   **Settings → Secrets and variables → Actions → New repository secret**
   - Name: `VITE_CONVEX_URL`
   - Value: `https://dynamic-alligator-520.convex.cloud` (or your deployment)
3. **Settings → Pages → Build and deployment → Source: GitHub Actions**
4. Push to `main` (or run the workflow manually from the Actions tab).

Your site goes live at `https://<user>.github.io/<repo>/` (or
`https://<user>.github.io/` for a repo named `<user>.github.io`).

## 2. What the build does for you

| Concern | How it's handled |
| --- | --- |
| Sub-path assets | `PAGES_BASE=/repo/` sets Vite `base` + router basename |
| Deep links (`/games`, `/play/slope`) | `404.html` SPA fallback (hop 1) + `index.html` script (hop 2) |
| Jekyll interference | `.nojekyll` copied into `dist/` |
| Convex URL | Injected at build time from the `VITE_CONVEX_URL` secret (falls back to the bundled URL if unset) |
| Sitemap/robots | Auto-generated at build time from the live catalog, using the detected site URL (or a `SITE_URL` secret for custom domains) |
| Vly preview toolbar | Excluded from Pages builds (`DISABLE_VLY_PLUGIN=1`), auto-enabled again in dev |

## 3. Manual deploy (no Actions)

```bash
PAGES_BASE=/your-repo-name/ DISABLE_VLY_PLUGIN=1 \
SITE_URL=https://your-final-domain.com \
VITE_CONVEX_URL=https://dynamic-alligator-520.convex.cloud \
bun run build:pages
cp dist/index.html dist/404.html
touch dist/.nojekyll
# push the contents of dist/ to the gh-pages branch, e.g.:
npx gh-pages -d dist
```

## 4. Notes & limits

- **Sign-in and chat need Convex** — make sure the secret is set, otherwise
  auth/chat will fail while the public game pages still work.
- **`sitemap.xml` / `robots.txt`** are generated during the build from the
  live game catalog (≈390 URLs) with the correct absolute URLs for your
  deployment — nothing to hand-edit. On a custom domain, add a `SITE_URL`
  secret (e.g. `https://ultravector.gg`) and the workflow uses it.
- Admin account bootstrap (`ensureAdmin`) runs from any client, so the first
  visitor after deploy repairs the admin account if needed.
- The dev preview on Freebuff is unaffected: `bun run dev` and the default
  `bun run build` behave exactly as before.
