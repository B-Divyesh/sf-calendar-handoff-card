import { cp, mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const dist = new URL("../dist/", import.meta.url);
const assetNames = await readdir(new URL("assets/", dist));
const precache = [
  "/",
  "/demo",
  "/index.html",
  "/favicon.svg",
  "/robots.txt",
  "/assets/calendar-bridge-520.webp",
  "/assets/calendar-bridge-720.webp",
  "/assets/calendar-bridge-1200.webp",
  ...assetNames.filter((name) => /\.(?:js|css)$/.test(name)).map((name) => `/assets/${name}`)
];
const swPath = join(dist.pathname, "sw.js");
const sw = await readFile(swPath, "utf8");
await writeFile(swPath, sw.replace('"__PRECACHE__"', JSON.stringify(precache)));

// Known application routes are emitted as actual static documents. This keeps
// Azure's unknown paths eligible for its real 404 response instead of turning
// every miss into the home page through a catch-all SPA fallback.
for (const route of ["demo", "privacy", "terms"]) {
  const routeDirectory = new URL(`${route}/`, dist);
  await mkdir(routeDirectory, { recursive: true });
  await cp(new URL("index.html", dist), new URL("index.html", routeDirectory), { recursive: false, force: true });
}
