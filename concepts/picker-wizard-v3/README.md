# picker-wizard-v3

Third pass on the entry-point picker for jakeruth.com. Simplified to three
steps, mockup-thumbnail experience cards, and a dedicated loading screen.

## Run

Vanilla HTML/CSS/JS. No build step. Three.js loaded from unpkg.

- Open `index.html` directly in a browser (`file://`), or
- `python3 -m http.server` and visit `http://localhost:8000/`.

If Three.js fails to load, the ambient background drops out silently and
the wizard still works.

## The flow

Three steps, state-based (no separate pages):

1. **Welcome.** Title, one subhead ("Takes about two seconds. Pick your
   flow through."), one body line ("All three ship the same Jake. Just
   different chrome."), Next button. Step indicator: `1 / 3`.
2. **Choose experience.** Three horizontal cards, each a tiny mockup of
   the destination experience plus a label and one-line description.
   Clicking a card is the commit — there is no separate Confirm step.
   Step indicator: `2 / 3`.
3. **Loading.** "Booting your Jake Ruth experience…" with a three-dot
   pulse spinner, the "three interpretations of the same person" message,
   and a progress bar that fills in ~1.5 seconds. Then
   `window.location.href` to the picked experience. Step indicator: `3 / 3`.

## What changed vs v2

Jake's direction was "simplify." Specifically:

- **Dropped the Confirm step.** v2 was Welcome → Choose → Confirm →
  Launching. v3 is Welcome → Choose → Loading. Clicking a card on step 2
  goes straight to step 3. One fewer click, no recap of what you just
  picked.
- **Killed the pixel Rubik's cube on step 1.** Replaced with a simple
  geometric mark — three overlapping semi-transparent squares, nodding
  at the three modes without being a literal cube. The only cubes left
  are the Three.js ambient ones drifting behind everything, which stay.
- **Simpler welcome copy.** Dropped the "fewer than three minutes / disk
  space / Click Next to continue or Cancel to exit Setup" installer
  boilerplate. Now: one subhead, one body line. The subhead does the
  setup-is-fast job ("Takes about two seconds") and makes the picking
  job obvious ("Pick your flow through").
- **Dropped Advanced options.** v2 had Cube/Audio/Dark/CRT/Reduced
  motion/Konami toggles. Not in the simplify brief; removed.
- **Five modes → three modes.** v2 shipped five experiences (XP Luna,
  Vista, SaaS, README/Git-Log, README). v3 ships the three that map to
  the integrated v1 site: Old-school OS, Code repo, SaaS product. Each
  lands at `../v1/xp/`, `../v1/readme/`, `../v1/saas/` respectively.
- **Mockup-thumbnail cards.** v2 had a radio list on the left and a
  single preview pane on the right. v3 lays the three options out as
  horizontal cards, each carrying its own mini-preview. The card *is*
  the preview. See next section.
- **Bigger window.** 760×520 (up from 700×500). The three cards need
  room to breathe; the welcome splash now has space to be quiet.
- **Back and Next simplified.** No Back button at all — the wizard is
  three steps with clear progression. Step 1 has a Next button; step 2
  has no Next (card click commits); step 3 has neither (it's automatic).
  Cancel and the title-bar X are always available.
- **Loading screen redesign.** v2's Launching step was a log-spam
  progress bar with "svc/setup → ready" / "mount /career → ok" lines.
  v3 is a single centered stack: three-dot pulse spinner, heading,
  message, thin progress bar, destination path. Tasteful, not busy.

## What carried over unchanged

- **Ambient Three.js Rubik's cubes.** Nine cubes, lissajous drift,
  ~22% opacity, reduced-motion honored. `ambient.js` is verbatim from
  v2. Jake said "Leave the background the same. I actually like that."
- **InstallShield-ish window chrome.** Same titlebar gradient, same
  border bevels, same button style — just on a slightly larger window.
- **Cancel modal.** Same "Cancel Jake Ruth Setup?" dialog, same warning
  icon, same jake@stockunlock.com link.
- **Keyboard nav.** Arrow keys traverse cards on step 2, Enter commits.
  Escape opens the cancel dialog.

## How the mockup cards are rendered

Each card is a button containing a positioned mockup div. The mockups
are pure HTML+CSS — no images, no iframes, no canvas.

- **Old-school OS** (`.mockup-xp`): teal-to-green desktop gradient, a
  single gray My-Computer-ish icon in the top-left, a small window with
  a blue gradient titlebar and three list-row placeholders, and a blue
  taskbar across the bottom with the classic green Start button pill
  (italic text, rounded-right cap, dark green gradient).
- **Code repo** (`.mockup-repo`): GitHub-dark header bar at the top with
  a repo-name pill on the left and a green clone button on the right.
  Below it, a two-column split: left is a faint file tree with indented
  files, right is a commit log — five commits, each with a green or
  purple dot on a vertical branch line plus a gray commit-message bar.
- **SaaS product** (`.mockup-saas`): white-to-paper background, a nav
  row with a purple-to-cyan logo bar and three nav-item pills, a KPI
  card with a bold number bar and an inline SVG sparkline, and a
  three-column pricing grid with the middle tier highlighted in the
  brand purple. No dollar figures — per VOICE.md pricing rule.

The cards hover-lift slightly and get a dotted-XP-style focus ring when
keyboard-focused (arrow keys). Click or Enter commits to that
experience.

## Files

- `index.html` — wizard shell, canvas, modal, Three.js CDN script tag
- `styles.css` — window chrome, welcome, picker cards, mockups,
  loading screen, mobile rules
- `wizard.js` — three-step state machine, card selection, loading
  animation, redirect
- `ambient.js` — Three.js scene, cubes, tracks, animation loop,
  reduced-motion handling (carried over from v2 verbatim)

## Voice

Per VOICE.md. No "passionate," no "leverage," no dollar figures, no
"excited to offer." Jake register on each surface:

- Welcome: "Takes about two seconds. Pick your flow through." /
  "All three ship the same Jake. Just different chrome."
- Cards: "Teal desktop, green Start button, windows that snap." /
  "README on the right, commit log running down the side." /
  "Marketing site chrome. Sparklines, pricing grid, the works."
- Loading: "Booting your Jake Ruth experience…" / "Three
  interpretations of the same person. Bounce between them anytime
  from the top nav."

## If I had more time

- **Animated mockup details.** The commit dots could scroll, the SaaS
  sparkline could draw itself, the XP start button could blink. Not
  necessary for a 2-second stop.
- **Card-to-destination transition.** When a card is clicked, briefly
  expand its mockup before cutting to the loading screen, so the
  viewer feels the click land on the thing they picked.
- **Return-visitor shortcut.** Skip straight to loading if a choice is
  already in `localStorage`; wizard acts as reconfigure.
- **Per-card hover preview.** Hover holds a card; a few seconds later
  a slightly richer preview reveals (desktop icons appear, a file opens
  in the repo, pricing tier reveals "Contact" instead of a price).
