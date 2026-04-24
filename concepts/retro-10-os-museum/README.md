# Retro Hybrid 10 — The OS Museum

A meta personal-site that walks visitors through Jake Ruth's career as **exhibit rooms in a museum of operating systems**. Each room is fully themed to the OS of its era, and the career maps onto the progression.

## Run it

- Open `index.html` directly (works on `file://`), or
- `python3 -m http.server` from this folder and visit `http://localhost:8000`.

No build step. Vanilla HTML/CSS/JS + Three.js from a CDN (used only in the Vista room's cube; everything else is plain CSS/canvas).

## Layout at a glance

```
Sidebar nav (sticky)     |  <-- Stage (scroll-snappable) -->
lobby   (hallway w/ 5 doors, + curator door)
room 1  Windows 95        (1995 · Hobbyist)
room 2  Windows XP Luna   (2001-2015 · Student)
room 3  Windows Vista     (2017-2021 · Oscar Health)
room 4  OS X Leopard      (2022- · Stock Unlock)
room 5  GLASS/OS 2026     (Now)
curator Curator's Office  (cross-era graph)
```

Scroll or click a doorway / side-nav entry to jump. "Back to lobby" always visible in the side nav.

## Room-by-room rundown

### Lobby
CSS/SVG perspective hallway with 5 doorways. Each doorway has a brass museum plaque beneath it naming the era + career period. A separate "Curator's Office" door sits top-right. Retro ticker at the bottom: `NOW SHOWING · 5 ERAS · 1 CAREER`.

### Room 1 — Windows 95 (Hobbyist)
- Teal desktop, Tahoma, pixel icons for `Cube.exe`, `Unicycle.bmp`, `My Childhood`, `Recycle Bin`.
- Two floating Win95 windows: `Cube.exe` (pixel Rubik's cube) and `ReadMe.txt` (Notepad bio about the cube + unicycle-cube talent show + 13.95s average).
- Start button + taskbar + tray clock.

### Room 2 — Windows XP Luna (Student)
- Bliss-style sky + hill gradient desktop.
- Full XP Explorer window: blue+orange taskpane on left ("File and Folder Tasks", "Other Places" with working jump links, "Details"), main pane has 4 Luna-tiles covering ACM, CommerceHub, Youni, BS CS+Math 2015.
- CSS 3D Rubik's cube with friendly rounded shadows.
- Green XP start button + italic "start" lettering, taskbar with tray.

### Room 3 — Windows Vista Aero (Big Leagues)
- Aurora blue backdrop with glass orbs.
- Translucent Aero window (`backdrop-filter: blur`) with proper chrome, breadcrumb, search box, and the Oscar Health story (senior SWE, 50 → 150 eng, shipped payments/eligibility/member, quietly built the investing spreadsheet).
- Three.js glossy 3D 3x3x3 cube rendered into a canvas inside the Aero window.
- Sidebar gadgets: Years, Org growth, analog clock (live), RSS "Lessons".

### Room 4 — OS X Leopard (Founder)
- Lucida Grande menubar with apple logo, "StockUnlock" as active app.
- Leopard window with traffic lights, pinstripe segmented control ("Story / Numbers / Now"), two-column body.
- Stock Unlock content: YC W22, $1.335M seed, 8 peak, thousands of customers, profitable, not full-time as of April 2026. Stat tiles + pinstripe-framed CSS 3D cube.
- Translucent Dock pinned bottom-center with 7 dock items and a hover lift.

### Room 5 — GLASS/OS 2026 (Now)
- Animated blob gradients + masked grid, top bar "GLASS/OS 2026.04".
- Glassmorphic bento grid:
  - **Hero** - "Jake Ruth. Between chapters, on purpose." + email CTA + "see the whole arc" link.
  - **Cube** - CSS 3D fully-solved Rubik's cube, 6 faces generated in JS.
  - **Philosophy** - 4 bullets (AI-as-compiler, small teams, finance+SW, quirk).
  - **Stats** - 13 years / $1.335M / 8 peak / 13.95s.
  - **Contact** - what's next + jake@stockunlock.com.

### Curator's Office
- Neutral modern room (no single OS theme) with a custom canvas network graph.
- Nodes are colour-coded: era / role / skill / personal fact.
- Edges show cross-era threads: **pattern recognition** (cube -> CommerceHub -> Stock Unlock), **scaling orgs** (ACM -> Oscar -> Stock Unlock), **side-project -> company** (investing spreadsheet at Oscar -> SU), plus AI-native as the 2026 thread.

## Cross-cutting touches

- **Progressive cube-solve exhibit.** The Win95 pixel-cube starts fully scrambled. As the visitor enters each subsequent room, `IntersectionObserver` triggers `updateCubeSolveProgress(idx)`, repainting the cube's CSS gradient closer to solved. By Room 5, the exhibit cube shown there is rendered fully solved in CSS 3D.
- **Live clocks** in all four retro taskbars; analog clock gadget in Vista.
- **Side nav** with active room + progress bar that fills as you travel from Room 1 to Room 5.
- **Data-goto delegation.** Any element with `data-goto="id"` triggers smooth scroll to that room — used on doorways, XP "Other Places", Now-room CTA, etc.

## What's real vs. mocked

Real:
- All career data (ACM, CommerceHub, Oscar, Stock Unlock, YC W22, $1.335M seed, 8 people peak, thousands of customers, profitable/side-business/not-FT 2026, 13.95s cube avg, unicycle-cube story, BS CS+Math 2015, getting married 2026, email).
- Three.js cube (actual 3D 3x3x3).
- Canvas-drawn network graph.

Mocked / decorative:
- Desktop icons in Win95 (just decorative pixel blocks).
- "Explorer address bar" input is read-only; sidebar links work as jumps.
- Vista sidebar RSS items are lessons, not a real feed.
- OS X dock icons are colored squares, not real app icons.
- The "scrambled -> solved" cube sequence is a visual gag; it's not a real solve algorithm.

## If I had more time...

- Replace the pixel cube with a canvas-rendered 2D isometric cube whose stickers actually step through a short 5-move solve.
- Three.js cube in every room, each styled for the era (Win95 low-poly flat, XP Luna-shaded, Vista Aero glossy, OS X pinstripe, Now glass).
- True per-room transition (camera pan through the doorway, not just scroll).
- A "museum audio guide" track: 10-sec voice blurb per room via an invisible audio element.
- Mobile: render the hallway as a carousel instead of a cramped 5-col grid.
- Accessibility pass: proper focus rings on doors, reduced-motion version of the blob animation.

## Files

```
index.html   -- all markup, sidebar, 5 rooms + lobby + curator
style.css    -- all themes (Win95 / XP / Vista / OS X / GLASS-OS)
script.js    -- nav, clocks, cube solve state, Three.js Aero cube, curator graph
```
