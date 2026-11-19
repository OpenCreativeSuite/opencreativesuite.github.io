/* Headless screenshot helper for local review.
   Usage:
   node scripts/capture.mjs --url=http://localhost:4173/ --out=shot.png \
     --w=1440 --h=1000 --scroll=0 [--full] [--mobile] [--click="<selector>"]
*/
import { spawn } from "node:child_process";
import { writeFile, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const args = Object.fromEntries(
  process.argv.slice(2).map((arg) => {
    const [key, ...rest] = arg.replace(/^--/, "").split("=");
    return [key, rest.length ? rest.join("=") : true];
  })
);

const url = String(args.url || "http://localhost:4173/");
const out = resolve(String(args.out || "shot.png"));
const width = Number(args.w || 1440);
const height = Number(args.h || 1000);
const scroll = Number(args.scroll || 0);
const mobile = Boolean(args.mobile);
const full = Boolean(args.full);
const click = args.click ? String(args.click) : "";
const port = 9300 + Math.floor(Math.random() * 400);
const profile = await mkdtemp(join(tmpdir(), "ocs-cdp-"));
const edge = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";

const browser = spawn(
  edge,
  [
    "--headless=new",
    "--disable-gpu",
    "--hide-scrollbars",
    "--no-first-run",
    "--no-default-browser-check",
    `--user-data-dir=${profile}`,
    `--remote-debugging-port=${port}`,
    "about:blank"
  ],
  { stdio: "ignore" }
);

async function waitForBrowser() {
  for (let attempt = 0; attempt < 80; attempt += 1) {
    try {
      const response = await fetch(`http://127.0.0.1:${port}/json/version`);
      if (response.ok) return;
    } catch {}
    await new Promise((r) => setTimeout(r, 150));
  }
  throw new Error("Browser did not start");
}

function connect(wsUrl) {
  const ws = new WebSocket(wsUrl);
  let nextId = 1;
  const pending = new Map();
  const events = new Map();
  const ready = new Promise((resolveReady, rejectReady) => {
    ws.addEventListener("open", resolveReady);
    ws.addEventListener("error", rejectReady);
  });
  ws.addEventListener("message", (event) => {
    const msg = JSON.parse(event.data);
    if (msg.id && pending.has(msg.id)) {
      const { resolve: res, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      if (msg.error) reject(new Error(msg.error.message));
      else res(msg.result);
      return;
    }
    if (msg.method) {
      const listeners = events.get(msg.method) || [];
      events.set(msg.method, []);
      listeners.forEach((fn) => fn(msg.params));
    }
  });
  const send = (method, params = {}) =>
    new Promise((res, reject) => {
      const id = nextId++;
      pending.set(id, { resolve: res, reject });
      ws.send(JSON.stringify({ id, method, params }));
    });
  const once = (method) =>
    new Promise((res) => {
      const listeners = events.get(method) || [];
      listeners.push(res);
      events.set(method, listeners);
    });
  return { ws, send, once, ready };
}

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

try {
  await waitForBrowser();
  const targetRes = await fetch(`http://127.0.0.1:${port}/json/new?about:blank`, { method: "PUT" });
  const target = await targetRes.json();
  const cdp = connect(target.webSocketDebuggerUrl);
  await cdp.ready;

  await cdp.send("Page.enable");
  await cdp.send("Runtime.enable");
  await cdp.send("Emulation.setDeviceMetricsOverride", {
    width,
    height,
    deviceScaleFactor: 1,
    mobile,
    screenWidth: width,
    screenHeight: height
  });

  const loaded = cdp.once("Page.loadEventFired");
  await cdp.send("Page.navigate", { url });
  await Promise.race([loaded, delay(15000)]);
  await cdp.send("Runtime.evaluate", {
    expression: "document.fonts.ready.then(() => true)",
    awaitPromise: true
  });
  await cdp.send("Runtime.evaluate", {
    expression: `document.documentElement.style.scrollBehavior = "auto"; window.scrollTo(0, ${scroll});`
  });
  await delay(650);

  if (click) {
    await cdp.send("Runtime.evaluate", {
      expression: `document.querySelector(${JSON.stringify(click)})?.click()`
    });
    await delay(450);
  }

  if (args.measure) {
    const measured = await cdp.send("Runtime.evaluate", {
      expression:
        "JSON.stringify({innerWidth: window.innerWidth, clientWidth: document.documentElement.clientWidth, scrollWidth: document.documentElement.scrollWidth})",
      returnByValue: true
    });
    console.log(measured.result.value);
  }

  let clip;
  if (full) {
    const metrics = await cdp.send("Page.getLayoutMetrics");
    const size = metrics.cssContentSize || metrics.contentSize;
    clip = { x: 0, y: 0, width: size.width, height: size.height, scale: 1 };
  }

  const result = await cdp.send("Page.captureScreenshot", {
    format: "png",
    captureBeyondViewport: full,
    ...(clip ? { clip } : {})
  });
  await writeFile(out, Buffer.from(result.data, "base64"));
  console.log(`Saved ${out}`);
  cdp.ws.close();
} finally {
  browser.kill();
  await delay(250);
  await rm(profile, { recursive: true, force: true }).catch(() => {});
}
