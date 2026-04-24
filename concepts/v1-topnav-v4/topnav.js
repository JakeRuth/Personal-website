/* =========================================================
   v1 topnav v4 — Variant A visuals, Variant C positioning
   ---------------------------------------------------------
   [ JR logo + "Jake Ruth" ]     [ Old-school OS | Code repo | SaaS product ]     [ blank ]
       ^ fixed far-left, constant        ^ centered as a visual unit in the bar

   Inherits from v3:
   - Tab chrome, cube accents, filled-pill + bottom-border
     highlight come from Variant A (topnav-v3/topnav-a.js +
     styles.css base).
   - Center-of-the-bar grouping comes from Variant C
     (topnav-v3/topnav-c.js) — the tab group sits in the middle,
     no right-side cluster.

   Changed from v3:
   - Far-left affordance is Jake's custom JR logo + his name,
     not the "<- Setup" chip. The logo is a CONSTANT — always
     present, always the same mark, doesn't move when the
     centered group rearranges. Clicking it returns to the
     Setup installer (the same route the old Setup chip had).
   ========================================================= */

window.V1TopNavV4 = (function () {
  "use strict";

  const EXPERIENCES = [
    { id: "xp",     label: "Old-school OS", href: "../v1/xp/" },
    { id: "readme", label: "Code repo",     href: "../v1/readme/" },
    { id: "saas",   label: "SaaS product",  href: "../v1/saas/" }
  ];

  const DEFAULT_LOGO_SRC = "../../images/logo.gif";
  const DEFAULT_SETUP_HREF = "../v1/";

  function detectCurrent() {
    const p = window.location.pathname;
    if (p.indexOf("/xp/")     !== -1) return "xp";
    if (p.indexOf("/readme/") !== -1) return "readme";
    if (p.indexOf("/saas/")   !== -1) return "saas";
    return null;
  }

  function makeCubeMark() {
    // Same 3x3 sticker grid Variant A uses. Colors are applied
    // in CSS via [data-exp="..."].
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
    const setupHref = opts.setupHref || DEFAULT_SETUP_HREF;
    const logoSrc   = opts.logoSrc   || DEFAULT_LOGO_SRC;

    const nav = document.createElement("nav");
    nav.className = "v1-topnav";
    nav.setAttribute("data-variant", "v4");
    nav.setAttribute("aria-label", "Experience switcher");

    // -------- Left: JR logo + "Jake Ruth" (CONSTANT) --------
    const left = document.createElement("div");
    left.className = "v1-topnav-left";

    const brand = document.createElement("a");
    brand.className = "v1-topnav-brand";
    brand.href = setupHref;
    brand.setAttribute("aria-label", "Jake Ruth — back to Setup");

    const logo = document.createElement("img");
    logo.className = "v1-topnav-brand-logo";
    logo.src = logoSrc;
    logo.alt = "JR";
    logo.setAttribute("draggable", "false");

    const name = document.createElement("span");
    name.className = "v1-topnav-brand-name";
    name.textContent = "Jake Ruth";

    brand.appendChild(logo);
    brand.appendChild(name);

    brand.addEventListener("click", (ev) => {
      ev.preventDefault();
      navTo(setupHref);
    });

    left.appendChild(brand);
    nav.appendChild(left);

    // -------- Center: tab group (Variant A visuals) --------
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

  // Public API:
  //   V1TopNavV4.mount(host, { current, setupHref, logoSrc })
  return { mount: mount };
})();
