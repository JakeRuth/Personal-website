/* =================================================
   Mac OS 9 Prototype — Jake Ruth
   ================================================= */

// ------------- CLOCK -------------
function updateClock() {
  const d = new Date();
  const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  let h = d.getHours();
  const m = d.getMinutes();
  const ap = h >= 12 ? 'PM' : 'AM';
  h = h % 12; if (h === 0) h = 12;
  document.getElementById('clock').textContent =
    `${days[d.getDay()]} ${h}:${m.toString().padStart(2,'0')} ${ap}`;
}
updateClock();
setInterval(updateClock, 15000);

// ------------- WINDOW SYSTEM -------------
let topZ = 10;
function focusWindow(win) {
  topZ++;
  win.style.zIndex = topZ;
  document.querySelectorAll('.window').forEach(w => {
    w.querySelector('.titlebar').classList.add('inactive');
  });
  win.querySelector('.titlebar').classList.remove('inactive');
}
function openWindow(id) {
  const w = document.getElementById(id);
  if (!w) return;
  w.classList.remove('hidden');
  focusWindow(w);
}
function closeWindow(id) {
  document.getElementById(id).classList.add('hidden');
}

// Dragging
document.querySelectorAll('.window').forEach(win => {
  const tb = win.querySelector('.titlebar');
  let drag = null;
  tb.addEventListener('mousedown', e => {
    if (e.target.matches('.tb-close, .tb-zoom, .tb-shade')) return;
    focusWindow(win);
    const rect = win.getBoundingClientRect();
    drag = { ox: e.clientX - rect.left, oy: e.clientY - rect.top };
    e.preventDefault();
  });
  window.addEventListener('mousemove', e => {
    if (!drag) return;
    win.style.left = (e.clientX - drag.ox) + 'px';
    win.style.top  = Math.max(20, e.clientY - drag.oy) + 'px';
  });
  window.addEventListener('mouseup', () => drag = null);
  win.addEventListener('mousedown', () => focusWindow(win));
});

// Close buttons
document.querySelectorAll('[data-close]').forEach(btn => {
  btn.addEventListener('click', e => {
    e.stopPropagation();
    closeWindow(btn.dataset.close);
  });
});

// ------------- MENU BAR -------------
const menus = document.querySelectorAll('#menubar .menu[data-menu]');
const dropdownMap = {
  apple: 'dd-apple', file: 'dd-file', edit: 'dd-edit',
  view: 'dd-view', special: 'dd-special', help: 'dd-help',
};
function closeAllDropdowns() {
  document.querySelectorAll('.dropdown').forEach(dd => dd.classList.remove('open'));
  menus.forEach(m => m.classList.remove('active'));
}
menus.forEach(m => {
  m.addEventListener('mousedown', e => {
    e.stopPropagation();
    const id = dropdownMap[m.dataset.menu];
    const dd = document.getElementById(id);
    const wasOpen = dd.classList.contains('open');
    closeAllDropdowns();
    if (!wasOpen) {
      m.classList.add('active');
      dd.classList.add('open');
      const rect = m.getBoundingClientRect();
      dd.style.left = rect.left + 'px';
    }
  });
});
document.addEventListener('mousedown', closeAllDropdowns);

// Dropdown actions
document.querySelectorAll('.dd-item').forEach(item => {
  item.addEventListener('mousedown', e => {
    e.stopPropagation();
    const action = item.dataset.action;
    closeAllDropdowns();
    handleAction(action);
  });
});

function handleAction(action) {
  switch (action) {
    case 'about-jake':      openWindow('about-window'); break;
    case 'sherlock':        openWindow('sherlock-window'); drawSherlock(); break;
    case 'control-panels':  openWindow('cube-window'); break;
    case 'new-finder':      openWindow('finder-window'); break;
    case 'view-icon':
    case 'view-list':
    case 'view-button':     /* mocked */ break;
    case 'empty-trash':     alert('The Trash contains 0 items.\n\nAre you sure you want to remove these items permanently?'); break;
    case 'restart':         location.reload(); break;
    case 'shutdown':        document.getElementById('shutdown-dialog').classList.remove('hidden'); break;
    case 'help-about':      alert('Balloon Help is on.\n\nHover things. Imagine a balloon appeared.'); break;
    case 'help-email':      window.location.href = 'mailto:jake@stockunlock.com'; break;
  }
}

