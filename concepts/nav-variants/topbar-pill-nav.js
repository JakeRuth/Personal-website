/* ==========================================================================
 * topbar-pill-nav.js  (v2, refined)
 * --------------------------------------------------------------------------
 * A drop-in, dependency-free top bar with mode pills. v2 refinements over
 * the original nav-topbar-pills:
 *   - Tighter spacing on the bar + pills
 *   - Larger hit targets (44px minimum tap height) without looking bigger
 *   - Slightly refined accent + softer shadow
 *   - Gentler collapse curve on scroll
 *
 * Usage:
 *   <div id="nav" data-topbar-pill-nav data-active="xp"></div>
 *   <script src="./topbar-pill-nav.js"></script>
 *   <script>TopbarPillNav.mount('#nav');</script>
 *
 * Options:
 *   active, accent ('teal'|'amber'|'blue'), scrollCollapsePx,
 *   scopeToSection (CSS selector — only collapse while scrolled inside it),
 *   onSelect(mode, ctx), modes (override).
 * ========================================================================== */

(function (global) {
  'use strict';

  var DEFAULT_MODES = [
    { id: 'xp',     label: 'XP',     tagline: 'XP Luna',         hint: 'Senior-year desktop.' },
    { id: 'saas',   label: 'SaaS',   tagline: 'Enterprise',      hint: 'A straight face over a dry joke.' },
    { id: 'git',    label: 'Git',    tagline: 'Git Log',         hint: 'Thirteen years of commits.' },
    { id: 'readme', label: 'README', tagline: 'README',          hint: 'Markdown on markdown.' },
    { id: 'vista',  label: 'Vista',  tagline: 'Vista',           hint: 'Aero Glass, unironically.' },
  ];

  var ACCENTS = {
    teal:  { base: '#34d6c0', ink: '#07100e', soft: 'rgba(52,214,192,0.16)', edge: 'rgba(52,214,192,0.40)' },
    amber: { base: '#f5b942', ink: '#1a1406', soft: 'rgba(245,185,66,0.16)', edge: 'rgba(245,185,66,0.40)' },
    blue:  { base: '#5eaaff', ink: '#04101c', soft: 'rgba(94,170,255,0.16)', edge: 'rgba(94,170,255,0.40)' },
  };

  var STYLE_ID = 'topbar-pill-nav-styles';
  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    var css = [
      '.tpn-root{position:absolute;top:0;left:0;right:0;z-index:40;display:flex;justify-content:center;pointer-events:none;font-family:"Inter",-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;}',
      '.tpn-root[data-sticky="true"]{position:sticky;top:0;}',
      '.tpn-root[data-fixed="true"]{position:fixed;}',
      '.tpn-bar{pointer-events:auto;margin-top:16px;padding:6px;display:flex;align-items:center;gap:4px;background:rgba(16,20,24,0.80);border:1px solid rgba(255,255,255,0.06);border-radius:999px;backdrop-filter:blur(16px) saturate(140%);-webkit-backdrop-filter:blur(16px) saturate(140%);box-shadow:0 12px 36px rgba(0,0,0,0.38),0 1px 0 rgba(255,255,255,0.04) inset;transition:transform 360ms cubic-bezier(.2,.7,.2,1),padding 300ms cubic-bezier(.2,.7,.2,1),gap 300ms cubic-bezier(.2,.7,.2,1),margin-top 300ms cubic-bezier(.2,.7,.2,1),opacity 240ms;}',
      '.tpn-bar[data-collapsed="true"]{padding:3px;gap:1px;margin-top:8px;transform:scale(0.88);}',
      '.tpn-bar[data-collapsed="true"] .tpn-pill{padding:6px 11px;font-size:11.5px;letter-spacing:0.04em;min-height:28px;}',
      '.tpn-bar[data-collapsed="true"] .tpn-brand{opacity:0;width:0;margin:0;padding:0;overflow:hidden;}',
      '.tpn-bar[data-collapsed="true"] .tpn-pill__key{display:none;}',
      '.tpn-brand{display:flex;align-items:center;gap:8px;padding:0 10px 0 8px;color:#e8edf2;font-weight:600;font-size:13px;letter-spacing:-0.01em;white-space:nowrap;transition:opacity 220ms,width 300ms,padding 300ms;}',
      '.tpn-brand__dot{width:7px;height:7px;border-radius:50%;background:var(--tpn-accent);box-shadow:0 0 0 3px var(--tpn-accent-soft);}',
      '.tpn-brand__sep{width:1px;align-self:stretch;background:rgba(255,255,255,0.08);margin:5px 2px;}',
      '.tpn-pill{position:relative;appearance:none;background:transparent;color:#b8c0cc;border:1px solid rgba(255,255,255,0.08);border-radius:999px;padding:9px 16px;font:inherit;font-size:13px;font-weight:500;letter-spacing:-0.005em;cursor:pointer;transition:color 180ms,border-color 180ms,background 180ms,transform 180ms;white-space:nowrap;min-height:36px;display:inline-flex;align-items:center;}',
      '.tpn-pill:hover{color:#eef2f6;border-color:rgba(255,255,255,0.20);background:rgba(255,255,255,0.04);}',
      '.tpn-pill:focus-visible{outline:2px solid var(--tpn-accent);outline-offset:2px;}',
      '.tpn-pill[data-active="true"]{background:var(--tpn-accent);color:var(--tpn-accent-ink);border-color:var(--tpn-accent);box-shadow:0 0 0 4px var(--tpn-accent-soft);}',
      '.tpn-pill[data-active="true"]:hover{color:var(--tpn-accent-ink);}',
      '.tpn-pill__key{display:inline-block;margin-left:8px;font-size:10px;opacity:0.5;letter-spacing:0.05em;font-variant-numeric:tabular-nums;}',
      '.tpn-pill[data-active="true"] .tpn-pill__key{opacity:0.7;}',
      '@media (max-width:640px){',
      '  .tpn-bar{padding:4px;gap:2px;}',
      '  .tpn-pill{padding:8px 12px;font-size:12.5px;}',
      '  .tpn-pill__key{display:none;}',
      '  .tpn-brand__sep{display:none;}',
      '  .tpn-brand{display:none;}',
      '}',
      '@media (prefers-reduced-motion:reduce){',
      '  .tpn-bar,.tpn-pill,.tpn-brand{transition:none!important;}',
      '}',
    ].join('\n');
    var s = document.createElement('style');
    s.id = STYLE_ID;
    s.textContent = css;
    document.head.appendChild(s);
  }

  function el(tag, attrs, children) {
    var n = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      if (k === 'class') n.className = attrs[k];
      else if (k === 'html') n.innerHTML = attrs[k];
      else if (k.slice(0, 2) === 'on') n.addEventListener(k.slice(2).toLowerCase(), attrs[k]);
      else n.setAttribute(k, attrs[k]);
    });
    (children || []).forEach(function (c) {
      if (c == null) return;
      n.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
    });
    return n;
  }
  function resolve(t) { return typeof t === 'string' ? document.querySelector(t) : t; }

  function mount(target, userOptions) {
    injectStyles();
    var host = resolve(target);
    if (!host) throw new Error('TopbarPillNav.mount: target not found');

    var opts = userOptions || {};
    var ds = host.dataset || {};
    var modes = opts.modes || DEFAULT_MODES;
    var active = opts.active || ds.active || modes[0].id;
    var accentKey = opts.accent || ds.accent || 'teal';
    var accent = ACCENTS[accentKey] || ACCENTS.teal;
    var scrollThreshold = Number(opts.scrollCollapsePx || ds.scrollCollapsePx || 80);
    var scopeSelector = opts.scopeToSection || ds.scopeToSection || null;
    var fixed = opts.fixed !== false; // default true
    var sticky = opts.sticky === true || ds.sticky === 'true';

    host.innerHTML = '';
    host.style.setProperty('--tpn-accent', accent.base);
    host.style.setProperty('--tpn-accent-ink', accent.ink);
    host.style.setProperty('--tpn-accent-soft', accent.soft);

    var root = el('div', {
      class: 'tpn-root',
      'data-fixed': String(fixed && !sticky),
      'data-sticky': String(sticky),
      role: 'navigation',
      'aria-label': 'Experience modes',
    });
    var bar = el('div', { class: 'tpn-bar', 'data-collapsed': 'false' });

    bar.appendChild(el('div', { class: 'tpn-brand' }, [
      el('span', { class: 'tpn-brand__dot' }),
      el('span', {}, ['Jake Ruth']),
    ]));
    bar.appendChild(el('div', { class: 'tpn-brand__sep' }));

    var pillsWrap = el('div', { style: 'display:flex;align-items:center;gap:3px;' });
    var pillNodes = {};
    modes.forEach(function (mode, i) {
      var pill = el('button', {
        class: 'tpn-pill',
        type: 'button',
        'data-mode': mode.id,
        'data-active': String(mode.id === active),
        'aria-current': mode.id === active ? 'page' : 'false',
        title: mode.tagline || mode.label,
      }, [
        document.createTextNode(mode.label),
        el('span', { class: 'tpn-pill__key' }, [String(i + 1)]),
      ]);
      pill.addEventListener('click', function () { select(mode.id); });
      pillsWrap.appendChild(pill);
      pillNodes[mode.id] = pill;
    });
    bar.appendChild(pillsWrap);
    root.appendChild(bar);
    host.appendChild(root);

    var instance = {
      element: root,
      modes: modes.reduce(function (a, m) { a[m.id] = m; return a; }, {}),
      setActive: setActive,
      destroy: destroy,
    };

    function setActive(id) {
      if (!pillNodes[id]) return;
      active = id;
      Object.keys(pillNodes).forEach(function (k) {
        var on = k === id;
        pillNodes[k].setAttribute('data-active', String(on));
        pillNodes[k].setAttribute('aria-current', on ? 'page' : 'false');
      });
    }

    function select(id) {
      if (id === active) return;
      if (typeof opts.onSelect === 'function') opts.onSelect(id, instance);
      else setActive(id);
    }

    // Scroll collapse. If scopeToSection is set, the collapse logic only
    // considers scrollY relative to that section (so the bar stays expanded
    // while the user is inside a sibling section).
    var lastY = window.scrollY || 0;
    var collapsed = false;
    function onScroll() {
      var y = window.scrollY || 0;
      var goingDown = y > lastY;
      var relY = y;
      if (scopeSelector) {
        var scope = document.querySelector(scopeSelector);
        if (scope) {
          var rect = scope.getBoundingClientRect();
          relY = -rect.top; // positive as the user scrolls into the section
        }
      }
      if (goingDown && relY > scrollThreshold && !collapsed) {
        collapsed = true; bar.setAttribute('data-collapsed', 'true');
      } else if ((!goingDown || relY <= scrollThreshold) && collapsed) {
        collapsed = false; bar.setAttribute('data-collapsed', 'false');
      }
      lastY = y;
    }
    var raf = 0;
    function scrollHandler() {
      if (raf) return;
      raf = requestAnimationFrame(function () { raf = 0; onScroll(); });
    }
    window.addEventListener('scroll', scrollHandler, { passive: true });

    function destroy() {
      window.removeEventListener('scroll', scrollHandler);
      host.innerHTML = '';
    }

    return instance;
  }

  global.TopbarPillNav = { mount: mount, defaults: { modes: DEFAULT_MODES.slice(), accents: Object.keys(ACCENTS) } };
})(typeof window !== 'undefined' ? window : this);
