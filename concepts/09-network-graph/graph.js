/* Force-directed graph using d3-force. Vanilla, no build. */
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

  // Size per category
  function radiusFor(node) {
    switch (node.category) {
      case "career":  return 14;
      case "project": return 11;
      case "person":  return 10;
      case "skill":   return 9;
      case "hobby":   return 9;
      default:        return 9;
    }
  }

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
    // subtle grid
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
    // stars
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

  // adjacency for highlighting
  const adjacency = new Map();
  nodes.forEach(n => adjacency.set(n.id, new Set()));
  links.forEach(l => {
    adjacency.get(l.source.id).add(l.target.id);
    adjacency.get(l.target.id).add(l.source.id);
  });

  // Cursor force (repulsion)
  let cursor = { x: -9999, y: -9999, active: false };
  const CURSOR_STRENGTH = 260;
  const CURSOR_RADIUS = 140;
  function cursorForce(alpha) {
    if (!cursor.active) return;
    for (const n of nodes) {
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
    .force("link", d3.forceLink(links).id(d => d.id).distance(90).strength(0.35))
    .force("charge", d3.forceManyBody().strength(-220).distanceMax(500))
    .force("center", d3.forceCenter(width() / 2, height() / 2).strength(0.06))
    .force("collide", d3.forceCollide().radius(d => radiusFor(d) + 4).strength(0.9))
    .force("cursor", cursorForce)
    .velocityDecay(0.35)
    .alphaDecay(0.02);

  // links
  const linkSel = gLinks.selectAll("line")
    .data(links)
    .join("line");

  // nodes
  const nodeSel = gNodes.selectAll("g.node")
    .data(nodes, d => d.id)
    .join(enter => {
      const g = enter.append("g").attr("class", "node").attr("data-id", d => d.id);
      g.append("circle")
        .attr("r", d => radiusFor(d))
        .attr("fill", d => CATEGORY_COLORS[d.category] || "#888");
      g.append("text")
        .attr("class", "node-label")
        .attr("x", 0)
        .attr("y", d => -(radiusFor(d) + 6))
        .attr("text-anchor", "middle")
        .text(d => d.label);
      return g;
    });

  // drag
  nodeSel.call(d3.drag()
    .on("start", (event, d) => {
      if (!event.active) simulation.alphaTarget(0.25).restart();
      d.fx = d.x; d.fy = d.y;
    })
    .on("drag", (event, d) => {
      d.fx = event.x; d.fy = event.y;
    })
    .on("end", (event, d) => {
      if (!event.active) simulation.alphaTarget(0);
      // keep pinned if user shift-dragged; else release
      if (!event.sourceEvent.shiftKey) { d.fx = null; d.fy = null; }
      else { d3.select(event.sourceEvent.currentTarget || event.currentTarget).classed("pinned", true); }
    })
  );

  nodeSel.on("click", (event, d) => {
    event.stopPropagation();
    selectNode(d.id);
  });
  nodeSel.on("mouseenter", (event, d) => {
    if (selectedId) return;
    highlightNeighborhood(d.id, true);
  });
  nodeSel.on("mouseleave", (event, d) => {
    if (selectedId) return;
    highlightNeighborhood(null);
  });

  // tick
  simulation.on("tick", () => {
    // soft viewport constraint so nodes don't escape
    const w = width(), h = height();
    const pad = 40;
    for (const n of nodes) {
      if (n.x < pad) n.vx += (pad - n.x) * 0.02;
      if (n.x > w - pad) n.vx -= (n.x - (w - pad)) * 0.02;
      if (n.y < pad + 50) n.vy += (pad + 50 - n.y) * 0.02;
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
    cursor.x = e.clientX; cursor.y = e.clientY; cursor.active = true;
    if (simulation.alpha() < 0.1) simulation.alphaTarget(0.08).restart();
  });
  svgEl.addEventListener("pointerleave", () => {
    cursor.active = false;
    simulation.alphaTarget(0);
  });

  // click background to deselect
  svgEl.addEventListener("click", () => {
    if (selectedId) {
      selectNode(null);
    }
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

    // related
    const neighbors = Array.from(adjacency.get(n.id))
      .map(nid => nodeById.get(nid))
      .filter(Boolean)
      .sort((a, b) => a.label.localeCompare(b.label));
    panelRelated.innerHTML = "";
    for (const nb of neighbors) {
      const li = document.createElement("li");
      li.innerHTML = `<span class="swatch" style="background:${CATEGORY_COLORS[nb.category]}"></span>${nb.label}`;
      li.addEventListener("click", (e) => { e.stopPropagation(); selectNode(nb.id); centerOn(nb); });
      panelRelated.appendChild(li);
    }

    highlightNeighborhood(id);
    centerOn(n);
    simulation.alpha(0.2).restart();
  }

  function centerOn(n) {
    // Nudge the target toward center to "zoom" the attention
    const targetX = width() / 2 + (panelEl.classList.contains("hidden") ? 0 : -180);
    const targetY = height() / 2;
    n.vx += (targetX - n.x) * 0.05;
    n.vy += (targetY - n.y) * 0.05;
  }

  function highlightNeighborhood(id) {
    if (!id) {
      nodeSel.classed("selected", false).classed("dimmed", false);
      linkSel.classed("highlighted", false).classed("dimmed", false);
      return;
    }
    const neighbors = adjacency.get(id) || new Set();
    nodeSel.classed("selected", d => d.id === id)
      .classed("dimmed", d => d.id !== id && !neighbors.has(d.id));
    linkSel.classed("highlighted", l => l.source.id === id || l.target.id === id)
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
      if (document.activeElement === searchInput) { searchInput.blur(); }
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
      if (!selectedId) highlightNeighborhood(null);
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

  // seed positions so it doesn't explode on first tick
  (function seed() {
    const w = width(), h = height();
    const cx = w / 2, cy = h / 2;
    const r = Math.min(w, h) / 3.5;
    nodes.forEach((n, i) => {
      const angle = (i / nodes.length) * Math.PI * 2;
      n.x = cx + Math.cos(angle) * r + (Math.random() - 0.5) * 20;
      n.y = cy + Math.sin(angle) * r + (Math.random() - 0.5) * 20;
    });
  })();

  // Kick the sim
  simulation.alpha(1).restart();
})();
