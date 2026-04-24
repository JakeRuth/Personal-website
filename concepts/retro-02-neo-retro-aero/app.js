/* =========================================================================
   Neo-Retro Aero — client logic
   - Lucide icons init
   - Clock (topbar + gadget)
   - Scroll-smooth nav (window-body is the scroller)
   - Rubik's cube: CSS-3D scroll-solve mechanic
   ========================================================================= */

(function () {
  "use strict";

  // ---------- Lucide icons -----------------------------------------------
  if (window.lucide && typeof window.lucide.createIcons === "function") {
    window.lucide.createIcons({ attrs: { "stroke-width": 1.5 } });
  }

  // ---------- Clocks ------------------------------------------------------
  const topbarClock = document.getElementById("topbar-clock");
  const clockDigital = document.getElementById("clockDigital");
  const clockDate = document.getElementById("clockDate");

  function two(n) { return n < 10 ? "0" + n : "" + n; }

  function tick() {
    const d = new Date();
    const hh = two(d.getHours());
    const mm = two(d.getMinutes());
    const ss = two(d.getSeconds());
    if (topbarClock) topbarClock.textContent = hh + ":" + mm;
    if (clockDigital) clockDigital.textContent = hh + ":" + mm + ":" + ss;
    if (clockDate) {
      const wk = ["SUN","MON","TUE","WED","THU","FRI","SAT"][d.getDay()];
      const mo = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"][d.getMonth()];
      clockDate.textContent = wk + " " + mo + " " + d.getDate() + " " + d.getFullYear();
    }
  }
  tick();
  setInterval(tick, 1000);

  // ---------- Smooth nav (main window is the scroller) --------------------
  const windowBody = document.getElementById("windowBody");
  document.querySelectorAll("[data-scroll]").forEach((el) => {
    el.addEventListener("click", (e) => {
      const key = el.getAttribute("data-scroll");
      if (!key) return;
      const target = windowBody.querySelector('[data-section="' + key + '"]');
      if (!target) return;
      e.preventDefault();
      const top = target.offsetTop - 20;
      windowBody.scrollTo({ top, behavior: "smooth" });
    });
  });

  // ---------- Rubik's cube — stickers + scroll-solve ----------------------

  // Neo-retro matte palette (desaturated classic cube, readable on dark glass)
  const COLORS = {
    U: "#e6e2d6", // white -> soft cream
    D: "#e8c45a", // yellow -> warm amber
    F: "#cf4e4a", // red
    B: "#d5823c", // orange
    L: "#3aa070", // green
    R: "#4a82c8", // blue
  };

  const SOLVED = {
    F: Array(9).fill(COLORS.F),
    B: Array(9).fill(COLORS.B),
    U: Array(9).fill(COLORS.U),
    D: Array(9).fill(COLORS.D),
    L: Array(9).fill(COLORS.L),
    R: Array(9).fill(COLORS.R),
  };

  // Build a plausible-looking scramble by shuffling a pool of all stickers,
  // then forcing centers to stay correct (real cube invariant).
  function makeScramble() {
    const faces = ["F", "B", "U", "D", "L", "R"];
    const pool = [];
    faces.forEach((f) => {
      for (let i = 0; i < 9; i++) pool.push(COLORS[f]);
    });
    // Fisher-Yates
    for (let i = pool.length - 1; i > 0; i--) {
      const j = (Math.random() * (i + 1)) | 0;
      const t = pool[i]; pool[i] = pool[j]; pool[j] = t;
    }
    const out = {};
    faces.forEach((f, idx) => {
      out[f] = pool.slice(idx * 9, idx * 9 + 9);
      // force center to correct face color
      out[f][4] = COLORS[f];
    });
    return out;
  }

  const scrambled = makeScramble();

  // Create sticker spans in each face div; order is row-major 0..8
  const cube = document.getElementById("cube3d");
  const faceNodes = {};
  ["f", "b", "u", "d", "l", "r"].forEach((key) => {
    const faceEl = cube.querySelector(".face-" + key);
    const spans = [];
    for (let i = 0; i < 9; i++) {
      const s = document.createElement("span");
      faceEl.appendChild(s);
      spans.push(s);
    }
    faceNodes[key.toUpperCase()] = spans;
  });

  // Mini gadget cube (just front face)
  const cubeMini = document.getElementById("cubeMini");
  const miniSpans = [];
  for (let i = 0; i < 9; i++) {
    const s = document.createElement("span");
    cubeMini.appendChild(s);
    miniSpans.push(s);
  }

  // Apply a given state to the big cube
  function applyState(state) {
    Object.keys(faceNodes).forEach((f) => {
      const arr = state[f];
      const nodes = faceNodes[f];
      for (let i = 0; i < 9; i++) {
        nodes[i].style.setProperty("--sticker", arr[i]);
      }
    });
    // Mini cube mirrors the front face
    for (let i = 0; i < 9; i++) {
      miniSpans[i].style.setProperty("--sticker", state.F[i]);
    }
  }

  applyState(scrambled);

  // Interpolate scramble -> solved by swapping a growing subset of stickers
  // (deterministic per-face "solve" sweep driven by a single t in [0, 1]).
  // We keep centers fixed and sweep through the other 8 positions in a
  // chosen order per face; as t climbs, the slots become their solved color.
  const SOLVE_ORDER = [0, 2, 6, 8, 1, 3, 5, 7]; // corners first, then edges

  function mixState(t) {
    // t in [0,1]
    // Global sweep: position p is solved when t >= p_threshold
    // Each face has 8 non-center slots. Offset faces slightly so they don't
    // solve in perfect lockstep — feels more alive.
    const faceOffsets = { F: 0, R: 0.04, U: 0.08, L: 0.12, B: 0.16, D: 0.2 };
    const state = {};
    Object.keys(SOLVED).forEach((f) => {
      const arr = scrambled[f].slice();
      const off = faceOffsets[f] || 0;
      // eased t for this face
      const ft = Math.max(0, Math.min(1, (t - off) / (1 - off || 1)));
      const solveCount = Math.round(ft * 8);
      for (let i = 0; i < solveCount; i++) {
        const pos = SOLVE_ORDER[i];
        arr[pos] = COLORS[f];
      }
      // always keep center correct
      arr[4] = COLORS[f];
      state[f] = arr;
    });
    return state;
  }

  // ---------- Scroll driver ---------------------------------------------
  const cubeSection = windowBody.querySelector('[data-section="cube"]');
  const cubeBar = document.getElementById("cubeBar");
  const cubeCaption = document.getElementById("cubeCaption");
  const gadgetTag = document.getElementById("gadgetCubeTag");

  let lastT = -1;
  let solvedFlashed = false;

  function updateCube() {
    if (!cubeSection) return;
    // Progress: how far the section has been "passed through" the viewport.
    // 0 when section top hits viewport bottom; 1 when section bottom hits top.
    const scrollerRect = windowBody.getBoundingClientRect();
    const secRect = cubeSection.getBoundingClientRect();
    const viewportH = scrollerRect.height;
    const totalTravel = secRect.height + viewportH;
    const passed = (scrollerRect.top + viewportH) - secRect.top;
    let t = passed / totalTravel;
    // Narrow the active zone so the solve "happens" within the section itself
    // rather than over the full travel distance.
    t = (t - 0.2) / 0.6;
    t = Math.max(0, Math.min(1, t));

    if (Math.abs(t - lastT) < 0.004) return;
    lastT = t;

    const state = mixState(t);
    applyState(state);

    // Rotate the cube gently as scroll advances
    const baseX = -26, baseY = -36;
    const rx = baseX + (t - 0.5) * 10;
    const ry = baseY + t * 360 * 0.22; // a little under a quarter turn
    cube.style.transform = "rotateX(" + rx.toFixed(2) + "deg) rotateY(" + ry.toFixed(2) + "deg)";

    if (cubeBar) cubeBar.style.width = (t * 100).toFixed(1) + "%";
    if (cubeCaption) {
      const label = t >= 0.98 ? "SOLVED" : t > 0.02 ? "SOLVING" : "SCRAMBLED";
      const stateEl = cubeCaption.querySelector(".caption-state");
      const metaEl = cubeCaption.querySelector(".caption-meta");
      stateEl.textContent = label;
      stateEl.classList.toggle("solved", t >= 0.98);
      metaEl.textContent = "scroll to solve · " + Math.round(t * 100) + "%";
    }
    if (gadgetTag) {
      gadgetTag.textContent = t >= 0.98 ? "solved" : t > 0.02 ? "solving" : "scrambled";
      gadgetTag.classList.toggle("ok", t >= 0.98);
    }

    // Once, flash on solve
    if (t >= 0.99 && !solvedFlashed) {
      solvedFlashed = true;
      flashSolved();
    } else if (t < 0.9) {
      solvedFlashed = false;
    }
  }

  function flashSolved() {
    cube.animate(
      [
        { filter: "brightness(1)" },
        { filter: "brightness(1.25) drop-shadow(0 0 24px rgba(100,255,218,0.5))" },
        { filter: "brightness(1)" },
      ],
      { duration: 900, easing: "ease-out" }
    );
  }

  // Throttled via rAF
  let rafQueued = false;
  function onScroll() {
    if (rafQueued) return;
    rafQueued = true;
    requestAnimationFrame(() => {
      rafQueued = false;
      updateCube();
    });
  }
  windowBody.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  // Initial
  updateCube();

  // ---------- Idle ambient rotation when cube is off-screen --------------
  let ambientAngle = 0;
  function ambientDrift() {
    const rect = cubeSection && cubeSection.getBoundingClientRect();
    const scrollerRect = windowBody.getBoundingClientRect();
    const visible = rect
      ? rect.bottom > scrollerRect.top && rect.top < scrollerRect.bottom
      : false;
    // Only drift when user is not scrolling-through the cube
    // (let updateCube own the transform when visible & solving).
    if (!visible) {
      ambientAngle += 0.12;
      cube.style.transform =
        "rotateX(-22deg) rotateY(" + (ambientAngle - 36) + "deg)";
    }
    requestAnimationFrame(ambientDrift);
  }
  requestAnimationFrame(ambientDrift);

  // ---------- Minor nice touches ----------------------------------------
  // Highlight nav item matching the currently visible section
  const sectionEls = Array.from(windowBody.querySelectorAll("[data-section]"));
  const navItems = Array.from(document.querySelectorAll(".nav-item[data-scroll]"));
  function onNavHighlight() {
    const scrollTop = windowBody.scrollTop;
    let current = sectionEls[0];
    for (const el of sectionEls) {
      if (el.offsetTop - 80 <= scrollTop) current = el;
    }
    const key = current && current.getAttribute("data-section");
    navItems.forEach((n) => {
      n.style.color = n.getAttribute("data-scroll") === key ? "var(--ink)" : "";
      n.style.background = n.getAttribute("data-scroll") === key ? "rgba(255,255,255,0.05)" : "";
    });
  }
  windowBody.addEventListener("scroll", onNavHighlight, { passive: true });
  onNavHighlight();

})();
