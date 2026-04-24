/* =========================================================
   ambient-cubes-nav.js

   Three tiny floating Rubik's cubes as inter-experience nav.
   Same DNA as picker-wizard-v2 (ambient drifters) and
   transition-cube (full-screen solve). On click, the cube
   triggers transition-cube.playTransition() before the
   destination is reached.

   Usage:
     AmbientCubesNav.mount({
       current: 'xp',                 // 'xp' | 'readme' | 'saas'
       container: document.body,      // optional, defaults to body
       corner: 'bottom-right',        // 'bottom-right' | 'right-edge'
       destinations: {                // optional — override URLs
         xp:     '../xp-luna-v3/',
         readme: '../readme-git-fusion-v2/',
         saas:   '../saas-v5/',
       },
       onNavigate: (id) => {},        // optional — intercept; if you
                                      //   return true, default nav skipped
     });

   This component expects three.js and cube-solver/transition-cube to
   be loadable. It lazy-loads them if they aren't already on window.
   ========================================================= */

(function (global) {
  "use strict";

  const THREE_CDN = "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js";

  // Default paths relative to the experience that mounts the nav.
  // The assumption: experiences live as sibling folders under /concepts/.
  const DEFAULT_DESTINATIONS = {
    xp:     "../xp-luna-v3/",
    readme: "../readme-git-fusion-v2/",
    saas:   "../saas-v5/",
  };

  const EXPERIENCE_META = {
    xp:     { label: "the OS",      tone: 0x6c9ad6, sub: "xp-luna-v3" },
    readme: { label: "the README",  tone: 0x7fb77f, sub: "readme-git-fusion-v2" },
    saas:   { label: "the SaaS",    tone: 0xd98383, sub: "saas-v5" },
  };

  // Same softened Rubik's palette as the picker. Each face has its own
  // sticker; the 'tone' above is a faint aura color, not a recolor.
  const STICKER = {
    U: 0xffffff,
    D: 0xf3d96b,
    F: 0x7fb77f,
    B: 0x6c9ad6,
    R: 0xd98383,
    L: 0xe5a86a,
  };
  const BODY = 0x1a1b1e;

  // ---------- public API ----------

  let mounted = false;
  let root = null;
  let state = null;

  function mount(opts) {
    if (mounted) {
      console.warn("[ambient-cubes-nav] already mounted");
      return;
    }
    opts = opts || {};
    const container = opts.container || document.body;
    const current = opts.current || "xp";
    const corner = opts.corner || "bottom-right";
    const destinations = Object.assign({}, DEFAULT_DESTINATIONS, opts.destinations || {});
    const onNavigate = typeof opts.onNavigate === "function" ? opts.onNavigate : null;

    state = { current, corner, destinations, onNavigate, cubes: [] };

    // Inject the host shell immediately so layout settles even before WebGL.
    root = buildShell(current, corner);
    container.appendChild(root);

    // Lazy-load three.js if needed, then init WebGL cubes.
    ensureThree().then(() => {
      initScene(root, state);
    }).catch((err) => {
      console.warn("[ambient-cubes-nav] three.js failed to load; falling back to CSS cubes", err);
      initCssFallback(root, state);
    });

    mounted = true;
  }

  function unmount() {
    if (!mounted) return;
    if (state && state.disposers) state.disposers.forEach(d => { try { d(); } catch(e){} });
    if (root && root.parentNode) root.parentNode.removeChild(root);
    root = null;
    state = null;
    mounted = false;
  }

  // ---------- shell (DOM chrome) ----------

  function buildShell(current, corner) {
    const host = document.createElement("nav");
    host.className = "ambient-cubes-nav";
    host.setAttribute("aria-label", "Inter-experience navigation");
    host.dataset.corner = corner;

    // Inline the minimum CSS so the nav is usable even if styles.css
    // is not loaded (e.g. when embedded in an unrelated experience).
    if (!document.getElementById("__ambient-cubes-nav-css")) {
      const s = document.createElement("style");
      s.id = "__ambient-cubes-nav-css";
      s.textContent = INLINE_CSS;
      document.head.appendChild(s);
    }

    const strip = document.createElement("div");
    strip.className = "acn-strip";
    host.appendChild(strip);

    const order = ["xp", "readme", "saas"];
    order.forEach((id) => {
      const meta = EXPERIENCE_META[id];
      const slot = document.createElement("button");
      slot.className = "acn-slot";
      slot.type = "button";
      slot.dataset.id = id;
      slot.setAttribute("aria-label", `Go to ${meta.label} (${meta.sub})`);
      if (id === current) slot.dataset.active = "true";

      const stage = document.createElement("span");
      stage.className = "acn-stage";
      slot.appendChild(stage);

      const tip = document.createElement("span");
      tip.className = "acn-tip";
      tip.innerHTML = `<strong>${meta.label}</strong><em>${meta.sub}</em>`;
      slot.appendChild(tip);

      strip.appendChild(slot);
    });

    const rail = document.createElement("div");
    rail.className = "acn-rail";
    rail.textContent = "nav";
    host.appendChild(rail);

    return host;
  }

  // ---------- three.js scene ----------

  function initScene(host, state) {
    const THREE = global.THREE;
    const slots = host.querySelectorAll(".acn-slot");
    state.disposers = [];

    slots.forEach((slot) => {
      const id = slot.dataset.id;
      const stage = slot.querySelector(".acn-stage");
      const isActive = id === state.current;

      // One tiny WebGL canvas per cube. Low-res, low-cost. Renders only
      // on animation frame and stops when offscreen.
      const size = isActive ? 62 : 42;
      stage.style.width = size + "px";
      stage.style.height = size + "px";

      const canvas = document.createElement("canvas");
      canvas.width = size * (window.devicePixelRatio || 1);
      canvas.height = size * (window.devicePixelRatio || 1);
      canvas.style.width = size + "px";
      canvas.style.height = size + "px";
      stage.appendChild(canvas);

      const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
      renderer.setPixelRatio(window.devicePixelRatio || 1);
      renderer.setSize(size, size, false);
      renderer.setClearColor(0x000000, 0);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 30);
      camera.position.set(5.2, 4.2, 6.4);
      camera.lookAt(0, 0, 0);

      // Lighting: soft, no specular pop.
      scene.add(new THREE.AmbientLight(0xffffff, isActive ? 0.95 : 0.75));
      const key = new THREE.DirectionalLight(0xffffff, isActive ? 0.5 : 0.35);
      key.position.set(4, 6, 8);
      scene.add(key);

      const cube = makeRubiksCube(THREE);
      // Faint colored aura behind the cube — the 'tone' from meta.
      const aura = new THREE.Mesh(
        new THREE.PlaneGeometry(5.5, 5.5),
        new THREE.MeshBasicMaterial({
          color: EXPERIENCE_META[id].tone,
          transparent: true,
          opacity: isActive ? 0.11 : 0.06,
          side: THREE.DoubleSide,
        })
      );
      aura.position.set(0, 0, -3);
      scene.add(aura);
      scene.add(cube);

      // Non-active cubes ride at a slightly smaller world scale so
      // perspective feels like they're 'further away' inside the toolbar.
      const worldScale = isActive ? 1.0 : 0.78;
      cube.scale.setScalar(worldScale);

      // Deterministic per-cube wobble + spin so the three cubes don't
      // sync up visually.
      const seed = id === "xp" ? 1 : id === "readme" ? 2 : 3;
      const rnd = mulberry32(seed * 31 + 7);
      const spinBase = isActive ? 0.006 : 0.004;
      const axis = new THREE.Vector3(
        (rnd() - 0.5) * 0.6,
        1.0,
        (rnd() - 0.5) * 0.4,
      ).normalize();
      const tiltPhase = rnd() * Math.PI * 2;

      // Start rotation randomized so cubes don't share a face.
      cube.rotation.set(rnd() * Math.PI, rnd() * Math.PI, rnd() * Math.PI);

      const ctx = {
        id, slot, stage, canvas, renderer, scene, camera, cube, aura,
        axis, spinBase, tiltPhase,
        hover: false,
        clicking: false,
        size,
        worldScaleBase: worldScale,
        active: isActive,
        alive: true,
      };
      state.cubes.push(ctx);

      // Hover + focus visual lift (extra spin + scale).
      slot.addEventListener("mouseenter", () => { ctx.hover = true; });
      slot.addEventListener("mouseleave", () => { ctx.hover = false; });
      slot.addEventListener("focus",      () => { ctx.hover = true; });
      slot.addEventListener("blur",       () => { ctx.hover = false; });

      // Click → transition then navigate.
      slot.addEventListener("click", (e) => {
        e.preventDefault();
        if (ctx.clicking) return;
        ctx.clicking = true;
        handleNavigate(id);
      });
      slot.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          slot.click();
        }
      });

      state.disposers.push(() => {
        ctx.alive = false;
        try { renderer.dispose(); } catch(_) {}
      });
    });

    // One shared RAF loop across all cubes — cheaper than three separate.
    const t0 = performance.now();
    function loop() {
      const t = (performance.now() - t0) / 1000;
      let anyAlive = false;
      for (const ctx of state.cubes) {
        if (!ctx.alive) continue;
        anyAlive = true;
        // Ambient spin + slight wobble
        const hoverBoost = ctx.hover ? 2.6 : 1.0;
        const clickFreeze = ctx.clicking ? 0.2 : 1.0;
        const spin = ctx.spinBase * hoverBoost * clickFreeze;
        ctx.cube.rotateOnWorldAxis(ctx.axis, spin);
        const wobble = Math.sin(t * 0.9 + ctx.tiltPhase) * 0.04;
        ctx.cube.rotation.z += wobble * 0.006;

        // Hover pops scale slightly
        const scaleTarget = ctx.worldScaleBase * (ctx.hover ? 1.10 : 1.0) * (ctx.clicking ? 1.18 : 1.0);
        const cur = ctx.cube.scale.x;
        ctx.cube.scale.setScalar(cur + (scaleTarget - cur) * 0.15);

        ctx.renderer.render(ctx.scene, ctx.camera);
      }
      if (anyAlive) requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
  }

  function makeRubiksCube(THREE) {
    const group = new THREE.Group();
    const size = 0.92;
    const gap = 0.04;
    for (let x = -1; x <= 1; x++) {
      for (let y = -1; y <= 1; y++) {
        for (let z = -1; z <= 1; z++) {
          const geo = new THREE.BoxGeometry(size, size, size);
          const materials = [
            new THREE.MeshLambertMaterial({ color: x ===  1 ? STICKER.R : BODY }),
            new THREE.MeshLambertMaterial({ color: x === -1 ? STICKER.L : BODY }),
            new THREE.MeshLambertMaterial({ color: y ===  1 ? STICKER.U : BODY }),
            new THREE.MeshLambertMaterial({ color: y === -1 ? STICKER.D : BODY }),
            new THREE.MeshLambertMaterial({ color: z ===  1 ? STICKER.F : BODY }),
            new THREE.MeshLambertMaterial({ color: z === -1 ? STICKER.B : BODY }),
          ];
          const mesh = new THREE.Mesh(geo, materials);
          mesh.position.set(x * (size + gap), y * (size + gap), z * (size + gap));
          group.add(mesh);
        }
      }
    }
    return group;
  }

  // ---------- navigation ----------

  function handleNavigate(id) {
    if (!state) return;

    // If clicking the current cube: a short shake + no-op. Don't trigger
    // a transition you'd just land on the same page from.
    if (id === state.current) {
      shakeActive();
      return;
    }

    // Give consumer a hook to intercept.
    if (state.onNavigate) {
      const handled = state.onNavigate(id);
      if (handled === true) return;
    }

    const destination = state.destinations[id];

    // Load transition-cube on demand, then play it.
    ensureTransitionCube().then(() => {
      if (global.TransitionCube && typeof global.TransitionCube.playTransition === "function") {
        global.TransitionCube.playTransition({
          duration: 3200,
          destinationUrl: destination,
        });
      } else {
        // If transition-cube is unreachable, navigate plainly.
        window.location.href = destination;
      }
    }).catch(() => {
      window.location.href = destination;
    });
  }

  function shakeActive() {
    const active = root && root.querySelector('.acn-slot[data-active="true"]');
    if (!active) return;
    active.classList.remove("acn-shake");
    // reflow, then re-add so the animation restarts every click.
    void active.offsetWidth;
    active.classList.add("acn-shake");
  }

  // ---------- dependency loading ----------

  function ensureThree() {
    if (global.THREE) return Promise.resolve();
    return loadScript(THREE_CDN);
  }

  function ensureTransitionCube() {
    if (global.TransitionCube) return Promise.resolve();
    // Resolve the transition-cube script paths relative to THIS script so
    // the nav works regardless of where the host page lives.
    const base = resolveTransitionBase();
    return ensureThree()
      .then(() => loadScript(base + "cube-solver.js"))
      .then(() => loadScript(base + "transition-cube.js"));
  }

  function resolveTransitionBase() {
    const scripts = document.getElementsByTagName("script");
    for (let i = 0; i < scripts.length; i++) {
      const src = scripts[i].src || "";
      if (src.endsWith("/ambient-cubes-nav.js") || src.endsWith("ambient-cubes-nav.js")) {
        // Replace the filename with the sibling transition-cube folder.
        return src.replace(/nav-ambient-cubes\/ambient-cubes-nav\.js(\?.*)?$/,
                           "transition-cube/");
      }
    }
    // Last-ditch guess: if the page is under /concepts/<x>/, step up one.
    return "../transition-cube/";
  }

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const existing = Array.from(document.scripts).find(s => s.src === src);
      if (existing) { resolve(); return; }
      const s = document.createElement("script");
      s.src = src;
      s.async = false;
      s.onload = () => resolve();
      s.onerror = () => reject(new Error("failed to load " + src));
      document.head.appendChild(s);
    });
  }

  // ---------- CSS fallback (no WebGL) ----------

  function initCssFallback(host, state) {
    // If three.js can't load, just render a simple CSS 3D cube per slot so
    // the nav is still clickable. No animation — intentionally quiet.
    host.classList.add("acn-fallback");
    const slots = host.querySelectorAll(".acn-slot");
    slots.forEach((slot) => {
      const id = slot.dataset.id;
      const stage = slot.querySelector(".acn-stage");
      const isActive = id === state.current;
      const size = isActive ? 48 : 34;
      stage.style.width = size + "px";
      stage.style.height = size + "px";
      const faux = document.createElement("span");
      faux.className = "acn-faux";
      faux.style.background = "linear-gradient(135deg,#7fb77f 0 33%,#f3d96b 33% 66%,#d98383 66% 100%)";
      stage.appendChild(faux);

      slot.addEventListener("click", (e) => {
        e.preventDefault();
        handleNavigate(id);
      });
    });
  }

  // ---------- utils ----------

  function mulberry32(a) {
    return function () {
      a |= 0;
      a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // ---------- inline CSS (self-contained fallback) ----------
  // styles.css is the canonical source; this mirrors the essentials so
  // the nav looks right even if you forgot to include the stylesheet.

  const INLINE_CSS = `
.ambient-cubes-nav{
  position:fixed;
  z-index:999;
  pointer-events:none;
  font-family:ui-sans-serif,-apple-system,BlinkMacSystemFont,"Segoe UI",Inter,sans-serif;
}
.ambient-cubes-nav[data-corner="bottom-right"]{
  right:18px; bottom:18px;
}
.ambient-cubes-nav[data-corner="right-edge"]{
  right:14px; top:50%; transform:translateY(-50%);
}
.ambient-cubes-nav .acn-strip{
  display:flex;
  align-items:flex-end;
  gap:14px;
  padding:10px 14px 10px 14px;
  background:rgba(20,22,28,0.62);
  backdrop-filter:blur(10px);
  -webkit-backdrop-filter:blur(10px);
  border:1px solid rgba(255,255,255,0.07);
  border-radius:14px;
  box-shadow:0 6px 22px rgba(0,0,0,0.22), inset 0 1px 0 rgba(255,255,255,0.04);
  pointer-events:auto;
}
.ambient-cubes-nav[data-corner="right-edge"] .acn-strip{
  flex-direction:column;
  align-items:center;
  padding:14px 10px;
}
.ambient-cubes-nav .acn-slot{
  position:relative;
  background:transparent;
  border:0;
  padding:0;
  cursor:pointer;
  outline:none;
  color:inherit;
  line-height:1;
  -webkit-appearance:none;
  appearance:none;
}
.ambient-cubes-nav .acn-slot:focus-visible{
  outline:2px solid #7fb7ff;
  outline-offset:4px;
  border-radius:8px;
}
.ambient-cubes-nav .acn-stage{
  display:inline-block;
  vertical-align:bottom;
  transition:filter 180ms ease;
  filter:saturate(0.88);
}
.ambient-cubes-nav .acn-slot:hover .acn-stage,
.ambient-cubes-nav .acn-slot:focus-visible .acn-stage{
  filter:saturate(1.05) drop-shadow(0 4px 10px rgba(0,0,0,0.3));
}
.ambient-cubes-nav .acn-slot[data-active="true"] .acn-stage{
  filter:saturate(1.0) drop-shadow(0 4px 12px rgba(127,183,255,0.24));
}
.ambient-cubes-nav .acn-tip{
  position:absolute;
  bottom:calc(100% + 10px);
  left:50%;
  transform:translate(-50%,4px);
  background:rgba(12,14,20,0.96);
  color:#eef1f6;
  padding:7px 10px;
  border-radius:8px;
  border:1px solid rgba(255,255,255,0.08);
  font-size:11.5px;
  letter-spacing:0.02em;
  white-space:nowrap;
  opacity:0;
  pointer-events:none;
  transition:opacity 140ms ease, transform 140ms ease;
  box-shadow:0 6px 14px rgba(0,0,0,0.3);
}
.ambient-cubes-nav .acn-tip strong{ display:block; font-weight:600; }
.ambient-cubes-nav .acn-tip em{
  display:block;
  font-style:normal;
  color:#9aa4b2;
  font-size:10.5px;
  margin-top:2px;
}
.ambient-cubes-nav[data-corner="right-edge"] .acn-tip{
  bottom:auto;
  top:50%;
  left:auto;
  right:calc(100% + 10px);
  transform:translate(4px,-50%);
}
.ambient-cubes-nav .acn-slot:hover .acn-tip,
.ambient-cubes-nav .acn-slot:focus-visible .acn-tip{
  opacity:1;
  transform:translate(-50%,0);
}
.ambient-cubes-nav[data-corner="right-edge"] .acn-slot:hover .acn-tip,
.ambient-cubes-nav[data-corner="right-edge"] .acn-slot:focus-visible .acn-tip{
  transform:translate(0,-50%);
}
.ambient-cubes-nav .acn-rail{
  position:absolute;
  right:14px;
  top:-9px;
  font-size:9.5px;
  letter-spacing:0.22em;
  text-transform:uppercase;
  color:rgba(234,239,247,0.4);
  background:rgba(20,22,28,0.9);
  padding:2px 6px;
  border-radius:4px;
  border:1px solid rgba(255,255,255,0.06);
  pointer-events:none;
}
.ambient-cubes-nav[data-corner="right-edge"] .acn-rail{
  right:50%;
  top:-14px;
  transform:translateX(50%);
}
@keyframes acn-shake{
  0%,100%{ transform:translate3d(0,0,0); }
  20%{ transform:translate3d(-3px,0,0); }
  40%{ transform:translate3d(3px,0,0); }
  60%{ transform:translate3d(-2px,0,0); }
  80%{ transform:translate3d(2px,0,0); }
}
.ambient-cubes-nav .acn-shake{ animation:acn-shake 360ms cubic-bezier(.36,.07,.19,.97) both; }
.ambient-cubes-nav.acn-fallback .acn-faux{
  display:block; width:100%; height:100%;
  border-radius:6px;
  box-shadow:inset 0 0 0 1px rgba(0,0,0,0.35);
}
@media (prefers-reduced-motion: reduce){
  .ambient-cubes-nav .acn-stage{ transition:none; }
}
`;

  // ---------- expose ----------
  global.AmbientCubesNav = { mount, unmount };
})(typeof window !== "undefined" ? window : globalThis);
