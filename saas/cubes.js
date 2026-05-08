/* Hover-grid micro-cubes for saas-v2 hero.
   ----------------------------------------------------------------
   Behavior:
   - Idle: every cube is "solved" (default rotation), shrunk in
     scale, low opacity. The whole field reads as a faint texture.
   - Cursor / touch within RADIUS of a cube: that cube scrambles
     (random per-cube target rotation), grows back to full scale,
     and brightens.
   - Cursor leaves a previously-scrambled cube's radius: the cube
     auto-resolves (animates back to default rotation).
   - Cubes far from the cursor (> RADIUS): shrink and dim.
   - Mobile: pointermove + touchmove drive the same radius logic.
   - Hidden bonus: typing J-A-K-E triggers a synchronized field
     flourish, no UI hint that it exists.
*/

(function () {
  'use strict';

  const grid = document.querySelector('.hero-cube-grid');
  if (!grid) return;

  // Vestibular-sensitive users opt out of the entire field. The grid
  // stays in the DOM but stays static (no rotation, no scramble),
  // so the hero still has its faint cube texture without any motion.
  const REDUCED_MOTION = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const FACES = ['f-front', 'f-back', 'f-right', 'f-left', 'f-top', 'f-bottom'];
  const SPACING = 84;       // grid cell, px
  const RADIUS = 200;       // hover radius, px
  const CUBE_HALF = 14;
  const SCALE_IDLE = 0.82;
  const SCALE_HOVER = 1.08;
  const OP_IDLE = 0.22;
  const OP_HOVER = 0.72;

  const cubes = [];

  function buildCube() {
    const c = document.createElement('div');
    c.className = 'micro-cube';
    for (const f of FACES) {
      const face = document.createElement('div');
      face.className = 'face ' + f;
      c.appendChild(face);
    }
    return c;
  }

  function layout() {
    grid.innerHTML = '';
    cubes.length = 0;
    const w = grid.clientWidth;
    const h = grid.clientHeight;
    if (!w || !h) return;
    const cols = Math.ceil(w / SPACING) + 1;
    const rows = Math.ceil(h / SPACING) + 1;
    for (let r = 0; r < rows; r++) {
      for (let cc = 0; cc < cols; cc++) {
        const cube = buildCube();
        const xOffset = (r % 2) * (SPACING / 2);
        const x = Math.round(cc * SPACING + xOffset - SPACING / 2);
        const y = Math.round(r * SPACING - SPACING / 2);
        cube.style.left = x + 'px';
        cube.style.top = y + 'px';
        // Pre-compute centers as state on the element to skip re-querying every frame.
        cube._cx = x + CUBE_HALF;
        cube._cy = y + CUBE_HALF;
        cube._scrambled = false;
        // Stagger animation delay for the JAKE flourish (radial wave from center).
        cube.style.setProperty('--ad', (Math.abs(cc - cols / 2) * 28 + r * 18) + 'ms');
        // Initial CSS variables (idle state).
        cube.style.setProperty('--sc', SCALE_IDLE);
        cube.style.setProperty('--op', OP_IDLE);
        cube.style.setProperty('--rx', '-22deg');
        cube.style.setProperty('--ry', '32deg');
        grid.appendChild(cube);
        cubes.push(cube);
      }
    }
  }

  // --- Cursor tracking --------------------------------------------
  // Listen on .hero (the parent) so the grid itself stays
  // pointer-events:none and never blocks scrolls / clicks on
  // hero content (CTAs, marquee).
  const hero = grid.closest('.hero') || document.body;
  let cursorX = -99999, cursorY = -99999;
  let rafId = 0;

  function setCursorFromEvent(e) {
    const rect = grid.getBoundingClientRect();
    const t = e.touches && e.touches[0] ? e.touches[0] : e;
    cursorX = t.clientX - rect.left;
    cursorY = t.clientY - rect.top;
    if (!rafId) rafId = requestAnimationFrame(updateField);
  }

  function clearCursor() {
    cursorX = cursorY = -99999;
    if (!rafId) rafId = requestAnimationFrame(updateField);
  }

  // --- Per-frame field update -------------------------------------
  function updateField() {
    rafId = 0;
    const noCursor = cursorX < -9000;
    for (const cube of cubes) {
      const dx = cursorX - cube._cx;
      const dy = cursorY - cube._cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      const inRadius = !noCursor && dist < RADIUS;

      if (inRadius) {
        // Continuous: scale up + brighten by proximity.
        const t = 1 - dist / RADIUS;
        const sc = SCALE_IDLE + (SCALE_HOVER - SCALE_IDLE) * t;
        const op = OP_IDLE + (OP_HOVER - OP_IDLE) * t;
        cube.style.setProperty('--sc', sc.toFixed(3));
        cube.style.setProperty('--op', op.toFixed(3));

        // Edge-trigger: scramble once on entry to a fresh per-cube rotation.
        if (!cube._scrambled) {
          cube._scrambled = true;
          cube.classList.add('is-active');
          // Random multi-axis rotation, biased to be visually substantial.
          const rx = (Math.random() * 2 - 1) * 220 + (Math.random() < 0.5 ? -90 : 90);
          const ry = (Math.random() * 2 - 1) * 260 + (Math.random() < 0.5 ? -90 : 90);
          cube.style.setProperty('--rx', rx.toFixed(1) + 'deg');
          cube.style.setProperty('--ry', ry.toFixed(1) + 'deg');
        }
      } else {
        // Outside radius. Scale shrinks moderately with distance;
        // opacity stays close to OP_IDLE so the field reads as a
        // discoverable texture even when the cursor is far away.
        const fade = noCursor ? 0 : Math.max(0, 1 - (dist - RADIUS) / RADIUS);
        const sc = SCALE_IDLE - 0.10 * (1 - fade);
        const op = OP_IDLE * (0.85 + 0.15 * fade);
        cube.style.setProperty('--sc', sc.toFixed(3));
        cube.style.setProperty('--op', op.toFixed(3));

        // Edge-trigger: auto-resolve on exit if previously scrambled.
        if (cube._scrambled) {
          cube._scrambled = false;
          cube.classList.remove('is-active');
          cube.style.setProperty('--rx', '-22deg');
          cube.style.setProperty('--ry', '32deg');
        }
      }
    }
  }

  // --- Mobile: tap-and-drag drives the same radius logic ----------
  // Use Pointer Events where available (covers mouse + touch + pen),
  // fall back to plain touch handlers for older mobile browsers.
  function bindCursor() {
    if (REDUCED_MOTION) return;
    if (window.PointerEvent) {
      hero.addEventListener('pointermove', setCursorFromEvent);
      hero.addEventListener('pointerleave', clearCursor);
      hero.addEventListener('pointercancel', clearCursor);
    } else {
      hero.addEventListener('mousemove', setCursorFromEvent);
      hero.addEventListener('mouseleave', clearCursor);
      hero.addEventListener('touchmove', setCursorFromEvent, { passive: true });
      hero.addEventListener('touchend', clearCursor);
      hero.addEventListener('touchcancel', clearCursor);
    }
  }

  // --- JAKE keystroke (undocumented bonus) ------------------------
  const SECRET = ['j', 'a', 'k', 'e'];
  let buf = [];
  document.addEventListener('keydown', (e) => {
    if (e.target && e.target.matches && e.target.matches('input, textarea, [contenteditable]')) return;
    const k = (e.key || '').toLowerCase();
    if (k === SECRET[buf.length]) {
      buf.push(k);
      if (buf.length === SECRET.length) {
        triggerSolveAll();
        buf = [];
      }
    } else {
      buf = (k === SECRET[0]) ? [k] : [];
    }
  });

  function triggerSolveAll() {
    if (grid.classList.contains('is-solving-all')) return;
    grid.classList.add('is-solving-all');
    setTimeout(() => grid.classList.remove('is-solving-all'), 1500);
  }

  // --- Bring-up + relayout on resize ------------------------------
  let resizeTimer = 0;
  function init() {
    layout();
    bindCursor();
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(layout, 140);
    });
    if ('ResizeObserver' in window) {
      const ro = new ResizeObserver(() => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(layout, 140);
      });
      ro.observe(grid);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
