/* ------------------------------------------------------------------
   CommandPalette — reusable vanilla-JS component.

   Usage:
     const palette = new CommandPalette({
       mount: document.body,
       commands: [...optional override...],
       onExperienceSwitch, onDownloadResume, onCopyEmail, onToggleTheme,
       onRubikEasterEgg, onShipJake,
     });
     palette.open();     // open programmatically
     palette.close();
     palette.on('open', fn);

   Keyboard:
     Cmd/Ctrl+K or "/" or "?"   open
     Escape                     close
     Up/Down                    navigate
     Enter                      activate
     Cmd+Enter                  open in new tab (where relevant)

   Commands structure is the single source of truth; edit the
   DEFAULT_COMMANDS array below or pass your own via config.
   ------------------------------------------------------------------ */

(function () {
  'use strict';

  // ---------------- Icons (inline SVG strings) ---------------- //
  const ICON = {
    search: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>`,
    swap: '↯',
    jump: '↗',
    mail: '@',
    copy: '⧉',
    github: '◎',
    download: '↓',
    theme: '◐',
    print: '⎙',
    sparkle: '✦',
    cube: '▣',
    ship: '↗',
    user: '◉',
  };

  // ---------------- Default commands ---------------- //
  function makeDefaultCommands(ctx) {
    return [
      // -------- Switch Experience -------- //
      { id: 'exp-xp',         section: 'Switch experience', label: 'Switch to XP Luna',       sub: 'Windows XP homage experience',    icon: ICON.swap, run: () => ctx.onExperienceSwitch?.('XP Luna'),       keywords: 'windows retro skin' },
      { id: 'exp-saas',       section: 'Switch experience', label: 'Switch to Enterprise SaaS', sub: 'B2B marketing page parody',     icon: ICON.swap, run: () => ctx.onExperienceSwitch?.('Enterprise SaaS'), keywords: 'b2b enterprise saas marketing' },
      { id: 'exp-gitlog',     section: 'Switch experience', label: 'Switch to Git Log',       sub: 'Commit-history-as-biography',     icon: ICON.swap, run: () => ctx.onExperienceSwitch?.('Git Log'),       keywords: 'git history commit log terminal' },
      { id: 'exp-readme',     section: 'Switch experience', label: 'Switch to README',        sub: 'GitHub README rendering',         icon: ICON.swap, run: () => ctx.onExperienceSwitch?.('README'),        keywords: 'readme github markdown' },
      { id: 'exp-vista',      section: 'Switch experience', label: 'Switch to Vista',         sub: 'Windows Vista aero throwback',    icon: ICON.swap, run: () => ctx.onExperienceSwitch?.('Vista'),         keywords: 'aero vista windows retro' },

      // -------- Jump to (section anchors) -------- //
      { id: 'jump-about',      section: 'Jump to',  label: 'About',         sub: 'Who Jake is, plainly',     icon: ICON.jump, run: () => jumpTo('#about'),      keywords: 'bio intro jake' },
      { id: 'jump-career',     section: 'Jump to',  label: 'Career',        sub: 'Oscar, Stock Unlock, now', icon: ICON.jump, run: () => jumpTo('#career'),     keywords: 'work experience job timeline' },
      { id: 'jump-su',         section: 'Jump to',  label: 'Stock Unlock',  sub: 'Founded. Scaled. Profit.', icon: ICON.jump, run: () => jumpTo('#stock-unlock'), keywords: 'stock unlock company yc startup' },
      { id: 'jump-projects',   section: 'Jump to',  label: 'Projects',      sub: 'Recent receipts',          icon: ICON.jump, run: () => jumpTo('#projects'),   keywords: 'work projects side' },
      { id: 'jump-hobbies',    section: 'Jump to',  label: 'Hobbies',       sub: 'Rubik, unicycle, guitar',  icon: ICON.jump, run: () => jumpTo('#hobbies'),    keywords: 'fun side hobbies' },
      { id: 'jump-contact',    section: 'Jump to',  label: 'Contact',       sub: 'Email works best',         icon: ICON.jump, run: () => jumpTo('#contact'),    keywords: 'contact reach email' },

      // -------- Actions -------- //
      { id: 'act-resume',   section: 'Actions', label: 'Download resume',         sub: 'PDF — the full thing',        icon: ICON.download, run: () => ctx.onDownloadResume?.(),                              keywords: 'cv pdf resume download' },
      { id: 'act-email',    section: 'Actions', label: 'Email Jake',              sub: 'jake@stockunlock.com',        icon: ICON.mail,     run: () => { window.location.href = 'mailto:jake@stockunlock.com'; }, keywords: 'email contact mailto' },
      { id: 'act-copy',     section: 'Actions', label: 'Copy email to clipboard', sub: 'jake@stockunlock.com',        icon: ICON.copy,     run: () => ctx.onCopyEmail?.(),                                   keywords: 'copy email clipboard' },
      { id: 'act-github',   section: 'Actions', label: 'View GitHub',             sub: 'github.com/JakeRuth',         icon: ICON.github,   run: () => window.open('https://github.com/JakeRuth', '_blank'),  keywords: 'github code profile' },
      { id: 'act-theme',    section: 'Actions', label: 'Toggle theme',            sub: 'Dark ↔ light',                icon: ICON.theme,    run: () => ctx.onToggleTheme?.(),                                 keywords: 'dark light theme' },
      { id: 'act-print',    section: 'Actions', label: 'Print this page',         sub: 'Or save as PDF',              icon: ICON.print,    run: () => window.print(),                                        keywords: 'print pdf save' },

      // -------- Easter eggs (hidden by default) -------- //
      { id: 'egg-rubik',   section: 'Easter eggs', label: "Solve the Rubik's cube", sub: 'Ambient animation',    icon: ICON.cube,    hidden: true, triggers: ['rubik', 'cube'], run: () => ctx.onRubikEasterEgg?.() },
      { id: 'egg-ship',    section: 'Easter eggs', label: 'Ship Jake',              sub: '(hire me)',            icon: ICON.ship,    hidden: true, triggers: ['ship', 'hire'],  run: () => ctx.onShipJake?.() },
      { id: 'egg-whoami',  section: 'Easter eggs', label: 'whoami',                 sub: '→ jump to About',      icon: ICON.user,    hidden: true, triggers: ['whoami'],        run: () => jumpTo('#about') },
    ];
  }

  function jumpTo(hash) {
    const el = document.querySelector(hash);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      history.replaceState(null, '', hash);
    }
  }

  // ---------------- Fuzzy scoring ---------------- //
  // Returns {score, matches: [{field,start,end}]} or null if no match.
  function fuzzyScore(query, haystack) {
    if (!query) return { score: 0, ranges: [] };
    const q = query.toLowerCase();
    const h = haystack.toLowerCase();

    // fast substring first
    const sub = h.indexOf(q);
    if (sub !== -1) {
      const bonus = sub === 0 ? 50 : 20;
      return { score: 120 - sub + bonus, ranges: [[sub, sub + q.length]] };
    }
    // subsequence match (Sublime-style)
    let qi = 0, last = -2, score = 0;
    const ranges = [];
    for (let i = 0; i < h.length && qi < q.length; i++) {
      if (h[i] === q[qi]) {
        score += (i - last === 1) ? 4 : 1; // consecutive bonus
        if (i === 0) score += 6;           // leading bonus
        // word-boundary bonus
        if (i > 0 && /[\s\-_\/.]/.test(h[i - 1])) score += 3;
        last = i;
        ranges.push([i, i + 1]);
        qi++;
      }
    }
    if (qi !== q.length) return null;
    // merge adjacent ranges
    const merged = [];
    for (const r of ranges) {
      if (merged.length && merged[merged.length - 1][1] === r[0]) {
        merged[merged.length - 1][1] = r[1];
      } else merged.push([...r]);
    }
    return { score, ranges: merged };
  }

  function highlight(text, ranges) {
    if (!ranges || !ranges.length) return escapeHtml(text);
    let out = '';
    let cursor = 0;
    for (const [s, e] of ranges) {
      out += escapeHtml(text.slice(cursor, s));
      out += '<mark>' + escapeHtml(text.slice(s, e)) + '</mark>';
      cursor = e;
    }
    out += escapeHtml(text.slice(cursor));
    return out;
  }

  function escapeHtml(s) {
    return s.replace(/[&<>"']/g, (c) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    }[c]));
  }

  // ---------------- Component ---------------- //
  class CommandPalette {
    constructor(config = {}) {
      this.config = config;
      this.commands = config.commands || makeDefaultCommands(config);
      this.mount = config.mount || document.body;
      this.isOpen = false;
      this.query = '';
      this.selectedIndex = 0;
      this.flatVisible = [];
      this.recentIds = this._loadRecent();
      this.listeners = { open: [], close: [], run: [] };

      this._buildDOM();
      this._wireKeys();
    }

    on(evt, fn) {
      if (this.listeners[evt]) this.listeners[evt].push(fn);
      return this;
    }
    _emit(evt, payload) {
      (this.listeners[evt] || []).forEach((fn) => { try { fn(payload); } catch (e) { console.error(e); } });
    }

    _loadRecent() {
      try {
        const raw = localStorage.getItem('cp:recent');
        return raw ? JSON.parse(raw) : [];
      } catch (e) { return []; }
    }
    _saveRecent(id) {
      this.recentIds = [id, ...this.recentIds.filter((x) => x !== id)].slice(0, 5);
      try { localStorage.setItem('cp:recent', JSON.stringify(this.recentIds)); } catch (e) {}
    }

    _buildDOM() {
      const root = document.createElement('div');
      root.className = 'cp-root';
      root.innerHTML = `
        <div class="cp-backdrop" data-cp-backdrop></div>
        <div class="cp-panel" role="dialog" aria-label="Command palette" aria-modal="true">
          <div class="cp-input-row">
            <span class="cp-input-row__icon">${ICON.search}</span>
            <input class="cp-input" type="text" placeholder="Search or type a command…" spellcheck="false" autocomplete="off" />
            <span class="cp-esc">ESC</span>
          </div>
          <div class="cp-results" data-cp-results></div>
          <div class="cp-footer">
            <div class="cp-footer__keys">
              <span><span class="kbd">↑</span><span class="kbd">↓</span> navigate</span>
              <span><span class="kbd">↵</span> run</span>
              <span><span class="kbd">esc</span> close</span>
            </div>
            <div>Jake Ruth · ⌘K</div>
          </div>
        </div>
      `;
      this.mount.appendChild(root);
      this.rootEl    = root;
      this.backdrop  = root.querySelector('[data-cp-backdrop]');
      this.panel     = root.querySelector('.cp-panel');
      this.input     = root.querySelector('.cp-input');
      this.resultsEl = root.querySelector('[data-cp-results]');

      this.backdrop.addEventListener('click', () => this.close());
      this.input.addEventListener('input', (e) => {
        this.query = e.target.value;
        this.selectedIndex = 0;
        this._render();
      });
    }

    _wireKeys() {
      // Global open shortcuts
      document.addEventListener('keydown', (e) => {
        const isEditable = /input|textarea|select/i.test(document.activeElement?.tagName || '') ||
                           document.activeElement?.isContentEditable;

        // Cmd/Ctrl+K
        if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
          e.preventDefault();
          this.toggle();
          return;
        }
        // "/" or "?" when not in an input
        if (!this.isOpen && !isEditable && (e.key === '/' || e.key === '?')) {
          e.preventDefault();
          this.open();
          return;
        }
        // Escape
        if (this.isOpen && e.key === 'Escape') {
          e.preventDefault();
          this.close();
          return;
        }
        if (!this.isOpen) return;

        if (e.key === 'ArrowDown') { e.preventDefault(); this._move(1); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); this._move(-1); }
        else if (e.key === 'Enter')   { e.preventDefault(); this._activate(this.selectedIndex, e); }
      });
    }

    toggle() { this.isOpen ? this.close() : this.open(); }

    open() {
      if (this.isOpen) return;
      this.isOpen = true;
      this.query = '';
      this.selectedIndex = 0;
      this.input.value = '';
      this.backdrop.classList.add('is-open');
      this.panel.classList.add('is-open');
      this._render();
      requestAnimationFrame(() => this.input.focus());
      this._emit('open');
    }

    close() {
      if (!this.isOpen) return;
      this.isOpen = false;
      this.backdrop.classList.remove('is-open');
      this.panel.classList.remove('is-open');
      this._emit('close');
    }

    _move(delta) {
      if (!this.flatVisible.length) return;
      const n = this.flatVisible.length;
      this.selectedIndex = (this.selectedIndex + delta + n) % n;
      this._updateSelectionHighlight();
      const el = this.resultsEl.querySelector(`[data-cp-index="${this.selectedIndex}"]`);
      if (el) el.scrollIntoView({ block: 'nearest' });
    }

    _updateSelectionHighlight() {
      this.resultsEl.querySelectorAll('.cp-item').forEach((el) => {
        const i = Number(el.dataset.cpIndex);
        el.classList.toggle('is-selected', i === this.selectedIndex);
      });
    }

    _activate(index, evt) {
      const cmd = this.flatVisible[index];
      if (!cmd) return;
      this._saveRecent(cmd.id);
      this._emit('run', cmd);
      this.close();
      // Defer to let close animate
      setTimeout(() => { try { cmd.run?.(evt); } catch (e) { console.error(e); } }, 60);
    }

    _filter() {
      const q = this.query.trim();
      const qLower = q.toLowerCase();

      // Easter-egg unlock: only include hidden commands whose trigger matches
      const all = this.commands.filter((c) => {
        if (!c.hidden) return true;
        if (!q) return false;
        return (c.triggers || []).some((t) => qLower.includes(t));
      });

      if (!q) {
        // Empty state: recent commands + all grouped by section
        return { kind: 'empty', items: all };
      }

      const scored = [];
      for (const c of all) {
        const haystack = [c.label, c.sub || '', c.section || '', c.keywords || ''].join(' ');
        const res = fuzzyScore(q, haystack);
        if (res) {
          // Also compute ranges against the label only for highlight
          const labelRes = fuzzyScore(q, c.label);
          scored.push({ cmd: c, score: res.score + (labelRes ? labelRes.score * 0.5 : 0), ranges: labelRes?.ranges });
        }
      }
      scored.sort((a, b) => b.score - a.score);
      return { kind: 'filtered', items: scored };
    }

    _render() {
      const r = this._filter();
      this.resultsEl.innerHTML = '';
      this.flatVisible = [];

      if (r.kind === 'empty') {
        // Recents first
        const recentCmds = this.recentIds
          .map((id) => r.items.find((c) => c.id === id))
          .filter(Boolean);

        if (recentCmds.length) {
          this._renderSection('Recent', recentCmds.map((c) => ({ cmd: c })));
        }
        // Group by section (natural order defined in commands array)
        const sections = [];
        const seen = new Set();
        for (const c of r.items) {
          if (!seen.has(c.section)) { sections.push(c.section); seen.add(c.section); }
        }
        for (const s of sections) {
          const items = r.items.filter((c) => c.section === s).map((c) => ({ cmd: c }));
          this._renderSection(s, items);
        }
      } else {
        // Filtered — single flat "Results" (or keep section headers for top-scored groups)
        if (!r.items.length) {
          const e = document.createElement('div');
          e.className = 'cp-empty';
          e.innerHTML = `No matches for <strong>"${escapeHtml(this.query)}"</strong>.<br/>Try: about · resume · email · ship · rubik`;
          this.resultsEl.appendChild(e);
          return;
        }
        this._renderSection('Results', r.items);
      }

      this._updateSelectionHighlight();
    }

    _renderSection(title, items) {
      if (!items.length) return;
      const sec = document.createElement('div');
      sec.className = 'cp-section';
      sec.innerHTML = `<div class="cp-section__title">${escapeHtml(title)}</div>`;
      const frag = document.createDocumentFragment();
      for (const entry of items) {
        const cmd = entry.cmd;
        const index = this.flatVisible.length;
        this.flatVisible.push(cmd);

        const row = document.createElement('div');
        row.className = 'cp-item';
        row.dataset.cpIndex = String(index);

        const labelHtml = entry.ranges
          ? highlight(cmd.label, entry.ranges)
          : escapeHtml(cmd.label);

        row.innerHTML = `
          <div class="cp-item__icon">${cmd.icon || ICON.sparkle}</div>
          <div class="cp-item__main">
            <div class="cp-item__label">${labelHtml}</div>
            ${cmd.sub ? `<div class="cp-item__sub">${escapeHtml(cmd.sub)}</div>` : ''}
          </div>
          ${this._shortcutHTML(cmd)}
        `;
        row.addEventListener('mouseenter', () => {
          this.selectedIndex = index;
          this._updateSelectionHighlight();
        });
        row.addEventListener('click', (e) => this._activate(index, e));
        frag.appendChild(row);
      }
      sec.appendChild(frag);
      this.resultsEl.appendChild(sec);
    }

    _shortcutHTML(cmd) {
      if (!cmd.shortcut) return '';
      const keys = cmd.shortcut.split('+').map((k) => `<span class="kbd">${escapeHtml(k)}</span>`).join('');
      return `<div class="cp-item__shortcut">${keys}</div>`;
    }
  }

  // Expose
  window.CommandPalette = CommandPalette;
})();
