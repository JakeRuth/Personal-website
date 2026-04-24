/* ruth/systems — saas-v5
   Vanilla JS, zero build. Powers:
     - Hero latency ticker
     - Uptime bars (90 days)
     - Architecture graph (9 nodes, hand-rolled SVG)
     - Docs code tab switching + copy
     - Integrations "last checked" timer
*/

// ============================================================
// HERO LATENCY TICKER
// ============================================================
(function heroLatency() {
  const el = document.getElementById("hero-latency");
  if (!el) return;
  let t = 0;
  setInterval(() => {
    t += 0.1;
    const v = Math.round(16 + Math.sin(t) * 3 + Math.random() * 2);
    el.textContent = v + "ms";
  }, 1400);
})();

// ============================================================
// STATUS CARD — uptime bars (90 days)
// ============================================================
(function uptimeBars() {
  const barsEl = document.getElementById("uptime-bars");
  if (!barsEl) return;
  const N = 90;
  const degraded = new Set([22, 54, 73]); // 3 degraded days, 0 outages
  const frag = document.createDocumentFragment();
  for (let i = 0; i < N; i++) {
    const d = document.createElement("div");
    d.className = "bar";
    if (degraded.has(i)) {
      d.classList.add("amber");
      d.title = `Day -${N - i}: degraded (minor)`;
    } else {
      d.title = `Day -${N - i}: healthy`;
    }
    d.style.height = (82 + Math.random() * 18).toFixed(0) + "%";
    frag.appendChild(d);
  }
  barsEl.appendChild(frag);
})();

