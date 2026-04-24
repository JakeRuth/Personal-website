/* README experience: boot, markdown render, scroll-spy,
   tab-switching (Code / Issues / Pull requests), skin toggle,
   star/fork handlers, toast + modal plumbing. */

(function () {
  'use strict';

  const $  = (sel, root = document) => root.querySelector(sel);
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

  renderer.codespan = function (code) { return `<code>${code}</code>`; };

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

  /* ---------- pane + file rendering ---------- */
  const VIEWS = {
    MARKDOWN: 'markdown',
    TIMELINE: 'timeline',
    ISSUES:   'issues',
    PRS:      'prs',
  };

  let CURRENT_VIEW = VIEWS.MARKDOWN;

  function showView(view) {
    CURRENT_VIEW = view;
    $('#readme').hidden     = view !== VIEWS.MARKDOWN;
    $('#timeline').hidden   = view !== VIEWS.TIMELINE;
    $('#issuesView').hidden = view !== VIEWS.ISSUES;
    $('#prsView').hidden    = view !== VIEWS.PRS;

    $('#tocWrap').hidden     = view !== VIEWS.MARKDOWN;
    $('#branchRail').hidden  = view !== VIEWS.TIMELINE;
    $('#issuesRail').hidden  = view !== VIEWS.ISSUES;
    $('#prsRail').hidden     = view !== VIEWS.PRS;

    // reflect active top-tab
    $$('.gh-tab').forEach((t) => {
      const tab = t.dataset.tab;
      const wantActive =
        (view === VIEWS.MARKDOWN && tab === 'code') ||
        (view === VIEWS.TIMELINE && tab === 'code') ||
        (view === VIEWS.ISSUES   && tab === 'issues') ||
        (view === VIEWS.PRS      && tab === 'prs');
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

    showView(VIEWS.MARKDOWN);
    const readmeEl = $('#readme');
    const src = window.CONTENT[key] || '# Not found';
    readmeEl.innerHTML = marked.parse(src);
    decorateCallouts(readmeEl);
    buildTOC(readmeEl);
    wireAnchorClicks(readmeEl);
    wireCopyButtons(readmeEl);
    setActiveFile(key);
    scrollPaneTop();
  }

  function scrollPaneTop() {
    window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
  }

  /* ---------- TOC ---------- */
  let activeObserver = null;
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
    if (activeObserver) { try { activeObserver.disconnect(); } catch (e) {} activeObserver = null; }
    if (!('IntersectionObserver' in window) || !headings.length) return;
    const tocLinks = $$('#tocList a');
    const byId = new Map(tocLinks.map((a) => [a.getAttribute('href').slice(1), a]));
    // track the topmost visible heading (avoids flicker)
    const visible = new Set();
    activeObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) visible.add(entry.target);
          else visible.delete(entry.target);
        });
        let topmost = null;
        let topY = Infinity;
        visible.forEach((el) => {
          const y = el.getBoundingClientRect().top;
          if (y < topY) { topY = y; topmost = el; }
        });
        if (!topmost) return;
        const link = byId.get(topmost.id);
        if (!link) return;
        tocLinks.forEach((a) => a.classList.remove('active'));
        link.classList.add('active');
      },
      { rootMargin: '-92px 0px -60% 0px', threshold: 0 }
    );
    headings.forEach((h) => activeObserver.observe(h));
  }

  function wireAnchorClicks(root) {
    $$('.anchor', root).forEach((a) => {
      a.addEventListener('click', (e) => {
        e.preventDefault();
        const id = a.getAttribute('href').slice(1);
        const target = document.getElementById(id);
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
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

  /* ---------- top tabs (Code / Issues / PRs) ---------- */
  function wireTopTabs() {
    $$('.gh-tab').forEach((a) => {
      a.addEventListener('click', (e) => {
        const tab = a.dataset.tab;
        if (!tab) return;
        e.preventDefault();
        if (tab === 'code') {
          if (ACTIVE === 'TIMELINE') renderFile('TIMELINE');
          else renderFile(ACTIVE);
        } else if (tab === 'issues') {
          showView(VIEWS.ISSUES);
          renderIssues();
          scrollPaneTop();
        } else if (tab === 'prs') {
          showView(VIEWS.PRS);
          renderPRs();
          scrollPaneTop();
        } else {
          // visual-only tabs (Actions, Projects, Security, Insights)
          toast('That tab is decorative. Try Code, Issues, or Pull requests.');
        }
      });
    });
  }

  /* ---------- Issues rendering ---------- */
  function renderIssues() {
    const list = $('#issueList');
    const items = window.CONTENT.ISSUES || [];
    $('#openIssueCount').textContent = items.length;
    list.innerHTML = items.map((it) => `
      <li class="issue-item">
        <svg class="issue-icon" viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><circle cx="8" cy="8" r="7" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="8" cy="8" r="2" fill="currentColor"/></svg>
        <div class="issue-body">
          <div class="issue-title-row">
            <span class="issue-title">${escapeHtml(it.title)}</span>
            <span class="issue-labels">
              ${(it.labels || []).map((l) => `<span class="issue-label" data-label="${escapeHtml(l)}">${escapeHtml(l)}</span>`).join('')}
            </span>
          </div>
          <div class="issue-meta muted">
            #${it.id} opened ${escapeHtml(it.opened)} by ${escapeHtml(it.author)} ·
            <span class="c-count">${it.comments} comment${it.comments === 1 ? '' : 's'}</span>
          </div>
          <div class="issue-preview">${escapeHtml(it.body)}</div>
        </div>
      </li>
    `).join('');

    // label rail
    const rail = $('#labelRail');
    rail.innerHTML = (window.CONTENT.ISSUE_LABELS || []).map((l) => `
      <li data-label="${escapeHtml(l.name)}">
        <span class="label-swatch" style="background:${l.color}"></span>
        <span class="label-name">${escapeHtml(l.name)}</span>
        <span class="label-count">${l.count}</span>
      </li>
    `).join('');

    // simple label filter click-through
    rail.addEventListener('click', (e) => {
      const li = e.target.closest('li');
      if (!li) return;
      const label = li.dataset.label;
      rail.querySelectorAll('li').forEach((x) => x.classList.toggle('active', x === li));
      $$('.issue-item').forEach((it) => {
        const has = $$('.issue-label', it).some((sp) => sp.dataset.label === label);
        it.classList.toggle('dim', !has);
      });
      // clicking the same label again clears
      if (li.dataset.active === '1') {
        rail.querySelectorAll('li').forEach((x) => x.classList.remove('active'));
        $$('.issue-item').forEach((it) => it.classList.remove('dim'));
        li.dataset.active = '';
      } else {
        rail.querySelectorAll('li').forEach((x) => (x.dataset.active = ''));
        li.dataset.active = '1';
      }
    }, { once: false });
  }

  /* ---------- PRs rendering ---------- */
  function renderPRs() {
    const list = $('#prList');
    const items = window.CONTENT.PRS || [];
    const merged = items.filter((p) => p.state === 'merged').length;
    $('#mergedPrCount').textContent = merged;
    list.innerHTML = items.map((p) => `
      <li class="pr-item">
        <svg class="pr-icon ${p.state}" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
          ${p.state === 'merged'
            ? '<path fill="currentColor" d="M5 3.25a2.25 2.25 0 1 1 3 2.122v5.256a2.25 2.25 0 0 1-1.5 0V5.372A2.25 2.25 0 0 1 5 3.25Zm3 9.5a.75.75 0 1 0 1.5 0 .75.75 0 0 0-1.5 0Zm-1-9.5a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Z"/>'
            : '<path fill="currentColor" d="M1.5 3.25a2.25 2.25 0 1 1 3 2.122v5.256a2.251 2.251 0 1 1-1.5 0V5.372A2.25 2.25 0 0 1 1.5 3.25Zm8.5 0a2.25 2.25 0 1 1 3 2.122v5.256a2.251 2.251 0 1 1-1.5 0V5.372A2.25 2.25 0 0 1 10 3.25Z"/>'}
        </svg>
        <div class="pr-body">
          <div class="pr-title-row">
            <span class="pr-title">${escapeHtml(p.title)}</span>
            <span class="pr-state ${p.state}">${p.state}</span>
          </div>
          <div class="pr-meta muted">
            #${p.id} · ${escapeHtml(p.branch)} → ${escapeHtml(p.base)} ·
            ${p.state === 'merged'
              ? `merged ${escapeHtml(p.merged)} by ${escapeHtml(p.author)}`
              : `opened ${escapeHtml(p.opened)} by ${escapeHtml(p.author)}`}
          </div>
          <div class="pr-preview">${escapeHtml(p.body)}</div>
          <div class="pr-stats muted">
            <span>${p.commits} commits</span>
            <span>${p.changed} files changed</span>
            <span class="added">+${p.additions.toLocaleString()}</span>
            <span class="removed">-${p.deletions.toLocaleString()}</span>
            ${(p.labels || []).map((l) => `<span class="pr-label">${escapeHtml(l)}</span>`).join('')}
          </div>
        </div>
      </li>
    `).join('');
  }

  /* ---------- theme toggle ---------- */
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

  /* ---------- terminal skin toggle (smooth crossfade, no layout shift) ---------- */
  function wireSkin() {
    const btn = $('#skinToggle');
    const label = $('#skinLabel');
    const htmlEl = document.documentElement;
    const saved = localStorage.getItem('rgf2-skin');
    apply(saved || 'readme', /*initial*/ true);

    btn.addEventListener('click', () => {
      const next = htmlEl.dataset.skin === 'terminal' ? 'readme' : 'terminal';
      apply(next);
      localStorage.setItem('rgf2-skin', next);
    });

    function apply(skin, initial) {
      if (!initial) {
        htmlEl.classList.add('skin-transition');
        setTimeout(() => htmlEl.classList.remove('skin-transition'), 260);
      }
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
      if (CURRENT_VIEW === VIEWS.TIMELINE) {
        rawEl.textContent = window.TIMELINE.rawSource();
        rawPath.innerHTML = 'TIMELINE <span class="muted">· git log --graph --oneline --all --decorate</span>';
      } else if (CURRENT_VIEW === VIEWS.ISSUES) {
        rawEl.textContent = (window.CONTENT.ISSUES || []).map((it) =>
          `#${it.id}  [${(it.labels||[]).join(', ')}]\n  ${it.title}\n    ${it.body}\n`).join('\n');
        rawPath.innerHTML = 'issues.json <span class="muted">· raw</span>';
      } else if (CURRENT_VIEW === VIEWS.PRS) {
        rawEl.textContent = (window.CONTENT.PRS || []).map((p) =>
          `#${p.id}  [${p.state}]  ${p.branch} -> ${p.base}\n  ${p.title}\n    ${p.body}\n`).join('\n');
        rawPath.innerHTML = 'pulls.json <span class="muted">· raw</span>';
      } else {
        rawEl.textContent = window.CONTENT[ACTIVE] || '';
        rawPath.innerHTML = `${ACTIVE}.md <span class="muted">· raw</span>`;
      }
      modal.hidden = false;
      document.body.style.overflow = 'hidden';
      setTimeout(() => closeBtn.focus(), 20);
    }
    function close() { modal.hidden = true; document.body.style.overflow = ''; }

    openBtn.addEventListener('click', open);
    closeBtn.addEventListener('click', close);
    modal.addEventListener('click', (e) => { if (e.target === modal) close(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !modal.hidden) { close(); e.preventDefault(); } });

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

  /* ---------- star / fork ---------- */
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
      window.location.href = 'mailto:jake@stockunlock.com?subject=Fork%20request&body=Hi%20Jake%2C%0A%0AI%27d%20like%20to%20fork%20your%20career.%20Could%20we%20talk%3F%0A%0A';
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

  /* ---------- in-content anchor nav + TIMELINE shield hop ---------- */
  function wireInContentAnchors() {
    document.addEventListener('click', (e) => {
      const a = e.target.closest('a');
      if (!a) return;
      const href = a.getAttribute('href') || '';
      if (href === '#TIMELINE') { e.preventDefault(); renderFile('TIMELINE'); return; }
      if (/^#[A-Z][A-Z_]+$/.test(href) && window.CONTENT[href.slice(1)]) {
        e.preventDefault();
        renderFile(href.slice(1));
        return;
      }
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

  /* ---------- toast ---------- */
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

  /* ---------- copy rendered markdown button ---------- */
  function wireCopyAll() {
    $('#copyAllBtn').addEventListener('click', () => {
      let src = '';
      if (CURRENT_VIEW === VIEWS.MARKDOWN) src = window.CONTENT[ACTIVE] || '';
      else if (CURRENT_VIEW === VIEWS.TIMELINE) src = window.TIMELINE.rawSource();
      else if (CURRENT_VIEW === VIEWS.ISSUES) src = (window.CONTENT.ISSUES || []).map((i) => `#${i.id} ${i.title}`).join('\n');
      else if (CURRENT_VIEW === VIEWS.PRS) src = (window.CONTENT.PRS || []).map((p) => `#${p.id} ${p.title}`).join('\n');
      if (!src) return;
      if (!navigator.clipboard) fallbackCopy(src);
      else navigator.clipboard.writeText(src).catch(() => fallbackCopy(src));
      toast('Copied source to clipboard.');
    });
  }

  /* ---------- boot ---------- */
  function boot() {
    wireTheme();
    wireSkin();
    wireFileTree();
    wireTopTabs();
    wireModal();
    wireStarFork();
    wireInContentAnchors();
    wireCopyAll();
    renderFile('README');

    const hash = window.location.hash.slice(1);
    if (hash === 'TIMELINE') { renderFile('TIMELINE'); return; }
    if (hash && window.CONTENT[hash]) { renderFile(hash); return; }
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
