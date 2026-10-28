// Tiny static server for local preview. Usage: node scripts/serve.mjs [port]
// Serves the repo root, directory indexes, and extensionless URLs
// (/pages/privacy -> pages/privacy.html) like the production host.
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css",
  ".js": "text/javascript",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".txt": "text/plain",
};

function resolveFile(urlPath) {
  const rel = decodeURIComponent(urlPath).replace(/^\/+/, "");
  const abs = path.resolve(root, rel);
  if (abs !== root && !abs.startsWith(root + path.sep)) return null;
  if (abs.split(path.sep).includes("node_modules") || abs.includes(`${path.sep}.git`)) return null;
  const candidates = [abs, abs + ".html", path.join(abs, "index.html")];
  return candidates.find((f) => fs.existsSync(f) && fs.statSync(f).isFile()) ?? null;
}

export function createServer() {
  return http.createServer((req, res) => {
    const { pathname } = new URL(req.url, "http://localhost");
    const file = resolveFile(pathname);
    if (!file) {
      res.writeHead(404, { "content-type": "text/plain" });
      return res.end("Not found");
    }
    // A directory URL without trailing slash must redirect so relative links resolve.
    const abs = path.resolve(root, decodeURIComponent(pathname).replace(/^\/+/, ""));
    if (fs.existsSync(abs) && fs.statSync(abs).isDirectory() && !pathname.endsWith("/")) {
      res.writeHead(301, { location: pathname + "/" });
      return res.end();
    }
    res.writeHead(200, { "content-type": types[path.extname(file)] ?? "application/octet-stream" });
    fs.createReadStream(file).pipe(res);
  });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const port = Number(process.argv[2] ?? 8080);
  createServer().listen(port, () => console.log(`http://localhost:${port}`));
}
