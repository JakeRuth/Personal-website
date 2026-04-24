/* ============================================================
   Jake Ruth — A Diary in Six Acts
   Scroll orchestration, typewriters, sandboxes.
   Vanilla JS, IntersectionObserver, zero deps.
   ============================================================ */

(function(){
  'use strict';

  // ---------- CUSTOM CURSOR ----------
  const cursor = document.getElementById('cursor');
  let mx = window.innerWidth / 2, my = window.innerHeight / 2;
  let cx = mx, cy = my;
  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
  (function raf(){
    cx += (mx - cx) * 0.22;
    cy += (my - cy) * 0.22;
    cursor.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%)`;
    requestAnimationFrame(raf);
  })();
  document.querySelectorAll('a, .terminal, .cube-mini, .meter-track, .chart-wrap, .rail-dot').forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('expand'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('expand'));
  });

  // ---------- PROGRESS BAR + RAIL ----------
  const bar = document.getElementById('progress-bar');
  const chapters = Array.from(document.querySelectorAll('.chapter'));
  const railDots = Array.from(document.querySelectorAll('.rail-dot'));

  function updateProgress(){
    const h = document.documentElement;
    const pct = (h.scrollTop) / (h.scrollHeight - h.clientHeight);
    bar.style.width = (pct * 100) + '%';
  }

  function updateActiveChapter(){
    const mid = window.scrollY + window.innerHeight * 0.4;
    let active = 0;
    chapters.forEach((ch, i) => {
      const top = ch.offsetTop;
      if (mid >= top) active = i;
    });
    railDots.forEach((d, i) => d.classList.toggle('active', i === active));

    // tint progress bar + cursor to chapter accent
    const accent = chapters[active].dataset.accent || '#eae2d0';
    bar.style.background = accent;
    cursor.style.borderColor = accent;
  }

  // ---------- REVEAL ON SCROLL ----------
  const toReveal = document.querySelectorAll('.ch-head, .prose, .ascii-art, .metric-tiles, .cube-mini, .terminal, .meter-block, .artifacts, .timeline, .chart-wrap, .sign-off, .colophon');
  toReveal.forEach(el => el.classList.add('reveal'));

  const revealIO = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        revealIO.unobserve(e.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -10% 0px' });
  toReveal.forEach(el => revealIO.observe(el));

  // ---------- CHAPTER IN-VIEW (for SVG animations) ----------
  const chapterIO = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in-view');
      }
    });
  }, { threshold: 0.25 });
  chapters.forEach(ch => chapterIO.observe(ch));

  // ============================================================
  // CH 2 — HELLO WORLD TYPEWRITER (scroll-tied)
  // ============================================================
  const helloOut = document.getElementById('hello-out');
  const helloTerminal = document.getElementById('hello-terminal');
  const HELLO_LINES = [
    { text: 'public class Hello {',                        cls: '' },
    { text: '    public static void main(String[] args) {', cls: '' },
    { text: '        System.out.println("Hello, World!");', cls: '' },
    { text: '    }',                                        cls: '' },
    { text: '}',                                            cls: '' },
    { text: '',                                             cls: '' },
    { text: '> Hello, World!',                              cls: 'hi' },
    { text: '> oh.',                                        cls: 'hi' },
  ];
  const HELLO_TEXT = HELLO_LINES.map(l => l.text).join('\n');

  function renderHello(progress) {
    // progress 0..1 across visible range
    const total = HELLO_TEXT.length;
    const n = Math.floor(total * Math.max(0, Math.min(1, progress)));
    const sub = HELLO_TEXT.slice(0, n);
    // highlight final "Hello, World!" line when revealed
    const html = sub
      .replace(/(&gt; Hello, World!)/g, '<span class="hi">$1</span>')
      .replace(/(&gt; oh\.)/g, '<span class="hi">$1</span>')
      .replace('> Hello, World!', '<span class="hi">&gt; Hello, World!</span>')
      .replace('> oh.', '<span class="hi">&gt; oh.</span>');
    helloOut.innerHTML = html;
  }

  // ============================================================
  // CH 3 — CODE QUALITY METER (scroll-tied)
  // ============================================================
  const meterFill = document.getElementById('meter-fill');
  const meterPct  = document.getElementById('meter-pct');

  function renderMeter(progress){
    // non-linear: dips at "took down prod" around 0.55
    let p = Math.max(0, Math.min(1, progress));
    // simulate path: rise, dip, rise
    let v;
    if (p < 0.5) v = p * 70 / 0.5;           // 0 -> 70
    else if (p < 0.6) v = 70 - (p - 0.5) * 180; // dip to ~52
    else v = 52 + (p - 0.6) * (94 - 52) / 0.4;  // rise to 94
    v = Math.max(0, Math.min(100, v));
    meterFill.style.width = v.toFixed(1) + '%';
    meterPct.textContent = Math.round(v) + '%';
  }

  // ============================================================
  // CH 4 — TIMELINE BARS (Oscar headcount)
  // ============================================================
  (function buildTimeline(){
    const bars = document.getElementById('timeline-bars');
    const labels = document.getElementById('timeline-labels');
    if (!bars) return;
    const years = [
      { y: '2017', h: 50,  s: 22 },
      { y: '2018', h: 72,  s: 30 },
      { y: '2019', h: 96,  s: 48 },
      { y: '2020', h: 124, s: 64 },
      { y: '2021', h: 158, s: 72 },
    ];
    const maxH = 160;
    const barWidth = 110;
    const gap = 50;
    const totalWidth = years.length * barWidth + (years.length - 1) * gap;
    const startX = (1000 - totalWidth) / 2;
    years.forEach((yr, i) => {
      const x = startX + i * (barWidth + gap);
      const hPct = (yr.h / maxH) * 110;
      const sPct = (yr.s / maxH) * 110;
      // eng headcount bar (blue)
      const r1 = document.createElementNS('http://www.w3.org/2000/svg','rect');
      r1.setAttribute('x', x);
      r1.setAttribute('y', 130 - hPct);
      r1.setAttribute('width', barWidth / 2 - 4);
      r1.setAttribute('height', hPct);
      r1.setAttribute('fill', '#7aa2ff');
      r1.setAttribute('opacity', '0.85');
      r1.style.transitionDelay = (i * 140) + 'ms';
      bars.appendChild(r1);
      // my scope bar (yellow, below line)
      const r2 = document.createElementNS('http://www.w3.org/2000/svg','rect');
      r2.setAttribute('x', x + barWidth / 2 + 4);
      r2.setAttribute('y', 130);
      r2.setAttribute('width', barWidth / 2 - 4);
      r2.setAttribute('height', sPct);
      r2.setAttribute('fill', '#ffd166');
      r2.setAttribute('opacity', '0.85');
      r2.style.transitionDelay = (i * 140 + 70) + 'ms';
      bars.appendChild(r2);
      // year label
      const t = document.createElementNS('http://www.w3.org/2000/svg','text');
      t.setAttribute('x', x + barWidth / 2);
      t.setAttribute('y', 256);
      t.setAttribute('text-anchor', 'middle');
      t.textContent = yr.y;
      labels.appendChild(t);
      // headcount label on top of bar
      const th = document.createElementNS('http://www.w3.org/2000/svg','text');
      th.setAttribute('x', x + barWidth / 4 - 2);
      th.setAttribute('y', 130 - hPct - 8);
      th.setAttribute('text-anchor', 'middle');
      th.setAttribute('fill', '#7aa2ff');
      th.textContent = yr.h;
      labels.appendChild(th);
    });
  })();

  // ============================================================
  // CH 5 — STOCK CHART (scroll-tied path draw)
  // ============================================================
  const stockLine = document.getElementById('stock-line');
  const stockFill = document.getElementById('stock-fill');
  const stockMarks = document.getElementById('stock-marks');
  const STOCK_PTS = [
    [0,   240],   // pre-company (flat)
    [40,  238],
    [80,  232],
    [110, 220],   // Daniel-saga begins
    [140, 198],
    [170, 160],   // YC W22
    [200, 130],
    [230, 100],   // seed closed
    [260, 72],
    [290, 52],    // 8 employees peak
    [320, 46],
    [350, 60],    // scale-down
    [380, 68],
    [410, 72],    // stabilize / profitable side business
    [440, 72],
    [470, 70],
    [500, 68],
  ];

  function buildStockPath(){
    // Smooth path via quadratic between midpoints
    let d = `M ${STOCK_PTS[0][0]} ${STOCK_PTS[0][1]}`;
    for (let i = 1; i < STOCK_PTS.length; i++){
      const [px, py] = STOCK_PTS[i-1];
      const [x, y]   = STOCK_PTS[i];
      const mx = (px + x) / 2;
      const my = (py + y) / 2;
      d += ` Q ${px} ${py}, ${mx} ${my}`;
    }
    const last = STOCK_PTS[STOCK_PTS.length-1];
    d += ` T ${last[0]} ${last[1]}`;
    stockLine.setAttribute('d', d);
    const fillD = d + ` L ${last[0]} 280 L 0 280 Z`;
    stockFill.setAttribute('d', fillD);
    // compute length for stroke-dash draw-on
    requestAnimationFrame(() => {
      const len = stockLine.getTotalLength();
      stockLine.style.strokeDasharray = len;
      stockLine.style.strokeDashoffset = len;
    });
  }
  buildStockPath();

  const STOCK_MARKS = [
    { x: 170, y: 160, label: 'YC W22' },
    { x: 230, y: 100, label: '$1.335M seed' },
    { x: 290, y: 52,  label: '8 @ peak' },
    { x: 440, y: 72,  label: 'profitable' },
  ];
  STOCK_MARKS.forEach((m, i) => {
    const c = document.createElementNS('http://www.w3.org/2000/svg','circle');
    c.setAttribute('cx', m.x); c.setAttribute('cy', m.y); c.setAttribute('r', 4);
    c.setAttribute('fill', '#b07bff');
    c.dataset.idx = i;
    stockMarks.appendChild(c);
    const t = document.createElementNS('http://www.w3.org/2000/svg','text');
    t.setAttribute('x', m.x);
    t.setAttribute('y', m.y - 12);
    t.setAttribute('text-anchor', 'middle');
    t.textContent = m.label;
    t.dataset.idx = i;
    stockMarks.appendChild(t);
  });

  function renderStock(progress){
    const p = Math.max(0, Math.min(1, progress));
    const len = parseFloat(stockLine.style.strokeDasharray) || 0;
    stockLine.style.strokeDashoffset = (len * (1 - p)).toFixed(2);
    // reveal marks after their x-position is "drawn"
    const drawnX = p * 500;
    stockMarks.querySelectorAll('circle, text').forEach(el => {
      const mx = STOCK_MARKS[+el.dataset.idx].x;
      el.style.opacity = (mx <= drawnX) ? '1' : '0';
    });
  }

  // ============================================================
  // CH 6 — AI THESIS TYPEWRITER (scroll-tied)
  // ============================================================
  const thesisOut = document.getElementById('thesis-out');
  const THESIS_RAW = [
    { t: '# thesis.md', c: 'key' },
    { t: '# last updated ' + new Date().toISOString().slice(0,10), c: 'dim' },
    { t: '' },
    { t: '## the shift', c: 'kw' },
    { t: 'The last decade of software was about typing.' },
    { t: 'The next decade is about steering.' },
    { t: '' },
    { t: '## my role', c: 'kw' },
    { t: 'I am not here to be replaced by the model.' },
    { t: 'I am here to be the driver in the driver\'s seat.' },
    { t: 'Taste. Judgment. Velocity. Restraint.' },
    { t: '' },
    { t: '## the rule', c: 'kw' },
    { t: 'Build things that don\'t rip people off.' },
    { t: 'Ship before it\'s perfect. Listen after.' },
    { t: 'Keep the team small enough to fit in a van.' },
    { t: '' },
    { t: '## what\'s next', c: 'kw' },
    { t: 'Something new. Something useful.' },
    { t: 'Probably a little weird.' },
    { t: '' },
    { t: '# -- jake', c: 'me' },
  ];

  function renderThesis(progress){
    const p = Math.max(0, Math.min(1, progress));
    // total characters
    const all = THESIS_RAW.map(l => l.t).join('\n');
    const n = Math.floor(all.length * p);
    let consumed = 0;
    let html = '';
    for (const line of THESIS_RAW) {
      if (consumed >= n) break;
      const remaining = n - consumed;
      const slice = line.t.slice(0, Math.max(0, remaining));
      if (line.c) html += `<span class="${line.c}">${escapeHtml(slice)}</span>`;
      else html += escapeHtml(slice);
      html += '\n';
      consumed += line.t.length + 1;
    }
    thesisOut.innerHTML = html;
  }

  function escapeHtml(s){
    return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  // ============================================================
  // SCROLL-TIED DRIVER
  // Each scroll-tied effect reads its target element's rect and
  // computes a local progress value (0..1) across its active band.
  // ============================================================
  function activeProgress(el, startOffset = 0.9, endOffset = 0.2){
    // returns progress 0..1 from when top hits startOffset*vh to when bottom hits endOffset*vh
    const r = el.getBoundingClientRect();
    const vh = window.innerHeight;
    const start = vh * startOffset; // top must descend to here for progress to start
    const end   = vh * endOffset;
    const span  = start - end + r.height;
    const traveled = start - r.top;
    return Math.max(0, Math.min(1, traveled / span));
  }

  function onScroll(){
    updateProgress();
    updateActiveChapter();

    if (helloTerminal) {
      const p = activeProgress(helloTerminal, 0.85, 0.25);
      renderHello(p);
    }

    const meterBlock = document.querySelector('.meter-block');
    if (meterBlock) {
      const p = activeProgress(meterBlock, 0.85, 0.3);
      renderMeter(p);
    }

    const chartWrap = document.querySelector('.chart-wrap');
    if (chartWrap) {
      const p = activeProgress(chartWrap, 0.85, 0.1);
      renderStock(p);
    }

    const thesisTerm = document.getElementById('thesis-terminal');
    if (thesisTerm) {
      const p = activeProgress(thesisTerm, 0.85, 0.15);
      renderThesis(p);
    }
  }

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => { onScroll(); ticking = false; });
      ticking = true;
    }
  }, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  // ---------- RAIL CLICK SMOOTH SCROLL ----------
  railDots.forEach(d => {
    d.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector(d.getAttribute('href'));
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

})();
