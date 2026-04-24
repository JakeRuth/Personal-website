/* ============================================================
   Ruth Systems v2 — app glue
   - Status card (uptime bars + latency ticker)
   - Metrics count-up
   - Architecture SVG (12-node)
   - Configurator (no $ numbers — copy only)
   - Copy config to clipboard
   - Search palette (real, actually searches and jumps)
   - Docs tab/copy/active section
   ============================================================ */

// ---------------- STATUS CARD ----------------
(function statusCard() {
  const barsEl = document.getElementById("uptime-bars");
  if (!barsEl) return;
  const N = 90;
  const frag = document.createDocumentFragment();
  for (let i = 0; i < N; i++) {
    const d = document.createElement("div");
    d.className = "bar";
    if (i === 22 || i === 54 || i === 73) d.classList.add("amber");
    d.style.height = (80 + Math.random() * 20).toFixed(0) + "%";
    d.title = `Day -${N - i}: healthy`;
    frag.appendChild(d);
  }
  barsEl.appendChild(frag);

  const latEl = document.getElementById("latency-value");
  if (!latEl) return;
  let t = 0;
  setInterval(() => {
    t += 0.1;
    const v = Math.round(16 + Math.sin(t) * 3 + Math.random() * 2);
    latEl.textContent = v + "ms";
  }, 1200);
})();

// ---------------- METRICS COUNT-UP ----------------
(function metricsCountUp() {
  const items = document.querySelectorAll(".metric-value[data-count]");
  if (!("IntersectionObserver" in window) || !items.length) return;
  const obs = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      const el = e.target;
      obs.unobserve(el);
      const final = el.textContent.trim();
      const intMatch = final.match(/^(\d+)/);
      if (!intMatch) continue;
      const target = parseInt(intMatch[1], 10);
      let start = 0;
      const dur = 900;
      const t0 = performance.now();
      function step(now) {
        const k = Math.min(1, (now - t0) / dur);
        const eased = 1 - Math.pow(1 - k, 3);
        const val = Math.round(start + (target - start) * eased);
        el.childNodes[0].nodeValue = val + "";
        if (k < 1) requestAnimationFrame(step);
      }
      el.childNodes[0].nodeValue = "0";
      requestAnimationFrame(step);
    }
  }, { threshold: 0.4 });
  items.forEach(el => obs.observe(el));
})();

