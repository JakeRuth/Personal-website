/* ==================================================================
   Concept 02 — Terminal
   Jake Ruth's personal site rebuild prototype.
   Vanilla JS, no build step.
================================================================== */
(function () {
  'use strict';

  const $screen    = document.getElementById('screen');
  const $output    = document.getElementById('output');
  const $promptLn  = document.getElementById('prompt-line');
  const $input     = document.getElementById('input');
  const $caret     = document.getElementById('caret');

  // ----------------------------------------------------------------
  // Utilities
  // ----------------------------------------------------------------
  const esc = (s) => String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  function scrollToBottom() {
    $screen.scrollTop = $screen.scrollHeight;
  }

  function print(html, cls) {
    const div = document.createElement('div');
    div.className = 'line' + (cls ? ' ' + cls : '');
    div.innerHTML = html;
    $output.appendChild(div);
    scrollToBottom();
    return div;
  }

  function printRaw(node) {
    $output.appendChild(node);
    scrollToBottom();
    return node;
  }

  function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
  }

  async function typeLine(text, cls, perCharMs) {
    const div = document.createElement('div');
    div.className = 'line' + (cls ? ' ' + cls : '');
    $output.appendChild(div);
    const delay = perCharMs == null ? 8 : perCharMs;
    for (let i = 0; i < text.length; i++) {
      div.textContent += text[i];
      if (i % 3 === 0) scrollToBottom();
      if (delay > 0) await sleep(delay);
    }
    scrollToBottom();
    return div;
  }

  function echoPromptLine(cmdText) {
    const div = document.createElement('div');
    div.className = 'line';
    div.innerHTML =
      '<span class="ps1"><span class="user">jake@ruth</span>:<span class="path">~</span>$&nbsp;</span>' +
      esc(cmdText);
    $output.appendChild(div);
  }

  // ----------------------------------------------------------------
  // Phosphor trail on background (canvas)
  // ----------------------------------------------------------------
  (function mouseTrail() {
    const canvas = document.getElementById('trail');
    const ctx = canvas.getContext('2d');
    let w = 0, h = 0;

    function resize() {
      w = canvas.width  = window.innerWidth  * devicePixelRatio;
      h = canvas.height = window.innerHeight * devicePixelRatio;
      canvas.style.width  = window.innerWidth + 'px';
      canvas.style.height = window.innerHeight + 'px';
    }
    resize();
    window.addEventListener('resize', resize);

    const points = [];
    window.addEventListener('mousemove', (e) => {
      points.push({
        x: e.clientX * devicePixelRatio,
        y: e.clientY * devicePixelRatio,
        life: 1.0
      });
      if (points.length > 60) points.shift();
    });

    function tick() {
      // Fade prior frame
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = 'rgba(0,0,0,0.18)';
      ctx.fillRect(0, 0, w, h);

      ctx.globalCompositeOperation = 'lighter';
      for (const p of points) {
        const r = 18 * devicePixelRatio * p.life;
        const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r);
        grd.addColorStop(0, 'rgba(51,255,122,' + (0.22 * p.life).toFixed(3) + ')');
        grd.addColorStop(1, 'rgba(51,255,122,0)');
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx.fill();
        p.life *= 0.94;
      }
      for (let i = points.length - 1; i >= 0; i--) {
        if (points[i].life < 0.03) points.splice(i, 1);
      }
      requestAnimationFrame(tick);
    }
    tick();
  })();

  // ----------------------------------------------------------------
  // Command registry
  // ----------------------------------------------------------------
  const COMMANDS = {};

  function register(name, opts) {
    COMMANDS[name] = Object.assign({ desc: '', fn: () => {} }, opts);
  }

  // ----------------------------------------------------------------
  // Content
  // ----------------------------------------------------------------
  const ASCII_HEAD = [
    "      _       _              ____        _   _     ",
    "     | | __ _| | _____      |  _ \\ _   _| |_| |__  ",
    "  _  | |/ _` | |/ / _ \\     | |_) | | | | __| '_ \\ ",
    " | |_| | (_| |   <  __/     |  _ <| |_| | |_| | | |",
    "  \\___/ \\__,_|_|\\_\\___|     |_| \\_\\\\__,_|\\__|_| |_|",
    "                                                   "
  ].join('\n');

  register('help', {
    desc: 'List available commands',
    fn: function () {
      print('<span class="accent">Available commands</span> — click or type:');
      const grid = document.createElement('div');
      grid.className = 'help-grid';
      const order = ['whoami', 'bio', 'history', 'career', 'projects', 'stock-unlock',
                     'cube --solve', 'contact', 'resume', 'fortune', 'sudo hire-me', 'clear'];
      order.forEach((name) => {
        const key = name.split(' ')[0].replace(/^sudo$/, 'sudo');
        const lookup = name === 'sudo hire-me' ? 'sudo hire-me'
                      : name === 'cube --solve' ? 'cube --solve'
                      : name;
        const meta = COMMANDS[lookup] || COMMANDS[name.split(' ')[0]];
        const btn = document.createElement('button');
        btn.className = 'cmd-btn';
        btn.type = 'button';
        btn.innerHTML = '<span>' + esc(name) + '</span>' +
                        '<span class="desc">' + esc((meta && meta.desc) || '') + '</span>';
        btn.addEventListener('click', () => {
          runUserCommand(name);
        });
        grid.appendChild(btn);
      });
      printRaw(grid);
      print('<span class="dim">Tips: Tab autocompletes. &uarr;/&darr; cycles history. Ctrl+L clears.</span>');
    }
  });

  register('whoami', {
    desc: 'Short bio',
    fn: function () {
      print('<span class="accent">jake ruth</span> — software engineer, founder, NYC.');
      print('Co-founded <span class="accent">Stock Unlock</span> (YC W22). ~13 years shipping software. Currently re-pointing my compass toward the next thing.');
      print('AI philosophy: driver in the driver\'s seat, not driven by the car.');
    }
  });

  register('bio', {
    desc: 'The slightly longer story',
    fn: function () {
      print('<span class="accent">// bio.txt</span>', 'dim');
      print('I\'m Jake. Software engineer and founder in the NYC area.');
      print('Started coding in 2013. Interned at CommerceHub in college, came back full-time after');
      print('graduating from SUNY Albany in 2015 (BS CS + Applied Math, 3.88 GPA, ACM president).');
      print('');
      print('Co-founded <span class="accent">Youni</span> in 2015 (CTO). Joined <span class="accent">Oscar Health</span> in 2017 as a senior engineer.');
      print('In 2021 I left to build <span class="accent">Stock Unlock</span> — YC W22, $1.335M seed, 8-person team at peak,');
      print('thousands of paying customers. It still runs profitably as a side business — I\'m not');
      print('full-time on it as of April 2026. Now re-pointing my compass toward the next thing.');
      print('');
      print('Outside of code: competitive Rubik\'s cuber (13.95s avg, Nationals 2008-2014),');
      print('unicyclist-while-cubing at company talent shows, getting married April 2026.');
      print('');
      print('I hate overcharging for shit software that rips off retail investors. One competitor');
      print('computed "margin of safety" as (current price / all-time high). That is ape-shit.');
    }
  });

  register('history', {
    desc: 'Chronological career log',
    fn: function () {
      const rows = [
        ['2013-2016', 'CommerceHub',  'Intern → Engineer. First job. Shipped real software to real customers.'],
        ['2015-2016', 'Youni',        'Co-founder / CTO. Early lessons in product, fundraising, and hard endings.'],
        ['2017-2021', 'Oscar Health', 'Senior Software Engineer. Big-company systems, healthcare at scale.'],
        ['2021-2026', 'Stock Unlock', 'Co-founder. YC W22. $1.335M seed. 8 employees peak. Thousands of customers.'],
        ['2026-now ', 'Next chapter', 'Not full-time at Stock Unlock. Redefining what\'s next.']
      ];
      print('<span class="accent">// career log</span>', 'dim');
      print('<span class="dim">  when         where              what</span>');
      print('<span class="dim">  ----         -----              ----</span>');
      rows.forEach((r) => {
        const line =
          '  <span class="accent">' + r[0] + '</span>  ' +
          '<span>' + esc(r[1].padEnd(18)) + '</span> ' +
          esc(r[2]);
        print(line);
      });
      print('');
      print('<span class="dim">Also: ACM president @ SUNY Albany, BS CS + Applied Math 2015 (3.88).</span>');
    }
  });

  register('career', {
    desc: 'Alias for history',
    fn: () => COMMANDS['history'].fn()
  });

  register('projects', {
    desc: 'Things I\'ve built',
    fn: function () {
      const projects = [
        {
          name: 'Stock Unlock',
          years: '2021 - present',
          blurb: 'Co-founded investing research platform. YC W22, $1.335M seed, 8-person team at peak, thousands of paying customers. Still runs as a profitable business; I\'m not full-time on it.'
        },
        {
          name: 'Youni',
          years: '2015 - 2016',
          blurb: 'Co-founder and CTO of a student-focused startup right out of college. Didn\'t pan out; I learned how hard product-market fit is and how much I actually liked the building part.'
        },
        {
          name: 'Speedcubing toolchain',
          years: 'ongoing',
          blurb: 'Personal scripts and drills for Rubik\'s cube practice. 13.95s average at my peak. Competed at US Nationals 2008-2014.'
        },
        {
          name: 'Personal website (you are here)',
          years: '2026',
          blurb: 'The rebuild. Twelve concept prototypes in parallel. This is #02 — Terminal.'
        }
      ];
      print('<span class="accent">// projects</span>', 'dim');
      projects.forEach((p, i) => {
        print('');
        print('  <span class="accent">[' + (i+1) + '] ' + esc(p.name) + '</span>  <span class="dim">(' + esc(p.years) + ')</span>');
        print('      ' + esc(p.blurb));
      });
    }
  });

  register('stock-unlock', {
    desc: 'The Stock Unlock story, short version',
    fn: function () {
      print('<span class="accent">stock-unlock</span> — investing research for retail investors who are tired of being ripped off.');
      print('');
      print('  Stage   : YC W22, raised $1.335M seed');
      print('  Team    : 8 employees at peak');
      print('  Users   : thousands of paying customers');
      print('  Revenue : ~$100-200K/yr profit, recurring');
      print('  My role : co-founder, built it, scaled it');
      print('  Status  : still runs as a profitable side business. I\'m not full-time there as of April 2026.');
      print('');
      print('Why it exists: one of our competitors computed "margin of safety" as');
      print('(current price / all-time high). That\'s <span class="err">ape-shit retarded</span>. Retail investors');
      print('deserve better tools than that, and they deserve to not be gouged for them.');
    }
  });

  register('contact', {
    desc: 'How to reach me',
    fn: function () {
      print('<span class="accent">// contact</span>', 'dim');
      print('  email    : <a class="link" href="mailto:jake@stockunlock.com">jake@stockunlock.com</a>');
      print('  github   : <a class="link" href="https://github.com/jakeruth" target="_blank" rel="noopener">github.com/jakeruth</a>');
      print('  linkedin : <a class="link" href="https://www.linkedin.com/in/jake-ruth/" target="_blank" rel="noopener">linkedin.com/in/jake-ruth</a>');
      print('  location : NYC area');
      print('');
      print('<span class="dim">Best way to actually get a reply: an interesting email.</span>');
    }
  });

  register('resume', {
    desc: 'Open / download resume',
    fn: function () {
      print('<span class="dim">GET ../../official_resume.pdf ... 200 OK</span>');
      print('Opening resume: <a class="link" href="../../official_resume.pdf" target="_blank" rel="noopener">official_resume.pdf</a>');
      print('<span class="dim">(click the link above; your browser will open or download it)</span>');
      try {
        window.open('../../official_resume.pdf', '_blank', 'noopener');
      } catch (e) { /* ignore, user can click */ }
    }
  });

  register('clear', {
    desc: 'Clear the screen',
    fn: function () {
      $output.innerHTML = '';
    }
  });

  register('fortune', {
    desc: 'A Jake-flavored aphorism',
    fn: function () {
      const quotes = [
        'Driver in the driver\'s seat, not driven by the car.',
        'Shipped > perfect. Perfect is a feeling, shipped is a file.',
        'Every founder hits a wall. The wall is the point.',
        '"Margin of safety" computed as (price / all-time-high) is how you spot frauds, not bargains.',
        'If the software is expensive AND bad, that\'s not a product, that\'s a heist.',
        'The Rubik\'s cube taught me lookahead is worth more than finger speed.',
        'Retail investors are not dumb money. They\'re under-served money.',
        'The best side project is the one you\'d still build if nobody paid.',
        'Write the email you\'d want to receive.',
        'You are not your last title. You are your next one.'
      ];
      const q = quotes[Math.floor(Math.random() * quotes.length)];
      print('<span class="accent">' + esc(q) + '</span>');
    }
  });

  register('sudo hire-me', {
    desc: 'The cheeky recruiting channel',
    fn: async function () {
      await typeLine('[sudo] password for employer: ', 'dim', 18);
      // simulate masked entry
      const last = $output.lastChild;
      for (let i = 0; i < 8; i++) {
        await sleep(90 + Math.random() * 80);
        last.textContent += '*';
        scrollToBottom();
      }
      await sleep(220);
      print('<span class="err">Sorry, that is not the password.</span>');
      await sleep(300);
      print('<span class="accent">...kidding. You\'re in.</span>');
      await sleep(200);
      print('');
      print('  <span class="accent">Hello.</span> If you\'re here to offer me something genuinely interesting,');
      print('  I want to hear about it. I\'m hard to recruit for the usual reasons');
      print('  (I\'ve co-founded, I\'ve scaled, I\'ve shipped), and easy to recruit');
      print('  for the unusual ones (a sharp problem, a weird team, real leverage).');
      print('');
      print('  Reach me: <a class="link" href="mailto:jake@stockunlock.com">jake@stockunlock.com</a>');
      print('  Subject-line tip: be specific, be curious, do not say "synergy".');
    }
  });

  // ---- sudo (catch-all) — so `sudo anything` has a response ------
  register('sudo', {
    desc: '',
    fn: function (args) {
      if (args.join(' ') === 'hire-me') {
        return COMMANDS['sudo hire-me'].fn();
      }
      print('<span class="err">jake is not in the sudoers file.  This incident will be reported.</span>');
    }
  });

  // ----------------------------------------------------------------
  // cube --solve — ASCII cube animation
  // ----------------------------------------------------------------
  register('cube --solve', {
    desc: 'Watch a 3x3x3 get solved (ASCII)',
    fn: async function () {
      return cubeSolve();
    }
  });
  register('cube', {
    desc: 'Try: cube --solve',
    fn: async function (args) {
      if (args[0] === '--solve' || args[0] === 'solve') {
        return cubeSolve();
      }
      print('usage: <span class="accent">cube --solve</span>');
    }
  });

  function cubeAsciiFrame(colors) {
    // colors is an object mapping face labels to 9-char strings.
    // We'll render a flat net:
    //           U U U
    //           U U U
    //           U U U
    //   L L L   F F F   R R R   B B B
    //   L L L   F F F   R R R   B B B
    //   L L L   F F F   R R R   B B B
    //           D D D
    //           D D D
    //           D D D
    const U = colors.U, L = colors.L, F = colors.F, R = colors.R, B = colors.B, D = colors.D;
    const row = (s, i) => s[i*3] + ' ' + s[i*3+1] + ' ' + s[i*3+2];
    const sp = '        ';
    const lines = [];
    for (let i = 0; i < 3; i++) lines.push(sp + row(U, i));
    for (let i = 0; i < 3; i++) {
      lines.push(row(L, i) + '   ' + row(F, i) + '   ' + row(R, i) + '   ' + row(B, i));
    }
    for (let i = 0; i < 3; i++) lines.push(sp + row(D, i));
    return lines.join('\n');
  }

  async function cubeSolve() {
    print('<span class="dim">$ cube --solve</span>');
    print('<span class="accent">scramble:</span> R U R\' U\' R\' F R2 U\' R\' U\' R U R\' F\'');

    // A stylized, human-readable solve log (not a real solver).
    const moves = [
      "F", "R", "U'", "R'", "F'",      // edges
      "R", "U", "R'", "U'",             // insert
      "y", "R", "U", "R'", "U'",
      "R", "U2", "R'",
      "U", "R", "U'", "R'",
      "R'", "F", "R", "F'",
      "U", "R", "U", "R'", "U", "R", "U2", "R'",
      "R'", "U'", "R", "U'", "R'", "U2", "R"
    ];

    // Pre-baked frames (just recoloring blocks for the vibe).
    const faces = ['U','L','F','R','B','D'];
    const seed = {
      U: 'WWWWWWWWW',
      L: 'OOOOOOOOO',
      F: 'GGGGGGGGG',
      R: 'RRRRRRRRR',
      B: 'BBBBBBBBB',
      D: 'YYYYYYYYY'
    };
    const scrambled = {
      U: 'GWOWWYOBR',
      L: 'YRGOORWBO',
      F: 'WBYGGORGB',
      R: 'BOGRRBYWR',
      B: 'RYGBBYWGW',
      D: 'YRWYYGBOW'
    };

    function tween(a, b, t) {
      // produce a face string where each char flips to b at threshold t
      let out = '';
      for (let i = 0; i < a.length; i++) {
        const r = (i * 37 + 11) % 100 / 100;
        out += (r < t) ? b[i] : a[i];
      }
      return out;
    }

    // render initial scramble
    const cubeDiv = document.createElement('div');
    cubeDiv.className = 'block accent';
    $output.appendChild(cubeDiv);

    cubeDiv.textContent = cubeAsciiFrame(scrambled);
    scrollToBottom();
    await sleep(600);

    // step through the moves, slowly converging
    const movesDiv = document.createElement('div');
    movesDiv.className = 'line dim';
    movesDiv.textContent = 'solving... ';
    $output.appendChild(movesDiv);

    const total = moves.length;
    const start = performance.now();
    for (let i = 0; i < total; i++) {
      const t = (i + 1) / total;
      const frame = {};
      faces.forEach((f) => { frame[f] = tween(scrambled[f], seed[f], t); });
      cubeDiv.textContent = cubeAsciiFrame(frame);
      movesDiv.textContent = 'solving... ' + moves.slice(0, i + 1).join(' ');
      scrollToBottom();
      await sleep(110);
    }
    const wall = ((performance.now() - start) / 1000).toFixed(2);

    // final solved frame
    cubeDiv.textContent = cubeAsciiFrame(seed);
    print('');
    print('<span class="accent">SOLVED</span>   moves: ' + total + '   wall: ' + wall + 's   <span class="dim">(personal best: 13.95s)</span>');
    print('<span class="dim">Cubed at US Nationals 2008-2014. Once solved one while riding a unicycle at an Oscar talent show.</span>');
  }

  // ----------------------------------------------------------------
  // Input handling
  // ----------------------------------------------------------------
  const HISTORY = [];
  let histIdx = -1;     // -1 means "live buffer"
  let liveBuffer = '';
  let busy = false;

  function focusInput() {
    const range = document.createRange();
    const sel = window.getSelection();
    range.selectNodeContents($input);
    range.collapse(false);
    sel.removeAllRanges();
    sel.addRange(range);
    $input.focus();
  }

  function showPrompt() {
    $promptLn.style.display = 'flex';
    $input.textContent = '';
    focusInput();
    scrollToBottom();
  }

  function hidePrompt() {
    $promptLn.style.display = 'none';
  }

  function autocomplete(prefix) {
    const names = Object.keys(COMMANDS).filter((n) => n !== 'sudo'); // hide bare 'sudo' in completion
    const matches = names.filter((n) => n.startsWith(prefix));
    if (matches.length === 0) return null;
    if (matches.length === 1) return matches[0];
    // common prefix
    let common = matches[0];
    for (let i = 1; i < matches.length; i++) {
      let j = 0;
      while (j < common.length && j < matches[i].length && common[j] === matches[i][j]) j++;
      common = common.slice(0, j);
    }
    return { common, matches };
  }

  async function runUserCommand(raw) {
    if (busy) return;
    const text = raw.trim();
    echoPromptLine(raw);
    if (text.length === 0) return;
    HISTORY.push(raw);
    histIdx = -1;

    // parse: first token is command name; "sudo X" special cased via registry
    const tokens = text.split(/\s+/);
    let name, args;
    if (tokens[0] === 'sudo' && tokens.length > 1) {
      name = 'sudo';
      args = tokens.slice(1);
      if (COMMANDS['sudo ' + tokens[1]]) {
        name = 'sudo ' + tokens[1];
        args = tokens.slice(2);
      }
    } else if (tokens[0] === 'cube') {
      if (tokens[1] === '--solve' || tokens[1] === 'solve') {
        name = 'cube --solve';
        args = [];
      } else {
        name = 'cube';
        args = tokens.slice(1);
      }
    } else {
      name = tokens[0];
      args = tokens.slice(1);
    }

    const cmd = COMMANDS[name];
    if (!cmd) {
      // hidden commands
      if (tokens[0] === 'ls')   { print('bio  cube  history  projects  resume.pdf  stock-unlock'); return; }
      if (tokens[0] === 'pwd')  { print('/home/jake'); return; }
      if (tokens[0] === 'cat')  { print('<span class="dim">cat: ' + esc(tokens[1] || '') + ': no such file (try <span class="accent">bio</span> or <span class="accent">whoami</span>)</span>'); return; }
      if (tokens[0] === 'echo') { print(esc(tokens.slice(1).join(' '))); return; }
      if (tokens[0] === 'exit' || tokens[0] === 'logout') { print('<span class="dim">nice try. this shell is forever.</span>'); return; }
      if (tokens[0] === 'man')  { print('<span class="dim">No manual entry for ' + esc(tokens[1] || '') + '. Try <span class="accent">help</span>.</span>'); return; }
      if (tokens[0] === 'vim' || tokens[0] === 'vi' || tokens[0] === 'nano') {
        print('<span class="dim">' + esc(tokens[0]) + ': not installed. This is a resume, not an IDE.</span>');
        return;
      }
      if (tokens[0] === 'rm' && args[0] === '-rf') {
        print('<span class="err">nope.</span>');
        return;
      }
      print('<span class="err">zsh: command not found: ' + esc(tokens[0]) + '</span>' +
            '  <span class="dim">(try <span class="accent">help</span>)</span>');
      return;
    }

    busy = true;
    hidePrompt();
    try {
      await cmd.fn(args);
    } catch (e) {
      print('<span class="err">error: ' + esc(String(e && e.message || e)) + '</span>');
    }
    busy = false;
    showPrompt();
  }

  // keyboard
  $input.addEventListener('keydown', async (e) => {
    if (busy) { e.preventDefault(); return; }

    if (e.key === 'Enter') {
      e.preventDefault();
      const txt = $input.textContent;
      $input.textContent = '';
      await runUserCommand(txt);
      return;
    }

    if (e.key === 'Tab') {
      e.preventDefault();
      const val = $input.textContent;
      const ac = autocomplete(val);
      if (!ac) return;
      if (typeof ac === 'string') {
        $input.textContent = ac;
        focusInput();
      } else {
        // show matches, keep typed value
        print('<span class="dim">' + ac.matches.map(esc).join('   ') + '</span>');
        if (ac.common && ac.common.length > val.length) {
          $input.textContent = ac.common;
          focusInput();
        }
      }
      return;
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (HISTORY.length === 0) return;
      if (histIdx === -1) {
        liveBuffer = $input.textContent;
        histIdx = HISTORY.length - 1;
      } else if (histIdx > 0) {
        histIdx--;
      }
      $input.textContent = HISTORY[histIdx];
      focusInput();
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (histIdx === -1) return;
      if (histIdx < HISTORY.length - 1) {
        histIdx++;
        $input.textContent = HISTORY[histIdx];
      } else {
        histIdx = -1;
        $input.textContent = liveBuffer;
      }
      focusInput();
      return;
    }

    if (e.key === 'l' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      $output.innerHTML = '';
      return;
    }

    if (e.key === 'c' && e.ctrlKey) {
      e.preventDefault();
      echoPromptLine($input.textContent);
      print('<span class="dim">^C</span>');
      $input.textContent = '';
      return;
    }
  });

  // clicking anywhere focuses the input (real terminal feel)
  document.addEventListener('click', (e) => {
    // don't steal focus when clicking a link or button
    if (e.target.closest('a, button')) return;
    focusInput();
  });

  // ----------------------------------------------------------------
  // Boot sequence
  // ----------------------------------------------------------------
  async function boot() {
    // Header
    const header = document.createElement('div');
    header.className = 'ascii-head';
    header.textContent = ASCII_HEAD;
    $output.appendChild(header);
    print('<span class="dim">Phosphor Terminal v4.7 (CRT-1984)  —  jake@ruth  —  ' + new Date().toISOString().slice(0,19).replace('T',' ') + '</span>');
    print('<span class="dim">Type <span class="accent">help</span> for the command list. Or just click around.</span>');
    print('');

    const steps = [
      ['BOOT',    'jake@ruth v4.7 ...................................', 'OK'],
      ['LOAD',    'identity.json ....................................', 'OK'],
      ['MOUNT',   '/career (13y) ....................................', 'OK'],
      ['MOUNT',   '/projects/stock-unlock (YC W22) ..................', 'OK'],
      ['INIT',    'speedcube daemon (PB 13.95s) .....................', 'OK'],
      ['START',   'serendipity.service ..............................', 'OK'],
      ['LOAD',    'retail-investor-advocacy.ko ......................', 'OK'],
      ['CHECK',   'overcharging-for-bad-software ....................', 'FAIL'],
      ['RECOVER', 'mounting opinions on market-cap-to-sales .........', 'OK'],
      ['READY',   'phosphor warm, scanlines stable ..................', 'OK']
    ];

    for (let i = 0; i < steps.length; i++) {
      const [tag, label, status] = steps[i];
      const row = document.createElement('div');
      row.className = 'line boot';
      const ok = status === 'OK';
      row.innerHTML =
        '<span class="dim">[' + tag.padEnd(7) + ']</span> ' +
        esc(label) + ' ' +
        (ok ? '<span class="ok">[ OK ]</span>' : '<span class="fail">[FAIL]</span>');
      $output.appendChild(row);
      scrollToBottom();
      await sleep(95 + Math.random() * 110);
    }
    print('');
    await sleep(200);
    print('<span class="accent">welcome.</span> <span class="dim">tab completes. &uarr;/&darr; for history. try <span class="accent">help</span>.</span>');
    print('');
    showPrompt();
  }

  // Kick off.
  window.addEventListener('load', () => {
    boot();
  });
})();
