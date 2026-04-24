/* ------------------------------------------------------------------
   Jake Ruth — Monograph
   The whole script is a single page. Nothing loads from the network.
   ------------------------------------------------------------------ */

(function () {
  'use strict';

  // 1. Gentle fade-in-on-scroll for sections.
  //    Kept quiet — 12px rise, 500ms ease. No wobble.
  const reveal = document.querySelectorAll(
    '.hero, .section, .dingbat, .colophon'
  );

  reveal.forEach((el) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(12px)';
    el.style.transition =
      'opacity 700ms cubic-bezier(.2,.7,.2,1), transform 700ms cubic-bezier(.2,.7,.2,1)';
  });

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
          io.unobserve(entry.target);
        }
      });
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.05 }
  );

  reveal.forEach((el) => io.observe(el));

  // 2. Cube dingbats — a near-imperceptible idle breathing,
  //    staggered so they don't feel mechanical.
  const cubes = document.querySelectorAll('.cube');
  cubes.forEach((cube, i) => {
    const offset = i * 900;
    let start = null;
    function tick(ts) {
      if (!start) start = ts;
      const t = (ts - start + offset) / 1000;
      const x = -24 + Math.sin(t * 0.35) * 2;
      const y = 32 + Math.cos(t * 0.28) * 3;
      // Only override if the user isn't hovering.
      if (!cube.matches(':hover') && document.activeElement !== cube) {
        cube.style.transform = `rotateX(${x}deg) rotateY(${y}deg)`;
      }
      requestAnimationFrame(tick);
    }
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      requestAnimationFrame(tick);
    }
  });

  // 3. Active section in nav — underline the section currently in view.
  const navLinks = document.querySelectorAll('.nav-links a');
  const sections = [
    { id: 'work', el: document.getElementById('work') },
    { id: 'thinking', el: document.getElementById('thinking') },
    { id: 'stock-unlock', el: document.getElementById('stock-unlock') },
    { id: 'hire', el: document.getElementById('hire') },
  ].filter((s) => s.el);

  function updateActive() {
    const y = window.scrollY + window.innerHeight * 0.35;
    let current = null;
    sections.forEach((s) => {
      if (s.el.offsetTop <= y) current = s.id;
    });
    navLinks.forEach((a) => {
      const href = a.getAttribute('href') || '';
      const match = href === `#${current}`;
      a.style.color = match ? 'var(--ink)' : '';
      a.style.borderBottomColor = match ? 'currentColor' : 'transparent';
    });
  }

  let ticking = false;
  window.addEventListener(
    'scroll',
    () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          updateActive();
          ticking = false;
        });
        ticking = true;
      }
    },
    { passive: true }
  );
  updateActive();

  // 4. Tiny typographic kindness — wrap "widow" last words in the
  //    large section titles so they never sit alone on their own line.
  document
    .querySelectorAll('.section-title, .hero-title, .hero-sub')
    .forEach((el) => {
      const txt = el.innerHTML.trim();
      // only act on plain enough content
      if (txt.split(' ').length < 3) return;
      const lastSpace = el.innerHTML.lastIndexOf(' ');
      if (lastSpace < 0) return;
      el.innerHTML =
        el.innerHTML.slice(0, lastSpace) +
        ' ' +
        el.innerHTML.slice(lastSpace + 1);
    });

  // 5. Console colophon, because people who open devtools deserve a note.
  try {
    console.log(
      '%c Jake Ruth — Monograph, First Edition ',
      'font-family: Georgia, serif; font-style: italic; font-size: 14px; background: #F5F2EA; color: #1A1814; padding: 6px 10px;'
    );
    console.log(
      '%c jake@stockunlock.com ',
      'font-family: monospace; font-size: 11px; color: #C24D00;'
    );
  } catch (_) {}
})();
