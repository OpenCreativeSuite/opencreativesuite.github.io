// Open Creative Suite browser interop.
//
// The Donkeh browser bridge owns the virtual tree and event delegation. This
// module adds the small pieces a content site needs from the host page:
//
//   * SVG namespace creation (the bridge creates HTML elements only)
//   * initial location and document metadata
//   * clipboard, platform detection and GitHub release lookup
//   * reveal/scroll-spy helpers that operate on the rendered DOM
const SVG_NS = "http://www.w3.org/2000/svg";

const SVG_TAGS = new Set([
    "svg", "g", "path", "circle", "rect", "line", "polyline", "polygon",
    "ellipse", "text", "tspan", "defs", "use", "symbol", "clippath", "mask",
    "pattern", "lineargradient", "radialgradient", "stop", "filter", "marker",
    "view", "animate", "animatemotion", "animatetransform",
    "feblend", "fecolormatrix", "fecomponenttransfer", "fecomposite",
    "feconvolvematrix", "fediffuselighting", "fedisplacementmap",
    "fedistantlight", "fedropshadow", "feflood", "fefunca", "fefuncb",
    "fefuncg", "fefuncr", "fegaussianblur", "feimage", "femerge",
    "femergenode", "femorphology", "feoffset", "fepointlight",
    "fespecularlighting", "fespotlight", "fetile", "feturbulence"
]);

const nativeCreateElement = document.createElement.bind(document);
let initialised = false;
let revealObserver = null;
let sectionObserver = null;
const observedSections = new WeakSet();

export function init() {
    if (!initialised) {
        initialised = true;
        installSvgSupport();
        installPageHelpers();
    }

    const redirect = readRedirect();
    const path = redirect ?? readPath();

    if (redirect) {
        history.replaceState(null, "", redirect);
    }

    if (location.hash) {
        scrollToId(location.hash.slice(1));
    }

    return path;
}

/* ---------------------------------------------------------------- SVG support */

function installSvgSupport() {
    // The C# bridge calls document.createElement for every virtual element.
    // SVG elements only render when created in the SVG namespace, so route the
    // known SVG tag names through createElementNS.
    document.createElement = function (name, options) {
        if (typeof name === "string" && SVG_TAGS.has(name.toLowerCase())) {
            return document.createElementNS(SVG_NS, name);
        }

        return nativeCreateElement(name, options);
    };
}

/* ------------------------------------------------------------ page behaviour */

function installPageHelpers() {
    document.documentElement.classList.add("js");

    window.addEventListener("scroll", updateHeader, { passive: true });

    revealObserver = new IntersectionObserver((entries) => {
        for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            entry.target.classList.add("is-in");
            revealObserver.unobserve(entry.target);
        }
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });

    sectionObserver = new IntersectionObserver((entries) => {
        for (const entry of entries) {
            if (!entry.isIntersecting) continue;

            const id = entry.target.getAttribute("data-section");
            if (!id) continue;

            document.querySelectorAll("[data-nav-section]").forEach((link) => {
                if (link.getAttribute("data-nav-section") === id) {
                    link.setAttribute("aria-current", "page");
                } else {
                    link.removeAttribute("aria-current");
                }
            });
        }
    }, { rootMargin: "-45% 0px -45% 0px" });

    const app = document.getElementById("app") || document.body;

    const observer = new MutationObserver(() => {
        removeLoadingPlaceholder();
        observeReveals();
        observeSections();
        updateHeader();
    });

    observer.observe(app, { childList: true, subtree: true });

    removeLoadingPlaceholder();
    observeReveals();
    observeSections();
    updateHeader();
}

function removeLoadingPlaceholder() {
    if (!document.querySelector(".app-root")) return;

    document.querySelectorAll(".app-loading").forEach((element) => element.remove());
}

function observeReveals() {
    if (!revealObserver) return;

    document.querySelectorAll(".reveal:not(.is-in)").forEach((element) => {
        revealObserver.observe(element);
    });
}

function observeSections() {
    if (!sectionObserver) return;

    document.querySelectorAll("[data-section]").forEach((element) => {
        if (observedSections.has(element)) return;
        observedSections.add(element);
        sectionObserver.observe(element);
    });
}

function updateHeader() {
    const header = document.querySelector(".site-header");
    if (header) {
        header.classList.toggle("is-scrolled", window.scrollY > 8);
    }
}

/* -------------------------------------------------------------- document meta */

