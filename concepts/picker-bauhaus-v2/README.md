# picker-bauhaus-v2

A tighter, postcard-grid iteration of `picker-bauhaus/`. Same Bauhaus vocabulary — red, blue, yellow, black, paper; Work Sans Black; 2px ink rules; geometric SVG previews; four-bar primary-color curtain wipe — but squeezed to fit a single viewport at 1280x720, 1440x900, and 1920x1080. No scroll, no `about` sixth tile, tighter type, smaller previews.

## What changed vs v1

- **Grid**: 3x2 becomes 5x1. Five cards, one row. No `ONE VOICE` sixth tile — Jake's tagline and email moved into the compact header/footer so nothing is lost.
- **Viewport fit**: body is `100dvh` with a `grid-template-rows: auto 1fr auto` layout. Header and footer are `auto`, the grid row takes the rest. `overflow: hidden` on the body guarantees no scroll.
- **Scaled units**: padding, gutters, display type, and SVG preview height are all `clamp()`d to viewport units so things breathe on 1080p and stay legible on 720p without media-query churn. A `@media (max-height: 760px)` pass shaves padding and type further on short screens.
- **Cards tighter**: padding dropped from 22px to `clamp(12px, 1.4vw, 18px)`; mode type from `clamp(36–68px)` to `clamp(22–38px)`; desc from 14.5px/28ch to 12.5px/22ch; previews capped at `clamp(72px, 11vh, 120px)`.
- **Header tighter**: JAKE / RUTH is now a single baseline row with 14px Bauhaus marks; kicker + tagline + sub fit in one column on the right. The hero went from magazine spread to masthead strip.
- **Curtain animation kept**: same four-bar red/blue/yellow/black wipe, but now plays on entry too (lift-off on first paint) and on exit (cover, then navigate). Honours `prefers-reduced-motion`.
- **Link targets updated** per the brief: `xp-luna-v2`, `vista-faithful-v3`, `enterprise-saas-v2`, `readme-git-fusion`, `readme-mode`.
- **Card 4 is new**: `readme-git-fusion` gets a combined preview (stacked page + commit graph) since v1's standalone git-log card is not in the v2 mode list.

## Viewport-fit approach

Three things do the work:

1. **`100dvh` single-screen layout** with a 3-row grid (`auto 1fr auto`). The middle row is the card strip; the browser can't create scroll because the body is `overflow: hidden`.
2. **`clamp()` everything**: pads, gaps, type sizes, and preview max-height scale with `vw`/`vh`. On 1920x1080 things feel generous; on 1280x720 they tuck down without any conditional branching for most values.
3. **Short-height safety pass**: `@media (max-height: 760px)` tightens the last few units that `clamp` alone would still leave too tall on 1280x720.

Checked mentally at each target:
- **1920x1080**: 5 columns ~376px each, previews ~118px, mode type ~38px. Comfortable.
- **1440x900**: ~280px columns, previews ~99px, mode type ~37px. Still postcard-ish.
- **1280x720**: short-height media query kicks in, pad-y drops to 10px, preview maxes at 76px, mode type ~28px. Snug but fits.

## If I had more time

- **Per-card accent on hover**: the card tint could shift to that card's dominant primary (red/blue/yellow). I kept the yellow wash from v1 for consistency, but a colour-per-card would feel more Bauhaus.
- **Reduced-motion review**: the entry curtain lift is nice but runs once. A static primary-color border flash could replace it for motion-sensitive users instead of being fully skipped.
- **Better keyboard affordance**: the `1`–`5` chip row in the footer could show the currently-selected index live, not just list the keys.
- **Numeric-inside-the-card hover**: when you hover a card, the `01` chip could flip to read `ENTER →` to reduce the two-step visual hierarchy.
- **Svg-level transitions on curtain lift**: stagger the previews in behind the bars so the reveal feels sequenced, not simultaneous.
- **Print/share tile**: a keyboard shortcut `0` or `R` to jump to the resume PDF directly would save a click for recruiters who just want the file.

## Run

Open `index.html` directly (`file://`) or serve with `python3 -m http.server` and visit the directory. No build, no deps — Work Sans + JetBrains Mono come from Google Fonts via CDN.

## Keyboard

- `1`–`5` select a card; second press (or `Enter`) enters it
- `←` `→` `↑` `↓` move the selection
- `Esc` clears selection
- `Cmd`/`Ctrl`-click opens a card in a new tab without the curtain animation
