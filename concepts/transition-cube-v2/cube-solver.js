/* ================================================================
   transition-cube-v2 — 3x3 solver
   ================================================================

   Ported verbatim from concepts/xp-luna-v3/cube-solver.js. Same
   bidirectional BFS on the full cubie state. The solver is not the
   problem we're fixing here — the animation layer is. This file is
   load-bearing only in that it hands transition-cube-v2.js the list
   of moves to play.

   Exposed on window.TransitionCubeV2Solver:
     solvedState, cloneState, statesEqual, turn, applyMoves,
     randomScramble, solve, solvedFacelets, cloneFacelets,
     faceletTurn, applyFaceletMoves, faceletsSolved,
     faceletsToState, solveFromFacelets.
   ================================================================ */

(function () {
  "use strict";

  const N_C = 8, N_E = 12;

  function solvedState() {
    return {
      cp: [0,1,2,3,4,5,6,7],
      co: [0,0,0,0,0,0,0,0],
      ep: [0,1,2,3,4,5,6,7,8,9,10,11],
      eo: [0,0,0,0,0,0,0,0,0,0,0,0],
    };
  }

  function cloneState(s) {
    return { cp: s.cp.slice(), co: s.co.slice(), ep: s.ep.slice(), eo: s.eo.slice() };
  }
  function statesEqual(a, b) {
    for (let i = 0; i < N_C; i++) if (a.cp[i] !== b.cp[i] || a.co[i] !== b.co[i]) return false;
    for (let i = 0; i < N_E; i++) if (a.ep[i] !== b.ep[i] || a.eo[i] !== b.eo[i]) return false;
    return true;
  }

  function applyCycle(arr, cycle) {
    const last = arr[cycle[cycle.length - 1]];
    for (let i = cycle.length - 1; i > 0; i--) arr[cycle[i]] = arr[cycle[i - 1]];
    arr[cycle[0]] = last;
  }

  const MOVES_CW = {
    U: { cCycle: [1, 2, 3, 0], cTwist: [0,0,0,0,0,0,0,0], eCycle: [0, 1, 2, 3], eFlip: [0,0,0,0,0,0,0,0,0,0,0,0] },
    D: { cCycle: [4, 7, 6, 5], cTwist: [0,0,0,0,0,0,0,0], eCycle: [8, 11, 10, 9], eFlip: [0,0,0,0,0,0,0,0,0,0,0,0] },
    R: { cCycle: [0, 3, 7, 4], cTwist: [2,0,0,1,1,0,0,2], eCycle: [3, 6, 11, 7], eFlip: [0,0,0,0,0,0,0,0,0,0,0,0] },
    L: { cCycle: [2, 1, 5, 6], cTwist: [0,1,2,0,0,2,1,0], eCycle: [1, 4, 9, 5], eFlip: [0,0,0,0,0,0,0,0,0,0,0,0] },
    F: { cCycle: [1, 0, 4, 5], cTwist: [1,2,0,0,2,1,0,0], eCycle: [0, 7, 8, 4], eFlip: [1,0,0,0,1,0,0,1,1,0,0,0] },
    B: { cCycle: [3, 2, 6, 7], cTwist: [0,0,1,2,0,0,2,1], eCycle: [2, 5, 10, 6], eFlip: [0,0,1,0,0,1,1,0,0,0,1,0] },
  };

  function applyMoveOnce(s, face) {
    const def = MOVES_CW[face];
    if (!def) return;
    applyCycle(s.cp, def.cCycle);
    applyCycle(s.co, def.cCycle);
    applyCycle(s.ep, def.eCycle);
    applyCycle(s.eo, def.eCycle);
    const cT = def.cTwist, eF = def.eFlip;
    for (let i = 0; i < N_C; i++) s.co[i] = (s.co[i] + cT[i]) % 3;
    for (let i = 0; i < N_E; i++) s.eo[i] = (s.eo[i] + eF[i]) % 2;
  }

  function turn(s, move) {
    const face = move[0];
    const n = move.endsWith("'") ? 3 : 1;
    for (let i = 0; i < n; i++) applyMoveOnce(s, face);
  }

  function applyMoves(s, moves) {
    for (const m of moves) turn(s, m);
  }

  function randomScramble(n) {
    const faces = ['U', 'R', 'F', 'D', 'L', 'B'];
    const mods = ["", "'"];
    const opp = { U:'D', D:'U', R:'L', L:'R', F:'B', B:'F' };
    const out = [];
    let prev = null, prev2 = null;
    for (let i = 0; i < n; i++) {
      let f;
      let tries = 0;
      do {
        f = faces[(Math.random() * 6) | 0];
        tries++;
        if (tries > 40) break;
      } while (f === prev || (opp[f] === prev && f === prev2));
      prev2 = prev; prev = f;
      out.push(f + mods[(Math.random() * 2) | 0]);
    }
    return out;
  }

  const ALL_MOVES = ['U',"U'",'R',"R'",'F',"F'",'D',"D'",'L',"L'",'B',"B'"];

  function hashState(s) {
    let out = '';
    for (let i = 0; i < 8; i++) out += s.cp[i].toString(16);
    for (let i = 0; i < 8; i++) out += s.co[i];
    for (let i = 0; i < 12; i++) out += s.ep[i].toString(16).padStart(1, '0');
    for (let i = 0; i < 12; i++) out += s.eo[i];
    return out;
  }

  function goalSolved(s) { return statesEqual(s, solvedState()); }

  function solve(start) {
    if (goalSolved(start)) return [];
    return biBFS(start, 9);
  }

  function biBFS(start, maxPerSide) {
    if (goalSolved(start)) return [];
    const solved = solvedState();
    const startKey = hashState(start);
    const solvedKey = hashState(solved);
    if (startKey === solvedKey) return [];
    const fwd = new Map(); fwd.set(startKey, null);
    const bwd = new Map(); bwd.set(solvedKey, null);
    let fwdFrontier = [{ s: cloneState(start), k: startKey }];
    let bwdFrontier = [{ s: cloneState(solved), k: solvedKey }];

    for (let d = 0; d < maxPerSide; d++) {
      if (fwdFrontier.length <= bwdFrontier.length) {
        const next = expandBi(fwdFrontier, fwd, bwd);
        if (next.meet) return buildPath(fwd, bwd, next.meet, startKey, solvedKey);
        fwdFrontier = next.frontier;
      } else {
        const next = expandBi(bwdFrontier, bwd, fwd);
        if (next.meet) return buildPath(fwd, bwd, next.meet, startKey, solvedKey);
        bwdFrontier = next.frontier;
      }
    }
    return null;
  }

  function expandBi(frontier, myMap, otherMap) {
    const next = [];
    for (const node of frontier) {
      for (const m of ALL_MOVES) {
        const ns = cloneState(node.s);
        turn(ns, m);
        const nk = hashState(ns);
        if (myMap.has(nk)) continue;
        myMap.set(nk, { parentKey: node.k, move: m });
        if (otherMap.has(nk)) return { meet: nk, frontier: next };
        next.push({ s: ns, k: nk });
      }
    }
    return { meet: null, frontier: next };
  }

  function buildPath(fwd, bwd, meetKey, startKey, solvedKey) {
    return reconstruct(fwd, meetKey, startKey)
      .concat(invertPath(reconstruct(bwd, meetKey, solvedKey)));
  }

  function reconstruct(map, endKey, startKey) {
    const out = [];
    let cur = endKey;
    while (cur !== startKey) {
      const e = map.get(cur);
      if (!e) break;
      out.push(e.move);
      cur = e.parentKey;
    }
    out.reverse();
    return out;
  }

  function invertPath(path) {
    const out = [];
    for (let i = path.length - 1; i >= 0; i--) {
      const m = path[i];
      out.push(m.endsWith("'") ? m[0] : m[0] + "'");
    }
    return out;
  }

  // Facelet model for rendering (face order: U R F D L B).
  const F_U = 0, F_R = 1, F_F = 2, F_D = 3, F_L = 4, F_B = 5;

  function solvedFacelets() {
    return [
      Array(9).fill('W'),
      Array(9).fill('R'),
      Array(9).fill('G'),
      Array(9).fill('Y'),
      Array(9).fill('O'),
      Array(9).fill('B'),
    ];
  }
  function cloneFacelets(f) { return f.map(x => x.slice()); }
  function faceletsSolved(f) {
    return f[0].every(x => x === 'W') &&
           f[1].every(x => x === 'R') &&
           f[2].every(x => x === 'G') &&
           f[3].every(x => x === 'Y') &&
           f[4].every(x => x === 'O') &&
           f[5].every(x => x === 'B');
  }

  function rot9cw(face) {
    return [face[6], face[3], face[0], face[7], face[4], face[1], face[8], face[5], face[2]];
  }

  const RING = {
    U: [[F_F,[0,1,2]],[F_L,[0,1,2]],[F_B,[0,1,2]],[F_R,[0,1,2]]],
    D: [[F_F,[6,7,8]],[F_R,[6,7,8]],[F_B,[6,7,8]],[F_L,[6,7,8]]],
    R: [[F_U,[2,5,8]],[F_B,[6,3,0]],[F_D,[2,5,8]],[F_F,[2,5,8]]],
    L: [[F_U,[0,3,6]],[F_F,[0,3,6]],[F_D,[0,3,6]],[F_B,[8,5,2]]],
    F: [[F_U,[6,7,8]],[F_R,[0,3,6]],[F_D,[2,1,0]],[F_L,[8,5,2]]],
    B: [[F_U,[2,1,0]],[F_L,[0,3,6]],[F_D,[6,7,8]],[F_R,[8,5,2]]],
  };

  function faceletTurn(f, move) {
    const face = move[0];
    const prime = move.endsWith("'");
    const n = prime ? 3 : 1;
    for (let i = 0; i < n; i++) _fTurnCW(f, face);
  }

  function _fTurnCW(f, faceLetter) {
    const faceIdx = { U: F_U, R: F_R, F: F_F, D: F_D, L: F_L, B: F_B }[faceLetter];
    f[faceIdx] = rot9cw(f[faceIdx]);
    const ring = RING[faceLetter];
    const saved = ring[3][1].map(i => f[ring[3][0]][i]);
    for (let k = 0; k < 3; k++) f[ring[3][0]][ring[3][1][k]] = f[ring[2][0]][ring[2][1][k]];
    for (let k = 0; k < 3; k++) f[ring[2][0]][ring[2][1][k]] = f[ring[1][0]][ring[1][1][k]];
    for (let k = 0; k < 3; k++) f[ring[1][0]][ring[1][1][k]] = f[ring[0][0]][ring[0][1][k]];
    for (let k = 0; k < 3; k++) f[ring[0][0]][ring[0][1][k]] = saved[k];
  }

  function applyFaceletMoves(f, moves) {
    for (const m of moves) faceletTurn(f, m);
  }

  const CUBE_CORNER_SLOTS = [
    [[F_U,8],[F_R,0],[F_F,2]],
    [[F_U,6],[F_F,0],[F_L,2]],
    [[F_U,0],[F_L,0],[F_B,2]],
    [[F_U,2],[F_B,0],[F_R,2]],
    [[F_D,2],[F_F,8],[F_R,6]],
    [[F_D,0],[F_L,8],[F_F,6]],
    [[F_D,6],[F_B,8],[F_L,6]],
    [[F_D,8],[F_R,8],[F_B,6]],
  ];
  const CUBE_CORNER_COLORS = [
    ['W','R','G'],['W','G','O'],['W','O','B'],['W','B','R'],
    ['Y','G','R'],['Y','O','G'],['Y','B','O'],['Y','R','B'],
  ];
  const CUBE_EDGE_SLOTS = [
    [[F_U,7],[F_F,1]],[[F_U,3],[F_L,1]],[[F_U,1],[F_B,1]],[[F_U,5],[F_R,1]],
    [[F_F,3],[F_L,5]],[[F_B,5],[F_L,3]],[[F_B,3],[F_R,5]],[[F_F,5],[F_R,3]],
    [[F_D,1],[F_F,7]],[[F_D,3],[F_L,7]],[[F_D,7],[F_B,7]],[[F_D,5],[F_R,7]],
  ];
  const CUBE_EDGE_COLORS = [
    ['W','G'],['W','O'],['W','B'],['W','R'],
    ['G','O'],['B','O'],['B','R'],['G','R'],
    ['Y','G'],['Y','O'],['Y','B'],['Y','R'],
  ];

  function faceletsToState(fc) {
    const s = { cp: Array(8), co: Array(8), ep: Array(12), eo: Array(12) };
    for (let pos = 0; pos < 8; pos++) {
      const slots = CUBE_CORNER_SLOTS[pos];
      const colors = [
        fc[slots[0][0]][slots[0][1]],
        fc[slots[1][0]][slots[1][1]],
        fc[slots[2][0]][slots[2][1]],
      ];
      const sorted = colors.slice().sort().join('');
      let found = -1;
      for (let c = 0; c < 8; c++) {
        if (CUBE_CORNER_COLORS[c].slice().sort().join('') === sorted) { found = c; break; }
      }
      s.cp[pos] = found;
      const primaryColor = CUBE_CORNER_COLORS[found][0];
      s.co[pos] = colors.indexOf(primaryColor);
    }
    for (let pos = 0; pos < 12; pos++) {
      const slots = CUBE_EDGE_SLOTS[pos];
      const c1 = fc[slots[0][0]][slots[0][1]];
      const c2 = fc[slots[1][0]][slots[1][1]];
      const sorted = [c1, c2].sort().join('');
      let found = -1;
      for (let e = 0; e < 12; e++) {
        if (CUBE_EDGE_COLORS[e].slice().sort().join('') === sorted) { found = e; break; }
      }
      s.ep[pos] = found;
      const primaryColor = CUBE_EDGE_COLORS[found][0];
      s.eo[pos] = (c1 === primaryColor) ? 0 : 1;
    }
    return s;
  }

  function solveFromFacelets(fc) {
    if (faceletsSolved(fc)) return [];
    const state = faceletsToState(fc);
    return solve(state);
  }

  window.TransitionCubeV2Solver = {
    solvedState, cloneState, statesEqual,
    turn, applyMoves, randomScramble, solve,
    solvedFacelets, cloneFacelets, faceletTurn, applyFaceletMoves,
    faceletsSolved, faceletsToState, solveFromFacelets,
  };
})();
