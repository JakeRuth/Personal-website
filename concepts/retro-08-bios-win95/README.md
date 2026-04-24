# Retro-08 — BIOS → Windows 95 (layered boot)

A layered retro experience for Jake Ruth's personal site: the page opens with
an amber-phosphor **BIOS POST**, fades into a **Windows 95 splash**, and drops
you onto a fully interactive **Win95 desktop** where the site's content lives
in draggable windows.

Signal to the reader: the person behind this site knows what's under the hood.

## Run it

Zero build. Zero npm. Either:

- Open `index.html` directly (file://), **or**
- `python3 -m http.server 8000` from this folder and browse to
  [http://localhost:8000/](http://localhost:8000/)

CDN dependencies: Google Fonts (VT323 + IBM Plex Mono), and Three.js via
`unpkg` (loaded as an ES module import-map, `three@0.160.0`). Everything else
is vanilla HTML/CSS/JS.

## What's implemented

### Act 1 — BIOS boot (~4–5 s)
- Award-style POST, amber text on black with CRT scanlines + vignette.
- Typed-in lines (no naive `typewriter` — each line appends with its own
  delay so timing is authentic).
- `JAKE-RUTH-SSD-13YR`, PCI listing that repurposes Jake's employers as
  PCI devices (CommerceHub, Oscar, Youni, ACM-SUNY), memory test with
  `[OK]` callouts, and a classic "Starting Microsoft Windows 95 ..." closer.

### Act 2 — Windows 95 splash (~2 s)
- CSS-only clouds sky (layered radial gradients).
- Skewed 4-quadrant flag, "Microsoft Windows 95" wordmark, animated loading
  bar, and the 1981–2026 Jake Ruth Corp copyright footer.

### Act 3 — Win95 desktop
- Teal desktop (#008080), classic Win95 chrome everywhere (beveled edges,
  `#c0c0c0` gray, dark-blue title bars, MS Sans / Tahoma, hard pixel edges).
- **Desktop icons:** My Computer, Network Neighborhood, Recycle Bin,
  `Cube.exe`, `README.txt`, `Resume.doc`, `Contact.hlp`, `Stock Unlock.lnk`.
  All 8 are double-clickable and open their respective windows.
- **Draggable, focusable windows** with min / max / close buttons, taskbar
  pills, z-index stacking, active / inactive title bars, and a status bar.
- **Start button + Start menu:** Programs (submenu), Documents, Settings,
  Find, Help, Run…, Shut Down… — all wired to either content windows or
  joke dialogs in-character for Jake.
- **System tray** with a live clock.
- **Rubik's cube** (`Cube.exe`): real 3D cube rendered with Three.js,
  correct sticker colors, ambient-solves with random face turns on a loop
  while gently orbiting. Opens inside a 340×340 Win95 window.
- **Network Neighborhood**: Explorer-style split view with a tree of Jake's
  career + community + project nodes, click any leaf for a detail card.
- **My Computer**: drive list that acts as another entry point to the
  resume / README / Stock Unlock content.
- **Recycle Bin**: humorously holds things Jake no longer does
  (daily status emails, overpriced-saas.csv, 11pm-slack-ping.log…).
- **Run… dialog**: understands `mailto:`, `cube`, `readme`, `resume`,
  `network`, `stock`, `shutdown` — anything else opens a mailto to
  `jake@stockunlock.com`.
- **Shut Down dialog**: reframed as "close this chapter" with options like
  "Ship the next thing" / "Restart (new company)" / "Stand by (contract
  work)". "Yes" opens `Contact.hlp`.

### Content — in Jake's one voice
- `README.txt`: bio, 13-year coding history, Stock Unlock framing
  ("built it, scaled to 8 + thousands, profitable side business, not
  full-time, next chapter"), cube + unicycle, getting married.
- `Resume.doc`: WordPad-styled resume with Stock Unlock, Oscar (2017–2021),
  Youni (2015–16), CommerceHub (2013–2016), SUNY Albany ACM.
- `Contact.hlp`: Windows-Help-styled contact sheet, `jake@stockunlock.com`,
  a line about preferring "I'm building X" to "coffee sometime?".
- `Stock Unlock.lnk` Properties dialog with the stat row
  `YC W22 / $1.335M / 8 / 1000s`.

## Skip-boot mechanism

- Press **any key** or **click** anywhere while the BIOS is running → jumps
  straight to a short (~0.6 s) splash and then the desktop.
- Clicking during the splash cuts to the desktop immediately.
- The boot is designed as a one-time delight, not a toll booth: total
  max is ~7 s, minimum is ~1 s if you skip.
- The Start menu's `Help` item explains this for users who didn't realize
  they could skip.

## Mocked / lightweight

- Pixel-art desktop icons are CSS-gradient art rather than real bitmaps —
  they read correctly at desktop scale but aren't pixel-perfect on all
  zoom levels.
- Start menu has one level of submenu (Programs). `Documents`, `Settings`,
  `Find`, `Help` go directly to their own windows rather than cascading.
- Window `Minimize` hides to the taskbar but doesn't animate.
- Window `Maximize` snaps full-desktop; no actual restore-to-previous-rect
  logic (click Max again to un-max).
- Sound is intentionally absent — no Win95 startup chord (would require
  hosted audio; also autoplay rules are hostile).
- Cube is ambient-solving (random scrambles on loop). It doesn't actually
  implement a solver — it turns faces forever.

## If I had more time…

- Real bitmap icons, pixel-matched to Win95 16×16 and 32×32 sprites.
- Actual Kociemba-style solver so `Cube.exe` scrambles and *then* solves,
  paced to the user's scroll position in other windows.
- Sound: the chord on splash completion, menu clicks, a single `tick` on
  window open, all gated behind a one-time user gesture.
- `Minesweeper.exe` and `Solitaire.exe` as playable easter eggs.
- A real IE3-style browser window that loads Stock Unlock via iframe.
- Context menus (right-click desktop → New > Shortcut, right-click icon →
  Properties with Jake lore).
- BSOD easter egg via the Shut Down dialog's "Close all programs" option.
- Persist "boot seen" in localStorage so returning visitors skip straight
  to the desktop (currently every visit replays the BIOS unless skipped).

## Files

- `index.html` — stage containers + templates.
- `styles.css` — all three acts, Win95 chrome, icons, windows, menus.
- `app.js` — BIOS playback, stage transitions, windowing system, start
  menu, taskbar, content registry, per-window interactions.
- `cube.js` — Three.js ambient-solving Rubik's cube (ES module).
