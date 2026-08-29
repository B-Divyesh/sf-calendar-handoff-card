import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("../dist", import.meta.url)));
const portAt = process.argv.indexOf("--port");
const port = Number(portAt >= 0 ? process.argv[portAt + 1] : 4173);
const types = { ".css": "text/css; charset=utf-8", ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".json": "application/json; charset=utf-8", ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".webp": "image/webp", ".xml": "application/xml; charset=utf-8", ".txt": "text/plain; charset=utf-8" };

async function fileFor(pathname) {
  const requested = pathname === "/" ? "/index.html" : pathname;
  const candidate = resolve(root, `.${normalize(requested)}`);
  if (!candidate.startsWith(`${root}/`) && candidate !== root) return null;
  try {
    return (await stat(candidate)).isDirectory() ? join(candidate, "index.html") : candidate;
  } catch {
    return null;
  }
}

createServer(async (request, response) => {
  const pathname = decodeURIComponent(new URL(request.url || "/", "http://localhost").pathname);
  const file = await fileFor(pathname);
  const target = file || join(root, "404.html");
  try {
    const body = await readFile(target);
    response.writeHead(file ? 200 : 404, {
      "Content-Type": types[extname(target)] || "application/octet-stream",
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "no-referrer",
      "Content-Security-Policy": "default-src 'self'; img-src 'self' data: blob:; style-src 'self'; script-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'"
    });
    response.end(request.method === "HEAD" ? undefined : body);
  } catch {
    response.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Could not load the static site.");
  }
}).listen(port, "127.0.0.1");
