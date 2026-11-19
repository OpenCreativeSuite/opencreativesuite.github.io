/* ==========================================================================
   Open Creative Suite — static site builder
   Zero dependencies. Run: node scripts/build.mjs
   ========================================================================== */

import { readFile, writeFile, mkdir, rm } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const data = JSON.parse(await readFile(join(root, "content.json"), "utf8"));
const site = data.site;
const products = data.products;
const siteUrl = site.url.replace(/\/$/, "");
const year = new Date().getFullYear();

/* ---------- helpers ---------- */
const esc = (value = "") =>
  String(value).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

const pad = (n) => String(n).padStart(2, "0");
const bySlug = (slug) => products.find((p) => p.slug === slug);
const countWord = (n) =>
  ["Zero", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve"][n] ||
  String(n);
const joinList = (items) =>
  items.length < 2 ? items.join("") : `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
const cap = (text) => text.charAt(0).toUpperCase() + text.slice(1);
const categoryList = () => joinList(products.map((p) => p.shortCategory));
const imageSrc = (base, p, file) => `${base}assets/img/apps/${p.slug}/${file}`;
const repoUrl = (p) => `https://github.com/${p.repo}`;
const releaseUrl = (p) => `${repoUrl(p)}/releases/latest`;

/* ---------- icons ---------- */
function icon(name, cls = "ico") {
  const paths = {
    arrow: "M3 8h10M9 3l5 5-5 5",
    arrowUpRight: "M4 12L12 4M5 4h7v7",
    download: "M8 2v8m0 0l3-3m-3 3L5 7M2 13h12",
    github:
      "M8 0C3.58 0 0 3.67 0 8.2c0 3.62 2.29 6.69 5.47 7.77.4.08.55-.18.55-.4 0-.2-.01-.86-.01-1.56-2.01.44-2.53-.5-2.69-.96-.09-.23-.48-.96-.82-1.15-.28-.15-.68-.53-.01-.54.63-.01 1.08.59 1.23.83.72 1.23 1.87.88 2.33.67.07-.53.28-.88.51-1.08-1.78-.2-3.64-.91-3.64-4.02 0-.89.31-1.62.81-2.19-.08-.2-.36-1.04.08-2.16 0 0 .67-.22 2.2.84A7.4 7.4 0 018 3.96c.68 0 1.36.09 2 .27 1.53-1.06 2.2-.84 2.2-.84.44 1.12.16 1.96.08 2.16.5.57.81 1.3.81 2.19 0 3.12-1.87 3.82-3.65 4.02.29.26.54.75.54 1.52 0 1.09-.01 1.97-.01 2.24 0 .22.15.49.55.4A8.16 8.16 0 0016 8.2C16 3.67 12.42 0 8 0z",
    menu: "M2 4h12M2 8h12M2 12h12",
    check: "M2 8.5l4 4L14 4",
    code: "M5 4L1 8l4 4M11 4l4 4-4 4",
    mail: "M2 3h12v10H2zM2 3l6 5 6-5",
    star: "M8 1l1.9 4.5 4.6.4-3.5 3 1.1 4.5L8 11l-4.1 2.4 1.1-4.5-3.5-3 4.6-.4z",
    arrowLeft: "M13 8H3m5-5L3 8l5 5"
  };
  const isFill = name === "github" || name === "star";
  return `<svg class="${cls}" viewBox="0 0 16 16" aria-hidden="true" ${
    isFill ? 'fill="currentColor"' : 'fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="square"'
  }><path d="${paths[name] || paths.arrow}"/></svg>`;
}

function uiIcon(name) {
  const p = {
    move: '<path d="M8 2v12M2 8h12M8 2L6 4M8 2l2 2M8 14l-2-2M8 14l2-2M2 8l2-2M2 8l2 2M14 8l-2-2M14 8l-2 2"/>',
    frame: '<path d="M3 3h4M9 3h4v4M13 9v4H9M7 13H3V9" stroke-dasharray="1.6 1.6"/>',
    pen: '<path d="M3 13l2-6 4-4 4 4-4 4-6 2z"/><path d="M9 4l3 3"/>',
    brush: '<path d="M4 12l1-4 6-6 3 3-6 6-4 1z"/><path d="M5 13c-.8.8-2 .4-2 .4s-.4-1.2.4-2"/>',
    type: '<path d="M3 4h10M8 4v9M5.5 13h5"/>',
    zoom: '<circle cx="7" cy="7" r="4.2"/><path d="M10.5 10.5L14 14"/>',
    layers: '<path d="M8 2l6 3-6 3-6-3 6-3z"/><path d="M2 8l6 3 6-3M2 11l6 3 6-3"/>',
    play: '<path d="M5 3l8 5-8 5V3z"/>',
    shape: '<rect x="2.5" y="2.5" width="7" height="7"/><circle cx="11" cy="11" r="3.5"/>',
    crop: '<path d="M4 1v11h11M1 4h11v11"/>'
  };
  return `<svg viewBox="0 0 16 16" aria-hidden="true" fill="none" stroke-linecap="square" stroke-linejoin="miter">${p[name] || p.move}</svg>`;
}

/* ---------- product poster glyphs ---------- */
function productGlyph(slug, cls = "glyph") {
  const glyphs = {
    spray: `
      <rect x="20" y="19" width="24" height="37" rx="2" stroke="currentColor" stroke-width="4"/>
      <path d="M26 19v-6h12v6M32 13V7" stroke="currentColor" stroke-width="4"/>
      <path d="M36 26h8M36 32h8M36 38h8" stroke="currentColor" stroke-width="4" stroke-linecap="square"/>
      <rect x="26" y="30" width="12" height="5" fill="currentColor"/>`,
    pen: `
      <path d="M32 5L52 24 32 59 12 24Z" stroke="currentColor" stroke-width="4" fill="none" stroke-linejoin="miter"/>
      <circle cx="32" cy="31" r="5" fill="currentColor"/>
      <path d="M32 5v21" stroke="currentColor" stroke-width="3"/>`,
    play: `
      <rect x="5" y="13" width="54" height="38" rx="2" stroke="currentColor" stroke-width="4" fill="none"/>
      <path d="M26 23l16 9-16 9V23z" fill="currentColor"/>
      <path d="M12 19v4M52 19v4M12 41v4M52 41v4" stroke="currentColor" stroke-width="4"/>`,
    wave: `
      <path d="M9 34v-6M17 42V22M25 48V16M33 54V10M41 46V18M49 40V24M57 36v-8" stroke="currentColor" stroke-width="6" stroke-linecap="square"/>`,
    cube: `
      <path d="M32 5L56 19v26L32 59 8 45V19Z" stroke="currentColor" stroke-width="4" fill="none" stroke-linejoin="miter"/>
      <path d="M8 19l24 14 24-14M32 33v26" stroke="currentColor" stroke-width="4" fill="none"/>`,
    type: `
      <text x="2" y="46" font-family="Archivo, Arial Black, sans-serif" font-weight="900" font-size="38" letter-spacing="-3" fill="currentColor">Aa</text>`
  };
  return `<svg class="${cls}" viewBox="0 0 64 64" aria-hidden="true" fill="none">${glyphs[slug] || glyphs.cube}</svg>`;
}

/* ---------- mocked interface ---------- */
const KIND_LABEL = {
  photo: "Photo",
  vector: "Vector",
  video: "Video",
  audio: "Audio",
  threed: "3D",
  type: "Type"
};

function bars(count, seed, min = 14, max = 92) {
  let out = "";
  for (let i = 0; i < count; i += 1) {
    const a = Math.abs(Math.sin((i + 1) * seed));
    const b = Math.abs(Math.cos(i * 0.63 + seed * 1.7));
    const h = Math.round(min + a * b * (max - min));
    out += `<i style="--h:${h}%"></i>`;
  }
  return out;
}

function slider(label, value, pct) {
  return `<div class="ui-slider"><div class="ui-slider__top"><span>${label}</span><b>${value}</b></div><div class="ui-slider__track" style="--v:${pct}%"></div></div>`;
}

function panel(p) {
  switch (p.mock) {
    case "photo":
      return `
        <div class="ui__ptitle"><span>Layers</span><b>4</b></div>
        <div class="ui-layer is-active"><span class="ui-layer__thumb"></span><span>Grade / Curves</span><span class="ui-layer__eye"></span></div>
        <div class="ui-layer"><span class="ui-layer__thumb"></span><span>Neon sign</span><span class="ui-layer__eye"></span></div>
        <div class="ui-layer"><span class="ui-layer__thumb"></span><span>Alley wall</span><span class="ui-layer__eye"></span></div>
        <div class="ui-layer"><span class="ui-layer__thumb"></span><span>Background</span><span class="ui-layer__eye"></span></div>
        <div class="ui__rule"></div>
        <div class="ui__ptitle"><span>Adjust</span><b>LIVE</b></div>
        ${slider("Exposure", "+0.45", 62)}
        ${slider("Contrast", "+12", 70)}
        ${slider("Saturation", "−4", 46)}
        <div class="ui__ptitle"><span>Swatches</span><b>+</b></div>
        <div class="ui-swatches"><i style="--sw:var(--accent)"></i><i style="--sw:#f3f0e6"></i><i style="--sw:#0c0c0d"></i><i style="--sw:#ffc800"></i></div>`;
    case "vector":
      return `
        <div class="ui__ptitle"><span>Layers</span><b>3</b></div>
        <div class="ui-layer is-active"><span class="ui-layer__thumb"></span><span>Mark / live</span><span class="ui-layer__eye"></span></div>
        <div class="ui-layer"><span class="ui-layer__thumb"></span><span>Counter cut</span><span class="ui-layer__eye"></span></div>
        <div class="ui-layer"><span class="ui-layer__thumb"></span><span>Grid</span><span class="ui-layer__eye"></span></div>
        <div class="ui__rule"></div>
        <div class="ui__ptitle"><span>Stroke</span><b>16 PT</b></div>
        <div class="ui-kv"><span>Cap</span><b>Square</b></div>
        <div class="ui-kv"><span>Join</span><b>Miter</b></div>
        <div class="ui-kv"><span>Profile</span><b>Uniform</b></div>
        <div class="ui__rule"></div>
        <div class="ui__ptitle"><span>Fill</span><b>NONE</b></div>
        <div class="ui-swatches"><i style="--sw:var(--accent)"></i><i style="--sw:#0c0c0d"></i><i style="--sw:#f3f0e6"></i><i style="--sw:#ff2d87"></i><i style="--sw:transparent"></i></div>
        <div class="ui__ptitle"><span>Document</span><b>SVG</b></div>
        <div class="ui-kv"><span>Artboards</span><b>6</b></div>`;
    case "video":
      return `
        <div class="ui__ptitle"><span>Inspector</span><b>CLIP 04</b></div>
        <div class="ui-kv"><span>Source</span><b>4K DCI</b></div>
        <div class="ui-kv"><span>Frame rate</span><b>23.976</b></div>
        <div class="ui-kv"><span>Colour</span><b>ACEScct</b></div>
        <div class="ui__rule"></div>
        <div class="ui__ptitle"><span>Scopes</span><b>RGB</b></div>
        <div class="ui-bars">${bars(13, 1.4, 12, 88)}</div>
        <div class="ui__rule"></div>
        <div class="ui__ptitle"><span>Transform</span><b>RESET</b></div>
        <div class="ui-kv"><span>Scale</span><b>100.0%</b></div>
        <div class="ui-kv"><span>Position</span><b>0 · 0</b></div>
        <div class="ui-kv"><span>Opacity</span><b>100%</b></div>`;
    case "audio":
      return `
        <div class="ui__ptitle"><span>Mixer</span><b>2 BUS</b></div>
        <div class="ui-strip">
          <div class="ui-strip__ch"><b>VOX</b><div class="ui-strip__fader" style="--f:64%"><i></i></div><div class="ui-strip__meter" style="--m:78%"></div><span>−4.2</span></div>
          <div class="ui-strip__ch"><b>GTR</b><div class="ui-strip__fader" style="--f:48%"><i></i></div><div class="ui-strip__meter" style="--m:52%"></div><span>−9.8</span></div>
        </div>
        <div class="ui__rule"></div>
        <div class="ui__ptitle"><span>Channel</span><b>VOX 01</b></div>
        <div class="ui-kv"><span>Insert 1</span><b>EQ Eight</b></div>
        <div class="ui-kv"><span>Insert 2</span><b>Comp</b></div>
        <div class="ui-kv"><span>Send A</span><b>−12.0</b></div>
        ${slider("Gain", "−4.2 dB", 58)}
        <div class="ui__ptitle"><span>Tempo</span><b>124.00</b></div>`;
    case "threed":
      return `
        <div class="ui__ptitle"><span>Outliner</span><b>5</b></div>
        <div class="ui-layer is-active"><span class="ui-layer__thumb"></span><span>Chair_frame</span><span class="ui-layer__eye"></span></div>
        <div class="ui-layer"><span class="ui-layer__thumb"></span><span>Legs</span><span class="ui-layer__eye"></span></div>
        <div class="ui-layer"><span class="ui-layer__thumb"></span><span>Cushion</span><span class="ui-layer__eye"></span></div>
        <div class="ui__rule"></div>
        <div class="ui__ptitle"><span>Transform</span><b>LOCAL</b></div>
        <div class="ui-kv"><span>Position X</span><b>0.00</b></div>
        <div class="ui-kv"><span>Position Y</span><b>1.24</b></div>
        <div class="ui-kv"><span>Position Z</span><b>0.00</b></div>
        <div class="ui-kv"><span>Scale</span><b>1.00</b></div>
        <div class="ui__rule"></div>
        <div class="ui__ptitle"><span>Modifiers</span><b>3</b></div>
        <div class="ui-layer"><span class="ui-layer__thumb"></span><span>Bevel 0.4</span><span class="ui-layer__eye"></span></div>
        <div class="ui-layer"><span class="ui-layer__thumb"></span><span>Subdivide 2</span><span class="ui-layer__eye"></span></div>`;
    case "type":
      return `
        <div class="ui__ptitle"><span>Glyphs</span><b>312</b></div>
        <div class="ui-glyphgrid">
          <i>A</i><i>B</i><i>C</i><i>D</i><i>E</i><i>F</i><i>G</i><i>H</i><i>I</i><i class="is-active">K</i><i>L</i><i>M</i>
        </div>
        <div class="ui__rule"></div>
        <div class="ui__ptitle"><span>Metrics</span><b>UPM 1000</b></div>
        <div class="ui-kv"><span>LSB</span><b>84</b></div>
        <div class="ui-kv"><span>RSB</span><b>76</b></div>
        <div class="ui-kv"><span>Kerning</span><b>−12</b></div>
        <div class="ui-kv"><span>Contour</span><b>2</b></div>
        <div class="ui__rule"></div>
        <div class="ui__ptitle"><span>Master</span><b>ITALIC</b></div>
        <div class="ui-swatches"><i style="--sw:#0c0c0d"></i><i style="--sw:var(--accent)"></i><i style="--sw:#f3f0e6"></i></div>`;
    default:
      return "";
  }
}

function art(p, variant) {
  const alt = variant === "b";
  switch (p.mock) {
    case "photo":
      return `<div class="art art--photo ${alt ? "alt" : ""}">
        <span class="art__tag">COMP 01 / RGB</span>
        <div class="ph__glow"></div>
        <div class="ph__disc"></div>
        <div class="ph__block ph__block--a"></div>
        <div class="ph__block ph__block--b"></div>
        <div class="ph__stripes"></div>
        <div class="ph__dots"></div>
        <div class="ph__sel"><i></i><i></i><i></i><i></i></div>
      </div>`;
    case "vector":
      return `<div class="art art--vector art--light ${alt ? "alt" : ""}">
        <div class="vec__grid"></div>
        <span class="art__tag">ARTBOARD 1 / MARK</span>
        <div class="vec__board">
          <svg viewBox="0 0 300 200" fill="none" aria-hidden="true">
            ${
              alt
                ? `<circle cx="132" cy="100" r="45" stroke="var(--accent)" stroke-width="16"/>
                   <circle cx="170" cy="100" r="45" stroke="#0c0c0d" stroke-width="16" opacity=".88"/>
                   <line x1="132" y1="55" x2="132" y2="145" stroke="#0c0c0d" stroke-width="1" stroke-dasharray="4 5" opacity=".4"/>
                   <rect x="126" y="94" width="12" height="12" fill="#fbf9f1" stroke="var(--accent)" stroke-width="2"/>`
                : `<path d="M42 148 C 76 44, 138 34, 152 96 S 208 164, 258 52" stroke="var(--accent)" stroke-width="15" stroke-linecap="square"/>
                   <path d="M42 148 L 76 44 M 152 96 L 138 34 M 152 96 L 208 164 M 258 52 L 208 164" stroke="#0c0c0d" stroke-width="1" stroke-dasharray="4 5" opacity=".45"/>
                   <circle cx="76" cy="44" r="4" fill="#fbf9f1" stroke="#0c0c0d" stroke-width="1.5"/>
                   <circle cx="138" cy="34" r="4" fill="#fbf9f1" stroke="#0c0c0d" stroke-width="1.5"/>
                   <circle cx="208" cy="164" r="4" fill="#fbf9f1" stroke="#0c0c0d" stroke-width="1.5"/>`
            }
            <rect x="36" y="142" width="12" height="12" fill="#fbf9f1" stroke="#0c0c0d" stroke-width="2"/>
            <rect x="146" y="90" width="12" height="12" fill="var(--accent)" stroke="#0c0c0d" stroke-width="2"/>
            <rect x="252" y="46" width="12" height="12" fill="#fbf9f1" stroke="#0c0c0d" stroke-width="2"/>
          </svg>
        </div>
        <div class="vec__ruler"><i></i><i></i><i></i><i></i><i></i></div>
      </div>`;
    case "video":
      return `<div class="art art--video ${alt ? "alt" : ""}">
        <span class="art__tag">VIEWER 1 / 50%</span>
        <div class="vid__frame">
          <div class="vid__sun"></div>
          <div class="vid__sky"></div>
          <div class="vid__bldg vid__bldg--a"></div>
          <div class="vid__bldg vid__bldg--b"></div>
          <div class="vid__bldg vid__bldg--c"></div>
          <div class="vid__figure"></div>
          <div class="vid__safe"></div>
          <div class="vid__title">${alt ? "NIGHT<br>SHIFT" : "CUT<br>04"}</div>
        </div>
      </div>`;
    case "audio":
      return `<div class="art art--audio">
        <span class="art__tag">ARRANGE / 124 BPM</span>
        <div class="au__ruler"><span>1.1</span><span>1.2</span><span>1.3</span><span>1.4</span><span>2.1</span><span>2.2</span></div>
        <div class="au__lanes">
          ${[0, 1, 2, 3]
            .map(
              (lane, i) => `<div class="au__lane"><div class="au__wave">${bars(44, 1.2 + i * 0.73, 6, 94)}</div>${
                i === 0 ? '<div class="au__region"></div>' : ""
              }</div>`
            )
            .join("")}
        </div>
        <div class="au__playhead"></div>
      </div>`;
    case "threed":
      return `<div class="art art--threed">
        <div class="td__floor"></div>
        <span class="art__tag">USER PERSPECTIVE / 60 FPS</span>
        <div class="td__hud">STUDIO HDRI<br>SHADED</div>
        <div class="td__model">${
          alt
            ? `<svg viewBox="0 0 200 200" fill="none" stroke="currentColor" stroke-width="2.4">
                 <circle cx="100" cy="100" r="68"/>
                 <ellipse cx="100" cy="100" rx="68" ry="26"/>
                 <ellipse cx="100" cy="100" rx="26" ry="68"/>
                 <ellipse cx="100" cy="100" rx="68" ry="50" opacity=".55"/>
                 <ellipse cx="100" cy="100" rx="68" ry="12" opacity=".35"/>
                 <circle cx="100" cy="32" r="3" fill="currentColor"/>
               </svg>`
            : `<svg viewBox="0 0 200 200" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linejoin="miter">
                 <path d="M100 22 172 62v76l-72 40-72-40V62z"/>
                 <path d="M28 62l72 40 72-40M100 102v76"/>
                 <path d="M100 22v80" opacity=".3"/>
                 <circle cx="100" cy="22" r="3.2" fill="currentColor"/>
                 <circle cx="172" cy="62" r="3.2" fill="currentColor"/>
                 <circle cx="28" cy="62" r="3.2" fill="currentColor"/>
                 <circle cx="100" cy="102" r="3.2" fill="currentColor"/>
                 <circle cx="100" cy="178" r="3.2" fill="currentColor"/>
               </svg>`
        }</div>
        <div class="td__axis">
          <svg viewBox="0 0 60 60" fill="none" stroke-width="2">
            <path d="M30 30V6" stroke="currentColor"/><path d="M30 30l20 12" stroke="var(--accent)"/>
            <path d="M30 30L10 42" stroke="#8a8a84"/>
            <circle cx="30" cy="30" r="2" fill="currentColor"/>
          </svg>
        </div>
      </div>`;
    case "type":
      return `<div class="art art--type art--light ${alt ? "alt" : ""}">
        <div class="vec__grid"></div>
        <span class="art__tag">GLYPH / ${alt ? "Aa" : "K"}</span>
        <div class="ty__glyph">${alt ? "Aa" : "K"}</div>
        <div class="ty__guide ty__guide--cap"><span>CAP 700</span></div>
        <div class="ty__guide ty__guide--x"><span>X 520</span></div>
        <div class="ty__guide ty__guide--base"><span>BASE 0</span></div>
        <div class="ty__side ty__side--l"><i></i></div>
        <div class="ty__side ty__side--r"><i></i></div>
      </div>`;
    default:
      return "";
  }
}

function timeline() {
  return `<div class="ui__timeline">
    <div class="tl__ruler"><span>00:00</span><span>00:10</span><span>00:20</span><span>00:30</span><span>00:40</span></div>
    <div class="tl__body">
      <div class="tl__row">
        <div class="tl__clip tl__clip--solid" style="width:26%"></div>
        <div class="tl__clip" style="width:18%"></div>
        <div class="tl__clip tl__clip--wave" style="width:22%"><div class="tl__wave">${bars(24, 1.7, 10, 92)}</div></div>
        <div class="tl__clip" style="width:14%"></div>
      </div>
      <div class="tl__row tl__row--sm">
        <div class="tl__clip" style="width:14%"></div>
        <div class="tl__clip tl__clip--solid" style="width:36%"></div>
        <div class="tl__clip" style="width:12%"></div>
        <div class="tl__clip tl__clip--wave" style="width:26%"><div class="tl__wave">${bars(20, 2.4, 8, 88)}</div></div>
      </div>
      <div class="tl__row tl__row--sm">
        <div class="tl__clip" style="width:48%"></div>
        <div class="tl__clip tl__clip--solid" style="width:18%"></div>
      </div>
      <div class="tl__playhead"></div>
    </div>
  </div>`;
}

const EXPORT = {
  photo: {
    rows: [["Format", "PNG"], ["Colour space", "sRGB"], ["Scale", "100%"], ["Dimensions", "3840 × 2160"]],
    size: "18.2 MB"
  },
  vector: {
    rows: [["Format", "SVG"], ["Profile", "Print / PDF-X"], ["Slices", "3"], ["Precision", "3 dp"]],
    size: "24 KB"
  },
  video: {
    rows: [["Format", "H.264"], ["Resolution", "4K DCI"], ["Frame rate", "23.976"], ["Colour", "Rec.709"]],
    size: "1.8 GB"
  },
  audio: {
    rows: [["Format", "WAV"], ["Sample rate", "48 kHz"], ["Bit depth", "24-bit"], ["Dither", "Off"]],
    size: "84 MB"
  },
  threed: {
    rows: [["Format", "glTF 2.0"], ["Materials", "PBR"], ["Modifiers", "Apply"], ["Up axis", "Y"]],
    size: "12.4 MB"
  },
  type: {
    rows: [["Format", "WOFF2 + OTF"], ["Axes", "3"], ["Hinting", "Auto"], ["Glyphs", "312"]],
    size: "96 KB"
  }
};

function exportDialog(p) {
  const config = EXPORT[p.mock];
  return `<div class="ui__backdrop">
    <div class="export-dlg">
      <div class="export-dlg__head">Export <span>ESC</span></div>
      <div class="export-dlg__body">
        <div class="export-dlg__field">${esc(p.filename)}_final<i></i></div>
        ${config.rows.map(([k, v]) => `<div class="export-dlg__row"><span>${esc(k)}</span><b>${esc(v)}</b></div>`).join("")}
        <div class="export-dlg__bar"></div>
        <div class="export-dlg__row"><span>Estimated size</span><b>${config.size}</b></div>
      </div>
      <div class="export-dlg__foot">
        <span class="export-dlg__btn">Cancel</span>
        <span class="export-dlg__btn export-dlg__btn--go">Export</span>
      </div>
    </div>
  </div>`;
}

function heroVisual(p, base) {
  if (p.images && p.images.hero) {
    const image = p.images.hero;
    return `<img class="app-shot" src="${imageSrc(base, p, image.file)}" alt="${esc(image.alt)}" width="${
      p.shotWidth || 1440
    }" height="${p.shotHeight || 900}" fetchpriority="high" decoding="async">`;
  }
  return mock(p, "a");
}

function mock(p, variant = "a", opts = {}) {
  const active = { photo: 2, vector: 1, video: 0, audio: 3, threed: 1, type: 4 }[p.mock] || 0;
  const tools = ["move", "shape", "brush", "pen", "type", "crop"];
  return `<div class="ui ui--${p.mock}" style="--accent:${p.accent}" role="img" aria-label="Interface preview of ${esc(
    p.name
  )}, the ${esc(p.category)} tool">
    <div class="ui__bar">
      <span class="ui__dots"><i></i><i></i><i></i></span>
      <span class="ui__file">${esc(p.filename)}</span>
      <span class="ui__bar-meta">${esc(KIND_LABEL[p.mock])} · v${esc(p.version)}</span>
    </div>
    <div class="ui__body">
      <div class="ui__rail">${tools
        .map((t, i) => `<span class="ui__tool${i === active ? " is-active" : ""}">${uiIcon(t)}</span>`)
        .join("")}</div>
      <div class="ui__canvas">${art(p, variant)}</div>
      <div class="ui__panel">${panel(p)}</div>
      ${p.mock === "video" ? timeline() : ""}
    </div>
    <div class="ui__status">
      <span>${esc(p.status)}</span>
      <span>${esc(p.formats.slice(0, 3).join(" · "))}</span>
      <span><em>100%</em></span>
    </div>
    ${opts.dialog ? exportDialog(p) : ""}
  </div>`;
}

/* ---------- shared page chrome ---------- */
function ticker(items, cls = "") {
  const seq = `<div class="ticker__seq">${items
    .map((item) => `<span>${item}</span><b>✳</b>`)
    .join("")}</div>`;
  return `<div class="ticker ${cls}" aria-hidden="true"><div class="ticker__track">${seq}${seq}</div></div>`;
}

function header(base, active = "") {
  const links = [
    { label: "Suite", href: `${base}#suite`, key: "suite", section: "suite" },
    { label: "Manifesto", href: `${base}#why`, key: "why", section: "why" },
    { label: "About", href: `${base}about.html`, key: "about" }
  ];
  return `<a class="skip" href="#main">Skip to content</a>
  <header class="site-header">
    <div class="wrap site-header__in">
      <a class="brand" href="${base}index.html">
        <span class="brand__mark" aria-hidden="true">OCS</span>
        <span class="brand__txt">Open Creative Suite<small>Free · Source-available</small></span>
      </a>
      <nav class="nav" aria-label="Primary">
        ${links
          .map(
            (l) =>
              `<a class="nav__link" href="${l.href}"${l.section ? ` data-nav-section="${l.section}"` : ""}${
                active === l.key ? ' aria-current="page"' : ""
              }>${l.label}</a>`
          )
          .join("")}
        <a class="nav__link nav__link--ext" href="${site.github}" target="_blank" rel="noopener">GitHub</a>
      </nav>
      <div class="site-header__cta">
        <a class="btn btn--lime" href="${base}#suite">Get the suite ${icon("arrowUpRight")}</a>
      </div>
      <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="menu" data-menu-toggle>
        <span class="nav-toggle__bars" aria-hidden="true"><span></span><span></span><span></span></span>
        <span data-menu-label>Menu</span>
      </button>
    </div>
  </header>
  <div class="menu" id="menu">
    <nav class="menu__nav" aria-label="Mobile">
      ${links
        .map(
          (l) =>
            `<a class="menu__link" href="${l.href}"><span>${pad(
              links.indexOf(l) + 1
            )}</span>${l.label}</a>`
        )
        .join("")}
      <a class="menu__link menu__link--ext" href="${site.github}" target="_blank" rel="noopener"><span>↗</span>GitHub</a>
    </nav>
    <div class="menu__foot">
      <span>${products.length} apps · ${site.licenseShort} · $0 forever</span>
      <span class="menu__swatches" aria-hidden="true">
        ${products.map((p) => `<i style="--sw:${p.accent}"></i>`).join("")}
      </span>
    </div>
  </div>`;
}

function footer(base) {
  return `<footer class="site-footer">
    <div class="wrap">
      <div class="footer-grid">
        <div class="footer-brand">
          <a class="brand brand--light" href="${base}index.html">
            <span class="brand__mark" aria-hidden="true">OCS</span>
            <span class="brand__txt">Open Creative Suite<small>Free · Source-available</small></span>
          </a>
          <p>Professional creative tools for ${categoryList()}. No subscriptions. No seat limits. No catch.</p>
          <span class="footer-badge">Source-available · Free forever</span>
        </div>
        <div class="footer-col">
          <h2>The suite</h2>
          <ul>${products.map((p) => `<li><a href="${base}apps/${p.slug}/">${p.name}</a></li>`).join("")}</ul>
        </div>
        <div class="footer-col">
          <h2>Project</h2>
          <ul>
            <li><a href="${base}about.html">About</a></li>
            <li><a href="${base}about.html#licensing">Licensing</a></li>
            <li><a href="${base}index.html#source">Source code</a></li>
            <li><a href="${site.github}" target="_blank" rel="noopener">GitHub <span class="ext">↗</span></a></li>
            <li><a href="${site.community}" target="_blank" rel="noopener">Community <span class="ext">↗</span></a></li>
          </ul>
        </div>
        <div class="footer-col">
          <h2>Support</h2>
          <ul>
            ${products
              .slice(0, 3)
              .map(
                (p) =>
                  `<li><a href="${repoUrl(p)}/issues" target="_blank" rel="noopener">${esc(
                    p.name
                  )} issues <span class="ext">↗</span></a></li>`
              )
              .join("")}
            <li><a href="${base}about.html#faq">FAQ</a></li>
            <li><a href="${base}index.html#source">Contributing</a></li>
          </ul>
        </div>
      </div>
      <div class="footer-wordmark" aria-hidden="true">Open Creative Suite</div>
      <div class="footer-bottom">
        <span>© <span data-year>${year}</span> ${site.name}</span>
        <span>Made by people who got tired of subscriptions.</span>
        <span class="footer-swatches" aria-hidden="true">${products
          .map((p) => `<i style="--sw:${p.accent}"></i>`)
          .join("")}</span>
        <a href="#">Back to top ↑</a>
      </div>
    </div>
  </footer>`;
}

function pageShell({
  title,
  description,
  path,
  base,
  bodyClass = "",
  accent,
  accentSoft,
  content,
  jsonld,
  baseTag = "",
  robots = "index, follow"
}) {
  const canonical = `${siteUrl}${path}`;
  const styleVars = accent ? ` style="--accent:${accent};--accent-soft:${accentSoft}"` : "";
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  ${baseTag}
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}">
  <meta name="robots" content="${robots}">
  <link rel="canonical" href="${canonical}">
  <meta name="theme-color" content="${accent || "#0c0c0d"}">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="${esc(site.name)}">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:image" content="${siteUrl}/assets/img/og.png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="${esc(site.name)} — free creative tools, source-available">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${esc(title)}">
  <meta name="twitter:description" content="${esc(description)}">
  <meta name="twitter:image" content="${siteUrl}/assets/img/og.png">
  <link rel="icon" href="${base}assets/img/favicon.svg" type="image/svg+xml">
  <link rel="apple-touch-icon" href="${base}assets/img/favicon.svg">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Archivo:ital,wdth,wght@0,62..125,100..900;1,62..125,100..900&family=IBM+Plex+Mono:ital,wght@0,400;0,500;0,600;1,400&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="${base}assets/css/site.css">
  <script>document.documentElement.classList.add("js");</script>
  ${jsonld ? `<script type="application/ld+json">${jsonld}</script>` : ""}
</head>
<body class="${bodyClass}"${styleVars}>
  ${header(base, bodyClass.includes("app-page") ? "" : path === "about.html" ? "about" : "")}
  <main id="main">
    ${content}
  </main>
  ${footer(base)}
  <script src="${base}assets/js/site.js" defer></script>
</body>
</html>
`;
}

/* ---------- home ---------- */
function homePage() {
  const cards = products
    .map(
      (p, i) => `<article class="app-card reveal" style="--accent:${p.accent};--accent-soft:${p.accentSoft}">
        <a class="app-card__link" href="apps/${p.slug}/">
          <span class="app-card__spine" aria-hidden="true"></span>
          <span class="app-card__stage" aria-hidden="true">
            <span class="app-card__index">${pad(i + 1)}</span>
            <span class="app-card__cat">${esc(p.category)}</span>
            <span class="app-card__glyph">${productGlyph(p.glyph)}</span>
          </span>
          <span class="app-card__body">
            <h3>${esc(p.name)}<span>Open →</span></h3>
            <p>${esc(p.tagline)}</p>
            <span class="app-card__foot"><span>${esc(p.platforms.join(" / "))}</span><b>v${esc(p.version)}</b></span>
          </span>
        </a>
      </article>`
    )
    .join("");

  const chipHeight = products.length <= 2 ? 250 : products.length <= 4 ? 148 : 112;
  const glyphSize = products.length <= 2 ? 74 : 50;

  const chips = products
    .map(
      (p, i) => `<div class="chip" style="--chip:${p.accent}" ${i % 3 === 0 ? 'data-pat="dots"' : ""}>
        <span class="chip__top"><span>${pad(i + 1)}</span><span>${esc(p.category.split(" ")[0])}</span></span>
        <span class="chip__glyph" aria-hidden="true">${productGlyph(p.glyph)}</span>
        <span class="chip__name">${esc(p.name)}</span>
      </div>`
    )
    .join("") +
    (products.length < 6
      ? `<div class="chip chip--more"><span>More tools in the works</span><span aria-hidden="true">+</span></div>`
      : "");

  const receipt = products
    .map((p) => `<li><span>${esc(p.name)}</span><span class="receipt__lead"></span><span>$0</span></li>`)
    .join("");

  const cloneSnippet = products
    .slice(0, 2)
    .map(
      (p, i) => `<span class="c"># ${i === 0 ? "clone either app" : "or the other one"}</span>
<span class="k">git</span> clone ${repoUrl(p)}.git
<span class="k">cd</span> ${p.name}
<span class="k">dotnet</span> run`
    )
    .join("\n\n");

  const content = `
  <section class="hero">
    <div class="wrap hero__grid">
      <div>
        <p class="eyebrow hero__eyebrow">Open Creative Suite — est. ${site.founded}</p>
        <h1>
          <span class="line">Pro-grade.</span>
          <span class="line"><span class="mark">Zero</span> <span class="scribble">bills.<svg viewBox="0 0 300 18" preserveAspectRatio="none" aria-hidden="true"><path d="M3 12C60 3 120 16 180 8S260 4 297 10" fill="none" stroke="currentColor" stroke-width="6" stroke-linecap="square"/></svg></span></span>
        </h1>
        <p class="hero__sub">${countWord(products.length)} serious creative ${products.length === 1 ? "tool" : "tools"} for ${categoryList()}. No subscriptions, no seat limits, no watermarks. Download once — own it forever.</p>
        <div class="btn-row">
          <a class="btn btn--lime" href="#suite">Browse the suite ${icon("arrow")}</a>
          <a class="btn btn--outline" href="${site.github}" target="_blank" rel="noopener">${icon("github")} Star on GitHub</a>
        </div>
        <ul class="hero__meta">
          <li>Source-available</li>
          <li>Windows · macOS · Linux</li>
          <li>No account required</li>
        </ul>
      </div>
      <div class="hero-art" aria-hidden="true">
        <div class="hero-art__panel">
          <div class="hero-art__pattern"></div>
          <div class="chips" style="--chip-h:${chipHeight}px;--glyph-w:${glyphSize}px;--name-size:${
            products.length <= 2 ? 22 : 16
          }px">${chips}</div>
          <div class="hero-art__foot"><span>${products.length} apps · one suite</span><span>$0.00</span></div>
        </div>
        <div class="sticker">100% Free<small>Forever · no catch</small></div>
        <div class="sticker sticker--tag">No trials</div>
      </div>
    </div>
  </section>

  ${ticker([
    "No subscriptions",
    "No seat limits",
    "No watermarks",
    "No telemetry",
    "No lock-in",
    "Your files stay yours"
  ])}

  <section class="section" id="suite" data-section="suite">
    <div class="wrap">
      <div class="sec-head">
        <p class="eyebrow sec-head__eyebrow">01 — The suite</p>
        <h2>${countWord(products.length)} ${products.length === 1 ? "tool" : "tools"}.<br>No invoice.</h2>
        <p class="lede">${cap(categoryList())}${products.length < 6 ? ", with more on the way" : ""}. One shared design language, one honest price, every tool included.</p>
      </div>
      <div class="apps-grid">${cards}</div>
    </div>
  </section>

  <section class="section section--dark" id="why" data-section="why">
    <div class="wrap split">
      <div class="reveal">
        <p class="eyebrow" style="margin-bottom:18px">02 — The deal</p>
        <h2 style="font-size:clamp(38px,4.8vw,64px);text-transform:uppercase;line-height:.92;margin-bottom:20px">We're not renting<br>you software.</h2>
        <p class="lede" style="margin-bottom:10px">The creative industry runs on subscriptions that expire the moment you stop paying. We think that's a strange way to treat the things you make.</p>
        <div class="principles">
          <div class="principle">
            <span class="principle__num">01</span>
            <div><h3>Free is the feature</h3><p>No trials, no tiers, no “pro” upsell hiding the export button. Every tool is fully featured on day one — because the work is the point.</p></div>
          </div>
          <div class="principle">
            <span class="principle__num">02</span>
            <div><h3>Your files are yours</h3><p>Open formats, documented specs and no cloud requirement. Export everything, take it anywhere, open it in ten years.</p></div>
          </div>
          <div class="principle">
            <span class="principle__num">03</span>
            <div><h3>Source in the open</h3><p>Apache 2.0 with the Commons Clause. Read the code, audit it, fork it for yourself — just don't resell it. The roadmap lives in public.</p></div>
          </div>
          <div class="principle">
            <span class="principle__num">04</span>
            <div><h3>No account. No telemetry.</h3><p>Download and work offline. We don't know who you are, what you're making, or how many machines you're on — and we're keeping it that way.</p></div>
          </div>
        </div>
      </div>
      <div class="receipt-wrap reveal">
        <div class="receipt">
          <div class="receipt__head"><strong>Open Creative Suite</strong><span>Receipt no. 000-000 · ${year}</span></div>
          <ul class="receipt__lines">
            ${receipt}
            <li class="receipt__rule"><span>Subscription fee</span><span class="receipt__lead"></span><span>$0</span></li>
            <li><span>Seat licences</span><span class="receipt__lead"></span><span>$0</span></li>
            <li><span>Export watermarks</span><span class="receipt__lead"></span><span>$0</span></li>
          </ul>
          <div class="receipt__total"><span>Total due</span><b>$0.00</b></div>
          <div class="receipt__stamp">PAID IN FULL · FOREVER</div>
          <div class="receipt__barcode" aria-hidden="true"></div>
          <div class="receipt__foot"><span>THANK YOU FOR MAKING THINGS</span><span>NO REFUNDS NEEDED</span></div>
        </div>
      </div>
    </div>
  </section>

  <section class="section" id="source" data-section="source">
    <div class="wrap oss-grid">
      <div class="reveal">
        <p class="eyebrow" style="margin-bottom:18px">03 — The source</p>
        <h2>The source<br>is the spec.</h2>
        <p class="lede">Every app is built in public. Read it, audit it, fork it for your own use — just don't resell the software. If we ever go strange, the source stays with you.</p>
        <div class="license-row">
          <span class="chip-tag">Apache 2.0 + Commons Clause</span>
          <span class="chip-tag">No CLA</span>
          <span class="chip-tag">Public roadmap</span>
          <span class="chip-tag">Buildable from source</span>
        </div>
        <div class="oss-links">
          <a class="btn" href="${site.github}" target="_blank" rel="noopener">${icon("github")} GitHub</a>
          <a class="btn btn--outline" href="${site.community}" target="_blank" rel="noopener">Community ${icon("arrowUpRight")}</a>
          <a class="btn btn--outline" href="${repoUrl(products[0])}/issues" target="_blank" rel="noopener">Report a bug ${icon("arrowUpRight")}</a>
        </div>
      </div>
      <div class="reveal">
        <div class="code-panel">
          <div class="code-panel__bar">
            <span class="code-panel__dots" aria-hidden="true"><i></i><i></i><i></i></span>
            <span>bash — build from source</span>
            <button class="copy-btn" type="button" data-copy="clone-code">Copy</button>
          </div>
          <pre id="clone-code"><code>${cloneSnippet}