// Status icons
document.getElementById('cube-status').addEventListener('click', () => { openWindow('cube-window'); });
document.getElementById('sherlock-status').addEventListener('click', () => { openWindow('sherlock-window'); drawSherlock(); });

// Desktop icons
function bindDesktopIcon(el, onOpen) {
  let clickCount = 0, clickTimer = null;
  el.addEventListener('click', e => {
    e.stopPropagation();
    document.querySelectorAll('.desk-icon').forEach(i => i.classList.remove('selected'));
    el.classList.add('selected');
    clickCount++;
    if (clickCount === 1) {
      clickTimer = setTimeout(() => { clickCount = 0; }, 400);
    } else if (clickCount === 2) {
      clearTimeout(clickTimer); clickCount = 0;
      onOpen();
    }
  });
}
document.addEventListener('click', () => {
  document.querySelectorAll('.desk-icon').forEach(i => i.classList.remove('selected'));
});
bindDesktopIcon(document.getElementById('jakehd'), () => openWindow('finder-window'));
bindDesktopIcon(document.getElementById('docs-icon'), () => {
  openFolder('About');
});
bindDesktopIcon(document.getElementById('trash-icon'), () => {
  alert('The Trash is empty.\n\n(Jake does not hold onto regrets.)');
});

// Shutdown dialog
document.getElementById('sd-cancel').addEventListener('click', () => {
  document.getElementById('shutdown-dialog').classList.add('hidden');
});
document.getElementById('sd-ok').addEventListener('click', () => {
  document.getElementById('shutdown-dialog').classList.add('hidden');
  document.getElementById('shutdown-screen').classList.remove('hidden');
});

// ------------- FINDER CONTENTS -------------
const folders = [
  { name: 'About',        modified: '4/20/2026, 9:14 AM',  size: '—',     kind: 'folder' },
  { name: 'Career',       modified: '4/18/2026, 11:30 AM', size: '—',     kind: 'folder' },
  { name: 'Stock Unlock', modified: '4/19/2026, 2:02 PM',  size: '—',     kind: 'folder' },
  { name: 'Projects',     modified: '3/27/2026, 7:45 PM',  size: '—',     kind: 'folder' },
  { name: 'Hobbies',      modified: '4/05/2026, 10:11 AM', size: '—',     kind: 'folder' },
  { name: 'Contact',      modified: '4/20/2026, 8:00 AM',  size: '—',     kind: 'folder' },
];
const grid = document.getElementById('finder-grid');
folders.forEach(f => {
  const row = document.createElement('div');
  row.className = 'finder-row';
  row.innerHTML = `
    <div class="col name-col"><div class="folder-mini"></div>${f.name}</div>
    <div class="col">${f.modified}</div>
    <div class="col">${f.size}</div>
    <div class="col">${f.kind}</div>
  `;
  let c = 0, t;
  row.addEventListener('click', e => {
    e.stopPropagation();
    document.querySelectorAll('.finder-row').forEach(r => r.classList.remove('selected'));
    row.classList.add('selected');
    c++;
    if (c === 1) t = setTimeout(() => c = 0, 400);
    else { clearTimeout(t); c = 0; openFolder(f.name); }
  });
  grid.appendChild(row);
});

