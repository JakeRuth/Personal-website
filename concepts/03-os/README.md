# Concept 03 — Operating System / Desktop

A browser-based desktop environment for jakeruth.com. Visitors land on a dark "jakeOS" desktop with icons, double-click to open draggable windows, and discover the site like files.

## Run it

```sh
# From the repo root
cd concepts/03-os
python3 -m http.server 8000
# then open http://localhost:8000
```

Or just open `index.html` directly via `file://`. Everything is vanilla HTML/CSS/JS — no build, no deps, no CDN calls.

## What's implemented

- **Cursor-reactive wallpaper.** Canvas dot-grid that deforms toward the cursor, plus a subtle particle trail. 60fps on a 2020 MBP.
- **Top menu bar + bottom taskbar** with live clock and date (updates every 15s).
- **Desktop icons** — 8 apps, custom inline-SVG glyphs, selected / hover / active states.
- **Window manager** (the chunky part):
  - Draggable by the title bar (clamped to the viewport)
  - Resizable from the bottom-right corner
  - Close / minimize / maximize (double-click title bar also maximizes)
  - Focus brings to front; active window highlighted, inactive windows desaturated
  - Taskbar pills per open window; click to focus, click-active to minimize, click-minimized to restore
  - `Cmd/Ctrl+W` closes the active window
  - Opening an already-open app focuses it instead of re-opening
- **Start menu** (bottom-left) with quick links and avatar — click outside or press `Esc` to dismiss.
- **Apps, all with real content:**
  - `About.app` — bio, avatar, key facts; auto-opens on first load
  - `Projects.app` — 4-card grid (Stock Unlock, Youni, Oscar chatbot, CubeTimer)
  - `Resume.pdf` — embedded preview via `<object>` of `../../official_resume.pdf` with download + open-in-new-tab buttons
  - `Contact.app` — email / GitHub / LinkedIn rows, plus a mock contact form (shows a "not wired up" message on submit)
  - `StockUnlock.app` — compliant framing ("built it, scaled it, not full-time, next chapter") with stat grid and visit link
  - `RubiksCube.app` — animated 3D CSS cube (six faces, perspective, keyframe spin)
  - `Notepad.txt` — monospace scratch-pad with voice-appropriate notes
  - `Terminal.app` — live interactive shell. Try: `help`, `ls`, `whoami`, `date`, `cat about.md`, `projects`, `echo hi`, `sudo`, `clear`, `.secret`. Opens the corresponding apps for known files.

## What's mocked

- The contact form doesn't actually send — it shows a stub message. Real one would need a backend or Formspree-ish service.
- The resume "preview" uses the browser's native PDF plugin via `<object>`, which works in most desktop browsers but gracefully falls back to a download prompt if not.
- Wallpaper particles are procedural eye-candy, not performance-tuned for mobile.
- No persistence — window positions, open state, etc. reset on refresh.

## Interactions worth discovering

- **Double-click any desktop icon** to open it.
- **Drag windows** by their title bar; **drag the corner** to resize.
- **Minimize** sends windows to the taskbar; click the pill to restore.
- **Right side of the menu bar and taskbar** both show live clock/date.
- **Terminal.app** is the easter-egg playground — `help` lists commands, `cat .secret` has a hint, `sudo` has a quip.
- **About → "Stock Unlock"** link inside prose opens the StockUnlock window programmatically.
- **Cmd/Ctrl+W** closes the focused window like a real OS.
- **Esc** dismisses the Start menu.

## If I had more time…

- **Persistence.** LocalStorage for window positions, z-order, theme, open apps — return to the same desktop you left.
- **Real window snapping.** Drag to edges → half-screen tile; currently only full-maximize works.
- **File manager app** — a Finder/Nautilus-style window browsing `~/projects`, `~/writing`, etc. as actual files you can drag around the desktop.
- **Themes.** A "settings" app with light/dark, wallpaper picker, accent color. The CSS is already token-driven, so it's mostly wiring.
- **Real contact form.** Formspree or Cloudflare Pages Functions.
- **Mobile.** Currently usable but not great at <640px — would redesign to a phone-y launcher shell instead of shoe-horning windows.
- **Sound.** Subtle open/close/minimize foley. Optional toggle in menu bar.
- **Performance pass** on the wallpaper canvas for mid-range laptops — the dot grid is O(n) per frame and could halve its draw count with a spatial hash.

## File map

```
concepts/03-os/
├── index.html   # shell: menubar, icon grid, taskbar, start menu
├── style.css    # design tokens + OS chrome + per-app styling
├── app.js       # window manager, wallpaper, app renderers, terminal
└── README.md    # this file
```
