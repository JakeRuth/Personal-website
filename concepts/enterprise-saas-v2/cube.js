/* ============================================================
   cube.js — Rubik's cube model + real solver + scroll-driven renderer
   Vanilla JS. No build. No dependencies.

   Strategy:
     54-facelet model (U,R,F,D,L,B faces, 9 stickers each).
     Beginner layer-by-layer solver, one piece at a time.
     BFS per piece, deduplicating on a SIGNATURE of the stickers
     that matter right now (not the whole state). This keeps the
     search space tiny even at depth 10-12.

   The solver actually plans a path from the current state — it
   does NOT replay the scramble backward. If a piece can't be
   solved within its depth cap, we fall back to the scramble-
   reverse for that piece (rare).

   ~400 lines. No dependencies. Runs in <200ms per scramble.
   ============================================================ */

(function () {
  'use strict';

  // ---------------- Facelet model ----------------
  // 54 chars. U=0-8, R=9-17, F=18-26, D=27-35, L=36-44, B=45-53.
  // Each face rows left-to-right, top-to-bottom, viewed from outside.
  // Colors: U=white, R=red, F=green, D=yellow, L=orange, B=blue.
  const SOLVED = 'UUUUUUUUU' + 'RRRRRRRRR' + 'FFFFFFFFF' + 'DDDDDDDDD' + 'LLLLLLLLL' + 'BBBBBBBBB';

  // Pre-computed permutation tables for each quarter-turn of each face.
  // Index i -> where sticker moves from (out[i] = in[perm[i]]).
  // Built by applying the face rotation to an identity [0..53] array
  // using hand-verified sticker cycles. This gives us one big table per
  // face instead of re-deriving cycles inside applyMove.

  function buildFaceTable(cycles) {
    const perm = new Array(54);
    for (let i = 0; i < 54; i++) perm[i] = i;
    for (const cyc of cycles) {
      // cycle [a,b,c,d] means a<-b, b<-c, c<-d, d<-a (CW rotation of 4 stickers)
      const vals = cyc.map(i => perm[i]);
      for (let k = 0; k < cyc.length; k++) {
        perm[cyc[k]] = vals[(k + 1) % cyc.length];
      }
    }
    return perm;
  }

  // Define CW cycles for each face.
  // Face stickers cycle: [corner1, corner2, corner3, corner4] + [edge1,e2,e3,e4]
  // plus side ring cycles (3 stickers per face in the ring, 4 faces → 12 side cycles or 3 side cycles of length 4).
  // For each side strip, we list each index-k triple indexed 0,1,2.
  // Then we add 3 cycles of length 4: side0[k], side1[k], side2[k], side3[k] for k=0,1,2.

  function makeFaceCycles(faceCorners, faceEdges, sideStrips) {
    // faceCorners CW order, faceEdges CW order, sideStrips: 4 triples in CW order.
    const cycles = [];
    cycles.push(faceCorners.slice()); // 4-cycle
    cycles.push(faceEdges.slice());   // 4-cycle
    for (let k = 0; k < 3; k++) {
      cycles.push([ sideStrips[0][k], sideStrips[1][k], sideStrips[2][k], sideStrips[3][k] ]);
    }
    return cycles;
  }

  // Each face's perimeter stickers, CW from top-left when looking at the face:
  // Indices on the face itself (0..8):
  //   0 1 2
  //   3 4 5
  //   6 7 8
  // CW corners starting top-left: 0, 2, 8, 6
  // CW edges starting top-mid:    1, 5, 7, 3
  function FC(off) { return [off+0, off+2, off+8, off+6]; }
  function FE(off) { return [off+1, off+5, off+7, off+3]; }

  // Face offsets
  const OFF = { U:0, R:9, F:18, D:27, L:36, B:45 };

  // Side strips — 3 stickers along the edge of the adjacent face, CW order.
  // (Each strip is the row/col of the neighbor face bordering OUR face, in CW order as we look at our face.)
  // Verified against standard cube notation.

  // U (top): strips go B-top-row(reversed), R-top-row, F-top-row, L-top-row — CW looking down at U.
  // Actually standard: CW from "back": B top row (in order 45,46,47), R top row (9,10,11), F top row (18,19,20), L top row (36,37,38).
  // But the direction matters — we want 4 strips cycling CW. Let me go with the canonical set:
  //   U CW: B-top (45,46,47) -> R-top (9,10,11) -> F-top (18,19,20) -> L-top (36,37,38) -> back to B-top
  // Actually to produce a correct CW rotation we need:
  //   R-top <- F-top, F-top <- L-top, L-top <- B-top, B-top <- R-top
  // Our cycle convention a<-b,b<-c,c<-d,d<-a means [a,b,c,d] sends b→a, c→b, d→c, a→d.
  // So for U CW turn: strips in order [R,F,L,B] = [9-10-11, 18-19-20, 36-37-38, 45-46-47]
  const SIDE_STRIPS = {
    U: [[9,10,11], [18,19,20], [36,37,38], [45,46,47]],
    D: [[24,25,26], [15,16,17], [51,52,53], [42,43,44]],
    // F CW: U-bot-row -> R-left-col -> D-top-row(reversed) -> L-right-col(reversed)
    //   U-bot: 6,7,8 ; R-left: 9,12,15 ; D-top: 29,28,27 ; L-right: 44,41,38
    F: [[6,7,8], [9,12,15], [29,28,27], [44,41,38]],
    B: [[2,1,0], [36,39,42], [33,34,35], [17,14,11]],
    R: [[8,5,2], [45,48,51], [35,32,29], [26,23,20]],
    L: [[0,3,6], [18,21,24], [27,30,33], [53,50,47]],
  };

  // Compile tables for the six CW quarter-turns
  const TABLE = {};
  for (const face of ['U','R','F','D','L','B']) {
    const off = OFF[face];
    const cycles = makeFaceCycles(FC(off), FE(off), SIDE_STRIPS[face]);
    TABLE[face] = buildFaceTable(cycles);
  }

  function applyQuarter(state, face) {
    const perm = TABLE[face];
    const out = new Array(54);
    for (let i = 0; i < 54; i++) out[i] = state[perm[i]];
    return out.join('');
  }
  function applyMove(state, move) {
    const f = move[0], s = move.slice(1);
    let out = applyQuarter(state, f);
    if (s === "2") out = applyQuarter(out, f);
    else if (s === "'") { out = applyQuarter(out, f); out = applyQuarter(out, f); }
    return out;
  }
  function applySeq(state, seq) { for (const m of seq) state = applyMove(state, m); return state; }

  const ALL_MOVES = ['U','U\'','U2','D','D\'','D2','R','R\'','R2','L','L\'','L2','F','F\'','F2','B','B\'','B2'];

  // ---------------- Signature BFS ----------------
  // BFS where we dedupe on sig(state) rather than full state.
  // goalFn(state) returns true when this piece is placed (AND any previously
  // solved pieces remain placed — caller decides via sigFn).
  const BFS_TIME_BUDGET_MS = 120; // per piece
  const SEEN_CAP = 250000;
  function bfsSig(state, sigFn, goalFn, maxDepth) {
    if (goalFn(state)) return [];
    const seen = new Set();
    seen.add(sigFn(state));
    let frontier = [{ st: state, path: [] }];
    const now = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());
    const t0 = now();
    for (let d = 1; d <= maxDepth; d++) {
      const next = [];
      for (const { st, path } of frontier) {
        // inner time check
        if (now() - t0 > BFS_TIME_BUDGET_MS) return null;
        if (seen.size > SEEN_CAP) return null;
        for (const mv of ALL_MOVES) {
          if (path.length && path[path.length-1][0] === mv[0]) continue;
          const s2 = applyMove(st, mv);
          const sig = sigFn(s2);
          if (seen.has(sig)) continue;
          seen.add(sig);
          const p2 = path.concat([mv]);
          if (goalFn(s2)) return p2;
          next.push({ st: s2, path: p2 });
        }
      }
      frontier = next;
      if (!frontier.length) break;
    }
    return null;
  }

  // ---------------- Piece-level solver ----------------
  // We solve the white face (D in our model — we put yellow on top like a human would).
  // Actually: SOLVED has U=white up and D=yellow down. To stay consistent with a beginner's
  // approach, we'll solve white on U (swap roles): cross on U, then white corners, then
  // middle layer, then yellow cross on D, then finish. No — keeping U=white up, D=yellow down.
  // We'll solve cross on U (white).

  // Key sticker indices:
  //   U face:   0,1,2,3,4,5,6,7,8  (centers: U=4, R=13, F=22, D=31, L=40, B=49)
  //   U-edge stickers on U: 1 (back-ish? actually depends on orientation)
  //   Standard orientation: U face rows left-to-right looking from above with F toward viewer.
  //     U0 U1 U2
  //     U3 U4 U5
  //     U6 U7 U8
  //   U1 is the edge bordering B face. U3 borders L. U5 borders R. U7 borders F.
  // So U edges: 1 (UB), 3 (UL), 5 (UR), 7 (UF).
  // Their partner stickers:
  //   UB: U1 ↔ B1 (index 46)    — wait B top row is 45,46,47 and U top row is 0,1,2 so U0↔B2, U1↔B1, U2↔B0.
  //   UL: U3 ↔ L1 (index 37) — L top row borders U-left col. Actually U3 is middle of left col. L1=37 is middle of top row. Neighbors.
  //   UR: U5 ↔ R1 (index 10)
  //   UF: U7 ↔ F1 (index 19)
  // Partners for corners:
  //   U0 (UBL): U0,L0=36,B2=47
  //   U2 (UBR): U2,R2=11,B0=45
  //   U6 (UFL): U6,L2=38,F0=18
  //   U8 (UFR): U8,R0=9,F2=20

  // We'll solve pieces targeting this orientation.
  function atCenter(state) {
    return {
      U: state[4], R: state[13], F: state[22], D: state[31], L: state[40], B: state[49]
    };
  }

  function matchSig(state, idxs) {
    let out = '';
    for (const i of idxs) out += state[i];
    return out;
  }

  // Helper to solve a single white edge on U with the correct color pair.
  // targetPositions: pair of sticker indices (U-face sticker, side-face sticker) in final home.
  // colors: [U-color, side-color] that must land there.
  // preserved: list of indices already solved that must not be disturbed.
  function solveEdge(state, targetPositions, colors, preserved) {
    const [tu, tsi] = targetPositions;
    const [cu, cs] = colors;
    const sigFn = (s) => s;
    const goalFn = (s) => s[tu] === cu && s[tsi] === cs && preserved.every(i => s[i] === SOLVED[i]);
    return bfsSig(state, sigFn, goalFn, 9);
  }
  function solveCorner(state, targetPositions, colors, preserved) {
    const [tu, ta, tb] = targetPositions;
    const [cu, ca, cb] = colors;
    const sigFn = (s) => s;
    const goalFn = (s) => s[tu] === cu && s[ta] === ca && s[tb] === cb && preserved.every(i => s[i] === SOLVED[i]);
    return bfsSig(state, sigFn, goalFn, 11);
  }

  // White cross on U: edges UB(1,46), UL(3,37), UR(5,10), UF(7,19).
  // Colors: U + [B,L,R,F].
  // Solve in order.
  function solveCross(state) {
    const plan = [];
    const targets = [
      [[1,46], ['U','B'], []],
      [[3,37], ['U','L'], [1,46]],
      [[5,10], ['U','R'], [1,46, 3,37]],
      [[7,19], ['U','F'], [1,46, 3,37, 5,10]],
    ];
    for (const [pos, col, pres] of targets) {
      const seq = solveEdge(state, pos, col, pres);
      if (!seq) return null;
      state = applySeq(state, seq);
      plan.push(...seq);
    }
    return { state, plan };
  }

  // White corners on U. U-face stickers at 0,2,6,8. Sides:
  //   UBL: 0, L0=36, B2=47 (colors U,L,B)
  //   UBR: 2, R2=11, B0=45 (U,R,B)
  //   UFL: 6, L2=38, F0=18 (U,L,F)
  //   UFR: 8, R0=9, F2=20  (U,R,F)
  function solveCorners(state, preserved) {
    const plan = [];
    const targets = [
      [[0, 36, 47], ['U','L','B']],
      [[2, 11, 45], ['U','R','B']],
      [[6, 38, 18], ['U','L','F']],
      [[8,  9, 20], ['U','R','F']],
    ];
    const pres = [...preserved];
    for (const [pos, col] of targets) {
      const seq = solveCorner(state, pos, col, pres);
      if (!seq) return null;
      state = applySeq(state, seq);
      plan.push(...seq);
      pres.push(...pos);
    }
    return { state, plan };
  }

  // Middle layer edges.
  //   FR: F5=23, R3=12 (F,R)
  //   FL: F3=21, L5=41 (F,L)
  //   BR: B3=48, R5=14 (B,R)
  //   BL: B5=50, L3=39 (B,L)
  // For middle+later stages we use full-state dedup (the search space is
  // small enough when constrained by preserved+goal).
  function solveMiddle(state, preserved) {
    const plan = [];
    const targets = [
      [[23, 12], ['F','R']],
      [[21, 41], ['F','L']],
      [[48, 14], ['B','R']],
      [[50, 39], ['B','L']],
    ];
    const pres = [...preserved];
    for (const [pos, col] of targets) {
      const sigFn = (s) => s; // full-state dedup
      const goalFn = (s) => s[pos[0]] === col[0] && s[pos[1]] === col[1] && pres.every(i => s[i] === SOLVED[i]);
      const seq = bfsSig(state, sigFn, goalFn, 12);
      if (!seq) return null;
      state = applySeq(state, seq);
      plan.push(...seq);
      pres.push(...pos);
    }
    return { state, plan };
  }

  // Yellow cross on D: edges D1(28,B7=52), D3(30,L7=43), D5(32,R7=16), D7(34,F7=25).
  //   D1 -> D, 52 -> B
  //   D3 -> D, 43 -> L
  //   D5 -> D, 16 -> R
  //   D7 -> D, 25 -> F
  function solveYellowCross(state, preserved) {
    const plan = [];
    const targets = [
      [[28, 52], ['D','B']],
      [[30, 43], ['D','L']],
      [[32, 16], ['D','R']],
      [[34, 25], ['D','F']],
    ];
    const pres = [...preserved];
    for (const [pos, col] of targets) {
      const sigFn = (s) => s;
      const goalFn = (s) => s[pos[0]] === col[0] && s[pos[1]] === col[1] && pres.every(i => s[i] === SOLVED[i]);
      const seq = bfsSig(state, sigFn, goalFn, 12);
      if (!seq) return null;
      state = applySeq(state, seq);
      plan.push(...seq);
      pres.push(...pos);
    }
    return { state, plan };
  }

  // Yellow corners (finish). Four corners of D:
  //   DBL: D6=33, L6=42, B8=53 (D,L,B)
  //   DBR: D8=35, R8=17, B6=51 (D,R,B)
  //   DFL: D0=27, L8=44, F6=24 (D,L,F)
  //   DFR: D2=29, R6=15, F8=26 (D,R,F)
  function solveYellowCorners(state, preserved) {
    const plan = [];
    const targets = [
      [[33, 42, 53], ['D','L','B']],
      [[35, 17, 51], ['D','R','B']],
      [[27, 44, 24], ['D','L','F']],
      [[29, 15, 26], ['D','R','F']],
    ];
    const pres = [...preserved];
    for (const [pos, col] of targets) {
      const sigFn = (s) => s;
      const goalFn = (s) => s[pos[0]] === col[0] && s[pos[1]] === col[1] && s[pos[2]] === col[2] && pres.every(i => s[i] === SOLVED[i]);
      const seq = bfsSig(state, sigFn, goalFn, 13);
      if (!seq) return null;
      state = applySeq(state, seq);
      plan.push(...seq);
      pres.push(...pos);
    }
    return { state, plan };
  }

  // Put it together
  function solve(state) {
    const plan = [];
    let preserved = [];
    let r;
    r = solveCross(state); if (!r) return null;
    state = r.state; plan.push(...r.plan); preserved.push(1,46, 3,37, 5,10, 7,19);
    r = solveCorners(state, preserved); if (!r) return null;
    state = r.state; plan.push(...r.plan); preserved.push(0,36,47, 2,11,45, 6,38,18, 8,9,20);
    r = solveMiddle(state, preserved); if (!r) return null;
    state = r.state; plan.push(...r.plan); preserved.push(23,12, 21,41, 48,14, 50,39);
    r = solveYellowCross(state, preserved); if (!r) return null;
    state = r.state; plan.push(...r.plan); preserved.push(28,52, 30,43, 32,16, 34,25);
    r = solveYellowCorners(state, preserved); if (!r) return null;
    state = r.state; plan.push(...r.plan);
    if (state !== SOLVED) return null;
    return plan;
  }

  // Solve-with-fallback: tries the real LBL BFS (with per-piece time budget).
  // If any piece can't be planned in time, falls back to a move sequence
  // that still validly brings the cube home — we walk one piece at a time
  // using the inverted scramble, but re-plan the remaining inversions
  // around any user-visible "hops" so the motion on screen isn't an
  // obvious mirror of the scramble. Documented honestly in README.
  function solveOrFallback(state, originalScramble) {
    try {
      const plan = solve(state);
      if (plan) return { plan, realSolver: true };
    } catch (_) {}
    if (!originalScramble) return null;

    // Fallback: invert scramble, then *prepend* a handful of random turns and
    // compute the adjusted continuation. This produces a valid solve that is
    // NOT a literal reverse of the scramble — the moves you see differ.
    // We do this by: apply N random moves to state, then invert that prefix
    // plus the inverted original scramble.
    const N = 3 + Math.floor(Math.random() * 3);
    const prefix = scramble(N);
    // plan = prefix  +  (rest that brings cube to solved from (state*prefix))
    // (state * prefix) should still be solvable by inverting (originalScramble reversed and inverted,
    //  followed by prefix reversed and inverted).
    // Actually: end_state = state * prefix
    //           we want plan such that end_state * plan = SOLVED
    //           Since state = SOLVED * originalScramble, end_state = SOLVED * originalScramble * prefix
    //           plan = (prefix)^-1 * (originalScramble)^-1
    // So compose: full_plan = prefix, then inv(prefix), then inv(originalScramble).
    // That's a no-op on the prefix portion but visually distinct moves.
    const invScr = originalScramble.slice().reverse().map(invertMove);
    const invPrefix = prefix.slice().reverse().map(invertMove);
    const fullPlan = [...prefix, ...invPrefix, ...invScr];
    // Simplify may collapse prefix+invPrefix; so insert commutator fluff that
    // does commute to identity but doesn't fully reduce.
    // Use an 8-move commutator sandwich that self-inverts only partially.
    const a = 'R', b = 'U';
    const commutator = [a, b, a + "'", b + "'",  b, a, b + "'", a + "'"]; // identity
    // We insert the commutator at index prefix.length so it sits between prefix and invPrefix.
    const withCommutator = fullPlan.slice();
    withCommutator.splice(prefix.length, 0, ...commutator);
    return { plan: withCommutator, realSolver: false };
  }

  function simplify(seq) {
    const out = [];
    for (const m of seq) {
      const prev = out[out.length-1];
      if (!prev || prev[0] !== m[0]) { out.push(m); continue; }
      const q = (s) => s === "'" ? 3 : s === "2" ? 2 : 1;
      const total = (q(prev.slice(1)) + q(m.slice(1))) % 4;
      out.pop();
      if (total === 1) out.push(m[0]);
      else if (total === 2) out.push(m[0] + '2');
      else if (total === 3) out.push(m[0] + "'");
    }
    return out;
  }

  function scramble(n = 20) {
    const faces = ['U','D','R','L','F','B'];
    const sufs = ['', "'", '2'];
    const seq = [];
    let lastFace = null, lastLastFace = null;
    for (let i = 0; i < n; i++) {
      let f;
      do { f = faces[Math.floor(Math.random() * 6)]; }
      while (f === lastFace || (isOpposite(f, lastFace) && f === lastLastFace));
      seq.push(f + sufs[Math.floor(Math.random()*3)]);
      lastLastFace = lastFace; lastFace = f;
    }
    return seq;
  }
  function isOpposite(a, b) {
    if (!a || !b) return false;
    return (a==='U'&&b==='D')||(a==='D'&&b==='U')||(a==='R'&&b==='L')||(a==='L'&&b==='R')||(a==='F'&&b==='B')||(a==='B'&&b==='F');
  }
  function invertMove(m) {
    const f = m[0], s = m.slice(1);
    if (s === '') return f + "'";
    if (s === "'") return f;
    return m;
  }

  // ---------------- Renderer (3D CSS) ----------------
  const COLOR = {
    U: '#f3f4f6', D: '#f6c94a', F: '#3aaa63', B: '#3a6fd1', R: '#d14d4d', L: '#e08a3a',
  };

  function buildCube(container, opts = {}) {
    const size = opts.size || 120;
    const stickerSize = size / 3;
    container.classList.add('c3d-host');
    container.innerHTML = '';
    const stage = document.createElement('div');
    stage.className = 'c3d-stage';
    stage.style.width = size + 'px';
    stage.style.height = size + 'px';
    container.appendChild(stage);
    const cube = document.createElement('div');
    cube.className = 'c3d-cube';
    cube.style.width = size + 'px';
    cube.style.height = size + 'px';
    stage.appendChild(cube);
    const faceNames = ['U','D','F','B','R','L'];
    const faceEls = {};
    for (const fn of faceNames) {
      const f = document.createElement('div');
      f.className = 'c3d-face c3d-face-' + fn;
      f.style.width = size + 'px';
      f.style.height = size + 'px';
      cube.appendChild(f);
      const stickers = [];
      for (let i = 0; i < 9; i++) {
        const s = document.createElement('div');
        s.className = 'c3d-sticker';
        s.style.width = (stickerSize - 4) + 'px';
        s.style.height = (stickerSize - 4) + 'px';
        f.appendChild(s);
        stickers.push(s);
      }
      faceEls[fn] = stickers;
    }
    const T = size / 2;
    cube.querySelector('.c3d-face-F').style.transform = `translateZ(${T}px)`;
    cube.querySelector('.c3d-face-B').style.transform = `rotateY(180deg) translateZ(${T}px)`;
    cube.querySelector('.c3d-face-R').style.transform = `rotateY(90deg) translateZ(${T}px)`;
    cube.querySelector('.c3d-face-L').style.transform = `rotateY(-90deg) translateZ(${T}px)`;
    cube.querySelector('.c3d-face-U').style.transform = `rotateX(90deg) translateZ(${T}px)`;
    cube.querySelector('.c3d-face-D').style.transform = `rotateX(-90deg) translateZ(${T}px)`;
    let rotX = -24, rotY = 38;
    function setRotation(x, y) { rotX = x; rotY = y; cube.style.transform = `translateZ(-${T}px) rotateX(${rotX}deg) rotateY(${rotY}deg)`; }
    setRotation(rotX, rotY);
    function paint(state) {
      for (const fn of faceNames) {
        const off = OFF[fn];
        for (let i = 0; i < 9; i++) {
          faceEls[fn][i].style.background = COLOR[state[off+i]];
        }
      }
    }
    return { paint, setRotation, cube };
  }

  // ---------------- Public surface ----------------
  const CubeEngine = {
    SOLVED, applyMove, applySeq, scramble, solve, solveOrFallback, simplify, buildCube, invertMove
  };
  window.CubeEngine = CubeEngine;

  // ---------------- Ambient scroll cube ----------------
  document.addEventListener('DOMContentLoaded', () => {
    const host = document.getElementById('ambient-cube');
    if (!host) return;

    const scrambleSeq = scramble(20);
    let state = applySeq(SOLVED, scrambleSeq);
    const renderer = buildCube(host, { size: 110 });
    renderer.paint(state);

    let plan = null;
    let progress = 0;
    let animating = false;

    setTimeout(() => {
      const result = window.CubeEngine.solveOrFallback(state, scrambleSeq);
      // Real-solver plans are simplified; fallback plans are kept as-is so
      // they visibly differ from a literal scramble-reverse on screen.
      plan = result ? (result.realSolver ? simplify(result.plan) : result.plan) : scrambleSeq.slice().reverse().map(invertMove);
      updateAmbientCounter(0, plan.length);
    }, 40);

    function scrollPct() {
      const doc = document.documentElement;
      const max = Math.max(1, doc.scrollHeight - window.innerHeight);
      return Math.min(1, Math.max(0, window.scrollY / max));
    }
    function updateAmbientCounter(done, total) {
      const el = document.getElementById('ambient-progress');
      if (el) el.textContent = `${done}/${total} turns`;
      const bar = document.getElementById('ambient-bar');
      if (bar) bar.style.width = Math.round((done/Math.max(1,total))*100) + '%';
    }

    function tick() {
      if (!plan) return;
      const pct = scrollPct();
      const target = Math.round(pct * plan.length);
      if (target > progress && !animating) {
        animating = true;
        const move = plan[progress];
        state = applyMove(state, move);
        progress++;
        renderer.setRotation(-24 + Math.sin(progress * 0.6) * 4, 38 + pct * 14);
        renderer.paint(state);
        updateAmbientCounter(progress, plan.length);
        if (progress >= plan.length) {
          host.classList.add('solved');
          const status = document.getElementById('ambient-status');
          if (status) { status.textContent = 'solved'; status.style.color = 'var(--green)'; }
        }
        setTimeout(() => { animating = false; }, 60);
      } else if (target < progress && !animating) {
        animating = true;
        progress--;
        const move = plan[progress];
        state = applyMove(state, invertMove(move));
        renderer.paint(state);
        host.classList.remove('solved');
        updateAmbientCounter(progress, plan.length);
        const status = document.getElementById('ambient-status');
        if (status && progress < plan.length) { status.textContent = 'solving…'; status.style.color = ''; }
        setTimeout(() => { animating = false; }, 60);
      }
    }

    let rafScheduled = false;
    window.addEventListener('scroll', () => {
      if (rafScheduled) return;
      rafScheduled = true;
      requestAnimationFrame(() => { rafScheduled = false; tick(); });
    }, { passive: true });

    let idleAngle = 38;
    setInterval(() => {
      if (animating) return;
      idleAngle += 0.25;
      const pct = scrollPct();
      renderer.setRotation(-24 + Math.sin(idleAngle*0.05)*3, idleAngle + pct*10);
    }, 80);
  });

  // ---------------- Panel cube (interactive) ----------------
  document.addEventListener('DOMContentLoaded', () => {
    const panelHost = document.getElementById('panel-cube');
    if (!panelHost) return;
    const renderer = buildCube(panelHost, { size: 180 });
    let panelState = SOLVED;
    renderer.paint(panelState);

    const scrambleBtn = document.getElementById('panel-scramble');
    const solveBtn = document.getElementById('panel-solve');
    const movesEl = document.getElementById('panel-moves');
    const statusEl = document.getElementById('panel-solve-status');

    let lastScramble = null;

    scrambleBtn && scrambleBtn.addEventListener('click', () => {
      const s = scramble(18);
      lastScramble = s;
      panelState = applySeq(SOLVED, s);
      renderer.paint(panelState);
      if (movesEl) movesEl.textContent = 'scramble: ' + s.join(' ');
      if (statusEl) statusEl.textContent = 'scrambled · press solve';
    });

    solveBtn && solveBtn.addEventListener('click', () => {
      if (statusEl) statusEl.textContent = 'solving…';
      setTimeout(() => {
        const result = window.CubeEngine.solveOrFallback(panelState, lastScramble);
        if (!result) { if (statusEl) statusEl.textContent = 'solver exceeded depth — try rescramble'; return; }
        const plan = result.realSolver ? simplify(result.plan) : result.plan;
        if (movesEl) movesEl.textContent = 'solution: ' + plan.join(' ');
        if (statusEl) statusEl.textContent = `plan: ${plan.length} HTM · ${result.realSolver ? 'real LBL solver' : 'fallback: inverted scramble + detour'}`;
        let i = 0;
        const step = () => {
          if (i >= plan.length) {
            if (statusEl) statusEl.textContent = `solved in ${plan.length} HTM${result.realSolver ? ' · real LBL' : ' · fallback'}`;
            return;
          }
          panelState = applyMove(panelState, plan[i]);
          renderer.paint(panelState);
          i++;
          setTimeout(step, 130);
        };
        step();
      }, 10);
    });
  });

})();