// ------------- HYPERCARD CONTENT -------------
const cardData = {
  'About': [
    {
      h: 'About This Jake',
      body: `
        <p>Software engineer and founder. ~13 years writing code, shipping things, and trying to not overcharge people for software.</p>
        <p>Currently based in the next-chapter phase: Stock Unlock is a profitable side business (YC W22, peaked at 8 employees, thousands of customers). I'm no longer full-time there as of April 2026.</p>
        <h2>Operating principle</h2>
        <div class="cred-line">Hates overcharging for shit software. Likes small teams, real problems, and products people quietly keep paying for.</div>
      `,
    },
    {
      h: 'Trivia & TMI',
      body: `
        <p>ACM president at SUNY Albany. Competitive Rubik's cube solver (13.95s avg). Once solved a cube on a unicycle in a talent show. Currently getting married.</p>
        <span class="tag">Engineer</span><span class="tag">Founder</span><span class="tag">Cuber</span><span class="tag">Unicyclist</span><span class="tag">Fianc&eacute;</span>
      `,
    },
    {
      h: 'Voice & Taste',
      body: `
        <p>Interesting, quirky, a little edgy, not phony. Prefers products that respect the customer. Allergic to 20-person "growth meetings". One voice.</p>
      `,
    },
  ],
  'Career': [
    {
      h: 'Stock Unlock — Co-founder / Engineer',
      body: `
        <p><b>2022 &mdash; now</b> &middot; YC W22 &middot; $1.335M seed.</p>
        <p>Built it, scaled to 8 employees and thousands of paying customers, turned it into a profitable side business. Not full-time there as of April 2026 &mdash; onto the next chapter.</p>
      `,
    },
    {
      h: 'Oscar Health — Software Engineer',
      body: `<p><b>2017 &mdash; 2021</b></p><p>Health insurance platform work. Large codebases, real users, adult-grade infrastructure.</p>`,
    },
    {
      h: 'Youni — Early Engineer',
      body: `<p><b>2015 &mdash; 2016</b></p><p>Early-stage startup. Small team, lots of hats, learning how products actually get built.</p>`,
    },
    {
      h: 'CommerceHub — Engineer',
      body: `<p><b>2013 &mdash; 2016</b></p><p>E-commerce integration platform. First real job out of SUNY Albany. Learned what "production" means.</p>`,
    },
  ],
  'Stock Unlock': [
    {
      h: 'Stock Unlock — the whole arc',
      body: `
        <p>Investment research and portfolio analytics for self-directed retail investors. Built with the belief that Bloomberg-grade tools shouldn't cost Bloomberg-grade money.</p>
        <ul>
          <li>YC W22</li>
          <li>$1.335M seed raise</li>
          <li>Peak 8 employees</li>
          <li>Thousands of paying customers</li>
          <li>Profitable side business</li>
          <li>Not full-time as of April 2026</li>
        </ul>
        <div class="cred-line">Built it, scaled it, made it profitable, made it a side business, shipped next chapter.</div>
      `,
    },
    {
      h: 'Philosophy',
      body: `<p>Hate overcharging for shit software. So Stock Unlock undercut the incumbents, shipped tools that respected the customer's intelligence, and kept churn low by being actually good.</p>`,
    },
  ],
  'Projects': [
    {
      h: 'This Website',
      body: `<p>17 parallel prototypes, built via Claude Code. You're currently inside the Classic Mac OS 9 one.</p>`,
    },
    {
      h: "Rubik's Cube Timer",
      body: `<p>Personal cube timer app. Solve history, PB tracking, session statistics. The kind of thing you build when you're too deep in a hobby to use someone else's.</p>`,
    },
    {
      h: 'Assorted weekends',
      body: `<p>A steady drip of small utilities, data toys, scraper experiments, and "I bet I could build that in an afternoon" projects that turned into two afternoons.</p>`,
    },
  ],
  'Hobbies': [
    {
      h: "Rubik's Cube",
      body: `
        <p>Competitive speedcuber. <b>13.95s</b> average, PB <b>10.21s</b>. Method: CFOP with full OLL, working on full PLL.</p>
        <p>Once solved a 3x3 on a unicycle in a talent show. It went about as well as you'd expect.</p>
        <div class="cred-line">Scroll the Finder window &rarr; watch the cube in the Rubik's Cube control panel ambient-solve.</div>
      `,
    },
    {
      h: 'Unicycle',
      body: `<p>Yes, I can ride one. No, it is not a practical mode of transport. Yes, it still counts as cardio.</p>`,
    },
    {
      h: 'Marriage (new hobby)',
      body: `<p>Getting married. Highly recommend, apparently.</p>`,
    },
  ],
  'Contact': [
    {
      h: 'How to reach Jake',
      body: `
        <p><b>Email:</b> <a href="mailto:jake@stockunlock.com">jake@stockunlock.com</a></p>
        <p>Best for: job offers you're serious about, interesting startup ideas, cube-related trash talk, wedding RSVPs.</p>
        <p>Worst for: cold crypto pitches, "quick call next week?", anything with the word "synergy".</p>
      `,
    },
  ],
};

