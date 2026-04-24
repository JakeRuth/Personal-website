/* ============================================================
   Jake Ruth Enterprise Suite '98
   Desktop/window manager + interactions. Vanilla JS, no build.
   ============================================================ */

(function(){

/* ---------- BOOT / SPLASH ---------- */
var BOOT_STATUS = [
  "Setup is preparing the installation wizard…",
  "Copying MSVBVM60.DLL…",
  "Registering OLE controls…",
  "Configuring Enterprise components…",
  "Optimizing for Pentium II (MMX™)…",
  "Initializing Ruth Kernel Services…",
  "Finalizing installation…"
];
var bootBar = document.getElementById('bootBar');
var bootStatus = document.getElementById('bootStatus');
var bootPct = 0, bootStep = 0;
var bootTimer = setInterval(function(){
  bootPct += 6 + Math.random() * 10;
  if (bootPct >= 100) bootPct = 100;
  bootBar.style.width = bootPct + '%';
  var idx = Math.min(BOOT_STATUS.length - 1, Math.floor(bootPct / (100 / BOOT_STATUS.length)));
  if (idx !== bootStep){ bootStep = idx; bootStatus.textContent = BOOT_STATUS[idx]; }
  if (bootPct >= 100){
    clearInterval(bootTimer);
    setTimeout(function(){
      document.body.classList.add('booted');
      // auto-open the main app
      openWindow('jakeRuthExe');
      // gentle EULA on first arrival
      setTimeout(function(){ document.getElementById('eula-modal').classList.remove('hidden'); }, 450);
    }, 400);
  }
}, 170);

/* ---------- WINDOW MANAGER ---------- */
var layer = document.getElementById('windows-layer');
var openStack = []; // array of ids in z-order (last = top)
var zCounter = 100;
var winPositions = {}; // id -> {x,y}
var winState = {}; // id -> {open, minimized}

function getTpl(id){ return document.getElementById('tpl-' + id); }

window.openWindow = function(id){
  var existing = document.querySelector('[data-w="'+id+'"]');
  if (existing){
    existing.style.display = 'block';
    bringToFront(existing);
    updateTaskbar();
    if (winState[id]) winState[id].minimized = false;
    return existing;
  }
  var tpl = getTpl(id);
  if (!tpl){ console.warn('no template for', id); return; }
  var node = tpl.content.firstElementChild.cloneNode(true);
  layer.appendChild(node);

  // initial position (cascade)
  var n = openStack.length;
  var offset = 26 * (n % 8);
  var x = winPositions[id] ? winPositions[id].x : (110 + offset);
  var y = winPositions[id] ? winPositions[id].y : (30 + offset);
  node.style.left = x + 'px';
  node.style.top  = y + 'px';

  // hooks
  wireWindow(node, id);

  openStack.push(id);
  winState[id] = { open:true, minimized:false };
  bringToFront(node);
  updateTaskbar();

  // per-window activation
  if (id === 'jakeRuthExe') wireJakeApp(node);
  if (id === 'networkNeighborhood') wireNetwork(node);
  if (id === 'plusPack') wirePlusPack(node);
  if (id === 'cubeApp') wireCube(node);
  if (id === 'themes98') wireThemes(node);
  if (id === 'myComputer') wireMyComputer(node);

  return node;
};

window.closeWindow = function(id){
  var node = document.querySelector('[data-w="'+id+'"]');
  if (!node) return;
  // remember position
  winPositions[id] = { x: parseInt(node.style.left, 10)||120, y: parseInt(node.style.top, 10)||60 };
  node.remove();
  openStack = openStack.filter(function(w){ return w !== id; });
  winState[id] = { open:false, minimized:false };
  updateTaskbar();
};

function bringToFront(node){
  zCounter++;
  node.style.zIndex = zCounter;
  document.querySelectorAll('.window').forEach(function(w){ w.classList.remove('active'); });
  node.classList.add('active');
  var id = node.getAttribute('data-w');
  openStack = openStack.filter(function(w){ return w !== id; });
  openStack.push(id);
  updateTaskbar();
}

function wireWindow(node, id){
  // close / minimize / maximize
  var controls = node.querySelectorAll('.title-bar-controls button');
  if (controls.length){
    var min = controls[0], max = controls[1], cls = controls[controls.length-1];
    if (cls && cls.getAttribute('aria-label') === 'Close') cls.addEventListener('click', function(){ closeWindow(id); });
    if (min && min.getAttribute('aria-label') === 'Minimize'){
      min.addEventListener('click', function(){
        node.style.display = 'none';
        if (winState[id]) winState[id].minimized = true;
        updateTaskbar();
      });
    }
    if (max && max.getAttribute('aria-label') === 'Maximize'){
      max.addEventListener('click', function(){
        if (node.dataset.maxed){
          node.style.left = node.dataset.px + 'px';
          node.style.top  = node.dataset.py + 'px';
          node.style.width = node.dataset.pw + 'px';
          node.style.height = 'auto';
          node.dataset.maxed = '';
        } else {
          node.dataset.px = parseInt(node.style.left,10)||100;
          node.dataset.py = parseInt(node.style.top,10)||60;
          node.dataset.pw = node.getBoundingClientRect().width;
          node.style.left = '0px'; node.style.top = '0px';
          node.style.width = '100vw';
          node.style.height = 'calc(100vh - 30px)';
          node.dataset.maxed = '1';
        }
      });
    }
  }

  // click anywhere in window -> bring to front
  node.addEventListener('mousedown', function(){ bringToFront(node); });

  // drag by title bar
  var tb = node.querySelector('.title-bar');
  if (tb){
    var dragging = false, sx=0, sy=0, ox=0, oy=0;
    tb.addEventListener('mousedown', function(e){
      if (e.target.closest('.title-bar-controls')) return;
      dragging = true;
      sx = e.clientX; sy = e.clientY;
      ox = parseInt(node.style.left,10) || 0;
      oy = parseInt(node.style.top,10) || 0;
      document.body.style.userSelect='none';
    });
    document.addEventListener('mousemove', function(e){
      if (!dragging) return;
      var nx = ox + (e.clientX - sx);
      var ny = oy + (e.clientY - sy);
      nx = Math.max(0, Math.min(window.innerWidth - 80, nx));
      ny = Math.max(0, Math.min(window.innerHeight - 40, ny));
      node.style.left = nx + 'px';
      node.style.top  = ny + 'px';
    });
    document.addEventListener('mouseup', function(){ dragging = false; document.body.style.userSelect=''; });
  }

  // data-window click delegation inside window
  node.querySelectorAll('[data-window]').forEach(function(el){
    el.addEventListener('click', function(ev){
      ev.stopPropagation();
      openWindow(el.getAttribute('data-window'));
    });
  });
}

/* ---------- TASKBAR ---------- */
function updateTaskbar(){
  var root = document.getElementById('taskbar-apps');
  root.innerHTML = '';
  openStack.forEach(function(id){
    var node = document.querySelector('[data-w="'+id+'"]');
    if (!node) return;
    var title = (node.querySelector('.title-bar-text') || {}).textContent || id;
    var btn = document.createElement('button');
    btn.className = 'task-btn';
    var active = node.classList.contains('active') && node.style.display !== 'none';
    if (active) btn.classList.add('active');
    btn.innerHTML = '<span class="ql-icn" style="width:14px;height:14px;display:inline-block"></span><span>'+title+'</span>';
    btn.addEventListener('click', function(){
      if (node.style.display === 'none'){
        node.style.display = 'block';
        bringToFront(node);
      } else if (node.classList.contains('active')){
        node.style.display = 'none';
        if (winState[id]) winState[id].minimized = true;
      } else {
        bringToFront(node);
      }
      updateTaskbar();
    });
    root.appendChild(btn);
  });
}

/* ---------- DESKTOP ICONS ---------- */
document.querySelectorAll('.dt-icon').forEach(function(ic){
  var timer=null, clicks=0;
  ic.addEventListener('click', function(){
    // single click = select; double click = open
    clicks++;
    ic.classList.add('selected');
    if (clicks === 1){
      timer = setTimeout(function(){ clicks = 0; }, 300);
    } else if (clicks === 2){
      clearTimeout(timer); clicks = 0;
      var id = ic.getAttribute('data-window');
      openWindow(id);
    }
  });
  // allow double-click natively too
  ic.addEventListener('dblclick', function(){
    var id = ic.getAttribute('data-window');
    openWindow(id);
  });
});

document.getElementById('desktop').addEventListener('mousedown', function(e){
  if (!e.target.closest('.dt-icon')){
    document.querySelectorAll('.dt-icon.selected').forEach(function(x){ x.classList.remove('selected'); });
  }
  if (!e.target.closest('#start-menu') && !e.target.closest('#start-button')){
    document.getElementById('start-menu').classList.add('hidden');
    document.getElementById('start-button').classList.remove('active');
  }
});

/* ---------- START MENU ---------- */
var startBtn = document.getElementById('start-button');
var startMenu = document.getElementById('start-menu');
startBtn.addEventListener('click', function(e){
  e.stopPropagation();
  startMenu.classList.toggle('hidden');
  startBtn.classList.toggle('active');
});
startMenu.querySelectorAll('li[data-window]').forEach(function(li){
  li.addEventListener('click', function(){
    openWindow(li.getAttribute('data-window'));
    startMenu.classList.add('hidden');
    startBtn.classList.remove('active');
  });
});
document.getElementById('shutdown').addEventListener('click', function(){
  openWindow('shutdown');
  startMenu.classList.add('hidden');
  startBtn.classList.remove('active');
});

/* quicklaunch show desktop */
document.querySelectorAll('.ql-btn[data-ql="desktop"]').forEach(function(b){
  b.addEventListener('click', function(){
    document.querySelectorAll('.window').forEach(function(w){ w.style.display = 'none'; });
    updateTaskbar();
  });
});
document.querySelectorAll('.ql-btn[data-window]').forEach(function(b){
  b.addEventListener('click', function(){ openWindow(b.getAttribute('data-window')); });
});

/* ---------- CLOCK ---------- */
function updateClock(){
  var d = new Date();
  var h = d.getHours(), m = d.getMinutes();
  var ap = h >= 12 ? 'PM' : 'AM';
  h = h % 12; if (h === 0) h = 12;
  document.getElementById('clock').textContent = h + ':' + (m<10?'0':'') + m + ' ' + ap;
}
updateClock(); setInterval(updateClock, 1000 * 30);

/* ---------- EULA ---------- */
window.closeEULA = function(){
  document.getElementById('eula-modal').classList.add('hidden');
};

/* ---------- JAKE APP: EDITIONS NAV ---------- */
function wireJakeApp(node){
  var addressInput = node.querySelector('#addressInput');
  var sbPage = node.querySelector('#sbPage');

  function setEdition(ed){
    // toolbar active
    node.querySelectorAll('.tb-btn').forEach(function(b){ b.classList.toggle('active', b.dataset.ed === ed); });
    // outlook bar active
    node.querySelectorAll('.ob-item').forEach(function(b){ b.classList.toggle('ob-active', b.dataset.ed === ed); });
    // panes
    node.querySelectorAll('.ed-pane').forEach(function(p){ p.classList.add('hidden'); });
    var pane = node.querySelector('#ed-' + ed);
    if (pane) pane.classList.remove('hidden');
    // address
    var labels = {
      home: 'Home Edition',
      pro: 'Professional Edition',
      ent: 'Enterprise Edition',
      about: 'About Jake',
      proof: 'Receipts',
      eula: 'End User License Agreement'
    };
    var paths = {
      home: 'C:\\Jake\\Suite98\\Editions\\Home',
      pro:  'C:\\Jake\\Suite98\\Editions\\Professional',
      ent:  'C:\\Jake\\Suite98\\Editions\\Enterprise',
      about:'C:\\Jake\\Suite98\\About',
      proof:'C:\\Jake\\Suite98\\Receipts',
      eula: 'C:\\Jake\\Suite98\\Legal\\EULA.TXT'
    };
    addressInput.value = paths[ed] || paths.home;
    sbPage.textContent = labels[ed] || 'Home Edition';
  }

  node.querySelectorAll('.tb-btn[data-ed]').forEach(function(b){
    b.addEventListener('click', function(){ setEdition(b.dataset.ed); });
  });
  node.querySelectorAll('.ob-item[data-ed]').forEach(function(b){
    b.addEventListener('click', function(){ setEdition(b.dataset.ed); });
  });

  // Hire menu item opens phone
  var menuItems = node.querySelectorAll('.menu-bar span');
  menuItems.forEach(function(m){
    m.addEventListener('click', function(){
      var t = m.textContent.replace(/̲|_/g,'').trim();
      if (/hire/i.test(m.textContent)) openWindow('phoneExe');
      else if (/help/i.test(m.textContent)) openWindow('readme');
      else if (/file/i.test(m.textContent)) openWindow('readme');
    });
  });

  setEdition('home');
}

/* ---------- NETWORK NEIGHBORHOOD ---------- */
function wireNetwork(node){
  var NODES = {
    stockunlock: {
      name: 'Stock Unlock (YC W22)',
      body: '<h3>\\\\STOCK-UNLOCK</h3>' +
            '<p><strong>Share:</strong> Jake co-founded Stock Unlock. YC Winter 2022. Raised $1.335M seed.</p>' +
            '<p>Scaled the team to <strong>8 employees</strong> at peak. Thousands of paying customers. ' +
            'Profitable. As of April 2026, it is a side business &mdash; Jake is no longer full-time there. ' +
            'He is looking for the next chapter.</p>' +
            '<p><small>Protocol: NetBEUI. Status: Profitable.</small></p>'
    },
    yc: {
      name: 'YC W22',
      body: '<h3>\\\\YC-W22</h3>' +
            '<p>Y Combinator Winter 2022 batch. Alumni network.</p>' +
            '<p><small>Connection speed: 56 kbps equivalent. Status: Lifelong.</small></p>'
    },
    oscar: {
      name: 'Oscar Health',
      body: '<h3>\\\\OSCAR-HEALTH</h3>' +
            '<p><strong>Senior Software Engineer</strong>, 2017&ndash;2021.</p>' +
            '<p>Shipped production features across insurance + health tech stack. Mentored, reviewed, scaled.</p>'
    },
    youni: {
      name: 'Youni',
      body: '<h3>\\\\YOUNI</h3>' +
            '<p>Early-career engineer, 2015&ndash;2016.</p>'
    },
    commerce: {
      name: 'CommerceHub',
      body: '<h3>\\\\COMMERCEHUB</h3>' +
            '<p>Engineer, 2013&ndash;2016. First shipping job.</p>'
    },
    acm: {
      name: 'ACM @ SUNY Albany',
      body: '<h3>\\\\ACM-SUNY-ALB</h3>' +
            '<p><strong>President</strong>, Association for Computing Machinery chapter.</p>' +
            '<p>BS Computer Science + Math, 2015.</p>'
    },
    cube: {
      name: 'Cube / WCA',
      body: '<h3>\\\\CUBE-WCA</h3>' +
            '<p>Competitive Rubik\'s cube solver. <strong>13.95-second average</strong>. Unicycle-and-cube talent show alumnus.</p>'
    },
    marriage: {
      name: 'Home Network',
      body: '<h3>\\\\HOME-NETWORK</h3>' +
            '<p>Getting married. 1 primary dependency. Status: committed.</p>'
    }
  };
  var detail = node.querySelector('#netDetail');
  var status = node.querySelector('#netStatus');
  node.querySelectorAll('.node-leaf').forEach(function(n){
    n.addEventListener('click', function(){
      node.querySelectorAll('.node-leaf').forEach(function(x){ x.classList.remove('selected'); });
      n.classList.add('selected');
      var data = NODES[n.dataset.node];
      if (!data) return;
      status.textContent = 'Connecting to ' + data.name + '…';
      detail.innerHTML = '<p><em>Connecting…</em></p>';
      setTimeout(function(){
        detail.innerHTML = data.body;
        status.textContent = 'Connected: ' + data.name;
      }, 320 + Math.random()*260);
    });
  });
}

/* ---------- PLUS PACK ---------- */
function wirePlusPack(node){
  node.querySelectorAll('.plus-item').forEach(function(it){
    it.addEventListener('click', function(){ openWindow(it.dataset.window); });
  });
}

/* ---------- CUBE APP (scroll to solve) ---------- */
function wireCube(node){
  var stage = node.querySelector('#cubeStage');
  var cube = node.querySelector('#cube3d');
  var prog = node.querySelector('#cubeProg');
  var rotX = -25, rotY = 32, spin = 0;
  var solveT = 0;         // 0 scrambled -> 1 solved
  var COLORS = ['#e54545','#5dc85d','#3a76e0','#f1c40f','#fff','#ff8000'];
  // build 9 stickers per face
  var faces = ['f-front','f-back','f-left','f-right','f-top','f-bottom'];
  var stickers = [];
  faces.forEach(function(cls, fi){
    var face = cube.querySelector('.' + cls);
    var arr = [];
    for (var i=0;i<9;i++){
      var s = document.createElement('div');
      face.appendChild(s);
      arr.push(s);
    }
    stickers.push({solved: COLORS[fi], scrambled: shuffled(COLORS), cells: arr});
  });
  function shuffled(src){
    var a = []; for (var i=0;i<9;i++) a.push(src[Math.floor(Math.random()*src.length)]);
    return a;
  }
  function paint(t){
    // interpolate from scrambled to solved, per sticker it flips at a threshold
    stickers.forEach(function(face){
      face.cells.forEach(function(cell, idx){
        var thr = (idx + 1) / 10;
        cell.style.background = t >= thr ? face.solved : face.scrambled[idx];
      });
    });
    prog.textContent = Math.round(t*100) + '%';
  }
  paint(0);

  function apply(){
    cube.style.transform = 'rotateX(' + rotX + 'deg) rotateY(' + (rotY + spin) + 'deg)';
  }
  apply();

  stage.addEventListener('wheel', function(e){
    e.preventDefault();
    spin += e.deltaY * 0.6;
    // faster scroll -> more solve
    solveT += (Math.abs(e.deltaY) / 2000);
    if (solveT > 1) solveT = 1;
    paint(solveT);
    apply();
  }, { passive: false });

  // slow autospin when idle
  var idle = 0;
  setInterval(function(){
    idle++;
    if (idle > 20){
      spin += 1.2;
      apply();
    }
  }, 60);
  stage.addEventListener('wheel', function(){ idle = 0; });
  stage.addEventListener('mousemove', function(){ idle = 0; });
}

/* ---------- THEMES ---------- */
function wireThemes(node){
  node.querySelectorAll('.theme-btn').forEach(function(b){
    b.addEventListener('click', function(){
      document.body.classList.remove('theme-purple','theme-green','theme-bsod');
      if (b.dataset.theme !== 'teal') document.body.classList.add('theme-' + b.dataset.theme);
    });
  });
}

/* ---------- My Computer already handled via data-window ---------- */
function wireMyComputer(node){ /* no-op */ }

/* ---------- click on eula link from main app ---------- */
window.showEULA = function(){ document.getElementById('eula-modal').classList.remove('hidden'); };

})();
