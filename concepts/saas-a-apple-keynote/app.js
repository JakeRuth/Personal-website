// ============================================================
// Jake 4.7 — Apple Keynote Concept
// Vanilla JS + Three.js (CDN) for the accessory cube modal
// ============================================================

(function () {
  'use strict';

  // ------------------------------------------------------------
  // Hero cube scroll-progress (rotates toward "solved" as you scroll)
  // ------------------------------------------------------------
  const heroCube = document.getElementById('heroCube');
  const onScroll = () => {
    const y = window.scrollY;
    const max = window.innerHeight * 1.2;
    const pct = Math.min(y / max, 1);
    if (heroCube) {
      // nudge its rotation offset alongside the CSS animation
      heroCube.style.transform =
        'rotateX(' + (-22 + pct * 10) + 'deg) rotateY(' + (pct * 40) + 'deg)';
      // when close to "solved", override animation
      if (pct > 0.6) {
        heroCube.style.animationPlayState = 'paused';
      } else {
        heroCube.style.animationPlayState = 'running';
      }
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });

  // ------------------------------------------------------------
  // Configurator
  // ------------------------------------------------------------
  const tierInputs = document.querySelectorAll('input[name="tier"]');
  const hourInputs = document.querySelectorAll('input[name="hours"]');
  const addonInputs = document.querySelectorAll('input[name="addon"]');

  const totalSku = document.getElementById('totalSku');
  const totalAmount = document.getElementById('totalAmount');
  const totalFine = document.getElementById('totalFine');
  const previewSku = document.getElementById('previewSku');
  const previewSpec = document.getElementById('previewSpec');

  const TIER_BASE = {
    contract: { label: 'Contract',       hourly: 175,  note: 'per hour (billed monthly)' },
    fulltime: { label: 'Full-time',      hourly: null, annual: 220000, note: 'annual base (plus equity)' },
    founding: { label: 'Equity Founding', hourly: null, annual: 160000, note: 'base + meaningful equity' }
  };
  const HOUR_MULT = { '10': 0.7, '20': 1.0, '40': 1.6 };
  const ADDON_PRICE = {
    zerotoone: 12500,
    aireview: 4000,
    cube: 89
  };

  function getTier() {
    for (const i of tierInputs) if (i.checked) return i.value;
    return 'contract';
  }
  function getHours() {
    for (const i of hourInputs) if (i.checked) return i.value;
    return '20';
  }
  function getAddons() {
    const out = [];
    for (const i of addonInputs) if (i.checked) out.push(i.value);
    return out;
  }

  function money(n) {
    return '$' + n.toLocaleString('en-US');
  }

  function updateTotal() {
    const tier = getTier();
    const hours = getHours();
    const addons = getAddons();
    const t = TIER_BASE[tier];
    const mult = HOUR_MULT[hours];

    let base = 0;
    let unit = '/mo';
    let fine = '';

    if (tier === 'contract') {
      const weekly = t.hourly * Number(hours);
      base = Math.round(weekly * 52 / 12);
      unit = '/mo';
      fine = 'Base rate $' + t.hourly + '/hr × ' + hours + ' hrs/week, billed monthly.';
    } else if (tier === 'fulltime') {
      base = Math.round((t.annual * mult) / 12);
      unit = '/mo';
      fine = 'Annualized at ' + money(t.annual * mult) + ' at the selected commitment.';
    } else if (tier === 'founding') {
      base = Math.round((t.annual * mult) / 12);
      unit = '/mo';
      fine = 'Indicative base. Equity terms negotiated in person over good coffee.';
    }

    let addonTotal = 0;
    const addonNames = [];
    for (const a of addons) {
      addonTotal += ADDON_PRICE[a];
      addonNames.push(a === 'zerotoone' ? 'Zero-to-One' : a === 'aireview' ? 'AI Review' : 'Cube');
    }

    const skuLabel =
      'Jake 4.7 · ' + t.label + ' · ' + hours + ' hrs' +
      (addonNames.length ? ' · + ' + addonNames.join(', ') : '');

    totalSku.textContent = skuLabel;
    previewSku.textContent = 'Jake 4.7 — ' + t.label;
    previewSpec.textContent = (hours + ' hrs/wk · Remote') +
      (addonNames.length ? ' · ' + addonNames.length + ' add-on' + (addonNames.length > 1 ? 's' : '') : '');

    totalAmount.innerHTML = money(base) + ' <span>' + unit + '</span>';
    totalFine.textContent = addonTotal
      ? fine + ' One-time add-ons: ' + money(addonTotal) + '.'
      : fine;
  }

  [...tierInputs, ...hourInputs, ...addonInputs].forEach(i =>
    i.addEventListener('change', updateTotal)
  );
  updateTotal();

  // ------------------------------------------------------------
  // Bag toast
  // ------------------------------------------------------------
  const bagBtn = document.getElementById('bagBtn');
  const toast = document.getElementById('bagToast');
  let toastTimer = null;
  bagBtn && bagBtn.addEventListener('click', () => {
    toast.classList.add('show');
    toast.querySelector('.toast-text').textContent = 'Added Jake 4.7 to bag.';
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2600);
  });

  // ------------------------------------------------------------
  // Cube modal (Three.js)
  // ------------------------------------------------------------
  const modal = document.getElementById('cubeModal');
  const stage = document.getElementById('modalStage');
  const openBtn = document.getElementById('openCubeBtn');
  const scrambleBtn = document.getElementById('scrambleBtn');
  const solveBtn = document.getElementById('solveBtn');
  let threeCtx = null;

  function openModal() {
    modal.classList.add('open');
    if (!threeCtx && typeof THREE !== 'undefined') {
      threeCtx = initThreeCube(stage);
    }
    if (threeCtx) threeCtx.start();
  }
  function closeModal() {
    modal.classList.remove('open');
    if (threeCtx) threeCtx.stop();
  }
  openBtn && openBtn.addEventListener('click', openModal);
  modal.addEventListener('click', (e) => {
    if (e.target.matches('[data-close]')) closeModal();
  });
  document.addEventListener('keydown', (e) => {
    if (!modal.classList.contains('open')) return;
    if (e.key === 'Escape') closeModal();
    if (e.code === 'Space') {
      e.preventDefault();
      if (threeCtx) threeCtx.scramble();
    }
  });
  scrambleBtn && scrambleBtn.addEventListener('click', () => threeCtx && threeCtx.scramble());
  solveBtn && solveBtn.addEventListener('click', () => threeCtx && threeCtx.solve());

  // ------------------------------------------------------------
  // Three.js Rubik's cube (3x3 stickered)
  // ------------------------------------------------------------
  function initThreeCube(container) {
    const W = container.clientWidth;
    const H = container.clientHeight;

    const scene = new THREE.Scene();
    scene.background = null;

    const camera = new THREE.PerspectiveCamera(40, W / H, 0.1, 100);
    camera.position.set(5, 4, 6);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio || 1);
    renderer.setSize(W, H);
    renderer.setClearColor(0x000000, 0);
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Lights
    const amb = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(amb);
    const dir = new THREE.DirectionalLight(0xffffff, 0.7);
    dir.position.set(4, 6, 4);
    scene.add(dir);
    const rim = new THREE.DirectionalLight(0xffffff, 0.3);
    rim.position.set(-4, -2, -3);
    scene.add(rim);

    // Colors (Apple-ish palette)
    const COLORS = {
      U: 0xffffff,  // top - white
      D: 0xffcc00,  // bottom - yellow
      F: 0xff3b30,  // front - red
      B: 0xff9500,  // back - orange
      R: 0x0a84ff,  // right - blue
      L: 0x34c759   // left - green
    };

    const cubeGroup = new THREE.Group();
    scene.add(cubeGroup);

    const SIZE = 0.95;
    const GAP = 0.04;
    const STEP = SIZE + GAP;
    const cubies = [];

    function stickerMat(color) {
      return new THREE.MeshStandardMaterial({
        color: color, roughness: 0.45, metalness: 0.1
      });
    }
    const BLACK = new THREE.MeshStandardMaterial({
      color: 0x1d1d1f, roughness: 0.6, metalness: 0.05
    });

    for (let x = -1; x <= 1; x++) {
      for (let y = -1; y <= 1; y++) {
        for (let z = -1; z <= 1; z++) {
          // Materials: +X,-X,+Y,-Y,+Z,-Z
          const mats = [
            x === 1  ? stickerMat(COLORS.R) : BLACK, // +X right
            x === -1 ? stickerMat(COLORS.L) : BLACK, // -X left
            y === 1  ? stickerMat(COLORS.U) : BLACK, // +Y top
            y === -1 ? stickerMat(COLORS.D) : BLACK, // -Y bottom
            z === 1  ? stickerMat(COLORS.F) : BLACK, // +Z front
            z === -1 ? stickerMat(COLORS.B) : BLACK  // -Z back
          ];
          const geo = new THREE.BoxGeometry(SIZE, SIZE, SIZE);
          const cubie = new THREE.Mesh(geo, mats);
          cubie.position.set(x * STEP, y * STEP, z * STEP);
          cubeGroup.add(cubie);
          cubies.push(cubie);
        }
      }
    }

    // Drag rotation
    let dragging = false;
    let lastX = 0, lastY = 0;
    let rotX = 0.45, rotY = -0.6;
    let autoSpin = true;

    const el = renderer.domElement;
    el.style.cursor = 'grab';
    el.addEventListener('pointerdown', (e) => {
      dragging = true; autoSpin = false;
      lastX = e.clientX; lastY = e.clientY;
      el.style.cursor = 'grabbing';
      el.setPointerCapture(e.pointerId);
    });
    el.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      rotY += dx * 0.008;
      rotX += dy * 0.008;
      lastX = e.clientX; lastY = e.clientY;
    });
    const endDrag = (e) => {
      dragging = false;
      el.style.cursor = 'grab';
      try { el.releasePointerCapture(e.pointerId); } catch (_) {}
    };
    el.addEventListener('pointerup', endDrag);
    el.addEventListener('pointercancel', endDrag);
    el.addEventListener('pointerleave', () => { dragging = false; el.style.cursor = 'grab'; });

    // Resize
    function resize() {
      const w = container.clientWidth, h = container.clientHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
    window.addEventListener('resize', resize);

    // "Scramble" — small jiggle on each cubie's rotation, clamped visually
    let scrambleAnim = null;
    function scramble() {
      cancelAnimationFrame(scrambleAnim);
      const targets = cubies.map(() => ({
        rx: (Math.random() - 0.5) * 1.2,
        ry: (Math.random() - 0.5) * 1.2,
        rz: (Math.random() - 0.5) * 1.2
      }));
      const starts = cubies.map(c => ({ rx: c.rotation.x, ry: c.rotation.y, rz: c.rotation.z }));
      const t0 = performance.now();
      const dur = 700;
      function step() {
        const t = Math.min((performance.now() - t0) / dur, 1);
        const e = 1 - Math.pow(1 - t, 3);
        cubies.forEach((c, i) => {
          c.rotation.x = starts[i].rx + (targets[i].rx - starts[i].rx) * e;
          c.rotation.y = starts[i].ry + (targets[i].ry - starts[i].ry) * e;
          c.rotation.z = starts[i].rz + (targets[i].rz - starts[i].rz) * e;
        });
        if (t < 1) scrambleAnim = requestAnimationFrame(step);
      }
      step();
    }
    function solve() {
      cancelAnimationFrame(scrambleAnim);
      const starts = cubies.map(c => ({ rx: c.rotation.x, ry: c.rotation.y, rz: c.rotation.z }));
      const t0 = performance.now();
      const dur = 1395; // 13.95 shortened, homage
      function step() {
        const t = Math.min((performance.now() - t0) / dur, 1);
        const e = 1 - Math.pow(1 - t, 3);
        cubies.forEach((c, i) => {
          c.rotation.x = starts[i].rx * (1 - e);
          c.rotation.y = starts[i].ry * (1 - e);
          c.rotation.z = starts[i].rz * (1 - e);
        });
        if (t < 1) scrambleAnim = requestAnimationFrame(step);
      }
      step();
    }

    let raf = null;
    function tick() {
      if (autoSpin && !dragging) rotY += 0.006;
      cubeGroup.rotation.x = rotX;
      cubeGroup.rotation.y = rotY;
      renderer.render(scene, camera);
      raf = requestAnimationFrame(tick);
    }

    return {
      start() { if (!raf) tick(); resize(); },
      stop() { if (raf) cancelAnimationFrame(raf); raf = null; },
      scramble,
      solve
    };
  }

  // ------------------------------------------------------------
  // Smooth anchor scroll offset (compensate sticky nav)
  // ------------------------------------------------------------
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 70;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

})();
