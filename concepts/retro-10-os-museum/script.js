/* ==================================================
   THE OS MUSEUM — interactions
   ================================================== */

(function(){
  const $  = (s,r=document)=>r.querySelector(s);
  const $$ = (s,r=document)=>Array.from(r.querySelectorAll(s));

  /* ---------- clocks ---------- */
  function tick(){
    const d = new Date();
    const hh = d.getHours();
    const mm = String(d.getMinutes()).padStart(2,'0');
    const h12 = ((hh+11)%12)+1;
    const ampm = hh>=12?'PM':'AM';
    const e95  = document.getElementById('clk95');
    const exp  = document.getElementById('clkxp');
    const eos  = document.getElementById('clkOSX');
    const ear  = document.getElementById('clkAero');
    if(e95) e95.textContent = `${h12}:${mm} ${ampm}`;
    if(exp) exp.textContent = `${h12}:${mm} ${ampm}`;
    if(eos) eos.textContent = `${h12}:${mm}`;
    if(ear) ear.textContent = `${h12}:${mm} ${ampm}`;
    const chA = document.getElementById('chA'), cmA=document.getElementById('cmA');
    if(chA){
      const mAng = (d.getMinutes())*6;
      const hAng = (hh%12)*30 + d.getMinutes()*0.5;
      chA.style.transform = `rotate(${hAng-90}deg)`;
      cmA.style.transform = `rotate(${mAng-90}deg)`;
    }
  }
  tick(); setInterval(tick,15000);

  /* ---------- navigation between rooms ---------- */
  const rooms = ['lobby','room1','room2','room3','room4','room5','curator'];
  function goto(id){
    const el = document.getElementById(id);
    if(!el) return;
    el.scrollIntoView({behavior:'smooth', block:'start'});
  }
  document.addEventListener('click', (e)=>{
    const t = e.target.closest('[data-goto]');
    if(t){ e.preventDefault(); goto(t.getAttribute('data-goto')); }
  });
  const backBtn = document.getElementById('back-lobby');
  if(backBtn) backBtn.addEventListener('click', ()=>goto('lobby'));

  /* ---------- side nav active state + progress ---------- */
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(en=>{
      if(!en.isIntersecting) return;
      const id = en.target.id;
      $$('#sidenav .sn-list li').forEach(li=>{
        li.classList.toggle('active', li.getAttribute('data-goto')===id);
      });
      const idx = rooms.indexOf(id);
      const pct = idx<0?0: (idx===rooms.length-1?100: (idx/(rooms.length-2))*100);
      const bar = document.getElementById('sn-bar');
      if(bar) bar.style.width = pct + '%';
      // progressive cube solve trigger
      updateCubeSolveProgress(idx);
    });
  }, {threshold:0.4});
  $$('.room').forEach(r=>io.observe(r));

  /* ---------- Win95 pixel cube scramble animation ---------- */
  const pc = document.getElementById('pixel-cube');
  if(pc){
    pc.classList.add('scrambled');
  }

  /* ---------- Aero 3D cube (Three.js) ---------- */
  function initAeroCube(){
    const canvas = document.getElementById('aero-cube');
    if(!canvas || typeof THREE === 'undefined') return;
    const w = canvas.clientWidth || 320, h = canvas.clientHeight || 280;
    const scene = new THREE.Scene();
    const cam = new THREE.PerspectiveCamera(40, w/h, 0.1, 100);
    cam.position.set(3.5, 2.6, 4.2); cam.lookAt(0,0,0);
    const r = new THREE.WebGLRenderer({canvas, alpha:true, antialias:true});
    r.setPixelRatio(window.devicePixelRatio||1);
    r.setSize(w,h,false);

    const group = new THREE.Group();
    const faceColors = [0xff3b3b,0xff9a2a,0xffe14a,0xffffff,0x3fcf5a,0x2a8cff];
    // build 3x3x3
    for(let x=-1;x<=1;x++){
      for(let y=-1;y<=1;y++){
        for(let z=-1;z<=1;z++){
          const geo = new THREE.BoxGeometry(0.96,0.96,0.96);
          const mats = [];
          for(let i=0;i<6;i++){
            mats.push(new THREE.MeshPhongMaterial({
              color:faceColors[i], shininess:80, specular:0xffffff, transparent:true, opacity:0.92
            }));
          }
          const m = new THREE.Mesh(geo, mats);
          m.position.set(x,y,z);
          group.add(m);
        }
      }
    }
    scene.add(group);
    const light1 = new THREE.DirectionalLight(0xffffff,1); light1.position.set(4,6,5); scene.add(light1);
    const light2 = new THREE.DirectionalLight(0xaaccff,0.5); light2.position.set(-5,-2,3); scene.add(light2);
    scene.add(new THREE.AmbientLight(0xffffff,0.5));

    // glass outer
    const glassGeo = new THREE.BoxGeometry(3.3,3.3,3.3);
    const glassMat = new THREE.MeshPhongMaterial({color:0xffffff, transparent:true, opacity:0.05, shininess:120});
    const glass = new THREE.Mesh(glassGeo, glassMat); scene.add(glass);

    function loop(){
      group.rotation.x += 0.003;
      group.rotation.y += 0.005;
      r.render(scene,cam);
      requestAnimationFrame(loop);
    }
    loop();
  }
  // ensure three.js loaded
  if(typeof THREE !== 'undefined'){ initAeroCube(); }
  else { window.addEventListener('load', initAeroCube); }

  /* ---------- Now room cube faces build ---------- */
  function buildNowCube(){
    const host = document.getElementById('now-cube');
    if(!host) return;
    const faces = [
      {cls:'ft', c:'#ffffff'},
      {cls:'bk', c:'#ffe14a'},
      {cls:'rt', c:'#ff3b3b'},
      {cls:'lf', c:'#ff9a2a'},
      {cls:'tp', c:'#3fcf5a'},
      {cls:'bt', c:'#2a8cff'},
    ];
    faces.forEach(f=>{
      const div = document.createElement('div');
      div.className = 'f ' + f.cls;
      for(let i=0;i<9;i++){
        const sticker = document.createElement('i');
        sticker.style.setProperty('--c', f.c);
        div.appendChild(sticker);
      }
      host.appendChild(div);
    });
  }
  buildNowCube();

  /* ---------- Progressive cube solve across rooms ----------
     The pixel cube in Room 1 starts scrambled. As the visitor
     enters later rooms we mark them as "more solved" visually.
  ---------------------------------------------------------- */
  function updateCubeSolveProgress(idx){
    // idx: 0 lobby, 1-5 rooms, 6 curator
    const pc = document.getElementById('pixel-cube');
    if(!pc) return;
    // 0 or 1 -> scrambled, 2 partial, 3 more, 4 near, 5 solved
    if(idx<=1){
      pc.classList.add('scrambled');
      pc.style.background = `
        linear-gradient(#000 2px,transparent 2px) 0 0/43px 43px repeat,
        linear-gradient(90deg,#000 2px,transparent 2px) 0 0/43px 43px repeat,
        conic-gradient(from 0deg,
          #ff2222 0 11%, #ffcc00 11% 22%, #1e8cff 22% 33%,
          #22cc55 33% 44%, #ffffff 44% 55%, #ff8822 55% 66%,
          #ff2222 66% 77%, #1e8cff 77% 88%, #22cc55 88% 100%)`;
    } else if(idx===2){
      pc.style.background = `
        linear-gradient(#000 2px,transparent 2px) 0 0/43px 43px repeat,
        linear-gradient(90deg,#000 2px,transparent 2px) 0 0/43px 43px repeat,
        linear-gradient(90deg,#ff2222 0 33%, #ffcc00 33% 66%, #1e8cff 66% 100%)`;
    } else if(idx===3){
      pc.style.background = `
        linear-gradient(#000 2px,transparent 2px) 0 0/43px 43px repeat,
        linear-gradient(90deg,#000 2px,transparent 2px) 0 0/43px 43px repeat,
        linear-gradient(180deg,#ff2222 0 33%, #ffffff 33% 66%, #22cc55 66% 100%)`;
    } else if(idx===4){
      pc.style.background = `
        linear-gradient(#000 2px,transparent 2px) 0 0/43px 43px repeat,
        linear-gradient(90deg,#000 2px,transparent 2px) 0 0/43px 43px repeat,
        #ffe14a`;
    } else {
      pc.style.background = `
        linear-gradient(#000 2px,transparent 2px) 0 0/43px 43px repeat,
        linear-gradient(90deg,#000 2px,transparent 2px) 0 0/43px 43px repeat,
        #ffffff`;
    }
  }

  /* ---------- Curator graph (canvas, no deps) ---------- */
  function drawGraph(){
    const cv = document.getElementById('cur-canvas');
    if(!cv) return;
    const dpr = window.devicePixelRatio || 1;
    const w = cv.clientWidth, h = cv.clientHeight;
    cv.width = w*dpr; cv.height = h*dpr;
    const ctx = cv.getContext('2d');
    ctx.scale(dpr,dpr);
    ctx.clearRect(0,0,w,h);

    // nodes
    const nodes = [
      // type: era, role, skill, fact
      {id:'1995', type:'era',  x:0.10, y:0.20, label:'1995 · Hobbyist'},
      {id:'2001', type:'era',  x:0.30, y:0.12, label:'2001-15 · Student'},
      {id:'2017', type:'era',  x:0.55, y:0.18, label:'2017-21 · Oscar'},
      {id:'2022', type:'era',  x:0.78, y:0.12, label:'2022- · Stock Unlock'},
      {id:'2026', type:'era',  x:0.92, y:0.22, label:'2026 · Now'},

      {id:'cube',  type:'fact', x:0.05, y:0.55, label:"Rubik's cube · 13.95s"},
      {id:'uni',   type:'fact', x:0.16, y:0.82, label:"Unicycle + cube"},
      {id:'acm',   type:'role', x:0.30, y:0.50, label:"ACM President"},
      {id:'ch',    type:'role', x:0.40, y:0.75, label:"CommerceHub"},
      {id:'youni', type:'role', x:0.24, y:0.35, label:"Youni"},
      {id:'bs',    type:'fact', x:0.42, y:0.42, label:"BS CS+Math 2015"},
      {id:'oscar', type:'role', x:0.58, y:0.55, label:"Oscar Health SE"},
      {id:'ss',    type:'skill',x:0.48, y:0.62, label:"Investing spreadsheet"},
      {id:'yc',    type:'fact', x:0.75, y:0.40, label:"YC W22 · $1.335M"},
      {id:'su',    type:'role', x:0.82, y:0.60, label:"Stock Unlock founder"},
      {id:'prof',  type:'fact', x:0.92, y:0.50, label:"Profitable, not FT"},
      {id:'ai',    type:'skill',x:0.70, y:0.82, label:"AI-native building"},
      {id:'pat',   type:'skill',x:0.20, y:0.62, label:"Pattern recognition"},
      {id:'scale', type:'skill',x:0.50, y:0.85, label:"Scaling orgs"},
      {id:'fin',   type:'skill',x:0.64, y:0.72, label:"Finance + SW"}
    ];

    // edges
    const edges = [
      // chronology
      ['1995','2001'],['2001','2017'],['2017','2022'],['2022','2026'],
      // cube thread
      ['cube','uni'],['cube','pat'],['pat','ch'],['pat','su'],
      // student
      ['2001','acm'],['2001','ch'],['2001','bs'],['2001','youni'],
      ['acm','scale'],
      // oscar
      ['2017','oscar'],['oscar','scale'],['oscar','ss'],['ss','su'],
      // founder
      ['2022','yc'],['2022','su'],['su','fin'],['su','prof'],['su','scale'],
      // now
      ['2026','ai'],['ai','su'],['2026','prof']
    ];

    const typeColor = {era:'#c39bff', role:'#7ac4ff', skill:'#ffd24a', fact:'#ff6fbb'};
    function pos(n){ return {x:n.x*w, y:n.y*h}; }

    // edges first
    ctx.lineWidth=1; ctx.strokeStyle='rgba(255,255,255,.15)';
    edges.forEach(([a,b])=>{
      const na = nodes.find(n=>n.id===a), nb=nodes.find(n=>n.id===b);
      if(!na||!nb) return;
      const pa=pos(na), pb=pos(nb);
      ctx.beginPath(); ctx.moveTo(pa.x,pa.y); ctx.lineTo(pb.x,pb.y); ctx.stroke();
    });

    // nodes
    nodes.forEach(n=>{
      const p = pos(n);
      const c = typeColor[n.type];
      const r = n.type==='era'?9:6;
      ctx.beginPath(); ctx.arc(p.x,p.y,r+3,0,Math.PI*2); ctx.fillStyle=c+'33'; ctx.fill();
      ctx.beginPath(); ctx.arc(p.x,p.y,r,0,Math.PI*2); ctx.fillStyle=c; ctx.fill();
      ctx.font='12px Inter, sans-serif'; ctx.fillStyle='#e5ebff';
      ctx.textAlign='center';
      ctx.fillText(n.label, p.x, p.y - r - 8);
    });
  }
  function onResize(){ drawGraph(); }
  window.addEventListener('resize', onResize);
  // draw when curator comes into view (canvas size is then valid)
  const curObs = new IntersectionObserver((es)=>{
    es.forEach(e=>{ if(e.isIntersecting) drawGraph(); });
  },{threshold:0.1});
  const curEl = document.getElementById('curator');
  if(curEl) curObs.observe(curEl);
  // also try once on load
  window.addEventListener('load', drawGraph);

})();
