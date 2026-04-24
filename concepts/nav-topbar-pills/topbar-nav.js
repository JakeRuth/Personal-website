/* ==========================================================================
 * topbar-nav.js
 * --------------------------------------------------------------------------
 * A drop-in, dependency-free top bar with mode pills for jakeruth.com.
 *
 * Usage (minimal):
 *   <div id="nav" data-topbar-nav data-active="xp"></div>
 *   <script src="./topbar-nav.js"></script>
 *   <script>TopbarNav.mount('#nav');</script>
 *
 * Usage (configured):
 *   TopbarNav.mount('#nav', {
 *     active: 'xp',                    // which pill starts highlighted
 *     accent: 'teal',                  // 'teal' | 'amber' | 'blue'
 *     scrollCollapsePx: 80,            // scroll-Y threshold to collapse
 *     onSelect: (mode, ctx) => {       // called when a pill is clicked
 *       // In a real experience, navigate: location.href = ctx.modes[mode].href;
 *       // In this prototype, we simulate:
 *       ctx.simulateTransition(mode);
 *     },
 *     modes: [                         // override labels/tooltips/hrefs
 *       { id: 'xp',     label: 'XP',     tagline: 'XP Luna · the nostalgic one',    href: '../xp-luna-v2/' },
 *       { id: 'saas',   label: 'SaaS',   tagline: 'Enterprise · the dev tool one',  href: '../enterprise-saas-v2/' },
 *       { id: 'git',    label: 'Git',    tagline: 'Git Log · the engineer one',     href: '../git-log-v2/' },
 *       { id: 'readme', label: 'README', tagline: 'README · the document one',      href: '../readme-mode/' },
 *       { id: 'vista',  label: 'Vista',  tagline: 'Vista · the glass one',          href: '../vista-faithful-v2/' },
 *     ],
 *   });
 *
 * Data attributes (alt to config object):
 *   data-topbar-nav              marker attribute
 *   data-active="xp"             active mode id
 *   data-accent="teal"           accent color key
 *   data-scroll-collapse-px="80" scroll-y threshold
 *
 * Keyboard:
 *   1..5 jumps between modes (unless focus is in a text input).
 *
 * Exported:
 *   window.TopbarNav.mount(selectorOrEl, options) -> instance
 *   instance.setActive(id)
 *   instance.destroy()
 * ========================================================================== */

