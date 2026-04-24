# picker-wizard-v2

Second pass on the InstallShield-style entry-point picker for jakeruth.com.
The wizard is the whole interface now - no faux OS wrapped around it.

## Run

Vanilla HTML/CSS/JS. No build step. Three.js loaded from unpkg.

- Open `index.html` directly in a browser (`file://`), or
- `python3 -m http.server` and visit `http://localhost:8000/`.

If Three.js fails to load (offline `file://` on a locked-down network),
the ambient background quietly disappears and the wizard still works.

## What changed from v1

Jake's v1 feedback was: the faux-OS desktop implied XP was the site, not one
of five options. The wizard should stand alone, with a subtle "about Jake"
backdrop that doesn't compete.

1. **Killed the faux desktop.** No taskbar, no Start button, no desktop
   icons, no tray clock. The wizard is the sole interactive surface.
2. **Bigger window.** 700x500 (up from 520x400). The picker list, preview
   pane, and advanced panel all have proper breathing room now. The banner
   is also taller, the splash sideart is wider, and button targets are
   larger (28px vs 23px).
3. **Ambient Rubik's cubes on invisible tracks.** Three.js, nine cubes,
   each following its own slow lissajous-ish parametric curve in 3D. They
   drift and spin gently, at ~22% canvas opacity, over a near-white paper
   background. Desaturated palette (salmon / muted blue / soft green, not
   full saturation) so the wizard never fights the backdrop for attention.
   Honors `prefers-reduced-motion`: renders one frame, stops, drops opacity
   a bit further.
4. **Refined installer typography.** Segoe UI / Inter for body, SF Mono
   for stamped strings (`build 20260420.2`, path previews, log lines).
   Still unambiguously "installer" - just with less jagged rendering and a
   bit more weight hierarchy.
5. **Slug updates.** The picker now redirects to `../xp-luna-v2/`,
   `../vista-faithful-v3/`, `../enterprise-saas-v2/`, `../readme-git-fusion/`,
   and `../readme-mode/`. README/Git-Log has been consolidated into one
   "engineer one" option that points at the fused experience, with plain
   README kept as a fallback.

The flow is still Welcome -> Choose -> Confirm -> Launching, and all the
v1 keyboard nav (arrows on picker, Enter = next, Backspace = back, Esc =
cancel) is preserved. Double-click a mode to select-and-advance.

## Ambient background - approach

Option (a) from the brief. Concretely:

- `Three.js` `WebGLRenderer` with `alpha: true` over a near-white body
  background, so the CSS paper tone shows through.
- Each cube is a `Group` of 27 `BoxGeometry` cubies with per-face
  `MeshLambertMaterial`. Hidden faces are painted black; outer faces use
  desaturated XP-era sticker colors (`#d98383`, `#6c9ad6`, `#7fb77f`,
  `#e5a86a`, `#f3d96b`, `#ffffff`). No textures, no loading.
- "Tracks" are parametric functions - three sines per axis with randomized
  frequencies and phases, seeded from a tiny `mulberry32` so the layout is
  stable across reloads but each cube drifts independently. Each cube has
  its own per-axis spin rate on top of the track motion.
- Scene `Fog` at range 22-70 plus a gentle z-offset distribution means
  cubes at the back naturally fade into the paper background - no
  per-material opacity math.
- Renderer pixel ratio is clamped to 2, ambient+key+fill lighting is flat
  and even. GPU load is negligible; this is a backdrop, not a feature.

The whole canvas is held at `opacity: 0.22` so it reads as "something
pleasant in the peripheral vision," not as content. If you stare at it,
the cubes are clearly Rubik's cubes on gentle trajectories. If you're
reading the wizard, they're just... atmospheric.

## Files

- `index.html` - wizard shell, canvas, modal, Three.js CDN script tag
- `styles.css` - modernized InstallShield chrome, thumbnails, progress
  bar, responsive mobile rules
- `ambient.js` - Three.js scene, cubes, tracks, animation loop,
  reduced-motion handling
- `wizard.js` - state machine, step rendering, keyboard nav, launch
  animation, redirect

## Voice

Same deadpan installer copy as v1: "fewer than three minutes, about the
same as a PDF resume," "opinion.dll loaded," "deps: monospace,
conviction." Nothing about Stock Unlock implies he still runs it
day-to-day. No dollar figures anywhere.

## If I had more time

- **Per-cube scramble animation.** Each ambient cube would actually
  rotate a face once every few seconds - real cube-turn mechanics, not
  just rigid-body rotation. Would be a tiny nod to Jake's 13.95-second
  3x3 average.
- **Mouse parallax.** Very subtle camera drift toward the cursor so the
  scene feels like it has depth when you move. Would need a careful
  amplitude so it doesn't become a fidget toy during an install wizard.
- **Track visualization in Advanced panel.** A "Show tracks" toggle that
  briefly flashes the invisible Bezier curves the cubes follow. Pure
  developer flourish, skippable.
- **Live iframe previews.** The right-hand preview pane renders each
  mode in a scaled, interaction-blocked iframe instead of a CSS fake.
- **Persist + forward Advanced prefs.** `localStorage` + a query string
  (`?cube=0&crt=1`) so the sibling experiences can honor them.
- **Return-visitor shortcut.** Skip directly to Confirm with the last
  choice pre-selected; "Reconfigure" link drops back to step 2.
- **Sound design.** A soft "tick" on mode change, the XP install "ding"
  on Finish - gated on the Advanced audio toggle.
- **EULA step.** Scroll-to-accept between Welcome and Choose, featuring
  Jake's Anti-Bullshit License. Pure flavor, but on-brand.
