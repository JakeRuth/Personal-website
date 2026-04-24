// NeXTSTEP Workspace Manager — Jake Ruth
// Vanilla JS, no build. Three.js via CDN.

(function () {
  'use strict';

  // ---------- Clock ----------
  function updateClock() {
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    const day = now.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
    const dateEl = document.getElementById('clock-date');
    const timeEl = document.getElementById('clock-time');
    if (dateEl) dateEl.textContent = day;
    if (timeEl) timeEl.textContent = hh + ':' + mm;
  }
  updateClock();
  setInterval(updateClock, 30000);

  // ---------- Window focus + drag ----------
  let topZ = 20;
  function focusWindow(win) {
    topZ += 1;
    win.style.zIndex = topZ;
  }
  document.querySelectorAll('.next-window').forEach(w => {
    w.addEventListener('mousedown', () => focusWindow(w));
  });

  // Drag by titlebar
  document.querySelectorAll('.win-titlebar').forEach(bar => {
    let sx = 0, sy = 0, ox = 0, oy = 0, dragging = false;
    const win = bar.closest('.next-window');
    bar.addEventListener('mousedown', (e) => {
      if (e.target.classList.contains('win-close')) return;
      dragging = true;
      sx = e.clientX; sy = e.clientY;
      const rect = win.getBoundingClientRect();
      ox = rect.left; oy = rect.top;
      focusWindow(win);
      e.preventDefault();
    });
    document.addEventListener('mousemove', (e) => {
      if (!dragging) return;
      const nx = Math.max(0, Math.min(window.innerWidth - 120, ox + (e.clientX - sx)));
      const ny = Math.max(0, Math.min(window.innerHeight - 30, oy + (e.clientY - sy)));
      win.style.left = nx + 'px';
      win.style.top = ny + 'px';
    });
    document.addEventListener('mouseup', () => { dragging = false; });
  });

  // Close buttons
  document.querySelectorAll('.win-close').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const win = btn.closest('.next-window');
      if (win) win.classList.add('hidden');
      e.stopPropagation();
    });
  });

  // ---------- Column Browser ----------
  const columns = [
    document.querySelector('.column[data-col="0"]'),
    document.querySelector('.column[data-col="1"]'),
    document.querySelector('.column[data-col="2"]')
  ];
  const pathActive = document.getElementById('path-active');
  const statusText = document.getElementById('status-text');
  const inspectorTitle = document.getElementById('inspector-title');
  const inspectorBody = document.getElementById('inspector-body');
  const inspectorWin = document.getElementById('inspector');

  function renderColumn(colIndex, items, onSelect, selectedName) {
    const col = columns[colIndex];
    col.innerHTML = '';
    items.forEach(item => {
      const row = document.createElement('div');
      row.className = 'col-item' + (item.children ? '' : ' leaf');
      if (selectedName && item.name === selectedName) row.classList.add('selected');
      const iconText = item.icon || (item.children ? '▶' : '□');
      row.innerHTML =
        '<span class="col-icon">' + iconText + '</span>' +
        escapeHTML(item.name) +
        '<span class="col-arrow">&#9654;</span>';
      row.addEventListener('click', () => onSelect(item, row));
      col.appendChild(row);
    });
  }

  function clearColumn(colIndex) {
    columns[colIndex].innerHTML = '';
  }

  function openInspector(item) {
    if (!item.detail) return;
    inspectorTitle.textContent = 'Inspector — ' + item.name;
    inspectorBody.innerHTML = item.detail;
    inspectorWin.classList.remove('hidden');
    focusWindow(inspectorWin);
  }

  // Column 0: top-level
  const topLevel = FS_TREE.children;
  renderColumn(0, topLevel, (item, row) => {
    // select in column 0
    columns[0].querySelectorAll('.col-item').forEach(r => r.classList.remove('selected'));
    row.classList.add('selected');
    pathActive.textContent = item.name;
    clearColumn(2);
    if (item.children) {
      renderColumn(1, item.children, (child, childRow) => {
        columns[1].querySelectorAll('.col-item').forEach(r => r.classList.remove('selected'));
        childRow.classList.add('selected');
        if (child.children) {
          renderColumn(2, child.children, (leaf, leafRow) => {
            columns[2].querySelectorAll('.col-item').forEach(r => r.classList.remove('selected'));
            leafRow.classList.add('selected');
            openInspector(leaf);
          });
          statusText.textContent = child.children.length + ' items';
        } else {
          clearColumn(2);
          openInspector(child);
          statusText.textContent = '1 item — ' + child.name;
        }
      });
      statusText.textContent = item.children.length + ' items';
    } else {
      clearColumn(1);
      clearColumn(2);
      openInspector(item);
    }
  });

  // Auto-select "About" -> "Profile.txt" on load for a better first impression
  setTimeout(() => {
    const firstRow = columns[0].querySelector('.col-item');
    if (firstRow) firstRow.click();
    setTimeout(() => {
      const secondRow = columns[1].querySelector('.col-item');
      if (secondRow) secondRow.click();
    }, 50);
  }, 50);

  statusText.textContent = topLevel.length + ' items';

  // ---------- Dock ----------
  document.querySelectorAll('.dock-icon').forEach(icon => {
    icon.addEventListener('click', () => {
      const app = icon.dataset.app;
      openApp(app);
    });
  });

  function openApp(app) {
    switch (app) {
      case 'cube':
        openWindow('cube-window');
        initCube();
        break;
      case 'mail':
        openWindow('mail-window');
        break;
      case 'resume':
        openWindow('resume-window');
        break;
      case 'librarian':
        openWindow('librarian-window');
        renderGraph();
        break;
      case 'career':
        openWindow('fileviewer');
        selectTopByName('Career');
        break;
      case 'stockunlock':
        openWindow('fileviewer');
        selectTopByName('Stock Unlock');
        break;
      case 'contact':
        openWindow('fileviewer');
        selectTopByName('Contact');
        break;
      case 'next-logo':
        openAboutNext();
        break;
    }
  }

  function openWindow(id) {
    const w = document.getElementById(id);
    if (!w) return;
    w.classList.remove('hidden');
    focusWindow(w);
  }

  function selectTopByName(name) {
    const rows = columns[0].querySelectorAll('.col-item');
    rows.forEach(r => {
      if (r.textContent.trim().replace(/▶.*$/, '').replace(/^[^A-Za-z$]+/, '').trim().startsWith(name) ||
          r.innerText.includes(name)) {
        r.click();
      }
    });
  }

  function openAboutNext() {
    inspectorTitle.textContent = 'Info — NEXTSTEP';
    inspectorBody.innerHTML = `
      <h1>NEXTSTEP</h1>
      <div class="ins-subtitle">Object-oriented, multitasking operating system. 1989&ndash;1996.</div>
      <p>Developed by NeXT Computer under Steve Jobs after he left Apple. Display PostScript, Objective-C, Interface Builder. The direct ancestor of macOS.</p>
      <p>This site is a tribute. Helvetica. Black workspace. Chrome bevels. Column-view browser. Vertical dock. The anti-warm-nostalgia retro.</p>
      <div class="pull-quote">"The computer for the rest of us" &mdash; but austere, for the people who were paying attention.</div>
      <div class="meta-tag">Helvetica</div>
      <div class="meta-tag">Display PostScript</div>
      <div class="meta-tag">Objective-C</div>
      <div class="meta-tag">NeXTcube</div>
    `;
    inspectorWin.classList.remove('hidden');
    focusWindow(inspectorWin);
  }

  // ---------- Digital Librarian graph ----------
  const graphSvg = document.getElementById('graph-svg');
  let graphBuilt = false;

  function renderGraph() {
    if (graphBuilt) return;
    graphBuilt = true;
    const cx = 240, cy = 230;

    // Concentric rings
    LIB_GRAPH.rings.forEach(ring => {
      const r = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      r.setAttribute('cx', cx);
      r.setAttribute('cy', cy);
      r.setAttribute('r', ring.radius);
      r.setAttribute('class', 'graph-ring');
      graphSvg.appendChild(r);
    });

    // Edges from center to ring1, and between ring1 and ring2
    function addEdge(x1, y1, x2, y2) {
      const l = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      l.setAttribute('x1', x1); l.setAttribute('y1', y1);
      l.setAttribute('x2', x2); l.setAttribute('y2', y2);
      l.setAttribute('class', 'graph-edge');
      graphSvg.appendChild(l);
    }

    const ring1Positions = [];
    LIB_GRAPH.rings[0].nodes.forEach((n, i) => {
      const angle = (i / LIB_GRAPH.rings[0].nodes.length) * Math.PI * 2 - Math.PI / 2;
      const x = cx + Math.cos(angle) * LIB_GRAPH.rings[0].radius;
      const y = cy + Math.sin(angle) * LIB_GRAPH.rings[0].radius;
      ring1Positions.push({ x, y, node: n });
      addEdge(cx, cy, x, y);
    });

    const ring2Positions = [];
    LIB_GRAPH.rings[1].nodes.forEach((n, i) => {
      const angle = (i / LIB_GRAPH.rings[1].nodes.length) * Math.PI * 2 - Math.PI / 2 + 0.2;
      const x = cx + Math.cos(angle) * LIB_GRAPH.rings[1].radius;
      const y = cy + Math.sin(angle) * LIB_GRAPH.rings[1].radius;
      ring2Positions.push({ x, y, node: n });
      // connect to nearest ring1
      let nearest = ring1Positions[0]; let bestD = Infinity;
      ring1Positions.forEach(p => {
        const d = (p.x - x) * (p.x - x) + (p.y - y) * (p.y - y);
        if (d < bestD) { bestD = d; nearest = p; }
      });
      addEdge(nearest.x, nearest.y, x, y);
    });

    const ring3Positions = [];
    LIB_GRAPH.rings[2].nodes.forEach((n, i) => {
      const angle = (i / LIB_GRAPH.rings[2].nodes.length) * Math.PI * 2 - Math.PI / 2 - 0.15;
      const x = cx + Math.cos(angle) * LIB_GRAPH.rings[2].radius;
      const y = cy + Math.sin(angle) * LIB_GRAPH.rings[2].radius;
      ring3Positions.push({ x, y, node: n });
      let nearest = ring2Positions[0]; let bestD = Infinity;
      ring2Positions.forEach(p => {
        const d = (p.x - x) * (p.x - x) + (p.y - y) * (p.y - y);
        if (d < bestD) { bestD = d; nearest = p; }
      });
      addEdge(nearest.x, nearest.y, x, y);
    });

    // Center node
    addNode(cx, cy, LIB_GRAPH.center, 18, '#fff');

    ring1Positions.forEach(p => addNode(p.x, p.y, p.node, 10, p.node.color));
    ring2Positions.forEach(p => addNode(p.x, p.y, p.node, 8, p.node.color));
    ring3Positions.forEach(p => addNode(p.x, p.y, p.node, 6, p.node.color));
  }

  function addNode(x, y, nodeData, radius, color) {
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('class', 'graph-node');
    g.setAttribute('transform', 'translate(' + x + ',' + y + ')');

    const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    c.setAttribute('r', radius);
    c.setAttribute('fill', color);
    g.appendChild(c);

    const t = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    t.setAttribute('y', radius + 12);
    t.textContent = nodeData.label;
    g.appendChild(t);

    g.addEventListener('click', () => {
      graphSvg.querySelectorAll('.graph-node').forEach(n => n.classList.remove('selected'));
      g.classList.add('selected');
      const detailEl = document.getElementById('librarian-detail');
      detailEl.innerHTML =
        '<div class="ld-header">' + escapeHTML(nodeData.label) + '</div>' +
        '<div class="ld-body">' + escapeHTML(nodeData.detail) + '</div>';
    });

    graphSvg.appendChild(g);
  }

  // ---------- Rubik's Cube (Three.js) ----------
  let cubeInited = false;
  function initCube() {
    if (cubeInited) return;
    if (typeof THREE === 'undefined') return;
    cubeInited = true;

    const container = document.getElementById('cube-canvas');
    const w = container.clientWidth || 420;
    const h = container.clientHeight || 280;

    const scene = new THREE.Scene();
    scene.background = null;

    const camera = new THREE.PerspectiveCamera(38, w / h, 0.1, 100);
    camera.position.set(4.8, 4.4, 6.2);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(w, h);
    container.appendChild(renderer.domElement);

    // Lights — NeXT lighting: directional key + rim
    const key = new THREE.DirectionalLight(0xffffff, 0.9);
    key.position.set(5, 8, 6);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0xe5b700, 0.25);
    rim.position.set(-4, 2, -5);
    scene.add(rim);
    const ambient = new THREE.AmbientLight(0x444444, 0.4);
    scene.add(ambient);

    // Build 3x3 cube of 27 cubies
    const group = new THREE.Group();
    scene.add(group);

    const colors = {
      U: 0xffffff,   // white top
      D: 0xe5b700,   // NeXT amber bottom
      F: 0xcc2222,   // red front
      B: 0xd4d4d4,   // chrome back
      L: 0x2244cc,   // blue left
      R: 0x22aa44,   // green right
      inner: 0x0a0a0a
    };

    const cubies = [];
    const size = 0.96;
    const gap = 1.02;

    for (let x = -1; x <= 1; x++) {
      for (let y = -1; y <= 1; y++) {
        for (let z = -1; z <= 1; z++) {
          const mats = [
            new THREE.MeshStandardMaterial({ color: x ===  1 ? colors.R : colors.inner, roughness: 0.5 }),
            new THREE.MeshStandardMaterial({ color: x === -1 ? colors.L : colors.inner, roughness: 0.5 }),
            new THREE.MeshStandardMaterial({ color: y ===  1 ? colors.U : colors.inner, roughness: 0.5 }),
            new THREE.MeshStandardMaterial({ color: y === -1 ? colors.D : colors.inner, roughness: 0.5 }),
            new THREE.MeshStandardMaterial({ color: z ===  1 ? colors.F : colors.inner, roughness: 0.5 }),
            new THREE.MeshStandardMaterial({ color: z === -1 ? colors.B : colors.inner, roughness: 0.5 })
          ];
          const geom = new THREE.BoxGeometry(size, size, size);
          const cubie = new THREE.Mesh(geom, mats);
          cubie.position.set(x * gap, y * gap, z * gap);
          group.add(cubie);
          cubies.push(cubie);
        }
      }
    }

    // Animate slow rotation + occasional "layer" turn animation (visual only)
    let t = 0;
    let turnQueue = [];
    let turning = null;

    function scheduleTurn() {
      const axes = ['x', 'y', 'z'];
      const layers = [-1, 0, 1];
      const axis = axes[Math.floor(Math.random() * 3)];
      const layer = layers[Math.floor(Math.random() * 3)];
      const dir = Math.random() > 0.5 ? 1 : -1;
      turnQueue.push({ axis, layer, dir, progress: 0 });
    }

    // queue a turn every ~2.5s
    setInterval(scheduleTurn, 2500);

    function applyTurn(turn, delta) {
      const speed = 0.035;
      const target = Math.PI / 2;
      const step = Math.min(speed, target - turn.progress);
      turn.progress += step;

      const pivot = new THREE.Object3D();
      // actual approach: rotate matching cubies around a temporary pivot each frame
      // For simplicity (ambient visual only) we rotate them as a group for this frame
      const selected = cubies.filter(c => {
        const pos = c.position;
        if (turn.axis === 'x') return Math.round(pos.x / gap) === turn.layer;
        if (turn.axis === 'y') return Math.round(pos.y / gap) === turn.layer;
        return Math.round(pos.z / gap) === turn.layer;
      });

      const axisVec = new THREE.Vector3(
        turn.axis === 'x' ? 1 : 0,
        turn.axis === 'y' ? 1 : 0,
        turn.axis === 'z' ? 1 : 0
      );

      selected.forEach(c => {
        c.position.applyAxisAngle(axisVec, step * turn.dir);
        c.rotateOnWorldAxis(axisVec, step * turn.dir);
      });

      if (turn.progress >= target) {
        // snap positions to the grid
        selected.forEach(c => {
          c.position.x = Math.round(c.position.x / gap) * gap;
          c.position.y = Math.round(c.position.y / gap) * gap;
          c.position.z = Math.round(c.position.z / gap) * gap;
        });
        return true;
      }
      return false;
    }

    function animate() {
      requestAnimationFrame(animate);
      t += 0.005;
      group.rotation.y = t * 0.8;
      group.rotation.x = Math.sin(t * 0.3) * 0.15 + 0.35;

      if (!turning && turnQueue.length) turning = turnQueue.shift();
      if (turning) {
        const done = applyTurn(turning);
        if (done) turning = null;
      }

      renderer.render(scene, camera);
    }
    animate();

    // Resize observer
    window.addEventListener('resize', () => {
      const nw = container.clientWidth;
      const nh = container.clientHeight;
      if (nw && nh) {
        renderer.setSize(nw, nh);
        camera.aspect = nw / nh;
        camera.updateProjectionMatrix();
      }
    });
  }

  // ---------- utilities ----------
  function escapeHTML(str) {
    if (str == null) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // Menu hover (demo only — just a click hint)
  document.querySelectorAll('.menu-item').forEach(item => {
    item.addEventListener('click', () => {
      // tiny easter egg: clicking Quit doesn't actually quit
      if (item.textContent.startsWith('Quit')) {
        alert('This is a website. You cannot quit a website.');
      } else if (item.textContent.startsWith('Info')) {
        openAboutNext();
      }
    });
  });

})();
