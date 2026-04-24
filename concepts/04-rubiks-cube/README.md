# Concept 04 — Rubik's Cube

A literal 3D Rubik's cube as the homepage. Each face is a section. Pick it up, spin it around, click a face to read.

## Running it

Three.js is loaded as an ES module via `importmap` from a CDN. Most browsers will refuse to load ES modules from the `file://` protocol, so you need a local HTTP server.

From this directory:

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000/ in your browser.

(Any static server works — `npx serve`, `http-server`, etc.)

## What's implemented

- **Full 3D Rubik's cube** — 27 cubies, 6 sticker textures, slightly desaturated classic colors for a premium look.
- **Custom orbit controls** — mouse drag rotates the camera around the cube, wheel to zoom. Touch drag works on mobile.
- **Nice lighting** — warm key light with soft shadows, cool fill light, warm rim point light, shadow-catching ground plane.
- **Starfield background** via CSS radial gradients on a dark radial-gradient body.
- **Face labels baked into the center stickers** — ABOUT (front/red), CAREER (back/orange), STOCK UNLOCK (top/white), PROJECTS (bottom/yellow), HOBBIES (left/green), CONTACT (right/blue).
- **Click a face → camera animates to that face → overlay panel slides in** with that section's content. Close button or Escape returns to the cube.
- **Cube starts scrambled.** A 14-move scramble runs on page load so the cube looks real.
- **Solve button** visibly replays the scramble in reverse, rotating real slices (not faking the animation). Reaches a solved state.
- **Confetti burst + "13.95s average — personal best" note** when the solve completes.
- **Scramble button** re-randomizes at any time.
- **Keyboard easter egg:** type `R U R' U'` (the classic sune setup) anywhere on the page and the cube's stickers pulse gold with a quick `// sune //` readout.
- **Idle ambient rotation** — if you don't touch the cube for 1.5s, the camera slowly drifts around it.
- **Escape to close panel**, click backdrop to close panel.
- **Internal link:** the About panel links to STOCK UNLOCK — clicking it closes the current panel and flies the camera to the top face.
- **Responsive** — panel reflows on narrow viewports, HUD scales down.

## What's mocked / loose

- **The "solve" isn't a real cube solver.** It records the random scramble moves and plays them back in reverse. Looks the same from the outside; no Kociemba algorithm required. If the user manually scrambles via some future click-to-twist interaction, this would break — currently only Solve and Scramble buttons mutate state.
- **Contact links** (GitHub / LinkedIn / X) are visual chips only; email is the one real link.
- **No real SEO / meta tags** — prototype only.

## Interactions to discover

- Drag to rotate, scroll to zoom.
- Click any face — specifically any sticker on any face — to open that section.
- Click "Solve" to watch the cube un-scramble, then get the PB note.
- Click "Scramble" to re-mix it.
- Type `R U R' U'` anywhere for the golden pulse + sune note.
- In the ABOUT panel, click "Stock Unlock" to fly to the top face.
- Let the page sit idle and watch the cube drift.
- Press Escape while a panel is open.

## If I had more time...

- **Real twist-on-the-cube interaction** — drag a sticker to rotate a slice, like the real puzzle. Would need to hook into the same slice-rotation machinery already in `cube.js`, plus a drag-intent classifier (slice drag vs. orbit drag).
- **Real solver** (Kociemba / two-phase) so scramble → solve always shows a pretty algorithmic solution instead of reversed random moves.
- **Per-face timer / move counter UI** to lean into the cubing identity.
- **Bevelled cubie geometry** (rounded edges) using RoundedBoxGeometry or custom geometry — more physical-feeling.
- **Subtle chromatic aberration / bloom** via postprocessing for a more premium look.
- **Per-section inner scenes** — e.g., the Hobbies face could zoom *into* the cube and reveal a tiny 3D unicycle/cube diorama instead of a 2D panel.
- **Sound** — soft click on slice turn, a satisfying click on solve.
- **Persist orientation** across panel open/close so the cube stays where you left it instead of snapping back to the hero pose.
- **Real contact links** and a writing/blog face.

## Files

- `index.html` — markup, styles, overlay template, importmap.
- `cube.js` — Three.js scene, cubie construction, orbit controls, face picking, slice rotation, scramble/solve, overlay content, easter egg.
- `README.md` — this file.
