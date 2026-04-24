/* =========================================================
   v1 topnav v3 — Variant C: Unified center bar
   ---------------------------------------------------------
              [ <- Setup | Old-school OS · Code repo · SaaS product ]
   - Everything in one centered pill. Feels like a command bar.
   - Edges of the screen are empty on purpose — nav is one unit.
   - Setup sits on the left inside the pill, divided from tabs
     with a subtle vertical rule.
   - Committed choice: NO cube marks. The unified bar is already
     visually dense; keeping it text-only makes the pill scan
     as a single control. A small dot separator between tabs
     replaces the segmented-control background.
   ========================================================= */

window.V1TopNavC = (function () {
  "use strict";

  const EXPERIENCES = [
    { id: "xp",     label: "Old-school OS", href: "../v1/xp/" },
    { id: "readme", label: "Code repo",     href: "../v1/readme/" },
    { id: "saas",   label: "SaaS product",  href: "../v1/saas/" }
  ];

  function detectCurrent() {
    const p = window.location.pathname;
    if (p.indexOf("/xp/")     !== -1) return "xp";
    if (p.indexOf("/readme/") !== -1) return "readme";
    if (p.indexOf("/saas/")   !== -1) return "saas";
    return null;
  }

  function navTo(url) {
    if (window.V1Transition && typeof window.V1Transition.go === "function") {
      window.V1Transition.go(url);
    } else {
      window.location.href = url;
    }
  }

  function mount(host, opts) {
    opts = opts || {};
    const currentId = typeof opts.current === "string"
      ? opts.current
      : detectCurrent();
    const setupHref = opts.setupHref || "../v1/";

    const nav = document.createElement("nav");
    nav.className = "v1-topnav";
    nav.setAttribute("data-variant", "c");
    nav.setAttribute("aria-label", "Experience switcher (variant C: unified center bar)");

    // Unified pill container
    const unified = document.createElement("div");
    unified.className = "v1-topnav-unified";

    // Setup on the left inside the pill
    const setup = document.createElement("a");
    setup.className = "v1-topnav-setup";
    setup.href = setupHref;
    setup.setAttribute("aria-label", "Back to the Setup wizard");
    setup.innerHTML =
      '<span class="v1-topnav-setup-arrow" aria-hidden="true">' +
        '<svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">' +
          '<path d="M10 3L5 8l5 5"/>' +
        '</svg>' +
      '</span>' +
      '<span class="v1-topnav-setup-label">Setup</span>';
    setup.addEventListener("click", (ev) => {
      ev.preventDefault();
      navTo(setupHref);
    });
    unified.appendChild(setup);

    // Divider
    const divider = document.createElement("div");
    divider.className = "v1-topnav-divider";
    divider.setAttribute("aria-hidden", "true");
    unified.appendChild(divider);

    // Tabs with dot separators
    const tabs = document.createElement("div");
    tabs.className = "v1-topnav-tabs";
    tabs.setAttribute("role", "tablist");

    EXPERIENCES.forEach((exp, idx) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "v1-topnav-tab" + (exp.id === currentId ? " is-current" : "");
      btn.setAttribute("role", "tab");
      btn.setAttribute("aria-selected", exp.id === currentId ? "true" : "false");
      btn.setAttribute("data-exp", exp.id);
      if (exp.id === currentId) btn.setAttribute("aria-current", "page");
      btn.innerHTML = '<span class="v1-topnav-label">' + exp.label + '</span>';

      btn.addEventListener("click", () => {
        if (exp.id === currentId) {
          try { window.scrollTo({ top: 0, behavior: "smooth" }); }
          catch (_e) { window.scrollTo(0, 0); }
          return;
        }
        navTo(exp.href);
      });

      tabs.appendChild(btn);

      if (idx < EXPERIENCES.length - 1) {
        const sep = document.createElement("span");
        sep.className = "v1-topnav-sep";
        sep.setAttribute("aria-hidden", "true");
        tabs.appendChild(sep);
      }
    });
    unified.appendChild(tabs);

    nav.appendChild(unified);

    host.innerHTML = "";
    host.appendChild(nav);
    return nav;
  }

  return { mount: mount };
})();
