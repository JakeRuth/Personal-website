/* ============================================================
   Frutiger Aero — app.js
   - bubble expand/collapse
   - bokeh particles on background canvas
   - ambient chillwave toggle (WebAudio, muted-by-default)
   - Three.js translucent Rubik's cube
   - Network graph on canvas
   ============================================================ */

/* ---------- helpers ---------- */
const $  = (s, r=document) => r.querySelector(s);
const $$ = (s, r=document) => Array.from(r.querySelectorAll(s));
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ============================================================
   BUBBLE EXPAND/COLLAPSE
   ============================================================ */
$$('.bubble').forEach(bubble => {
  const head = bubble.querySelector('.bubble-head');
  const body = bubble.querySelector('.bubble-body');
  head.addEventListener('click', () => {
    const open = body.classList.toggle('open');
    head.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
});

/* ============================================================
   BOKEH — slow rising translucent orbs
   ============================================================ */
(function bokeh() {
  const cnv = document.getElementById('bokeh');
  if (!cnv) return;
  const ctx = cnv.getContext('2d');
  let W, H, orbs;

  function resize() {
    W = cnv.width  = window.innerWidth  * devicePixelRatio;
    H = cnv.height = window.innerHeight * devicePixelRatio;
    cnv.style.width  = window.innerWidth + 'px';
    cnv.style.height = window.innerHeight + 'px';
    orbs = [];
    const n = Math.min(40, Math.floor((window.innerWidth * window.innerHeight) / 30000));
    for (let i = 0; i < n; i++) orbs.push(makeOrb(true));
  }
  function makeOrb(initial) {
    return {
      x: Math.random() * W,
      y: initial ? Math.random() * H : H + Math.random() * 120 * devicePixelRatio,
      r: (6 + Math.random() * 28) * devicePixelRatio,
      s: (0.15 + Math.random() * 0.6) * devicePixelRatio,
      drift: (Math.random() - 0.5) * 0.3 * devicePixelRatio,
      hue: Math.random() < 0.5 ? 'rgba(255,255,255,' : 'rgba(180,230,255,',
      a: 0.25 + Math.random() * 0.35,
      ph: Math.random() * Math.PI * 2,
    };
  }
  function tick(t) {
    ctx.clearRect(0, 0, W, H);
    orbs.forEach(o => {
      o.y -= o.s;
      o.x += Math.sin(t * 0.0004 + o.ph) * o.drift;
      if (o.y + o.r < 0) Object.assign(o, makeOrb(false));
      const g = ctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, o.r);
      g.addColorStop(0, o.hue + (o.a) + ')');
      g.addColorStop(0.6, o.hue + (o.a * 0.3) + ')');
      g.addColorStop(1, o.hue + '0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(o.x, o.y, o.r, 0, Math.PI * 2);
      ctx.fill();
    });
    if (!prefersReduced) requestAnimationFrame(tick);
  }
  window.addEventListener('resize', resize);
  resize();
  if (!prefersReduced) requestAnimationFrame(tick);
})();

/* ============================================================
   AMBIENT CHILLWAVE — muted by default, never autoplay
   Tiny WebAudio pad (no external audio file).
   ============================================================ */
(function chillwave() {
  const btn = document.getElementById('muteBtn');
  const label = btn.querySelector('.mute-label');
  let ctx, master, nodes = [], started = false;

  function start() {
    if (started) return;
    started = true;
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    master = ctx.createGain();
    master.gain.value = 0; // fade in
    master.connect(ctx.destination);

    // soft reverb-y pad: 3 detuned sine oscillators + slow LFO on filter
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 900;
    filter.Q.value = 0.7;
    filter.connect(master);

    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.frequency.value = 0.08;
    lfoGain.gain.value = 400;
    lfo.connect(lfoGain).connect(filter.frequency);
    lfo.start();

    // chord: A2, E3, A3, C#4 (A major-ish dreamy)
    const freqs = [110, 164.81, 220, 277.18];
    freqs.forEach((f, i) => {
      const o1 = ctx.createOscillator();
      const o2 = ctx.createOscillator();
      o1.type = 'sine'; o2.type = 'sine';
      o1.frequency.value = f;
      o2.frequency.value = f * 1.005;
      const g = ctx.createGain();
      g.gain.value = 0.06 / (i + 1);
      o1.connect(g); o2.connect(g);
      g.connect(filter);
      o1.start(); o2.start();
      nodes.push(o1, o2);
    });

    // subtle noise wash
    const bufferSize = 2 * ctx.sampleRate;
    const noiseBuf = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const out = noiseBuf.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) out[i] = (Math.random() * 2 - 1) * 0.3;
    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuf;
    noise.loop = true;
    const nFilter = ctx.createBiquadFilter();
    nFilter.type = 'bandpass';
    nFilter.frequency.value = 700;
    nFilter.Q.value = 0.6;
    const nGain = ctx.createGain();
    nGain.gain.value = 0.015;
    noise.connect(nFilter).connect(nGain).connect(master);
    noise.start();
    nodes.push(noise);
  }

  function fade(to, dur=1.2) {
    if (!master) return;
    const now = ctx.currentTime;
    master.gain.cancelScheduledValues(now);
    master.gain.setValueAtTime(master.gain.value, now);
    master.gain.linearRampToValueAtTime(to, now + dur);
  }

  btn.addEventListener('click', async () => {
    const pressed = btn.getAttribute('aria-pressed') === 'true';
    if (!pressed) {
      start();
      if (ctx.state === 'suspended') await ctx.resume();
      fade(0.18, 1.4);
      btn.setAttribute('aria-pressed', 'true');
      btn.title = 'Ambient chillwave (on)';
      label.textContent = 'chillwave: on';
    } else {
      fade(0.0001, 0.8);
      btn.setAttribute('aria-pressed', 'false');
      btn.title = 'Ambient chillwave (off)';
      label.textContent = 'chillwave: off';
    }
  });
})();

/* ============================================================
   THREE.JS — translucent glass Rubik's cube, ambient solving
   ============================================================ */
(function glassCube() {
  if (typeof THREE === 'undefined' || prefersReduced) return;
  const stage = document.getElementById('cubeStage');
  if (!stage) return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
  camera.position.set(4.2, 3.2, 6.5);
  camera.lookAt(0, 0, 0);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);
  stage.appendChild(renderer.domElement);

  function resize() {
    const w = stage.clientWidth, h = stage.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
  }
  resize();
  window.addEventListener('resize', resize);

  // lights — lively highlights
  scene.add(new THREE.AmbientLight(0xffffff, 0.55));
  const key = new THREE.DirectionalLight(0xffffff, 0.9);
  key.position.set(5, 8, 4);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0x9fe0ff, 0.55);
  rim.position.set(-6, 2, -3);
  scene.add(rim);
  const warm = new THREE.PointLight(0xffc080, 0.5, 20);
  warm.position.set(-2, 3, 5);
  scene.add(warm);

  // cube group — 27 cubelets
  const group = new THREE.Group();
  scene.add(group);

  // face colors (water/spring/orange/white/yellow/pink)
  const faceColors = {
    'R': 0xF09033, // orange
    'L': 0xE74C7D, // pink/magenta
    'U': 0xFFFFFF, // white
    'D': 0xFFE37A, // yellow
    'F': 0x8DCA3E, // green
    'B': 0x6BBBDB, // water blue
  };

  function makeStickerTexture(hex) {
    const c = document.createElement('canvas');
    c.width = c.height = 128;
    const g = c.getContext('2d');
    // body
    g.fillStyle = '#' + hex.toString(16).padStart(6, '0');
    roundRect(g, 8, 8, 112, 112, 20); g.fill();
    // gloss
    const grad = g.createLinearGradient(0, 0, 0, 128);
    grad.addColorStop(0, 'rgba(255,255,255,0.7)');
    grad.addColorStop(0.45, 'rgba(255,255,255,0.0)');
    g.fillStyle = grad;
    roundRect(g, 8, 8, 112, 50, 20); g.fill();
    // edge
    g.strokeStyle = 'rgba(255,255,255,0.6)';
    g.lineWidth = 2;
    roundRect(g, 9, 9, 110, 110, 20); g.stroke();
    return new THREE.CanvasTexture(c);
  }
  function roundRect(g, x, y, w, h, r) {
    g.beginPath();
    g.moveTo(x + r, y);
    g.arcTo(x + w, y, x + w, y + h, r);
    g.arcTo(x + w, y + h, x, y + h, r);
    g.arcTo(x, y + h, x, y, r);
    g.arcTo(x, y, x + w, y, r);
    g.closePath();
  }

  // pre-make textures
  const texR = makeStickerTexture(faceColors.R);
  const texL = makeStickerTexture(faceColors.L);
  const texU = makeStickerTexture(faceColors.U);
  const texD = makeStickerTexture(faceColors.D);
  const texF = makeStickerTexture(faceColors.F);
  const texB = makeStickerTexture(faceColors.B);
  const blackMat = new THREE.MeshStandardMaterial({ color: 0x0a1a26, roughness: 0.4, metalness: 0.2 });

  const SIZE = 0.92;
  const GAP = 0.04;
  const STEP = SIZE + GAP;

  const cubelets = [];
  for (let x = -1; x <= 1; x++) {
    for (let y = -1; y <= 1; y++) {
      for (let z = -1; z <= 1; z++) {
        const geom = new THREE.BoxGeometry(SIZE, SIZE, SIZE);
        const mats = [
          x ===  1 ? new THREE.MeshStandardMaterial({ map: texR, roughness: 0.2, metalness: 0.2, transparent: true, opacity: 0.92 }) : blackMat,
          x === -1 ? new THREE.MeshStandardMaterial({ map: texL, roughness: 0.2, metalness: 0.2, transparent: true, opacity: 0.92 }) : blackMat,
          y ===  1 ? new THREE.MeshStandardMaterial({ map: texU, roughness: 0.2, metalness: 0.2, transparent: true, opacity: 0.92 }) : blackMat,
          y === -1 ? new THREE.MeshStandardMaterial({ map: texD, roughness: 0.2, metalness: 0.2, transparent: true, opacity: 0.92 }) : blackMat,
          z ===  1 ? new THREE.MeshStandardMaterial({ map: texF, roughness: 0.2, metalness: 0.2, transparent: true, opacity: 0.92 }) : blackMat,
          z === -1 ? new THREE.MeshStandardMaterial({ map: texB, roughness: 0.2, metalness: 0.2, transparent: true, opacity: 0.92 }) : blackMat,
        ];
        const mesh = new THREE.Mesh(geom, mats);
        mesh.position.set(x * STEP, y * STEP, z * STEP);
        mesh.userData = { ix: x, iy: y, iz: z };
        group.add(mesh);
        cubelets.push(mesh);
      }
    }
  }

  // faint glass hull (big translucent box) — adds the aero bubble vibe
  const hull = new THREE.Mesh(
    new THREE.BoxGeometry(3.3, 3.3, 3.3),
    new THREE.MeshPhysicalMaterial({
      transparent: true,
      opacity: 0.08,
      roughness: 0.1,
      transmission: 0.9,
      metalness: 0,
      color: 0xcfeefd,
    })
  );
  group.add(hull);

  /* ---- turn animation ---- */
  // axis: 'x'|'y'|'z', layer: -1|0|1, dir: +1 or -1
  const turns = [];
  let turning = false;
  function queueRandomTurn() {
    const axes = ['x', 'y', 'z'];
    const axis = axes[Math.floor(Math.random() * 3)];
    const layer = Math.floor(Math.random() * 3) - 1;
    const dir = Math.random() < 0.5 ? 1 : -1;
    turns.push({ axis, layer, dir });
  }
  function performTurn(turn, onDone) {
    if (turning) return;
    turning = true;
    const pivot = new THREE.Group();
    scene.add(pivot);
    const members = cubelets.filter(c => {
      const p = c.position[turn.axis];
      return Math.abs(p - turn.layer * STEP) < 0.01;
    });
    members.forEach(m => pivot.attach(m));
    const target = (Math.PI / 2) * turn.dir;
    const start = performance.now();
    const dur = 650;
    function step(t) {
      const k = Math.min(1, (t - start) / dur);
      const e = k < 0.5 ? 2*k*k : 1 - Math.pow(-2*k+2, 2)/2;
      pivot.rotation[turn.axis] = target * e;
      if (k < 1) requestAnimationFrame(step);
      else {
        // snap + reparent
        pivot.rotation[turn.axis] = target;
        pivot.updateMatrixWorld(true);
        members.forEach(m => group.attach(m));
        // snap positions to grid
        members.forEach(m => {
          m.position.x = Math.round(m.position.x / STEP) * STEP;
          m.position.y = Math.round(m.position.y / STEP) * STEP;
          m.position.z = Math.round(m.position.z / STEP) * STEP;
          m.rotation.x = Math.round(m.rotation.x / (Math.PI/2)) * (Math.PI/2);
          m.rotation.y = Math.round(m.rotation.y / (Math.PI/2)) * (Math.PI/2);
          m.rotation.z = Math.round(m.rotation.z / (Math.PI/2)) * (Math.PI/2);
        });
        scene.remove(pivot);
        turning = false;
        onDone && onDone();
      }
    }
    requestAnimationFrame(step);
  }

  // scroll-driven pacing
  let lastScrollY = window.scrollY;
  let scrollBudget = 0;
  window.addEventListener('scroll', () => {
    const dy = Math.abs(window.scrollY - lastScrollY);
    scrollBudget += dy;
    lastScrollY = window.scrollY;
  }, { passive: true });

  let idleTimer = 0;
  function maybeTurn(now) {
    if (turning) return;
    if (scrollBudget > 180) {
      scrollBudget = 0;
      queueRandomTurn();
    } else if (now - idleTimer > 3200) {
      idleTimer = now;
      queueRandomTurn();
    }
    if (turns.length) {
      performTurn(turns.shift());
    }
  }

  // animate
  function animate(t) {
    group.rotation.y += 0.0025;
    group.rotation.x = Math.sin(t * 0.0004) * 0.12 + 0.35;
    maybeTurn(t);
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }
  requestAnimationFrame(animate);
})();

