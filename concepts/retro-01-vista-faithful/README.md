# Retro Hybrid 01 — Aero (Windows Vista, Faithful)

Jake Ruth's hire-me page, rendered as if someone at Microsoft had to design it inside Windows Vista circa 2006–2007. Title-bar glass, Sidebar gadgets, glossy Start orb, Segoe UI.

## Run it

    cd concepts/retro-01-vista-faithful
    python3 -m http.server 8000
    # open http://localhost:8000

Also works on `file://`. No build step. No dependencies except Google Fonts (Inter as a Segoe UI fallback). No CDN libs actually needed — the cube is CSS-only, and the clock is CSS + 30 lines of JS.

## What works

- **Desktop + wallpaper.** Vista-style swirling blue/green/teal gradient with animated drifting glow blobs and a slow conic sweep.
- **Main window** titled *Jake Ruth — Professional Edition*. Glass chrome, title bar with Aero gradient, menu bar, ribbon tabs, breadcrumb address bar, status bar.
  - Draggable by the title bar.
  - Minimize (click title-bar — or the taskbar task — to toggle).
  - Maximize toggles to fill the desktop.
  - Close is intentionally a joke: it flashes an error in the status bar and tells you to email instead.
- **5 tabs** of real content: Overview, Features, Pricing, Reviews, About. All content is authentic Jake: Stock Unlock / YC W22 / $1.335M / 8 employees / Oscar / CommerceHub / Youni / ACM / 13.95s / unicycle / "margin of safety = current_price / all_time_high is ape-shit retarded" / "driver in the driver's seat" / NYC / getting married April 2026.
- **Sidebar** with four gadgets:
  - **Cube.gadget** — 3D CSS Rubik's cube. Starts scrambled, progressively solves as you scroll the main window. Percentage + status update live. At 100% it flourishes (orange/gold glow + spin) and the status bar celebrates.
  - **Career.feed** — continuously scrolling mini-feed of career highlights.
  - **Clock.gadget** — real analog clock, live ticking, bottom label + taskbar tray time.
  - **Weather.gadget** — static "58°F, Partly caffeinated, NYC."
- **Taskbar** with pearl-glass Vista Start orb, quick-launch, active task, system tray, and clock.
- **Start Menu** opens from the orb. Jumps to tabs. Includes a "Re-scramble Cube" item. Shutdown is a joke.
- **Desktop icons** (Recycle Bin, Computer, Resume.docx, readme.txt) double-click to open related tabs. Recycle Bin has a line about the competitor's "margin of safety" formula living in the trash.
- Buttons: "Download Jake" runs a fake install progress animation. "Free 30-min Trial" opens a mailto. "Email Installer" opens a mailto.

## Interactions to discover

- Scroll the **main window body** (not the page) to solve the cube. Reach the bottom for the flourish.
- Drag the **window title bar** around.
- Double-click the **Recycle Bin** on the desktop.
- Open the **Start Menu** → "Re-scramble Cube" to get a fresh scramble.
- Click the **taskbar task** to minimize/restore the window.
- Click the **maximize button** to go full-desktop.
- Hover ribbon **tabs**: Vista orange hover tint kicks in.

## What's mocked

- Weather is static.
- The "Download Jake" progress is fake — it advances locally and does not trigger a download.
- Close button doesn't actually close anything.
- The Rubik's cube is "visually solved" (colors rearrange into the correct solved pattern per face) rather than a real physical slice-rotation model. This is intentional: a real twisty cube in under 300 lines of CSS was a worse visual than a color-permutation model for a sidebar gadget at 96px.
- All dates/jobs are pulled from real history up through April 2026.

## If I had more time

- Replace the CSS cube with a real Three.js twisty cube where each scroll tick actually rotates a slice (U, R, F, etc.), applying a hard-coded scramble and its inverse as the solve sequence.
- Add window chrome shadow that reacts to mouse position (Aero's "light source" trick).
- Bring in **Flip 3D** (Win+Tab) when you hit the taskbar's "Switch windows" quick-launch.
- Real gadget drag/reorder on the sidebar.
- A second "Properties" dialog that pops up from the Computer icon with a proper tabbed sheet (General / Hardware / Advanced / System protection).
- A subtle "Aero Peek" where hovering *Show desktop* (rightmost taskbar sliver) makes every window outline-only so you can see the wallpaper.
- A proper Vista error dialog as the close-button joke instead of a status-bar message.

## Notes

- Concept: **Retro Hybrid 01 — Aero (Vista Faithful)**.
- Author persona: Jake Ruth. Contact: jake@stockunlock.com.
- No data is sent anywhere. Everything runs locally in one HTML file + one CSS + one JS.
