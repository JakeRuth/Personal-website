# nav-bottom-segment

A minimalist bottom-centered segmented control for switching between the three
alpha experiences of jakeruth.com.

Three pills in a glassy track, floating 24px off the bottom of the viewport.
Current is filled; the others are ghosted. Click a non-current pill, the
transition-cube plays, and you land in the next experience. iOS / Linear /
Apple Music energy, nothing more.

## Files

- `index.html` — staging page. Scrollable, with placeholder copy, to prove the
  control stays pinned through scroll.
- `bottom-segment-nav.js` — the component. Vanilla, no build, no deps of its
  own. Loads `transition-cube` from `../transition-cube/` on demand.
- `styles.css` — component styles only. Demo page styles are inline in
  `index.html` to keep the component file clean.

## Run it

No build. Either:

- Open `index.html` directly via `file://`, or
- From the repo root, `python3 -m http.server` and visit
  `/concepts/nav-bottom-segment/`.

The `http.server` route is the safer one — `file://` works too, but the
transition cube loads three.js from a CDN and the sibling `transition-cube.js`
from disk, which some browsers handle more reliably over HTTP.

## Usage

```html
<link rel="stylesheet" href="./styles.css" />
<script src="./bottom-segment-nav.js"></script>
<script>
  BottomSegmentNav.mount({ current: 'xp' });
</script>
```

### All options

```js
BottomSegmentNav.mount({
  current: 'xp',                                    // 'xp' | 'readme' | 'saas'
  mountTo: document.body,                           // node to append to
  transitionCubeSrc: '../transition-cube/transition-cube.js',
  segments: [
    { id: 'xp',     label: 'XP Luna', href: '../retro-03-xp-luna/' },
    { id: 'readme', label: 'README',  href: '../readme-mode/' },
    { id: 'saas',   label: 'SaaS',    href: '../saas-v5/' },
  ],
  onSelect: (id, ctx) => { /* override default transition + navigate */ },
});
```

Returns an instance with:

- `instance.setCurrent(id)` — move the highlight without triggering a
  transition. Useful for in-page state changes.
- `instance.destroy()` — remove the control and its listeners.

## Behavior

- **Pill slide.** A single absolutely-positioned thumb element animates
  `transform: translateX` and `width` between segments. Uses an iOS-style
  ease (`cubic-bezier(.32, .72, 0, 1)`). `ResizeObserver` repaints it on
  layout changes so it survives font swaps and window resizes.
- **Transition cube.** On a non-current click, the component lazy-loads
  `transition-cube.js`, fires `TransitionCube.playTransition({ destinationUrl })`,
  and the cube handles the navigation. If the cube fails to load, the component
  falls back to a direct `location.href` assignment — the user still gets
  where they're going.
- **Reduced motion.** If `prefers-reduced-motion: reduce`, the cube is skipped
  entirely and the nav performs a short delayed navigation instead.
- **Keyboard.** Roving `tabindex`. `Tab` focuses the current segment.
  `ArrowLeft` / `ArrowRight` (and Up / Down) move focus between segments
  without activating. `Home` / `End` jump. `Enter` or `Space` activates the
  focused segment. Pill highlight only slides on confirm, matching native iOS.
- **ARIA.** The control is a `<nav role="navigation">` containing a
  `role="tablist"` with `role="tab"` buttons. `aria-selected` tracks the
  current segment.

## Voice

Short labels — `XP Luna`, `README`, `SaaS`. The staging page copy runs
through `VOICE.md`: plain sentences, specific numbers, dry one-liners, the
Stock Unlock framing rule respected (built it, scaled it, runs as a
profitable side business, not full-time there anymore).

## What this is not

- Not a top bar. Top bars compete with content for the hero area.
- Not a command palette. Palettes assume you know the names.
- Not animated chrome. One accent color, one transition, one control.

Chrome varies; voice does not.
