// Copy the public site into dist/ for Cloudflare Pages.
// Only these files are published — everything else (archive, scripts, db) stays private.
import { cp, mkdir, rm } from "node:fs/promises";

const OUT = "dist";
const FILES = [
  "index.html", "safaris.html", "gallery.html", "reviews.html", "contact.html", "404.html",
  "robots.txt", "sitemap.xml", "_headers", "_redirects",
];

await rm(OUT, { recursive: true, force: true });
await mkdir(OUT);
for (const f of FILES) await cp(f, `${OUT}/${f}`);
await cp("assets", `${OUT}/assets`, {
  recursive: true,
  filter: (src) => !/README\.txt$/i.test(src),
});
console.log(`Built ${OUT}/`);
