import * as THREE from "three";

/* =========================================================================
   Jake Ruth — Rubik's Cube homepage prototype (Concept 04)
   Vanilla Three.js via importmap, no build.
   ========================================================================= */

// ---------- Palette (slightly desaturated classic cube) --------------------
const FACE_COLORS = {
  U: 0xe8e4d8, // top    - white
  D: 0xd9b64a, // bottom - yellow
  F: 0xb94a3c, // front  - red
  B: 0xc87a3a, // back   - orange
  L: 0x3e8a5c, // left   - green
  R: 0x3a6aa8, // right  - blue
};
const INSIDE_COLOR = 0x0a0a0f;

// Face -> section label mapping (required by brief)
const FACE_LABELS = {
  F: "ABOUT",
  B: "CAREER",
  U: "STOCK UNLOCK",
  D: "PROJECTS",
  L: "HOBBIES",
  R: "CONTACT",
};

// Camera target positions (unit vectors * DIST) for each face
const DIST = 7.5;
const FACE_VIEW = {
  F: new THREE.Vector3( 0,  0,  1).multiplyScalar(DIST),
  B: new THREE.Vector3( 0,  0, -1).multiplyScalar(DIST),
  U: new THREE.Vector3( 0,  1,  0).multiplyScalar(DIST).add(new THREE.Vector3(0,0,0.001)),
  D: new THREE.Vector3( 0, -1,  0).multiplyScalar(DIST).add(new THREE.Vector3(0,0,0.001)),
  L: new THREE.Vector3(-1,  0,  0).multiplyScalar(DIST),
  R: new THREE.Vector3( 1,  0,  0).multiplyScalar(DIST),
};

// Default "hero" camera position — shows 3 faces
const HERO_POS = new THREE.Vector3(5.2, 4.6, 6.4);

// ---------- Scene -----------------------------------------------------------
const root = document.getElementById("root");
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  42, window.innerWidth / window.innerHeight, 0.1, 100
);
camera.position.copy(HERO_POS);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
root.appendChild(renderer.domElement);

// Lights — three-point-ish
const ambient = new THREE.AmbientLight(0xffffff, 0.42);
scene.add(ambient);

const keyLight = new THREE.DirectionalLight(0xffeed1, 0.85);
keyLight.position.set(6, 9, 7);
keyLight.castShadow = true;
keyLight.shadow.mapSize.set(1024, 1024);
keyLight.shadow.camera.near = 1;
keyLight.shadow.camera.far = 30;
keyLight.shadow.camera.left = -6;
keyLight.shadow.camera.right = 6;
keyLight.shadow.camera.top = 6;
keyLight.shadow.camera.bottom = -6;
scene.add(keyLight);

const fillLight = new THREE.DirectionalLight(0x9ab7ff, 0.35);
fillLight.position.set(-5, 2, -3);
scene.add(fillLight);

const rimLight = new THREE.PointLight(0xf6c94a, 0.3, 30);
rimLight.position.set(0, -4, -6);
scene.add(rimLight);

// Shadow-catcher ground
const groundMat = new THREE.ShadowMaterial({ opacity: 0.38 });
const ground = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), groundMat);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -3.2;
ground.receiveShadow = true;
scene.add(ground);

// ---------- Build cubies ----------------------------------------------------
/**
 * A 3x3x3 Rubik's cube. Each cubie is a 0.96-sized box with 6-material array.
 * Order of BoxGeometry materials: +x(R), -x(L), +y(U), -y(D), +z(F), -z(B)
 */
const CUBIE_SIZE = 0.96;
const SPACING = 1.0;

const cubeGroup = new THREE.Group();
scene.add(cubeGroup);

const cubies = [];

