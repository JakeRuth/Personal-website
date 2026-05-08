/* XP experience. Two independent modules, loaded in one file:
     1. Window manager, toast, clock, windows, dragging, Start menu,
        click dispatch for data-open / data-scroll / data-copy.
     2. Cube Patterns, Three.js Rubik's Cube + pattern morpher.
        Click a pattern; the cube animates from its current state into
        the new one. Never snaps, never resets.
   Modules share no state; each is its own IIFE. */

/* ==================================================================
   1. Window manager
   ================================================================== */
(function windowManager() {
  "use strict";

  // ---------- window registry ----------
  const WINDOWS = {
    "my-computer":      document.getElementById("win-my-computer"),
    "cubemaster":       document.getElementById("win-cubemaster"),
  };

  const TASK_STRIP = document.getElementById("task-strip");
  const START_BTN  = document.getElementById("start-btn");
  const START_MENU = document.getElementById("start-menu");
  const TOAST      = document.getElementById("xp-toast");

  let zCounter = 50;
  // Each window in OPEN_STATE is one of "open" (visible+focusable) or
  // "minimized" (taskbar pill stays; window DOM is hidden).
  const OPEN_STATE = Object.create(null);

  // ---------- toast ----------
  let toastTimer = null;
  function toast(msg) {
    if (!TOAST) return;
    TOAST.textContent = msg;
    TOAST.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => TOAST.classList.remove("show"), 2600);
  }

  // ---------- clock ----------
  function tickClock() {
    const clock = document.getElementById("clock");
    if (!clock) return;
    const d = new Date();
    let h = d.getHours();
    const m = String(d.getMinutes()).padStart(2, "0");
    const ampm = h >= 12 ? "PM" : "AM";
    h = h % 12; if (h === 0) h = 12;
    clock.textContent = `${h}:${m} ${ampm}`;
  }
  tickClock();
  // Tick every 15s so minute transitions land within 15s. Cheaper than
  // every second and matches XP's visual rhythm.
  setInterval(tickClock, 15 * 1000);

  // ---------- windows ----------
  function focusWindow(id) {
    const el = WINDOWS[id];
    if (!el) return;
    zCounter += 1;
    el.style.zIndex = String(zCounter);
    Object.keys(WINDOWS).forEach(k => WINDOWS[k]?.classList.remove("focused"));
    el.classList.add("focused");
    updateTaskStrip();
  }

  function openWindow(id) {
    const el = WINDOWS[id];
    if (!el) return;
    el.classList.remove("hidden");
    el.classList.remove("minimized");
    OPEN_STATE[id] = "open";
    focusWindow(id);
    rebuildTaskStrip();
    // cubeMaster + networkGraph self-register MutationObservers on
    // their window elements; they build lazily on first un-hide.
  }

  function minimizeWindow(id) {
    const el = WINDOWS[id];
    if (!el) return;
    el.classList.add("minimized");
    OPEN_STATE[id] = "minimized";
    // focus something else
    const otherOpen = Object.keys(OPEN_STATE).find(k => k !== id && OPEN_STATE[k] === "open");
    if (otherOpen) focusWindow(otherOpen);
    else {
      Object.keys(WINDOWS).forEach(k => WINDOWS[k]?.classList.remove("focused"));
    }
    updateTaskStrip();
  }

  function closeWindow(id) {
    const el = WINDOWS[id];
    if (!el) return;
    el.classList.add("hidden");
    el.classList.remove("minimized");
    delete OPEN_STATE[id];
    rebuildTaskStrip();
  }

  function labelFor(id) {
    const el = WINDOWS[id];
    return el?.dataset.title || id;
  }
  function iconFor(id) {
    switch (id) {
      case "my-computer": return "\u{1F5A5}️";
      case "cubemaster":  return "\u{1F9CA}";
      default: return "\u{1FA9F}";
    }
  }

  function rebuildTaskStrip() {
    TASK_STRIP.innerHTML = "";
    Object.keys(OPEN_STATE).forEach(id => {
      const btn = document.createElement("button");
      btn.className = "task-btn";
      btn.dataset.taskId = id;
      const swatch = document.createElement("span");
      swatch.className = "tb-swatch";
      swatch.textContent = iconFor(id);
      const label = document.createElement("span");
      label.className = "tb-label";
      label.textContent = labelFor(id);
      btn.append(swatch, label);
      btn.addEventListener("click", () => {
        const el = WINDOWS[id];
        if (!el) return;
        if (OPEN_STATE[id] === "minimized") {
          el.classList.remove("minimized");
          OPEN_STATE[id] = "open";
          focusWindow(id);
        } else {
          const isFocused = el.classList.contains("focused");
          if (isFocused) minimizeWindow(id);
          else focusWindow(id);
        }
      });
      TASK_STRIP.appendChild(btn);
    });
    updateTaskStrip();
  }
  function updateTaskStrip() {
    TASK_STRIP.querySelectorAll(".task-btn").forEach(b => {
      const id = b.dataset.taskId;
      const el = WINDOWS[id];
      const isFocused = el?.classList.contains("focused") && OPEN_STATE[id] === "open";
      b.classList.toggle("active", Boolean(isFocused));
    });
  }

  // open my-computer by default
  OPEN_STATE["my-computer"] = "open";
  rebuildTaskStrip();
  focusWindow("my-computer");

  // ---------- window dragging ----------
  // Drag by titlebar. Works for any .xp-window with a
  // [data-drag-handle] child. Updates left/top pixel coordinates and
  // clears right/bottom so drag is authoritative.
  (function initDragging() {
    let drag = null;
    document.addEventListener("mousedown", (e) => {
      const handle = e.target.closest("[data-drag-handle]");
      if (!handle) return;
      // Titlebar buttons must remain clickable
      if (e.target.closest(".tb-btn")) return;
      const wnd = handle.closest(".xp-window");
      if (!wnd) return;
      if (wnd.classList.contains("maxed")) return;

      const rect = wnd.getBoundingClientRect();
      // Commit current position to left/top so right/bottom don't fight.
      wnd.style.left = rect.left + "px";
      wnd.style.top  = rect.top  + "px";
      wnd.style.right = "auto";
      wnd.style.bottom = "auto";
      wnd.style.width = rect.width + "px";
      wnd.style.height = rect.height + "px";

      drag = {
        wnd, handle,
        offsetX: e.clientX - rect.left,
        offsetY: e.clientY - rect.top,
      };
      handle.classList.add("dragging");

      // focus on drag start
      const entry = Object.entries(WINDOWS).find(([, v]) => v === wnd);
      if (entry) focusWindow(entry[0]);

      e.preventDefault();
    });
    document.addEventListener("mousemove", (e) => {
      if (!drag) return;
      const { wnd, offsetX, offsetY } = drag;
      // Clip within viewport minus taskbar (32px tall).
      const maxX = window.innerWidth  - 60;
      const maxY = window.innerHeight - 32 - 8;
      let x = e.clientX - offsetX;
      let y = e.clientY - offsetY;
      x = Math.max(-wnd.offsetWidth + 80, Math.min(maxX, x));
      y = Math.max(0, Math.min(maxY, y));
      wnd.style.left = x + "px";
      wnd.style.top  = y + "px";
    });
    document.addEventListener("mouseup", () => {
      if (!drag) return;
      drag.handle.classList.remove("dragging");
      drag = null;
    });

    // Double-click on titlebar toggles maximize (standard OS behavior).
    document.addEventListener("dblclick", (e) => {
      const handle = e.target.closest("[data-drag-handle]");
      if (!handle) return;
      if (e.target.closest(".tb-btn")) return; // skip titlebar buttons
      const wnd = handle.closest(".xp-window");
      if (!wnd) return;
      const maxBtn = wnd.querySelector(".tb-btn.maximize");
      if (maxBtn) maxBtn.click();
    });
  })();

  // ---------- accordion: single-open behavior ----------
  // Returns whether `row` is now open. Closes any other open work-row
  // first (single-open). If `forceOpen` is true, always opens (no toggle).
  function setWorkRowOpen(row, forceOpen) {
    if (!row) return false;
    const willOpen = forceOpen ? true : !row.classList.contains("is-open");
    document.querySelectorAll(".work-row.is-open").forEach(r => {
      if (r === row) return;
      r.classList.remove("is-open");
      const h = r.querySelector(".work-head");
      if (h) h.setAttribute("aria-expanded", "false");
    });
    row.classList.toggle("is-open", willOpen);
    const head = row.querySelector(".work-head");
    if (head) head.setAttribute("aria-expanded", willOpen ? "true" : "false");
    return willOpen;
  }

  // ---------- smooth scroll helper ----------
  function scrollToSection(id) {
    openWindow("my-computer");
    // If the target is an accordion work-row, auto-expand so the user
    // doesn't land on a collapsed head with nothing to read. Closes any
    // other open row to honor single-open behavior.
    const pre = document.getElementById(id);
    if (pre && pre.classList.contains("work-row")) {
      setWorkRowOpen(pre, true);
    }
    // After open, wait a frame so the Explorer is laid out, then scroll.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const target = document.getElementById(id);
        const scroller = document.getElementById("content-scroll");
        if (!target || !scroller) return;
        // Use scrollTo with computed offset (scrollIntoView misbehaves
        // when the scroll container is not the root).
        const sRect = scroller.getBoundingClientRect();
        const tRect = target.getBoundingClientRect();
        const top = (tRect.top - sRect.top) + scroller.scrollTop - 10;
        scroller.scrollTo({ top, behavior: "smooth" });
        // Briefly outline the target so the jump lands visibly.
        target.style.transition = "box-shadow 0.4s ease";
        target.style.boxShadow = "0 0 0 2px #d3a940, 0 1px 0 rgba(0,0,0,0.04)";
        setTimeout(() => { target.style.boxShadow = ""; }, 900);
      });
    });
  }

  // ---------- clicks ----------
  document.addEventListener("click", (e) => {
    const openEl = e.target.closest("[data-open]");
    if (openEl) {
      const id = openEl.dataset.open;
      if (WINDOWS[id]) {
        openWindow(id);
        closeStartMenu();
        e.preventDefault();
        return;
      }
    }
    const scrollEl = e.target.closest("[data-scroll]");
    if (scrollEl) {
      scrollToSection(scrollEl.dataset.scroll);
      closeStartMenu();
      e.preventDefault();
      return;
    }
    const copyEl = e.target.closest("[data-copy]");
    if (copyEl) {
      const text = copyEl.dataset.copy;
      (navigator.clipboard?.writeText?.(text) ?? Promise.reject())
        .then(() => toast(`Copied "${text}" to Clipboard.`))
        .catch(() => toast(`E-mail: ${text}`));
      closeStartMenu();
      e.preventDefault();
      return;
    }
    const actEl = e.target.closest("[data-action]");
    if (actEl) {
      const action = actEl.dataset.action;
      if (action === "close") {
        const wnd = actEl.closest(".xp-window");
        if (wnd) {
          const entry = Object.entries(WINDOWS).find(([, v]) => v === wnd);
          if (entry) closeWindow(entry[0]);
          else wnd.classList.add("hidden");
        }
        return;
      }
      if (action === "minimize") {
        const wnd = actEl.closest(".xp-window");
        if (wnd) {
          const entry = Object.entries(WINDOWS).find(([, v]) => v === wnd);
          if (entry) minimizeWindow(entry[0]);
          else wnd.classList.add("hidden");
        }
        return;
      }
      if (action === "maximize") {
        const wnd = actEl.closest(".xp-window");
        if (!wnd) return;
        wnd.classList.toggle("maxed");
        if (wnd.classList.contains("maxed")) {
          wnd.dataset.prev = JSON.stringify({
            top: wnd.style.top, left: wnd.style.left,
            right: wnd.style.right, bottom: wnd.style.bottom,
            width: wnd.style.width, height: wnd.style.height,
          });
          // Fill viewport but leave the topnav (56px) and taskbar (32px) visible
          wnd.style.top = "56px"; wnd.style.left = "0";
          wnd.style.right = "0"; wnd.style.bottom = "32px";
          wnd.style.width = "auto"; wnd.style.height = "auto";
        } else if (wnd.dataset.prev) {
          const prev = JSON.parse(wnd.dataset.prev);
          Object.assign(wnd.style, prev);
        }
        return;
      }
      if (action === "email" || action === "hire") {
        if (typeof window.copyJakeEmail === "function") window.copyJakeEmail();
        return;
      }
      if (action === "resume") {
        window.open("../resume/", "_blank", "noopener");
        return;
      }
      if (action === "back") {
        scrollToSection("hero");
        return;
      }
      if (action === "copy-email") {
        copyToClipboard("jake2ruth@gmail.com", "E-mail address");
        return;
      }
      if (action === "copy-github") {
        copyToClipboard("https://github.com/JakeRuth", "GitHub URL");
        return;
      }
      if (action === "refresh") { window.location.reload(); return; }
      if (action === "open-github") {
        window.open("https://github.com/JakeRuth", "_blank", "noopener");
        return;
      }
      if (action === "open-wca") {
        window.open("https://www.worldcubeassociation.org/persons/2008RUTH01", "_blank", "noopener");
        return;
      }
      if (action === "open-source") {
        window.open("https://github.com/JakeRuth/Personal-website", "_blank", "noopener");
        return;
      }
      if (action === "open-stock-unlock") {
        window.open("https://stockunlock.com", "_blank", "noopener");
        return;
      }
      if (action === "restart") {
        window.location.href = "../";
        return;
      }
    }
    const wnd = e.target.closest(".xp-window");
    if (wnd) {
      const entry = Object.entries(WINDOWS).find(([, v]) => v === wnd);
      if (entry) focusWindow(entry[0]);
    }
    if (!e.target.closest("#start-menu") && !e.target.closest("#start-btn")) {
      closeStartMenu();
    }
  });

  // icons: double-click opens, mousedown shows pressed state (released on
  // mouseup/leave), Enter opens. We don't keep .selected after release —
  // XP behavior is "highlight while pressed", not "remember last clicked".
  document.querySelectorAll(".desktop-icons .icon").forEach(icon => {
    icon.addEventListener("dblclick", () => {
      const id = icon.dataset.open;
      if (id) openWindow(id);
    });
    icon.addEventListener("mousedown", () => {
      document.querySelectorAll(".icon.selected").forEach(i => i.classList.remove("selected"));
      icon.classList.add("selected");
    });
    const clearSelected = () => icon.classList.remove("selected");
    icon.addEventListener("mouseup", clearSelected);
    icon.addEventListener("mouseleave", clearSelected);
    icon.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        const id = icon.dataset.open;
        if (id) openWindow(id);
      }
    });
  });

  // Generic single-open accordion. Used for both work-history rows and
  // the Stories timeline. Each accordion has its own scope (its container)
  // so opening a Story doesn't close an open Work row, and vice versa.
  function wireAccordion(opts) {
    const { headSelector, rowSelector, bodySelector, innerClass } = opts;
    document.querySelectorAll(bodySelector).forEach(body => {
      if (body.querySelector(`:scope > .${innerClass}`)) return;
      const inner = document.createElement("div");
      inner.className = innerClass;
      while (body.firstChild) inner.appendChild(body.firstChild);
      body.appendChild(inner);
    });
    document.querySelectorAll(headSelector).forEach(head => {
      function toggle() {
        const row = head.closest(rowSelector);
        if (!row) return;
        const willOpen = !row.classList.contains("is-open");
        // single-open: collapse all siblings inside the same container
        const scope = row.parentElement;
        scope.querySelectorAll(`${rowSelector}.is-open`).forEach(r => {
          if (r === row) return;
          r.classList.remove("is-open");
          const h = r.querySelector(headSelector);
          if (h) h.setAttribute("aria-expanded", "false");
        });
        row.classList.toggle("is-open", willOpen);
        head.setAttribute("aria-expanded", willOpen ? "true" : "false");
      }
      // Click handling: bind to the row so the entire shaded region (including
      // .work-row padding around .work-head) toggles. Skip clicks inside the
      // body so links/buttons inside expanded content keep working.
      const row = head.closest(rowSelector);
      if (row) {
        row.addEventListener("click", (e) => {
          if (e.target.closest(bodySelector)) return;
          toggle();
        });
      } else {
        head.addEventListener("click", toggle);
      }
      head.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          toggle();
        }
      });
    });
  }
  wireAccordion({
    headSelector: ".work-head[data-toggle-work]",
    rowSelector: ".work-row",
    bodySelector: ".work-body",
    innerClass: "work-body-inner",
  });
  wireAccordion({
    headSelector: ".timeline-head[data-toggle-story]",
    rowSelector: ".timeline-item",
    bodySelector: ".timeline-body",
    innerClass: "timeline-body-inner",
  });

  // task pane collapsible sections
  document.querySelectorAll(".tp-header[data-toggle]").forEach(h => {
    h.addEventListener("click", () => {
      h.parentElement.classList.toggle("collapsed");
    });
  });

  // ---------- address bar (live path + Go + dropdown) ----------
  // Path tracks the currently-visible section. Click address or chevron
  // to open the dropdown. Click an item to jump. Click Go to jump to the
  // section currently shown in the path.
  const addressField = document.getElementById("address-field");
  const addressPath  = document.getElementById("address-path");
  const addressGo    = document.getElementById("address-go");
  const addressDropdown = document.getElementById("address-dropdown");
  if (addressField && addressPath && addressGo && addressDropdown) {
    let currentSection = "hero";
    function setPath(section, label) {
      currentSection = section;
      addressPath.textContent = "C:\\Jake\\" + (label ? label + "\\" : "");
    }
    function openAddressDropdown() {
      addressDropdown.hidden = false;
    }
    function closeAddressDropdown() {
      addressDropdown.hidden = true;
    }
    addressField.addEventListener("click", (e) => {
      e.stopPropagation();
      if (addressDropdown.hidden) openAddressDropdown();
      else closeAddressDropdown();
    });
    addressDropdown.querySelectorAll("li").forEach(li => {
      li.addEventListener("click", (e) => {
        e.stopPropagation();
        const section = li.dataset.section;
        const label = li.dataset.label;
        setPath(section, label);
        closeAddressDropdown();
        scrollToSection(section);
      });
    });
    addressGo.addEventListener("click", (e) => {
      e.stopPropagation();
      scrollToSection(currentSection);
    });
    document.addEventListener("click", (e) => {
      if (!e.target.closest("#address-field") && !e.target.closest("#address-dropdown")) {
        closeAddressDropdown();
      }
    });
    // Track scroll position to update the path. Picks the section whose
    // top is closest to (but not below) the scroller's top edge.
    const sectionMap = {
      hero: "", about: "About", work: "Work",
      "stock-unlock": "Work\\Stock Unlock", ai: "AI",
      stories: "Stories", cube: "Mastery"
    };
    const scroller = document.getElementById("content-scroll");
    if (scroller) {
      const sections = Object.keys(sectionMap)
        .map(id => ({ id, el: document.getElementById(id) }))
        .filter(s => s.el);
      function updatePathFromScroll() {
        const sRect = scroller.getBoundingClientRect();
        const trigger = sRect.top + 80; // small offset so a section "owns" the path once its top crosses the trigger line
        let active = sections[0];
        for (const s of sections) {
          if (s.el.getBoundingClientRect().top <= trigger) active = s;
        }
        setPath(active.id, sectionMap[active.id]);
      }
      let scrollTick = null;
      scroller.addEventListener("scroll", () => {
        if (scrollTick) return;
        scrollTick = requestAnimationFrame(() => { updatePathFromScroll(); scrollTick = null; });
      });
      // Initial state
      updatePathFromScroll();
    }
  }

  // ---------- menubar dropdowns ----------
  // File / Edit / View / Favorites / Tools / Help, click to open, hover-roll
  // between siblings while one is open, click outside or Esc to close.
  function copyToClipboard(text, label) {
    (navigator.clipboard?.writeText?.(text) ?? Promise.reject())
      .then(() => toast("Copied " + label + " to Clipboard."))
      .catch(() => toast(label + ": " + text));
  }
  const MENUBAR = document.getElementById("xp-menubar");
  if (MENUBAR) {
    function closeMenubar() {
      MENUBAR.querySelectorAll(".menu-item.is-open").forEach(b => b.classList.remove("is-open"));
      MENUBAR.querySelectorAll(".menu-panel").forEach(p => p.hidden = true);
    }
    function openMenu(id) {
      closeMenubar();
      const trigger = MENUBAR.querySelector('[data-menu="' + id + '"]');
      const panel   = MENUBAR.querySelector('[data-menu-for="' + id + '"]');
      if (trigger) trigger.classList.add("is-open");
      if (panel) panel.hidden = false;
    }
    MENUBAR.querySelectorAll("[data-menu]").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const id = btn.getAttribute("data-menu");
        if (btn.classList.contains("is-open")) closeMenubar();
        else openMenu(id);
      });
      btn.addEventListener("mouseenter", () => {
        if (!MENUBAR.querySelector(".menu-item.is-open")) return;
        if (btn.classList.contains("is-open")) return;
        openMenu(btn.getAttribute("data-menu"));
      });
    });
    // Close after picking an item, the action itself runs via the
    // existing global click handler (data-action / data-scroll / data-open).
    MENUBAR.querySelectorAll(".menu-row").forEach(row => {
      row.addEventListener("click", () => closeMenubar());
    });
    document.addEventListener("click", (e) => {
      if (!e.target.closest("#xp-menubar")) closeMenubar();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && MENUBAR.querySelector(".menu-item.is-open")) {
        closeMenubar();
        e.preventDefault();
      }
    });
  }

  // ---------- Start menu ----------
  function openStartMenu() {
    START_MENU.classList.remove("hidden");
    START_BTN.setAttribute("aria-expanded", "true");
    START_BTN.classList.add("active");
  }
  function closeStartMenu() {
    START_MENU.classList.add("hidden");
    START_BTN.setAttribute("aria-expanded", "false");
    START_BTN.classList.remove("active");
  }
  START_BTN.addEventListener("click", (e) => {
    e.stopPropagation();
    if (START_MENU.classList.contains("hidden")) openStartMenu();
    else closeStartMenu();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeStartMenu();
  });

})();