/* ============================================================
   NETWORK GRAPH — glass nodes, fiber rays
   ============================================================ */
(function netGraph() {
  const cnv = document.getElementById('netCanvas');
  if (!cnv) return;
  const ctx = cnv.getContext('2d');
  let W, H;

  function resize() {
    const rect = cnv.getBoundingClientRect();
    W = cnv.width  = rect.width  * devicePixelRatio;
    H = cnv.height = rect.height * devicePixelRatio;
  }
  resize();
  window.addEventListener('resize', resize);

  const C = {
    me: '#F09033',
    co: '#3E8FBF',
    pj: '#8DCA3E',
    hb: '#c58fdd',
  };

  // "me" centered; companies, projects, hobbies orbiting
  const nodes = [
    { id: 'me', label: 'Jake', type: 'me', r: 22, color: C.me, fx: 0.5, fy: 0.5 },
    { id: 'su', label: 'Stock Unlock', type: 'co', color: C.co, fx: 0.28, fy: 0.28 },
    { id: 'os', label: 'Oscar', type: 'co', color: C.co, fx: 0.72, fy: 0.26 },
    { id: 'yo', label: 'Youni',  type: 'co', color: C.co, fx: 0.82, fy: 0.55 },
    { id: 'ch', label: 'CommerceHub', type: 'co', color: C.co, fx: 0.68, fy: 0.82 },
    { id: 'yc', label: 'YC W22', type: 'pj', color: C.pj, fx: 0.16, fy: 0.52 },
    { id: 'ac', label: 'ACM · SUNY', type: 'pj', color: C.pj, fx: 0.32, fy: 0.78 },
    { id: 'cu', label: 'Rubik’s cube · 13.95s', type: 'hb', color: C.hb, fx: 0.55, fy: 0.84 },
    { id: 'un', label: 'Unicycle', type: 'hb', color: C.hb, fx: 0.92, fy: 0.80 },
    { id: 'mr', label: 'Getting married', type: 'hb', color: C.hb, fx: 0.08, fy: 0.85 },
  ];
  const edges = [
    ['me','su'],['me','os'],['me','yo'],['me','ch'],
    ['me','yc'],['me','ac'],['me','cu'],['me','un'],['me','mr'],
    ['su','yc'], ['ch','os'], ['cu','un'],
  ];

  // init positions with slight jitter velocity
  nodes.forEach(n => {
    n.vx = (Math.random() - 0.5) * 0.0004;
    n.vy = (Math.random() - 0.5) * 0.0004;
    n.phase = Math.random() * Math.PI * 2;
    if (!n.r) n.r = n.type === 'me' ? 22 : 12;
  });

  function pos(n, t) {
    // drift fractional coords
    const dx = Math.sin(t * 0.0004 + n.phase) * 0.012;
    const dy = Math.cos(t * 0.0005 + n.phase) * 0.012;
    return { x: (n.fx + dx) * W, y: (n.fy + dy) * H };
  }

  function draw(t) {
    ctx.clearRect(0, 0, W, H);
    const computed = nodes.map(n => ({ n, ...pos(n, t) }));

    // draw edges as glowing rays
    edges.forEach(([a, b]) => {
      const A = computed.find(c => c.n.id === a);
      const B = computed.find(c => c.n.id === b);
      if (!A || !B) return;
      const grad = ctx.createLinearGradient(A.x, A.y, B.x, B.y);
      grad.addColorStop(0, hexA(A.n.color, 0.9));
      grad.addColorStop(0.5, 'rgba(255,255,255,0.85)');
      grad.addColorStop(1, hexA(B.n.color, 0.9));
      ctx.strokeStyle = grad;
      ctx.lineWidth = 1.6 * devicePixelRatio;
      ctx.beginPath();
      ctx.moveTo(A.x, A.y);
      ctx.lineTo(B.x, B.y);
      ctx.stroke();

      // packet dots traveling
      const k = ((t * 0.0004 + (A.n.id.charCodeAt(0) + B.n.id.charCodeAt(0)) * 0.01) % 1);
      const px = A.x + (B.x - A.x) * k;
      const py = A.y + (B.y - A.y) * k;
      ctx.fillStyle = 'rgba(255,255,255,0.95)';
      ctx.beginPath();
      ctx.arc(px, py, 2.2 * devicePixelRatio, 0, Math.PI * 2);
      ctx.fill();
    });

    // draw nodes
    computed.forEach(({ n, x, y }) => {
      const r = n.r * devicePixelRatio;
      // outer glow
      const g = ctx.createRadialGradient(x, y, r * 0.4, x, y, r * 2.2);
      g.addColorStop(0, hexA(n.color, 0.6));
      g.addColorStop(1, hexA(n.color, 0));
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, r * 2.2, 0, Math.PI * 2);
      ctx.fill();

      // glass body
      const body = ctx.createRadialGradient(x - r*0.4, y - r*0.5, r*0.1, x, y, r);
      body.addColorStop(0, 'rgba(255,255,255,0.95)');
      body.addColorStop(0.5, hexA(n.color, 0.8));
      body.addColorStop(1, hexA(n.color, 0.95));
      ctx.fillStyle = body;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();

      // rim
      ctx.strokeStyle = 'rgba(255,255,255,0.85)';
      ctx.lineWidth = 1.4 * devicePixelRatio;
      ctx.stroke();

      // specular
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      ctx.beginPath();
      ctx.ellipse(x - r*0.35, y - r*0.45, r*0.32, r*0.16, -0.4, 0, Math.PI*2);
      ctx.fill();

      // label
      ctx.font = `${12 * devicePixelRatio}px "Manrope", sans-serif`;
      ctx.fillStyle = 'rgba(20,49,73,0.92)';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(n.label, x, y + r + 6 * devicePixelRatio);
    });

    requestAnimationFrame(draw);
  }
  function hexA(hex, a) {
    const h = hex.replace('#','');
    const r = parseInt(h.substring(0,2),16);
    const g = parseInt(h.substring(2,4),16);
    const b = parseInt(h.substring(4,6),16);
    return `rgba(${r},${g},${b},${a})`;
  }
  if (!prefersReduced) requestAnimationFrame(draw);
  else draw(0);
})();

/* ============================================================
   RIBBON NAV — subtle active state on scroll
   ============================================================ */
(function navSpy() {
  const links = $$('.ribbon-nav a');
  const targets = links.map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);
  function spy() {
    const y = window.scrollY + 120;
    let active = 0;
    targets.forEach((t, i) => { if (t.offsetTop <= y) active = i; });
    links.forEach((l, i) => l.style.background = i === active ? 'rgba(255,255,255,0.55)' : '');
    links.forEach((l, i) => l.style.color = i === active ? '#143149' : '');
  }
  window.addEventListener('scroll', spy, { passive: true });
  spy();
})();
