/* Shared top-nav auto-injected on every experience page.
   [ JR logo + "Jake Ruth" ]     [ Old-school OS | Code repo | SaaS product ]

   Behavior:
   - Auto-detects the current experience from the URL pathname.
   - Clicking the JR brand plays the cube transition back to the wizard.
   - Clicking a non-current tab plays the cube transition + navigates.
   - Clicking the current tab smooth-scrolls to top.

   Onboarding cue (fires on every page load):
   - Non-current tabs pulse and a small pill appears under the nav
     reading "Three ways to read Jake. Switch up top anytime."
   - prefers-reduced-motion: pill renders statically, pulse suppressed. */

(function () {
  "use strict";

  // Hrefs are relative to an experience page at /<exp>/index.html.
  const EXPERIENCES = [
    { id: "xp",     label: "Old-school OS", href: "../xp/" },
    { id: "readme", label: "Code repo",     href: "../readme/" },
    { id: "saas",   label: "SaaS product",  href: "../saas/" }
  ];

  const DEFAULT_LOGO_SRC = "/images/logo.gif";
  const DEFAULT_SETUP_HREF = "../";

  // Arrival-half cube animation runs ~700ms. Wait past that plus a
  // short settle window before we cue the user toward the nav.
  const ONBOARDING_DELAY_MS = 900;
  const ONBOARDING_FADE_IN_MS = 300;  // pill fade-in offset after cue begins
  const ONBOARDING_GLOW_MS = 3400;    // nav-wide glow + tab pulse duration
  const ONBOARDING_FLAG = "jrPillDismissed"; // sessionStorage gate

  const DEFAULT_ONBOARDING_TEXT = "Three ways to read Jake. Switch up top anytime.";

  const reduceMotion = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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
    try {
      window.TransitionCube.playTransition({ destinationUrl: url });
    } catch (_e) {
      window.location.href = url;
    }
  }

  function render() {
    if (document.getElementById("topnav")) return; // already injected
    document.body.classList.add("has-topnav");

    const currentId = detectCurrent();

    // Outer host provides the dark-glass backdrop + the fixed bar layout.
    const host = document.createElement("div");
    host.id = "topnav";
    host.className = "topnav-host";

    const nav = document.createElement("nav");
    nav.className = "topnav";
    nav.setAttribute("aria-label", "Experience switcher");

    // -------- Left: JR logo + "Jake Ruth" (CONSTANT) --------
    const left = document.createElement("div");
    left.className = "topnav-left";

    const brand = document.createElement("a");
    brand.className = "topnav-brand";
    brand.href = DEFAULT_SETUP_HREF;
    brand.setAttribute("aria-label", "Jake Ruth, back to Setup");

    const logo = document.createElement("img");
    logo.className = "topnav-brand-logo";
    logo.src = DEFAULT_LOGO_SRC;
    logo.alt = "JR";
    logo.setAttribute("draggable", "false");

    const name = document.createElement("span");
    name.className = "topnav-brand-name";
    name.textContent = "Jake Ruth";

    brand.appendChild(logo);
    brand.appendChild(name);

    brand.addEventListener("click", (ev) => {
      ev.preventDefault();
      navTo(DEFAULT_SETUP_HREF);
    });

    left.appendChild(brand);
    nav.appendChild(left);

    // -------- Center: tab group --------
    const tabs = document.createElement("div");
    tabs.className = "topnav-tabs";
    tabs.setAttribute("role", "tablist");

    EXPERIENCES.forEach((exp) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "topnav-tab" + (exp.id === currentId ? " is-current" : "");
      btn.setAttribute("role", "tab");
      btn.setAttribute("aria-selected", exp.id === currentId ? "true" : "false");
      btn.setAttribute("data-exp", exp.id);
      if (exp.id === currentId) btn.setAttribute("aria-current", "page");

      btn.innerHTML =
        '<span class="topnav-mark" data-exp="' + exp.id + '" aria-hidden="true">' +
          makeCubeMark() +
        '</span>' +
        '<span class="topnav-label">' + exp.label + '</span>';

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

    host.appendChild(nav);
    document.body.insertBefore(host, document.body.firstChild);

    // -------- First-arrival onboarding cue --------
    scheduleOnboarding(nav, currentId);
  }

  function scheduleOnboarding(nav, currentId) {
    if (!currentId) return;

    // Speculation Rules / prerender: the page may be running invisibly
    // in the background before the user activates it. At that point
    // sessionStorage doesn't yet have a transition payload, which
    // would falsely look like a "direct URL load" and reset the gate.
    // Defer until the page is actually activated.
    if (document.prerendering === true) {
      document.addEventListener("prerenderingchange", function onActivate() {
        scheduleOnboarding(nav, currentId);
      }, { once: true });
      return;
    }

    // Show the pill on every fresh arrival. A "fresh arrival" is:
    //   - hard reload of this medium (navType === "reload"), OR
    //   - direct URL load with no transition payload (== user typed
    //     the URL or used a deep link).
    // Wizard arrivals are also fresh — wizard.js clears the flag
    // explicitly before navigating. In-app topnav clicks DO have a
    // payload and aren't reloads, so they preserve the flag.
    try {
      const navType = performance.getEntriesByType("navigation")[0]?.type;
      // In-app arrival = either the transition payload is still in
      // sessionStorage (we ran before initArrival) OR initArrival
      // already ran and set the window-level marker (we ran after).
      // Either signal alone misses one race; together they cover both.
      const isInAppArrival =
        !!sessionStorage.getItem("jrTransitionArrive") ||
        window.__jrInAppArrival === true;
      if (navType === "reload" || !isInAppArrival) {
        sessionStorage.removeItem(ONBOARDING_FLAG);
      }
      if (sessionStorage.getItem(ONBOARDING_FLAG) === "1") return;
      sessionStorage.setItem(ONBOARDING_FLAG, "1");
    } catch (_e) { /* ignore */ }

    setTimeout(() => runOnboarding(nav, currentId), ONBOARDING_DELAY_MS);
  }

  function runOnboarding(nav, currentId) {
    // 1. Nav-wide glow + a traveling tab pulse so the whole bar feels
    //    alive for a few seconds. (Auto-fades, doesn't need dismissal.)
    if (!reduceMotion) {
      nav.classList.add("is-onboarding-glow");
      nav.querySelectorAll(".topnav-tab").forEach((btn, i) => {
        btn.style.setProperty("--onboard-delay", (i * 0.12) + "s");
        btn.classList.add("is-onboarding-pulse");
      });
      setTimeout(() => {
        nav.classList.remove("is-onboarding-glow");
        nav.querySelectorAll(".topnav-tab.is-onboarding-pulse").forEach((btn) => {
          btn.classList.remove("is-onboarding-pulse");
          btn.style.removeProperty("--onboard-delay");
        });
      }, ONBOARDING_GLOW_MS);
    }

    // 2. Floating pill just below the nav. Stays until the user dismisses
    //    it — either via the X button or by clicking anywhere in the nav
    //    (brand or any tab). No auto-fade: the cube transition occludes
    //    the pill for ~1.5s, so any auto-timer could race and the user
    //    might miss the message entirely.
    const pill = document.createElement("div");
    pill.className = "topnav-onboarding-pill";
    pill.setAttribute("role", "status");
    pill.setAttribute("aria-live", "polite");
    pill.innerHTML =
      '<span class="topnav-onboarding-arrow" aria-hidden="true">&uarr;</span>' +
      '<span class="topnav-onboarding-text">' +
        escapeHtml(DEFAULT_ONBOARDING_TEXT) +
      '</span>' +
      '<button class="topnav-onboarding-close" type="button" aria-label="Dismiss">&times;</button>';

    document.body.appendChild(pill);

    function dismiss() {
      if (!pill.parentNode) return;
      pill.classList.remove("is-visible");
      pill.classList.add("is-leaving");
      setTimeout(() => { try { pill.remove(); } catch (_e) { /* ignore */ } }, 600);
    }

    pill.querySelector(".topnav-onboarding-close").addEventListener("click", dismiss);
    // Any click anywhere in the nav (brand or any tab) dismisses too.
    nav.addEventListener("click", dismiss, { once: true });

    if (reduceMotion) {
      pill.classList.add("is-visible", "is-static");
    } else {
      setTimeout(() => pill.classList.add("is-visible"), ONBOARDING_FADE_IN_MS);
    }
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    })[c]);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", render);
  } else {
    render();
  }
})();
