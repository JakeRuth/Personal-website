// Ruth Transit Authority — renderer & interactions.

const SVG_NS = "http://www.w3.org/2000/svg";
const el = (tag, attrs = {}, parent = null) => {
  const n = document.createElementNS(SVG_NS, tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v === null || v === undefined) continue;
    n.setAttribute(k, v);
  }
  if (parent) parent.appendChild(n);
  return n;
};

// ---------------------------------------------------------------------------
// 1) Build line paths with 45/90-degree routing.
//    Given a sequence of stations, produce an SVG path that only uses horizontal,
//    vertical, and 45-degree diagonal segments, with a rounded corner bias.
// ---------------------------------------------------------------------------
function pathForStops(stops, opts = {}) {
  const CORNER = opts.corner ?? 14; // rounded corner radius
  const pts = stops.map((id) => ({ id, x: STATIONS[id].x, y: STATIONS[id].y }));

  // Build orthogonal/diagonal waypoints between each pair.
  // Strategy: for each segment go "diagonal until one axis is aligned, then
  // straight on the other axis." This gives a classic transit-map look.
  const waypoints = [pts[0]];
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1];
    const b = pts[i];
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const adx = Math.abs(dx);
    const ady = Math.abs(dy);
    if (adx < 0.5 || ady < 0.5) {
      // pure vertical or horizontal
      waypoints.push(b);
      continue;
    }
    // diagonal segment length = min(adx, ady)
    const d = Math.min(adx, ady);
    const sx = Math.sign(dx);
    const sy = Math.sign(dy);
    // elbow point: travel diagonally from a, then straight to b.
    const elbow = { x: a.x + d * sx, y: a.y + d * sy };
    waypoints.push(elbow);
    waypoints.push(b);
  }

  // Now turn waypoints into an SVG path with rounded corners at each waypoint.
  let dstr = "";
  for (let i = 0; i < waypoints.length; i++) {
    const p = waypoints[i];
    if (i === 0) {
      dstr += `M ${p.x} ${p.y}`;
      continue;
    }
    const prev = waypoints[i - 1];
    const next = waypoints[i + 1];
    if (!next) {
      dstr += ` L ${p.x} ${p.y}`;
      continue;
    }
    // Rounded corner: we need the direction in and out, shorten each by CORNER,
    // and use a quadratic curve through p.
    const inDir = normalize(p.x - prev.x, p.y - prev.y);
    const outDir = normalize(next.x - p.x, next.y - p.y);
    const inLen = dist(prev, p);
    const outLen = dist(p, next);
    const r = Math.min(CORNER, inLen / 2, outLen / 2);

    const inPt = { x: p.x - inDir.x * r, y: p.y - inDir.y * r };
    const outPt = { x: p.x + outDir.x * r, y: p.y + outDir.y * r };
    dstr += ` L ${inPt.x.toFixed(2)} ${inPt.y.toFixed(2)}`;
    dstr += ` Q ${p.x.toFixed(2)} ${p.y.toFixed(2)} ${outPt.x.toFixed(2)} ${outPt.y.toFixed(2)}`;
  }
  return dstr;
}
function dist(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }
function normalize(x, y) {
  const m = Math.hypot(x, y) || 1;
  return { x: x / m, y: y / m };
}

// ---------------------------------------------------------------------------
// 2) Render lines.
// ---------------------------------------------------------------------------
const linesGroup = document.getElementById("lines");
const stationsGroup = document.getElementById("stations");
const labelsGroup = document.getElementById("labels");

const linePathEls = {};

Object.values(LINES).forEach((line) => {
  const d = pathForStops(line.stops);
  // Subtle shadow stroke under the main stroke for depth.
  el("path", {
    d,
    fill: "none",
    stroke: "#0F1E3622",
    "stroke-width": 14,
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
    transform: "translate(1.5, 2)",
    "pointer-events": "none"
  }, linesGroup);

  const p = el("path", {
    d,
    class: "line-path",
    stroke: line.color,
    "data-line": line.id
  }, linesGroup);
  p.addEventListener("click", (e) => {
    e.stopPropagation();
    activateLine(line.id);
  });
  linePathEls[line.id] = p;
});

