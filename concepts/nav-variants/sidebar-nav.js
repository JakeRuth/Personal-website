/* ==========================================================================
 * sidebar-nav.js
 * --------------------------------------------------------------------------
 * Thin left-side vertical rail with 5 mode entries — icon + label.
 * Current mode marked with a left accent bar + subtle fill.
 * Collapses to icon-only on narrow widths (or when host has data-compact).
 *
 * Usage:
 *   <div id="nav" data-sidebar-nav data-active="xp"></div>
 *   <script src="./sidebar-nav.js"></script>
 *   <script>SidebarNav.mount('#nav');</script>
 *
 * Options: active, accent, onSelect(mode, ctx), modes.
 * ========================================================================== */

(function (global) {
  'use strict';

  // Minimal inline SVG icons (intentionally abstract — no emoji).
  var ICONS = {
    xp:     '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="2.5" y="4" width="15" height="10" rx="1"/><path d="M2.5 8.5h15M6 17h8"/></svg>',
    saas:   '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="2.5" y="3" width="15" height="14" rx="2"/><path d="M2.5 7.5h15M6 11.5h4M6 14h7"/></svg>',
    git:    '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="5" cy="5" r="1.8"/><circle cx="5" cy="15" r="1.8"/><circle cx="15" cy="10" r="1.8"/><path d="M5 7v6M6.5 15h5a2 2 0 002-2v-1"/></svg>',
    readme: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 3h8l4 4v10a1 1 0 01-1 1H4a1 1 0 01-1-1V4a1 1 0 011-1z"/><path d="M12 3v4h4M6 10h8M6 13h8M6 16h5"/></svg>',
    vista:  '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="10" cy="10" r="7.5"/><path d="M10 2.5v15M2.5 10h15M4.5 5.5c3 2 8 2 11 0M4.5 14.5c3-2 8-2 11 0"/></svg>',
  };

  var DEFAULT_MODES = [
    { id: 'xp',     label: 'XP Luna',    hint: 'The nostalgic one' },
    { id: 'saas',   label: 'Enterprise', hint: 'The dev tool one' },
    { id: 'git',    label: 'Git Log',    hint: 'The engineer one' },
    { id: 'readme', label: 'README',     hint: 'The document one' },
    { id: 'vista',  label: 'Vista',      hint: 'The glass one' },
  ];

  var ACCENTS = {
    teal:  { base: '#34d6c0', ink: '#07100e', soft: 'rgba(52,214,192,0.14)' },
    amber: { base: '#f5b942', ink: '#1a1406', soft: 'rgba(245,185,66,0.14)' },
    blue:  { base: '#5eaaff', ink: '#04101c', soft: 'rgba(94,170,255,0.14)' },
  };

  var STYLE_ID = 'sidebar-nav-styles';
  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    var css = [
      '.sbn-root{position:absolute;top:0;left:0;z-index:40;display:flex;align-items:flex-start;pointer-events:none;font-family:"Inter",-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;}',
      '.sbn-root[data-fixed="true"]{position:fixed;top:0;bottom:0;}',
      '.sbn-root[data-sticky="true"]{position:sticky;top:0;}',
      '.sbn-rail{pointer-events:auto;display:flex;flex-direction:column;gap:2px;margin:20px 0 0 16px;padding:10px 8px;background:rgba(14,18,22,0.82);border:1px solid rgba(255,255,255,0.06);border-radius:18px;backdrop-filter:blur(16px) saturate(140%);-webkit-backdrop-filter:blur(16px) saturate(140%);box-shadow:0 12px 32px rgba(0,0,0,0.36);width:208px;transition:width 260ms cubic-bezier(.2,.7,.2,1);}',
      '.sbn-rail[data-compact="true"]{width:56px;}',
      '.sbn-rail[data-compact="true"] .sbn-item__label,.sbn-rail[data-compact="true"] .sbn-item__key,.sbn-rail[data-compact="true"] .sbn-brand__text{opacity:0;pointer-events:none;width:0;overflow:hidden;padding:0;margin:0;}',
      '.sbn-brand{display:flex;align-items:center;gap:10px;padding:6px 8px 10px;color:#e8edf2;font-size:13px;font-weight:600;letter-spacing:-0.01em;border-bottom:1px solid rgba(255,255,255,0.06);margin-bottom:8px;}',
      '.sbn-brand__dot{flex:0 0 auto;width:8px;height:8px;border-radius:50%;background:var(--sbn-accent);box-shadow:0 0 0 3px var(--sbn-accent-soft);}',
      '.sbn-brand__text{transition:opacity 200ms,width 240ms;white-space:nowrap;}',
      '.sbn-item{position:relative;display:flex;align-items:center;gap:12px;padding:10px 10px;border-radius:10px;color:#b8c0cc;font-size:13px;font-weight:500;letter-spacing:-0.005em;cursor:pointer;appearance:none;background:transparent;border:0;text-align:left;font-family:inherit;width:100%;transition:background 160ms,color 160ms;min-height:40px;}',
      '.sbn-item:hover{background:rgba(255,255,255,0.04);color:#eef2f6;}',
      '.sbn-item:focus-visible{outline:2px solid var(--sbn-accent);outline-offset:-2px;}',
      '.sbn-item__accent{position:absolute;left:-8px;top:8px;bottom:8px;width:3px;border-radius:2px;background:transparent;transition:background 180ms;}',
      '.sbn-item[data-active="true"]{background:var(--sbn-accent-soft);color:#eef2f6;}',
      '.sbn-item[data-active="true"] .sbn-item__accent{background:var(--sbn-accent);}',
      '.sbn-item[data-active="true"] .sbn-item__icon{color:var(--sbn-accent);}',
      '.sbn-item__icon{flex:0 0 auto;width:20px;height:20px;display:inline-flex;align-items:center;justify-content:center;color:#8b95a1;transition:color 180ms;}',
      '.sbn-item__icon svg{width:20px;height:20px;}',
      '.sbn-item__label{flex:1 1 auto;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;transition:opacity 200ms,width 240ms;}',
      '.sbn-item__key{flex:0 0 auto;font-size:10px;color:#6a7380;font-variant-numeric:tabular-nums;transition:opacity 200ms,width 240ms;}',
      '.sbn-item[data-active="true"] .sbn-item__key{color:var(--sbn-accent);opacity:0.8;}',
      '.sbn-toggle{margin-top:8px;padding:8px 10px;border-radius:10px;border:0;background:transparent;color:#6a7380;font:inherit;font-size:12px;cursor:pointer;display:flex;align-items:center;gap:8px;}',
      '.sbn-toggle:hover{background:rgba(255,255,255,0.04);color:#b8c0cc;}',
      '.sbn-toggle__icon{width:18px;height:18px;display:inline-flex;align-items:center;justify-content:center;}',
      '@media (max-width:860px){',
      '  .sbn-rail{width:56px;}',
      '  .sbn-rail .sbn-item__label,.sbn-rail .sbn-item__key,.sbn-rail .sbn-brand__text{opacity:0;pointer-events:none;width:0;overflow:hidden;padding:0;margin:0;}',
      '  .sbn-toggle{display:none;}',
      '}',
      '@media (prefers-reduced-motion:reduce){',
      '  .sbn-rail,.sbn-item,.sbn-item__label,.sbn-brand__text,.sbn-item__accent{transition:none!important;}',
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
    if (!host) throw new Error('SidebarNav.mount: target not found');

    var opts = userOptions || {};
    var ds = host.dataset || {};
    var modes = opts.modes || DEFAULT_MODES;
    var active = opts.active || ds.active || modes[0].id;
    var accentKey = opts.accent || ds.accent || 'teal';
    var accent = ACCENTS[accentKey] || ACCENTS.teal;
    var fixed = opts.fixed !== false;
    var sticky = opts.sticky === true || ds.sticky === 'true';
    var compact = opts.compact === true || ds.compact === 'true';

    host.innerHTML = '';
    host.style.setProperty('--sbn-accent', accent.base);
    host.style.setProperty('--sbn-accent-ink', accent.ink);
    host.style.setProperty('--sbn-accent-soft', accent.soft);

    var root = el('div', {
      class: 'sbn-root',
      'data-fixed': String(fixed && !sticky),
      'data-sticky': String(sticky),
      role: 'navigation',
      'aria-label': 'Experience modes',
    });
    var rail = el('div', { class: 'sbn-rail', 'data-compact': String(compact) });

    rail.appendChild(el('div', { class: 'sbn-brand' }, [
      el('span', { class: 'sbn-brand__dot' }),
      el('span', { class: 'sbn-brand__text' }, ['Jake Ruth']),
    ]));

    var itemNodes = {};
    modes.forEach(function (mode, i) {
      var item = el('button', {
        class: 'sbn-item',
        type: 'button',
        'data-mode': mode.id,
        'data-active': String(mode.id === active),
        'aria-current': mode.id === active ? 'page' : 'false',
        title: mode.hint || mode.label,
      }, [
        el('span', { class: 'sbn-item__accent', 'aria-hidden': 'true' }),
        el('span', { class: 'sbn-item__icon', 'aria-hidden': 'true', html: ICONS[mode.id] || ICONS.xp }),
        el('span', { class: 'sbn-item__label' }, [mode.label]),
        el('span', { class: 'sbn-item__key' }, [String(i + 1)]),
      ]);
      item.addEventListener('click', function () { select(mode.id); });
      rail.appendChild(item);
      itemNodes[mode.id] = item;
    });

    // Collapse toggle (desktop only — hidden via CSS on narrow widths)
    var toggle = el('button', {
      class: 'sbn-toggle',
      type: 'button',
      'aria-label': 'Collapse sidebar',
    }, [
      el('span', { class: 'sbn-toggle__icon', 'aria-hidden': 'true', html: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M12 5l-5 5 5 5"/></svg>' }),
      el('span', {}, ['Collapse']),
    ]);
    toggle.addEventListener('click', function () {
      compact = !compact;
      rail.setAttribute('data-compact', String(compact));
      toggle.setAttribute('aria-label', compact ? 'Expand sidebar' : 'Collapse sidebar');
      toggle.querySelector('svg').style.transform = compact ? 'rotate(180deg)' : '';
    });
    rail.appendChild(toggle);

    root.appendChild(rail);
    host.appendChild(root);

    var instance = {
      element: root,
      modes: modes.reduce(function (a, m) { a[m.id] = m; return a; }, {}),
      setActive: setActive,
      setCompact: function (v) { compact = !!v; rail.setAttribute('data-compact', String(compact)); },
      destroy: function () { host.innerHTML = ''; },
    };

    function setActive(id) {
      if (!itemNodes[id]) return;
      active = id;
      Object.keys(itemNodes).forEach(function (k) {
        var on = k === id;
        itemNodes[k].setAttribute('data-active', String(on));
        itemNodes[k].setAttribute('aria-current', on ? 'page' : 'false');
      });
    }
    function select(id) {
      if (id === active) return;
      if (typeof opts.onSelect === 'function') opts.onSelect(id, instance);
      else setActive(id);
    }

    return instance;
  }

  global.SidebarNav = { mount: mount, defaults: { modes: DEFAULT_MODES.slice(), accents: Object.keys(ACCENTS) } };
})(typeof window !== 'undefined' ? window : this);
