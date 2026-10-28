# Nevitech websites

Static site. The repo root is the document root.

| Path | What |
|---|---|
| `/` (`index.html`, `images/`) | Nevitech company site: apps, intros, legal links |
| `/genart/` | GenArt AI Studio landing page |
| `/genword/` | GenWord landing page |
| `/pages/` | Shared legal pages: `privacy`, `terms`, `copyright`, `contact_us` (also served without `.html`, which the app stores link to) |
| `/app-ads.txt` | Must stay at the root for ad networks |

All internal links are relative, so the site works at any host or path.

## Commands

- `npm start` serves the site at http://localhost:8080 (clean URLs like `/pages/privacy` work).
- `npm run check` starts the server, crawls every page and verifies every link, asset and `#fragment` returns 200. Add `-- --external` to also check external links.
- `npm run build` compiles the TypeScript in `genart/src` (not used by the page).

Run `npm run check` before pushing.
