/* Ruth Systems — Enterprise B2B SaaS prototype
   Vanilla JS, zero build. Powers:
     - Architecture graph (SVG, hand-rolled force-lite)
     - Integrations grid + modal
     - Case study modal
     - Status card live ticker + uptime bars
     - Pricing billing toggle
     - Ambient cube-solve ticker
     - Docs copy buttons
*/

// ============================================================
// STATUS CARD — uptime bars + latency ticker
// ============================================================
(function statusCard() {
  const barsEl = document.getElementById("uptime-bars");
  if (!barsEl) return;
  // 90 day uptime bars — 90 hair-thin bars. 3 amber, 0 red.
  const N = 90;
  const frag = document.createDocumentFragment();
  for (let i = 0; i < N; i++) {
    const d = document.createElement("div");
    d.className = "bar";
    // make a few days "degraded" for realism
    if (i === 22 || i === 54 || i === 73) d.classList.add("amber");
    // heights vary very subtly so the row doesn't look dead-flat
    d.style.height = (80 + Math.random() * 20).toFixed(0) + "%";
    d.title = `Day -${N - i}: healthy`;
    frag.appendChild(d);
  }
  barsEl.appendChild(frag);

  // animated latency value
  const latEl = document.getElementById("latency-value");
  if (!latEl) return;
  let t = 0;
  setInterval(() => {
    t += 0.1;
    const v = Math.round(16 + Math.sin(t) * 3 + Math.random() * 2);
    latEl.textContent = v + "ms";
  }, 1200);
})();

