/* ==========================================================
   Jake Ruth — Professional Edition (Vista Faithful)
   ========================================================== */

/* ---------- Cube: stickers + scramble/solve interpolation ---------- */

const FACE_COLORS = {
  // Vista-friendly vivid-but-soft. Keep order consistent.
  U: "#ffffff",   // top   (white)
  D: "#ffd633",   // bottom (yellow)
  F: "#2ecc4f",   // front (green)
  B: "#2d77d1",   // back  (blue)
  R: "#e6413a",   // right (red)
  L: "#ff8a23",   // left  (orange)
};

const FACE_SELECTORS = {
  U: ".face-top",
  D: ".face-bottom",
  F: ".face-front",
  B: ".face-back",
  R: ".face-right",
  L: ".face-left",
};

// Deterministic pseudo-random so scramble is stable per page load seed.
function mulberry32(seed) {
  return function () {
    let t = (seed += 0x6D2B79F5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

let cubeSeed = Math.floor(Math.random() * 1e9);
let rng = mulberry32(cubeSeed);

/**
 * Build a scrambled sticker plan for each face.
 * The "solved" plan for face X is 9 stickers of X's color.
 * The "scrambled" plan is a face-biased random permutation (keeps
 * visual coherence: majority color of face X is still X, but 3-5
 * off-color stickers are scattered in).
 */
function buildPlans() {
  const faces = Object.keys(FACE_COLORS);
  const solved = {};
  const scrambled = {};

  faces.forEach((f) => {
    const color = FACE_COLORS[f];
    solved[f] = Array.from({ length: 9 }, () => color);

    // Start with solved, then swap in 4-5 random off-colors.
    const arr = solved[f].slice();
    const offCount = 3 + Math.floor(rng() * 3); // 3..5
    const indices = shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8], rng).slice(0, offCount);
    indices.forEach((idx) => {
      let other;
      do {
        other = faces[Math.floor(rng() * faces.length)];
      } while (other === f);
      arr[idx] = FACE_COLORS[other];
    });
    scrambled[f] = arr;
  });

  return { solved, scrambled };
}

function shuffle(arr, rngFn) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rngFn() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

let plans = buildPlans();

function renderFaces() {
  Object.keys(FACE_SELECTORS).forEach((f) => {
    const el = document.querySelector(FACE_SELECTORS[f]);
    if (!el) return;
    el.innerHTML = "";
    for (let i = 0; i < 9; i++) {
      const s = document.createElement("div");
      s.className = "sticker";
      s.dataset.face = f;
      s.dataset.idx = i;
      s.style.background = plans.scrambled[f][i];
      el.appendChild(s);
    }
  });
}

/**
 * Per face, decide how many stickers are "fixed" (= scramble) based on
 * progress t in [0,1]. At t=0, all 9 are scramble. At t=1, all 9 are solved.
 * The order of "solve reveal" is random per face but deterministic per load.
 */
const solveOrder = {};
Object.keys(FACE_COLORS).forEach((f) => {
  solveOrder[f] = shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8], rng);
});

function applyProgress(t) {
  t = Math.max(0, Math.min(1, t));
  Object.keys(FACE_SELECTORS).forEach((f) => {
    const el = document.querySelector(FACE_SELECTORS[f]);
    if (!el) return;
    const solvedCount = Math.round(t * 9);
    const order = solveOrder[f];
    const stickers = el.querySelectorAll(".sticker");
    order.forEach((stickerIdx, rank) => {
      const s = stickers[stickerIdx];
      if (!s) return;
      if (rank < solvedCount) {
        s.style.background = plans.solved[f][stickerIdx];
      } else {
        s.style.background = plans.scrambled[f][stickerIdx];
      }
    });
  });

  // gentle rotation tied to progress so it "twists" as it solves
  const cube = document.getElementById("cube");
  if (cube) {
    const rx = -24 + Math.sin(t * Math.PI) * 6;
    const ry = -36 + t * 90;
    cube.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
  }

  const pct = Math.round(t * 100);
  const pctEl = document.getElementById("cubePct");
  if (pctEl) pctEl.textContent = pct + "%";

  const mid = document.getElementById("statusMid");
  if (mid) {
    if (pct >= 100) mid.textContent = "Cube solved ✓ — thanks for scrolling to the bottom";
    else if (pct === 0) mid.textContent = "Scrambled — scroll the main window to solve the cube";
    else mid.textContent = `Solving... ${pct}% — keep scrolling`;
  }
}

function rescramble() {
  cubeSeed = Math.floor(Math.random() * 1e9);
  rng = mulberry32(cubeSeed);
  plans = buildPlans();
  Object.keys(FACE_COLORS).forEach((f) => {
    solveOrder[f] = shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8], rng);
  });
  renderFaces();
  applyProgress(currentProgress);
  flashStatus("Cube re-scrambled");
}

