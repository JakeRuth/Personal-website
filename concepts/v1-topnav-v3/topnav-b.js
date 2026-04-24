/* =========================================================
   v1 topnav v3 — Variant B: Wordmark middle + tabs right
   ---------------------------------------------------------
   [ <- Setup ]            JAKE  RUTH             [ tabs ]
                           ^ serif, small caps, letterspaced
   - Middle gets an anchor (the wordmark), not just empty air.
   - Wordmark is also clickable → back to Setup. Secondary
     affordance, so the ← Setup button still holds primary.
   - Tabs stay grouped on the right (recognizable segmented
     control from v2).
   - Committed choice: NO cube marks on tab labels in this
     variant. The wordmark is the brand moment; the tabs stay
     text-only to keep the bar from feeling crowded.
   ========================================================= */

window.V1TopNavB = (function () {
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
    nav.setAttribute("data-variant", "b");
    nav.setAttribute("aria-label", "Experience switcher (variant B: wordmark middle)");

    // Left: Setup
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

    // Middle: wordmark (also a link back to Setup)
    const wordmark = document.createElement("a");
    wordmark.className = "v1-topnav-wordmark";
    wordmark.href = setupHref;
    wordmark.setAttribute("aria-label", "Jake Ruth — back to the Setup wizard");
    wordmark.innerHTML = 'Jake<span class="ampersand">·</span>Ruth';
    wordmark.addEventListener("click", (ev) => {
      ev.preventDefault();
      navTo(setupHref);
    });
    nav.appendChild(wordmark);

    // Right: tabs
    const right = document.createElement("div");
    right.className = "v1-topnav-right";

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

      // Committed: no cube marks in B (wordmark carries the brand).
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
    });
    right.appendChild(tabs);
    nav.appendChild(right);

    host.innerHTML = "";
    host.appendChild(nav);
    return nav;
  }

  return { mount: mount };
})();