export function setPageMeta(title, description, path) {
    if (title) {
        document.title = title;
    }

    setMeta("name", "description", description);
    setMeta("property", "og:title", title);
    setMeta("property", "og:description", description);
    setMeta("name", "twitter:title", title);
    setMeta("name", "twitter:description", description);

    if (path) {
        const url = new URL(path, document.baseURI).href;
        setMeta("property", "og:url", url);
        const canonical = document.querySelector('link[rel="canonical"]');
        if (canonical) canonical.setAttribute("href", url);
    }
}

function setMeta(attribute, name, content) {
    if (!content) return;

    let element = document.querySelector(`meta[${attribute}="${name}"]`);
    if (!element) {
        element = document.createElement("meta");
        element.setAttribute(attribute, name);
        document.head.appendChild(element);
    }

    element.setAttribute("content", content);
}

/* ----------------------------------------------------------------- clipboard */

export async function copyText(text) {
    try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(text);
            return true;
        }
    } catch {
        // Fall through to the legacy path.
    }

    try {
        const area = document.createElement("textarea");
        area.value = text;
        area.setAttribute("readonly", "");
        area.style.position = "fixed";
        area.style.top = "-1000px";
        document.body.appendChild(area);
        area.select();
        const copied = document.execCommand("copy");
        area.remove();
        return copied;
    } catch {
        return false;
    }
}

/* ------------------------------------------------------------------ platform */

export function detectPlatform() {
    const ua = navigator.userAgent || "";
    const platformHint = (navigator.userAgentData && navigator.userAgentData.platform)
        || navigator.platform
        || "";
    const haystack = (ua + " " + platformHint).toLowerCase();

    if (/mac|iphone|ipad/.test(haystack) && !/windows/.test(haystack)) return "macOS";
    if (/win/.test(haystack)) return "Windows";
    if (/linux|x11|ubuntu|fedora/.test(haystack)) return "Linux";
    return null;
}

/* ------------------------------------------------------------ GitHub releases */

export async function fetchLatestRelease(repo) {
    const key = "ocs-release:" + repo;

    try {
        const cached = sessionStorage.getItem(key);
        if (cached) {
            const data = JSON.parse(cached);
            if (data && data.tag_name) {
                return {
                    version: String(data.tag_name).replace(/^v/i, ""),
                    url: data.html_url || ""
                };
            }
        }
    } catch {
        // Ignore unavailable or malformed cache entries.
    }

    try {
        const response = await fetch(
            "https://api.github.com/repos/" + repo + "/releases/latest",
            { headers: { Accept: "application/vnd.github+json" } });

        if (!response.ok) return null;

        const data = await response.json();
        if (!data || !data.tag_name) return null;

        try {
            sessionStorage.setItem(key, JSON.stringify({
                tag_name: data.tag_name,
                html_url: data.html_url
            }));
        } catch {
            // Storage may be disabled; the in-memory result is still useful.
        }

        return {
            version: String(data.tag_name).replace(/^v/i, ""),
            url: data.html_url || ""
        };
    } catch {
        return null;
    }
}

/* ------------------------------------------------------------------ scrolling */

export function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
}

export function scrollToId(id) {
    if (!id) return;

    let attempts = 0;

    const tick = () => {
        const element = document.getElementById(id);

        if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "start" });
            return;
        }

        if (attempts++ < 90) {
            requestAnimationFrame(tick);
        }
    };

    requestAnimationFrame(tick);
}

/* -------------------------------------------------------------------- routing */

export function navigate(path) {
    const url = new URL(path, document.baseURI);
    history.pushState(null, "", url);
    window.dispatchEvent(new PopStateEvent("popstate"));
}

function readPath() {
    let path = location.pathname || "/";
    const base = document.querySelector("base");

    if (base) {
        const basePath = new URL(base.href, location.href).pathname.replace(/\/$/, "");

        if (basePath && basePath !== "/"
            && (path === basePath || path.startsWith(basePath + "/"))) {
            path = path.slice(basePath.length) || "/";
        }
    }

    path = path.replace(/\/index\.html$/i, "/");
    path = path.replace(/\.html$/i, "");

    if (!path.startsWith("/")) path = "/" + path;
    path = path.replace(/\/+/g, "/");

    if (path.length > 1) path = path.replace(/\/$/, "");

    return path || "/";
}

function readRedirect() {
    try {
        const value = sessionStorage.getItem("ocs:redirect");
        if (!value) return null;

        sessionStorage.removeItem("ocs:redirect");
        return value;
    } catch {
        return null;
    }
}
