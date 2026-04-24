/* Jake Ruth Setup Wizard. Three steps:
     1. Welcome (InstallShield sideart + pitch copy)
     2. Pick an experience
     3. Brief "Booting…" dwell, then TransitionCube.playTransition
        hands off to the destination page via sessionStorage so the
        arrival half plays on the new page. */

(function () {
  "use strict";

  // ---- Experience catalog ----
  const EXPERIENCES = [
    {
      id: "xp",
      name: "Old-school OS",
      desc: "Teal desktop, green Start button, windows that snap.",
      mockupClass: "mockup-xp",
      path: "./xp/"
    },
    {
      id: "readme",
      name: "Code repo",
      desc: "README on the right, commit log running down the side.",
      mockupClass: "mockup-repo",
      path: "./readme/"
    },
    {
      id: "saas",
      name: "SaaS product",
      desc: "Marketing site chrome. Sparklines, pricing grid, the works.",
      mockupClass: "mockup-saas",
      path: "./saas/"
    }
  ];

  // ---- State ----
  const state = {
    step: 0,              // 0..2
    focusedIdx: 0,
    selectedId: null,
    launching: false,
    loadingTimer: null
  };

  // ---- DOM refs ----
  const body = document.getElementById("wizard-body");
  const btnNext = document.getElementById("btn-next");
  const btnBack = document.getElementById("btn-back");
  const btnCancel = document.getElementById("btn-cancel");
  const tbClose = document.getElementById("tb-close");
  const stepIndicator = document.getElementById("step-indicator");
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

  // ---- Mockup renderers ----
  function mockupXP() {
    return (
      '<div class="mockup mockup-xp">' +
        '<div class="xp-desktop">' +
          '<div class="xp-icon"></div>' +
          '<div class="xp-window">' +
            '<div class="xp-titlebar">My Computer</div>' +
            '<div class="xp-body">' +
              '<div class="xp-row"></div>' +
              '<div class="xp-row short"></div>' +
              '<div class="xp-row"></div>' +
            '</div>' +
          '</div>' +
          '<div class="xp-taskbar">' +
            '<div class="xp-start">start</div>' +
          '</div>' +
        '</div>' +
      '</div>'
    );
  }

  function mockupRepo() {
    return (
      '<div class="mockup mockup-repo">' +
        '<div class="gh-header"></div>' +
        '<div class="gh-split">' +
          '<div class="gh-tree">' +
            '<div class="gh-file"></div>' +
            '<div class="gh-file sub"></div>' +
            '<div class="gh-file sub"></div>' +
            '<div class="gh-file"></div>' +
            '<div class="gh-file sub"></div>' +
            '<div class="gh-file"></div>' +
          '</div>' +
          '<div class="gh-log">' +
            '<div class="gh-commit"><span class="gh-dot"></span><span class="gh-line"></span></div>' +
            '<div class="gh-commit"><span class="gh-dot branch"></span><span class="gh-line"></span></div>' +
            '<div class="gh-commit"><span class="gh-dot"></span><span class="gh-line short"></span></div>' +
            '<div class="gh-commit"><span class="gh-dot"></span><span class="gh-line"></span></div>' +
            '<div class="gh-commit"><span class="gh-dot branch"></span><span class="gh-line short"></span></div>' +
          '</div>' +
        '</div>' +
      '</div>'
    );
  }

  function mockupSaaS() {
    return (
      '<div class="mockup mockup-saas">' +
        '<div class="saas-nav">' +
          '<div class="saas-logo"></div>' +
          '<div class="saas-navitems"><i></i><i></i><i></i></div>' +
        '</div>' +
        '<div class="saas-card">' +
          '<div class="saas-kpi"></div>' +
          '<svg class="saas-spark" viewBox="0 0 100 30" preserveAspectRatio="none">' +
            '<polyline points="0,22 14,18 26,20 40,12 54,14 66,7 80,9 100,3"/>' +
          '</svg>' +
        '</div>' +
        '<div class="saas-pricing">' +
          '<div class="saas-tier"></div>' +
          '<div class="saas-tier accent"></div>' +
          '<div class="saas-tier"></div>' +
        '</div>' +
      '</div>'
    );
  }

  function mockupFor(id) {
    if (id === "xp") return mockupXP();
    if (id === "readme") return mockupRepo();
    if (id === "saas") return mockupSaaS();
    return "";
  }

  // Side-banner: InstallShield-style "What's in the box" +
  // "System requirements" bullet content.
  function renderSideart() {
    return (
      '<div class="sideart-variant">' +
        '<div class="sideart-col">' +
          '<div class="sideart-wordmark">JAKE RUTH <span class="wm-v">v13.0</span></div>' +
          '<div class="sideart-rule-h" aria-hidden="true"></div>' +

          '<div class="sideart-heading">What&rsquo;s in the box</div>' +
          '<ul class="sideart-list">' +
            '<li>13 years shipping</li>' +
            '<li>1 YC-backed company (W22)</li>' +
            '<li>1 Rubik&rsquo;s cube (13.95s avg)</li>' +
            '<li>8 former employees</li>' +
            '<li>0 tolerance for bad software</li>' +
          '</ul>' +

          '<div class="sideart-heading">System requirements</div>' +
          '<ul class="sideart-list">' +
            '<li>A team that ships</li>' +
            '<li>8GB intellectual curiosity</li>' +
            '<li>Git installed</li>' +
            '<li>Tolerance for directness</li>' +
            '<li>Rec: a hard problem</li>' +
          '</ul>' +

          '<div class="sideart-footer">' +
            '<span class="sideart-stamp">setup.exe</span>' +
          '</div>' +
        '</div>' +
      '</div>'
    );
  }

  // ---- Step renderers ----
  function renderWelcome() {
    return (
      '<div class="welcome">' +
        '<div class="sideart" aria-hidden="true">' +
          renderSideart() +
        '</div>' +
        '<div class="welcome-main">' +
          '<div class="welcome-mark" aria-hidden="true">' +
            '<span class="wm-sq wm-a"></span>' +
            '<span class="wm-sq wm-b"></span>' +
            '<span class="wm-sq wm-c"></span>' +
          '</div>' +
          '<h1>Jake Ruth Setup</h1>' +
          '<p class="welcome-sub">Takes about two seconds. Pick your flow through.</p>' +
          '<p class="welcome-body">All three ship the same Jake. Just different chrome.</p>' +
        '</div>' +
      '</div>'
    );
  }

  function renderPicker() {
    const cards = EXPERIENCES.map((e, idx) => {
      const isSelected = state.selectedId === e.id;
      const isFocused = idx === state.focusedIdx;
      const classes = ["exp-card"];
      if (isFocused) classes.push("focused");
      if (isSelected) classes.push("selected");
      return (
        '<button type="button" class="' + classes.join(" ") + '"' +
          ' data-idx="' + idx + '" data-id="' + e.id + '"' +
          ' role="radio" aria-checked="' + (isSelected ? "true" : "false") + '"' +
          ' aria-label="' + escapeHtml(e.name) + '">' +
          '<span class="sel-badge" aria-hidden="true">&#10003;</span>' +
          '<div class="exp-mockup">' + mockupFor(e.id) + '</div>' +
          '<div class="exp-label">' + escapeHtml(e.name) + '</div>' +
          '<div class="exp-desc">' + escapeHtml(e.desc) + '</div>' +
        '</button>'
      );
    }).join("");

    return (
      '<div class="picker">' +
        '<div class="picker-head">' +
          '<h2>Choose your experience</h2>' +
          '<p class="dim">Pick one, then hit Next. Same voice, different chrome.</p>' +
        '</div>' +
        '<div class="exp-grid" id="exp-grid" role="radiogroup" aria-label="Experience">' +
          cards +
        '</div>' +
        '<p class="picker-foot dim">Arrow keys to browse. Enter to pick and launch. Double-click to skip Next.</p>' +
      '</div>'
    );
  }

  // ---- Render orchestration ----
  function render() {
    const steps = [renderWelcome, renderPicker, renderLoading];
    body.innerHTML = steps[state.step]();
    stepIndicator.textContent = (state.step + 1) + " / 3";

    // Footer buttons differ by step.
    if (state.step === 0) {
      btnBack.hidden = false;
      btnBack.disabled = true;
      btnNext.hidden = false;
      btnNext.disabled = false;
      btnNext.textContent = "Next >";
      btnCancel.hidden = false;
      btnCancel.disabled = false;
    } else if (state.step === 1) {
      btnBack.hidden = false;
      btnBack.disabled = false;
      btnNext.hidden = false;
      btnNext.disabled = state.selectedId === null;
      btnNext.textContent = "Next >";
      btnCancel.hidden = false;
      btnCancel.disabled = false;
    } else {
      // step 2 — loading. No Back/Next, Cancel still available.
      btnBack.hidden = false;
      btnBack.disabled = true;
      btnNext.hidden = false;
      btnNext.disabled = true;
      btnNext.textContent = "Launching…";
      btnCancel.hidden = false;
      btnCancel.disabled = false;
    }

    if (state.step === 1) wirePicker();
    if (state.step === 2) startLoading();
  }

  // ---- Step 3: loading screen ----
  // Shows a brief "Booting…" moment with spinner + progress bar, then
  // hands off to the cube transition. No text message about nav —
  // nav guidance lives in the on-arrival onboarding pulse.
  function renderLoading() {
    const sel = getExperience(state.selectedId) || EXPERIENCES[0];
    return (
      '<div class="loading">' +
        '<div class="loading-stack">' +
          '<div class="loading-spinner" aria-hidden="true">' +
            '<span></span><span></span><span></span>' +
          '</div>' +
          '<h2>Booting your Jake Ruth experience&hellip;</h2>' +
          '<div class="progress-wrap" aria-hidden="true">' +
            '<div class="progress-bar" id="progress-bar"></div>' +
          '</div>' +
          '<p class="loading-dest dim">Destination: <code>' + escapeHtml(sel.path) + '</code></p>' +
        '</div>' +
      '</div>'
    );
  }

  function startLoading() {
    if (state.loadingTimer) clearTimeout(state.loadingTimer);
    // Progress bar visual: animate from 0 to 100% over ~800ms
    const bar = document.getElementById("progress-bar");
    if (bar) {
      requestAnimationFrame(() => {
        bar.style.transition = "width 820ms linear";
        bar.style.width = "100%";
      });
    }
    // After a brief dwell, fire the cube transition. The transition
    // overlay covers the wizard chrome and handles navigation.
    state.loadingTimer = setTimeout(triggerTransition, 900);
  }

  function triggerTransition() {
    if (state.selectedId === null) return;
    const destinationUrl = getExperience(state.selectedId).path;
    try {
      window.TransitionCube.playTransition({ destinationUrl });
    } catch (_e) {
      window.location.href = destinationUrl;
    }
  }

  // ---- Picker wiring ----
  function wirePicker() {
    const grid = document.getElementById("exp-grid");
    if (!grid) return;
    grid.querySelectorAll(".exp-card").forEach((el) => {
      el.addEventListener("click", () => {
        const id = el.getAttribute("data-id");
        const idx = Number(el.getAttribute("data-idx"));
        state.focusedIdx = idx;
        selectId(id);
      });
      el.addEventListener("dblclick", () => {
        const id = el.getAttribute("data-id");
        selectId(id);
        launchSelected();
      });
      el.addEventListener("mouseenter", () => {
        const idx = Number(el.getAttribute("data-idx"));
        setFocused(idx);
      });
    });
  }

  function setFocused(idx) {
    state.focusedIdx = idx;
    document.querySelectorAll(".exp-card").forEach((el) => {
      const i = Number(el.getAttribute("data-idx"));
      el.classList.toggle("focused", i === idx);
    });
  }

  function selectId(id) {
    state.selectedId = id;
    document.querySelectorAll(".exp-card").forEach((el) => {
      const isSel = el.getAttribute("data-id") === id;
      el.classList.toggle("selected", isSel);
      el.setAttribute("aria-checked", isSel ? "true" : "false");
    });
    btnNext.disabled = state.selectedId === null;
  }

  // ---- Launch: go to loading step (step 3), which in turn triggers the transition ----
  function launchSelected() {
    if (state.selectedId === null || state.launching) return;
    state.launching = true;
    state.step = 2;
    render();
  }

  function abortLaunch() {
    state.launching = false;
    if (state.loadingTimer) {
      clearTimeout(state.loadingTimer);
      state.loadingTimer = null;
    }
  }

  // ---- Nav buttons ----
  btnNext.addEventListener("click", () => {
    if (state.step === 0) {
      state.step = 1;
      render();
      return;
    }
    if (state.step === 1) {
      launchSelected();
      return;
    }
    // step 2 (loading) — Next is disabled, nothing to do
  });

  btnBack.addEventListener("click", () => {
    if (state.step === 1) {
      state.step = 0;
      render();
    }
  });

  btnCancel.addEventListener("click", openCancel);
  tbClose.addEventListener("click", openCancel);

  cancelYes.addEventListener("click", () => {
    hideModal("modal-cancel");
    abortLaunch();
    state.step = 0;
    state.selectedId = null;
    state.focusedIdx = 0;
    render();
  });

  document.querySelectorAll("[data-close-modal]").forEach((el) => {
    el.addEventListener("click", () => hideModal(el.getAttribute("data-close-modal")));
  });

  function openCancel() { showModal("modal-cancel"); }
  function showModal(id) { document.getElementById(id).hidden = false; }
  function hideModal(id) { document.getElementById(id).hidden = true; }

  // ---- Keyboard nav ----
  document.addEventListener("keydown", (ev) => {
    if (!modalCancel.hidden) {
      if (ev.key === "Escape") {
        hideModal("modal-cancel");
        ev.preventDefault();
      }
      return;
    }

    if (ev.key === "Escape") {
      openCancel();
      ev.preventDefault();
      return;
    }

    if (state.step === 0) {
      if (ev.key === "Enter") {
        state.step = 1;
        render();
        ev.preventDefault();
      }
      return;
    }

    if (state.step === 1) {
      if (ev.key === "ArrowRight" || ev.key === "ArrowDown") {
        setFocused((state.focusedIdx + 1) % EXPERIENCES.length);
        ev.preventDefault();
        return;
      }
      if (ev.key === "ArrowLeft" || ev.key === "ArrowUp") {
        setFocused((state.focusedIdx - 1 + EXPERIENCES.length) % EXPERIENCES.length);
        ev.preventDefault();
        return;
      }
      if (ev.key === "Enter") {
        selectId(EXPERIENCES[state.focusedIdx].id);
        launchSelected();
        ev.preventDefault();
        return;
      }
      if (ev.key === " ") {
        selectId(EXPERIENCES[state.focusedIdx].id);
        ev.preventDefault();
        return;
      }
      if (ev.key === "Backspace") {
        state.step = 0;
        render();
        ev.preventDefault();
        return;
      }
    }
  });

  // ---- Initial render ----
  render();
})();
