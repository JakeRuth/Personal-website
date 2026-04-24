# Vista Faithful v3 — the bug-fix pass

v2's aesthetic is great; v2's behavior blocked Jake from evaluating it at all.
v3 keeps the chrome, ports the content, and hardens the interaction layer.

## Run it

```
python3 -m http.server --directory concepts/vista-faithful-v3 8000
# http://localhost:8000/
```

Or open `index.html` directly via `file://`. No build, no npm, no CDN deps
beyond the Inter font.

## What was broken in v2 — and what v3 fixes

### 1. Cube animation fought itself

v2 wrote an inline `rotateX / rotateY` to `#cube` on every scroll tick, and
the CSS `cubeflourish` keyframes also targeted `transform` on the same
element. As a result the celebration never played cleanly, and the per-tick
`transition: transform 320ms` on `.cube` meant every scroll update started a
new 320ms interpolation — the cube visibly "slid" behind the scroll position
on fast wheels.

**v3**: split into `.cube-tilt` (holds the scroll-driven tilt) and `.cube`
(holds the 3D face positions and owns the celebration animation). The scroll
handler writes only to `.cube-tilt.style.transform`; the flourish animates
`scale` on `.cube` without contention. Faces also got `backface-visibility:
hidden` so no z-fighting during rotation.

### 2. Start menu was unreliable

v2's orb handler called `e.stopPropagation()`, which is fine, but the
`document.click` outside-close listener also matched the orb itself if the
click target was a child pseudo-element (in some browsers the effective
target is the `::before`). Menu items inside the menu didn't stop
propagation, so clicking "Re-scramble cube" could race the outside-close
listener.

**v3**: a single `isMenuOpen / setMenuOpen` pair, the outside listener
explicitly excludes both `menu.contains(e.target)` and `orb.contains(e.target)`,
and every `.sm-item` click calls `stopPropagation()` before running its
action. Escape closes the menu. Mail items inside the menu work the same
way as mail items in the hire cards.

### 3. Window drag got stuck

v2's drag cleared `dragging` only on `document.mouseup`. If the user released
the mouse outside the viewport, or alt-tabbed mid-drag, `dragging` stayed
true and the window started following the cursor on the next mouseenter.
The original inline `transition` wasn't restored either, because the
cleanup only wrote `""` (which reverts to the CSS rule, but during drag v2
had already stomped the CSS transition with `"none"`).

**v3**: drag saves the prior `transition` and restores it exactly. `blur`
and `mouseleave` handlers also clear the drag state. Maximized windows
don't drag. Basic touch drag works too.

### 4. Tabs + scroll didn't always reset the solver

v2 set `body.scrollTop = 0` on tab change and called `onBodyScroll()`, but
if the body was already at 0 the scroll event didn't fire at all (because
`scrollTop` assignment is a no-op when already there), and `onBodyScroll`
was invoked only as a direct call — which works, but it's easy to miss that
branch.

**v3**: tab handler explicitly calls `advanceTo(0)` and clears the flourish
latch. A `ResizeObserver` on `windowBody` re-runs the scroll handler when
the window resizes (e.g. maximize), so the solver doesn't get stuck at its
pre-maximize progress percentage.

### 5. First paint occasionally showed pre-scramble state

v2 ran `setupCube()` on `DOMContentLoaded`, which in turn ran `newScramble()`,
which returned synchronously — but on slow machines the IDA* search could
push first render of the scrambled cube past the first animation frame, so
you'd see the solved cube for a tick before it scrambled.

**v3**: `ensureStickerElements` + `renderState(scrambledState, ...)` is the
first DOM write after ready, before `updateCubeMeta` touches anything.

### 6. Minimize + drag + pointer-events

v2's minimize set `pointer-events: none` on the window. Restore cleared
that — but if the user double-clicked minimize (fast toggle) the two calls
raced and left the window in the wrong state. Similarly the taskbar button
toggled minimize without respecting current state.

**v3**: both `minimize()` and `restore()` are idempotent (guarded by
`if (minimized) return` / `if (!minimized) return`). The taskbar task
button flips based on the canonical state, not a count.

### 7. `user-select: none` on `html, body` blocked the Start menu input

In some browsers the `user-select: none` on `body` inherits into `<input>`
and prevents typing in the Start Search field.

**v3**: explicit `user-select: text` on `input, textarea` restores normal
form behavior.

## What carried over unchanged

The cube solver itself (move permutations, IDA*, heuristic) was correct in
v2. v3 ports it verbatim except for:

- Factored `invertMove` out of `selfTest` so the scramble fallback and the
  self-test share one implementation.
- `performance.now()` probe tolerates environments without it (JSDOM test
  setups).

## Test results

Ran 30 scramble-solve cycles of depth 7: **30/30 solved, max solver time
32ms**. Full JSDOM smoke test of the UI:

- Scrambled-cube initial render:   PASS (cubeMovesRemaining = 7, pct = 0)
- Tab switch (Overview -> Work):   PASS (only Work active)
- Start menu open:                 PASS (hidden class removed, orb.active set)
- Start menu re-scramble:          PASS (menu closes, new 7-move scramble loads)
- Scroll halfway:                  PASS (cubePct ~ 57)
- Scroll to end:                   PASS (cubePct = 100)
- Window drag (100,100 -> 200,150):PASS (left=100px, top=50px)
- Maximize / restore:              PASS (width toggles)
- Minimize / restore:              PASS (opacity toggles)

All four files serve 200 from `python3 -m http.server`.

## Files

- `index.html` — structure
- `styles.css` — all styling, identical palette to v2
- `cube.js` — facelet model + IDA* solver (same math as v2)
- `app.js` — glue: scroll, tabs, start menu, chrome, clock, drag
- `README.md` — this file