// ============================================================
// ARCHITECTURE GRAPH — 9 nodes
// ============================================================
(function architecture() {
  const svg = document.getElementById("arch-svg");
  if (!svg) return;

  const NODES = [
    { id: "core",     label: "Core Engine",     class: "core",    slo: "99.99%", since: "2013", blurb: "Thirteen years of shipped production code. The deterministic center; everything else composes on top." },
    { id: "sysdesign",label: "System Design",   class: "core",    slo: "99.97%", since: "2016", blurb: "Drawing boxes and making them true. Written design docs before code. The part of the job I like most." },
    { id: "runtime",  label: "Runtime",         class: "service", slo: "99.95%", since: "2013", blurb: "Python daily driver. TypeScript for product surfaces. Go for services that should be fast, small, and boring." },
    { id: "data",     label: "Data Layer",      class: "data",    slo: "99.99%", since: "2013", blurb: "Postgres first, everything else second. Schema discipline. Migrations are boring on purpose." },
    { id: "platform", label: "AWS Platform",    class: "data",    slo: "99.95%", since: "2017", blurb: "Run in anger: ECS, RDS, SES, Route53. Prefers primitives to magical platforms. Saved Stock Unlock ~$6K/yr migrating to self-hosted SES." },
    { id: "delivery", label: "Delivery",        class: "service", slo: "99.95%", since: "2013", blurb: "Ticket → design doc → code → review → deploy. Feature flags, dual-writes, shadow reads. No handoffs." },
    { id: "obs",      label: "Observability",   class: "service", slo: "99.97%", since: "2017", blurb: "Metrics, logs, dashboards, runbooks. Built by someone who's been paged at 3 AM. Datadog-literate." },
    { id: "ai",       label: "AI Co-pilot",     class: "ai",      slo: "99.50%", since: "2024", blurb: "Driver in the driver's seat, not driven by the car. Claude Code and Codex. Reviewed for business logic, security, architecture." },
    { id: "humans",   label: "Humans API",      class: "edge",    slo: "99.90%", since: "2013", blurb: "Async-first, meeting-competent, brutally honest when it matters. Led a YC interview. Scaled a team to eight." },
  ];

  const EDGES = [
    ["core",     "sysdesign", "guides"],
    ["sysdesign","runtime",   "drives"],
    ["sysdesign","delivery",  "plans"],
    ["runtime",  "data",      "reads"],
    ["runtime",  "platform",  "runs on"],
    ["data",     "platform",  "hosted"],
    ["delivery", "runtime",   "ships"],
    ["delivery", "platform",  "deploys"],
    ["obs",      "platform",  "observes"],
    ["obs",      "delivery",  "gates"],
    ["ai",       "runtime",   "augments"],
    ["ai",       "delivery",  "assists"],
    ["humans",   "sysdesign", "aligns"],
    ["humans",   "delivery",  "reviews"],
  ];

  const classColor = {
    core:    getCSS("--swatch-core"),
    service: getCSS("--swatch-service"),
    data:    getCSS("--swatch-data"),
    edge:    getCSS("--swatch-edge"),
    ai:      getCSS("--swatch-ai"),
  };
  function getCSS(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || "#888";
  }

  // Fixed, designed layout in 1000x480 viewbox
  const LAYOUT = {
    humans:    { x: 140, y: 110 },
    core:      { x: 140, y: 340 },
    sysdesign: { x: 360, y: 230 },
    runtime:   { x: 560, y: 110 },
    delivery:  { x: 560, y: 340 },
    data:      { x: 740, y: 200 },
    obs:       { x: 760, y: 400 },
    platform:  { x: 880, y: 290 },
    ai:        { x: 360, y: 420 },
  };

  const VW = 1000, VH = 480;
  svg.setAttribute("viewBox", `0 0 ${VW} ${VH}`);
  svg.setAttribute("preserveAspectRatio", "xMidYMid meet");

  const NS = "http://www.w3.org/2000/svg";
  const defs = document.createElementNS(NS, "defs");
  defs.innerHTML = `
    <marker id="arrowhead" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M 0 0 L 8 4 L 0 8 z" fill="#2d3441"/>
    </marker>
    <marker id="arrowhead-hl" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M 0 0 L 8 4 L 0 8 z" fill="${getCSS("--accent")}"/>
    </marker>
  `;
  svg.appendChild(defs);

  const gLinks = document.createElementNS(NS, "g");
  svg.appendChild(gLinks);
  const gNodes = document.createElementNS(NS, "g");
  svg.appendChild(gNodes);

  const adj = new Map();
  NODES.forEach(n => adj.set(n.id, new Set()));
  EDGES.forEach(([a, b]) => {
    adj.get(a).add(b);
    adj.get(b).add(a);
  });

  const linkEls = [];
  for (const [sId, tId, label] of EDGES) {
    const s = LAYOUT[sId], t = LAYOUT[tId];
    if (!s || !t) continue;
    const r = 24;
    const dx = t.x - s.x, dy = t.y - s.y;
    const len = Math.hypot(dx, dy);
    const ux = dx / len, uy = dy / len;
    const x1 = s.x + ux * r, y1 = s.y + uy * r;
    const x2 = t.x - ux * (r + 4), y2 = t.y - uy * (r + 4);

    const line = document.createElementNS(NS, "line");
    line.setAttribute("class", "arch-link");
    line.setAttribute("x1", x1); line.setAttribute("y1", y1);
    line.setAttribute("x2", x2); line.setAttribute("y2", y2);
    line.setAttribute("marker-end", "url(#arrowhead)");
    gLinks.appendChild(line);
    linkEls.push({ el: line, source: sId, target: tId });

    const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
    const text = document.createElementNS(NS, "text");
    text.setAttribute("class", "arch-link-label");
    text.setAttribute("x", mx);
    text.setAttribute("y", my - 3);
    text.textContent = label;
    gLinks.appendChild(text);
  }

  const nodeEls = new Map();
  for (const n of NODES) {
    const pos = LAYOUT[n.id];
    const g = document.createElementNS(NS, "g");
    g.setAttribute("class", "arch-node");
    g.setAttribute("transform", `translate(${pos.x},${pos.y})`);
    g.style.color = classColor[n.class];
    g.dataset.id = n.id;

    const c = document.createElementNS(NS, "circle");
    c.setAttribute("r", 24);
    c.setAttribute("fill", classColor[n.class]);
    c.setAttribute("fill-opacity", 0.16);
    c.setAttribute("stroke", classColor[n.class]);
    c.setAttribute("stroke-width", 1.5);
    g.appendChild(c);

    const d = document.createElementNS(NS, "circle");
    d.setAttribute("r", 4);
    d.setAttribute("fill", classColor[n.class]);
    g.appendChild(d);

    const t = document.createElementNS(NS, "text");
    t.setAttribute("y", 42);
    t.textContent = n.label;
    g.appendChild(t);

    g.addEventListener("click", (e) => { e.stopPropagation(); select(n.id); });
    g.addEventListener("mouseenter", () => { if (!selected) highlight(n.id, n); });
    g.addEventListener("mouseleave", () => { if (!selected) highlight(null, null); });

    gNodes.appendChild(g);
    nodeEls.set(n.id, g);
  }

  svg.addEventListener("click", () => { if (selected) select(null); });

  let selected = null;
  const panelTitle = document.getElementById("arch-panel-title");
  const panelBody  = document.getElementById("arch-panel-body");
  const sloEl      = document.getElementById("arch-slo");
  const sinceEl    = document.getElementById("arch-since");

  function highlight(id, node) {
    const neigh = id ? adj.get(id) : null;
    for (const [nid, el] of nodeEls) {
      el.classList.toggle("selected", nid === id);
      el.classList.toggle("dimmed", !!id && nid !== id && !(neigh && neigh.has(nid)));
    }
    for (const l of linkEls) {
      const hit = id && (l.source === id || l.target === id);
      l.el.classList.toggle("highlighted", !!hit);
      l.el.classList.toggle("dimmed", !!id && !hit);
      l.el.setAttribute("marker-end", hit ? "url(#arrowhead-hl)" : "url(#arrowhead)");
    }
    if (panelTitle && node) {
      panelTitle.textContent = node.label;
      panelBody.textContent = node.blurb;
      sloEl.textContent = node.slo;
      sinceEl.textContent = node.since;
    } else if (panelTitle && !id) {
      panelTitle.textContent = "Hover a node";
      panelBody.textContent = "Click any node to pin its service specification, SLO, and upstream dependencies.";
      sloEl.textContent = "—";
      sinceEl.textContent = "—";
    }
  }

  function select(id) {
    if (id === null) {
      selected = null;
      highlight(null, null);
      return;
    }
    selected = id;
    const n = NODES.find(n => n.id === id);
    highlight(id, n);
  }
})();