/* ==================================================================
   2. Cube Patterns, Three.js Rubik's Cube + pattern morpher
   ================================================================== */
(function cubePatterns() {
  "use strict";

  // The only cross-module handle we need: the window element, so we
  // can pause rAF while it's hidden/minimized.
  const CUBE_WIN = document.getElementById("win-cubemaster");

  // Local toast helper. Writes to the same element as windowManager's
  // toast(), keeps a single UI surface without sharing JS state.
  let toastTimer = null;
  function toast(msg) {
    const TOAST = document.getElementById("xp-toast");
    if (!TOAST) return;
    TOAST.textContent = msg;
    TOAST.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => TOAST.classList.remove("show"), 2400);
  }

  let faceletCube = window.CubeSolver.solvedFacelets();

  let THREE_READY = false;
  let cubeRenderer, cubeScene, cubeCamera, cubeGroup;
  let stickerMeshes = [];
  let cubeStageEl;
  let cubeRAF = 0;

  const FACE_HEX = {
    W: 0xfbfbf5, // white
    Y: 0xffd500, // yellow
    G: 0x009b48, // green
    B: 0x0051ba, // blue
    R: 0xc40000, // red
    O: 0xff7a00, // orange
  };

  function buildCube() {
    if (!window.THREE) return false;
    cubeStageEl = document.getElementById("cube-stage");
    if (!cubeStageEl) return false;

    const w = cubeStageEl.clientWidth || 260;
    const h = cubeStageEl.clientHeight || 260;

    cubeScene = new THREE.Scene();
    cubeCamera = new THREE.PerspectiveCamera(32, w / h, 0.1, 100);
    cubeCamera.position.set(5, 4.2, 6.2);
    cubeCamera.lookAt(0, 0, 0);

    cubeRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    cubeRenderer.setPixelRatio(window.devicePixelRatio || 1);
    cubeRenderer.setSize(w, h);
    // Keep existing HUD children (timer overlay).
    const existingCanvases = cubeStageEl.querySelectorAll("canvas");
    existingCanvases.forEach(c => c.remove());
    cubeStageEl.appendChild(cubeRenderer.domElement);

    cubeGroup = new THREE.Group();
    cubeScene.add(cubeGroup);

    buildCubeContents();

    THREE_READY = true;
    window.addEventListener("resize", onCubeResize);
    startRAF();
    return true;
  }

  // Tear down + rebuild the cubies and stickers in canonical positions.
  // Called at first build and on reset/scramble (since after free-form
  // turns the meshes carry baked-in rotations that we can't easily undo).
  function buildCubeContents() {
    if (!cubeGroup) return;
    // Clear any existing children (cubies, stickers, leftover layerGroups)
    while (cubeGroup.children.length) cubeGroup.remove(cubeGroup.children[0]);
    const bodyMat = new THREE.MeshBasicMaterial({ color: 0x101418 });
    const bodySize = 0.97;
    const gap = 1.0;
    for (let x = -1; x <= 1; x++) {
      for (let y = -1; y <= 1; y++) {
        for (let z = -1; z <= 1; z++) {
          const geom = new THREE.BoxGeometry(bodySize, bodySize, bodySize);
          const mesh = new THREE.Mesh(geom, bodyMat);
          mesh.position.set(x * gap, y * gap, z * gap);
          cubeGroup.add(mesh);
        }
      }
    }
    stickerMeshes = buildStickers();
    stickerMeshes.forEach(s => cubeGroup.add(s.mesh));
    repaintStickers();
  }

  function buildStickers() {
    const list = [];
    const stSize = 0.9;
    const half = 1.5;

    function addFace(faceId) {
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
          const idx = r * 3 + c;
          const geom = new THREE.PlaneGeometry(stSize, stSize);
          const mat = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
          const mesh = new THREE.Mesh(geom, mat);

          const cc = c - 1;
          const rr = r - 1;
          switch (faceId) {
            case 0: // U: +Y. cube-solver convention: idx 0..2 = back row, 6..8 = front row.
              mesh.position.set(cc, half, rr);
              mesh.rotation.x = -Math.PI / 2;
              break;
            case 3: // D: -Y. cube-solver convention: idx 0..2 = front row, 6..8 = back row.
              mesh.position.set(cc, -half, -rr);
              mesh.rotation.x = Math.PI / 2;
              break;
            case 2: // F: +Z
              mesh.position.set(cc, -rr, half);
              break;
            case 5: // B: -Z
              mesh.position.set(-cc, -rr, -half);
              mesh.rotation.y = Math.PI;
              break;
            case 1: // R: +X
              mesh.position.set(half, -rr, -cc);
              mesh.rotation.y = Math.PI / 2;
              break;
            case 4: // L: -X
              mesh.position.set(-half, -rr, cc);
              mesh.rotation.y = -Math.PI / 2;
              break;
          }
          list.push({ face: faceId, idx, mesh, mat });
        }
      }
    }

    addFace(0); addFace(1); addFace(2); addFace(3); addFace(4); addFace(5);
    return list;
  }

  function repaintStickers() {
    for (const s of stickerMeshes) {
      const col = faceletCube[s.face][s.idx];
      s.mat.color.setHex(FACE_HEX[col] || 0x888888);
    }
  }

  function onCubeResize() {
    if (!cubeRenderer || !cubeStageEl) return;
    const w = cubeStageEl.clientWidth, h = cubeStageEl.clientHeight;
    if (w === 0 || h === 0) return;
    cubeCamera.aspect = w / h;
    cubeCamera.updateProjectionMatrix();
    cubeRenderer.setSize(w, h);
  }

  function startRAF() {
    if (cubeRAF) return;
    const loop = () => {
      cubeRAF = requestAnimationFrame(loop);
      if (!THREE_READY) return;
      if (CUBE_WIN && (CUBE_WIN.classList.contains("hidden") || CUBE_WIN.classList.contains("minimized"))) {
        // Don't burn GPU while hidden.
        return;
      }
      if (!moveAnim) {
        cubeGroup.rotation.y += 0.0033;
        cubeGroup.rotation.x = Math.sin(performance.now() * 0.000165) * 0.1 - 0.25;
      }
      cubeRenderer.render(cubeScene, cubeCamera);
    };
    loop();
  }

  function ensureCubeStarted() {
    if (THREE_READY) { onCubeResize(); return; }
    if (!window.THREE) {
      cubeStageEl = document.getElementById("cube-stage");
      if (cubeStageEl) {
        const fallback = document.createElement("div");
        fallback.style.cssText = "color:#fff;text-align:center;padding:40px 10px;font-size:11px;position:relative;z-index:1";
        fallback.textContent = "3D disabled (three.js failed to load).";
        cubeStageEl.appendChild(fallback);
      }
      return;
    }
    // Wait one frame to make sure layout has settled before measuring.
    requestAnimationFrame(() => buildCube());
  }

  // ---------- Move animation / queue ----------
  let moveQueue = [];
  let moveAnim = null;

  function enqueueMoves(moves) {
    for (const m of moves) moveQueue.push(m);
    if (!moveAnim) nextMove();
  }

  function nextMove() {
    if (!moveQueue.length) {
      moveAnim = null;
      updatePatternUI();
      return;
    }
    const m = moveQueue.shift();
    startMoveAnim(m);
  }

  function startMoveAnim(move) {
    if (!cubeGroup) return;
    const face = move[0];
    const prime = move.endsWith("'");
    const axisInfo = FACE_AXIS[face];
    if (!axisInfo) return;
    const layerGroup = new THREE.Group();
    cubeGroup.add(layerGroup);

    const affected = [];
    cubeGroup.children.slice().forEach(child => {
      if (child === layerGroup) return;
      const p = child.position;
      if (axisInfo.test(p)) affected.push(child);
    });
    affected.forEach(c => {
      cubeGroup.remove(c);
      layerGroup.add(c);
    });

    // Tighter animation when the queue is long (feels like a real solve).
    const dur = Math.max(70, 170 - Math.min(moveQueue.length * 6, 110));
    moveAnim = {
      move, layerGroup, affected,
      startT: performance.now(),
      durMs: dur,
      axis: axisInfo.axis,
      target: (prime ? 1 : -1) * Math.PI / 2 * axisInfo.sign,
    };

    requestAnimationFrame(tickMove);
  }

  function tickMove(now) {
    if (!moveAnim) return;
    const t = Math.min(1, (now - moveAnim.startT) / moveAnim.durMs);
    const eased = easeOutQuad(t);
    const angle = moveAnim.target * eased;
    moveAnim.layerGroup.rotation[moveAnim.axis] = angle;
    if (t < 1) {
      requestAnimationFrame(tickMove);
    } else {
      // Bake the layerGroup's rotation into each affected child's local
      // transform so they keep their newly-rotated visual position when
      // re-parented to cubeGroup. Avoids the snap-back-and-repaint dance
      // (which broke sticker positions because Math.round wrecked the
      // ±1.5 sticker coordinates).
      moveAnim.layerGroup.updateMatrix();
      const layerMatrix = moveAnim.layerGroup.matrix;
      moveAnim.affected.forEach(c => {
        c.applyMatrix4(layerMatrix);
        moveAnim.layerGroup.remove(c);
        cubeGroup.add(c);
      });
      cubeGroup.remove(moveAnim.layerGroup);

      // Update the logical facelet state so the solver/scrambler stay in
      // sync. No repaintStickers — stickers carry their colors physically.
      window.CubeSolver.faceletTurn(faceletCube, moveAnim.move);
      moveAnim = null;
      nextMove();
    }
  }

  function easeOutQuad(t) { return 1 - (1 - t) * (1 - t); }

  const FACE_AXIS = {
    U: { axis: 'y', sign: +1, test: p => p.y >  0.5 },
    D: { axis: 'y', sign: -1, test: p => p.y < -0.5 },
    F: { axis: 'z', sign: +1, test: p => p.z >  0.5 },
    B: { axis: 'z', sign: -1, test: p => p.z < -0.5 },
    R: { axis: 'x', sign: +1, test: p => p.x >  0.5 },
    L: { axis: 'x', sign: -1, test: p => p.x < -0.5 },
  };

  // ---------- Pattern engine ----------
  // Each click picks a target pattern. The cube animates from its current
  // state into the target, never snaps. We track the moves applied to
  // reach the current pattern so we can play their inverse to morph back
  // to solved, then play the new pattern's algorithm.
  const PATTERNS = {
    checkerboard:   { name: "Checkerboard",            alg: "U2 D2 F2 B2 L2 R2" },
    sixspot:        { name: "Six Spots",                alg: "U D' R L' F B' U D'" },
    cubeincube:     { name: "Cube in a Cube",           alg: "F L F U' R U F2 L2 U' L' B D' B' L2 U" },
    cubeincubeincube: { name: "Cube in a Cube in a Cube", alg: "U' L' U' F' R2 B' R F U B2 U B' L U' F U R F'" },
    anaconda:       { name: "Anaconda",                 alg: "L U B' U' R L' B R' F B' D R D' F'" },
    superflip:      { name: "Superflip",                alg: "U R2 F B R B2 R U2 L B2 R U' D' R2 F R' L B2 U2 F2" },
  };

  // The shared cube-solver only handles X (single CW) and X' (single
  // CCW); X2 (180°) is expanded to X X at queue time.
  function expandAlg(s) {
    const out = [];
    for (const t of s.trim().split(/\s+/)) {
      if (t.endsWith("2")) { const b = t.slice(0, -1); out.push(b, b); }
      else out.push(t);
    }
    return out;
  }
  function invertMoves(moves) {
    const out = [];
    for (let i = moves.length - 1; i >= 0; i--) {
      const m = moves[i];
      out.push(m.endsWith("'") ? m[0] : m + "'");
    }
    return out;
  }

  // currentPatternId === null means solved.
  let currentPatternId = null;
  let currentPatternMoves = [];

  const patternLabel = document.getElementById("cube-pattern-label");
  const patternBtns  = document.querySelectorAll(".pattern-btn");

  function updatePatternUI() {
    const busy = !!moveAnim || moveQueue.length > 0;
    if (patternLabel) {
      const cur = currentPatternId ? PATTERNS[currentPatternId].name : "Solved";
      patternLabel.textContent = busy ? "Morphing…" : cur;
    }
    patternBtns.forEach(b => {
      const id = b.dataset.pattern || null;
      b.disabled = busy;
      b.classList.toggle("is-current", id === currentPatternId);
    });
  }

  function executePattern(targetId) {
    if (moveAnim || moveQueue.length) return;
    const target = targetId || null;
    if (target === currentPatternId) return;
    const inverse = invertMoves(currentPatternMoves);
    const next = target ? expandAlg(PATTERNS[target].alg) : [];
    currentPatternId = target;
    currentPatternMoves = next;
    if (inverse.length || next.length) enqueueMoves(inverse.concat(next));
    updatePatternUI();
  }

  patternBtns.forEach(btn => {
    btn.addEventListener("click", () => executePattern(btn.dataset.pattern || null));
  });

  setTimeout(updatePatternUI, 200);

  // Lazy-build the Three.js cube the first time the window is shown
  // (observing .hidden class removal keeps the modules decoupled).
  if (CUBE_WIN) {
    const obs = new MutationObserver(() => {
      if (!CUBE_WIN.classList.contains("hidden")) ensureCubeStarted();
    });
    obs.observe(CUBE_WIN, { attributes: true, attributeFilter: ["class"] });
    if (!CUBE_WIN.classList.contains("hidden")) ensureCubeStarted();
  }
})();