let currentSection = null;
let currentCard = 0;
function openFolder(section) {
  if (!cardData[section]) return;
  currentSection = section;
  currentCard = 0;
  document.getElementById('folder-title').textContent = section + ' /';
  document.getElementById('hc-section').textContent = section;
  renderCard();
  openWindow('folder-window');
}
function renderCard() {
  const cards = cardData[currentSection];
  const c = cards[currentCard];
  const cardEl = document.getElementById('hc-card');
  cardEl.innerHTML = `<h1>${c.h}</h1>${c.body}`;
  document.getElementById('hc-count').textContent =
    `${currentCard + 1} / ${cards.length}`;
}
document.getElementById('hc-prev').addEventListener('click', () => {
  if (!currentSection) return;
  const cards = cardData[currentSection];
  currentCard = (currentCard - 1 + cards.length) % cards.length;
  renderCard();
});
document.getElementById('hc-next').addEventListener('click', () => {
  if (!currentSection) return;
  const cards = cardData[currentSection];
  currentCard = (currentCard + 1) % cards.length;
  renderCard();
});

// ------------- RUBIK'S CUBE (three.js) -------------
let cubeState = { solveProgress: 0, scrambleMoves: [] };

const cubeCanvas = document.getElementById('cube-canvas');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
camera.position.set(4, 4, 5.5);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(160, 160);
cubeCanvas.appendChild(renderer.domElement);

const cubeGroup = new THREE.Group();
scene.add(cubeGroup);

const FACE_COLORS = {
  U: 0xFFFFFF, D: 0xF5E04A, F: 0x3DA04F, B: 0x3465A4, L: 0xE8891C, R: 0xD94B4B,
};

const stickers = [];
const cubies = [];
function makeSticker(color, size=0.9) {
  const geo = new THREE.PlaneGeometry(size, size);
  const mat = new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide });
  return new THREE.Mesh(geo, mat);
}
function makeCubie(x, y, z) {
  const group = new THREE.Group();
  group.position.set(x, y, z);
  // black cube base
  const base = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshBasicMaterial({ color: 0x0A0A0A })
  );
  group.add(base);
  // stickers — only if outward-facing
  if (y === 1) { const s = makeSticker(FACE_COLORS.U); s.rotation.x = -Math.PI/2; s.position.y = 0.51; group.add(s); }
  if (y === -1){ const s = makeSticker(FACE_COLORS.D); s.rotation.x = Math.PI/2;  s.position.y = -0.51; group.add(s); }
  if (z === 1) { const s = makeSticker(FACE_COLORS.F); s.position.z = 0.51; group.add(s); }
  if (z === -1){ const s = makeSticker(FACE_COLORS.B); s.rotation.y = Math.PI;   s.position.z = -0.51; group.add(s); }
  if (x === -1){ const s = makeSticker(FACE_COLORS.L); s.rotation.y = -Math.PI/2; s.position.x = -0.51; group.add(s); }
  if (x === 1) { const s = makeSticker(FACE_COLORS.R); s.rotation.y = Math.PI/2;  s.position.x = 0.51; group.add(s); }
  return group;
}
for (let x = -1; x <= 1; x++)
  for (let y = -1; y <= 1; y++)
    for (let z = -1; z <= 1; z++) {
      const c = makeCubie(x, y, z);
      c.userData = { hx: x, hy: y, hz: z };
      cubies.push(c);
      cubeGroup.add(c);
    }

// Store scrambled rotations per cubie
function scramble() {
  cubies.forEach(c => {
    c.userData.scrambleRot = new THREE.Euler(
      (Math.random() * 2 - 1) * Math.PI,
      (Math.random() * 2 - 1) * Math.PI,
      (Math.random() * 2 - 1) * Math.PI
    );
    c.userData.scrambleOffset = new THREE.Vector3(
      (Math.random() * 2 - 1) * 0.12,
      (Math.random() * 2 - 1) * 0.12,
      (Math.random() * 2 - 1) * 0.12
    );
  });
  cubeState.solveProgress = 0;
  document.getElementById('cube-state').textContent = 'scrambled';
}
scramble();

