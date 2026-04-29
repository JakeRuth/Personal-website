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
          '<div class="sideart-wordmark">JAKE RUTH</div>' +
          '<div class="sideart-rule-h" aria-hidden="true"></div>' +

          '<div class="sideart-heading">What&rsquo;s in the box</div>' +
          '<ul class="sideart-list">' +
            '<li>15 years shipping</li>' +
            '<li>1 YC-backed company (W22)</li>' +
            '<li>1 Rubik&rsquo;s cube (13.95s avg)</li>' +
            '<li>4 companies (2 co-founded)</li>' +
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
            '<img src="./images/logo.gif" alt="" />' +
          '</div>' +
          '<h1>Jake Ruth Setup</h1>' +
          '<p class="welcome-sub">Takes about two seconds. Click Next to continue.</p>' +
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
          '<p class="dim">All three ship the same content, just through different coding art.</p>' +
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
    // Wizard launch counts as a fresh arrival on the destination — clear
    // the topnav-pill dismissal flag so the onboarding shows on landing.
    try { sessionStorage.removeItem("jrPillDismissed"); } catch (_e) { /* ignore */ }
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

  // X-close and Cancel both fire the "you can't quit starting me" gag.
  btnCancel.addEventListener("click", quitGag);
  tbClose.addEventListener("click", quitGag);

  // ---- Quit gag: fade wizard, show centered card, count 3/2/1, reload. ----
  let quitInFlight = false;
  function quitGag() {
    if (quitInFlight) return;
    quitInFlight = true;
    abortLaunch();

    const wizard = document.getElementById("wizard");
    const banner = document.getElementById("quit-banner");
    const counter = document.getElementById("quit-counter");

    // Close any open menubar dropdowns / the about modal so the page
    // is clean when the gag overlays.
    closeMenus();
    hideModal("modal-about");

    if (wizard) wizard.classList.add("is-quitting");

    // After the wizard fades out, bring up the gag and start the count.
    setTimeout(() => {
      if (banner) {
        banner.hidden = false;
        requestAnimationFrame(() => banner.classList.add("is-visible"));
      }
      let n = 3;
      if (counter) {
        counter.textContent = String(n);
        counter.classList.add("is-tick");
        setTimeout(() => counter.classList.remove("is-tick"), 140);
      }
      const tick = setInterval(() => {
        n -= 1;
        if (n <= 0) {
          clearInterval(tick);
          window.location.reload();
          return;
        }
        if (counter) {
          counter.textContent = String(n);
          counter.classList.add("is-tick");
          setTimeout(() => counter.classList.remove("is-tick"), 140);
        }
      }, 900);
    }, 220);
  }

  // ---- Wizard drag (titlebar handle) ----
  (function initWizardDrag() {
    const wizard = document.getElementById("wizard");
    if (!wizard) return;
    const titlebar = wizard.querySelector(".titlebar");
    if (!titlebar) return;

    let drag = null;

    titlebar.addEventListener("mousedown", (ev) => {
      if (ev.target.closest(".tb-btn")) return; // titlebar buttons stay clickable
      if (ev.button !== 0) return;

      const rect = wizard.getBoundingClientRect();
      // Lock to absolute pixel position; clear the centering transform so
      // left/top take effect cleanly.
      wizard.style.left = rect.left + "px";
      wizard.style.top  = rect.top  + "px";
      wizard.style.transform = "none";
      wizard.classList.add("is-dragging");

      drag = {
        offsetX: ev.clientX - rect.left,
        offsetY: ev.clientY - rect.top,
      };
      ev.preventDefault();
    });

    document.addEventListener("mousemove", (ev) => {
      if (!drag) return;
      const w = wizard.offsetWidth, h = wizard.offsetHeight;
      const minX = -w + 80;                       // keep at least 80px on screen
      const minY = 0;                             // top edge can't escape the viewport
      const maxX = window.innerWidth - 80;
      const maxY = window.innerHeight - 40;
      const x = Math.max(minX, Math.min(maxX, ev.clientX - drag.offsetX));
      const y = Math.max(minY, Math.min(maxY, ev.clientY - drag.offsetY));
      wizard.style.left = x + "px";
      wizard.style.top  = y + "px";
    });

    document.addEventListener("mouseup", () => {
      if (!drag) return;
      drag = null;
      wizard.classList.remove("is-dragging");
    });
  })();

  document.querySelectorAll("[data-close-modal]").forEach((el) => {
    el.addEventListener("click", () => hideModal(el.getAttribute("data-close-modal")));
  });

  function showModal(id) { document.getElementById(id).hidden = false; }
  function hideModal(id) { document.getElementById(id).hidden = true; }

  // ---- Menubar dropdowns ----
  // Click a top-level item to open its panel; hover-rolls between
  // panels while one is open; click outside or Esc closes.
  const menubar = document.getElementById("menubar");
  let toastTimer = null;
  const toastEl = document.getElementById("wiz-toast");

  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.hidden = false;
    requestAnimationFrame(() => toastEl.classList.add("is-visible"));
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastEl.classList.remove("is-visible");
      setTimeout(() => { toastEl.hidden = true; }, 220);
    }, 1800);
  }

  function closeMenus() {
    menubar.querySelectorAll(".menu-item.is-open").forEach((b) => b.classList.remove("is-open"));
    menubar.querySelectorAll(".menu-panel").forEach((p) => p.hidden = true);
  }
  function openMenu(id) {
    closeMenus();
    const trigger = menubar.querySelector('[data-menu="' + id + '"]');
    const panel = menubar.querySelector('[data-menu-for="' + id + '"]');
    if (trigger) trigger.classList.add("is-open");
    if (panel) panel.hidden = false;
  }

  function copyText(text, label) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(
        () => toast("Copied " + label + " to clipboard"),
        () => toast(label + ": " + text)
      );
    } else {
      toast(label + ": " + text);
    }
  }

  function handleMenuAction(action) {
    switch (action) {
      case "restart":
        abortLaunch();
        state.step = 0;
        state.selectedId = null;
        state.focusedIdx = 0;
        render();
        return;
      case "exit":
        quitGag();
        return;
      case "copy-email":
        copyText("jake2ruth@gmail.com", "email");
        return;
      case "copy-github":
        copyText("https://github.com/JakeRuth", "GitHub URL");
        return;
      case "go-welcome":
        abortLaunch();
        state.step = 0;
        render();
        return;
      case "go-picker":
        abortLaunch();
        state.step = 1;
        render();
        return;
      case "about":
        showModal("modal-about");
        return;
      case "github":
        window.open("https://github.com/JakeRuth", "_blank", "noopener");
        return;
      case "mail":
        window.location.href = "mailto:jake2ruth@gmail.com?subject=Saw%20your%20site";
        return;
      case "resume":
        window.open("./official_resume.pdf", "_blank", "noopener");
        return;
    }
  }

  if (menubar) {
    menubar.querySelectorAll("[data-menu]").forEach((btn) => {
      btn.addEventListener("click", (ev) => {
        ev.stopPropagation();
        const id = btn.getAttribute("data-menu");
        if (btn.classList.contains("is-open")) closeMenus();
        else openMenu(id);
      });
      btn.addEventListener("mouseenter", () => {
        // Roll over to a sibling menu only if some menu is already open.
        if (!menubar.querySelector(".menu-item.is-open")) return;
        if (btn.classList.contains("is-open")) return;
        openMenu(btn.getAttribute("data-menu"));
      });
    });
    menubar.querySelectorAll("[data-action]").forEach((row) => {
      row.addEventListener("click", (ev) => {
        ev.stopPropagation();
        handleMenuAction(row.getAttribute("data-action"));
        closeMenus();
      });
    });
    document.addEventListener("click", (ev) => {
      if (!ev.target.closest("#menubar")) closeMenus();
    });
  }

  // ---- Keyboard nav ----
  document.addEventListener("keydown", (ev) => {
    const aboutModal = document.getElementById("modal-about");
    if (aboutModal && !aboutModal.hidden) {
      if (ev.key === "Escape") {
        hideModal("modal-about");
        ev.preventDefault();
      }
      return;
    }

    // Close any open menubar dropdown before falling through to the gag.
    if (ev.key === "Escape" && menubar && menubar.querySelector(".menu-item.is-open")) {
      closeMenus();
      ev.preventDefault();
      return;
    }

    if (ev.key === "Escape") {
      quitGag();
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
