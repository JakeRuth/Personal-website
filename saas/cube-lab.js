/* Cube Lab - saas-medium standalone Rubik's cube playground.
   ----------------------------------------------------------------
   Opens via the hero "Try the live demo" CTA. Renders a responsive
   grid of real 3x3x3 Rubik's cubes in a single three.js scene.

   Per cube, every frame:
     - Compute screen-space distance to the cursor / touch point.
     - In radius : enlarge proportionally (apex at the cursor),
                   lift forward in Z so the apex cube clearly comes
                   to the foreground (the morph reads as 3D depth,
                   not z-fighting), and queue random face turns at
                   a rate that scales with proximity.
     - Out of radius : shrink back to base, and start a "solve plan"
                   that always finishes in <= 4 seconds regardless
                   of how scrambled the cube is.

   Solve plan:
     N = scrambleHistory.length
     animated = min(N, ANIMATED_TAIL_MAX)            // last N moves
     silent   = N - animated                          // older moves
     - Apply silent inverses INSTANTLY (one frame) so the cube fast-
       forwards to "animated_tail moves from solved".
     - Animate the remaining `animated` inverses at
       perMove = clamp(MIN, MAX, BUDGET / animated).
     For animated <= ~12 this caps total animated time at BUDGET,
     for tiny histories it's faster (under the cap), and for
     enormous histories the silent prefix collapses cleanly to a
     single frame so the visible animation always runs at a
     comfortable pace.
*/

