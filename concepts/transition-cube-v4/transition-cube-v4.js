/* ================================================================
   transition-cube-v4.js

   Same Rubik's cube transition as v3 — same scene graph, same
   group.attach / cubeGroup.attach pattern, same solver, same
   saturated classic palette, same 27-cubie build — with a new
   three-phase choreography per Jake's v4 notes:

     "the cube should be like getting bigger and bigger until it is
      like basically taking out the full screen as it's moving, and
      then once it like reaches critical mass of the full screen,
      it starts moving away. And as it moves away, the Rubik's Cube
      fades and gets solved as the new site becomes more and more
      present. So, like the opacities are like inverses of each
      other."

   Phase 1 — Growing / leaving   (~700ms)
     • Stage scales from ~48px (tiny) → viewport-filling.
     • Cube opacity 0 → 1.
     • Source page opacity 1 → 0 (inverse of cube).
     • Ambient ~0.2 rad/sec Y-drift. No face rotations yet.

   Phase 2 — Peak / solving      (~900ms at typical move count)
     • Stage held at full size. Source page opacity at 0.
     • 6-move scramble + ~5-7 solve plays with v3 per-move timing
       (125ms turn + 40ms pause, so ~165ms per move).
     • Ambient Y-drift continues throughout the solve.

   Phase 3 — Shrinking / arriving (~700ms)
     • Stage scales from viewport-filling → ~48px.
     • Cube opacity 1 → 0 (INVERSE of phase 1).
     • Destination content opacity 0 → 1 (INVERSE of cube).
     • Ambient Y-drift continues.

   Total duration: ~2.1-2.3s.

   Unchanged vs v3 (load-bearing — do not regress):
     • group.attach / cubeGroup.attach reparent pattern.
     • Cubies are THREE.Groups with stickers as children.
     • Facelet model drives sticker colors. Snap to ±π/2 on commit.
     • Quaternion normalize + integer-position snap on detach.
     • Cube palette, camera angle, init tilt.
     • Per-move 125ms turn + 40ms pause.
     • 6-move scramble. Solve 5-7.
     • Ambient 0.2 rad/sec Y-spin on cubeGroup, softened ~50ms
       after each snap so the snap reads clean.
     • Console instrumentation.

   Public API:
     TransitionCubeV4.playTransition({
       onComplete,          // () => void, only fires when no destinationUrl
       destinationUrl,      // if set, navigates AT START of Phase 3
                            //   (cross-page handoff via sessionStorage)
       duration,            // ignored (present for v3 API parity)
       sourceFadeTarget,    // optional: CSS selector / Element / Array
                            //   whose opacity should fade 1→0 in phase 1.
                            //   default: <body> children minus overlay.
       destFadeTarget,      // optional (demo/single-page only): an element
                            //   or selector whose opacity should fade
                            //   0→1 in phase 3. If omitted, phase 3
                            //   fades sourceFadeTarget back in (i.e. a
                            //   reversible no-navigation demo).
       onPhase2End,         // optional hook: called right before phase 3
                            //   starts. Useful in single-page demos for
                            //   swapping which panel is "active."
     });

     TransitionCubeV4.initArrival();
       Call this on every page load. If the last page triggered a
       cross-page transition and set sessionStorage.jrTransitionArrive,
       this will immediately render the cube at full size and play
       phase 3 (shrink + dest fade-in). Otherwise it no-ops.

   Aliased as window.TransitionCube if not already defined.
   ================================================================ */

