/* ================================================================
   readme-git-fusion  boot, render, interactions.
   Inherits readme-mode's markdown rendering pipeline, tabs, file tree,
   theme toggle and raw modal. Adds:
     - TIMELINE "file" that opens the git-log view (timeline.js)
     - Terminal skin toggle (data-skin="terminal" | "readme")
     - Right-rail swaps between TOC and Branches/Jump-to
   ================================================================ */

(function () {
  'use strict';

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  /* ---------- marked configuration ---------- */
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

  renderer.codespan = function (code) {
    return `<code>${code}</code>`;
  };

  marked.setOptions({
    renderer,
    gfm: true,
    breaks: false,
    pedantic: false,
    smartypants: false,
  });

  /* ---------- GFM-style callouts ---------- */
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

  /* ---------- render a file into the main pane ---------- */
  function renderFile(key) {
    const readmeEl = $('#readme');
    const timelineEl = $('#timeline');
    const tocWrap = $('#tocWrap');
    const branchRail = $('#branchRail');

    if (key === 'TIMELINE') {
      readmeEl.hidden = true;
      timelineEl.hidden = false;
      tocWrap.hidden = true;
      branchRail.hidden = false;
      setActiveFile('TIMELINE');
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
      window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
      return;
    }

    // markdown file
    readmeEl.hidden = false;
    timelineEl.hidden = true;
    tocWrap.hidden = false;
    branchRail.hidden = true;

    const src = window.CONTENT[key] || '# Not found';
    readmeEl.innerHTML = marked.parse(src);
    decorateCallouts(readmeEl);
    buildTOC(readmeEl);
    wireAnchorClicks(readmeEl);
    wireCopyButtons(readmeEl);
    setActiveFile(key);
    window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
  }

  /* ---------- TOC ---------- */
  function buildTOC(root) {
    const tocList = $('#tocList');
    tocList.innerHTML = '';
    const h2s = $$('h2', root);
    h2s.forEach((h) => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = '#' + h.id;
      a.textContent = h.textContent.replace(/^#/, '').trim();
      a.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.getElementById(h.id);
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        history.replaceState(null, '', '#' + h.id);
      });
      li.appendChild(a);
      tocList.appendChild(li);
    });
    wireTOCScrollSpy(h2s);
  }

  function wireTOCScrollSpy(headings) {
    if (!('IntersectionObserver' in window)) return;
    const tocLinks = $$('#tocList a');
    const byId = new Map(tocLinks.map((a) => [a.getAttribute('href').slice(1), a]));
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const id = entry.target.id;
          const link = byId.get(id);
          if (!link) return;
          if (entry.isIntersecting) {
            tocLinks.forEach((a) => a.classList.remove('active'));
            link.classList.add('active');
          }
        });
      },
      { rootMargin: '-80px 0px -70% 0px', threshold: 0.01 }
    );
    headings.forEach((h) => obs.observe(h));
  }

  function wireAnchorClicks(root) {
    $$('.anchor', root).forEach((a) => {
      a.addEventListener('click', (e) => {
        e.preventDefault();
        const id = a.getAttribute('href').slice(1);
        const target = document.getElementById(id);
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        history.replaceState(null, '', '#' + id);
        navigator.clipboard && navigator.clipboard.writeText(window.location.href).catch(() => {});
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

  /* ---------- file tree + tabs ---------- */
  const OPEN_TABS = new Set(['README']);
  let ACTIVE = 'README';

  function setActiveFile(key) {
    ACTIVE = key;
    OPEN_TABS.add(key);
    renderTabs();
    $$('#fileTree li').forEach((li) => {
      li.classList.toggle('active', li.dataset.file === key);
    });
  }

  function renderTabs() {
    const tabs = $('#fileTabs');
    tabs.innerHTML = '';
    OPEN_TABS.forEach((key) => {
      const b = document.createElement('button');
      b.className = 'file-tab' + (key === ACTIVE ? ' active' : '');
      b.dataset.file = key;
      b.textContent = key === 'TIMELINE' ? 'TIMELINE' : (key + '.md');
      b.addEventListener('click', () => renderFile(key));
      tabs.appendChild(b);
    });
  }

  function wireFileTree() {
    $$('#fileTree li.file').forEach((li) => {
      li.addEventListener('click', (e) => {
        e.stopPropagation();
        const key = li.dataset.file;
        if (!key) return;
        if (key !== 'TIMELINE' && !window.CONTENT[key]) return;
        renderFile(key);
      });
    });
    $$('#fileTree li.dir').forEach((li) => {
      li.addEventListener('click', (e) => {
        e.stopPropagation();
        li.classList.toggle('open');
      });
    });
  }

  /* ---------- theme toggle ---------- */
  function wireTheme() {
    const btn = $('#themeToggle');
    const label = $('#themeLabel');
    const htmlEl = document.documentElement;
    const darkCSS = $('#hljs-theme-dark');
    const lightCSS = $('#hljs-theme-light');
    const saved = localStorage.getItem('rgf-theme');
    apply(saved || 'dark');

    btn.addEventListener('click', () => {
      const next = htmlEl.dataset.theme === 'dark' ? 'light' : 'dark';
      apply(next);
      localStorage.setItem('rgf-theme', next);
    });

    function apply(theme) {
      htmlEl.dataset.theme = theme;
      label.textContent = theme === 'dark' ? 'Dark' : 'Light';
      if (theme === 'dark') { darkCSS.disabled = false; lightCSS.disabled = true; }
      else { darkCSS.disabled = true; lightCSS.disabled = false; }
    }
  }

  /* ---------- terminal skin toggle ---------- */
  function wireSkin() {
    const btn = $('#skinToggle');
    const label = $('#skinLabel');
    const htmlEl = document.documentElement;
    const saved = localStorage.getItem('rgf-skin');
    apply(saved || 'readme');

    btn.addEventListener('click', () => {
      const next = htmlEl.dataset.skin === 'terminal' ? 'readme' : 'terminal';
      apply(next);
      localStorage.setItem('rgf-skin', next);
    });

    function apply(skin) {
      htmlEl.dataset.skin = skin;
      label.textContent = skin === 'terminal' ? 'README' : 'Terminal';
      btn.title = skin === 'terminal' ? 'Back to README skin' : 'Terminal skin';
    }
  }

  /* ---------- raw source modal ---------- */
  function wireModal() {
    const modal = $('#modal');
    const openBtn = $('#viewSourceBtn');
    const closeBtn = $('#closeModalBtn');
    const rawEl = $('#rawSource');
    const rawPath = $('#rawPath');
    const copyBtn = $('#copyRawBtn');

    function open() {
      if (ACTIVE === 'TIMELINE') {
        rawEl.textContent = window.TIMELINE.rawSource();
        rawPath.innerHTML = 'TIMELINE <span class="muted"> git log --graph --oneline --all --decorate</span>';
      } else {
        rawEl.textContent = window.CONTENT[ACTIVE] || '';
        rawPath.innerHTML = `${ACTIVE}.md <span class="muted"> raw</span>`;
      }
      modal.hidden = false;
      document.body.style.overflow = 'hidden';
    }
    function close() { modal.hidden = true; document.body.style.overflow = ''; }

    openBtn.addEventListener('click', open);
    closeBtn.addEventListener('click', close);
    modal.addEventListener('click', (e) => { if (e.target === modal) close(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !modal.hidden) close(); });

    copyBtn.addEventListener('click', () => {
      const text = rawEl.textContent;
      if (!navigator.clipboard) fallbackCopy(text);
      else navigator.clipboard.writeText(text).catch(() => fallbackCopy(text));
      copyBtn.textContent = 'Copied';
      setTimeout(() => (copyBtn.textContent = 'Copy'), 1400);
    });

    document.addEventListener('click', (e) => {
      const t = e.target.closest('#hint-raw');
      if (t) { e.preventDefault(); open(); }
    });
  }

  /* ---------- in-content anchor nav + TIMELINE shield hop ---------- */
  function wireInContentAnchors() {
    document.addEventListener('click', (e) => {
      const a = e.target.closest('a');
      if (!a) return;
      const href = a.getAttribute('href') || '';
      if (href === '#TIMELINE') { e.preventDefault(); renderFile('TIMELINE'); return; }
      if (href.startsWith('#') && href.length > 1) {
        const target = document.getElementById(href.slice(1));
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          history.replaceState(null, '', href);
        }
      }
    });
  }

  /* ---------- boot ---------- */
  function boot() {
    wireTheme();
    wireSkin();
    wireFileTree();
    wireModal();
    wireInContentAnchors();
    renderFile('README');

    const hash = window.location.hash.slice(1);
    if (hash === 'TIMELINE') { renderFile('TIMELINE'); return; }
    if (hash) {
      const target = document.getElementById(hash);
      if (target) setTimeout(() => target.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