<span class="c"># no account. no licence server.</span>
<span class="n">→</span> requires the .NET 10 SDK</code></pre>
        </div>
      </div>
    </div>
  </section>

  <section class="cta-band">
    <div class="wrap cta-band__in">
      <h2>Stop renting<br>your tools.</h2>
      <div>
        <p>Pick an app, download the latest release, and get back to work. No email gate, no trial timer, no card.</p>
        <div class="cta-band__actions">
          <a class="btn" href="#suite">Choose your app ${icon("arrow")}</a>
          <a class="btn btn--outline" href="about.html">Read the manifesto</a>
        </div>
      </div>
    </div>
  </section>`;

  const jsonld = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: site.name,
    url: `${siteUrl}/`,
    description: site.description,
    itemListElement: products.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "SoftwareApplication",
        name: p.name,
        applicationCategory: "MultimediaApplication",
        operatingSystem: p.platforms.join(", "),
        description: p.blurb,
        url: `${siteUrl}/apps/${p.slug}/`,
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" }
      }
    }))
  });

  return pageShell({
    title: `${site.name} — professional creative tools, free forever`,
    description: site.description,
    path: "/",
    base: "./",
    content,
    jsonld
  });
}

/* ---------- product page ---------- */
function appPage(p, index) {
  const base = "../../";
  const prev = products[(index - 1 + products.length) % products.length];
  const next = products[(index + 1) % products.length];
  const canonicalPath = `/apps/${p.slug}/`;

  const features = p.features
    .map(
      (f, i) => `<div class="feature reveal">
        <span class="feature__num"><b>${pad(i + 1)}</b> / 06</span>
        <h3>${esc(f.title)}</h3>
        <p>${esc(f.body)}</p>
      </div>`
    )
    .join("");

  const shots = p.shots
    .map((shot, i) => {
      const image = p.images && p.images.shots && p.images.shots[i];
      let frame;
      if (image) {
        frame = `<img class="app-shot" src="${imageSrc(base, p, image.file)}" alt="${esc(image.alt || `${p.name} — ${shot.label}`)}" width="${
          p.shotWidth || 1440
        }" height="${p.shotHeight || 900}" loading="lazy" decoding="async">`;
      } else if (i === 1) {
        frame = `<div class="shot__detail"><div class="detail-panel" style="--accent:${p.accent}"><div class="ui__panel">${panel(
          p
        )}</div></div></div>`;
      } else {
        frame = mock(p, i === 0 ? "b" : "a", { dialog: i === 2 });
      }
      return `<figure class="shot reveal">
      <div class="shot__frame">${frame}</div>
      <figcaption class="shot__cap"><span class="shot__label">${esc(shot.label)}</span><p>${esc(
        shot.caption
      )}</p></figcaption>
    </figure>`;
    })
    .join("");

  const specs = `
    <div class="spec"><dt>Latest release</dt><dd>v${esc(p.version)}<small>${esc(p.released)}</small></dd></div>
    <div class="spec"><dt>Licence</dt><dd><a href="${repoUrl(p)}/blob/master/LICENSE.md" target="_blank" rel="noopener">${esc(
      p.license
    )}</a><small>Source-available · no resale</small></dd></div>
    <div class="spec"><dt>Platforms</dt><dd>${esc(p.platforms.join(" · "))}<small>Native builds</small></dd></div>
    <div class="spec"><dt>Download</dt><dd>${esc(p.size)}<small>Portable archive · no installer</small></dd></div>
    <div class="spec"><dt>Formats</dt><dd>${esc(p.formats.join(" · "))}<small>Open formats first</small></dd></div>
    <div class="spec"><dt>Source</dt><dd><a href="${repoUrl(p)}" target="_blank" rel="noopener">${esc(
      p.name
    )}</a><small>github.com/${esc(p.repo)} · ${esc(p.licenseShort)}</small></dd></div>`;

  const titleLines = p.titleLines && p.titleLines.length ? p.titleLines : [p.name];
  const titleLength = Math.max(...titleLines.map((line) => line.length));
  const titleHtml = titleLines
    .map((line, i) => `<span class="title-line${i > 0 ? " title-line--outline" : ""}">${esc(line)}</span>`)
    .join("");

  const related =
    products.length <= 1
      ? []
      : products.length === 2
        ? [{ product: next, label: "Next", arrow: "→" }]
        : [
            { product: prev, label: "Previous", arrow: "←" },
            { product: next, label: "Next", arrow: "→" }
          ];

  const content = `
  <div class="wrap">
    <nav class="breadcrumb" aria-label="Breadcrumb">
      <a href="${base}index.html">Suite</a><span>/</span><b>${esc(p.name)}</b>
    </nav>
  </div>

  <section class="app-hero">
    <div class="wrap app-hero__grid">
      <div class="app-hero__copy">
        <div class="app-hero__eyebrow">
          <span class="eyebrow">${esc(p.category)}</span>
          <span class="version-pill">v${esc(p.version)}</span>
          <span class="free-pill">$0 · Free forever</span>
        </div>
        <h1 style="--len:${titleLength}">${titleHtml}</h1>
        <p class="app-hero__tagline">${esc(p.tagline)}</p>
        <p class="app-hero__blurb">${esc(p.blurb)}</p>
        <div class="app-hero__actions btn-row">
          <a class="btn btn--accent" href="${releaseUrl(p)}" target="_blank" rel="noopener" data-release-for="${p.repo}">${icon(
    "download"
  )} <span data-download-label>Download latest</span></a>
          <a class="btn btn--outline" href="${repoUrl(p)}" target="_blank" rel="noopener">${icon(
    "github"
  )} View source</a>
        </div>
        <ul class="app-hero__meta">
          <li>v<span data-version-for="${p.repo}">${esc(p.version)}</span></li>
          <li>${esc(p.licenseShort)}</li>
          <li>${esc(p.size)}</li>
          <li>${esc(p.platforms.join(" · "))}</li>
        </ul>
        ${
          p.docs
            ? `<p class="app-hero__docs"><a class="text-link" href="${p.docs}" target="_blank" rel="noopener">Read the user guide ${icon(
                "arrowUpRight"
              )}</a><a class="text-link" href="${repoUrl(p)}/issues" target="_blank" rel="noopener">Report an issue ${icon(
                "arrowUpRight"
              )}</a></p>`
            : ""
        }
      </div>
      <div class="mock-frame">
        ${heroVisual(p, base)}
        <div class="mock-frame__label"><span>${esc(p.name)} ${esc(p.version)} — workspace</span><span>Free · Source-available</span></div>
      </div>
    </div>
  </section>

  ${ticker(
    [
      `${p.name} v${p.version}`,
      "Free forever",
      p.licenseShort,
      "No account",
      "Windows / macOS / Linux",
      "Latest build from GitHub"
    ],
    "ticker--accent"
  )}

  <section class="section">
    <div class="wrap">
      <div class="sec-head">
        <p class="eyebrow sec-head__eyebrow">01 — Inside ${esc(p.name)}</p>
        <h2>What you<br>get.</h2>
        <p class="lede">Every feature ships in the free build. No pro tier, no unlock key, no “contact sales” for the thing you actually need.</p>
      </div>
      <div class="features">${features}</div>
    </div>
  </section>

  <section class="section section--paper2">
    <div class="wrap">
      <div class="sec-head">
        <p class="eyebrow sec-head__eyebrow">02 — A look inside</p>
        <h2>The workspace.</h2>
        <p class="lede">Fast, quiet and built around the work. Dark interface, honest controls, and a canvas that gets out of the way.</p>
      </div>
      <div class="shots-grid">${shots}</div>
    </div>
  </section>

  <section class="section section--tight">
    <div class="wrap">
      <div class="sec-head">
        <p class="eyebrow sec-head__eyebrow">03 — The fine print</p>
        <h2>Specs.</h2>
        <p class="lede">No surprises in the small type. Here is exactly what you are downloading.</p>
      </div>
      <dl class="specs">${specs}</dl>
    </div>
  </section>

  <section class="section" id="download" data-repo="${p.repo}">
    <div class="wrap">
      <div class="get-panel">
        <div class="get-panel__in">
          <span class="eyebrow">Free forever</span>
          <h2>Get <span>${esc(p.name)}</span>.</h2>
          <p>Download the latest release straight from GitHub. No account, no email, no trial timer — just the app and the source.</p>
          <div class="get-panel__actions">
            ${p.platforms
              .map(
                (platform) =>
                  `<a class="btn btn--on-dark" href="${releaseUrl(p)}" target="_blank" rel="noopener" data-platform="${platform}" data-release-for="${
                    p.repo
                  }">${platform}</a>`
              )
              .join("")}
            <a class="btn btn--ghost-dark" href="${repoUrl(p)}" target="_blank" rel="noopener">${icon(
    "code"
  )} Build from source</a>
          </div>
          <p class="get-panel__note"><span data-version-for="${p.repo}">v${esc(p.version)}</span><span>${esc(
    p.size
  )}</span><span>${esc(p.licenseShort)}</span><span>Direct from GitHub Releases. No email required.</span></p>
        </div>
        <div class="get-panel__glyph" aria-hidden="true">${productGlyph(p.glyph)}</div>
      </div>
    </div>
  </section>

  ${
    related.length
      ? `<section class="section section--tight">
    <div class="wrap">
      <div class="sec-head" style="margin-bottom:28px">
        <p class="eyebrow sec-head__eyebrow">Keep exploring</p>
        <h2>More suite.</h2>
      </div>
      <div class="next-grid"${related.length === 1 ? ' style="grid-template-columns:1fr"' : ""}>
        ${related
          .map(
            ({ product, label, arrow }) => `<a class="next-card" href="../${product.slug}/" style="--next-accent:${product.accent}">
          <span class="next-card__tile" aria-hidden="true">${productGlyph(product.glyph)}</span>
          <span><small>${arrow} ${label}</small><strong>${esc(product.name)}</strong></span>
          <span class="next-card__arrow" aria-hidden="true">${arrow}</span>
        </a>`
          )
          .join("")}
      </div>
    </div>
  </section>`
      : ""
  }`;

  const jsonld = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: p.name,
    applicationCategory: "MultimediaApplication",
    operatingSystem: p.platforms.join(", "),
    softwareVersion: p.version,
    description: p.blurb,
    url: `${siteUrl}${canonicalPath}`,
    downloadUrl: releaseUrl(p),
    license: `${repoUrl(p)}/blob/master/LICENSE.md`,
    screenshot: p.images && p.images.hero ? `${siteUrl}${imageSrc("", p, p.images.hero.file)}` : undefined,
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    publisher: { "@type": "Organization", name: site.name, url: `${siteUrl}/` }
  });

  return pageShell({
    title: `${p.name} — ${p.category} | ${site.name}`,
    description: `${p.tagline} ${p.blurb} Free forever, source-available, no account required.`,
    path: canonicalPath,
    base,
    bodyClass: "app-page",
    accent: p.accent,
    accentSoft: p.accentSoft,
    content,
    jsonld
  });
}

/* ---------- about ---------- */
function aboutPage() {
  const faqs = [
    {
      q: "Is it really free?",
      a: "Yes. Every app is fully featured, with no trial timer, no watermark, no seat limit and no locked export. The source is published under Apache 2.0 with the Commons Clause, so you can inspect, modify and build it yourself."
    },
    {
      q: "What's the catch?",
      a: "There isn't one for normal use. Open Creative Suite is built in public and funded by contributors. You are not the product: there is no account, no advertising and no telemetry. If you want to support it, star a repo, report a bug or send a pull request."
    },
    {
      q: "Can I use it commercially?",
      a: "Yes — client work, studio work, internal company work, anything. There is no licence fee and no per-seat charge. The artwork you make is yours, with no attribution requirement."
    },
    {
      q: "Can I resell the software?",
      a: "No. The Commons Clause means you cannot sell the software itself, a rebranded copy, or a product or service whose value derives entirely or substantially from it. Using it to produce and sell your own creative work is explicitly fine."
    },
    {
      q: "Do you collect any data?",
      a: "No analytics, no telemetry, no account system, no phone-home. The apps work offline. Downloads come straight from GitHub Releases, which is the only third party involved."
    },
    {
      q: "Which platforms are supported?",
      a: "Windows, macOS and Linux, with native builds for each. There is no web version and no mobile app — these are desktop tools built for real work."
    },
    {
      q: "Can I contribute?",
      a: "Absolutely. The repos are public, the roadmap is public, and issues are triaged in the open. Start with a small bug, a docs fix or a reproduction case — all of it helps."
    },
    {
      q: "How do updates work?",
      a: "Every app checks for releases on GitHub when you ask it to, never silently. You can download the latest build at any time from the product page. Older versions stay available in the releases archive."
    },
    {
      q: "What happens if the project stops?",
      a: "The source stays available. You can keep using the builds you have, fork the project for your own use, or build it yourself. No licence server means no kill switch."
    }
  ];

  const index = products
    .map(
      (p) => `<a class="next-card" href="apps/${p.slug}/" style="--next-accent:${p.accent}">
        <span class="next-card__tile" aria-hidden="true">${productGlyph(p.glyph)}</span>
        <span><small>${esc(p.category)}</small><strong>${esc(p.name)}</strong></span>
        <span class="next-card__arrow" aria-hidden="true">→</span>
      </a>`
    )
    .join("");

  const content = `
  <section class="page-hero">
    <div class="wrap">
      <p class="eyebrow" style="margin-bottom:22px">About · ${site.founded} — ${year}</p>
      <h1>Tools should<br>not expire.</h1>
      <div class="page-hero__sub">
        <p class="lede">Open Creative Suite is a set of professional desktop tools for people who make things — built in public, source-available, and free for as long as the files exist.</p>
        <div class="btn-row">
          <a class="btn btn--lime" href="index.html#suite">Explore the suite ${icon("arrow")}</a>
          <a class="btn btn--outline" href="${site.github}" target="_blank" rel="noopener">${icon("github")} Source code</a>
        </div>
      </div>
    </div>
  </section>

  <section class="section">
    <div class="wrap story">
      <div class="reveal">
        <p class="eyebrow" style="margin-bottom:18px">01 — Why this exists</p>
        <h2>The work outlasts<br>the subscription.</h2>
      </div>
      <div class="story__body reveal">
        <p>Open Creative Suite started in ${site.founded} with a simple complaint: making a living from creative work increasingly requires renting the tools to do it. Miss a payment and the files become raw material for someone else's software.</p>
        <p>So we built the alternative: ${countWord(products.length).toLowerCase()} focused applications for ${categoryList()}, with more on the way — sharing a design language and an obsession with <strong>files that open tomorrow</strong>. No accounts, no cloud, no licence server waiting to switch off.</p>
        <p>The suite is funded by contributors, not customers. That changes the incentives: features ship when they are ready, not when the pricing page needs a new tier. Nothing is held back to protect an upsell, because there isn't one.</p>
        <p>It is not a protest project. These are tools we use every day, built to a professional standard, with the specific goal of being <strong>unremarkable to switch to</strong>. Open the app, find the tool, do the work, export.</p>
      </div>
    </div>
  </section>

  <section class="section section--dark">
    <div class="wrap">
      <div class="sec-head">
        <p class="eyebrow sec-head__eyebrow">02 — What we believe</p>
        <h2>Four rules.<br>No exceptions.</h2>
        <p class="lede">These are not marketing values. They are constraints that decide what we build and what we refuse to build.</p>
      </div>
      <div class="principles" style="margin-top:0">
        <div class="principle">
          <span class="principle__num">01</span>
          <div><h3>Free is the feature</h3><p>No trials, no tiers and no upsell hiding the export button. If a feature exists, it ships in the free build.</p></div>
        </div>
        <div class="principle">
          <span class="principle__num">02</span>
          <div><h3>Your files are yours</h3><p>Open formats, published specs and no cloud dependency. Work offline; leave whenever you like.</p></div>
        </div>
        <div class="principle">
          <span class="principle__num">03</span>
          <div><h3>Source in the open</h3><p>Apache 2.0 with the Commons Clause, a public roadmap and public issues. You get the same code we run — including the right to fork it for yourself.</p></div>
        </div>
        <div class="principle">
          <span class="principle__num">04</span>
          <div><h3>No account, no telemetry</h3><p>No login, no analytics, no usage pings. We cannot lose, sell or leak data we never collect.</p></div>
        </div>
      </div>
    </div>
  </section>

  <section class="section" id="licensing">
    <div class="wrap story">
      <div class="reveal">
        <p class="eyebrow" style="margin-bottom:18px">03 — Licensing</p>
        <h2>Apache 2.0<br>+ Commons Clause.</h2>
      </div>
      <div class="story__body reveal">
        <p><strong>Use it for anything.</strong> Personal, commercial, studio, classroom, internal company work. No royalties, no per-seat fee and no attribution required in your work.</p>
        <p><strong>Your output is yours.</strong> The licence covers the software, not the images, icons, logos or layouts you make with it.</p>
        <p><strong>Modify it and share it.</strong> Fork the source, change it, build your own version. If you pass it on, keep the licence and notices with it.</p>
        <p><strong>Don't sell the software.</strong> You may not sell the app itself, a renamed copy, or a product or service whose value derives entirely or substantially from it. Selling the work you make with it is fine.</p>
        <p><strong>No warranty.</strong> These are professional tools, but they are provided as-is. Back up your work — as you would with any app.</p>
        <p class="mono" style="color:var(--muted);letter-spacing:.06em">Source-available, not OSI open source — because of the no-resale condition.</p>
        <a class="text-link" href="${repoUrl(products[0])}/blob/master/LICENSE.md" target="_blank" rel="noopener">Read the full licence ${icon(
          "arrowUpRight"
        )}</a>
      </div>
    </div>
  </section>

  <section class="section section--paper2" id="faq">
    <div class="wrap">
      <div class="sec-head">
        <p class="eyebrow sec-head__eyebrow">04 — Questions</p>
        <h2>The honest<br>answers.</h2>
        <p class="lede">If something is still unclear, the issue tracker and the GitHub community are open. No support tier, no ticket queue.</p>
      </div>
      <div class="faq">
        ${faqs
          .map(
            (f) => `<details>
              <summary>${esc(f.q)}</summary>
              <p>${esc(f.a)}</p>
            </details>`
          )
          .join("")}
      </div>
    </div>
  </section>

  <section class="section section--tight">
    <div class="wrap">
      <div class="sec-head">
        <p class="eyebrow sec-head__eyebrow">05 — The suite</p>
        <h2>Pick a tool.</h2>
      </div>
      <div class="next-grid">${index}</div>
    </div>
  </section>

  <section class="cta-band">
    <div class="wrap cta-band__in">
      <h2>Make something<br>they can't bill you for.</h2>
      <div>
        <p>${products.length} apps, no account, no card. Download one or take the lot.</p>
        <div class="cta-band__actions">
          <a class="btn" href="index.html#suite">Browse the suite ${icon("arrow")}</a>
          <a class="btn btn--outline" href="${site.community}" target="_blank" rel="noopener">Visit GitHub</a>
        </div>
      </div>
    </div>
  </section>`;

  const jsonld = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: `About ${site.name}`,
    url: `${siteUrl}/about.html`,
    description: "Why Open Creative Suite exists, how it is licensed, and the rules behind the tools.",
    isPartOf: { "@type": "WebSite", name: site.name, url: `${siteUrl}/` }
  });

  return pageShell({
    title: `About — ${site.name}`,
    description: "Why Open Creative Suite exists, how it is licensed, and why the tools are free forever.",
    path: "/about.html",
    base: "./",
    content,
    jsonld
  });
}

/* ---------- 404 ---------- */
function notFoundPage() {
  const base = "";
  const content = `
  <section class="notfound">
    <div class="wrap notfound__in">
      <p class="eyebrow">Error 404 — Nothing on this artboard</p>
      <h1>404</h1>
      <p class="lede" style="max-width:40ch">That page has been moved, renamed or never existed. The tools are still where you left them.</p>
      <div class="btn-row">
        <a class="btn btn--lime" href="${base}index.html">Back to the suite ${icon("arrow")}</a>
        <a class="btn btn--outline" href="${base}index.html#suite">Browse apps</a>
      </div>
    </div>
    <div class="notfound__bg" aria-hidden="true">${productGlyph("spray")}</div>
  </section>`;
  return pageShell({
    title: `Page not found — ${site.name}`,
    description: "That page could not be found.",
    path: "/404.html",
    base,
    baseTag: `<base href="/">
  <script>
    if (!/^(localhost|127\\.0\\.0\\.1)$/.test(location.hostname)) {
      document.querySelector("base").href = "${siteUrl}/";
    }
  </script>`,
    content,
    robots: "noindex, follow"
  });
}

/* ---------- write ---------- */
await rm(join(root, "apps"), { recursive: true, force: true });
await mkdir(join(root, "apps"), { recursive: true });

await writeFile(join(root, "index.html"), homePage(), "utf8");
await writeFile(join(root, "about.html"), aboutPage(), "utf8");
await writeFile(join(root, "404.html"), notFoundPage(), "utf8");

for (let i = 0; i < products.length; i += 1) {
  const p = products[i];
  const dir = join(root, "apps", p.slug);
  await mkdir(dir, { recursive: true });
  await writeFile(join(dir, "index.html"), appPage(p, i), "utf8");
}

/* ---------- sitemap + robots ---------- */
const today = new Date().toISOString().slice(0, 10);
const urls = [
  { loc: `${siteUrl}/`, priority: "1.0" },
  { loc: `${siteUrl}/about.html`, priority: "0.7" },
  ...products.map((p) => ({ loc: `${siteUrl}/apps/${p.slug}/`, priority: "0.9" }))
];

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${today}</lastmod>
    <priority>${u.priority}</priority>
  </url>`
  )
  .join("\n")}
</urlset>
`;

const robots = `User-agent: *
Allow: /

Sitemap: ${siteUrl}/sitemap.xml
`;

await writeFile(join(root, "sitemap.xml"), sitemap, "utf8");
await writeFile(join(root, "robots.txt"), robots, "utf8");

console.log(`Built ${products.length} product pages + home, about, 404, sitemap.`);
