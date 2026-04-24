/* Manifesto — vanilla JS, no build.
   - Custom red caret cursor
   - Magnetic per-character kerning/weight near cursor
   - Scroll-tied reveal for section theses and body paragraphs
   - Inline expandable evidence
*/

(function () {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // --------------------------------------------------------------
  // 1) Custom caret cursor
  // --------------------------------------------------------------
  const caret = document.getElementById('caret');
  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let caretX = mouseX;
  let caretY = mouseY;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    updateCaretContext(e.target);
  }, { passive: true });

  window.addEventListener('mouseleave', () => { if (caret) caret.style.opacity = '0'; });
  window.addEventListener('mouseenter', () => { if (caret) caret.style.opacity = ''; });

  function updateCaretContext(el) {
    if (!caret || !el) return;
    caret.classList.remove('over-text', 'over-link');
    if (el.closest('a, button, .evidence, .sig-val')) {
      caret.classList.add('over-link');
    } else if (el.closest('h1, h2, h3, p, li, .thesis, .section-thesis')) {
      caret.classList.add('over-text');
    }
  }

  function loop() {
    // gentle easing for the caret for smoothness
    caretX += (mouseX - caretX) * 0.35;
    caretY += (mouseY - caretY) * 0.35;
    if (caret) caret.style.transform = `translate(${caretX}px, ${caretY}px) translate(-50%, -50%)`;
    applyMagnetic();
    requestAnimationFrame(loop);
  }
  if (!reduceMotion) requestAnimationFrame(loop);

  // --------------------------------------------------------------
  // 2) Magnetic type — split magnetic text into characters once
  //    and nudge / weight them based on distance from the cursor.
  // --------------------------------------------------------------
  const magneticEls = document.querySelectorAll('[data-magnetic]');
  const chars = []; // {el, rectDirty, x, y, w, h}

  magneticEls.forEach((root) => {
    // Walk text nodes and wrap each character in a span. Preserve <br>, <em>, etc.
    splitTextNodes(root);
  });

  function splitTextNodes(node) {
    const toProcess = [];
    const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT, null);
    let n;
    while ((n = walker.nextNode())) toProcess.push(n);
    toProcess.forEach((textNode) => {
      const parent = textNode.parentNode;
      if (!parent) return;
      const frag = document.createDocumentFragment();
      const str = textNode.nodeValue;
      for (let i = 0; i < str.length; i++) {
        const ch = str[i];
        if (ch === ' ') {
          frag.appendChild(document.createTextNode(' '));
          continue;
        }
        const span = document.createElement('span');
        span.className = 'char';
        span.textContent = ch;
        frag.appendChild(span);
        chars.push({ el: span, x: 0, y: 0 });
      }
      parent.replaceChild(frag, textNode);
    });
  }

  // cache bounding rects, refresh on resize/scroll (cheap: rAF throttled)
  let rectsDirty = true;
  function markDirty() { rectsDirty = true; }
  window.addEventListener('resize', markDirty);
  window.addEventListener('scroll', markDirty, { passive: true });

  function refreshRects() {
    for (const c of chars) {
      const r = c.el.getBoundingClientRect();
      c.x = r.left + r.width / 2;
      c.y = r.top + r.height / 2;
    }
    rectsDirty = false;
  }

  const INFLUENCE = 140;   // px radius
  const MAX_PUSH  = 6;     // px max displacement
  function applyMagnetic() {
    if (reduceMotion || !chars.length) return;
    if (rectsDirty) refreshRects();
    for (const c of chars) {
      const dx = mouseX - c.x;
      const dy = mouseY - c.y;
      const d2 = dx * dx + dy * dy;
      if (d2 > INFLUENCE * INFLUENCE) {
        if (c.el.style.transform) {
          c.el.style.transform = '';
          c.el.style.color = '';
        }
        continue;
      }
      const d = Math.sqrt(d2);
      const falloff = 1 - d / INFLUENCE; // 0..1
      const push = falloff * MAX_PUSH;
      // push chars AWAY from cursor very subtly, like magnetic repulsion
      const ang = Math.atan2(dy, dx);
      const tx = -Math.cos(ang) * push;
      const ty = -Math.sin(ang) * push * 0.6;
      c.el.style.transform = `translate(${tx.toFixed(2)}px, ${ty.toFixed(2)}px)`;
      // subtle color lift toward white on closest chars
      if (falloff > 0.7) c.el.style.color = '#fff';
      else c.el.style.color = '';
    }
  }

  // --------------------------------------------------------------
  // 3) Scroll-tied reveal (IntersectionObserver)
  //    Staggers children inside the same parent for a type-in feel.
  // --------------------------------------------------------------
  const reveals = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window && !reduceMotion) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const parent = el.parentElement;
        // Compute stagger index within the immediate parent for type-like reveal
        const siblings = parent ? parent.querySelectorAll(':scope > [data-reveal]') : null;
        let idx = 0;
        if (siblings) {
          idx = Array.prototype.indexOf.call(siblings, el);
          if (idx < 0) idx = 0;
        }
        const delay = Math.min(idx * 110, 900);
        el.style.transitionDelay = `${delay}ms`;
        el.classList.add('in');
        io.unobserve(el);
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add('in'));
  }

  // --------------------------------------------------------------
  // 4) Inline expandable evidence
  // --------------------------------------------------------------
  const store = document.getElementById('evidence-store');
  const evidenceMap = new Map();
  if (store && store.content) {
    store.content.querySelectorAll('[data-key]').forEach((node) => {
      evidenceMap.set(node.getAttribute('data-key'), node.innerHTML.trim());
    });
  }

  document.querySelectorAll('.evidence').forEach((el) => {
    el.setAttribute('role', 'button');
    el.setAttribute('tabindex', '0');
    el.setAttribute('aria-expanded', 'false');
    el.addEventListener('click', (e) => {
      e.preventDefault();
      toggleEvidence(el);
    });
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleEvidence(el);
      }
    });
  });

  function toggleEvidence(trigger) {
    const key = trigger.getAttribute('data-evidence');
    if (!key) return;
    const host = trigger.closest('p') || trigger.parentElement;
    if (!host) return;

    // Does a panel already exist immediately after the host paragraph tied to this key?
    let panel = host.nextElementSibling;
    if (panel && panel.classList && panel.classList.contains('evidence-panel') && panel.dataset.key === key) {
      // toggle
      const isOpen = panel.classList.toggle('open');
      trigger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      markDirty();
      return;
    }

    // Close any other open panel in this section to keep it austere
    const section = host.closest('.section, .hero');
    if (section) {
      section.querySelectorAll('.evidence-panel.open').forEach((p) => {
        p.classList.remove('open');
        const tkey = p.dataset.key;
        section.querySelectorAll(`.evidence[data-evidence="${tkey}"]`).forEach((t) => {
          t.setAttribute('aria-expanded', 'false');
        });
      });
    }

    // Build a new panel
    panel = document.createElement('aside');
    panel.className = 'evidence-panel';
    panel.dataset.key = key;
    panel.innerHTML = evidenceMap.get(key) || '<em>Evidence forthcoming.</em>';
    host.parentNode.insertBefore(panel, host.nextSibling);
    // next frame, open it
    requestAnimationFrame(() => {
      panel.classList.add('open');
      trigger.setAttribute('aria-expanded', 'true');
      markDirty();
    });
  }

  // --------------------------------------------------------------
  // 5) Accessibility: hide caret on touch devices
  // --------------------------------------------------------------
  if (window.matchMedia('(hover: none)').matches && caret) {
    caret.style.display = 'none';
    document.body.style.cursor = 'auto';
  }
})();