// ============================================================
// METRICS — count-up on scroll-in
// ============================================================
(function metricsCountUp() {
  const items = document.querySelectorAll(".metric-value[data-count]");
  if (!("IntersectionObserver" in window) || !items.length) return;
  const obs = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      const el = e.target;
      obs.unobserve(el);
      const final = el.textContent.trim();
      // do a simple count-up for pure integer prefixes
      const intMatch = final.match(/^(\d+)/);
      if (!intMatch) continue;
      const target = parseInt(intMatch[1], 10);
      const rest = final.slice(intMatch[1].length);
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

// ============================================================
// ARCHITECTURE DIAGRAM — hand-rolled SVG graph
// ============================================================
(function architecture() {
  const svg = document.getElementById("arch-svg");
  if (!svg) return;

  // Jake's career/skills as a service-dependency graph.
  const NODES = [
    // class: core | service | data | edge | ai
    { id: "ruby",      label: "Ruby Core",        class: "core",    slo: "99.99%", blurb: "13 years of shipped production code. The deterministic core; everything else depends on this." },
    { id: "python",    label: "Python Services",  class: "service", slo: "99.95%", blurb: "Daily driver for a decade. Data pipelines, back-ends, financial modeling. High throughput, low drama." },
    { id: "ts",        label: "TypeScript",       class: "service", slo: "99.95%", blurb: "The only JavaScript I trust. Stock Unlock front-end is a large TS codebase I still enjoy touching." },
    { id: "go",        label: "Go Services",      class: "service", slo: "99.99%", blurb: "For services that need to be fast, small, and boring in all the right ways." },
    { id: "frontend",  label: "Frontend",         class: "edge",    slo: "99.90%", blurb: "React since hooks were a proposal. Product surfaces, not portfolios." },
    { id: "data",      label: "Data Layer",       class: "data",    slo: "99.99%", blurb: "Postgres first, everything else second. Schema discipline, boring migrations." },
    { id: "aws",       label: "AWS Platform",     class: "data",    slo: "99.95%", blurb: "Run in anger: ECS, RDS, SES, Lambda. Prefers primitives over magical platforms." },
    { id: "ai",        label: "AI Orchestrator",  class: "ai",      slo: "99.50%", blurb: "Driver-in-the-driver's-seat philosophy. LLMs as a power tool, not a pilot." },
    { id: "sysdesign", label: "System Design",    class: "core",    slo: "99.99%", blurb: "Drawing boxes and making them true. The part of the job I like most." },
    { id: "obs",       label: "Observability",    class: "service", slo: "99.97%", blurb: "Metrics, logs, dashboards, runbooks. Built by someone who's been paged at 3 AM." },
    { id: "delivery",  label: "Delivery Pipeline",class: "service", slo: "99.95%", blurb: "Ticket → design doc → code → review → deploy. No surprises, no handoffs." },
    { id: "people",    label: "Humans API",       class: "edge",    slo: "99.90%", blurb: "Slack-native, async-first, meeting-competent. Writes down decisions." },
  ];

  const EDGES = [
    ["ruby", "sysdesign", "depends"],
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
    ["ruby", "ai", "guides"],
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

  // Fixed layout (deterministic, looks designed) — positions in a 1000x520 viewbox
  const LAYOUT = {
    ruby:      { x: 140, y: 260 },
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

  // defs — arrow marker
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

  // Layer: links
  const gLinks = document.createElementNS(NS, "g");
  gLinks.setAttribute("class", "arch-links");
  svg.appendChild(gLinks);

  // Layer: nodes
  const gNodes = document.createElementNS(NS, "g");
  gNodes.setAttribute("class", "arch-nodes");
  svg.appendChild(gNodes);

  // adjacency map
  const adj = new Map();
  NODES.forEach(n => adj.set(n.id, new Set()));
  EDGES.forEach(([a, b]) => {
    adj.get(a).add(b);
    adj.get(b).add(a);
  });

  // Draw links
  const linkEls = [];
  for (const [sId, tId, label] of EDGES) {
    const s = LAYOUT[sId], t = LAYOUT[tId];
    if (!s || !t) continue;
    // shorten line to circle edges
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
    line.dataset.source = sId;
    line.dataset.target = tId;
    gLinks.appendChild(line);
    linkEls.push({ el: line, source: sId, target: tId });

    // label midpoint
    const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
    const text = document.createElementNS(NS, "text");
    text.setAttribute("class", "arch-link-label");
    text.setAttribute("x", mx);
    text.setAttribute("y", my - 3);
    text.textContent = label;
    gLinks.appendChild(text);
  }

  // Draw nodes
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

    // inner dot
    const d = document.createElementNS(NS, "circle");
    d.setAttribute("r", 4);
    d.setAttribute("fill", classColor[n.class]);
    g.appendChild(d);

    const t = document.createElementNS(NS, "text");
    t.setAttribute("y", 40);
    t.textContent = n.label;
    g.appendChild(t);

    g.addEventListener("click", (e) => {
      e.stopPropagation();
      select(n.id);
    });
    g.addEventListener("mouseenter", () => { if (!selected) highlight(n.id); });
    g.addEventListener("mouseleave", () => { if (!selected) highlight(null); });

    gNodes.appendChild(g);
    nodeEls.set(n.id, g);
  }

  svg.addEventListener("click", () => { if (selected) select(null); });

  // Selection + highlight
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
    const panelBody  = document.getElementById("arch-panel-body");
    const sloEl      = document.getElementById("arch-slo");
    if (!id) {
      panelTitle.textContent = "No node selected";
      panelBody.textContent = "Click any node to inspect its service specification, SLO, and upstream dependencies.";
      sloEl.textContent = "—";
      return;
    }
    const n = NODES.find(n => n.id === id);
    panelTitle.textContent = n.label;
    panelBody.textContent = n.blurb;
    sloEl.textContent = n.slo;
  }
})();

// ============================================================
// INTEGRATIONS — tile grid + modal
// ============================================================
(function integrations() {
  const INTEG = [
    { id: "aws",      name: "AWS",         icon: '<i class="lucide lucide-cloud"></i>',      version: "2.340", latency: "24ms", body: "Run in anger for years. ECS for workloads, RDS for state, SES for transactional email, Lambda only when it's the right tool. Jake prefers boring primitives to magical platforms." },
    { id: "python",   name: "Python",      icon: '<i class="lucide lucide-braces"></i>',     version: "3.12",  latency: "12ms", body: "Daily driver for a decade. Data pipelines, backend services, financial modeling. Jake writes Python that ends up running in production for three years because nobody had to rewrite it." },
    { id: "go",       name: "Go",          icon: '<i class="lucide lucide-code"></i>',       version: "1.22",  latency: "4ms",  body: "For services that need to be fast, small, and boring. Jake reaches for Go when the service needs to stay up and get out of the way." },
    { id: "react",    name: "React",       icon: '<i class="lucide lucide-atom"></i>',       version: "18.2",  latency: "11ms", body: "Shipped React since hooks were a proposal. Stock Unlock front-end, Oscar internal tools, various side projects. Uses it for product surfaces, not portfolios." },
    { id: "three",    name: "Three.js",    icon: '<i class="lucide lucide-box"></i>',        version: "0.160", latency: "18ms", body: "For when a rectangle won't do. Used on this website's other concept (the Rubik's cube homepage) — vanilla Three.js via importmap, no build step." },
    { id: "d3",       name: "D3",          icon: '<i class="lucide lucide-git-branch"></i>', version: "7.9",   latency: "9ms",  body: "Force-directed graphs, custom charts, and the occasional bespoke data viz for Stock Unlock. Jake uses d3-force for layouts, rolls his own rendering." },
    { id: "claude",   name: "Claude Code", icon: '<i class="lucide lucide-sparkles"></i>',   version: "Opus",  latency: "2.1s", body: "Driver-in-the-driver's-seat philosophy: LLMs as a power tool, not a pilot. Jake integrates Claude into his workflow the way he'd integrate any other team member: scoped, reviewed, and with a clear contract." },
    { id: "cursor",   name: "Cursor",      icon: '<i class="lucide lucide-mouse-pointer-2"></i>', version: "0.47", latency: "180ms", body: "For deep-context IDE work. Jake uses Cursor as an editor, not an oracle. Accepts the diff, reads it, signs the commit." },
    { id: "github",   name: "GitHub",      icon: '<i class="lucide lucide-github"></i>',     version: "API v4", latency: "48ms", body: "13 years of public commits. PR discipline. Signed commits. Jake's GitHub history is the most honest résumé he has." },
    { id: "linear",   name: "Linear",      icon: '<i class="lucide lucide-list-checks"></i>',version: "API",   latency: "22ms", body: "For teams that want to ship instead of manage. Jake writes tickets that another engineer could pick up cold on a Monday morning." },
    { id: "notion",   name: "Notion",      icon: '<i class="lucide lucide-file-text"></i>',  version: "API",   latency: "90ms", body: "Design docs, ADRs, and the occasional wedding-planning database. Jake writes things down; this is where they go." },
    { id: "slack",    name: "Slack",       icon: '<i class="lucide lucide-message-square"></i>', version: "Bolt", latency: "140ms", body: "Async-first comms. Jake is in Slack, responds in Slack, and resists the urge to turn Slack into a meeting." },
    { id: "stripe",   name: "Stripe",      icon: '<i class="lucide lucide-credit-card"></i>',version: "2024-12", latency: "62ms", body: "Payments at Stock Unlock. Subscription lifecycle, webhook-driven state machines, the usual suspects. Jake has seen what happens when you cut corners here, and doesn't." },
    { id: "postgres", name: "Postgres",    icon: '<i class="lucide lucide-database"></i>',   version: "16.1",  latency: "6ms",  body: "The default. If you think you need something else, you probably don't yet. Jake models first, queries second." },
    { id: "docker",   name: "Docker",      icon: '<i class="lucide lucide-container"></i>',  version: "25.0",  latency: "—",    body: "Containers for every service Jake ships. Not glamorous, just correct. Compose for local, ECS for prod." },
    { id: "webflow",  name: "Webflow",     icon: '<i class="lucide lucide-layout"></i>',     version: "2024",  latency: "—",    body: "Rebuilt Stock Unlock's marketing site in Webflow so non-engineers could ship landing pages without waiting on Jake." },
    { id: "rubiks",   name: "Rubik's Cube",icon: '<span class="cube-mini-tile"></span>',     version: "v3.1",  latency: "13.95s", body: "Competitive Rubik's Cube solver. 13.95s average on 3x3, personal best. Event-driven integration. Known downstream consumers include the unicycle talent-show subsystem.", special: "cube" },
  ];

  const grid = document.getElementById("integ-grid");
  if (!grid) return;

  // Style block for the little cube-mini tile on the Rubik's integration icon
  const miniStyle = document.createElement("style");
  miniStyle.textContent = `
    .cube-mini-tile {
      display: grid;
      grid-template-columns: repeat(3, 5px);
      grid-template-rows: repeat(3, 5px);
      gap: 1px;
    }
    .cube-mini-tile::before,
    .cube-mini-tile::after {
      content: "";
      display: none;
    }
    .cube-mini-tile { width: 19px; height: 19px; background: #0a0d15; padding: 2px; border-radius: 2px; }
    .cube-mini-tile > * { display: block; background: currentColor; }
  `;
  document.head.appendChild(miniStyle);

  const frag = document.createDocumentFragment();
  for (const i of INTEG) {
    const el = document.createElement("div");
    el.className = "integ-tile";
    el.innerHTML = `
      <span class="integ-tile-status" title="Healthy"></span>
      <span class="integ-tile-icon">${i.icon}</span>
      <span class="integ-tile-name">${i.name}</span>
    `;
    el.addEventListener("click", () => {
      if (i.special === "cube") {
        // open cube modal
        document.dispatchEvent(new CustomEvent("ruth:open-cube"));
      } else {
        openIntegModal(i);
      }
    });
    frag.appendChild(el);
  }
  grid.appendChild(frag);

  // Time indicator
  const timeEl = document.getElementById("integ-time");
  function updateTime() {
    const secs = Math.floor((Date.now() / 1000) % 60);
    timeEl.textContent = secs === 0 ? "just now" : `${secs}s ago`;
  }
  setInterval(updateTime, 1000);

  function openIntegModal(i) {
    const modal = document.getElementById("integ-modal");
    document.getElementById("integ-modal-title").textContent = i.name;
    document.getElementById("integ-modal-body").textContent = i.body;
    document.getElementById("integ-modal-version").textContent = i.version;
    document.getElementById("integ-modal-latency").textContent = i.latency;
    document.getElementById("integ-modal-logo").innerHTML = i.icon;
    const manifest = {
      integration: i.id,
      name: i.name,
      version: i.version,
      owner: "jake@stockunlock.com",
      auth: "oauth2",
      scopes: ["read:jake", "write:features", "deploy:production"],
      health: "operational",
      since: "2013-06-01T00:00:00Z"
    };
    document.getElementById("integ-modal-manifest").textContent = JSON.stringify(manifest, null, 2);
    showModal(modal);
  }
})();

// ============================================================
// CASE STUDIES — modal detail
// ============================================================
(function cases() {
  const CASES = {
    stockunlock: {
      logo: "SU",
      eyebrow: "Case study · Fintech",
      title: "How Stock Unlock saved $6,000/year in transactional email fees",
      body: `
        <h4>The situation</h4>
        <p>Stock Unlock — a YC W22 investing research platform — was paying a major transactional email vendor for a workload that amounted to password resets, billing receipts, and weekly digests. The bill was climbing faster than the volume.</p>
        <h4>The intervention</h4>
        <p>Jake stood up a self-hosted transactional email stack on AWS SES over a single sprint. Shadow-sent for a week to validate deliverability. Cut over with a feature flag. Archived the vendor account.</p>
        <ul>
          <li>AWS SES as the sending backbone, SNS for bounces, SQS for complaints</li>
          <li>Postgres-backed idempotency + template registry</li>
          <li>Dashboards for bounce / complaint / deliverability rates from day one</li>
        </ul>
        <h4>Results</h4>
        <div class="results">
          <div><b>$6K</b><span>Saved / year</span></div>
          <div><b>1 sprint</b><span>End-to-end cutover</span></div>
          <div><b>0</b><span>User-visible incidents</span></div>
        </div>
        <p>The system is still running three years later, maintained by nobody in particular, which is the highest compliment you can pay infrastructure.</p>
      `
    },
    oscar: {
      logo: "OS",
      eyebrow: "Case study · Health",
      title: "Oscar Health: four years, three teams, hundreds of thousands of members",
      body: `
        <h4>The situation</h4>
        <p>Oscar Health scaled from a Series C insurtech into a public company while Jake was there. Engineering grew from roughly 50 to 150. The member-facing surface area grew faster than the team.</p>
        <h4>The work</h4>
        <p>Built and maintained member-facing Python/Postgres systems that handled eligibility, claims status, and provider search. Owned the on-call rotation for the service. Wrote the runbook that nobody had to Google at 3 AM.</p>
        <ul>
          <li>Python services backed by Postgres, deployed on internal Kubernetes</li>
          <li>Early-NLP chatbot for internal support teams (pre-LLM era)</li>
          <li>Shipped the unicycle-and-cube routine at the company talent show — unrelated to infrastructure uptime, but load-bearing for culture</li>
        </ul>
        <h4>Outcomes</h4>
        <div class="results">
          <div><b>3×</b><span>Team growth</span></div>
          <div><b>4 yrs</b><span>Tenure</span></div>
          <div><b>300K+</b><span>Members touched</span></div>
        </div>
      `
    },
    commercehub: {
      logo: "CH",
      eyebrow: "Case study · E-commerce",
      title: "CommerceHub: intern to production engineer in 18 months",
      body: `
        <h4>The situation</h4>
        <p>Jake's first real job. CommerceHub runs e-commerce integrations between Fortune-500 retailers and tens of thousands of suppliers. The volume is unglamorous and the stakes are real.</p>
        <h4>The work</h4>
        <p>Came in green. Shipped integration pipelines, learned what "production" actually means when nobody's looking. Graduated from intern to full-time engineer in 18 months, which is the only promotion ladder that ever mattered.</p>
        <ul>
          <li>Java + internal tooling for order / inventory feeds</li>
          <li>First real exposure to large-scale retry, idempotency, and dead-letter patterns</li>
          <li>First taste of writing code that other people would have to read at 2 AM</li>
        </ul>
        <h4>Outcomes</h4>
        <div class="results">
          <div><b>18 mo</b><span>Intern → engineer</span></div>
          <div><b>F500</b><span>Customers served</span></div>
          <div><b>2013–16</b><span>Tenure</span></div>
        </div>
        <p>The lessons from this job show up in everything Jake has shipped since.</p>
      `
    }
  };

  document.querySelectorAll(".case-card").forEach(card => {
    card.addEventListener("click", () => {
      const key = card.dataset.case;
      const c = CASES[key];
      if (!c) return;
      document.getElementById("case-modal-logo").textContent = c.logo;
      document.getElementById("case-modal-eyebrow").textContent = c.eyebrow;
      document.getElementById("case-modal-title").textContent = c.title;
      document.getElementById("case-detail-body").innerHTML = c.body;
      showModal(document.getElementById("case-modal"));
    });
  });
})();

// ============================================================
// PRICING billing toggle
// ============================================================
(function pricingToggle() {
  const opts = document.querySelectorAll(".bt-opt");
  const amts = document.querySelectorAll(".price-amt[data-annual]");
  if (!opts.length) return;

  function apply(mode) {
    opts.forEach(o => o.classList.toggle("active", o.dataset.billing === mode));
    amts.forEach(a => {
      const v = parseInt(a.dataset[mode], 10);
      if (!Number.isFinite(v)) return;
      if (v === 0) { a.textContent = "$0"; return; }
      a.textContent = "$" + v.toLocaleString();
    });
  }

  opts.forEach(o => o.addEventListener("click", () => apply(o.dataset.billing)));
})();

// ============================================================
// MODAL UTILITIES
// ============================================================
function showModal(el) {
  if (!el) return;
  el.hidden = false;
  document.body.style.overflow = "hidden";
  // bind once
  if (!el.__bound) {
    el.__bound = true;
    el.querySelectorAll("[data-close]").forEach(b => b.addEventListener("click", () => hideModal(el)));
  }
}
function hideModal(el) {
  el.hidden = true;
  document.body.style.overflow = "";
}
window.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    document.querySelectorAll(".modal:not([hidden])").forEach(hideModal);
  }
});
window.__ruthShowModal = showModal;
window.__ruthHideModal = hideModal;

