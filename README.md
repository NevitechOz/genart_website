# Nevitech websites

Static site. The repo root is the document root.

| Path | What |
|---|---|
| `/` (`index.html`, `images/`) | Nevitech company site: apps, intros, legal links |
| `/genart/` | GenArt AI Studio landing page |
| `/genword/` | GenWord landing page |
| `/genspeak/` | GenSpeak Mandarin speaking practice landing page |
| `/genmeal/` | GenMeal offline meal planner landing page |
| `/pages/` | Shared legal pages: `privacy`, `terms`, `copyright`, `contact_us` (also served without `.html`, which the app stores link to) |
| `/app-ads.txt` | Must stay at the root for ad networks |

All internal links are relative, so the site works at any host or path.
The [Apple](https://commons.wikimedia.org/wiki/File:Apple_logo_black.svg) and
[Google Play](https://commons.wikimedia.org/wiki/File:Google_Play_Arrow_logo.svg)
store icons are hosted locally in `images/`.

## Commands

- `npm start` serves the site at http://localhost:8080 (clean URLs like `/pages/privacy` work).
- `npm run check` starts the server, crawls every page and verifies every link, asset and `#fragment` returns 200. Add `-- --external` to also check external links.
- `npm run build` compiles the TypeScript in `genart/src` (not used by the page).

Run `npm run check` before pushing.
