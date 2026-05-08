/* octocube.js — README-medium Rubik's cube widget.
   Six faces, all the GitHub Octocat, six different brand-color
   backgrounds. Each cubie owns its stickers. A face turn re-parents
   the slice's cubies into a temporary Group, animates a 90deg
   rotation, then re-attaches them to cubeGroup preserving the
   resulting world transform, so stickers physically travel with the
   cubies and stay in place. CubeSolver facelets track logical state
   for the solver only. */

(function () {
  'use strict';

  // Order matches CubeSolver face indices: U=0, R=1, F=2, D=3, L=4, B=5.
  // We render each face in a different GitHub-y color so the solved
  // state is six solid Octocat panels.
  const FACES = [
    { id: 'U', label: 'Top',    bg: '#58a6ff', fg: '#0d1117' }, // blue
    { id: 'R', label: 'Right',  bg: '#3fb950', fg: '#0d1117' }, // green
    { id: 'F', label: 'Front',  bg: '#f0f6fc', fg: '#1f2328' }, // white
    { id: 'D', label: 'Bottom', bg: '#f1e05a', fg: '#1a1a1a' }, // yellow
    { id: 'L', label: 'Left',   bg: '#a371f7', fg: '#0d1117' }, // purple
    { id: 'B', label: 'Back',   bg: '#f85149', fg: '#0d1117' }, // red
  ];

  const OCTOCAT_PATH = 'M8 0C3.58 0 0 3.58 0 8a8 8 0 0 0 5.47 7.59c.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z';

  const TEX_CACHE = new Array(6).fill(null);

  function makeFaceTexture(faceId, size = 256) {
    if (TEX_CACHE[faceId]) return TEX_CACHE[faceId];
    const f = FACES[faceId];
    const cv = document.createElement('canvas');
    cv.width = cv.height = size;
    const ctx = cv.getContext('2d');
    ctx.fillStyle = f.bg;
    const pad = size * 0.04;
    roundRect(ctx, pad, pad, size - 2 * pad, size - 2 * pad, size * 0.10);
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.18)';
    ctx.lineWidth = size * 0.018;
    roundRect(ctx, pad, pad, size - 2 * pad, size - 2 * pad, size * 0.10);
    ctx.stroke();
    ctx.fillStyle = f.fg;
    const iconScale = size / 16 * 0.55;
    ctx.save();
    ctx.translate(size / 2 - 8 * iconScale, size / 2 - 8 * iconScale);
    ctx.scale(iconScale, iconScale);
    ctx.fill(new Path2D(OCTOCAT_PATH), 'evenodd');
    ctx.restore();
    const tex = new THREE.CanvasTexture(cv);
    tex.anisotropy = 4;
    TEX_CACHE[faceId] = tex;
    return tex;
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  // -------------------------------------------------------------
  // Cube instance
  // -------------------------------------------------------------
  function buildCube(stage) {
    const w = stage.clientWidth || 320, h = stage.clientHeight || 320;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(28, w / h, 0.1, 100);
    // Camera distance scales with the narrower viewport dimension so
    // the cube always fits comfortably within the canvas, regardless
    // of aspect. The base direction (north-east-up corner view) is
    // fixed; only the zoom-out distance changes.
    fitCamera(camera, w, h);

    function fitCamera(cam, ww, hh) {
      const aspect = ww / hh;
      // Reference aspect we tuned the canonical (5.5, 4.6, 6.8) view
      // for: wide-ish landscape (~1.5). On narrower aspects (mobile
      // portrait-ish stages), pull back to keep the cube in frame.
      const REF_ASPECT = 1.5;
      const k = aspect < REF_ASPECT ? Math.max(1, REF_ASPECT / aspect) : 1;
      cam.position.set(5.5 * k, 4.6 * k, 6.8 * k);
      cam.lookAt(0, 0, 0);
    }

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio || 1);
    renderer.setSize(w, h);
    stage.innerHTML = '';
    stage.appendChild(renderer.domElement);

    const worldGroup = new THREE.Group();
    scene.add(worldGroup);
    const cubeGroup = new THREE.Group();
    worldGroup.add(cubeGroup);

    const facelets = window.CubeSolver.solvedFacelets();

    const bodyMat = new THREE.MeshBasicMaterial({ color: 0x0d1117 });
    const bodyGeo = new THREE.BoxGeometry(0.97, 0.97, 0.97);
    const stGeo = new THREE.PlaneGeometry(0.92, 0.92);
    const STICKER_OFFSET = 0.501;

    const cubies = [];

    function makeStickerMesh(faceIdx) {
      const mat = new THREE.MeshBasicMaterial({
        map: makeFaceTexture(faceIdx),
        color: 0xffffff,
        side: THREE.FrontSide,
        transparent: false,
      });
      return new THREE.Mesh(stGeo, mat);
    }

    function buildCubies() {
      for (const c of cubies) {
        c.traverse((o) => {
          if (o.material && o.material !== bodyMat) o.material.dispose();
        });
      }
      cubeGroup.clear();
      cubies.length = 0;

      for (let x = -1; x <= 1; x++) {
        for (let y = -1; y <= 1; y++) {
          for (let z = -1; z <= 1; z++) {
            const cubie = new THREE.Group();
            cubie.position.set(x, y, z);
            cubie.userData.kind = 'cubie';

            cubie.add(new THREE.Mesh(bodyGeo, bodyMat));

            if (y === 1) {
              const s = makeStickerMesh(0);
              s.position.set(0, STICKER_OFFSET, 0);
              s.rotation.x = -Math.PI / 2;
              cubie.add(s);
            }
            if (x === 1) {
              const s = makeStickerMesh(1);
              s.position.set(STICKER_OFFSET, 0, 0);
              s.rotation.y = Math.PI / 2;
              cubie.add(s);
            }
            if (z === 1) {
              const s = makeStickerMesh(2);
              s.position.set(0, 0, STICKER_OFFSET);
              cubie.add(s);
            }
            if (y === -1) {
              const s = makeStickerMesh(3);
              s.position.set(0, -STICKER_OFFSET, 0);
              s.rotation.x = Math.PI / 2;
              cubie.add(s);
            }
            if (x === -1) {
              const s = makeStickerMesh(4);
              s.position.set(-STICKER_OFFSET, 0, 0);
              s.rotation.y = -Math.PI / 2;
              cubie.add(s);
            }
            if (z === -1) {
              const s = makeStickerMesh(5);
              s.position.set(0, 0, -STICKER_OFFSET);
              s.rotation.y = Math.PI;
              cubie.add(s);
            }

            cubeGroup.add(cubie);
            cubies.push(cubie);
          }
        }
      }
    }
    buildCubies();

    // -------------------------------------------------------------
    // Animated face turn. Move a slice's cubies into a temporary
    // Group, animate the rotation, then attach() each back to
    // cubeGroup so the new world transform persists. No snap-back,
    // no repaint, no orphaned stickers — the geometry IS the state.
    // -------------------------------------------------------------
    const FACE_AXIS = { U: 'y', D: 'y', R: 'x', L: 'x', F: 'z', B: 'z' };
    const FACE_SIGN = { U: +1, D: -1, R: +1, L: -1, F: +1, B: -1 };

    let busy = false;
    function applyMoveAnimated(move, durMs) {
      if (busy) return Promise.resolve();
      busy = true;
      return new Promise((resolve) => {
        const face = move[0];
        const prime = move.endsWith("'");
        const axis = FACE_AXIS[face];
        const sign = FACE_SIGN[face];
        const target = (prime ? +Math.PI / 2 : -Math.PI / 2) * sign;

        const slice = new THREE.Group();
        cubeGroup.add(slice);
        const tol = 0.4;
        cubies.forEach((cubie) => {
          if (Math.abs(cubie.position[axis] - sign) < tol) {
            slice.attach(cubie);
          }
        });

        const startT = performance.now();
        const ease = (t) => {
          // easeInOutCubic — smoother on both ends than easeOut
          return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
        };
        function tick(now) {
          const t = Math.min(1, (now - startT) / durMs);
          slice.rotation[axis] = target * ease(t);
          if (t < 1) {
            requestAnimationFrame(tick);
          } else {
            slice.rotation[axis] = target;
            const kids = slice.children.slice();
            kids.forEach((c) => {
              cubeGroup.attach(c);
              c.position.x = Math.round(c.position.x);
              c.position.y = Math.round(c.position.y);
              c.position.z = Math.round(c.position.z);
            });
            cubeGroup.remove(slice);
            window.CubeSolver.applyFaceletMoves(facelets, [move]);
            busy = false;
            resolve();
          }
        }
        requestAnimationFrame(tick);
      });
    }

    async function applyMoves(moves, perMove) {
      for (const m of moves) {
        if (!m) continue;
        await applyMoveAnimated(m, perMove);
      }
    }

    function invertMoves(moves) {
      // Reverse the sequence and flip each move's direction.
      // Solver convention: `F` is CW, `F'` is CCW.
      const out = [];
      for (let i = moves.length - 1; i >= 0; i--) {
        const m = moves[i];
        out.push(m.endsWith("'") ? m[0] : m + "'");
      }
      return out;
    }

    // Track the last scramble so Solve can replay it in reverse. The
    // bidirectional-BFS solver bottoms out around 9-move paths, so
    // 22-move scrambles would return null. Inverting the recorded
    // scramble always works and keeps the animation honest (every
    // move physically un-does what was done).
    let lastScramble = [];

    function reset() {
      buildCubies();
      const fresh = window.CubeSolver.solvedFacelets();
      for (let i = 0; i < 6; i++) for (let j = 0; j < 9; j++) facelets[i][j] = fresh[i][j];
      lastScramble = [];
    }

    // -------------------------------------------------------------
    // Idle rotation + drag
    // -------------------------------------------------------------
    let raf = 0;
    let userInteracting = false;
    let dragStart = null;
    let baseRotY = 0;
    let cooldownTimer = 0;
    function loop() {
      raf = requestAnimationFrame(loop);
      if (!userInteracting && !busy) {
        baseRotY += 0.0028;
        worldGroup.rotation.y = baseRotY;
        worldGroup.rotation.x = Math.sin(performance.now() * 0.00012) * 0.08 - 0.32;
      }
      renderer.render(scene, camera);
    }
    loop();

    function onResize() {
      const ww = stage.clientWidth, hh = stage.clientHeight;
      if (!ww || !hh) return;
      camera.aspect = ww / hh;
      fitCamera(camera, ww, hh);
      camera.updateProjectionMatrix();
      renderer.setSize(ww, hh);
    }
    const ro = new ResizeObserver(onResize);
    ro.observe(stage);

    const cv = renderer.domElement;
    cv.style.cursor = 'grab';
    cv.style.touchAction = 'none';   // stop touch scroll hijacking the drag
    cv.style.userSelect = 'none';
    cv.style.webkitUserSelect = 'none';
    cv.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      // Cancel any pending "resume auto-rotate" timer from a prior
      // drag, otherwise it can fire during this drag and let the loop
      // overwrite the user's rotation mid-gesture.
      if (cooldownTimer) { clearTimeout(cooldownTimer); cooldownTimer = 0; }
      userInteracting = true;
      dragStart = { x: e.clientX, y: e.clientY, rx: worldGroup.rotation.x, ry: worldGroup.rotation.y };
      cv.style.cursor = 'grabbing';
      try { cv.setPointerCapture(e.pointerId); } catch (_e) {}
    });
    cv.addEventListener('pointermove', (e) => {
      if (!dragStart) return;
      worldGroup.rotation.y = dragStart.ry + (e.clientX - dragStart.x) * 0.01;
      worldGroup.rotation.x = dragStart.rx + (e.clientY - dragStart.y) * 0.01;
    });
    function endDrag(e) {
      if (!dragStart) return;
      baseRotY = worldGroup.rotation.y;
      dragStart = null;
      cv.style.cursor = 'grab';
      try { if (e && e.pointerId != null) cv.releasePointerCapture(e.pointerId); } catch (_e) {}
      if (cooldownTimer) clearTimeout(cooldownTimer);
      cooldownTimer = setTimeout(() => {
        userInteracting = false;
        cooldownTimer = 0;
      }, 1500);
    }
    // No pointerleave: with setPointerCapture, the cursor can cross
    // out of the canvas during a normal drag and pointerleave would
    // kill the gesture mid-motion.
    cv.addEventListener('pointerup', endDrag);
    cv.addEventListener('pointercancel', endDrag);

    return {
      stage,
      renderer,
      scramble() {
        if (busy) return;
        const moves = window.CubeSolver.randomScramble(22);
        lastScramble = moves.slice();
        return applyMoves(moves, 140);
      },
      solve() {
        if (busy) return;
        let moves;
        if (lastScramble.length) {
          moves = invertMoves(lastScramble);
          lastScramble = [];
        } else {
          try { moves = window.CubeSolver.solveFromFacelets(facelets); }
          catch (_e) { moves = []; }
        }
        if (!moves || !moves.length) return Promise.resolve();
        return applyMoves(moves, 130);
      },
      reset,
      isBusy() { return busy; },
      dispose() {
        cancelAnimationFrame(raf);
        ro.disconnect();
        renderer.dispose();
      },
    };
  }

  // -------------------------------------------------------------
  // Public API: app.js calls these from the tab handler.
  // -------------------------------------------------------------
  let current = null;

  function mount() {
    if (!window.THREE || !window.CubeSolver) return null;
    const stage = document.getElementById('ghCubeStage');
    if (!stage) return null;
    if (current && current.stage === stage) return current;
    if (current) current.dispose();
    current = buildCube(stage);
    return current;
  }
  function unmount() {
    if (current) { current.dispose(); current = null; }
    const stage = document.getElementById('ghCubeStage');
    if (stage) stage.innerHTML = '';
  }
  function action(name) {
    if (!current) mount();
    if (!current) return;
    if (name === 'scramble') current.scramble();
    else if (name === 'solve') current.solve();
    else if (name === 'reset') current.reset();
  }
  function legendData() { return FACES.slice(); }

  window.GhCube = { mount, unmount, action, legendData };
})();
