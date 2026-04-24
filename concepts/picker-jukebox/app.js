/* ==========================================================
   JR-2026 Jukebox — rotor physics, detents, audio, launch
   ========================================================== */

(function () {
  "use strict";

  // --- catalogue ---------------------------------------------------------
  const MODES = [
    {
      slot: "A1",
      slug: "xp-luna-v2",
      title: "Nostalgic OS",
      line: "All the nostalgia, none of the Service Pack 2 anxiety.",
      tn: "tn-xp",
      length: "3:14",
    },
    {
      slot: "A2",
      slug: "enterprise-saas-v2",
      title: "Enterprise SaaS",
      line: "If you're looking for a dev tool to hire, you found one.",
      tn: "tn-saas",
      length: "4:02",
    },
    {
      slot: "B1",
      slug: "git-log-v2",
      title: "Engineer Native",
      line: "Git log. For recruiters who read commit messages.",
      tn: "tn-git",
      length: "2:48",
    },
    {
      slot: "B2",
      slug: "readme-mode",
      title: "README",
      line: "Because of course I wrote one about myself.",
      tn: "tn-readme",
      length: "1:33",
    },
    {
      slot: "B3",
      slug: "vista-faithful-v2",
      title: "Aero Glass",
      line: "Vista. Cleaner than it deserves to be.",
      tn: "tn-vista",
      length: "3:57",
    },
  ];

  const STEP_DEG = 360 / MODES.length; // 72°
  const DEFAULT_INDEX = 0;

  // --- dom lookups -------------------------------------------------------
  const rotor = document.getElementById("rotor");
  const disc = document.getElementById("rotorDisc");
  const sideNumber = document.getElementById("sideNumber");
  const modeTitle = document.getElementById("modeTitle");
  const modeDesc = document.getElementById("modeDesc");
  const modeSlug = document.getElementById("modeSlug");
  const thumbStage = document.getElementById("thumbStage");
  const display = document.querySelector(".display");
  const tracklist = document.getElementById("tracklist");
  const arrowLeft = document.getElementById("arrowLeft");
  const arrowRight = document.getElementById("arrowRight");
  const launchBtn = document.getElementById("launchBtn");
  const muteBtn = document.getElementById("muteBtn");
  const muteIcon = document.getElementById("muteIcon");
  const clunk = document.getElementById("clunk");
  const clunkWord = document.getElementById("clunkWord");
  const jukebox = document.querySelector(".jukebox");

  // --- state -------------------------------------------------------------
  let rotation = 0;        // current visual angle (degrees), can be unbounded
  let velocity = 0;        // deg/frame
  let dragging = false;
  let dragLastAngle = 0;
  let dragStartPointerAngle = 0;
  let dragStartRotation = 0;
  let lastIndex = -1;
  let rafId = null;
  let soundOn = false;
  let committing = false;

  // --- build rotor slots -------------------------------------------------
  function buildSlots() {
    MODES.forEach((m, i) => {
      const slot = document.createElement("div");
      slot.className = "slot";
      slot.dataset.index = String(i);
      // Each slot rotates around the rotor center. The slot-card sits at
      // radius 130 above the slot's origin and counter-rotates so text is
      // upright when that slot is at the top (active).
      slot.style.transform = `rotate(${i * STEP_DEG}deg)`;

      const card = document.createElement("div");
      card.className = "slot-card";
      card.innerHTML = `<div><small>SIDE ${m.slot}</small>${escape(m.title)}</div>`;
      slot.appendChild(card);

      disc.appendChild(slot);
    });
  }

  function escape(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    }[c]));
  }

  function buildTracklist() {
    tracklist.innerHTML = "";
    MODES.forEach((m, i) => {
      const li = document.createElement("li");
      li.dataset.index = String(i);
      li.innerHTML = `
        <span class="tl-side">${m.slot}</span>
        <span class="tl-name">${escape(m.title)}</span>
        <span class="tl-len">${m.length}</span>
      `;
      li.addEventListener("click", () => selectIndex(i, { snap: true }));
      tracklist.appendChild(li);
    });
  }

  function buildThumbs() {
    thumbStage.innerHTML = "";
    MODES.forEach((m, i) => {
      const tn = document.createElement("div");
      tn.className = `tn ${m.tn}`;
      tn.dataset.index = String(i);
      tn.style.opacity = i === DEFAULT_INDEX ? "1" : "0";
      tn.style.transition = "opacity 0.3s ease";
      tn.style.position = "absolute";
      tn.style.inset = "0";
      thumbStage.appendChild(tn);
    });
  }

  // --- angle helpers -----------------------------------------------------
  function normalize(a) {
    let x = a % 360;
    if (x < 0) x += 360;
    return x;
  }
  // for each integer 0..4, the rotation that puts that slot at the top
  // (indicator at 0°/top) is -i * STEP_DEG (mod 360).
  function indexForRotation(r) {
    // we want the slot whose angle + r ≡ 0 (mod 360) --> slot angle ≡ -r
    const needed = normalize(-r);
    // nearest slot index
    let best = 0;
    let bestDist = 999;
    MODES.forEach((_, i) => {
      const slotAngle = i * STEP_DEG;
      let d = Math.abs(angleDelta(slotAngle, needed));
      if (d < bestDist) {
        bestDist = d;
        best = i;
      }
    });
    return best;
  }
  function angleDelta(a, b) {
    let d = (a - b) % 360;
    if (d > 180) d -= 360;
    if (d < -180) d += 360;
    return d;
  }
  function rotationForIndex(i) {
    // returns the "ideal" rotation closest to current rotation
    const ideal = -i * STEP_DEG;
    const cur = rotation;
    // choose representative that minimizes travel
    const diff = angleDelta(ideal, normalize(cur));
    return cur + diff;
  }

  // --- apply rotation + highlight ----------------------------------------
  function applyRotation() {
    disc.style.transform = `rotate(${rotation}deg)`;
    const idx = indexForRotation(rotation);
    if (idx !== lastIndex) {
      lastIndex = idx;
      updateUIForIndex(idx);
      tick();
    }
    rotor.setAttribute("aria-valuenow", String(idx));
  }

  function updateUIForIndex(i) {
    const m = MODES[i];
    sideNumber.textContent = m.slot;
    modeTitle.textContent = m.title;
    modeDesc.textContent = m.line;
    modeSlug.textContent = m.slug;

    display.classList.remove("flash");
    // re-trigger
    void display.offsetWidth;
    display.classList.add("flash");

    // slot cards
    disc.querySelectorAll(".slot").forEach((s) => {
      s.classList.toggle("active", Number(s.dataset.index) === i);
    });
    // tracklist
    tracklist.querySelectorAll("li").forEach((li) => {
      li.classList.toggle("active", Number(li.dataset.index) === i);
    });
    // thumbnails
    thumbStage.classList.add("switching");
    window.clearTimeout(updateUIForIndex._t);
    updateUIForIndex._t = window.setTimeout(() => {
      thumbStage.classList.remove("switching");
    }, 180);
    thumbStage.querySelectorAll(".tn").forEach((t) => {
      t.style.opacity = Number(t.dataset.index) === i ? "1" : "0";
    });
  }

  // --- physics loop ------------------------------------------------------
  function physicsStep() {
    if (dragging || committing) {
      rafId = null;
      return;
    }
    const targetIndex = indexForRotation(rotation);
    const targetRotation = rotationForIndex(targetIndex);
    const delta = targetRotation - rotation;
    // spring-damper
    const k = 0.12;     // pull to detent
    const damp = 0.72;  // velocity decay
    velocity = velocity * damp + delta * k;
    rotation += velocity;

    applyRotation();

    if (Math.abs(velocity) > 0.05 || Math.abs(delta) > 0.2) {
      rafId = requestAnimationFrame(physicsStep);
    } else {
      rotation = targetRotation;
      velocity = 0;
      applyRotation();
      rafId = null;
    }
  }
  function ensureLoop() {
    if (rafId == null && !dragging) rafId = requestAnimationFrame(physicsStep);
  }

  // --- interactions ------------------------------------------------------
  function selectIndex(i, opts = {}) {
    const target = rotationForIndex(i);
    if (opts.snap) {
      velocity = (target - rotation) * 0.35;
    } else {
      velocity = 0;
      rotation = target;
    }
    ensureLoop();
    applyRotation();
  }
  function step(dir) {
    const next = (lastIndex + dir + MODES.length) % MODES.length;
    // overshoot a touch for character
    const target = rotationForIndex(next);
    velocity = (target - rotation) * 0.25 + dir * 2;
    ensureLoop();
  }

  // pointer-based drag
  function pointerAngle(ev) {
    const rect = rotor.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const x = (ev.touches ? ev.touches[0].clientX : ev.clientX) - cx;
    const y = (ev.touches ? ev.touches[0].clientY : ev.clientY) - cy;
    // 0° at top, clockwise positive
    return (Math.atan2(x, -y) * 180) / Math.PI;
  }
  function onPointerDown(ev) {
    ev.preventDefault();
    dragging = true;
    rotor.setPointerCapture && ev.pointerId != null && rotor.setPointerCapture(ev.pointerId);
    dragStartPointerAngle = pointerAngle(ev);
    dragStartRotation = rotation;
    dragLastAngle = dragStartPointerAngle;
    velocity = 0;
    if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
  }
  function onPointerMove(ev) {
    if (!dragging) return;
    const a = pointerAngle(ev);
    const d = angleDelta(a, dragStartPointerAngle);
    const newRot = dragStartRotation + d;
    velocity = newRot - rotation;
    rotation = newRot;
    applyRotation();
    dragLastAngle = a;
  }
  function onPointerUp() {
    if (!dragging) return;
    dragging = false;
    ensureLoop();
  }

  rotor.addEventListener("pointerdown", onPointerDown);
  window.addEventListener("pointermove", onPointerMove);
  window.addEventListener("pointerup", onPointerUp);
  window.addEventListener("pointercancel", onPointerUp);

  // keyboard
  window.addEventListener("keydown", (e) => {
    if (committing) return;
    if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
      e.preventDefault();
      step(-1);
    } else if (e.key === "ArrowRight" || e.key === "ArrowUp") {
      e.preventDefault();
      step(1);
    } else if (e.key === "Enter" || e.key === " ") {
      if (document.activeElement !== muteBtn) {
        e.preventDefault();
        commitLaunch();
      }
    } else if (e.key === "m" || e.key === "M") {
      toggleSound();
    } else if (/^[1-5]$/.test(e.key)) {
      selectIndex(Number(e.key) - 1, { snap: true });
    }
  });

  arrowLeft.addEventListener("click", () => step(-1));
  arrowRight.addEventListener("click", () => step(1));

  // wheel support
  rotor.addEventListener("wheel", (e) => {
    e.preventDefault();
    const delta = e.deltaY || e.deltaX;
    rotation -= delta * 0.3;
    velocity = -delta * 0.08;
    ensureLoop();
    applyRotation();
  }, { passive: false });

  // --- audio (WebAudio tick) --------------------------------------------
  let audioCtx = null;
  function ensureAudio() {
    if (!audioCtx) {
      try {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      } catch (_) { /* ignore */ }
    }
    if (audioCtx && audioCtx.state === "suspended") audioCtx.resume();
  }
  function tick() {
    if (!soundOn || !audioCtx) return;
    const t = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = "square";
    osc.frequency.setValueAtTime(880, t);
    osc.frequency.exponentialRampToValueAtTime(280, t + 0.04);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.16, t + 0.004);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.07);
    osc.connect(gain).connect(audioCtx.destination);
    osc.start(t);
    osc.stop(t + 0.08);
  }
  function clunkSound() {
    if (!soundOn || !audioCtx) return;
    const t = audioCtx.currentTime;
    // low thud
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(180, t);
    osc.frequency.exponentialRampToValueAtTime(40, t + 0.25);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.5, t + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
    osc.connect(gain).connect(audioCtx.destination);
    osc.start(t);
    osc.stop(t + 0.55);
    // mechanical clack
    const buf = audioCtx.createBuffer(1, 2205, 44100);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / data.length, 3);
    }
    const src = audioCtx.createBufferSource();
    const ng = audioCtx.createGain();
    ng.gain.value = 0.35;
    src.buffer = buf;
    src.connect(ng).connect(audioCtx.destination);
    src.start(t + 0.02);
  }
  function toggleSound() {
    soundOn = !soundOn;
    muteBtn.setAttribute("aria-pressed", String(!soundOn));
    muteIcon.innerHTML = soundOn ? "&#128266;" : "&#128263;";
    if (soundOn) ensureAudio();
  }
  muteBtn.addEventListener("click", toggleSound);

  // --- launch ------------------------------------------------------------
  function commitLaunch() {
    if (committing) return;
    committing = true;
    const m = MODES[lastIndex];
    launchBtn.classList.add("pressed");
    jukebox.classList.add("shake");
    ensureAudio();
    clunkSound();

    clunkWord.textContent = `CUEING  ${m.slot}`;
    setTimeout(() => {
      clunk.classList.add("on");
      clunkWord.textContent = `NOW PLAYING — ${m.title.toUpperCase()}`;
    }, 260);

    setTimeout(() => {
      const href = `../${m.slug}/`;
      try {
        window.location.href = href;
      } catch (_) {
        window.location.assign(href);
      }
    }, 1100);
  }
  launchBtn.addEventListener("click", commitLaunch);

  // --- init --------------------------------------------------------------
  buildSlots();
  buildTracklist();
  buildThumbs();
  rotation = rotationForIndex(DEFAULT_INDEX);
  applyRotation();
  updateUIForIndex(DEFAULT_INDEX);

  // one-time hint pulse
  setTimeout(() => {
    const hint = document.querySelector(".hint");
    if (hint) {
      hint.style.transition = "opacity 1.2s ease";
      hint.style.opacity = "0.6";
    }
  }, 6000);
})();