// ---------------- ARCHITECTURE DIAGRAM ----------------
(function architecture() {
  const svg = document.getElementById("arch-svg");
  if (!svg) return;

  const NODES = [
    { id: "core",      label: "Ruth Core",        class: "core",    slo: "99.99%", blurb: "13 years of shipped production code. The deterministic core; everything else depends on this." },
    { id: "python",    label: "Python Services",  class: "service", slo: "99.95%", blurb: "Daily driver for a decade. Backends, pipelines, financial modeling. High throughput, low drama." },
    { id: "ts",        label: "TypeScript",       class: "service", slo: "99.95%", blurb: "React since pre-hooks. Product surfaces, not portfolios. Stock Unlock frontend is a large TS codebase I still enjoy touching." },
    { id: "go",        label: "Go Services",      class: "service", slo: "99.99%", blurb: "For services that need to be fast, small, and boring. Proficient, not decorative." },
    { id: "frontend",  label: "Frontend",         class: "edge",    slo: "99.90%", blurb: "React, Webflow, vanilla. Whatever the site needs and nothing more." },
    { id: "data",      label: "Postgres",         class: "data",    slo: "99.99%", blurb: "Postgres first, everything else second. Schema discipline, boring migrations." },
    { id: "aws",       label: "AWS Platform",     class: "data",    slo: "99.95%", blurb: "ECS, RDS, SES, Route53, Lambda when warranted. Prefers primitives over magical platforms." },
    { id: "ai",        label: "AI Orchestrator",  class: "ai",      slo: "99.50%", blurb: "Driver in the driver's seat. Claude Code + Codex + Cursor. AI writes more code than I do — and I read every line." },
    { id: "sysdesign", label: "System Design",    class: "core",    slo: "99.99%", blurb: "Drawing boxes and making them true. The part of the job I like most." },
    { id: "obs",       label: "Observability",    class: "service", slo: "99.97%", blurb: "Metrics, logs, dashboards, runbooks. Built by someone who's been paged at 3 AM." },
    { id: "delivery",  label: "Delivery Pipeline",class: "service", slo: "99.95%", blurb: "Ticket → design doc → code → review → deploy. No surprises, no handoffs." },
    { id: "people",    label: "Humans API",       class: "edge",    slo: "99.90%", blurb: "Slack-native, async-first, meeting-competent. Writes down decisions. Doesn't do compliment sandwiches." },
  ];
  const EDGES = [
    ["core", "sysdesign", "depends"],
    ["sysdesign", "python", "drives"],
    ["sysdesign", "ts", "drives"],
    ["sysdesign", "go", "drives"],
    ["python", "data", "reads"],
    ["go", "data", "reads"],
    ["ts", "frontend", "builds"],
    ["python", "aws", "deploys"],
    ["go", "aws", "deploys"],
    ["data", "aws", "hosts"],
    ["ai", "python", "augments"],
    ["ai", "ts", "augments"],
    ["ai", "delivery", "assists"],
    ["delivery", "frontend", "ships"],
    ["delivery", "aws", "ships"],
    ["obs", "aws", "observes"],
    ["obs", "delivery", "observes"],
    ["people", "delivery", "calls"],
    ["people", "sysdesign", "aligns"],
    ["core", "ai", "guides"],
  ];

  function getCSS(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || "#888";
  }
  const classColor = {
    core: getCSS("--swatch-core"), service: getCSS("--swatch-service"),
    data: getCSS("--swatch-data"), edge: getCSS("--swatch-edge"), ai: getCSS("--swatch-ai"),
  };

  const LAYOUT = {
    core:      { x: 140, y: 260 },
    sysdesign: { x: 320, y: 140 },
    python:    { x: 500, y: 80 },
    ts:        { x: 500, y: 220 },
    go:        { x: 500, y: 360 },
    data:      { x: 700, y: 420 },
    frontend:  { x: 700, y: 200 },
    aws:       { x: 860, y: 320 },
    ai:        { x: 320, y: 400 },
    obs:       { x: 880, y: 100 },
    delivery:  { x: 680, y: 60 },
    people:    { x: 160, y: 80 },
  };
  const VW = 1000, VH = 520;
  svg.setAttribute("viewBox", `0 0 ${VW} ${VH}`);
  svg.setAttribute("preserveAspectRatio", "xMidYMid meet");

  const NS = "http://www.w3.org/2000/svg";
  const defs = document.createElementNS(NS, "defs");
  defs.innerHTML = `
    <marker id="arrowhead" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M 0 0 L 8 4 L 0 8 z" fill="currentColor"/>
    </marker>
    <marker id="arrowhead-hl" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M 0 0 L 8 4 L 0 8 z" fill="${getCSS("--accent")}"/>
    </marker>
  `;
  svg.appendChild(defs);

  const gLinks = document.createElementNS(NS, "g");
  gLinks.setAttribute("class", "arch-links");
  svg.appendChild(gLinks);
  const gNodes = document.createElementNS(NS, "g");
  gNodes.setAttribute("class", "arch-nodes");
  svg.appendChild(gNodes);

  const adj = new Map();
  NODES.forEach(n => adj.set(n.id, new Set()));
  EDGES.forEach(([a, b]) => { adj.get(a).add(b); adj.get(b).add(a); });

  const linkEls = [];
  for (const [sId, tId, label] of EDGES) {
    const s = LAYOUT[sId], t = LAYOUT[tId];
    if (!s || !t) continue;
    const r = 22;
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
    text.setAttribute("x", mx); text.setAttribute("y", my - 3);
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
    c.setAttribute("r", 22);
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
    t.setAttribute("y", 40);
    t.textContent = n.label;
    g.appendChild(t);
    g.addEventListener("click", (e) => { e.stopPropagation(); select(n.id); });
    g.addEventListener("mouseenter", () => { if (!selected) highlight(n.id); });
    g.addEventListener("mouseleave", () => { if (!selected) highlight(null); });
    gNodes.appendChild(g);
    nodeEls.set(n.id, g);
  }
  svg.addEventListener("click", () => { if (selected) select(null); });

  let selected = null;
  function highlight(id) {
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
  }
  function select(id) {
    selected = id;
    highlight(id);
    const panelTitle = document.getElementById("arch-panel-title");
    const panelBody = document.getElementById("arch-panel-body");
    const sloEl = document.getElementById("arch-slo");
    if (!id) {
      panelTitle.textContent = "No node selected";
      panelBody.textContent = "Click any node to inspect its spec, SLO, and upstream dependencies.";
      sloEl.textContent = "—";
      return;
    }
    const n = NODES.find(n => n.id === id);
    panelTitle.textContent = n.label;
    panelBody.textContent = n.blurb;
    sloEl.textContent = n.slo;
  }
})();