/* ---------- Scroll tracking ---------- */

let currentProgress = 0;
let lastFlourish = false;

function onBodyScroll() {
  const body = document.getElementById("windowBody");
  if (!body) return;
  const max = body.scrollHeight - body.clientHeight;
  const t = max > 0 ? body.scrollTop / max : 0;
  currentProgress = t;
  applyProgress(t);

  if (t >= 0.995 && !lastFlourish) {
    lastFlourish = true;
    triggerFlourish();
  } else if (t < 0.9 && lastFlourish) {
    lastFlourish = false;
  }
}

function triggerFlourish() {
  const scene = document.querySelector(".cube-scene");
  if (!scene) return;
  scene.classList.add("celebrate");
  setTimeout(() => scene.classList.remove("celebrate"), 1200);
  flashStatus("Cube solved — nicely done. Email: jake@stockunlock.com");
}

/* ---------- Tabs ---------- */

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
      flashStatus(`Opened: ${tab.textContent.trim()}`);
    });
  });
}

/* ---------- Start menu ---------- */

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
      rescramble();
      toggle(false);
    });
  }

  const power = menu.querySelector(".sm-power");
  if (power) {
    power.addEventListener("click", () => {
      flashStatus("Shutdown cancelled — nice try");
      toggle(false);
    });
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !menu.classList.contains("hidden")) toggle(false);
  });
}

/* ---------- Clock ---------- */

function tickClock() {
  const now = new Date();
  const h = now.getHours();
  const m = now.getMinutes();
  const s = now.getSeconds();

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

/* ---------- Status bar flash ---------- */

let statusTimer = null;
function flashStatus(msg) {
  const left = document.getElementById("statusLeft");
  if (!left) return;
  left.textContent = msg;
  clearTimeout(statusTimer);
  statusTimer = setTimeout(() => { left.textContent = "Ready"; }, 3500);
}

/* ---------- Window buttons ---------- */

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

/* ---------- Draggable window (lightweight) ---------- */

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

/* ---------- Button side-effects ---------- */

function initHeroButtons() {
  const dl = document.getElementById("downloadBtn");
  if (dl) dl.addEventListener("click", () => {
    flashStatus("Starting download: jake-ruth.exe — (demo only, email me instead)");
    animateInstall();
  });
  const trial = document.getElementById("trialBtn");
  if (trial) trial.addEventListener("click", () => {
    window.location.href = "mailto:jake@stockunlock.com?subject=30%20min%20trial";
  });
}

function animateInstall() {
  const fill = document.querySelector(".install-fill");
  const pct = document.querySelector(".install-pct");
  if (!fill || !pct) return;
  let p = 98;
  fill.style.width = "0%";
  pct.textContent = "0%";
  const t = setInterval(() => {
    const target = 98;
    let current = parseFloat(fill.style.width);
    if (isNaN(current)) current = 0;
    current = Math.min(target, current + 7);
    fill.style.width = current + "%";
    pct.textContent = Math.round(current) + "%";
    if (current >= target) {
      clearInterval(t);
      pct.textContent = "98%";
    }
  }, 60);
  p;
}

/* ---------- Desktop icon double-click ---------- */

function initDesktopIcons() {
  document.querySelectorAll(".desk-icon").forEach((icon) => {
    icon.addEventListener("dblclick", () => {
      const which = icon.dataset.icon;
      if (which === "resume") {
        const tab = document.querySelector('.tab[data-tab="features"]');
        if (tab) tab.click();
        flashStatus("Opened: Resume.docx");
      } else if (which === "readme") {
        const tab = document.querySelector('.tab[data-tab="about"]');
        if (tab) tab.click();
        flashStatus("Opened: readme.txt");
      } else if (which === "computer") {
        const tab = document.querySelector('.tab[data-tab="overview"]');
        if (tab) tab.click();
        flashStatus("Opened: Computer — see System Properties");
      } else if (which === "recycle") {
        flashStatus("Recycle Bin: empty. (That competitor's margin-of-safety formula is in there.)");
      }
    });
  });
}

/* ---------- Init ---------- */

document.addEventListener("DOMContentLoaded", () => {
  renderFaces();
  applyProgress(0);

  initTabs();
  initStartMenu();
  initWindowButtons();
  initDrag();
  initHeroButtons();
  initDesktopIcons();

  const body = document.getElementById("windowBody");
  if (body) body.addEventListener("scroll", onBodyScroll, { passive: true });

  tickClock();
  setInterval(tickClock, 1000);

  flashStatus("Welcome — scroll the window to solve the Rubik's cube");
});
