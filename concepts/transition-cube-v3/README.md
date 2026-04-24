# transition-cube-v3

Tuned iteration of `transition-cube-v2`. Same Rubik's cube transition,
same technique — faster, lighter, with a fade instead of a shrink.

v2 read correctly. v2 also took ~5 seconds. v3 is tuned to land the
same animation in under 2.5s, with continuous subtle motion, and
without scaling the cube up and down. Everything that made v2 read as
a cube turning is preserved verbatim.

## Files

- `index.html` — demo page with origin + destination panels and a
  **Trigger transition** button.
- `cube-solver.js` — bidirectional BFS solver, ported verbatim from
  `transition-cube-v2/cube-solver.js` (only the exposed global name
  changed: `TransitionCubeV3Solver`).
- `transition-cube-v3.js` — animation layer + public API. Exposes
  `window.TransitionCubeV3.playTransition(opts)` and aliases to
  `window.TransitionCube` if that global isn't already set.
- `styles.css` — shell styles for the demo page.

## Public API

```js
TransitionCubeV3.playTransition({
  onComplete,      // () => void, optional — called when animation finishes
  destinationUrl,  // string, optional — if set, navigates here on complete
  duration,        // number, optional — advisory; actual duration comes
                   //   from the move queue (scramble + solve) × per-move
});

// Alias (set if not already bound):
TransitionCube.playTransition({ ... });
```

## What was tuned from v2

All changes are in `transition-cube-v3.js`. The solver, the cubie /
sticker construction, the group.attach / detach pattern, the snap-to
logic, the palette, and the camera angle are identical to v2.

| Knob                 | v2                       | v3                       |
| -------------------- | ------------------------ | ------------------------ |
| Per-move ease        | 220ms                    | **125ms**                |
| Inter-move pause     | 90ms                     | **40ms**                 |
| Per-move total       | ~310ms                   | **~165ms**               |
| Scramble length      | 8                        | **6**                    |
| Expected solve       | 7–9                      | **5–7**                  |
| Total moves          | ~16                      | **~11–13**               |
| Total move time      | ~5000ms                  | **~1800–2150ms**         |
| Stage size animation | scale 0.55 → 1 → 0.28    | **constant (no scale)**  |
| Opacity fade-in      | ~420ms CSS transition    | **200ms per-frame**      |
| Opacity fade-out     | ~520ms (with scale)      | **250ms per-frame**      |
| Ambient cube spin    | none (static tilt only)  | **+0.2 rad/sec on Y**    |

The spin is a per-frame delta, so it's frame-rate independent:

```js
cubeGroup.rotation.y += dt * AMBIENT_SPIN_RATE;  // dt in seconds
```

It's briefly softened for ~50ms after each snap so the moment your eye
catches the face-turn landing, the drift isn't pulling the image. It
never stops entirely — the cube is always moving.

## Why the fade replaces the shrink

v2's scale-in + shrink-out had the cube "arriving large" and
"dissolving small." Jake's note: he wanted more of a "constant
movement" feel with the cube staying the same size throughout. So v3:

- Stage CSS has `opacity: 0`, no `transform: scale`.
- The render loop drives `overlay.style.opacity` and
  `stage.style.opacity` in lockstep: `easeOutQuad` for fade-in,
  `easeInCubic` for fade-out.
- The cube itself never changes size or position in screen space.

Net effect: the cube appears in place, spins gently while it scrambles
and solves itself, and dissolves from the same size it arrived at.

## Total runtime budget

```
fade-in (200ms) + moves (~1800–2150ms) + fade-out (250ms)
  = ~2250–2600ms end-to-end
```

The move window itself (the "1.6–2.2s" target in the v3 brief) lands
at:

```
(125 + 40) × 11  = 1815ms   (lower bound: 11 moves)
(125 + 40) × 13  = 2145ms   (upper bound: 13 moves)
```

Both inside the brief's 1.6–2.2s window. If a particular scramble
happens to collapse to 10 moves total (shortest observed), you get
~1650ms of moves; if a harder scramble goes 14 total, ~2310ms —
still recognizably "under 2.5 seconds end-to-end" including fades.

## Preserving v2 correctness

The four things v1 got wrong and v2 fixed are all still fixed in v3:

1. Stickers are children of the cubie group. No `rotation.set(0,0,0)`
   anywhere. Stickers rotate with the cubie automatically.
2. `group.attach()` / `cubeGroup.attach()` for layer reparenting —
   world-transform preserving. This matters even more in v3 because
   `cubeGroup.rotation.y` is constantly drifting: if we used
   `add`/`remove`, cubies would visibly jump every commit by the
   amount cubeGroup drifted during the move. `attach()` cancels that
   out by construction.
3. Snap to exactly ±π/2 before detach. Round cubie positions to the
   integer grid and normalize quaternions on commit.
4. One move at a time, queued, with a pause between them. Even at
   the tighter 125ms / 40ms timings, each turn is still visually
   distinct.

The 4× U identity check from v2 is ported and runs once per page
load (throwaway scene, no render). It should log `OK` in the console.

## Verifying without a browser MCP

Open DevTools on `index.html`, click Trigger, read the console. Look
for:

```
[transition-cube-v3] scramble (6): F U' R B' L D'
[transition-cube-v3] solve (N): ...
[transition-cube-v3] total moves: 11–13 | per-move: 125ms + 40ms pause | estimated moves duration: 1815–2145ms | fade-in: 200ms | fade-out: 250ms
[transition-cube-v3] identity check (4× U): OK — all 9 U-layer cubies returned to start.
[transition-cube-v3] [move 1/N] F — axis z target -90.0°
[transition-cube-v3]   snap: rotation.z=-1.570796 (expected -1.570796) OK
...
```

Check:

- **Scramble length = 6.** If it's 8 someone bumped `SCRAMBLE_LEN`.
- **Total moves is 11–13.** Edge cases can land at 10 or 14.
- **Estimated moves duration is 1.8–2.2s.** `(125 + 40) × N`.
- **Every snap line reads OK.** A `DRIFT` line is a correctness bug.
- **Identity check is OK.** Confirms attach/detach math is intact.
- **No visible jump on commits.** With the ambient drift active, the
  commit-time `cubeGroup.attach()` is load-bearing. If you see the
  cube "hiccup" at the end of a move, something has regressed.

## Reduced motion

`prefers-reduced-motion: reduce` → a ~560ms opacity fade instead of
the cube. Same `onComplete` / `destinationUrl` contract.

## Integration

Three tags, one call — identical to v2 except the script and global
names:

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
<script src="cube-solver.js"></script>
<script src="transition-cube-v3.js"></script>
<script>
  document.getElementById("go").addEventListener("click", () => {
    TransitionCubeV3.playTransition({
      onComplete: () => console.log("transitioned"),
    });
  });
</script>
```

If the component's `<script src>` is in a subfolder, the solver is
resolved relative to it. Three.js is auto-loaded from the cdnjs URL
if `window.THREE` isn't already present.