// ---------------- CONFIGURATOR ----------------
(function configurator() {
  const wrap = document.getElementById("configure");
  if (!wrap) return;

  const tierOpts = wrap.querySelectorAll('.opt[data-group="tier"]');
  const surfaceOpts = wrap.querySelectorAll('.opt[data-group="surface"]');
  const addonOpts = wrap.querySelectorAll('.opt[data-group="addon"]');

  const titleEl = document.getElementById("summary-title");
  const descEl = document.getElementById("summary-desc");
  const skuEl = document.getElementById("summary-sku");
  const kvTier = document.getElementById("kv-tier");
  const kvSurface = document.getElementById("kv-surface");
  const kvAddons = document.getElementById("kv-addons");
  const priceEl = document.getElementById("summary-price");
  const fineEl = document.getElementById("summary-fine");
  const ctaEl = document.getElementById("summary-cta");
  const copyBtn = document.getElementById("copy-config");

  // All user-facing values are words/phrases, never dollar figures.
  const TIERS = {
    fulltime: {
      name: "Full-time", sku: "FT",
      title: "Full-time employment",
      desc: "Senior IC, founding engineer, or early-stage CTO. The main thing.",
      price: "Market rate + equity",
      fine: "Market comp + equity. Real numbers over email, not over a pricing card."
    },
    founding: {
      name: "Founding", sku: "FOUND",
      title: "Equity founding engagement",
      desc: "Co-founder track. Small seed or earlier. Has to be a problem I care about.",
      price: "Let's talk",
      fine: "Meaningful equity. Comp below market. Terms aligned with the cap table, discussed in person."
    },
    contract: {
      name: "Contract", sku: "CTR",
      title: "Contract engagement",
      desc: "Defined deliverable, defined timeline. Selective — I take work I can actually ship.",
      price: "Contact sales",
      fine: "Project-scope rate + deliverable. Quoted after a scoping call, not on a landing page."
    },
    starter: {
      name: "Starter", sku: "START",
      title: "Starter conversation",
      desc: "Free 30-minute call. No sales pitch. If this turns into something, it becomes one of the other three.",
      price: "Free · 30 min",
      fine: "No obligation. Camera optional. Agenda welcome."
    }
  };
  const SURFACES = {
    product:  { name: "Product", sku: "PRODUCT", desc: "Features users touch. Frontend + backend. React since pre-hooks." },
    platform: { name: "Platform", sku: "PLATFORM", desc: "Postgres-first, AWS primitives. Boring by design." },
    ai:       { name: "AI-native", sku: "AI", desc: "Internal tooling, bots, migrations. Claude Code + Codex, reviewed line by line." },
    founding: { name: "Founding", sku: "ZERO2ONE", desc: "MVP, investors, hiring, the first on-call rotation." }
  };
  const ADDONS = {
    yc:       { name: "YC prep", sku: "YC" },
    review:   { name: "Arch review", sku: "AR" },
    unicycle: { name: "Unicycle+cube", sku: "CUBE" }
  };

  function getRadio(list) {
    for (const el of list) if (el.querySelector("input").checked) return el.dataset.value;
    return list[0].dataset.value;
  }
  function getChecks(list) {
    const out = [];
    for (const el of list) if (el.querySelector("input").checked) out.push(el.dataset.value);
    return out;
  }

  function updateVisual() {
    [...tierOpts, ...surfaceOpts, ...addonOpts].forEach(el => {
      el.classList.toggle("selected", el.querySelector("input").checked);
    });
  }

  function render() {
    const tier = getRadio(tierOpts);
    const surface = getRadio(surfaceOpts);
    const addons = getChecks(addonOpts);
    const T = TIERS[tier], S = SURFACES[surface];

    titleEl.textContent = T.title;
    descEl.textContent = `${S.desc} ${T.desc}`;
    kvTier.textContent = T.name;
    kvSurface.textContent = S.name;
    kvAddons.textContent = addons.length
      ? addons.map(a => ADDONS[a].name).join(", ")
      : "None";

    const addonSku = addons.length ? "-" + addons.map(a => ADDONS[a].sku).join("-") : "";
    skuEl.textContent = `JAKE-47-${T.sku}-${S.sku}${addonSku}`;

    priceEl.textContent = T.price;
    fineEl.textContent = T.fine;

    // Build mailto with configuration pre-filled
    const body = [
      `Hi Jake,`,
      ``,
      `Putting together an engagement. Here's the configuration from your site:`,
      ``,
      `  SKU:      ${skuEl.textContent}`,
      `  Shape:    ${T.name} — ${T.title}`,
      `  Surface:  ${S.name} — ${S.desc}`,
      `  Add-ons:  ${addons.length ? addons.map(a => ADDONS[a].name).join(", ") : "None"}`,
      `  Terms:    ${T.price}`,
      ``,
      `A little about us: `,
      ``,
      `— `,
    ].join("\n");
    ctaEl.href = `mailto:jake@stockunlock.com?subject=${encodeURIComponent("Configure a Jake — " + skuEl.textContent)}&body=${encodeURIComponent(body)}`;
  }

  [...tierOpts, ...surfaceOpts, ...addonOpts].forEach(el => {
    el.addEventListener("click", () => {
      // radio groups
      const group = el.dataset.group;
      if (group === "tier" || group === "surface") {
        const input = el.querySelector("input");
        input.checked = true;
      }
      // checkboxes handled by the input itself (click bubble), but ensure visual sync on label click
      setTimeout(() => { updateVisual(); render(); }, 0);
    });
    el.querySelector("input").addEventListener("change", () => { updateVisual(); render(); });
  });

  copyBtn && copyBtn.addEventListener("click", async () => {
    const conf = `${skuEl.textContent} — ${titleEl.textContent} · ${kvSurface.textContent} · ${kvAddons.textContent}`;
    try {
      await navigator.clipboard.writeText(conf);
      const span = copyBtn.querySelector("span");
      const orig = span.textContent;
      span.textContent = "Copied!";
      copyBtn.style.color = "var(--green)";
      copyBtn.style.borderColor = "var(--green)";
      setTimeout(() => {
        span.textContent = orig;
        copyBtn.style.color = "";
        copyBtn.style.borderColor = "";
      }, 1400);
    } catch (_) {}
  });

  updateVisual();
  render();
})();

