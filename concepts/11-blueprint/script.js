// Blueprint — Jake Ruth career floorplan
// Vanilla JS. Pan + zoom + minimap + detail cards.

(function () {
  'use strict';

  const PLAN_W = 4000;
  const PLAN_H = 2600;

  // ---------- Room data ----------
  const rooms = [
    {
      id: 'origin',
      key: '1',
      label: 'ORIGIN',
      title: 'Origin',
      sub: 'childhood → SUNY Albany',
      years: '1992 – 2013',
      dim: '~21y',
      x: 140, y: 300, w: 680, h: 520,
      shape: 'rect',
      notes: [
        'Started coding ~age 12. Self-taught from forums & books.',
        'Competitive Rubik\'s cuber — speed & blindfolded.',
        'Once solved a cube while riding a unicycle on stage.',
      ],
      details: {
        kind: 'Room',
        kv: [
          ['school', 'SUNY Albany — B.S. Computer Science'],
          ['club', 'ACM Student Chapter — President'],
          ['hobby', 'Speedcubing, unicycle, tinkering'],
          ['first build', 'A Runescape bot. Don\'t tell Jagex.'],
        ],
        body: 'The room is small, cluttered, and marked "do not clean." A Rubik\'s cube sits on every surface. A whiteboard lists sorting algorithms next to a grocery list. The door opens outward — you only leave this room once.',
      },
      callouts: [
        { x: 240, y: 420, letter: 'A', note: 'rubik\'s cube — 4.78s PB' },
        { x: 560, y: 640, letter: 'B', note: 'ACM president, 2012' },
      ],
    },
    {
      id: 'commercehub',
      key: '2',
      label: 'COMMERCEHUB',
      title: 'CommerceHub',
      sub: 'first job · 2013 – 2016',
      years: '2013 – 2016',
      dim: '3y',
      x: 900, y: 300, w: 560, h: 520,
      shape: 'rect',
      notes: [
        'First production deploy.',
        'First production outage. 2014. Never forgot.',
        'Learned: retail + logistics software at scale.',
      ],
      details: {
        kind: 'Room · Internship-to-FTE',
        kv: [
          ['role', 'Software Engineer'],
          ['stack', 'C#, .NET, SQL Server, XML (ugh)'],
          ['lesson', 'Logs are love. Logs are life.'],
          ['incident', '2014 — took down the order pipeline for ~17 min'],
        ],
        body: 'A fluorescent-lit office. Stickers of Integration diagrams on the wall. A server that you are not supposed to SSH into has a sticky note on it that says "DO NOT SSH INTO."',
      },
      callouts: [
        { x: 1080, y: 460, letter: 'C', note: 'prod outage, 2014' },
      ],
    },
    {
      id: 'youni',
      key: '3',
      label: 'YOUNI',
      title: 'Youni',
      sub: 'startup #0 · 2015 – 2016',
      years: '2015 – 2016',
      dim: '~1y',
      x: 1540, y: 300, w: 340, h: 260,
      shape: 'dashed',
      notes: [
        'Small room, dashed outline.',
        'Failed experiment — graceful close.',
        'Learned more in 12 months than most years.',
      ],
      details: {
        kind: 'Room · Failed Experiment',
        kv: [
          ['type', 'College social network startup'],
          ['outcome', 'Didn\'t work out. Shut down cleanly.'],
          ['lesson', 'Distribution eats product for breakfast.'],
          ['upside', 'Met people. Made things. Shipped fast.'],
        ],
        body: 'Dashed walls mean the room was never permanent. You can still walk through it — a small room with a loud whiteboard. Jake keeps a polaroid of the final commit on the back wall.',
      },
      callouts: [
        { x: 1710, y: 430, letter: 'D', note: 'dashed = sunset cleanly' },
      ],
    },
    {
      id: 'oscar',
      key: '4',
      label: 'OSCAR HEALTH',
      title: 'Oscar Health',
      sub: 'the long stay · 2017 – 2021',
      years: '2017 – 2021',
      dim: '4y 6m',
      x: 1540, y: 640, w: 900, h: 740,
      shape: 'rect',
      notes: [
        'Largest room — longest tenure.',
        'Tech + health insurance. Big systems. Real stakes.',
        'Grew from IC to senior. Many mentors.',
      ],
      details: {
        kind: 'Room · Longest Tenure',
        kv: [
          ['role', 'Software Engineer → Senior'],
          ['stack', 'Python, Go, React, K8s, the usual giant ones'],
          ['domain', 'Claims, member experience, internal tooling'],
          ['lesson', 'Healthcare complexity is a feature, not a bug — respect it.'],
        ],
        body: 'The atrium. Tall ceilings. You can still see the outline of where the old whiteboard used to be, scrubbed but not gone. A post-it that says "good enough to ship" is still stuck to the east wall.',
      },
      callouts: [
        { x: 1720, y: 820, letter: 'E', note: 'longest tenure — 4y 6m' },
        { x: 2280, y: 1150, letter: 'F', note: 'grew IC → senior' },
      ],
    },
    {
      id: 'stockunlock',
      key: '5',
      label: 'STOCK UNLOCK',
      title: 'Stock Unlock',
      sub: 'YC W22 · 2021 → now (side)',
      years: '2021 – present',
      dim: 'Hex · YC W22',
      x: 2560, y: 760, w: 900, h: 700,
      shape: 'hex',
      notes: [
        'Y Combinator W22. $1.335M seed.',
        '~8 employees at peak. Thousands of customers.',
        'Profitable. Still runs. Not full-time anymore.',
      ],
      details: {
        kind: 'Room · Hexagonal — built it, scaled it',
        kv: [
          ['company', 'Stock Unlock'],
          ['batch', 'Y Combinator W22'],
          ['seed', '$1.335M'],
          ['team', '~8 employees at peak'],
          ['customers', 'thousands, paying'],
          ['status', 'profitable side business · not full-time · next chapter'],
          ['thesis', 'retail investors deserve not to be ripped off'],
        ],
        body: 'The hexagonal room that pushes out of the main floorplan. Ventilated differently — built to be autonomous. Runs profitably without daily presence. A small plaque on the door reads: "Built it. Scaled it. Next chapter."',
      },
      callouts: [
        { x: 2740, y: 900, letter: 'G', note: 'YC W22 · $1.335M seed' },
        { x: 3220, y: 1240, letter: 'H', note: 'profitable · 8 ppl peak' },
      ],
    },
    {
      id: 'next',
      key: '6',
      label: 'NEXT CHAPTER',
      title: 'Next Chapter',
      sub: 'doorway → open',
      years: '2026 — ?',
      dim: 'open',
      x: 3520, y: 1180, w: 360, h: 280,
      shape: 'doorway',
      notes: [
        'Doorway out of the building.',
        'Getting married. Based in NYC.',
        'Open to: founding team · principal eng · research · weird stuff.',
      ],
      details: {
        kind: 'Doorway — leading off-plan',
        kv: [
          ['location', 'NYC area'],
          ['status', 'getting married'],
          ['looking for', 'founding team · principal eng · research · the weird stuff'],
          ['email', 'jake@stockunlock.com'],
          ['not interested in', 'overcharging for shit software that rips off retail investors'],
        ],
        body: 'The floorplan ends in a doorway. Beyond it: not drafted yet. The contractor (me) is accepting bids.',
      },
      callouts: [
        { x: 3700, y: 1320, letter: 'I', note: 'jake@stockunlock.com' },
      ],
    },
  ];

  // ---------- Build SVG plan ----------
  const svgNS = 'http://www.w3.org/2000/svg';
  const plan = document.getElementById('plan');

  function el(tag, attrs, children) {
    const e = document.createElementNS(svgNS, tag);
    if (attrs) for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (children) children.forEach((c) => e.appendChild(c));
    return e;
  }
  function text(tag, attrs, str) {
    const e = el(tag, attrs);
    e.textContent = str;
    return e;
  }

  // Defs: hatch pattern + arrowhead
  const defs = el('defs');
  const hatch = el('pattern', { id: 'hatchPattern', width: 8, height: 8, patternUnits: 'userSpaceOnUse', patternTransform: 'rotate(45)' });
  hatch.appendChild(el('line', { x1: 0, y1: 0, x2: 0, y2: 8, stroke: '#9ed7ff', 'stroke-width': 0.6, opacity: 0.35 }));
  defs.appendChild(hatch);

  const arrowMarker = el('marker', { id: 'arrow', viewBox: '0 0 10 10', refX: 8, refY: 5, markerWidth: 6, markerHeight: 6, orient: 'auto-start-reverse' });
  arrowMarker.appendChild(el('path', { d: 'M 0 0 L 10 5 L 0 10 z', fill: '#ffd166' }));
  defs.appendChild(arrowMarker);

  plan.appendChild(defs);

  // Background rect
  plan.appendChild(el('rect', { x: 0, y: 0, width: PLAN_W, height: PLAN_H, fill: '#0b2546' }));

  // ---------- Grid ----------
  const gridGroup = el('g', { class: 'grid' });
  for (let x = 0; x <= PLAN_W; x += 40) {
    gridGroup.appendChild(el('line', { x1: x, y1: 0, x2: x, y2: PLAN_H, class: x % 200 === 0 ? 'grid-major' : 'grid-minor' }));
  }
  for (let y = 0; y <= PLAN_H; y += 40) {
    gridGroup.appendChild(el('line', { x1: 0, y1: y, x2: PLAN_W, y2: y, class: y % 200 === 0 ? 'grid-major' : 'grid-minor' }));
  }
  plan.appendChild(gridGroup);

  // North arrow + scale bar (drafting marks)
  const northG = el('g', { transform: 'translate(3820, 160)' });
  northG.appendChild(el('circle', { cx: 0, cy: 0, r: 36, fill: 'none', stroke: '#9ed7ff', 'stroke-width': 1 }));
  northG.appendChild(el('path', { d: 'M 0 -28 L 8 14 L 0 6 L -8 14 Z', fill: '#9ed7ff', stroke: '#9ed7ff' }));
  northG.appendChild(text('text', { x: 0, y: -42, 'text-anchor': 'middle', class: 'north' }, 'N'));
  plan.appendChild(northG);

  // Scale bar
  const scaleG = el('g', { transform: 'translate(160, 2440)' });
  for (let i = 0; i < 5; i++) {
    scaleG.appendChild(el('rect', { x: i * 40, y: 0, width: 40, height: 10, fill: i % 2 === 0 ? '#9ed7ff' : 'none', stroke: '#9ed7ff', 'stroke-width': 0.8 }));
    scaleG.appendChild(text('text', { x: i * 40, y: 28, class: 'north' }, (i * 10) + 'u'));
  }
  scaleG.appendChild(text('text', { x: 200, y: 28, class: 'north' }, '50u'));
  plan.appendChild(scaleG);

  // Title block (outer drawing frame + title) in bottom right of plan
  const frame = el('rect', { x: 60, y: 60, width: PLAN_W - 120, height: PLAN_H - 120, fill: 'none', stroke: '#9ed7ff', 'stroke-width': 1.2, 'stroke-dasharray': '2 4' });
  plan.appendChild(frame);

  // Big plan title
  const titleG = el('g', { transform: 'translate(160, 220)' });
  titleG.appendChild(text('text', { x: 0, y: 0, class: 'room-title' }, 'RUTH, J. — CAREER FLOORPLAN'));
  titleG.appendChild(text('text', { x: 0, y: 28, class: 'room-sub' }, 'drawing bp-001  ·  rev. 04.26  ·  sheet 1 of 1'));
  plan.appendChild(titleG);

  // Subtitle bottom
  const subtitleG = el('g', { transform: 'translate(2400, 2480)' });
  subtitleG.appendChild(text('text', { x: 0, y: 0, class: 'room-sub' }, 'not to scale  ·  see legend for symbols  ·  contact: jake@stockunlock.com'));
  plan.appendChild(subtitleG);

  // ---------- Rooms ----------
  const roomsGroup = el('g', { id: 'rooms' });

  rooms.forEach((r) => {
    const g = el('g', { class: 'room', 'data-id': r.id });
    g.addEventListener('click', (e) => { e.stopPropagation(); openDetail(r); });

    // Shape
    if (r.shape === 'hex') {
      // hexagonal room (irregular — a 6-sided pointed plan)
      const cx = r.x, cy = r.y, w = r.w, h = r.h;
      const pts = [
        [cx + 120, cy],
        [cx + w - 120, cy],
        [cx + w, cy + h / 2],
        [cx + w - 120, cy + h],
        [cx + 120, cy + h],
        [cx, cy + h / 2],
      ].map(p => p.join(',')).join(' ');
      g.appendChild(el('polygon', { points: pts, class: 'wall-hex' }));
    } else if (r.shape === 'dashed') {
      g.appendChild(el('rect', { x: r.x, y: r.y, width: r.w, height: r.h, class: 'wall-dashed' }));
    } else if (r.shape === 'doorway') {
      // A doorway: open on the right side
      const dw = r.w, dh = r.h;
      const path = `M ${r.x} ${r.y} L ${r.x + dw} ${r.y} M ${r.x + dw} ${r.y} L ${r.x + dw} ${r.y + dh * 0.3} M ${r.x + dw} ${r.y + dh * 0.7} L ${r.x + dw} ${r.y + dh} L ${r.x} ${r.y + dh} L ${r.x} ${r.y} Z`;
      g.appendChild(el('path', { d: `M ${r.x} ${r.y} L ${r.x + dw} ${r.y} L ${r.x + dw} ${r.y + dh * 0.3}`, class: 'wall', fill: 'none' }));
      g.appendChild(el('path', { d: `M ${r.x + dw} ${r.y + dh * 0.7} L ${r.x + dw} ${r.y + dh} L ${r.x} ${r.y + dh} L ${r.x} ${r.y} Z`, class: 'wall', fill: 'rgba(255,209,102,0.05)' }));
      // door swing arc
      const arcR = dh * 0.4;
      g.appendChild(el('path', { d: `M ${r.x + dw} ${r.y + dh * 0.3} A ${arcR} ${arcR} 0 0 1 ${r.x + dw + arcR} ${r.y + dh * 0.3 + arcR}`, class: 'doorway' }));
      // arrow out
      g.appendChild(el('line', { x1: r.x + dw + 20, y1: r.y + dh / 2, x2: r.x + dw + 140, y2: r.y + dh / 2, class: 'annotation-line', 'marker-end': 'url(#arrow)' }));
      g.appendChild(text('text', { x: r.x + dw + 30, y: r.y + dh / 2 - 10, class: 'annotation' }, '→ off-plan'));
    } else {
      g.appendChild(el('rect', { x: r.x, y: r.y, width: r.w, height: r.h, class: 'wall' }));
    }

    // Room labels (centered-ish inside)
    const tx = r.x + 30;
    const ty = r.y + 60;
    g.appendChild(text('text', { x: tx, y: ty, class: 'room-title' }, r.title.toUpperCase()));
    g.appendChild(text('text', { x: tx, y: ty + 26, class: 'room-sub' }, r.sub));

    // bullet body (mini notes)
    r.notes.forEach((n, i) => {
      g.appendChild(text('text', { x: tx, y: ty + 70 + i * 22, class: 'room-body' + (i > 0 ? ' dim' : '') }, '· ' + n));
    });

    // Furniture / schematic details per room
    addFurniture(g, r);

    // Callouts
    (r.callouts || []).forEach((c) => {
      const cg = el('g');
      cg.appendChild(el('circle', { cx: c.x, cy: c.y, r: 14, class: 'callout-circ' }));
      cg.appendChild(text('text', { x: c.x, y: c.y, class: 'callout-letter' }, c.letter));
      // leader line to a note to the right
      const noteX = c.x + 36;
      const noteY = c.y + 4;
      cg.appendChild(el('line', { x1: c.x + 14, y1: c.y, x2: noteX - 4, y2: c.y, class: 'annotation-line' }));
      cg.appendChild(text('text', { x: noteX, y: noteY, class: 'annotation' }, c.note));
      g.appendChild(cg);
    });

    // Dimension line along bottom
    addDimensionLine(g, r);

    roomsGroup.appendChild(g);
  });

  // Connectors between rooms (showing sequence)
  const connectors = [
    ['origin', 'commercehub'],
    ['commercehub', 'youni'],
    ['commercehub', 'oscar'],
    ['oscar', 'stockunlock'],
    ['stockunlock', 'next'],
  ];
  const connG = el('g', { id: 'connectors' });
  connectors.forEach(([a, b]) => {
    const ra = rooms.find(r => r.id === a);
    const rb = rooms.find(r => r.id === b);
    if (!ra || !rb) return;
    const ax = ra.x + ra.w / 2;
    const ay = ra.y + ra.h / 2;
    const bx = rb.x + rb.w / 2;
    const by = rb.y + rb.h / 2;
    connG.appendChild(el('line', {
      x1: ax, y1: ay, x2: bx, y2: by,
      stroke: 'rgba(158,215,255,0.18)', 'stroke-width': 1, 'stroke-dasharray': '3 5',
    }));
  });
  plan.appendChild(connG);
  plan.appendChild(roomsGroup);

  // Overall "building" outer outline (hatched)
  const bldg = el('path', {
    d: `M 100 260 L 2480 260 L 2480 600 L 3480 600 L 3480 1520 L 2480 1520 L 2480 1420 L 100 1420 Z`,
    fill: 'none', stroke: '#9ed7ff', 'stroke-width': 1, 'stroke-dasharray': '1 3', opacity: 0.35,
  });
  plan.insertBefore(bldg, roomsGroup);

  // Top-level annotation: a measurement line across the top
  const topDimG = el('g');
  topDimG.appendChild(el('line', { x1: 140, y1: 240, x2: 3480, y2: 240, class: 'dim' }));
  topDimG.appendChild(el('line', { x1: 140, y1: 232, x2: 140, y2: 248, class: 'dim-tick' }));
  topDimG.appendChild(el('line', { x1: 3480, y1: 232, x2: 3480, y2: 248, class: 'dim-tick' }));
  topDimG.appendChild(text('text', { x: 1800, y: 232, 'text-anchor': 'middle', class: 'dim-text' }, '~13 years coding  ·  overall span'));
  plan.appendChild(topDimG);

  // Side notes (engineer's marginalia)
  const margin = el('g');
  [
    { x: 160, y: 1600, txt: 'NOTE 01 — drawing reflects career path as of 2026-04-20.' },
    { x: 160, y: 1624, txt: 'NOTE 02 — "failed experiment" (Youni) drawn w/ dashed wall per legend.' },
    { x: 160, y: 1648, txt: 'NOTE 03 — Stock Unlock drawn hexagonal — self-ventilating, profitable, not daily-operated.' },
    { x: 160, y: 1672, txt: 'NOTE 04 — NEXT CHAPTER shown as doorway; not yet drafted.' },
    { x: 160, y: 1696, txt: 'NOTE 05 — hates: overcharging for shit software that rips off retail investors.' },
    { x: 160, y: 1720, txt: 'NOTE 06 — contact for scope-of-work: jake@stockunlock.com' },
  ].forEach(n => margin.appendChild(text('text', { x: n.x, y: n.y, class: 'annotation' }, n.txt)));
  plan.appendChild(margin);

  // ---------- Furniture generators ----------
  function addFurniture(g, r) {
    const bx = r.x, by = r.y, bw = r.w, bh = r.h;
    if (r.id === 'origin') {
      // rubik's cube schematic (grid)
      const cx = bx + bw - 170, cy = by + bh - 170;
      for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) {
        g.appendChild(el('rect', { x: cx + i * 32, y: cy + j * 32, width: 30, height: 30, class: 'furn-fill' }));
      }
      g.appendChild(text('text', { x: cx, y: cy - 8, class: 'room-body dim' }, 'RUBIK\'S 3x3 · spec'));
      // unicycle wheel
      g.appendChild(el('circle', { cx: bx + bw - 260, cy: by + bh - 100, r: 36, class: 'furn' }));
      g.appendChild(el('circle', { cx: bx + bw - 260, cy: by + bh - 100, r: 3, class: 'furn-fill' }));
    }
    if (r.id === 'commercehub') {
      // server rack
      const sx = bx + bw - 160, sy = by + bh - 220;
      g.appendChild(el('rect', { x: sx, y: sy, width: 120, height: 180, class: 'furn-fill' }));
      for (let i = 0; i < 6; i++) {
        g.appendChild(el('rect', { x: sx + 8, y: sy + 12 + i * 28, width: 104, height: 18, class: 'furn' }));
        g.appendChild(el('circle', { cx: sx + 100, cy: sy + 21 + i * 28, r: 2, class: 'furn-fill' }));
      }
      g.appendChild(text('text', { x: sx, y: sy - 8, class: 'room-body dim' }, 'SERVER RACK · do not SSH'));
    }
    if (r.id === 'youni') {
      // whiteboard
      const wx = bx + 20, wy = by + bh - 70;
      g.appendChild(el('rect', { x: wx, y: wy, width: bw - 40, height: 50, class: 'furn' }));
      g.appendChild(text('text', { x: wx + 10, y: wy + 32, class: 'room-body dim' }, 'whiteboard · "ship it" scrawled ·'));
    }
    if (r.id === 'oscar') {
      // desks arranged
      for (let i = 0; i < 4; i++) for (let j = 0; j < 2; j++) {
        const dx = bx + 80 + i * 180;
        const dy = by + bh - 240 + j * 110;
        g.appendChild(el('rect', { x: dx, y: dy, width: 140, height: 70, class: 'furn-fill' }));
        g.appendChild(el('circle', { cx: dx + 70, cy: dy + 90, r: 14, class: 'furn' }));
      }
      g.appendChild(text('text', { x: bx + 80, y: by + bh - 250, class: 'room-body dim' }, 'DESKS · open plan · healthcare scale'));
    }
    if (r.id === 'stockunlock') {
      // dashboard schematic
      const dx = r.x + 80, dy = r.y + r.h - 260;
      g.appendChild(el('rect', { x: dx, y: dy, width: r.w - 160, height: 180, class: 'furn-fill' }));
      // fake chart
      const pts = [];
      for (let i = 0; i < 20; i++) {
        const px = dx + 20 + i * ((r.w - 200) / 20);
        const py = dy + 140 - (Math.sin(i * 0.5) * 30 + i * 4);
        pts.push(`${px},${py}`);
      }
      g.appendChild(el('polyline', { points: pts.join(' '), fill: 'none', stroke: '#67e8d1', 'stroke-width': 1.5 }));
      // tick axis
      g.appendChild(el('line', { x1: dx + 20, y1: dy + 160, x2: dx + r.w - 180, y2: dy + 160, stroke: '#67e8d1', 'stroke-width': 0.6 }));
      g.appendChild(text('text', { x: dx, y: dy - 8, class: 'room-body dim' }, 'DASHBOARD · users over time → profitable'));
      // key stats
      const stats = [
        ['YC', 'W22'],
        ['SEED', '$1.335M'],
        ['PEAK TEAM', '~8'],
        ['CUSTOMERS', 'thousands'],
        ['STATUS', 'profitable · side'],
      ];
      stats.forEach((s, i) => {
        const tx = r.x + 80 + i * 160;
        const ty = r.y + 240;
        g.appendChild(el('rect', { x: tx, y: ty, width: 140, height: 54, fill: 'none', stroke: '#67e8d1', 'stroke-width': 0.8 }));
        g.appendChild(text('text', { x: tx + 8, y: ty + 18, class: 'room-sub' }, s[0]));
        g.appendChild(text('text', { x: tx + 8, y: ty + 42, class: 'room-body' }, s[1]));
      });
    }
    if (r.id === 'next') {
      g.appendChild(text('text', { x: r.x + 30, y: r.y + r.h - 50, class: 'annotation' }, '(area not yet drafted)'));
      g.appendChild(text('text', { x: r.x + 30, y: r.y + r.h - 28, class: 'annotation' }, 'accepting bids →'));
    }
  }

  function addDimensionLine(g, r) {
    // Below the room
    const y = r.y + r.h + 40;
    g.appendChild(el('line', { x1: r.x, y1: y, x2: r.x + r.w, y2: y, class: 'dim' }));
    g.appendChild(el('line', { x1: r.x, y1: y - 6, x2: r.x, y2: y + 6, class: 'dim-tick' }));
    g.appendChild(el('line', { x1: r.x + r.w, y1: y - 6, x2: r.x + r.w, y2: y + 6, class: 'dim-tick' }));
    g.appendChild(text('text', { x: r.x + r.w / 2, y: y - 8, 'text-anchor': 'middle', class: 'dim-text' }, r.dim + '  ·  ' + r.years));
  }

  // ---------- Pan & zoom state ----------
  const viewport = document.getElementById('viewport');
  const canvas = document.getElementById('canvas');

  const state = {
    x: 0,
    y: 0,
    scale: 1,
    minScale: 0.15,
    maxScale: 3,
  };

  function applyTransform() {
    canvas.style.transform = `translate(${state.x}px, ${state.y}px) scale(${state.scale})`;
    document.getElementById('scaleReadout').textContent = `1 : ${state.scale.toFixed(2)}`;
    updateMinimap();
  }

  function fitToScreen(padding) {
    const vw = viewport.clientWidth;
    const vh = viewport.clientHeight;
    const pad = padding || 40;
    const scale = Math.min((vw - pad * 2) / PLAN_W, (vh - pad * 2) / PLAN_H);
    state.scale = Math.max(state.minScale, Math.min(state.maxScale, scale));
    state.x = (vw - PLAN_W * state.scale) / 2;
    state.y = (vh - PLAN_H * state.scale) / 2;
    applyTransform();
  }

  // Smooth zoom toward a point (vx, vy) in viewport coordinates
  function zoomAt(vx, vy, factor) {
    const newScale = Math.max(state.minScale, Math.min(state.maxScale, state.scale * factor));
    const realFactor = newScale / state.scale;
    state.x = vx - (vx - state.x) * realFactor;
    state.y = vy - (vy - state.y) * realFactor;
    state.scale = newScale;
    applyTransform();
  }

  // Smooth camera focus on a point (plan coords)
  function focusOn(px, py, targetScale) {
    const vw = viewport.clientWidth;
    const vh = viewport.clientHeight;
    const target = {
      scale: targetScale != null ? Math.max(state.minScale, Math.min(state.maxScale, targetScale)) : state.scale,
    };
    target.x = vw / 2 - px * target.scale;
    target.y = vh / 2 - py * target.scale;
    animateTo(target, 500);
  }

  let anim = null;
  function animateTo(target, duration) {
    if (anim) cancelAnimationFrame(anim);
    const start = { x: state.x, y: state.y, scale: state.scale };
    const t0 = performance.now();
    function step(t) {
      const p = Math.min(1, (t - t0) / duration);
      const ease = 1 - Math.pow(1 - p, 3);
      state.x = start.x + (target.x - start.x) * ease;
      state.y = start.y + (target.y - start.y) * ease;
      state.scale = start.scale + (target.scale - start.scale) * ease;
      applyTransform();
      if (p < 1) anim = requestAnimationFrame(step);
      else anim = null;
    }
    anim = requestAnimationFrame(step);
  }

  // ---------- Mouse pan ----------
  let dragging = false;
  let dragStart = null;
  viewport.addEventListener('mousedown', (e) => {
    if (e.button !== 0) return;
    // Clicks on a room bubble up; allow room click to open detail. If shift-pressed, force pan.
    dragging = true;
    dragStart = { x: e.clientX - state.x, y: e.clientY - state.y, moved: false };
    viewport.style.cursor = 'grabbing';
  });
  window.addEventListener('mousemove', (e) => {
    if (!dragging) {
      updateCoords(e);
      return;
    }
    state.x = e.clientX - dragStart.x;
    state.y = e.clientY - dragStart.y;
    dragStart.moved = Math.abs(e.clientX - (dragStart.x + state.x)) > 0;
    applyTransform();
    updateCoords(e);
  });
  window.addEventListener('mouseup', () => {
    dragging = false;
    viewport.style.cursor = '';
  });

  function updateCoords(e) {
    const rect = viewport.getBoundingClientRect();
    const vx = e.clientX - rect.left;
    const vy = e.clientY - rect.top;
    const px = (vx - state.x) / state.scale;
    const py = (vy - state.y) / state.scale;
    document.getElementById('coords').textContent = `x: ${px.toFixed(0)}  y: ${py.toFixed(0)}  ·  zoom ${state.scale.toFixed(2)}x`;
  }

  // ---------- Wheel zoom / trackpad ----------
  viewport.addEventListener('wheel', (e) => {
    e.preventDefault();
    const rect = viewport.getBoundingClientRect();
    const vx = e.clientX - rect.left;
    const vy = e.clientY - rect.top;
    if (e.ctrlKey || Math.abs(e.deltaY) > Math.abs(e.deltaX) * 2) {
      // zoom
      const factor = Math.exp(-e.deltaY * 0.0015);
      zoomAt(vx, vy, factor);
    } else {
      // two-finger pan
      state.x -= e.deltaX;
      state.y -= e.deltaY;
      applyTransform();
    }
  }, { passive: false });

  // ---------- Touch: pinch zoom + pan ----------
  let touch = null;
  viewport.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) {
      touch = { mode: 'pan', x: e.touches[0].clientX - state.x, y: e.touches[0].clientY - state.y };
    } else if (e.touches.length === 2) {
      const [t1, t2] = e.touches;
      const dx = t2.clientX - t1.clientX;
      const dy = t2.clientY - t1.clientY;
      touch = {
        mode: 'pinch',
        startDist: Math.hypot(dx, dy),
        startScale: state.scale,
        cx: (t1.clientX + t2.clientX) / 2,
        cy: (t1.clientY + t2.clientY) / 2,
        startX: state.x,
        startY: state.y,
      };
    }
  }, { passive: true });
  viewport.addEventListener('touchmove', (e) => {
    if (!touch) return;
    if (touch.mode === 'pan' && e.touches.length === 1) {
      state.x = e.touches[0].clientX - touch.x;
      state.y = e.touches[0].clientY - touch.y;
      applyTransform();
    } else if (touch.mode === 'pinch' && e.touches.length === 2) {
      const [t1, t2] = e.touches;
      const dx = t2.clientX - t1.clientX;
      const dy = t2.clientY - t1.clientY;
      const dist = Math.hypot(dx, dy);
      const factor = dist / touch.startDist;
      const newScale = Math.max(state.minScale, Math.min(state.maxScale, touch.startScale * factor));
      const rect = viewport.getBoundingClientRect();
      const vx = touch.cx - rect.left;
      const vy = touch.cy - rect.top;
      const realFactor = newScale / state.scale;
      state.x = vx - (vx - state.x) * realFactor;
      state.y = vy - (vy - state.y) * realFactor;
      state.scale = newScale;
      applyTransform();
    }
    e.preventDefault();
  }, { passive: false });
  viewport.addEventListener('touchend', () => { touch = null; });

  // ---------- Keyboard ----------
  window.addEventListener('keydown', (e) => {
    if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
    const step = 80;
    const vw = viewport.clientWidth;
    const vh = viewport.clientHeight;
    switch (e.key) {
      case 'ArrowUp': state.y += step; applyTransform(); break;
      case 'ArrowDown': state.y -= step; applyTransform(); break;
      case 'ArrowLeft': state.x += step; applyTransform(); break;
      case 'ArrowRight': state.x -= step; applyTransform(); break;
      case '+': case '=': zoomAt(vw / 2, vh / 2, 1.2); break;
      case '-': case '_': zoomAt(vw / 2, vh / 2, 1 / 1.2); break;
      case '0': fitToScreen(); break;
      case 'Escape': closeDetail(); break;
      default:
        // Number keys focus on rooms
        const r = rooms.find(rr => rr.key === e.key);
        if (r) {
          const cx = r.x + r.w / 2;
          const cy = r.y + r.h / 2;
          focusOn(cx, cy, 1.1);
        }
    }
  });

  // ---------- Minimap ----------
  const minimap = document.getElementById('minimap');
  const MM_W = 240, MM_H = 160;
  const mmScaleX = MM_W / PLAN_W;
  const mmScaleY = MM_H / PLAN_H;

  // Static minimap content
  const mmBg = document.createElementNS(svgNS, 'rect');
  mmBg.setAttribute('x', 0); mmBg.setAttribute('y', 0);
  mmBg.setAttribute('width', MM_W); mmBg.setAttribute('height', MM_H);
  mmBg.setAttribute('fill', 'rgba(8,26,51,0.5)');
  minimap.appendChild(mmBg);

  // grid in minimap
  for (let x = 0; x <= PLAN_W; x += 400) {
    const l = document.createElementNS(svgNS, 'line');
    l.setAttribute('x1', x * mmScaleX); l.setAttribute('y1', 0);
    l.setAttribute('x2', x * mmScaleX); l.setAttribute('y2', MM_H);
    l.setAttribute('stroke', 'rgba(158,215,255,0.08)');
    l.setAttribute('stroke-width', 0.4);
    minimap.appendChild(l);
  }
  for (let y = 0; y <= PLAN_H; y += 400) {
    const l = document.createElementNS(svgNS, 'line');
    l.setAttribute('x1', 0); l.setAttribute('y1', y * mmScaleY);
    l.setAttribute('x2', MM_W); l.setAttribute('y2', y * mmScaleY);
    l.setAttribute('stroke', 'rgba(158,215,255,0.08)');
    l.setAttribute('stroke-width', 0.4);
    minimap.appendChild(l);
  }

  rooms.forEach((r) => {
    const rect = document.createElementNS(svgNS, 'rect');
    rect.setAttribute('x', r.x * mmScaleX);
    rect.setAttribute('y', r.y * mmScaleY);
    rect.setAttribute('width', r.w * mmScaleX);
    rect.setAttribute('height', r.h * mmScaleY);
    rect.setAttribute('class', 'mm-room' + (r.shape === 'hex' ? ' hex' : '') + (r.shape === 'dashed' ? ' dashed' : ''));
    rect.style.cursor = 'pointer';
    rect.addEventListener('click', () => focusOn(r.x + r.w / 2, r.y + r.h / 2, 1.1));
    minimap.appendChild(rect);

    const t = document.createElementNS(svgNS, 'text');
    t.setAttribute('x', r.x * mmScaleX + 2);
    t.setAttribute('y', r.y * mmScaleY + 8);
    t.textContent = r.label;
    minimap.appendChild(t);
  });

  // Viewport indicator
  const mmView = document.createElementNS(svgNS, 'rect');
  mmView.setAttribute('class', 'mm-view');
  minimap.appendChild(mmView);

  function updateMinimap() {
    const vw = viewport.clientWidth;
    const vh = viewport.clientHeight;
    const planVisX = (-state.x) / state.scale;
    const planVisY = (-state.y) / state.scale;
    const planVisW = vw / state.scale;
    const planVisH = vh / state.scale;
    mmView.setAttribute('x', Math.max(0, planVisX * mmScaleX));
    mmView.setAttribute('y', Math.max(0, planVisY * mmScaleY));
    mmView.setAttribute('width', Math.min(MM_W, planVisW * mmScaleX));
    mmView.setAttribute('height', Math.min(MM_H, planVisH * mmScaleY));
  }

  // click minimap to recenter
  minimap.addEventListener('click', (e) => {
    if (e.target.tagName === 'rect' && e.target.classList.contains('mm-room')) return;
    const rect = minimap.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const px = mx / mmScaleX / (rect.width / MM_W);
    const py = my / mmScaleY / (rect.height / MM_H);
    focusOn(px, py, state.scale);
  });

  // ---------- Detail overlay ----------
  const overlay = document.getElementById('detail-overlay');
  const detailCard = document.getElementById('detailCard');

  function openDetail(r) {
    const d = r.details || {};
    const kvHtml = (d.kv || []).map(([k, v]) => `<div class="kv"><span class="k">${k}</span><span class="v">${escapeHtml(v)}</span></div>`).join('');
    const notesHtml = r.notes.map(n => `<li>${escapeHtml(n)}</li>`).join('');
    detailCard.innerHTML = `
      <span class="corner c-tl"></span>
      <span class="corner c-tr"></span>
      <span class="corner c-bl"></span>
      <span class="corner c-br"></span>
      <button class="dc-close" aria-label="close">[ esc ] close</button>
      <div class="dc-sub">detail callout · ${escapeHtml(d.kind || 'Room')}</div>
      <h2>${escapeHtml(r.title)}</h2>
      <div class="dc-sub">${escapeHtml(r.sub)} · ${escapeHtml(r.years)}</div>
      <div class="dc-sep"></div>
      ${kvHtml}
      <div class="dc-sep"></div>
      <p>${escapeHtml(d.body || '')}</p>
      <ul>${notesHtml}</ul>
    `;
    overlay.classList.remove('hidden');
    detailCard.querySelector('.dc-close').addEventListener('click', closeDetail);
    // Also focus on that room behind the overlay
    focusOn(r.x + r.w / 2, r.y + r.h / 2, Math.max(0.7, state.scale));
  }
  function closeDetail() { overlay.classList.add('hidden'); }
  overlay.addEventListener('click', (e) => { if (e.target === overlay) closeDetail(); });

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  // ---------- Init ----------
  window.addEventListener('resize', () => applyTransform());
  fitToScreen(60);

  // Gentle intro: zoom in slightly to the plan title
  setTimeout(() => {
    focusOn(PLAN_W / 2, PLAN_H / 2 - 100, Math.min(state.maxScale, state.scale * 1.15));
  }, 350);

})();
