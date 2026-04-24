/* ================================================================
   Jake Ruth XP — app.js
   ================================================================ */

(function () {
  "use strict";

  // ---------- window registry ----------
  const WINDOWS = {
    "my-computer":     document.getElementById("win-my-computer"),
    "cubemaster":      document.getElementById("win-cubemaster"),
    "search-companion":document.getElementById("win-search-companion"),
    "readme":          document.getElementById("win-readme"),
    "recycle":         document.getElementById("win-recycle"),
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
    updateTaskStrip(id);
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

  function toggleWindow(id) {
    if (OPEN_STATE[id]) closeWindow(id); else openWindow(id);
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
      case "readme":           return "📄";
      case "recycle":          return "🗑️";
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
          // minimize (hide) if clicking active task
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
  function updateTaskStrip(activeId) {
    TASK_STRIP.querySelectorAll(".task-btn").forEach(b => {
      const isFocused = WINDOWS[b.dataset.taskId]?.classList.contains("focused");
      b.classList.toggle("active", Boolean(isFocused));
    });
  }

  // open my-computer by default
  OPEN_STATE["my-computer"] = true;
  rebuildTaskStrip();
  focusWindow("my-computer");

  // ---------- clicks: data-open / data-close / data-scroll / data-copy / data-action ----------
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
        .then(() => toast(`Copied "${text}" to Clipbook.`))
        .catch(() => toast(`Clipbook unavailable. Email: ${text}`));
      closeStartMenu();
      return;
    }
    const actEl = e.target.closest("[data-action]");
    if (actEl) {
      const action = actEl.dataset.action;
      if (action === "close" || action === "minimize") {
        const wnd = actEl.closest(".xp-window, .xp-dialog");
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
        toast("Opening default mail client… (jake@stockunlock.com)");
        setTimeout(() => { window.location.href = "mailto:jake@stockunlock.com?subject=I%20have%20an%20interesting%20problem"; }, 250);
        return;
      }
    }
    // clicking XP window should focus
    const wnd = e.target.closest(".xp-window");
    if (wnd) {
      const entry = Object.entries(WINDOWS).find(([, v]) => v === wnd);
      if (entry) focusWindow(entry[0]);
    }
    // clicking outside start menu closes it
    if (!e.target.closest("#start-menu") && !e.target.closest("#start-btn")) {
      closeStartMenu();
    }
  });

  // icons: double click opens, single click highlights
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

  // ---------- Scroll-driven cube solve ----------
  const contentEl = document.getElementById("content-scroll");
  const progressFill = document.getElementById("cube-progress-fill");
  const progressVal  = document.getElementById("cube-progress-value");
  const statusMid    = document.getElementById("status-mid");
  let scrollPct = 0;

  function updateScrollPct() {
    if (!contentEl) return;
    const max = contentEl.scrollHeight - contentEl.clientHeight;
    scrollPct = max > 0 ? Math.min(1, Math.max(0, contentEl.scrollTop / max)) : 0;
    const p = Math.round(scrollPct * 100);
    if (progressFill) progressFill.style.width = p + "%";
    if (progressVal)  progressVal.textContent = p + "%";
    if (statusMid)    statusMid.textContent = `Scroll: ${p}%  ·  Cube solve: ${p}%`;
    applyCubeProgress(scrollPct);
  }
  contentEl?.addEventListener("scroll", updateScrollPct);
  window.addEventListener("resize", updateScrollPct);

  // ---------- CubeMaster (three.js) ----------
  // Simple 3x3 cube built from 27 cubelets with colored face stickers.
  let THREE_READY = false;
  let cubeRenderer, cubeScene, cubeCamera, cubeGroup, cubelets = [];
  let cubeScramble = [];   // array of { axis: 'x'|'y'|'z', layer: -1|0|1, dir: 1|-1, angle: targetRadians }
  let cubeStageEl;

  const FACE_COLORS = {
    right:  0xc40000, // +X red
    left:   0xff7a00, // -X orange
    top:    0xffffff, // +Y white
    bottom: 0xffd500, // -Y yellow
    front:  0x009b48, // +Z green
    back:   0x0051ba, // -Z blue
    inside: 0x111418,
  };

  function cubeletMaterials(x, y, z) {
    // order: +x, -x, +y, -y, +z, -z
    return [
      new THREE.MeshBasicMaterial({ color: x ===  1 ? FACE_COLORS.right  : FACE_COLORS.inside }),
      new THREE.MeshBasicMaterial({ color: x === -1 ? FACE_COLORS.left   : FACE_COLORS.inside }),
      new THREE.MeshBasicMaterial({ color: y ===  1 ? FACE_COLORS.top    : FACE_COLORS.inside }),
      new THREE.MeshBasicMaterial({ color: y === -1 ? FACE_COLORS.bottom : FACE_COLORS.inside }),
      new THREE.MeshBasicMaterial({ color: z ===  1 ? FACE_COLORS.front  : FACE_COLORS.inside }),
      new THREE.MeshBasicMaterial({ color: z === -1 ? FACE_COLORS.back   : FACE_COLORS.inside }),
    ];
  }

  function buildCube() {
    if (!window.THREE) return false;

    cubeStageEl = document.getElementById("cube-stage");
    if (!cubeStageEl) return false;

    const w = cubeStageEl.clientWidth || 240;
    const h = cubeStageEl.clientHeight || 240;

    cubeScene = new THREE.Scene();
    cubeCamera = new THREE.PerspectiveCamera(35, w / h, 0.1, 100);
    cubeCamera.position.set(5, 4.5, 6);
    cubeCamera.lookAt(0, 0, 0);

    cubeRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    cubeRenderer.setPixelRatio(window.devicePixelRatio || 1);
    cubeRenderer.setSize(w, h);
    cubeStageEl.innerHTML = "";
    cubeStageEl.appendChild(cubeRenderer.domElement);

    cubeGroup = new THREE.Group();
    cubeScene.add(cubeGroup);

    const size = 0.95;
    const gap = 1.02;
    cubelets = [];
    for (let x = -1; x <= 1; x++) {
      for (let y = -1; y <= 1; y++) {
        for (let z = -1; z <= 1; z++) {
          const geom = new THREE.BoxGeometry(size, size, size);
          const mats = cubeletMaterials(x, y, z);
          const mesh = new THREE.Mesh(geom, mats);
          mesh.position.set(x * gap, y * gap, z * gap);
          mesh.userData = { x, y, z };
          cubelets.push(mesh);
          cubeGroup.add(mesh);

          // edge outline for toy chunkiness
          const edges = new THREE.LineSegments(
            new THREE.EdgesGeometry(geom),
            new THREE.LineBasicMaterial({ color: 0x111111 })
          );
          mesh.add(edges);
        }
      }
    }

    THREE_READY = true;
    animateCube();
    window.addEventListener("resize", onCubeResize);
    // generate scramble
    cubeScramble = generateScramble(18);
    applyCubeProgress(scrollPct);
    return true;
  }

  function onCubeResize() {
    if (!cubeRenderer || !cubeStageEl) return;
    const w = cubeStageEl.clientWidth, h = cubeStageEl.clientHeight;
    if (w === 0 || h === 0) return;
    cubeCamera.aspect = w / h;
    cubeCamera.updateProjectionMatrix();
    cubeRenderer.setSize(w, h);
  }

  function animateCube() {
    if (!THREE_READY) return;
    cubeGroup.rotation.y += 0.004;
    cubeGroup.rotation.x = Math.sin(performance.now() * 0.0002) * 0.15 - 0.2;
    cubeRenderer.render(cubeScene, cubeCamera);
    requestAnimationFrame(animateCube);
  }

  // ---- "scramble" representation ----
  // We precompute a set of moves. Each move is { axis, layer, dir } where
  // axis ∈ {'x','y','z'}, layer ∈ {-1,0,1}. The cubelets for that layer are
  // rotated 90deg (π/2) in dir direction around axis, relative to the solved
  // state. To render a partial (ambient) solve, we interpolate the fraction
  // of the scramble that is "applied" based on scroll — near top: all moves
  // applied (scrambled), near bottom: none applied (solved). We rebuild each
  // cubelet's transform from scratch each frame based on progress.

  function generateScramble(nMoves) {
    const axes = ['x', 'y', 'z'];
    const layers = [-1, 0, 1];
    const dirs = [1, -1];
    const moves = [];
    let lastAxis = null;
    for (let i = 0; i < nMoves; i++) {
      let axis;
      do { axis = axes[(Math.random() * 3) | 0]; } while (axis === lastAxis);
      lastAxis = axis;
      const layer = layers[(Math.random() * 3) | 0];
      const dir = dirs[(Math.random() * 2) | 0];
      moves.push({ axis, layer, dir });
    }
    return moves;
  }

  // Rebuild cubelet transforms: start from solved home position, then apply
  // the first K moves where K is floor((1 - progress) * scramble.length). The
  // final partial move lerps with (1 - progress) fractional part for smooth
  // solve animation.
  const TMP = new THREE.Vector3 ? new THREE.Vector3() : null;

  function applyCubeProgress(progress) {
    if (!THREE_READY || !cubelets.length) return;
    // progress 0 -> fully scrambled; 1 -> fully solved
    const applied = (1 - progress) * cubeScramble.length; // number of moves to apply
    const whole = Math.floor(applied);
    const frac  = applied - whole;

    // Start from solved state
    cubelets.forEach(c => {
      c.position.set(c.userData.x * 1.02, c.userData.y * 1.02, c.userData.z * 1.02);
      c.quaternion.identity();
    });

    // Apply first `whole` moves fully
    for (let i = 0; i < whole; i++) {
      applyMove(cubeScramble[i], Math.PI / 2);
    }
    // Apply next move partially
    if (whole < cubeScramble.length && frac > 0) {
      applyMove(cubeScramble[whole], (Math.PI / 2) * frac);
    }
  }

  function applyMove(move, angle) {
    if (!move) return;
    const { axis, layer, dir } = move;
    const axisVec =
      axis === 'x' ? new THREE.Vector3(1, 0, 0) :
      axis === 'y' ? new THREE.Vector3(0, 1, 0) :
                     new THREE.Vector3(0, 0, 1);
    const theta = angle * dir;
    const q = new THREE.Quaternion().setFromAxisAngle(axisVec, theta);

    cubelets.forEach(c => {
      const pos = c.position;
      const coord =
        axis === 'x' ? Math.round(pos.x / 1.02) :
        axis === 'y' ? Math.round(pos.y / 1.02) :
                       Math.round(pos.z / 1.02);
      if (coord !== layer) return;
      pos.applyQuaternion(q);
      c.quaternion.premultiply(q);
    });
  }

  function ensureCubeStarted() {
    if (THREE_READY) {
      onCubeResize();
      return;
    }
    if (!window.THREE) {
      // fallback: draw a placeholder
      cubeStageEl = document.getElementById("cube-stage");
      if (cubeStageEl) {
        cubeStageEl.innerHTML =
          '<div style="color:#fff;text-align:center;padding:40px 10px;font-size:11px">' +
          '3D disabled (three.js failed to load)<br/>' +
          'Ambient solve still linked to scroll.</div>';
      }
      return;
    }
    buildCube();
  }

  document.getElementById("cube-scramble")?.addEventListener("click", () => {
    cubeScramble = generateScramble(20);
    applyCubeProgress(scrollPct);
    toast("Cube scrambled. Scroll to solve.");
  });

  // ---------- Network graph (Search Companion) ----------
  const GRAPH_EL = document.getElementById("graph");
  const NODES = [
    { id: "jake",         label: "Jake Ruth",     group: "self" },
    { id: "stock-unlock", label: "Stock Unlock",  group: "co" },
    { id: "yc",           label: "YC W22",        group: "co" },
    { id: "oscar",        label: "Oscar Health",  group: "co" },
    { id: "youni",        label: "Youni",         group: "co" },
    { id: "commerce",     label: "CommerceHub",   group: "co" },
    { id: "acm",          label: "ACM @ SUNY",    group: "co" },
    { id: "typescript",   label: "TypeScript",    group: "skill" },
    { id: "react",        label: "React",         group: "skill" },
    { id: "node",         label: "Node.js",       group: "skill" },
    { id: "product",      label: "0→1 Product",   group: "skill" },
    { id: "ai",           label: "Driver-seat AI",group: "skill" },
    { id: "cube",         label: "Rubik's (13.95s)",group: "fun" },
    { id: "unicycle",     label: "Unicycle",      group: "fun" },
    { id: "wedding",      label: "Getting married", group: "fun" },
  ];
  const LINKS = [
    ["jake", "stock-unlock"],
    ["jake", "oscar"],
    ["jake", "youni"],
    ["jake", "commerce"],
    ["jake", "acm"],
    ["jake", "cube"],
    ["jake", "unicycle"],
    ["jake", "wedding"],
    ["jake", "typescript"],
    ["jake", "react"],
    ["jake", "node"],
    ["jake", "product"],
    ["jake", "ai"],
    ["stock-unlock", "yc"],
    ["stock-unlock", "product"],
    ["stock-unlock", "typescript"],
    ["stock-unlock", "react"],
    ["stock-unlock", "node"],
    ["oscar", "typescript"],
    ["oscar", "react"],
    ["cube", "unicycle"],
    ["acm", "commerce"],
  ];

  let GRAPH_BUILT = false;
  function ensureGraphBuilt() {
    if (GRAPH_BUILT) return;
    buildGraph();
    GRAPH_BUILT = true;
  }

  function buildGraph() {
    if (!GRAPH_EL) return;
    const W = 420, H = 360;
    // simple radial layout: Jake center, others on rings by group
    const byId = Object.fromEntries(NODES.map(n => [n.id, n]));
    NODES.forEach(n => { n.x = W / 2; n.y = H / 2; });

    const groups = ["co", "skill", "fun"];
    const radii  = { co: 110, skill: 150, fun: 90 };
    groups.forEach(g => {
      const members = NODES.filter(n => n.group === g);
      const n = members.length;
      const rOffset = g === "skill" ? 0.4 : g === "co" ? 0 : Math.PI;
      members.forEach((node, i) => {
        const angle = rOffset + (i / n) * Math.PI * 2;
        const rad = radii[g];
        node.x = W / 2 + Math.cos(angle) * rad;
        node.y = H / 2 + Math.sin(angle) * rad * 0.85;
      });
    });

    // a little jitter so nothing overlaps
    NODES.forEach(n => {
      if (n.group !== "self") {
        n.x += (Math.random() - 0.5) * 10;
        n.y += (Math.random() - 0.5) * 10;
      }
    });

    // links
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

      const r = n.group === "self" ? 22 : 16;
      const circle = document.createElementNS(svgNS, "circle");
      circle.setAttribute("r", r);
      g.appendChild(circle);

      const text = document.createElementNS(svgNS, "text");
      text.setAttribute("y", r + 10);
      text.textContent = n.label;
      g.appendChild(text);

      g.addEventListener("click", () => {
        toast(`"${n.label}" — related to Jake`);
      });
      nodeG.appendChild(g);
    });
    GRAPH_EL.appendChild(nodeG);
  }

  // ---------- init: update status ----------
  updateScrollPct();
  // preload graph/cube lazily on first open, not eagerly

  // ---------- window position persistence is skipped for simplicity ----------

  // ---------- expose for debugging ----------
  window.__JAKEXP = {
    openWindow, closeWindow, toggleWindow, applyCubeProgress,
    generateScramble,
  };
})();
