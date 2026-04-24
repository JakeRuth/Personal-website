# picker-wizard-v4

Iteration on picker-wizard-v3 with Jake's follow-up tweaks applied.

v3 (the mockup-preview picker) is the approved direction. v4 only touches two
things: step 1 gets more old-school-installer chrome, and step 2 gates Next
behind an explicit selection.

## How to run

Vanilla HTML/CSS/JS. No build step, no npm install.

- Open `index.html` directly via `file://`, or
- Serve the folder: `python3 -m http.server` and visit `http://localhost:8000/`.

Three.js is pulled from a CDN (`unpkg.com/three@0.160.0`).

## Flow

1. **Step 1 — Welcome** (`1 / 3`): Jake Ruth Setup title, 1-line subhead,
   1-line body. Next advances.
2. **Step 2 — Choose your experience** (`2 / 3`): three mockup-preview cards
   (Old-school OS / Code repo / SaaS product). Click selects. Next advances.
3. **Step 3 — Loading** (`3 / 3`): booting message, progress bar, redirect to
   the chosen experience (`../v1/xp/`, `../v1/readme/`, `../v1/saas/`).

## What changed from v3

### Step 1 — restored InstallShield chrome

v3's step 1 read "too simple." v4 keeps the same copy (word count unchanged)
but rewraps it in more of v2's installer flavor:

- **Thicker window frame** with a deeper bevel.
- **Deep-blue title bar** with the small square minimize / maximize / close
  buttons.
- **Thin menu bar** underneath (File / Edit / View / Help). Non-interactive,
  just chrome.
- **Side-banner on the left** of the welcome pane: dark-blue gradient, faint
  starfield, a geometric square-stack mark, and a small `setup.exe` stamp at
  the bottom. Gives the full "this is an installer from 2002" read.
- **Footer strip** gets a thin 1px divider above, flanking **dot-grid texture
  bars** around the step indicator pill, plus explicit Back / Next / Cancel
  buttons at installer-appropriate sizes.
- The pixel Rubik's cube from v2 is intentionally *not* brought back. The
  geometric square-stack mark replaces it — still three-faced, still hinting
  at the three experiences, but cleaner.

### Step 2 — Next button gating

v3 auto-committed on card click, which Jake didn't love. v4 separates select
from advance:

- **Single click** → card becomes "selected" (highlighted border, filled
  gradient background, small blue checkmark badge in the top-right corner).
  The Next button in the footer enables. Does **not** advance.
- **Clicking a different card** deselects the previous one and selects the
  new one. Still one at a time.
- **Next button click** advances to step 3.
- **Double-click a card** advances immediately (power-user shortcut).
- **Back button** (left side of footer) returns to step 1. Enabled on step 2.

### Keyboard on step 2

- `Arrow Left / Right / Up / Down` — move focus between cards. Does **not**
  select (Jake's rule: browsing and selecting are separate).
- `Enter` — selects the focused card AND advances.
- `Space` — selects the focused card but does not advance.
- `Backspace` — convenience: go back to step 1.
- `Escape` — open the Cancel dialog.

## What's carried over from v3 unchanged

- Ambient Three.js Rubik's cubes drifting on Lissajous curves at 22% opacity.
- The three CSS mockup cards (mini XP desktop, mini GitHub repo, mini SaaS
  dashboard).
- The step 3 loading screen (same copy, same ~1.5s dwell, same redirect).
- The Cancel confirmation dialog triggered by Cancel / X / Escape.
- Destination URLs: `../v1/xp/`, `../v1/readme/`, `../v1/saas/`.

## Files

- `index.html` — page shell, window chrome, cancel modal.
- `styles.css` — all wizard + mockup-card + step-0 side-banner styles.
- `wizard.js` — step state machine, selection gating, keyboard nav, redirect.
- `ambient.js` — Three.js background. Unchanged from v3.

## Accessibility notes

- Cards are `role="radio"` inside a `role="radiogroup"`, with `aria-checked`
  reflecting the selected state.
- The selected-state color change is paired with a visible checkmark badge
  so it doesn't lean on color alone.
- `prefers-reduced-motion` pauses the ambient cubes after a single frame.
