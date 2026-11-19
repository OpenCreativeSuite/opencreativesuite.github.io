/* Open Creative Suite: site behaviour */
(function () {
  "use strict";

  var root = document.documentElement;

  /* ---------- Mobile menu ---------- */
  var toggle = document.querySelector("[data-menu-toggle]");
  var menu = document.getElementById("menu");

  function setMenu(open) {
    if (!menu || !toggle) return;
    menu.classList.toggle("is-open", open);
    document.body.classList.toggle("menu-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.querySelector("[data-menu-label]").textContent = open ? "Close" : "Menu";
    if (open) {
      var first = menu.querySelector("a");
      if (first) first.focus();
    }
  }

  if (toggle) {
    toggle.addEventListener("click", function () {
      setMenu(!menu.classList.contains("is-open"));
    });
  }

  if (menu) {
    menu.addEventListener("click", function (event) {
      if (event.target.closest("a")) setMenu(false);
    });
  }

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && menu && menu.classList.contains("is-open")) {
      setMenu(false);
      if (toggle) toggle.focus();
    }
  });

  window.addEventListener("resize", function () {
    if (window.innerWidth > 900 && menu && menu.classList.contains("is-open")) {
      setMenu(false);
    }
  });

  /* ---------- Header state ---------- */
  var header = document.querySelector(".site-header");
  var lastState = false;

  function onScroll() {
    if (!header) return;
    var scrolled = window.scrollY > 8;
    if (scrolled !== lastState) {
      header.classList.toggle("is-scrolled", scrolled);
      lastState = scrolled;
    }
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Reveal on scroll ---------- */
  var revealItems = document.querySelectorAll(".reveal");

  if ("IntersectionObserver" in window && revealItems.length) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );
    revealItems.forEach(function (el) {
      io.observe(el);
    });
  } else {
    revealItems.forEach(function (el) {
      el.classList.add("is-in");
    });
  }

  /* ---------- Year ---------- */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });

  /* ---------- Copy code ---------- */
  document.querySelectorAll("[data-copy]").forEach(function (button) {
    button.addEventListener("click", function () {
      var target = document.getElementById(button.getAttribute("data-copy"));
      if (!target) return;
      var text = target.innerText;
      var done = function () {
        var original = button.textContent;
        button.textContent = "Copied";
        window.setTimeout(function () {
          button.textContent = original;
        }, 1600);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done, done);
      } else {
        var range = document.createRange();
        range.selectNodeContents(target);
        var selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
        try {
          document.execCommand("copy");
        } catch (error) {}
        selection.removeAllRanges();
        done();
      }
    });
  });

  /* ---------- Detect platform for download label ---------- */
  var platform = (function () {
    var ua = navigator.userAgent || "";
    var platformHint = (navigator.userAgentData && navigator.userAgentData.platform) || navigator.platform || "";
    var haystack = (ua + " " + platformHint).toLowerCase();
    if (/mac|iphone|ipad/.test(haystack) && !/windows/.test(haystack)) return "macOS";
    if (/win/.test(haystack)) return "Windows";
    if (/linux|x11|ubuntu|fedora/.test(haystack)) return "Linux";
    return null;
  })();

  if (platform) {
    document.querySelectorAll("[data-download-label]").forEach(function (el) {
      el.textContent = "Download for " + platform;
    });
    document.querySelectorAll("[data-platform]").forEach(function (el) {
      var match = el.getAttribute("data-platform") === platform;
      el.classList.toggle("is-current", match);
      el.setAttribute("aria-current", match ? "true" : "false");
    });
  }

  /* ---------- Hydrate latest release from GitHub (optional) ---------- */
  var releaseNodes = document.querySelectorAll("[data-repo]");
  if (releaseNodes.length) {
    var update = function (repo, data) {
      if (!data || !data.tag_name) return;
      var version = String(data.tag_name).replace(/^v/i, "");
      document.querySelectorAll('[data-version-for="' + repo + '"]').forEach(function (el) {
        el.textContent = "v" + version;
      });
      if (data.html_url) {
        document.querySelectorAll('[data-release-for="' + repo + '"]').forEach(function (el) {
          el.setAttribute("href", data.html_url);
        });
      }
    };

    releaseNodes.forEach(function (node) {
      var repo = node.getAttribute("data-repo");
      if (!repo) return;
      var key = "ocs-release:" + repo;
      var cached = null;
      try {
        cached = window.sessionStorage.getItem(key);
      } catch (error) {}

      if (cached) {
        try {
          update(repo, JSON.parse(cached));
          return;
        } catch (error) {}
      }

      fetch("https://api.github.com/repos/" + repo + "/releases/latest", {
        headers: { Accept: "application/vnd.github+json" }
      })
        .then(function (response) {
          if (!response.ok) throw new Error("No release");
          return response.json();
        })
        .then(function (data) {
          update(repo, data);
          try {
            window.sessionStorage.setItem(
              key,
              JSON.stringify({ tag_name: data.tag_name, html_url: data.html_url })
            );
          } catch (error) {}
        })
        .catch(function () {
          /* Static fallback remains in place. */
        });
    });
  }

  /* ---------- Highlight nav on scroll (home) ---------- */
  var sections = document.querySelectorAll("[data-section]");
  var navLinks = document.querySelectorAll("[data-nav-section]");
  if (sections.length && navLinks.length && "IntersectionObserver" in window) {
    var navIO = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var id = entry.target.getAttribute("data-section");
          navLinks.forEach(function (link) {
            var on = link.getAttribute("data-nav-section") === id;
            if (on) link.setAttribute("aria-current", "page");
            else link.removeAttribute("aria-current");
          });
        });
      },
      { rootMargin: "-45% 0px -45% 0px" }
    );
    sections.forEach(function (section) {
      navIO.observe(section);
    });
  }

  root.classList.add("js-ready");
})();
