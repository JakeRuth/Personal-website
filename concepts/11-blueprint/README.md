# Concept 11 — Blueprint

An architectural-schematic portfolio for Jake Ruth. Jake's career is laid out as an engineering floorplan; you pan and zoom around it like an `.dwg`.

## How to run

Either:
- Open `index.html` directly via `file://`.
- Or serve it:
  ```
  python3 -m http.server 8000
  ```
  then visit `http://localhost:8000/concepts/11-blueprint/`.

No build step. No npm. Vanilla HTML/CSS/JS + Google Fonts CDN.

## What's implemented

- **Infinite pan-and-zoom canvas** (4000 x 2600 unit SVG).
  - Drag to pan.
  - Scroll wheel / trackpad to zoom (smooth, zooms toward cursor).
  - Pinch-zoom on touch.
  - Two-finger scroll on trackpad pans.
  - Arrow keys pan; `+` / `-` zoom; `0` resets fit; `1`–`6` focus on a specific room.
  - `Esc` closes detail overlay.
- **Blueprint aesthetic**: deep blueprint-blue background, cyan/white walls, yellow annotations, teal dimension lines. Grid pattern (both on the SVG plan and over the viewport). Crosshair cursor. Paper grain. JetBrains Mono + Space Grotesk.
- **Six rooms** laid out as a floorplan:
  1. **Origin** — childhood, Rubik's cube schematic (3x3 grid), unicycle wheel, ACM president note.
  2. **CommerceHub** — first job, server-rack diagram, "prod outage 2014" callout.
  3. **Youni** — dashed-outline room (failed experiment, drawn as non-permanent).
  4. **Oscar Health** — largest room, 4y 6m tenure, desk-grid furniture, IC → senior note.
  5. **Stock Unlock** — hexagonal room (ventures out of the main building), YC W22 dashboard + key stats ($1.335M seed · ~8 at peak · thousands of customers · profitable · not full-time).
  6. **Next Chapter** — doorway leading off the edge of the drawing. "Accepting bids."
- **Annotations**: floorplan-style labels, dimension lines under every room with years + duration, lettered detail-callouts (A–I) with leader lines, a large top dimension line reading "~13 years coding · overall span," and a block of engineer's NOTES in the margin.
- **Connectors**: faint dashed lines between rooms show career sequence.
- **Minimap** (bottom-right) — shows every room labeled + a yellow viewport rectangle that updates live. Click a room in the minimap to fly to it; click elsewhere to recenter.
- **Titleblock / legend / controls panels** in the HUD corners.
- **Detail overlay**: click any room to open a zoomed detail card (draft-corner marks, key/value spec sheet, prose, bullet notes). Overlay closes on click-outside or `Esc`.
- **Drafting ornaments**: N compass rose, scale bar, drawing frame, "drawing bp-001 / rev. 04.26 / sheet 1 of 1" title text.

## Rooms to explore

| Key | Room          | What's inside                                           |
| --- | ------------- | ------------------------------------------------------- |
| 1   | Origin        | Rubik's cube spec, unicycle wheel, ACM note             |
| 2   | CommerceHub   | Server rack, 2014 outage callout                        |
| 3   | Youni         | Dashed walls ("failed experiment"), whiteboard          |
| 4   | Oscar Health  | Desk grid, longest tenure, growth annotation            |
| 5   | Stock Unlock  | Hex room, dashboard chart, key stats, YC badge         |
| 6   | Next Chapter  | Doorway, contact info, "accepting bids"                 |

## If I had more time

- Make pan/zoom inertia-based (momentum after release).
- Draw per-room interior schematics at a deeper zoom level — door swings on actual doors between rooms, furniture dimensions, code-snippet "blueprints-within-blueprints."
- Proper drawable doors between rooms (doorjamb symbols) + a walkable path animation for "how Jake got from A to B."
- Let the user toggle layers on/off like a real CAD program (e.g. layer: annotations, layer: furniture, layer: dimensions).
- Export-to-PDF button so it prints like a real drawing set.
- Sound design: faint pencil-on-paper when zooming.
- Photos of real Jake moments placed as "inlay" sketches tacked to the margin with dashed lines.
- Animated "drafting" intro — lines draw themselves in, text appears last.
- More detail callouts (J–Z) for subprojects at Oscar / Stock Unlock.
- Easter egg: an unsolved Rubik's cube minigame hidden in the Origin room.
