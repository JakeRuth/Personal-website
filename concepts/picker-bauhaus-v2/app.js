/* Picker · Bauhaus v2 — keyboard + four-bar curtain transition */

(function () {
  const cards = Array.from(document.querySelectorAll('.card[href]'));
  const curtain = document.getElementById('curtain');

  /* ---- Entry curtain: cover on load, lift on first paint ---- */
  if (curtain && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    curtain.classList.add('initial');
    // next frame: release
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        curtain.classList.remove('initial');
        curtain.classList.add('out');
        // after animation, clear state so .in transitions can fire cleanly on exit
        window.setTimeout(() => { curtain.classList.remove('out'); }, 900);
      });
    });
  }

  if (!cards.length) return;

  let selected = null;

  function setSelected(idx) {
    cards.forEach(c => c.classList.remove('is-selected'));
    if (idx == null) { selected = null; return; }
    const card = cards.find(c => Number(c.dataset.index) === idx);
    if (!card) return;
    selected = card;
    card.classList.add('is-selected');
    card.focus({ preventScroll: true });
  }

  function go(href) {
    if (!href) return;
    if (!curtain || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      window.location.href = href;
      return;
    }
    // ensure the curtain is in a state that will animate IN
    curtain.classList.remove('out');
    // reflow so the browser picks up the starting position
    void curtain.offsetWidth;
    curtain.classList.add('in');
    window.setTimeout(() => { window.location.href = href; }, 620);
  }

  /* Click — hijack to play the four-bar wipe */
  cards.forEach(card => {
    card.addEventListener('click', (e) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return; // allow new-tab
      e.preventDefault();
      setSelected(Number(card.dataset.index));
      go(card.getAttribute('href'));
    });

    card.addEventListener('mouseenter', () => {
      setSelected(Number(card.dataset.index));
    });
  });

  /* Keyboard: 1–5 to select, Enter to confirm, Esc to clear, arrows to move */
  document.addEventListener('keydown', (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const key = e.key;

    if (/^[1-5]$/.test(key)) {
      e.preventDefault();
      const idx = Number(key);
      if (selected && Number(selected.dataset.index) === idx) {
        go(selected.getAttribute('href'));
        return;
      }
      setSelected(idx);
      return;
    }

    if (key === 'Enter' && selected) {
      e.preventDefault();
      go(selected.getAttribute('href'));
      return;
    }

    if (key === 'Escape') {
      setSelected(null);
      if (document.activeElement && document.activeElement.blur) {
        document.activeElement.blur();
      }
    }

    if (key === 'ArrowRight' || key === 'ArrowDown') {
      e.preventDefault();
      const cur = selected ? Number(selected.dataset.index) : 0;
      const next = Math.min(5, (cur || 0) + 1 || 1);
      setSelected(next);
    }
    if (key === 'ArrowLeft' || key === 'ArrowUp') {
      e.preventDefault();
      const cur = selected ? Number(selected.dataset.index) : 6;
      const next = Math.max(1, cur - 1);
      setSelected(next);
    }
  });

  /* Tiny console easter egg */
  try {
    const css = 'font: 600 12px/1.4 "JetBrains Mono", monospace; color: #2A4DA8;';
    console.log('%cDriver in the driver\'s seat, not driven by the car.', css);
  } catch (_) { /* no-op */ }
})();