(function (global) {
  'use strict';

  // ---- Default modes (mirror voice / site structure) ----------------------
  var DEFAULT_MODES = [
    {
      id: 'xp',
      label: 'XP',
      tagline: 'XP Luna · the nostalgic one',
      hint: 'Senior-year desktop. Start menu included.',
      href: '#',
    },
    {
      id: 'saas',
      label: 'SaaS',
      tagline: 'Enterprise · the dev tool one',
      hint: 'A straight face over a dry joke.',
      href: '#',
    },
    {
      id: 'git',
      label: 'Git',
      tagline: 'Git Log · the engineer one',
      hint: 'Thirteen years of commits, one CV.',
      href: '#',
    },
    {
      id: 'readme',
      label: 'README',
      tagline: 'README · the document one',
      hint: 'Markdown on markdown on markdown.',
      href: '#',
    },
    {
      id: 'vista',
      label: 'Vista',
      tagline: 'Vista · the glass one',
      hint: 'Aero Glass, unironically.',
      href: '#',
    },
  ];

  // ---- Accents ------------------------------------------------------------
  var ACCENTS = {
    teal:  { base: '#2dd4bf', ink: '#0b0d10', soft: 'rgba(45,212,191,0.14)', edge: 'rgba(45,212,191,0.45)' },
    amber: { base: '#f5b942', ink: '#1a1406', soft: 'rgba(245,185,66,0.14)', edge: 'rgba(245,185,66,0.45)' },
    blue:  { base: '#5eaaff', ink: '#04101c', soft: 'rgba(94,170,255,0.14)', edge: 'rgba(94,170,255,0.45)' },
  };

  // ---- One-time style injection ------------------------------------------
  var STYLE_ID = 'topbar-nav-styles';
  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    var css = [
      '.tbn-root{position:fixed;top:0;left:0;right:0;z-index:40;display:flex;justify-content:center;pointer-events:none;font-family:"Inter",-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;}',
      '.tbn-bar{pointer-events:auto;margin-top:18px;padding:8px;display:flex;align-items:center;gap:6px;background:rgba(18,22,27,0.78);border:1px solid rgba(255,255,255,0.07);border-radius:999px;backdrop-filter:blur(14px) saturate(140%);-webkit-backdrop-filter:blur(14px) saturate(140%);box-shadow:0 10px 30px rgba(0,0,0,0.35),0 1px 0 rgba(255,255,255,0.04) inset;transition:transform 320ms cubic-bezier(.2,.7,.2,1),padding 260ms cubic-bezier(.2,.7,.2,1),gap 260ms cubic-bezier(.2,.7,.2,1),margin-top 260ms cubic-bezier(.2,.7,.2,1);}',
      '.tbn-bar[data-collapsed="true"]{padding:4px;gap:2px;margin-top:10px;transform:scale(0.86);}',
      '.tbn-bar[data-collapsed="true"] .tbn-pill{padding:4px 10px;font-size:11px;letter-spacing:0.08em;}',
      '.tbn-bar[data-collapsed="true"] .tbn-brand{opacity:0;width:0;margin:0;padding:0;overflow:hidden;}',
      '.tbn-brand{display:flex;align-items:center;gap:8px;padding:0 10px 0 6px;color:#e7ebef;font-weight:600;font-size:13px;letter-spacing:-0.01em;white-space:nowrap;transition:opacity 200ms,width 260ms,padding 260ms;}',
      '.tbn-brand__dot{width:8px;height:8px;border-radius:50%;background:var(--tbn-accent);box-shadow:0 0 0 3px var(--tbn-accent-soft);}',
      '.tbn-brand__sep{width:1px;align-self:stretch;background:rgba(255,255,255,0.08);margin:4px 0;}',
      '.tbn-pill{position:relative;appearance:none;background:transparent;color:#b8c0cc;border:1px solid rgba(255,255,255,0.10);border-radius:999px;padding:7px 14px;font:inherit;font-size:13px;font-weight:500;letter-spacing:-0.005em;cursor:pointer;transition:color 180ms,border-color 180ms,background 180ms,transform 180ms;white-space:nowrap;}',
      '.tbn-pill:hover{color:#e7ebef;border-color:rgba(255,255,255,0.22);background:rgba(255,255,255,0.03);}',
      '.tbn-pill:focus-visible{outline:2px solid var(--tbn-accent);outline-offset:2px;}',
      '.tbn-pill[data-active="true"]{background:var(--tbn-accent);color:var(--tbn-accent-ink);border-color:var(--tbn-accent);box-shadow:0 0 0 4px var(--tbn-accent-soft);}',
      '.tbn-pill[data-active="true"]:hover{color:var(--tbn-accent-ink);}',
      '.tbn-pill__key{display:inline-block;margin-left:8px;font-size:10px;opacity:0.55;letter-spacing:0.05em;}',
      '.tbn-pill[data-active="true"] .tbn-pill__key{opacity:0.7;}',
      '.tbn-tip{position:absolute;top:calc(100% + 10px);left:50%;transform:translate(-50%,4px);background:#0f1318;color:#e7ebef;border:1px solid rgba(255,255,255,0.08);border-radius:10px;padding:10px 12px;min-width:200px;opacity:0;pointer-events:none;transition:opacity 160ms,transform 180ms cubic-bezier(.2,.7,.2,1);box-shadow:0 12px 32px rgba(0,0,0,0.4);z-index:2;}',
      '.tbn-pill:hover .tbn-tip,.tbn-pill:focus-visible .tbn-tip{opacity:1;transform:translate(-50%,0);}',
      '.tbn-tip__thumb{height:74px;border-radius:6px;margin-bottom:8px;background:#1a2027;border:1px solid rgba(255,255,255,0.06);position:relative;overflow:hidden;}',
      '.tbn-tip__title{font-size:13px;font-weight:600;color:#e7ebef;letter-spacing:-0.01em;margin-bottom:2px;}',
      '.tbn-tip__hint{font-size:11px;color:#8b95a1;line-height:1.45;}',
      /* per-mode thumbnail moods (tiny visual flavor) */
      '.tbn-tip--xp .tbn-tip__thumb{background:linear-gradient(180deg,#2a5fb8 0%,#5d9cf5 45%,#3b7dd8 100%);}',
      '.tbn-tip--xp .tbn-tip__thumb::after{content:"";position:absolute;inset:auto 0 0 0;height:14px;background:linear-gradient(180deg,#1e3f7a,#0f2040);border-top:1px solid rgba(255,255,255,0.3);}',
      '.tbn-tip--saas .tbn-tip__thumb{background:linear-gradient(180deg,#f5f5f5 0%,#e6ecf3 100%);}',
      '.tbn-tip--saas .tbn-tip__thumb::after{content:"";position:absolute;inset:14px 14px auto auto;width:48px;height:6px;background:#4f46e5;border-radius:3px;box-shadow:0 12px 0 #c4c9d4,0 24px 0 #c4c9d4;}',
      '.tbn-tip--git .tbn-tip__thumb{background:#0a0a0a;font-family:"SF Mono",ui-monospace,Menlo,monospace;color:#7ee787;font-size:10px;line-height:1.4;padding:8px;box-sizing:border-box;}',
      '.tbn-tip--git .tbn-tip__thumb::before{content:"* 2026-04 ship\\A * 2021-06 stock-unlock\\A * 2017-03 oscar";white-space:pre;}',
      '.tbn-tip--readme .tbn-tip__thumb{background:#f7f6f1;color:#222;font-family:"SF Mono",ui-monospace,Menlo,monospace;font-size:10px;padding:8px;box-sizing:border-box;line-height:1.5;}',
      '.tbn-tip--readme .tbn-tip__thumb::before{content:"# Jake Ruth\\A\\A## About\\A- Engineer, founder\\A- NYC";white-space:pre;}',
      '.tbn-tip--vista .tbn-tip__thumb{background:radial-gradient(circle at 30% 30%,#7fb2ff,#1e3a8a 80%);position:relative;}',
      '.tbn-tip--vista .tbn-tip__thumb::after{content:"";position:absolute;inset:14px;border-radius:8px;background:rgba(255,255,255,0.16);border:1px solid rgba(255,255,255,0.35);backdrop-filter:blur(8px);}',

      /* Mobile */
      '@media (max-width:640px){',
      '  .tbn-bar{padding:6px;gap:4px;}',
      '  .tbn-pill__key{display:none;}',
      '  .tbn-brand__sep{display:none;}',
      '  .tbn-pills-wrap{display:none;}',
      '  .tbn-bar[data-mobile-open="true"] .tbn-pills-wrap{display:flex;flex-direction:column;align-items:stretch;gap:4px;position:absolute;top:calc(100% + 8px);left:8px;right:8px;background:rgba(18,22,27,0.96);border:1px solid rgba(255,255,255,0.07);padding:8px;border-radius:16px;backdrop-filter:blur(14px);}',
      '  .tbn-bar[data-mobile-open="true"] .tbn-pill{width:100%;text-align:left;}',
      '  .tbn-bar[data-mobile-open="true"] .tbn-tip{display:none;}',
      '  .tbn-hamburger{display:inline-flex;}',
      '  .tbn-bar{position:relative;}',
      '}',
      '.tbn-hamburger{display:none;appearance:none;background:transparent;border:1px solid rgba(255,255,255,0.1);color:#e7ebef;border-radius:999px;padding:7px 12px;font:inherit;font-size:13px;cursor:pointer;}',
      '.tbn-hamburger:hover{background:rgba(255,255,255,0.05);}',

      /* Respect reduced motion */
      '@media (prefers-reduced-motion:reduce){',
      '  .tbn-bar,.tbn-pill,.tbn-tip,.tbn-brand{transition:none!important;}',
      '}',
    ].join('\n');
    var s = document.createElement('style');
    s.id = STYLE_ID;
    s.textContent = css;
    document.head.appendChild(s);
  }

  // ---- Small helpers -----------------------------------------------------
  function el(tag, attrs, children) {
    var n = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        if (k === 'class') n.className = attrs[k];
        else if (k === 'html') n.innerHTML = attrs[k];
        else if (k.slice(0, 2) === 'on') n.addEventListener(k.slice(2).toLowerCase(), attrs[k]);
        else n.setAttribute(k, attrs[k]);
      });
    }
    (children || []).forEach(function (c) {
      if (c == null) return;
      n.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
    });
    return n;
  }
  function resolve(target) {
    return typeof target === 'string' ? document.querySelector(target) : target;
  }
  function isTypingIn(node) {
    if (!node) return false;
    var tag = (node.tagName || '').toLowerCase();
    return tag === 'input' || tag === 'textarea' || tag === 'select' || node.isContentEditable;
  }

  // ---- Mount --------------------------------------------------------------
  function mount(target, userOptions) {
    injectStyles();
    var host = resolve(target);
    if (!host) throw new Error('TopbarNav.mount: target not found: ' + target);

    var opts = userOptions || {};
    var ds = host.dataset || {};

    var modes = opts.modes || DEFAULT_MODES;
    var active = opts.active || ds.active || modes[0].id;
    var accentKey = opts.accent || ds.accent || 'teal';
    var accent = ACCENTS[accentKey] || ACCENTS.teal;
    var scrollThreshold = Number(opts.scrollCollapsePx || ds.scrollCollapsePx || 80);

    // Clear any prior content in the mount point
    host.innerHTML = '';
    host.style.setProperty('--tbn-accent', accent.base);
    host.style.setProperty('--tbn-accent-ink', accent.ink);
    host.style.setProperty('--tbn-accent-soft', accent.soft);
    host.style.setProperty('--tbn-accent-edge', accent.edge);

    var root = el('div', { class: 'tbn-root', role: 'navigation', 'aria-label': 'Experience modes' });
    var bar = el('div', { class: 'tbn-bar', 'data-collapsed': 'false' });

    // Brand
    bar.appendChild(el('div', { class: 'tbn-brand' }, [
      el('span', { class: 'tbn-brand__dot' }),
      el('span', {}, ['Jake Ruth']),
    ]));
    bar.appendChild(el('div', { class: 'tbn-brand__sep' }));

    // Hamburger (mobile only via CSS)
    var hamburger = el('button', {
      class: 'tbn-hamburger',
      type: 'button',
      'aria-label': 'Toggle modes',
      'aria-expanded': 'false',
    }, ['Modes']);
    bar.appendChild(hamburger);

    // Pills
    var pillsWrap = el('div', { class: 'tbn-pills-wrap', style: 'display:flex;align-items:center;gap:6px;' });
    var pillNodes = {};
    modes.forEach(function (mode, i) {
      var keyNum = i + 1;
      var tip = el('div', { class: 'tbn-tip tbn-tip--' + mode.id, role: 'tooltip' }, [
        el('div', { class: 'tbn-tip__thumb', 'aria-hidden': 'true' }),
        el('div', { class: 'tbn-tip__title' }, [mode.tagline || mode.label]),
        mode.hint ? el('div', { class: 'tbn-tip__hint' }, [mode.hint]) : null,
      ]);
      var pill = el('button', {
        class: 'tbn-pill',
        type: 'button',
        'data-mode': mode.id,
        'data-active': String(mode.id === active),
        'aria-current': mode.id === active ? 'page' : 'false',
        title: mode.tagline || mode.label,
      }, [
        document.createTextNode(mode.label),
        el('span', { class: 'tbn-pill__key' }, [String(keyNum)]),
        tip,
      ]);
      pill.addEventListener('click', function () {
        select(mode.id);
      });
      pillsWrap.appendChild(pill);
      pillNodes[mode.id] = pill;
    });
    bar.appendChild(pillsWrap);

    root.appendChild(bar);
    host.appendChild(root);

    // ---- State & behaviors --------------------------------------------
    var instance = {
      element: root,
      modes: modes.reduce(function (a, m) { a[m.id] = m; return a; }, {}),
      setActive: setActive,
      simulateTransition: simulateTransition,
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
      if (typeof opts.onSelect === 'function') {
        opts.onSelect(id, instance);
      } else {
        // Default behavior: navigate if href given, else just set active.
        var mode = instance.modes[id];
        if (mode && mode.href && mode.href !== '#') {
          window.location.href = mode.href;
        } else {
          setActive(id);
        }
      }
    }

    // Simulated mode switch for prototypes: show overlay briefly, snap back.
    function simulateTransition(nextId) {
      var overlay = document.getElementById('transition-overlay');
      if (!overlay) { setActive(nextId); return; }
      var fromNode = overlay.querySelector('.transition__from');
      var toNode = overlay.querySelector('.transition__to');
      if (fromNode) fromNode.textContent = instance.modes[active].label;
      if (toNode) toNode.textContent = instance.modes[nextId].label;

      // Briefly show active on the clicked pill so feedback is instant.
      var prev = active;
      setActive(nextId);
      overlay.classList.add('is-active');
      setTimeout(function () {
        overlay.classList.remove('is-active');
        setTimeout(function () {
          setActive(prev); // snap back to the demo's original active state
        }, 180);
      }, 780);
    }

    // Scroll collapse
    var lastY = window.scrollY || 0;
    var collapsed = false;
    function onScroll() {
      var y = window.scrollY || 0;
      var goingDown = y > lastY;
      if (goingDown && y > scrollThreshold && !collapsed) {
        collapsed = true;
        bar.setAttribute('data-collapsed', 'true');
      } else if ((!goingDown || y <= scrollThreshold) && collapsed) {
        collapsed = false;
        bar.setAttribute('data-collapsed', 'false');
      }
      lastY = y;
    }
    var scrollRaf = 0;
    function scrollHandler() {
      if (scrollRaf) return;
      scrollRaf = requestAnimationFrame(function () { scrollRaf = 0; onScroll(); });
    }
    window.addEventListener('scroll', scrollHandler, { passive: true });

    // Keyboard 1..5
    function keyHandler(e) {
      if (isTypingIn(document.activeElement)) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      var n = parseInt(e.key, 10);
      if (n >= 1 && n <= modes.length) {
        e.preventDefault();
        select(modes[n - 1].id);
      }
    }
    window.addEventListener('keydown', keyHandler);

    // Mobile hamburger toggle
    hamburger.addEventListener('click', function () {
      var open = bar.getAttribute('data-mobile-open') === 'true';
      bar.setAttribute('data-mobile-open', String(!open));
      hamburger.setAttribute('aria-expanded', String(!open));
    });
    // Close the mobile drawer on pill click
    pillsWrap.addEventListener('click', function (e) {
      if (e.target.closest('.tbn-pill')) {
        bar.setAttribute('data-mobile-open', 'false');
        hamburger.setAttribute('aria-expanded', 'false');
      }
    });

    function destroy() {
      window.removeEventListener('scroll', scrollHandler);
      window.removeEventListener('keydown', keyHandler);
      host.innerHTML = '';
    }

    return instance;
  }

  // ---- Auto-mount any data-topbar-nav elements --------------------------
  function autoMount() {
    var nodes = document.querySelectorAll('[data-topbar-nav]');
    nodes.forEach(function (n) {
      // Only auto-mount if not already mounted and no user-bootstrap will handle it.
      // We let explicit TopbarNav.mount() calls win if they run right after the script.
      if (!n.__tbnMounted) {
        // Defer to allow user script to claim it first. If user script mounted,
        // __tbnMounted will be set by mount().
        // NOTE: we do NOT auto-mount by default to avoid double-mount; real users
        // will invoke mount() explicitly. Kept as a stub for future use.
      }
    });
  }

  // Public API
  global.TopbarNav = {
    mount: function (t, o) {
      var i = mount(t, o);
      var host = resolve(t);
      if (host) host.__tbnMounted = true;
      return i;
    },
    defaults: {
      modes: DEFAULT_MODES.slice(),
      accents: Object.keys(ACCENTS),
    },
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoMount);
  } else {
    autoMount();
  }
})(typeof window !== 'undefined' ? window : this);
