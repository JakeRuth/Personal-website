# nav-ambient-cubes

Three tiny floating Rubik's cubes as the inter-experience nav. Same DNA as
`picker-wizard-v2` (ambient drifters) and `transition-cube` (the full-screen
solve). One cube per alpha experience. The cube representing the current
experience is the largest and most prominent. Click a cube → the full-screen
transition fires → the destination experience loads.

Vanilla HTML/CSS/JS. No build. Three.js from CDN. Opens via `file://` or
`python3 -m http.server`.

## Files

- `ambient-cubes-nav.js` — the reusable component. Exposes
  `window.AmbientCubesNav.mount(opts)` and `.unmount()`.
- `styles.css` — styling for the staging demo **content only**. The nav
  injects its own CSS inline so the component is self-contained.
- `index.html` — staging page with realistic Jake content (following
  `_shared/VOICE.md` and `_shared/content.json`) so the nav can sit against
  something real.

## How to run

```bash
cd concepts/nav-ambient-cubes
python3 -m http.server 8000
# open http://localhost:8000
```

Or open `index.html` directly via `file://`. Three.js and the
transition-cube scripts are reachable as siblings, so both paths work.

## How to reuse

Two script tags, one function call. Drop this at the end of any experience:

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
<script src="../nav-ambient-cubes/ambient-cubes-nav.js"></script>
<script>
  AmbientCubesNav.mount({ current: "xp" });   // or "readme" or "saas"
</script>
```

That's it. The nav will:

- Render three tiny WebGL Rubik's cubes in the bottom-right corner.
- Make the current experience's cube ~60px (prominent), the other two ~42px.
- Spin them slowly and ambiently, with deterministic per-cube wobble so they
  never sync up.
- Show a tooltip on hover with the mode name (e.g. "the OS" + `xp-luna-v3`).
- On click, lazy-load `../transition-cube/transition-cube.js` if it's not
  already on the page, then fire `TransitionCube.playTransition()` with
  `destinationUrl` pointing at the chosen experience.

The component works whether you pre-load `transition-cube` or not. Pre-load
is recommended so the first click has no network latency — the staging
`index.html` does this.

## API

```js
AmbientCubesNav.mount({
  current:      "xp" | "readme" | "saas",    // required
  container:    HTMLElement,                 // optional — defaults to document.body
  corner:       "bottom-right" | "right-edge", // optional — default "bottom-right"
  destinations: {                            // optional — override URLs
    xp:     "../xp-luna-v3/",
    readme: "../readme-git-fusion-v2/",
    saas:   "../saas-v5/",
  },
  onNavigate:   (id) => boolean,             // optional — return `true` to skip default nav
});

AmbientCubesNav.unmount();                   // tear down + dispose WebGL
```

### `onNavigate` hook

If you want to intercept the nav (e.g. to animate content out before the
transition fires, or to swap in-place instead of navigating), pass an
`onNavigate(id)` callback. Return `true` and the component skips its
default behavior:

```js
AmbientCubesNav.mount({
  current: "xp",
  onNavigate: (id) => {
    swapExperienceInPlace(id);
    return true;  // we handled it — nav should not navigate
  },
});
```

Returning `false`/`undefined` lets the nav fire `TransitionCube.playTransition`
and assign `window.location.href` as normal.

## Behavior details

- **Active cube is the largest.** The other two are smaller world-scale and
  smaller canvas size, so perspective reinforces "elsewhere" without needing
  a separate visual treatment.
- **Clicking the active cube doesn't navigate.** It plays a short shake
  animation instead (harmless reassurance that you clicked the current
  experience).
- **Hover lifts the cube.** Spin rate ~2.6x, scale pops ~10%, a subtle
  drop-shadow materializes under the canvas, tooltip fades in.
- **Focus-visible** keyboard users see the same tooltip + visual lift, plus
  a bright outline.
- **Enter / Space** fire the same click path.
- **Deterministic cube personalities.** Each cube has a seeded rotation
  axis + tilt phase derived from its id, so the three cubes never
  visually sync up across reloads.
- **Prefers-reduced-motion.** Transitions on CSS elements are disabled. The
  cubes still render but the transition-cube component handles its own
  reduced-motion fallback (a short dark fade instead of the 3D solve), so
  the click experience remains snappy.
- **Graceful WebGL fallback.** If three.js fails to load, the component
  paints a tiny CSS block per slot so the nav is still visible and
  clickable — click still fires the transition (which itself falls back
  to the reduced-motion fade if three.js is still unavailable).

## Aesthetic

- Same six-color Rubik's palette as the picker: white top, muted yellow
  bottom, green front, blue back, salmon-red right, amber-orange left. Low
  saturation so the cubes never read as kid-toy.
- Host strip is a thin dark glassmorphism rectangle (`rgba(20,22,28,0.62)`
  + `backdrop-filter: blur(10px)`). Sits on top of anything without
  muddying it.
- A one-word rail label reading `NAV` in letter-spaced 9.5px uppercase
  sits on the top-edge of the strip — just enough to signal "this is a
  control, not decoration."
- Tooltip is dark-on-light with a two-line structure: the friendly name
  ("the OS") + the technical id (`xp-luna-v3`).
- Faint colored aura plane behind each cube tints it slightly toward its
  experience's accent color without recoloring the stickers:
  - `xp` — cool blue
  - `readme` — leaf green
  - `saas` — warm red

## Integration plan across experiences

Because the nav renders the same three cubes on every page, it acts as a
persistent anchor: the reader always sees which of the three they're in,
and always has the other two one click away. The transition-cube animation
connects the trip — so the jump between `xp` and `readme` is the same
cube, solving.

Recommended wiring (example):

```
xp-luna-v3/index.html         → AmbientCubesNav.mount({ current: "xp" })
readme-git-fusion-v2/index.html → AmbientCubesNav.mount({ current: "readme" })
saas-v5/index.html            → AmbientCubesNav.mount({ current: "saas" })
```

## Tradeoffs

- **WebGL cost.** Three WebGL canvases is not free, though each is tiny
  (62×62 or 42×42 at device DPR, rendered on a shared RAF). On low-power
  devices the cubes will still render, but the host experience may prefer
  to call `AmbientCubesNav.unmount()` during heavy interactions.
- **Discoverability vs. weight.** We intentionally made these cubes small
  so they don't compete with content — which means a first-time visitor
  might miss them. Mitigation: the staging page ships with an explicit
  instructional overlay ("these tiny cubes are the nav"). Real experiences
  can use an unobtrusive `NAV` rail label + first-load pulse to draw the
  eye without shouting.
- **Three experiences, hard-coded.** The component is opinionated about
  having exactly three slots (xp / readme / saas). Adding a fourth
  experience later means expanding `EXPERIENCE_META` inside
  `ambient-cubes-nav.js`. Worth the simplicity today.
- **Relative path assumption.** Default destinations assume experiences
  live as sibling folders under `/concepts/` (which is true in this
  repo). When moving to the real site, override via `destinations: {}`.
- **Corner placement collides with chat-style FABs.** If the host
  experience also renders a bottom-right floating action button, switch
  to `corner: "right-edge"` — the strip stacks vertically against the
  right edge and tooltips flip to the left.

## Staging content

The demo page renders realistic Jake content (Stock Unlock, the unicycle
cube, the Pronk emails, AI-era engineering). It follows `_shared/VOICE.md`:
no "passionate," no "excited to leverage," no dollar prices. The content
is also scrollable well past one viewport so you can confirm the nav stays
fixed in-corner through scroll.

The instructional overlay in the bottom-left is **staging-only**. Real
experiences would not ship with it.
