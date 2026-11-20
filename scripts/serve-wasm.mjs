/* Static preview server for the Donkeh WebAssembly build.
   Run: node scripts/serve-wasm.mjs
   Serves builds/wasm and falls back to index.html for app routes. */
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = process.env.SERVE_ROOT
    ? resolve(process.env.SERVE_ROOT)
    : fileURLToPath(new URL("../builds/wasm/", import.meta.url));
const rootArg = process.argv.find((arg) => arg.startsWith("--root="));
const portArg = process.argv.find((arg) => arg.startsWith("--port="));
const serveRoot = rootArg ? resolve(rootArg.slice("--root=".length)) : root;
const port = Number(portArg ? portArg.slice("--port=".length) : (process.env.PORT || 4174));
const types = {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".mjs": "text/javascript; charset=utf-8",
    ".json": "application/json",
    ".wasm": "application/wasm",
    ".dll": "application/octet-stream",
    ".pdb": "application/octet-stream",
    ".dat": "application/octet-stream",
    ".blat": "application/octet-stream",
    ".br": "application/octet-stream",
    ".gz": "application/octet-stream",
    ".svg": "image/svg+xml",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".webp": "image/webp",
    ".gif": "image/gif",
    ".ico": "image/x-icon",
    ".woff": "font/woff",
    ".woff2": "font/woff2",
    ".ttf": "font/ttf",
    ".otf": "font/otf",
    ".xml": "application/xml",
    ".txt": "text/plain; charset=utf-8"
};

async function fileAt(path) {
    const filePath = normalize(join(serveRoot, path));
    if (!filePath.startsWith(serveRoot)) return null;
    const info = await stat(filePath).catch(() => null);
    if (info && info.isDirectory()) {
        const indexPath = join(filePath, "index.html");
        const indexInfo = await stat(indexPath).catch(() => null);
        return indexInfo ? indexPath : null;
    }
    return info ? filePath : null;
}

createServer(async (req, res) => {
    try {
        const url = new URL(req.url || "/", "http://localhost");
        let pathname = decodeURIComponent(url.pathname);

        let filePath = await fileAt(pathname);

        // SPA fallback for /about, /apps/slug and any unknown route.
        if (!filePath) {
            filePath = await fileAt("/index.html");
        }

        if (!filePath) {
            res.writeHead(404).end("Not found");
            return;
        }

        const body = await readFile(filePath);
        res.writeHead(200, {
            "Content-Type": types[extname(filePath).toLowerCase()] || "application/octet-stream",
            "Cache-Control": "no-cache"
        }).end(body);
    } catch (error) {
        res.writeHead(500).end("Server error");
    }
}).listen(port, () => {
    console.log(`Open Creative Suite (wasm) → http://localhost:${port}`);
});
