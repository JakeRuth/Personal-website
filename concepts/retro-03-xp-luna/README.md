# Retro Hybrid 03 — Windows XP Luna (2001)

"Jake Ruth XP." A Fisher-Price-but-beloved tribute to the warmest era of OS chrome. Bliss wallpaper, chunky green Start button, blue gradient taskbar, XP Explorer window as the site, cube as a scroll-driven ambient solver, Search Companion dog narrating a network graph of Jake's orbit.

## Run it

Open `index.html` directly via `file://`, or:

```
python3 -m http.server 8000
# → http://localhost:8000/concepts/retro-03-xp-luna/
```

No build step. Three.js is loaded from a CDN (Cloudflare). Tahoma is requested first; if unavailable, falls back to Google's "Asap" (similar metrics) and then Segoe UI / Verdana.

## What's implemented

- **Bliss wallpaper** — recreated in pure CSS (sky gradient + soft radial clouds + two layered rolling hills via border-radius tricks). No image assets.
- **Luna chrome** — title bar blue gradient (#0054E3 → #2E6CE6), close button red, taskbar blue (#245DDB → #579DE9), Start button green radial (#3D9F40 → #73B843) with gloss highlight and the four-pane flag.
- **Start menu** — authentic 2-column XP layout (left: "Internet / E-mail" + site navigation; right: My Computer / Documents / Pictures / Music / Search / readme / Recycle Bin; footer: "Log Off / Turn Off Computer"). User header with orange accent strip + "JR" avatar tile.
- **Explorer window** — "Jake Ruth (C:)" with titlebar, File/Edit/View/… menubar, Back/Forward/Up toolbar with Address bar showing `C:\Jake\`, collapsible **Task Pane** sidebar ("File and Folder Tasks", "Other Places", "Details"), content area, and status bar showing scroll / cube solve percentage.
- **SaaS-parody content** in the content area: hero ("Ship Jake Ruth™"), About, Hire (3-tier XP edition pricing parody — Home / Professional "Most popular" / Server Advisory), Stock Unlock build-log panel, Projects grid, Unicycle story, Testimonials, Contact, EULA/fineprint.
- **CubeMaster XP.exe** — double-click desktop icon opens a small XP window with a real 3D Rubik's cube (three.js, 27 cubelets, colored stickers, edge outlines). The cube **ambient-solves as you scroll** the Explorer window — top-of-page is fully scrambled, bottom-of-page is solved, and the last partial move smoothly lerps for buttery transition. Has its own progress bar inside the CubeMaster window and a "Scramble" button.
- **Search Companion** — sidebar window with the animated dog (🐕, wagging via CSS keyframes) + speech bubble ("I think I found what you're looking for!"). Hosts the **Network Graph** of Jake's orbit: Jake center, companies / skills / hobbies on radial rings, ~22 links. Nodes are clickable and toast their relationship.
- **Desktop icons** — Jake Ruth (C:), CubeMaster XP.exe, Search Companion, readme.txt, Recycle Bin (pinned bottom-right). Hover / focus / selected states. Double-click to open.
- **Taskbar** — Start button + quick-launch + dynamic open-window task strip (active window highlighted, click to focus/minimize) + system tray (Messenger / Volume / Network icons) + live clock.
- **Notepad-style readme.txt** — authentic monospace textarea with File/Edit/Format/View/Help menubar stub.
- **Recycle Bin dialog** — classic XP "Confirm Folder Delete" ("Are you sure you want to remove the folder 'My Imposter Syndrome'?") as a tribute Easter egg.
- **XP balloon toast** — pale yellow pop-up in the tray corner for copy-email, scramble, and node-click feedback.
- **Minimize / Maximize / Close** — real window buttons. Max toggles between the authored layout and full-viewport (minus taskbar).
- **Window focus / z-ordering** — click any window to bring it forward. Unfocused windows get a desaturated title bar like real XP.
- **Click-outside closes Start**, Escape closes Start.
- **Copy email to clipboard** on CTA buttons + fallback to showing the address in a toast.
- **"Hire Jake" CTA** fires `mailto:jake@stockunlock.com` with a subject line.

## What's mocked / abstracted

- Icons use emoji or tiny inline SVGs rather than the original XP iconography (can't ship copyrighted assets).
- The cube is **ambient-only** — it doesn't enforce a legal-solve sequence; it just linearly interpolates moves from a random scramble back to solved as the user scrolls. Looks like a solve, isn't a solver.
- Task Pane sections are collapsible but don't persist state across reloads.
- No real drag-to-reposition on windows (they use authored positions + maximize toggle). The windows feel "docked" rather than fully WIMP-draggable.
- No actual window resize grip.
- Tahoma is requested first but will usually fall back to Asap via Google Fonts (Tahoma is a system font on Windows and licensed on Mac).
- Messenger / Volume / Network tray icons are decorative.
- "All Programs ▸" and the Log Off / Turn Off Computer buttons are visual only.
- The Recycle Bin dialog's Yes/No both just close it (no actual "delete").

## Interactions to try

1. Page load → Jake Ruth (C:) opens by default. Scroll. Watch the status bar percentage.
2. Open **CubeMaster XP.exe** from the desktop (double-click) or quick-launch. Scroll the Explorer window. The cube solves in real time.
3. Click the **green Start button**. Poke around the right column (My Computer, readme, Recycle Bin) and the site-navigation section on the left.
4. Click **Search Companion** (desktop icon, quick-launch, or the 🐕 in "Other Places"). Hover/click graph nodes.
5. Click the **Hire Jake Ruth** button in the hero. Mail client pops.
6. Click the **Copy e-mail** button. XP balloon toast confirms.
7. Click the titlebar × on the Explorer window, then click it again in the taskbar. It comes back.
8. Double-click **Recycle Bin**. Enjoy.
9. Resize the window narrower — mobile-ish layout collapses to a single column and re-homes the cube/search windows.

## If I had more time

- Real draggable + resizable windows (pointerdown on titlebar, edge hit-tests for resize) with snap-to-grid.
- A proper XP-style cube-solver that plays the reverse of a legal-move scramble, broadcasting the move count for a "Speed: 13.95s" timer readout tied to actual scroll velocity.
- Wire the Search Companion dog to type out the node you hover over ("Would you like to search for **Stock Unlock**?").
- Persist open windows / positions / collapsed task-pane sections in `localStorage`.
- Second desktop shortcut for a tiny Minesweeper / Solitaire that's actually playable.
- A login screen (user tile: JR, "Click your name to begin") before the desktop appears.
- Authentic XP startup sound on first click (gated on user gesture for autoplay).
- Window focus shadow + window-open "swoop" animation.
- Real XP file-type icons drawn as crisp SVG instead of emoji.
- A clippy-style tip that pops after 30s idle suggesting "Would you like to hire Jake?".

## Files

- `index.html` — semantic structure, all XP chrome markup, window shells.
- `styles.css` — Luna/Bliss visual system (wallpaper, gradients, windows, taskbar, start menu, graph, toasts, responsive).
- `app.js` — window manager, start menu, scroll→cube sync, three.js cube, SVG network graph, clock, toast.
