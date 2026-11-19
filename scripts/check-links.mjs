/* Verify internal links and asset paths in the generated site.
   Run: node scripts/check-links.mjs */
import { readFile, readdir, stat } from "node:fs/promises";
import { join, dirname, resolve, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

async function walk(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (entry.name.startsWith(".") || entry.name === "node_modules" || entry.name === "scripts") continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(full)));
    else if (entry.name.endsWith(".html")) out.push(full);
  }
  return out;
}

const pages = [join(root, "index.html"), join(root, "about.html"), join(root, "404.html")];
for (const product of (await readdir(join(root, "apps"), { withFileTypes: true })).filter((e) => e.isDirectory())) {
  pages.push(join(root, "apps", product.name, "index.html"));
}

const missing = [];
let checked = 0;

for (const page of pages) {
  const html = await readFile(page, "utf8");
  const hasBase = /<base\s+href="\//i.test(html);
  const baseDir = hasBase ? root : dirname(page);
  for (const match of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    const target = match[1];
    if (/^(https?:|mailto:|tel:|data:|#|javascript:)/i.test(target)) continue;
    const clean = target.split("#")[0].split("?")[0];
    if (!clean || clean === "/") continue;
    checked += 1;
    let file = resolve(baseDir, clean);
    if (clean.endsWith("/")) file = join(file, "index.html");
    try {
      const info = await stat(file);
      if (info.isDirectory()) await stat(join(file, "index.html"));
    } catch {
      missing.push(`${relative(root, page)} → ${target}`);
    }
  }
}

if (missing.length) {
  console.error(`Missing ${missing.length} of ${checked} internal targets:\n${missing.map((m) => `  ${m}`).join("\n")}`);
  process.exit(1);
}
console.log(`All ${checked} internal links and assets resolve (${pages.length} pages).`);
