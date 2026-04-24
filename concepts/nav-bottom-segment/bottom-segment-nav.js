/* ==========================================================================
 * bottom-segment-nav.js
 * --------------------------------------------------------------------------
 * A minimalist bottom-centered segmented control for switching between
 * the three alpha experiences of jakeruth.com.
 *
 * Usage:
 *   <script src="./bottom-segment-nav.js"></script>
 *   <script>
 *     BottomSegmentNav.mount({ current: 'xp' });
 *   </script>
 *
 * Configured:
 *   BottomSegmentNav.mount({
 *     current: 'xp',                              // 'xp' | 'readme' | 'saas'
 *     mountTo: document.body,                     // node to append to
 *     transitionCubeSrc: '../transition-cube/transition-cube.js',
 *     segments: [
 *       { id: 'xp',     label: 'XP Luna', href: '../retro-03-xp-luna/' },
 *       { id: 'readme', label: 'README',  href: '../readme-mode/' },
 *       { id: 'saas',   label: 'SaaS',    href: '../saas-v5/' },
 *     ],
 *     onSelect: (id, ctx) => { ... },             // optional override
 *   });
 *
 * Keyboard:
 *   Tab focuses the control (roving tabindex on the current segment).
 *   ArrowLeft / ArrowRight (and ArrowUp / ArrowDown) move focus between
 *   segments without activating. Enter or Space confirms. Home / End jump.
 *
 * Exports:
 *   window.BottomSegmentNav.mount(options) -> instance
 *   instance.setCurrent(id)
 *   instance.destroy()
 * ========================================================================== */

