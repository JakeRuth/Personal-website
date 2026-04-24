/* =========================================================
   Jake Ruth Setup Wizard v3 - Typographic Picker
   Vanilla JS, no build step.

   Three steps:
     1. Welcome (no pixel Rubik's cube, clearer, faster feeling)
     2. Choose experience (combined select + confirm - click to launch)
     3. Loading -> redirect

   Step 2 uses pure-typography cards instead of mockup thumbnails.
   ========================================================= */

(function () {
  "use strict";

  // ---- Experience catalog ----
  // Three experiences only. Destinations point at v1 variants.
  // Per task spec: Old-school OS -> ../v1/xp/, Code repo -> ../v1/readme/,
  // SaaS product -> ../v1/saas/.
  const EXPERIENCES = [
    {
      id: "old-school-os",
      label: "OLD-SCHOOL OS",
      desc: "Windows chrome. Start menu. Bliss hill. A resume disguised as a desktop.",
      path: "../v1/xp/",
      cardClass: "card-os"
    },
    {
      id: "code-repo",
      label: "code repo",
      desc: "Career as a README with a git log underneath. Commits, diffs, receipts.",
      path: "../v1/readme/",
      cardClass: "card-repo"
    },
    {
      id: "saas-product",
      label: "SaaS Product",
      desc: "Hero, pricing cards, feature grid. The same person in 2026 clothes.",
      path: "../v1/saas/",
      cardClass: "card-saas"
    }
  ];

  const TOTAL_STEPS = 3;

  // ---- State ----
  const state = {
    step: 0,           // 0 = welcome, 1 = choose, 2 = loading
    focusedIdx: 0,     // keyboard focus ring on step 2
    launching: false,
    launchCancelled: false,
    selectedId: null
  };

  // ---- DOM refs ----
  const body = document.getElementById("wizard-body");
  const btnBack = document.getElementById("btn-back");
  const btnNext = document.getElementById("btn-next");
  const btnCancel = document.getElementById("btn-cancel");
  const tbClose = document.getElementById("tb-close");
  const stepNum = document.getElementById("step-num");
  const footerHint = document.getElementById("footer-hint");
  const modalCancel = document.getElementById("modal-cancel");
  const cancelYes = document.getElementById("cancel-yes");

  // ---- Helpers ----
  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    })[c]);
  }

  function getExperience(id) {
    return EXPERIENCES.find((e) => e.id === id) || EXPERIENCES[0];
  }

  // ---- Step renderers ----

  function renderWelcome() {
    // Simpler than v2. No pixel Rubik's cube.
    // Honest about what happens next: pick a flow, ~2 seconds to load.
    return (
      '<div class="welcome">' +
        '<div class="welcome-inner">' +
          '<div class="eyebrow">Jake Ruth &middot; setup</div>' +
          '<h1 class="welcome-title">Three interpretations of the same person.</h1>' +
          '<p class="welcome-sub">Pick the flow you want. Same voice, different chrome. Takes about two seconds to load.</p>' +
          '<p class="welcome-meta">Thirteen years shipping. One chapter ending, another beginning.</p>' +
          '<div class="welcome-foot">' +
            '<span class="welcome-build">build 20260420.T &middot; typographic edition</span>' +
          '</div>' +
        '</div>' +
      '</div>'
    );
  }

  function renderPicker() {
    // Combined select + confirm. Click a card to launch immediately.
    // Pure typography + color. No mockup thumbnails.
    const cards = EXPERIENCES.map((e, idx) => cardMarkup(e, idx)).join("");

    return (
      '<div class="picker-head">' +
        '<div class="picker-eyebrow">choose experience</div>' +
        '<h2 class="picker-title">Click one. It loads. Come back any time.</h2>' +
      '</div>' +
      '<div class="picker-grid" id="picker-grid" role="radiogroup" aria-label="Choose an experience">' +
        cards +
      '</div>' +
      '<p class="picker-help dim">Tip: arrow keys to move, Enter to launch.</p>'
    );
  }

  function cardMarkup(e, idx) {
    const focused = idx === state.focusedIdx ? " focused" : "";
    let labelMarkup = "";
    let decorMarkup = "";

    if (e.id === "old-school-os") {
      // Pixel/retro label. VT323. Chunky pixel window-frame decoration.
      labelMarkup =
        '<div class="card-label os-label">OLD-SCHOOL OS</div>';
      decorMarkup =
        '<div class="card-decor os-decor" aria-hidden="true">' +
          pixelWindowSvg() +
        '</div>';
    } else if (e.id === "code-repo") {
      // JetBrains Mono. Lowercase with trailing cursor block.
      labelMarkup =
        '<div class="card-label repo-label">code repo<span class="repo-cursor"></span></div>';
      decorMarkup =
        '<div class="card-decor repo-decor" aria-hidden="true">' +
          '<span class="repo-brace">{ }</span>' +
        '</div>';
    } else if (e.id === "saas-product") {
      // Inter Tight bold. Proper case. Sparkline decoration.
      labelMarkup =
        '<div class="card-label saas-label">SaaS Product</div>';
      decorMarkup =
        '<div class="card-decor saas-decor" aria-hidden="true">' +
          sparklineSvg() +
        '</div>';
    }

    return (
      '<button type="button" class="exp-card ' + e.cardClass + focused + '" ' +
        'data-idx="' + idx + '" data-id="' + e.id + '" ' +
        'role="radio" aria-checked="' + (focused ? "true" : "false") + '">' +
        decorMarkup +
        labelMarkup +
        '<div class="card-desc">' + escapeHtml(e.desc) + '</div>' +
        '<div class="card-cta"><span class="cta-arrow">&rarr;</span></div>' +
      '</button>'
    );
  }

  function pixelWindowSvg() {
    // Chunky pixel window frame, drawn with 4x4 "pixels" on a 10x8 grid.
    // Each <rect> is one pixel. Teal titlebar, white body.
    return (
      '<svg viewBox="0 0 40 32" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">' +
        // Outer frame (dark)
        '<rect x="0" y="0" width="40" height="32" fill="#1a3a3a"/>' +
        // Titlebar (teal) two rows tall
        '<rect x="2" y="2" width="36" height="8" fill="currentColor"/>' +
        // Body
        '<rect x="2" y="10" width="36" height="20" fill="#f4f2e8"/>' +
        // Close-button pixel cluster top right
        '<rect x="30" y="4" width="4" height="4" fill="#f4f2e8"/>' +
        // Two fake text rows
        '<rect x="6" y="14" width="20" height="2" fill="#2a2a2a"/>' +
        '<rect x="6" y="20" width="14" height="2" fill="#5a5a5a"/>' +
      '</svg>'
    );
  }

  function sparklineSvg() {
    // Simple up-and-to-the-right sparkline. No axis. No label.
    return (
      '<svg viewBox="0 0 60 24" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
        '<polyline points="2,18 12,14 20,16 30,10 40,12 50,5 58,3"/>' +
        '<circle cx="58" cy="3" r="2.2" fill="currentColor" stroke="none"/>' +
      '</svg>'
    );
  }

  function renderLoading() {
    const sel = getExperience(state.selectedId);
    return (
      '<div class="loading">' +
        '<div class="loading-inner">' +
          '<div class="loading-eyebrow">launching</div>' +
          '<div class="loading-target">' + escapeHtml(sel.label.trim()) + '</div>' +
          '<p class="loading-line">Three interpretations of the same person. Bounce between them anytime from the top nav.</p>' +
          '<div class="loading-bar"><div class="loading-bar-fill" id="loading-bar-fill"></div></div>' +
        '</div>' +
      '</div>'
    );
  }

  // ---- Render ----
  function render() {
    const steps = [renderWelcome, renderPicker, renderLoading];
    body.innerHTML = steps[state.step]();
    stepNum.textContent = String(state.step + 1);
    footerHint.innerHTML = 'Step <span id="step-num">' + (state.step + 1) + '</span> of ' + TOTAL_STEPS;

    btnBack.disabled = state.step === 0 || state.launching;
    btnCancel.disabled = state.launching;

    if (state.step === 0) {
      btnNext.textContent = "Next >";
      btnNext.disabled = false;
      btnNext.hidden = false;
    } else if (state.step === 1) {
      // Click-card-to-proceed on step 2. Next button is hidden to keep
      // the card-click path the single obvious action.
      btnNext.hidden = true;
    } else if (state.step === 2) {
      btnNext.hidden = true;
    }

    if (state.step === 1) wirePicker();
    if (state.step === 2) startLoading();
  }

  // ---- Step 2 wiring ----
  function wirePicker() {
    const grid = document.getElementById("picker-grid");
    if (!grid) return;

    grid.querySelectorAll(".exp-card").forEach((el) => {
      el.addEventListener("click", () => {
        const id = el.getAttribute("data-id");
        const idx = Number(el.getAttribute("data-idx"));
        chooseAndLaunch(id, idx);
      });
      el.addEventListener("mouseenter", () => {
        const idx = Number(el.getAttribute("data-idx"));
        focusIdx(idx);
      });
    });
  }

  function focusIdx(idx) {
    state.focusedIdx = idx;
    const grid = document.getElementById("picker-grid");
    if (!grid) return;
    grid.querySelectorAll(".exp-card").forEach((el) => {
      const elIdx = Number(el.getAttribute("data-idx"));
      el.classList.toggle("focused", elIdx === idx);
      el.setAttribute("aria-checked", elIdx === idx ? "true" : "false");
    });
  }

  function chooseAndLaunch(id, idx) {
    state.selectedId = id;
    state.focusedIdx = idx != null ? idx : 0;
    state.step = 2;
    render();
  }

  // ---- Loading sequence ----
  function startLoading() {
    if (state.launching) return;
    state.launching = true;
    state.launchCancelled = false;

    btnBack.disabled = true;
    btnCancel.disabled = false; // still cancellable until the redirect fires

    const sel = getExperience(state.selectedId);
    const bar = document.getElementById("loading-bar-fill");

    // Kick the bar off on the next frame so the CSS transition animates.
    requestAnimationFrame(() => {
      if (bar) bar.style.width = "100%";
    });

    // ~1.4 - 1.8s per spec. Pick a value in that window.
    const dwell = 1500;

    setTimeout(() => {
      if (state.launchCancelled) return;
      window.location.href = sel.path;
    }, dwell);
  }

  // ---- Nav ----
  function next() {
    if (state.step < TOTAL_STEPS - 1) {
      // On welcome, Next advances to the picker. On the picker, Next is
      // hidden; advancing happens via card click or keyboard Enter.
      state.step += 1;
      render();
    }
  }

  function back() {
    if (state.launching) return;
    if (state.step > 0) {
      state.step -= 1;
      render();
    }
  }

  function cancel() {
    showModal("modal-cancel");
  }

  function showModal(id) { document.getElementById(id).hidden = false; }
  function hideModal(id) { document.getElementById(id).hidden = true; }

  // ---- Global events ----
  btnNext.addEventListener("click", next);
  btnBack.addEventListener("click", back);
  btnCancel.addEventListener("click", cancel);
  tbClose.addEventListener("click", cancel);

  cancelYes.addEventListener("click", () => {
    hideModal("modal-cancel");
    state.launchCancelled = true;
    state.launching = false;
    state.step = 0;
    render();
  });

  document.querySelectorAll("[data-close-modal]").forEach((el) => {
    el.addEventListener("click", () => hideModal(el.getAttribute("data-close-modal")));
  });

  // Keyboard navigation
  document.addEventListener("keydown", (ev) => {
    if (!document.getElementById("modal-cancel").hidden) {
      if (ev.key === "Escape") {
        hideModal("modal-cancel");
        ev.preventDefault();
      }
      return;
    }

    if (ev.key === "Escape") {
      cancel();
      ev.preventDefault();
      return;
    }

    if (state.step === 1) {
      if (ev.key === "ArrowRight" || ev.key === "ArrowDown") {
        focusIdx((state.focusedIdx + 1) % EXPERIENCES.length);
        ev.preventDefault();
        return;
      }
      if (ev.key === "ArrowLeft" || ev.key === "ArrowUp") {
        focusIdx((state.focusedIdx - 1 + EXPERIENCES.length) % EXPERIENCES.length);
        ev.preventDefault();
        return;
      }
      if (ev.key === "Enter" || ev.key === " ") {
        const e = EXPERIENCES[state.focusedIdx];
        chooseAndLaunch(e.id, state.focusedIdx);
        ev.preventDefault();
        return;
      }
    }

    if (ev.key === "Enter") {
      if (state.step === 0) {
        next();
        ev.preventDefault();
      }
      return;
    }

    if (ev.key === "Backspace" && !isTypingTarget(ev.target)) {
      back();
      ev.preventDefault();
    }
  });

  function isTypingTarget(t) {
    if (!t) return false;
    const tag = (t.tagName || "").toLowerCase();
    return tag === "input" || tag === "textarea" || t.isContentEditable;
  }

  // ---- Initial render ----
  render();
})();
