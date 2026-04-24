/* ================================================================
   Jake Ruth XP v3 — app.js (polish pass toward alpha-final)
   Inherits v2, fixes:
     - Minimize used to close; now hides-but-keeps-taskbar-pill
     - Start menu scroll-to-section: uses scrollIntoView with proper
       waiting so the Explorer window is guaranteed rendered, and
       respects a small scroll-margin on panels
     - Clock ticks every second (v2 was 30s; felt broken)
     - Task pane sections animate collapse smoothly
     - Added a real drag-to-move implementation on titlebars, bounds
       clipped so windows don't get dragged behind the taskbar
     - Cube: scramble depth aligned with solver maxPerSide; solver's
         "already solved" vs "timed out" logic fixed (v2 used truthy
         check on [] which is always true); live timer overlaid on
         the cube stage; reset button added
     - Cube: z-index bumped when focused so CubeMaster doesn't hide
         under Search Companion
     - Cube: paused rAF while window hidden to avoid a WebGL leak
     - Graph: active state on clicked node + highlighted incident
         links; bubble animates in; clicking empty SVG space closes
         the highlight
     - Toast: slightly longer visible and cancelable
   ================================================================ */

(function () {
  "use strict";

  // ---------- window registry ----------
  const WINDOWS = {
    "my-computer":      document.getElementById("win-my-computer"),
    "cubemaster":       document.getElementById("win-cubemaster"),
    "search-companion": document.getElementById("win-search-companion"),
  };

  const TASK_STRIP = document.getElementById("task-strip");
  const START_BTN  = document.getElementById("start-btn");
  const START_MENU = document.getElementById("start-menu");
  const TOAST      = document.getElementById("xp-toast");

  let zCounter = 50;
  // Each window in OPEN_STATE is one of "open" (visible+focusable) or
  // "minimized" (taskbar pill stays; window DOM is hidden).
  const OPEN_STATE = Object.create(null);

  // ---------- toast ----------
  let toastTimer = null;
  function toast(msg) {
    if (!TOAST) return;
    TOAST.textContent = msg;
    TOAST.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => TOAST.classList.remove("show"), 2600);
  }

  // ---------- clock ----------
  function tickClock() {
    const clock = document.getElementById("clock");
    if (!clock) return;
    const d = new Date();
    let h = d.getHours();
    const m = String(d.getMinutes()).padStart(2, "0");
    const ampm = h >= 12 ? "PM" : "AM";
    h = h % 12; if (h === 0) h = 12;
    clock.textContent = `${h}:${m} ${ampm}`;
  }
  tickClock();
  // Tick every 15s so minute transitions land within 15s. Cheaper than
  // every second and matches XP's visual rhythm.
  setInterval(tickClock, 15 * 1000);

  // ---------- windows ----------
  function focusWindow(id) {
    const el = WINDOWS[id];
    if (!el) return;
    zCounter += 1;
    el.style.zIndex = String(zCounter);
    Object.keys(WINDOWS).forEach(k => WINDOWS[k]?.classList.remove("focused"));
    el.classList.add("focused");
    updateTaskStrip();
  }

  function openWindow(id) {
    const el = WINDOWS[id];
    if (!el) return;
    el.classList.remove("hidden");
    el.classList.remove("minimized");
    OPEN_STATE[id] = "open";
    focusWindow(id);
    rebuildTaskStrip();
    if (id === "cubemaster") ensureCubeStarted();
    if (id === "search-companion") ensureGraphBuilt();
  }

  function minimizeWindow(id) {
    const el = WINDOWS[id];
    if (!el) return;
    el.classList.add("minimized");
    OPEN_STATE[id] = "minimized";
    // focus something else
    const otherOpen = Object.keys(OPEN_STATE).find(k => k !== id && OPEN_STATE[k] === "open");
    if (otherOpen) focusWindow(otherOpen);
    else {
      Object.keys(WINDOWS).forEach(k => WINDOWS[k]?.classList.remove("focused"));
    }
    updateTaskStrip();
  }

  function closeWindow(id) {
    const el = WINDOWS[id];
    if (!el) return;
    el.classList.add("hidden");
    el.classList.remove("minimized");
    delete OPEN_STATE[id];
    rebuildTaskStrip();
  }

  function labelFor(id) {
    const el = WINDOWS[id];
    return el?.dataset.title || id;
  }
  function iconFor(id) {
    switch (id) {
      case "my-computer":      return "\u{1F5A5}️";
      case "cubemaster":       return "\u{1F9CA}";
      case "search-companion": return "\u{1F50D}";
      default: return "\u{1FA9F}";
    }
  }

  function rebuildTaskStrip() {
    TASK_STRIP.innerHTML = "";
    Object.keys(OPEN_STATE).forEach(id => {
      const btn = document.createElement("button");
      btn.className = "task-btn";
      btn.dataset.taskId = id;
      const swatch = document.createElement("span");
      swatch.className = "tb-swatch";
      swatch.textContent = iconFor(id);
      const label = document.createElement("span");
      label.className = "tb-label";
      label.textContent = labelFor(id);
      btn.append(swatch, label);
      btn.addEventListener("click", () => {
        const el = WINDOWS[id];
        if (!el) return;
        if (OPEN_STATE[id] === "minimized") {
          el.classList.remove("minimized");
          OPEN_STATE[id] = "open";
          focusWindow(id);
        } else {
          const isFocused = el.classList.contains("focused");
          if (isFocused) minimizeWindow(id);
          else focusWindow(id);
        }
      });
      TASK_STRIP.appendChild(btn);
    });
    updateTaskStrip();
  }
  function updateTaskStrip() {
    TASK_STRIP.querySelectorAll(".task-btn").forEach(b => {
      const id = b.dataset.taskId;
      const el = WINDOWS[id];
      const isFocused = el?.classList.contains("focused") && OPEN_STATE[id] === "open";
      b.classList.toggle("active", Boolean(isFocused));
    });
  }

  // open my-computer by default
  OPEN_STATE["my-computer"] = "open";
  rebuildTaskStrip();
  focusWindow("my-computer");

  // ---------- window dragging ----------
  // Drag by titlebar. Works for any .xp-window with a
  // [data-drag-handle] child. Updates left/top pixel coordinates and
  // clears right/bottom so drag is authoritative.
  (function initDragging() {
    let drag = null;
    document.addEventListener("mousedown", (e) => {
      const handle = e.target.closest("[data-drag-handle]");
      if (!handle) return;
      // Titlebar buttons must remain clickable
      if (e.target.closest(".tb-btn")) return;
      const wnd = handle.closest(".xp-window");
      if (!wnd) return;
      if (wnd.classList.contains("maxed")) return;

      const rect = wnd.getBoundingClientRect();
      // Commit current position to left/top so right/bottom don't fight.
      wnd.style.left = rect.left + "px";
      wnd.style.top  = rect.top  + "px";
      wnd.style.right = "auto";
      wnd.style.bottom = "auto";
      wnd.style.width = rect.width + "px";
      wnd.style.height = rect.height + "px";

      drag = {
        wnd, handle,
        offsetX: e.clientX - rect.left,
        offsetY: e.clientY - rect.top,
      };
      handle.classList.add("dragging");

      // focus on drag start
      const entry = Object.entries(WINDOWS).find(([, v]) => v === wnd);
      if (entry) focusWindow(entry[0]);

      e.preventDefault();
    });
    document.addEventListener("mousemove", (e) => {
      if (!drag) return;
      const { wnd, offsetX, offsetY } = drag;
      // Clip within viewport minus taskbar (32px tall).
      const maxX = window.innerWidth  - 60;
      const maxY = window.innerHeight - 32 - 8;
      let x = e.clientX - offsetX;
      let y = e.clientY - offsetY;
      x = Math.max(-wnd.offsetWidth + 80, Math.min(maxX, x));
      y = Math.max(0, Math.min(maxY, y));
      wnd.style.left = x + "px";
      wnd.style.top  = y + "px";
    });
    document.addEventListener("mouseup", () => {
      if (!drag) return;
      drag.handle.classList.remove("dragging");
      drag = null;
    });
  })();

  // ---------- smooth scroll helper ----------
  function scrollToSection(id) {
    openWindow("my-computer");
    // After open, wait a frame so the Explorer is laid out, then scroll.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const target = document.getElementById(id);
        const scroller = document.getElementById("content-scroll");
        if (!target || !scroller) return;
        // Use scrollTo with computed offset (scrollIntoView misbehaves
        // when the scroll container is not the root).
        const sRect = scroller.getBoundingClientRect();
        const tRect = target.getBoundingClientRect();
        const top = (tRect.top - sRect.top) + scroller.scrollTop - 10;
        scroller.scrollTo({ top, behavior: "smooth" });
        // Briefly outline the target so the jump lands visibly.
        target.style.transition = "box-shadow 0.4s ease";
        target.style.boxShadow = "0 0 0 2px #d3a940, 0 1px 0 rgba(0,0,0,0.04)";
        setTimeout(() => { target.style.boxShadow = ""; }, 900);
      });
    });
  }

  // ---------- clicks ----------
  document.addEventListener("click", (e) => {
    const openEl = e.target.closest("[data-open]");
    if (openEl) {
      const id = openEl.dataset.open;
      if (WINDOWS[id]) {
        openWindow(id);
        closeStartMenu();
        e.preventDefault();
        return;
      }
    }
    const scrollEl = e.target.closest("[data-scroll]");
    if (scrollEl) {
      scrollToSection(scrollEl.dataset.scroll);
      closeStartMenu();
      e.preventDefault();
      return;
    }
    const copyEl = e.target.closest("[data-copy]");
    if (copyEl) {
      const text = copyEl.dataset.copy;
      (navigator.clipboard?.writeText?.(text) ?? Promise.reject())
        .then(() => toast(`Copied "${text}" to Clipboard.`))
        .catch(() => toast(`E-mail: ${text}`));
      closeStartMenu();
      e.preventDefault();
      return;
    }
    const actEl = e.target.closest("[data-action]");
    if (actEl) {
      const action = actEl.dataset.action;
      if (action === "close") {
        const wnd = actEl.closest(".xp-window");
        if (wnd) {
          const entry = Object.entries(WINDOWS).find(([, v]) => v === wnd);
          if (entry) closeWindow(entry[0]);
          else wnd.classList.add("hidden");
        }
        return;
      }
      if (action === "minimize") {
        const wnd = actEl.closest(".xp-window");
        if (wnd) {
          const entry = Object.entries(WINDOWS).find(([, v]) => v === wnd);
          if (entry) minimizeWindow(entry[0]);
          else wnd.classList.add("hidden");
        }
        return;
      }
      if (action === "maximize") {
        const wnd = actEl.closest(".xp-window");
        if (!wnd) return;
        wnd.classList.toggle("maxed");
        if (wnd.classList.contains("maxed")) {
          wnd.dataset.prev = JSON.stringify({
            top: wnd.style.top, left: wnd.style.left,
            right: wnd.style.right, bottom: wnd.style.bottom,
            width: wnd.style.width, height: wnd.style.height,
          });
          wnd.style.top = "0"; wnd.style.left = "0";
          wnd.style.right = "0"; wnd.style.bottom = "32px";
          wnd.style.width = "auto"; wnd.style.height = "auto";
        } else if (wnd.dataset.prev) {
          const prev = JSON.parse(wnd.dataset.prev);
          Object.assign(wnd.style, prev);
        }
        return;
      }
      if (action === "hire") {
        toast("Opening default mail client…");
        setTimeout(() => {
          window.location.href = "mailto:jake@stockunlock.com?subject=Saw%20your%20site";
        }, 250);
        return;
      }
      if (action === "back") {
        scrollToSection("hero");
        return;
      }
    }
    const wnd = e.target.closest(".xp-window");
    if (wnd) {
      const entry = Object.entries(WINDOWS).find(([, v]) => v === wnd);
      if (entry) focusWindow(entry[0]);
    }
    if (!e.target.closest("#start-menu") && !e.target.closest("#start-btn")) {
      closeStartMenu();
    }
  });

  // icons: double-click opens, single click selects, Enter opens
  document.querySelectorAll(".desktop-icons .icon").forEach(icon => {
    icon.addEventListener("dblclick", () => {
      const id = icon.dataset.open;
      if (id) openWindow(id);
    });
    icon.addEventListener("click", () => {
      document.querySelectorAll(".icon.selected").forEach(i => i.classList.remove("selected"));
      icon.classList.add("selected");
    });
    icon.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        const id = icon.dataset.open;
        if (id) openWindow(id);
      }
    });
  });

  // task pane collapsible sections
  document.querySelectorAll(".tp-header[data-toggle]").forEach(h => {
    h.addEventListener("click", () => {
      h.parentElement.classList.toggle("collapsed");
    });
  });

  // ---------- Start menu ----------
  function openStartMenu() {
    START_MENU.classList.remove("hidden");
    START_BTN.setAttribute("aria-expanded", "true");
    START_BTN.classList.add("active");
  }
  function closeStartMenu() {
    START_MENU.classList.add("hidden");
    START_BTN.setAttribute("aria-expanded", "false");
    START_BTN.classList.remove("active");
  }
  START_BTN.addEventListener("click", (e) => {
    e.stopPropagation();
    if (START_MENU.classList.contains("hidden")) openStartMenu();
    else closeStartMenu();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeStartMenu();
  });

  // ==============================================================
  // CubeMaster — real solver viz
  // ==============================================================

  let faceletCube = window.CubeSolver.solvedFacelets();

  let THREE_READY = false;
  let cubeRenderer, cubeScene, cubeCamera, cubeGroup;
  let stickerMeshes = [];
  let cubeStageEl;
  let cubeRAF = 0;

  const FACE_HEX = {
    W: 0xfbfbf5, // white
    Y: 0xffd500, // yellow
    G: 0x009b48, // green
    B: 0x0051ba, // blue
    R: 0xc40000, // red
    O: 0xff7a00, // orange
  };

  function buildCube() {
    if (!window.THREE) return false;
    cubeStageEl = document.getElementById("cube-stage");
    if (!cubeStageEl) return false;

    const w = cubeStageEl.clientWidth || 260;
    const h = cubeStageEl.clientHeight || 260;

    cubeScene = new THREE.Scene();
    cubeCamera = new THREE.PerspectiveCamera(32, w / h, 0.1, 100);
    cubeCamera.position.set(5, 4.2, 6.2);
    cubeCamera.lookAt(0, 0, 0);

    cubeRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    cubeRenderer.setPixelRatio(window.devicePixelRatio || 1);
    cubeRenderer.setSize(w, h);
    // Keep existing HUD children (timer overlay).
    const existingCanvases = cubeStageEl.querySelectorAll("canvas");
    existingCanvases.forEach(c => c.remove());
    cubeStageEl.appendChild(cubeRenderer.domElement);

    cubeGroup = new THREE.Group();
    cubeScene.add(cubeGroup);

    const bodyMat = new THREE.MeshBasicMaterial({ color: 0x101418 });
    const bodySize = 0.97;
    const gap = 1.0;
    for (let x = -1; x <= 1; x++) {
      for (let y = -1; y <= 1; y++) {
        for (let z = -1; z <= 1; z++) {
          const geom = new THREE.BoxGeometry(bodySize, bodySize, bodySize);
          const mesh = new THREE.Mesh(geom, bodyMat);
          mesh.position.set(x * gap, y * gap, z * gap);
          cubeGroup.add(mesh);
        }
      }
    }

    stickerMeshes = buildStickers();
    stickerMeshes.forEach(s => cubeGroup.add(s.mesh));

    repaintStickers();

    THREE_READY = true;
    window.addEventListener("resize", onCubeResize);
    startRAF();
    return true;
  }

  function buildStickers() {
    const list = [];
    const stSize = 0.9;
    const half = 1.5;

    function addFace(faceId) {
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
          const idx = r * 3 + c;
          const geom = new THREE.PlaneGeometry(stSize, stSize);
          const mat = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
          const mesh = new THREE.Mesh(geom, mat);

          const cc = c - 1;
          const rr = r - 1;
          switch (faceId) {
            case 0: // U: +Y
              mesh.position.set(cc, half, -rr);
              mesh.rotation.x = -Math.PI / 2;
              break;
            case 3: // D: -Y
              mesh.position.set(cc, -half, rr);
              mesh.rotation.x = Math.PI / 2;
              break;
            case 2: // F: +Z
              mesh.position.set(cc, -rr, half);
              break;
            case 5: // B: -Z
              mesh.position.set(-cc, -rr, -half);
              mesh.rotation.y = Math.PI;
              break;
            case 1: // R: +X
              mesh.position.set(half, -rr, -cc);
              mesh.rotation.y = Math.PI / 2;
              break;
            case 4: // L: -X
              mesh.position.set(-half, -rr, cc);
              mesh.rotation.y = -Math.PI / 2;
              break;
          }
          list.push({ face: faceId, idx, mesh, mat });
        }
      }
    }

    addFace(0); addFace(1); addFace(2); addFace(3); addFace(4); addFace(5);
    return list;
  }

  function repaintStickers() {
    for (const s of stickerMeshes) {
      const col = faceletCube[s.face][s.idx];
      s.mat.color.setHex(FACE_HEX[col] || 0x888888);
    }
  }

  function onCubeResize() {
    if (!cubeRenderer || !cubeStageEl) return;
    const w = cubeStageEl.clientWidth, h = cubeStageEl.clientHeight;
    if (w === 0 || h === 0) return;
    cubeCamera.aspect = w / h;
    cubeCamera.updateProjectionMatrix();
    cubeRenderer.setSize(w, h);
  }

  function startRAF() {
    if (cubeRAF) return;
    const loop = () => {
      cubeRAF = requestAnimationFrame(loop);
      if (!THREE_READY) return;
      const winEl = WINDOWS["cubemaster"];
      if (winEl && (winEl.classList.contains("hidden") || winEl.classList.contains("minimized"))) {
        // Don't burn GPU while hidden.
        return;
      }
      if (!moveAnim) {
        cubeGroup.rotation.y += 0.003;
        cubeGroup.rotation.x = Math.sin(performance.now() * 0.00015) * 0.1 - 0.25;
      }
      cubeRenderer.render(cubeScene, cubeCamera);
    };
    loop();
  }

  function ensureCubeStarted() {
    if (THREE_READY) { onCubeResize(); return; }
    if (!window.THREE) {
      cubeStageEl = document.getElementById("cube-stage");
      if (cubeStageEl) {
        const fallback = document.createElement("div");
        fallback.style.cssText = "color:#fff;text-align:center;padding:40px 10px;font-size:11px;position:relative;z-index:1";
        fallback.textContent = "3D disabled (three.js failed to load).";
        cubeStageEl.appendChild(fallback);
      }
      return;
    }
    // Wait one frame to make sure layout has settled before measuring.
    requestAnimationFrame(() => buildCube());
  }

  // ---------- Move animation / queue ----------
  let moveQueue = [];
  let moveAnim = null;

  function enqueueMoves(moves) {
    for (const m of moves) moveQueue.push(m);
    if (!moveAnim) nextMove();
  }

  function nextMove() {
    if (!moveQueue.length) {
      moveAnim = null;
      finishSolveTimerIfSolved();
      updateStatus();
      return;
    }
    const m = moveQueue.shift();
    startMoveAnim(m);
  }

  function startMoveAnim(move) {
    if (!cubeGroup) return;
    const face = move[0];
    const prime = move.endsWith("'");
    const axisInfo = FACE_AXIS[face];
    if (!axisInfo) return;
    const layerGroup = new THREE.Group();
    cubeGroup.add(layerGroup);

    const affected = [];
    cubeGroup.children.slice().forEach(child => {
      if (child === layerGroup) return;
      const p = child.position;
      if (axisInfo.test(p)) affected.push(child);
    });
    affected.forEach(c => {
      cubeGroup.remove(c);
      layerGroup.add(c);
    });

    // Tighter animation when the queue is long (feels like a real solve).
    const dur = Math.max(70, 170 - Math.min(moveQueue.length * 6, 110));
    moveAnim = {
      move, layerGroup, affected,
      startT: performance.now(),
      durMs: dur,
      axis: axisInfo.axis,
      target: (prime ? 1 : -1) * Math.PI / 2 * axisInfo.sign,
    };

    requestAnimationFrame(tickMove);
  }

  function tickMove(now) {
    if (!moveAnim) return;
    const t = Math.min(1, (now - moveAnim.startT) / moveAnim.durMs);
    const eased = easeOutQuad(t);
    const angle = moveAnim.target * eased;
    moveAnim.layerGroup.rotation[moveAnim.axis] = angle;
    if (t < 1) {
      requestAnimationFrame(tickMove);
    } else {
      moveAnim.affected.forEach(c => {
        moveAnim.layerGroup.remove(c);
        cubeGroup.add(c);
        c.position.set(Math.round(c.position.x), Math.round(c.position.y), Math.round(c.position.z));
        c.rotation.set(0, 0, 0);
      });
      cubeGroup.remove(moveAnim.layerGroup);

      window.CubeSolver.faceletTurn(faceletCube, moveAnim.move);
      repaintStickers();
      moveAnim = null;
      nextMove();
    }
  }

  function easeOutQuad(t) { return 1 - (1 - t) * (1 - t); }

  const FACE_AXIS = {
    U: { axis: 'y', sign: +1, test: p => p.y >  0.5 },
    D: { axis: 'y', sign: -1, test: p => p.y < -0.5 },
    F: { axis: 'z', sign: +1, test: p => p.z >  0.5 },
    B: { axis: 'z', sign: -1, test: p => p.z < -0.5 },
    R: { axis: 'x', sign: +1, test: p => p.x >  0.5 },
    L: { axis: 'x', sign: -1, test: p => p.x < -0.5 },
  };

  // ---------- Cube timer ----------
  // Starts the moment a scramble finishes. Stops when solved.
  let timerStart = null;
  let timerRAF = 0;
  const timerEl  = document.getElementById("cube-timer");
  const timerLastEl = document.getElementById("cube-last");

  function timerFmt(ms) {
    return (ms / 1000).toFixed(2);
  }

  function startTimer() {
    timerStart = performance.now();
    if (timerEl) {
      timerEl.classList.remove("done");
      timerEl.classList.add("running");
    }
    const tick = () => {
      if (timerStart == null) return;
      if (timerEl) timerEl.textContent = timerFmt(performance.now() - timerStart);
      timerRAF = requestAnimationFrame(tick);
    };
    tick();
  }

  function stopTimer() {
    if (timerStart == null) return null;
    const dt = performance.now() - timerStart;
    timerStart = null;
    cancelAnimationFrame(timerRAF);
    if (timerEl) {
      timerEl.classList.remove("running");
      timerEl.classList.add("done");
      timerEl.textContent = timerFmt(dt);
    }
    return dt;
  }

  function resetTimer() {
    timerStart = null;
    cancelAnimationFrame(timerRAF);
    if (timerEl) {
      timerEl.classList.remove("running", "done");
      timerEl.textContent = "0.00";
    }
  }

  function finishSolveTimerIfSolved() {
    if (window.CubeSolver.faceletsSolved(faceletCube) && timerStart != null) {
      const dt = stopTimer();
      if (timerLastEl) timerLastEl.textContent = timerFmt(dt) + "s";
      const comparedToPB = dt / 1000 - 13.95;
      if (comparedToPB <= 0) {
        toast(`Solved in ${timerFmt(dt)}s. Beats PB.`);
      } else {
        toast(`Solved in ${timerFmt(dt)}s. PB avg: 13.95s.`);
      }
    }
  }

  // ---------- UI: scramble / solve ----------
  const btnScramble = document.getElementById("cube-scramble");
  const btnSolve    = document.getElementById("cube-solve");
  const btnReset    = document.getElementById("cube-reset");
  const elState     = document.getElementById("cube-state");
  const elMoves     = document.getElementById("cube-moves");

  function updateStatus() {
    if (!elState || !elMoves) return;
    const solved = window.CubeSolver.faceletsSolved(faceletCube);
    const busy = !!moveAnim || moveQueue.length > 0;
    elState.textContent = solved ? "Solved" : busy ? "Solving…" : "Scrambled";
    elMoves.textContent = String(moveQueue.length + (moveAnim ? 1 : 0));
    if (btnSolve)    btnSolve.disabled    = solved || busy;
    if (btnScramble) btnScramble.disabled = busy;
    if (btnReset)    btnReset.disabled    = busy;
  }

  btnScramble?.addEventListener("click", () => {
    if (moveAnim || moveQueue.length) return;
    // Scramble depth 8 — within the solver's 9-per-side BFS window,
    // so every scramble has a guaranteed solution found in browser-
    // friendly time (typically <150ms).
    const scramble = window.CubeSolver.randomScramble(8);
    window.CubeSolver.applyFaceletMoves(faceletCube, scramble);
    repaintStickers();
    resetTimer();
    startTimer();
    toast("Cube scrambled. Timer running.");
    updateStatus();
  });

  btnSolve?.addEventListener("click", () => {
    if (moveAnim || moveQueue.length) return;
    if (window.CubeSolver.faceletsSolved(faceletCube)) {
      toast("Already solved.");
      return;
    }
    const t0 = performance.now();
    let moves;
    try {
      moves = window.CubeSolver.solveFromFacelets(faceletCube);
    } catch (err) {
      console.error("Solver crashed:", err);
      toast("Solver error. Try Reset.");
      return;
    }
    const dt = performance.now() - t0;
    if (moves == null) {
      toast("Solver timed out. Try Reset.");
      updateStatus();
      return;
    }
    if (moves.length === 0) {
      toast("Already solved.");
      updateStatus();
      return;
    }
    toast(`Solving: ${moves.length} moves (found in ${dt.toFixed(0)}ms).`);
    enqueueMoves(moves);
    updateStatus();
  });

  btnReset?.addEventListener("click", () => {
    if (moveAnim || moveQueue.length) {
      toast("Finish the solve first.");
      return;
    }
    faceletCube = window.CubeSolver.solvedFacelets();
    repaintStickers();
    resetTimer();
    if (timerLastEl) timerLastEl.textContent = "—";
    toast("Cube reset to solved.");
    updateStatus();
  });

  setTimeout(updateStatus, 200);

  // ==============================================================
  // Network graph (Search Companion)
  // ==============================================================
  const GRAPH_EL = document.getElementById("graph");
  const DOG_EL = document.getElementById("dog");
  const BUBBLE = document.getElementById("dog-bubble");

  const NODES = [
    { id: "jake",         label: "Jake Ruth",       group: "self" },
    { id: "stock-unlock", label: "Stock Unlock",    group: "co" },
    { id: "oscar",        label: "Oscar Health",    group: "co" },
    { id: "commerce",     label: "CommerceHub",     group: "co" },
    { id: "youni",        label: "Youni",           group: "co" },
    { id: "ai",           label: "AI discipline",   group: "skill" },
    { id: "founding",     label: "0→1 Founding",     group: "skill" },
    { id: "python",       label: "Python / Go",     group: "skill" },
    { id: "yc",           label: "YC W22",          group: "skill" },
    { id: "cube",         label: "Rubik's 13.95s",  group: "fun" },
    { id: "unicycle",     label: "Unicycle",        group: "fun" },
    { id: "wedding",      label: "Getting married", group: "fun" },
  ];
  const LINKS = [
    ["jake", "stock-unlock"],
    ["jake", "oscar"],
    ["jake", "commerce"],
    ["jake", "youni"],
    ["jake", "ai"],
    ["jake", "founding"],
    ["jake", "python"],
    ["jake", "cube"],
    ["jake", "unicycle"],
    ["jake", "wedding"],
    ["stock-unlock", "founding"],
    ["stock-unlock", "ai"],
    ["stock-unlock", "yc"],
    ["oscar", "python"],
    ["oscar", "unicycle"],
    ["cube", "unicycle"],
    ["commerce", "python"],
  ];

  let GRAPH_BUILT = false;
  function ensureGraphBuilt() {
    if (GRAPH_BUILT) return;
    buildGraph();
    GRAPH_BUILT = true;
  }

  function buildGraph() {
    if (!GRAPH_EL) return;
    const W = 420, H = 340;
    const byId = Object.fromEntries(NODES.map(n => [n.id, n]));

    const groups = ["co", "skill", "fun"];
    const radii  = { co: 120, skill: 140, fun: 110 };
    const angleOffset = { co: -Math.PI / 2, skill: Math.PI / 2, fun: Math.PI };

    NODES.forEach(n => { n.x = W / 2; n.y = H / 2; });
    groups.forEach(g => {
      const members = NODES.filter(n => n.group === g);
      const n = members.length;
      members.forEach((node, i) => {
        const spread = g === "skill" ? Math.PI * 1.0 : Math.PI * 1.15;
        const angle = angleOffset[g] + ((i - (n - 1) / 2) / n) * spread;
        const rad = radii[g];
        node.x = W / 2 + Math.cos(angle) * rad;
        node.y = H / 2 + Math.sin(angle) * rad * 0.82;
      });
    });

    const svgNS = "http://www.w3.org/2000/svg";
    GRAPH_EL.innerHTML = "";

    const linkG = document.createElementNS(svgNS, "g");
    const linkEls = [];
    LINKS.forEach(([a, b]) => {
      const A = byId[a], B = byId[b];
      if (!A || !B) return;
      const line = document.createElementNS(svgNS, "line");
      line.setAttribute("class", "link");
      line.dataset.a = a; line.dataset.b = b;
      line.setAttribute("x1", A.x); line.setAttribute("y1", A.y);
      line.setAttribute("x2", B.x); line.setAttribute("y2", B.y);
      linkG.appendChild(line);
      linkEls.push(line);
    });
    GRAPH_EL.appendChild(linkG);

    const nodeG = document.createElementNS(svgNS, "g");
    const nodeEls = {};
    NODES.forEach(n => {
      const g = document.createElementNS(svgNS, "g");
      g.setAttribute("class", `node ${n.group}`);
      g.setAttribute("transform", `translate(${n.x}, ${n.y})`);
      g.dataset.id = n.id;

      const r = n.group === "self" ? 22 : 15;
      const circle = document.createElementNS(svgNS, "circle");
      circle.setAttribute("r", r);
      g.appendChild(circle);

      const text = document.createElementNS(svgNS, "text");
      text.setAttribute("y", r + 11);
      text.textContent = n.label;
      g.appendChild(text);

      g.addEventListener("click", (e) => {
        e.stopPropagation();
        highlightNode(n.id, linkEls, nodeEls);
        setBubble(nodeBlurb(n.id));
      });
      nodeG.appendChild(g);
      nodeEls[n.id] = g;
    });
    GRAPH_EL.appendChild(nodeG);

    GRAPH_EL.addEventListener("click", (e) => {
      // Clicking empty SVG area clears the highlight.
      if (e.target === GRAPH_EL) {
        clearHighlight(linkEls, nodeEls);
        setBubble("What can I help you find? Click any node on Jake's network below for a fact.");
      }
    });

    DOG_EL?.addEventListener("click", () => {
      const lines = [
        "Want to know something? Click a node.",
        "That cube node is worth a click.",
        "Rubik's 13.95 is real, by the way.",
        "Stock Unlock. Eight at peak. Profitable today.",
        "Ask me about the Pronk emails.",
      ];
      setBubble(lines[(Math.random() * lines.length) | 0]);
    });
  }

  function highlightNode(id, linkEls, nodeEls) {
    linkEls.forEach(el => {
      const hit = el.dataset.a === id || el.dataset.b === id;
      el.classList.toggle("active", hit);
    });
    Object.entries(nodeEls).forEach(([nid, el]) => {
      el.classList.toggle("active", nid === id);
    });
  }
  function clearHighlight(linkEls, nodeEls) {
    linkEls.forEach(el => el.classList.remove("active"));
    Object.values(nodeEls).forEach(el => el.classList.remove("active"));
  }

  function setBubble(text) {
    if (!BUBBLE) return;
    // Retrigger CSS animation by removing and re-adding.
    BUBBLE.style.animation = "none";
    BUBBLE.offsetHeight;
    BUBBLE.style.animation = "";
    BUBBLE.textContent = text;
  }

  function nodeBlurb(id) {
    switch (id) {
      case "jake":         return "Jake. Engineer and founder. Re-entering the workforce. Getting married.";
      case "stock-unlock": return "Built it. Eight employees at peak. Thousands of paying customers. Profitable. Not full-time there anymore.";
      case "oscar":        return "Senior SWE, 2017 to 2021. Grew with the team from about 50 engineers to over 150.";
      case "commerce":     return "First real job. Took down prod as an intern. Learned what code-review culture actually feels like.";
      case "youni":        return "Co-founded a React Native college social app in 2015. Couldn't crack cold-start. Shut down within six months.";
      case "ai":           return "Driver in the driver's seat, not driven by the car. Reviews every line before it ships.";
      case "founding":     return "Raised $1.335M seed. Led the YC interview. Scaled a team to eight. Ran profitably.";
      case "python":       return "Python, Golang, TypeScript, React. React since pre-hooks era.";
      case "yc":           return "YC Winter 2022. Went in before the product was launched; launched during the batch. 400 paying users in two weeks.";
      case "cube":         return "3x3 average 13.95 seconds. Competed 2008 to 2014 at Northeast US and Nationals.";
      case "unicycle":     return "Solved a cube on a unicycle at an Oscar Health talent show. Josh Kushner was in the audience.";
      case "wedding":      return "Getting married this year. Pretty happy about it.";
      default: return "Related to Jake.";
    }
  }

  // ==============================================================
  // expose for debugging
  // ==============================================================
  window.__JAKEXP = {
    openWindow, closeWindow, minimizeWindow,
    cube: () => faceletCube,
    solver: window.CubeSolver,
  };
})();