// ---------------- DOCS: copy buttons + active link ----------------
(function docs() {
  document.querySelectorAll(".copy-btn[data-copy]").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.copy;
      const el = document.getElementById(id);
      if (!el) return;
      const text = el.textContent;
      navigator.clipboard?.writeText(text).catch(() => {});
      const orig = btn.innerHTML;
      btn.innerHTML = '<i class="lucide lucide-check"></i>';
      btn.style.color = "var(--green)";
      btn.style.borderColor = "var(--green)";
      setTimeout(() => {
        btn.innerHTML = orig;
        btn.style.color = "";
        btn.style.borderColor = "";
      }, 1200);
    });
  });

  // code-tab toggle (visual)
  document.querySelectorAll(".code-head").forEach(head => {
    const tabs = head.querySelectorAll(".code-tab");
    tabs.forEach(t => t.addEventListener("click", () => {
      tabs.forEach(x => x.classList.remove("active"));
      t.classList.add("active");
    }));
  });

  const links = document.querySelectorAll(".docs-link[href^='#ep-']");
  const endpoints = document.querySelectorAll(".endpoint");
  if (!("IntersectionObserver" in window) || !links.length) return;
  const obs = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting) {
        links.forEach(l => l.classList.toggle("active", l.getAttribute("href") === "#" + e.target.id));
      }
    }
  }, { rootMargin: "-30% 0px -60% 0px" });
  endpoints.forEach(ep => obs.observe(ep));
})();

