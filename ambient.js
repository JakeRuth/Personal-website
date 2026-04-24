/* Ambient background for the wizard — Rubik's cubes drifting on
   tracks. Muted palette so it never competes with the wizard chrome.
   Three.js via CDN. Honors prefers-reduced-motion. */
(function () {
  "use strict";

  if (typeof THREE === "undefined") {
    // Three failed to load (offline file:// on some setups). Fail silent.
    // The wizard still works fine without the backdrop.
    return;
  }

  const canvas = document.getElementById("ambient");
  if (!canvas) return;

  const reduceMotion = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // --- Renderer / scene / camera ---
  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
    alpha: true
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(window.innerWidth, window.innerHeight, false);
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  // Thin atmospheric fog so far-away cubes fade into the paper.
  scene.fog = new THREE.Fog(0xeef1f6, 22, 70);

  const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    120
  );
  camera.position.set(0, 0, 14);
  camera.lookAt(0, 0, 0);

  // --- Lighting: soft, even, no harsh specular. ---
  scene.add(new THREE.AmbientLight(0xffffff, 0.85));
  const key = new THREE.DirectionalLight(0xffffff, 0.45);
  key.position.set(4, 6, 8);
  scene.add(key);
  const fill = new THREE.DirectionalLight(0xc8d4ff, 0.25);
  fill.position.set(-6, -2, 4);
  scene.add(fill);

  // --- Build a single Rubik's cube as a Group of 27 mini-cubies. ---
  // Colors are intentionally desaturated so they never pop forward.
  const CUBE_COLORS = {
    U: 0xffffff,      // top - white
    D: 0xf3d96b,      // bottom - muted yellow
    F: 0x7fb77f,      // front - muted green
    B: 0x6c9ad6,      // back - muted blue
    R: 0xd98383,      // right - muted red / salmon
    L: 0xe5a86a       // left - muted orange
  };
  const BLACK = 0x1a1b1e;

  function makeCubie(x, y, z) {
    const size = 0.92;
    const gap = 0.04;
    const geo = new THREE.BoxGeometry(size, size, size);
    const materials = [
      new THREE.MeshLambertMaterial({ color: x ===  1 ? CUBE_COLORS.R : BLACK }),
      new THREE.MeshLambertMaterial({ color: x === -1 ? CUBE_COLORS.L : BLACK }),
      new THREE.MeshLambertMaterial({ color: y ===  1 ? CUBE_COLORS.U : BLACK }),
      new THREE.MeshLambertMaterial({ color: y === -1 ? CUBE_COLORS.D : BLACK }),
      new THREE.MeshLambertMaterial({ color: z ===  1 ? CUBE_COLORS.F : BLACK }),
      new THREE.MeshLambertMaterial({ color: z === -1 ? CUBE_COLORS.B : BLACK })
    ];
    const mesh = new THREE.Mesh(geo, materials);
    mesh.position.set(x * (size + gap), y * (size + gap), z * (size + gap));
    return mesh;
  }

  function makeRubiksCube() {
    const group = new THREE.Group();
    for (let x = -1; x <= 1; x++) {
      for (let y = -1; y <= 1; y++) {
        for (let z = -1; z <= 1; z++) {
          group.add(makeCubie(x, y, z));
        }
      }
    }
    return group;
  }

  // Tracks: lissajous-ish slow parametric curves. Different phases/scales
  // per cube so they never visibly sync up.
  function makeTrack(seed) {
    const rnd = mulberry32(seed);
    const ax = 7 + rnd() * 4;
    const ay = 3 + rnd() * 2.5;
    const az = 5 + rnd() * 3;
    const px = rnd() * Math.PI * 2;
    const py = rnd() * Math.PI * 2;
    const pz = rnd() * Math.PI * 2;
    const fx = 0.11 + rnd() * 0.08;
    const fy = 0.07 + rnd() * 0.06;
    const fz = 0.09 + rnd() * 0.07;
    const zOffset = -6 - rnd() * 18;
    const speed = 0.28 + rnd() * 0.25;
    return function (t) {
      const tt = t * speed;
      return {
        x: Math.sin(tt * fx * 6 + px) * ax,
        y: Math.sin(tt * fy * 6 + py) * ay,
        z: Math.sin(tt * fz * 6 + pz) * az * 0.4 + zOffset
      };
    };
  }

  // Deterministic small RNG so the scene feels stable across reloads.
  function mulberry32(a) {
    return function () {
      a |= 0;
      a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // --- Populate scene with N cubes ---
  const N_CUBES = 9;
  const cubes = [];
  for (let i = 0; i < N_CUBES; i++) {
    const mesh = makeRubiksCube();
    const rnd = mulberry32(1000 + i * 17);
    const spin = new THREE.Vector3(
      (rnd() - 0.5) * 0.25,
      (rnd() - 0.5) * 0.25,
      (rnd() - 0.5) * 0.18
    );
    mesh.rotation.set(rnd() * Math.PI, rnd() * Math.PI, rnd() * Math.PI);
    const scale = 0.55 + rnd() * 0.55;
    mesh.scale.setScalar(scale);
    scene.add(mesh);
    cubes.push({
      mesh: mesh,
      track: makeTrack(42 + i * 31),
      spin: spin,
      scale: scale
    });
  }

  // Canvas-level opacity keeps the backdrop soft behind the wizard.
  canvas.style.opacity = "0.22";

  function onResize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  window.addEventListener("resize", onResize);
  onResize();

  const start = performance.now();
  function tick() {
    const now = performance.now();
    const t = (now - start) / 1000;

    for (let i = 0; i < cubes.length; i++) {
      const c = cubes[i];
      const p = c.track(t);
      c.mesh.position.set(p.x, p.y, p.z);
      if (!reduceMotion) {
        c.mesh.rotation.x += c.spin.x * 0.006;
        c.mesh.rotation.y += c.spin.y * 0.006;
        c.mesh.rotation.z += c.spin.z * 0.006;
      }
    }

    renderer.render(scene, camera);
    requestAnimationFrame(tick);
  }

  if (reduceMotion) {
    for (let i = 0; i < cubes.length; i++) {
      const c = cubes[i];
      const p = c.track(0);
      c.mesh.position.set(p.x, p.y, p.z);
    }
    renderer.render(scene, camera);
    canvas.style.opacity = "0.16";
  } else {
    requestAnimationFrame(tick);
  }
})();
