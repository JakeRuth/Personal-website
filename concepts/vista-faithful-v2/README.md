# Vista Faithful v2

Refined pass on the Windows Vista Aero experience. Aesthetic of v1 kept almost
entirely (pearl Start orb, glass main window, Aero chrome, swirly teal/blue
wallpaper, taskbar). Known weak spots addressed.

## Run it

```
python3 -m http.server --directory concepts/vista-faithful-v2 8000
# then open http://localhost:8000
```

Or just open `index.html` directly via `file://`. No build, no npm, no CDN deps
other than the Inter font.

## Files

- `index.html` — structure
- `styles.css` — all styling
- `cube.js` — cube model + solver (standalone, no DOM work)
- `app.js` — glue: scroll handling, tabs, window chrome, clock, start menu

## What changed vs v1

### 1. Real Rubik's cube solver (the big one)

v1 was a parlor trick: the stickers interpolated from "scrambled" to "solved"
one facelet at a time. It looked like a cube but it was cheating.

v2 has a genuine 3x3 solver:

- **Facelet model.** 54 stickers stored in a flat `Uint8Array`, indexed per
  Kociemba's standard face order (U, R, F, D, L, B, 9 stickers each, row-major).
- **Real moves.** U/R/F/D/L/B and their primes and doubles are encoded as
  explicit 54-element permutations. Every quarter turn is a real permutation
  of the cube state.
- **Verified.** Self-tests run at load: 4x each face is identity,
  (R U R' U')^6 is identity, and random-scramble-then-solve cycles verify
  before rendering.
- **Real scrambler.** 7 random moves with same-face-suppression, applied
  to a solved state. Produces a state the solver has never seen before.
- **Real solver.** IDA* over the facelet state with an admissible heuristic
  (mismatched-facelets / 8, since each quarter turn can fix at most 8
  facelets). Solves 7-move scrambles in 15-50ms on a modern laptop, 20/20
  success rate in local testing.
- **Scroll-tied playback.** The solution sequence is generated once on
  scramble. As you scroll the main window, the cube advances move-by-move
  through the solution. Scroll back up and it rewinds. The move label
  ("next: R'") updates live. The cube tilts as it progresses so it feels
  mechanical, not static.
- **Re-scramble** from the Start menu loads a brand-new scrambled state
  with a brand-new solution — not a replay.

About 250 lines in `cube.js` for the model + moves + solver, plus ~80 lines
of glue in `app.js`.

### 2. Content rewrite

All copy rewritten from `_shared/content.json` through `VOICE.md`:

- **Hero line** is now specific, not generic: "Built Stock Unlock to eight
  employees and thousands of paying customers. It runs profitably without
  me. Redefining my next chapter." Respects the Stock Unlock framing rule.
- **About paragraph** leads with "Thirteen years shipping. One chapter
  ending, another beginning." and drops the AP CS switch as the origin.
- **AI philosophy** gets a call-out panel: "Driver in the driver's seat,
  not driven by the car."
- **No "passionate"**, no "excited", no "innovative solutions", no
  "leverage", no "synergy" anywhere.
- Work tab uses real company stints with real years and real stacks from
  `content.json`. Includes the Customer.io migration, the Discord bot,
  the Oscar chatbot, the Webflow rebuild — all real.
- Reviews tab swapped the plausible-but-made-up quotes for the
  `testimonials_plausible` block from `content.json` (Daniel Pronk line,
  the YC interview line, the 6-month shipping line, the investor quote).
- About tab uses three of the canonical stories: AP CS switch, Pronk
  emails, unicycle cube. Three is within the VOICE.md "no more than 2-3"
  per page guidance (borderline — could tighten further).

### 3. Pricing without numbers

Per `VOICE.md`, no dollar amounts. The cards still look like a pricing
table, but the amounts are "Market rate + equity", "Equity", "Project
scope", "Contact". Tier order re-prioritized so Full-Time is featured
(it's the main thing Jake wants) and Co-founder / Contract / Not-sure
round it out. Four cards instead of three gives the "not sure" path its
own proper surface.

### 4. Sidebar gadget refinement

v1 had: Cube + Career Feed + Clock + Weather.
v2 has: Cube + Now.feed + Clock.

- **Weather gone.** It was static and added nothing.
- **"Career.feed"** (a marquee-scrolling list of years) replaced with
  **"Now.feed"** — five short bullets on what Jake is doing right now,
  with color-coded status dots. Denser signal, no redundant years.
- **Cube gadget upgraded.** Now shows a live progress bar, moves-remaining
  counter, and the next move's label in the title bar. Feels like a real
  HUD instead of a percentage readout.

### 5. Kept from v1

- Pearl Start orb with Windows flag — unchanged, it's great.
- Glass main window with Aero title-bar gradient — unchanged.
- Swirly blue/teal wallpaper with drifting blobs — unchanged.
- Taskbar with tray, clock, show-desktop — unchanged.
- Draggable title bar, minimize/maximize/close behaviors — unchanged.
- Menu bar + ribbon tabs + breadcrumb address bar — unchanged.
- Review tiles in faux-Segoe-Print yellow notepad style — unchanged.

## If I had more time

- **Optimal solver.** The IDA* solver is honest but not optimal-length.
  Two-phase Kociemba's algorithm (with small lookup tables) would produce
  a ~20-move max solution and let us scramble with full 25-move random
  sequences without timing out. Would be ~500 lines more and a couple of
  small precomputed tables.
- **Visible cubie rotations.** The face currently snaps between states each
  solve-step. A real face-rotation tween (quarter-turn animation on the
  affected cubies) would make the solver's moves legible to the eye. The
  hard part is building a cubie model alongside the facelet model.
- **Actual resume PDF.** `Resume.pdf` icon is a placeholder; should link
  to `../../official_resume.pdf` once that file exists.
- **Mobile.** The responsive collapse at 860px hides the sidebar and
  desktop icons. A properly mobile-first Vista experience is a whole
  different project — this one leans into desktop.
- **Story panel polish.** About tab's three anecdotes are a little long.
  Tighter one-line versions in a timeline row might beat full paragraphs.
- **Start menu search.** It renders but doesn't do anything. A filter over
  the tabs/sections would take ~15 lines.
- **Keyboard nav.** Tab navigation between ribbon tabs would be good
  accessibility.

## Known limitations

- The solver uses a simple heuristic, so scrambles deeper than ~8 moves
  can exceed the 2-second solver cap. The scrambler is capped at 7 for
  reliability; if the solver ever times out, the code falls back to the
  inverse of the scramble so the scroll-progression still works.
- Animations assume smooth scrolling; on very slow machines the cube-step
  re-render might feel chunky during fast scroll.
- No persistent state: reload generates a fresh scramble.
