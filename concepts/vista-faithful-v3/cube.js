/* ==========================================================
   cube.js — Real 3x3 Rubik's cube: facelet model + IDA* solver
   Vista Faithful v3.

   Facelet model uses the standard Kociemba face order:
     U=0 (white, 9 facelets, indices 0..8, row-major)
     R=1 (red,                 9..17)
     F=2 (green,              18..26)
     D=3 (yellow,             27..35)
     L=4 (orange,             36..44)
     B=5 (blue,               45..53)

   Each face-turn (U/R/F/D/L/B) is a 54-element permutation P where the
   post-move state satisfies new[i] = old[P[i]]. Primes and doubles are
   implemented by repeated application.

   The solver is iterative-deepening A* with an admissible
   heuristic (ceil(mismatched-facelets / 8), since a quarter turn can
   repair at most 8 facelets). Scrambles are capped at 7 moves which
   the solver handles in well under a second.

   Ported forward from v2 with identical move permutations (which pass
   all self-tests: 4x any face is identity, scramble followed by its
   inverse is identity, every solve in local testing verifies).
   ========================================================== */

(function (global) {
  "use strict";

  const FACE_NAMES = ["U", "R", "F", "D", "L", "B"];
  const FACE_INDEX = { U: 0, R: 1, F: 2, D: 3, L: 4, B: 5 };
  // Western scheme (U white, R red, F green, D yellow, L orange, B blue).
  const FACE_COLORS = [
    "#f5f5f5",
    "#e6413a",
    "#2ecc4f",
    "#ffd633",
    "#ff8a23",
    "#2d77d1",
  ];

  function solvedState() {
    const s = new Uint8Array(54);
    for (let f = 0; f < 6; f++) for (let i = 0; i < 9; i++) s[f * 9 + i] = f;
    return s;
  }

  function cloneState(a) { return new Uint8Array(a); }

  function isSolved(a) {
    for (let f = 0; f < 6; f++) {
      const c = a[f * 9 + 4];
      for (let i = 0; i < 9; i++) if (a[f * 9 + i] !== c) return false;
    }
    return true;
  }

  function identity() {
    const p = new Array(54);
    for (let i = 0; i < 54; i++) p[i] = i;
    return p;
  }

  // cyc = [a,b,c,d] means a -> b -> c -> d -> a.
  // Under "new[i] = old[P[i]]": P[b]=a, P[c]=b, P[d]=c, P[a]=d.
  function addCycle(p, cyc) {
    for (let k = 0; k < cyc.length; k++) {
      const prev = cyc[(k - 1 + cyc.length) % cyc.length];
      p[cyc[k]] = prev;
    }
  }

  function buildU() {
    const p = identity();
    addCycle(p, [0, 2, 8, 6]);
    addCycle(p, [1, 5, 7, 3]);
    addCycle(p, [18, 36, 45, 9]);
    addCycle(p, [19, 37, 46, 10]);
    addCycle(p, [20, 38, 47, 11]);
    return p;
  }
  function buildD() {
    const p = identity();
    addCycle(p, [27, 29, 35, 33]);
    addCycle(p, [28, 32, 34, 30]);
    addCycle(p, [24, 15, 51, 42]);
    addCycle(p, [25, 16, 52, 43]);
    addCycle(p, [26, 17, 53, 44]);
    return p;
  }
  function buildR() {
    const p = identity();
    addCycle(p, [9, 11, 17, 15]);
    addCycle(p, [10, 14, 16, 12]);
    addCycle(p, [2, 20, 29, 51]);
    addCycle(p, [5, 23, 32, 48]);
    addCycle(p, [8, 26, 35, 45]);
    return p;
  }
  function buildL() {
    const p = identity();
    addCycle(p, [36, 38, 44, 42]);
    addCycle(p, [37, 41, 43, 39]);
    addCycle(p, [0, 53, 27, 18]);
    addCycle(p, [3, 50, 30, 21]);
    addCycle(p, [6, 47, 33, 24]);
    return p;
  }
  function buildF() {
    const p = identity();
    addCycle(p, [18, 20, 26, 24]);
    addCycle(p, [19, 23, 25, 21]);
    addCycle(p, [6, 9, 29, 44]);
    addCycle(p, [7, 12, 28, 41]);
    addCycle(p, [8, 15, 27, 38]);
    return p;
  }
  function buildB() {
    const p = identity();
    addCycle(p, [45, 47, 53, 51]);
    addCycle(p, [46, 50, 52, 48]);
    addCycle(p, [2, 11, 33, 42]);
    addCycle(p, [1, 14, 34, 39]);
    addCycle(p, [0, 17, 35, 36]);
    return p;
  }

  const PERMS = {
    U: buildU(), R: buildR(), F: buildF(),
    D: buildD(), L: buildL(), B: buildB(),
  };

  function applyPerm(state, p) {
    const out = new Uint8Array(54);
    for (let i = 0; i < 54; i++) out[i] = state[p[i]];
    return out;
  }

  function move(state, m) {
    const base = m[0];
    const suffix = m.slice(1);
    const count = suffix === "2" ? 2 : (suffix === "'" ? 3 : 1);
    const p = PERMS[base];
    if (!p) throw new Error("bad move: " + m);
    let s = state;
    for (let k = 0; k < count; k++) s = applyPerm(s, p);
    return s;
  }

  function applyMoves(state, moves) {
    let s = state;
    for (const m of moves) s = move(s, m);
    return s;
  }

  function selfTest() {
    let s = solvedState();
    for (const f of FACE_NAMES) {
      let t = cloneState(s);
      for (let i = 0; i < 4; i++) t = move(t, f);
      if (!isSolved(t)) return false;
    }
    const scr = ["U", "R", "F", "R'", "U'", "F'", "D", "L2", "B"];
    const inv = scr.slice().reverse().map(invertMove);
    let u = applyMoves(solvedState(), scr);
    u = applyMoves(u, inv);
    return isSolved(u);
  }

  function invertMove(m) {
    if (m.endsWith("'")) return m[0];
    if (m.endsWith("2")) return m;
    return m + "'";
  }

  // --- Scrambler -----------------------------------------------------------

  const MOVE_FACES = ["U", "D", "F", "B", "L", "R"];
  const SUFFIXES = ["", "'", "2"];

  function scramble(depth) {
    const moves = [];
    let lastFace = "";
    for (let i = 0; i < depth; i++) {
      let face;
      let tries = 0;
      do {
        face = MOVE_FACES[Math.floor(Math.random() * 6)];
        tries++;
      } while (face === lastFace && tries < 20);
      lastFace = face;
      moves.push(face + SUFFIXES[Math.floor(Math.random() * 3)]);
    }
    return moves;
  }

  // --- IDA* solver ---------------------------------------------------------

  function heuristic(arr) {
    let mismatched = 0;
    for (let f = 0; f < 6; f++) {
      const c = arr[f * 9 + 4];
      for (let i = 0; i < 9; i++) if (i !== 4 && arr[f * 9 + i] !== c) mismatched++;
    }
    return Math.ceil(mismatched / 8);
  }

  const OPP = { U: "D", D: "U", R: "L", L: "R", F: "B", B: "F" };

  function canFollow(prevFace, prevPrevFace, face) {
    if (prevFace === face) return false;
    if (OPP[prevFace] === face && prevPrevFace === face) return false;
    return true;
  }

  const ALL_MOVES = [
    "U", "U'", "U2", "R", "R'", "R2", "F", "F'", "F2",
    "D", "D'", "D2", "L", "L'", "L2", "B", "B'", "B2",
  ];

  function solve(arr, maxDepth) {
    maxDepth = maxDepth || 12;
    if (isSolved(arr)) return [];

    let state = cloneState(arr);
    const path = [];
    let solutionFound = null;
    const hardCap = (global.performance && global.performance.now
      ? global.performance.now() : Date.now()) + 2000;

    function now() {
      return (global.performance && global.performance.now
        ? global.performance.now() : Date.now());
    }

    function dfs(depth, bound, prevFace, prevPrevFace) {
      if (solutionFound) return 0;
      const h = heuristic(state);
      const f = depth + h;
      if (f > bound) return f;
      if (h === 0) {
        solutionFound = path.slice();
        return 0;
      }
      if (now() > hardCap) return Infinity;
      let min = Infinity;
      for (let i = 0; i < ALL_MOVES.length; i++) {
        const m = ALL_MOVES[i];
        const face = m[0];
        if (!canFollow(prevFace, prevPrevFace, face)) continue;
        const snapshot = cloneState(state);
        state = move(state, m);
        path.push(m);
        const r = dfs(depth + 1, bound, face, prevFace);
        if (solutionFound) return 0;
        state = snapshot;
        path.pop();
        if (r < min) min = r;
      }
      return min;
    }

    let bound = heuristic(state);
    while (bound <= maxDepth) {
      const r = dfs(0, bound, "", "");
      if (solutionFound) return solutionFound;
      if (!isFinite(r)) return null;
      if (now() > hardCap) return null;
      bound = Math.max(bound + 1, r);
    }
    return null;
  }

  // --- Rendering helpers ---------------------------------------------------

  function ensureStickerElements(faceEls) {
    for (const f of FACE_NAMES) {
      const el = faceEls[f];
      if (!el) continue;
      if (el.children.length === 9) continue;
      el.innerHTML = "";
      for (let i = 0; i < 9; i++) {
        const s = document.createElement("div");
        s.className = "sticker";
        el.appendChild(s);
      }
    }
  }

  function renderState(arr, faceEls) {
    for (const f of FACE_NAMES) {
      const el = faceEls[f];
      if (!el) continue;
      const face = FACE_INDEX[f];
      const kids = el.children;
      for (let i = 0; i < 9; i++) {
        const sticker = kids[i];
        if (!sticker) continue;
        sticker.style.background = FACE_COLORS[arr[face * 9 + i]];
      }
    }
  }

  global.JakeCube = {
    FACE_NAMES,
    FACE_INDEX,
    FACE_COLORS,
    solvedState,
    cloneState,
    isSolved,
    move,
    applyMoves,
    scramble,
    solve,
    invertMove,
    heuristic,
    renderState,
    ensureStickerElements,
    selfTest,
  };
})(typeof window !== "undefined" ? window : globalThis);
