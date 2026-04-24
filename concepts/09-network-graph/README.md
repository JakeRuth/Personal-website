# Concept 09 — Network Graph

Jake Ruth rendered as a live, force-directed network. Career, skills, projects, hobbies, and people as nodes. Relationships as edges. Cursor repels, click to inspect.

## Run it

Just open `index.html` in a browser. No build step.

```bash
# or, from the concept dir
python3 -m http.server 8000
# then http://localhost:8000/
```

d3.js is loaded from the jsdelivr CDN. Everything else is local and vanilla.

## What's implemented

- **Force-directed layout** using `d3-force` (link, many-body charge, collision, centering, soft viewport walls).
- **35 nodes** across 5 categories, each with category color + 2–3 sentence Jake-voice blurb.
- **~60 edges** — not random. Edges are narrative: Oscar ↔ Alan Warren, Stock Unlock ↔ Daniel Pronk ↔ YC W22, Rubik's cube ↔ Pattern recognition ↔ System design, etc.
- **Cursor repulsion force** — a custom force registered into the simulation that gently pushes nodes away from the pointer within a 140px radius, with quadratic falloff.
- **Click a node → side panel** with:
  - Category kicker (color-coded pill)
  - Title + Jake-voice blurb
  - List of connected nodes (clickable — jump across the graph)
- **Neighborhood highlighting** — on hover or selection, neighbors stay bright, everything else dims. Edges touching the selected node brighten.
- **Search bar** (top right): type to filter/highlight, press `/` to focus from anywhere, `Enter` to jump to the best match, `Escape` to clear.
- **Drag** nodes to reposition. Shift-drag to pin. Regular drag releases on drop.
- **Legend** bottom-left showing category color key and interaction hint.
- **Starfield + subtle grid** background painted on a canvas behind the SVG, with a radial vignette overlay via CSS.
- **Responsive**: reflows on resize, panel collapses to bottom sheet under 720px.

## Interactions to discover

- Press `/` from anywhere to jump to the search bar.
- Hover any node to see its label and neighborhood light up.
- Click a node to lock the panel open and traverse via the "connected" chips.
- Shift-drag a node to pin it in place; regular drag lets it snap back.
- Move the cursor through a dense cluster — the nodes scatter from your pointer.
- Click the empty background to dismiss the panel.
- Press `Escape` to clear search and deselect.

## What's mocked

- A couple of the "people" mentors (Prof. Ravi, Prof. Ellen) are plausible-but-invented — placeholders for real college mentors, per the prompt.
- Blurbs are real in spirit and voice but are not copy-edited final-site text; they read as prototype-fidelity narration.
- There's no routing / deep linking yet — selection doesn't hit the URL.
- Category colors and weights are intuitive, not empirical.

## If I had more time...

- **URL state**: reflect `?node=stockunlock` in the address bar and restore on load.
- **Category filter chips** in the legend so you can isolate, e.g., "only projects and the people attached to them."
- **Edge typing**: currently all edges look the same. Differentiating "worked at," "built with," "mentored by" would make the graph read like a sentence.
- **Node detail depth**: pull in a hero image, a link-out, a short timeline strip for career nodes.
- **Keyboard-only traversal** through the graph (arrow keys step to nearest neighbor).
- **Canvas renderer** for the graph itself — SVG is fine at 35 nodes but canvas would let us push to 200+ without breaking a sweat.
- **Touch repulsion** — the current cursor force is pointer-based; mobile users don't get the physics toy.
- **Save layout**: once nodes settle, freeze positions so revisits are instant.
