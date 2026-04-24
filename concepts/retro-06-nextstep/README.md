# Retro 06 — NeXTSTEP / Early Aqua Chrome

Steve Jobs's post-Apple OS (1989). Black, chrome, rectangular, Helvetica. The most design-credible, most obscure retro option.

## How to run

```bash
# Either:
open index.html

# Or:
python3 -m http.server 8000
# then visit http://localhost:8000
```

No build step. Three.js is pulled from a CDN for the cube.

## What's implemented

- **Black workspace** with a subtle vignette, Helvetica throughout, chrome-gradient accents.
- **Workspace menu** top-left (NeXTSTEP's floating menu convention) with Info / File / Disk / View / Tools / Windows / Print / Hide / Quit. Click "Info" for the About window. Click "Quit" for a small joke.
- **Chrome clock** top-right (date + amber time readout).
- **Vertical dock on the right edge** with seven app icons: NeXT logo, Rubik's Cube, Mail, Career, Stock Unlock, Contact, Resume, Digital Librarian. Each icon is a 64px chrome-beveled square with a minimalist glyph.
- **File Viewer window** with a 3-column NeXT browser:
  - Left column: About, Career, Projects, Stock Unlock, Hobbies, Contact.
  - Middle column: children of the selected folder.
  - Right column: grandchildren (for folders that nest).
  - Selecting a leaf opens the **Inspector** window with that content.
  - Titlebar, pathbar (`/Users/jake/...`), statusbar (`N items · NFS: localhost:/jake`), classic NeXT amber selection highlight (`#E5B700`).
- **Inspector window** renders the SaaS-parody content in the severe NeXT design language: Helvetica at 11-13px, key/value grids, amber pull-quotes, chrome dividers, meta-tags, uppercase small-caps section headers.
- **Rubik's Cube window** — Three.js 3x3x3 cube that ambient-solves itself. A random layer-turn is scheduled every ~2.5 seconds. The cube rotates slowly on its own axis. Below the canvas: PB / Ao12 / method / stunt readout.
- **Digital Librarian** (NeXT's real-world "Librarian" app repurposed) — an SVG radial graph with three concentric rings (core / companies & principles / curiosities), chrome-dashed rings, amber/chrome nodes. Click any node → right pane shows its detail. Center node is "Jake Ruth"; outer rings cover Stock Unlock, Oscar, Youni, CommerceHub, SUNY, founder/engineer identity, pricing ethics, driver philosophy, cube, unicycle, etc.
- **Mail compose window** — NeXT-style inset fields with a "Deliver" / "Cancel" pair of chrome buttons.
- **Resume preview** — a NeXT "Preview" window containing a pseudo-PostScript-styled resume page (light page on dark window).
- **Draggable windows** with chrome titlebars, close buttons (pressable), resize-corner indicators. Z-order handled on mousedown.
- **Dock routing**: clicking Career / Stock Unlock / Contact on the dock jumps the File Viewer's left column to the matching folder. Cube / Mail / Resume / Librarian open their own apps.

## Interactions

- Click a left-column folder → middle column populates.
- Click a middle-column item → right column populates (if folder) or Inspector opens (if leaf).
- Click any dock icon → opens its app/window or jumps the File Viewer.
- Drag any titlebar to move a window. Click the close box to dismiss.
- Click a node in Digital Librarian → detail panel updates.
- Click "Info" in the top-left menu → About NEXTSTEP.

## What's mocked

- The menu bar items other than Info / Quit are decorative (no cascading submenus).
- Resize-corner is decorative only — windows don't resize.
- The cube's "solve" is ambient visual, not a true CFOP reconstruction — it does random layer turns with proper per-cubie world-axis rotation, so it looks legitimate, but it isn't actually converging toward a solved state.
- Social links are placeholders.
- NFS status line (`localhost:/jake`) is pure flavor.

## If I had more time

- Real cascading submenus on the Workspace menu, NeXT-style.
- Shelf at the top of the File Viewer for dragged-in items.
- A working "Find" panel (NeXT's `Find.app` style) that greps the tree.
- Actual resize + a minimize-to-dock animation.
- Cube that's a real scramble → solve reconstruction with WCA notation scrolling past on a sidebar.
- `.app` bundle inspector view when you select an app in the file browser.
- Boot splash: the "Welcome to NeXTSTEP" screen before the workspace loads.
- Keyboard shortcuts bound to the menu items (`⌘h` hide, etc.).
- Webkit scrollbar polish is good in Chrome/Safari; Firefox falls back. Would ship a proper custom scroll renderer for cross-browser chrome.

## Files

- `index.html` — layout, windows, dock.
- `styles.css` — all the chrome.
- `app.js` — window management, column browser, dock routing, graph renderer, Three.js cube.
- `data.js` — content tree + graph data.
