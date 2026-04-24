/* =========================================================
   Jake Ruth Setup Wizard v4 - Three-Step Picker
   Vanilla JS, no build step.
   Flow:
     0: Welcome (InstallShield-style chrome, side-banner, chunky frame)
     1: Choose experience (mockup cards; click selects; Next advances)
     2: Loading (dwell ~1.5s then redirect)
   Key differences from v3:
     - Step 0 wears more old-school-installer chrome (side banner, menu bar).
     - Step 1 (the picker) no longer auto-commits on click. Card click =
       "selected" state. Next button enables. Next click advances.
       Double-click advances immediately. Enter on the focused card also
       selects AND advances. Arrow keys browse without selecting.
     - Back button added in the footer.
   ========================================================= */

(function () {
  "use strict";

  // ---- Experience catalog ----
  // Three options exactly, each with a mockup-style visual language.
  // Paths target the integrated v1 site.
  const EXPERIENCES = [
    {
      id: "xp",
      name: "Old-school OS",
      desc: "Teal desktop, green Start button, windows that snap.",
      mockupClass: "mockup-xp",
      path: "../v1/xp/"
    },
    {
      id: "readme",
      name: "Code repo",
      desc: "README on the right, commit log running down the side.",
      mockupClass: "mockup-repo",
      path: "../v1/readme/"
    },
    {
      id: "saas",
      name: "SaaS product",
      desc: "Marketing site chrome. Sparklines, pricing grid, the works.",
      mockupClass: "mockup-saas",
      path: "../v1/saas/"
    }
  ];

  // ---- State ----
  const state = {
    step: 0,            // 0..2
    focusedIdx: 0,      // which card is keyboard-focused on step 1
    selectedId: null,   // null until user picks on step 1
    launching: false,
    launchTimer: null
  };

  // ---- DOM refs ----
  const body = document.getElementById("wizard-body");
  const btnNext = document.getElementById("btn-next");
  const btnBack = document.getElementById("btn-back");
  const btnCancel = document.getElementById("btn-cancel");
  const tbClose = document.getElementById("tb-close");
  const stepIndicator = document.getElementById("step-indicator");
  const footerRight = document.getElementById("footer-right");
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
  // Each mockup is pure markup + CSS. Tiny faithful echoes of the
  // destination experience's visual language, so the card itself
  // is a preview, not a text label.
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

  // ---- Step renderers ----
  function renderWelcome() {
    // Two-column layout: InstallShield-ish sideart on the left,
    // content on the right.
    return (
      '<div class="welcome">' +
        '<div class="sideart" aria-hidden="true">' +
          '<div class="sideart-rule"></div>' +
          '<div class="sideart-stamp">setup.exe</div>' +
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
        '<p class="picker-foot dim">Arrow keys to browse. Enter to pick and continue. Double-click to skip Next.</p>' +
      '</div>'
    );
  }

  function renderLoading() {
    const sel = getExperience(state.selectedId);
    return (
      '<div class="loading">' +
        '<div class="loading-stack">' +
          '<div class="loading-spinner" aria-hidden="true">' +
            '<span></span><span></span><span></span>' +
          '</div>' +
          '<h2>Booting your Jake Ruth experience&hellip;</h2>' +
          '<p class="loading-msg">' +
            'Three interpretations of the same person. Bounce between them anytime from the top nav.' +
          '</p>' +
          '<div class="progress-wrap"><div class="progress-bar" id="load-bar"></div></div>' +
          '<p class="loading-dest dim">Destination: <code>' + escapeHtml(sel.path) + '</code></p>' +
        '</div>' +
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
      // Next is disabled until the user selects a card.
      btnNext.disabled = state.selectedId === null;
      btnNext.textContent = "Next >";
      btnCancel.hidden = false;
      btnCancel.disabled = false;
    } else {
      // Loading step: Back is disabled (same chrome, no accidental return).
      btnBack.hidden = false;
      btnBack.disabled = true;
      btnNext.hidden = true;
      btnCancel.hidden = false;
      btnCancel.disabled = false;
    }

    // Step-specific wiring.
    if (state.step === 1) wirePicker();
    if (state.step === 2) startLoading();
  }

  // ---- Picker wiring ----
  function wirePicker() {
    const grid = document.getElementById("exp-grid");
    if (!grid) return;
    grid.querySelectorAll(".exp-card").forEach((el) => {
      el.addEventListener("click", () => {
        const id = el.getAttribute("data-id");
        const idx = Number(el.getAttribute("data-idx"));
        // Single click: select this card (deselect any previous),
        // move focus to it, enable Next. Do NOT advance.
        state.focusedIdx = idx;
        selectId(id);
      });
      el.addEventListener("dblclick", () => {
        const id = el.getAttribute("data-id");
        selectId(id);
        advanceToLoading();
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
    // Re-paint selected classes without a full re-render, so focus
    // styling and scroll position stay put.
    document.querySelectorAll(".exp-card").forEach((el) => {
      const isSel = el.getAttribute("data-id") === id;
      el.classList.toggle("selected", isSel);
      el.setAttribute("aria-checked", isSel ? "true" : "false");
    });
    // Update Next button enablement.
    btnNext.disabled = state.selectedId === null;
  }

  function advanceToLoading() {
    if (state.selectedId === null) return;
    state.step = 2;
    render();
  }

  // ---- Loading sequence ----
  function startLoading() {
    if (state.launching) return;
    state.launching = true;

    const bar = document.getElementById("load-bar");
    // Animate bar 0 -> 100 over ~1.5s via requestAnimationFrame.
    const duration = 1500 + Math.random() * 200; // 1.5-1.7s
    const started = performance.now();

    function frame(now) {
      const elapsed = now - started;
      const pct = Math.min(100, (elapsed / duration) * 100);
      if (bar) bar.style.width = pct + "%";
      if (elapsed < duration) {
        requestAnimationFrame(frame);
      }
    }
    requestAnimationFrame(frame);

    const sel = getExperience(state.selectedId);
    state.launchTimer = setTimeout(() => {
      if (state.launching) {
        window.location.href = sel.path;
      }
    }, duration + 100);
  }

  function abortLoading() {
    state.launching = false;
    if (state.launchTimer) {
      clearTimeout(state.launchTimer);
      state.launchTimer = null;
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
      advanceToLoading();
      return;
    }
  });

  btnBack.addEventListener("click", () => {
    if (state.step === 1) {
      state.step = 0;
      render();
    }
    // No back from step 0 or step 2 (loading).
  });

  btnCancel.addEventListener("click", openCancel);
  tbClose.addEventListener("click", openCancel);

  cancelYes.addEventListener("click", () => {
    hideModal("modal-cancel");
    abortLoading();
    // Full reset: clear selection so Next re-disables on return to step 1.
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
    // If cancel modal is open, Escape closes it.
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
        // Arrow keys: navigate focus only. Do NOT select.
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
        // Enter: select the focused card AND advance in one go.
        selectId(EXPERIENCES[state.focusedIdx].id);
        advanceToLoading();
        ev.preventDefault();
        return;
      }
      if (ev.key === " ") {
        // Space: select the focused card, but do NOT advance.
        selectId(EXPERIENCES[state.focusedIdx].id);
        ev.preventDefault();
        return;
      }
      if (ev.key === "Backspace") {
        // Backspace goes back to step 0 (convenience).
        state.step = 0;
        render();
        ev.preventDefault();
        return;
      }
    }
    // On step 2 (loading), ignore keyboard except Escape (handled above).
  });

  // ---- Initial render ----
  render();
})();
