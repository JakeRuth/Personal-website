/* =========================================================
   v1 topnav v3 — Variant A: Centered tabs
   ---------------------------------------------------------
   [ <- Setup ]                 [ Old-school OS | Code repo | SaaS product ]
                                      ^ tabs centered in the bar
   - Setup is absolutely anchored to the far left.
   - Tabs sit dead-center of the bar. The gap-in-the-middle
     problem is solved by putting the primary affordance there.
   - Tiny 14px cube accent beside each tab label (committed: on).
   ========================================================= */

window.V1TopNavA = (function () {
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

  function makeCubeMark() {
    let s = "";
    for (let i = 0; i < 9; i++) s += "<i></i>";
    return s;
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
    nav.setAttribute("data-variant", "a");
    nav.setAttribute("aria-label", "Experience switcher (variant A: centered)");

    // Left: Setup (absolutely anchored)
    const left = document.createElement("div");
    left.className = "v1-topnav-left";
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
    left.appendChild(setup);
    nav.appendChild(left);

    // Center: tabs
    const tabs = document.createElement("div");
    tabs.className = "v1-topnav-tabs";
    tabs.setAttribute("role", "tablist");

    EXPERIENCES.forEach((exp) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "v1-topnav-tab" + (exp.id === currentId ? " is-current" : "");
      btn.setAttribute("role", "tab");
      btn.setAttribute("aria-selected", exp.id === currentId ? "true" : "false");
      btn.setAttribute("data-exp", exp.id);
      if (exp.id === currentId) btn.setAttribute("aria-current", "page");

      btn.innerHTML =
        '<span class="v1-topnav-mark" data-exp="' + exp.id + '" aria-hidden="true">' +
          makeCubeMark() +
        '</span>' +
        '<span class="v1-topnav-label">' + exp.label + '</span>';

      btn.addEventListener("click", () => {
        if (exp.id === currentId) {
          try { window.scrollTo({ top: 0, behavior: "smooth" }); }
          catch (_e) { window.scrollTo(0, 0); }
          return;
        }
        navTo(exp.href);
      });

      tabs.appendChild(btn);
    });
    nav.appendChild(tabs);

    host.innerHTML = "";
    host.appendChild(nav);
    return nav;
  }

  return { mount: mount };
})();
