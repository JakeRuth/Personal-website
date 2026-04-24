# transition-cube

A full-screen Rubik's cube transition animation. Scrambled cube fades in large,
solves itself with real slice rotations, shrinks out of the way. New content is
revealed behind it.

Vanilla JS + three.js (CDN). No build. Works via `file://` or
`python3 -m http.server`.

## Files

- `transition-cube.js` — the reusable component. Exposes `window.TransitionCube.playTransition(opts)`.
- `cube-solver.js` — bidirectional BFS on the cubie model. Adapted from `concepts/xp-luna-v2/cube-solver.js`. Exposes `window.TransitionCubeSolver`.
- `styles.css` — styling for the demo page only. The component injects its own overlay styles inline; you do not need this stylesheet in a real integration.
- `index.html` — two-panel demo (origin + destination) with a trigger button.

## How to run the demo

```bash
cd concepts/transition-cube
python3 -m http.server 8000
# open http://localhost:8000
```

Or open `index.html` directly with `file://` — three.js is loaded from a CDN.

## How to integrate into another page

Two script tags, one function call.

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
<script src="cube-solver.js"></script>
<script src="transition-cube.js"></script>
```

Then to fire it:

```js
// Navigate to another page after the cube solves
document.getElementById("nav-btn").addEventListener("click", () => {
  TransitionCube.playTransition({
    destinationUrl: "/terminal/",
  });
});

// Or swap content in-place after the solve completes
document.getElementById("swap-btn").addEventListener("click", () => {
  TransitionCube.playTransition({
    onComplete: () => renderNextExperience(),
  });
});
```

The component loads `cube-solver.js` and three.js on demand if they aren't
already on `window`, so you can also get away with just the one script tag:

```html
<script src="transition-cube.js"></script>
```

…though pre-loading is recommended so there's no latency on the first trigger.

## Options

`TransitionCube.playTransition(options)` takes:

| Option           | Type       | Default  | Description                                                                       |
| ---------------- | ---------- | -------- | --------------------------------------------------------------------------------- |
| `duration`       | `number`   | `3200`   | Total timeline in ms. Clamped to `[2500, 4500]`.                                  |
| `onComplete`     | `function` | —        | Called once after the overlay is fully removed.                                   |
| `destinationUrl` | `string`   | —        | If set, `window.location.href = destinationUrl` is assigned after `onComplete`.    |

Both `onComplete` and `destinationUrl` may be supplied. `onComplete` fires first.

Only one transition can run at a time. Additional calls while one is in flight
are ignored.

## Timeline

Given `duration` (default 3.2s), the animation is roughly:

- `0.00 – 0.18` — dark overlay fades in; cube fades in scaling `0.58 → 1.0`, already rotating, scrambled.
- `0.18 – 0.78` — solve plays move by move (easeInOutCubic per move, ~60–260ms per move, auto-paced).
- `0.78 – 1.00` — cube shrinks to scale `0.24` and fades to `0`; overlay fades out. Destination content is revealed behind.

## Reduced motion

If `prefers-reduced-motion: reduce` is set, the component skips the 3D path
entirely and runs a ~640ms dark-overlay fade. `onComplete` / `destinationUrl`
fire the same way.

## Scramble / solve details

- Scramble depth: 7 moves (quarter turns only, with adjacent-face de-dup).
- Solver: bidirectional BFS on full cubie state (corners + edges, with orientation). Expands the smaller frontier each step; depths up to ~20 total moves are reachable but 7-move scrambles resolve in a handful of ms.
- Fresh scramble + fresh solve on every trigger. Not a scramble-then-reverse replay.

## Aesthetic notes

- Dark overlay at `rgba(8, 10, 14, 0.96)` with a subtle radial vignette and backdrop blur.
- Sticker palette is slightly desaturated (brick red, amber orange, forest green, ocean blue) so it doesn't read as a kid toy.
- Cube body is near-black (`#0c0e12`) so the stickers pop without the frame feeling plastic.
- Soft elliptical shadow sits under the cube for grounding.
- No particles, no bounce, no overshoot — cubic easings throughout.

## Demo interaction

- `Trigger transition` fires the animation; on complete, the origin panel is hidden and the destination panel crossfades up.
- `Reset demo` flips back to origin (no animation) so you can fire again.
- `Run it again` flips back to origin and re-fires the transition after a brief delay.

## Graceful degradation

If three.js fails to load (no network) and the component can't find it on
`window`, it falls back to the reduced-motion fade.
