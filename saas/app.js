/* SaaS experience: accordion grouping (one open per group) + scroll-anchor
   the just-opened row so it stays visible after a tall peer collapses. Same
   pattern as /readme/. CSS supplies scroll-margin-top to land below the
   sticky chrome (saas nav + shared topnav). */

(function accordions() {
  // Accordion group containers. Each direct-child <details> (or <li><details>)
  // inside one of these is a peer; opening one closes the others.
  const GROUP_SELECTORS = [
    ".work-list-saas",
    ".ai-proj-list",
    ".story-timeline",
  ];

  function groupOf(det) {
    for (const sel of GROUP_SELECTORS) {
      const root = det.closest(sel);
      if (root) return root;
    }
    return null;
  }

  function peersIn(root) {
    return root.querySelectorAll(":scope > details, :scope > li > details");
  }

  // Mark user-initiated opens before <details> default-toggles, so the
  // toggle handler can distinguish click-opens (which need anchoring) from
  // programmatic opens (anchor nav, etc., which already do their own scroll).
  document.addEventListener("click", (e) => {
    const summary = e.target.closest("summary");
    if (!summary) return;
    const det = summary.parentElement;
    if (!(det instanceof HTMLDetailsElement)) return;
    if (!det.open) det.dataset.userOpening = "1";
  }, true);

  document.addEventListener("toggle", (e) => {
    const det = e.target;
    if (!(det instanceof HTMLDetailsElement)) return;
    if (!det.open) return;
    const root = groupOf(det);
    if (!root) return;
    peersIn(root).forEach((other) => {
      if (other !== det && other.open) other.open = false;
    });
    if (det.dataset.userOpening === "1") {
      delete det.dataset.userOpening;
      // Two rAFs so the peer-close reflow lands before we measure/scroll.
      requestAnimationFrame(() => requestAnimationFrame(() => {
        det.scrollIntoView({ behavior: "smooth", block: "start" });
      }));
    }
  }, true);
})();