/* ==================================================================
   3. Log Off / Turn Off magnet-evade prank
      Buttons in the start menu push themselves away from the cursor
      when it gets close. They re-anchor when the cursor moves off.
      You can't quit. That's the joke.
   ================================================================== */
(function powerEvade() {
  "use strict";
  const buttons = document.querySelectorAll(".sm-power");
  if (!buttons.length) return;

  const MAGNET_RADIUS = 110;
  const MAX_PUSH = 90;
  const EASE = 0.22;

  const state = new Map();
  buttons.forEach(b => {
    state.set(b, { x: 0, y: 0, tx: 0, ty: 0 });
    b.style.willChange = "transform";
  });

  function tick() {
    state.forEach((s, b) => {
      const dx = s.tx - s.x, dy = s.ty - s.y;
      if (Math.abs(dx) > 0.05 || Math.abs(dy) > 0.05) {
        s.x += dx * EASE;
        s.y += dy * EASE;
        b.style.transform = `translate(${s.x.toFixed(2)}px, ${s.y.toFixed(2)}px)`;
      }
    });
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);

  document.addEventListener("mousemove", e => {
    buttons.forEach(b => {
      const r = b.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) return; // start menu hidden
      const s = state.get(b);
      // anchored center (subtract current translation so we measure
      // from the button's resting position, not from where it's been
      // pushed to — otherwise the chase becomes self-amplifying)
      const cx = r.left + r.width / 2 - s.x;
      const cy = r.top + r.height / 2 - s.y;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.hypot(dx, dy);
      if (dist < MAGNET_RADIUS) {
        const force = (MAGNET_RADIUS - dist) / MAGNET_RADIUS;
        const angle = Math.atan2(dy, dx);
        s.tx = -Math.cos(angle) * force * MAX_PUSH;
        s.ty = -Math.sin(angle) * force * MAX_PUSH;
      } else {
        s.tx = 0;
        s.ty = 0;
      }
    });
  });

  // If the user catches it (touch, keyboard, sheer luck), refuse politely.
  const TOAST = document.getElementById("xp-toast");
  function refuse() {
    if (!TOAST) return;
    TOAST.textContent = "Nice catch. You're staying.";
    TOAST.classList.add("show");
    clearTimeout(refuse._t);
    refuse._t = setTimeout(() => TOAST.classList.remove("show"), 1800);
  }
  buttons.forEach(b => {
    b.addEventListener("click", e => { e.preventDefault(); refuse(); });
  });
})();