// ============================================================
// DOCS — copy buttons
// ============================================================
(function copyButtons() {
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

  // Active docs-link on scroll
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

// ============================================================
// DOCS — open cube from endpoint link
// ============================================================
(function docsCubeLink() {
  const a = document.getElementById("open-cube-from-docs");
  if (!a) return;
  a.addEventListener("click", (e) => {
    e.preventDefault();
    document.dispatchEvent(new CustomEvent("ruth:open-cube"));
  });
})();

// ============================================================
// AMBIENT CUBE SOLVE TICKER — runs while user scrolls
// ============================================================
(function ambientTicker() {
  const el = document.getElementById("ambient-solve");
  const timeEl = document.getElementById("ambient-time");
  if (!el || !timeEl) return;

  let running = false;
  let visible = false;
  let lastScroll = 0;

  window.addEventListener("scroll", () => {
    lastScroll = Date.now();
    if (!visible) {
      el.classList.add("visible");
      visible = true;
    }
    if (!running) runSolve();
  }, { passive: true });

  // fade out after idle
  setInterval(() => {
    if (visible && Date.now() - lastScroll > 4000) {
      el.classList.remove("visible");
      visible = false;
    }
  }, 500);

  function runSolve() {
    running = true;
    const duration = 13.95;
    const t0 = performance.now();
    function tick(now) {
      const elapsed = (now - t0) / 1000;
      if (elapsed >= duration) {
        timeEl.textContent = "13.95";
        setTimeout(() => { running = false; }, 900);
        return;
      }
      timeEl.textContent = elapsed.toFixed(2).padStart(5, "0");
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
})();

// ============================================================
// COMMAND PALETTE stub — ⌘K opens search (visual)
// ============================================================
(function cmdK() {
  window.addEventListener("keydown", (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "k") {
      e.preventDefault();
      const s = document.querySelector(".nav-search");
      if (!s) return;
      s.style.borderColor = "var(--accent)";
      s.style.color = "var(--accent)";
      setTimeout(() => {
        s.style.borderColor = "";
        s.style.color = "";
      }, 600);
    }
  });
})();
