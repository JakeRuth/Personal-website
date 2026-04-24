/* ==========================================================================
 * underline-nav.js
 * --------------------------------------------------------------------------
 * Editorial / newspaper horizontal nav. Five mode labels, plain text, with
 * a thin underline on the current one. Very restrained — intended to feel
 * like a magazine masthead row.
 *
 * Usage:
 *   <div id="nav" data-underline-nav data-active="xp"></div>
 *   <script src="./underline-nav.js"></script>
 *   <script>UnderlineNav.mount('#nav');</script>
 *
 * Options: active, accent, onSelect(mode, ctx), modes,
 *          theme ('dark' | 'light') — default 'dark'.
 * ========================================================================== */

(function (global) {
  'use strict';

  var DEFAULT_MODES = [
    { id: 'xp',     label: 'XP Luna' },
    { id: 'saas',   label: 'Enterprise' },
    { id: 'git',    label: 'Git Log' },
    { id: 'readme', label: 'README' },
    { id: 'vista',  label: 'Vista' },
  ];

  var ACCENTS = {
    teal:  { base: '#34d6c0' },
    amber: { base: '#f5b942' },
    blue:  { base: '#5eaaff' },
    ink:   { base: '#e8edf2' },
  };

  var STYLE_ID = 'underline-nav-styles';
  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    var css = [
      '.uln-root{position:absolute;top:0;left:0;right:0;z-index:40;font-family:"Inter",-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;pointer-events:none;}',
      '.uln-root[data-fixed="true"]{position:fixed;}',
      '.uln-root[data-sticky="true"]{position:sticky;top:0;}',
      '.uln-bar{pointer-events:auto;display:flex;align-items:baseline;justify-content:space-between;gap:24px;padding:22px clamp(20px,4vw,42px) 14px;border-bottom:1px solid rgba(255,255,255,0.10);background:rgba(12,14,17,0.78);backdrop-filter:blur(12px) saturate(130%);-webkit-backdrop-filter:blur(12px) saturate(130%);}',
      '.uln-root[data-theme="light"] .uln-bar{background:rgba(250,248,243,0.85);border-bottom-color:rgba(0,0,0,0.16);}',
      '.uln-masthead{font-family:Georgia,"Times New Roman",serif;font-size:16px;letter-spacing:0.02em;color:#e8edf2;font-weight:600;white-space:nowrap;}',
      '.uln-root[data-theme="light"] .uln-masthead{color:#1a1a1a;}',
      '.uln-masthead__small{display:inline-block;font-family:"Inter",sans-serif;font-size:10px;letter-spacing:0.18em;text-transform:uppercase;color:#7a828e;margin-left:10px;font-weight:500;}',
      '.uln-root[data-theme="light"] .uln-masthead__small{color:#6c6a62;}',
      '.uln-tabs{display:flex;align-items:baseline;gap:clamp(14px,2.6vw,30px);flex-wrap:wrap;justify-content:flex-end;}',
      '.uln-tab{position:relative;appearance:none;background:transparent;border:0;padding:4px 2px 10px;font:inherit;font-size:13px;letter-spacing:0.08em;text-transform:uppercase;font-weight:500;color:#8b95a1;cursor:pointer;transition:color 200ms;}',
      '.uln-root[data-theme="light"] .uln-tab{color:#6c6a62;}',
      '.uln-tab:hover{color:#e8edf2;}',
      '.uln-root[data-theme="light"] .uln-tab:hover{color:#1a1a1a;}',
      '.uln-tab:focus-visible{outline:2px solid var(--uln-accent);outline-offset:2px;border-radius:2px;}',
      '.uln-tab[data-active="true"]{color:#eef2f6;}',
      '.uln-root[data-theme="light"] .uln-tab[data-active="true"]{color:#111;}',
      '.uln-tab__mark{position:absolute;left:0;right:0;bottom:-1px;height:2px;background:var(--uln-accent);transform:scaleX(0);transform-origin:left;transition:transform 260ms cubic-bezier(.2,.7,.2,1);}',
      '.uln-tab[data-active="true"] .uln-tab__mark{transform:scaleX(1);}',
      '.uln-tab__key{display:inline-block;margin-left:8px;font-family:Georgia,"Times New Roman",serif;font-size:10px;letter-spacing:0;text-transform:none;color:#5b6470;font-style:italic;font-weight:400;}',
      '.uln-tab[data-active="true"] .uln-tab__key{color:var(--uln-accent);}',
      '@media (max-width:720px){',
      '  .uln-bar{flex-direction:column;align-items:flex-start;gap:10px;padding:16px 18px 0;}',
      '  .uln-tabs{justify-content:flex-start;gap:16px;width:100%;overflow-x:auto;padding-bottom:8px;-webkit-overflow-scrolling:touch;}',
      '  .uln-tab{flex:0 0 auto;}',
      '  .uln-tab__key{display:none;}',
      '}',
      '@media (prefers-reduced-motion:reduce){',
      '  .uln-tab,.uln-tab__mark{transition:none!important;}',
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
    if (!host) throw new Error('UnderlineNav.mount: target not found');

    var opts = userOptions || {};
    var ds = host.dataset || {};
    var modes = opts.modes || DEFAULT_MODES;
    var active = opts.active || ds.active || modes[0].id;
    var accentKey = opts.accent || ds.accent || 'ink';
    var accent = ACCENTS[accentKey] || ACCENTS.ink;
    var theme = opts.theme || ds.theme || 'dark';
    var fixed = opts.fixed !== false;
    var sticky = opts.sticky === true || ds.sticky === 'true';
    var masthead = opts.masthead || ds.masthead || 'Jake Ruth';
    var mastheadSmall = opts.mastheadSmall || ds.mastheadSmall || 'Personal site, 2026 edition';

    host.innerHTML = '';
    host.style.setProperty('--uln-accent', accent.base);

    var root = el('div', {
      class: 'uln-root',
      'data-fixed': String(fixed && !sticky),
      'data-sticky': String(sticky),
      'data-theme': theme,
      role: 'navigation',
      'aria-label': 'Experience modes',
    });
    var bar = el('div', { class: 'uln-bar' });

    bar.appendChild(el('div', { class: 'uln-masthead' }, [
      document.createTextNode(masthead),
      el('span', { class: 'uln-masthead__small' }, [mastheadSmall]),
    ]));

    var tabsWrap = el('div', { class: 'uln-tabs' });
    var tabNodes = {};
    modes.forEach(function (mode, i) {
      var romans = ['I', 'II', 'III', 'IV', 'V'];
      var tab = el('button', {
        class: 'uln-tab',
        type: 'button',
        'data-mode': mode.id,
        'data-active': String(mode.id === active),
        'aria-current': mode.id === active ? 'page' : 'false',
      }, [
        document.createTextNode(mode.label),
        el('span', { class: 'uln-tab__key', 'aria-hidden': 'true' }, [romans[i] || String(i + 1)]),
        el('span', { class: 'uln-tab__mark', 'aria-hidden': 'true' }),
      ]);
      tab.addEventListener('click', function () { select(mode.id); });
      tabsWrap.appendChild(tab);
      tabNodes[mode.id] = tab;
    });
    bar.appendChild(tabsWrap);

    root.appendChild(bar);
    host.appendChild(root);

    var instance = {
      element: root,
      modes: modes.reduce(function (a, m) { a[m.id] = m; return a; }, {}),
      setActive: setActive,
      destroy: function () { host.innerHTML = ''; },
    };

    function setActive(id) {
      if (!tabNodes[id]) return;
      active = id;
      Object.keys(tabNodes).forEach(function (k) {
        var on = k === id;
        tabNodes[k].setAttribute('data-active', String(on));
        tabNodes[k].setAttribute('aria-current', on ? 'page' : 'false');
      });
    }
    function select(id) {
      if (id === active) return;
      if (typeof opts.onSelect === 'function') opts.onSelect(id, instance);
      else setActive(id);
    }

    return instance;
  }

  global.UnderlineNav = { mount: mount, defaults: { modes: DEFAULT_MODES.slice(), accents: Object.keys(ACCENTS) } };
})(typeof window !== 'undefined' ? window : this);
