/* ================================================================
   transition-cube.js — full-screen Rubik's cube transition animation

   Usage:
     TransitionCube.playTransition({
       onComplete: () => { ... },   // optional — called once animation ends
       destinationUrl: "/next",      // optional — if set, navigates on complete
       duration: 3200,               // optional — total timeline in ms (2500-4000)
     });

   What it does:
     1. Fades in a dark overlay with a large 3D Rubik's cube at the center.
     2. The cube arrives already rotating + scrambled; it plays back real
        solve moves (bidirectional BFS on the cubie model).
     3. Once solved, the cube shrinks while fading out — the destination
        page is revealed behind it.
     4. Calls onComplete() OR navigates to destinationUrl.

   Dependencies:
     - THREE.js loaded on window.THREE (component will load it if missing).
     - window.TransitionCubeSolver (cube-solver.js in this directory).

   Respects prefers-reduced-motion: falls back to a 600ms fade.
   ================================================================ */

(function (global) {
  "use strict";

  const THREE_CDN = "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js";
  const SOLVER_SRC_NAME = "cube-solver.js";

  // Premium, slightly desaturated sticker palette.
  // Same 6-color wheel; muted so nothing reads as kid-toy.
  const STICKER_COLORS = {
    W: 0xe8e8ea, // white
    Y: 0xe7c750, // yellow (softened)
    G: 0x2f9a5a, // green (slightly desaturated)
    B: 0x2f6fc0, // blue
    R: 0xc84236, // red (brick)
    O: 0xd0792c, // orange (amber-leaning)
  };
  const FRAME_COLOR = 0x0c0e12;        // deep charcoal — cubelet body
  const OVERLAY_BG  = "rgba(8,10,14,0.96)";

  // --- Public API ---------------------------------------------------------

  let inFlight = false;

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
      console.error("[transition-cube] dependency load failed:", err);
      reducedMotionFallback(onDone);
    });
  }

  function prefersReducedMotion() {
    return window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  // --- Dependency loading -------------------------------------------------

  function ensureDeps() {
    const ps = [];
    if (!global.THREE) ps.push(loadScript(THREE_CDN));
    if (!global.TransitionCubeSolver) ps.push(loadScript(resolveSolverSrc()));
    return Promise.all(ps);
  }

  function resolveSolverSrc() {
    // Look for our own script tag and resolve solver relative to it so the
    // component works whether included as ./transition-cube.js or from a
    // subfolder.
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

  // --- Reduced-motion fallback -------------------------------------------

  function reducedMotionFallback(onDone) {
    const overlay = makeOverlay();
    overlay.style.transition = "opacity 280ms ease";
    overlay.style.opacity = "0";
    document.body.appendChild(overlay);
    requestAnimationFrame(() => { overlay.style.opacity = "1"; });
    setTimeout(() => {
      overlay.style.opacity = "0";
      setTimeout(() => {
        overlay.remove();
        onDone();
      }, 320);
    }, 320);
  }

  // --- Overlay + stage ----------------------------------------------------

  function makeOverlay() {
    const el = document.createElement("div");
    el.className = "transition-cube-overlay";
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
      "backdrop-filter:blur(8px)",
      "-webkit-backdrop-filter:blur(8px)",
      "will-change:opacity",
    ].join(";");
    // Subtle radial vignette behind the cube
    const vignette = document.createElement("div");
    vignette.style.cssText = [
      "position:absolute",
      "inset:0",
      "background:radial-gradient(ellipse at center, rgba(30,40,60,0.18) 0%, rgba(0,0,0,0.0) 60%)",
      "pointer-events:none",
    ].join(";");
    el.appendChild(vignette);
    return el;
  }

  // --- Main animation ----------------------------------------------------

  function runAnimation(opts, onDone) {
    const Solver = global.TransitionCubeSolver;
    const THREE = global.THREE;

    const totalDuration = clamp(opts.duration || 3200, 2500, 4500);

    // Timeline breakdown (fractions of totalDuration):
    //   fadeIn: 0.00 - 0.18
    //   solve : 0.18 - 0.78
    //   fadeOut: 0.78 - 1.00
    const fadeInMs  = totalDuration * 0.18;
    const solveMs   = totalDuration * 0.60;
    const fadeOutMs = totalDuration * 0.22;

    // --- Build overlay + canvas --------------------------------------
    const overlay = makeOverlay();
    document.body.appendChild(overlay);

    const stage = document.createElement("div");
    stage.style.cssText = [
      "position:relative",
      "width:min(78vmin, 720px)",
      "height:min(78vmin, 720px)",
      "transform:scale(0.6)",
      "opacity:0",
      "will-change:transform,opacity",
      "transform-origin:center center",
    ].join(";");
    overlay.appendChild(stage);

    // Subtle soft shadow under the cube
    const shadow = document.createElement("div");
    shadow.style.cssText = [
      "position:absolute",
      "left:50%",
      "bottom:4%",
      "width:60%",
      "height:6%",
      "transform:translateX(-50%)",
      "background:radial-gradient(ellipse, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0) 70%)",
      "filter:blur(6px)",
      "pointer-events:none",
    ].join(";");
    stage.appendChild(shadow);

    // --- Three.js setup ----------------------------------------------
    const w = stage.clientWidth || 600;
    const h = stage.clientHeight || 600;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(28, w / h, 0.1, 100);
    camera.position.set(6.2, 4.8, 7.4);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio || 1);
    renderer.setSize(w, h);
    renderer.domElement.style.cssText = "width:100%;height:100%;display:block";
    stage.appendChild(renderer.domElement);

    const cubeGroup = new THREE.Group();
    scene.add(cubeGroup);

    // Build 27 cubelet bodies (charcoal, slightly matte).
    const bodyMat = new THREE.MeshBasicMaterial({ color: FRAME_COLOR });
    const bodySize = 0.96;
    const gap = 1.0;
    for (let x = -1; x <= 1; x++) {
      for (let y = -1; y <= 1; y++) {
        for (let z = -1; z <= 1; z++) {
          const geom = new THREE.BoxGeometry(bodySize, bodySize, bodySize);
          const mesh = new THREE.Mesh(geom, bodyMat);
          mesh.position.set(x * gap, y * gap, z * gap);
          cubeGroup.add(mesh);
        }
      }
    }

    // Sticker planes — 54 of them, rounded-corner look via a tiny inset.
    const stickerMeshes = buildStickers(THREE);
    stickerMeshes.forEach(s => cubeGroup.add(s.mesh));

    // Faint rim-highlight plane behind cube — gives premium product feel.
    const rim = new THREE.Mesh(
      new THREE.PlaneGeometry(7, 7),
      new THREE.MeshBasicMaterial({
        color: 0x3a5a8a, transparent: true, opacity: 0.08, side: THREE.DoubleSide,
      })
    );
    rim.position.set(0, 0, -4);
    scene.add(rim);

    // --- Cube facelet state ------------------------------------------
    let facelets = Solver.solvedFacelets();
    const scrambleMoves = Solver.randomScramble(7);
    Solver.applyFaceletMoves(facelets, scrambleMoves);
    repaintStickers(stickerMeshes, facelets);

    // Solve from the scrambled state.
    const solveMoves = Solver.solveFromFacelets(facelets) || [];

    // --- Animation loop state ----------------------------------------
    const startT = performance.now();
    const endT = startT + totalDuration;

    // Solve sub-timeline: evenly distribute moves across solveMs, but cap
    // per-move duration so we never drag. Min 60ms per move for readability.
    const nMoves = Math.max(1, solveMoves.length);
    const msPerMove = Math.max(60, Math.min(260, solveMs / nMoves));
    const solveStartT = startT + fadeInMs;
    const solveEndT = solveStartT + msPerMove * nMoves;
    const fadeOutStartT = endT - fadeOutMs;

    let moveIndex = 0;
    let currentMove = null; // { face, prime, startT, durMs, layerGroup, affected, axis, sign }
    let finished = false;

    function now() { return performance.now(); }

    function maybeStartNextMove(t) {
      if (currentMove) return;
      if (moveIndex >= solveMoves.length) return;
      const thisMoveStart = solveStartT + moveIndex * msPerMove;
      if (t < thisMoveStart) return;
      const m = solveMoves[moveIndex];
      startMove(m, thisMoveStart, msPerMove);
    }

    function startMove(moveStr, startAt, durMs) {
      const face = moveStr[0];
      const prime = moveStr.endsWith("'");
      const axisInfo = FACE_AXIS[face];
      const layerGroup = new THREE.Group();
      cubeGroup.add(layerGroup);
      const affected = [];
      cubeGroup.children.slice().forEach(child => {
        if (child === layerGroup) return;
        const p = child.position;
        if (axisInfo.test(p)) affected.push(child);
      });
      affected.forEach(c => { cubeGroup.remove(c); layerGroup.add(c); });
      currentMove = {
        moveStr, face, prime,
        layerGroup, affected,
        startT: startAt, durMs,
        axis: axisInfo.axis,
        target: (prime ? 1 : -1) * (Math.PI / 2) * axisInfo.sign,
      };
    }

    function tickMove(t) {
      if (!currentMove) return;
      const progress = clamp((t - currentMove.startT) / currentMove.durMs, 0, 1);
      const eased = easeInOutCubic(progress);
      const angle = currentMove.target * eased;
      currentMove.layerGroup.rotation[currentMove.axis] = angle;
      if (progress >= 1) {
        // Commit
        currentMove.affected.forEach(c => {
          currentMove.layerGroup.remove(c);
          cubeGroup.add(c);
          c.position.set(
            Math.round(c.position.x),
            Math.round(c.position.y),
            Math.round(c.position.z)
          );
          c.rotation.set(0, 0, 0);
        });
        cubeGroup.remove(currentMove.layerGroup);
        Solver.faceletTurn(facelets, currentMove.moveStr);
        repaintStickers(stickerMeshes, facelets);
        moveIndex++;
        currentMove = null;
      }
    }

    // Resize handling for responsive full-screen feel.
    function handleResize() {
      const nw = stage.clientWidth, nh = stage.clientHeight;
      if (!nw || !nh) return;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    }
    window.addEventListener("resize", handleResize);

    // Main frame loop
    function frame() {
      if (finished) return;
      const t = now();

      // === Overlay opacity (background dark fade) ===
      const tOverlay = clamp((t - startT) / (fadeInMs * 0.9), 0, 1);
      const tOverlayOut = clamp((t - fadeOutStartT) / fadeOutMs, 0, 1);
      const overlayOpacity = Math.min(
        easeOutCubic(tOverlay),
        1 - easeInCubic(tOverlayOut)
      );
      overlay.style.opacity = String(overlayOpacity);

      // === Stage transform (cube scale + opacity) ===
      // Fade in large: scale 0.60 -> 1.00, opacity 0 -> 1
      // Hold at 1.0 during solve
      // Fade out small: scale 1.00 -> 0.28, opacity 1 -> 0
      let scale, opacity;
      if (t < solveStartT) {
        const p = clamp((t - startT) / fadeInMs, 0, 1);
        const e = easeOutCubic(p);
        scale = lerp(0.58, 1.0, e);
        opacity = e;
      } else if (t < fadeOutStartT) {
        scale = 1.0;
        opacity = 1.0;
      } else {
        const p = clamp((t - fadeOutStartT) / fadeOutMs, 0, 1);
        const e = easeInCubic(p);
        scale = lerp(1.0, 0.24, e);
        opacity = 1 - e;
      }
      stage.style.transform = "scale(" + scale.toFixed(4) + ")";
      stage.style.opacity = opacity.toFixed(4);

      // === Cube rotation ===
      // Always rotating. During solve the rotation still plays — just a gentle
      // base spin so the camera feels alive.
      const spinBase = 0.0035; // radians per frame
      if (!currentMove) {
        cubeGroup.rotation.y += spinBase;
      } else {
        cubeGroup.rotation.y += spinBase * 0.7;
      }
      cubeGroup.rotation.x = -0.28 + Math.sin((t - startT) * 0.0008) * 0.12;

      // === Solve moves ===
      if (t >= solveStartT && t < solveEndT) {
        maybeStartNextMove(t);
        if (currentMove) tickMove(t);
      } else if (t >= solveEndT && currentMove) {
        // Make sure any in-flight move wraps cleanly.
        tickMove(t);
      }

      renderer.render(scene, camera);

      if (t >= endT) {
        finish();
        return;
      }
      requestAnimationFrame(frame);
    }

    function finish() {
      if (finished) return;
      finished = true;
      window.removeEventListener("resize", handleResize);
      // dispose three resources
      try {
        stickerMeshes.forEach(s => {
          s.mesh.geometry && s.mesh.geometry.dispose();
          s.mat && s.mat.dispose();
        });
        cubeGroup.traverse(obj => {
          if (obj.geometry) obj.geometry.dispose();
          if (obj.material && obj.material.dispose) obj.material.dispose();
        });
        renderer.dispose();
      } catch (e) { /* ignore */ }
      overlay.remove();
      onDone();
    }

    requestAnimationFrame(frame);
  }

  // --- Helpers -----------------------------------------------------------

  // Which layer a face-turn affects, and rotation axis.
  const FACE_AXIS = {
    U: { axis: 'y', sign: +1, test: p => p.y >  0.5 },
    D: { axis: 'y', sign: -1, test: p => p.y < -0.5 },
    F: { axis: 'z', sign: +1, test: p => p.z >  0.5 },
    B: { axis: 'z', sign: -1, test: p => p.z < -0.5 },
    R: { axis: 'x', sign: +1, test: p => p.x >  0.5 },
    L: { axis: 'x', sign: -1, test: p => p.x < -0.5 },
  };

  function buildStickers(THREE) {
    const list = [];
    const stSize = 0.86; // slightly smaller than cubelet body -> visible black border
    const half = 1.5;
    function addFace(faceId) {
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
          const idx = r * 3 + c;
          const geom = new THREE.PlaneGeometry(stSize, stSize);
          const mat = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
          const mesh = new THREE.Mesh(geom, mat);
          const cc = c - 1;
          const rr = r - 1;
          switch (faceId) {
            case 0: // U: +Y
              mesh.position.set(cc, half, -rr);
              mesh.rotation.x = -Math.PI / 2;
              break;
            case 3: // D: -Y
              mesh.position.set(cc, -half, rr);
              mesh.rotation.x = Math.PI / 2;
              break;
            case 2: // F: +Z
              mesh.position.set(cc, -rr, half);
              break;
            case 5: // B: -Z
              mesh.position.set(-cc, -rr, -half);
              mesh.rotation.y = Math.PI;
              break;
            case 1: // R: +X
              mesh.position.set(half, -rr, -cc);
              mesh.rotation.y = Math.PI / 2;
              break;
            case 4: // L: -X
              mesh.position.set(-half, -rr, cc);
              mesh.rotation.y = -Math.PI / 2;
              break;
          }
          list.push({ face: faceId, idx, mesh, mat });
        }
      }
    }
    addFace(0); addFace(1); addFace(2); addFace(3); addFace(4); addFace(5);
    return list;
  }

  function repaintStickers(stickerMeshes, facelets) {
    for (const s of stickerMeshes) {
      const col = facelets[s.face][s.idx];
      s.mat.color.setHex(STICKER_COLORS[col] || 0x888888);
    }
  }

  function lerp(a, b, t) { return a + (b - a) * t; }
  function clamp(x, lo, hi) { return Math.max(lo, Math.min(hi, x)); }
  function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }
  function easeInCubic(t) { return t * t * t; }
  function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  // Expose.
  global.TransitionCube = {
    playTransition,
  };
})(typeof window !== "undefined" ? window : globalThis);
