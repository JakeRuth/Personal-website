# Retro Hybrid 04 — Jake Ruth Enterprise Suite '98

Windows 98 aesthetic as an ironic SaaS-parody vehicle. The joke: pitching 2026
Jake dressed as 1998 enterprise shareware. The more authentic the chrome, the
harder the contrast lands.

## Run it

Vanilla HTML/CSS/JS. Zero build. Open directly:

```
open index.html
```

…or serve it:

```
python3 -m http.server 8000
# then visit http://localhost:8000/concepts/retro-04-win98-enterprise/
```

CDN dependency: [`98.css`](https://jdan.github.io/98.css/) is linked for a
baseline of bevel primitives, but the vast majority of the chrome is custom CSS
tuned to match the spec (`#C0C0C0` buttons, `#000080` title, `#008080` desktop,
hard bevels, no anti-aliasing, `image-rendering: pixelated`).

## What's implemented

- **Splash screen**: black boot screen with Ruth Software Corp. logo square,
  fake progress bar with striped "copying files" styling, rotating status lines
  ("Copying MSVBVM60.DLL…", "Registering OLE controls…", etc.) Auto-advances
  into the desktop and opens the main app + EULA.
- **EULA modal**: real 98-style dialog with radio buttons, Back / Next / Cancel
  buttons, "By clicking I Agree you consent to be amazed…" copy.
- **Desktop**: teal background, 8 pixel-art icons (My Computer, Network
  Neighborhood, Recycle Bin, Jake Ruth '98.exe, README.TXT, Plus! 98 Pack,
  Phone.exe, Resume.doc). Single-click selects, double-click opens.
- **Taskbar**: gray beveled Start button with Windows flag, quick-launch
  (Show Desktop, IE, Jake Ruth), open-window pill buttons, system tray with
  live clock (12-hour + AM/PM).
- **Start menu**: real side-rail with vertical "Jake Ruth Suite '98" wordmark,
  program list, separators, and a "Shut Down…" item that opens a proper 98
  shutdown dialog with "Hire Jake / Introduce Jake / Restart in MS-DOS / Stand
  by" options.
- **Window manager**: draggable title bars, minimize/maximize/close, clamp
  to viewport, z-ordering via click, per-window position memory across
  open/close, minimized-via-taskbar behavior, active-window highlight with
  `#000080 → #1084d0` classic gradient.
- **Jake Ruth '98.exe** (main app): menu bar (File / Edit / View / Hire /
  Help), toolbar with beveled buttons for each Edition, Explorer-style address
  bar showing `C:\Jake\Suite98\Editions\…`, left Outlook-bar nav, content
  pane with:
    - **Home Edition** — contract work (ship-first senior IC)
    - **Professional Edition** — full-time senior (Oscar, Youni, CH, ACM)
    - **Enterprise Edition** — founding/equity (Stock Unlock framing verbatim)
    - **About Jake** — the short version + "Also True" quirks
    - **Receipts** — dot-matrix printout with real numbers
    - **EULA** — Times New Roman legalese + email CTA
  - Classic bottom status bar with 4 cells.
- **Network Neighborhood**: Explorer tree with `\\RUTHNET` workgroup and 8
  UNC-named computers (`\\STOCK-UNLOCK`, `\\YC-W22`, `\\OSCAR-HEALTH`,
  `\\YOUNI`, `\\COMMERCEHUB`, `\\ACM-SUNY-ALB`, `\\CUBE-WCA`,
  `\\HOME-NETWORK`). Clicking a node fakes a connect + shows detail.
- **My Computer**: icon grid for drives (Jake Ruth (C:), Plus! 98 (D:),
  Resume (A:) floppy, Documents, Network, Recycle Bin) — each routes to the
  relevant window.
- **Recycle Bin**: discarded things Jake doesn't do (overpriced SaaS pitch,
  prompt-engineering gurus, six-month quarterly roadmap, etc.).
- **README.TXT**: opens in Notepad-style window with monospace fixed-height
  textarea.
- **Plus! 98 Pack**: 3 add-ons — 3D Cube Screensaver, Unicycle Demo, Desktop
  Themes.