function makeStickerTexture(label, bg) {
  // Large letter / label on the sticker face, accent if it is a section name
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size; canvas.height = size;
  const ctx = canvas.getContext("2d");

  // background
  ctx.fillStyle = "#" + bg.toString(16).padStart(6, "0");
  ctx.fillRect(0, 0, size, size);

  // inner rounded border (sticker look)
  const pad = 14;
  ctx.strokeStyle = "rgba(0,0,0,0.22)";
  ctx.lineWidth = 6;
  roundRect(ctx, pad, pad, size - pad * 2, size - pad * 2, 18);
  ctx.stroke();

  // subtle top-light gloss
  const grad = ctx.createLinearGradient(0, 0, 0, size);
  grad.addColorStop(0, "rgba(255,255,255,0.16)");
  grad.addColorStop(0.5, "rgba(255,255,255,0.00)");
  grad.addColorStop(1, "rgba(0,0,0,0.15)");
  ctx.fillStyle = grad;
  roundRect(ctx, pad, pad, size - pad * 2, size - pad * 2, 18);
  ctx.fill();

  if (label) {
    ctx.fillStyle = "rgba(10,10,15,0.85)";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    // Choose font size that fits. For long labels use smaller.
    const isLong = label.length > 6;
    ctx.font = `700 ${isLong ? 34 : 58}px Inter, -apple-system, Helvetica, sans-serif`;
    // For section labels we want the full word, split STOCK UNLOCK to 2 lines
    if (label.includes(" ")) {
      const parts = label.split(" ");
      parts.forEach((p, i) => {
        ctx.fillText(p, size / 2, size / 2 - 20 + i * 40);
      });
    } else {
      ctx.fillText(label, size / 2, size / 2);
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.anisotropy = 4;
  tex.needsUpdate = true;
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

// A cubie has 6 materials. Material is "plastic black" (inside) unless the face
// is on the outside of the cube, in which case it is the colored sticker.
function makeCubieMaterials(x, y, z) {
  // order: +x, -x, +y, -y, +z, -z
  // outside checks:
  const faces = [
    { dir: "R", outside: x === 1 },   // +x
    { dir: "L", outside: x === -1 },  // -x
    { dir: "U", outside: y === 1 },   // +y
    { dir: "D", outside: y === -1 },  // -y
    { dir: "F", outside: z === 1 },   // +z
    { dir: "B", outside: z === -1 },  // -z
  ];

  // Only the center cubie of a face gets the big section label on its sticker
  return faces.map(f => {
    if (!f.outside) {
      return new THREE.MeshStandardMaterial({
        color: INSIDE_COLOR, roughness: 0.9, metalness: 0.0
      });
    }
    const isCenter =
      (f.dir === "R" && x === 1  && y === 0 && z === 0) ||
      (f.dir === "L" && x === -1 && y === 0 && z === 0) ||
      (f.dir === "U" && y === 1  && x === 0 && z === 0) ||
      (f.dir === "D" && y === -1 && x === 0 && z === 0) ||
      (f.dir === "F" && z === 1  && x === 0 && y === 0) ||
      (f.dir === "B" && z === -1 && x === 0 && y === 0);

    const label = isCenter ? FACE_LABELS[f.dir] : "";
    const tex = makeStickerTexture(label, FACE_COLORS[f.dir]);
    return new THREE.MeshStandardMaterial({
      map: tex,
      roughness: 0.55,
      metalness: 0.05,
    });
  });
}

for (let x = -1; x <= 1; x++) {
  for (let y = -1; y <= 1; y++) {
    for (let z = -1; z <= 1; z++) {
      const geom = new THREE.BoxGeometry(CUBIE_SIZE, CUBIE_SIZE, CUBIE_SIZE);
      // slightly bevel-ish by subdividing? keep simple for perf
      const mats = makeCubieMaterials(x, y, z);
      const cubie = new THREE.Mesh(geom, mats);
      cubie.position.set(x * SPACING, y * SPACING, z * SPACING);
      cubie.castShadow = true;
      cubie.receiveShadow = true;
      cubie.userData = { home: new THREE.Vector3(x, y, z) };
      cubeGroup.add(cubie);
      cubies.push(cubie);
    }
  }
}

// ---------- Camera controls (custom orbit, no OrbitControls dep) -----------
const orbit = {
  target: new THREE.Vector3(0, 0, 0),
  // spherical coords
  radius: HERO_POS.length(),
  theta: Math.atan2(HERO_POS.x, HERO_POS.z),
  phi: Math.acos(HERO_POS.y / HERO_POS.length()),
  minPhi: 0.25,
  maxPhi: Math.PI - 0.25,
};

function applyOrbit() {
  const r = orbit.radius;
  const x = r * Math.sin(orbit.phi) * Math.sin(orbit.theta);
  const y = r * Math.cos(orbit.phi);
  const z = r * Math.sin(orbit.phi) * Math.cos(orbit.theta);
  camera.position.set(x, y, z);
  camera.lookAt(orbit.target);
}
applyOrbit();

let dragging = false;
let lastX = 0, lastY = 0;
let dragMoved = false;
let downX = 0, downY = 0;

const canvas = renderer.domElement;

function onDown(e) {
  const t = e.touches ? e.touches[0] : e;
  dragging = true;
  dragMoved = false;
  lastX = t.clientX; lastY = t.clientY;
  downX = t.clientX; downY = t.clientY;
}

function onMove(e) {
  if (!dragging) return;
  const t = e.touches ? e.touches[0] : e;
  const dx = t.clientX - lastX;
  const dy = t.clientY - lastY;
  lastX = t.clientX; lastY = t.clientY;

  if (Math.hypot(t.clientX - downX, t.clientY - downY) > 4) dragMoved = true;

  // cancel idle drift while dragging
  idleSinceInput = 0;

  orbit.theta -= dx * 0.007;
  orbit.phi   -= dy * 0.007;
  orbit.phi = Math.max(orbit.minPhi, Math.min(orbit.maxPhi, orbit.phi));
  applyOrbit();
}

function onUp(e) {
  if (!dragging) return;
  dragging = false;
  // click-vs-drag
  if (!dragMoved && !isAnimatingCamera && !overlayOpen) {
    const t = (e.changedTouches && e.changedTouches[0]) || e;
    handleClick(t.clientX, t.clientY);
  }
}

canvas.addEventListener("mousedown", onDown);
window.addEventListener("mousemove", onMove);
window.addEventListener("mouseup", onUp);

canvas.addEventListener("touchstart", (e) => { onDown(e); }, { passive: true });
canvas.addEventListener("touchmove",  (e) => { onMove(e); }, { passive: true });
canvas.addEventListener("touchend",   (e) => { onUp(e); });

window.addEventListener("wheel", (e) => {
  orbit.radius = Math.max(5.5, Math.min(12, orbit.radius + e.deltaY * 0.004));
  applyOrbit();
}, { passive: true });

// ---------- Face picking via raycast ---------------------------------------
const raycaster = new THREE.Raycaster();
const ndc = new THREE.Vector2();

function pickFaceAt(x, y) {
  ndc.x = (x / window.innerWidth) * 2 - 1;
  ndc.y = -(y / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(ndc, camera);
  const hits = raycaster.intersectObjects(cubies, false);
  if (!hits.length) return null;
  const hit = hits[0];
  // The intersection's faceIndex -> materialIndex mapping: BoxGeometry groups
  // by face pair. With indexed geometry, each face-pair has 2 triangles.
  // three.js sets hit.face.materialIndex for us.
  const matIdx = hit.face.materialIndex;
  // matIdx 0..5 corresponds to +x,-x,+y,-y,+z,-z
  const dirMap = ["R", "L", "U", "D", "F", "B"];
  return dirMap[matIdx];
}

function handleClick(x, y) {
  const face = pickFaceAt(x, y);
  if (!face) return;
  zoomToFace(face);
}

// ---------- Camera zoom to a face -----------------------------------------
let isAnimatingCamera = false;

function zoomToFace(face) {
  const target = FACE_VIEW[face];
  const startPos = camera.position.clone();
  const endPos = target.clone().multiplyScalar(0.75); // pull in a bit closer
  const startTime = performance.now();
  const dur = 700;

  isAnimatingCamera = true;

  function step() {
    const t = Math.min(1, (performance.now() - startTime) / dur);
    const e = easeInOutCubic(t);
    camera.position.lerpVectors(startPos, endPos, e);
    camera.lookAt(0, 0, 0);
    if (t < 1) {
      requestAnimationFrame(step);
    } else {
      isAnimatingCamera = false;
      // Sync orbit state so user can drag again later
      const p = camera.position;
      orbit.radius = p.length();
      orbit.theta = Math.atan2(p.x, p.z);
      orbit.phi = Math.acos(p.y / orbit.radius);
      openPanel(face);
    }
  }
  step();
}

function resetCamera() {
  const startPos = camera.position.clone();
  const endPos = HERO_POS.clone();
  const startTime = performance.now();
  const dur = 700;
  isAnimatingCamera = true;
  function step() {
    const t = Math.min(1, (performance.now() - startTime) / dur);
    const e = easeInOutCubic(t);
    camera.position.lerpVectors(startPos, endPos, e);
    camera.lookAt(0, 0, 0);
    if (t < 1) requestAnimationFrame(step);
    else {
      isAnimatingCamera = false;
      const p = camera.position;
      orbit.radius = p.length();
      orbit.theta = Math.atan2(p.x, p.z);
      orbit.phi = Math.acos(p.y / orbit.radius);
    }
  }
  step();
}

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

// ---------- Slice rotations (for scramble + solve animation) --------------
// We rotate slices by re-parenting cubies into a pivot group, rotating, then
// unparenting and snapping positions + rotations to the grid.
const AXES = {
  x: new THREE.Vector3(1, 0, 0),
  y: new THREE.Vector3(0, 1, 0),
  z: new THREE.Vector3(0, 0, 1),
};

function cubiesInSlice(axis, layer) {
  // Select cubies whose world position on `axis` rounds to `layer` (-1,0,1)
  const arr = [];
  for (const c of cubies) {
    const p = c.position;
    const val = axis === "x" ? p.x : axis === "y" ? p.y : p.z;
    if (Math.round(val) === layer) arr.push(c);
  }
  return arr;
}

let isAnimatingSlice = false;

function rotateSlice(axis, layer, direction, duration = 260) {
  return new Promise((resolve) => {
    if (isAnimatingSlice) return resolve();
    isAnimatingSlice = true;
    const pivot = new THREE.Group();
    scene.add(pivot);

    const group = cubiesInSlice(axis, layer);
    for (const c of group) pivot.attach(c); // attach preserves world transform

    const start = performance.now();
    const totalAngle = (Math.PI / 2) * direction;
    const axisVec = AXES[axis];

    function step() {
      const t = Math.min(1, (performance.now() - start) / duration);
      const e = easeInOutCubic(t);
      pivot.setRotationFromAxisAngle(axisVec, totalAngle * e);
      if (t < 1) {
        requestAnimationFrame(step);
      } else {
        // snap: re-attach to cubeGroup and round positions + rotations
        for (const c of [...pivot.children]) {
          cubeGroup.attach(c);
          c.position.x = Math.round(c.position.x);
          c.position.y = Math.round(c.position.y);
          c.position.z = Math.round(c.position.z);
          // quantize rotation to quarter turns by rounding quaternion via euler
          snapRotation(c);
        }
        scene.remove(pivot);
        isAnimatingSlice = false;
        resolve();
      }
    }
    step();
  });
}

function snapRotation(obj) {
  const e = new THREE.Euler().setFromQuaternion(obj.quaternion, "XYZ");
  const q = Math.PI / 2;
  e.x = Math.round(e.x / q) * q;
  e.y = Math.round(e.y / q) * q;
  e.z = Math.round(e.z / q) * q;
  obj.quaternion.setFromEuler(e);
}

// History of moves so "Solve" can reverse a scramble
let moveHistory = [];

const ALL_MOVES = [
  // axis, layer, direction
  ["x",  1,  1], ["x",  1, -1],
  ["x", -1,  1], ["x", -1, -1],
  ["y",  1,  1], ["y",  1, -1],
  ["y", -1,  1], ["y", -1, -1],
  ["z",  1,  1], ["z",  1, -1],
  ["z", -1,  1], ["z", -1, -1],
];

async function scramble(n = 18) {
  moveHistory = [];
  for (let i = 0; i < n; i++) {
    const m = ALL_MOVES[Math.floor(Math.random() * ALL_MOVES.length)];
    moveHistory.push(m);
    await rotateSlice(m[0], m[1], m[2], 120);
  }
}

async function solveAnim() {
  if (moveHistory.length === 0) {
    // if already solved, scramble then solve for a nicer demo
    await scramble(15);
    await sleep(200);
  }
  // reverse the moves with opposite direction
  const reversed = [...moveHistory].reverse();
  for (const [axis, layer, dir] of reversed) {
    await rotateSlice(axis, layer, -dir, 180);
  }
  moveHistory = [];
  onSolved();
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// ---------- Confetti + PB note on solve -----------------------------------
function onSolved() {
  const note = document.getElementById("pb-note");
  note.classList.add("show");
  setTimeout(() => note.classList.remove("show"), 3400);

  // confetti
  confettiBurst();
}

function confettiBurst() {
  const colors = ["#e8e4d8","#d9b64a","#b94a3c","#c87a3a","#3a6aa8","#3e8a5c","#f6c94a"];
  const n = 70;
  for (let i = 0; i < n; i++) {
    const el = document.createElement("div");
    const size = 6 + Math.random() * 6;
    el.style.cssText = `
      position:fixed; left:50%; top:50%;
      width:${size}px; height:${size * 0.4}px;
      background:${colors[i % colors.length]};
      pointer-events:none; z-index:40;
      transform: translate(-50%,-50%);
    `;
    document.body.appendChild(el);

    const angle = Math.random() * Math.PI * 2;
    const speed = 200 + Math.random() * 320;
    const dx = Math.cos(angle) * speed;
    const dy = Math.sin(angle) * speed - 150;
    const rot = (Math.random() - 0.5) * 1440;
    const dur = 900 + Math.random() * 700;

    el.animate(
      [
        { transform: `translate(-50%,-50%) rotate(0deg)`, opacity: 1 },
        { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy + 600}px)) rotate(${rot}deg)`, opacity: 0 }
      ],
      { duration: dur, easing: "cubic-bezier(.2,.7,.3,1)" }
    );
    setTimeout(() => el.remove(), dur);
  }
}

// ---------- Overlay content -----------------------------------------------
const overlay = document.getElementById("overlay");
const panelContent = document.getElementById("panel-content");
let overlayOpen = false;

const SECTIONS = {
  F: {
    eyebrow: "About",
    title: "Hi, I'm Jake.",
    html: `
      <p>Software engineer and founder, ~13 years in. I've shipped production systems at
      venture-backed startups and Fortune 500 health insurance, and I've co-founded companies —
      most recently <a href="#" data-face="U">Stock Unlock</a>, a YC W22 investing platform.</p>
      <p>I like building things that feel good to use: responsive, a little opinionated, with
      enough personality that you remember them. Also: I solve Rubik's cubes very fast, and
      occasionally while riding a unicycle.</p>
      <p>This site is a 3D cube because of course it is.</p>
    `
  },
  B: {
    eyebrow: "Career",
    title: "The tape.",
    html: `
      <ul class="timeline">
        <li>
          <div class="year">2013 — 2016</div>
          <div class="role">CommerceHub &middot; Software Engineer</div>
          <div class="note">First real job. E-commerce infrastructure at scale. Learned what "production" actually means.</div>
        </li>
        <li>
          <div class="year">2015 — 2016</div>
          <div class="role">Youni &middot; Co-founder / CTO</div>
          <div class="note">College-focused social app. First founder experience. Shipped. Learned.</div>
        </li>
        <li>
          <div class="year">2017 — 2021</div>
          <div class="role">Oscar Health &middot; Senior Software Engineer</div>
          <div class="note">Health insurance tech. Built member-facing systems used by hundreds of thousands. Famously did the unicycle+cube thing at a talent show.</div>
        </li>
        <li>
          <div class="year">2022 — present</div>
          <div class="role">Stock Unlock &middot; Co-founder</div>
          <div class="note">YC W22, $1.335M seed, 8 peak employees, thousands of customers. Built it, scaled it, profitable side business, not full-time. Next chapter.</div>
        </li>
        <li>
          <div class="year">Now</div>
          <div class="role">Next chapter</div>
          <div class="note">Exploring. Building. Talking to interesting people.</div>
        </li>
      </ul>
    `
  },
  U: {
    eyebrow: "Stock Unlock",
    title: "Built it. Scaled it. Stepped back.",
    html: `
      <p>Stock Unlock is a retail-investor research platform — fundamentals, valuation, and
      portfolio tools made actually understandable.</p>
      <p>We went through <b>Y Combinator W22</b>, raised a <b>$1.335M seed</b>, grew to
      <b>8 employees</b> at peak, and served <b>thousands of paying customers</b>. The product
      is profitable and continues to run without me full-time.</p>
      <p>I'm proud of it, and I'm in my next chapter. Open to what that chapter looks like.</p>
      <div>
        <span class="tag">YC W22</span>
        <span class="tag">$1.335M seed</span>
        <span class="tag">Profitable</span>
        <span class="tag">Still running</span>
      </div>
    `
  },
  D: {
    eyebrow: "Projects",
    title: "Things I've made.",
    html: `
      <div class="projects">
        <div class="project">
          <h4>Stock Unlock</h4>
          <p>Retail investing research platform. YC W22.</p>
        </div>
        <div class="project">
          <h4>This website</h4>
          <p>A Rubik's cube as a homepage. Three.js, no build.</p>
        </div>
        <div class="project">
          <h4>Youni</h4>
          <p>College-focused social app. Early co-founder work.</p>
        </div>
        <div class="project">
          <h4>Assorted side quests</h4>
          <p>Cubing timers, algorithm trainers, tiny tools.</p>
        </div>
      </div>
    `
  },
  L: {
    eyebrow: "Hobbies",
    title: "Outside the editor.",
    html: `
      <p><b>Cubing.</b> Competitive Rubik's Cube solver. 13.95s average on 3x3, personal best.
      Competed Northeast US + Nationals, 2008 — 2014.</p>
      <p><b>Unicycle + cube.</b> At an Oscar Health talent show I rode a unicycle across the
      stage while solving a Rubik's cube. Some people remember me for nothing else.</p>
      <p><b>DDR &amp; skateboarding.</b> Arcade-era Dance Dance Revolution, and skateboarding
      when my knees cooperate.</p>
      <p><b>Rugby.</b> Played in college and after. Still in the groupchat.</p>
      <p><b>Meditation.</b> A quiet counterweight to everything else.</p>
      <p><b>Wedding.</b> Recently got married. Highly recommend.</p>
    `
  },
  R: {
    eyebrow: "Contact",
    title: "Say hi.",
    html: `
      <p>Email is the best way to reach me.</p>
      <p><a href="mailto:jake@stockunlock.com">jake@stockunlock.com</a></p>
      <p>Also around on the usual networks. If you're building something interesting,
      especially at the intersection of consumer + tools, I'd love to hear about it.</p>
      <div>
        <span class="tag">Email</span>
        <span class="tag">GitHub</span>
        <span class="tag">LinkedIn</span>
        <span class="tag">X / Twitter</span>
      </div>
    `
  },
};

function openPanel(face) {
  const s = SECTIONS[face];
  if (!s) return;
  panelContent.innerHTML = `
    <div class="eyebrow">${s.eyebrow}</div>
    <h2>${s.title}</h2>
    ${s.html}
  `;
  overlay.classList.add("open");
  overlayOpen = true;

  // wire up inter-section links
  panelContent.querySelectorAll("a[data-face]").forEach(a => {
    a.addEventListener("click", (ev) => {
      ev.preventDefault();
      closePanel();
      setTimeout(() => zoomToFace(a.dataset.face), 250);
    });
  });
}

function closePanel() {
  overlay.classList.remove("open");
  overlayOpen = false;
  resetCamera();
}

document.getElementById("close-btn").addEventListener("click", closePanel);
overlay.addEventListener("click", (e) => {
  if (e.target === overlay) closePanel();
});
window.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && overlayOpen) closePanel();
});

// ---------- Solve / Scramble buttons --------------------------------------
document.getElementById("solve-btn").addEventListener("click", async () => {
  if (isAnimatingSlice) return;
  await solveAnim();
});
document.getElementById("scramble-btn").addEventListener("click", async () => {
  if (isAnimatingSlice) return;
  await scramble(18);
});

// ---------- Keyboard easter egg: R U R' U' --------------------------------
const EASTER_SEQ = ["R", "U", "R'", "U'"];
let easterBuf = "";
let easterTimer = null;

window.addEventListener("keydown", (e) => {
  // Don't intercept normal typing in inputs, we don't have any, but safe.
  if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;

  const k = e.key.toUpperCase();
  // We accept R, U, ', space, and backspace
  if (k === "R" || k === "U" || k === "'" || k === " " || k === "APOSTROPHE") {
    easterBuf += (k === "APOSTROPHE" ? "'" : k);
    if (easterBuf.length > 16) easterBuf = easterBuf.slice(-16);

    clearTimeout(easterTimer);
    easterTimer = setTimeout(() => { easterBuf = ""; }, 2500);

    // normalize: collapse spaces, compare suffix
    const norm = easterBuf.replace(/\s+/g, " ").trim();
    if (norm.endsWith("R U R' U'")) {
      triggerEasterEgg();
      easterBuf = "";
    }
  } else {
    // any other key resets
    easterBuf = "";
  }
});

function triggerEasterEgg() {
  // pulse the cube + brief sune note
  const easter = document.getElementById("easter");
  easter.classList.add("show");
  setTimeout(() => easter.classList.remove("show"), 1400);

  // emissive pulse on all outside materials
  const start = performance.now();
  const dur = 900;
  function pulse() {
    const t = Math.min(1, (performance.now() - start) / dur);
    const glow = Math.sin(t * Math.PI) * 0.6;
    for (const c of cubies) {
      for (const m of c.material) {
        if (m.map) {
          m.emissive = m.emissive || new THREE.Color(0xf6c94a);
          m.emissive.setHex(0xf6c94a);
          m.emissiveIntensity = glow;
          m.needsUpdate = true;
        }
      }
    }
    if (t < 1) requestAnimationFrame(pulse);
    else {
      for (const c of cubies) {
        for (const m of c.material) {
          if (m.map) { m.emissiveIntensity = 0; m.needsUpdate = true; }
        }
      }
    }
  }
  pulse();
}

// ---------- Resize + render loop ------------------------------------------
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// idle ambient drift
let idleSinceInput = 0;
let lastFrame = performance.now();

function animate(now) {
  const dt = (now - lastFrame) / 1000;
  lastFrame = now;

  if (!dragging && !isAnimatingCamera && !overlayOpen) {
    idleSinceInput += dt;
    if (idleSinceInput > 1.5) {
      // subtle drift: slowly orbit theta
      orbit.theta += dt * 0.06;
      applyOrbit();
    }
  } else {
    idleSinceInput = 0;
  }

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
requestAnimationFrame(animate);

// ---------- Boot: start scrambled -----------------------------------------
(async function boot() {
  // A brief intro scramble to make it look like a real cube
  await sleep(300);
  await scramble(14);
})();