// ---------------------------------------------------------------------------
// 3) Render stations + labels.
// ---------------------------------------------------------------------------
const stationEls = {};
Object.entries(STATIONS).forEach(([id, s]) => {
  const g = el("g", {
    class: [
      "station",
      s.interchange ? "interchange" : "",
      s.terminal ? "terminal" : ""
    ].filter(Boolean).join(" "),
    "data-station": id,
    transform: `translate(${s.x}, ${s.y})`
  }, stationsGroup);

  // Interchange stations: capsule spanning their lines.
  if (s.interchange) {
    // Build a "capsule" behind the multiple line-colored mini-circles.
    const w = 34;
    const h = 34;
    el("rect", {
      x: -w / 2, y: -h / 2, width: w, height: h, rx: h / 2, ry: h / 2,
      fill: "#F5F2EA",
      stroke: "#0F1E36",
      "stroke-width": 3.2,
      filter: "url(#stationShadow)"
    }, g);
    // Inner dot
    el("circle", {
      r: 5,
      fill: "#0F1E36",
      class: "stop-inner",
      "pointer-events": "none"
    }, g);
    // Outline stop for hit testing
    el("circle", {
      class: "stop",
      r: 18,
      fill: "transparent",
      stroke: "transparent"
    }, g);
  } else if (s.special === "terminus_q") {
    // "?" terminus for Next Chapter
    el("circle", {
      class: "stop",
      r: 16,
      fill: "#0F1E36",
      stroke: "#0F1E36",
      "stroke-width": 3,
      filter: "url(#stationShadow)"
    }, g);
    el("text", {
      y: 6,
      "text-anchor": "middle",
      "font-size": 20,
      "font-weight": 900,
      fill: "#F5F2EA",
      "pointer-events": "none"
    }, g).textContent = "?";
  } else {
    el("circle", {
      class: "stop",
      r: s.terminal ? 9 : 7
    }, g);
  }

  stationEls[id] = g;

  // Label
  const lblOpts = s.label || {};
  const labelX = s.x + (lblOpts.dx || 0);
  const labelY = s.y + (lblOpts.dy || 0);
  const anchor = lblOpts.anchor || "start";
  const sizeCls = lblOpts.size === "big" ? "label big" : "label";

  // Label can have line breaks if name has "/"
  const parts = s.name.toUpperCase().split(" / ");
  const lg = el("g", {
    class: `label-group ${sizeCls}`,
    "data-station-label": id,
    "pointer-events": "none"
  }, labelsGroup);

  parts.forEach((text, i) => {
    el("text", {
      x: labelX,
      y: labelY + i * (lblOpts.size === "big" ? 14 : 12),
      class: sizeCls,
      "text-anchor": anchor
    }, lg).textContent = text;
  });

  // Hit handlers
  g.addEventListener("click", (e) => {
    e.stopPropagation();
    activateStation(id);
  });
  g.addEventListener("mousemove", (e) => showTip(e, id));
  g.addEventListener("mouseleave", hideTip);
});

// ---------------------------------------------------------------------------
// 4) Legend.
// ---------------------------------------------------------------------------
const legendG = document.getElementById("legend");
const padX = 16;
const rowH = 22;
const legendW = 260;
const legendH = 30 + LEGEND_ORDER.length * rowH + 16;
el("rect", {
  class: "bg",
  x: 0, y: 0,
  width: legendW, height: legendH,
  rx: 8, ry: 8
}, legendG);
el("text", {
  class: "legend-title",
  x: padX, y: 22
}, legendG).textContent = "SERVICE LINES";

LEGEND_ORDER.forEach((lineId, i) => {
  const line = LINES[lineId];
  const rowY = 40 + i * rowH;
  const row = el("g", {
    class: "legend-row",
    "data-line": lineId
  }, legendG);
  el("rect", {
    class: "swatch",
    x: padX, y: rowY - 8,
    width: 26, height: 10, rx: 5, ry: 5,
    fill: line.color
  }, row);
  el("text", {
    x: padX + 36,
    y: rowY,
    "dominant-baseline": "middle"
  }, row).textContent = line.name.toUpperCase();
  el("text", {
    x: legendW - padX,
    y: rowY,
    "dominant-baseline": "middle",
    "text-anchor": "end",
    "font-size": 10,
    "font-weight": 800,
    "letter-spacing": 2,
    fill: "#6B7280"
  }, row).textContent = line.tag;
  row.addEventListener("click", (e) => {
    e.stopPropagation();
    activateLine(lineId);
  });
  row.addEventListener("mouseenter", () => hoverLine(lineId));
  row.addEventListener("mouseleave", () => unhoverLine());
});