(function (global) {
  'use strict';

  // ---- Defaults -----------------------------------------------------------
  // Short labels — voice-calibrated to the three alpha experiences.
  var DEFAULT_SEGMENTS = [
    { id: 'xp',     label: 'XP Luna', href: '../retro-03-xp-luna/' },
    { id: 'readme', label: 'README',  href: '../readme-mode/' },
    { id: 'saas',   label: 'SaaS',    href: '../saas-v5/' },
  ];

  var DEFAULT_TRANSITION_CUBE_SRC = '../transition-cube/transition-cube.js';

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

  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      // Already there?
      var existing = document.querySelector('script[data-bsn-cube="1"]');
      if (existing) { resolve(); return; }
      var s = document.createElement('script');
      s.src = src;
      s.async = false;
      s.setAttribute('data-bsn-cube', '1');
      s.onload = function () { resolve(); };
      s.onerror = function () { reject(new Error('failed to load ' + src)); };
      document.head.appendChild(s);
    });
  }

  // ---- Mount --------------------------------------------------------------
  function mount(options) {
    var opts = options || {};
    var segments = (opts.segments || DEFAULT_SEGMENTS).slice();
    var current = opts.current || segments[0].id;
    var host = opts.mountTo || document.body;
    var cubeSrc = opts.transitionCubeSrc || DEFAULT_TRANSITION_CUBE_SRC;

    // If an instance already exists, replace it. Keeps hot-reload sane.
    var prior = host.querySelector('.bsn-root');
    if (prior && prior.__bsnDestroy) prior.__bsnDestroy();

    // ---- DOM --------------------------------------------------------
    var root = el('nav', {
      class: 'bsn-root',
      role: 'navigation',
      'aria-label': 'Switch experience',
    });

    var group = el('div', {
      class: 'bsn-group',
      role: 'tablist',
      'aria-label': 'Experiences',
    });

    // The sliding highlight pill lives behind the segment buttons.
    var thumb = el('span', { class: 'bsn-thumb', 'aria-hidden': 'true' });
    group.appendChild(thumb);

    var segNodes = {};
    segments.forEach(function (seg) {
      var isCurrent = seg.id === current;
      var btn = el('button', {
        class: 'bsn-seg',
        type: 'button',
        role: 'tab',
        'data-id': seg.id,
        'data-current': String(isCurrent),
        'aria-selected': String(isCurrent),
        tabindex: isCurrent ? '0' : '-1',
        title: seg.label,
      }, [seg.label]);
      btn.addEventListener('click', function () { select(seg.id); });
      group.appendChild(btn);
      segNodes[seg.id] = btn;
    });

    root.appendChild(group);
    host.appendChild(root);

    // ---- State & behaviors -----------------------------------------
    var inFlight = false;

    var instance = {
      element: root,
      segments: segments.reduce(function (a, s) { a[s.id] = s; return a; }, {}),
      setCurrent: setCurrent,
      destroy: destroy,
    };

    // Wire up resize + initial paint of the thumb.
    var rafPending = 0;
    function schedulePaint() {
      if (rafPending) return;
      rafPending = requestAnimationFrame(function () {
        rafPending = 0;
        paintThumb();
      });
    }

    function paintThumb() {
      var active = segNodes[current];
      if (!active) return;
      var groupRect = group.getBoundingClientRect();
      var segRect = active.getBoundingClientRect();
      if (!groupRect.width || !segRect.width) return;
      var x = segRect.left - groupRect.left;
      thumb.style.width = segRect.width + 'px';
      thumb.style.transform = 'translateX(' + x + 'px)';
      // Until first real paint, hint that the thumb is ready so CSS can fade it in.
      thumb.setAttribute('data-ready', '1');
    }

    // Initial + watcher
    requestAnimationFrame(paintThumb);
    // A second pass after fonts/layout settle — cheap insurance.
    setTimeout(paintThumb, 120);

    var ro = null;
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(schedulePaint);
      ro.observe(group);
    }
    window.addEventListener('resize', schedulePaint);

    function setCurrent(id) {
      if (!segNodes[id]) return;
      current = id;
      Object.keys(segNodes).forEach(function (k) {
        var on = k === id;
        var n = segNodes[k];
        n.setAttribute('data-current', String(on));
        n.setAttribute('aria-selected', String(on));
        n.tabIndex = on ? 0 : -1;
      });
      schedulePaint();
    }

    function select(id) {
      if (id === current) return;
      if (inFlight) return;
      if (typeof opts.onSelect === 'function') {
        opts.onSelect(id, instance);
        return;
      }
      var seg = instance.segments[id];
      if (!seg) return;

      // Instantly reflect intent so the pill slides even before the cube lands.
      setCurrent(id);

      var href = seg.href;
      if (!href || href === '#') return;

      inFlight = true;
      root.setAttribute('data-in-flight', 'true');
      playTransitionThenNavigate(href);
    }

    function playTransitionThenNavigate(href) {
      var go = function () { window.location.href = href; };

      // Reduced-motion: skip the cube entirely.
      var reduced = window.matchMedia &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduced) {
        setTimeout(go, 220);
        return;
      }

      // Load transition-cube on demand, then play.
      var play = function () {
        if (global.TransitionCube && typeof global.TransitionCube.playTransition === 'function') {
          global.TransitionCube.playTransition({ destinationUrl: href });
        } else {
          go();
        }
      };
      if (global.TransitionCube && typeof global.TransitionCube.playTransition === 'function') {
        play();
        return;
      }
      loadScript(cubeSrc).then(play).catch(function (err) {
        console.warn('[bottom-segment-nav] transition-cube unavailable, falling back:', err);
        go();
      });
    }

    // ---- Keyboard support (roving tabindex) ------------------------
    group.addEventListener('keydown', function (e) {
      var ids = segments.map(function (s) { return s.id; });
      var i = ids.indexOf(current);
      var target = null;

      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowDown':
          target = ids[(i + 1) % ids.length];
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
          target = ids[(i - 1 + ids.length) % ids.length];
          break;
        case 'Home':
          target = ids[0];
          break;
        case 'End':
          target = ids[ids.length - 1];
          break;
        case 'Enter':
        case ' ':
        case 'Spacebar':
          // Activate whichever segment is currently focused (not necessarily current).
          var focused = document.activeElement;
          if (focused && focused.classList && focused.classList.contains('bsn-seg')) {
            e.preventDefault();
            select(focused.getAttribute('data-id'));
          }
          return;
        default:
          return;
      }

      if (target) {
        e.preventDefault();
        // Move focus without selecting (iOS-style arrow preview). The pill
        // does not slide until the user hits Enter/Space. But to preserve
        // the "Tab focuses the control" contract, we keep roving tabindex.
        segNodes[target].focus();
      }
    });

    // ---- Destroy -----------------------------------------------------
    function destroy() {
      if (ro) { try { ro.disconnect(); } catch (_) {} }
      window.removeEventListener('resize', schedulePaint);
      if (root.parentNode) root.parentNode.removeChild(root);
    }
    root.__bsnDestroy = destroy;

    return instance;
  }

  // ---- Public API --------------------------------------------------------
  global.BottomSegmentNav = {
    mount: mount,
    defaults: {
      segments: DEFAULT_SEGMENTS.slice(),
      transitionCubeSrc: DEFAULT_TRANSITION_CUBE_SRC,
    },
  };
})(typeof window !== 'undefined' ? window : this);
