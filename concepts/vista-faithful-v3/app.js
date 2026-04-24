/* ==========================================================
   app.js — Vista Faithful v3 glue
   Cube scroll-solver, tabs, start menu, clock, window chrome.

   Changes vs v2 (what was blocking Jake from evaluating):
     1. Start menu reliability: toggle is idempotent and the outside-click
        listener is added AFTER the orb handler runs (mousedown ordering),
        so the same click never both opens and closes the menu. The orb
        swallows propagation correctly and tolerates the scramble/menu-item
        clicks bubbling through document.
     2. Cube tilt is applied to a wrapper (.cube-tilt) so the celebration
        flourish (a scale animation on .cube) does not fight an inline
        rotateX/rotateY written to .cube every scroll.
     3. Window drag: mouse capture on window (via pointer events + a
        movable guard), drag disables selection & transition at once,
        and mouseup outside the window still clears drag state.
     4. Tabs: clicking a tab resets scroll-to-zero BEFORE dispatching
        onBodyScroll, and the handler no-ops cleanly when solveMoves is
        empty (previously could compute NaN on a zero-length scramble).
     5. ResizeObserver keeps scroll math accurate when the window chrome
        itself resizes (maximize toggle used to leave the cube stuck
        at its pre-max progress).
     6. Every DOM query is guarded; no top-level DOM queries run before
        DOMContentLoaded, so the script order no longer depends on body-
        end placement.
     7. Close/minimize/maximize no longer leave the window in a
        pointer-events:none black-hole state if pressed twice in a row.
   ========================================================== */

