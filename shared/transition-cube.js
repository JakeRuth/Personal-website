/* ================================================================
   transition-cube-v5.js

   v5 choreography (per Jake, 2026-04-22):
     "the Rubik's Cube should be getting bigger while it fades in,
      maybe like a full second, gets to max size, which is the full
      screen, then immediately starts to fade out as it gets solved
      and dim while the new page fades in. So the opacities are like
      inverses of each other."

   Two phases, no peak hold:

     GROW (~1000ms)
       • Stage scales from ~48px → viewport-filling (100vmax).
       • Cube opacity 0 → 1.
       • Source page opacity 1 → 0 (inverse of cube).
       • Cube is already scrambled at t=0 (silent scramble). Ambient
         Y-spin is the only movement — no face rotations here.
       • On cross-page: at the END of GROW we write the scrambled
         facelet state + solve move list to sessionStorage and
         navigate. The dest page picks up mid-flight.

     SHRINK_SOLVE (~solve-length-driven, clamped to [800, 1400]ms)
       • Stage scales from full → ~48px.
       • Cube opacity 1 → 0.
       • Destination opacity 0 → 1 (inverse of cube).
       • Solve moves play concurrently with shrink + fade. Per-move
         timing unchanged (125ms turn + 40ms pause). Cube ends
         solved at tiny size, invisible.

   Everything else is v4-verbatim: cube geometry, palette, camera
   tilt, solver, group.attach/detach reparent pattern, ambient spin
   softening after snaps, identity self-check, reduced-motion path.

   Public API (parity with v4 — window.TransitionCubeV4 alias
   preserved so existing callers keep working):
     TransitionCubeV5.playTransition({
       onComplete,          // () => void, only fires when no destinationUrl
       destinationUrl,      // if set, navigates AT END OF GROW
                            //   (cross-page handoff via sessionStorage)
       sourceFadeTarget,    // optional: what to fade 1→0 during grow.
                            //   default: <body> children minus overlay.
       destFadeTarget,      // optional (demo/single-page only): what to
                            //   fade 0→1 during shrink. If omitted,
                            //   shrink fades sourceFadeTarget back in
                            //   (reversible no-nav demo).
       onPhase2End,         // (kept for v4 API compat — called right
                            //   before SHRINK begins in single-page mode)
     });
     TransitionCubeV5.initArrival();
       Call on every page load. If sessionStorage has a fresh payload
       from a cross-page transition, draws cube at full + runs
       SHRINK_SOLVE. Otherwise no-ops.
   ================================================================ */

