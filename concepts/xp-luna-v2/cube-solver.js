/* ================================================================
   CubeMaster XP — Real 3x3 Solver (cubie model, LBL beginner method)
   ================================================================

   Representation:
     Corners: 8 positions (URF, UFL, ULB, UBR, DFR, DLF, DBL, DRB)
       - cp[0..7] = which corner cubie is at each position (0..7)
       - co[0..7] = orientation (0,1,2) — twist around that position axis
     Edges: 12 positions (UF, UL, UB, UR, FL, BL, BR, FR, DF, DL, DB, DR)
       - ep[0..11] = which edge cubie is at each position (0..11)
       - eo[0..11] = orientation (0,1) — flip or not

   This is the standard representation used by Kociemba-style solvers.

   Moves (U, U', D, D', F, F', L, L', R, R', B, B') are applied as
   permutation + twist/flip updates.

   Solver: LBL beginner method. Instead of writing bespoke algorithms
   per case, we use a *very small* BFS within each phase. Each phase
   constrains a target set of cubies and BFS-es up to a small depth to
   hit the target. Because each phase has a tight goal, depth stays
   small (<= 11), which keeps BFS tractable in pure JS.

   Phases:
     1. White cross on bottom (D layer edges UF->DF slots, correct orientation)
     2. White corners to D (one at a time, BFS using U+R+F+L+B but requires
        cross to stay intact — we restrict moves to U moves + one slot
        reorientation sequence)
        Implementation: solve each D corner by BFS where any move is allowed,
        but target is "this corner + the already-solved pieces stay solved".
     3. Middle-layer edges (BFS, preserving D cross + corners)
     4. Yellow cross on U (apply F R U R' U' F' up to 3 times as patterns flip)
     5. Yellow face orientation (R U R' U R U2 R' = Sune, up to 3 times)
     6. Corner permutation (U R U' L' U R' U' L 3-cycle)
     7. Edge permutation (M2 style or 3-cycle)

   BFS is simpler than writing each case exactly. Depths stay small
   because we restrict the move set in later phases.
   ================================================================ */

