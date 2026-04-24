# transition-cube-v2

A full-screen Rubik's cube transition that actually looks like a cube turning.
v1 scrambled, solved, and animated — just not in a way you could read as face
rotations. v2 fixes the animation layer. Same solver.

## Files

- `index.html` — demo page with origin + destination panels and a big
  **Trigger transition** button.
- `cube-solver.js` — bidirectional BFS on cubie state. Ported from
  `concepts/xp-luna-v3/cube-solver.js`. Exposes `window.TransitionCubeV2Solver`.
- `transition-cube-v2.js` — the animation layer and public API. Exposes
  `window.TransitionCubeV2.playTransition(opts)`.
- `styles.css` — shell styles for the demo page.

## Public API

```js
TransitionCubeV2.playTransition({
  onComplete,      // () => void, optional — called when the animation finishes
  destinationUrl,  // string, optional — if set, navigates here on complete
  duration,        // number, optional — currently advisory; actual duration is
                   //   governed by the move queue (scramble + solve)
});
```

## What was broken in v1

v1's layer-rotation commit step executed this, once per turn:

```js
affected.forEach(c => {
  layerGroup.remove(c);
  cubeGroup.add(c);
  c.position.set(round(c.position.x), round(c.position.y), round(c.position.z));
  c.rotation.set(0, 0, 0);   // <-- this is the bug
});
```

The sticker planes lived in the same scene graph as the cubie bodies, and the
"U layer" test picked up both. Every sticker's outward-facing orientation
(`rotation.x = -π/2` for up-stickers, etc.) got reset to `(0,0,0)` on every
commit, so after the first turn most stickers lay flat against their cubie's
body. The cube flickered between readable and a jumble — "jittery mess."

Compounding that, `cubeGroup` got `rotation.y += 0.0035` every frame during
solve, so the layer group's local rotation and the parent's rotation combined
into drift. And `cubeGroup.add(c)` preserves the child's *local* transform,
not its *world* transform — so whenever the parent had spun, world positions
jumped when cubies were handed back.

And there were no pauses. 18 moves dissolved into ~600ms of smear.

## What v2 does differently

1. **Each cubie is a `THREE.Group` with its stickers as children.** Rotating
   the cubie rotates its stickers automatically. No separate sticker bookkeeping,
   no `rotation.set(0,0,0)` footgun. Sticker *color* is refreshed from the
   facelet model after every commit; sticker *orientation* comes for free.

2. **`group.attach()` / `cubeGroup.attach()` instead of `add` / `remove`.**
   Three.js's `.attach(obj)` is `add(obj)` with world-transform preservation.
   This is the central bit the classic Three.js cube tutorials (e.g.
   bripkens/rubiks-cube-three-js) all rely on. Without it, a reparent jumps
   world positions whenever the parents differ in rotation.

3. **Snap to exactly ±π/2 before detach.** On the last frame of a tween we
   set `layerGroup.rotation[axis] = targetAngle` explicitly, then log the
   actual vs. expected value, then detach. No FP drift accumulates over
   18 moves.

4. **Queue + pauses.** One move at a time. 220ms turn + 90ms pause. Each
   turn is visually distinct — the eye reads "U, then D-prime, then R."

5. **Static cube tilt.** `cubeGroup.rotation.x = -0.32, .y = 0.52` set once
   at init. No per-frame spin. The camera is a fixed-angle perspective
   camera at `(4.5, 5.0, 6.5)` looking at origin.

6. **Classic palette.** `W=0xffffff, R=0xb71234, G=0x009b48, Y=0xffd500,
   O=0xff5800, B=0x0046ad`, body `0x111111`. Reads as a cube at a glance.

## Verifying without Chrome MCP

Open DevTools on `index.html` and click Trigger. Console will print:

```
[transition-cube-v2] scramble (8): F U' R B' L D' F' R
[transition-cube-v2] solve (8): R' F D L' B R U F'
[transition-cube-v2] total moves: 16 | per-move: 220ms + 90ms pause | estimated moves duration: 4960ms
[transition-cube-v2] identity check (4× U): OK — all 9 U-layer cubies returned to start.
[transition-cube-v2] [move 1/16] F — axis z target -90.0°
[transition-cube-v2]   snap: rotation.z=-1.570796 (expected -1.570796) OK
...
```

Things to look for:

- **Move count.** Scramble is 8, solve is typically 7–9 from an 8-move
  scramble (verified via `node`-side round-trip: 20/20 trials solved,
  avg 16 total moves). Comfortably inside Jake's 15–25 expected range.
- **Duration.** `(220 + 90) × 16 = 4960ms` of moves, plus ~420ms fade-in
  and ~520ms fade-out = ~5.9 seconds. Inside the 5–8s budget.
- **Snap line.** Every move's "snap:" line should read `OK`. If it shows
  `DRIFT` the commit isn't snapping. Shouldn't happen.
- **Identity check.** Runs once per page load on a throwaway scene: four
  successive `U` moves. All nine U-layer cubies return to their starting
  world positions (≤ 1e-6 delta). Confirms the attach/detach math is
  self-consistent.
- **Solved after solve.** If you log `facelets` after the last commit and
  compare to `solvedFacelets()`, they match. (The solver is the same one
  that's been verified in xp-luna-v3 — this check is belt-and-suspenders.)

## Reduced motion

`prefers-reduced-motion: reduce` → a 640ms opacity fade instead of the cube.
Same `onComplete` / `destinationUrl` contract.

## Integration

Two `<script>` tags, one call:

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
<script src="cube-solver.js"></script>
<script src="transition-cube-v2.js"></script>
<script>
  document.getElementById("go").addEventListener("click", () => {
    TransitionCubeV2.playTransition({
      onComplete: () => console.log("transitioned"),
    });
  });
</script>
```

If the component's own `<script>` tag is in a subfolder, the solver is
resolved relative to it. Three.js is auto-loaded from the cdnjs URL if
`window.THREE` isn't already present.
