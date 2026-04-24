/* Force-directed graph — polished.
   Fixes from the original 09-network-graph prototype:
   - Softened cursor repulsion (~60% weaker) and disabled when cursor idle >200ms.
   - Generous click hit targets via an invisible padding circle per node.
   - Pin-on-hover: after 300ms of hovering a node, it pins (fx/fy locked) for a stable click.
   - Featured-on-load: Stock Unlock is pre-selected so visitors see the pattern immediately.
   - Intro animation: nodes start scattered at edges and settle inward (tuned alphaDecay).
   - Palette refined, subtle hover ring, selection pulse, better panel typography.
*/
(function () {
  const { nodes: RAW_NODES, edges: RAW_EDGES } = window.GRAPH_DATA;

  const CATEGORY_COLORS = {
    career:  getCSS("--career"),
    skill:   getCSS("--skill"),
    project: getCSS("--project"),
    hobby:   getCSS("--hobby"),
    person:  getCSS("--person"),
  };
  const CATEGORY_LABEL = {
    career: "career",
    skill: "skill",
    project: "project",
    hobby: "hobby",
    person: "person",
  };
  function getCSS(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || "#888";
  }

  // Slightly larger radii for better hit targets + visual weight
  function radiusFor(node) {
    switch (node.category) {
      case "career":  return 15;
      case "project": return 12;
      case "person":  return 11;
      case "skill":   return 10;
      case "hobby":   return 10;
      default:        return 10;
    }
  }
  // Invisible hit padding — generous click zone even if node drifts a few px during a click
  const HIT_PADDING = 10;

  // ---- Starfield background ----
  const starCanvas = document.getElementById("starfield");
  const starCtx = starCanvas.getContext("2d");
  let stars = [];
  function initStars() {
    const w = window.innerWidth, h = window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    starCanvas.width = w * dpr; starCanvas.height = h * dpr;
    starCanvas.style.width = w + "px"; starCanvas.style.height = h + "px";
    starCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.floor((w * h) / 9000);
    stars = [];
    for (let i = 0; i < count; i++) {
      stars.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.2 + 0.2,
        a: Math.random() * 0.5 + 0.15,
        tw: Math.random() * 0.004 + 0.001,
        ph: Math.random() * Math.PI * 2,
      });
    }
  }
  function drawStars(t) {
    const w = window.innerWidth, h = window.innerHeight;
    starCtx.clearRect(0, 0, w, h);
    starCtx.strokeStyle = "rgba(120,140,200,0.04)";
    starCtx.lineWidth = 1;
    const grid = 64;
    starCtx.beginPath();
    for (let x = (t * 0.005 % grid); x < w; x += grid) {
      starCtx.moveTo(x, 0); starCtx.lineTo(x, h);
    }
    for (let y = (t * 0.005 % grid); y < h; y += grid) {
      starCtx.moveTo(0, y); starCtx.lineTo(w, y);
    }
    starCtx.stroke();
    for (const s of stars) {
      const a = s.a + Math.sin(t * s.tw + s.ph) * 0.2;
      starCtx.fillStyle = `rgba(200, 215, 255, ${Math.max(0.05, a).toFixed(3)})`;
      starCtx.beginPath();
      starCtx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      starCtx.fill();
    }
    requestAnimationFrame(drawStars);
  }
  initStars();
  requestAnimationFrame(drawStars);
  window.addEventListener("resize", initStars);

  // ---- SVG graph ----
  const svgEl = document.getElementById("graph");
  const svg = d3.select(svgEl);
  const width = () => window.innerWidth;
  const height = () => window.innerHeight;

  const gRoot = svg.append("g").attr("class", "root");
  const gLinks = gRoot.append("g").attr("class", "links");
  const gNodes = gRoot.append("g").attr("class", "nodes");

  // deep-copy nodes so d3 can mutate
  const nodes = RAW_NODES.map(n => ({ ...n }));
  const nodeById = new Map(nodes.map(n => [n.id, n]));
  const links = RAW_EDGES.map(e => ({
    source: nodeById.get(e.source),
    target: nodeById.get(e.target),
  })).filter(l => l.source && l.target);

  // adjacency
  const adjacency = new Map();
  nodes.forEach(n => adjacency.set(n.id, new Set()));
  links.forEach(l => {
    adjacency.get(l.source.id).add(l.target.id);
    adjacency.get(l.target.id).add(l.source.id);
  });

  // ---- Cursor state with idle detection ----
  // Force fully disables when cursor hasn't moved >10px in >200ms.
  let cursor = {
    x: -9999, y: -9999,
    lastX: -9999, lastY: -9999,
    active: false,
    lastMoveAt: 0,
    idle: true,
  };
  // Softened: original was 260 — we drop it ~60% to ~100.
  const CURSOR_STRENGTH = 100;
  const CURSOR_RADIUS = 110;
  const IDLE_MS = 200;
  const IDLE_PX = 10;

  function updateCursorIdle(nowTs) {
    const dt = nowTs - cursor.lastMoveAt;
    // snap to 0 if it's been idle long enough
    cursor.idle = dt > IDLE_MS;
  }

  function cursorForce(alpha) {
    if (!cursor.active) return;
    updateCursorIdle(performance.now());
    if (cursor.idle) return; // repulsion disabled when near-stationary
    for (const n of nodes) {
      if (n.fx != null && n.fy != null) continue; // don't shove pinned nodes
      const dx = n.x - cursor.x;
      const dy = n.y - cursor.y;
      const dist2 = dx * dx + dy * dy;
      const dist = Math.sqrt(dist2) || 0.0001;
      if (dist < CURSOR_RADIUS) {
        const falloff = 1 - dist / CURSOR_RADIUS;
        const force = (CURSOR_STRENGTH * falloff * falloff * alpha) / dist;
        n.vx += dx * force;
        n.vy += dy * force;
      }
    }
  }

  const simulation = d3.forceSimulation(nodes)
    .force("link", d3.forceLink(links).id(d => d.id).distance(95).strength(0.38))
    .force("charge", d3.forceManyBody().strength(-240).distanceMax(520))
    .force("center", d3.forceCenter(width() / 2, height() / 2).strength(0.06))
    .force("collide", d3.forceCollide().radius(d => radiusFor(d) + 6).strength(0.95))
    .force("cursor", cursorForce)
    .velocityDecay(0.38)
    // Slightly slower decay so the settle-in animation is visible
    .alphaDecay(0.018);

  // links
  const linkSel = gLinks.selectAll("line")
    .data(links)
    .join("line");

  // nodes — each is a <g> with:
  //   - ring circle (hover affordance, css-driven)
  //   - core circle (the colored dot)
  //   - invisible hit circle (generous click zone)
  //   - label
  const nodeSel = gNodes.selectAll("g.node")
    .data(nodes, d => d.id)
    .join(enter => {
      const g = enter.append("g").attr("class", "node").attr("data-id", d => d.id);
      g.append("circle")
        .attr("class", "ring")
        .attr("r", d => radiusFor(d) + 6)
        .attr("color", d => CATEGORY_COLORS[d.category] || "#888")
        .attr("stroke", d => CATEGORY_COLORS[d.category] || "#888");
      g.append("circle")
        .attr("class", "core")
        .attr("r", d => radiusFor(d))
        .attr("fill", d => CATEGORY_COLORS[d.category] || "#888");
      g.append("circle")
        .attr("class", "node-hit")
        .attr("r", d => radiusFor(d) + HIT_PADDING);
      g.append("text")
        .attr("class", "node-label")
        .attr("x", 0)
        .attr("y", d => -(radiusFor(d) + 8))
        .attr("text-anchor", "middle")
        .text(d => d.label);
      return g;
    });

  // drag
  nodeSel.call(d3.drag()
    .on("start", (event, d) => {
      if (!event.active) simulation.alphaTarget(0.25).restart();
      d.fx = d.x; d.fy = d.y;
      d._dragStart = { x: event.x, y: event.y, t: performance.now() };
    })
    .on("drag", (event, d) => {
      d.fx = event.x; d.fy = event.y;
    })
    .on("end", (event, d) => {
      if (!event.active) simulation.alphaTarget(0);
      const start = d._dragStart || { x: event.x, y: event.y, t: performance.now() };
      const dx = event.x - start.x;
      const dy = event.y - start.y;
      const travelled = Math.sqrt(dx*dx + dy*dy);
      const isShift = event.sourceEvent && event.sourceEvent.shiftKey;

      if (isShift) {
        d._pinned = true;
        d3.select(event.sourceEvent.currentTarget || event.currentTarget).classed("pinned", true);
      } else if (travelled < 4) {
        // Treat as click — release pin and fire selection.
        // This catches the "node drifted mid-click" case: even if the cursor
        // landed off-center, d3.drag still fires the end here.
        if (!d._hoverPinned) { d.fx = null; d.fy = null; }
        selectNode(d.id);
      } else {
        // Real drag — release unless pinned
        if (!d._pinned) { d.fx = null; d.fy = null; }
      }
      d._dragStart = null;
    })
  );

  // explicit click for keyboard / accessibility (drag-end handles pointer clicks)
  nodeSel.on("click", (event, d) => {
    event.stopPropagation();
    // If the drag-end already ran selectNode the listener is still idempotent
    selectNode(d.id);
  });

  // ---- Hover: neighborhood highlight + pin-on-hover ----
  let hoverTimer = null;
  let hoverId = null;

  nodeSel.on("mouseenter", function (event, d) {
    hoverId = d.id;
    if (!selectedId) highlightNeighborhood(d.id, { hoverOnly: true });
    clearTimeout(hoverTimer);
    hoverTimer = setTimeout(() => {
      // Pin-on-hover: fix the node in place after 300ms so it's definitively clickable.
      if (hoverId === d.id && d.fx == null) {
        d.fx = d.x; d.fy = d.y;
        d._hoverPinned = true;
        // nudge alpha slightly to avoid stale neighbors visually lagging
        simulation.alpha(Math.max(simulation.alpha(), 0.06));
      }
    }, 300);
  });
  nodeSel.on("mouseleave", function (event, d) {
    if (hoverId === d.id) hoverId = null;
    clearTimeout(hoverTimer);
    // release hover-pin if it wasn't a deliberate pin
    if (d._hoverPinned && !d._pinned) {
      d.fx = null; d.fy = null;
      d._hoverPinned = false;
    }
    if (!selectedId) highlightNeighborhood(null);
  });

  // tick
  simulation.on("tick", () => {
    const w = width(), h = height();
    const pad = 40;
    for (const n of nodes) {
      if (n.fx != null) continue;
      if (n.x < pad) n.vx += (pad - n.x) * 0.02;
      if (n.x > w - pad) n.vx -= (n.x - (w - pad)) * 0.02;
      if (n.y < pad + 100) n.vy += (pad + 100 - n.y) * 0.02;
      if (n.y > h - pad - 50) n.vy -= (n.y - (h - pad - 50)) * 0.02;
    }
    linkSel
      .attr("x1", d => d.source.x).attr("y1", d => d.source.y)
      .attr("x2", d => d.target.x).attr("y2", d => d.target.y);
    nodeSel.attr("transform", d => `translate(${d.x},${d.y})`);
  });

  // resize
  window.addEventListener("resize", () => {
    simulation.force("center", d3.forceCenter(width() / 2, height() / 2).strength(0.06));
    simulation.alpha(0.3).restart();
  });

  // ---- Cursor tracking ----
  svgEl.addEventListener("pointermove", (e) => {
    const now = performance.now();
    const dx = e.clientX - cursor.lastX;
    const dy = e.clientY - cursor.lastY;
    const moved = Math.sqrt(dx*dx + dy*dy);
    cursor.x = e.clientX; cursor.y = e.clientY;
    cursor.active = true;
    if (moved > IDLE_PX) {
      cursor.lastX = e.clientX;
      cursor.lastY = e.clientY;
      cursor.lastMoveAt = now;
      cursor.idle = false;
    }
    if (simulation.alpha() < 0.08) simulation.alphaTarget(0.05).restart();
  });
  svgEl.addEventListener("pointerleave", () => {
    cursor.active = false;
    cursor.idle = true;
    simulation.alphaTarget(0);
  });

  // click background to deselect
  svgEl.addEventListener("click", () => {
    if (selectedId) selectNode(null);
  });

  // ---- Selection / panel ----
  let selectedId = null;
  const panelEl = document.getElementById("panel");
  const panelTitle = document.getElementById("panel-title");
  const panelBody = document.getElementById("panel-body");
  const panelCategory = document.getElementById("panel-category");
  const panelRelated = document.getElementById("panel-related-list");
  const panelClose = document.getElementById("panel-close");
  panelClose.addEventListener("click", (e) => { e.stopPropagation(); selectNode(null); });

  function selectNode(id) {
    selectedId = id;
    if (!id) {
      panelEl.classList.add("hidden");
      highlightNeighborhood(null);
      return;
    }
    const n = nodeById.get(id);
    if (!n) return;
    panelEl.classList.remove("hidden");
    panelTitle.textContent = n.label;
    panelBody.textContent = n.blurb;
    const color = CATEGORY_COLORS[n.category];
    panelCategory.innerHTML = `<span class="cat" style="background:${color}">${CATEGORY_LABEL[n.category]}</span>`;

    const neighbors = Array.from(adjacency.get(n.id))
      .map(nid => nodeById.get(nid))
      .filter(Boolean)
      .sort((a, b) => a.label.localeCompare(b.label));
    panelRelated.innerHTML = "";
    for (const nb of neighbors) {
      const li = document.createElement("li");
      const sw = document.createElement("span");
      sw.className = "swatch";
      sw.style.background = CATEGORY_COLORS[nb.category];
      sw.style.color = CATEGORY_COLORS[nb.category];
      li.appendChild(sw);
      li.appendChild(document.createTextNode(nb.label));
      li.addEventListener("click", (e) => { e.stopPropagation(); selectNode(nb.id); centerOn(nb); });
      panelRelated.appendChild(li);
    }

    highlightNeighborhood(id);
    centerOn(n);
    simulation.alpha(0.2).restart();
  }

  function centerOn(n) {
    const panelOpen = !panelEl.classList.contains("hidden");
    const targetX = width() / 2 + (panelOpen ? -200 : 0);
    const targetY = height() / 2 + 30;
    if (n.fx != null) {
      // animate the fixed position toward target
      n.fx += (targetX - n.fx) * 0.2;
      n.fy += (targetY - n.fy) * 0.2;
    } else {
      n.vx += (targetX - n.x) * 0.05;
      n.vy += (targetY - n.y) * 0.05;
    }
  }

  function highlightNeighborhood(id, opts = {}) {
    if (!id) {
      nodeSel.classed("selected", false).classed("neighbor", false).classed("dimmed", false);
      linkSel.classed("highlighted", false).classed("dimmed", false);
      return;
    }
    const neighbors = adjacency.get(id) || new Set();
    nodeSel
      .classed("selected", d => d.id === id)
      .classed("neighbor", d => neighbors.has(d.id))
      .classed("dimmed", d => d.id !== id && !neighbors.has(d.id));
    linkSel
      .classed("highlighted", l => l.source.id === id || l.target.id === id)
      .classed("dimmed", l => !(l.source.id === id || l.target.id === id));
  }

  // ---- Search ----
  const searchInput = document.getElementById("search");
  window.addEventListener("keydown", (e) => {
    if (e.key === "/" && document.activeElement !== searchInput) {
      e.preventDefault();
      searchInput.focus();
      searchInput.select();
    } else if (e.key === "Escape") {
      if (document.activeElement === searchInput) searchInput.blur();
      selectNode(null);
      searchInput.value = "";
      applySearch("");
    }
  });
  searchInput.addEventListener("input", () => applySearch(searchInput.value));
  searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      const q = searchInput.value.trim().toLowerCase();
      if (!q) return;
      const match = nodes.find(n => n.label.toLowerCase().includes(q) || n.id.toLowerCase().includes(q));
      if (match) { selectNode(match.id); centerOn(match); }
    }
  });
  function applySearch(q) {
    const query = q.trim().toLowerCase();
    if (!query) {
      nodeSel.classed("matched", false);
      if (!selectedId) {
        nodeSel.classed("dimmed", false);
        linkSel.classed("dimmed", false);
      } else {
        highlightNeighborhood(selectedId);
      }
      return;
    }
    nodeSel.classed("matched", d =>
      d.label.toLowerCase().includes(query) || d.id.toLowerCase().includes(query) || d.category.includes(query)
    );
    if (!selectedId) {
      nodeSel.classed("dimmed", d => !(d.label.toLowerCase().includes(query) || d.id.toLowerCase().includes(query) || d.category.includes(query)));
      linkSel.classed("dimmed", true);
    }
  }

  // ---- Example chips below search ----
  document.querySelectorAll(".chip").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const id = btn.getAttribute("data-id");
      const n = nodeById.get(id);
      if (!n) return;
      searchInput.value = n.label;
      applySearch(n.label);
      selectNode(id);
      centerOn(n);
    });
  });

  // ---- Mode dropdown (non-functional signal that this is embeddable) ----
  const modeBtn = document.getElementById("mode-btn");
  const modeMenu = document.getElementById("mode-menu");
  const modeCurrent = document.getElementById("mode-current");
  modeBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    const open = !modeMenu.hidden;
    modeMenu.hidden = open;
    modeBtn.setAttribute("aria-expanded", String(!open));
  });
  modeMenu.querySelectorAll("li").forEach(li => {
    li.addEventListener("click", (e) => {
      e.stopPropagation();
      const mode = li.getAttribute("data-mode");
      modeCurrent.textContent = mode === "jakeOS" ? "jakeOS mode" : mode;
      modeMenu.hidden = true;
      modeBtn.setAttribute("aria-expanded", "false");
      modeMenu.querySelectorAll("li").forEach(o => o.setAttribute("aria-selected", "false"));
      li.setAttribute("aria-selected", "true");
    });
  });
  document.addEventListener("click", () => {
    if (!modeMenu.hidden) {
      modeMenu.hidden = true;
      modeBtn.setAttribute("aria-expanded", "false");
    }
  });

  // ---- Intro: scatter-in animation ----
  // Place nodes on an outer ring so the first few seconds visibly settle inward.
  (function seedIntro() {
    const w = width(), h = height();
    const cx = w / 2, cy = h / 2;
    const r = Math.max(w, h) * 0.7; // wider than viewport so they fly in
    nodes.forEach((n, i) => {
      const angle = (i / nodes.length) * Math.PI * 2 + Math.random() * 0.3;
      n.x = cx + Math.cos(angle) * r + (Math.random() - 0.5) * 40;
      n.y = cy + Math.sin(angle) * r + (Math.random() - 0.5) * 40;
      n.vx = (cx - n.x) * 0.02;
      n.vy = (cy - n.y) * 0.02;
    });
  })();

  simulation.alpha(1).restart();

  // ---- Featured node on load: Stock Unlock, with panel pre-opened ----
  // Wait for the sim to do a few ticks so the selected node lands visibly.
  panelEl.classList.add("hidden");
  setTimeout(() => {
    const featured = nodeById.get("stockunlock");
    if (!featured) return;
    selectNode(featured.id);
  }, 650);
})();
