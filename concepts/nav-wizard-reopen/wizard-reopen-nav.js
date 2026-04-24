/* =========================================================
   WizardReopenNav
   A persistent Setup-style button + compact wizard modal for
   re-choosing the Jake Ruth experience without a full picker trip.

   Usage (anywhere on the page, after the script + stylesheet load):

     WizardReopenNav.mount({
       current: 'xp',                   // 'xp' | 'readme-git' | 'saas' (optional)
       label: 'Setup',                  // optional button label
       position: 'bottom-right',        // 'bottom-right' | 'top-right' | 'bottom-left' | 'top-left'
       useTransitionCube: true,         // optional: play transition-cube before redirect
       transitionCubeBase: '../transition-cube/', // optional override
       onChange: ({ id, path }) => {},  // optional — fires on confirm instead of redirecting
     });

   API:
     WizardReopenNav.mount(opts)   -> { open, close, destroy }
     WizardReopenNav.open()        -> opens the most-recently-mounted instance
     WizardReopenNav.close()
     WizardReopenNav.destroy()

   The 3 experiences are hard-coded to match the brief:
     - xp-luna-v3
     - readme-git-fusion-v2
     - saas-v5
   ========================================================= */

(function (global) {
  "use strict";

  // ---------- Catalog ----------
  // Slugs map 1:1 to directory names under ../. IDs are short handles so
  // callers can pass { current: 'xp' } without knowing the version suffix.
  const EXPERIENCES = [
    {
      id: "xp",
      slug: "xp-luna-v3",
      name: "XP Luna",
      tag: "The nostalgic one",
      desc: "Bliss hill, Start menu, icons you double-click. 2003 chrome, 2026 voice.",
      thumbClass: "jr-wrn-thumb-xp",
      path: "../xp-luna-v3/"
    },
    {
      id: "readme-git",
      slug: "readme-git-fusion-v2",
      name: "README / Git Log",
      tag: "The engineer one",
      desc: "Career as one long README with a git log of the decade behind it.",
      thumbClass: "jr-wrn-thumb-readme-git",
      path: "../readme-git-fusion-v2/"
    },
    {
      id: "saas",
      slug: "saas-v5",
      name: "SaaS Landing",
      tag: "The dev-tool one",
      desc: "Modern landing page. Pricing cards, feature grid, keynote polish.",
      thumbClass: "jr-wrn-thumb-saas",
      path: "../saas-v5/"
    }
  ];

  // Track live instances so the public open/close/destroy entry points
  // always talk to the most-recently-mounted one (typical: one per page).
  const instances = [];

  // ---------- Utilities ----------
  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    })[c]);
  }

  function findExperience(idOrSlug) {
    if (!idOrSlug) return null;
    return EXPERIENCES.find((e) => e.id === idOrSlug || e.slug === idOrSlug) || null;
  }

  function resolvePosition(pos) {
    const map = {
      "bottom-right": { bottom: "18px", right: "18px", top: "auto", left: "auto" },
      "bottom-left":  { bottom: "18px", left: "18px",  top: "auto", right: "auto" },
      "top-right":    { top: "18px",    right: "18px", bottom: "auto", left: "auto" },
      "top-left":     { top: "18px",    left: "18px",  bottom: "auto", right: "auto" }
    };
    return map[pos] || map["bottom-right"];
  }

  // ---------- Transition-cube bridge ----------
  // We lazy-load the transition-cube component from `../transition-cube/`
  // (or a caller-supplied base) only if `useTransitionCube: true`. If the
  // network fetch fails, we fall back to a plain redirect — the cube is
  // a nice-to-have, not load-bearing.
  function ensureTransitionCube(base) {
    if (global.TransitionCube && typeof global.TransitionCube.playTransition === "function") {
      return Promise.resolve();
    }
    return new Promise((resolve, reject) => {
      const basePath = (base || "../transition-cube/").replace(/\/?$/, "/");
      const three = document.createElement("script");
      three.src = "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js";
      three.onload = () => {
        const solver = document.createElement("script");
        solver.src = basePath + "cube-solver.js";
        solver.onload = () => {
          const tc = document.createElement("script");
          tc.src = basePath + "transition-cube.js";
          tc.onload = () => resolve();
          tc.onerror = reject;
          document.head.appendChild(tc);
        };
        solver.onerror = reject;
        document.head.appendChild(solver);
      };
      three.onerror = reject;
      // Don't re-add three.js if someone else already loaded it.
      if (global.THREE) {
        three.onload();
      } else {
        document.head.appendChild(three);
      }
    });
  }

  // ---------- Component factory ----------
  function mount(opts) {
    opts = opts || {};
    const currentExp = findExperience(opts.current);
    const label = opts.label || "Setup";
    const sublabel = opts.sublabel != null ? opts.sublabel : "Change experience";
    const position = resolvePosition(opts.position || "bottom-right");
    const useTransitionCube = !!opts.useTransitionCube;
    const transitionCubeBase = opts.transitionCubeBase || "../transition-cube/";
    const onChange = typeof opts.onChange === "function" ? opts.onChange : null;

    // Modal state (scoped per-instance)
    const state = {
      isOpen: false,
      // Default to the current experience so the current option is pre-focused.
      // If `current` is unknown, default to the first option.
      selectedId: currentExp ? currentExp.id : EXPERIENCES[0].id,
      focusedIdx: currentExp
        ? EXPERIENCES.findIndex((e) => e.id === currentExp.id)
        : 0,
      previouslyFocusedEl: null
    };

    // ---- Build persistent button ----
    const launcher = document.createElement("button");
    launcher.type = "button";
    launcher.className = "jr-wrn-launcher";
    launcher.setAttribute("aria-haspopup", "dialog");
    launcher.setAttribute("aria-expanded", "false");
    launcher.setAttribute(
      "aria-label",
      "Reopen Jake Ruth Setup Wizard"
    );
    Object.keys(position).forEach((k) => {
      launcher.style[k] = position[k];
    });

    launcher.innerHTML =
      '<span class="jr-wrn-launcher-icon" aria-hidden="true">' +
        '<i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i>' +
      "</span>" +
      '<span class="jr-wrn-launcher-label">' +
        '<span class="main">' + escapeHtml(label) + "</span>" +
        (sublabel ? '<span class="sub">' + escapeHtml(sublabel) + "</span>" : "") +
      "</span>" +
      '<span class="jr-wrn-tooltip" role="tooltip">Reopen Setup Wizard</span>';

    launcher.addEventListener("click", () => {
      if (state.isOpen) close();
      else open();
    });

    document.body.appendChild(launcher);

    // ---- Build modal shell (lazy-inserted on first open) ----
    let backdrop = null;
    let windowEl = null;
    let optionsEl = null;
    let btnConfirm = null;
    let btnCancel = null;
    let btnClose = null;

    function buildModal() {
      backdrop = document.createElement("div");
      backdrop.className = "jr-wrn-backdrop";
      backdrop.hidden = true;
      backdrop.setAttribute("role", "presentation");

      windowEl = document.createElement("div");
      windowEl.className = "jr-wrn-window";
      windowEl.setAttribute("role", "dialog");
      windowEl.setAttribute("aria-modal", "true");
      windowEl.setAttribute("aria-labelledby", "jr-wrn-title");

      windowEl.innerHTML =
        // --- Titlebar ---
        '<div class="jr-wrn-titlebar">' +
          '<span class="jr-wrn-title-icon" aria-hidden="true">' +
            '<i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i>' +
          "</span>" +
          '<span class="jr-wrn-title-text" id="jr-wrn-title">Change Experience</span>' +
          '<div class="jr-wrn-title-buttons">' +
            '<button class="jr-wrn-tb-btn" aria-label="Minimize" tabindex="-1" data-noop>_</button>' +
            '<button class="jr-wrn-tb-btn" aria-label="Maximize" tabindex="-1" data-noop>&#9633;</button>' +
            '<button class="jr-wrn-tb-btn close" aria-label="Close" data-close>&times;</button>' +
          "</div>" +
        "</div>" +
        // --- Banner ---
        '<div class="jr-wrn-banner">' +
          '<div>' +
            '<div class="jr-wrn-banner-h1">Reopen Setup Wizard</div>' +
            '<div class="jr-wrn-banner-h2">Same voice, different chrome. Pick again.</div>' +
          "</div>" +
          '<div class="jr-wrn-banner-cube" aria-hidden="true">' +
            '<i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i>' +
          "</div>" +
        "</div>" +
        // --- Body ---
        '<div class="jr-wrn-body">' +
          '<h2>Choose your experience</h2>' +
          '<p class="dim">Pick a flavor. Your selection replaces the current page.</p>' +
          '<div class="jr-wrn-options" role="radiogroup" aria-label="Experience mode" id="jr-wrn-options"></div>' +
        "</div>" +
        // --- Footer ---
        '<div class="jr-wrn-footer">' +
          '<div class="jr-wrn-footer-left">' +
            '<kbd>↑</kbd><kbd>↓</kbd> move &middot; <kbd>Enter</kbd> confirm &middot; <kbd>Esc</kbd> close' +
          "</div>" +
          '<div class="jr-wrn-footer-right">' +
            '<button class="jr-wrn-btn" data-cancel>Cancel</button>' +
            '<button class="jr-wrn-btn primary" data-confirm>Launch &gt;</button>' +
          "</div>" +
        "</div>";

      backdrop.appendChild(windowEl);
      document.body.appendChild(backdrop);

      optionsEl = windowEl.querySelector("#jr-wrn-options");
      btnConfirm = windowEl.querySelector("[data-confirm]");
      btnCancel = windowEl.querySelector("[data-cancel]");
      btnClose = windowEl.querySelector("[data-close]");

      // Wire
      backdrop.addEventListener("click", (ev) => {
        if (ev.target === backdrop) close();
      });
      btnCancel.addEventListener("click", close);
      btnClose.addEventListener("click", close);
      btnConfirm.addEventListener("click", confirm);

      // Dead titlebar buttons — no-op but present for chrome consistency.
      windowEl.querySelectorAll("[data-noop]").forEach((el) => {
        el.addEventListener("click", (ev) => ev.preventDefault());
      });

      // Prevent window clicks from bubbling up to the backdrop close handler.
      windowEl.addEventListener("click", (ev) => ev.stopPropagation());

      renderOptions();
    }

    function renderOptions() {
      const rows = EXPERIENCES.map((e, idx) => {
        const isCurrent = currentExp && currentExp.id === e.id;
        const isSelected = state.selectedId === e.id;
        const isFocused = state.focusedIdx === idx;
        const classes = [
          "jr-wrn-option",
          isFocused ? "focused" : "",
          isCurrent ? "current" : ""
        ].filter(Boolean).join(" ");
        return (
          '<label class="' + classes + '" data-idx="' + idx + '" data-id="' + e.id + '" role="radio" aria-checked="' + (isSelected ? "true" : "false") + '" tabindex="' + (isFocused ? "0" : "-1") + '">' +
            '<input type="radio" name="jr-wrn-exp" value="' + e.id + '"' + (isSelected ? " checked" : "") + " tabindex=\"-1\" />" +
            '<span class="jr-wrn-option-thumb" aria-hidden="true"><span class="jr-wrn-thumb ' + e.thumbClass + '"></span></span>' +
            '<span class="jr-wrn-option-body">' +
              '<span class="jr-wrn-option-head">' +
                escapeHtml(e.name) +
                '<span class="jr-wrn-option-tag">&mdash; ' + escapeHtml(e.tag) + "</span>" +
                (isCurrent ? '<span class="jr-wrn-option-current-chip">Current</span>' : "") +
              "</span>" +
              '<span class="jr-wrn-option-desc">' + escapeHtml(e.desc) + "</span>" +
            "</span>" +
          "</label>"
        );
      }).join("");
      optionsEl.innerHTML = rows;

      optionsEl.querySelectorAll(".jr-wrn-option").forEach((el) => {
        el.addEventListener("click", () => {
          const idx = Number(el.getAttribute("data-idx"));
          select(idx);
        });
        el.addEventListener("dblclick", () => {
          const idx = Number(el.getAttribute("data-idx"));
          select(idx);
          confirm();
        });
      });

      updateConfirmLabel();
    }

    function select(idx) {
      if (idx < 0 || idx >= EXPERIENCES.length) return;
      state.focusedIdx = idx;
      state.selectedId = EXPERIENCES[idx].id;
      optionsEl.querySelectorAll(".jr-wrn-option").forEach((el, i) => {
        el.classList.toggle("focused", i === idx);
        el.setAttribute("aria-checked", i === idx ? "true" : "false");
        el.setAttribute("tabindex", i === idx ? "0" : "-1");
        const radio = el.querySelector('input[type="radio"]');
        if (radio) radio.checked = (i === idx);
      });
      const focusedEl = optionsEl.querySelector('.jr-wrn-option.focused');
      if (focusedEl) focusedEl.focus({ preventScroll: false });
      updateConfirmLabel();
    }

    function updateConfirmLabel() {
      if (!btnConfirm) return;
      const sel = EXPERIENCES[state.focusedIdx];
      const isCurrent = currentExp && sel && currentExp.id === sel.id;
      btnConfirm.disabled = !!isCurrent;
      btnConfirm.textContent = isCurrent ? "Already loaded" : "Launch >";
    }

    // ---------- Open/close/confirm ----------
    function open() {
      if (state.isOpen) return;
      if (!backdrop) buildModal();

      state.previouslyFocusedEl = document.activeElement;
      state.isOpen = true;
      backdrop.hidden = false;
      // Force reflow so the transition fires.
      // eslint-disable-next-line no-unused-expressions
      backdrop.offsetHeight;
      backdrop.classList.add("open");
      launcher.setAttribute("aria-expanded", "true");

      // Reset focused idx to the currently-applied experience (or selection).
      const preferIdx = currentExp
        ? EXPERIENCES.findIndex((e) => e.id === currentExp.id)
        : EXPERIENCES.findIndex((e) => e.id === state.selectedId);
      state.focusedIdx = preferIdx >= 0 ? preferIdx : 0;
      state.selectedId = EXPERIENCES[state.focusedIdx].id;
      renderOptions();

      // Focus the focused option so arrow keys work immediately.
      setTimeout(() => {
        const el = optionsEl.querySelector(".jr-wrn-option.focused");
        if (el) el.focus();
      }, 20);

      document.addEventListener("keydown", onKeydown, true);
    }

    function close() {
      if (!state.isOpen) return;
      state.isOpen = false;
      backdrop.classList.remove("open");
      launcher.setAttribute("aria-expanded", "false");
      document.removeEventListener("keydown", onKeydown, true);

      // Hide after the fade completes.
      setTimeout(() => {
        if (!state.isOpen) backdrop.hidden = true;
      }, 200);

      // Restore focus to whoever had it before the modal opened.
      const prev = state.previouslyFocusedEl;
      if (prev && typeof prev.focus === "function") {
        try { prev.focus(); } catch (e) { /* noop */ }
      } else {
        launcher.focus();
      }
    }

    function confirm() {
      const sel = EXPERIENCES[state.focusedIdx];
      if (!sel) return;
      if (currentExp && currentExp.id === sel.id) return; // already loaded

      // Caller override — do not navigate, just notify.
      if (onChange) {
        onChange({ id: sel.id, slug: sel.slug, path: sel.path });
        close();
        return;
      }

      // Default: redirect (optionally through the transition-cube).
      const destination = sel.path;

      if (useTransitionCube) {
        btnConfirm.disabled = true;
        btnCancel.disabled = true;
        ensureTransitionCube(transitionCubeBase)
          .then(() => {
            global.TransitionCube.playTransition({
              duration: 3000,
              destinationUrl: destination
            });
          })
          .catch(() => {
            // Cube failed to load; fall back to plain redirect.
            window.location.href = destination;
          });
        return;
      }

      window.location.href = destination;
    }

    // ---------- Keyboard ----------
    function onKeydown(ev) {
      if (!state.isOpen) return;

      if (ev.key === "Escape") {
        ev.preventDefault();
        ev.stopPropagation();
        close();
        return;
      }

      if (ev.key === "ArrowDown" || ev.key === "ArrowRight") {
        ev.preventDefault();
        const next = (state.focusedIdx + 1) % EXPERIENCES.length;
        select(next);
        return;
      }
      if (ev.key === "ArrowUp" || ev.key === "ArrowLeft") {
        ev.preventDefault();
        const prev = (state.focusedIdx - 1 + EXPERIENCES.length) % EXPERIENCES.length;
        select(prev);
        return;
      }
      if (ev.key === "Home") {
        ev.preventDefault();
        select(0);
        return;
      }
      if (ev.key === "End") {
        ev.preventDefault();
        select(EXPERIENCES.length - 1);
        return;
      }
      if (ev.key === "Enter") {
        // Only confirm if focus is inside the modal and not on Cancel.
        if (ev.target === btnCancel || ev.target === btnClose) return;
        ev.preventDefault();
        confirm();
        return;
      }
      if (ev.key === "Tab") {
        // Simple focus trap inside the modal.
        trapFocus(ev);
      }
    }

    function trapFocus(ev) {
      const focusables = windowEl.querySelectorAll(
        'button:not([disabled]):not([tabindex="-1"]), [href], [tabindex]:not([tabindex="-1"])'
      );
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (ev.shiftKey && document.activeElement === first) {
        ev.preventDefault();
        last.focus();
      } else if (!ev.shiftKey && document.activeElement === last) {
        ev.preventDefault();
        first.focus();
      }
    }

    // ---------- Destroy ----------
    function destroy() {
      close();
      if (launcher && launcher.parentNode) {
        launcher.parentNode.removeChild(launcher);
      }
      if (backdrop && backdrop.parentNode) {
        backdrop.parentNode.removeChild(backdrop);
      }
      const i = instances.indexOf(api);
      if (i >= 0) instances.splice(i, 1);
    }

    const api = { open, close, destroy, element: launcher };
    instances.push(api);
    return api;
  }

  // ---------- Public singleton-ish helpers ----------
  function openLatest() {
    const inst = instances[instances.length - 1];
    if (inst) inst.open();
  }
  function closeLatest() {
    const inst = instances[instances.length - 1];
    if (inst) inst.close();
  }
  function destroyAll() {
    // Iterate over a copy — destroy() mutates the array.
    instances.slice().forEach((i) => i.destroy());
  }

  global.WizardReopenNav = {
    mount: mount,
    open: openLatest,
    close: closeLatest,
    destroy: destroyAll,
    // Exposed so callers can introspect / extend if needed.
    experiences: EXPERIENCES.slice()
  };
})(window);