// ---------------------------------------------------------------------------
// 5) Tooltip + Panel.
// ---------------------------------------------------------------------------
const tipEl = document.getElementById("tip");
const panel = document.getElementById("panel");
const panelBody = document.getElementById("panel-body");

function showTip(e, id) {
  const s = STATIONS[id];
  if (!s) return;
  const rect = document.querySelector(".map-stage").getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  const chips = s.lines.map((lid) => {
    const L = LINES[lid];
    return `<span class="chip"><span class="dot" style="background:${L.color}"></span>${L.name.toUpperCase()}</span>`;
  }).join("");

  tipEl.innerHTML = `
    <div class="tip-name">${s.name}</div>
    <div class="tip-brief">${s.brief || ""}</div>
    <div class="tip-lines">${chips}</div>
  `;
  tipEl.hidden = false;
  // Position: offset a bit, keep in bounds
  const tipW = 280;
  const tipH = tipEl.offsetHeight || 80;
  let px = x + 16;
  let py = y + 16;
  if (px + tipW > rect.width) px = x - tipW - 16;
  if (py + tipH > rect.height) py = y - tipH - 16;
  tipEl.style.left = px + "px";
  tipEl.style.top = py + "px";
}
function hideTip() { tipEl.hidden = true; }

function activateStation(id) {
  const s = STATIONS[id];
  if (!s) return;

  // highlight selected station + its lines
  clearHighlights();
  stationEls[id].classList.add("active");
  s.lines.forEach((lid) => linePathEls[lid].classList.add("active"));
  // Dim everything that isn't on its lines
  Object.entries(STATIONS).forEach(([oid, os]) => {
    const overlap = os.lines.some((lid) => s.lines.includes(lid));
    if (!overlap && oid !== id) stationEls[oid].classList.add("dim");
  });
  Object.entries(LINES).forEach(([lid]) => {
    if (!s.lines.includes(lid)) linePathEls[lid].classList.add("dim");
  });

  // Build panel
  const lineChips = s.lines.map((lid) => {
    const L = LINES[lid];
    return `<span class="chip" style="background:${L.color}"><span class="num">${L.tag}</span>${L.name.toUpperCase()}</span>`;
  }).join("");

  const metaRows = s.meta
    ? Object.entries(s.meta).map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join("")
    : "";

  panelBody.innerHTML = `
    <div class="panel-kicker">${s.kicker || "STATION"}</div>
    <h2 class="panel-title">${s.name}</h2>
    <div class="panel-lines">${lineChips}</div>
    <div class="panel-body">
      <p>${s.body || s.brief || ""}</p>
      ${metaRows ? `<dl class="meta-grid">${metaRows}</dl>` : ""}
    </div>
  `;
  panel.classList.add("open");
  panel.setAttribute("aria-hidden", "false");
}

function activateLine(lineId) {
  const line = LINES[lineId];
  if (!line) return;

  clearHighlights();
  Object.entries(LINES).forEach(([lid]) => {
    if (lid === lineId) linePathEls[lid].classList.add("active");
    else linePathEls[lid].classList.add("dim");
  });
  // Dim stations not on this line
  Object.entries(STATIONS).forEach(([oid, os]) => {
    if (!os.lines.includes(lineId)) stationEls[oid].classList.add("dim");
  });
  // Legend highlight
  document.querySelectorAll("#legend .legend-row").forEach((r) => {
    r.classList.toggle("active", r.dataset.line === lineId);
  });

  // Panel: full stop list
  const stops = line.stops.map((sid, i) => {
    const s = STATIONS[sid];
    const term = i === 0 || i === line.stops.length - 1 ? "terminus" : "";
    return `<li class="${term}">${s.name}</li>`;
  }).join("");

  panelBody.innerHTML = `
    <div class="panel-kicker" style="color:${line.color}">${line.tag} · LINE</div>
    <h2 class="panel-title" style="color:${line.color}">${line.name.toUpperCase()} LINE</h2>
    <div class="panel-body">
      <p>${line.motto}</p>
      <ul class="stop-list" style="--line-color:${line.color}">${stops}</ul>
    </div>
  `;
  panel.classList.add("open");
  panel.setAttribute("aria-hidden", "false");
}

