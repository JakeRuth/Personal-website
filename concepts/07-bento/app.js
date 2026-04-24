// ============ Spotlight follows cursor ============
const spotlight = document.getElementById('spotlight');
document.addEventListener('mousemove', (e) => {
  spotlight.style.setProperty('--mx', e.clientX + 'px');
  spotlight.style.setProperty('--my', e.clientY + 'px');
});

// ============ Tiles: per-tile gradient + subtle tilt toward cursor ============
const tiles = document.querySelectorAll('.tile');
tiles.forEach((tile) => {
  tile.addEventListener('mousemove', (e) => {
    const r = tile.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 100;
    const y = ((e.clientY - r.top) / r.height) * 100;
    tile.style.setProperty('--lx', x + '%');
    tile.style.setProperty('--ly', y + '%');
    const tx = (x - 50) / 50; // -1..1
    const ty = (y - 50) / 50;
    tile.style.transform = `perspective(900px) rotateX(${(-ty * 2).toFixed(2)}deg) rotateY(${(tx * 2).toFixed(2)}deg) translateY(-2px)`;
  });
  tile.addEventListener('mouseleave', () => {
    tile.style.transform = '';
  });
});

// ============ 02: NYC clock ============
const fmt = new Intl.DateTimeFormat('en-US', {
  timeZone: 'America/New_York',
  hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
});
const fmtDay = new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', weekday: 'short', month: 'short', day: 'numeric' });
const clockTime = document.getElementById('clockTime');
const clockSub = document.getElementById('clockSub');
const clockRing = document.getElementById('clockRing');
function tickClock() {
  const parts = fmt.formatToParts(new Date());
  const h = parts.find(p => p.type === 'hour').value;
  const m = parts.find(p => p.type === 'minute').value;
  const s = parts.find(p => p.type === 'second').value;
  clockTime.textContent = `${h}:${m}:${s}`;
  clockSub.textContent = `New York · ${fmtDay.format(new Date())}`;
  // ring: progress of day (0..1)
  const now = new Date();
  const nycStr = now.toLocaleString('en-US', { timeZone: 'America/New_York' });
  const nyc = new Date(nycStr);
  const seconds = nyc.getHours() * 3600 + nyc.getMinutes() * 60 + nyc.getSeconds();
  const frac = seconds / 86400;
  const circ = 2 * Math.PI * 46;
  clockRing.style.strokeDasharray = circ;
  clockRing.style.strokeDashoffset = circ * (1 - frac);
}
tickClock();
setInterval(tickClock, 1000);

