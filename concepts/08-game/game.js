// Concept 08 — Explorable Pixel World
// Vanilla JS canvas game. No build. No engine.

(() => {
  'use strict';

  // ----- Setup -----
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  const minimap = document.getElementById('minimap');
  const mctx = minimap.getContext('2d');
  const tooltipEl = document.getElementById('tooltip');
  const modalScrim = document.getElementById('modalScrim');
  const modalTitle = document.getElementById('modalTitle');
  const modalBody = document.getElementById('modalBody');
  const modalEra = document.getElementById('modalEra');
  const modalClose = document.getElementById('modalClose');

  ctx.imageSmoothingEnabled = false;
  mctx.imageSmoothingEnabled = false;

  // World is larger than viewport; camera follows player.
  const WORLD_W = 1600;
  const WORLD_H = 1200;
  const VIEW_W = canvas.width;   // 800
  const VIEW_H = canvas.height;  // 600

  // ----- Landmarks -----
  // Each has x,y (world center), radius (trigger), drawer, info.
  const landmarks = [
    {
      id: 'albany',
      x: 240, y: 300,
      w: 120, h: 110,
      triggerR: 110,
      color: '#a36bff',
      accent: '#ffd35e',
      name: 'SUNY Albany',
      era: '2011 — 2015',
      blurb: 'ACM president. Upstate roots.',
      body: `
        <p>Studied computer science in upstate New York, a couple hours north of the Westchester
        town I grew up in. Ran the ACM chapter — hackathons, tech talks, a lot of
        pizza.</p>
        <p>First taste of shipping things people used. Also the first time I realized
        that "software engineer" was a job you could actually have.</p>
      `,
      kind: 'school',
    },
    {
      id: 'oscar',
      x: 1200, y: 280,
      w: 70, h: 220,
      triggerR: 110,
      color: '#ff7aa8',
      accent: '#5ef3ff',
      name: 'Oscar Health HQ',
      era: '2017 — 2021',
      blurb: 'Four years in NYC health-tech.',
      body: `
        <p>Four years at Oscar in NYC working on consumer-facing health insurance
        software. Learned how to ship at scale, work across a big org, and survive
        an open enrollment cycle.</p>
        <p>Also: that time I rode a unicycle across the stage at an all-hands while
        solving a Rubik's cube. Ask me about it.</p>
      `,
      kind: 'tower',
    },
    {
      id: 'stockunlock',
      x: 780, y: 800,
      w: 150, h: 140,
      triggerR: 130,
      color: '#5ef3ff',
      accent: '#ff5ed2',
      name: 'Stock Unlock HQ',
      era: '2021 — present',
      blurb: 'YC W22 &middot; $1.335M seed &middot; profitable.',
      body: `
        <p>Co-founded Stock Unlock (YC W22). Raised a $1.335M seed, grew to
        eight at peak, built an investing tool people actually pay for.</p>
        <p>Built it, scaled it, got it to a profitable place. It's a side
        business now — not my full-time. Looking for the next chapter.</p>
      `,
      kind: 'neon',
    },
    {
      id: 'unicycle',
      x: 380, y: 880,
      w: 140, h: 70,
      triggerR: 100,
      color: '#ffd35e',
      accent: '#ff5ed2',
      name: 'Talent Show Stage',
      era: 'One memorable afternoon',
      blurb: 'Unicycle. Rubik\'s cube. Simultaneously.',
      body: `
        <p>Oscar talent show. I rode a unicycle across the stage while solving
        a Rubik's cube. This is a real thing that happened, witnessed by roughly
        a thousand coworkers.</p>
        <p>Competitive cuber since I was a kid. The unicycle was the new variable.</p>
      `,
      kind: 'stage',
    },
    {
      id: 'wedding',
      x: 1280, y: 880,
      w: 120, h: 100,
      triggerR: 110,
      color: '#ffb3d9',
      accent: '#ffd35e',
      name: 'Wedding Altar',
      era: 'Soon',
      blurb: 'Getting married. New chapter.',
      body: `
        <p>Getting married. A good reason to think carefully about what the
        next chapter of work looks like, and who I want to spend the weekdays
        building with.</p>
        <p>I believe in serendipity and in long walks. Both have been paying off
        lately.</p>
      `,
      kind: 'altar',
    },
    {
      id: 'cube',
      x: 820, y: 420,
      w: 64, h: 64,
      triggerR: 90,
      color: '#7aff9e',
      accent: '#ff5ed2',
      name: 'The Rubik\'s Monument',
      era: 'Always',
      blurb: 'Competitive cuber. Sub-20 on a good day.',
      body: `
        <p>Started cubing as a kid. Still cube. There's something about pattern
        recognition under time pressure that scratches the same itch as good
        engineering.</p>
        <p>If you also cube: we will get along.</p>
      `,
      kind: 'cube',
    },
  ];

  // ----- Decorations (trees, rocks) -----
  // Stable pseudo-random placement using a seeded generator.
  function mulberry32(a) {
    return function() {
      let t = (a += 0x6D2B79F5);
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const rand = mulberry32(1337);

  const decor = [];
  const DECOR_COUNT = 140;
  for (let i = 0; i < DECOR_COUNT; i++) {
    const type = rand() < 0.65 ? 'tree' : rand() < 0.5 ? 'rock' : 'flower';
    const dx = 40 + rand() * (WORLD_W - 80);
    const dy = 40 + rand() * (WORLD_H - 80);
    // avoid landmarks
    let ok = true;
    for (const lm of landmarks) {
      const cx = lm.x, cy = lm.y;
      if (Math.hypot(dx - cx, dy - cy) < 130) { ok = false; break; }
    }
    if (!ok) continue;
    decor.push({ type, x: dx, y: dy, jig: rand() * Math.PI * 2 });
  }

  // Stars for the twilight sky backdrop (parallax)
  const stars = [];
  const SR = mulberry32(42);
  for (let i = 0; i < 160; i++) {
    stars.push({
      x: SR() * WORLD_W,
      y: SR() * WORLD_H,
      r: SR() * 1.4 + 0.3,
      tw: SR() * Math.PI * 2,
    });
  }

  // Paths (simple light-colored curves connecting landmarks)
  // We'll just draw a big curve around the map center. Procedural feel.

  // ----- Player -----
  const player = {
    x: 800, y: 600,
    w: 18, h: 22,
    vx: 0, vy: 0,
    speed: 160,      // px/sec
    facing: 0,       // 0 down, 1 up, 2 left, 3 right
    step: 0,         // animation counter
  };

  // ----- Input -----
  const keys = new Set();
  window.addEventListener('keydown', (e) => {
    const k = e.key.toLowerCase();
    keys.add(k);
    if (['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright',' '].includes(k)) {
      e.preventDefault();
    }
    if (k === 'e' || k === ' ') {
      tryInteract();
    }
    if (k === 'escape') closeModal();
  }, { passive: false });
  window.addEventListener('keyup', (e) => {
    keys.delete(e.key.toLowerCase());
  });

  // ----- Collision -----
  // Landmarks are AABB obstacles. World edges are obstacles.
  function collides(nx, ny) {
    // world bounds (with a margin so player doesn't wander off)
    if (nx < 8 || ny < 8 || nx + player.w > WORLD_W - 8 || ny + player.h > WORLD_H - 8) return true;
    for (const lm of landmarks) {
      const bx = lm.x - lm.w/2;
      const by = lm.y - lm.h/2;
      // slightly generous - keep player out of building footprint
      if (nx + player.w > bx && nx < bx + lm.w && ny + player.h > by && ny < by + lm.h) {
        return true;
      }
    }
    return false;
  }

  // ----- Interaction -----
  let nearest = null;
  function updateProximity() {
    let best = null, bestD = Infinity;
    const px = player.x + player.w/2;
    const py = player.y + player.h/2;
    for (const lm of landmarks) {
      const d = Math.hypot(px - lm.x, py - lm.y);
      if (d < lm.triggerR && d < bestD) { best = lm; bestD = d; }
    }
    nearest = best;
    renderTooltip();
  }

  function renderTooltip() {
    if (!nearest || modalScrim.classList.contains('show')) {
      tooltipEl.classList.remove('show');
      return;
    }
    tooltipEl.classList.add('show');
    tooltipEl.innerHTML =
      `<span class="t-name">${nearest.name}</span>` +
      `<span class="t-blurb">${nearest.blurb}</span>` +
      `<span class="t-hint">Press E or SPACE</span>`;
    // Position over the landmark (project world -> screen)
    const sx = (nearest.x - camera.x);
    const sy = (nearest.y - camera.y) - (nearest.h/2) - 8;
    // tooltip lives inside .frame which scales with canvas; use % coords
    const rect = canvas.getBoundingClientRect();
    const scaleX = rect.width / VIEW_W;
    const scaleY = rect.height / VIEW_H;
    tooltipEl.style.left = (sx * scaleX) + 'px';
    tooltipEl.style.top  = (sy * scaleY) + 'px';
  }

  function tryInteract() {
    if (modalScrim.classList.contains('show')) {
      closeModal();
      return;
    }
    if (!nearest) return;
    openModal(nearest);
  }

  function openModal(lm) {
    modalTitle.textContent = lm.name;
    modalEra.textContent = lm.era;
    modalBody.innerHTML = lm.body;
    modalScrim.classList.add('show');
    tooltipEl.classList.remove('show');
  }
  function closeModal() {
    modalScrim.classList.remove('show');
  }
  modalClose.addEventListener('click', closeModal);
  modalScrim.addEventListener('click', (e) => {
    if (e.target === modalScrim) closeModal();
  });

  // ----- Camera -----
  const camera = { x: 0, y: 0 };
  function updateCamera() {
    const targetX = player.x + player.w/2 - VIEW_W/2;
    const targetY = player.y + player.h/2 - VIEW_H/2;
    // clamp
    const cx = Math.max(0, Math.min(WORLD_W - VIEW_W, targetX));
    const cy = Math.max(0, Math.min(WORLD_H - VIEW_H, targetY));
    // smooth
    camera.x += (cx - camera.x) * 0.15;
    camera.y += (cy - camera.y) * 0.15;
  }

  // ----- Update -----
  let last = performance.now();
  function update(dt) {
    if (modalScrim.classList.contains('show')) {
      player.vx = 0; player.vy = 0;
      return;
    }
    let dx = 0, dy = 0;
    if (keys.has('w') || keys.has('arrowup')) dy -= 1;
    if (keys.has('s') || keys.has('arrowdown')) dy += 1;
    if (keys.has('a') || keys.has('arrowleft')) dx -= 1;
    if (keys.has('d') || keys.has('arrowright')) dx += 1;
    if (dx !== 0 && dy !== 0) { dx *= 0.7071; dy *= 0.7071; }
    player.vx = dx * player.speed;
    player.vy = dy * player.speed;

    if (dx < 0) player.facing = 2;
    else if (dx > 0) player.facing = 3;
    else if (dy < 0) player.facing = 1;
    else if (dy > 0) player.facing = 0;

    // move axes separately so you slide along walls
    const nx = player.x + player.vx * dt;
    if (!collides(nx, player.y)) player.x = nx;
    const ny = player.y + player.vy * dt;
    if (!collides(player.x, ny)) player.y = ny;

    if (dx !== 0 || dy !== 0) player.step += dt * 8;

    updateCamera();
    updateProximity();
  }

  // ----- Draw helpers -----
  function rect(x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(Math.round(x - camera.x), Math.round(y - camera.y), w, h);
  }
  function rectStroke(x, y, w, h, color) {
    ctx.strokeStyle = color;
    ctx.strokeRect(Math.round(x - camera.x) + 0.5, Math.round(y - camera.y) + 0.5, w, h);
  }
  function circle(x, y, r, color) {
    ctx.beginPath();
    ctx.arc(Math.round(x - camera.x), Math.round(y - camera.y), r, 0, Math.PI*2);
    ctx.fillStyle = color;
    ctx.fill();
  }

  // ----- Drawings -----
  function drawBackground(t) {
    // twilight gradient
    const g = ctx.createLinearGradient(0, 0, 0, VIEW_H);
    g.addColorStop(0, '#0a0e2e');
    g.addColorStop(0.5, '#0e133a');
    g.addColorStop(1, '#151c55');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, VIEW_W, VIEW_H);

    // stars (parallax: move slower than camera)
    for (const s of stars) {
      const px = s.x - camera.x * 0.3;
      const py = s.y - camera.y * 0.3;
      // wrap
      const wx = ((px % VIEW_W) + VIEW_W) % VIEW_W;
      const wy = ((py % VIEW_H) + VIEW_H) % VIEW_H;
      const tw = 0.6 + 0.4 * Math.sin(t * 0.002 + s.tw);
      ctx.fillStyle = `rgba(200,220,255,${0.3 + tw * 0.5})`;
      ctx.fillRect(wx, wy, s.r, s.r);
    }

    // ground tiles — large dim-green hex-ish rectangles
    const tileSize = 48;
    const startX = Math.floor(camera.x / tileSize) * tileSize;
    const startY = Math.floor(camera.y / tileSize) * tileSize;
    for (let y = startY; y < camera.y + VIEW_H + tileSize; y += tileSize) {
      for (let x = startX; x < camera.x + VIEW_W + tileSize; x += tileSize) {
        // checker + noise
        const hash = ((x * 73856093) ^ (y * 19349663)) >>> 0;
        const v = (hash % 7) / 7;
        const base = ((Math.floor(x/tileSize) + Math.floor(y/tileSize)) % 2 === 0) ? 1 : 0;
        const r = 16 + v*8 + base*4;
        const g2 = 28 + v*12 + base*6;
        const b = 54 + v*14 + base*8;
        ctx.fillStyle = `rgb(${r|0},${g2|0},${b|0})`;
        ctx.fillRect(x - camera.x, y - camera.y, tileSize, tileSize);
      }
    }

    // a winding path drawn as faint points
    ctx.strokeStyle = 'rgba(180,200,255,0.08)';
    ctx.lineWidth = 22;
    ctx.lineCap = 'round';
    ctx.beginPath();
    const pathPts = [
      [240, 340], [500, 500], [820, 420], [780, 800], [380, 880], [820, 950], [1280, 880], [1200, 380], [820, 420]
    ];
    for (let i = 0; i < pathPts.length; i++) {
      const [px, py] = pathPts[i];
      if (i === 0) ctx.moveTo(px - camera.x, py - camera.y);
      else ctx.lineTo(px - camera.x, py - camera.y);
    }
    ctx.stroke();
    ctx.lineWidth = 1;
  }

  function drawDecor(t) {
    for (const d of decor) {
      const x = d.x, y = d.y;
      if (x < camera.x - 40 || x > camera.x + VIEW_W + 40) continue;
      if (y < camera.y - 40 || y > camera.y + VIEW_H + 40) continue;
      if (d.type === 'tree') {
        const sway = Math.sin(t * 0.001 + d.jig) * 1.5;
        // trunk
        rect(x - 2, y, 4, 10, '#3a2a12');
        // foliage (twilight pine)
        ctx.fillStyle = '#1a3a2a';
        const lx = Math.round(x - camera.x);
        const ly = Math.round(y - camera.y);
        ctx.beginPath();
        ctx.moveTo(lx + sway, ly - 18);
        ctx.lineTo(lx - 10, ly + 2);
        ctx.lineTo(lx + 10, ly + 2);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#245a3a';
        ctx.beginPath();
        ctx.moveTo(lx + sway * 0.6, ly - 24);
        ctx.lineTo(lx - 7, ly - 6);
        ctx.lineTo(lx + 7, ly - 6);
        ctx.closePath();
        ctx.fill();
      } else if (d.type === 'rock') {
        circle(x, y + 4, 5, '#3a3f66');
        circle(x + 2, y + 2, 3, '#5a608c');
      } else if (d.type === 'flower') {
        const tw = 0.5 + 0.5 * Math.sin(t * 0.003 + d.jig);
        rect(x, y, 2, 5, '#2a6a3a');
        ctx.fillStyle = `rgba(255,180,240,${0.4 + tw*0.5})`;
        ctx.fillRect(Math.round(x - camera.x) - 1, Math.round(y - camera.y) - 2, 4, 3);
      }
    }
  }

  function drawLandmarks(t) {
    for (const lm of landmarks) {
      const pulse = 0.5 + 0.5 * Math.sin(t * 0.003 + lm.x);
      // glow
      const gx = lm.x - camera.x;
      const gy = lm.y - camera.y;
      const rad = Math.max(lm.w, lm.h) * 1.2;
      const gg = ctx.createRadialGradient(gx, gy, 0, gx, gy, rad);
      gg.addColorStop(0, hexA(lm.color, 0.25 + pulse * 0.15));
      gg.addColorStop(1, hexA(lm.color, 0));
      ctx.fillStyle = gg;
      ctx.fillRect(gx - rad, gy - rad, rad*2, rad*2);

      // body
      const bx = lm.x - lm.w/2;
      const by = lm.y - lm.h/2;
      if (lm.kind === 'school') {
        // red brick-ish w/ clock
        rect(bx, by, lm.w, lm.h, '#6a3a2a');
        rect(bx + 8, by + 8, lm.w - 16, lm.h - 20, '#8a4a33');
        // windows
        for (let i = 0; i < 4; i++) {
          for (let j = 0; j < 3; j++) {
            rect(bx + 16 + i*22, by + 22 + j*22, 12, 14, '#ffd35e');
            rect(bx + 16 + i*22, by + 22 + j*22, 12, 14, `rgba(0,0,0,${0.3})`);
            rect(bx + 16 + i*22, by + 22 + j*22, 12, 14, `rgba(255,211,94,${0.4 + pulse*0.3})`);
          }
        }
        // roof
        rect(bx - 4, by - 6, lm.w + 8, 8, '#4a2a1a');
        // flag pole w/ ACM flag
        rect(bx + lm.w/2 - 1, by - 26, 2, 20, '#aaa');
        ctx.fillStyle = '#a36bff';
        ctx.fillRect(Math.round(bx + lm.w/2 - camera.x), Math.round(by - 24 - camera.y), 14, 8);
      } else if (lm.kind === 'tower') {
        // tall NYC skyscraper
        rect(bx, by, lm.w, lm.h, '#1a1f45');
        rect(bx + 2, by + 2, lm.w - 4, lm.h - 4, '#232a5a');
        // window grid, animated
        for (let i = 0; i < 6; i++) {
          for (let j = 0; j < 18; j++) {
            const on = ((i * 91 + j * 37 + Math.floor(t*0.002)) % 7) < 4;
            rect(bx + 6 + i*10, by + 6 + j*11, 6, 7, on ? '#ffd35e' : '#0a0f2a');
          }
        }
        // red antenna
        rect(bx + lm.w/2 - 1, by - 14, 2, 14, '#ccc');
        circle(lm.x, by - 14, 2 + pulse*1.5, '#ff5ed2');
      } else if (lm.kind === 'neon') {
        // stock unlock - neon glass cube
        ctx.fillStyle = '#0a1030';
        ctx.fillRect(Math.round(bx - camera.x), Math.round(by - camera.y), lm.w, lm.h);
        // neon outline
        ctx.strokeStyle = hexA('#5ef3ff', 0.8 + pulse*0.2);
        ctx.lineWidth = 2;
        ctx.strokeRect(Math.round(bx - camera.x) + 1, Math.round(by - camera.y) + 1, lm.w - 2, lm.h - 2);
        ctx.lineWidth = 1;
        // chart-looking zigzag
        ctx.strokeStyle = hexA('#ff5ed2', 0.9);
        ctx.lineWidth = 2;
        ctx.beginPath();
        const cx0 = bx - camera.x + 12;
        const cy0 = by - camera.y + lm.h - 20;
        ctx.moveTo(cx0, cy0);
        const cs = [0, -10, -4, -18, -12, -30, -22, -44];
        for (let i = 0; i < cs.length; i++) {
          ctx.lineTo(cx0 + i * 16, cy0 + cs[i]);
        }
        ctx.stroke();
        ctx.lineWidth = 1;
        // logo text
        ctx.fillStyle = hexA('#ffd35e', 0.7 + pulse*0.3);
        ctx.font = 'bold 10px ui-monospace, monospace';
        ctx.textAlign = 'center';
        ctx.fillText('STOCK UNLOCK', lm.x - camera.x, by - camera.y + 16);
      } else if (lm.kind === 'stage') {
        // talent show stage with tiny unicycle
        rect(bx, by + lm.h - 18, lm.w, 18, '#3a1a1a');
        rect(bx, by + lm.h - 22, lm.w, 4, '#ff5ed2');
        // curtains
        rect(bx - 6, by - 10, 12, lm.h, '#8a1a3a');
        rect(bx + lm.w - 6, by - 10, 12, lm.h, '#8a1a3a');
        // top sign
        rect(bx - 10, by - 10, lm.w + 20, 10, '#1a1f45');
        ctx.fillStyle = hexA('#ffd35e', 0.7 + pulse*0.3);
        ctx.font = 'bold 8px ui-monospace, monospace';
        ctx.textAlign = 'center';
        ctx.fillText('TALENT SHOW', lm.x - camera.x, by - 2 - camera.y);
        // tiny unicycle + figure on stage
        const ux = lm.x - camera.x;
        const uy = by + lm.h - 26 - camera.y;
        // wheel
        ctx.strokeStyle = '#ddd';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(ux, uy + 8, 5, 0, Math.PI*2);
        ctx.stroke();
        ctx.lineWidth = 1;
        // seat post
        rect(lm.x - 1, by + lm.h - 26 - 6, 2, 6, '#aaa');
        // tiny person
        rect(lm.x - 2, by + lm.h - 40, 4, 6, '#ffd8b3');
        // tiny cube in hand
        const cubePulse = (Math.sin(t*0.006) + 1) * 0.5;
        ctx.fillStyle = `rgb(${255}, ${90 + cubePulse*80}, ${210})`;
        ctx.fillRect(Math.round(lm.x + 3 - camera.x), Math.round(by + lm.h - 38 - camera.y), 3, 3);
      } else if (lm.kind === 'altar') {
        // wedding altar — arch with flowers
        rect(bx + 14, by + 20, 6, lm.h - 20, '#d4c2a8');
        rect(bx + lm.w - 20, by + 20, 6, lm.h - 20, '#d4c2a8');
        ctx.strokeStyle = '#d4c2a8';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.arc(lm.x - camera.x, by + 20 - camera.y, (lm.w - 28)/2, Math.PI, 0);
        ctx.stroke();
        ctx.lineWidth = 1;
        // flower ring
        const petalColors = ['#ff9ec7', '#ffb3d9', '#ffd35e', '#ff5ed2'];
        for (let i = 0; i < 16; i++) {
          const a = Math.PI + (i / 15) * Math.PI;
          const r = (lm.w - 28) / 2;
          const px = lm.x + Math.cos(a) * r;
          const py = by + 20 + Math.sin(a) * r;
          const c = petalColors[i % petalColors.length];
          ctx.fillStyle = hexA(c, 0.7 + pulse*0.3);
          ctx.fillRect(Math.round(px - camera.x) - 2, Math.round(py - camera.y) - 2, 4, 4);
        }
        // carpet
        rect(bx + 10, by + lm.h - 18, lm.w - 20, 14, '#8a1a3a');
      } else if (lm.kind === 'cube') {
        // rubik's cube monument
        const s = lm.w;
        const ox = bx - camera.x;
        const oy = by - camera.y;
        // shadow
        ctx.fillStyle = 'rgba(0,0,0,0.35)';
        ctx.fillRect(ox + 4, oy + s, s, 4);
        // face
        const cellColors = ['#ffd35e', '#ff5ed2', '#5ef3ff', '#7aff9e', '#ff7a3a', '#ffffff', '#ffd35e', '#ff5ed2', '#5ef3ff'];
        const cs = Math.floor(s / 3);
        for (let i = 0; i < 3; i++) {
          for (let j = 0; j < 3; j++) {
            const c = cellColors[(i*3 + j + Math.floor(t*0.001)) % cellColors.length];
            ctx.fillStyle = c;
            ctx.fillRect(ox + j*cs + 2, oy + i*cs + 2, cs - 3, cs - 3);
          }
        }
        // outline glow
        ctx.strokeStyle = hexA('#ffffff', 0.25 + pulse*0.25);
        ctx.lineWidth = 2;
        ctx.strokeRect(ox + 1, oy + 1, s - 2, s - 2);
        ctx.lineWidth = 1;
      }

      // tiny name plate below
      ctx.fillStyle = hexA('#e8ecff', 0.7);
      ctx.font = '10px ui-monospace, monospace';
      ctx.textAlign = 'center';
      ctx.fillText(lm.name.toUpperCase(), lm.x - camera.x, lm.y + lm.h/2 + 14 - camera.y);
    }
  }

  function drawPlayer(t) {
    const px = Math.round(player.x - camera.x);
    const py = Math.round(player.y - camera.y);
    // shadow
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath();
    ctx.ellipse(px + player.w/2, py + player.h + 2, 8, 3, 0, 0, Math.PI*2);
    ctx.fill();

    // body (little adventurer — white shirt, dark pants, cyan cap)
    const bob = Math.sin(player.step) * 1;
    // legs
    ctx.fillStyle = '#1a1f45';
    ctx.fillRect(px + 4, py + 14, 4, 7 + (bob > 0 ? 1 : 0));
    ctx.fillRect(px + 10, py + 14, 4, 7 + (bob < 0 ? 1 : 0));
    // body shirt
    ctx.fillStyle = '#e8ecff';
    ctx.fillRect(px + 3, py + 8, 12, 8);
    // belt
    ctx.fillStyle = '#ffd35e';
    ctx.fillRect(px + 3, py + 14, 12, 1);
    // head
    ctx.fillStyle = '#ffd8b3';
    ctx.fillRect(px + 5, py + 2, 8, 6);
    // hair/cap
    ctx.fillStyle = '#5ef3ff';
    ctx.fillRect(px + 4, py + 1, 10, 3);
    ctx.fillRect(px + 3, py + 2, 2, 2);
    ctx.fillRect(px + 13, py + 2, 2, 2);
    // eyes
    ctx.fillStyle = '#0a0a14';
    if (player.facing === 2) {
      ctx.fillRect(px + 5, py + 5, 1, 1);
    } else if (player.facing === 3) {
      ctx.fillRect(px + 12, py + 5, 1, 1);
    } else if (player.facing === 1) {
      // facing up: no eyes visible
    } else {
      ctx.fillRect(px + 6, py + 5, 1, 1);
      ctx.fillRect(px + 11, py + 5, 1, 1);
    }
  }

  function drawMinimap() {
    mctx.clearRect(0, 0, minimap.width, minimap.height);
    mctx.fillStyle = '#07091a';
    mctx.fillRect(0, 0, minimap.width, minimap.height);
    const sx = minimap.width / WORLD_W;
    const sy = minimap.height / WORLD_H;
    // landmarks
    for (const lm of landmarks) {
      mctx.fillStyle = lm.color;
      mctx.fillRect(Math.round(lm.x * sx) - 2, Math.round(lm.y * sy) - 2, 4, 4);
    }
    // viewport rect
    mctx.strokeStyle = 'rgba(232,236,255,0.25)';
    mctx.lineWidth = 1;
    mctx.strokeRect(Math.round(camera.x * sx), Math.round(camera.y * sy), VIEW_W * sx, VIEW_H * sy);
    // player
    mctx.fillStyle = '#ffffff';
    mctx.fillRect(Math.round(player.x * sx) - 1, Math.round(player.y * sy) - 1, 3, 3);
  }

  function hexA(hex, a) {
    // #rrggbb -> rgba
    const h = hex.replace('#','');
    const r = parseInt(h.slice(0,2), 16);
    const g = parseInt(h.slice(2,4), 16);
    const b = parseInt(h.slice(4,6), 16);
    return `rgba(${r},${g},${b},${a})`;
  }

  // ----- Main Loop -----
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    update(dt);

    ctx.clearRect(0, 0, VIEW_W, VIEW_H);
    drawBackground(now);
    drawDecor(now);
    drawLandmarks(now);
    drawPlayer(now);
    drawMinimap();

    // vignette
    const vg = ctx.createRadialGradient(VIEW_W/2, VIEW_H/2, VIEW_W*0.35, VIEW_W/2, VIEW_H/2, VIEW_W*0.7);
    vg.addColorStop(0, 'rgba(0,0,0,0)');
    vg.addColorStop(1, 'rgba(0,0,0,0.55)');
    ctx.fillStyle = vg;
    ctx.fillRect(0, 0, VIEW_W, VIEW_H);

    // update tooltip position (camera moved even without proximity change)
    if (nearest && !modalScrim.classList.contains('show')) renderTooltip();

    requestAnimationFrame(frame);
  }

  // Initial camera snap
  camera.x = Math.max(0, Math.min(WORLD_W - VIEW_W, player.x - VIEW_W/2));
  camera.y = Math.max(0, Math.min(WORLD_H - VIEW_H, player.y - VIEW_H/2));

  requestAnimationFrame(frame);
})();
