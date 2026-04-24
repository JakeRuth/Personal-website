# graph-polish — Network Graph, fixed & refined

A rework of `concepts/09-network-graph` addressing specific UX bugs in the original prototype. Same data model, same d3-force approach. Tuned physics, better first impression, cleaner styling.

## Run it

Open `index.html` in a browser. No build step.

```bash
# or from this directory
python3 -m http.server 8000
```

## WHAT CHANGED vs the original

### Physics / interaction fixes

- **Softened cursor repulsion by ~60%.** `CURSOR_STRENGTH` dropped from 260 → 100, `CURSOR_RADIUS` from 140 → 110. Nodes now feel nudged, not shoved.
- **Repulsion disables when cursor is idle.** If the cursor hasn't moved more than 10px in 200ms, the cursor force snaps to zero. You can now hover a node without it fleeing.
- **Pinned nodes ignore cursor force.** Shift-pinned and hover-pinned nodes no longer get elbowed around by the pointer field.
- **Generous click hit area.** Every node now has an invisible `.node-hit` padding circle (radius + 10px) that captures pointer events even if the node drifted a few pixels mid-click.
- **Pin-on-hover.** After 300ms of hovering a node, it fixes in place (temporary `fx`/`fy`) so a subsequent click is dead-reliable. Leaves release automatically.
- **Drag-vs-click disambiguation.** The drag handler measures travel distance; <4px is treated as a click and routed through `selectNode`, so a click-that-registered-as-drag still works.

### First-impression improvements

- **Featured node on load.** Stock Unlock is pre-selected ~650ms after the page renders, with the side panel open. Visitors immediately see the interaction model without having to guess.
- **Intro animation.** Nodes start scattered on a ring *outside* the viewport and "settle in." `alphaDecay` tuned from 0.02 → 0.018 so the settle is visible, not instant.

### Search

- **Helpful placeholder** — "try: Oscar · Rubik's · AI · Daniel · Stock Unlock". No more "what am I searching for?" ambiguity.
- **Example chips** under the search bar — clicking "Stock Unlock", "Oscar", "Rubik's", "AI", or "Daniel" jumps directly to that node with the panel opened and the graph re-centered.

### Visual polish

- **Refined category palette.** Same 5 categories, resaturated and rebalanced for harmony — deep azure / forest-emerald / tomato coral / amber / iris. Avoided the neon-greens and pure-reds of the original.
- **Hover affordance ring.** Each node has a second, larger ring circle that fades in on hover or neighbor-state. Selected nodes get a subtle pulse.
- **Slightly larger hit targets** — radii bumped up 1–2px per category + invisible 10px padding circle for clicks.
- **Cleaner panel.** Tighter rhythm, real shadow, bigger title, monospaced neighbor chips with color swatches, hover transforms on the chips.
- **Selection glow** uses a real filter drop-shadow and the pulsing ring animation.

### Nice-to-have

- **"Open in" dropdown** in the top-right corner with options: `standalone`, `jakeOS mode`, `embed widget`. Non-functional — it's a signal that this graph is designed to be embeddable elsewhere in Jake's site.

## What was kept from the original

- d3-force layout (link / charge / collide / center) with custom cursor force.
- All 36 nodes across the same 5 categories.
- All 70+ narrative edges — nothing removed.
- Click-to-select with neighborhood dimming.
- Shift-drag to pin a node permanently.
- `/` to focus search, `Esc` to clear & deselect, `Enter` to jump to best match.
- Starfield + grid background, vignette overlay.
- Soft viewport walls so nodes can't escape.

## New interactions, at a glance

| Action | Result |
|---|---|
| Page load | Stock Unlock pre-selected, panel open, nodes settle in from edges |
| Click chip (Stock Unlock / Oscar / Rubik's / AI / Daniel) | Jumps to that node |
| Hover a node for 300ms | Node pins in place (you can click without it moving) |
| Cursor idle 200ms+ | Repulsion force disables entirely |
| Click a drifting node | Click still registers thanks to padded hit zone |
| Click "open in" dropdown | Future-signal menu for embedding modes |