(function () {
  'use strict';

  // ================================================================
  // Constants
  // ================================================================
  const RADIUS_PX = 240;
  const SCRAMBLE_INTERVAL_FAST = 80;     // faster trigger cadence at peak
  const SCRAMBLE_INTERVAL_SLOW = 600;
  const SCRAMBLE_MOVE_DUR_MS = 140;      // each face turn is snappier

  const SOLVE_TIME_BUDGET_MS = 4000;
  const SOLVE_ANIMATED_MAX = 12;
  // Per-move cap chosen so 12 * 308ms + 12 * inter-move pacing (~16ms each, see
  // maybeApplySolveStep) lands at ~3.9s wall-clock — comfortably under the 4s
  // budget the user specified.
  const SOLVE_PER_MOVE_MAX_MS = 308;
  const SOLVE_PER_MOVE_MIN_MS = 80;
  // Bound the silent-prefix cost: at HISTORY_CAP, the cube quietly
  // snaps to solved mid-scramble (one-frame reset) so the eventual
  // solve never has to fast-forward more than (CAP - ANIMATED_MAX)
  // moves in a single frame. Stops a 10-minute hold from stalling.
  const HISTORY_CAP = 180;

  // Tuned so the peak-scale cube width never exceeds breakpoint spacing
  // (no overlap with neighbors, even at the apex).
  // peak_width = 3 * BASE_SCALE * (1 + SCALE_BOOST_MAX) = 3 * 0.65 * 1.65 = 3.22
  // Smallest spacing below is 3.30 -> 0.08 world-unit gap at peak.
  const SCALE_BOOST_MAX = 0.65;
  const Z_LIFT_MAX = 2.4;           // bumped to keep apex feeling dramatic
  const BASE_SCALE = 0.65;

  // Classic Rubik's colors.  CubeSolver face indices: U=0 R=1 F=2 D=3 L=4 B=5
  const FACE_COLORS = [
    0xfafafa, // U white
    0xc62828, // R red
    0x2e7d32, // F green
    0xfdd835, // D yellow
    0xef6c00, // L orange
    0x1565c0, // B blue
  ];
  const BODY_COLOR = 0x0a0c10;
  const STICKER_OFFSET = 0.501;

  const FACE_AXIS = { U: 'y', D: 'y', R: 'x', L: 'x', F: 'z', B: 'z' };
  const FACE_SIGN = { U: +1, D: -1, R: +1, L: -1, F: +1, B: -1 };
  const ALL_MOVES = ["U","U'","D","D'","R","R'","L","L'","F","F'","B","B'"];

  // Responsive grid dimensions. Fewer cubes on small viewports so each
  // cube stays legible.
  function pickGridDims() {
    const w = window.innerWidth;
    // spacing values are kept >= peak_width (3.22) so cubes never
    // overlap their neighbors, even when the cursor sits right on
    // top of one and the eased proximity drives that cube to peak.
    if (w < 480)   return { cols: 6,  rows: 4, spacing: 3.30 };  // 24
    if (w < 720)   return { cols: 8,  rows: 5, spacing: 3.35 };  // 40
    if (w < 1080)  return { cols: 10, rows: 5, spacing: 3.40 };  // 50
    if (w < 1440)  return { cols: 11, rows: 6, spacing: 3.40 };  // 66
    return            { cols: 12, rows: 6, spacing: 3.40 };  // 72
  }

  const REDUCED_MOTION = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ================================================================
  // Module state
  // ================================================================
  let modal, stage, ctaBtn, hintOverlay, closeBtn;
  let scene = null, camera = null, renderer = null;
  let stageRect = null;
  let raf = 0;
  let lastFocusedBeforeOpen = null;
  let isOpen = false;
  let mouseX = -99999, mouseY = -99999;
  let cubes = [];
  let gridDims = null;
  let interactionStarted = false;

  const _vScreen = { x: 0, y: 0 };
  let _projVec, _worldVec, _scaleVec;

  // Shared materials/geometries (one set, all cubes reuse).
  let _bodyMat = null, _stickerMats = null;
  let _bodyGeo = null, _stickerGeo = null;
  function getBodyMat()     { return _bodyMat   || (_bodyMat   = new THREE.MeshBasicMaterial({ color: BODY_COLOR })); }
  function getStickerMat(i) { if (!_stickerMats) _stickerMats = FACE_COLORS.map(c => new THREE.MeshBasicMaterial({ color: c, side: THREE.FrontSide })); return _stickerMats[i]; }
  function getBodyGeo()     { return _bodyGeo    || (_bodyGeo    = new THREE.BoxGeometry(0.97, 0.97, 0.97)); }
  function getStickerGeo()  { return _stickerGeo || (_stickerGeo = new THREE.PlaneGeometry(0.92, 0.92)); }

  // ================================================================
  // Cube construction
  // ================================================================
  function buildCubies(cubeGroup, cubies) {
    for (let x = -1; x <= 1; x++) {
      for (let y = -1; y <= 1; y++) {
        for (let z = -1; z <= 1; z++) {
          const cubie = new THREE.Group();
          cubie.position.set(x, y, z);
          cubie.add(new THREE.Mesh(getBodyGeo(), getBodyMat()));
          if (y === 1)  { const s = new THREE.Mesh(getStickerGeo(), getStickerMat(0)); s.position.set(0, STICKER_OFFSET, 0); s.rotation.x = -Math.PI / 2; cubie.add(s); }
          if (x === 1)  { const s = new THREE.Mesh(getStickerGeo(), getStickerMat(1)); s.position.set(STICKER_OFFSET, 0, 0); s.rotation.y = Math.PI / 2;  cubie.add(s); }
          if (z === 1)  { const s = new THREE.Mesh(getStickerGeo(), getStickerMat(2)); s.position.set(0, 0, STICKER_OFFSET);                                cubie.add(s); }
          if (y === -1) { const s = new THREE.Mesh(getStickerGeo(), getStickerMat(3)); s.position.set(0, -STICKER_OFFSET, 0); s.rotation.x = Math.PI / 2;  cubie.add(s); }
          if (x === -1) { const s = new THREE.Mesh(getStickerGeo(), getStickerMat(4)); s.position.set(-STICKER_OFFSET, 0, 0); s.rotation.y = -Math.PI / 2; cubie.add(s); }
          if (z === -1) { const s = new THREE.Mesh(getStickerGeo(), getStickerMat(5)); s.position.set(0, 0, -STICKER_OFFSET); s.rotation.y = Math.PI;       cubie.add(s); }
          cubeGroup.add(cubie);
          cubies.push(cubie);
        }
      }
    }
  }

  function makeCube(gridX, gridY, dims) {
    const outer = new THREE.Group();
    const xOffset =  (gridX - (dims.cols - 1) / 2) * dims.spacing;
    const yOffset = -(gridY - (dims.rows - 1) / 2) * dims.spacing;
    outer.position.set(xOffset, yOffset, 0);

    const inner = new THREE.Group();
    inner.rotation.set(-0.32, Math.PI / 8, 0);
    inner.scale.set(BASE_SCALE, BASE_SCALE, BASE_SCALE);
    outer.add(inner);

    const cubies = [];
    buildCubies(inner, cubies);

    return {
      outer,
      inner,
      cubies,
      facelets: window.CubeSolver.solvedFacelets(),
      busy: false,
      currentAnim: null,
      scrambleHistory: [],
      lastMoveTime: 0,
      gridX, gridY,
      idleT: Math.random() * Math.PI * 2,
      // Solve-plan state
      solving: false,
      solvePerMoveMs: SOLVE_PER_MOVE_MAX_MS,
    };
  }

  // ================================================================
  // Move animation (slice-attach pattern, parallel-safe per cube)
  // ================================================================
  function startMove(cube, move, durMs) {
    if (cube.busy) return false;
    cube.busy = true;
    const face = move[0];
    const prime = move.endsWith("'");
    const axis = FACE_AXIS[face];
    const sign = FACE_SIGN[face];
    const target = (prime ? +Math.PI / 2 : -Math.PI / 2) * sign;

    const slice = new THREE.Group();
    cube.inner.add(slice);
    const tol = 0.4;
    cube.cubies.forEach((cubie) => {
      if (Math.abs(cubie.position[axis] - sign) < tol) {
        slice.attach(cubie);
      }
    });

    cube.currentAnim = {
      slice, axis, target,
      startT: performance.now(),
      durMs,
      move,
    };
    return true;
  }

  function advanceMove(cube, now) {
    const a = cube.currentAnim;
    if (!a) return;
    const t = Math.min(1, (now - a.startT) / a.durMs);
    const ease = (x) => (x < 0.5) ? (4 * x * x * x) : (1 - Math.pow(-2 * x + 2, 3) / 2);
    a.slice.rotation[a.axis] = a.target * ease(t);
    if (t >= 1) {
      finalizeMove(cube);
    }
  }

  function finalizeMove(cube) {
    const a = cube.currentAnim;
    if (!a) return;
    a.slice.rotation[a.axis] = a.target;
    const kids = a.slice.children.slice();
    kids.forEach((c) => {
      cube.inner.attach(c);
      c.position.x = Math.round(c.position.x);
      c.position.y = Math.round(c.position.y);
      c.position.z = Math.round(c.position.z);
    });
    cube.inner.remove(a.slice);
    window.CubeSolver.applyFaceletMoves(cube.facelets, [a.move]);
    cube.busy = false;
    cube.currentAnim = null;
  }

  // Apply a move with no animation: instant slice-rotate-finalize.
  // Used for the silent prefix of a long-history solve plan.
  function applyMoveInstant(cube, move) {
    if (cube.busy) {
      // Defensive: if a move happens to be in flight, finalize it first.
      finalizeMove(cube);
    }
    const face = move[0];
    const prime = move.endsWith("'");
    const axis = FACE_AXIS[face];
    const sign = FACE_SIGN[face];
    const target = (prime ? +Math.PI / 2 : -Math.PI / 2) * sign;

    const slice = new THREE.Group();
    cube.inner.add(slice);
    const tol = 0.4;
    cube.cubies.forEach((cubie) => {
      if (Math.abs(cubie.position[axis] - sign) < tol) {
        slice.attach(cubie);
      }
    });
    slice.rotation[axis] = target;
    const kids = slice.children.slice();
    kids.forEach((c) => {
      cube.inner.attach(c);
      c.position.x = Math.round(c.position.x);
      c.position.y = Math.round(c.position.y);
      c.position.z = Math.round(c.position.z);
    });
    cube.inner.remove(slice);
    window.CubeSolver.applyFaceletMoves(cube.facelets, [move]);
  }

  function invertMove(m) { return m.endsWith("'") ? m[0] : (m + "'"); }

  // Hard reset: detach any in-flight slice, snap every cubie to its
  // solved position and identity rotation, reset facelets. Used as a
  // bounded mid-scramble safety valve (HISTORY_CAP) so the silent
  // solve prefix never has to chew through thousands of moves.
  function snapToSolved(cube) {
    if (cube.busy) finalizeMove(cube);
    let i = 0;
    for (let x = -1; x <= 1; x++) {
      for (let y = -1; y <= 1; y++) {
        for (let z = -1; z <= 1; z++) {
          const cubie = cube.cubies[i++];
          if (cubie.parent !== cube.inner) cube.inner.attach(cubie);
          cubie.position.set(x, y, z);
          cubie.quaternion.identity();
        }
      }
    }
    const fresh = window.CubeSolver.solvedFacelets();
    for (let f = 0; f < 6; f++) for (let j = 0; j < 9; j++) cube.facelets[f][j] = fresh[f][j];
  }

  // ================================================================
  // Scramble / solve scheduling
  // ================================================================
  function maybeApplyScramble(cube, proximity, now) {
    if (REDUCED_MOTION) return;
    if (cube.busy) return;
    const ease = 1 - proximity; // 0 at center, 1 at edge
    const interval = SCRAMBLE_INTERVAL_FAST + ease * (SCRAMBLE_INTERVAL_SLOW - SCRAMBLE_INTERVAL_FAST);
    if (now - cube.lastMoveTime < interval) return;

    // Safety valve: very long holds quietly reset the cube so the
    // eventual solve plan never has to fast-forward an unbounded
    // history. One-frame snap; the user just sees the cube continue
    // scrambling from a fresh state.
    if (cube.scrambleHistory.length >= HISTORY_CAP) {
      snapToSolved(cube);
      cube.scrambleHistory.length = 0;
    }

    const move = ALL_MOVES[(Math.random() * ALL_MOVES.length) | 0];
    cube.scrambleHistory.push(move);
    cube.lastMoveTime = now;
    startMove(cube, move, SCRAMBLE_MOVE_DUR_MS);
  }

  // Compute and stage the solve plan: silent prefix (instantly applied)
  // + animated tail (last K inverses, paced to fit the time budget).
  function startSolveProcess(cube) {
    if (cube.solving) return;
    if (cube.scrambleHistory.length === 0) return;

    cube.solving = true;
    if (cube.busy) finalizeMove(cube); // commit any in-flight scramble move

    const N = cube.scrambleHistory.length;
    const animated = Math.min(N, SOLVE_ANIMATED_MAX);
    const silent = N - animated;

    // Silent prefix: pop most-recent moves and apply their inverses
    // instantly, until only the oldest `animated` moves remain.
    for (let i = 0; i < silent; i++) {
      const recent = cube.scrambleHistory.pop();
      applyMoveInstant(cube, invertMove(recent));
    }

    // Animated tail: pace to fit the budget, clamped to a comfortable
    // per-move window so brief solves don't feel rushed.
    const perMove = (animated > 0)
      ? Math.min(SOLVE_PER_MOVE_MAX_MS,
                 Math.max(SOLVE_PER_MOVE_MIN_MS, SOLVE_TIME_BUDGET_MS / animated))
      : 0;
    cube.solvePerMoveMs = perMove;
    cube.lastMoveTime = 0; // unblock the next move trigger immediately
  }

  function maybeApplySolveStep(cube, now) {
    if (cube.busy) return;
    if (!cube.solving) return;
    if (cube.scrambleHistory.length === 0) {
      cube.solving = false;
      return;
    }
    // Tiny inter-move pacing buffer so the slice attach/detach
    // bookkeeping has a frame to settle before the next starts.
    if (now - cube.lastMoveTime < 16) return;

    const move = cube.scrambleHistory.pop();
    cube.lastMoveTime = now;
    startMove(cube, invertMove(move), cube.solvePerMoveMs);
  }

  // ================================================================
  // Render loop
  // ================================================================
  function projectToScreen(worldPos) {
    _projVec.copy(worldPos).project(camera);
    _vScreen.x = (_projVec.x * 0.5 + 0.5) * stageRect.width;
    _vScreen.y = (-_projVec.y * 0.5 + 0.5) * stageRect.height;
    return _vScreen;
  }

  function tick() {
    raf = requestAnimationFrame(tick);
    if (!stageRect || !renderer) return;
    const now = performance.now();

    for (const cube of cubes) {
      // Advance any in-flight move animation.
      if (cube.currentAnim) advanceMove(cube, now);

      // Project the cube center to screen space.
      cube.outer.updateMatrixWorld();
      cube.inner.getWorldPosition(_worldVec);
      const sc = projectToScreen(_worldVec);
      const dx = mouseX - sc.x;
      const dy = mouseY - sc.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const inRadius = (mouseX > -9000) && (dist < RADIUS_PX);

      // Sharpen the falloff so the apex stands out: proximity^2 over
      // [0,1] keeps the center cube big while neighbors taper quickly.
      const linearProx = inRadius ? (1 - dist / RADIUS_PX) : 0;
      const easedProx  = linearProx * linearProx;

      // Smooth scale lerp toward target; lift forward in z so the
      // apex cube clearly sits above its neighbors (depth, not clip).
      const targetScale = BASE_SCALE * (1 + easedProx * SCALE_BOOST_MAX);
      _scaleVec.set(targetScale, targetScale, targetScale);
      cube.inner.scale.lerp(_scaleVec, 0.15);
      cube.outer.position.z = cube.outer.position.z * 0.85 + (easedProx * Z_LIFT_MAX) * 0.15;

      // Idle wobble + cursor-aware tilt.
      cube.idleT += 0.0014;
      let tx, ty;
      if (inRadius) {
        tx = -0.32 + (dy / RADIUS_PX) * 0.22 * easedProx;
        ty = Math.PI / 8 + (dx / RADIUS_PX) * 0.22 * easedProx;
        cube.inner.rotation.x += (tx - cube.inner.rotation.x) * 0.10;
        cube.inner.rotation.y += (ty - cube.inner.rotation.y) * 0.10;
      } else {
        tx = -0.32 + Math.sin(cube.idleT + cube.gridX * 0.7) * 0.05;
        ty = Math.PI / 8 + Math.cos(cube.idleT + cube.gridY * 0.5) * 0.07;
        cube.inner.rotation.x += (tx - cube.inner.rotation.x) * 0.04;
        cube.inner.rotation.y += (ty - cube.inner.rotation.y) * 0.04;
      }

      if (inRadius) {
        // Cursor came back over a cube mid-solve: cancel the solve so
        // scrambling resumes from the current state. scrambleHistory
        // already reflects whatever's still applied. Reset lastMoveTime
        // so the next scramble fires on its own cadence rather than
        // inheriting the solve-pacing buffer.
        if (cube.solving) {
          cube.solving = false;
          cube.lastMoveTime = 0;
        }
        maybeApplyScramble(cube, easedProx, now);
      } else {
        if (!cube.solving && cube.scrambleHistory.length > 0) {
          startSolveProcess(cube);
        }
        maybeApplySolveStep(cube, now);
      }
    }

    renderer.render(scene, camera);
  }

  // ================================================================
  // Camera fit
  // ================================================================
  function fitCamera() {
    if (!camera || !stageRect || !gridDims) return;
    const aspect = stageRect.width / stageRect.height;
    camera.aspect = aspect;
    const cubeWidth = 3 * BASE_SCALE * (1 + SCALE_BOOST_MAX); // worst-case
    const gridW = (gridDims.cols - 1) * gridDims.spacing + cubeWidth;
    const gridH = (gridDims.rows - 1) * gridDims.spacing + cubeWidth;
    const fovRad = camera.fov * Math.PI / 180;
    const zForH = (gridH / 2) / Math.tan(fovRad / 2);
    const zForW = ((gridW / 2) / aspect) / Math.tan(fovRad / 2);
    camera.position.z = Math.max(zForH, zForW) * 1.16;
    camera.updateProjectionMatrix();
  }

  // ================================================================
  // Scene init / dispose
  // ================================================================
  function initScene() {
    if (scene) return;
    stageRect = stage.getBoundingClientRect();
    if (!stageRect.width || !stageRect.height) return;

    gridDims = pickGridDims();

    _projVec  = new THREE.Vector3();
    _worldVec = new THREE.Vector3();
    _scaleVec = new THREE.Vector3(1, 1, 1);

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(48, stageRect.width / stageRect.height, 0.1, 200);
    camera.position.set(0, 0, 16);
    camera.lookAt(0, 0, 0);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(stageRect.width, stageRect.height);
    renderer.setClearColor(0x000000, 0);
    // Wipe any prior canvas from a previous open.
    Array.from(stage.querySelectorAll('canvas')).forEach((c) => c.remove());
    stage.appendChild(renderer.domElement);

    cubes = [];
    for (let r = 0; r < gridDims.rows; r++) {
      for (let c = 0; c < gridDims.cols; c++) {
        const cube = makeCube(c, r, gridDims);
        scene.add(cube.outer);
        cubes.push(cube);
      }
    }

    fitCamera();
    bindStagePointer();
    raf = requestAnimationFrame(tick);
  }

  function disposeScene() {
    if (raf) { cancelAnimationFrame(raf); raf = 0; }
    unbindStagePointer();
    if (renderer) {
      renderer.dispose();
      if (renderer.domElement && renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    }
    // Drop the shared geometry / material cache so the next scene
    // doesn't reuse GPU buffers tied to the disposed renderer. This
    // prevents accumulating GPU resources across many open / close /
    // orientation-flip cycles.
    if (_bodyMat)    { _bodyMat.dispose();    _bodyMat = null; }
    if (_stickerMats) { _stickerMats.forEach((m) => m && m.dispose()); _stickerMats = null; }
    if (_bodyGeo)    { _bodyGeo.dispose();    _bodyGeo = null; }
    if (_stickerGeo) { _stickerGeo.dispose(); _stickerGeo = null; }
    scene = null;
    camera = null;
    renderer = null;
    cubes = [];
    stageRect = null;
    gridDims = null;
    mouseX = mouseY = -99999;
    interactionStarted = false;
    if (hintOverlay) hintOverlay.classList.remove('is-faded');
  }

  // ================================================================
  // Pointer handling
  // ================================================================
  function markInteractionStarted() {
    if (interactionStarted) return;
    interactionStarted = true;
    if (hintOverlay) hintOverlay.classList.add('is-faded');
  }

  function onPointerMove(e) {
    if (!stageRect) return;
    const t = (e.touches && e.touches[0]) || e;
    mouseX = t.clientX - stageRect.left;
    mouseY = t.clientY - stageRect.top;
    markInteractionStarted();
  }
  function onPointerLeave() {
    mouseX = mouseY = -99999;
  }
  // Touch-specific: on tap (pointerdown) we want to immediately
  // register the position AND capture the pointer so subsequent
  // pointermove events keep flowing to the stage even if the finger
  // strays outside the canvas bounds during a drag.
  function onPointerDown(e) {
    if (!stageRect) return;
    if (e.pointerId != null && stage.setPointerCapture) {
      try { stage.setPointerCapture(e.pointerId); } catch (_) {}
    }
    onPointerMove(e);
  }
  function bindStagePointer() {
    if (!stage) return;
    if (window.PointerEvent) {
      stage.addEventListener('pointerdown', onPointerDown);
      stage.addEventListener('pointermove', onPointerMove);
      stage.addEventListener('pointerup', onPointerLeave);
      stage.addEventListener('pointerleave', onPointerLeave);
      stage.addEventListener('pointercancel', onPointerLeave);
    } else {
      stage.addEventListener('mousemove', onPointerMove);
      stage.addEventListener('mouseleave', onPointerLeave);
      stage.addEventListener('touchstart', onPointerMove, { passive: true });
      stage.addEventListener('touchmove', onPointerMove, { passive: true });
      stage.addEventListener('touchend', onPointerLeave);
      stage.addEventListener('touchcancel', onPointerLeave);
    }
  }
  function unbindStagePointer() {
    if (!stage) return;
    stage.removeEventListener('pointerdown', onPointerDown);
    stage.removeEventListener('pointermove', onPointerMove);
    stage.removeEventListener('pointerup', onPointerLeave);
    stage.removeEventListener('pointerleave', onPointerLeave);
    stage.removeEventListener('pointercancel', onPointerLeave);
    stage.removeEventListener('mousemove', onPointerMove);
    stage.removeEventListener('mouseleave', onPointerLeave);
    stage.removeEventListener('touchstart', onPointerMove);
    stage.removeEventListener('touchmove', onPointerMove);
    stage.removeEventListener('touchend', onPointerLeave);
    stage.removeEventListener('touchcancel', onPointerLeave);
  }

  // ================================================================
  // Modal open / close
  // ================================================================
  function openModal() {
    if (isOpen) return;
    if (!window.THREE || !window.CubeSolver) return;
    isOpen = true;
    lastFocusedBeforeOpen = document.activeElement;
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    // body class hides the topnav (otherwise its z-index covers our modal)
    // and locks page scroll while the modal is up.
    document.body.classList.add('cube-lab-active');
    document.body.style.overflow = 'hidden';
    // Move focus into the dialog so keyboard users can drive it; close
    // is the safest landing target since it dismisses without needing
    // touch input.
    if (closeBtn && typeof closeBtn.focus === 'function') {
      requestAnimationFrame(() => { try { closeBtn.focus(); } catch (_) {} });
    }
    requestAnimationFrame(() => requestAnimationFrame(initScene));
  }

  function closeModal() {
    if (!isOpen) return;
    isOpen = false;
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('cube-lab-active');
    document.body.style.overflow = '';
    // Restore focus to whatever opened the modal (typically #cube-lab-cta).
    if (lastFocusedBeforeOpen && typeof lastFocusedBeforeOpen.focus === 'function') {
      try { lastFocusedBeforeOpen.focus(); } catch (_) {}
    }
    lastFocusedBeforeOpen = null;
    setTimeout(() => { if (!isOpen) disposeScene(); }, 260);
  }

  // Tab trap: cycle focus between Close and (effectively) Close.
  // The modal has only one user-focusable control, so Tab/Shift+Tab
  // both keep focus on the close button — preventing keyboard users
  // from tabbing out into the underlying page.
  function trapFocus(e) {
    if (!isOpen) return;
    if (e.key !== 'Tab') return;
    if (closeBtn && document.activeElement !== closeBtn) {
      e.preventDefault();
      try { closeBtn.focus(); } catch (_) {}
    } else {
      e.preventDefault();
    }
  }

  // ================================================================
  // Resize. If the breakpoint changes (e.g., orientation flip from
  // landscape to portrait phone), rebuild the grid at the new
  // density so per-cube screen size stays legible.
  // ================================================================
  let resizeTimer = 0;
  function onResize() {
    if (!isOpen || !stage) return;
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (!renderer || !camera) return;
      stageRect = stage.getBoundingClientRect();
      const newDims = pickGridDims();
      const dimsChanged = !gridDims || newDims.cols !== gridDims.cols || newDims.rows !== gridDims.rows;
      if (dimsChanged) {
        // Tear down + rebuild scene with the new grid
        if (raf) { cancelAnimationFrame(raf); raf = 0; }
        if (renderer && renderer.domElement && renderer.domElement.parentNode) {
          renderer.domElement.parentNode.removeChild(renderer.domElement);
        }
        if (renderer) renderer.dispose();
        scene = camera = renderer = null;
        cubes = [];
        gridDims = null;
        initScene();
      } else {
        renderer.setSize(stageRect.width, stageRect.height);
        fitCamera();
      }
    }, 110);
  }

  // ================================================================
  // Bootstrap
  // ================================================================
  function init() {
    modal = document.getElementById('cube-lab-modal');
    stage = document.getElementById('cube-lab-stage');
    ctaBtn = document.getElementById('cube-lab-cta');
    hintOverlay = document.getElementById('cube-lab-hint');
    closeBtn = modal && modal.querySelector('.cube-lab-close');
    if (!modal || !stage) return;

    if (ctaBtn) ctaBtn.addEventListener('click', openModal);

    modal.querySelectorAll('[data-cube-lab-close]').forEach((el) => {
      el.addEventListener('click', closeModal);
    });

    document.addEventListener('keydown', (e) => {
      if (!isOpen) return;
      if (e.key === 'Escape') { closeModal(); return; }
      if (e.key === 'Tab') trapFocus(e);
    });

    window.addEventListener('resize', onResize);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
