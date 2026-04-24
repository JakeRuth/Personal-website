/* =========================================================================
   Jake Ruth — SaaS Parody
   Minimal vanilla JS: cursor spotlight, magnetic cards, sticky-nav state.
   ========================================================================= */

(function () {
  'use strict';

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasFinePointer = window.matchMedia('(pointer: fine)').matches;

  /* Cursor spotlight -------------------------------------------------- */
  const spotlight = document.querySelector('.spotlight');
  if (spotlight && !prefersReduced && hasFinePointer) {
    let tx = window.innerWidth / 2;
    let ty = window.innerHeight / 2;
    let cx = tx;
    let cy = ty;
    let raf = null;

    const onMove = (e) => {
      tx = e.clientX;
      ty = e.clientY;
      if (!document.body.classList.contains('has-pointer')) {
        document.body.classList.add('has-pointer');
      }
      if (!raf) raf = requestAnimationFrame(tick);
    };
    const tick = () => {
      // ease toward target
      cx += (tx - cx) * 0.18;
      cy += (ty - cy) * 0.18;
      spotlight.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%)`;
      if (Math.abs(tx - cx) > 0.2 || Math.abs(ty - cy) > 0.2) {
        raf = requestAnimationFrame(tick);
      } else {
        raf = null;
      }
    };
    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('mouseleave', () => {
      document.body.classList.remove('has-pointer');
    });
  }

  /* Magnetic cards (hover follow) ------------------------------------- */
  const magnets = document.querySelectorAll('[data-magnetic]');
  if (!prefersReduced && hasFinePointer) {
    magnets.forEach((el) => {
      let rect = null;
      const updateRect = () => { rect = el.getBoundingClientRect(); };
      el.addEventListener('mouseenter', updateRect);
      el.addEventListener('mousemove', (e) => {
        if (!rect) updateRect();
        const px = ((e.clientX - rect.left) / rect.width) * 100;
        const py = ((e.clientY - rect.top)  / rect.height) * 100;
        el.style.setProperty('--mx', px + '%');
        el.style.setProperty('--my', py + '%');

        // subtle tilt / translate
        const dx = (e.clientX - (rect.left + rect.width / 2)) / rect.width;
        const dy = (e.clientY - (rect.top  + rect.height / 2)) / rect.height;
        el.style.transform = `translate3d(${dx * 4}px, ${dy * 4}px, 0)`;
      });
      el.addEventListener('mouseleave', () => {
        el.style.transform = '';
        rect = null;
      });
      window.addEventListener('resize', () => { rect = null; });
    });
  }

  /* Sticky nav state -------------------------------------------------- */
  const nav = document.querySelector('.nav');
  if (nav) {
    const onScroll = () => {
      if (window.scrollY > 8) nav.classList.add('scrolled');
      else nav.classList.remove('scrolled');
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* Smooth-scroll for in-page anchors --------------------------------- */
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const href = a.getAttribute('href');
      if (!href || href === '#') return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth', block: 'start' });
    });
  });

  /* Konami: type "ship" anywhere and the headline flickers ------------ */
  const headline = document.querySelector('.hero-headline');
  if (headline) {
    let buf = '';
    window.addEventListener('keydown', (e) => {
      if (e.key.length !== 1) return;
      buf = (buf + e.key.toLowerCase()).slice(-8);
      if (buf.endsWith('ship')) {
        headline.animate(
          [
            { filter: 'blur(0px)',    transform: 'translateY(0)' },
            { filter: 'blur(10px)',   transform: 'translateY(-6px)' },
            { filter: 'blur(0px)',    transform: 'translateY(0)' }
          ],
          { duration: 700, easing: 'cubic-bezier(.2,.7,.2,1)' }
        );
      }
    });
  }
})();
