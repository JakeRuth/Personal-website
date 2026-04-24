# Retro Hybrid 09 &mdash; Installer Wizard (Jake Ruth Setup)

The entire site is a classic InstallShield/NSIS setup wizard for
"installing Jake Ruth" (v13.0). The metaphor is the pitch: six steps,
banner graphics, gray body, Next/Back/Cancel bottom right.

## How to run

- Double-click `index.html` (opens over `file://`), **or**
- `python3 -m http.server` from this directory and visit
  <http://localhost:8000/>.

No build, no npm, no CDN libs. Plain HTML / CSS / JS. Tested modern
Chromium/Safari/Firefox. Mobile has a simple responsive fallback so the
joke still lands on small screens.

## Wizard flow

1. **Welcome** &mdash; Classic left-side splash with a pixel-style Rubik's
   cube where the Windows flag would go. Checkbox: "Show release notes
   after setup completes" (default on).
2. **License Agreement** &mdash; Jake's bio rendered as a SOFTWARE LICENSE
   AGREEMENT in 12 clauses (Stock Unlock, Oscar, Youni, CommerceHub, ACM,
   Rubik's cube, AI posture, pricing philosophy, warranty, termination,
   "next chapter," acceptance). Radio buttons; **Next** is disabled until
   "I accept" is selected.
3. **Choose Components** &mdash; Four tiers as checkable components with
   disk-space-remaining-style sizes:
   - Contract Engagement &mdash; 2 MB
   - **Full-Time Employment** &mdash; 13 GB (default)
   - Equity Founding &mdash; 500 MB
   - Starter Conversation &mdash; 128 KB
   Left pane is a component tree; right pane shows per-component detail.
   Footer row: "Space required" updates live; an **Include easter eggs**
   checkbox; and a **View Dependencies...** button that opens a
   sub-window.
4. **Preferred Role Location** &mdash; "Where would you like to install
   Jake?" Dropdown (NYC / Remote / Hybrid / Let's Talk) plus a free-text
   "custom destination" field. The Next button renames to **Install >**.
5. **Installing Jake...** &mdash; A blue progress bar animates over ~8
   seconds. The log cycles through Jake's career as DLL copies:
   `commercehub_fulltime.dll ...OK`,
   `oscar_health_senior_eng.dll ...OK`,
   `youni_startup.dll ...(couldn't register)`,
   `stock_unlock.exe ...OK`, plus
   `Registering Rubik's cube drivers (13.95s avg) ...OK` and
   `unicycle_cube_talent.dll ...OK`. Most lines carry a `// note`
   line-below in Jake's voice. **If easter eggs are enabled**, a tiny
   Rubik's cube widget appears in the upper-right and animates from
   scrambled toward solid yellow as install progresses.
6. **Setup Complete** &mdash; Splash. Checkbox "Launch Jake Ruth now"
   (default on). **Finish** opens a Release Notes modal (if that was
   selected in step 1) and transitions the window body into a
   "jakeruth.exe &mdash; Running" summary pane with the real pitch, a mailto
   CTA, and a resume download link.

## What's implemented

- All six steps, each with the right control set, the right banner, and
  functioning Back/Next/Cancel state logic (Next disabled on step 2
  until accept; disabled during install; becomes **Finish** on step 6).
- License agreement radio gating.
- Live "Space required" recalc as components toggle.
- Install progress: animated blue striped bar + scrolling log + per-line
  Jake-voice notes.
- **Easter eggs** checkbox drives the mini Rubik's cube widget on step
  5, which scrambles and then gradually resolves to a solved yellow face
  by the time install completes.
- **Dependency Viewer** sub-window (step 3 "View Dependencies...") with
  a tree list on the left and a canvas graph on the right. Hovering a
  tree node highlights its edges and shows a status-line description at
  the bottom, just like a real dep inspector.
- Cancel confirmation modal.
- Release notes modal (`jakeruth.exe v13.0`: changelog of career +
  posture, with tasteful `+` / `-` diff bullets).
- Faux desktop chrome: Win2k/XP-style taskbar behind the window with a
  Start button, tray "CUBE" module marker, and a live clock.
- Final "Launch Jake Ruth now" pane = the actual first-person pitch,
  email link (`jake@stockunlock.com`), and resume download
  (`../../official_resume.pdf`).
- Keyboard-friendly: all controls are real `<button>`/`<input>`
  elements; no blocking dialogs except the modals.
- Responsive fallback at <=560px so the window stays usable on phones.

## What's mocked

- Typography is "MS Sans Serif / Tahoma" via the CSS font stack; on
  systems without those, the browser falls back gracefully.
- The dep-graph node positions are hand-placed (not force-simulated),
  because the point is the aesthetic of a dependency viewer, not real
  graph layout.
- "Copying file" progress is simulated on an interval (~8 sec total).
  No actual files copy, obviously.
- The release-notes "+13 years of shipping" diff is editorial, not a
  git log.
- The `../../official_resume.pdf` link points to the resume file at the
  repo root; if opened by `file://` it will resolve, if served locally
  it will also resolve.

## If I had more time

- Real startup chime / install chime using the Web Audio API.
- Randomize the easter cube so it solves layer-by-layer (F2L, OLL, PLL)
  instead of just filling yellow.
- A hidden step 0 showing the "Extracting..." dialog with the ASCII
  progress bar and a briefly-lit "InstallShield Wizard" splash.
- A proper "Read Me" step between License and Components, with the
  pragmatic FAQ: interview style, comp expectations, notice period.
- A "Custom vs Typical vs Minimal" radio on step 3, like real setup
  wizards, that pre-selects components.
- A hidden Konami sequence on step 1 that unlocks the CommerceHub
  internship year as a selectable historical component in the tree.
- Better force-directed layout for the dependency viewer, with hit
  testing so you can hover nodes on the canvas directly.
- Cross-browser MS Sans Serif bitmap font embedded via `@font-face`
  (using an open-licensed equivalent like W95FA).
