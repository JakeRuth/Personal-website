/* =========================================================
   v1 top-nav v2
   Clearer, more legible, subtle. Labels are primary.

   Layout:
     [ <- Setup ]                  [ Old-school OS | Code repo | SaaS product ]

   - Labels are canonical: "Old-school OS", "Code repo", "SaaS product".
   - Tiny decorative Rubik's-cube mark sits beside each label. Static.
   - Current experience highlighted via filled background + bottom accent.
   - Clicking a non-current tab triggers the transition cube (V1Transition.go)
     and falls back to a plain hard-navigation if transition isn't loaded.
   - Same public behaviour / script injection pattern as v1 topnav.js,
     so this is a drop-in replacement.

   Expected script order on a host page (unchanged from v1):
     <link rel="stylesheet" href="../shared/topnav.css">
     <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
     <script src="../shared/cube-solver.js"></script>
     <script src="../shared/transition-cube.js"></script>
     <script src="../shared/transition.js"></script>
     <script src="../shared/topnav.js"></script>
   ========================================================= */

(function () {
  "use strict";

  const EXPERIENCES = [
    { id: "xp",     label: "Old-school OS", href: "../xp/" },
    { id: "readme", label: "Code repo",     href: "../readme/" },
    { id: "saas",   label: "SaaS product",  href: "../saas/" }
  ];

  // Detect current experience from pathname.
  function detectCurrent() {
    const p = window.location.pathname;
    if (p.indexOf("/xp/")     !== -1) return "xp";
    if (p.indexOf("/readme/") !== -1) return "readme";
    if (p.indexOf("/saas/")   !== -1) return "saas";
    return null;
  }

  // 3x3 sticker grid. Per-experience palette comes from CSS via data-exp.
  function makeCubeMark() {
    let s = "";
    for (let i = 0; i < 9; i++) s += "<i></i>";
    return s;
  }

  function render() {
    if (document.getElementById("v1-topnav")) return; // already injected
    document.body.classList.add("v1-has-topnav");

    const currentId = detectCurrent();

    const nav = document.createElement("nav");
    nav.id = "v1-topnav";
    nav.className = "v1-topnav";
    nav.setAttribute("aria-label", "Experience switcher");

    // ---- Left: back-to-setup ----
    const left = document.createElement("div");
    left.className = "v1-topnav-left";

    const setup = document.createElement("a");
    setup.className = "v1-topnav-setup";
    setup.href = "../";
    setup.setAttribute("aria-label", "Back to the Setup wizard");
    setup.innerHTML =
      '<span class="v1-topnav-setup-arrow" aria-hidden="true">' +
        // Left arrow, stroked, matches body text colour.
        '<svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">' +
          '<path d="M10 3L5 8l5 5"/>' +
        '</svg>' +
      '</span>' +
      '<span class="v1-topnav-setup-label">Setup</span>';
    setup.addEventListener("click", (ev) => {
      ev.preventDefault();
      navTo("../");
    });
    left.appendChild(setup);
    nav.appendChild(left);

    // ---- Right: tab strip ----
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
          // Same experience — scroll to top as a gentle affordance.
          try { window.scrollTo({ top: 0, behavior: "smooth" }); }
          catch (_e) { window.scrollTo(0, 0); }
          return;
        }
        navTo(exp.href);
      });

      tabs.appendChild(btn);
    });
    nav.appendChild(tabs);

    document.body.insertBefore(nav, document.body.firstChild);
  }

  function navTo(url) {
    if (window.V1Transition && typeof window.V1Transition.go === "function") {
      window.V1Transition.go(url);
    } else {
      window.location.href = url;
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", render);
  } else {
    render();
  }
})();
