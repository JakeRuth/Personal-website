/* Picker · Bauhaus — keyboard + transition glue */

(function () {
  const cards = Array.from(document.querySelectorAll('.card[href]'));
  const curtain = document.getElementById('curtain');

  if (!cards.length) return;

  let selected = null;

  function setSelected(idx) {
    cards.forEach(c => c.classList.remove('is-selected'));
    if (idx == null) { selected = null; return; }
    const card = cards.find(c => Number(c.dataset.index) === idx);
    if (!card) return;
    selected = card;
    card.classList.add('is-selected');
    card.focus({ preventScroll: false });
  }

  function go(href) {
    if (!href) return;
    if (!curtain || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      window.location.href = href;
      return;
    }
    curtain.classList.add('in');
    // give the curtain time to wipe across
    window.setTimeout(() => { window.location.href = href; }, 620);
  }

  // Click — hijack to play the transition
  cards.forEach(card => {
    card.addEventListener('click', (e) => {
      // allow cmd/ctrl-click to open in new tab normally
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return;
      e.preventDefault();
      setSelected(Number(card.dataset.index));
      go(card.getAttribute('href'));
    });

    card.addEventListener('mouseenter', () => {
      setSelected(Number(card.dataset.index));
    });
  });

  // Keyboard: 1–5 to select, Enter to confirm, Esc to clear
  document.addEventListener('keydown', (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;

    const key = e.key;
    if (/^[1-5]$/.test(key)) {
      e.preventDefault();
      const idx = Number(key);
      // second press on the same card = enter it
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
      const next = Math.min(5, cur + 1 || 1);
      setSelected(next);
    }
    if (key === 'ArrowLeft' || key === 'ArrowUp') {
      e.preventDefault();
      const cur = selected ? Number(selected.dataset.index) : 6;
      const next = Math.max(1, cur - 1);
      setSelected(next);
    }
  });

  // Tiny easter egg: log a Jake-voice line to the console for the dev-tools crowd
  try {
    const css = 'font: 600 12px/1.4 "JetBrains Mono", monospace; color: #2A4DA8;';
    console.log('%cDriver in the driver\'s seat, not driven by the car.', css);
  } catch (_) { /* no-op */ }
})();