function hoverLine(lineId) {
  Object.entries(LINES).forEach(([lid]) => {
    linePathEls[lid].classList.toggle("dim", lid !== lineId);
    if (lid === lineId) linePathEls[lid].classList.add("active");
  });
  Object.entries(STATIONS).forEach(([oid, os]) => {
    stationEls[oid].classList.toggle("dim", !os.lines.includes(lineId));
  });
}
function unhoverLine() {
  if (panel.classList.contains("open")) return; // keep state if a panel is open
  clearHighlights();
}

function clearHighlights() {
  Object.values(linePathEls).forEach((p) => {
    p.classList.remove("dim", "active");
  });
  Object.values(stationEls).forEach((g) => {
    g.classList.remove("dim", "active", "match");
  });
  document.querySelectorAll("#legend .legend-row").forEach((r) => r.classList.remove("active"));
}

// Close panel handlers
document.getElementById("panel-close").addEventListener("click", closePanel);
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closePanel();
});
document.getElementById("map").addEventListener("click", () => {
  closePanel();
});

function closePanel() {
  panel.classList.remove("open");
  panel.setAttribute("aria-hidden", "true");
  clearHighlights();
}

// ---------------------------------------------------------------------------
// 6) Search / filter.
// ---------------------------------------------------------------------------
const searchInput = document.getElementById("search");
const clearBtn = document.getElementById("clear-search");

function runSearch(q) {
  const query = q.trim().toLowerCase();
  clearHighlights();
  if (!query) return;

  // Match against station name, brief, body, kicker, line names.
  let matchedStations = new Set();
  let matchedLines = new Set();

  Object.entries(STATIONS).forEach(([id, s]) => {
    const hay = [
      s.name, s.brief || "", s.body || "", s.kicker || "",
      ...(s.meta ? Object.values(s.meta) : [])
    ].join(" ").toLowerCase();
    if (hay.includes(query)) matchedStations.add(id);
  });
  Object.entries(LINES).forEach(([id, L]) => {
    if (L.name.toLowerCase().includes(query) || (L.motto || "").toLowerCase().includes(query)) {
      matchedLines.add(id);
      L.stops.forEach((sid) => matchedStations.add(sid));
    }
  });

  if (matchedStations.size === 0 && matchedLines.size === 0) return;

  // Dim everything, then undim matches
  Object.entries(STATIONS).forEach(([id]) => {
    if (!matchedStations.has(id)) stationEls[id].classList.add("dim");
    else stationEls[id].classList.add("match");
  });
  const linesInMatches = new Set();
  matchedStations.forEach((sid) => STATIONS[sid].lines.forEach((lid) => linesInMatches.add(lid)));
  matchedLines.forEach((lid) => linesInMatches.add(lid));
  Object.entries(LINES).forEach(([lid]) => {
    if (!linesInMatches.has(lid)) linePathEls[lid].classList.add("dim");
  });
}
searchInput.addEventListener("input", (e) => runSearch(e.target.value));
clearBtn.addEventListener("click", () => {
  searchInput.value = "";
  runSearch("");
  searchInput.focus();
});

// ---------------------------------------------------------------------------
// 7) Static polish: place a line-tag bullet at the start of each line.
// ---------------------------------------------------------------------------
LEGEND_ORDER.forEach((lineId) => {
  const L = LINES[lineId];
  const firstId = L.stops[0];
  const first = STATIONS[firstId];
  // Don't add bullets at interchanges (visually crowded) unless line starts there only on this line.
  if (first.interchange) return;
  const bx = first.x;
  const by = first.y;
  // A small colored square with the line tag near each line origin, offset slightly.
  const tagGroup = el("g", {
    class: "line-tag-group",
    transform: `translate(${bx - 34}, ${by - 34})`,
    "pointer-events": "none"
  }, labelsGroup);
  el("rect", {
    x: 0, y: 0, width: 22, height: 22, rx: 4, ry: 4,
    fill: L.color
  }, tagGroup);
  el("text", {
    x: 11, y: 15,
    "text-anchor": "middle",
    class: "line-tag"
  }, tagGroup).textContent = L.tag;
});
