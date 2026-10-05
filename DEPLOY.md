# 🚀 Deploy UltraVector — all platforms

The site is a static frontend + cloud backend (Convex). All three hosts below
work with **zero code changes** — pick one:

| | GitHub Pages | Netlify | Cloudflare Pages ⭐ |
|---|---|---|---|
| Free bandwidth | soft cap | 100 GB/mo | **unlimited** |
| Setup effort | 3 manual steps | connect repo | connect repo |
| Custom domain | ✅ | ✅ | ✅ |
| Best for | already-on-GitHub | easiest UI | **game sites / traffic spikes** |

Convex (auth, chat, favorites, leaderboards, admin) keeps running from
`https://dynamic-alligator-520.convex.cloud` on every host — nothing to migrate.

---

## Option A — Cloudflare Pages ⭐ recommended

1. Push the repo to GitHub (see "First push" below) if it isn't already.
2. Go to [dash.cloudflare.com](https://dash.cloudflare.com) → **Workers & Pages → Create → Pages → Connect to Git**.
3. Authorize GitHub, pick your `ultravector` repo → **Begin setup**.
4. Fill the build settings:
   - **Framework preset:** `None`
   - **Build command:** `bun run build`
   - **Build output directory:** `dist`
5. Expand **Environment variables (advanced)** and add:

   | Name | Value |
   |---|---|
   | `VITE_CONVEX_URL` | `https://dynamic-alligator-520.convex.cloud` |
   | `SITE_URL` | *(leave empty for now — set after first deploy, see step 7)* |

6. **Save and deploy.** First build takes ~1 min (bun install + 6s build).
   Live at `https://ultravector.pages.dev` (or similar).
7. **Set SITE_URL and redeploy:** note your final URL (e.g.
   `https://ultravector.pages.dev`), edit the `SITE_URL` variable
   (Settings → Variables and Secrets), put the URL in, then
   **Deployments → Retry deployment**. This makes sitemap.xml / robots.txt
   use the right domain.
8. Custom domain (optional): Pages project → **Custom domains** → add yours →
   update `SITE_URL` to it → redeploy.

SPA routing (`/games`, `/play/slope`) works automatically via `public/_redirects`.

---

## Option B — Netlify

1. Push the repo to GitHub if it isn't already.
2. [app.netlify.com](https://app.netlify.com) → **Add new site → Import an existing project → GitHub** → pick the repo.
3. Netlify auto-reads `netlify.toml` (build command + `dist` + SPA redirect).
4. **Site settings → Environment variables** → add:

   | Name | Value |
   |---|---|
   | `VITE_CONVEX_URL` | `https://dynamic-alligator-520.convex.cloud` |
   | `SITE_URL` | *(set after first deploy — your `*.netlify.app` URL)* |

5. **Deploy.** Then set `SITE_URL` to your final `*.netlify.app` URL and
   **Deploys → Trigger deploy** once more (fixes sitemap domain).
6. Custom domain: Site settings → Domain management.

---

## Option C — GitHub Pages (already configured)

1. Push to GitHub (see below).
2. **Settings → Secrets and variables → Actions → New repository secret**
   - Name: `VITE_CONVEX_URL` — Value: `https://dynamic-alligator-520.convex.cloud`
3. **Settings → Pages → Build and deployment → Source: GitHub Actions**
4. **Actions tab → Deploy to GitHub Pages → Re-run / watch it go green.**
   (Runs automatically on every push to `main`/`master` after that.)

Base path, `404.html` fallback, `.nojekyll`, sitemap domain — all handled by
the workflow (`PAGES_BASE` + `SITE_URL` auto-detected).

---

## First push (needed for any option)

```bash
# after downloading/exporting the project to your computer:
cd ultravector
git init
git add .
git commit -m "UltraVector — unblocked games site"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/ultravector.git
git push -u origin main
```

Log in through the browser popup (or use a Personal Access Token as the
password). No terminal? [GitHub Desktop](https://desktop.github.com) →
File → Add local repository → Publish.

---

## Post-deploy checklist (any host)

1. Landing loads with neon styling
2. A game loads and plays
3. Sign-in works (proves Convex is connected)
4. Chat bubble appears
5. Refresh on `/games` — no 404 (proves SPA routing)
6. `/sitemap.xml` lists your real domain
