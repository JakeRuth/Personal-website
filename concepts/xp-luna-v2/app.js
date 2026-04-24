/* ================================================================
   Jake Ruth XP v2 — app.js
   Refinements over v1:
     - Dropped scroll-driven ambient cube (content is tighter, that gimmick noised things up).
     - CubeMaster now wired to a real layer-by-layer solver (cube-solver.js).
     - Cube 3D state is rebuilt from facelet state every frame, so any scramble
       solves correctly via animated move sequence.
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
  const OPEN_STATE = Object.create(null);

  // ---------- toast ----------
  let toastTimer = null;
  function toast(msg) {
    TOAST.textContent = msg;
    TOAST.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => TOAST.classList.remove("show"), 2200);
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
  setInterval(tickClock, 30 * 1000);

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
    OPEN_STATE[id] = true;
    focusWindow(id);
    rebuildTaskStrip();
    if (id === "cubemaster") ensureCubeStarted();
    if (id === "search-companion") ensureGraphBuilt();
  }

  function closeWindow(id) {
    const el = WINDOWS[id];
    if (!el) return;
    el.classList.add("hidden");
    delete OPEN_STATE[id];
    rebuildTaskStrip();
  }

  function labelFor(id) {
    const el = WINDOWS[id];
    return el?.dataset.title || id;
  }
  function iconFor(id) {
    switch (id) {
      case "my-computer":      return "🖥️";
      case "cubemaster":       return "🧊";
      case "search-companion": return "🔍";
      default: return "🪟";
    }
  }

  function rebuildTaskStrip() {
    TASK_STRIP.innerHTML = "";
    Object.keys(OPEN_STATE).forEach(id => {
      const btn = document.createElement("button");
      btn.className = "task-btn";
      btn.dataset.taskId = id;
      btn.innerHTML = `<span class="tb-swatch">${iconFor(id)}</span><span>${labelFor(id)}</span>`;
      btn.addEventListener("click", () => {
        const el = WINDOWS[id];
        if (!el) return;
        const focused = el.classList.contains("focused");
        if (focused) {
          el.classList.add("hidden");
          delete OPEN_STATE[id];
          rebuildTaskStrip();
        } else {
          if (el.classList.contains("hidden")) el.classList.remove("hidden");
          OPEN_STATE[id] = true;
          focusWindow(id);
        }
      });
      TASK_STRIP.appendChild(btn);
    });
    updateTaskStrip();
  }
  function updateTaskStrip() {
    TASK_STRIP.querySelectorAll(".task-btn").forEach(b => {
      const isFocused = WINDOWS[b.dataset.taskId]?.classList.contains("focused");
      b.classList.toggle("active", Boolean(isFocused));
    });
  }

  // open my-computer by default
  OPEN_STATE["my-computer"] = true;
  rebuildTaskStrip();
  focusWindow("my-computer");

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
      const target = document.getElementById(scrollEl.dataset.scroll);
      if (target) {
        openWindow("my-computer");
        const content = document.getElementById("content-scroll");
        if (content && target) {
          content.scrollTo({ top: target.offsetTop - 8, behavior: "smooth" });
        }
      }
      closeStartMenu();
      e.preventDefault();
      return;
    }
    const copyEl = e.target.closest("[data-copy]");
    if (copyEl) {
      const text = copyEl.dataset.copy;
      (navigator.clipboard?.writeText?.(text) ?? Promise.resolve())
        .then(() => toast(`Copied "${text}" to Clipboard.`))
        .catch(() => toast(`Clipboard unavailable. Email: ${text}`));
      closeStartMenu();
      return;
    }
    const actEl = e.target.closest("[data-action]");
    if (actEl) {
      const action = actEl.dataset.action;
      if (action === "close" || action === "minimize") {
        const wnd = actEl.closest(".xp-window");
        if (wnd) {
          const entry = Object.entries(WINDOWS).find(([, v]) => v === wnd);
          if (entry) closeWindow(entry[0]);
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

  // icons: double-click opens, single click selects
  document.querySelectorAll(".desktop-icons .icon").forEach(icon => {
    icon.addEventListener("dblclick", () => {
      const id = icon.dataset.open;
      if (id) openWindow(id);
    });
    icon.addEventListener("click", () => {
      document.querySelectorAll(".icon.selected").forEach(i => i.classList.remove("selected"));
      icon.classList.add("selected");
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

  // Facelet cube state (single source of truth for rendering)
  let faceletCube = window.CubeSolver.solvedFacelets();

  // three.js renderer state
  let THREE_READY = false;
  let cubeRenderer, cubeScene, cubeCamera, cubeGroup;
  let stickerMeshes = []; // 54 sticker planes we can recolor
  let cubeStageEl;

  const FACE_HEX = {
    W: 0xffffff, // white
    Y: 0xffd500, // yellow
    G: 0x009b48, // green
    B: 0x0051ba, // blue
    R: 0xc40000, // red
    O: 0xff7a00, // orange
  };

  // Three.js face indexing: U(0), R(1), F(2), D(3), L(4), B(5)
  // We'll build 27 cubelets with black inside and placeholder materials, and stick 9 sticker planes per face.
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
    cubeStageEl.innerHTML = "";
    cubeStageEl.appendChild(cubeRenderer.domElement);

    cubeGroup = new THREE.Group();
    cubeScene.add(cubeGroup);

    // A single "body" of 27 black cubelets
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

    // Add 54 sticker planes
    stickerMeshes = buildStickers();
    stickerMeshes.forEach(s => cubeGroup.add(s.mesh));

    // initial paint
    repaintStickers();

    THREE_READY = true;
    window.addEventListener("resize", onCubeResize);
    animateCube();
    return true;
  }

  function buildStickers() {
    // Each face is a 3x3 grid of planes. We return meshes with metadata {face, idx}.
    // Positions reference:
    //  U (+Y): y = +1.5, normal +Y
    //  D (-Y): y = -1.5
    //  F (+Z): z = +1.5
    //  B (-Z): z = -1.5
    //  R (+X): x = +1.5
    //  L (-X): x = -1.5
    const list = [];
    const stSize = 0.9;
    const half = 1.5;

    // For indexing each 3x3 face: layout is rows top-to-bottom, cols left-to-right
    //   0 1 2
    //   3 4 5
    //   6 7 8

    // Helper to add 9 stickers for a face
    function addFace(faceId, axis, sign) {
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
          const idx = r * 3 + c;
          const geom = new THREE.PlaneGeometry(stSize, stSize);
          const mat = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
          const mesh = new THREE.Mesh(geom, mat);

          // position + rotation per face
          const cc = c - 1;       // -1, 0, 1
          const rr = r - 1;       // -1, 0, 1
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
            case 5: // B: -Z — face looks at -Z. Sticker grid maps: row0 at top (+y), col0 at LEFT of BACK face = +x in world
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

  // gentle idle rotation
  function animateCube() {
    if (!THREE_READY) return;
    if (!moveAnim) {
      cubeGroup.rotation.y += 0.003;
      cubeGroup.rotation.x = Math.sin(performance.now() * 0.00015) * 0.1 - 0.25;
    }
    cubeRenderer.render(cubeScene, cubeCamera);
    requestAnimationFrame(animateCube);
  }

  function ensureCubeStarted() {
    if (THREE_READY) { onCubeResize(); return; }
    if (!window.THREE) {
      cubeStageEl = document.getElementById("cube-stage");
      if (cubeStageEl) {
        cubeStageEl.innerHTML =
          '<div style="color:#fff;text-align:center;padding:40px 10px;font-size:11px">' +
          '3D disabled (three.js failed to load).' +
          '</div>';
      }
      return;
    }
    buildCube();
  }

  // ---------- Move animation / queue ----------
  // We animate each move by spinning the affected layer, then at the end of
  // the animation we commit the facelet state and repaint stickers back to static.

  let moveQueue = [];
  let moveAnim = null; // { move, startT, durMs, layerGroup }

  function enqueueMoves(moves) {
    for (const m of moves) moveQueue.push(m);
    if (!moveAnim) nextMove();
  }

  function nextMove() {
    if (!moveQueue.length) {
      moveAnim = null;
      updateStatus();
      return;
    }
    const m = moveQueue.shift();
    startMoveAnim(m);
  }

  function startMoveAnim(move) {
    const face = move[0];
    const prime = move.endsWith("'");
    const axisInfo = FACE_AXIS[face];
    const layerGroup = new THREE.Group();
    cubeGroup.add(layerGroup);

    // Move affected stickers + body cubelets into the layer group (temp reparent).
    const affected = [];
    // Collect cubelet meshes + sticker meshes whose world position is on the layer.
    cubeGroup.children.slice().forEach(child => {
      if (child === layerGroup) return;
      const p = child.position;
      if (axisInfo.test(p)) {
        affected.push(child);
      }
    });
    affected.forEach(c => {
      cubeGroup.remove(c);
      layerGroup.add(c);
    });

    const dur = Math.max(80, 180 - Math.min(moveQueue.length * 5, 120));
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
      // Finalize: move children back to cubeGroup, commit facelet state, repaint.
      moveAnim.affected.forEach(c => {
        moveAnim.layerGroup.remove(c);
        cubeGroup.add(c);
        // Snap to grid so no drift accumulates.
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

  // Which layer a face-turn affects, and rotation axis.
  const FACE_AXIS = {
    U: { axis: 'y', sign: +1, test: p => p.y >  0.5 },
    D: { axis: 'y', sign: -1, test: p => p.y < -0.5 },
    F: { axis: 'z', sign: +1, test: p => p.z >  0.5 },
    B: { axis: 'z', sign: -1, test: p => p.z < -0.5 },
    R: { axis: 'x', sign: +1, test: p => p.x >  0.5 },
    L: { axis: 'x', sign: -1, test: p => p.x < -0.5 },
  };

  // Sanity test: a solved cube after a turn should not equal solved. (dev-time)
  // (skipped in shipped build)

  // ---------- UI: scramble / solve ----------
  const btnScramble = document.getElementById("cube-scramble");
  const btnSolve    = document.getElementById("cube-solve");
  const elState     = document.getElementById("cube-state");
  const elMoves     = document.getElementById("cube-moves");

  function updateStatus() {
    if (!elState || !elMoves) return;
    const solved = window.CubeSolver.faceletsSolved(faceletCube);
    elState.textContent = solved ? "Solved" : (moveQueue.length || moveAnim ? "Solving…" : "Scrambled");
    elMoves.textContent = String(moveQueue.length + (moveAnim ? 1 : 0));
    if (btnSolve) btnSolve.disabled = solved || !!moveAnim || moveQueue.length > 0;
    if (btnScramble) btnScramble.disabled = !!moveAnim || moveQueue.length > 0;
  }

  btnScramble?.addEventListener("click", () => {
    if (moveAnim || moveQueue.length) return;
    // Scramble depth tuned to the solver: bidirectional BFS on full cube
    // state, search depth 10 per side. 9-move scrambles solve in ~100-300ms
    // in the browser, which keeps the "Solve" button feeling responsive.
    const scramble = window.CubeSolver.randomScramble(9);
    window.CubeSolver.applyFaceletMoves(faceletCube, scramble);
    repaintStickers();
    toast("Cube scrambled. Press Solve.");
    updateStatus();
  });

  btnSolve?.addEventListener("click", () => {
    if (moveAnim || moveQueue.length) return;
    const t0 = performance.now();
    const moves = window.CubeSolver.solveFromFacelets(faceletCube);
    const dt = performance.now() - t0;
    if (!moves || !moves.length) {
      toast(moves ? "Already solved." : "Solver timed out.");
      updateStatus();
      return;
    }
    toast(`Solving in ${moves.length} moves (${dt.toFixed(0)}ms).`);
    enqueueMoves(moves);
    updateStatus();
  });

  // initial status when cube opens
  setTimeout(updateStatus, 200);

  // ==============================================================
  // Network graph (Search Companion) — trimmed to essentials
  // ==============================================================
  const GRAPH_EL = document.getElementById("graph");
  const NODES = [
    { id: "jake",         label: "Jake Ruth",     group: "self" },
    { id: "stock-unlock", label: "Stock Unlock",  group: "co" },
    { id: "oscar",        label: "Oscar Health",  group: "co" },
    { id: "commerce",     label: "CommerceHub",   group: "co" },
    { id: "youni",        label: "Youni",         group: "co" },
    { id: "ai",           label: "Driver-seat AI",group: "skill" },
    { id: "founding",     label: "0→1 Founding",  group: "skill" },
    { id: "python",       label: "Python / Go",   group: "skill" },
    { id: "cube",         label: "Rubik's 13.95s",group: "fun" },
    { id: "unicycle",     label: "Unicycle",      group: "fun" },
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
    ["oscar", "python"],
    ["cube", "unicycle"],
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

    // radial layout
    const groups = ["co", "skill", "fun"];
    const radii  = { co: 110, skill: 140, fun: 100 };
    const angleOffset = { co: -Math.PI / 2, skill: Math.PI / 2, fun: Math.PI };

    NODES.forEach(n => { n.x = W / 2; n.y = H / 2; });
    groups.forEach(g => {
      const members = NODES.filter(n => n.group === g);
      const n = members.length;
      members.forEach((node, i) => {
        const spread = g === "skill" ? Math.PI * 0.9 : Math.PI * 1.2;
        const angle = angleOffset[g] + ((i - (n - 1) / 2) / n) * spread;
        const rad = radii[g];
        node.x = W / 2 + Math.cos(angle) * rad;
        node.y = H / 2 + Math.sin(angle) * rad * 0.85;
      });
    });

    const svgNS = "http://www.w3.org/2000/svg";
    GRAPH_EL.innerHTML = "";

    const linkG = document.createElementNS(svgNS, "g");
    LINKS.forEach(([a, b]) => {
      const A = byId[a], B = byId[b];
      if (!A || !B) return;
      const line = document.createElementNS(svgNS, "line");
      line.setAttribute("class", "link");
      line.setAttribute("x1", A.x); line.setAttribute("y1", A.y);
      line.setAttribute("x2", B.x); line.setAttribute("y2", B.y);
      linkG.appendChild(line);
    });
    GRAPH_EL.appendChild(linkG);

    const nodeG = document.createElementNS(svgNS, "g");
    NODES.forEach(n => {
      const g = document.createElementNS(svgNS, "g");
      g.setAttribute("class", `node ${n.group}`);
      g.setAttribute("transform", `translate(${n.x}, ${n.y})`);

      const r = n.group === "self" ? 22 : 15;
      const circle = document.createElementNS(svgNS, "circle");
      circle.setAttribute("r", r);
      g.appendChild(circle);

      const text = document.createElementNS(svgNS, "text");
      text.setAttribute("y", r + 10);
      text.textContent = n.label;
      g.appendChild(text);

      g.addEventListener("click", () => {
        const bubble = document.getElementById("dog-bubble");
        if (bubble) bubble.textContent = nodeBlurb(n.id);
      });
      nodeG.appendChild(g);
    });
    GRAPH_EL.appendChild(nodeG);
  }

  function nodeBlurb(id) {
    switch (id) {
      case "jake":         return "Jake. Engineer, founder. Re-entering the workforce.";
      case "stock-unlock": return "Built it. Scaled to 8 + thousands of customers. Profitable. Not full-time there.";
      case "oscar":        return "Senior SWE 2017–2021. ~50 to ~150+ engineers.";
      case "commerce":     return "First gig. Took down prod as an intern. Learned what code-review culture feels like.";
      case "youni":        return "Co-founded. React Native. Couldn't solve cold-start. Shut down.";
      case "ai":           return "Driver in the driver's seat, not driven by the car.";
      case "founding":     return "Led a YC interview. Raised $1.335M. Scaled a team of 8.";
      case "python":       return "Python, Go, TypeScript, React. Since pre-hooks React.";
      case "cube":         return "3x3 avg 13.95s. Competed 2008–2014.";
      case "unicycle":     return "Once solved a cube on a unicycle at an Oscar talent show.";
      case "wedding":      return "Getting married. Pretty happy.";
      default: return "Related to Jake.";
    }
  }

  // ==============================================================
  // expose for debugging
  // ==============================================================
  window.__JAKEXP = {
    openWindow, closeWindow,
    cube: () => faceletCube,
    solver: window.CubeSolver,
  };
})();
