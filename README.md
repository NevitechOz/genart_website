# nevitech websites

Static sites, one folder per subdomain. Deploy each folder as the document root of its own host.

| Folder | Subdomain | App |
|---|---|---|
| `sites/nevitech` | company root domain | Nevitech company site: app links, intros, legal links |
| `sites/genart` | `genart.genartstudio.org` | GenArt AI Studio (TypeScript in `src/`, build with `npm run build`) |
| `sites/genword` | `genword.genartstudio.org` | GenWord landing page (plain HTML) |

Preview GenArt: `npm start`. Preview GenWord: `npx http-server sites/genword`.

DNS: add a `CNAME` record per subdomain pointing at the hosting provider, then attach the custom domain to the matching folder/site.
