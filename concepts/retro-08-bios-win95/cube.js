/* ==========================================================
 * Cube.exe - Three.js ambient-solving Rubik's cube
 * Embedded inside a Win95 window body.
 * ========================================================== */

import * as THREE from 'three';

let renderer, scene, camera, group, raf = null, host = null;
let stickers = [];
let rotating = false;
let nextMoveAt = 0;

const COLORS = {
  U: 0xffffff, // white
  D: 0xffff00, // yellow
  F: 0x2bc24a, // green
  B: 0x1a76e0, // blue
  L: 0xff9a1f, // orange
  R: 0xff2222  // red
};

function buildCube() {
  group = new THREE.Group();
  const size = 0.95;
  const gap = 0.05;
  const off = size + gap;
  const half = 1;

  const plastic = new THREE.MeshStandardMaterial({
    color: 0x111111, roughness: 0.8, metalness: 0.1
  });

  for (let x = -1; x <= 1; x++) {
    for (let y = -1; y <= 1; y++) {
      for (let z = -1; z <= 1; z++) {
        const cubie = new THREE.Group();
        const core = new THREE.Mesh(
          new THREE.BoxGeometry(size, size, size),
          plastic
        );
        cubie.add(core);

        // Stickers are flat planes attached to visible faces
        const addSticker = (nx, ny, nz, color) => {
          const mat = new THREE.MeshBasicMaterial({ color });
          const geo = new THREE.PlaneGeometry(size * 0.82, size * 0.82);
          const m = new THREE.Mesh(geo, mat);
          const d = size / 2 + 0.001;
          m.position.set(nx * d, ny * d, nz * d);
          if (nx !== 0) m.rotation.y = nx > 0 ?  Math.PI / 2 : -Math.PI / 2;
          if (ny !== 0) m.rotation.x = ny > 0 ? -Math.PI / 2 :  Math.PI / 2;
          if (nz !== 0 && nz < 0) m.rotation.y = Math.PI;
          cubie.add(m);
          stickers.push(m);
        };

        if (x === 1)  addSticker( 1, 0, 0, COLORS.R);
        if (x === -1) addSticker(-1, 0, 0, COLORS.L);
        if (y === 1)  addSticker( 0, 1, 0, COLORS.U);
        if (y === -1) addSticker( 0,-1, 0, COLORS.D);
        if (z === 1)  addSticker( 0, 0, 1, COLORS.F);
        if (z === -1) addSticker( 0, 0,-1, COLORS.B);

        cubie.position.set(x * off, y * off, z * off);
        cubie.userData = { x, y, z };
        group.add(cubie);
      }
    }
  }

  scene.add(group);
}

function init() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0a0a14);

  const w = host.clientWidth || 320;
  const h = host.clientHeight || 320;
  camera = new THREE.PerspectiveCamera(35, w / h, 0.1, 100);
  camera.position.set(6, 5, 7);
  camera.lookAt(0, 0, 0);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio));
  renderer.setSize(w, h);
  host.innerHTML = '';
  host.appendChild(renderer.domElement);

  const amb = new THREE.AmbientLight(0xffffff, 0.65);
  scene.add(amb);
  const dir = new THREE.DirectionalLight(0xffffff, 0.7);
  dir.position.set(5, 8, 6);
  scene.add(dir);
  const fill = new THREE.DirectionalLight(0x8aa0ff, 0.35);
  fill.position.set(-6, -3, -4);
  scene.add(fill);

  buildCube();

  window.addEventListener('resize', onResize);
  animate();
}

function onResize() {
  if (!renderer || !host) return;
  const w = host.clientWidth;
  const h = host.clientHeight;
  if (!w || !h) return;
  renderer.setSize(w, h);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}

/* ---------- layer rotation ---------- */

const AXIS = {
  U: { axis: 'y', layer:  1, dir: -1 },
  D: { axis: 'y', layer: -1, dir:  1 },
  R: { axis: 'x', layer:  1, dir: -1 },
  L: { axis: 'x', layer: -1, dir:  1 },
  F: { axis: 'z', layer:  1, dir: -1 },
  B: { axis: 'z', layer: -1, dir:  1 },
};

const MOVES = ['U', 'D', 'R', 'L', 'F', 'B'];

function pickMove() {
  const face = MOVES[Math.floor(Math.random() * MOVES.length)];
  const prime = Math.random() < 0.5;
  return { face, prime };
}

function rotateLayer(face, prime, durationMs = 320) {
  if (rotating) return;
  const info = AXIS[face];
  const axisVec = new THREE.Vector3(
    info.axis === 'x' ? 1 : 0,
    info.axis === 'y' ? 1 : 0,
    info.axis === 'z' ? 1 : 0
  );
  const target = (Math.PI / 2) * info.dir * (prime ? -1 : 1);

  // Select cubies in that layer based on world-space position
  const layerGroup = new THREE.Group();
  scene.add(layerGroup);

  const selected = [];
  group.children.forEach(cubie => {
    const p = cubie.position;
    const coord = info.axis === 'x' ? p.x : info.axis === 'y' ? p.y : p.z;
    const layerCoord = info.layer * 1.0; // offset ~= 1
    if (Math.abs(coord - layerCoord) < 0.6) {
      selected.push(cubie);
    }
  });
  selected.forEach(c => layerGroup.attach(c));

  rotating = true;
  const t0 = performance.now();
  function step() {
    const t = Math.min(1, (performance.now() - t0) / durationMs);
    const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    layerGroup.setRotationFromAxisAngle(axisVec, target * eased);
    if (t < 1) {
      requestAnimationFrame(step);
    } else {
      layerGroup.setRotationFromAxisAngle(axisVec, target);
      // reparent back into group and snap positions
      selected.forEach(c => {
        group.attach(c);
        c.position.x = Math.round(c.position.x);
        c.position.y = Math.round(c.position.y);
        c.position.z = Math.round(c.position.z);
        c.rotation.x = snapAngle(c.rotation.x);
        c.rotation.y = snapAngle(c.rotation.y);
        c.rotation.z = snapAngle(c.rotation.z);
      });
      scene.remove(layerGroup);
      rotating = false;
    }
  }
  step();
}

function snapAngle(a) {
  const q = Math.PI / 2;
  return Math.round(a / q) * q;
}

/* ---------- render loop ---------- */

function animate(now = 0) {
  raf = requestAnimationFrame(animate);
  if (!group) return;

  // gentle orbit
  group.rotation.y += 0.003;
  group.rotation.x = Math.sin(now * 0.0003) * 0.12 + 0.3;

  if (!rotating && now > nextMoveAt) {
    const mv = pickMove();
    rotateLayer(mv.face, mv.prime, 380);
    nextMoveAt = now + 1400 + Math.random() * 1200;
  }

  renderer.render(scene, camera);
}

function teardown() {
  if (raf) cancelAnimationFrame(raf);
  raf = null;
  if (renderer) {
    renderer.dispose();
    renderer.domElement.remove();
  }
  scene = null;
  group = null;
  stickers = [];
  rotating = false;
}

window.addEventListener('cube-open', (e) => {
  host = e.detail.host;
  if (!host) return;
  teardown();
  // wait a tick for layout
  requestAnimationFrame(() => {
    try { init(); }
    catch (err) {
      console.error('cube init failed', err);
      if (host) {
        host.innerHTML = '<div style="color:#f7b300;font-family:VT323,monospace;' +
          'padding:12px;font-size:18px;">WebGL unavailable.\nCube.exe failed to start.</div>';
      }
    }
  });
});

window.addEventListener('cube-close', () => {
  teardown();
  host = null;
});

window.addEventListener('resize', onResize);
