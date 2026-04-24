# transition-cube-v4

Fourth pass on the Rubik's cube page transition for Jake Ruth's site.

v2 got the cube reading as a cube (group.attach / detach was the
load-bearing fix). v3 got the timing right (quicker moves, fewer
of them, light ambient spin, fade instead of shrink). **v4** reshapes
the choreography: the cube now **grows** into the screen while the
source page fades out, **solves** at full viewport size, then
**shrinks** away while the destination page fades in. Source and
destination opacities are exact inverses of the cube's — they cross
at the solved moment.

## The three-phase choreography

```
                       ┌─────── phase 2 ───────┐
                       │   peak / solving       │
                       │   (≈700–1000ms,        │
                       │    move-queue driven)  │
                       │                        │
                       │  ┌──────────────┐      │
     source ───────────┤  │ cube at full │      ├───────────── dest
     fades out         │  │ size, solves │      │        fades in
     1 → 0 (phase 1)   │  │ scramble +   │      │        0 → 1 (phase 3)
                       │  │ solve        │      │
                       │  └──────────────┘      │
                       │                        │
     ┌── phase 1 ──────┘                        └────── phase 3 ──┐
     │   grow / leaving                              shrink /      │
     │   (700ms)                                     arriving      │
     │                                               (700ms)       │
     │   stage scale: tiny  →  full                  full  →  tiny │
     │   cube  opacity: 0   →  1                      1   →   0    │
     │   src   opacity: 1   →  0                     n/a            │
     │   dst   opacity:     n/a                       0   →   1    │
     └─────────────────────────────────────────────────────────────┘
```

Total wall-clock: ~2.1–2.3 seconds.

### Phase timings

| phase | duration | cube scale | cube opacity | source opacity | dest opacity |
|-------|----------|------------|--------------|----------------|--------------|
| 1 — grow / leave | 700 ms | ~6% → 100% | 0 → 1 | 1 → 0 | (0, held) |
| 2 — peak / solve | 700–1100 ms (move-queue driven, clamped) | 100% | 1 | 0 | 0 |
| 3 — shrink / arrive | 700 ms | 100% → ~6% | 1 → 0 | (0, held) | 0 → 1 |

The inverse relationship is exact: in phase 1, `source_opacity = 1 - cube_opacity`, both driven by the same eased progress. In phase 3, `dest_opacity = 1 - cube_opacity`, both driven by the same eased progress.

Phase 2's length is governed by the move queue: 6 scramble moves + whatever the solver returns (typically 5–7), at 125 ms turn + 40 ms pause per move. Typical queue runtime ≈ 1800–2100 ms — but the clamp `[700, 1100]` trims the tail so phase 2 doesn't drag. The solver still runs to completion; the clamp only affects how long phase 2 "holds" before initiating phase 3. In practice the cube is solved long before phase 3 starts.

## What's new vs v3

| thing | v3 | v4 |
|-------|----|----|
| overall shape | fade-in → solve → fade-out at constant size | **grow**-in → solve at full size → **shrink**-out |
| cube size | constant, `min(82vmin, 760px)` | **tiny → viewport-filling → tiny** |
| source page | untouched | **fades 1 → 0** in phase 1 (inverse of cube) |
| destination page | untouched | **fades 0 → 1** in phase 3 (inverse of cube) |
| fade curve | separate fade-in (200ms) + fade-out (250ms) | grow/shrink coupled to opacity via the same eased progress |
| backdrop | overlay at constant 0.96 alpha | dark seam only during peak; fades with source/dest |
| cross-page handoff | N/A (single page) | **sessionStorage handoff** (`jrTransitionArrive`) |

## What's unchanged from v3 (load-bearing — preserved verbatim)

- **Solver.** `cube-solver.js` is a verbatim port from v3 (only the global name changes: `TransitionCubeV3Solver` → `TransitionCubeV4Solver`).
- **Scene graph.** 27 cubies, each a `THREE.Group` with body + sticker children. Facelet model drives sticker colors.
- **Layer rotation pattern.** `layerGroup.attach(cubie.group)` on move start, `cubeGroup.attach(cubie.group)` on commit — the v2 pattern that made the cube actually read as a cube turning. `attach()` preserves world transform across reparent, which is specifically what we need because cubeGroup is drifting on Y during every move.
- **Snap on commit.** `±π/2` snap, integer position round, quaternion normalize — kept as-is.
- **Camera + tilt.** `camera.position.set(4.5, 5.0, 6.5)`, `cubeGroup.rotation.x = -0.32`, `cubeGroup.rotation.y = 0.52` initial tilt.
- **Palette.** Classic saturated Rubik's colors (W/R/G/Y/O/B) — verbatim.
- **Per-move timing.** 125 ms turn + 40 ms pause per move.
- **Scramble depth.** 6 moves.
- **Ambient spin.** ~0.2 rad/sec Y-drift on `cubeGroup`, softened for 50 ms after each snap so the snap reads clean. Active throughout all three phases.
- **Identity check.** The 4× U self-test on first load.
- **Console instrumentation.** Scramble / solve / per-move / snap / identity — same log format (prefix switched to `[transition-cube-v4]`).

