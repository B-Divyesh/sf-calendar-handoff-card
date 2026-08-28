import { readdir, readFile, writeFile } from "node:fs/promises";
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
