/* ─────────────────────────────────────────────────────────
   jakeOS — concept 03
   Vanilla JS. No build. Zero deps.
   ───────────────────────────────────────────────────────── */

(() => {
  "use strict";

  // ── app registry ────────────────────────────────────────
  const APPS = {
    about: {
      title: "About.app",
      w: 520, h: 460,
      render: renderAbout,
    },
    projects: {
      title: "Projects.app",
      w: 640, h: 520,
      render: renderProjects,
    },
    resume: {
      title: "Resume.pdf — Preview",
      w: 620, h: 640,
      render: renderResume,
    },
    contact: {
      title: "Contact.app",
      w: 480, h: 480,
      render: renderContact,
    },
    stockunlock: {
      title: "StockUnlock.app",
      w: 540, h: 520,
      render: renderStockUnlock,
    },
    cube: {
      title: "RubiksCube.app",
      w: 420, h: 440,
      render: renderCube,
    },
    notepad: {
      title: "Notepad.txt",
      w: 460, h: 400,
      render: renderNotepad,
    },
    terminal: {
      title: "Terminal — jake@jakeOS",
      w: 560, h: 380,
      render: renderTerminal,
    },
  };

  // ── window manager state ────────────────────────────────
  const state = {
    windows: new Map(), // id -> { id, appKey, el, pill, state, rect, prevRect }
    zTop: 100,
    activeId: null,
    nextId: 1,
  };

  const $windows = document.getElementById("windows");
  const $pills = document.getElementById("taskbar-pills");
  const $startBtn = document.getElementById("start-btn");
  const $startMenu = document.getElementById("startmenu");

  // ── clock ───────────────────────────────────────────────
  function tickClock() {
    const now = new Date();
    const time = now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
    const date = now.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });
    document.getElementById("tray-clock").innerHTML =
      `<span>${time}</span><span class="d">${date}</span>`;
    document.getElementById("menu-date").textContent = date;
    document.getElementById("menu-time").textContent = time;
  }
  tickClock();
  setInterval(tickClock, 15000);

  // ── wallpaper (cursor-reactive particles) ───────────────
  initWallpaper();

  function initWallpaper() {
    const canvas = document.getElementById("wallpaper");
    const ctx = canvas.getContext("2d", { alpha: true });
    let W = 0, H = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    function resize() {
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      canvas.style.width = W + "px";
      canvas.style.height = H + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener("resize", resize);

    // Geometric dot grid, with subtle cursor distortion
    const SP = 42; // spacing
    const mouse = { x: -9999, y: -9999, tx: -9999, ty: -9999 };
    window.addEventListener("mousemove", (e) => {
      mouse.tx = e.clientX;
      mouse.ty = e.clientY;
    });

    // particle trail
    const trail = [];
    window.addEventListener("mousemove", (e) => {
      if (Math.random() < 0.35) {
        trail.push({
          x: e.clientX, y: e.clientY,
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4 - 0.2,
          life: 1,
          hue: 210 + Math.random() * 60,
        });
        if (trail.length > 80) trail.shift();
      }
    });

    let t = 0;
    function frame() {
      t += 0.006;
      // ease cursor
      mouse.x += (mouse.tx - mouse.x) * 0.12;
      mouse.y += (mouse.ty - mouse.y) * 0.12;

      ctx.clearRect(0, 0, W, H);

      // dotted grid
      for (let x = SP / 2; x < W; x += SP) {
        for (let y = SP / 2; y < H; y += SP) {
          const dx = x - mouse.x;
          const dy = y - mouse.y;
          const d = Math.hypot(dx, dy);
          const influence = Math.max(0, 1 - d / 180);
          const r = 1 + influence * 2.2;
          const alpha = 0.08 + influence * 0.45;
          const offX = (dx / (d || 1)) * influence * 10;
          const offY = (dy / (d || 1)) * influence * 10;
          ctx.beginPath();
          ctx.arc(x + offX, y + offY, r, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${138 + influence * 60}, ${180 + influence * 30}, 255, ${alpha})`;
          ctx.fill();
        }
      }

      // trail particles
      for (let i = trail.length - 1; i >= 0; i--) {
        const p = trail[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy -= 0.01;
        p.life -= 0.012;
        if (p.life <= 0) { trail.splice(i, 1); continue; }
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.6 * p.life, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 80%, 75%, ${p.life * 0.6})`;
        ctx.fill();
      }

      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  // ── icons: select + double-click to open ────────────────
  document.querySelectorAll("#icon-grid .icon").forEach((iconEl) => {
    iconEl.addEventListener("click", (e) => {
      document.querySelectorAll(".icon.selected").forEach(el => el.classList.remove("selected"));
      iconEl.classList.add("selected");
      e.stopPropagation();
    });
    iconEl.addEventListener("dblclick", () => {
      const app = iconEl.dataset.app;
      openApp(app);
    });
  });
  // deselect on desktop click
  document.getElementById("desktop").addEventListener("click", (e) => {
    if (!e.target.closest(".icon") && !e.target.closest(".window") && !e.target.closest(".taskbar") && !e.target.closest("#startmenu")) {
      document.querySelectorAll(".icon.selected").forEach(el => el.classList.remove("selected"));
      hideStartMenu();
    }
  });

  // ── start menu ──────────────────────────────────────────
  $startBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleStartMenu();
  });
  document.querySelectorAll("#startmenu [data-app]").forEach(li => {
    li.addEventListener("click", () => {
      openApp(li.dataset.app);
      hideStartMenu();
    });
  });
  function toggleStartMenu() {
    const hidden = $startMenu.classList.toggle("hidden");
    $startBtn.classList.toggle("open", !hidden);
  }
  function hideStartMenu() {
    $startMenu.classList.add("hidden");
    $startBtn.classList.remove("open");
  }

  // ── keyboard: Esc to close active, Cmd/Ctrl+W, ─────────
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") hideStartMenu();
    if ((e.metaKey || e.ctrlKey) && e.key === "w" && state.activeId) {
      e.preventDefault();
      closeWindow(state.activeId);
    }
  });

  // ── openApp ─────────────────────────────────────────────
  function openApp(appKey) {
    const def = APPS[appKey];
    if (!def) return;

    // If already open, focus it (and un-minimize)
    for (const w of state.windows.values()) {
      if (w.appKey === appKey) {
        if (w.state === "minimized") restoreWindow(w.id);
        else focusWindow(w.id);
        return;
      }
    }

    const id = "w" + state.nextId++;
    const el = document.createElement("section");
    el.className = "window";
    el.dataset.id = id;

    // Position: stagger
    const offset = (state.nextId % 6) * 26;
    const x = Math.max(40, (window.innerWidth - def.w) / 2 - 80 + offset);
    const y = Math.max(44, (window.innerHeight - def.h) / 2 - 40 + offset);
    el.style.left = x + "px";
    el.style.top = y + "px";
    el.style.width = def.w + "px";
    el.style.height = def.h + "px";

    el.innerHTML = `
      <div class="titlebar" data-drag="true">
        <div class="window-controls">
          <button class="wc close" aria-label="Close"><svg viewBox="0 0 10 10"><path d="M2 2 L8 8 M8 2 L2 8"/></svg></button>
          <button class="wc minimize" aria-label="Minimize"><svg viewBox="0 0 10 10"><path d="M2 5 L8 5"/></svg></button>
          <button class="wc maximize" aria-label="Maximize"><svg viewBox="0 0 10 10"><path d="M3 3 L7 3 L7 7 L3 7 Z"/></svg></button>
        </div>
        <div class="window-title">${escapeHtml(def.title)}</div>
      </div>
      <div class="window-body"></div>
      <div class="resize-handle" aria-hidden="true"></div>
    `;

    const body = el.querySelector(".window-body");
    def.render(body);

    $windows.appendChild(el);

    const win = {
      id, appKey, el, state: "normal",
      rect: { x, y, w: def.w, h: def.h },
      prevRect: null,
    };
    state.windows.set(id, win);

    // Taskbar pill
    const pill = document.createElement("button");
    pill.className = "pill active";
    pill.dataset.id = id;
    pill.innerHTML = `<span class="dot"></span><span>${escapeHtml(def.title)}</span>`;
    pill.addEventListener("click", () => {
      if (win.state === "minimized") restoreWindow(id);
      else if (state.activeId === id) minimizeWindow(id);
      else focusWindow(id);
    });
    $pills.appendChild(pill);
    win.pill = pill;

    // Wire window controls
    el.querySelector(".wc.close").addEventListener("click", (e) => { e.stopPropagation(); closeWindow(id); });
    el.querySelector(".wc.minimize").addEventListener("click", (e) => { e.stopPropagation(); minimizeWindow(id); });
    el.querySelector(".wc.maximize").addEventListener("click", (e) => { e.stopPropagation(); toggleMaximize(id); });

    // Dragging
    const titlebar = el.querySelector(".titlebar");
    makeDraggable(win, titlebar);
    // Double-click title to maximize
    titlebar.addEventListener("dblclick", (e) => {
      if (e.target.closest(".window-controls")) return;
      toggleMaximize(id);
    });

    // Resizing
    makeResizable(win, el.querySelector(".resize-handle"));

    // Focus on click
    el.addEventListener("mousedown", () => focusWindow(id));

    focusWindow(id);
  }

  function focusWindow(id) {
    const win = state.windows.get(id);
    if (!win) return;
    state.zTop++;
    win.el.style.zIndex = state.zTop;
    state.activeId = id;
    for (const w of state.windows.values()) {
      w.el.classList.toggle("inactive", w.id !== id || w.state === "minimized");
      w.pill.classList.toggle("active", w.id === id && w.state !== "minimized");
    }
  }

  function closeWindow(id) {
    const win = state.windows.get(id);
    if (!win) return;
    win.el.style.transition = "opacity 140ms ease, transform 140ms ease";
    win.el.style.opacity = "0";
    win.el.style.transform = "scale(0.96)";
    setTimeout(() => {
      win.el.remove();
      win.pill.remove();
      state.windows.delete(id);
      if (state.activeId === id) {
        state.activeId = null;
        const last = [...state.windows.values()].pop();
        if (last && last.state !== "minimized") focusWindow(last.id);
      }
    }, 140);
  }

  function minimizeWindow(id) {
    const win = state.windows.get(id);
    if (!win) return;
    win.state = "minimized";
    win.el.classList.add("minimizing");
    setTimeout(() => {
      win.el.style.display = "none";
      win.el.classList.remove("minimizing");
    }, 180);
    win.pill.classList.remove("active");
    win.pill.classList.add("minimized");
    if (state.activeId === id) {
      state.activeId = null;
      const nextWin = [...state.windows.values()].reverse().find(w => w.state !== "minimized");
      if (nextWin) focusWindow(nextWin.id);
    }
  }

  function restoreWindow(id) {
    const win = state.windows.get(id);
    if (!win) return;
    win.state = "normal";
    win.el.style.display = "";
    win.pill.classList.remove("minimized");
    focusWindow(id);
  }

  function toggleMaximize(id) {
    const win = state.windows.get(id);
    if (!win) return;
    if (win.state === "maximized") {
      win.state = "normal";
      const r = win.prevRect;
      Object.assign(win.el.style, {
        left: r.x + "px", top: r.y + "px", width: r.w + "px", height: r.h + "px",
      });
      win.rect = { ...r };
    } else {
      win.prevRect = { ...win.rect };
      win.state = "maximized";
      const top = 34, bottom = 50;
      Object.assign(win.el.style, {
        left: "8px",
        top: top + "px",
        width: (window.innerWidth - 16) + "px",
        height: (window.innerHeight - top - bottom) + "px",
      });
    }
    focusWindow(id);
  }

  // ── drag / resize helpers ───────────────────────────────
  function makeDraggable(win, handle) {
    handle.addEventListener("mousedown", (e) => {
      if (e.target.closest(".window-controls")) return;
      if (win.state === "maximized") return;
      focusWindow(win.id);
      const startX = e.clientX;
      const startY = e.clientY;
      const startRect = win.el.getBoundingClientRect();
      const onMove = (ev) => {
        const nx = Math.max(4, Math.min(window.innerWidth - 80, startRect.left + (ev.clientX - startX)));
        const ny = Math.max(30, Math.min(window.innerHeight - 60, startRect.top + (ev.clientY - startY)));
        win.el.style.left = nx + "px";
        win.el.style.top = ny + "px";
        win.rect.x = nx;
        win.rect.y = ny;
      };
      const onUp = () => {
        document.removeEventListener("mousemove", onMove);
        document.removeEventListener("mouseup", onUp);
      };
      document.addEventListener("mousemove", onMove);
      document.addEventListener("mouseup", onUp);
      e.preventDefault();
    });
  }
  function makeResizable(win, handle) {
    handle.addEventListener("mousedown", (e) => {
      if (win.state === "maximized") return;
      focusWindow(win.id);
      e.stopPropagation();
      const startX = e.clientX, startY = e.clientY;
      const startRect = win.el.getBoundingClientRect();
      const onMove = (ev) => {
        const nw = Math.max(320, startRect.width + (ev.clientX - startX));
        const nh = Math.max(200, startRect.height + (ev.clientY - startY));
        win.el.style.width = nw + "px";
        win.el.style.height = nh + "px";
        win.rect.w = nw;
        win.rect.h = nh;
      };
      const onUp = () => {
        document.removeEventListener("mousemove", onMove);
        document.removeEventListener("mouseup", onUp);
      };
      document.addEventListener("mousemove", onMove);
      document.addEventListener("mouseup", onUp);
      e.preventDefault();
    });
  }

  // ── helpers ─────────────────────────────────────────────
  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) =>
      ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[c]));
  }

  // ── app content renderers ───────────────────────────────

  function renderAbout(el) {
    el.innerHTML = `
      <div class="about-hero">
        <div class="about-avatar">JR</div>
        <div class="about-identity">
          <div class="name">Jake Ruth</div>
          <div class="role">Software engineer &amp; founder</div>
          <div class="loc">~/NYC &middot; coding since 2013</div>
        </div>
      </div>
      <p>Hi, I'm Jake. I've been writing code for thirteen years and I still open my laptop most mornings genuinely excited to build something.</p>
      <p>Most recently I co-founded <a href="#" data-open="stockunlock">Stock Unlock</a> (YC W22) — we raised $1.335M seed, grew to 8 employees and thousands of paying customers, and turned it into a calm, profitable business. In April 2026 I stepped out of the full-time seat. It still runs; I'm onto the next chapter.</p>
      <p>Before that: Senior SWE at Oscar Health, co-founder/CTO at Youni, and my first job at CommerceHub back when I was still in college at SUNY Albany.</p>
      <h3>Things I care about</h3>
      <ul class="fact-list">
        <li><span class="k">craft</span><span class="v">Software that respects the user's time, attention, and wallet.</span></li>
        <li><span class="k">domain</span><span class="v">Retail investing done honestly — no upsells, no dark patterns.</span></li>
        <li><span class="k">hobby</span><span class="v">Competitive Rubik's cube — 13.95s avg, 7 years on the circuit.</span></li>
        <li><span class="k">party trick</span><span class="v">Solving a cube while unicycling. Tragically, real footage exists.</span></li>
        <li><span class="k">life</span><span class="v">Getting married this year.</span></li>
      </ul>
      <p class="dim" style="font-size:12px">Tip: try the <code>Terminal.app</code> — <code>help</code> is a good start.</p>
    `;
    // link to stockunlock
    el.querySelectorAll("[data-open]").forEach(a => {
      a.addEventListener("click", (e) => { e.preventDefault(); openApp(a.dataset.open); });
    });
  }

  function renderProjects(el) {
    const projects = [
      {
        title: "Stock Unlock",
        meta: "2021 – present · co-founder",
        desc: "Honest stock research tools for retail investors. YC W22. Grew to 8 employees and thousands of paying users; now a calm, profitable side business.",
        tags: ["React", "TypeScript", "Postgres", "YC W22"],
        tone: "warn",
      },
      {
        title: "Youni",
        meta: "2015 – 2016 · co-founder / CTO",
        desc: "Social app for college students. First startup, first CTO role. Learned how to ship mobile, hire, and make hard calls at 22.",
        tags: ["iOS", "Android", "Node", "founder"],
        tone: "purple",
      },
      {
        title: "Oscar Health — Care chatbot",
        meta: "2017 – 2021 · senior SWE",
        desc: "Led backend work on the concierge chatbot + member services tooling. Giant codebase, real stakes, taught me what 'boring infra' actually pays for.",
        tags: ["Python", "distributed", "healthcare"],
        tone: "good",
      },
      {
        title: "CubeTimer (side)",
        meta: "ongoing · weekend project",
        desc: "Speedcubing timer with scramble generation and stats. Built partly because every existing one annoyed me. Feature crept, naturally.",
        tags: ["vanilla JS", "WASM", "for me"],
        tone: "warm",
      },
    ];
    el.innerHTML = `
      <h1>Things I've built</h1>
      <p class="dim">A selective list. Shipping &gt; pixel-polish; both when I can get away with it.</p>
      <div class="project-grid">
        ${projects.map(p => `
          <article class="project-card" data-tone="${p.tone}">
            <div class="title">${escapeHtml(p.title)}</div>
            <div class="meta">${escapeHtml(p.meta)}</div>
            <div class="desc">${escapeHtml(p.desc)}</div>
            <div class="tags">${p.tags.map(t => `<span class="tag">${escapeHtml(t)}</span>`).join("")}</div>
          </article>
        `).join("")}
      </div>
    `;
  }

  function renderResume(el) {
    el.innerHTML = `
      <div class="resume-toolbar">
        <a class="btn primary" href="../../official_resume.pdf" download>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Download PDF
        </a>
        <a class="btn" href="../../official_resume.pdf" target="_blank" rel="noopener">Open in new tab</a>
      </div>
      <object class="resume-frame" data="../../official_resume.pdf" type="application/pdf">
        <div class="resume-fallback">
          <p><strong>Preview unavailable</strong></p>
          <p>Your browser couldn't embed the PDF — use the buttons above to open or download it.</p>
        </div>
      </object>
    `;
  }

  function renderContact(el) {
    el.innerHTML = `
      <h1>Get in touch</h1>
      <p class="dim">Easiest way is email. I read everything; I reply to most things.</p>
      <div class="contact-list">
        <a class="contact-row" href="mailto:jake@stockunlock.com">
          <span class="label">email</span>
          <span class="value">jake@stockunlock.com</span>
        </a>
        <a class="contact-row" href="https://github.com/JakeRuth" target="_blank" rel="noopener">
          <span class="label">github</span>
          <span class="value">github.com/JakeRuth</span>
        </a>
        <a class="contact-row" href="https://www.linkedin.com/in/jake-ruth/" target="_blank" rel="noopener">
          <span class="label">linkedin</span>
          <span class="value">linkedin.com/in/jake-ruth</span>
        </a>
      </div>
      <h2 style="font-size:14px; margin-top:18px">…or leave a note</h2>
      <form class="contact-form" onsubmit="event.preventDefault(); this.querySelector('.form-status').textContent='Prototype: not wired up. Email jake@stockunlock.com instead.';">
        <label for="cf-name">name</label>
        <input id="cf-name" type="text" placeholder="Your name" />
        <label for="cf-msg">message</label>
        <textarea id="cf-msg" placeholder="Say hi, share a project, ask a question..."></textarea>
        <div style="display:flex; gap:10px; align-items:center; margin-top:6px">
          <button class="btn primary" type="submit">Send</button>
          <span class="form-status dim" style="font-size:12px"></span>
        </div>
      </form>
    `;
  }

  function renderStockUnlock(el) {
    el.innerHTML = `
      <div class="su-hero">
        <span class="tag">profitable · not full-time</span>
        <h1 style="margin-bottom:4px">Stock Unlock</h1>
        <p class="dim" style="margin-bottom:0">Honest research tools for retail investors. Built it. Scaled it. Handed off the day-to-day.</p>
      </div>
      <p>Co-founded in 2021 with a simple bet: most stock-research tools either cost too much, lie, or both. We built one that did neither — clean data, transparent pricing, zero "upgrade to see the rest" paywalls mid-flow.</p>
      <div class="su-stats">
        <div class="su-stat"><div class="n">YC W22</div><div class="l">batch</div></div>
        <div class="su-stat"><div class="n">$1.335M</div><div class="l">seed round</div></div>
        <div class="su-stat"><div class="n">8</div><div class="l">peak team</div></div>
        <div class="su-stat"><div class="n">1000s</div><div class="l">paying users</div></div>
      </div>
      <p>By early 2026 we'd reached a steady state: healthy profit, low-drama operations, a product I was proud of. I stepped out of the full-time seat in April to chase the next thing. The business keeps running; I'm still an owner and occasional contributor.</p>
      <div style="margin-top:14px">
        <a class="btn primary" href="https://stockunlock.com" target="_blank" rel="noopener">Visit stockunlock.com</a>
      </div>
    `;
  }

  function renderCube(el) {
    el.innerHTML = `
      <h1>Rubik's Cube</h1>
      <p class="dim">13.95s average. Competed at US Nationals 2008-2014. Still my favorite way to waste an afternoon.</p>
      <div class="cube-stage">
        <div class="cube">
          <div class="face f"><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span></div>
          <div class="face b"><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span></div>
          <div class="face r"><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span></div>
          <div class="face l"><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span></div>
          <div class="face u"><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span></div>
          <div class="face d"><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span></div>
        </div>
      </div>
      <p class="dim" style="font-size:12px; text-align:center">Bonus party trick: solve while unicycling. Yes, at a school talent show. Yes, footage exists.</p>
    `;
  }

  function renderNotepad(el) {
    el.innerHTML = `<div class="notepad">notes.txt — last edited just now

- the best software feels like it's on your side
- charge honestly, or don't charge at all
- 13.95s is a plateau i'll break someday
- "driver in the driver's seat" — whatever that means for this year
- next chapter: build the thing i'd be mad didn't exist yet

todo:
  [ ] finish this website (meta)
  [ ] write up what i learned running SU
  [x] stop calling it 'side project' until it's actually on the side
  [ ] ship something weird before june
</div>`;
  }

  function renderTerminal(el) {
    el.innerHTML = `
      <div class="terminal">
        <div class="term-lines"></div>
        <div class="term-input-row">
          <span class="prompt">jake@jakeOS</span><span class="dim">:</span><span class="path">~</span><span class="dim">$</span>
          <input type="text" autocomplete="off" spellcheck="false" aria-label="terminal input" />
        </div>
      </div>
    `;
    const root = el.querySelector(".terminal");
    const lines = el.querySelector(".term-lines");
    const input = el.querySelector("input");

    function write(html) {
      const d = document.createElement("div");
      d.className = "term-line";
      d.innerHTML = html;
      lines.appendChild(d);
      root.scrollTop = root.scrollHeight;
    }
    function writePrompt(cmd) {
      write(`<span class="prompt">jake@jakeOS</span><span class="dim">:</span><span class="path">~</span><span class="dim">$</span> ${escapeHtml(cmd)}`);
    }

    const commands = {
      help: () => [
        "available commands:",
        "  <span class='ok'>about</span>       — who i am",
        "  <span class='ok'>projects</span>    — what i've built",
        "  <span class='ok'>resume</span>      — open resume.pdf",
        "  <span class='ok'>contact</span>     — how to reach me",
        "  <span class='ok'>stockunlock</span> — the YC thing",
        "  <span class='ok'>cube</span>        — rubik's cube stats",
        "  <span class='ok'>whoami</span>, <span class='ok'>date</span>, <span class='ok'>echo</span>, <span class='ok'>ls</span>, <span class='ok'>cat</span> &lt;file&gt;, <span class='ok'>clear</span>",
      ],
      whoami: () => ["jake — software engineer, nyc. open to what's next."],
      date: () => [new Date().toString()],
      ls: () => ["about.md   projects.md   resume.pdf   contact.md   stockunlock.md   cube.md   .secret"],
      clear: () => { lines.innerHTML = ""; return null; },
      about: () => { openApp("about"); return ["opening About.app..."]; },
      projects: () => { openApp("projects"); return ["opening Projects.app..."]; },
      resume: () => { openApp("resume"); return ["opening Resume.pdf..."]; },
      contact: () => { openApp("contact"); return ["opening Contact.app..."]; },
      stockunlock: () => { openApp("stockunlock"); return ["opening StockUnlock.app..."]; },
      cube: () => { openApp("cube"); return ["opening RubiksCube.app..."]; },
      ".secret": () => ["you found the dotfile. there's nothing here. yet."],
    };
    commands.cat = (args) => {
      const f = (args[0] || "").toLowerCase();
      const map = {
        "about.md": () => { openApp("about"); return ["→ About.app"]; },
        "projects.md": () => { openApp("projects"); return ["→ Projects.app"]; },
        "resume.pdf": () => { openApp("resume"); return ["→ Resume.pdf"]; },
        "contact.md": () => { openApp("contact"); return ["→ Contact.app"]; },
        "stockunlock.md": () => { openApp("stockunlock"); return ["→ StockUnlock.app"]; },
        "cube.md": () => { openApp("cube"); return ["→ RubiksCube.app"]; },
        ".secret": () => ["you found the dotfile. there's nothing here. yet."],
      };
      if (!f) return ["usage: cat &lt;file&gt;"];
      if (map[f]) return map[f]();
      return [`cat: ${escapeHtml(f)}: No such file`];
    };
    commands.echo = (args) => [escapeHtml(args.join(" "))];
    commands.sudo = () => ["nice try. this is a portfolio, not a shell."];

    function runCommand(raw) {
      const trimmed = raw.trim();
      if (!trimmed) return;
      writePrompt(trimmed);
      const [cmd, ...args] = trimmed.split(/\s+/);
      const fn = commands[cmd.toLowerCase()];
      if (!fn) { write(`<span style="color:var(--accent-bad)">command not found: ${escapeHtml(cmd)}</span> — try <span class="ok">help</span>`); return; }
      const out = fn(args);
      if (out === null) return;
      if (Array.isArray(out)) out.forEach(line => write(line));
    }

    // banner
    ["<span class='ok'>jakeOS</span> terminal — v0.3 (prototype)",
     "type <span class='ok'>help</span> to see commands.",
     ""].forEach(write);

    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        runCommand(input.value);
        input.value = "";
      }
    });

    // Focus input whenever terminal is clicked
    root.addEventListener("click", () => input.focus());
    setTimeout(() => input.focus(), 50);
  }

  // ── open About by default (so empty-desktop first-run is less jarring) ─
  // Comment this out if you'd rather land on bare desktop.
  setTimeout(() => openApp("about"), 400);

})();