## Cross-page coordination

For actual page-to-page navigation, v4 splits the animation across two page loads:

### Leaving (source page)

```js
TransitionCubeV4.playTransition({
  destinationUrl: "/next-page.html",
  sourceFadeTarget: document.querySelector("main"), // optional
});
```

On the source page, phase 1 and phase 2 run. At the start of phase 3 (cube at full size, solved), the transition:

1. Writes `sessionStorage.setItem("jrTransitionArrive", JSON.stringify({ timestamp: Date.now(), cubeSolveState: "solved" }))`.
2. Calls `window.location.href = destinationUrl`.

### Arriving (destination page)

Every page should call `TransitionCubeV4.initArrival()` once on load:

```html
<script src="cube-solver.js"></script>
<script src="transition-cube-v4.js"></script>
<script>
  TransitionCubeV4.initArrival();
</script>
```

On page load, `initArrival()`:

1. Reads `sessionStorage.jrTransitionArrive`.
2. If absent, or if `timestamp` is more than **3 seconds** old: no-op. Page renders normally.
3. Otherwise: clears the sessionStorage entry, mounts a full-size cube + dark backdrop over the just-loaded page, sets every direct child of `<body>` to `opacity: 0`, and plays **phase 3** — cube shrinks away while the page content fades in.

The 3-second freshness window is a belt-and-braces check: if the destination is slow to load (network flakiness, cold CDN), you'd rather skip the arrival animation than stutter through it on a stale handoff.

### Graceful degradation

- **`sessionStorage` unavailable** (private browsing on some browsers, iframes with restricted storage): the leaving side's `setItem` throws, caught silently. Navigation still happens. The destination page just renders without the arrival animation.
- **`prefers-reduced-motion`:** both sides fall back to a plain opacity crossfade — no cube, no grow, no shrink.
- **WebGL / three.js unavailable:** same crossfade fallback.

## API

```js
window.TransitionCubeV4.playTransition({
  destinationUrl,      // optional; cross-page navigation URL
  onComplete,          // optional; fires on done IF no destinationUrl
  duration,            // ignored (present for v3 API parity)
  sourceFadeTarget,    // optional; selector | Element | Array — fades 1→0 in phase 1
                       //   default: direct children of <body> minus overlay
  destFadeTarget,      // optional; selector | Element | Array — fades 0→1 in phase 3
                       //   if omitted (and no destinationUrl), phase 3 fades
                       //   the sourceFade targets back in (reversible demo mode)
  onPhase2End,         // optional hook called right before phase 3 begins
                       //   (used by the single-page demo to swap data-active)
});

window.TransitionCubeV4.initArrival();
// Idempotent. Call on every page load. No-ops unless sessionStorage
// contains a fresh jrTransitionArrive entry.
```

Aliased as `window.TransitionCube` if no prior binding exists, so consumers can always call `TransitionCube.playTransition(...)` against the latest version.

## Demo

`index.html` is a single-page demo that plays the full three-phase choreography without navigating:

- "Trigger transition" — origin → destination (origin fades out in phase 1, destination fades in in phase 3).
- "Run it again" — destination → origin (inverse direction, same choreography).
- "Reset demo" — snap back to origin state without animating.

The demo wires the transition up with `sourceFadeTarget` and `destFadeTarget` explicitly set to the two panels, and uses `onPhase2End` to flip the stage's `data-active` attribute (for pointer-events / z-order) at the exact frame the cube begins shrinking.

## Files

```
transition-cube-v4/
├── index.html              # demo page
├── styles.css              # demo shell (consistent with v1/v2/v3 demos)
├── transition-cube-v4.js   # the transition component
├── cube-solver.js          # verbatim port from v3 (name-swapped)
└── README.md               # this file
```

Open with `python3 -m http.server` in this directory, then visit `http://localhost:8000/`. It also works via `file://` — the transition component loads three.js from CDN and `cube-solver.js` via a path resolved from its own `<script src>`.
