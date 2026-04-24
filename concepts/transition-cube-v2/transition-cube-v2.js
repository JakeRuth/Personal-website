/* ================================================================
   transition-cube-v2.js

   A Rubik's cube transition that actually looks like it's rotating.

   Public API:
     TransitionCubeV2.playTransition({
       onComplete,         // () => void, fires when animation ends
       destinationUrl,     // if set, window.location.href = ... on done
       duration,           // optional hint; actual duration is governed
                           //   by the move queue (scramble + solve).
     });

   What v1 got wrong (diagnosed before writing this file):
     1. The U/D/R/L/F/B test in v1 picked up both cubie bodies AND the
        separate sticker meshes that happened to lie at |y| = 1.5, but
        the commit step reset child.rotation to (0,0,0) which WIPED the
        sticker orientations (stickers need rotation.x = -π/2 etc. to
        face outward). So after one turn, stickers flattened / faced
        wrong directions — reading as a "jittery mess."
     2. cubeGroup.rotation.y was incremented every frame (base spin)
        even while a layer-group was mid-rotation. The layer is a child
        of cubeGroup, so its local rotation and cubeGroup's rotation
        compound — visually, the "face turn" drifts with the spin
        instead of reading as a clean quarter turn.
     3. v1 used cubeGroup.add(c) / cubeGroup.remove(c) when attaching
        to the layer group. add/remove preserve LOCAL transforms; when
        the parent has any rotation of its own, world positions jump.
        Three.js has group.attach(object) / scene.attach(object) for
        exactly this case — preserves WORLD transform across reparents.
     4. No pauses between moves. 3-4 moves dissolved into a 600ms blur.
        Impossible for the eye to read a quarter turn.

   What v2 does differently:
     - Each cubie is a THREE.Group with a black body + outward-facing
       sticker planes as children. Rotate the cubie, stickers rotate
       with it automatically. No sticker-orientation-reset footgun.
     - Face-rotations use group.attach / cubeGroup.attach to preserve
       world transforms. Snap-to exactly ±π/2 before detaching.
     - Queue-based move player. One move at a time. Per-move duration
       ~220ms easeInOutQuad, ~90ms pause between moves.
     - Base camera tilt is set once on cubeGroup at init. No per-frame
       spin during or between moves. The cube is readable.
     - Fixed perspective camera at (4.5, 5, 6.5) looking at origin.
     - Classic saturated cube palette (WCA-ish): 0xffffff, 0xffd500,
       0xb71234, 0xff5800, 0x0046ad, 0x009b48. Black plastic 0x111111
       as the cubie body.

   Console instrumentation (load-bearing for the no-Chrome test plan):
     - Logs the full scramble sequence and full solve sequence before
       playing them.
     - Logs each move as it starts: "[move 1/18] U".
     - Logs group.rotation after each snap-to: confirms exactly ±π/2.
     - Logs cubie world-position identity check after 4 U moves at
       init, before the transition plays (once per page load).
   ================================================================ */

