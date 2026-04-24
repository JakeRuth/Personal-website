# picker-wizard-v3-typographic

Parallel variant of `picker-wizard-v3`. Same 3-step structure. Different step-2
aesthetic: **pure typography + color** instead of mockup thumbnails.

## Run

```
python3 -m http.server
# then open http://localhost:8000/concepts/picker-wizard-v3-typographic/
```

Also works via `file://`. No build, no npm. Three.js loads from CDN for the
ambient cubes; if it fails to fetch, the wizard still runs.

## What's different from picker-wizard-v3

`picker-wizard-v3` is the "mockup-thumbnail" variant of the simplified wizard.
This one strips the thumbnails entirely. Step 2 becomes three typographic
cards that evoke each experience through font, color, and a single small
decorative element.

### Same across both variants

- 3 steps total: **Welcome &rarr; Choose &rarr; Loading &rarr; redirect**. No separate
  confirm step; clicking a card on step 2 launches immediately.
- Same destinations: `../v1/xp/`, `../v1/readme/`, `../v1/saas/`.
- Same ambient background: Three.js Rubik's cubes drifting on Lissajous
  curves at ~22% opacity.
- Same InstallShield-style window chrome, refined.
- Same cancel-confirmation dialog on close.
- Same keyboard nav (arrows to move on step 2, Enter to launch, Esc to cancel,
  Backspace to go back).
- Same loading copy: *"Three interpretations of the same person. Bounce between
  them anytime from the top nav."*
- Same ~1.5s loading dwell.

### Different in this variant

Step 2's three cards. No screenshots, no thumbnails, no tiny chrome sketches.
Each card is mostly whitespace carrying one giant piece of typography, one
piece of color, and one small decorative element.

| Card | Label font | Accent | Decoration |
|---|---|---|---|
| **OLD-SCHOOL OS** | VT323 (pixel) | Warm teal `#008080` | Chunky pixel window SVG |
| **code repo** | JetBrains Mono, lowercase, blinking cursor block | Cool green `#6fdc8c` | Monospace bracket pair `{ }` |
| **SaaS Product** | Inter Tight 800, proper case | Cool blue `#64d8ff` on deep navy hover | Up-and-to-the-right sparkline SVG |

Hover or keyboard-focus: the card lifts, the accent color fills the background,
and the decoration pops. Click or Enter: launch.

## Voice check

Every line of copy was run through `_shared/VOICE.md`:

- No "passionate," "excited," "innovative," "synergy."
- Short sentences in hero spots, longer in body.
- Stock Unlock framing rule: not applicable here — no SU copy on the picker
  itself. (The destination experiences handle it.)
- Pricing rule: no dollar numbers anywhere in the wizard.
- Welcome copy states what will happen plainly: *"Pick the flow you want.
  Same voice, different chrome. Takes about two seconds to load."*

## Files

```
picker-wizard-v3-typographic/
  index.html     # Shell + font imports + wizard window
  wizard.js      # 3-step state machine + typographic card renderers
  ambient.js     # Three.js Rubik's cubes (carried over from v2 verbatim)
  styles.css     # Window chrome + typographic card system
  README.md      # This file
```
