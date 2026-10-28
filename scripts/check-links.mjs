// Starts the preview server, crawls every HTML page and verifies each link and
// asset resolves (HTTP 200) and each #fragment exists on its target page.
// Usage: node scripts/check-links.mjs [--external]
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createServer } from "./serve.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const external = process.argv.includes("--external");

function htmlFiles(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    if (["node_modules", ".git", "dist"].includes(e.name)) return [];
    const p = path.join(dir, e.name);
    return e.isDirectory() ? htmlFiles(p) : p.endsWith(".html") ? [p] : [];
  });
}

const server = createServer();
await new Promise((r) => server.listen(0, r));
const base = `http://localhost:${server.address().port}`;

const cache = new Map();
async function fetchOnce(url) {
  if (!cache.has(url)) {
    cache.set(
      url,
      fetch(url, { redirect: "follow", headers: { "user-agent": "link-check" } })
        .then(async (r) => ({ status: r.status, body: await r.text() }))
        .catch((e) => ({ status: 0, body: "", error: e.message })),
    );
  }
  return cache.get(url);
}

const failures = [];
let checked = 0;
const pages = htmlFiles(root);

for (const file of pages) {
  const rel = path.relative(root, file);
  const pageUrl = `${base}/${rel.split(path.sep).join("/")}`;
  const html = fs.readFileSync(file, "utf8").replace(/<!--[\s\S]*?-->/g, "");
  const refs = [...html.matchAll(/\b(?:href|src)\s*=\s*"([^"]*)"/g)].map((m) => m[1]);
  for (const ref of refs) {
    if (!ref || /^(mailto:|tel:|javascript:|data:)/.test(ref)) continue;
    const url = new URL(ref, pageUrl);
    const isExternal = url.origin !== base;
    if (isExternal && !external) continue;
    checked++;
    const target = new URL(url.href);
    target.hash = "";
    const res = await fetchOnce(target.href);
    if (res.status !== 200) {
      failures.push(`${rel}: ${ref} -> ${res.status || res.error}`);
      continue;
    }
    if (url.hash.length > 1 && !isExternal) {
      const id = decodeURIComponent(url.hash.slice(1));
      if (!new RegExp(`\\bid\\s*=\\s*"${id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"`).test(res.body)) {
        failures.push(`${rel}: ${ref} -> missing #${id}`);
      }
    }
  }
}

// Extensionless URLs and root files that the app stores / ad networks use.
for (const p of ["/", "/genart/", "/genword/", "/pages/privacy", "/pages/terms", "/pages/copyright", "/pages/contact_us", "/app-ads.txt"]) {
  checked++;
  const res = await fetchOnce(base + p);
  if (res.status !== 200) failures.push(`required URL ${p} -> ${res.status}`);
}

server.close();
console.log(`${pages.length} pages, ${checked} links checked${external ? " (incl. external)" : ""}`);
if (failures.length) {
  console.error(`\n${failures.length} problem(s):\n` + failures.map((f) => "  " + f).join("\n"));
  process.exit(1);
}
console.log("All links OK");
