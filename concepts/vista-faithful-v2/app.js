/* ==========================================================
   app.js — Vista Faithful v2 glue
   Wires the real cube solver, scroll progression, tabs,
   start menu, clock, window chrome, and hero interactions.
   ========================================================== */

(function(){
  "use strict";

  // --- Cube setup ----------------------------------------------------------

  const faceEls = {
    U: document.querySelector('.face[data-face="U"]'),
    D: document.querySelector('.face[data-face="D"]'),
    F: document.querySelector('.face[data-face="F"]'),
    B: document.querySelector('.face[data-face="B"]'),
    L: document.querySelector('.face[data-face="L"]'),
    R: document.querySelector('.face[data-face="R"]'),
  };

  // Cube solver state
  let scrambledState = null;   // the cube AFTER scramble, BEFORE any solve moves applied
  let solveMoves = [];         // the solution move sequence
  let currentMoveIdx = 0;      // how many moves of the solution have been applied
  let currentState = null;     // rendered state

  // Render once stickers are ensured.
  function setupCube() {
    if (!window.JakeCube) {
      console.error("cube.js did not load");
      return;
    }
    JakeCube.ensureStickerElements(faceEls);

    // Self-test once at startup (quietly).
    if (!JakeCube.selfTest()) {
      console.warn("[cube] self-test failed; solver may produce wrong moves");
    }

    newScramble();
  }

  // Generate a new random scramble + solve sequence.
  function newScramble() {
    // Depth 7 scramble: visibly scrambled but IDA* solves reliably in < 30ms.
    const scrMoves = JakeCube.scramble(7);
    scrambledState = JakeCube.applyMoves(JakeCube.solvedState(), scrMoves);

    // Solve from the scrambled state (independent of the scramble path).
    const t0 = performance.now();
    const sol = JakeCube.solve(scrambledState, 12);
    const t1 = performance.now();

    if (!sol) {
      // Fallback: use the inverse of the scramble.
      solveMoves = scrMoves.slice().reverse().map(m => {
        if (m.endsWith("'")) return m[0];
        if (m.endsWith("2")) return m;
        return m + "'";
      });
      console.warn("[cube] IDA* timeout; used inverse-scramble fallback");
    } else {
      solveMoves = sol;
    }

    currentMoveIdx = 0;
    currentState = JakeCube.cloneState(scrambledState);
    JakeCube.renderState(currentState, faceEls);
    updateCubeMeta(0, solveMoves.length, "scrambled");
    setStatusMid("Scrambled in " + scrMoves.length + " moves. Solution found in " + Math.round(t1 - t0) + "ms — scroll to run it.");
  }

  // Apply moves of the solution up to targetIdx (absolute index into solveMoves).
  function advanceTo(targetIdx) {
    targetIdx = Math.max(0, Math.min(solveMoves.length, targetIdx));
    if (targetIdx === currentMoveIdx) return;

    if (targetIdx < currentMoveIdx) {
      // Rewind: reset and replay from scratch. (Cheap; solveMoves is short.)
      currentState = JakeCube.cloneState(scrambledState);
      currentMoveIdx = 0;
    }

    while (currentMoveIdx < targetIdx) {
      const m = solveMoves[currentMoveIdx];
      currentState = JakeCube.move(currentState, m);
      currentMoveIdx++;
    }

    JakeCube.renderState(currentState, faceEls);
    const pct = solveMoves.length === 0 ? 100 : Math.round((currentMoveIdx / solveMoves.length) * 100);
    const remaining = solveMoves.length - currentMoveIdx;
    const label = remaining === 0 ? "solved" : ("next: " + solveMoves[currentMoveIdx]);
    updateCubeMeta(pct, remaining, label);
  }

  function updateCubeMeta(pct, remaining, moveLabel) {
    const pctEl = document.getElementById("cubePct");
    const fillEl = document.getElementById("cubeProgressFill");
    const remEl = document.getElementById("cubeMovesRemaining");
    const moveEl = document.getElementById("cubeMoveLabel");
    if (pctEl) pctEl.textContent = pct;
    if (fillEl) fillEl.style.width = pct + "%";
    if (remEl) remEl.textContent = remaining;
    if (moveEl) moveEl.textContent = moveLabel;

    // Tilt the cube as progress advances so it feels alive during the scroll.
    const cube = document.getElementById("cube");
    if (cube) {
      const t = pct / 100;
      const rx = -26 + Math.sin(t * Math.PI) * 6;
      const ry = -38 + t * 64;
      cube.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
    }
  }

  function setStatusMid(msg) {
    const el = document.getElementById("statusMid");
    if (el) el.textContent = msg;
  }

  // --- Scroll tracking -----------------------------------------------------

  let lastFlourish = false;

  function onBodyScroll() {
    const body = document.getElementById("windowBody");
    if (!body) return;
    const max = body.scrollHeight - body.clientHeight;
    const t = max > 0 ? body.scrollTop / max : 0;
    const target = Math.round(t * solveMoves.length);
    advanceTo(target);

    if (currentMoveIdx >= solveMoves.length && !lastFlourish) {
      lastFlourish = true;
      triggerFlourish();
    } else if (currentMoveIdx < solveMoves.length - 1 && lastFlourish) {
      lastFlourish = false;
    }
  }

  function triggerFlourish() {
    const scene = document.querySelector(".cube-scene");
    if (!scene) return;
    scene.classList.add("celebrate");
    setTimeout(() => scene.classList.remove("celebrate"), 1200);
    flashStatus("Cube solved. " + solveMoves.length + " moves. jake@stockunlock.com if you want to talk.");
    setStatusMid("Solution complete — " + solveMoves.join(" "));
  }

  // --- Tabs ----------------------------------------------------------------

  function initTabs() {
    const tabs = document.querySelectorAll(".tab");
    const sections = document.querySelectorAll(".tab-section");
    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        const target = tab.dataset.tab;
        tabs.forEach((t) => t.classList.toggle("active", t === tab));
        sections.forEach((s) => s.classList.toggle("active", s.dataset.section === target));
        const body = document.getElementById("windowBody");
        if (body) body.scrollTop = 0;
        onBodyScroll();
        flashStatus("Opened: " + tab.textContent.trim());
      });
    });
  }

  // --- Start menu ----------------------------------------------------------

  function initStartMenu() {
    const orb = document.getElementById("startOrb");
    const menu = document.getElementById("startMenu");
    if (!orb || !menu) return;

    function toggle(show) {
      const open = show !== undefined ? show : menu.classList.contains("hidden");
      menu.classList.toggle("hidden", !open);
      orb.classList.toggle("active", open);
    }

    orb.addEventListener("click", (e) => {
      e.stopPropagation();
      toggle();
    });
    document.addEventListener("click", (e) => {
      if (menu.classList.contains("hidden")) return;
      if (!menu.contains(e.target) && e.target !== orb) toggle(false);
    });

    menu.querySelectorAll(".sm-item[data-jump]").forEach((el) => {
      el.addEventListener("click", () => {
        const target = el.dataset.jump;
        const tab = document.querySelector(`.tab[data-tab="${target}"]`);
        if (tab) tab.click();
        toggle(false);
      });
    });

    const scramble = document.getElementById("scrambleBtn");
    if (scramble) {
      scramble.addEventListener("click", () => {
        newScramble();
        // Move scroll to 0 so progression starts fresh.
        const body = document.getElementById("windowBody");
        if (body) body.scrollTop = 0;
        toggle(false);
        flashStatus("New scramble loaded.");
      });
    }

    const power = menu.querySelector(".sm-power");
    if (power) {
      power.addEventListener("click", () => {
        flashStatus("Shutdown cancelled. Email jake@stockunlock.com instead.");
        toggle(false);
      });
    }

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !menu.classList.contains("hidden")) toggle(false);
    });
  }

  // --- Clock ---------------------------------------------------------------

  function tickClock() {
    const now = new Date();
    const h = now.getHours(), m = now.getMinutes(), s = now.getSeconds();
    const hrEl = document.getElementById("hHour");
    const mnEl = document.getElementById("hMin");
    const scEl = document.getElementById("hSec");
    if (hrEl) hrEl.style.transform = `rotate(${(h % 12) * 30 + m * 0.5}deg)`;
    if (mnEl) mnEl.style.transform = `rotate(${m * 6 + s * 0.1}deg)`;
    if (scEl) scEl.style.transform = `rotate(${s * 6}deg)`;

    const hh12 = ((h + 11) % 12) + 1;
    const mm = String(m).padStart(2, "0");
    const ampm = h >= 12 ? "PM" : "AM";
    const label = `${hh12}:${mm} ${ampm}`;

    const lbl = document.getElementById("clockLbl");
    if (lbl) lbl.textContent = label;

    const taskTime = document.getElementById("taskTime");
    const taskDate = document.getElementById("taskDate");
    if (taskTime) taskTime.textContent = label;
    if (taskDate) {
      const opts = { weekday: "short", month: "short", day: "numeric" };
      taskDate.textContent = now.toLocaleDateString(undefined, opts);
    }
  }

  // --- Status bar flash ----------------------------------------------------

  let statusTimer = null;
  function flashStatus(msg) {
    const left = document.getElementById("statusLeft");
    if (!left) return;
    left.textContent = msg;
    clearTimeout(statusTimer);
    statusTimer = setTimeout(() => { left.textContent = "Ready"; }, 3800);
  }

  // --- Window buttons ------------------------------------------------------

  function initWindowButtons() {
    const win = document.getElementById("mainWindow");
    const close = document.querySelector(".tb-close");
    const min = document.querySelector(".tb-min");
    const max = document.querySelector(".tb-max");
    const task = document.querySelector('.tb-task[data-task="main"]');
    let minimized = false;
    let maxed = false;
    let original = null;

    function minimize() {
      minimized = true;
      win.style.transition = "transform 200ms ease, opacity 200ms ease";
      win.style.transform = "translateY(40px) scale(0.96)";
      win.style.opacity = "0";
      win.style.pointerEvents = "none";
      task.classList.remove("active");
    }
    function restore() {
      minimized = false;
      win.style.transform = "";
      win.style.opacity = "";
      win.style.pointerEvents = "";
      task.classList.add("active");
    }

    if (min) min.addEventListener("click", () => (minimized ? restore() : minimize()));
    if (task) task.addEventListener("click", () => (minimized ? restore() : minimize()));
    if (max) {
      max.addEventListener("click", () => {
        if (!maxed) {
          original = {
            top: win.style.top, left: win.style.left,
            width: win.style.width, height: win.style.height,
          };
          win.style.top = "4px";
          win.style.left = "4px";
          win.style.width = "calc(100vw - 240px)";
          win.style.height = "calc(100vh - 56px)";
          maxed = true;
        } else {
          win.style.top = original.top || "";
          win.style.left = original.left || "";
          win.style.width = original.width || "";
          win.style.height = original.height || "";
          maxed = false;
        }
      });
    }
    if (close) {
      close.addEventListener("click", () => {
        flashStatus("Closing is not implemented. Email jake@stockunlock.com instead.");
        win.animate(
          [{ transform: "scale(1)", opacity: 1 }, { transform: "scale(0.97)", opacity: 0.7 }, { transform: "scale(1)", opacity: 1 }],
          { duration: 420, easing: "ease-out" }
        );
      });
    }
  }

  // --- Draggable window ----------------------------------------------------

  function initDrag() {
    const win = document.getElementById("mainWindow");
    const bar = document.getElementById("titleBar");
    if (!win || !bar) return;
    let dragging = false;
    let startX = 0, startY = 0;
    let origLeft = 0, origTop = 0;

    bar.addEventListener("mousedown", (e) => {
      if (e.target.closest(".tb-btn")) return;
      dragging = true;
      startX = e.clientX;
      startY = e.clientY;
      const rect = win.getBoundingClientRect();
      origLeft = rect.left;
      origTop = rect.top;
      win.style.transition = "none";
      document.body.style.cursor = "move";
    });
    document.addEventListener("mousemove", (e) => {
      if (!dragging) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      win.style.left = origLeft + dx + "px";
      win.style.top = Math.max(4, origTop + dy) + "px";
      win.style.right = "auto";
      win.style.bottom = "auto";
    });
    document.addEventListener("mouseup", () => {
      if (dragging) {
        dragging = false;
        document.body.style.cursor = "";
        win.style.transition = "";
      }
    });
  }

  // --- Mail buttons --------------------------------------------------------

  function initMailButtons() {
    document.querySelectorAll("[data-mail]").forEach((el) => {
      el.addEventListener("click", () => {
        window.location.href = "mailto:jake@stockunlock.com";
      });
    });
    const email = document.getElementById("emailBtn");
    if (email) email.addEventListener("click", () => {
      window.location.href = "mailto:jake@stockunlock.com";
    });
    const resume = document.getElementById("resumeBtn");
    if (resume) resume.addEventListener("click", () => {
      flashStatus("Resume.pdf: email jake@stockunlock.com to receive a current copy.");
    });
  }

  // --- Desktop icons -------------------------------------------------------

  function initDesktopIcons() {
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
  }

  // --- Init ----------------------------------------------------------------

  document.addEventListener("DOMContentLoaded", () => {
    setupCube();
    initTabs();
    initStartMenu();
    initWindowButtons();
    initDrag();
    initMailButtons();
    initDesktopIcons();

    const body = document.getElementById("windowBody");
    if (body) body.addEventListener("scroll", onBodyScroll, { passive: true });

    tickClock();
    setInterval(tickClock, 1000);

    flashStatus("Welcome — scroll to run the solver on the scrambled cube.");
  });

})();