// ---------------- SEARCH PALETTE (real) ----------------
(function searchPalette() {
  // Build index at load
  const INDEX = [
    // Sections
    { type: "section", label: "Hero — Jake 4.7", sub: "Intro", hash: "#top", keywords: "introducing jake 4.7 hero engineer your team actually needs", icon: "home" },
    { type: "section", label: "Features", sub: "Platform capabilities", hash: "#features", keywords: "features full stack ai native observability audit trail migration zero to one", icon: "layers" },
    { type: "section", label: "Architecture", sub: "12-node reference diagram", hash: "#architecture", keywords: "architecture diagram nodes postgres aws ai orchestrator services delivery", icon: "network" },
    { type: "section", label: "Configure your Jake", sub: "Engagement configurator", hash: "#configure", keywords: "configure build hire engagement fulltime founding contract starter", icon: "sliders" },
    { type: "section", label: "Compare", sub: "Feature matrix", hash: "#pricing", keywords: "pricing compare matrix table plans tiers contract fulltime founding", icon: "table" },
    { type: "section", label: "Cube", sub: "Interactive scroll-solver", hash: "#cube", keywords: "cube rubiks solver 13.95 beginner lbl bfs scramble solve", icon: "box" },
    { type: "section", label: "Customers", sub: "Case studies", hash: "#stories", keywords: "customers case studies stock unlock oscar health commercehub", icon: "users" },
    { type: "section", label: "Developers", sub: "API reference", hash: "#docs", keywords: "developers api reference post get curl hire status", icon: "code" },
    // Endpoints
    { type: "endpoint", label: "POST /api/hire", sub: "Initiate a hiring flow", hash: "#ep-hire", keywords: "post api hire endpoint curl founding ic advisor", icon: "terminal" },
    { type: "endpoint", label: "GET /api/status", sub: "Current availability", hash: "#ep-status", keywords: "get api status availability uptime latency focus", icon: "terminal" },
    { type: "endpoint", label: "GET /api/cube/solve", sub: "Beginner LBL solver", hash: "#ep-cube", keywords: "get api cube solve rubiks beginner lbl", icon: "terminal" },
    { type: "endpoint", label: "PATCH /api/role", sub: "Update role descriptor", hash: "#ep-role", keywords: "patch api role title scope", icon: "terminal" },
    { type: "endpoint", label: "POST /api/meeting", sub: "Schedule a first call", hash: "#ep-meeting", keywords: "post api meeting 30 minute schedule call", icon: "terminal" },
    // Cases
    { type: "case", label: "Stock Unlock", sub: "YC W22 · $1.335M seed · 8 engineers", hash: "#stories", keywords: "stock unlock yc w22 fintech seed profitable thousands paying customers pronk", icon: "rocket" },
    { type: "case", label: "Oscar Health", sub: "4 years · 50→150 engineers", hash: "#stories", keywords: "oscar health senior engineer python postgres member health insurtech", icon: "heart-pulse" },
    { type: "case", label: "CommerceHub", sub: "Intern → engineer · 18 months", hash: "#stories", keywords: "commercehub first job intern groovy java production takedown", icon: "shopping-bag" },
    // Facts
    { type: "fact", label: "99.97% uptime", sub: "Status card · 90-day rolling", hash: "#top", keywords: "uptime 99.97 status operational", icon: "signal" },
    { type: "fact", label: "13.95s 3×3 average", sub: "Competitive 2008-2014", hash: "#cube", keywords: "rubiks cube speedcube 13.95 solve northeast nationals", icon: "timer" },
    { type: "fact", label: "YC Winter 2022", sub: "Led the interview", hash: "#stories", keywords: "yc y combinator winter 2022 interview demo day", icon: "award" },
    { type: "fact", label: "Driver in the driver's seat", sub: "AI philosophy", hash: "#features", keywords: "driver seat ai philosophy claude code codex cursor", icon: "wand-sparkles" },
    { type: "fact", label: "Customer.io → AWS SES migration", sub: "Saved ~$6K/yr in a weekend", hash: "#features", keywords: "customer io ses migration aws cost savings 6k", icon: "git-pull-request" },
  ];

  const palette = document.getElementById("search-palette");
  const input = document.getElementById("search-input");
  const results = document.getElementById("search-results");
  const navSearch = document.getElementById("nav-search");
  if (!palette || !input || !results) return;

  let cursor = 0;
  let currentItems = [];

  function open() {
    palette.hidden = false;
    document.body.style.overflow = "hidden";
    setTimeout(() => input.focus(), 10);
    input.value = "";
    renderResults("");
  }
  function close() {
    palette.hidden = true;
    document.body.style.overflow = "";
  }

  navSearch && navSearch.addEventListener("click", open);

  palette.addEventListener("click", (e) => {
    if (e.target.matches("[data-close]")) close();
  });

  window.addEventListener("keydown", (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      if (palette.hidden) open(); else close();
      return;
    }
    if (palette.hidden) return;
    if (e.key === "Escape") { e.preventDefault(); close(); return; }
    if (e.key === "ArrowDown") { e.preventDefault(); cursor = Math.min(cursor + 1, currentItems.length - 1); updateActive(); }
    if (e.key === "ArrowUp")   { e.preventDefault(); cursor = Math.max(cursor - 1, 0); updateActive(); }
    if (e.key === "Enter")     { e.preventDefault(); const it = currentItems[cursor]; if (it) jump(it); }
  });

  input.addEventListener("input", () => renderResults(input.value));

  function score(item, q) {
    const t = (item.label + " " + item.sub + " " + item.keywords).toLowerCase();
    const qTerms = q.split(/\s+/).filter(Boolean);
    let s = 0;
    for (const term of qTerms) {
      if (t.includes(term)) s += 2;
      if (item.label.toLowerCase().includes(term)) s += 3;
      if (item.label.toLowerCase().startsWith(term)) s += 4;
    }
    return s;
  }

  function renderResults(q) {
    q = (q || "").trim().toLowerCase();
    results.innerHTML = "";
    cursor = 0;

    let items;
    if (!q) {
      // show a curated default list grouped
      items = INDEX.slice();
    } else {
      items = INDEX
        .map(it => ({ it, s: score(it, q) }))
        .filter(x => x.s > 0)
        .sort((a, b) => b.s - a.s)
        .map(x => x.it);
    }

    currentItems = items;

    if (!items.length) {
      results.innerHTML = '<div class="search-none">No results. Try: "cube", "yc", "api", "uptime", "stock unlock", "ai".</div>';
      return;
    }

    // group
    const groups = { section: "Sections", endpoint: "API endpoints", case: "Case studies", fact: "Facts" };
    const by = {};
    for (const it of items) (by[it.type] ||= []).push(it);

    let idx = 0;
    for (const g of ["section", "endpoint", "case", "fact"]) {
      if (!by[g]) continue;
      const label = document.createElement("div");
      label.className = "search-group";
      label.textContent = groups[g];
      results.appendChild(label);
      for (const it of by[g]) {
        const row = document.createElement("div");
        row.className = "search-item";
        row.dataset.idx = idx;
        row.innerHTML = `
          <i class="lucide lucide-${it.icon || "search"}"></i>
          <div class="search-item-main">
            <div class="search-item-title">${escapeHTML(it.label)}</div>
            <div class="search-item-sub">${escapeHTML(it.sub)}</div>
          </div>
          <span class="search-item-kbd">↵</span>
        `;
        row.addEventListener("mouseenter", () => { cursor = Number(row.dataset.idx); updateActive(); });
        row.addEventListener("click", () => jump(it));
        results.appendChild(row);
        idx++;
      }
    }
    updateActive();
  }
  function updateActive() {
    const rows = results.querySelectorAll(".search-item");
    rows.forEach((r, i) => r.classList.toggle("active", i === cursor));
    const active = rows[cursor];
    if (active) active.scrollIntoView({ block: "nearest" });
  }
  function jump(item) {
    close();
    const target = document.querySelector(item.hash);
    if (!target) return;
    const rect = target.getBoundingClientRect();
    const top = rect.top + window.scrollY - 80;
    window.scrollTo({ top, behavior: "smooth" });
    // brief visual flash
    target.classList.add("highlight");
    setTimeout(() => target.classList.remove("highlight"), 900);
  }
  function escapeHTML(s) {
    return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);
  }

  // also bind nav menu links that carry data-search to pre-fill and open search
  document.querySelectorAll("[data-search]").forEach(el => {
    // Don't override their default behaviour; just let them scroll to hash.
    // But if the user Alt+clicks, pop the palette with the search prefilled.
    el.addEventListener("click", (e) => {
      if (!e.altKey) return;
      e.preventDefault();
      open();
      input.value = el.dataset.search;
      renderResults(input.value);
    });
  });
})();

// ---------------- Smooth anchor scrolling ----------------
(function smoothAnchors() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      if (id.length < 2) return;
      const t = document.querySelector(id);
      if (!t) return;
      e.preventDefault();
      const top = t.getBoundingClientRect().top + window.scrollY - 72;
      window.scrollTo({ top, behavior: "smooth" });
    });
  });
})();