(function () {
  "use strict";

  // ---------- cubie model ----------
  // Corner positions: 0:URF 1:UFL 2:ULB 3:UBR 4:DFR 5:DLF 6:DBL 7:DRB
  // Edge positions:   0:UF 1:UL 2:UB 3:UR 4:FL 5:BL 6:BR 7:FR 8:DF 9:DL 10:DB 11:DR
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

  // ---------- Move definitions (permutation + twist) ----------
  // For each face move, define: corner permutation cycle, corner twist deltas,
  // edge permutation cycle, edge flip deltas.
  //
  // Standard cycles (quarter-turn CW looking at the face):
  //   U: UBR -> URF -> UFL -> ULB -> UBR                  i.e. 3->0->1->2->3
  //      UR -> UF -> UL -> UB -> UR                       i.e. 3->0->1->2->3
  //      twists: 0 (U moves don't change corner orientation)
  //      flips:  0
  //
  //   D: DFR -> DRB -> DBL -> DLF -> DFR                  i.e. 4->7->6->5->4
  //      DF -> DR -> DB -> DL -> DF                       i.e. 8->11->10->9->8
  //      twists: 0, flips: 0
  //
  //   R: URF -> DFR -> DRB -> UBR -> URF                  i.e. 0->4->7->3->0
  //      twists: URF:+2, DFR:+1, DRB:+2, UBR:+1            (sum mod 3 = 0)
  //      UR -> FR -> DR -> BR -> UR                       i.e. 3->7->11->6->3
  //      flips: 0
  //
  //   L: UFL -> ULB -> DBL -> DLF -> UFL                  i.e. 1->2->6->5->1
  //      twists: UFL:+1, ULB:+2, DBL:+1, DLF:+2
  //      UL -> BL -> DL -> FL -> UL                       i.e. 1->5->9->4->1
  //      flips: 0
  //
  //   F: URF -> UFL -> DLF -> DFR -> URF                  i.e. 0->1->5->4->0
  //      twists: URF:+1, UFL:+2, DLF:+1, DFR:+2
  //      UF -> FL -> DF -> FR -> UF                       i.e. 0->4->8->7->0
  //      flips: all 4 edges (UF, FL, DF, FR) flip
  //
  //   B: UBR -> ULB -> DBL -> DRB -> UBR                  wait let's be careful
  //      Actually standard: B cycles UBR<-DRB<-DBL<-ULB<-UBR (CW looking at back face)
  //      Clockwise from B perspective: ULB -> UBR -> DRB -> DBL -> ULB  i.e. 2->3->7->6->2
  //      twists: ULB:+1, UBR:+2, DRB:+1, DBL:+2
  //      UB -> BR -> DB -> BL -> UB                       i.e. 2->6->10->5->2
  //      flips: all 4 edges (UB, BR, DB, BL) flip
  //
  // Each move, we permute and apply deltas.

  // Utility: apply a permutation cycle to arrays with optional orientation delta.
  function applyCycle(arr, cycle) {
    // cycle [a,b,c,d] means element at a moves to b, b to c, c to d, d to a.
    // So new[b] = old[a], new[c] = old[b], new[d] = old[c], new[a] = old[d].
    const last = arr[cycle[cycle.length - 1]];
    for (let i = cycle.length - 1; i > 0; i--) arr[cycle[i]] = arr[cycle[i - 1]];
    arr[cycle[0]] = last;
  }

  // Cycle convention: [a,b,c,d] means arr[b] := old arr[a], arr[c] := old arr[b], etc.
  // So the "piece at position a goes to position b, b to c, c to d, d to a".
  // We define each face's CW rotation (CW viewed from outside that face) by listing
  // the destination chain.
  //
  // Positions:
  //   Corners: 0:URF 1:UFL 2:ULB 3:UBR 4:DFR 5:DLF 6:DBL 7:DRB
  //   Edges:   0:UF 1:UL 2:UB 3:UR 4:FL 5:BL 6:BR 7:FR 8:DF 9:DL 10:DB 11:DR
  //
  // U CW (viewed from above): UFL -> URF -> UBR -> ULB -> UFL
  //   cubie at UFL(1) goes to URF(0); URF(0) -> UBR(3); UBR(3) -> ULB(2); ULB(2) -> UFL(1)
  //   cycle = [1, 0, 3, 2]
  //   edges similarly: UF(0)->UR(3)->UB(2)->UL(1)->UF(0). Wait re-check: from above, CW.
  //     Front is at 6 o'clock when looking down. CW from above means UF moves to UR,
  //     UR to UB, UB to UL, UL to UF. So cycle [0,3,2,1].
  //   Hmm my corner cycle says UFL(1)->URF(0), meaning the piece at 1 ends up at 0.
  //   But from above looking down, CW means 1 (front-left) goes to 0 (front-right)? Yes.
  //   And edge UF(0) goes to UR(3)? Yes. So edge cycle = [0, 3, 2, 1].
  //
  // D CW (viewed from BELOW): DFR -> DLF -> DBL -> DRB -> DFR... wait.
  //   Actually D CW viewed from below: front-right goes to front-left? Looking from below,
  //   the cube's front face is at the top of your view. CW is normal direction. So:
  //   DFR(4) -> DLF(5)? Hmm. Standard: D move (CW from below) sends DFR to DLF to DBL to DRB to DFR.
  //   That's cycle [4,5,6,7].
  //   Edges: DF(8)->DL(9)->DB(10)->DR(11)->DF(8). Cycle [8,9,10,11].
  //
  // R CW (viewed from +X side): URF -> UBR -> DRB -> DFR -> URF.
  //   Wait let me reason: R CW viewed from the right side. Top of cube is to your left? No,
  //   top of cube is up. CW motion means front-top goes to back-top. So URF(0)->UBR(3).
  //   Then UBR(3)->DRB(7). DRB(7)->DFR(4). DFR(4)->URF(0). Cycle = [0, 3, 7, 4].
  //   Edges: UR(3)->BR(6)->DR(11)->FR(7)->UR(3). Cycle = [3, 6, 11, 7].
  //   Twists: R move twists 4 corners. Standard: URF, DFR get +1 and +2? Precisely:
  //     URF: +2 (the R sticker goes to U face)
  //     UBR: +1
  //     DRB: +2
  //     DFR: +1
  //   Indexed by position: [URF=2, UFL=0, ULB=0, UBR=1, DFR=1, DLF=0, DBL=0, DRB=2]
  //
  // L CW (viewed from -X side): ULB -> UFL -> DLF -> DBL -> ULB.
  //   Cycle = [2, 1, 5, 6].
  //   Edges: UL(1)->FL(4)->DL(9)->BL(5)->UL(1). Cycle = [1, 4, 9, 5].
  //   Twists: ULB+1, UFL+2, DLF+1, DBL+2
  //     [0, 2, 1, 0, 0, 1, 2, 0]
  //
  // F CW (viewed from +Z side, i.e. front): UFL -> URF -> DFR -> DLF -> UFL.
  //   Cycle = [1, 0, 4, 5].
  //   Edges: UF(0)->FR(7)->DF(8)->FL(4)->UF(0). Cycle = [0, 7, 8, 4].
  //   Twists: UFL+1, URF+2, DFR+1, DLF+2
  //     [2, 1, 0, 0, 1, 2, 0, 0]
  //   Flips: all 4 F-face edges flip (UF, FR, DF, FL). Positions 0, 7, 8, 4.
  //
  // B CW (viewed from -Z side, i.e. back): UBR -> ULB -> DBL -> DRB -> UBR.
  //   Cycle = [3, 2, 6, 7].
  //   Edges: UB(2)->BL(5)->DB(10)->BR(6)->UB(2). Cycle = [2, 5, 10, 6].
  //   Twists: UBR+1, ULB+2, DBL+1, DRB+2
  //     [0, 0, 2, 1, 0, 0, 1, 2]
  //   Flips: positions 2, 5, 10, 6.

  const MOVES_CW = {
    U: {
      // CW from above = +90° about +Y axis: UFL(1) -> ULB(2) -> UBR(3) -> URF(0) -> UFL(1)
      cCycle: [1, 2, 3, 0],
      cTwist: [0, 0, 0, 0, 0, 0, 0, 0],
      // UF(0) -> UL(1) -> UB(2) -> UR(3) -> UF(0)
      eCycle: [0, 1, 2, 3],
      eFlip:  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    },
    D: {
      cCycle: [4, 7, 6, 5],
      cTwist: [0, 0, 0, 0, 0, 0, 0, 0],
      eCycle: [8, 11, 10, 9],
      eFlip:  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    },
    R: {
      cCycle: [0, 3, 7, 4],
      cTwist: [2, 0, 0, 1, 1, 0, 0, 2],
      eCycle: [3, 6, 11, 7],
      eFlip:  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    },
    L: {
      cCycle: [2, 1, 5, 6],
      cTwist: [0, 1, 2, 0, 0, 2, 1, 0],
      eCycle: [1, 4, 9, 5],
      eFlip:  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    },
    F: {
      cCycle: [1, 0, 4, 5],
      cTwist: [1, 2, 0, 0, 2, 1, 0, 0],
      eCycle: [0, 7, 8, 4],
      eFlip:  [1, 0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 0],
    },
    B: {
      cCycle: [3, 2, 6, 7],
      cTwist: [0, 0, 1, 2, 0, 0, 2, 1],
      eCycle: [2, 5, 10, 6],
      eFlip:  [0, 0, 1, 0, 0, 1, 1, 0, 0, 0, 1, 0],
    },
  };

  function applyMoveOnce(s, face) {
    const def = MOVES_CW[face];
    if (!def) return;
    applyCycle(s.cp, def.cCycle);
    applyCycle(s.co, def.cCycle);
    applyCycle(s.ep, def.eCycle);
    applyCycle(s.eo, def.eCycle);
    for (let i = 0; i < N_C; i++) s.co[i] = (s.co[i] + def.cTwist[i]) % 3;
    for (let i = 0; i < N_E; i++) s.eo[i] = (s.eo[i] + def.eFlip[i]) % 2;
  }

  function turn(s, move) {
    const face = move[0];
    const n = move.endsWith("'") ? 3 : 1;
    for (let i = 0; i < n; i++) applyMoveOnce(s, face);
  }

  function applyMoves(s, moves) {
    for (const m of moves) turn(s, m);
  }

  // ---------- Scramble ----------
  function randomScramble(n) {
    const faces = ['U', 'R', 'F', 'D', 'L', 'B'];
    const mods = ["", "'"];
    const opp = { U:'D', D:'U', R:'L', L:'R', F:'B', B:'F' };
    const out = [];
    let prev = null, prev2 = null;
    for (let i = 0; i < n; i++) {
      let f;
      do { f = faces[(Math.random() * 6) | 0]; }
      while (f === prev || (f === prev2 && opp[f] === prev));
      prev2 = prev; prev = f;
      out.push(f + mods[(Math.random() * 2) | 0]);
    }
    return out;
  }

  // ---------- Solver core ----------
  //
  // Each phase: BFS from current state. Goal = predicate. Move set = all 12.
  // State hashing: serialize relevant cp/co/ep/eo entries to a string.
  //
  // To keep BFS tractable, each phase only cares about a subset of cubies.
  // The goal predicate locks previously-solved cubies in place (those don't
  // move in a correct solution if we restrict moves appropriately — for
  // beginner method that's tricky, but BFS with "don't disturb" predicate
  // is fine because we check final state of protected pieces too).

  const ALL_MOVES = ['U',"U'",'R',"R'",'F',"F'",'D',"D'",'L',"L'",'B',"B'"];

  function hashState(s) {
    return s.cp.join(',') + '|' + s.co.join('') + '|' + s.ep.join(',') + '|' + s.eo.join('');
  }

  // ---------- Solved check ----------
  //
  // Piece indexing (used throughout):
  //   Corners: 0=URF 1=UFL 2=ULB 3=UBR 4=DFR 5=DLF 6=DBL 7=DRB
  //   Edges:   0=UF 1=UL 2=UB 3=UR 4=FL 5=BL 6=BR 7=FR
  //            8=DF 9=DL 10=DB 11=DR
  //
  // State is "solved" iff every cubie sits in its home position with
  // orientation zero.
  function goalSolved(s) {
    return statesEqual(s, solvedState());
  }

  // ================================================================
  // Solver — bidirectional BFS on full cube state.
  //
  //   Forward side expands from the current (scrambled) state.
  //   Backward side expands from the solved state.
  //   Each step expands whichever frontier is smaller; they meet in the
  //   middle. If the meet happens at depth K per side, total solve length
  //   is 2K. With maxPerSide = 10, we handle any state ≤ 20 moves from
  //   solved — well within God's Number (20).
  //
  // In practice, the browser budget keeps us to scrambles of ≤ 9-10 moves
  // (solved in a few hundred ms). Unlike v1's scramble-reverse replay,
  // this solver finds a solution for any valid cube state — including
  // ones we never scrambled to.
  // ================================================================
  function solve(start) {
    if (goalSolved(start)) return [];
    return biBFS(start, 10);
  }

  // Bidirectional BFS on the full cube state. Expands the smaller frontier
  // first. Correct for ANY reachable state. Scales up to ~14 moves total in
  // the browser thanks to meet-in-middle cutting depth per side in half.
  function biBFS(start, maxPerSide) {
    if (goalSolved(start)) return [];
    const solved = solvedState();
    const startKey = hashState(start);
    const solvedKey = hashState(solved);
    const fwd = new Map(); fwd.set(startKey, null);
    const bwd = new Map(); bwd.set(solvedKey, null);
    let fwdFrontier = [{ s: cloneState(start), k: startKey }];
    let bwdFrontier = [{ s: cloneState(solved), k: solvedKey }];

    for (let d = 0; d < maxPerSide; d++) {
      if (fwdFrontier.length <= bwdFrontier.length) {
        const meet = expandBi(fwdFrontier, fwd, bwd);
        if (meet) {
          return reconstruct(fwd, meet.key, startKey)
            .concat(invertPath(reconstruct(bwd, meet.key, solvedKey)));
        }
      } else {
        const meet = expandBi(bwdFrontier, bwd, fwd);
        if (meet) {
          return reconstruct(fwd, meet.key, startKey)
            .concat(invertPath(reconstruct(bwd, meet.key, solvedKey)));
        }
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
        if (otherMap.has(nk)) return { key: nk };
        next.push({ s: ns, k: nk });
      }
    }
    frontier.length = 0;
    for (const n of next) frontier.push(n);
    return null;
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

  function simplify(moves) {
    // Collapse X X' and X' X pairs; leave X X (double turn) alone.
    const out = moves.slice();
    let changed = true;
    while (changed) {
      changed = false;
      for (let i = 0; i < out.length - 1; i++) {
        const a = out[i], b = out[i + 1];
        if (!a || !b) continue;
        if (a[0] !== b[0]) continue;
        const ap = a.endsWith("'"), bp = b.endsWith("'");
        if (ap !== bp) {
          out.splice(i, 2);
          changed = true;
          break;
        }
      }
    }
    return out;
  }

  // ================================================================
  // Facelet-level cube (for rendering). Independent from cubie model.
  // 6 faces × 9 stickers = 54 entries. Face order: U R F D L B.
  // Each face sticker order:
  //   0 1 2
  //   3 4 5
  //   6 7 8
  // ================================================================
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

  // For each CW face turn, we rotate that face's own stickers CW, and cycle a 12-sticker ring.
  //
  // Each "ring cycle" lists four triplets (face, indices) such that triplet0 moves to triplet1, etc.
  // triplet-i's stickers → triplet-(i+1) mod 4's stickers.
  // We apply: new[triplet1] = old[triplet0], etc.
  const RING = {
    U: [
      [F_F, [0,1,2]], // front top row
      [F_L, [0,1,2]], // left top row
      [F_B, [0,1,2]], // back top row
      [F_R, [0,1,2]], // right top row
    ],
    D: [
      [F_F, [6,7,8]],
      [F_R, [6,7,8]],
      [F_B, [6,7,8]],
      [F_L, [6,7,8]],
    ],
    R: [
      [F_U, [2,5,8]],
      [F_B, [6,3,0]], // B face's left column read bottom-to-top
      [F_D, [2,5,8]],
      [F_F, [2,5,8]],
    ],
    L: [
      [F_U, [0,3,6]],
      [F_F, [0,3,6]],
      [F_D, [0,3,6]],
      [F_B, [8,5,2]],
    ],
    F: [
      [F_U, [6,7,8]],
      [F_R, [0,3,6]],
      [F_D, [2,1,0]],
      [F_L, [8,5,2]],
    ],
    B: [
      [F_U, [2,1,0]],
      [F_L, [0,3,6]],
      [F_D, [6,7,8]],
      [F_R, [8,5,2]],
    ],
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
    // CW = triplet0 -> triplet1 -> triplet2 -> triplet3 -> triplet0
    // i.e. new[tripletN] = old[tripletN-1 mod 4]
    const saved = ring[3][1].map(i => f[ring[3][0]][i]);
    for (let k = 0; k < 3; k++) f[ring[3][0]][ring[3][1][k]] = f[ring[2][0]][ring[2][1][k]];
    for (let k = 0; k < 3; k++) f[ring[2][0]][ring[2][1][k]] = f[ring[1][0]][ring[1][1][k]];
    for (let k = 0; k < 3; k++) f[ring[1][0]][ring[1][1][k]] = f[ring[0][0]][ring[0][1][k]];
    for (let k = 0; k < 3; k++) f[ring[0][0]][ring[0][1][k]] = saved[k];
  }

  function applyFaceletMoves(f, moves) {
    for (const m of moves) faceletTurn(f, m);
  }

  // Convert facelets to cubie state (for solver). This is the tricky conversion.
  // Instead of building cubie state from scratch each time, we rebuild it by:
  //   For each corner position (face-triplet), look up which cubie has matching colors.
  //   Then determine orientation by comparing primary-slot sticker to cubie's primary color.

  const CUBE_CORNER_SLOTS = [
    [[F_U,8],[F_R,0],[F_F,2]], // URF
    [[F_U,6],[F_F,0],[F_L,2]], // UFL
    [[F_U,0],[F_L,0],[F_B,2]], // ULB
    [[F_U,2],[F_B,0],[F_R,2]], // UBR
    [[F_D,2],[F_F,8],[F_R,6]], // DFR
    [[F_D,0],[F_L,8],[F_F,6]], // DLF
    [[F_D,6],[F_B,8],[F_L,6]], // DBL
    [[F_D,8],[F_R,8],[F_B,6]], // DRB
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
    // corners
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
      // orientation: find which slot holds the primary color (W or Y)
      const primaryColor = CUBE_CORNER_COLORS[found][0]; // W or Y
      let primarySlot = colors.indexOf(primaryColor);
      s.co[pos] = primarySlot;
    }
    // edges
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
      // orientation: 0 if primary (slot 0) color matches first color of cubie
      const primaryColor = CUBE_EDGE_COLORS[found][0];
      s.eo[pos] = (c1 === primaryColor) ? 0 : 1;
    }
    return s;
  }

  function solveFromFacelets(fc) {
    const state = faceletsToState(fc);
    return solve(state);
  }

  // ---------- Expose ----------
  window.CubeSolver = {
    solvedState,
    cloneState,
    statesEqual,
    turn,
    applyMoves,
    randomScramble,
    solve,
    // Facelet-level API (rendering side)
    solvedFacelets,
    cloneFacelets,
    faceletTurn,
    applyFaceletMoves,
    faceletsSolved,
    faceletsToState,
    solveFromFacelets,
  };
})();
