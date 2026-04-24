/* Rubik's Cube modal — simplified Three.js cube for the enterprise concept.
   Loaded on demand (when the user opens the integration).
*/
import * as THREE from "three";

const stage = document.getElementById("cube-stage");
if (stage) {
  let built = false;
  let renderer, scene, camera, cubeGroup, cubies, animReq;
  let isAnimatingSlice = false;
  let moveHistory = [];

  const FACE_COLORS = {
    U: 0xe8e4d8, D: 0xd9b64a, F: 0xb94a3c,
    B: 0xc87a3a, L: 0x3e8a5c, R: 0x3a6aa8,
  };
  const INSIDE_COLOR = 0x0a0a0f;

  function build() {
    const w = stage.clientWidth, h = stage.clientHeight;
    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(40, w / h, 0.1, 100);
    camera.position.set(5.6, 4.8, 6.8);
    camera.lookAt(0, 0, 0);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(w, h);
    stage.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 0.52));
    const key = new THREE.DirectionalLight(0xffeed1, 0.8);
    key.position.set(6, 9, 7);
    scene.add(key);
    const fill = new THREE.DirectionalLight(0x9ab7ff, 0.35);
    fill.position.set(-5, 2, -3);
    scene.add(fill);

    cubeGroup = new THREE.Group();
    scene.add(cubeGroup);
    cubies = [];
    for (let x = -1; x <= 1; x++) {
      for (let y = -1; y <= 1; y++) {
        for (let z = -1; z <= 1; z++) {
          const mats = materialsFor(x, y, z);
          const mesh = new THREE.Mesh(new THREE.BoxGeometry(0.96, 0.96, 0.96), mats);
          mesh.position.set(x, y, z);
          cubeGroup.add(mesh);
          cubies.push(mesh);
        }
      }
    }

    window.addEventListener("resize", onResize);
    // drag
    stage.addEventListener("pointerdown", onDown);

    built = true;
    loop();
  }

  function materialsFor(x, y, z) {
    const faces = [
      { dir: "R", outside: x === 1 },
      { dir: "L", outside: x === -1 },
      { dir: "U", outside: y === 1 },
      { dir: "D", outside: y === -1 },
      { dir: "F", outside: z === 1 },
      { dir: "B", outside: z === -1 },
    ];
    return faces.map(f => new THREE.MeshStandardMaterial({
      color: f.outside ? FACE_COLORS[f.dir] : INSIDE_COLOR,
      roughness: 0.55,
      metalness: 0.05,
    }));
  }

  function onResize() {
    if (!renderer) return;
    const w = stage.clientWidth, h = stage.clientHeight;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }

  // drag to rotate
  let dragging = false, lx = 0, ly = 0;
  let theta = Math.atan2(camera && camera.position.x || 0, camera && camera.position.z || 1);
  let phi = 1.0;
  let radius = 9;
  function onDown(e) { dragging = true; lx = e.clientX; ly = e.clientY; window.addEventListener("pointermove", onMove); window.addEventListener("pointerup", onUp); }
  function onMove(e) {
    if (!dragging) return;
    const dx = e.clientX - lx, dy = e.clientY - ly;
    lx = e.clientX; ly = e.clientY;
    theta -= dx * 0.008;
    phi = Math.max(0.25, Math.min(Math.PI - 0.25, phi - dy * 0.008));
    camera.position.set(
      radius * Math.sin(phi) * Math.sin(theta),
      radius * Math.cos(phi),
      radius * Math.sin(phi) * Math.cos(theta)
    );
    camera.lookAt(0, 0, 0);
  }
  function onUp() { dragging = false; window.removeEventListener("pointermove", onMove); window.removeEventListener("pointerup", onUp); }

  function loop() {
    animReq = requestAnimationFrame(loop);
    if (!dragging) {
      theta += 0.002;
      camera.position.set(
        radius * Math.sin(phi) * Math.sin(theta),
        radius * Math.cos(phi),
        radius * Math.sin(phi) * Math.cos(theta)
      );
      camera.lookAt(0, 0, 0);
    }
    renderer.render(scene, camera);
  }

  // --- slice rotations ---
  const AXES = { x: new THREE.Vector3(1, 0, 0), y: new THREE.Vector3(0, 1, 0), z: new THREE.Vector3(0, 0, 1) };
  function cubiesInSlice(axis, layer) {
    const arr = [];
    for (const c of cubies) {
      const v = axis === "x" ? c.position.x : axis === "y" ? c.position.y : c.position.z;
      if (Math.round(v) === layer) arr.push(c);
    }
    return arr;
  }
  function snap(obj) {
    const e = new THREE.Euler().setFromQuaternion(obj.quaternion, "XYZ");
    const q = Math.PI / 2;
    e.x = Math.round(e.x / q) * q;
    e.y = Math.round(e.y / q) * q;
    e.z = Math.round(e.z / q) * q;
    obj.quaternion.setFromEuler(e);
  }
  function rotateSlice(axis, layer, dir, duration = 220) {
    return new Promise(resolve => {
      if (isAnimatingSlice) return resolve();
      isAnimatingSlice = true;
      const pivot = new THREE.Group();
      scene.add(pivot);
      const group = cubiesInSlice(axis, layer);
      for (const c of group) pivot.attach(c);
      const start = performance.now();
      const angle = (Math.PI / 2) * dir;
      (function step() {
        const t = Math.min(1, (performance.now() - start) / duration);
        const e = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
        pivot.setRotationFromAxisAngle(AXES[axis], angle * e);
        if (t < 1) requestAnimationFrame(step);
        else {
          for (const c of [...pivot.children]) {
            cubeGroup.attach(c);
            c.position.x = Math.round(c.position.x);
            c.position.y = Math.round(c.position.y);
            c.position.z = Math.round(c.position.z);
            snap(c);
          }
          scene.remove(pivot);
          isAnimatingSlice = false;
          resolve();
        }
      })();
    });
  }
  const ALL_MOVES = [
    ["x", 1, 1], ["x", 1, -1], ["x", -1, 1], ["x", -1, -1],
    ["y", 1, 1], ["y", 1, -1], ["y", -1, 1], ["y", -1, -1],
    ["z", 1, 1], ["z", 1, -1], ["z", -1, 1], ["z", -1, -1],
  ];
  async function scramble(n = 14) {
    moveHistory = [];
    for (let i = 0; i < n; i++) {
      const m = ALL_MOVES[Math.floor(Math.random() * ALL_MOVES.length)];
      moveHistory.push(m);
      await rotateSlice(m[0], m[1], m[2], 120);
    }
  }
  async function solveAnim() {
    if (!moveHistory.length) { await scramble(12); await new Promise(r => setTimeout(r, 180)); }
    const rev = [...moveHistory].reverse();
    for (const [a, l, d] of rev) await rotateSlice(a, l, -d, 180);
    moveHistory = [];
  }

  // Wire up cube-modal controls
  document.getElementById("cube-scramble").addEventListener("click", async () => { if (!isAnimatingSlice) await scramble(14); });
  document.getElementById("cube-solve").addEventListener("click", async () => { if (!isAnimatingSlice) await solveAnim(); });

  // Open cube modal on request
  document.addEventListener("ruth:open-cube", () => {
    const m = document.getElementById("cube-modal");
    if (!built) build();
    window.__ruthShowModal(m);
    // resize after layout
    setTimeout(onResize, 50);
    // auto-scramble on first open
    if (moveHistory.length === 0 && !isAnimatingSlice) {
      setTimeout(() => scramble(10), 350);
    }
  });
}