// ============================================================
// DOCS — code tab switching + copy
// ============================================================
(function docsTabs() {
  const tabs = document.querySelectorAll(".code-tab[data-tab]");
  const bodies = {
    curl: document.querySelector(".code-body-curl"),
    node: document.querySelector(".code-body-node"),
    py:   document.querySelector(".code-body-py"),
  };
  if (!tabs.length) return;

  tabs.forEach(t => {
    t.addEventListener("click", () => {
      const which = t.dataset.tab;
      tabs.forEach(x => x.classList.toggle("active", x === t));
      for (const [k, el] of Object.entries(bodies)) {
        if (!el) continue;
        el.hidden = k !== which;
      }
    });
  });

  const copyBtn = document.getElementById("copy-code");
  if (!copyBtn) return;
  copyBtn.addEventListener("click", () => {
    const active = document.querySelector(".code-tab.active")?.dataset.tab || "curl";
    const el = bodies[active];
    if (!el) return;
    navigator.clipboard?.writeText(el.textContent).catch(() => {});
    const orig = copyBtn.innerHTML;
    copyBtn.innerHTML = '<i class="lucide lucide-check"></i>';
    copyBtn.style.color = "var(--green)";
    copyBtn.style.borderColor = "var(--green)";
    setTimeout(() => {
      copyBtn.innerHTML = orig;
      copyBtn.style.color = "";
      copyBtn.style.borderColor = "";
    }, 1100);
  });
})();

// ============================================================
// INTEGRATIONS — "last checked" timer
// ============================================================
(function integTime() {
  const el = document.getElementById("integ-time");
  if (!el) return;
  let t0 = Date.now();
  setInterval(() => {
    const secs = Math.floor((Date.now() - t0) / 1000);
    if (secs < 3) el.textContent = "just now";
    else if (secs < 60) el.textContent = `${secs}s ago`;
    else {
      // reset after a minute so it feels live
      t0 = Date.now();
      el.textContent = "just now";
    }
  }, 1000);
})();
