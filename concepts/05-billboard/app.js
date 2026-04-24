/* =========================================================
   Jake Ruth — Billboard (Hyperminimal)
   app.js — magnetic glyphs, peek panels, cursor, clock, noise
   ========================================================= */

(() => {
  const lerp = (a, b, t) => a + (b - a) * t;
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

  /* ---------- Clock ---------- */
  const clock = document.getElementById('clock');
  const tickClock = () => {
    const d = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    clock.textContent = `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  };
  tickClock();
  setInterval(tickClock, 1000);

  /* ---------- Noise canvas (breathing texture) ---------- */
  const noiseCanvas = document.getElementById('noise');
  const nctx = noiseCanvas.getContext('2d');
  let noiseW = 0, noiseH = 0;
  const sizeNoise = () => {
    noiseW = noiseCanvas.width = Math.floor(window.innerWidth / 2);
    noiseH = noiseCanvas.height = Math.floor(window.innerHeight / 2);
    noiseCanvas.style.width = window.innerWidth + 'px';
    noiseCanvas.style.height = window.innerHeight + 'px';
  };
  sizeNoise();
  window.addEventListener('resize', sizeNoise);

  const drawNoise = () => {
    const img = nctx.createImageData(noiseW, noiseH);
    const d = img.data;
    for (let i = 0; i < d.length; i += 4) {
      const v = (Math.random() * 255) | 0;
      d[i] = v; d[i + 1] = v; d[i + 2] = v; d[i + 3] = 255;
    }
    nctx.putImageData(img, 0, 0);
  };
  // Draw noise at ~12fps — cheap, still feels alive
  let noiseFrame = 0;
  const noiseLoop = () => {
    noiseFrame++;
    if (noiseFrame % 5 === 0) drawNoise();
    requestAnimationFrame(noiseLoop);
  };
  drawNoise();
  requestAnimationFrame(noiseLoop);

  /* ---------- Magnetic glyphs ---------- */
  const glyphs = Array.from(document.querySelectorAll('.glyph'));
  const glyphState = glyphs.map(el => ({
    el,
    rect: null,
    cx: 0, cy: 0,
    tx: 0, ty: 0,     // target
    x: 0, y: 0,       // current
    s: 1, ts: 1,
    w: 400, tw: 400,  // font weight if variable
  }));

  const measure = () => {
    for (const g of glyphState) {
      const r = g.el.getBoundingClientRect();
      g.rect = r;
      g.cx = r.left + r.width / 2;
      g.cy = r.top + r.height / 2;
    }
  };
  measure();
  window.addEventListener('resize', measure);
  // Measure again once webfonts land
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(measure);
  }
  setTimeout(measure, 800);

  const MAG_RADIUS = 260;      // px of influence
  const MAG_STRENGTH = 34;     // max translate in px
  const SCALE_MAX = 1.14;

  let mouseX = -9999, mouseY = -9999;
  let mouseActive = false;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    mouseActive = true;
  });
  window.addEventListener('mouseleave', () => { mouseActive = false; });

  const rafLoop = () => {
    for (const g of glyphState) {
      if (!g.rect) continue;
      const dx = mouseX - g.cx;
      const dy = mouseY - g.cy;
      const dist = Math.hypot(dx, dy);
      if (mouseActive && dist < MAG_RADIUS) {
        const falloff = 1 - dist / MAG_RADIUS;            // 0..1
        const pull = Math.pow(falloff, 1.6);              // ease
        g.tx = (dx / Math.max(dist, 1)) * MAG_STRENGTH * pull;
        g.ty = (dy / Math.max(dist, 1)) * MAG_STRENGTH * pull;
        g.ts = 1 + (SCALE_MAX - 1) * pull;
      } else {
        g.tx = 0; g.ty = 0; g.ts = 1;
      }
      g.x = lerp(g.x, g.tx, 0.14);
      g.y = lerp(g.y, g.ty, 0.14);
      g.s = lerp(g.s, g.ts, 0.14);
      g.el.style.transform = `translate3d(${g.x.toFixed(2)}px, ${g.y.toFixed(2)}px, 0) scale(${g.s.toFixed(3)})`;
    }

    // Peek panel follows cursor loosely
    if (peekTarget) {
      peekX = lerp(peekX, mouseX + 22, 0.18);
      peekY = lerp(peekY, mouseY + 22, 0.18);
      // Keep on-screen
      const maxX = window.innerWidth - 360;
      const maxY = window.innerHeight - peek.offsetHeight - 16;
      const px = clamp(peekX, 16, maxX);
      const py = clamp(peekY, 16, maxY);
      peek.style.transform = `translate3d(${px.toFixed(1)}px, ${py.toFixed(1)}px, 0)`;
    }

    // Custom cursor
    cursorX = lerp(cursorX, mouseX, 0.28);
    cursorY = lerp(cursorY, mouseY, 0.28);
    cursorEl.style.transform = `translate3d(${cursorX.toFixed(1)}px, ${cursorY.toFixed(1)}px, 0)`;

    requestAnimationFrame(rafLoop);
  };
  requestAnimationFrame(rafLoop);

  /* ---------- Peek panel ---------- */
  const PEEK_CONTENT = {
    about: {
      index: '01 / ABOUT',
      title: 'Thirteen years of shipping.',
      body: "Engineer and founder in the NYC area. Competitive Rubik's cube solver, occasional unicyclist, getting married this year. Coding since 2013.",
      tag: 'human · cube · unicycle',
    },
    career: {
      index: '02 / CAREER',
      title: 'CommerceHub → Youni → Oscar → Stock Unlock.',
      body: 'BS CS + Applied Math @ SUNY Albany (3.88, ACM president). Senior SWE at Oscar Health 2017–2021. Then went full founder.',
      tag: '2013 — present',
    },
    'stock-unlock': {
      index: '03 / STOCK UNLOCK',
      title: 'YC W22. $1.335M seed. Still profitable.',
      body: 'Built it, scaled it to thousands of paying customers and ~$100–200K/yr profit. Eight employees at peak. Now a side business I care about; not full-time.',
      tag: 'ycombinator · fintech · profitable',
    },
    resume: {
      index: '04 / RESUME',
      title: 'The one-pager, if you must.',
      body: 'Thirteen years of receipts. Click through for the formal document — roles, dates, stack, shipped things, the works.',
      tag: 'pdf · long-form',
    },
    contact: {
      index: '05 / CONTACT',
      title: 'jake@stockunlock.com',
      body: 'Direct line. Warm intros land best. I read everything; I reply to most things; I ignore pitches for software that rips off retail investors.',
      tag: 'email · open · nyc',
    },
  };

  const peek = document.getElementById('peek');
  const peekTitle = peek.querySelector('.peek__title');
  const peekBody = peek.querySelector('.peek__body');
  const peekIndex = peek.querySelector('.peek__index');
  const peekTag = peek.querySelector('.peek__tag');
  let peekTarget = null;
  let peekX = -400, peekY = -400;

  const showPeek = (key, originX, originY) => {
    const c = PEEK_CONTENT[key];
    if (!c) return;
    peekTitle.textContent = c.title;
    peekBody.textContent = c.body;
    peekIndex.textContent = c.index;
    peekTag.textContent = c.tag;
    peekTarget = key;
    peekX = originX + 22;
    peekY = originY + 22;
    peek.classList.add('is-visible');
    peek.setAttribute('aria-hidden', 'false');
  };
  const hidePeek = () => {
    peekTarget = null;
    peek.classList.remove('is-visible');
    peek.setAttribute('aria-hidden', 'true');
  };

  document.querySelectorAll('.word').forEach(w => {
    w.addEventListener('mouseenter', (e) => showPeek(w.dataset.peek, e.clientX, e.clientY));
    w.addEventListener('mouseleave', hidePeek);
    w.addEventListener('focus', (e) => {
      const r = w.getBoundingClientRect();
      showPeek(w.dataset.peek, r.left, r.bottom);
    });
    w.addEventListener('blur', hidePeek);
  });

  /* ---------- Custom cursor ---------- */
  const cursorEl = document.getElementById('cursor');
  let cursorX = -50, cursorY = -50;
  document.querySelectorAll('a, .word').forEach(el => {
    el.addEventListener('mouseenter', () => cursorEl.classList.add('is-link'));
    el.addEventListener('mouseleave', () => cursorEl.classList.remove('is-link'));
  });

  /* ---------- Tiny easter egg: press K to toggle accent ---------- */
  const ACCENTS = ['#e8a13a', '#6aa3ff', '#e07a5f', '#c6f66d'];
  let accentIdx = 0;
  window.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() === 'k') {
      accentIdx = (accentIdx + 1) % ACCENTS.length;
      document.documentElement.style.setProperty('--accent', ACCENTS[accentIdx]);
    }
  });
})();
