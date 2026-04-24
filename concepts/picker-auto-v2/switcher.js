/*
 * jr-switcher.js  (picker-auto-v2)
 * Jake Ruth personal site — reusable experience switcher pill.
 *
 * Drop this into any experience page:
 *   <script src="../picker-auto-v2/switcher.js" defer></script>
 *
 * Self-initializes on DOMContentLoaded: creates a small pill in the
 * bottom-right corner that lets a visitor jump to any of the 5 modes,
 * pick "Surprise me," or pin a preference to localStorage.
 *
 * Keybinding: pressing "?" or "/" anywhere opens the dropdown.
 *
 * Zero dependencies. Scoped styles (injects a <style> with a unique prefix).
 * Safe to include more than once (guards against double-init).
 */
(function () {
  "use strict";
  if (window.__jrSwitcherLoaded) return;
  window.__jrSwitcherLoaded = true;

  // Keep this list in sync with picker-auto-v2/index.html.
  const EXPERIENCES = [
    { slug: "xp-luna-v2",         label: "XP Luna" },
    { slug: "vista-faithful-v3",  label: "Vista Faithful" },
    { slug: "enterprise-saas-v2", label: "Enterprise SaaS" },
    { slug: "readme-git-fusion",  label: "README x Git" },
    { slug: "readme-mode",        label: "README" },
  ];

  const LS_KEY = "jr_experience_locked";

  // Host pages declare their slug via a global or a data-attr, else we
  // guess from the URL path. The pill shows the current mode as its label.
  function currentSlug() {
    if (window.JR_CURRENT_SLUG) return window.JR_CURRENT_SLUG;
    const bodyAttr = document.body && document.body.getAttribute("data-jr-slug");
    if (bodyAttr) return bodyAttr;
    const parts = window.location.pathname.split("/").filter(Boolean);
    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i];
      if (EXPERIENCES.find(e => e.slug === p)) return p;
    }
    return null;
  }

  function go(slug) {
    // Sibling-directory hop. Works under file:// and `python3 -m http.server`.
    window.location.href = "../" + slug + "/";
  }

  function injectStyles() {
    const css = `
      .jr-sw {
        position: fixed; right: 16px; bottom: 16px;
        z-index: 2147483000;
        font: 500 12px/1 "Inter", -apple-system, Segoe UI, system-ui, sans-serif;
        letter-spacing: 0.02em;
        color: #f5f3ee;
      }
      .jr-sw-pill {
        display: inline-flex; align-items: center; gap: 8px;
        background: rgba(10, 10, 10, 0.82);
        border: 1px solid rgba(255, 255, 255, 0.16);
        backdrop-filter: blur(14px);
        -webkit-backdrop-filter: blur(14px);
        color: #f5f3ee;
        padding: 9px 14px;
        border-radius: 999px;
        cursor: pointer;
        box-shadow: 0 6px 22px rgba(0, 0, 0, 0.32);
        transition: border-color 140ms ease, transform 140ms ease;
      }
      .jr-sw-pill:hover { border-color: #e9c46a; transform: translateY(-1px); }
      .jr-sw-dot {
        width: 6px; height: 6px; border-radius: 50%;
        background: #e9c46a;
      }
      .jr-sw-caret { opacity: 0.6; font-size: 10px; }
      .jr-sw-menu {
        position: absolute; right: 0; bottom: calc(100% + 8px);
        min-width: 260px;
        background: rgba(12, 12, 12, 0.96);
        border: 1px solid rgba(255, 255, 255, 0.14);
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 18px 44px rgba(0, 0, 0, 0.5);
        transform-origin: bottom right;
        transform: scale(0.96) translateY(4px);
        opacity: 0;
        pointer-events: none;
        transition: opacity 140ms ease, transform 140ms ease;
      }
      .jr-sw.open .jr-sw-menu {
        opacity: 1;
        transform: scale(1) translateY(0);
        pointer-events: auto;
      }
      .jr-sw-menu button {
        display: flex; width: 100%;
        align-items: center; justify-content: space-between;
        text-align: left;
        background: transparent; border: none;
        color: #f5f3ee;
        padding: 12px 14px;
        cursor: pointer;
        font: inherit;
        border-bottom: 1px solid rgba(255, 255, 255, 0.06);
      }
      .jr-sw-menu button:last-child { border-bottom: none; }
      .jr-sw-menu button:hover { background: rgba(255, 255, 255, 0.06); color: #e9c46a; }
      .jr-sw-menu button .tag {
        font-size: 10px; letter-spacing: 0.12em; text-transform: uppercase;
        color: #8c877d;
      }
      .jr-sw-menu button.current .tag { color: #e9c46a; }
      .jr-sw-menu .jr-sw-section {
        padding: 10px 14px 6px;
        font-size: 10px; letter-spacing: 0.16em; text-transform: uppercase;
        color: #6a655c;
        border-bottom: 1px solid rgba(255, 255, 255, 0.06);
      }
      .jr-sw-menu label.remember {
        display: flex; align-items: center; gap: 10px;
        padding: 12px 14px;
        font-size: 12px;
        color: #cfc9bd;
        cursor: pointer;
      }
      .jr-sw-menu label.remember input { accent-color: #e9c46a; }
      @media (max-width: 480px) {
        .jr-sw { right: 10px; bottom: 10px; }
        .jr-sw-menu { min-width: 220px; }
      }
    `;
    const s = document.createElement("style");
    s.setAttribute("data-jr-switcher", "1");
    s.textContent = css;
    document.head.appendChild(s);
  }

  function render() {
    const cur = currentSlug();
    const curExp = EXPERIENCES.find(e => e.slug === cur);
    const label = curExp ? curExp.label : "Switch";

    const root = document.createElement("div");
    root.className = "jr-sw";
    root.setAttribute("role", "region");
    root.setAttribute("aria-label", "Experience switcher");

    const pill = document.createElement("button");
    pill.className = "jr-sw-pill";
    pill.setAttribute("aria-haspopup", "menu");
    pill.setAttribute("aria-expanded", "false");
    pill.innerHTML = `<span class="jr-sw-dot"></span>Experience: ${label} <span class="jr-sw-caret">&#9662;</span>`;

    const menu = document.createElement("div");
    menu.className = "jr-sw-menu";
    menu.setAttribute("role", "menu");

    const header = document.createElement("div");
    header.className = "jr-sw-section";
    header.textContent = "Jump to";
    menu.appendChild(header);

    EXPERIENCES.forEach(exp => {
      const b = document.createElement("button");
      b.setAttribute("role", "menuitem");
      if (exp.slug === cur) b.classList.add("current");
      const tag = exp.slug === cur ? "here" : "";
      b.innerHTML = `<span>${exp.label}</span><span class="tag">${tag}</span>`;
      b.addEventListener("click", () => {
        if (exp.slug === cur) { close(); return; }
        go(exp.slug);
      });
      menu.appendChild(b);
    });

    const extras = document.createElement("div");
    extras.className = "jr-sw-section";
    extras.textContent = "Or";
    menu.appendChild(extras);

    const random = document.createElement("button");
    random.setAttribute("role", "menuitem");
    random.innerHTML = `<span>Surprise me</span><span class="tag">random</span>`;
    random.addEventListener("click", () => {
      const pool = EXPERIENCES.filter(e => e.slug !== cur);
      const pick = pool[Math.floor(Math.random() * pool.length)];
      go(pick.slug);
    });
    menu.appendChild(random);

    const remember = document.createElement("label");
    remember.className = "remember";
    const cb = document.createElement("input");
    cb.type = "checkbox";
    cb.checked = localStorage.getItem(LS_KEY) === cur;
    cb.addEventListener("change", () => {
      if (cb.checked && cur) {
        localStorage.setItem(LS_KEY, cur);
      } else {
        localStorage.removeItem(LS_KEY);
      }
    });
    const txt = document.createElement("span");
    txt.textContent = "Remember this pick";
    remember.appendChild(cb);
    remember.appendChild(txt);
    menu.appendChild(remember);

    root.appendChild(menu);
    root.appendChild(pill);
    document.body.appendChild(root);

    function open() {
      root.classList.add("open");
      pill.setAttribute("aria-expanded", "true");
    }
    function close() {
      root.classList.remove("open");
      pill.setAttribute("aria-expanded", "false");
    }
    function toggle() {
      root.classList.contains("open") ? close() : open();
    }

    pill.addEventListener("click", (e) => {
      e.stopPropagation();
      toggle();
    });
    document.addEventListener("click", (e) => {
      if (!root.contains(e.target)) close();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") return close();
      const typing = /input|textarea|select/i.test((e.target && e.target.tagName) || "");
      if (typing) return;
      if (e.key === "?" || e.key === "/") {
        e.preventDefault();
        toggle();
      }
    });

    // Tiny API for host pages that want programmatic control.
    window.JRSwitcher = {
      open, close, toggle,
      go,
      remember: (slug) => localStorage.setItem(LS_KEY, slug || cur),
      forget: () => localStorage.removeItem(LS_KEY),
      current: cur,
      experiences: EXPERIENCES.slice(),
    };
  }

  function boot() {
    if (!document.body) return document.addEventListener("DOMContentLoaded", boot);
    injectStyles();
    render();
  }
  boot();
})();