function setSolveProgress(p) {
  cubeState.solveProgress = p;
  cubies.forEach(c => {
    const sr = c.userData.scrambleRot;
    const so = c.userData.scrambleOffset;
    c.rotation.set(sr.x * (1 - p), sr.y * (1 - p), sr.z * (1 - p));
    c.position.set(
      c.userData.hx + so.x * (1 - p),
      c.userData.hy + so.y * (1 - p),
      c.userData.hz + so.z * (1 - p)
    );
  });
  const stateEl = document.getElementById('cube-state');
  if (p > 0.99) stateEl.textContent = 'SOLVED!';
  else if (p > 0.5) stateEl.textContent = 'solving... ' + Math.round(p * 100) + '%';
  else stateEl.textContent = 'scrambled';
}
setSolveProgress(0);

let cubeYaw = 0;
function animate() {
  cubeYaw += 0.005;
  cubeGroup.rotation.y = cubeYaw;
  cubeGroup.rotation.x = 0.3;
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
animate();

// Buttons
document.getElementById('scramble-btn').addEventListener('click', () => {
  scramble();
  setSolveProgress(0);
});
document.getElementById('solve-btn').addEventListener('click', () => {
  let p = cubeState.solveProgress;
  const step = () => {
    p = Math.min(1, p + 0.02);
    setSolveProgress(p);
    if (p < 1) requestAnimationFrame(step);
  };
  step();
});

// Scroll-to-solve — Finder body scroll drives cube solve progress
const finderGrid = document.getElementById('finder-grid');
finderGrid.addEventListener('scroll', () => {
  const max = finderGrid.scrollHeight - finderGrid.clientHeight;
  const p = max > 0 ? finderGrid.scrollTop / max : 0;
  setSolveProgress(Math.min(1, Math.max(0, p)));
});
// Also wire global wheel events for desktop feel
document.addEventListener('wheel', e => {
  if (document.getElementById('folder-window').classList.contains('hidden')) {
    // scroll drives solve when no folder open
    const delta = e.deltaY;
    let p = cubeState.solveProgress + delta * 0.0006;
    p = Math.min(1, Math.max(0, p));
    setSolveProgress(p);
  }
}, { passive: true });

// ------------- SHERLOCK NETWORK GRAPH -------------
const sherlockCanvas = document.getElementById('sherlock-canvas');
const sctx = sherlockCanvas.getContext('2d');

const nodes = [
  { id: 'jake',       label: 'Jake Ruth',       x: 330, y: 180, r: 22, kind: 'self' },
  { id: 'su',         label: 'Stock Unlock',    x: 170, y: 90,  r: 16, kind: 'co' },
  { id: 'oscar',      label: 'Oscar Health',    x: 120, y: 220, r: 14, kind: 'co' },
  { id: 'youni',      label: 'Youni',           x: 100, y: 310, r: 12, kind: 'co' },
  { id: 'ch',         label: 'CommerceHub',     x: 200, y: 320, r: 13, kind: 'co' },
  { id: 'suny',       label: 'SUNY Albany',     x: 310, y: 320, r: 14, kind: 'edu' },
  { id: 'acm',        label: 'ACM Pres.',       x: 420, y: 310, r: 12, kind: 'edu' },
  { id: 'yc',         label: 'YC W22',          x: 480, y: 90,  r: 14, kind: 'tag' },
  { id: 'seed',       label: '$1.335M seed',    x: 560, y: 150, r: 13, kind: 'tag' },
  { id: 'profit',     label: 'Profitable',      x: 560, y: 230, r: 13, kind: 'tag' },
  { id: 'cube',       label: 'Rubik\'s (13.95s)',x: 500, y: 300, r: 14, kind: 'hobby' },
  { id: 'uni',        label: 'Unicycle',        x: 420, y: 80,  r: 11, kind: 'hobby' },
  { id: 'wed',        label: 'Getting married', x: 240, y: 40,  r: 11, kind: 'hobby' },
];
const edges = [
  ['jake','su'],['jake','oscar'],['jake','youni'],['jake','ch'],
  ['jake','suny'],['jake','acm'],['jake','cube'],['jake','uni'],['jake','wed'],
  ['su','yc'],['su','seed'],['su','profit'],
  ['suny','acm'],['suny','ch'],['oscar','su'],
];

let sherlockT = 0;
function drawSherlock() {
  sctx.clearRect(0, 0, sherlockCanvas.width, sherlockCanvas.height);
  // Grid background
  sctx.strokeStyle = 'rgba(0,0,0,0.04)';
  sctx.lineWidth = 1;
  for (let x = 0; x < sherlockCanvas.width; x += 18) {
    sctx.beginPath(); sctx.moveTo(x, 0); sctx.lineTo(x, sherlockCanvas.height); sctx.stroke();
  }
  for (let y = 0; y < sherlockCanvas.height; y += 18) {
    sctx.beginPath(); sctx.moveTo(0, y); sctx.lineTo(sherlockCanvas.width, y); sctx.stroke();
  }

  // Edges
  edges.forEach(([a, b]) => {
    const na = nodes.find(n => n.id === a);
    const nb = nodes.find(n => n.id === b);
    sctx.strokeStyle = '#666';
    sctx.lineWidth = 1;
    sctx.beginPath();
    sctx.moveTo(na.x, na.y);
    sctx.lineTo(nb.x, nb.y);
    sctx.stroke();
  });

  // Nodes
  const colors = {
    self: '#3465A4', co: '#D94B4B', edu: '#3DA04F', tag: '#E8891C', hobby: '#7A4DA6',
  };
  nodes.forEach(n => {
    sctx.fillStyle = colors[n.kind];
    sctx.strokeStyle = '#000';
    sctx.lineWidth = 1;
    sctx.beginPath();
    sctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
    sctx.fill();
    sctx.stroke();
    // label
    sctx.fillStyle = '#000';
    sctx.font = '500 10px "IBM Plex Sans", Geneva, sans-serif';
    sctx.textAlign = 'center';
    sctx.fillText(n.label, n.x, n.y + n.r + 12);
  });

  // Pulse ring on "jake"
  const me = nodes[0];
  sherlockT += 0.04;
  const pulse = (Math.sin(sherlockT) + 1) / 2;
  sctx.strokeStyle = `rgba(52,101,164,${0.5 * (1 - pulse)})`;
  sctx.lineWidth = 2;
  sctx.beginPath();
  sctx.arc(me.x, me.y, me.r + 6 + pulse * 10, 0, Math.PI * 2);
  sctx.stroke();
}
drawSherlock();
setInterval(() => {
  if (!document.getElementById('sherlock-window').classList.contains('hidden'))
    drawSherlock();
}, 40);

// Sherlock canvas node hover / click
sherlockCanvas.addEventListener('click', e => {
  const rect = sherlockCanvas.getBoundingClientRect();
  const scaleX = sherlockCanvas.width / rect.width;
  const scaleY = sherlockCanvas.height / rect.height;
  const x = (e.clientX - rect.left) * scaleX;
  const y = (e.clientY - rect.top) * scaleY;
  const hit = nodes.find(n => Math.hypot(n.x - x, n.y - y) < n.r);
  if (hit) {
    document.getElementById('sherlock-status-bar').textContent =
      `> ${hit.label} — connected to ${edges.filter(e => e[0]===hit.id || e[1]===hit.id).length} item(s)`;
  }
});

// Sherlock channel toggle (cosmetic)
document.querySelectorAll('.sherlock-channels .chan').forEach(c => {
  c.addEventListener('click', () => {
    document.querySelectorAll('.sherlock-channels .chan').forEach(x => x.classList.remove('active'));
    c.classList.add('active');
  });
});

// Sherlock search button (cosmetic)
document.getElementById('sherlock-go').addEventListener('click', () => {
  const q = document.getElementById('sherlock-input').value;
  document.getElementById('sherlock-status-bar').textContent =
    `Found 18 items matching "${q}" — click a node to inspect.`;
});

// ------------- INITIAL STATE -------------
focusWindow(document.getElementById('finder-window'));
