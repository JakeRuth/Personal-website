# XP Luna v2

A refinement pass on `retro-03-xp-luna`. Same XP chrome Jake loved &mdash;
Bliss wallpaper, green Start button, Explorer with the blue Task Pane,
Search Companion dog hosting the network graph, CubeMaster XP.exe as a
desktop-launched app, taskbar with tray clock &mdash; but tighter content,
a real cube solver, and fewer widgets competing for attention.

Open `index.html` via `file://` or `python3 -m http.server`.

## What changed vs v1

### Content (per Jake's "too much content" feedback)

- **Six panels, not nine.** Cut Testimonials, the EULA "legal" panel, and
  the Unicycle standalone panel. Merged what was essential into the About
  and Cube sections.
- **Bigger type, more whitespace.** Body copy jumped from 12px to 12.5px
  with 1.6 line-height. Panel padding went from 14&times;18 to 18&times;22.
  Hero h1 went from 34px to 40px.
- **Voice pass on every line** against `VOICE.md`. Gone: "passionate",
  "clamshell packaging", "trusted by himself for 13 straight years",
  "no activation key required", the `Jake Ruth&trade;` pseudo-parody.
  Kept: dry humor ("an intern-me took down production by pressing a
  button I shouldn't have had access to"), and the driver-in-the-seat AI
  line.
- **Stock Unlock framing matches VOICE.md exactly.** "Built it. Scaled to
  8 + thousands of customers. Profitable side business. Not full-time
  there. Redefining next chapter."
- **Origin story added** &mdash; the Daniel Pronk Python-automation emails,
  from `content.json.stories.pronk_emails`. One anecdote, naturally placed.
- **Pricing without dollars** per the VOICE.md pricing rule. Cards stay;
  numbers come off. "Market rate + equity", "Let's talk", "Contact".
- **Taskbar tray trimmed** from 4 icons to 2 (Network, Clock). Quick-launch
  trimmed to 3 (My Computer, Cube, Search).

### The cube solver (the big one)

v1's "solver" replayed a recorded scramble in reverse. v2 ships a real
one in `cube-solver.js` (~590 lines).

- **Cubie-level state model**: 8 corners with orientation, 12 edges with
  orientation. The representation Kociemba uses. Face turns are applied
  as permutation cycles + twist/flip deltas.
- **54-facelet model** for rendering. Facelet state is the single source
  of truth for the 3D view; the solver converts back to cubie state on
  demand.
- **Bidirectional breadth-first search on the full cube state.** Forward
  frontier expands from the current scramble; backward frontier expands
  from solved. Expansion picks whichever frontier is smaller and they meet
  in the middle &mdash; total solve length up to 2&times; `maxPerSide`.
  With `maxPerSide = 10`, the solver handles any state within 20 moves
  of solved (God's Number). In practice we cap scrambles at 9 moves so
  browser response stays under ~200ms; the solver itself works from any
  reachable cube state, not just ones we scrambled into.
- **Three.js renderer**: 27 black cubelet bodies + 54 colored sticker
  planes. Each move animates the affected layer spinning 90&deg;, snaps
  the cubelets back to the grid, commits the facelet change, and repaints
  the stickers. Animation duration auto-shortens when the queue is long,
  so a 10-move solve takes about 1.5 seconds of watching.

Verified end-to-end in Node: random scrambles of 6 / 7 / 8 / 9 / 10 moves
all solve correctly, returning a valid solve sequence that brings the
facelet state back to solved.

### Widgets (the "too dense" critique)

- **Dropped** the scroll-driven ambient cube solve. It conflicted with
  the real Scramble / Solve buttons and added noise.
- **Dropped** the Notepad readme.txt window. The same content now lives
  inline in the main Explorer.
- **Dropped** the Recycle Bin dialog. Funny once, dead weight forever.
- **Graph nodes** trimmed from 15 to 11. Each node now surfaces a tight
  one-liner in the dog's speech bubble when clicked, pulled straight from
  the content.json facts (Stock Unlock framing, Oscar scale, unicycle cube).
- **Clouds** reduced from 4 to 3 for a slightly calmer sky.

### Kept exactly as Jake liked it

- Bliss wallpaper (sky gradient + double hill, zero images)
- Green Start button with radial gloss and orange stripe under the header
- XP-blue titlebar with corner highlight
- Blue Task Pane with collapsible sections
- Search Companion dog + speech bubble hosting the network graph
- CubeMaster XP.exe as a separately-launched desktop app
- Ticking taskbar clock

## Interactions to discover

- Double-click **CubeMaster XP.exe** on the desktop &mdash; scramble, then
  watch it actually solve.
- Click nodes in the **Search Companion graph** &mdash; the dog says
  something specific about that edge of Jake's life.
- Click the **Start orb** for a working navigation menu with scroll-links
  into the Explorer window.
- Click any **desktop icon** to select it (single-click), double-click to
  launch (XP muscle memory).
- Minimize or maximize the Explorer window via its titlebar buttons.
- Copy Jake's email via the hero button &mdash; you get the XP balloon toast.

## If I had more time

- **Swap in a phased LBL solver with hand-coded case algorithms** (the
  ~25-algorithm beginner method) so the solver handles 20-move scrambles
  in milliseconds with human-readable solutions, instead of capping
  scramble depth to keep BFS tractable.
- **Trackball camera controls** on the cube so you can inspect it
  mid-solve.
- **Ambient taskbar shine sweep** on the active window titlebar &mdash;
  the subtle motion that made the real Luna theme feel alive without
  shouting.
- **Mobile taskbar overflow** still clips awkwardly at very narrow widths.
- **XP startup chime** on first interaction (one MP3, cached).
