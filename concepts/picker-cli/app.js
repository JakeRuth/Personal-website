/* Picker-CLI — terminal entry for jakeruth.com rebuild.
   Vanilla JS. No build. No deps. */

(function () {
  'use strict';

  // -----------------------------
  // modes
  // -----------------------------
  const MODES = [
    { name: 'xp',     slug: 'xp-luna-v2',        desc: 'nostalgic Windows XP' },
    { name: 'saas',   slug: 'enterprise-saas-v2',desc: 'enterprise dev tool' },
    { name: 'git',    slug: 'git-log-v2',        desc: 'git log / engineer-native' },
    { name: 'readme', slug: 'readme-mode',       desc: 'styled markdown README' },
    { name: 'vista',  slug: 'vista-faithful-v2', desc: 'Windows Vista Aero' },
  ];

  const KNOWN_COMMANDS = [
    'jake-ruth',
    'help',
    'whoami',
    'ls',
    'clear',
    'exit',
  ];

  // -----------------------------
  // dom
  // -----------------------------
  const screen = document.getElementById('screen');
  const out = document.getElementById('output');
  const inputLine = document.getElementById('inputLine');
  const inputText = document.getElementById('inputText');
  const ghostEl = document.getElementById('ghost');
  const hiddenInput = document.getElementById('hiddenInput');

  // -----------------------------
  // state
  // -----------------------------
  let buffer = '';
  let history = [];
  let histIdx = -1; // -1 means "current live buffer"
  let draft = '';
  let locked = true;   // locks input until boot animation finishes
  let launched = false;

  // -----------------------------
  // helpers: output
  // -----------------------------
  function addEl(tagOrClass, text) {
    const div = document.createElement('div');
    div.className = 'line ' + (tagOrClass || '');
    if (text != null) div.textContent = text;
    out.appendChild(div);
    scrollBottom();
    return div;
  }

  function addHTML(className, html) {
    const div = document.createElement('div');
    div.className = 'line ' + (className || '');
    div.innerHTML = html;
    out.appendChild(div);
    scrollBottom();
    return div;
  }

  function scrollBottom() {
    screen.scrollTop = screen.scrollHeight;
  }

  function wait(ms) {
    return new Promise(r => setTimeout(r, ms));
  }

  // -----------------------------
  // ASCII header ("JAKE RUTH")
  // -----------------------------
  const ASCII = [
    '     ██  █████  ██   ██ ███████     ██████  ██    ██ ████████ ██   ██ ',
    '     ██ ██   ██ ██  ██  ██          ██   ██ ██    ██    ██    ██ ██  ',
    '     ██ ███████ █████   █████       ██████  ██    ██    ██     ███   ',
    '██   ██ ██   ██ ██  ██  ██          ██   ██ ██    ██    ██    ██ ██  ',
    ' █████  ██   ██ ██   ██ ███████     ██   ██  ██████     ██    ██   ██',
  ].join('\n');

  // -----------------------------
  // command echo helpers
  // -----------------------------
  function echoCommand(cmd) {
    addHTML('', `<span class="prompt-echo">$</span><span class="cmd-echo">${escapeHTML(cmd)}</span>`);
  }

  function escapeHTML(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // -----------------------------
  // boot sequence
  // -----------------------------
  async function boot() {
    const asciiEl = addEl('ascii');
    asciiEl.textContent = ASCII;

    await wait(220);
    addEl('subtitle', '> hi. pick an experience below. enter to launch.');
    await wait(260);

    echoCommand('jake-ruth --help');
    await wait(120);
    renderHelp();
    await wait(140);

    inputLine.hidden = false;
    renderInputLine('');
    locked = false;
    focusInput();
  }

  function renderHelp() {
    addEl('usage-line', 'Usage: jake-ruth [--mode=<name>]');
    addEl('', '');
    addEl('section', 'Available modes:');
    MODES.forEach(m => {
      const row = document.createElement('div');
      row.className = 'line mode-row';
      row.innerHTML =
        `<span class="mode-name" data-mode="${m.name}" role="button" tabindex="0">${m.name}</span>` +
        `<span class="mode-desc">${escapeHTML(m.desc)}</span>`;
      out.appendChild(row);
    });
    addEl('', '');
    addEl('dim', 'tip: type a mode name, or click one. tab = autocomplete. arrows = history. try: whoami, ls, help.');
    scrollBottom();
  }

  // clicks on mode names in printed help
  out.addEventListener('click', (e) => {
    const t = e.target.closest('.mode-name');
    if (!t) return;
    const name = t.getAttribute('data-mode');
    if (!name) return;
    if (locked || launched) return;
    runCommand(`jake-ruth --mode=${name}`);
  });

  out.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const t = e.target.closest('.mode-name');
    if (!t) return;
    e.preventDefault();
    const name = t.getAttribute('data-mode');
    if (locked || launched) return;
    runCommand(`jake-ruth --mode=${name}`);
  });

  // -----------------------------
  // input rendering
  // -----------------------------
  function renderInputLine(text) {
    inputText.textContent = text;
    ghostEl.textContent = computeGhost(text);
  }

  function computeGhost(text) {
    if (!text) return '';
    // complete for `jake-ruth --mode=xxx`
    const prefix = 'jake-ruth --mode=';
    if (text.startsWith(prefix)) {
      const stub = text.slice(prefix.length);
      const hit = MODES.find(m => m.name.startsWith(stub) && stub.length > 0 && m.name !== stub);
      if (hit) return hit.name.slice(stub.length);
      // if they just typed the prefix, suggest first mode
      if (stub.length === 0) return MODES[0].name;
      return '';
    }
    // bare mode prefix
    const m = MODES.find(x => x.name.startsWith(text) && text.length > 0 && x.name !== text);
    if (m) return m.name.slice(text.length);
    // command completion
    const c = KNOWN_COMMANDS.find(x => x.startsWith(text) && text.length > 0 && x !== text);
    if (c) return c.slice(text.length);
    return '';
  }

  // -----------------------------
  // key handling
  // -----------------------------
  function focusInput() {
    hiddenInput.focus({ preventScroll: true });
  }

  screen.addEventListener('click', () => {
    if (!locked) focusInput();
  });
  window.addEventListener('focus', () => { if (!locked) focusInput(); });
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && !locked) focusInput();
  });

  hiddenInput.addEventListener('keydown', async (e) => {
    if (locked || launched) { e.preventDefault(); return; }

    if (e.key === 'Enter') {
      e.preventDefault();
      const cmd = buffer.trim();
      if (!cmd) {
        // print empty prompt to move to next line
        echoCommand('');
        renderInputLine('');
        return;
      }
      history.push(buffer);
      histIdx = -1;
      draft = '';
      const submitted = buffer;
      buffer = '';
      renderInputLine('');
      await runCommand(submitted);
      return;
    }

    if (e.key === 'Tab') {
      e.preventDefault();
      const ghost = computeGhost(buffer);
      if (ghost) {
        buffer += ghost;
        renderInputLine(buffer);
      }
      return;
    }

    if (e.key === 'Backspace') {
      e.preventDefault();
      if (buffer.length > 0) {
        buffer = buffer.slice(0, -1);
        renderInputLine(buffer);
      }
      return;
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length === 0) return;
      if (histIdx === -1) { draft = buffer; histIdx = history.length - 1; }
      else if (histIdx > 0) { histIdx -= 1; }
      buffer = history[histIdx];
      renderInputLine(buffer);
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (histIdx === -1) return;
      if (histIdx < history.length - 1) {
        histIdx += 1;
        buffer = history[histIdx];
      } else {
        histIdx = -1;
        buffer = draft;
      }
      renderInputLine(buffer);
      return;
    }

    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      // keep it simple — no mid-line cursor in this prototype
      e.preventDefault();
      return;
    }

    // Ctrl-L / Cmd-K to clear
    if ((e.ctrlKey && (e.key === 'l' || e.key === 'L')) ||
        (e.metaKey && (e.key === 'k' || e.key === 'K'))) {
      e.preventDefault();
      clearScreen();
      return;
    }

    // Ctrl-C — reset line
    if (e.ctrlKey && (e.key === 'c' || e.key === 'C')) {
      e.preventDefault();
      echoCommand(buffer + '^C');
      buffer = '';
      renderInputLine('');
      return;
    }

    // printable characters
    if (e.key.length === 1 && !e.metaKey && !e.ctrlKey && !e.altKey) {
      e.preventDefault();
      buffer += e.key;
      renderInputLine(buffer);
      return;
    }
  });

  // also handle paste
  hiddenInput.addEventListener('paste', (e) => {
    if (locked || launched) return;
    e.preventDefault();
    const text = (e.clipboardData || window.clipboardData).getData('text') || '';
    const sanitized = text.replace(/\r?\n/g, ' ').slice(0, 200);
    buffer += sanitized;
    renderInputLine(buffer);
  });

  // -----------------------------
  // commands
  // -----------------------------
  async function runCommand(raw) {
    echoCommand(raw);
    const cmd = raw.trim();
    if (!cmd) return;

    // jake-ruth --mode=xp  OR  jake-ruth xp  OR  just `xp`
    const jr = parseJakeRuth(cmd);
    if (jr) {
      await handleLaunch(jr);
      return;
    }

    switch (cmd) {
      case 'help':
      case '--help':
      case '-h':
      case 'jake-ruth':
      case 'jake-ruth --help':
      case 'jake-ruth -h':
        renderHelp();
        return;

      case 'whoami':
        addEl('', 'jake ruth — engineer, founder, occasional unicyclist on a rubik\'s cube.');
        addEl('dim', 'thirteen years shipping. built stock unlock (yc w22). currently redefining the next chapter.');
        return;

      case 'ls':
      case 'ls modes':
      case 'ls ./modes':
        MODES.forEach(m => {
          addHTML('mode-row',
            `<span class="mode-name" data-mode="${m.name}" role="button" tabindex="0">${m.name}/</span>` +
            `<span class="mode-desc">${escapeHTML(m.slug)}/</span>`);
        });
        return;

      case 'clear':
      case 'cls':
        clearScreen();
        return;

      case 'exit':
      case 'quit':
      case ':q':
        addEl('accent', 'see you later.');
        addEl('dim', '(close the tab, or refresh to come back.)');
        locked = true;
        inputLine.hidden = true;
        return;

      case 'sudo':
      case 'sudo su':
        addEl('warn', 'nice try.');
        return;
    }

    // unknown
    addEl('err', `command not found: ${cmd}`);
    addEl('dim', 'try `help` or pick a mode: xp, saas, git, readme, vista');
  }

  function parseJakeRuth(cmd) {
    // jake-ruth --mode=<name>
    let m = cmd.match(/^jake-ruth\s+--mode[=\s]+([a-z0-9_-]+)\s*$/i);
    if (m) return m[1].toLowerCase();
    // jake-ruth <name>
    m = cmd.match(/^jake-ruth\s+([a-z0-9_-]+)\s*$/i);
    if (m && MODES.some(x => x.name === m[1].toLowerCase())) return m[1].toLowerCase();
    // bare mode name
    if (MODES.some(x => x.name === cmd.toLowerCase())) return cmd.toLowerCase();
    // --mode=xp on its own
    m = cmd.match(/^--mode[=\s]+([a-z0-9_-]+)\s*$/i);
    if (m) return m[1].toLowerCase();
    return null;
  }

  async function handleLaunch(name) {
    const mode = MODES.find(x => x.name === name);
    if (!mode) {
      addEl('err', `unknown mode: ${name}`);
      addEl('dim', 'available: xp, saas, git, readme, vista');
      return;
    }
    launched = true;
    locked = true;
    addEl('ok', `Launching ${mode.name} (${mode.desc})...`);
    // small typed-feel delay
    await wait(280);
    addEl('dim', `-> ../${mode.slug}/`);
    await wait(420);
    try {
      window.location.href = `../${mode.slug}/`;
    } catch (e) {
      addEl('err', 'navigation blocked. copy the path above.');
      launched = false;
      locked = false;
    }
  }

  function clearScreen() {
    out.innerHTML = '';
  }

  // -----------------------------
  // phosphor trail canvas
  // -----------------------------
  (function phosphor() {
    const c = document.getElementById('phosphor');
    const ctx = c.getContext('2d');
    let w = 0, h = 0;
    let dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, 2));
    let last = null;

    function resize() {
      dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, 2));
      w = window.innerWidth;
      h = window.innerHeight;
      c.width = Math.floor(w * dpr);
      c.height = Math.floor(h * dpr);
      c.style.width = w + 'px';
      c.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener('resize', resize);

    // fade loop
    function fade() {
      // subtle alpha fade to slowly clear trail
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = 'rgba(0,0,0,0.035)';
      ctx.fillRect(0, 0, w, h);
      ctx.globalCompositeOperation = 'source-over';
      requestAnimationFrame(fade);
    }
    requestAnimationFrame(fade);

    function draw(x, y) {
      if (last) {
        const grad = ctx.createLinearGradient(last.x, last.y, x, y);
        grad.addColorStop(0, 'rgba(110, 240, 138, 0.0)');
        grad.addColorStop(1, 'rgba(110, 240, 138, 0.18)');
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.1;
        ctx.beginPath();
        ctx.moveTo(last.x, last.y);
        ctx.lineTo(x, y);
        ctx.stroke();
      }
      ctx.fillStyle = 'rgba(126, 224, 230, 0.22)';
      ctx.beginPath();
      ctx.arc(x, y, 1.6, 0, Math.PI * 2);
      ctx.fill();
      last = { x, y };
    }

    window.addEventListener('mousemove', (e) => {
      draw(e.clientX, e.clientY);
    });
    window.addEventListener('mouseleave', () => { last = null; });
  })();

  // -----------------------------
  // start
  // -----------------------------
  // focus hidden input immediately (so keyboard is live once boot unlocks)
  setTimeout(() => { hiddenInput.focus({ preventScroll: true }); }, 0);
  boot();
})();
