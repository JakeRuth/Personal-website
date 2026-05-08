/* README experience: boot, markdown render, scroll-spy,
   tab-switching (Code / Timeline), skin toggle,
   star/fork handlers, toast + modal plumbing. */

(function () {
  'use strict';

  const $  = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  /* ========================================================== */
  /* marked configuration                                       */
  /* ========================================================== */
  const renderer = new marked.Renderer();
  const slug = (s) =>
    String(s)
      .toLowerCase()
      .replace(/[`*_~<>]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-');

  renderer.heading = function (text, level) {
    const id = slug(text);
    return `<h${level} id="${id}"><a class="anchor" href="#${id}" aria-label="anchor">#</a>${text}</h${level}>`;
  };

  renderer.code = function (code, lang) {
    const language = (lang || '').trim() || 'text';
    let highlighted;
    try {
      highlighted = hljs.getLanguage(language)
        ? hljs.highlight(code, { language, ignoreIllegals: true }).value
        : hljs.highlightAuto(code).value;
    } catch (e) {
      highlighted = escapeHtml(code);
    }
    const id = 'cb-' + Math.random().toString(36).slice(2, 9);
    return `<div class="code-wrap">
      <div class="code-head">
        <span>${language}</span>
        <button class="copy-btn" data-copy-target="${id}">Copy</button>
      </div>
      <pre><code id="${id}" class="hljs language-${language}">${highlighted}</code></pre>
    </div>`;
  };

  renderer.codespan = function (code) { return `<code>${code}</code>`; };

  marked.setOptions({
    renderer,
    gfm: true,
    breaks: false,
    pedantic: false,
    smartypants: false,
  });

  /* ========================================================== */
  /* GFM-style callouts                                         */
  /* ========================================================== */
  function decorateCallouts(root) {
    $$('blockquote', root).forEach((bq) => {
      const firstP = bq.querySelector('p');
      if (!firstP) return;
      const m = firstP.innerHTML.match(/^\s*\[!(NOTE|TIP|WARN|WARNING)\]\s*(<br\s*\/?>)?/i);
      if (!m) return;
      const kind = m[1].toUpperCase();
      const klass = kind === 'WARNING' ? 'warn' : kind.toLowerCase();
      bq.classList.add(klass);
      firstP.innerHTML = firstP.innerHTML.replace(m[0], '');
      const title = document.createElement('div');
      title.className = 'callout-title';
      title.innerHTML = calloutIcon(klass) + ' ' + (klass === 'warn' ? 'Heads up' : klass[0].toUpperCase() + klass.slice(1));
      bq.insertBefore(title, firstP);
      if (!firstP.textContent.trim()) firstP.remove();
    });
  }

  function calloutIcon(kind) {
    const svgs = {
      note: '<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path fill="currentColor" d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8Zm8-6.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13ZM6.5 7.75A.75.75 0 0 1 7.25 7h1a.75.75 0 0 1 .75.75v2.75h.25a.75.75 0 0 1 0 1.5h-2a.75.75 0 0 1 0-1.5h.25v-2h-.25a.75.75 0 0 1-.75-.75ZM8 6a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z"/></svg>',
      tip:  '<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path fill="currentColor" d="M8 1.5c-2.363 0-4 1.69-4 3.75 0 .984.424 1.625.984 2.304l.214.253c.223.264.47.556.673.848.284.411.458.823.458 1.345h3.342c0-.522.174-.934.458-1.345.202-.292.45-.584.673-.848.073-.086.144-.17.214-.253.56-.679.984-1.32.984-2.304 0-2.06-1.637-3.75-4-3.75ZM5.75 12h4.5a.75.75 0 0 1 0 1.5h-4.5a.75.75 0 0 1 0-1.5ZM6 15.25a.75.75 0 0 1 .75-.75h2.5a.75.75 0 0 1 0 1.5h-2.5a.75.75 0 0 1-.75-.75Z"/></svg>',
      warn: '<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path fill="currentColor" d="M6.457 1.047c.659-1.234 2.427-1.234 3.086 0l6.082 11.378A1.75 1.75 0 0 1 14.082 15H1.918a1.75 1.75 0 0 1-1.543-2.575ZM8 5a.75.75 0 0 0-.75.75v2.5a.75.75 0 0 0 1.5 0v-2.5A.75.75 0 0 0 8 5Zm1 6a1 1 0 1 0-2 0 1 1 0 0 0 2 0Z"/></svg>',
    };
    return svgs[kind] || svgs.note;
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /* ========================================================== */
  /* pane + file rendering                                      */
  /* ========================================================== */
  const VIEWS = {
    MARKDOWN: 'markdown',
    TIMELINE: 'timeline',
    CUBE:     'cube',
  };

  let CURRENT_VIEW = VIEWS.MARKDOWN;

  function showView(view) {
    CURRENT_VIEW = view;
    $('#readme').hidden     = view !== VIEWS.MARKDOWN;
    $('#timeline').hidden   = view !== VIEWS.TIMELINE;
    if ($('#cubeView')) $('#cubeView').hidden = view !== VIEWS.CUBE;

    $('#branchRail').hidden  = view !== VIEWS.TIMELINE;
    if ($('#cubeRail')) $('#cubeRail').hidden = view !== VIEWS.CUBE;
    // Markdown view uses the file tree as nav; no right rail.
    const layout = document.querySelector('.layout');
    if (layout) layout.classList.toggle('no-rail', view === VIEWS.MARKDOWN);

    // Cube widget is heavy; mount on enter, dispose on leave.
    if (view === VIEWS.CUBE && window.GhCube) {
      // wait one frame so the section becomes visible (clientWidth > 0)
      requestAnimationFrame(() => window.GhCube.mount());
    } else if (window.GhCube) {
      window.GhCube.unmount();
    }

    // reflect active top-tab
    $$('.gh-tab').forEach((t) => {
      const tab = t.dataset.tab;
      const wantActive =
        (view === VIEWS.MARKDOWN && tab === 'code') ||
        (view === VIEWS.TIMELINE && tab === 'timeline') ||
        (view === VIEWS.CUBE     && tab === 'cube');
      t.classList.toggle('active', !!wantActive);
    });
  }

  function renderFile(key) {
    if (key === 'TIMELINE') {
      showView(VIEWS.TIMELINE);
      const timelineEl = $('#timeline');
      if (!timelineEl.dataset.mounted) {
        TIMELINE.render($('#tlBody'));
        TIMELINE.renderBranchRail($('#branchRailList'));
        TIMELINE.renderJumpRail($('#jumpRailList'));
        TIMELINE.wire($('#tlBody'), {
          footEl: $('#tlFootText'),
          branchListEl: $('#branchRailList'),
          jumpListEl: $('#jumpRailList'),
          searchEl: $('#tlSearch'),
        });
        timelineEl.dataset.mounted = '1';
      }
      setActiveFile('TIMELINE');
      scrollPaneTop();
      return;
    }

    // Markdown view: README.md is the only document. Other "files"
    // in the tree are anchor links into sections of the same README.
    showView(VIEWS.MARKDOWN);
    const readmeEl = $('#readme');
    if (!readmeEl.dataset.mounted) {
      readmeEl.innerHTML = marked.parse(window.CONTENT.README || '');
      decorateCallouts(readmeEl);
      wireAnchorClicks(readmeEl);
      wireCopyButtons(readmeEl);
      readmeEl.dataset.mounted = '1';
    }
    setActiveFile(key);
    const anchor = FILE_ANCHORS[key];
    if (anchor) {
      const target = document.getElementById(anchor);
      if (target) {
        // If the target lives inside a <details>, open it so the
        // anchor isn't hidden behind a collapsed accordion.
        const det = target.closest('details');
        if (det && !det.open) det.open = true;
        smoothScrollTo(target);
      } else {
        scrollPaneTop();
      }
    } else {
      scrollPaneTop();
    }
  }

  // File tree click → scroll to this section in README.
  // README.md scrolls to top; .gitignore scrolls to the footer note.
  const FILE_ANCHORS = {
    README:       null,
    ABOUT:        'about',
    WORK_HISTORY: 'work-history',
    STOCK_UNLOCK: 'stock-unlock',
    PROJECTS:     'recent-ai-projects-post-opus-45',
    HOBBIES:      'mastery-hobbies',
    GITIGNORE:    'bottom-note',
  };

  // Reverse map: anchor id → file key, so in-content links can sync
  // the file-tree active state.
  const ANCHOR_TO_FILE = Object.fromEntries(
    Object.entries(FILE_ANCHORS).filter(([, v]) => v).map(([k, v]) => [v, k])
  );

  let scrollAnimId = 0;
  function smoothScrollTo(el) {
    const headerOffset = 170;
    const start = window.scrollY;
    const end = el.getBoundingClientRect().top + window.scrollY - headerOffset;
    const dy = end - start;
    if (Math.abs(dy) < 4) return;
    const dur = Math.min(900, 280 + Math.sqrt(Math.abs(dy)) * 16);
    const t0 = performance.now();
    const myId = ++scrollAnimId;
    const ease = (t) => 1 - Math.pow(1 - t, 4);
    function step(now) {
      // Cancel if a newer scroll started.
      if (myId !== scrollAnimId) return;
      const t = Math.min(1, (now - t0) / dur);
      window.scrollTo(0, start + dy * ease(t));
      if (t < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  function scrollPaneTop() {
    window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
  }

  function wireAnchorClicks(root) {
    $$('.anchor', root).forEach((a) => {
      a.addEventListener('click', (e) => {
        e.preventDefault();
        const id = a.getAttribute('href').slice(1);
        const target = document.getElementById(id);
        if (target) {
          const det = target.closest('details');
          if (det && !det.open) det.open = true;
          smoothScrollTo(target);
          if (ANCHOR_TO_FILE[id]) setActiveFile(ANCHOR_TO_FILE[id]);
        }
        history.replaceState(null, '', '#' + id);
        if (navigator.clipboard) {
          navigator.clipboard.writeText(window.location.href).catch(() => {});
          toast('Anchor link copied.');
        }
      });
    });
  }

  function wireCopyButtons(root) {
    $$('.copy-btn', root).forEach((btn) => {
      btn.addEventListener('click', () => {
        const targetId = btn.dataset.copyTarget;
        const code = document.getElementById(targetId);
        if (!code) return;
        const text = code.innerText;
        if (!navigator.clipboard) fallbackCopy(text);
        else navigator.clipboard.writeText(text).catch(() => fallbackCopy(text));
        btn.classList.add('copied');
        btn.textContent = 'Copied';
        setTimeout(() => { btn.classList.remove('copied'); btn.textContent = 'Copy'; }, 1400);
      });
    });
  }

  function fallbackCopy(text) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); } catch (e) {}
    document.body.removeChild(ta);
  }

  /* ========================================================== */
  /* file tree + path header                                    */
  /* ========================================================== */
  let ACTIVE = 'README';

  // Breadcrumb path. The whole document is README.md; clicking a file
  // in the tree jumps to a section but doesn't change the doc, so the
  // path stays README.md for any markdown-view click. Timeline and
  // Cube are real view changes and update the breadcrumb.
  const FILE_PATHS = {
    TIMELINE: 'TIMELINE',
    CUBE:     'octocube.exe',
  };

  function setActiveFile(key) {
    ACTIVE = key;
    const pathEl = $('#filePath');
    if (pathEl) pathEl.textContent = FILE_PATHS[key] || 'README.md';
    $$('#fileTree li').forEach((li) => {
      li.classList.toggle('active', li.dataset.file === key);
    });
  }

  function wireFileTree() {
    // Click handler is on the .tree-row span (not the <li>) so a
    // child row's click doesn't bubble up to its ancestor li and
    // re-trigger the parent's nav.
    $$('#fileTree .tree-row').forEach((row) => {
      row.addEventListener('click', (e) => {
        e.stopPropagation();
        const li = row.closest('li[data-file]');
        if (!li) return;
        const key = li.dataset.file;
        if (!key) return;
        if (key === 'GITIGNORE') {
          ignoreEverything();
          closeSidebarDrawer();
          return;
        }
        if (key !== 'TIMELINE' && key !== 'README' && !(key in FILE_ANCHORS)) return;
        renderFile(key);
        closeSidebarDrawer();
      });
    });
  }

  // .gitignore Easter egg: the page briefly explodes — text glitches
  // into garbage characters, layout shakes, color filter goes wild,
  // cube spins fast — for ~700ms, then snaps back. The site briefly
  // ignored itself.
  const SCRAMBLE_CHARS = '!@#$%^&*+=<>?/~∞≈≠√∑∂∆Ωπµ░▒▓█▄▀';
  let glitching = false;
  function ignoreEverything() {
    if (glitching) return;
    glitching = true;
    const body = document.body;

    // Snapshot every visible text node we're going to garble.
    const items = [];
    const walker = document.createTreeWalker(body, NodeFilter.SHOW_TEXT, {
      acceptNode(n) {
        if (!n.textContent || !n.textContent.trim()) return NodeFilter.FILTER_REJECT;
        const p = n.parentElement;
        if (!p) return NodeFilter.FILTER_REJECT;
        const tag = p.tagName;
        if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'NOSCRIPT') return NodeFilter.FILTER_REJECT;
        // Skip the cube canvas region's textless area; canvas children are not text nodes anyway.
        return NodeFilter.FILTER_ACCEPT;
      },
    });
    let n;
    while ((n = walker.nextNode())) items.push({ node: n, orig: n.textContent });

    body.classList.add('ignoring');

    let frame = 0;
    const FRAMES = 12;
    const id = setInterval(() => {
      frame++;
      if (frame >= FRAMES) {
        clearInterval(id);
        items.forEach((it) => { it.node.textContent = it.orig; });
        body.classList.remove('ignoring');
        glitching = false;
        return;
      }
      // Scramble a high fraction of characters per frame; preserve
      // whitespace so the rough shape of paragraphs stays.
      const intensity = frame < FRAMES - 3 ? 0.82 : 0.4;
      items.forEach((it) => {
        const s = it.orig;
        let out = '';
        for (let k = 0; k < s.length; k++) {
          const c = s[k];
          if (c === ' ' || c === '\n' || c === '\t') { out += c; continue; }
          out += Math.random() < intensity
            ? SCRAMBLE_CHARS[(Math.random() * SCRAMBLE_CHARS.length) | 0]
            : c;
        }
        it.node.textContent = out;
      });
    }, 70);
  }

  function openSidebarDrawer() {
    const layout = $('.layout');
    const btn = $('#sidebarToggle');
    if (!layout) return;
    layout.classList.add('sidebar-open');
    if (btn) btn.setAttribute('aria-expanded', 'true');
  }
  function closeSidebarDrawer() {
    const layout = $('.layout');
    const btn = $('#sidebarToggle');
    if (!layout) return;
    layout.classList.remove('sidebar-open');
    if (btn) btn.setAttribute('aria-expanded', 'false');
  }
  function wireSidebarDrawer() {
    const btn = $('#sidebarToggle');
    const backdrop = $('#sidebarBackdrop');
    if (btn) btn.addEventListener('click', () => {
      const layout = $('.layout');
      if (layout && layout.classList.contains('sidebar-open')) closeSidebarDrawer();
      else openSidebarDrawer();
    });
    if (backdrop) backdrop.addEventListener('click', closeSidebarDrawer);
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeSidebarDrawer();
    });
  }

  /* ========================================================== */
  /* top tabs (Code / Issues / PRs)                             */
  /* ========================================================== */
  function wireTopTabs() {
    $$('.gh-tab').forEach((a) => {
      a.addEventListener('click', (e) => {
        const tab = a.dataset.tab;
        if (!tab) return;
        e.preventDefault();
        if (tab === 'code') {
          if (ACTIVE === 'TIMELINE' || ACTIVE === 'CUBE') renderFile('README');
          else renderFile(ACTIVE);
        } else if (tab === 'timeline') {
          renderFile('TIMELINE');
          scrollPaneTop();
        } else if (tab === 'cube') {
          renderCube();
          scrollPaneTop();
        }
      });
    });
  }

  function renderCube() {
    showView(VIEWS.CUBE);
    const path = $('#filePath');
    if (path) path.textContent = 'octocube.exe';
    setActiveFile('CUBE');
    renderCubeLegend();
    wireCubeButtons();
  }

  function renderCubeLegend() {
    const list = $('#cubeLegend');
    if (!list || !window.GhCube) return;
    const faces = window.GhCube.legendData();
    list.innerHTML = faces.map((f) => `
      <li>
        <span class="cube-swatch" style="background:${f.bg}"></span>
        <span class="cube-face-id">${f.id}</span>
        <span class="cube-face-label">${f.label}</span>
      </li>
    `).join('');
  }

  function wireCubeButtons() {
    if ($('#cubeView')?.dataset.cubeWired === '1') return;
    $$('#cubeView [data-cube-action]').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (window.GhCube) window.GhCube.action(btn.dataset.cubeAction);
      });
    });
    if ($('#cubeView')) $('#cubeView').dataset.cubeWired = '1';
  }

  /* ========================================================== */
  /* theme toggle                                               */
  /* ========================================================== */
  function wireTheme() {
    const btn = $('#themeToggle');
    const label = $('#themeLabel');
    const htmlEl = document.documentElement;
    const darkCSS = $('#hljs-theme-dark');
    const lightCSS = $('#hljs-theme-light');
    const saved = localStorage.getItem('rgf2-theme');
    apply(saved || 'dark');

    btn.addEventListener('click', () => {
      const next = htmlEl.dataset.theme === 'dark' ? 'light' : 'dark';
      apply(next);
      localStorage.setItem('rgf2-theme', next);
    });

    function apply(theme) {
      htmlEl.dataset.theme = theme;
      label.textContent = theme === 'dark' ? 'Dark' : 'Light';
      if (theme === 'dark') { darkCSS.disabled = false; lightCSS.disabled = true; }
      else { darkCSS.disabled = true; lightCSS.disabled = false; }
    }
  }

  /* ========================================================== */
  /* star / fork                                                */
  /* ========================================================== */
  function wireStarFork() {
    const starBtn = $('#starBtn');
    const starCountEl = $('#starCount');
    const starCountRail = $('#starCountRail');
    const forkBtn = $('#forkBtn');

    const BASE = 347;
    const starred = localStorage.getItem('rgf2-starred') === '1';
    applyStar(starred, /*initial*/ true);

    starBtn.addEventListener('click', () => {
      const now = localStorage.getItem('rgf2-starred') === '1';
      const next = !now;
      localStorage.setItem('rgf2-starred', next ? '1' : '0');
      applyStar(next);
      toast(next ? 'Starred. (Fake count +1.)' : 'Unstarred.');
    });

    forkBtn.addEventListener('click', () => {
      if (typeof window.copyJakeEmail === 'function') window.copyJakeEmail();
    });

    function applyStar(on, initial) {
      starBtn.classList.toggle('starred', !!on);
      const label = starBtn.querySelector('span');
      if (label) label.textContent = on ? 'Starred' : 'Star';
      const count = BASE + (on ? 1 : 0);
      starCountEl.textContent = count.toLocaleString();
      if (starCountRail) starCountRail.textContent = count.toLocaleString();
      if (!initial && on) {
        // little pop
        starBtn.classList.add('pop');
        setTimeout(() => starBtn.classList.remove('pop'), 280);
      }
    }
  }

  /* ========================================================== */
  /* accordion grouping: one <details> open per group           */
  /* ========================================================== */
  // Native <details> are independent. Match the XP page: when one
  // opens, close peers in the same accordion group. A "group" is the
  // run of <details> that sit between two section headings (h2/h3),
  // so Work-history rows and Recent-AI-projects rows stay independent
  // even though they're flat siblings under the same readme div.
  function collectAccordionGroup(det) {
    const group = [det];
    const isBoundary = (el) => el && (el.tagName === 'H2' || el.tagName === 'H3');
    let n = det.previousElementSibling;
    while (n && !isBoundary(n)) {
      if (n.tagName === 'DETAILS') group.push(n);
      n = n.previousElementSibling;
    }
    n = det.nextElementSibling;
    while (n && !isBoundary(n)) {
      if (n.tagName === 'DETAILS') group.push(n);
      n = n.nextElementSibling;
    }
    return group;
  }
  function wireAccordionGroups() {
    // Mark a user-initiated open before <details> default-toggles so the
    // toggle handler below can distinguish click-opens from programmatic
    // ones (anchor nav, file render) that already do their own scroll.
    document.addEventListener('click', (e) => {
      const summary = e.target.closest('summary');
      if (!summary) return;
      const det = summary.parentElement;
      if (!(det instanceof HTMLDetailsElement)) return;
      if (!det.open) det.dataset.userOpening = '1';
    }, true);
    document.addEventListener('toggle', (e) => {
      const det = e.target;
      if (!(det instanceof HTMLDetailsElement)) return;
      if (!det.open) return;
      collectAccordionGroup(det).forEach((other) => {
        if (other !== det && other.open) other.open = false;
      });
      // After peer-close reflows, anchor the just-opened row to a stable
      // position below the sticky chrome. Native smooth scroll honors
      // `scroll-margin-top: 170px` on .work-collapse and rides the
      // compositor, so it doesn't fight Chrome's scroll-anchoring when
      // a tall peer above collapses.
      if (det.dataset.userOpening === '1') {
        delete det.dataset.userOpening;
        requestAnimationFrame(() => requestAnimationFrame(() => {
          det.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }));
      }
    }, true);
  }

  /* ========================================================== */
  /* in-content anchor nav + TIMELINE shield hop                */
  /* ========================================================== */
  function wireInContentAnchors() {
    document.addEventListener('click', (e) => {
      const a = e.target.closest('a');
      if (!a) return;
      const href = a.getAttribute('href') || '';
      if (href === '#TIMELINE') { e.preventDefault(); renderFile('TIMELINE'); return; }
      if (/^#[A-Z][A-Z_]+$/.test(href) && href.slice(1) in FILE_ANCHORS) {
        e.preventDefault();
        renderFile(href.slice(1));
        return;
      }
      if (href.startsWith('#') && href.length > 1) {
        const id = href.slice(1);
        const target = document.getElementById(id);
        if (target) {
          e.preventDefault();
          const det = target.closest('details');
          if (det && !det.open) det.open = true;
          smoothScrollTo(target);
          history.replaceState(null, '', href);
          if (ANCHOR_TO_FILE[id]) setActiveFile(ANCHOR_TO_FILE[id]);
        }
      }
    });
  }

  /* ========================================================== */
  /* toast                                                      */
  /* ========================================================== */
  let toastTimer = null;
  function toast(msg) {
    const t = $('#toast');
    if (!t) return;
    t.textContent = msg;
    t.hidden = false;
    t.classList.add('in');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      t.classList.remove('in');
      setTimeout(() => (t.hidden = true), 200);
    }, 1800);
  }

  /* ========================================================== */
  /* copy rendered markdown button                              */
  /* ========================================================== */
  function wireCopyAll() {
    $('#copyAllBtn').addEventListener('click', () => {
      let src = '';
      if (CURRENT_VIEW === VIEWS.MARKDOWN) src = window.CONTENT.README || '';
      else if (CURRENT_VIEW === VIEWS.TIMELINE) src = window.TIMELINE.rawSource();
      if (!src) return;
      if (!navigator.clipboard) fallbackCopy(src);
      else navigator.clipboard.writeText(src).catch(() => fallbackCopy(src));
      toast('Copied source to clipboard.');
    });
  }

  /* ========================================================== */
  /* boot                                                       */
  /* ========================================================== */
  function boot() {
    wireTheme();
    wireFileTree();
    wireSidebarDrawer();
    wireTopTabs();
    wireStarFork();
    wireInContentAnchors();
    wireCopyAll();
    wireAccordionGroups();
    renderFile('README');

    const hash = window.location.hash.slice(1);
    if (hash === 'TIMELINE') { renderFile('TIMELINE'); return; }
    if (hash && hash in FILE_ANCHORS) { renderFile(hash); return; }
    if (hash) {
      const target = document.getElementById(hash);
      if (target) {
        const det = target.closest('details');
        if (det && !det.open) det.open = true;
        if (ANCHOR_TO_FILE[hash]) setActiveFile(ANCHOR_TO_FILE[hash]);
        setTimeout(() => smoothScrollTo(target), 60);
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
