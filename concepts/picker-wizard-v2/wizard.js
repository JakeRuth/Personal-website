/* =========================================================
   Jake Ruth Setup Wizard v2 - Picker
   Vanilla JS, no build step. Larger window. No faux desktop.
   ========================================================= */

(function () {
  "use strict";

  // ---- Experience catalog ----
  // Slugs line up with the directories the picker can redirect to.
  // readme-git-fusion is the new fused README/git-log experience.
  const EXPERIENCES = [
    {
      id: "xp-luna",
      name: "XP Luna",
      tag: "The nostalgic one",
      desc: "Windows XP Luna desktop. Start menu, Bliss hill, the works. Icons you can double-click.",
      thumbClass: "thumb-xp",
      path: "../xp-luna-v2/",
      previewFoot: "deps: luna.dll, clippy.com"
    },
    {
      id: "enterprise-saas",
      name: "Enterprise SaaS",
      tag: "The dev tool one",
      desc: "Modern landing page. Pricing cards, feature grid, keynote polish. Very 2026.",
      thumbClass: "thumb-saas",
      path: "../enterprise-saas-v2/",
      previewFoot: "deps: inter.woff2, restraint"
    },
    {
      id: "readme-git",
      name: "README / Git Log",
      tag: "The engineer one",
      desc: "Career as one long README with a git log of the decade behind it. Markdown, commits, diffs.",
      thumbClass: "thumb-readme-git",
      path: "../readme-git-fusion/",
      previewFoot: "deps: monospace, conviction"
    },
    {
      id: "readme",
      name: "README (plain)",
      tag: "The fallback one",
      desc: "Single long-form README. No git ceremony, just the facts. Lightweight, screen-reader friendly.",
      thumbClass: "thumb-readme",
      path: "../readme-mode/",
      previewFoot: "deps: markdown, patience"
    },
    {
      id: "vista",
      name: "Vista",
      tag: "The glass one",
      desc: "Aero glass, blur, transparency, the full 2007 Frutiger dream. Now with working chrome.",
      thumbClass: "thumb-vista",
      path: "../vista-faithful-v3/",
      previewFoot: "deps: 4GB of RAM"
    }
  ];

  // ---- State ----
  const state = {
    step: 0,        // 0..3 (Welcome, Choose, Confirm, Launching)
    selectedId: "xp-luna",
    focusedIdx: 0,
    advancedOpen: false,
    advancedPrefs: {
      cube: true,
      audio: false,
      dark: false,
      crt: false,
      reducedMotion: false,
      konami: true
    },
    launching: false,
    launchCancelled: false
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

  function bigCube() {
    return (
      '<div class="bigcube">' +
      '<i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i>' +
      "</div>"
    );
  }

  function bannerCube() {
    return (
      '<div class="banner-cube">' +
      '<i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i>' +
      "</div>"
    );
  }

  function banner(h1, h2) {
    return (
      '<div class="banner">' +
      '<div class="banner-text">' +
      '<div class="h1">' + escapeHtml(h1) + "</div>" +
      '<div class="h2">' + escapeHtml(h2) + "</div>" +
      "</div>" +
      bannerCube() +
      "</div>"
    );
  }

  // ---- Step renderers ----
  function renderWelcome() {
    return (
      '<div class="splash">' +
        '<div class="sideart">' +
          bigCube() +
          '<div class="stampline">jakeruth.exe &bull; v13.0 &bull; 2026</div>' +
        "</div>" +
        '<div class="main">' +
          "<h1>Welcome to Jake Ruth Setup</h1>" +
          '<p>This wizard will configure your Jake Ruth experience. Total install time: fewer than three minutes. Disk space required: about the same as a PDF resume.</p>' +
          '<p class="dim">Thirteen years shipping. One chapter ending, another beginning. Pick the flavor you want on the other side.</p>' +
          '<p class="dim">Click <strong>Next &gt;</strong> to continue, or <strong>Cancel</strong> to exit Setup.</p>' +
          '<div class="version">build 20260420.2 &middot; multi-experience edition</div>' +
        "</div>" +
      "</div>"
    );
  }

  function renderPicker() {
    const rows = EXPERIENCES.map((e, idx) => (
      '<label class="mode-option' + (idx === state.focusedIdx ? " focused" : "") + '" data-idx="' + idx + '" data-id="' + e.id + '">' +
        '<input type="radio" name="experience" value="' + e.id + '"' +
          (state.selectedId === e.id ? " checked" : "") + " />" +
        '<span class="mode-body">' +
          '<span class="mode-head">' + escapeHtml(e.name) +
            '<span class="mode-tag">- ' + escapeHtml(e.tag) + "</span>" +
          "</span>" +
          '<span class="mode-desc">' + escapeHtml(e.desc) + "</span>" +
        "</span>" +
      "</label>"
    )).join("");

    const sel = getExperience(state.selectedId);

    const advancedPanel = (
      '<div class="advanced-panel"' + (state.advancedOpen ? "" : " hidden") + ' id="advanced-panel">' +
        '<div class="adv-grid">' +
          advBox("cube", "Rubik's cube ambient") +
          advBox("audio", "Audio / startup sound") +
          advBox("dark", "Dark mode (where supported)") +
          advBox("crt", "CRT scanlines") +
          advBox("reducedMotion", "Reduce motion") +
          advBox("konami", "Konami code Easter egg") +
        "</div>" +
        '<div class="adv-note">Cosmetic, saved locally, nothing tracked.</div>' +
      "</div>"
    );

    return (
      banner("Choose Your Experience", "Select the flavor of jakeruth.com to install.") +
      '<div class="content">' +
        "<h2>Experience mode</h2>" +
        '<p class="dim">Same voice, different chrome. Pick one. You can always come back.</p>' +
        '<div class="mode-split">' +
          '<div class="mode-list" id="mode-list" role="radiogroup" aria-label="Experience mode">' +
            rows +
          "</div>" +
          '<div class="preview" id="preview-pane">' +
            '<div class="preview-title">' + escapeHtml(sel.name) + "</div>" +
            '<div class="preview-stage"><div class="thumb ' + sel.thumbClass + '"></div></div>' +
            '<div class="preview-footline">' + escapeHtml(sel.previewFoot) + "</div>" +
          "</div>" +
        "</div>" +
        '<span class="advanced-toggle" id="advanced-toggle">' +
          (state.advancedOpen ? "&laquo; Hide advanced options" : "Advanced options...") +
        "</span>" +
        advancedPanel +
      "</div>"
    );
  }

  function advBox(key, label) {
    const checked = state.advancedPrefs[key] ? " checked" : "";
    return (
      "<label>" +
        '<input type="checkbox" data-adv="' + key + '"' + checked + " /> " +
        escapeHtml(label) +
      "</label>"
    );
  }

  function renderConfirm() {
    const sel = getExperience(state.selectedId);
    const advSummary = summarizeAdvanced();
    return (
      banner("Confirm Installation", "Review your choices before launch.") +
      '<div class="content">' +
        "<h2>You chose <strong>" + escapeHtml(sel.name) + "</strong>. Ready to launch?</h2>" +
        '<p class="dim">Setup has enough information to begin installation. Review the summary below.</p>' +
        '<div class="confirm-card">' +
          row("Experience", sel.name + " - " + sel.tag) +
          row("Target path", sel.path) +
          row("Install size", "~1 career") +
          row("Advanced", advSummary) +
        "</div>" +
        '<p class="dim">Click <strong>Launch Jake</strong> to proceed, or <strong>&lt; Back</strong> to change your selection.</p>' +
      "</div>"
    );
  }

  function row(k, v) {
    return (
      '<div class="cfg-row">' +
        '<span class="cfg-key">' + escapeHtml(k) + "</span>" +
        '<span class="cfg-val">' + escapeHtml(v) + "</span>" +
      "</div>"
    );
  }

  function summarizeAdvanced() {
    const enabled = [];
    const labels = {
      cube: "Cube ambient",
      audio: "Audio",
      dark: "Dark mode",
      crt: "CRT",
      reducedMotion: "Reduced motion",
      konami: "Konami"
    };
    Object.keys(state.advancedPrefs).forEach((k) => {
      if (state.advancedPrefs[k]) enabled.push(labels[k]);
    });
    return enabled.length ? enabled.join(", ") : "Defaults";
  }

  function renderLaunch() {
    const sel = getExperience(state.selectedId);
    return (
      banner("Installing jakeruth.exe", "Please wait while Setup launches your experience.") +
      '<div class="content">' +
        "<h2>Launching " + escapeHtml(sel.name) + "...</h2>" +
        '<p class="dim" id="launch-status">Starting services...</p>' +
        '<div class="progress-wrap"><div class="progress-bar" id="launch-bar"></div></div>' +
        '<div class="logbox" id="launch-log" aria-live="polite"></div>' +
      "</div>"
    );
  }

  // ---- Render ----
  function render() {
    const steps = [renderWelcome, renderPicker, renderConfirm, renderLaunch];
    body.innerHTML = steps[state.step]();
    stepNum.textContent = String(state.step + 1);
    footerHint.innerHTML = "Step <span id=\"step-num\">" + (state.step + 1) + "</span> of 4";

    // Wire buttons
    btnBack.disabled = state.step === 0 || state.launching;
    btnCancel.disabled = state.launching;

    if (state.step === 2) {
      btnNext.textContent = "Launch Jake";
    } else if (state.step === 3) {
      btnNext.textContent = "Finish";
      btnNext.disabled = true;
    } else {
      btnNext.textContent = "Next >";
      btnNext.disabled = false;
    }

    // Step-specific wiring
    if (state.step === 1) wirePicker();
    if (state.step === 3) startLaunch();
  }

  // ---- Picker wiring ----
  function wirePicker() {
    const list = document.getElementById("mode-list");
    if (!list) return;

    list.querySelectorAll(".mode-option").forEach((el) => {
      el.addEventListener("click", () => {
        const id = el.getAttribute("data-id");
        const idx = Number(el.getAttribute("data-idx"));
        selectMode(id, idx);
      });
      el.addEventListener("dblclick", () => {
        const id = el.getAttribute("data-id");
        const idx = Number(el.getAttribute("data-idx"));
        selectMode(id, idx);
        next();
      });
    });

    const adv = document.getElementById("advanced-toggle");
    adv.addEventListener("click", () => {
      state.advancedOpen = !state.advancedOpen;
      render();
    });

    document.querySelectorAll('input[data-adv]').forEach((input) => {
      input.addEventListener("change", () => {
        const key = input.getAttribute("data-adv");
        state.advancedPrefs[key] = input.checked;
      });
    });
  }

  function selectMode(id, idx) {
    state.selectedId = id;
    state.focusedIdx = idx != null
      ? idx
      : EXPERIENCES.findIndex((e) => e.id === id);
    updatePicker();
  }

  function updatePicker() {
    const list = document.getElementById("mode-list");
    if (!list) return;
    list.querySelectorAll(".mode-option").forEach((el) => {
      const id = el.getAttribute("data-id");
      const idx = Number(el.getAttribute("data-idx"));
      const radio = el.querySelector('input[type="radio"]');
      if (radio) radio.checked = (id === state.selectedId);
      el.classList.toggle("focused", idx === state.focusedIdx);
    });
    const sel = getExperience(state.selectedId);
    const pane = document.getElementById("preview-pane");
    if (pane) {
      pane.innerHTML =
        '<div class="preview-title">' + escapeHtml(sel.name) + "</div>" +
        '<div class="preview-stage"><div class="thumb ' + sel.thumbClass + '"></div></div>' +
        '<div class="preview-footline">' + escapeHtml(sel.previewFoot) + "</div>";
    }
  }

  // ---- Launch sequence ----
  function startLaunch() {
    if (state.launching) return;
    state.launching = true;
    state.launchCancelled = false;

    btnBack.disabled = true;
    btnCancel.disabled = false; // stay cancellable up until redirect

    const bar = document.getElementById("launch-bar");
    const statusEl = document.getElementById("launch-status");
    const logEl = document.getElementById("launch-log");
    const sel = getExperience(state.selectedId);

    const steps = [
      { pct: 12, status: "Starting services...", log: "svc/setup      -> ready" },
      { pct: 28, status: "Mounting career...",   log: "mount /career  -> ok" },
      { pct: 44, status: "Resolving dependencies...", log: "resolve 13yrs -> ok" },
      { pct: 60, status: "Registering cube drivers...", log: "cube.sys      -> loaded" },
      { pct: 76, status: "Configuring " + sel.name + "...", log: "apply " + sel.id + " -> ok" },
      { pct: 92, status: "Finalizing...",         log: "opinion.dll   -> loaded" },
      { pct: 100, status: "OK. Redirecting.",     log: "redirect " + sel.path }
    ];

    let i = 0;
    function tick() {
      if (state.launchCancelled) return;
      if (i >= steps.length) {
        setTimeout(() => {
          if (!state.launchCancelled) {
            window.location.href = sel.path;
          }
        }, 350);
        return;
      }
      const s = steps[i++];
      bar.style.width = s.pct + "%";
      statusEl.textContent = s.status;
      const line = document.createElement("div");
      line.className = "ln " + (s.pct === 100 ? "ok" : "note");
      line.textContent = "[" + padPct(s.pct) + "] " + s.log;
      logEl.appendChild(line);
      logEl.scrollTop = logEl.scrollHeight;
      setTimeout(tick, 280 + Math.random() * 180);
    }

    [
      "jakeruth.exe v13.0 - Multi-Experience Edition",
      "(C) 2026 Jake Ruth. Pick the mode. Read the code.",
      ""
    ].forEach((t) => {
      const d = document.createElement("div");
      d.className = "ln note";
      d.textContent = t;
      logEl.appendChild(d);
    });

    setTimeout(tick, 250);
  }

  function padPct(n) {
    const s = String(n);
    return s.length === 1 ? "  " + s : (s.length === 2 ? " " + s : s);
  }

  // ---- Nav ----
  function next() {
    if (state.step < 3) {
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
      if (ev.key === "ArrowDown" || ev.key === "ArrowRight") {
        state.focusedIdx = (state.focusedIdx + 1) % EXPERIENCES.length;
        state.selectedId = EXPERIENCES[state.focusedIdx].id;
        updatePicker();
        ev.preventDefault();
        return;
      }
      if (ev.key === "ArrowUp" || ev.key === "ArrowLeft") {
        state.focusedIdx = (state.focusedIdx - 1 + EXPERIENCES.length) % EXPERIENCES.length;
        state.selectedId = EXPERIENCES[state.focusedIdx].id;
        updatePicker();
        ev.preventDefault();
        return;
      }
    }

    if (ev.key === "Enter") {
      if (state.step < 3) {
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
  state.focusedIdx = Math.max(0, EXPERIENCES.findIndex((e) => e.id === state.selectedId));
  render();
})();
