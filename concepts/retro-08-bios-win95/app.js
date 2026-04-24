/* ==========================================================
 * retro-08-bios-win95  -  Jake Ruth
 * ========================================================== */

(() => {
  'use strict';

  /* --------------------------------------------------------
   * ACT 1 : BIOS BOOT
   * -------------------------------------------------------- */

  const BIOS_LINES = [
    { text: 'Award Modular BIOS v4.51PG, An Energy Star Ally', cls: '' },
    { text: 'Copyright (C) 1984-1998, Award Software, Inc.', cls: 'dim' },
    { text: '', delay: 120 },
    { text: 'JR-IT5H Chipset Rev 2.1', cls: 'dim' },
    { text: '', delay: 80 },
    { text: 'Main Processor      : Intel Pentium II 300MHz' },
    { text: 'Math Coprocessor    : Installed', cls: 'dim' },
    { text: 'Floppy Drive A:     : 1.44 MB, 3.5 in.', cls: 'dim' },
    { text: 'Display Type        : EGA/VGA', cls: 'dim' },
    { text: '', delay: 120 },
    { text: 'Memory Test :  131072K OK', tail: '   [OK]', tailCls: 'ok', delay: 480 },
    { text: '', delay: 120 },
    { text: 'Detecting IDE drives ...', delay: 380 },
    { text: '  Primary Master   : JAKE-RUTH-SSD-13YR   22 GB', cls: '', delay: 300 },
    { text: '  Primary Slave    : None', cls: 'dim', delay: 120 },
    { text: '  Secondary Master : CD-ROM  STOCK-UNLOCK-YC-W22', delay: 260 },
    { text: '  Secondary Slave  : None', cls: 'dim', delay: 100 },
    { text: '', delay: 140 },
    { text: 'PCI device listing ...', delay: 200 },
    { text: '  Bus No.  Device No.  Func No.  Vendor/Device  Class      IRQ', cls: 'dim' },
    { text: '  0        7           1         CommerceHub    Mass Stg   11', cls: 'dim' },
    { text: '  0        9           0         Oscar-Health   Network    10', cls: 'dim' },
    { text: '  0        11          0         Youni          Multimedia 09', cls: 'dim' },
    { text: '  0        13          0         ACM-SUNY       Controller 05', cls: 'dim' },
    { text: '', delay: 180 },
    { text: 'Boot Sequence : A:, C:, D:' },
    { text: 'Verifying DMI Pool Data ...', delay: 400 },
    { text: 'Loading system files .................... ', tail: '[OK]', tailCls: 'ok', delay: 700 },
    { text: '', delay: 150 },
    { text: 'Starting Microsoft(R) Windows 95 ...', delay: 700 },
  ];

  const biosEl  = document.getElementById('bios');
  const biosTxt = document.getElementById('bios-text');
  const splash  = document.getElementById('splash');
  const desktop = document.getElementById('desktop');

  let biosSkipped = false;
  let biosDone    = false;

  function runBios() {
    // add a blinking caret at the end
    const caret = document.createElement('span');
    caret.className = 'caret';
    biosTxt.appendChild(caret);

    let i = 0;
    let acc = 0;
    const base = 70;  // per-line base delay

    function step() {
      if (biosSkipped || i >= BIOS_LINES.length) {
        if (!biosSkipped) finishBios();
        return;
      }
      const line = BIOS_LINES[i++];
      // insert before caret
      biosTxt.insertBefore(makeLine(line), caret);
      const dly = line.delay || base;
      acc += dly;
      setTimeout(step, dly);
    }

    function makeLine(line) {
      const frag = document.createDocumentFragment();
      const span = document.createElement('span');
      if (line.cls) span.className = line.cls;
      span.textContent = line.text;
      frag.appendChild(span);
      if (line.tail) {
        const tail = document.createElement('span');
        tail.className = line.tailCls || '';
        tail.textContent = ' ' + line.tail;
        frag.appendChild(tail);
      }
      frag.appendChild(document.createTextNode('\n'));
      return frag;
    }

    step();
  }

  function finishBios() {
    if (biosDone) return;
    biosDone = true;
    // brief pause then fade to splash
    setTimeout(() => {
      biosEl.classList.remove('active');
      biosEl.classList.add('fading-out');
      splash.classList.add('active');
      splash.setAttribute('aria-hidden', 'false');
      // splash duration
      setTimeout(finishSplash, 1900);
    }, 450);
  }

  function finishSplash() {
    splash.classList.remove('active');
    splash.classList.add('fading-out');
    desktop.classList.add('active');
    desktop.setAttribute('aria-hidden', 'false');
    // open a welcome window
    openWindow('readme');
    // trigger cube ambient solve hint
    window.dispatchEvent(new CustomEvent('desktop-ready'));
  }

  function skipBoot() {
    if (biosDone) return;
    biosSkipped = true;
    biosDone = true;
    biosEl.classList.remove('active');
    biosEl.classList.add('fading-out');
    // jump straight past splash for returning visitors / skippers
    splash.classList.add('active');
    splash.setAttribute('aria-hidden', 'false');
    setTimeout(finishSplash, 600);
  }

  // Skip on any key or click while in boot
  window.addEventListener('keydown', (e) => {
    if (!biosDone) { skipBoot(); e.preventDefault(); }
  });
  biosEl.addEventListener('click', () => { if (!biosDone) skipBoot(); });
  splash.addEventListener('click', () => {
    if (splash.classList.contains('active')) finishSplash();
  });

  /* --------------------------------------------------------
   * ACT 3 : DESKTOP / WINDOWS / START MENU
   * -------------------------------------------------------- */

  const winContainer = document.getElementById('windows');
  const taskbarPills = document.getElementById('taskbar-pills');
  const startBtn     = document.getElementById('start-btn');
  const startMenu    = document.getElementById('startmenu');
  const subPrograms  = document.getElementById('submenu-programs');

  let zTop = 50;
  const openWindows = new Map();  // id -> { el, pillEl, meta }

  /* ---------- content registry ---------- */

  const CONTENT = {
    readme: {
      title: 'README.txt - Notepad',
      icon: 'txt',
      w: 520, h: 380,
      bodyClass: 'notepad-body',
      html: `JAKE RUTH  -  README.TXT
========================================
Last modified: 2026-04-20
Maintainer   : jake@stockunlock.com

Hi. I'm Jake. I've been writing code for about 13 years, which in
computer years means I remember when "npm install" actually finished.

WHAT I'VE SHIPPED
-----------------
* Stock Unlock    - founded, scaled to 8 employees + thousands of
                    paying customers, raised $1.335M seed at YC W22,
                    profitable side business, now running itself.
                    (Not full-time there as of April 2026.)
* Oscar Health    - 2017-2021. Health insurance, for real humans.
* Youni           - 2015-2016. College social network.
* CommerceHub     - 2013-2016. E-comm pipes at scale.
* ACM @ SUNY Albany - President. Ran the club, broke the printer.

HOBBIES
-------
* Rubik's cube, 13.95s single-hand average.
* Once rode a unicycle while solving a cube. On a stage. On purpose.
* Getting married this year.

LOOKING FOR
-----------
Next chapter. Probably founding again. Probably building a product
that doesn't overcharge for bad software, because that's the thing
I hate most and I've got receipts.

Double-click Contact.hlp to reach me, or use Start > Run > "mailto:"`,
    },

    resume: {
      title: 'Resume.doc - WordPad',
      icon: 'doc',
      w: 600, h: 460,
      bodyClass: 'resume-body',
      html: `
<div class="name">JAKE RUTH</div>
<div class="subtitle">Software engineer, founder, and cube person.<br>jake@stockunlock.com</div>
<hr>
<h3>EXPERIENCE</h3>

<div class="job"><b>Stock Unlock</b> <span class="date">2021 - present (not FT since 2026)</span></div>
<div>Co-founder & engineer. YC W22, $1.335M seed. Built retail-investor
research tools people actually want. Scaled to 8 employees at peak
and thousands of paying customers. Now running as a profitable side
business while I look for the next thing.</div>
<ul>
  <li>Led product + engineering across web, pricing, and data pipelines.</li>
  <li>Hired, fired, supported, failed, recovered. The real job.</li>
  <li>Wrote the kind of code that has to still work when nobody's watching.</li>
</ul>

<div class="job"><b>Oscar Health</b> <span class="date">2017 - 2021</span></div>
<div>Engineer on member-facing tooling. Insurance is hard; insurance
software in legacy environments is harder. Shipped anyway.</div>

<div class="job"><b>Youni</b> <span class="date">2015 - 2016</span></div>
<div>Early engineer at a college social network. Learned what ramen
tastes like at 3am while debugging push notifications.</div>

<div class="job"><b>CommerceHub</b> <span class="date">2013 - 2016</span></div>
<div>First-job e-commerce integrations at scale. Retail feeds, order
pipelines, and a healthy respect for idempotency.</div>

<h3>EDUCATION</h3>
<div>SUNY Albany - Computer Science. ACM Chapter President.</div>

<h3>OTHER</h3>
<ul>
  <li>Rubik's cube competitor, 13.95s single average.</li>
  <li>Unicycle-cube talent show (video available upon request).</li>
  <li>Getting married in 2026. Bride tolerates the collection.</li>
</ul>
`
    },

    contact: {
      title: 'Contact.hlp - Windows Help',
      icon: 'hlp',
      w: 420, h: 280,
      bodyClass: 'helpfile',
      html: `
<h1>How do I reach Jake?</h1>
<div class="field"><b>Email</b><span><a href="mailto:jake@stockunlock.com">jake@stockunlock.com</a></span></div>
<div class="field"><b>GitHub</b><span>github.com/jakeruth</span></div>
<div class="field"><b>LinkedIn</b><span>linkedin.com/in/jakeruth</span></div>
<div class="field"><b>Twitter/X</b><span>@jakeruth</span></div>
<div class="field"><b>Response time</b><span>48h, usually faster.</span></div>
<br>
<div style="color:#555;font-style:italic;">Tip: Say what you want. I prefer short
emails to long ones, and "I'm building X" to "coffee sometime?".</div>
`
    },

    mycomputer: {
      title: 'My Computer',
      icon: 'mycomp',
      w: 460, h: 300,
      bodyClass: 'explorer',
      html: `
<div class="explorer-toolbar">
  <button class="xt-btn">&#11013; Back</button>
  <button class="xt-btn">&#10145; Forward</button>
  <button class="xt-btn">&#8613; Up</button>
  <span style="width:1px;height:20px;background:#808080;margin:0 4px;"></span>
  <button class="xt-btn">&#9988; Cut</button>
  <button class="xt-btn">&#128203; Copy</button>
  <button class="xt-btn">&#128196; Paste</button>
</div>
<div class="explorer-addr">
  <span>Address</span>
  <div class="addr-input">My Computer</div>
</div>
<div class="mycomp-drives">
  <div class="drive-item" data-open="readme"><div class="di-ico">&#128190;</div><span>3&frac12; Floppy (A:)</span></div>
  <div class="drive-item" data-open="resume"><div class="di-ico">&#128189;</div><span>Local Disk (C:)</span></div>
  <div class="drive-item" data-open="stockunlock"><div class="di-ico">&#128191;</div><span>CD-ROM (D:)</span></div>
  <div class="drive-item" data-open="settings"><div class="di-ico">&#128193;</div><span>Control Panel</span></div>
  <div class="drive-item" data-open="network"><div class="di-ico">&#128187;</div><span>Network</span></div>
</div>
`
    },

    network: {
      title: 'Network Neighborhood',
      icon: 'network',
      w: 620, h: 420,
      bodyClass: 'explorer',
      html: `
<div class="explorer-toolbar">
  <button class="xt-btn">&#11013; Back</button>
  <button class="xt-btn">&#10145; Forward</button>
  <button class="xt-btn">&#8613; Up</button>
  <span style="width:1px;height:20px;background:#808080;margin:0 4px;"></span>
  <button class="xt-btn">View: Details</button>
</div>
<div class="explorer-addr">
  <span>Address</span>
  <div class="addr-input">\\\\JAKE-NETWORK</div>
</div>
<div class="network-split">
  <div class="network-tree">
    <ul>
      <li class="branch" data-node="root"><span>&#128279; Entire Network</span>
        <ul>
          <li class="branch" data-node="companies"><span>&#128193; Companies</span>
            <ul>
              <li data-node="stockunlock"><span>&#128200; STOCK-UNLOCK</span></li>
              <li data-node="oscar"><span>&#127973; OSCAR-HEALTH</span></li>
              <li data-node="youni"><span>&#127891; YOUNI</span></li>
              <li data-node="commercehub"><span>&#128230; COMMERCEHUB</span></li>
            </ul>
          </li>
          <li class="branch" data-node="communities"><span>&#128193; Communities</span>
            <ul>
              <li data-node="acm"><span>&#128100; ACM-SUNY</span></li>
              <li data-node="yc"><span>&#128100; YC-W22</span></li>
              <li data-node="cubing"><span>&#129526; WCA-CUBING</span></li>
            </ul>
          </li>
          <li class="branch" data-node="projects"><span>&#128193; Side Projects</span>
            <ul>
              <li data-node="wedding"><span>&#128141; WEDDING.EXE</span></li>
              <li data-node="unicycle"><span>&#128692; UNICYCLE-CUBE</span></li>
              <li data-node="thisite"><span>&#128187; PERSONAL-SITE</span></li>
            </ul>
          </li>
        </ul>
      </li>
    </ul>
  </div>
  <div class="network-detail" id="net-detail">
    <h3>Entire Network</h3>
    <p>Select a node in the tree to inspect it. Each node is a real
    thing I was actually part of; hover for receipts.</p>
  </div>
</div>
`
    },

    recycle: {
      title: 'Recycle Bin',
      icon: 'recycle',
      w: 440, h: 260,
      bodyClass: 'explorer',
      html: `
<div class="explorer-toolbar">
  <button class="xt-btn">&#11013; Back</button>
  <button class="xt-btn">Empty Recycle Bin</button>
</div>
<div class="explorer-addr">
  <span>Address</span>
  <div class="addr-input">Recycle Bin - things I no longer do</div>
</div>
<div class="explorer-list">
  <div class="explorer-item"><div class="ei-ico">&#128196;</div><span>daily-status.eml</span></div>
  <div class="explorer-item"><div class="ei-ico">&#128196;</div><span>meeting-with-no-agenda.ics</span></div>
  <div class="explorer-item"><div class="ei-ico">&#128196;</div><span>overpriced-saas.csv</span></div>
  <div class="explorer-item"><div class="ei-ico">&#128196;</div><span>vanity-metric.xls</span></div>
  <div class="explorer-item"><div class="ei-ico">&#128196;</div><span>cold-outreach-v9.doc</span></div>
  <div class="explorer-item"><div class="ei-ico">&#128196;</div><span>11pm-slack-ping.log</span></div>
</div>
`
    },

    stockunlock: {
      title: 'Stock Unlock.lnk - Properties',
      icon: 'lnk',
      w: 520, h: 420,
      bodyClass: 'su-body',
      html: `
<h1 style="font-size:16px;margin:0 0 4px;">Stock Unlock</h1>
<div style="color:#555;margin-bottom:8px;">Built it. Scaled it. Left it running.</div>

<div class="stat-row">
  <div class="stat"><b>YC W22</b><small>Seed batch</small></div>
  <div class="stat"><b>$1.335M</b><small>Seed raised</small></div>
  <div class="stat"><b>8</b><small>Peak team</small></div>
  <div class="stat"><b>1000s</b><small>Paying customers</small></div>
</div>

<p><b>What it is:</b> a retail-investor research tool. Fundamentals,
screeners, and dashboards that treat the user like a grown-up instead
of a product to sell ads to.</p>

<p><b>What I actually did:</b> co-founded, engineered the product end
to end, hired the team, made the pricing cheap enough that the people
we built it for could afford it, and stayed profitable when the rest
of fintech was lighting VC money on fire.</p>

<p><b>Where it is now:</b> running as a profitable side business.
I stepped away from full-time in 2026 to build the next thing. The
product still ships. The customers still pay. I still read the logs.</p>

<div style="margin-top:14px;">
  <button class="w95-btn default">Open Web Site</button>
  <button class="w95-btn">Properties</button>
  <button class="w95-btn">Close</button>
</div>
`
    },

    cube: {
      title: 'Cube.exe',
      icon: 'cube',
      w: 340, h: 340,
      bodyClass: 'cube-host',
      html: `<div id="cube-canvas-host" style="width:100%;height:100%;background:#111;"></div>`
    },

    settings: {
      title: 'Settings - Control Panel',
      icon: 'mycomp',
      w: 460, h: 320,
      bodyClass: 'explorer',
      html: `
<div class="explorer-toolbar">
  <button class="xt-btn">&#11013; Back</button>
  <button class="xt-btn">Large Icons</button>
</div>
<div class="cpl-grid">
  <div class="cpl-item"><div class="cpl-ico">&#128421;</div><span>Display</span></div>
  <div class="cpl-item"><div class="cpl-ico">&#128266;</div><span>Sounds</span></div>
  <div class="cpl-item"><div class="cpl-ico">&#128279;</div><span>Network</span></div>
  <div class="cpl-item"><div class="cpl-ico">&#128197;</div><span>Date/Time</span></div>
  <div class="cpl-item"><div class="cpl-ico">&#9000;</div><span>Keyboard</span></div>
  <div class="cpl-item"><div class="cpl-ico">&#128187;</div><span>System</span></div>
  <div class="cpl-item"><div class="cpl-ico">&#128100;</div><span>Users</span></div>
  <div class="cpl-item"><div class="cpl-ico">&#128274;</div><span>Passwords</span></div>
</div>
`
    },

    find: {
      title: 'Find: All Files',
      icon: 'txt',
      w: 420, h: 280,
      bodyClass: 'find-body',
      html: `
<div class="tabs">
  <div class="tab active">Name & Location</div>
  <div class="tab">Date Modified</div>
  <div class="tab">Advanced</div>
</div>
<div class="pane">
  <label>Named:</label>
  <input type="text" value="jake*.*" />
  <label>Look in:</label>
  <select><option>C:\\ (Local Disk)</option><option>Entire Network</option></select>
  <div style="margin-top:10px;display:flex;gap:6px;justify-content:flex-end;">
    <button class="w95-btn default">Find Now</button>
    <button class="w95-btn">Stop</button>
    <button class="w95-btn">New Search</button>
  </div>
</div>
`
    },

    help: {
      title: 'Windows Help',
      icon: 'hlp',
      w: 440, h: 300,
      bodyClass: 'helpfile',
      html: `
<h1>Site Help</h1>
<p><b>Double-click</b> a desktop icon to open a window.</p>
<p>Use <b>Start</b> at the bottom-left for Programs, Documents, Find, and Shut Down.</p>
<p>Drag title bars to move windows. Use the <b>X</b> to close.</p>
<p><b>To skip the BIOS / splash</b> on future visits: press any key or click
during the boot sequence.</p>
<p>Still lost? Email <a href="mailto:jake@stockunlock.com">jake@stockunlock.com</a>.</p>
`
    },

    run: {
      title: 'Run',
      icon: 'txt',
      w: 360, h: 170,
      bodyClass: 'run-dialog',
      html: `
<div class="run-label">Type the name of a program, folder, document, or
Internet resource, and Windows will open it for you.</div>
<div class="run-ico">&#9654;</div>
<div>
  <div style="margin-bottom:2px;">Open:</div>
  <input id="run-input" type="text" value="mailto:jake@stockunlock.com" />
</div>
<div class="run-actions">
  <button class="w95-btn default" id="run-ok">OK</button>
  <button class="w95-btn" id="run-cancel">Cancel</button>
  <button class="w95-btn">Browse...</button>
</div>
`
    },

    shutdown: {
      title: 'Shut Down Windows',
      icon: 'mycomp',
      w: 380, h: 230,
      bodyClass: 'shutdown-dialog',
      html: `
<div style="display:flex;gap:10px;align-items:flex-start;">
  <div style="font-size:42px;">&#9888;</div>
  <div>
    <div style="margin-bottom:8px;"><b>Are you sure you want to close this chapter?</b></div>
    <label class="opt"><input type="radio" name="sd" checked> Ship the next thing</label>
    <label class="opt"><input type="radio" name="sd"> Restart (new company)</label>
    <label class="opt"><input type="radio" name="sd"> Stand by (contract work)</label>
    <label class="opt"><input type="radio" name="sd"> Close all programs and log on as a different user</label>
  </div>
</div>
<div class="shutdown-actions">
  <button class="w95-btn default" id="sd-yes">Yes</button>
  <button class="w95-btn" id="sd-no">No</button>
  <button class="w95-btn">Help</button>
</div>
`
    }
  };

  /* ---------- Window management ---------- */

  function openWindow(id) {
    if (openWindows.has(id)) {
      focusWindow(id);
      return;
    }
    const meta = CONTENT[id];
    if (!meta) return;

    const tpl = document.getElementById('tpl-window');
    const frag = tpl.content.cloneNode(true);
    const el = frag.querySelector('.win95');
    el.dataset.id = id;

    const w = meta.w || 420;
    const h = meta.h || 300;
    const vw = window.innerWidth;
    const vh = window.innerHeight - 28;
    // cascade position
    const n = openWindows.size;
    const x = Math.max(10, Math.min(vw - w - 20, 120 + n * 24));
    const y = Math.max(10, Math.min(vh - h - 40, 40  + n * 22));

    el.style.left = x + 'px';
    el.style.top  = y + 'px';
    el.style.width  = w + 'px';
    el.style.height = h + 'px';
    el.style.zIndex = ++zTop;

    el.querySelector('.wt-name').textContent = meta.title;
    const body = el.querySelector('.win95-body');
    body.classList.add('wb');
    if (meta.bodyClass) body.classList.add(...meta.bodyClass.split(' '));
    body.innerHTML = meta.html;

    const statusLeft  = el.querySelector('.ws-left');
    const statusRight = el.querySelector('.ws-right');
    statusLeft.textContent  = meta.title;
    statusRight.textContent = `${w} x ${h}`;

    // button wiring
    el.querySelector('.wt-close').addEventListener('click', () => closeWindow(id));
    el.querySelector('.wt-min').addEventListener('click',   () => minimizeWindow(id));
    el.querySelector('.wt-max').addEventListener('click',   () => toggleMaxWindow(id));
    el.addEventListener('mousedown', () => focusWindow(id));

    // drag
    makeDraggable(el, el.querySelector('.win95-title'));

    winContainer.appendChild(el);

    // taskbar pill
    const pill = document.createElement('button');
    pill.className = 'tb-pill active';
    pill.innerHTML = `<span class="pill-ico"></span><span>${meta.title}</span>`;
    pill.addEventListener('click', () => {
      if (el.classList.contains('minimized')) {
        el.classList.remove('minimized');
        focusWindow(id);
      } else if (isFocused(id)) {
        minimizeWindow(id);
      } else {
        focusWindow(id);
      }
    });
    taskbarPills.appendChild(pill);

    openWindows.set(id, { el, pillEl: pill, meta });
    focusWindow(id);

    // per-window init
    if (id === 'cube') {
      window.dispatchEvent(new CustomEvent('cube-open', {
        detail: { host: body.querySelector('#cube-canvas-host') }
      }));
    }
    if (id === 'network')   wireNetworkTree(body);
    if (id === 'mycomputer') wireMyComputer(body);
    if (id === 'run')        wireRunDialog(body, el, id);
    if (id === 'shutdown')   wireShutdown(body, el, id);
  }

  function closeWindow(id) {
    const w = openWindows.get(id);
    if (!w) return;
    w.el.remove();
    w.pillEl.remove();
    openWindows.delete(id);
    if (id === 'cube') {
      window.dispatchEvent(new CustomEvent('cube-close'));
    }
  }

  function minimizeWindow(id) {
    const w = openWindows.get(id);
    if (!w) return;
    w.el.classList.add('minimized');
    w.pillEl.classList.remove('active');
    // mark all inactive
    for (const v of openWindows.values()) v.el.classList.add('inactive');
  }

  function toggleMaxWindow(id) {
    const w = openWindows.get(id);
    if (!w) return;
    w.el.classList.toggle('maximized');
  }

  function focusWindow(id) {
    const w = openWindows.get(id);
    if (!w) return;
    w.el.classList.remove('minimized', 'inactive');
    w.el.style.zIndex = ++zTop;
    for (const [k, v] of openWindows.entries()) {
      v.pillEl.classList.toggle('active', k === id);
      if (k !== id) v.el.classList.add('inactive');
    }
  }

  function isFocused(id) {
    const w = openWindows.get(id);
    if (!w) return false;
    return !w.el.classList.contains('inactive') && !w.el.classList.contains('minimized');
  }

  /* ---------- Drag ---------- */

  function makeDraggable(el, handle) {
    let sx, sy, ox, oy, dragging = false;
    handle.addEventListener('mousedown', (e) => {
      if (e.target.closest('.wt-btn')) return;
      if (el.classList.contains('maximized')) return;
      dragging = true;
      sx = e.clientX; sy = e.clientY;
      ox = parseInt(el.style.left, 10);
      oy = parseInt(el.style.top, 10);
      document.body.style.cursor = 'grabbing';
      e.preventDefault();
    });
    window.addEventListener('mousemove', (e) => {
      if (!dragging) return;
      const nx = Math.max(0, ox + (e.clientX - sx));
      const ny = Math.max(0, oy + (e.clientY - sy));
      el.style.left = nx + 'px';
      el.style.top  = ny + 'px';
    });
    window.addEventListener('mouseup', () => {
      dragging = false;
      document.body.style.cursor = '';
    });
  }

  /* ---------- Icon wiring ---------- */

  // single-click selection, double-click open
  let lastSelected = null;
  document.querySelectorAll('#icons .icon').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('#icons .icon').forEach(x => x.classList.remove('selected'));
      btn.classList.add('selected');
      lastSelected = btn;
    });
    btn.addEventListener('dblclick', () => openWindow(btn.dataset.open));
    // enter opens
    btn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') openWindow(btn.dataset.open);
    });
  });
  document.querySelector('.desktop').addEventListener('mousedown', (e) => {
    if (e.target.closest('.icon')) return;
    if (e.target.closest('.win95')) return;
    if (e.target.closest('.taskbar')) return;
    if (e.target.closest('.startmenu')) return;
    document.querySelectorAll('#icons .icon').forEach(x => x.classList.remove('selected'));
    closeStartMenu();
  });

  /* ---------- Start menu ---------- */

  function openStartMenu() {
    startMenu.hidden = false;
    startBtn.classList.add('open');
  }
  function closeStartMenu() {
    startMenu.hidden = true;
    subPrograms.hidden = true;
    startBtn.classList.remove('open');
  }
  startBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (startMenu.hidden) openStartMenu(); else closeStartMenu();
  });
  startMenu.addEventListener('click', (e) => {
    const li = e.target.closest('li');
    if (!li) return;
    if (li.dataset.submenu === 'programs') {
      subPrograms.hidden = !subPrograms.hidden;
      return;
    }
    const target = li.dataset.open;
    if (target) {
      openWindow(target);
      closeStartMenu();
    }
  });
  subPrograms.addEventListener('click', (e) => {
    const li = e.target.closest('li');
    if (!li) return;
    const target = li.dataset.open;
    if (target) {
      openWindow(target);
      closeStartMenu();
    }
  });
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.startmenu') && !e.target.closest('#start-btn')) {
      closeStartMenu();
    }
  });

  /* ---------- Tray clock ---------- */

  function updateClock() {
    const d = new Date();
    let h = d.getHours();
    const m = d.getMinutes().toString().padStart(2, '0');
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    document.getElementById('tray-clock').textContent = `${h}:${m} ${ampm}`;
  }
  setInterval(updateClock, 10000);
  updateClock();

  /* ---------- Network tree interaction ---------- */

  const NET_DATA = {
    root:         { title: 'Entire Network', body: 'Select a node to inspect it. Each node is a real thing I was actually part of.' },
    companies:    { title: 'Companies', body: 'Four jobs, 13 years. Plus the one I founded.' },
    communities:  { title: 'Communities', body: 'Groups that shaped how I work.' },
    projects:     { title: 'Side Projects', body: 'Things I built because they were fun or necessary.' },

    stockunlock:  { title: 'STOCK-UNLOCK', role: 'Co-founder / Engineer (2021-present, not FT from 2026)',
                    body: 'YC W22, $1.335M seed, peak team of 8, thousands of paying customers, profitable side business.' },
    oscar:        { title: 'OSCAR-HEALTH', role: 'Engineer (2017-2021)',
                    body: 'Member-facing tools in a serious regulated environment.' },
    youni:        { title: 'YOUNI', role: 'Engineer (2015-2016)',
                    body: 'Early-stage college social network. Moved fast.' },
    commercehub:  { title: 'COMMERCEHUB', role: 'Engineer (2013-2016)',
                    body: 'First real job. Retail e-commerce integrations at scale.' },

    acm:          { title: 'ACM @ SUNY Albany', role: 'President',
                    body: 'Ran the chapter. Organized talks, hackathons, the occasional printer incident.' },
    yc:           { title: 'YC W22', role: 'Founder',
                    body: 'Winter 2022 batch. Good people, good process.' },
    cubing:       { title: 'WCA Cubing', role: 'Competitor',
                    body: '13.95s single-hand average. Still shave seconds when I can.' },

    wedding:      { title: 'WEDDING.EXE', role: 'Project lead',
                    body: 'Getting married this year. Blockers: none. Ship date: soon.' },
    unicycle:     { title: 'UNICYCLE-CUBE', role: 'Performer',
                    body: 'Once did the talent show on a unicycle with a Rubik\'s cube. Landed both.' },
    thisite:      { title: 'PERSONAL-SITE', role: 'You are here',
                    body: 'Built as 17 parallel prototypes, one of which is this BIOS -> Win95 thing.' }
  };

  function wireNetworkTree(body) {
    const detail = body.querySelector('#net-detail');
    body.querySelectorAll('[data-node]').forEach(li => {
      li.addEventListener('click', (e) => {
        e.stopPropagation();
        const key = li.dataset.node;
        const d = NET_DATA[key];
        if (!d) return;
        detail.innerHTML = `
          <h3>${d.title}</h3>
          ${d.role ? `<div style="color:#555;margin-bottom:6px;"><i>${d.role}</i></div>` : ''}
          <div class="card">${d.body}</div>
        `;
      });
    });
  }

  function wireMyComputer(body) {
    body.querySelectorAll('.drive-item').forEach(el => {
      el.addEventListener('dblclick', () => openWindow(el.dataset.open));
    });
  }

  function wireRunDialog(body, el, id) {
    const input = body.querySelector('#run-input');
    const ok    = body.querySelector('#run-ok');
    const cancel= body.querySelector('#run-cancel');
    function exec() {
      const v = (input.value || '').trim().toLowerCase();
      if (!v) return;
      if (v.startsWith('mailto:')) { window.location.href = input.value; closeWindow(id); return; }
      if (v.includes('cube'))      { openWindow('cube');       closeWindow(id); return; }
      if (v.includes('readme'))    { openWindow('readme');     closeWindow(id); return; }
      if (v.includes('resume'))    { openWindow('resume');     closeWindow(id); return; }
      if (v.includes('network'))   { openWindow('network');    closeWindow(id); return; }
      if (v.includes('stock'))     { openWindow('stockunlock');closeWindow(id); return; }
      if (v.includes('shutdown'))  { openWindow('shutdown');   closeWindow(id); return; }
      // default: treat as mailto
      window.location.href = 'mailto:jake@stockunlock.com';
      closeWindow(id);
    }
    ok.addEventListener('click', exec);
    cancel.addEventListener('click', () => closeWindow(id));
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') exec(); });
    setTimeout(() => input.focus(), 50);
  }

  function wireShutdown(body, el, id) {
    body.querySelector('#sd-no').addEventListener('click', () => closeWindow(id));
    body.querySelector('#sd-yes').addEventListener('click', () => {
      // joke: open the contact window instead
      closeWindow(id);
      openWindow('contact');
    });
  }

  /* ---------- Expose for inter-module use ---------- */

  window.__win95 = { openWindow, closeWindow };

  /* --------------------------------------------------------
   * BOOT
   * -------------------------------------------------------- */

  // start the BIOS after a tick so fonts have a chance
  window.addEventListener('load', () => {
    runBios();
  });
})();