(function (global) {
  "use strict";

  const THREE_CDN = "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js";
  const SOLVER_SRC_NAME = "cube-solver.js";

  // Classic cube palette (verbatim from v2/v3/v4).
  const STICKER_COLORS = {
    W: 0xffffff, R: 0xb71234, G: 0x009b48,
    Y: 0xffd500, O: 0xff5800, B: 0x0046ad,
  };
  const BODY_COLOR = 0x111111;

  // Subtle seam tint while source is out and dest hasn't come in.
  // Scales with cube opacity in both phases so there's no flash.
  const PEAK_BACKDROP = "rgba(8, 10, 14, 0.82)";

  // v5 phase durations.
  const GROW_MS = 1000;
  // SHRINK duration tracks the solve move queue — the cube should
  // end solved at the instant it vanishes.
  const SHRINK_MS_MIN = 800;
  const SHRINK_MS_MAX = 1400;

  // Per-move timing (v3/v4 verbatim).
  const MOVE_DURATION_MS = 125;
  const MOVE_PAUSE_MS    = 40;
  const SCRAMBLE_LEN     = 6;

  // Ambient spin during the entire animation.
  const AMBIENT_SPIN_RATE = 0.2;   // rad/sec
  const SNAP_SLOWDOWN_MS  = 50;

  // Cross-page session key. Payload: {timestamp, scrambledFacelets, solveMoves}.
  const SS_KEY = "jrTransitionArrive";
  const SS_MAX_AGE_MS = 3000;

  // Stage size endpoints.
  const STAGE_TINY_PX = 48;
  const STAGE_FULL    = "100vmax";

  let inFlight = false;

  // --- Public API --------------------------------------------------

  function playTransition(opts) {
    opts = opts || {};
    if (inFlight) return;
    inFlight = true;

    const sourceFade = resolveFadeTargets(opts.sourceFadeTarget);
    const destFade   = opts.destFadeTarget
      ? resolveFadeTargets(opts.destFadeTarget)
      : null;

    const onDone = () => {
      inFlight = false;
      if (typeof opts.onComplete === "function" && !opts.destinationUrl) {
        try { opts.onComplete(); } catch (e) { console.error(e); }
      }
    };

    if (prefersReducedMotion()) {
      reducedMotionFallback(opts, sourceFade, onDone);
      return;
    }

    ensureDeps().then(() => {
      runGrow(opts, sourceFade, destFade, onDone);
    }).catch((err) => {
      console.error("[transition-cube-v5] dependency load failed:", err);
      reducedMotionFallback(opts, sourceFade, onDone);
    });
  }

  function initArrival() {
    let payload = null;
    try {
      const raw = global.sessionStorage && sessionStorage.getItem(SS_KEY);
      if (raw) payload = JSON.parse(raw);
    } catch (e) {
      payload = null;
    }
    if (!payload) return;
    try { sessionStorage.removeItem(SS_KEY); } catch (e) { /* ignore */ }

    const now = Date.now();
    if (!payload.timestamp || now - payload.timestamp > SS_MAX_AGE_MS) return;
    if (prefersReducedMotion()) return;

    ensureDeps().then(() => {
      runArrival(payload);
    }).catch((err) => {
      console.error("[transition-cube-v5] arrival dependency load failed:", err);
    });
  }

  function prefersReducedMotion() {
    return global.matchMedia &&
      matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  // --- Dependency loading -----------------------------------------

  function ensureDeps() {
    const ps = [];
    if (!global.THREE) ps.push(loadScript(THREE_CDN));
    if (!global.TransitionCubeV4Solver) ps.push(loadScript(resolveSolverSrc()));
    return Promise.all(ps);
  }

  function resolveSolverSrc() {
    const scripts = document.getElementsByTagName("script");
    for (let i = 0; i < scripts.length; i++) {
      const src = scripts[i].src || "";
      if (src.endsWith("/transition-cube.js") || src.endsWith("transition-cube.js")) {
        return src.replace(/transition-cube\.js(\?.*)?$/, SOLVER_SRC_NAME);
      }
      if (src.endsWith("/transition-cube-v4.js") || src.endsWith("transition-cube-v4.js")) {
        return src.replace(/transition-cube-v4\.js(\?.*)?$/, SOLVER_SRC_NAME);
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

  // --- Fade-target resolution -------------------------------------

  function resolveFadeTargets(target) {
    if (!target) {
      return Array.from(document.body.children).filter(el => {
        return !el.classList.contains("transition-cube-v5-overlay");
      });
    }
    if (typeof target === "string") return Array.from(document.querySelectorAll(target));
    if (target instanceof Element) return [target];
    if (target && typeof target.length === "number") return Array.from(target);
    return [];
  }

  function setElsOpacity(els, op) {
    for (const el of els) el.style.opacity = String(op);
  }
  function clearElsOpacity(els) {
    for (const el of els) el.style.opacity = "";
  }

  // --- Reduced-motion fallback ------------------------------------

  function reducedMotionFallback(opts, sourceFade, onDone) {
    setElsOpacity(sourceFade, 0);
    if (opts.destinationUrl) {
      try { sessionStorage.removeItem(SS_KEY); } catch (e) { /* ignore */ }
      setTimeout(() => { window.location.href = opts.destinationUrl; }, 220);
    } else {
      setTimeout(() => { clearElsOpacity(sourceFade); onDone(); }, 220);
    }
  }

  // --- Overlay + stage construction -------------------------------

  function makeOverlay() {
    const el = document.createElement("div");
    el.className = "transition-cube-v5-overlay";
    el.setAttribute("aria-hidden", "true");
    el.style.cssText = [
      "position:fixed",
      "inset:0",
      "background:transparent",
      "z-index:2147483646",
      "pointer-events:all",
      "display:flex",
      "align-items:center",
      "justify-content:center",
      "overflow:hidden",
      "will-change:background-color",
    ].join(";");
    return el;
  }

  function makeStage() {
    const stage = document.createElement("div");
    stage.className = "transition-cube-v5-stage";
    stage.style.cssText = [
      "position:absolute",
      "top:50%",
      "left:50%",
      "width:" + STAGE_FULL,
      "height:" + STAGE_FULL,
      "transform:translate(-50%, -50%) scale(" + (STAGE_TINY_PX / 800) + ")",
      "transform-origin:center center",
      "opacity:0",
      "will-change:transform, opacity",
    ].join(";");
    return stage;
  }

  // --- Phase 1: GROW (leaving) ------------------------------------

  function runGrow(opts, sourceFade, destFade, onDone) {
    const Solver = global.TransitionCubeV4Solver;

    const overlay = makeOverlay();
    document.body.appendChild(overlay);
    const stage = makeStage();
    overlay.appendChild(stage);
    // Force layout so the initial scale takes effect pre-frame-1.
    // eslint-disable-next-line no-unused-expressions
    stage.offsetWidth;

    const ctx = createCubeContext(stage);

    // Precompute scramble + solve. Apply scramble silently — just
    // mutate the facelet state + repaint. No move animation: the
    // cube appears already-scrambled when it grows in.
    const scrambleMoves = Solver.randomScramble(SCRAMBLE_LEN);
    Solver.applyFaceletMoves(ctx.facelets, scrambleMoves);
    paintStickers(ctx.cubies, ctx.facelets);
    const scrambledFaceletsSnapshot = Solver.cloneFacelets(ctx.facelets);
    const solveMoves = Solver.solveFromFacelets(
      Solver.cloneFacelets(ctx.facelets)
    ) || [];

    console.log(
      "[transition-cube-v5] scramble (" + scrambleMoves.length + "):",
      scrambleMoves.join(" ")
    );
    console.log(
      "[transition-cube-v5] solve (" + solveMoves.length + "):",
      solveMoves.join(" ")
    );
    console.log(
      "[transition-cube-v5] grow:", GROW_MS + "ms",
      "| shrink-solve: driven by", solveMoves.length, "moves"
    );

    if (!global.__transitionCubeV5IdentityChecked) {
      global.__transitionCubeV5IdentityChecked = true;
      runIdentityCheck(global.THREE);
    }

    const state = {
      running: true,
      phase: "grow",
      phaseStartT: performance.now(),
      lastSnapT: -Infinity,
      lastT: performance.now(),
      ctx,
      overlay,
      stage,
      sourceFade,
      destFade,
      opts,
      onDone,
      navigating: false,
      // Carried into SHRINK (single-page mode):
      scrambledFacelets: scrambledFaceletsSnapshot,
      solveMoves: solveMoves.slice(),
      // Move-player scratch (used in SHRINK):
      queue: [],
      queueIdx: 0,
      currentMove: null,
      pauseUntil: 0,
      shrinkMs: computeShrinkMs(solveMoves.length),
    };

    requestAnimationFrame(() => renderLoop(state));
  }

  // --- Arrival: SHRINK-only (dest page picks up mid-flight) -------

  function runArrival(payload) {
    const Solver = global.TransitionCubeV4Solver;

    // Destination page starts at 0, fades to 1 during shrink.
    const destFade = Array.from(document.body.children);
    setElsOpacity(destFade, 0);

    const overlay = makeOverlay();
    overlay.style.backgroundColor = PEAK_BACKDROP;
    document.body.appendChild(overlay);

    const stage = makeStage();
    // Start at full size, full opacity — we're continuing from the
    // source page's END-OF-GROW state.
    stage.style.transform = "translate(-50%, -50%) scale(1)";
    stage.style.opacity = "1";
    overlay.appendChild(stage);
    // eslint-disable-next-line no-unused-expressions
    stage.offsetWidth;

    const ctx = createCubeContext(stage);

    // Rehydrate scrambled state from the source page so the cube's
    // face colors match what the user was looking at an instant ago.
    if (payload.scrambledFacelets &&
        Array.isArray(payload.scrambledFacelets) &&
        payload.scrambledFacelets.length === 6) {
      ctx.facelets = payload.scrambledFacelets;
      paintStickers(ctx.cubies, ctx.facelets);
    }

    // Solve moves come from the source too (already computed there —
    // save dest the work). Fall back to recomputing if missing.
    let solveMoves = Array.isArray(payload.solveMoves) ? payload.solveMoves.slice() : null;
    if (!solveMoves) {
      solveMoves = Solver.solveFromFacelets(Solver.cloneFacelets(ctx.facelets)) || [];
    }

    console.log(
      "[transition-cube-v5] arrival — shrink+solve starting (" +
      solveMoves.length + " moves, " + computeShrinkMs(solveMoves.length) + "ms)"
    );

    const onDone = () => {
      clearElsOpacity(destFade);
      try { overlay.remove(); } catch (e) { /* ignore */ }
      try { disposeCubeContext(ctx); } catch (e) { /* ignore */ }
    };

    const state = {
      running: true,
      phase: "shrink",
      phaseStartT: performance.now(),
      lastSnapT: -Infinity,
      lastT: performance.now(),
      ctx,
      overlay,
      stage,
      sourceFade: [],
      destFade,
      opts: {},
      onDone,
      navigating: false,
      arrival: true,
      scrambledFacelets: null,
      solveMoves: solveMoves,
      queue: solveMoves.slice(),
      queueIdx: 0,
      currentMove: null,
      pauseUntil: 0,
      shrinkMs: computeShrinkMs(solveMoves.length),
    };

    requestAnimationFrame(() => renderLoop(state));
  }

  function computeShrinkMs(solveMoveCount) {
    const raw = solveMoveCount * (MOVE_DURATION_MS + MOVE_PAUSE_MS);
    return Math.max(SHRINK_MS_MIN, Math.min(SHRINK_MS_MAX, raw));
  }

  // --- Render loop -------------------------------------------------

  function renderLoop(state) {
    if (!state.running) return;
    const now = performance.now();
    const dt = Math.max(0, (now - state.lastT) / 1000);
    state.lastT = now;

    // Ambient Y-drift, softened briefly right after a snap.
    let spinFactor = 1.0;
    const sinceSnap = now - state.lastSnapT;
    if (sinceSnap >= 0 && sinceSnap < SNAP_SLOWDOWN_MS) {
      spinFactor = sinceSnap / SNAP_SLOWDOWN_MS;
    }
    state.ctx.cubeGroup.rotation.y += dt * AMBIENT_SPIN_RATE * spinFactor;

    if (state.phase === "grow") tickGrow(state, now);
    else if (state.phase === "shrink") tickShrink(state, now);

    state.ctx.renderer.render(state.ctx.scene, state.ctx.camera);

    // End condition.
    if (state.phase === "shrink" && now - state.phaseStartT >= state.shrinkMs) {
      state.running = false;
      if (!state.arrival) {
        try {
          const fadeInTargets = state.destFade || state.sourceFade;
          setElsOpacity(fadeInTargets, 1);
          if (state.destFade) setElsOpacity(state.sourceFade, 0);
        } catch (e) { /* ignore */ }
        try { disposeCubeContext(state.ctx); } catch (e) { /* ignore */ }
        try { state.overlay.remove(); } catch (e) { /* ignore */ }
      }
      try { state.onDone && state.onDone(); } catch (e) { console.error(e); }
      return;
    }

    requestAnimationFrame(() => renderLoop(state));
  }

  // GROW: cube scale 0→1, cube opacity 0→1, source opacity 1→0.
  function tickGrow(state, now) {
    const p = clamp((now - state.phaseStartT) / GROW_MS, 0, 1);
    const eased = easeOutCubic(p);

    const scale = lerp(STAGE_TINY_PX / getIntrinsicPx(state.stage), 1, eased);
    state.stage.style.transform = "translate(-50%, -50%) scale(" + scale.toFixed(4) + ")";
    state.stage.style.opacity = eased.toFixed(4);
    setElsOpacity(state.sourceFade, 1 - eased);

    // Seam backdrop fades in with the cube so it's already nearly
    // opaque by the time we hit full size and nav happens.
    state.overlay.style.backgroundColor = mixAlpha(PEAK_BACKDROP, eased);

    if (p >= 1) {
      // Lock terminal state so the next frame (and nav) reads it.
      state.overlay.style.backgroundColor = PEAK_BACKDROP;
      setElsOpacity(state.sourceFade, 0);
      state.stage.style.transform = "translate(-50%, -50%) scale(1)";
      state.stage.style.opacity = "1";
      beginShrink(state, now);
    }
  }

  function beginShrink(state, now) {
    // Cross-page handoff. Navigate immediately (no peak hold).
    // Destination page's initArrival() picks up the shrink.
    if (state.opts.destinationUrl && !state.navigating) {
      state.navigating = true;
      try {
        sessionStorage.setItem(SS_KEY, JSON.stringify({
          timestamp: Date.now(),
          scrambledFacelets: state.scrambledFacelets,
          solveMoves: state.solveMoves,
        }));
      } catch (e) { /* graceful degrade */ }
      console.log("[transition-cube-v5] grow end — navigating:", state.opts.destinationUrl);
      state.running = false;
      window.location.href = state.opts.destinationUrl;
      return;
    }

    // Single-page mode: fire caller's hook before panel swap.
    if (typeof state.opts.onPhase2End === "function") {
      try { state.opts.onPhase2End(); } catch (e) { console.error(e); }
    }

    // Prime shrink state: queue is solve moves.
    state.queue = state.solveMoves.slice();
    state.queueIdx = 0;
    state.currentMove = null;
    state.pauseUntil = now;
    state.phase = "shrink";
    state.phaseStartT = now;
    console.log("[transition-cube-v5] shrink+solve begin (single-page)");
  }

  // SHRINK: cube scale 1→tiny, cube opacity 1→0, dest opacity 0→1.
  // Solve moves play concurrently.
  function tickShrink(state, now) {
    // Move player (v3/v4 semantics — unchanged).
    if (state.currentMove) {
      const mv = state.currentMove;
      const p = clamp((now - mv.startT) / (mv.endT - mv.startT), 0, 1);
      const eased = easeInOutQuad(p);
      mv.group.rotation[mv.axis] = mv.targetAngle * eased;
      if (p >= 1) commitMove(state, mv);
    } else if (now >= state.pauseUntil) {
      if (state.queueIdx < state.queue.length) {
        startNextMove(state, state.queue[state.queueIdx], state.queueIdx, state.queue.length);
        state.queueIdx++;
      }
    }

    // Scale + opacity interpolation.
    const p = clamp((now - state.phaseStartT) / state.shrinkMs, 0, 1);
    const eased = easeInCubic(p);

    const scale = lerp(1, STAGE_TINY_PX / getIntrinsicPx(state.stage), eased);
    state.stage.style.transform = "translate(-50%, -50%) scale(" + scale.toFixed(4) + ")";
    state.stage.style.opacity = (1 - eased).toFixed(4);

    const fadeInTargets = state.destFade || state.sourceFade;
    setElsOpacity(fadeInTargets, eased);

    state.overlay.style.backgroundColor = mixAlpha(PEAK_BACKDROP, 1 - eased);
  }

  // --- Cube context (scene graph, renderer, cubies) ---------------
  // (Unchanged from v4 — identical cube build, palette, camera.)

  function createCubeContext(stage) {
    const THREE = global.THREE;
    const Solver = global.TransitionCubeV4Solver;

    const intrinsic = 800;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
    camera.position.set(4.5, 5.0, 6.5);
    camera.lookAt(0, 0, 0);

    scene.add(new THREE.AmbientLight(0xffffff, 0.78));
    const key = new THREE.DirectionalLight(0xffffff, 0.45);
    key.position.set(5, 8, 6);
    scene.add(key);
    const fill = new THREE.DirectionalLight(0xffffff, 0.22);
    fill.position.set(-4, 2, -3);
    scene.add(fill);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(intrinsic, intrinsic);
    renderer.domElement.style.cssText = "width:100%;height:100%;display:block";
    stage.dataset.intrinsicPx = String(intrinsic);
    stage.appendChild(renderer.domElement);

    const cubeGroup = new THREE.Group();
    cubeGroup.rotation.x = -0.32;
    cubeGroup.rotation.y =  0.52;
    scene.add(cubeGroup);

    const cubies = buildCubies(THREE);
    cubies.forEach(c => cubeGroup.add(c.group));

    const facelets = Solver.solvedFacelets();
    paintStickers(cubies, facelets);

    return { scene, camera, renderer, cubeGroup, cubies, facelets, intrinsic };
  }

  function disposeCubeContext(ctx) {
    try {
      ctx.cubeGroup.traverse(obj => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose && m.dispose());
          else obj.material.dispose && obj.material.dispose();
        }
      });
      ctx.renderer.dispose();
    } catch (e) { /* ignore */ }
  }

  function getIntrinsicPx(stage) {
    const v = parseFloat(stage.dataset.intrinsicPx || "800");
    return v || 800;
  }

  // --- Move player (v3/v4 semantics, operates on `state`) ---------

  function startNextMove(state, moveStr, idx, total) {
    const THREE = global.THREE;
    const face = moveStr[0];
    const prime = moveStr.endsWith("'");
    const spec = FACE_SPEC[face];

    const layerGroup = new THREE.Group();
    state.ctx.cubeGroup.add(layerGroup);

    const affected = [];
    for (const c of state.ctx.cubies) {
      const p = c.group.position;
      if (spec.pick(p)) affected.push(c);
    }
    affected.forEach(c => layerGroup.attach(c.group));

    const targetAngle = (prime ? -1 : +1) * spec.sign * (Math.PI / 2);

    state.currentMove = {
      moveStr, face, prime,
      group: layerGroup,
      axis: spec.axis,
      targetAngle,
      startT: performance.now(),
      endT: performance.now() + MOVE_DURATION_MS,
      cubies: affected,
    };

    console.log(
      "[transition-cube-v5] [move " + (idx + 1) + "/" + total + "] " +
      moveStr + " — axis " + spec.axis + " target " +
      (targetAngle * 180 / Math.PI).toFixed(1) + "°"
    );
  }

  function commitMove(state, mv) {
    const Solver = global.TransitionCubeV4Solver;
    mv.group.rotation[mv.axis] = mv.targetAngle;

    mv.cubies.forEach(c => {
      state.ctx.cubeGroup.attach(c.group);
      c.group.position.set(
        Math.round(c.group.position.x),
        Math.round(c.group.position.y),
        Math.round(c.group.position.z)
      );
      snapQuaternion(c.group.quaternion);
      c.group.updateMatrix();
    });
    state.ctx.cubeGroup.remove(mv.group);

    Solver.faceletTurn(state.ctx.facelets, mv.moveStr);
    paintStickers(state.ctx.cubies, state.ctx.facelets);

    state.currentMove = null;
    state.pauseUntil = performance.now() + MOVE_PAUSE_MS;
    state.lastSnapT = performance.now();
  }

  // --- Cubie + sticker construction (VERBATIM from v2/v3/v4) ------

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
    if (dir.y ===  1) return 0;
    if (dir.x ===  1) return 1;
    if (dir.z ===  1) return 2;
    if (dir.y === -1) return 3;
    if (dir.x === -1) return 4;
    if (dir.z === -1) return 5;
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

  const FACE_SPEC = {
    U: { axis: 'y', sign: -1, pick: p => p.y >  0.5 },
    D: { axis: 'y', sign: +1, pick: p => p.y < -0.5 },
    R: { axis: 'x', sign: -1, pick: p => p.x >  0.5 },
    L: { axis: 'x', sign: +1, pick: p => p.x < -0.5 },
    F: { axis: 'z', sign: -1, pick: p => p.z >  0.5 },
    B: { axis: 'z', sign: +1, pick: p => p.z < -0.5 },
  };

  // --- Identity self-check (retained from v3/v4) ------------------
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
      "[transition-cube-v5] identity check (4× U): " +
      (ok ? "OK" : "FAILED")
    );
  }

  // --- Small helpers -----------------------------------------------

  function clamp(x, lo, hi) { return Math.max(lo, Math.min(hi, x)); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function easeInOutQuad(t) {
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  }
  function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }
  function easeInCubic(t) { return t * t * t; }

  function snapQuaternion(q) { q.normalize(); }

  function mixAlpha(rgba, k) {
    const m = /^rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*([\d.]+)\s*\)$/.exec(rgba);
    if (!m) return rgba;
    const r = m[1], g = m[2], b = m[3];
    const a = parseFloat(m[4]) * clamp(k, 0, 1);
    return "rgba(" + r + ", " + g + ", " + b + ", " + a.toFixed(4) + ")";
  }

  const api = { playTransition, initArrival };
  global.TransitionCubeV5 = api;
  // v4 alias for back-compat — callers in wizard/topnav still use it.
  if (!global.TransitionCubeV4) global.TransitionCubeV4 = api;
  if (!global.TransitionCube) global.TransitionCube = api;
})(typeof window !== "undefined" ? window : globalThis);
