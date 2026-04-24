/* ================================================================
   transition-cube-v3.js

   Same Rubik's cube transition as v2 — same scene graph, same
   group.attach/detach pattern that made v2 actually read as a cube
   turning — but tuned for a lighter, quicker feel per Jake's v3 notes:

     "the cube should move a lot quicker. It could potentially even
      have like a light spin to it, and it's going to be more of a
      like fade-in fade-out as opposed to like coming in, staying the
      same size the whole time, then going away. More of like a
      constant movement type thing, but be careful because it is
      already like looking good. So I don't want it heavily changed."

   Diff vs v2 (ONLY these):
     • Per-move duration: 220ms → 125ms.
     • Inter-move pause: 90ms → 40ms.
       → each move ~165ms total (v2 was ~310ms).
     • Move count: 8-move scramble → 6-move scramble. Solve ~5–7.
       Target total moves: ~11–13 (v2 was ~16).
     • Total move time: ~1800ms (v2 was ~5000ms).
     • Light ambient Y-spin on cubeGroup during moves (~0.2 rad/sec),
       applied via delta-time in the render loop. Pauses during the
       ~1-frame "snap" so the snap reads clean.
     • Overlay + cube FADE IN (opacity 0→1 over ~200ms) and FADE OUT
       (opacity 1→0 over ~250ms) — cube stays at a CONSTANT size
       throughout. No shrink.

   Unchanged (load-bearing — preserves v2 correctness):
     • group.attach / cubeGroup.attach pattern for layer rotations.
     • Cubies are THREE.Groups with stickers as children.
     • Facelet model drives sticker colors. Snap to ±π/2 on commit.
     • Quaternion normalize + integer-position snap on detach.
     • Cube palette, camera angle, init tilt.
     • Public API shape: playTransition({ onComplete, destinationUrl, duration }).
     • Console instrumentation (scramble / solve / per-move / snap / identity).

   Public API (identical shape to v2):
     TransitionCubeV3.playTransition({
       onComplete,         // () => void, fires when animation ends
       destinationUrl,     // if set, window.location.href = ... on done
       duration,           // optional hint; actual duration is governed
                           //   by the move queue (scramble + solve).
     });

   Aliased as window.TransitionCube if not already defined.
   ================================================================ */