(function (global) {
  "use strict";

  const THREE_CDN = "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js";
  const SOLVER_SRC_NAME = "cube-solver.js";

  // Classic cube palette (verbatim from v2/v3 — do not retune).
  const STICKER_COLORS = {
    W: 0xffffff, // white  (U)
    R: 0xb71234, // red    (R)
    G: 0x009b48, // green  (F)
    Y: 0xffd500, // yellow (D)
    O: 0xff5800, // orange (L)
    B: 0x0046ad, // blue   (B)
  };
  const BODY_COLOR = 0x111111;

  // Subtle backdrop during peak (transparent-to-dark tint). The spec
  // leaves this to our discretion and asks for "restrained." We show
  // the dark tint only while the source page opacity has gone to 0
  // and before the destination has faded back in — so it reads as the
  // seam between the two pages rather than a flash.
  const PEAK_BACKDROP = "rgba(8, 10, 14, 0.82)";

  // v4 phase durations.
  const PHASE1_MS = 700;   // grow + source fade
  const PHASE3_MS = 700;   // shrink + dest fade
  // Phase 2 length is governed by the move queue:
  //   (scramble 6) + (solve ~5-7) ≈ 11-13 moves × 165ms ≈ 1.8-2.1s.
  // We clamp to [PHASE2_MIN, PHASE2_MAX] just so we have a sane upper
  // bound if the solver ever returns something pathological.
  const PHASE2_MIN = 700;
  const PHASE2_MAX = 1100;

  // Per-move timing (v3 verbatim).
  const MOVE_DURATION_MS = 125;
  const MOVE_PAUSE_MS    = 40;
  const SCRAMBLE_LEN     = 6;

  // Ambient spin during the entire animation (v3).
  const AMBIENT_SPIN_RATE = 0.2;   // rad/sec
  const SNAP_SLOWDOWN_MS  = 50;

  // Cross-page session key.
  const SS_KEY = "jrTransitionArrive";
  const SS_MAX_AGE_MS = 3000;

  // Stage size endpoints. "Tiny" is ~48px; "full" fills the viewport
  // (via 100vmax so it touches the longest screen edge — matches the
  // "basically taking out the full screen" language from the brief).
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
      runLeaving(opts, sourceFade, destFade, onDone);
    }).catch((err) => {
      console.error("[transition-cube-v4] dependency load failed:", err);
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
    if (!payload.timestamp || now - payload.timestamp > SS_MAX_AGE_MS) {
      // Stale — just render normally.
      return;
    }

    if (prefersReducedMotion()) {
      // Nothing to do — page already renders normally.
      return;
    }

    ensureDeps().then(() => {
      runArrival(payload);
    }).catch((err) => {
      console.error("[transition-cube-v4] arrival dependency load failed:", err);
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

  // The "source page opacity 1 → 0 (inverse of cube)" effect needs a
  // handle on what the source page visibly is. We don't want to just
  // fade <body> because that includes the overlay we're adding. So:
  //
  //   1) If the caller passed sourceFadeTarget, use that. It can be
  //      a string selector, an Element, or a NodeList/Array.
  //   2) Otherwise, mark all direct children of <body> that existed
  //      BEFORE we started the transition, and fade those.
  //
  // We do the inverse for arrival: initArrival() finds the same kind
  // of set (everything in <body> minus our overlay) and fades that 0→1.

  function resolveFadeTargets(target) {
    if (!target) {
      return Array.from(document.body.children).filter(el => {
        // Skip anything we've already injected.
        return !el.classList.contains("transition-cube-v4-overlay");
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
    // Simple crossfade, no cube, no cross-page handoff dance.
    setElsOpacity(sourceFade, 0);
    if (opts.destinationUrl) {
      // Clear any stale arrival flag — arrival will just render normally.
      try { sessionStorage.removeItem(SS_KEY); } catch (e) { /* ignore */ }
      setTimeout(() => { window.location.href = opts.destinationUrl; }, 220);
    } else {
      setTimeout(() => { clearElsOpacity(sourceFade); onDone(); }, 220);
    }
  }

  // --- Overlay + stage construction -------------------------------

  function makeOverlay() {
    const el = document.createElement("div");
    el.className = "transition-cube-v4-overlay";
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
    // The stage is a fixed-size square we scale via CSS transform.
    // Rendering into a fixed-size canvas and scaling up with CSS
    // transform keeps the WebGL cost flat no matter how large the
    // on-screen cube gets — which matters because we're growing it
    // to viewport-filling in under a second.
    const stage = document.createElement("div");
    stage.className = "transition-cube-v4-stage";
    stage.style.cssText = [
      "position:absolute",
      "top:50%",
      "left:50%",
      // Intrinsic layout size. CSS transform scales this up/down.
      // Using vmax means the full-size (scale 1) cube fills the
      // longest viewport edge — touches all four edges on square
      // viewports, top+bottom on wide ones, sides on tall ones.
      "width:" + STAGE_FULL,
      "height:" + STAGE_FULL,
      "transform:translate(-50%, -50%) scale(" + (STAGE_TINY_PX / 800) + ")",
      "transform-origin:center center",
      "opacity:0",
      "will-change:transform, opacity",
    ].join(";");
    return stage;
  }

  // --- Main: leaving (phase 1 + phase 2, then hand off to phase 3) -

  function runLeaving(opts, sourceFade, destFade, onDone) {
    const THREE = global.THREE;
    const Solver = global.TransitionCubeV4Solver;

    const overlay = makeOverlay();
    document.body.appendChild(overlay);
    const stage = makeStage();
    overlay.appendChild(stage);

    // Force a layout so the initial scale takes effect before the
    // first frame of the grow animation.
    // eslint-disable-next-line no-unused-expressions
    stage.offsetWidth;

    const ctx = createCubeContext(stage);

    // Build the move queue up-front (scramble + solve). Total moves
    // governs phase 2 duration.
    const scrambleMoves = Solver.randomScramble(SCRAMBLE_LEN);
    const scrambledFacelets = Solver.cloneFacelets(ctx.facelets);
    Solver.applyFaceletMoves(scrambledFacelets, scrambleMoves);
    const solveMoves = Solver.solveFromFacelets(scrambledFacelets) || [];
    const queue = scrambleMoves.concat(solveMoves);

    const estMovesMs = queue.length * (MOVE_DURATION_MS + MOVE_PAUSE_MS);
    const phase2Ms = Math.max(PHASE2_MIN, Math.min(PHASE2_MAX, estMovesMs));

    console.log(
      "[transition-cube-v4] scramble (" + scrambleMoves.length + "):",
      scrambleMoves.join(" ")
    );
    console.log(
      "[transition-cube-v4] solve (" + solveMoves.length + "):",
      solveMoves.join(" ")
    );
    console.log(
      "[transition-cube-v4] total moves:", queue.length,
      "| per-move:", MOVE_DURATION_MS + "ms +", MOVE_PAUSE_MS + "ms pause",
      "| phase1:", PHASE1_MS + "ms",
      "| phase2:", phase2Ms + "ms",
      "| phase3:", PHASE3_MS + "ms"
    );

    if (!global.__transitionCubeV4IdentityChecked) {
      global.__transitionCubeV4IdentityChecked = true;
      runIdentityCheck(THREE);
    }

    const state = {
      running: true,
      phase: 1,                // 1 | 2 | 3
      phaseStartT: performance.now(),
      phase2Ms,
      queue,
      queueIdx: 0,
      currentMove: null,
      pauseUntil: 0,
      lastSnapT: -Infinity,
      lastT: performance.now(),
      ctx,
      overlay,
      stage,
      sourceFade,
      destFade,                // may be null (single-page "reversible" demo)
      opts,
      onDone,
      navigating: false,
    };

    // Kick the render loop.
    requestAnimationFrame(() => renderLoop(state));
  }

  // --- Main: arrival (phase 3 only) -------------------------------

  function runArrival(payload) {
    const THREE = global.THREE;

    // The destination page's initial state is "everything visible."
    // We want it to fade in during phase 3. So: at time zero we set
    // every pre-existing <body> child to opacity 0, mount our overlay,
    // and then fade them back up while the cube shrinks.
    const destFade = Array.from(document.body.children);
    setElsOpacity(destFade, 0);

    const overlay = makeOverlay();
    // During arrival, seam backdrop starts opaque (page beneath is at 0)
    // and fades to 0 as dest fades in.
    overlay.style.backgroundColor = PEAK_BACKDROP;
    document.body.appendChild(overlay);

    const stage = makeStage();
    // Start at full size, full opacity (we're coming out of phase 2).
    stage.style.transform = "translate(-50%, -50%) scale(1)";
    stage.style.opacity = "1";
    overlay.appendChild(stage);
    // eslint-disable-next-line no-unused-expressions
    stage.offsetWidth;

    const ctx = createCubeContext(stage);

    // Set the facelet state to the solved state we "arrived in."
    // (Phase 2 always ends solved; we don't actually serialize the
    // cube geometry across pages — we just arrive solved, which is
    // what the cube looks like at the end of phase 2 anyway.)
    // If a real cubeSolveState were passed we'd apply it here.

    const onDone = () => {
      // Leave the destination page's body children at the natural
      // (un-styled) opacity by clearing our inline overrides — the
      // page just looks like a normal navigation result.
      clearElsOpacity(destFade);
      try { overlay.remove(); } catch (e) { /* ignore */ }
      try { disposeCubeContext(ctx); } catch (e) { /* ignore */ }
    };

    const state = {
      running: true,
      phase: 3,
      phaseStartT: performance.now(),
      phase2Ms: 0,
      queue: [],
      queueIdx: 0,
      currentMove: null,
      pauseUntil: 0,
      lastSnapT: -Infinity,
      lastT: performance.now(),
      ctx,
      overlay,
      stage,
      sourceFade: [],         // nothing to fade out — source page is gone
      destFade: destFade,     // the arriving page's body children → fade 0→1
      opts: {},
      onDone,
      navigating: false,
      arrival: true,
    };

    console.log(
      "[transition-cube-v4] arrival — starting phase 3 (" + PHASE3_MS + "ms shrink + dest fade-in)"
    );

    requestAnimationFrame(() => renderLoop(state));
  }

  // --- Shared render loop ------------------------------------------

  function renderLoop(state) {
    if (!state.running) return;
    const now = performance.now();
    const dt = Math.max(0, (now - state.lastT) / 1000);
    state.lastT = now;

    // Ambient Y-drift, always on, softened briefly right after a snap.
    let spinFactor = 1.0;
    const sinceSnap = now - state.lastSnapT;
    if (sinceSnap >= 0 && sinceSnap < SNAP_SLOWDOWN_MS) {
      spinFactor = sinceSnap / SNAP_SLOWDOWN_MS;
    }
    state.ctx.cubeGroup.rotation.y += dt * AMBIENT_SPIN_RATE * spinFactor;

    // Drive phase.
    if (state.phase === 1) tickPhase1(state, now);
    else if (state.phase === 2) tickPhase2(state, now);
    else if (state.phase === 3) tickPhase3(state, now);

    state.ctx.renderer.render(state.ctx.scene, state.ctx.camera);

    // End conditions.
    if (state.phase === 3 && now - state.phaseStartT >= PHASE3_MS) {
      state.running = false;
      // In single-page (no destinationUrl) mode: clean up overlay +
      // WebGL ourselves. Arrival mode has its own onDone that handles
      // this for the destination page.
      if (!state.arrival) {
        try {
          // Leave sourceFade AT 0 and destFade AT 1 — those are the
          // correct terminal states the user sees. Don't strip inline
          // styles; the caller is responsible for resetting via
          // onComplete if it wants to run again.
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

  // Phase 1: grow stage from tiny → full, cube opacity 0 → 1,
  // source opacity 1 → 0 (inverse).
  function tickPhase1(state, now) {
    const p = clamp((now - state.phaseStartT) / PHASE1_MS, 0, 1);
    const eased = easeOutCubic(p);

    const scale = lerp(STAGE_TINY_PX / getIntrinsicPx(state.stage), 1, eased);
    state.stage.style.transform = "translate(-50%, -50%) scale(" + scale.toFixed(4) + ")";
    state.stage.style.opacity = eased.toFixed(4);
    setElsOpacity(state.sourceFade, 1 - eased);

    // Backdrop seam fades in slightly during phase 1 — not fully dark
    // until phase 2 — so you still see the source page behind the
    // growing cube at the start.
    state.overlay.style.backgroundColor = mixAlpha(PEAK_BACKDROP, eased * 0.9);

    if (p >= 1) {
      state.phase = 2;
      state.phaseStartT = now;
      state.pauseUntil = now; // let phase 2 start rotations immediately
      state.overlay.style.backgroundColor = PEAK_BACKDROP;
      setElsOpacity(state.sourceFade, 0);
      state.stage.style.transform = "translate(-50%, -50%) scale(1)";
      state.stage.style.opacity = "1";
      console.log("[transition-cube-v4] phase 2 begin (peak / solving)");
    }
  }

  // Phase 2: full-size cube, run the scramble+solve move queue.
  function tickPhase2(state, now) {
    // Run the move player, v3 semantics verbatim.
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

    // Phase 2 is over when EITHER all moves have played OR we hit
    // the phase2Ms clamp, whichever comes last-but-not-past.
    const elapsed = now - state.phaseStartT;
    const allMovesDone = state.queueIdx >= state.queue.length && state.currentMove === null;
    if (allMovesDone && elapsed >= state.phase2Ms) {
      // Snap anything that remains to solved (it already is).
      beginPhase3(state, now);
    }
  }

  function beginPhase3(state, now) {
    // Cross-page handoff, if requested. Write sessionStorage, then
    // navigate. The destination page's initArrival() takes it from
    // here. Our own phase 3 does not run in that case — we just
    // dismount and let the new page do its shrink.
    if (state.opts.destinationUrl && !state.navigating) {
      state.navigating = true;
      try {
        sessionStorage.setItem(SS_KEY, JSON.stringify({
          timestamp: Date.now(),
          cubeSolveState: "solved",
        }));
      } catch (e) {
        // sessionStorage unavailable — graceful degradation: the
        // destination page just won't have an arrival animation.
      }
      console.log("[transition-cube-v4] phase 2 end — navigating to:", state.opts.destinationUrl);
      state.running = false;
      window.location.href = state.opts.destinationUrl;
      return;
    }

    // Single-page mode: let the caller swap panels (demo hook) so
    // that the element we're about to fade in is actually in the DOM
    // and renderable. If the caller didn't provide a destFade, phase
    // 3 fades the sourceFade set back up so the page ends where it
    // started (useful when playing the transition without navigating).
    if (typeof state.opts.onPhase2End === "function") {
      try { state.opts.onPhase2End(); } catch (e) { console.error(e); }
    }

    state.phase = 3;
    state.phaseStartT = now;
    console.log("[transition-cube-v4] phase 3 begin (shrink / arriving)");
  }

  // Phase 3: shrink stage from full → tiny, cube opacity 1 → 0,
  // destination/source opacity 0 → 1 (inverse).
  function tickPhase3(state, now) {
    const p = clamp((now - state.phaseStartT) / PHASE3_MS, 0, 1);
    const eased = easeInCubic(p);

    // scale goes from 1 → (tiny/full), cube opacity 1 → 0
    const scale = lerp(1, STAGE_TINY_PX / getIntrinsicPx(state.stage), eased);
    state.stage.style.transform = "translate(-50%, -50%) scale(" + scale.toFixed(4) + ")";
    state.stage.style.opacity = (1 - eased).toFixed(4);

    // INVERSE: whoever is acting as the "destination" fades IN 0 → 1
    // while the cube fades OUT. If the caller passed an explicit
    // destFade target (demo's destination panel, or arrival page's
    // pre-existing content), that wins. Otherwise we fade the
    // sourceFade set back up so the single-page caller ends back at
    // its starting visual state.
    const fadeInTargets = state.destFade || state.sourceFade;
    setElsOpacity(fadeInTargets, eased);

    // Backdrop seam fades with the cube so you don't see a dark wash
    // once the destination page is showing through.
    state.overlay.style.backgroundColor = mixAlpha(PEAK_BACKDROP, 1 - eased);
  }

  // --- Cube context (scene graph, renderer, cubies) ---------------

  function createCubeContext(stage) {
    const THREE = global.THREE;
    const Solver = global.TransitionCubeV4Solver;

    // Intrinsic render size. Independent of the CSS scale — we let
    // the browser scale the canvas via transform. This keeps the
    // WebGL cost flat even when the on-screen cube is huge.
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
    // Store intrinsic pixel size on the stage so phase 1/3 can
    // compute the correct "tiny" scale factor.
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

  // --- Move player (v3 semantics, operates on `state`) ------------

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
      "[transition-cube-v4] [move " + (idx + 1) + "/" + total + "] " +
      moveStr + " — axis " + spec.axis + " target " +
      (targetAngle * 180 / Math.PI).toFixed(1) + "°"
    );
  }

  function commitMove(state, mv) {
    const Solver = global.TransitionCubeV4Solver;
    mv.group.rotation[mv.axis] = mv.targetAngle;

    const actual = mv.group.rotation[mv.axis];
    const expected = mv.targetAngle;
    const ok = Math.abs(actual - expected) < 1e-9;
    console.log(
      "[transition-cube-v4]   snap: rotation." + mv.axis + "=" +
      actual.toFixed(6) + " (expected " + expected.toFixed(6) + ") " +
      (ok ? "OK" : "DRIFT")
    );

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

  // --- Cubie + sticker construction (VERBATIM from v2/v3) ---------

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

  const FACE_SPEC = {
    U: { axis: 'y', sign: -1, pick: p => p.y >  0.5 },
    D: { axis: 'y', sign: +1, pick: p => p.y < -0.5 },
    R: { axis: 'x', sign: -1, pick: p => p.x >  0.5 },
    L: { axis: 'x', sign: +1, pick: p => p.x < -0.5 },
    F: { axis: 'z', sign: -1, pick: p => p.z >  0.5 },
    B: { axis: 'z', sign: +1, pick: p => p.z < -0.5 },
  };

  // --- Identity check (retained from v3) --------------------------
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
      "[transition-cube-v4] identity check (4× U): " +
      (ok ? "OK — all 9 U-layer cubies returned to start." : "FAILED")
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

  // PEAK_BACKDROP is "rgba(r, g, b, A)". Scale its alpha by k ∈ [0,1].
  function mixAlpha(rgba, k) {
    const m = /^rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*([\d.]+)\s*\)$/.exec(rgba);
    if (!m) return rgba;
    const r = m[1], g = m[2], b = m[3];
    const a = parseFloat(m[4]) * clamp(k, 0, 1);
    return "rgba(" + r + ", " + g + ", " + b + ", " + a.toFixed(4) + ")";
  }

  global.TransitionCubeV4 = { playTransition, initArrival };

  if (!global.TransitionCube) global.TransitionCube = global.TransitionCubeV4;
})(typeof window !== "undefined" ? window : globalThis);