- **3D Rubik's Cube**: proper CSS 3D cube with 54 stickers, rendered against
  a black Windows-screensaver backdrop. **Scroll over the cube to solve it**
  (progress % + cube rotation), idle-autospin when unattended. Stats panel
  shows 13.95s best-avg.
- **Desktop Themes**: one-click swap between Teal (default), Hot Dog Stand
  (purple), The Golden Era (green), and Blue Screen (`#0000AA`).
- **Phone.exe** (hire CTA): "Dial-Up Networking" form with pre-filled
  `jake@stockunlock.com`, Connect button is a real `mailto:` with a prefilled
  subject line, plus a fake modem-log terminal.
- **Resume.doc**: opens inside a "Microsoft Word" window rendered in Times
  New Roman with navy headings.
- **Shut Down dialog**: real 98 visual, triggers a `mailto:` on OK.

## Interactions

- **Double-click** any desktop icon to open its window.
- **Click Start** (keyboard-friendly bevels and activation states) to open the
  vertical-wordmark Start menu.
- **Drag** windows by their title bar.
- **Minimize / Maximize / Close** all work; minimized windows live in the
  taskbar, clicking their pill toggles them.
- **Click an Edition** in the Jake Ruth app (toolbar or Outlook bar) to switch
  content + update the address bar + update the status bar.
- **Click a \\COMPUTER** in Network Neighborhood to "connect" and read its
  details.
- **Scroll inside the 3D Cube** to scramble/solve; it spins and the solve
  progress ticks up.
- **Pick a Desktop Theme** to recolor the desktop background live.
- **Click Connect in Phone.exe** or any "Contact Jake" button to fire a
  `mailto:jake@stockunlock.com`.
- **Shut Down → Hire Jake → OK** also opens `mailto:`.

## Voice / concept notes

- Content is written sincerely — the comedy comes from serious 2026 SaaS
  copy wrapped in 1998 chrome (Editions, EULA, dot-matrix receipts).
- Stock Unlock is framed exactly per spec: "built, scaled to 8 + thousands,
  profitable side business, not full-time, next chapter."
- "Driver in the driver's seat" and the anti-"shit software at high prices"
  posture appear in the Enterprise Edition + EULA.
- Rubik's cube and unicycle both appear as Plus! 98 pack-ins, exactly in
  line with the brief.

## Mocks / known limits

- No real audio (a Windows 98 startup chime would slap but requires an asset;
  held off to keep it to zero-asset vanilla).
- EULA scroll pane shows a placeholder for pages 2–14 instead of generating
  real filler legalese.
- The 3D cube is visual/interactive — it does not model actual cube state or
  legal moves. "Solving" is a visual progress metaphor, not a simulator.
- Start menu submenus (Documents ▶, Settings ▶, Plus! ▶) are marked with
  arrows but do not expand into a second-level panel; clicking them opens
  the anchor item directly.
- No resize handles on windows (drag to move + maximize toggle only).

## If I had more time

- Build a proper CSS-Houdini or JS micro-engine for the cube that tracks real
  face state + rotates slices on specific scroll deltas, so a "13.95s" button
  could replay an actual scripted solve at speed.
- Add startup sound + shutdown sound (Brian-Eno-composed nostalgia hit).
- Implement cascading submenus in Start, a real File menu dropdown on each
  window, and a working "Find → Files or Folders…" that searches Jake's
  career by keyword.
- Add a `solitaire.exe` easter egg with Klondike that uses Jake's career
  cards instead of hearts/diamonds.
- `chat.exe` — ICQ / Windows Messenger style modal where the "buddy list"
  is old colleagues and clicking Jake opens a tiny chat transcript about his
  hiring availability.
- A "Dial-Up Networking" connect that actually plays the 56k handshake sound
  before revealing the Phone.exe contact form.
- Add tooltips on hover for all icons ("Type: 3D Application, Size: 2.04 MB").
- Print-to-fax styling that renders the resume as a 1998 fax cover sheet.
- Tighter focus-ring and keyboard nav (accelerator keys like <u>F</u>ile).
