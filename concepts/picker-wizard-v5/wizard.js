/* =========================================================
   Jake Ruth Setup Wizard v5 - Side-banner variants
   Vanilla JS, no build step.

   Identical to v4 except:
     - Step 1 (Welcome) renders one of three side-banner variants:
         A  "What's in the box" + "System requirements" (classic InstallShield)
         B  Same content as A, with ambient animation
         C  Minimal vertical wordmark
     - Small variant toggle in the wizard chrome (step 1 only).
     - Keyboard 'v' cycles A -> B -> C -> A.
     - Steps 2 and 3 are untouched.
   ========================================================= */

(function () {
  "use strict";

  // ---- Experience catalog ---- (unchanged from v4)
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

  // ---- Variant catalog ----
  // A = primary (classic installer combined-content, static)
  // B = same content as A + ambient animation (loading bar + scanlines)
  // C = minimal vertical wordmark
  const VARIANTS = ["A", "B", "C"];
  const VARIANT_DEFAULT = "A";

  // ---- State ----
  const state = {
    step: 0,              // 0..2
    focusedIdx: 0,
    selectedId: null,
    launching: false,
    launchTimer: null,
    variant: VARIANT_DEFAULT
  };

  // ---- DOM refs ----
  const body = document.getElementById("wizard-body");
  const btnNext = document.getElementById("btn-next");
  const btnBack = document.getElementById("btn-back");
  const btnCancel = document.getElementById("btn-cancel");
  const tbClose = document.getElementById("tb-close");
  const stepIndicator = document.getElementById("step-indicator");
  const variantToggle = document.getElementById("variant-toggle");
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

  // ---- Mockup renderers ---- (unchanged from v4)
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

  // =========================================================
  // Side-banner variants
  // =========================================================

  // Shared content column used by A and B. All facts drawn from content.json.
  // Voice: VOICE.md-compliant. Plain, specific numbers, no filler modifiers.
  function sideartColumnHTML() {
    return (
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
      '</div>'
    );
  }

  // Variant A: static combined content.
  function sideartVariantA() {
    return (
      '<div class="sideart-variant sideart-variant-a" data-variant="A">' +
        sideartColumnHTML() +
      '</div>'
    );
  }

  // Variant B: same content as A + ambient animation.
  // Animation = looping progress bar (classic installer trope, feels like
  // something is "preparing") + very faint scanline overlay. Both are
  // ambient — not attention-seeking.
  function sideartVariantB() {
    // Replace the static footer with one that contains the preparing bar.
    const colWithBar =
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
          '<div class="sideart-loading" aria-hidden="true">' +
            '<span class="sideart-loading-label">preparing<span class="sb-dots"></span></span>' +
            '<span class="sideart-bar"></span>' +
          '</div>' +
          '<span class="sideart-stamp">setup.exe</span>' +
        '</div>' +
      '</div>';
    return (
      '<div class="sideart-variant sideart-variant-b" data-variant="B">' +
        colWithBar +
      '</div>'
    );
  }

  // Variant C: minimal vertical wordmark. No bullet content. Quiet.
  function sideartVariantC() {
    // Letter-by-letter stack of "JAKE RUTH SETUP" with thin separator bars.
    const letters = [
      'J', 'A', 'K', 'E',
      'sep',
      'R', 'U', 'T', 'H',
      'thin-SETUP'
    ];
    const rows = letters.map((t) => {
      if (t === 'sep') return '<div class="stack-sep" aria-hidden="true"></div>';
      if (t === 'thin-SETUP') return '<div class="stack-letter thin">SETUP</div>';
      return '<div class="stack-letter">' + escapeHtml(t) + '</div>';
    }).join("");
    return (
      '<div class="sideart-variant sideart-variant-c" data-variant="C">' +
        '<div class="sideart-stack" aria-hidden="true">' + rows + '</div>' +
        '<div class="sideart-version">v13.0.0</div>' +
      '</div>'
    );
  }

  function sideartAllVariantsHTML() {
    // Render all three so we can crossfade between them via class toggles
    // instead of re-rendering the DOM every variant change.
    return sideartVariantA() + sideartVariantB() + sideartVariantC();
  }

  // Apply active-variant class to whichever variant element matches state.
  function applyActiveVariant() {
    const root = document.querySelector(".welcome .sideart");
    if (!root) return;
    root.querySelectorAll(".sideart-variant").forEach((el) => {
      const match = el.getAttribute("data-variant") === state.variant;
      el.classList.toggle("is-active", match);
    });
    // Update toggle button states.
    if (variantToggle) {
      variantToggle.querySelectorAll(".vt-btn").forEach((b) => {
        const match = b.getAttribute("data-variant") === state.variant;
        b.setAttribute("aria-pressed", match ? "true" : "false");
      });
    }
  }

  function setVariant(v) {
    if (VARIANTS.indexOf(v) === -1) return;
    state.variant = v;
    applyActiveVariant();
    startOrStopVariantBDots();
  }

  function cycleVariant() {
    const i = VARIANTS.indexOf(state.variant);
    const next = VARIANTS[(i + 1) % VARIANTS.length];
    setVariant(next);
  }

  // Variant B's "preparing..." dots. CSS content: animations are flaky across
  // browsers — easier to just drive it from JS with a single shared interval.
  const reduceMotion = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let dotsTimer = null;
  function startOrStopVariantBDots() {
    const active = state.step === 0 && state.variant === "B";
    if (active && !dotsTimer) {
      if (reduceMotion) {
        // Static "..." — no interval.
        document.querySelectorAll(".sideart-variant-b .sb-dots").forEach((el) => {
          el.textContent = "...";
        });
        return;
      }
      let frame = 0;
      const seq = ["", ".", "..", "..."];
      dotsTimer = setInterval(() => {
        frame = (frame + 1) % seq.length;
        document.querySelectorAll(".sideart-variant-b .sb-dots").forEach((el) => {
          el.textContent = seq[frame];
        });
      }, 420);
    } else if (!active && dotsTimer) {
      clearInterval(dotsTimer);
      dotsTimer = null;
    }
  }

  // ---- Step renderers ----
  function renderWelcome() {
    return (
      '<div class="welcome">' +
        '<div class="sideart" aria-hidden="true">' +
          sideartAllVariantsHTML() +
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
      btnNext.disabled = state.selectedId === null;
      btnNext.textContent = "Next >";
      btnCancel.hidden = false;
      btnCancel.disabled = false;
    } else {
      btnBack.hidden = false;
      btnBack.disabled = true;
      btnNext.hidden = true;
      btnCancel.hidden = false;
      btnCancel.disabled = false;
    }

    // Variant toggle only appears on step 1 (welcome).
    variantToggle.hidden = state.step !== 0;

    // Step-specific wiring.
    if (state.step === 0) {
      applyActiveVariant();
      startOrStopVariantBDots();
    } else {
      startOrStopVariantBDots(); // will stop if not step 0
    }
    if (state.step === 1) wirePicker();
    if (state.step === 2) startLoading();
  }

  // ---- Picker wiring ----  (unchanged from v4)
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
    document.querySelectorAll(".exp-card").forEach((el) => {
      const isSel = el.getAttribute("data-id") === id;
      el.classList.toggle("selected", isSel);
      el.setAttribute("aria-checked", isSel ? "true" : "false");
    });
    btnNext.disabled = state.selectedId === null;
  }

  function advanceToLoading() {
    if (state.selectedId === null) return;
    state.step = 2;
    render();
  }

  // ---- Loading sequence ---- (unchanged from v4)
  function startLoading() {
    if (state.launching) return;
    state.launching = true;

    const bar = document.getElementById("load-bar");
    const duration = 1500 + Math.random() * 200;
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
  });

  btnCancel.addEventListener("click", openCancel);
  tbClose.addEventListener("click", openCancel);

  cancelYes.addEventListener("click", () => {
    hideModal("modal-cancel");
    abortLoading();
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

  // ---- Variant toggle wiring ----
  variantToggle.querySelectorAll(".vt-btn").forEach((b) => {
    b.addEventListener("click", () => {
      const v = b.getAttribute("data-variant");
      setVariant(v);
    });
  });

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

    // 'v' cycles side-banner variants on step 1 only. Avoid eating 'v' when
    // the user is typing in a form field (none exist here, but future-proof).
    if (state.step === 0 && (ev.key === "v" || ev.key === "V")) {
      const tag = (ev.target && ev.target.tagName) || "";
      if (tag !== "INPUT" && tag !== "TEXTAREA") {
        cycleVariant();
        ev.preventDefault();
        return;
      }
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
        advanceToLoading();
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
