/* Cross-page Rubik's Cube transition. Two phases, no peak hold:

     GROW (~1000ms)  — stage scales small → viewport; cube fades in
                       while source page fades out; at phase end,
                       scrambled-facelets + solve-moves are written to
                       sessionStorage and the browser navigates.
     SHRINK_SOLVE (~800-1400ms) — dest page picks up: cube starts
                       full-size, shrinks back to tiny, fades out while
                       dest page fades in; solve moves play concurrently.

   Public API (window.TransitionCube):
     playTransition({ destinationUrl, onComplete?, sourceFadeTarget?,
                      destFadeTarget?, onPhase2End? })
     initArrival()  — no-op unless sessionStorage payload is fresh.
                      Auto-fires on DOMContentLoaded, so pages don't
                      need to call it explicitly.

   prefers-reduced-motion: falls back to a 220ms cross-fade. */

(function (global) {
  "use strict";

  const THREE_CDN = "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js";
  const SOLVER_SRC_NAME = "cube-solver.js";

  // Classic cube palette.
  const STICKER_COLORS = {
    W: 0xffffff, R: 0xb71234, G: 0x009b48,
    Y: 0xffd500, O: 0xff5800, B: 0x0046ad,
  };
  const BODY_COLOR = 0x111111;

  // Subtle seam tint while source is out and dest hasn't come in.
  // Scales with cube opacity in both phases so there's no flash.
  const PEAK_BACKDROP = "rgba(8, 10, 14, 0.82)";

  // Phase durations.
  // GROW_MS sized so the scramble queue (SCRAMBLE_LEN moves at
  // MOVE_DURATION_MS+MOVE_PAUSE_MS each) finishes just as grow ends,
  // keeping the cube continuously turning the whole time.
  const GROW_MS = 1000;
  // Hold at full size before navigating cross-page. Masks the
  // unload/reload glitch when the dest page rebuilds the WebGL ctx.
  const PEAK_HOLD_MS = 100;
  // SHRINK floor — shortest possible shrink.
  const SHRINK_MS_FLOOR = 1200;
  // The "click" moment: solve's last move commits when cube opacity
  // hits this value. Lower = more fade before solve ends.
  const SOLVE_FINISH_OPACITY = 0.4;
  // Per-move timing. 80+10 = 90ms; with 10 moves the queue runs ~900ms,
  // fits inside GROW_MS=1000 with a small buffer.
  const MOVE_DURATION_MS = 80;
  const MOVE_PAUSE_MS    = 10;
  const SCRAMBLE_LEN     = 10;

  // Solve-completion glow flash — drop-shadow + brightness pulse the
  // moment the last face turn commits. Adds the "click" feel.
  const SOLVE_FLASH_MS   = 420;

  // Ambient spin during the entire animation.
  const AMBIENT_SPIN_RATE = 0.5;   // rad/sec
  const SNAP_SLOWDOWN_MS  = 50;

  // Cross-page session key. Payload:
  //   {timestamp, scrambleMoves, solveMoves, cubeRotX, cubeRotY}.
  const SS_KEY = "jrTransitionArrive";
  const SS_MAX_AGE_MS = 3000;

  // Stage size endpoints.
  const STAGE_TINY_PX = 48;
  const STAGE_FULL    = "100vmax";

  let inFlight = false;

  // EARLY DEST COVER: when the script loads on a destination page that
  // has a fresh transition payload waiting, inject a CSS rule that hides
  // body content before it can paint. Without this, there's a visible
  // flash of the destination experience between page-load and when
  // initArrival() runs on DOMContentLoaded. The rule is removed inside
  // runArrival() once the proper cube overlay is mounted.
  (function injectEarlyDestCover() {
    try {
      if (!global.sessionStorage) return;
      const raw = sessionStorage.getItem(SS_KEY);
      if (!raw) return;
      const payload = JSON.parse(raw);
      if (!payload || !payload.timestamp) return;
      if (Date.now() - payload.timestamp > SS_MAX_AGE_MS) return;
      const style = document.createElement("style");
      style.id = "tc-early-cover";
      // Paint html dark so a body=hidden state doesn't expose the
      // browser's white default. Hide everything in body except our
      // own overlay (which we'll mount shortly).
      style.textContent =
        "html { background: " + PEAK_BACKDROP.replace(/[\d.]+\)$/, "1)") + " !important; }" +
        "body > *:not(.transition-cube-overlay) { opacity: 0 !important; }";
      (document.head || document.documentElement).appendChild(style);
    } catch (e) { /* graceful */ }
  })();

  function removeEarlyDestCover() {
    const s = document.getElementById("tc-early-cover");
    if (s && s.parentNode) s.parentNode.removeChild(s);
  }

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
      console.error("[transition-cube] dependency load failed:", err);
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
    if (!payload) { removeEarlyDestCover(); return; }
    // Mark this page-load as an in-app arrival before consuming the
    // payload. Other listeners on the same prerenderingchange/DCL event
    // (e.g. topnav's onboarding gate) that fire AFTER this one would
    // otherwise see an empty sessionStorage and misclassify the
    // navigation as a fresh URL load.
    global.__jrInAppArrival = true;
    try { sessionStorage.removeItem(SS_KEY); } catch (e) { /* ignore */ }

    const now = Date.now();
    if (!payload.timestamp || now - payload.timestamp > SS_MAX_AGE_MS) {
      removeEarlyDestCover();
      return;
    }
    if (prefersReducedMotion()) { removeEarlyDestCover(); return; }

    ensureDeps().then(() => {
      runArrival(payload);
    }).catch((err) => {
      console.error("[transition-cube] arrival dependency load failed:", err);
      removeEarlyDestCover();
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
    if (!global.CubeSolver) ps.push(loadScript(resolveSolverSrc()));
    return Promise.all(ps);
  }

  function resolveSolverSrc() {
    const scripts = document.getElementsByTagName("script");
    for (let i = 0; i < scripts.length; i++) {
      const src = scripts[i].src || "";
      if (src.endsWith("/transition-cube.js") || src.endsWith("transition-cube.js")) {
        return src.replace(/transition-cube\.js(\?.*)?$/, SOLVER_SRC_NAME);
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
        return !el.classList.contains("transition-cube-overlay");
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
    el.className = "transition-cube-overlay";
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
    stage.className = "transition-cube-stage";
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
    const Solver = global.CubeSolver;

    const overlay = makeOverlay();
    document.body.appendChild(overlay);
    const stage = makeStage();
    overlay.appendChild(stage);
    // Force layout so the initial scale takes effect pre-frame-1.
    // eslint-disable-next-line no-unused-expressions
    stage.offsetWidth;

    const ctx = createCubeContext(stage);

    // Precompute scramble + solve. Cube starts in solved state; the
    // move player will animate the scramble during grow, so the cube
    // is continuously turning the whole way in. The "solve" is the
    // scramble played in reverse (zero solver compute, always correct).
    const scrambleMoves = Solver.randomScramble(SCRAMBLE_LEN);
    const solveMoves = reverseMoves(scrambleMoves);

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
      // Move player runs every tick. During GROW it plays scramble.
      // At grow→peak handoff we hand the dest page the scramble move
      // list (so it can replay it silently and physically match this
      // cube's geometry) plus the cube-group's Y rotation (so ambient
      // spin doesn't pop at the navigation boundary).
      queue: scrambleMoves.slice(),
      queueIdx: 0,
      currentMove: null,
      pauseUntil: performance.now(),
      // Carried across the navigation:
      scrambleMoves: scrambleMoves.slice(),
      solveMoves: solveMoves.slice(),
      shrinkMs: computeShrinkMs(solveMoves.length),
    };

    requestAnimationFrame(() => renderLoop(state));
  }

  // --- Arrival: SHRINK-only (dest page picks up mid-flight) -------

  function runArrival(payload) {
    const Solver = global.CubeSolver;

    // Destination page starts at 0, fades to 1 during shrink.
    const destFade = Array.from(document.body.children);
    setElsOpacity(destFade, 0);

    const overlay = makeOverlay();
    overlay.style.backgroundColor = PEAK_BACKDROP;
    document.body.appendChild(overlay);

    // Now that our own overlay is mounted with the dark backdrop, drop
    // the early CSS cover. setElsOpacity above keeps body children at 0
    // explicitly so removing the !important rule is safe.
    removeEarlyDestCover();

    const stage = makeStage();
    // Start at full size, full opacity — we're continuing from the
    // source page's END-OF-GROW state.
    stage.style.transform = "translate(-50%, -50%) scale(1)";
    stage.style.opacity = "1";
    overlay.appendChild(stage);
    // eslint-disable-next-line no-unused-expressions
    stage.offsetWidth;

    const ctx = createCubeContext(stage);

    // Rotation handoff: pick up source's accumulated ambient Y-spin (and
    // X tilt for safety) so the cube doesn't snap orientation at the
    // navigation boundary.
    if (typeof payload.cubeRotX === "number") ctx.cubeGroup.rotation.x = payload.cubeRotX;
    if (typeof payload.cubeRotY === "number") ctx.cubeGroup.rotation.y = payload.cubeRotY;

    // Geometry handoff: replay the source's scramble silently — each
    // move snaps cubies into their final rotated positions and updates
    // facelets. After this loop, the cube on this page is geometrically
    // and color-wise identical to the source's apex state.
    if (Array.isArray(payload.scrambleMoves) && payload.scrambleMoves.length) {
      for (const mv of payload.scrambleMoves) snapApplyMove(ctx, mv);
      paintStickers(ctx.cubies, ctx.facelets);
    }

    // Solve queue is the inverse of the scramble; source page wrote it
    // into the payload alongside the scramble moves themselves.
    const solveMoves = payload.solveMoves.slice();

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
    // Opacity is linear in tickShrink (1 → 0 over shrinkMs). We want
    // the last solve move to commit at opacity = SOLVE_FINISH_OPACITY.
    //   opacity_at_solve_end = 1 - effectiveSolveTime / shrinkMs
    // FRAME_SLIP accounts for one-frame overhang on each move's commit
    // (commit happens on the tick AFTER endT). At ~60fps this adds
    // ~16ms per move; measured ~160ms overhead at 10 moves.
    const FRAME_SLIP = 16;
    const solveTime = solveMoveCount * (MOVE_DURATION_MS + MOVE_PAUSE_MS + FRAME_SLIP);
    const aligned = solveTime / (1 - SOLVE_FINISH_OPACITY);
    return Math.max(SHRINK_MS_FLOOR, aligned);
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
    else if (state.phase === "peak") tickPeak(state, now);
    else if (state.phase === "shrink") tickShrink(state, now);

    state.ctx.renderer.render(state.ctx.scene, state.ctx.camera);

    // End condition. Wait for the move queue to drain even if the
    // shrink time has elapsed — guarantees the cube is solved at the
    // exact instant it disappears (no "vanish mid-twist").
    const shrinkElapsed = state.phase === "shrink" && now - state.phaseStartT >= state.shrinkMs;
    const solveDone = !state.currentMove && state.queueIdx >= state.queue.length;
    if (shrinkElapsed && solveDone) {
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

  // Shared move-player. Runs every tick during GROW (scramble queue)
  // and SHRINK (solve queue). When the queue drains, the cube sits in
  // its terminal state and the loop continues without doing more moves.
  function tickMovePlayer(state, now) {
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
  }

  // Force-finish whatever's left in the queue, applying moves
  // instantaneously to facelets and snapping cubie positions. Used at
  // GROW end so that any unanimated leftover scramble moves still take
  // effect before we capture the scrambled-facelets snapshot.
  function drainQueue(state) {
    const Solver = global.CubeSolver;
    if (state.currentMove) {
      const mv = state.currentMove;
      mv.group.rotation[mv.axis] = mv.targetAngle;
      commitMove(state, mv);
    }
    while (state.queueIdx < state.queue.length) {
      Solver.faceletTurn(state.ctx.facelets, state.queue[state.queueIdx]);
      state.queueIdx++;
    }
    paintStickers(state.ctx.cubies, state.ctx.facelets);
  }

  // GROW: cube scale 0→1 LINEAR, cube opacity 0→1 LINEAR, source
  // page opacity 1→0 LINEAR. Move player animates scramble queue
  // continuously throughout, so the cube is always turning.
  function tickGrow(state, now) {
    tickMovePlayer(state, now);

    const p = clamp((now - state.phaseStartT) / GROW_MS, 0, 1);

    const scale = lerp(STAGE_TINY_PX / getIntrinsicPx(state.stage), 1, p);
    state.stage.style.transform = "translate(-50%, -50%) scale(" + scale.toFixed(4) + ")";
    state.stage.style.opacity = p.toFixed(4);
    setElsOpacity(state.sourceFade, 1 - p);

    // Backdrop tracks cube opacity so the seam is fully tinted at peak.
    state.overlay.style.backgroundColor = mixAlpha(PEAK_BACKDROP, p);

    if (p >= 1) {
      // Lock terminal state and force-finish any remaining scramble
      // moves so the facelets we hand to the dest page reflect the
      // fully-scrambled cube.
      drainQueue(state);
      state.overlay.style.backgroundColor = PEAK_BACKDROP;
      setElsOpacity(state.sourceFade, 0);
      state.stage.style.transform = "translate(-50%, -50%) scale(1)";
      state.stage.style.opacity = "1";
      beginPeakOrShrink(state, now);
    }
  }

  function beginPeakOrShrink(state, now) {
    // Cross-page handoff: hold at full size for PEAK_HOLD_MS so the
    // user clearly registers the cube before navigation tears it down,
    // then fire the navigation. The dest page picks up the shrink.
    if (state.opts.destinationUrl && !state.navigating) {
      state.navigating = true;
      try {
        sessionStorage.setItem(SS_KEY, JSON.stringify({
          timestamp: Date.now(),
          // Hand off the scramble move list so the dest page can
          // replay it silently — that gets the cubies into the same
          // physical scrambled positions/orientations as this page.
          scrambleMoves: state.scrambleMoves,
          solveMoves: state.solveMoves,
          // Cube-group rotation so ambient spin doesn't snap.
          cubeRotX: state.ctx.cubeGroup.rotation.x,
          cubeRotY: state.ctx.cubeGroup.rotation.y,
        }));
      } catch (e) { /* graceful degrade */ }
      state.phase = "peak";
      state.phaseStartT = now;
      setTimeout(() => {
        state.running = false;
        window.location.href = state.opts.destinationUrl;
      }, PEAK_HOLD_MS);
      return;
    }

    // Single-page mode: fire caller's hook before panel swap.
    if (typeof state.opts.onPhase2End === "function") {
      try { state.opts.onPhase2End(); } catch (e) { console.error(e); }
    }

    // Prime shrink state: queue is now solve moves.
    state.queue = state.solveMoves.slice();
    state.queueIdx = 0;
    state.currentMove = null;
    state.pauseUntil = now;
    state.phase = "shrink";
    state.phaseStartT = now;
  }

  // PEAK: cube held at full size + opacity. Ambient spin in the loop
  // keeps it alive. Used cross-page only — covers the navigation gap.
  function tickPeak(state, _now) {
    state.stage.style.transform = "translate(-50%, -50%) scale(1)";
    state.stage.style.opacity = "1";
    state.overlay.style.backgroundColor = PEAK_BACKDROP;
    setElsOpacity(state.sourceFade, 0);
  }

  // SHRINK: cube scale 1→tiny LINEAR, cube opacity 1→0 LINEAR,
  // dest page opacity 0→1 LINEAR. Move player drives the solve queue
  // throughout, and the last solve move commits at opacity =
  // SOLVE_FINISH_OPACITY (the "click" moment).
  function tickShrink(state, now) {
    tickMovePlayer(state, now);

    const p = clamp((now - state.phaseStartT) / state.shrinkMs, 0, 1);

    const scale = lerp(1, STAGE_TINY_PX / getIntrinsicPx(state.stage), p);
    state.stage.style.transform = "translate(-50%, -50%) scale(" + scale.toFixed(4) + ")";
    state.stage.style.opacity = (1 - p).toFixed(4);

    // Solve-completion glow: brightness pulse + white drop-shadow that
    // peaks ~80ms after the last move commits, fades over SOLVE_FLASH_MS.
    if (state.flashStartT) {
      const fe = now - state.flashStartT;
      if (fe < SOLVE_FLASH_MS) {
        const fp = fe / SOLVE_FLASH_MS;
        const k = fp < 0.2 ? fp / 0.2 : 1 - (fp - 0.2) / 0.8;
        const bright = (1 + 0.45 * k).toFixed(3);
        const blur   = (36 * k).toFixed(1);
        const alpha  = (0.85 * k).toFixed(3);
        state.stage.style.filter =
          "brightness(" + bright + ") " +
          "drop-shadow(0 0 " + blur + "px rgba(255,255,255," + alpha + "))";
      } else {
        state.stage.style.filter = "";
        state.flashStartT = null;
      }
    }

    const fadeInTargets = state.destFade || state.sourceFade;
    setElsOpacity(fadeInTargets, p);

    state.overlay.style.backgroundColor = mixAlpha(PEAK_BACKDROP, 1 - p);
  }

  // --- Cube context (scene graph, renderer, cubies) ---------------
  // (Identical cube build, palette, camera.)

  function createCubeContext(stage) {
    const THREE = global.THREE;
    const Solver = global.CubeSolver;

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

  // --- Move player (operates on `state`) --------------------------

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
  }

  // Apply a face turn instantly (no animation) — snaps cubie geometry
  // to the post-move state and mutates facelets. Used by runArrival to
  // replay the source page's scramble on this page's fresh cube so the
  // two are geometrically identical at the navigation boundary.
  function snapApplyMove(ctx, moveStr) {
    const THREE = global.THREE;
    const Solver = global.CubeSolver;
    const face = moveStr[0];
    const prime = moveStr.endsWith("'");
    const spec = FACE_SPEC[face];

    const layerGroup = new THREE.Group();
    ctx.cubeGroup.add(layerGroup);

    const affected = [];
    for (const c of ctx.cubies) {
      if (spec.pick(c.group.position)) affected.push(c);
    }
    affected.forEach(c => layerGroup.attach(c.group));

    const targetAngle = (prime ? -1 : +1) * spec.sign * (Math.PI / 2);
    layerGroup.rotation[spec.axis] = targetAngle;

    affected.forEach(c => {
      ctx.cubeGroup.attach(c.group);
      c.group.position.set(
        Math.round(c.group.position.x),
        Math.round(c.group.position.y),
        Math.round(c.group.position.z)
      );
      snapQuaternion(c.group.quaternion);
      c.group.updateMatrix();
    });
    ctx.cubeGroup.remove(layerGroup);

    Solver.faceletTurn(ctx.facelets, moveStr);
  }

  function commitMove(state, mv) {
    const Solver = global.CubeSolver;
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

    // Last move just landed — fire the solve-click glow flash.
    if (state.queueIdx >= state.queue.length) {
      state.flashStartT = performance.now();
    }
  }

  // --- Cubie + sticker construction -------------------------------

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

  // --- Small helpers -----------------------------------------------

  function clamp(x, lo, hi) { return Math.max(lo, Math.min(hi, x)); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function easeInOutQuad(t) {
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  }

  function snapQuaternion(q) { q.normalize(); }

  // Reverse a scramble into its inverse sequence — used as the "solve"
  // queue so the cube ends in the solved state without paying the
  // bidirectional-BFS cost on the click thread.
  function reverseMoves(moves) {
    const out = [];
    for (let i = moves.length - 1; i >= 0; i--) {
      const m = moves[i];
      out.push(m.endsWith("'") ? m[0] : m + "'");
    }
    return out;
  }

  function mixAlpha(rgba, k) {
    const m = /^rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*([\d.]+)\s*\)$/.exec(rgba);
    if (!m) return rgba;
    const r = m[1], g = m[2], b = m[3];
    const a = parseFloat(m[4]) * clamp(k, 0, 1);
    return "rgba(" + r + ", " + g + ", " + b + ", " + a.toFixed(4) + ")";
  }

  global.TransitionCube = { playTransition, initArrival };

  // ----------------------------------------------------------------
  // Boot: auto-fire initArrival, but defer if the page is prerendering.
  //
  // Speculation Rules background:
  //   Each experience HTML carries a <script type="speculationrules">
  //   block listing the OTHER experience URLs. When the user lands on
  //   any page, Chrome (109+) silently fetches AND fully executes those
  //   pages in a hidden context. By the time the user clicks a topnav
  //   tab, the destination is already a fully running JS context with
  //   WebGL initialized — the navigation just "swaps in" the
  //   prerendered page instead of doing a cold load.
  //
  //   But on a prerendered page, our initArrival can't run yet: the
  //   sessionStorage payload doesn't exist (the source page hasn't
  //   even been clicked). So we listen for the 'prerenderingchange'
  //   event, which fires synchronously the moment the user activates
  //   this page via navigation. At that exact moment, the source's
  //   sessionStorage write IS visible, so initArrival picks it up.
  //
  //   Browsers without prerender support: document.prerendering is
  //   undefined → falsy → falls through to the normal DOMContentLoaded
  //   path. No breakage.
  // ----------------------------------------------------------------
  (function bootArrival() {
    if (document.prerendering === true) {
      // Prerendered page: defer until the user activates this URL via a
      // real navigation. At that moment the source's sessionStorage
      // payload becomes visible to us, so we can run initArrival.
      document.addEventListener("prerenderingchange", initArrival, { once: true });
      return;
    }
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", initArrival);
    } else {
      initArrival();
    }
  })();
})(typeof window !== "undefined" ? window : globalThis);
