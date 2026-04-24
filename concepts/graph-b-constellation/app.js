// -----------------------------------------------------------------------------
// Jake Ruth — Constellation / Star Map
// Pure canvas rendering with hit-testing. No build, CDN fonts only.
// -----------------------------------------------------------------------------

(() => {
  const canvas = document.getElementById('sky');
  const ctx = canvas.getContext('2d');

  // ---------------------------------------------------------------------------
  // Constellation + star data. Coordinates are in a virtual 1000x620 "sky"
  // and scaled to viewport at render time. Each constellation has a `shape`
  // that is a list of node-pair indexes (by id within the constellation) used
  // to draw the faint connecting lines.
  // ---------------------------------------------------------------------------

  const constellations = [
    {
      id: 'career',
      name: 'Ursa Careerum',
      color: '#ff8a5b', // warm red-giant
      blurb: 'the arc so far',
      stars: [
        { id: 'commercehub', label: 'CommerceHub',  x: 120, y: 120, mag: 1.4,
          meta: '2013–2016',
          body: "First real gig — e-commerce plumbing at scale while I was still in college. Learned what enterprise code smells like and how to ship anyway. Met my future Stock Unlock co-founder here." },
        { id: 'youni', label: 'Youni',  x: 200, y: 200, mag: 1.2,
          meta: '2015–2016',
          body: "College-era app for campus life. Swung big, didn't connect, learned a ton about product and the real cost of fast." },
        { id: 'oscar', label: 'Oscar Health',  x: 310, y: 150, mag: 1.6,
          meta: '2017–2021',
          body: "Healthcare at a startup-that-wasn't-quite-startup-anymore. Built chatbots, insurance pipelines, shipped for millions of users. Good humans, messy domain." },
        { id: 'stockunlock', label: 'Stock Unlock',  x: 440, y: 210, mag: 2.4,
          meta: '2021 → now',
          body: "YC W22. Raised $1.335M seed. Grew to 8 people peak, thousands of customers, got to profitable. It's a side business now — still serving those customers, but I'm not full-time." },
        { id: 'next', label: 'Next',  x: 560, y: 130, mag: 2.0,
          meta: 'April 2026 →',
          body: "Next chapter. Not announced. Mostly reading, building small things, meditating, talking to interesting people. Serendipity is a strategy." }
      ],
      shape: [[0,1],[1,2],[2,3],[3,4]]
    },
    {
      id: 'skills',
      name: 'Caelum Fabrorum',
      color: '#9fd0ff', // blue-white
      blurb: 'tools of the trade',
      stars: [
        { id: 'python', label: 'Python', x: 720, y: 110, mag: 1.6,
          body: "My daily driver for most backend + scripting. Oscar, Stock Unlock, countless experiments." },
        { id: 'js', label: 'JS / TS', x: 820, y: 160, mag: 1.8,
          body: "Frontend for everything I've shipped. React by default. TS when the team is > 1." },
        { id: 'go', label: 'Go', x: 880, y: 240, mag: 1.2,
          body: "Reach for it when I need boring, fast, and single-binary. Used it for internal tooling + infra glue." },
        { id: 'react', label: 'React', x: 760, y: 230, mag: 1.4,
          body: "Built the Stock Unlock app in it. Components, hooks, the whole dance. Not religious about it." },
        { id: 'aws', label: 'AWS', x: 900, y: 350, mag: 1.3,
          body: "EC2, RDS, S3, Lambda, the usual suspects. I know just enough to be dangerous and to read the bill." },
        { id: 'postgres', label: 'Postgres', x: 820, y: 400, mag: 1.5,
          body: "My favorite database. If you can do it in Postgres, do it in Postgres." },
        { id: 'docker', label: 'Docker', x: 720, y: 380, mag: 1.1,
          body: "Containers, compose files, deployments. Glue that makes polyglot infra livable." },
        { id: 'systems', label: 'System Design', x: 660, y: 300, mag: 1.7,
          body: "The skill I've leveled up most by running a company. How to draw the boxes and make them not explode at 2am." }
      ],
      shape: [[0,1],[1,2],[2,4],[4,5],[5,6],[6,7],[7,0],[3,1],[3,7]]
    },
    {
      id: 'hobbies',
      name: 'Lusus Corona',
      color: '#ff9ec7', // pink-rose
      blurb: 'play',
      stars: [
        { id: 'rubiks', label: "Rubik's Cube", x: 150, y: 440, mag: 2.0,
          meta: '13.95s avg',
          body: "Competitive speedcuber. 13.95 second average. Muscle memory as meditation." },
        { id: 'skate', label: 'Skateboard', x: 260, y: 500, mag: 1.3,
          body: "Mostly for transport, sometimes for the kickflip attempt that keeps humbling me." },
        { id: 'ddr', label: 'DDR', x: 380, y: 470, mag: 1.1,
          body: "Dance Dance Revolution. Still a weirdly good cardio + coordination workout." },
        { id: 'rugby', label: 'Rugby', x: 320, y: 390, mag: 1.4,
          body: "Played through school. Taught me how to get hit and keep running — useful for startups." },
        { id: 'meditation', label: 'Meditation', x: 200, y: 360, mag: 2.1,
          body: "Daily practice. Quiet mornings, long sits occasionally. Makes the rest of the stack work better." },
        { id: 'unicycle', label: 'Unicycle + Cube', x: 100, y: 530, mag: 1.6,
          body: "Did a unicycle-while-solving-a-Rubik's-cube talent show bit. One of the few totally useless party tricks I'd recommend." },
        { id: 'guitar-hero', label: 'Guitar Hero', x: 420, y: 560, mag: 1.0,
          body: "Expert on the plastic guitar. Never got around to the real one. No regrets." }
      ],
      shape: [[0,5],[5,1],[1,6],[1,2],[2,3],[3,4],[4,0]]
    },
    {
      id: 'projects',
      name: 'Fabrica Stellae',
      color: '#8ee7b7', // green
      blurb: 'things shipped',
      stars: [
        { id: 'youni-app', label: 'Youni App', x: 80, y: 260, mag: 1.2,
          body: "College social app. Early lesson in product-market fit (or the lack of it)." },
        { id: 'oscar-chatbot', label: 'Oscar Chatbot', x: 180, y: 300, mag: 1.3,
          body: "NLU-ish pipeline for member questions. This was before LLMs were useful. We did it the hard way." },
        { id: 'su-core', label: 'Stock Unlock Core', x: 510, y: 300, mag: 2.3,
          body: "The financial analysis platform. Data pipelines, valuation models, UI, everything. Still humming along serving thousands." },
        { id: 'discord-bot', label: 'Discord Bot', x: 620, y: 470, mag: 1.0,
          body: "Little utility bot for a server I care about. Low stakes, high joy per line of code." },
        { id: 'email-self', label: 'Email Self-Host', x: 700, y: 520, mag: 1.1,
          body: "Ran my own mail server for a while. Would I recommend it? No. Do I regret it? Also no." }
      ],
      shape: [[0,1],[1,2],[2,3],[3,4]]
    },
    {
      id: 'people',
      name: 'Amici Stellarum',
      color: '#c9a8ff', // violet
      blurb: 'orbit',
      stars: [
        { id: 'daniel', label: 'Daniel Pronk', x: 640, y: 70, mag: 1.5,
          body: "Co-founder at Stock Unlock. The other half of most decisions that mattered." },
        { id: 'nick', label: 'Nick Puljik', x: 740, y: 60, mag: 1.3,
          body: "Longtime collaborator. The kind of engineer you want in a trench." },
        { id: 'peter', label: 'Peter (Oscar)', x: 820, y: 90, mag: 1.2,
          body: "Oscar-era manager/mentor who taught me most of what I know about technical leadership." },
        { id: 'alan', label: 'Alan Warren', x: 900, y: 140, mag: 1.3,
          body: "Mentor / founder friend. A walking reminder that taste compounds." }
      ],
      shape: [[0,1],[1,2],[2,3]]
    },
    {
      id: 'ai',
      name: 'Machina Lucis',
      color: '#f5dc8a', // pale gold
      blurb: 'new lights',
      stars: [
        { id: 'copilot', label: 'Copilot', x: 80, y: 70, mag: 1.0,
          body: "The first one that stuck. Autocomplete with opinions. Changed how I typed." },
        { id: 'cursor', label: 'Cursor', x: 170, y: 40, mag: 1.3,
          body: "IDE-as-agent. Big productivity jump once I stopped fighting it." },
        { id: 'claude-code', label: 'Claude Code', x: 280, y: 80, mag: 2.0,
          body: "The one I'm using right now, actually. Terminal-native agent. My current daily driver." },
        { id: 'codex', label: 'Codex', x: 380, y: 40, mag: 1.2,
          body: "Good at the kind of grunt work I used to dread on Sundays." },
        { id: 'cmux', label: 'CMUX', x: 480, y: 100, mag: 1.1,
          body: "Running multiple agents in parallel is the weirdest, most obvious productivity unlock of 2026." },
        { id: 'opus', label: 'Opus 4.5', x: 560, y: 50, mag: 1.4,
          body: "The model I reach for when the task actually matters. Big context + actual reasoning." }
      ],
      shape: [[0,1],[1,2],[2,3],[3,4],[4,5]]
    }
  ];

  // Flatten all stars with back-refs so we can render and hit-test easily.
  const stars = [];
  constellations.forEach((c, ci) => {
    c.stars.forEach((s, si) => {
      stars.push({
        ...s,
        constellationIndex: ci,
        constellationId: c.id,
        color: c.color,
        // Random phase for twinkle
        twinklePhase: Math.random() * Math.PI * 2,
        twinkleSpeed: 0.3 + Math.random() * 0.8,
        // For parallax: assign to a depth layer loosely by magnitude
        depth: s.mag > 1.8 ? 1.0 : s.mag > 1.3 ? 0.7 : 0.45
      });
    });
  });

  // Background star field — just for atmosphere, no meaning.
  const bgStars = [];
  for (let i = 0; i < 260; i++) {
    bgStars.push({
      x: Math.random() * 1000,
      y: Math.random() * 620,
      r: Math.random() * 1.1 + 0.2,
      depth: 0.15 + Math.random() * 0.35,
      tint: Math.random() < 0.12 ? 'blue' : Math.random() < 0.2 ? 'gold' : 'white',
      phase: Math.random() * Math.PI * 2,
      speed: 0.2 + Math.random() * 0.6,
      baseAlpha: 0.2 + Math.random() * 0.6
    });
  }

  // ---------------------------------------------------------------------------
  // Render state
  // ---------------------------------------------------------------------------
  const state = {
    w: 0, h: 0, dpr: 1,
    // sky scale: how we map virtual 1000x620 -> screen
    scale: 1,
    offX: 0, offY: 0,
    // camera transform (applied on top of sky scale, for zoom-to-star)
    camScale: 1, camX: 0, camY: 0,
    camScaleTarget: 1, camXTarget: 0, camYTarget: 0,
    // drift (ambient pan)
    driftX: 0, driftY: 0,
    // mouse
    mouseX: 0, mouseY: 0,
    hoverStar: null,
    focusedConstellation: null,  // id string
    selectedStar: null,
    t: 0,
    // Shooting star
    shoot: null,
    nextShootAt: 8000
  };

  function resize() {
    state.dpr = Math.min(window.devicePixelRatio || 1, 2);
    state.w = window.innerWidth;
    state.h = window.innerHeight;
    canvas.width = state.w * state.dpr;
    canvas.height = state.h * state.dpr;
    canvas.style.width = state.w + 'px';
    canvas.style.height = state.h + 'px';

    // Fit 1000x620 virtual sky into screen, cover-style
    const sx = state.w / 1000;
    const sy = state.h / 620;
    state.scale = Math.max(sx, sy);
    state.offX = (state.w - 1000 * state.scale) / 2;
    state.offY = (state.h - 620 * state.scale) / 2;
  }
  window.addEventListener('resize', resize);
  resize();

  // ---------------------------------------------------------------------------
  // Coordinate helpers
  // ---------------------------------------------------------------------------
  // Virtual (sky) coord -> screen pixel
  function project(vx, vy, depth = 1) {
    // Apply ambient drift (deeper layers move less)
    const d = depth;
    const px = vx + state.driftX * d;
    const py = vy + state.driftY * d;
    // Sky scale
    let sx = px * state.scale + state.offX;
    let sy = py * state.scale + state.offY;
    // Camera transform (zoom relative to cam center)
    const cx = state.w / 2, cy = state.h / 2;
    sx = cx + (sx - cx - state.camX) * state.camScale;
    sy = cy + (sy - cy - state.camY) * state.camScale;
    return { x: sx, y: sy };
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  function draw(dt) {
    state.t += dt;

    // Ease camera toward target
    const k = 0.08;
    state.camScale += (state.camScaleTarget - state.camScale) * k;
    state.camX += (state.camXTarget - state.camX) * k;
    state.camY += (state.camYTarget - state.camY) * k;

    // Ambient drift
    state.driftX += 0.015 * dt * 0.06; // ~0.2px/sec in virtual coords
    state.driftY += 0.009 * dt * 0.06;

    const cx = ctx;
    cx.save();
    cx.scale(state.dpr, state.dpr);
    cx.clearRect(0, 0, state.w, state.h);

    // Background stars
    for (const s of bgStars) {
      const tw = 0.5 + 0.5 * Math.sin(state.t * 0.001 * s.speed + s.phase);
      const alpha = s.baseAlpha * (0.4 + 0.6 * tw);
      const p = project(s.x, s.y, s.depth);
      if (p.x < -20 || p.x > state.w + 20 || p.y < -20 || p.y > state.h + 20) continue;
      let color;
      if (s.tint === 'blue') color = `rgba(200,220,255,${alpha})`;
      else if (s.tint === 'gold') color = `rgba(255,240,200,${alpha})`;
      else color = `rgba(240,240,255,${alpha})`;
      cx.fillStyle = color;
      cx.beginPath();
      cx.arc(p.x, p.y, s.r, 0, Math.PI * 2);
      cx.fill();
    }

    // Constellation lines (behind stars)
    for (const c of constellations) {
      const dim = state.focusedConstellation && state.focusedConstellation !== c.id;
      const alpha = dim ? 0.04 : (state.selectedStar ? 0.08 : 0.18);
      cx.strokeStyle = hexWithAlpha(c.color, alpha);
      cx.lineWidth = 1;
      cx.beginPath();
      for (const [ai, bi] of c.shape) {
        const a = c.stars[ai], b = c.stars[bi];
        const pa = project(a.x, a.y, 1);
        const pb = project(b.x, b.y, 1);
        cx.moveTo(pa.x, pa.y);
        cx.lineTo(pb.x, pb.y);
      }
      cx.stroke();
    }

    // Named stars
    for (const s of stars) {
      const p = project(s.x, s.y, 1);
      const tw = 0.6 + 0.4 * Math.sin(state.t * 0.001 * s.twinkleSpeed + s.twinklePhase);
      // Base radius by magnitude
      const r = (1.2 + s.mag * 1.4) * (state.selectedStar && state.selectedStar.id === s.id ? 1.6 : 1);

      // Dimming logic
      let alpha = 1;
      if (state.focusedConstellation && state.focusedConstellation !== s.constellationId) alpha = 0.18;
      if (state.selectedStar && state.selectedStar.id !== s.id) alpha = 0.2;
      const hovered = state.hoverStar && state.hoverStar.id === s.id;
      if (hovered) alpha = 1;

      // Glow halo
      const glow = r * (hovered ? 7 : (state.selectedStar && state.selectedStar.id === s.id ? 8 : 4));
      const g = cx.createRadialGradient(p.x, p.y, 0, p.x, p.y, glow);
      g.addColorStop(0, hexWithAlpha(s.color, 0.55 * alpha * tw));
      g.addColorStop(0.4, hexWithAlpha(s.color, 0.18 * alpha * tw));
      g.addColorStop(1, hexWithAlpha(s.color, 0));
      cx.fillStyle = g;
      cx.beginPath();
      cx.arc(p.x, p.y, glow, 0, Math.PI * 2);
      cx.fill();

      // Core — warm white with color tint
      cx.fillStyle = `rgba(255,252,245,${0.92 * alpha})`;
      cx.beginPath();
      cx.arc(p.x, p.y, r, 0, Math.PI * 2);
      cx.fill();

      // Save screen position for hit-testing
      s._sx = p.x; s._sy = p.y; s._sr = r; s._sglow = glow;
    }

    // Shooting star
    if (state.shoot) {
      const sh = state.shoot;
      sh.t += dt;
      const progress = sh.t / sh.duration;
      if (progress >= 1) {
        state.shoot = null;
      } else {
        const x = sh.x0 + (sh.x1 - sh.x0) * progress;
        const y = sh.y0 + (sh.y1 - sh.y0) * progress;
        // Draw fading trail
        const trailLen = 180;
        const dx = sh.x1 - sh.x0, dy = sh.y1 - sh.y0;
        const len = Math.hypot(dx, dy);
        const ux = dx / len, uy = dy / len;
        const tx = x - ux * trailLen;
        const ty = y - uy * trailLen;
        const grad = cx.createLinearGradient(tx, ty, x, y);
        grad.addColorStop(0, 'rgba(255,255,240,0)');
        grad.addColorStop(1, `rgba(255,255,240,${0.8 * (1 - progress)})`);
        cx.strokeStyle = grad;
        cx.lineWidth = 1.5;
        cx.beginPath();
        cx.moveTo(tx, ty);
        cx.lineTo(x, y);
        cx.stroke();
        // Head
        cx.fillStyle = `rgba(255,255,240,${0.9 * (1 - progress * 0.7)})`;
        cx.beginPath();
        cx.arc(x, y, 2, 0, Math.PI * 2);
        cx.fill();
      }
    } else {
      state.nextShootAt -= dt;
      if (state.nextShootAt <= 0) {
        const fromLeft = Math.random() < 0.5;
        state.shoot = {
          x0: fromLeft ? -50 : state.w + 50,
          y0: Math.random() * state.h * 0.6,
          x1: fromLeft ? state.w + 50 : -50,
          y1: Math.random() * state.h * 0.6 + 80,
          t: 0,
          duration: 1400 + Math.random() * 800
        };
        state.nextShootAt = 14000 + Math.random() * 12000;
      }
    }

    cx.restore();
  }

  // ---------------------------------------------------------------------------
  // Hit testing + hover label
  // ---------------------------------------------------------------------------
  const hoverLabel = document.getElementById('hover-label');

  function findStarAt(x, y) {
    let best = null, bestD = 22; // pixels
    for (const s of stars) {
      if (s._sx == null) continue;
      const d = Math.hypot(x - s._sx, y - s._sy);
      const threshold = Math.max(14, s._sr * 4);
      if (d < threshold && d < bestD) { best = s; bestD = d; }
    }
    return best;
  }

  canvas.addEventListener('mousemove', (e) => {
    state.mouseX = e.clientX;
    state.mouseY = e.clientY;
    const s = findStarAt(e.clientX, e.clientY);
    state.hoverStar = s;
    if (s) {
      canvas.style.cursor = 'pointer';
      hoverLabel.textContent = s.label;
      hoverLabel.style.left = s._sx + 'px';
      hoverLabel.style.top = s._sy + 'px';
      hoverLabel.classList.add('show');
    } else {
      canvas.style.cursor = 'crosshair';
      hoverLabel.classList.remove('show');
    }
  });

  canvas.addEventListener('click', (e) => {
    const s = findStarAt(e.clientX, e.clientY);
    if (s) {
      selectStar(s);
    } else {
      deselectStar();
    }
  });

  // ---------------------------------------------------------------------------
  // Selection: zoom camera toward star, show details panel
  // ---------------------------------------------------------------------------
  const detailEl = document.getElementById('detail');
  const detailKicker = document.getElementById('detail-kicker');
  const detailTitle = document.getElementById('detail-title');
  const detailBody = document.getElementById('detail-body');
  const detailMeta = document.getElementById('detail-meta');
  const detailClose = document.getElementById('detail-close');

  function selectStar(s) {
    state.selectedStar = s;
    // Focus constellation too
    state.focusedConstellation = s.constellationId;
    updateLegendActive();

    // Compute camera target — zoom in, offset star so panel doesn't cover it
    const sx = s.x * state.scale + state.offX;
    const sy = s.y * state.scale + state.offY;
    const cx = state.w / 2, cy = state.h / 2;
    // We want the star to land roughly at (cx + 120, cy - 60) after zoom
    const targetScreenX = cx + Math.min(200, state.w * 0.2);
    const targetScreenY = cy - Math.min(80, state.h * 0.1);
    state.camScaleTarget = 1.8;
    // With cam: screen = cx + (sky - cx - camX) * camScale
    // Solve: targetScreenX = cx + (sx - cx - camX) * camScale
    state.camXTarget = sx - cx - (targetScreenX - cx) / state.camScaleTarget;
    state.camYTarget = sy - cy - (targetScreenY - cy) / state.camScaleTarget;

    // Update panel
    const constellation = constellations.find(c => c.id === s.constellationId);
    detailKicker.textContent = `${constellation.name.toLowerCase()} · ${constellation.blurb}`;
    detailKicker.style.color = s.color;
    detailTitle.textContent = s.label;
    detailBody.textContent = s.body || '';
    detailMeta.textContent = s.meta || '';
    detailEl.classList.add('open');
  }

  function deselectStar() {
    state.selectedStar = null;
    state.focusedConstellation = null;
    state.camScaleTarget = 1;
    state.camXTarget = 0;
    state.camYTarget = 0;
    detailEl.classList.remove('open');
    updateLegendActive();
  }

  detailClose.addEventListener('click', deselectStar);

  // ---------------------------------------------------------------------------
  // Legend
  // ---------------------------------------------------------------------------
  const legendList = document.getElementById('legend-list');
  constellations.forEach((c, i) => {
    const li = document.createElement('li');
    li.dataset.id = c.id;
    li.innerHTML = `
      <span class="swatch" style="background:${c.color};color:${c.color}"></span>
      <span class="name">${c.name}</span>
      <span class="num">${i + 1}</span>
    `;
    li.addEventListener('click', () => {
      if (state.focusedConstellation === c.id && !state.selectedStar) {
        state.focusedConstellation = null;
      } else {
        state.focusedConstellation = c.id;
        if (state.selectedStar && state.selectedStar.constellationId !== c.id) {
          // Clear star selection but keep constellation focus
          state.selectedStar = null;
          state.camScaleTarget = 1;
          state.camXTarget = 0;
          state.camYTarget = 0;
          detailEl.classList.remove('open');
        }
      }
      updateLegendActive();
    });
    legendList.appendChild(li);
  });

  function updateLegendActive() {
    legendList.querySelectorAll('li').forEach(li => {
      li.classList.toggle('active', li.dataset.id === state.focusedConstellation);
    });
  }

  // ---------------------------------------------------------------------------
  // Keyboard: 1–6 focus constellations, 0/Esc reset
  // ---------------------------------------------------------------------------
  window.addEventListener('keydown', (e) => {
    if (e.key >= '1' && e.key <= '6') {
      const idx = parseInt(e.key, 10) - 1;
      const c = constellations[idx];
      if (c) {
        state.focusedConstellation = c.id;
        // Light camera pan to constellation centroid
        const cx = c.stars.reduce((a, s) => a + s.x, 0) / c.stars.length;
        const cy = c.stars.reduce((a, s) => a + s.y, 0) / c.stars.length;
        const sx = cx * state.scale + state.offX;
        const sy = cy * state.scale + state.offY;
        state.camScaleTarget = 1.25;
        state.camXTarget = (sx - state.w / 2) * 0.4;
        state.camYTarget = (sy - state.h / 2) * 0.4;
        state.selectedStar = null;
        detailEl.classList.remove('open');
        updateLegendActive();
      }
    } else if (e.key === '0' || e.key === 'Escape') {
      deselectStar();
    }
  });

  // ---------------------------------------------------------------------------
  // Utility — color with alpha
  // ---------------------------------------------------------------------------
  function hexWithAlpha(hex, alpha) {
    const h = hex.replace('#', '');
    const r = parseInt(h.substring(0, 2), 16);
    const g = parseInt(h.substring(2, 4), 16);
    const b = parseInt(h.substring(4, 6), 16);
    return `rgba(${r},${g},${b},${alpha})`;
  }

  // ---------------------------------------------------------------------------
  // Animation loop
  // ---------------------------------------------------------------------------
  let last = performance.now();
  function loop(t) {
    const dt = Math.min(60, t - last);
    last = t;
    draw(dt);
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
})();