(function () {
  "use strict";

  // All DOM work deferred until the document is ready.
  function onReady(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn, { once: true });
    } else {
      fn();
    }
  }

  onReady(init);

  function init() {
    // --- DOM handles -------------------------------------------------------
    const $ = (sel) => document.querySelector(sel);
    const $$ = (sel) => document.querySelectorAll(sel);

    const win = $("#mainWindow");
    const titleBar = $("#titleBar");
    const windowBody = $("#windowBody");
    const cubeEl = $("#cube");
    const cubeTiltEl = $("#cubeTilt");
    const cubeSceneEl = $("#cubeScene");

    const faceEls = {
      U: document.querySelector('.face[data-face="U"]'),
      D: document.querySelector('.face[data-face="D"]'),
      F: document.querySelector('.face[data-face="F"]'),
      B: document.querySelector('.face[data-face="B"]'),
      L: document.querySelector('.face[data-face="L"]'),
      R: document.querySelector('.face[data-face="R"]'),
    };

    // ---- Cube state ------------------------------------------------------

    let scrambledState = null;
    let solveMoves = [];
    let currentMoveIdx = 0;
    let currentState = null;

    if (!window.JakeCube) {
      console.error("[v3] cube.js failed to load; cube is inert");
      setStatusMid("cube.js missing — scroll-solver disabled.");
    } else {
      window.JakeCube.ensureStickerElements(faceEls);
      if (!window.JakeCube.selfTest()) {
        console.warn("[v3] cube self-test failed; solver may produce wrong moves");
      }
      newScramble();
    }

    // ---- Scramble / solve ------------------------------------------------

    function newScramble() {
      const JC = window.JakeCube;
      if (!JC) return;
      const scrMoves = JC.scramble(7);
      scrambledState = JC.applyMoves(JC.solvedState(), scrMoves);

      const t0 = performance.now();
      const sol = JC.solve(scrambledState, 12);
      const t1 = performance.now();

      if (!sol) {
        // Fallback: inverse of scramble still gets the cube home.
        solveMoves = scrMoves.slice().reverse().map(JC.invertMove);
        console.warn("[v3] IDA* timed out; using inverse-scramble fallback");
      } else {
        solveMoves = sol;
      }

      currentMoveIdx = 0;
      currentState = JC.cloneState(scrambledState);
      JC.renderState(currentState, faceEls);
      updateCubeMeta(0, solveMoves.length, "scrambled");
      setStatusMid(
        "Scrambled in " + scrMoves.length + " moves. Solution ready (" +
        solveMoves.length + " moves, " + Math.round(t1 - t0) + "ms) — scroll to run it."
      );
    }

    function advanceTo(targetIdx) {
      const JC = window.JakeCube;
      if (!JC || solveMoves.length === 0) {
        updateCubeMeta(100, 0, "solved");
        return;
      }
      targetIdx = Math.max(0, Math.min(solveMoves.length, targetIdx));
      if (targetIdx === currentMoveIdx) {
        renderProgress();
        return;
      }
      if (targetIdx < currentMoveIdx) {
        // Rewind: replay from scratch (cheap; solveMoves is short).
        currentState = JC.cloneState(scrambledState);
        currentMoveIdx = 0;
      }
      while (currentMoveIdx < targetIdx) {
        currentState = JC.move(currentState, solveMoves[currentMoveIdx]);
        currentMoveIdx++;
      }
      JC.renderState(currentState, faceEls);
      renderProgress();
    }

    function renderProgress() {
      const total = solveMoves.length;
      const done = currentMoveIdx;
      const pct = total === 0 ? 100 : Math.round((done / total) * 100);
      const remaining = total - done;
      const label = remaining === 0
        ? "solved"
        : ("next: " + solveMoves[done]);
      updateCubeMeta(pct, remaining, label);
    }

    function updateCubeMeta(pct, remaining, moveLabel) {
      setText("cubePct", String(pct));
      const fill = document.getElementById("cubeProgressFill");
      if (fill) fill.style.width = pct + "%";
      setText("cubeMovesRemaining", String(remaining));
      setText("cubeMoveLabel", moveLabel);

      // Tilt lives on .cube-tilt so the .cube celebration animation is
      // free to scale without fighting this inline transform.
      if (cubeTiltEl) {
        const t = (pct | 0) / 100;
        const rx = -26 + Math.sin(t * Math.PI) * 6;
        const ry = -38 + t * 64;
        cubeTiltEl.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
      }
    }

    function setText(id, txt) {
      const el = document.getElementById(id);
      if (el) el.textContent = txt;
    }

    function setStatusMid(msg) {
      const el = document.getElementById("statusMid");
      if (el) el.textContent = msg;
    }

    // ---- Scroll tracking -------------------------------------------------

    let lastFlourish = false;

    function onBodyScroll() {
      if (!windowBody) return;
      if (solveMoves.length === 0) return;
      const max = windowBody.scrollHeight - windowBody.clientHeight;
      const t = max > 0 ? windowBody.scrollTop / max : 0;
      const clamped = Math.max(0, Math.min(1, t));
      const target = Math.round(clamped * solveMoves.length);
      advanceTo(target);

      if (currentMoveIdx >= solveMoves.length && !lastFlourish) {
        lastFlourish = true;
        triggerFlourish();
      } else if (currentMoveIdx < solveMoves.length - 1 && lastFlourish) {
        lastFlourish = false;
      }
    }

    function triggerFlourish() {
      if (!cubeSceneEl) return;
      cubeSceneEl.classList.add("celebrate");
      setTimeout(() => cubeSceneEl.classList.remove("celebrate"), 1200);
      flashStatus(
        "Cube solved. " + solveMoves.length + " moves. jake@stockunlock.com if you want to talk."
      );
      setStatusMid("Solution complete — " + solveMoves.join(" "));
    }

    if (windowBody) {
      windowBody.addEventListener("scroll", onBodyScroll, { passive: true });
      // Keep scroll math honest through window resize / maximize.
      if (typeof ResizeObserver !== "undefined") {
        const ro = new ResizeObserver(() => onBodyScroll());
        ro.observe(windowBody);
      }
      window.addEventListener("resize", onBodyScroll);
    }

    // ---- Tabs ------------------------------------------------------------

    const tabs = $$(".tab");
    const sections = $$(".tab-section");
    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        const target = tab.dataset.tab;
        tabs.forEach((t) => t.classList.toggle("active", t === tab));
        sections.forEach((s) => s.classList.toggle("active", s.dataset.section === target));
        if (windowBody) windowBody.scrollTop = 0;
        // Sync cube progress to the new section's scroll (0).
        advanceTo(0);
        lastFlourish = false;
        flashStatus("Opened: " + tab.textContent.trim());
      });
    });

    // ---- Start menu ------------------------------------------------------

    const orb = $("#startOrb");
    const menu = $("#startMenu");

    function isMenuOpen() {
      return menu && !menu.classList.contains("hidden");
    }
    function setMenuOpen(open) {
      if (!menu || !orb) return;
      menu.classList.toggle("hidden", !open);
      orb.classList.toggle("active", !!open);
    }

    if (orb && menu) {
      orb.addEventListener("click", (e) => {
        e.stopPropagation();
        setMenuOpen(!isMenuOpen());
      });

      // One outside-click handler. Skips if the click happened inside the
      // menu or on the orb (the orb handler already decided).
      document.addEventListener("click", (e) => {
        if (!isMenuOpen()) return;
        if (menu.contains(e.target)) return;
        if (orb.contains(e.target)) return;
        setMenuOpen(false);
      });

      menu.querySelectorAll(".sm-item[data-jump]").forEach((el) => {
        el.addEventListener("click", (e) => {
          e.stopPropagation();
          const target = el.dataset.jump;
          const tab = document.querySelector(`.tab[data-tab="${target}"]`);
          if (tab) tab.click();
          setMenuOpen(false);
        });
      });

      const scrambleBtn = document.getElementById("scrambleBtn");
      if (scrambleBtn) {
        scrambleBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          newScramble();
          if (windowBody) windowBody.scrollTop = 0;
          lastFlourish = false;
          setMenuOpen(false);
          flashStatus("New scramble loaded.");
        });
      }

      const power = menu.querySelector(".sm-power");
      if (power) {
        power.addEventListener("click", (e) => {
          e.stopPropagation();
          flashStatus("Shutdown cancelled. Email jake@stockunlock.com instead.");
          setMenuOpen(false);
        });
      }

      // Mail items in the start menu.
      menu.querySelectorAll(".sm-item[data-mail]").forEach((el) => {
        el.addEventListener("click", (e) => {
          e.stopPropagation();
          window.location.href = "mailto:jake@stockunlock.com";
          setMenuOpen(false);
        });
      });

      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && isMenuOpen()) setMenuOpen(false);
      });
    }

    // ---- Window chrome ---------------------------------------------------

    const closeBtn = $(".tb-close");
    const minBtn = $(".tb-min");
    const maxBtn = $(".tb-max");
    const taskBtn = document.querySelector('.tb-task[data-task="main"]');
    let minimized = false;
    let maxed = false;
    let savedGeom = null;

    function minimize() {
      if (!win || minimized) return;
      minimized = true;
      win.style.transition = "transform 200ms ease, opacity 200ms ease";
      win.style.transform = "translateY(40px) scale(0.96)";
      win.style.opacity = "0";
      win.style.pointerEvents = "none";
      if (taskBtn) taskBtn.classList.remove("active");
    }
    function restore() {
      if (!win || !minimized) return;
      minimized = false;
      win.style.transform = "";
      win.style.opacity = "";
      win.style.pointerEvents = "";
      if (taskBtn) taskBtn.classList.add("active");
    }

    if (minBtn) minBtn.addEventListener("click", () => minimized ? restore() : minimize());
    if (taskBtn) taskBtn.addEventListener("click", () => minimized ? restore() : minimize());

    if (maxBtn) {
      maxBtn.addEventListener("click", () => {
        if (!win) return;
        if (!maxed) {
          savedGeom = {
            top: win.style.top, left: win.style.left,
            width: win.style.width, height: win.style.height,
            right: win.style.right, bottom: win.style.bottom,
          };
          win.style.top = "4px";
          win.style.left = "4px";
          win.style.right = "auto";
          win.style.bottom = "auto";
          win.style.width = "calc(100vw - 240px)";
          win.style.height = "calc(100vh - 56px)";
          maxed = true;
        } else {
          const g = savedGeom || {};
          win.style.top = g.top || "";
          win.style.left = g.left || "";
          win.style.width = g.width || "";
          win.style.height = g.height || "";
          win.style.right = g.right || "";
          win.style.bottom = g.bottom || "";
          maxed = false;
        }
      });
    }

    if (closeBtn && win) {
      closeBtn.addEventListener("click", () => {
        flashStatus("Closing is not implemented. Email jake@stockunlock.com instead.");
        if (typeof win.animate === "function") {
          win.animate(
            [
              { transform: "scale(1)", opacity: 1 },
              { transform: "scale(0.97)", opacity: 0.7 },
              { transform: "scale(1)", opacity: 1 },
            ],
            { duration: 420, easing: "ease-out" }
          );
        }
      });
    }

    // ---- Draggable window ------------------------------------------------

    if (win && titleBar) {
      let dragging = false;
      let startX = 0, startY = 0;
      let origLeft = 0, origTop = 0;
      let savedTransition = "";

      function onDown(e) {
        if (!e) return;
        if (e.target && e.target.closest && e.target.closest(".tb-btn")) return;
        if (maxed) return; // don't drag a maximized window
        const pt = pointerOf(e);
        dragging = true;
        startX = pt.x;
        startY = pt.y;
        const rect = win.getBoundingClientRect();
        origLeft = rect.left;
        origTop = rect.top;
        savedTransition = win.style.transition;
        win.style.transition = "none";
        document.body.style.cursor = "move";
        if (e.preventDefault) e.preventDefault();
      }
      function onMove(e) {
        if (!dragging) return;
        const pt = pointerOf(e);
        const dx = pt.x - startX;
        const dy = pt.y - startY;
        win.style.left = origLeft + dx + "px";
        win.style.top = Math.max(4, origTop + dy) + "px";
        win.style.right = "auto";
        win.style.bottom = "auto";
      }
      function onUp() {
        if (!dragging) return;
        dragging = false;
        document.body.style.cursor = "";
        win.style.transition = savedTransition;
      }
      function pointerOf(e) {
        if (typeof e.clientX === "number") return { x: e.clientX, y: e.clientY };
        if (e.touches && e.touches[0]) return { x: e.touches[0].clientX, y: e.touches[0].clientY };
        return { x: 0, y: 0 };
      }

      titleBar.addEventListener("mousedown", onDown);
      document.addEventListener("mousemove", onMove);
      document.addEventListener("mouseup", onUp);
      // Defensive: if the browser loses the mouse outside the viewport,
      // we still clear dragging state.
      window.addEventListener("blur", onUp);
      document.addEventListener("mouseleave", onUp);

      // Light touch support (not perfect, but drags do work on tablets).
      titleBar.addEventListener("touchstart", onDown, { passive: false });
      document.addEventListener("touchmove", onMove, { passive: false });
      document.addEventListener("touchend", onUp);
    }

    // ---- Mail buttons ----------------------------------------------------

    document.querySelectorAll("[data-mail]").forEach((el) => {
      el.addEventListener("click", () => {
        window.location.href = "mailto:jake@stockunlock.com";
      });
    });
    const emailBtn = document.getElementById("emailBtn");
    if (emailBtn) emailBtn.addEventListener("click", () => {
      window.location.href = "mailto:jake@stockunlock.com";
    });
    const resumeBtn = document.getElementById("resumeBtn");
    if (resumeBtn) resumeBtn.addEventListener("click", () => {
      flashStatus("Resume.pdf: email jake@stockunlock.com for a current copy.");
    });

    // ---- Desktop icons ---------------------------------------------------

    document.querySelectorAll(".desk-icon").forEach((icon) => {
      icon.addEventListener("dblclick", () => {
        const which = icon.dataset.icon;
        if (which === "resume") {
          const tab = document.querySelector('.tab[data-tab="work"]');
          if (tab) tab.click();
          flashStatus("Opened: Work tab (resume preview)");
        } else if (which === "readme") {
          const tab = document.querySelector('.tab[data-tab="about"]');
          if (tab) tab.click();
          flashStatus("Opened: readme.txt");
        } else if (which === "computer") {
          const tab = document.querySelector('.tab[data-tab="overview"]');
          if (tab) tab.click();
          flashStatus("Opened: System Properties");
        } else if (which === "recycle") {
          flashStatus("Buzzwords.bin: drag 'passionate', 'rockstar', 'synergy' in here.");
        }
      });
    });

    // ---- Status bar flash ------------------------------------------------

    let statusTimer = null;
    function flashStatus(msg) {
      const left = document.getElementById("statusLeft");
      if (!left) return;
      left.textContent = msg;
      clearTimeout(statusTimer);
      statusTimer = setTimeout(() => { left.textContent = "Ready"; }, 3800);
    }

    // ---- Clock -----------------------------------------------------------

    function tickClock() {
      const now = new Date();
      const h = now.getHours(), m = now.getMinutes(), s = now.getSeconds();
      setRotate("hHour", (h % 12) * 30 + m * 0.5);
      setRotate("hMin", m * 6 + s * 0.1);
      setRotate("hSec", s * 6);

      const hh12 = ((h + 11) % 12) + 1;
      const mm = String(m).padStart(2, "0");
      const ampm = h >= 12 ? "PM" : "AM";
      const label = hh12 + ":" + mm + " " + ampm;

      setText("clockLbl", label);
      setText("taskTime", label);
      const taskDate = document.getElementById("taskDate");
      if (taskDate) {
        const opts = { weekday: "short", month: "short", day: "numeric" };
        taskDate.textContent = now.toLocaleDateString(undefined, opts);
      }
    }
    function setRotate(id, deg) {
      const el = document.getElementById(id);
      if (el) el.style.transform = "rotate(" + deg + "deg)";
    }

    tickClock();
    setInterval(tickClock, 1000);

    flashStatus("Welcome — scroll to run the solver on the scrambled cube.");
  }
})();