(function (global) {
  "use strict";

  const THREE_CDN = "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js";
  const SOLVER_SRC_NAME = "cube-solver.js";

  // Classic cube palette (v2 verbatim — do not retune).
  const STICKER_COLORS = {
    W: 0xffffff, // white  (U)
    R: 0xb71234, // red    (R)
    G: 0x009b48, // green  (F)
    Y: 0xffd500, // yellow (D)
    O: 0xff5800, // orange (L)
    B: 0x0046ad, // blue   (B)
  };
  const BODY_COLOR = 0x111111;
  const OVERLAY_BG = "rgba(8,10,14,0.96)";

  // v3 timings. Per-move 125ms turn + 40ms pause = 165ms per move.
  // 6-move scramble + ~5–7 solve = ~11–13 total moves × 165ms ≈ 1.8–2.1s
  // of moves. With fade-in 200ms + fade-out 250ms the whole transition
  // lands right in Jake's 1.6–2.2s move window (plus fades).
  const MOVE_DURATION_MS = 125;
  const MOVE_PAUSE_MS    = 40;
  const SCRAMBLE_LEN     = 6;

  // Fade in/out (replaces v2's scale-in + shrink-out).
  const FADE_IN_MS  = 200;
  const FADE_OUT_MS = 250;

  // Ambient spin during moves. 0.2 rad/sec ≈ 11.5°/sec — a soft drift
  // that keeps the cube subtly moving without masking the face turns.
  const AMBIENT_SPIN_RATE = 0.2;  // radians per second
  // Briefly slow the ambient drift right after a snap so the snap reads
  // clean. This is the "pause or slow during the brief snap moment."
  const SNAP_SLOWDOWN_MS = 50;

  let inFlight = false;

  // --- Public API --------------------------------------------------

  function playTransition(opts) {
    opts = opts || {};
    if (inFlight) return;
    inFlight = true;

    const onDone = () => {
      inFlight = false;
      if (typeof opts.onComplete === "function") {
        try { opts.onComplete(); } catch (e) { console.error(e); }
      }
      if (opts.destinationUrl) {
        window.location.href = opts.destinationUrl;
      }
    };

    if (prefersReducedMotion()) {
      reducedMotionFallback(onDone);
      return;
    }

    ensureDeps().then(() => {
      runAnimation(opts, onDone);
    }).catch((err) => {
      console.error("[transition-cube-v3] dependency load failed:", err);
      reducedMotionFallback(onDone);
    });
  }

  function prefersReducedMotion() {
    return window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  // --- Dependency loading ------------------------------------------

  function ensureDeps() {
    const ps = [];
    if (!global.THREE) ps.push(loadScript(THREE_CDN));
    if (!global.TransitionCubeV3Solver) ps.push(loadScript(resolveSolverSrc()));
    return Promise.all(ps);
  }

  function resolveSolverSrc() {
    const scripts = document.getElementsByTagName("script");
    for (let i = 0; i < scripts.length; i++) {
      const src = scripts[i].src || "";
      if (src.endsWith("/transition-cube-v3.js") || src.endsWith("transition-cube-v3.js")) {
        return src.replace(/transition-cube-v3\.js(\?.*)?$/, SOLVER_SRC_NAME);
      }
    }
    return SOLVER_SRC_NAME;
  }

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = src;
      s.async = false;
      s.onload = () => resolve();
      s.onerror = () => reject(new Error("failed to load " + src));
      document.head.appendChild(s);
    });
  }

  // --- Reduced-motion fallback ------------------------------------

  function reducedMotionFallback(onDone) {
    const overlay = makeOverlay();
    overlay.style.transition = "opacity 240ms ease";
    document.body.appendChild(overlay);
    requestAnimationFrame(() => { overlay.style.opacity = "1"; });
    setTimeout(() => {
      overlay.style.opacity = "0";
      setTimeout(() => { overlay.remove(); onDone(); }, 280);
    }, 280);
  }

  function makeOverlay() {
    const el = document.createElement("div");
    el.className = "transition-cube-v3-overlay";
    el.setAttribute("aria-hidden", "true");
    el.style.cssText = [
      "position:fixed",
      "inset:0",
      "background:" + OVERLAY_BG,
      "z-index:2147483646",
      "display:flex",
      "align-items:center",
      "justify-content:center",
      "pointer-events:all",
      "opacity:0",
      "will-change:opacity",
    ].join(";");
    return el;
  }

  // --- Main animation ---------------------------------------------

  function runAnimation(opts, onDone) {
    const THREE = global.THREE;
    const Solver = global.TransitionCubeV3Solver;

    const overlay = makeOverlay();
    document.body.appendChild(overlay);

    // v3: CONSTANT size throughout. No scale animation. Only opacity.
    const stage = document.createElement("div");
    stage.style.cssText = [
      "position:relative",
      "width:min(82vmin, 760px)",
      "height:min(82vmin, 760px)",
      "opacity:0",
      "transform:none",
      "transform-origin:center center",
      "will-change:opacity",
    ].join(";");
    overlay.appendChild(stage);

    // --- Three.js setup -----------------------------------------
    const w = stage.clientWidth || 600;
    const h = stage.clientHeight || 600;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, w / h, 0.1, 100);
    camera.position.set(4.5, 5.0, 6.5);
    camera.lookAt(0, 0, 0);

    // Lighting — unchanged from v2.
    scene.add(new THREE.AmbientLight(0xffffff, 0.78));
    const key = new THREE.DirectionalLight(0xffffff, 0.45);
    key.position.set(5, 8, 6);
    scene.add(key);
    const fill = new THREE.DirectionalLight(0xffffff, 0.22);
    fill.position.set(-4, 2, -3);
    scene.add(fill);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(w, h);
    renderer.domElement.style.cssText = "width:100%;height:100%;display:block";
    stage.appendChild(renderer.domElement);

    // Root group — initial tilt is v2's. v3 ADDS a continuous y-drift
    // layered on top via the render loop's dt path, but x-tilt stays.
    const cubeGroup = new THREE.Group();
    cubeGroup.rotation.x = -0.32;
    cubeGroup.rotation.y =  0.52;
    scene.add(cubeGroup);

    // Build cubies — identical construction to v2. Do not modify.
    const cubies = buildCubies(THREE);
    cubies.forEach(c => cubeGroup.add(c.group));

    // Facelet model.
    let facelets = Solver.solvedFacelets();
    paintStickers(cubies, facelets);

    // --- Build the move queue: scramble + solve ------------------
    const scrambleMoves = Solver.randomScramble(SCRAMBLE_LEN);
    const scrambledFacelets = Solver.cloneFacelets(facelets);
    Solver.applyFaceletMoves(scrambledFacelets, scrambleMoves);
    const solveMoves = Solver.solveFromFacelets(scrambledFacelets) || [];

    const queue = scrambleMoves.concat(solveMoves);

    console.log(
      "[transition-cube-v3] scramble (" + scrambleMoves.length + "):",
      scrambleMoves.join(" ")
    );
    console.log(
      "[transition-cube-v3] solve (" + solveMoves.length + "):",
      solveMoves.join(" ")
    );
    console.log(
      "[transition-cube-v3] total moves:", queue.length,
      "| per-move:", MOVE_DURATION_MS + "ms +", MOVE_PAUSE_MS + "ms pause",
      "| estimated moves duration:",
      ((MOVE_DURATION_MS + MOVE_PAUSE_MS) * queue.length) + "ms",
      "| fade-in:", FADE_IN_MS + "ms | fade-out:", FADE_OUT_MS + "ms"
    );

    // One-shot identity check (4× U). Same test as v2, retained
    // because it verifies the attach/detach math we rely on.
    if (!global.__transitionCubeV3IdentityChecked) {
      global.__transitionCubeV3IdentityChecked = true;
      runIdentityCheck(THREE);
    }

    // --- Resize -------------------------------------------------
    function handleResize() {
      const nw = stage.clientWidth, nh = stage.clientHeight;
      if (!nw || !nh) return;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    }
    window.addEventListener("resize", handleResize);

    // --- Render loop & move player ------------------------------
    let running = true;
    let currentMove = null;
    let moveIdx = 0;
    let pauseUntil = 0;
    let finishing = false;
    let finishStartT = 0;

    const startT = performance.now();
    let lastT = startT;
    let lastSnapT = -Infinity;  // used to slow ambient drift right after a snap

    // Per-frame fade driver for the stage opacity (and overlay).
    function opacityForPhase(t) {
      if (finishing) {
        const fp = clamp((t - finishStartT) / FADE_OUT_MS, 0, 1);
        return 1 - easeInCubic(fp);
      }
      const ip = clamp((t - startT) / FADE_IN_MS, 0, 1);
      return easeOutQuad(ip);
    }

    function render() {
      if (!running) return;
      const t = performance.now();
      const dt = Math.max(0, (t - lastT) / 1000); // seconds
      lastT = t;

      // Ambient light spin on the whole cubeGroup. Always on, but
      // briefly softened for ~50ms after each snap so the snap reads
      // clean — the cube is still moving, just a little gentler at the
      // moment your eye locks onto the square edges.
      let spinFactor = 1.0;
      const sinceSnap = t - lastSnapT;
      if (sinceSnap >= 0 && sinceSnap < SNAP_SLOWDOWN_MS) {
        spinFactor = sinceSnap / SNAP_SLOWDOWN_MS; // 0 → 1 ease-in
      }
      cubeGroup.rotation.y += dt * AMBIENT_SPIN_RATE * spinFactor;

      // Opacity drive (in-phase or out-phase).
      const op = opacityForPhase(t);
      overlay.style.opacity = op.toFixed(4);
      stage.style.opacity = op.toFixed(4);

      // Progress current move (if any).
      if (currentMove) {
        const p = clamp((t - currentMove.startT) / (currentMove.endT - currentMove.startT), 0, 1);
        const eased = easeInOutQuad(p);
        currentMove.group.rotation[currentMove.axis] = currentMove.targetAngle * eased;
        if (p >= 1) commitMove(currentMove);
      } else if (t >= pauseUntil) {
        if (moveIdx < queue.length) {
          startNextMove(queue[moveIdx], moveIdx, queue.length);
          moveIdx++;
        } else if (!finishing) {
          finishing = true;
          finishStartT = t;
        }
      }

      renderer.render(scene, camera);

      if (finishing && (t - finishStartT) >= FADE_OUT_MS) {
        cleanup();
        onDone();
        return;
      }

      requestAnimationFrame(render);
    }

    function startNextMove(moveStr, idx, total) {
      const face = moveStr[0];
      const prime = moveStr.endsWith("'");
      const spec = FACE_SPEC[face];

      // Layer group is a child of cubeGroup — preserved from v2.
      const layerGroup = new THREE.Group();
      cubeGroup.add(layerGroup);

      const affected = [];
      for (const c of cubies) {
        const p = c.group.position;
        if (spec.pick(p)) affected.push(c);
      }

      // group.attach — world-preserving reparent (v2's key fix).
      affected.forEach(c => layerGroup.attach(c.group));

      const targetAngle = (prime ? -1 : +1) * spec.sign * (Math.PI / 2);

      currentMove = {
        moveStr, face, prime,
        group: layerGroup,
        axis: spec.axis,
        targetAngle,
        startT: performance.now(),
        endT: performance.now() + MOVE_DURATION_MS,
        cubies: affected,
      };

      console.log(
        "[transition-cube-v3] [move " + (idx + 1) + "/" + total + "] " +
        moveStr + " — axis " + spec.axis + " target " +
        (targetAngle * 180 / Math.PI).toFixed(1) + "°"
      );
    }

    function commitMove(mv) {
      // Snap to exactly ±π/2 before detach — v2 pattern, unchanged.
      mv.group.rotation[mv.axis] = mv.targetAngle;

      const actual = mv.group.rotation[mv.axis];
      const expected = mv.targetAngle;
      const ok = Math.abs(actual - expected) < 1e-9;
      console.log(
        "[transition-cube-v3]   snap: rotation." + mv.axis + "=" +
        actual.toFixed(6) + " (expected " + expected.toFixed(6) + ") " +
        (ok ? "OK" : "DRIFT")
      );

      // cubeGroup.attach preserves WORLD transform across the reparent.
      // Because cubeGroup is now drifting on Y, this is load-bearing:
      // if we used add/remove here instead, the cubies would visibly
      // jump every commit by the amount cubeGroup drifted during the
      // move. attach() cancels that out by construction.
      mv.cubies.forEach(c => {
        cubeGroup.attach(c.group);
        c.group.position.set(
          Math.round(c.group.position.x),
          Math.round(c.group.position.y),
          Math.round(c.group.position.z)
        );
        snapQuaternion(c.group.quaternion);
        c.group.updateMatrix();
      });
      cubeGroup.remove(mv.group);

      Solver.faceletTurn(facelets, mv.moveStr);
      paintStickers(cubies, facelets);

      currentMove = null;
      pauseUntil = performance.now() + MOVE_PAUSE_MS;
      lastSnapT = performance.now();
    }

    function cleanup() {
      running = false;
      window.removeEventListener("resize", handleResize);
      try {
        cubeGroup.traverse(obj => {
          if (obj.geometry) obj.geometry.dispose();
          if (obj.material) {
            if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose && m.dispose());
            else obj.material.dispose && obj.material.dispose();
          }
        });
        renderer.dispose();
      } catch (e) { /* ignore */ }
      overlay.remove();
    }

    // Kick the render loop. No CSS transition kickoff — v3 drives
    // fade-in via per-frame opacity so it stays in lockstep with the
    // render loop and the ambient drift.
    requestAnimationFrame(render);
  }

  // --- Cubie + sticker construction (VERBATIM from v2) -------------

  function buildCubies(THREE) {
    const cubies = [];
    const BODY = 0.96;
    const GAP  = 1.0;
    const bodyGeom = new THREE.BoxGeometry(BODY, BODY, BODY);
    const bodyMat  = new THREE.MeshLambertMaterial({ color: BODY_COLOR });

    const STICKER = 0.86;
    const STICKER_OFFSET = BODY / 2 + 0.001;

    for (let x = -1; x <= 1; x++) {
      for (let y = -1; y <= 1; y++) {
        for (let z = -1; z <= 1; z++) {
          if (x === 0 && y === 0 && z === 0) continue;

          const group = new THREE.Group();
          group.position.set(x * GAP, y * GAP, z * GAP);

          const body = new THREE.Mesh(bodyGeom, bodyMat);
          group.add(body);

          const stickerList = [];
          const faces = [
            { f: 'U', dir: [0,  1, 0], pos: [0,  STICKER_OFFSET, 0], rot: [-Math.PI / 2, 0, 0] },
            { f: 'D', dir: [0, -1, 0], pos: [0, -STICKER_OFFSET, 0], rot: [ Math.PI / 2, 0, 0] },
            { f: 'R', dir: [ 1, 0, 0], pos: [ STICKER_OFFSET, 0, 0], rot: [0,  Math.PI / 2, 0] },
            { f: 'L', dir: [-1, 0, 0], pos: [-STICKER_OFFSET, 0, 0], rot: [0, -Math.PI / 2, 0] },
            { f: 'F', dir: [0, 0,  1], pos: [0, 0,  STICKER_OFFSET], rot: [0, 0, 0] },
            { f: 'B', dir: [0, 0, -1], pos: [0, 0, -STICKER_OFFSET], rot: [0, Math.PI, 0] },
          ];
          for (const spec of faces) {
            if (spec.dir[0] !== 0 && spec.dir[0] !== x) continue;
            if (spec.dir[1] !== 0 && spec.dir[1] !== y) continue;
            if (spec.dir[2] !== 0 && spec.dir[2] !== z) continue;
            const geom = new THREE.PlaneGeometry(STICKER, STICKER);
            const mat = new THREE.MeshLambertMaterial({ color: 0xffffff });
            const mesh = new THREE.Mesh(geom, mat);
            mesh.position.set(spec.pos[0], spec.pos[1], spec.pos[2]);
            mesh.rotation.set(spec.rot[0], spec.rot[1], spec.rot[2]);
            group.add(mesh);
            stickerList.push({ face: spec.f, mesh, mat });
          }

          cubies.push({
            group,
            initial: { x, y, z },
            stickers: stickerList,
          });
        }
      }
    }
    return cubies;
  }

  function paintStickers(cubies, facelets) {
    for (const c of cubies) {
      const wx = Math.round(c.group.position.x);
      const wy = Math.round(c.group.position.y);
      const wz = Math.round(c.group.position.z);
      for (const s of c.stickers) {
        const n = stickerWorldNormal(c.group, s);
        const dir = roundDir(n);
        const faceId = dirToFaceId(dir);
        const faceletIdx = faceletIndex(faceId, wx, wy, wz, dir);
        const color = facelets[faceId][faceletIdx];
        s.mat.color.setHex(STICKER_COLORS[color] || 0x888888);
      }
    }
  }

  function stickerWorldNormal(cubieGroup, sticker) {
    const THREE = global.THREE;
    const v = new THREE.Vector3(0, 0, 1);
    v.applyEuler(sticker.mesh.rotation);
    v.applyQuaternion(cubieGroup.quaternion);
    return v;
  }

  function roundDir(v) {
    const ax = Math.abs(v.x), ay = Math.abs(v.y), az = Math.abs(v.z);
    if (ax >= ay && ax >= az) return { x: Math.sign(v.x), y: 0, z: 0 };
    if (ay >= ax && ay >= az) return { x: 0, y: Math.sign(v.y), z: 0 };
    return { x: 0, y: 0, z: Math.sign(v.z) };
  }

  function dirToFaceId(dir) {
    if (dir.y ===  1) return 0; // U
    if (dir.x ===  1) return 1; // R
    if (dir.z ===  1) return 2; // F
    if (dir.y === -1) return 3; // D
    if (dir.x === -1) return 4; // L
    if (dir.z === -1) return 5; // B
    return 0;
  }

  function faceletIndex(faceId, x, y, z) {
    let row, col;
    switch (faceId) {
      case 0: row = z + 1; col = x + 1; break;
      case 3: row = -z + 1; col = x + 1; break;
      case 2: row = -y + 1; col = x + 1; break;
      case 5: row = -y + 1; col = -x + 1; break;
      case 1: row = -y + 1; col = -z + 1; break;
      case 4: row = -y + 1; col =  z + 1; break;
      default: row = 1; col = 1;
    }
    return row * 3 + col;
  }

  // --- Face picking + axis conventions ----------------------------

  const FACE_SPEC = {
    U: { axis: 'y', sign: -1, pick: p => p.y >  0.5 },
    D: { axis: 'y', sign: +1, pick: p => p.y < -0.5 },
    R: { axis: 'x', sign: -1, pick: p => p.x >  0.5 },
    L: { axis: 'x', sign: +1, pick: p => p.x < -0.5 },
    F: { axis: 'z', sign: -1, pick: p => p.z >  0.5 },
    B: { axis: 'z', sign: +1, pick: p => p.z < -0.5 },
  };

  // --- Identity check (throwaway scene, no render) -----------------
  function runIdentityCheck(THREE) {
    const scene = new THREE.Scene();
    const root = new THREE.Group();
    scene.add(root);

    const probes = [];
    for (let x = -1; x <= 1; x++) {
      for (let z = -1; z <= 1; z++) {
        const g = new THREE.Group();
        g.position.set(x, 1, z);
        root.add(g);
        probes.push({ start: { x, y: 1, z }, g });
      }
    }

    for (let i = 0; i < 4; i++) {
      const layer = new THREE.Group();
      root.add(layer);
      probes.forEach(p => { if (p.g.position.y > 0.5) layer.attach(p.g); });
      layer.rotation.y = -Math.PI / 2;
      layer.updateMatrixWorld(true);
      probes.forEach(p => {
        root.attach(p.g);
        p.g.position.set(
          Math.round(p.g.position.x),
          Math.round(p.g.position.y),
          Math.round(p.g.position.z)
        );
      });
      root.remove(layer);
    }

    let ok = true;
    for (const p of probes) {
      const dx = Math.abs(p.g.position.x - p.start.x);
      const dy = Math.abs(p.g.position.y - p.start.y);
      const dz = Math.abs(p.g.position.z - p.start.z);
      if (dx > 1e-6 || dy > 1e-6 || dz > 1e-6) ok = false;
    }
    console.log(
      "[transition-cube-v3] identity check (4× U): " +
      (ok ? "OK — all 9 U-layer cubies returned to start." : "FAILED")
    );
  }

  // --- Small helpers -----------------------------------------------

  function clamp(x, lo, hi) { return Math.max(lo, Math.min(hi, x)); }
  function easeInOutQuad(t) {
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  }
  function easeOutQuad(t) { return 1 - (1 - t) * (1 - t); }
  function easeInCubic(t) { return t * t * t; }

  function snapQuaternion(q) {
    q.normalize();
  }

  global.TransitionCubeV3 = { playTransition };

  // Generic alias requested in the v3 brief — lets consumers bind to
  // the latest version by calling `TransitionCube.playTransition(...)`.
  if (!global.TransitionCube) global.TransitionCube = global.TransitionCubeV3;
})(typeof window !== "undefined" ? window : globalThis);
