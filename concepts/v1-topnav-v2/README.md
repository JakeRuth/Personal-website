# v1 topnav v2 — clearer, more legible, subtle

A drop-in replacement for `concepts/v1/shared/topnav.{js,css}`.

## Why this exists

Jake's feedback on the v1 topnav:

> "The navigation is also not that great... the navigation definitely needs
> to be way more clear, like a bar up at the top, it should be way more clear
> what you're doing there — that you can navigate to the other experiences.
> You should be able to go back to the installer potentially. It should be
> simple and subtle."

v1 used three standalone Rubik's cubes + a "Setup" pill. The cubes alone didn't
communicate destination — you had to hover for a tooltip. v2 flips that: **labels
are primary, the cube mark is a decorative accent**.

## What changed from v1

| | v1 | v2 |
|---|---|---|
| Height | 64px | **56px** (52px on mobile) |
| Back-to-Setup | `[grid icon] Setup jakeruth.exe` pill | `[← arrow] Setup` — plain, clear |
| Tab primary affordance | 40px cube + tiny uppercase label | **Full word label** + 14px static cube mark |
| Tab labels | `XP`, `README`, `SaaS` (fragments) | `Old-school OS`, `Code repo`, `SaaS product` (match wizard) |
| Current state | Slightly larger cube + glow | **Filled pill + coloured 2px underline accent** |
| Hover | Cube rotates + scales | Background lightens, label brightens — no animation on the mark |
| Surround | Two loose groups | Tabs wrapped in a subtle container group (like macOS segmented control) |
| Background | Dark gradient + blur | Flat dark + blur + saturate — quieter |
| Tooltips | Yes (because labels were tiny) | **Removed** — labels are readable on their own |
| Animation on bar | Cube hover rotate | None on the bar. Subtle colour/background transitions only |

Per-experience layout nudges for `.xp-window.explorer`, `.gh-header`, `.nav`,
etc. are preserved — heights are updated from 64px → 56px (and 56px → 52px on
mobile) to match the new bar.

## Files

- `topnav.js` — component. Injects `<nav id="v1-topnav">` into `<body>`.
  Same public API as v1: no exports, just include the script and it runs.
- `topnav.css` — styles. Self-contained; no external CSS dependencies.
- `index.html` — preview page. Three scrollable sections + a little
  `?exp=xp|readme|saas` switcher so you can see each "current" tab state
  without actually navigating.

## Preview

**file://**: just open `index.html` in a browser.

**local server**:

```sh
cd concepts/v1-topnav-v2
python3 -m http.server 8000
# then visit http://localhost:8000/
```

Use the preview switcher links on the page to see each experience's
"current" tab highlight.

## Swapping it into v1

The nav is a strict drop-in. Two options:

### Option A — copy over the v1 shared files (recommended)

```sh
cp concepts/v1-topnav-v2/topnav.js  concepts/v1/shared/topnav.js
cp concepts/v1-topnav-v2/topnav.css concepts/v1/shared/topnav.css
```

No HTML changes needed. Every experience page already has:

```html
<link rel="stylesheet" href="../shared/topnav.css">
<script src="../shared/topnav.js"></script>
```

### Option B — side-by-side compare first

Rename in place and keep the old as a backup:

```sh
mv concepts/v1/shared/topnav.js   concepts/v1/shared/topnav.v1.js
mv concepts/v1/shared/topnav.css  concepts/v1/shared/topnav.v1.css
cp concepts/v1-topnav-v2/topnav.js  concepts/v1/shared/topnav.js
cp concepts/v1-topnav-v2/topnav.css concepts/v1/shared/topnav.css
```

Roll back by `mv`-ing the `.v1.*` copies back if needed.

## Labels

Canonical (match the new wizard):

- `Old-school OS` — XP Luna
- `Code repo` — README / Git Log
- `SaaS product` — ruth/systems

Setup button says `Setup`. Short, unambiguous, lowercase-friendly.

## Detection

Current experience is read from `window.location.pathname`:

- `/xp/` → XP is current
- `/readme/` → README is current
- `/saas/` → SaaS is current

Matches the production pathname structure under `v1/xp/`, `v1/readme/`,
`v1/saas/`. The preview page uses a one-off `?exp=` hack to override
`location.pathname` so every state is viewable without real navigation.

## Routing

Clicking a non-current tab calls `window.V1Transition.go(url)` if the
transition module is loaded (Three.js + cube-solver + transition-cube +
transition wrapper — same chain as v1). If the transition layer isn't
present it hard-navigates. No behaviour change from v1.

You can swap in the newer transition cube from `concepts/transition-cube-v2/`
by loading that script chain instead of `v1/shared/transition-cube.js` —
this nav is agnostic; it only cares that `window.V1Transition.go` exists.

## Accessibility

- `role="tablist"` / `role="tab"` / `aria-selected` / `aria-current="page"`.
- Focus-visible ring (soft blue halo).
- `prefers-reduced-motion: reduce` turns off the remaining transitions.
- Labels are plain text — no reliance on shape or colour.

## Dependencies

None. No frameworks. No build. CDN-free for the nav itself. The transition
cube (used on click) brings its own Three.js dependency via the existing v1
script chain.
