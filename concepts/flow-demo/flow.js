/* =========================================================
   flow-demo — picker DNA carried into the nav.

   Two parallel flows, each fully self-contained on the same
   page. Each flow: condensed picker → transition → experience
   (with nav chrome matching the picker's visual language).

   No build, no deps. Vanilla JS.
   ========================================================= */

(function () {
  "use strict";

  // ---- Shared experience catalog -------------------------------------
  // Four rooms so both pickers fit in one viewport without scroll.
  // All four land on the SAME README-flavored experience body; the only
  // thing that differs between A and B is the nav chrome around it.
  const EXPERIENCES = [
    {
      id: "readme",
      name: "README",
      tag: "The engineer one",
      desc: "Markdown resume. Monospace headings, plain prose. Engineer-native."
    },
    {
      id: "xp-luna",
      name: "XP Luna",
      tag: "The nostalgic one",
      desc: "Windows XP, warmed over. Teal task bar, Bliss wallpaper, real content underneath."
    },
    {
      id: "saas",
      name: "Enterprise SaaS",
      tag: "The dev-tool one",
      desc: "Pricing cards, feature grid, keynote polish. Very 2026. Very on purpose."
    },
    {
      id: "vista",
      name: "Vista Faithful",
      tag: "The glass one",
      desc: "Aero glass, blur, transparency. Everything 2007 promised and then apologized for."
    }
  ];

  function byId(id) { return document.getElementById(id); }

  function getExperience(id) {
    return EXPERIENCES.find((e) => e.id === id) || EXPERIENCES[0];
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    })[c]);
  }

  // ---- Screen switcher ------------------------------------------------
  function showScreen(stage, targetName) {
    const screens = stage.querySelectorAll(".screen");
    screens.forEach((el) => {
      if (el.dataset.screen === targetName) {
        el.classList.add("is-active");
        el.classList.remove("is-leaving");
      } else if (el.classList.contains("is-active")) {
        el.classList.remove("is-active");
        el.classList.add("is-leaving");
        // Clean up after transition completes.
        setTimeout(() => el.classList.remove("is-leaving"), 420);
      }
    });
  }

  // ========================================================================
  // FLOW A — Wizard picker → wizard-flavored nav
  // ========================================================================
  const flowA = (() => {
    const stage = byId("stage-a");
    const listEl = byId("wiz-list-a");
    const menuListEl = byId("wiz-list-menu-a");
    const launchBtn = byId("wiz-launch-a");
    const cancelBtn = byId("wiz-cancel-a");
    const launchName = byId("wiz-launch-name-a");
    const bar = byId("wiz-bar-a");
    const log = byId("wiz-log-a");
    const setupBtn = byId("setup-btn-a");
    const trayMenu = byId("tray-menu-a");
    const trayMenuClose = byId("tray-menu-close-a");
    const trayMenuCancel = byId("tray-menu-cancel-a");
    const trayMenuApply = byId("tray-menu-apply-a");
    const trayMeta = byId("tray-meta-a");
    const expTitle = byId("exp-title-a");

    let selectedId = EXPERIENCES[0].id;
    let focusedIdx = 0;

    // Render the wizard radio list (picker + reopened-from-tray variant).
    function renderList(targetEl, selId) {
      targetEl.innerHTML = EXPERIENCES.map((e, idx) => (
        '<label class="wiz-option' + (idx === 0 && selId === e.id ? " focused" : "") + '"' +
          ' data-idx="' + idx + '" data-id="' + e.id + '">' +
          '<input type="radio" name="exp-a-' + targetEl.id + '" value="' + e.id + '"' +
            (selId === e.id ? " checked" : "") + " />" +
          '<span class="wiz-option-body">' +
            '<span class="wiz-option-head">' + escapeHtml(e.name) +
              '<span class="wiz-option-tag">- ' + escapeHtml(e.tag) + "</span>" +
            "</span>" +
            '<span class="wiz-option-desc">' + escapeHtml(e.desc) + "</span>" +
          "</span>" +
        "</label>"
      )).join("");

      targetEl.querySelectorAll(".wiz-option").forEach((el) => {
        el.addEventListener("click", () => {
          const id = el.getAttribute("data-id");
          const idx = Number(el.getAttribute("data-idx"));
          selectedId = id;
          focusedIdx = idx;
          updateFocus(targetEl);
        });
        el.addEventListener("dblclick", () => {
          const id = el.getAttribute("data-id");
          selectedId = id;
          // Double-click advances: if we're in the picker, launch. If in tray, apply.
          if (targetEl === listEl) startTransition();
          else applyFromTray();
        });
      });
    }

    function updateFocus(targetEl) {
      targetEl.querySelectorAll(".wiz-option").forEach((el) => {
        const id = el.getAttribute("data-id");
        const idx = Number(el.getAttribute("data-idx"));
        const radio = el.querySelector('input[type="radio"]');
        if (radio) radio.checked = (id === selectedId);
        el.classList.toggle("focused", idx === focusedIdx);
      });
    }

    // --- Transition + land on experience ---
    function startTransition() {
      const sel = getExperience(selectedId);
      launchName.textContent = sel.name;
      bar.style.width = "0%";
      log.innerHTML = "";

      ["jakeruth.exe v13.0 - Multi-Experience Edition",
       "(C) 2026 Jake Ruth. Pick the mode. Read the code.",
       ""].forEach((t) => {
        const d = document.createElement("div");
        d.className = "ln note";
        d.textContent = t;
        log.appendChild(d);
      });

      showScreen(stage, "transition-a");

      const steps = [
        { pct: 18, note: "svc/setup      -> ready" },
        { pct: 42, note: "mount /career  -> ok" },
        { pct: 66, note: "apply " + sel.id + " -> ok" },
        { pct: 88, note: "opinion.dll   -> loaded" },
        { pct: 100, note: "redirect ../" + sel.id + "/" }
      ];
      let i = 0;
      function tick() {
        if (i >= steps.length) {
          setTimeout(land, 280);
          return;
        }
        const s = steps[i++];
        bar.style.width = s.pct + "%";
        const line = document.createElement("div");
        line.className = "ln " + (s.pct === 100 ? "ok" : "note");
        line.textContent = "[" + String(s.pct).padStart(3, " ") + "] " + s.note;
        log.appendChild(line);
        log.scrollTop = log.scrollHeight;
        setTimeout(tick, 180 + Math.random() * 120);
      }
      setTimeout(tick, 180);
    }

    function land() {
      const sel = getExperience(selectedId);
      expTitle.textContent = "README — " + sel.name + " mode";
      trayMeta.textContent = "mode: " + sel.id + " · build 20260420.2";
      showScreen(stage, "experience-a");
    }

    function applyFromTray() {
      trayMenu.hidden = true;
      // Brief transition shimmer to reinforce cohesion: send user back through
      // the wizard progress card, then return to experience with new mode.
      startTransition();
    }

    function reset() {
      selectedId = EXPERIENCES[0].id;
      focusedIdx = 0;
      renderList(listEl, selectedId);
      renderList(menuListEl, selectedId);
      trayMenu.hidden = true;
      showScreen(stage, "picker-a");
    }

    // --- Wire ---
    function init() {
      renderList(listEl, selectedId);
      renderList(menuListEl, selectedId);

      launchBtn.addEventListener("click", startTransition);
      cancelBtn.addEventListener("click", reset);

      setupBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        // Re-render menu list so the current selection is pre-checked.
        renderList(menuListEl, selectedId);
        trayMenu.hidden = !trayMenu.hidden;
      });
      trayMenuClose.addEventListener("click", () => { trayMenu.hidden = true; });
      trayMenuCancel.addEventListener("click", () => { trayMenu.hidden = true; });
      trayMenuApply.addEventListener("click", applyFromTray);

      // Click outside the tray menu closes it.
      document.addEventListener("click", (e) => {
        if (trayMenu.hidden) return;
        if (trayMenu.contains(e.target) || setupBtn.contains(e.target)) return;
        trayMenu.hidden = true;
      });
    }

    return { init, reset };
  })();

  // ========================================================================
  // FLOW B — Minimalist picker → minimalist top-bar nav
  // ========================================================================
  const flowB = (() => {
    const stage = byId("stage-b");
    const listEl = byId("min-list-b");
    const transitLine = byId("min-transit-line-b");
    const navRooms = byId("min-nav-rooms-b");
    const navMeta = byId("min-nav-meta-b");
    const expKicker = byId("exp-kicker-b");

    let selectedId = EXPERIENCES[0].id;

    function renderList() {
      listEl.innerHTML = EXPERIENCES.map((e, i) => (
        '<button class="min-row" data-id="' + e.id + '" data-index="' + i + '" type="button">' +
          '<span class="min-num">0' + (i + 1) + "</span>" +
          '<span class="min-row-body">' +
            '<p class="min-label">' + escapeHtml(e.name) + "</p>" +
            '<p class="min-desc">' + escapeHtml(e.desc) + "</p>" +
          "</span>" +
          '<span class="min-chev" aria-hidden="true">&rsaquo;</span>' +
        "</button>"
      )).join("");

      listEl.querySelectorAll(".min-row").forEach((el) => {
        el.addEventListener("click", () => {
          selectedId = el.getAttribute("data-id");
          startTransition();
        });
      });
    }

    function renderNav() {
      navRooms.innerHTML = EXPERIENCES.map((e) => (
        '<button class="min-nav-room' + (e.id === selectedId ? " current" : "") + '"' +
          ' data-id="' + e.id + '" type="button">' + escapeHtml(e.name) + "</button>"
      )).join("");
      navRooms.querySelectorAll(".min-nav-room").forEach((el) => {
        el.addEventListener("click", () => {
          const id = el.getAttribute("data-id");
          if (id === selectedId) return;
          selectedId = id;
          startTransition();
        });
      });
    }

    function startTransition() {
      const sel = getExperience(selectedId);
      transitLine.innerHTML = 'Opening <em>' + escapeHtml(sel.name) + '</em>';
      showScreen(stage, "transition-b");
      setTimeout(land, 520);
    }

    function land() {
      const sel = getExperience(selectedId);
      expKicker.textContent = sel.tag;
      navMeta.textContent = "room · " + sel.name.toLowerCase();
      renderNav();
      showScreen(stage, "experience-b");
    }

    function reset() {
      selectedId = EXPERIENCES[0].id;
      showScreen(stage, "picker-b");
    }

    function init() {
      renderList();

      // Keyboard shortcuts 1..4 work only when Flow B is in the picker.
      document.addEventListener("keydown", (e) => {
        const pickerActive = stage.querySelector('[data-screen="picker-b"]').classList.contains("is-active");
        if (!pickerActive) return;
        if (/^[1-4]$/.test(e.key)) {
          const idx = parseInt(e.key, 10) - 1;
          if (EXPERIENCES[idx]) {
            e.preventDefault();
            selectedId = EXPERIENCES[idx].id;
            startTransition();
          }
        }
      });
    }

    return { init, reset };
  })();

  // ========================================================================
  // Boot
  // ========================================================================
  flowA.init();
  flowB.init();

  const resetAll = byId("reset-all");
  if (resetAll) {
    resetAll.addEventListener("click", () => {
      flowA.reset();
      flowB.reset();
    });
  }
})();