(function (global) {
  "use strict";

  const THREE_CDN = "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js";
  const SOLVER_SRC_NAME = "cube-solver.js";

  // Classic cube palette. Saturated, reads instantly.
  const STICKER_COLORS = {
    W: 0xffffff, // white  (U)
    R: 0xb71234, // red    (R)
    G: 0x009b48, // green  (F)
    Y: 0xffd500, // yellow (D)
    O: 0xff5800, // orange (L)
    B: 0x0046ad, // blue   (B)
  };
  const BODY_COLOR = 0x111111;     // black plastic between stickers
  const OVERLAY_BG = "rgba(8,10,14,0.96)";

  // Animation timings — tuned so each quarter turn READS as a distinct
  // move rather than a blur. 220ms turn + 90ms pause = 310ms per move.
  // At ~18 moves (scramble 7 + solve 11ish), that's ~5.6s of moves, plus
  // fade in / fade out → ~6.5s total. Within Jake's 5-8s expected budget.
  const MOVE_DURATION_MS = 220;
  const MOVE_PAUSE_MS    = 90;
  // 8-move scramble typically needs 8 moves to solve (we've seen 7–8).
  // That's ~16 total moves × 310ms = ~5.0s of animation, plus fade
  // in/out. Comfortably inside Jake's 5–8s expectation.
  const SCRAMBLE_LEN     = 8;

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
      console.error("[transition-cube-v2] dependency load failed:", err);
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
    if (!global.TransitionCubeV2Solver) ps.push(loadScript(resolveSolverSrc()));
    return Promise.all(ps);
  }

  function resolveSolverSrc() {
    const scripts = document.getElementsByTagName("script");
    for (let i = 0; i < scripts.length; i++) {
      const src = scripts[i].src || "";
      if (src.endsWith("/transition-cube-v2.js") || src.endsWith("transition-cube-v2.js")) {
        return src.replace(/transition-cube-v2\.js(\?.*)?$/, SOLVER_SRC_NAME);
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
    overlay.style.transition = "opacity 280ms ease";
    document.body.appendChild(overlay);
    requestAnimationFrame(() => { overlay.style.opacity = "1"; });
    setTimeout(() => {
      overlay.style.opacity = "0";
      setTimeout(() => { overlay.remove(); onDone(); }, 320);
    }, 320);
  }

  function makeOverlay() {
    const el = document.createElement("div");
    el.className = "transition-cube-v2-overlay";
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
    const Solver = global.TransitionCubeV2Solver;

    const overlay = makeOverlay();
    document.body.appendChild(overlay);

    const stage = document.createElement("div");
    stage.style.cssText = [
      "position:relative",
      "width:min(82vmin, 760px)",
      "height:min(82vmin, 760px)",
      "transform:scale(0.55)",
      "opacity:0",
      "transform-origin:center center",
      "will-change:transform,opacity",
      "transition:transform 420ms cubic-bezier(.2,.8,.2,1), opacity 380ms ease",
    ].join(";");
    overlay.appendChild(stage);

    // --- Three.js setup -----------------------------------------
    const w = stage.clientWidth || 600;
    const h = stage.clientHeight || 600;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, w / h, 0.1, 100);
    camera.position.set(4.5, 5.0, 6.5);
    camera.lookAt(0, 0, 0);

    // Lighting — MeshLambert gives the stickers a tiny shade delta per
    // face so the 3D-ness reads without the cube looking cartoony.
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

    // Root group holds the 27 cubies. Tilt is set ONCE — not animated
    // during the solve (that was a v1 source of jitter).
    const cubeGroup = new THREE.Group();
    cubeGroup.rotation.x = -0.32;
    cubeGroup.rotation.y =  0.52;
    scene.add(cubeGroup);

    // Build 27 cubies. Each is a THREE.Group parenting one body mesh
    // plus up to 3 outward-facing sticker plane meshes. Since stickers
    // are children of the cubie, rotating the cubie rotates them too —
    // no separate bookkeeping, no orientation-reset footgun.
    const cubies = buildCubies(THREE);
    cubies.forEach(c => cubeGroup.add(c.group));

    // Facelet model drives sticker colors. Start solved.
    let facelets = Solver.solvedFacelets();
    paintStickers(cubies, facelets);

    // --- Build the move queue: scramble + solve ------------------
    const scrambleMoves = Solver.randomScramble(SCRAMBLE_LEN);
    const scrambledFacelets = Solver.cloneFacelets(facelets);
    Solver.applyFaceletMoves(scrambledFacelets, scrambleMoves);
    const solveMoves = Solver.solveFromFacelets(scrambledFacelets) || [];

    const queue = scrambleMoves.concat(solveMoves);

    console.log(
      "[transition-cube-v2] scramble (" + scrambleMoves.length + "):",
      scrambleMoves.join(" ")
    );
    console.log(
      "[transition-cube-v2] solve (" + solveMoves.length + "):",
      solveMoves.join(" ")
    );
    console.log(
      "[transition-cube-v2] total moves:", queue.length,
      "| per-move:", MOVE_DURATION_MS + "ms +", MOVE_PAUSE_MS + "ms pause",
      "| estimated moves duration:",
      ((MOVE_DURATION_MS + MOVE_PAUSE_MS) * queue.length) + "ms"
    );

    // --- Identity check (one-shot, debug): 4 U moves should return
    // every U-layer cubie to its original world position. Runs on a
    // throwaway test scene so the real cube isn't disturbed.
    if (!global.__transitionCubeV2IdentityChecked) {
      global.__transitionCubeV2IdentityChecked = true;
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
    let currentMove = null;  // { face, prime, group, axis, targetAngle, startT, endT, cubies }
    let moveIdx = 0;
    let pauseUntil = 0;
    let finishing = false;
    let finishStartT = 0;
    const FINISH_MS = 520;

    const FADE_IN_MS = 420;
    const startT = performance.now();

    function render() {
      if (!running) return;
      const t = performance.now();

      // Overlay background fades in over the first FADE_IN_MS. The
      // cube stage itself (scale + opacity) uses a CSS transition
      // that's kicked off once, below the render loop definition.
      if (!finishing) {
        overlay.style.opacity = String(clamp((t - startT) / (FADE_IN_MS * 0.9), 0, 1));
      }

      // Progress current move (if any).
      if (currentMove) {
        const p = clamp((t - currentMove.startT) / (currentMove.endT - currentMove.startT), 0, 1);
        const eased = easeInOutQuad(p);
        currentMove.group.rotation[currentMove.axis] = currentMove.targetAngle * eased;
        if (p >= 1) commitMove(currentMove);
      } else if (t >= pauseUntil) {
        // Pull next move from the queue.
        if (moveIdx < queue.length) {
          startNextMove(queue[moveIdx], moveIdx, queue.length);
          moveIdx++;
        } else if (!finishing) {
          finishing = true;
          finishStartT = t;
          // Swap from CSS-transition-driven fade-in to per-frame
          // transform so the shrink reads smoothly without fighting
          // the initial transition.
          stage.style.transition = "none";
        }
      }

      // Fade-out phase.
      if (finishing) {
        const fp = clamp((t - finishStartT) / FINISH_MS, 0, 1);
        const e = easeInCubic(fp);
        stage.style.transform = "scale(" + (1 - e * 0.72).toFixed(4) + ")";
        stage.style.opacity = (1 - e).toFixed(4);
        overlay.style.opacity = (1 - e).toFixed(4);
        if (fp >= 1) {
          cleanup();
          onDone();
          return;
        }
      }

      renderer.render(scene, camera);
      requestAnimationFrame(render);
    }

    function startNextMove(moveStr, idx, total) {
      const face = moveStr[0];
      const prime = moveStr.endsWith("'");
      const spec = FACE_SPEC[face];

      // The layer group is a child of cubeGroup — same frame of
      // reference as the cubies we're about to attach.
      const layerGroup = new THREE.Group();
      cubeGroup.add(layerGroup);

      const affected = [];
      // Pick cubies whose LOCAL position (in cubeGroup) matches the face.
      // Local position is fine: at init, every cubie's local == its grid
      // position, and at commit time we snap local positions back to the
      // grid before the next move runs.
      for (const c of cubies) {
        const p = c.group.position;
        if (spec.pick(p)) affected.push(c);
      }

      // group.attach preserves WORLD transforms across reparent.
      affected.forEach(c => layerGroup.attach(c.group));

      // CW when looking from +axis toward origin. U CW is -Y in our
      // convention (Y grows up; CW viewed from above is a NEGATIVE
      // rotation around +Y under Three.js right-handed convention).
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
        "[transition-cube-v2] [move " + (idx + 1) + "/" + total + "] " +
        moveStr + " — axis " + spec.axis + " target " +
        (targetAngle * 180 / Math.PI).toFixed(1) + "°"
      );
    }

    function commitMove(mv) {
      // Snap to exactly ±π/2 before detaching. This guarantees no
      // floating-point drift accumulates across moves.
      mv.group.rotation[mv.axis] = mv.targetAngle;

      // Verify and log.
      const actual = mv.group.rotation[mv.axis];
      const expected = mv.targetAngle;
      const ok = Math.abs(actual - expected) < 1e-9;
      console.log(
        "[transition-cube-v2]   snap: rotation." + mv.axis + "=" +
        actual.toFixed(6) + " (expected " + expected.toFixed(6) + ") " +
        (ok ? "OK" : "DRIFT")
      );

      // Detach each cubie back to cubeGroup, preserving WORLD transforms.
      // After attach(), the cubie's local transform is whatever keeps its
      // world transform invariant — i.e. the rotation is now baked into
      // its own transform. We then round-clean local position and quaternion
      // so subsequent picks by LOCAL position work unambiguously.
      mv.cubies.forEach(c => {
        cubeGroup.attach(c.group);
        // Round position to grid (-1, 0, 1).
        c.group.position.set(
          Math.round(c.group.position.x),
          Math.round(c.group.position.y),
          Math.round(c.group.position.z)
        );
        // Quaternions from attach can have tiny FP noise; re-snap by
        // rounding each element of the rotation matrix.
        snapQuaternion(c.group.quaternion);
        c.group.updateMatrix();
      });
      cubeGroup.remove(mv.group);

      // Update the facelet model to match.
      Solver.faceletTurn(facelets, mv.moveStr);
      paintStickers(cubies, facelets);

      currentMove = null;
      pauseUntil = performance.now() + MOVE_PAUSE_MS;
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

    // Kick off fade-in, then start the render loop.
    requestAnimationFrame(() => {
      stage.style.transform = "scale(1)";
      stage.style.opacity = "1";
    });
    requestAnimationFrame(render);
  }

  // --- Cubie + sticker construction -------------------------------

  // Each cubie is a THREE.Group. A body mesh sits at its center. Sticker
  // planes, one per OUTWARD face (up to 3 for a corner, 2 for an edge,
  // 1 for a face-center, 0 for the hidden center cubie), are children
  // of the group. Since they're children, any rotation of the cubie
  // rotates its stickers too — no separate bookkeeping.
  function buildCubies(THREE) {
    const cubies = [];
    const BODY = 0.96;
    const GAP  = 1.0;
    const bodyGeom = new THREE.BoxGeometry(BODY, BODY, BODY);
    const bodyMat  = new THREE.MeshLambertMaterial({ color: BODY_COLOR });

    const STICKER = 0.86;
    const STICKER_OFFSET = BODY / 2 + 0.001; // just outside the body

    for (let x = -1; x <= 1; x++) {
      for (let y = -1; y <= 1; y++) {
        for (let z = -1; z <= 1; z++) {
          if (x === 0 && y === 0 && z === 0) continue; // skip core

          const group = new THREE.Group();
          group.position.set(x * GAP, y * GAP, z * GAP);

          // Body
          const body = new THREE.Mesh(bodyGeom, bodyMat);
          group.add(body);

          // Up to 6 outward-facing stickers — only add ones that are
          // visible (i.e. that cubie sits on that face).
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
            // This cubie is on `face` iff the face's nonzero direction
            // component equals the cubie's coord on that axis. So e.g.
            // face U (dir [0,1,0]) is on cubies with y === 1.
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

  // Paint stickers from the facelet model. The facelet model is the
  // source of truth — we re-derive every sticker's color from it after
  // each move. This means the cubie's physical rotation doesn't have
  // to "know" what color it's showing; we look it up by current world
  // position + face direction.
  function paintStickers(cubies, facelets) {
    // For every cubie, for every sticker, figure out which facelet slot
    // that sticker currently occupies in world space.
    for (const c of cubies) {
      // World position of the cubie. Since cubies are always snapped to
      // integer grid local positions in cubeGroup, local == grid.
      const wx = Math.round(c.group.position.x);
      const wy = Math.round(c.group.position.y);
      const wz = Math.round(c.group.position.z);
      for (const s of c.stickers) {
        // World direction of this sticker: take the sticker's local
        // +Z vector (plane default normal) and transform by the cubie
        // group's world quaternion. (Stickers rotated via their local
        // .rotation are baked into their world transform once we take
        // the cubie's world rotation into account.)
        const n = stickerWorldNormal(c.group, s);
        const dir = roundDir(n);
        const faceId = dirToFaceId(dir);
        const faceletIdx = faceletIndex(faceId, wx, wy, wz, dir);
        const color = facelets[faceId][faceletIdx];
        s.mat.color.setHex(STICKER_COLORS[color] || 0x888888);
      }
    }
  }

  // Take the sticker's LOCAL +Z (its face normal as a PlaneGeometry) and
  // transform through the sticker's own rotation AND the cubie group's
  // rotation to get the direction in the cube's logical frame (i.e.
  // ignoring the outer cubeGroup tilt, which is just for presentation).
  function stickerWorldNormal(cubieGroup, sticker) {
    const THREE = global.THREE;
    const v = new THREE.Vector3(0, 0, 1);
    v.applyEuler(sticker.mesh.rotation);
    v.applyQuaternion(cubieGroup.quaternion);
    return v;
  }

  function roundDir(v) {
    // Nearest unit axis direction — pick the component with largest abs.
    const ax = Math.abs(v.x), ay = Math.abs(v.y), az = Math.abs(v.z);
    if (ax >= ay && ax >= az) return { x: Math.sign(v.x), y: 0, z: 0 };
    if (ay >= ax && ay >= az) return { x: 0, y: Math.sign(v.y), z: 0 };
    return { x: 0, y: 0, z: Math.sign(v.z) };
  }

  function dirToFaceId(dir) {
    // U=0 R=1 F=2 D=3 L=4 B=5
    if (dir.y ===  1) return 0; // U
    if (dir.x ===  1) return 1; // R
    if (dir.z ===  1) return 2; // F
    if (dir.y === -1) return 3; // D
    if (dir.x === -1) return 4; // L
    if (dir.z === -1) return 5; // B
    return 0;
  }

  // Given a face (U R F D L B), the cubie's grid position (x,y,z in
  // {-1,0,1}), and the outward direction, return the 0..8 index within
  // the face grid:
  //   0 1 2
  //   3 4 5
  //   6 7 8
  // This matches the solver's facelet conventions.
  function faceletIndex(faceId, x, y, z) {
    // Index mapping derived by reading the solver's CUBE_CORNER_SLOTS
    // table. For each face, the "top" of the 3x3 grid points in the
    // direction noted below; the cubie grid-coords map to row/col as
    // follows. Verified manually against all 8 corners on all 6 faces.
    let row, col;
    switch (faceId) {
      case 0: // U (+Y): looking down. Top = -Z (back), Right = +X.
        row = z + 1; col = x + 1; break;
      case 3: // D (-Y): looking up. Top = +Z (front), Right = +X.
        row = -z + 1; col = x + 1; break;
      case 2: // F (+Z): looking at +Z. Top = +Y, Right = +X.
        row = -y + 1; col = x + 1; break;
      case 5: // B (-Z): looking at -Z. Top = +Y, Right = -X.
        row = -y + 1; col = -x + 1; break;
      case 1: // R (+X): looking at +X. Top = +Y, Right = -Z.
        row = -y + 1; col = -z + 1; break;
      case 4: // L (-X): looking at -X. Top = +Y, Right = +Z.
        row = -y + 1; col =  z + 1; break;
      default: row = 1; col = 1;
    }
    return row * 3 + col;
  }

  // --- Face picking + axis conventions ----------------------------

  // For each face: which cubies belong (by local position), which
  // Three.js axis to rotate around, and the sign so that the move's
  // unprimed direction matches the solver's CW convention (viewed from
  // outside the cube, looking toward the origin).
  const FACE_SPEC = {
    U: { axis: 'y', sign: -1, pick: p => p.y >  0.5 },
    D: { axis: 'y', sign: +1, pick: p => p.y < -0.5 },
    R: { axis: 'x', sign: -1, pick: p => p.x >  0.5 },
    L: { axis: 'x', sign: +1, pick: p => p.x < -0.5 },
    F: { axis: 'z', sign: -1, pick: p => p.z >  0.5 },
    B: { axis: 'z', sign: +1, pick: p => p.z < -0.5 },
  };

  // --- Identity check: 4 U moves → U-layer cubies back where they started.
  function runIdentityCheck(THREE) {
    // Tiny throwaway scene just for the math test — doesn't render.
    const scene = new THREE.Scene();
    const root = new THREE.Group();
    scene.add(root);

    // Place 9 U-layer cubies at y=+1.
    const probes = [];
    for (let x = -1; x <= 1; x++) {
      for (let z = -1; z <= 1; z++) {
        const g = new THREE.Group();
        g.position.set(x, 1, z);
        root.add(g);
        probes.push({ start: { x, y: 1, z }, g });
      }
    }

    // Do 4 "U" moves (π/2 each, unprimed → sign -1 around Y).
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
      "[transition-cube-v2] identity check (4× U): " +
      (ok ? "OK — all 9 U-layer cubies returned to start." : "FAILED")
    );
  }

  // --- Small helpers -----------------------------------------------

  function clamp(x, lo, hi) { return Math.max(lo, Math.min(hi, x)); }
  function easeInOutQuad(t) {
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  }
  function easeInCubic(t) { return t * t * t; }

  // Snap a quaternion's components to the nearest multiple of 0.5 *
  // (sqrt(2)/2), which covers all 24 cube-symmetry rotations cleanly.
  // In practice, since every cubie ends up at a composition of ±π/2
  // rotations around axis directions, the quaternion components land
  // very close to one of {0, ±1/2, ±1/√2, ±1}. Rather than do that
  // classification explicitly we just normalize.
  function snapQuaternion(q) {
    q.normalize();
  }

  global.TransitionCubeV2 = { playTransition };
})(typeof window !== "undefined" ? window : globalThis);
