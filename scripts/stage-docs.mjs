/* Stage the Donkeh WebAssembly publish output into docs/ for GitHub Pages.
   Run after: dotnet publish -c Release -f net10.0-browser */
import { cp, mkdir, readdir, rm, unlink } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const source = join(root, "builds", "wasm");
const target = join(root, "docs");

await rm(target, { recursive: true, force: true });
await mkdir(target, { recursive: true });
await cp(source, target, { recursive: true });

// GitHub Pages compresses responses itself, so the precompressed copies just
// double the size of the committed folder.
await pruneCompressed(target);

// These are build-time artifacts, not files the static host needs. The runtime
// configuration is embedded in the boot config by the .NET 10 WebCIL publish.
for (const name of [
    "dotnet.js",
    "content.json",
    "OpenCreativeSuite.runtimeconfig.json",
    "OpenCreativeSuite.staticwebassets.endpoints.json",
    "web.config"
]) {
    await rm(join(target, name), { force: true });
}

console.log("Staged builds/wasm -> docs");

async function pruneCompressed(directory) {
    // The .NET 10 WebCIL runtime loads the per-assembly .wasm files; the .dll
    // copies are not requested. Compressed duplicates and native build inputs
    // are also unnecessary on a static host.
    const removable = /\.(dll|pdb|br|gz|map|c|h|rsp|symbols|ts)$/i;

    for (const entry of await readdir(directory, { withFileTypes: true })) {
        const path = join(directory, entry.name);

        if (entry.isDirectory()) {
            await pruneCompressed(path);
            continue;
        }

        if (removable.test(entry.name)) {
            await unlink(path);
        }
    }
}
