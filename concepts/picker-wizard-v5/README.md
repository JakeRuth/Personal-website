# picker-wizard-v5

Iteration on picker-wizard-v4 with Jake's note applied: the dark-blue
side-banner on step 1 now reads like a classic InstallShield disc,
combining "What's in the box" and "System requirements" into one static
column. Two extra variants ship alongside so Jake can compare live.

v4's installer chrome, Next-gated picker, loading screen, ambient cubes,
cancel dialog, destination URLs — all unchanged.

## How to run

Vanilla HTML/CSS/JS. No build step, no npm install.

- Open `index.html` directly via `file://`, or
- Serve the folder: `python3 -m http.server` and visit `http://localhost:8000/`.

Three.js is pulled from a CDN (`unpkg.com/three@0.160.0`).

## Side-banner variants

Three options live in the same build. Switch between them with the small
`A  B  C` toggle at the bottom of the wizard (visible on step 1 only) or
by pressing `v` on the keyboard to cycle. Crossfade is 150ms.

### Variant A — Combined "What's in the box" + "System requirements" (default, recommended)

Classic InstallShield read, all static text, white on dark blue with a
yellow-cream accent (`#F2D16B`) for section headings. Monospace for the
bullet content, Segoe UI for the wordmark and headings.

Content (drawn from `content.json`, checked against `VOICE.md`):

```
JAKE RUTH v13.0

What's in the box
  13 years shipping
  1 YC-backed company (W22)
  1 Rubik's cube (13.95s avg)
  8 former employees
  0 tolerance for bad software

System requirements
  A team that ships
  8GB intellectual curiosity
  Git installed
  Tolerance for directness
  Rec: a hard problem

setup.exe
```

Every line is a real fact from `content.json`. "8 former employees" is
the Stock Unlock framing rule doing its job (scaled to 8, not full-time
now). "1 Rubik's cube (13.95s avg)" is the real average from the hobbies
block. The "System requirements" lines are a joke about the kind of team
Jake wants (from the `values.wants` block), framed in installer voice.

**Why this is the recommended default:** it executes Jake's direction
literally and leans on his real numbers, which VOICE.md rewards. The
side-banner does the talking so the main content column stays short.

### Variant B — Same content as A, with ambient animation

Identical copy to A plus two subtle effects:

- A thin looping progress bar pinned above `setup.exe` with a
  "preparing..." label whose trailing dots cycle every 420ms. Classic
  installer trope — implies something is happening in the background.
- A very faint scanline overlay across the whole banner (3% opacity).
  Reads as "old CRT" without distracting from the text.

No typewriter effect. The requirement was ambient, not attention-
grabbing — a type-in would undercut the static read the InstallShield
aesthetic is built on.

`prefers-reduced-motion` kills all three effects (bar shimmer, dots, scan).

### Variant C — Minimal vertical wordmark (contrast option)

For comparison if A reads "too busy." Letter-by-letter stack of
`JAKE / RUTH / SETUP` centered vertically with thin separator rules
between words. Tiny `v13.0.0` pinned to the bottom. No bullet content,
lots of quiet empty space. Still dark-blue gradient + starfield.

## Toggle mechanism

- Small row of buttons labeled `A  B  C` sits just below the wizard
  chrome, centered, step 1 only. Current selection is highlighted with
  the installer deep-blue (`#0A246A`).
- Keyboard: `v` cycles A → B → C → A.
- Clicking a button or pressing `v` triggers a 150ms crossfade — all
  three variants are rendered at once and toggled via opacity, so the
  swap is instant and doesn't reflow the layout.
- The toggle is meta / demo-only. Once Jake picks a winner we bake that
  variant in and drop the toggle.

## What's unchanged from v4

- Window chrome (title bar, menu bar, footer with step indicator +
  Back/Next/Cancel).
- Step 2 — the three mockup-preview cards, Next-button gating,
  double-click shortcut, arrow-key browsing, Enter-to-pick-and-advance.
- Step 3 — booting message, progress bar, 1.5s dwell, redirect.
- Ambient Three.js drifting Rubik's cubes at 22% opacity.
- Cancel confirmation dialog (Cancel button / X / Escape).
- Destination URLs (`../v1/xp/`, `../v1/readme/`, `../v1/saas/`).

## Files

- `index.html` — page shell, window chrome, variant toggle, cancel modal.
- `styles.css` — all wizard styles + three side-banner variants.
- `wizard.js` — step state machine, variant state machine, keyboard nav.
- `ambient.js` — Three.js background. Unchanged from v4.

## Accessibility notes

- Side-banner decorative content is `aria-hidden="true"`. Screen readers
  hear the welcome copy on the right, not the installer-flavored bullets.
- Variant toggle buttons carry `aria-pressed` reflecting the current
  variant, with `title` attributes describing each.
- `prefers-reduced-motion` pauses the ambient cubes and Variant B's
  progress bar, scanlines, and dots.
- Variant labels (`A`, `B`, `C`) are supplemented by `title` tooltips so
  the meaning isn't carried by a single letter alone.

## On the "picture of Jake" note

Jake's brief mentioned he likes the idea of a picture, possibly animated,
but didn't want to go hunting for one. None of the three variants drop
in an image yet — the placeholder slot is the top of the side-banner
where the JAKE RUTH wordmark sits. When Jake has a photo (or wants an
animated stylization), swap the wordmark block with an `<img>` or canvas
and Variant A's vertical rhythm still holds.
