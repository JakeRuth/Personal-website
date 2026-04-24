# Retro Hybrid 05 — Classic Mac OS 9 (1999)

Jake Ruth's personal website, reimagined as a Mac OS 9 Platinum desktop.

## Run

Either:

- Double-click `index.html` (opens via `file://`).
- Or from this directory: `python3 -m http.server` and visit `http://localhost:8000/`.

No build step. No npm. Vanilla HTML/CSS/JS with three.js from cdnjs.

## What's implemented

- **Platinum desktop** with radial-gradient desktop background, Jake HD, Read Me, and Trash icons (double-click to open).
- **Menu bar** — Apple menu, File, Edit, View, Special, Help. Clock and status icons on the right (Sherlock magnifying glass + stickered Rubik's cube). Dropdowns work; some items are live, some (like Cut/Copy/Paste) are dimmed on purpose.
- **Windows with striped title bars** (`repeating-linear-gradient` of 1px light/dark lines — the signature OS 9 drag-lines). Close / zoom / window-shade buttons. Windows are draggable, focus-raise on click, and close.
- **Finder window** ("Jake HD") — list view with Name / Date Modified / Size / Kind columns and double-clickable folders: About, Career, Stock Unlock, Projects, Hobbies, Contact.
- **HyperCard-style folder navigation** — double-clicking a folder opens a cream-lined-paper card. Back/forward arrows + `N / M` card counter. Each section has 2-4 cards.
- **Rubik's Cube Control Panel** — three.js 3x3 cube that rotates ambiently. Buttons to scramble / solve. **Scroll-to-solve** is wired two ways: scrolling the Finder grid or scrolling anywhere on the desktop (while no folder window is open) drives the cube from scrambled -> solved.
- **Sherlock 2** — Apple's old search app, rebranded. Canvas-rendered node graph of Jake's career, schools, tags, and hobbies. Click nodes to read connection counts. Pulse ring on the "Jake Ruth" node. Cosmetic channel tabs (Internet / People / Shopping / News).
- **About This Jake** dialog — rainbow-Apple-wordmark style, System Profiler-flavored stat sheet ("Built-in Memory: ~13 years", "Virtual Memory: Stock Unlock (YC W22)", etc).
- **Shut Down** — Special menu > Shut Down shows a classic OS 9 confirm dialog, then the black "It is now safe to turn off your Jake" screen. Restart reloads.
- **Content** reflects Jake's story: Stock Unlock (YC W22, $1.335M seed, 8 employees, thousands of customers, profitable side business, not full-time as of April 2026), Oscar / Youni / CommerceHub, SUNY Albany ACM president, 13.95s Rubik's avg, unicycle-cube talent show, getting married, `jake@stockunlock.com`.

## Mocked / not real

- The Apple menu's "Recent Items", "Chooser", "Key Caps" are dimmed placeholders.
- Edit menu entries (Undo/Cut/Copy/Paste) and File > Open / Print are dimmed — for flavor, not functionality.
- View menu's icon / list / button view switcher only changes menu state, not the Finder layout.
- Sherlock channel tabs are cosmetic (all channels show the same node graph).
- Window-shade (yellow) and zoom (green) title-bar buttons are visual — they hover and press but don't animate collapse/zoom.
- Trash always reports empty.

## If I had more time

- Animate the window-shade button rolling up the window body.
- Real draggable desktop icons with snap-to-grid.
- Actual Chicago or ChiKareGo webfont (currently falls back to IBM Plex Sans with letter-spacing).
- More cubie-level accurate Rubik's solve animation (layer-turn moves instead of interpolating scrambled rotations).
- Control Panels submenu with more than just the cube — e.g. Appearance (theme switcher), Date & Time, Monitors.
- Sherlock with a real search mechanic that filters the graph.
- A startup chime sound on load (OS 9's was iconic).
- Balloon Help cursor that shows speech-balloon tooltips over UI elements.

## Interactions — quick list

- Double-click **Jake HD** to open the Finder.
- Double-click any folder in the Finder to open its HyperCard.
- Arrow buttons at the bottom of a HyperCard to navigate cards.
- **Scroll** the Finder (or the desktop when no folder open) to solve the cube.
- Click the **Rubik's cube status icon** in the menu bar to open the cube Control Panel.
- Click the **magnifying-glass icon** (or Apple > Sherlock 2) to open the node graph.
- **Apple menu > About This Jake** for the splash card.
- **Special > Shut Down** for the full OS 9 shutdown experience.