// ============ 03: stock unlock stats count-up + chart ============
function animateCount(el) {
  const target = parseFloat(el.dataset.count);
  const prefix = el.dataset.prefix || '';
  const suffix = el.dataset.suffix || '';
  const dur = 1400;
  const start = performance.now();
  function step(now) {
    const t = Math.min(1, (now - start) / dur);
    const eased = 1 - Math.pow(1 - t, 3);
    const val = target * eased;
    let display;
    if (target >= 1000) display = val.toFixed(0);
    else if (target >= 100) display = val.toFixed(0);
    else display = val.toFixed(1);
    // special format for 1335 -> 1.335
    if (target === 1335) display = (val / 1000).toFixed(3);
    el.textContent = prefix + display + suffix;
    if (t < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}
document.querySelectorAll('.stock-num').forEach(animateCount);

// build a stock chart path
function buildChart() {
  const line = document.getElementById('stockLine');
  const area = document.getElementById('stockArea');
  const w = 200, h = 50;
  const pts = 40;
  const seed = [];
  let y = 38;
  for (let i = 0; i < pts; i++) {
    // trend upward with noise
    const trend = 38 - (i / pts) * 30;
    const noise = (Math.sin(i * 1.6) + Math.cos(i * 0.7)) * 3;
    y = Math.max(4, Math.min(46, trend + noise));
    seed.push([i * (w / (pts - 1)), y]);
  }
  const d = seed.map((p, i) => (i === 0 ? `M${p[0]},${p[1]}` : `L${p[0]},${p[1]}`)).join(' ');
  line.setAttribute('d', d);
  area.setAttribute('d', d + ` L${w},${h} L0,${h} Z`);
}
buildChart();

// ============ 04: cube — occasional mini-scramble ============
// 3D cube is CSS only (faces + spin). Optional: click to scramble timer display.
const cubeTime = document.getElementById('cubeTime');
const times = ['13.95', '12.41', '14.22', '13.17', '11.88', '14.03', '13.95'];
let cubeIdx = 0;
document.querySelector('.tile-cube').addEventListener('click', () => {
  cubeIdx = (cubeIdx + 1) % times.length;
  cubeTime.innerHTML = times[cubeIdx] + '<span>s</span>';
});

// ============ 05: now playing ============
const songs = [
  { title: 'Nikes', artist: 'Frank Ocean' },
  { title: 'Still D.R.E.', artist: 'Dr. Dre · Snoop Dogg' },
  { title: 'Sunflower, Vol. 6', artist: 'Harry Styles' },
  { title: 'Heart-Shaped Box', artist: 'Nirvana' },
  { title: 'Redbone', artist: 'Childish Gambino' },
  { title: 'Passionfruit', artist: 'Drake' },
  { title: 'Motion Sickness', artist: 'Phoebe Bridgers' },
];
let songIdx = 0;
const mt = document.getElementById('musicTitle');
const ma = document.getElementById('musicArtist');
document.getElementById('musicSkip').addEventListener('click', (e) => {
  e.stopPropagation();
  songIdx = (songIdx + 1) % songs.length;
  mt.textContent = songs[songIdx].title;
  ma.textContent = songs[songIdx].artist;
});

// ============ 08: resume download (mock) ============
document.getElementById('resumeDl').addEventListener('click', (e) => {
  e.stopPropagation();
  const btn = e.currentTarget;
  const original = btn.innerHTML;
  btn.innerHTML = '<span class="dl-arrow">✓</span> mock download';
  setTimeout(() => { btn.innerHTML = original; }, 1600);
});

// ============ 09: reaction timer game ============
(() => {
  const pad = document.getElementById('gamePad');
  const padText = document.getElementById('gamePadText');
  const log = document.getElementById('gameLog');
  const bestEl = document.getElementById('gameBest');
  let state = 'idle'; // idle | waiting | go | done | fail
  let startAt = 0;
  let timer = null;
  let best = Infinity;

  function setState(s) {
    state = s;
    pad.classList.remove('state-waiting', 'state-go', 'state-fail', 'state-win');
    if (s === 'waiting') pad.classList.add('state-waiting');
    if (s === 'go') pad.classList.add('state-go');
    if (s === 'fail') pad.classList.add('state-fail');
    if (s === 'done') pad.classList.add('state-win');
  }

  function startRound() {
    setState('waiting');
    padText.textContent = 'wait for green...';
    log.textContent = 'don\'t click early.';
    const delay = 800 + Math.random() * 2400;
    timer = setTimeout(() => {
      setState('go');
      padText.textContent = 'CLICK!';
      startAt = performance.now();
    }, delay);
  }

  pad.addEventListener('click', (e) => {
    e.stopPropagation();
    if (state === 'idle' || state === 'done' || state === 'fail') {
      startRound();
      return;
    }
    if (state === 'waiting') {
      clearTimeout(timer);
      setState('fail');
      padText.textContent = 'too early!';
      log.textContent = 'click again to retry.';
      return;
    }
    if (state === 'go') {
      const ms = Math.round(performance.now() - startAt);
      setState('done');
      padText.textContent = ms + ' ms';
      if (ms < best) {
        best = ms;
        bestEl.textContent = ms + ' ms';
        log.textContent = 'new best! click to go again.';
      } else {
        log.textContent = 'not bad. click to try again.';
      }
    }
  });
})();

// ============ 10: quote rotate ============
const quotes = [
  "Driver in the driver's seat, not driven by the car.",
  "Ship boring software. Charge fair prices. Sleep at night.",
  "Retail investors deserve better than the default.",
  "Built it, scaled it, profitable. Next chapter loading.",
  "The best algorithm is the one you can explain to your mom.",
];
const quoteText = document.getElementById('quoteText');
const quoteIdx = document.getElementById('quoteIdx');
const quoteTile = document.getElementById('quoteTile');
let qi = 0;
function renderQuote() {
  quoteText.style.opacity = '0';
  quoteText.style.transform = 'translateY(6px)';
  setTimeout(() => {
    quoteText.textContent = quotes[qi];
    quoteIdx.textContent = String(qi + 1).padStart(2, '0') + ' / ' + String(quotes.length).padStart(2, '0');
    quoteText.style.transition = 'opacity 300ms, transform 300ms';
    quoteText.style.opacity = '1';
    quoteText.style.transform = 'translateY(0)';
  }, 150);
}
quoteTile.addEventListener('click', () => {
  qi = (qi + 1) % quotes.length;
  renderQuote();
});
renderQuote();

// ============ keyboard: pressing 'q' cycles quotes, 'r' starts reaction ============
document.addEventListener('keydown', (e) => {
  if (e.key === 'q' || e.key === 'Q') {
    qi = (qi + 1) % quotes.length;
    renderQuote();
  }
});
