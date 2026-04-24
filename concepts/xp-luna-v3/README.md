# XP Luna v3 — alpha-final polish

Polish pass over `xp-luna-v2`, holding onto everything Jake liked (the XP chrome,
the Bliss wallpaper, the green Start button with gloss, the blue Task Pane,
Search Companion dog + network graph, CubeMaster XP.exe as a desktop-launched
app, ticking taskbar clock) and sharpening everything that wasn't quite alpha-final.

Open `index.html` via `file://` or `python3 -m http.server`. No build.

## Bug fixes

- **Minimize was behaving as close.** v2's titlebar minimize button deleted the
  window from `OPEN_STATE`, which also removed its taskbar pill. Now a proper
  three-state lifecycle: `open`, `minimized` (hidden but pill remains, click to
  restore), and gone (`close`).
- **Start menu auto-scroll was brittle.** v2 called `closeStartMenu()` before
  the scroll target was laid out; if the Explorer had been closed, the scroll
  ran against stale offsets. Fixed by waiting for a `requestAnimationFrame`
  round-trip after `openWindow` and computing scroll offset from the
  scroller's `getBoundingClientRect`. Target section also pulses a subtle
  gold outline on arrival so the jump feels intentional.
- **Clock tick interval was 30 seconds.** Could sit on a stale minute for
  almost a full minute. Dropped to 15 seconds — still cheap, never looks
  broken.
- **No window drag.** v2 had none. v3 wires a titlebar `mousedown` drag with
  viewport-clipped bounds (can't be dragged behind the taskbar) and focus
  transfer on drag start. Maximized windows are pinned (the drag no-ops).
- **CubeMaster "Solved" vs "Timed out" logic was inverted.** v2 used
  `moves ? "Already solved." : "Solver timed out."` — an empty array is
  truthy in JS, so timed-out states never surfaced. Fixed to distinguish
  `null` (solver gave up), `[]` (already solved), and a solve sequence.
- **Cube scramble depth vs solver depth was misaligned.** v2 scrambled 9
  moves but the BFS per-side cap was 10, which in practice was fine but
  left zero margin. v3 scrambles 8 moves — every scramble is guaranteed
  reachable within the 9-per-side BFS window, and typical solves complete
  in 20-150ms.
- **Cube rendering pegged the GPU while hidden.** v2's rAF loop kept
  running even when the cube window was closed. v3 pauses rendering when
  the window is hidden or minimized.
- **Cube HUD was getting clobbered.** `cubeStageEl.innerHTML = ""` in v2's
  `buildCube` wiped any children including our new timer overlay. v3 only
  removes existing `<canvas>` elements, preserving the HUD.
- **Solver crash path had no toast.** Wrapped `solveFromFacelets` in
  try/catch so a solver bug surfaces as a user-facing message instead of
  a silent broken button.
- **Task pane collapse was instant.** v2 just `display: none`'d the
  content. v3 animates max-height + opacity + padding for a proper XP feel.
- **Network graph had no "active" state.** Clicking a node changed the
  bubble but didn't visually indicate which node was selected. v3 adds an
  active highlight to both the node and its incident edges, with a click
  on empty SVG space clearing it.
- **Search Companion dog was decorative.** Now clickable — gives a random
  quick one-liner, reinforcing that this is an interactive experience.
- **Desktop icons keyboard-inaccessible.** Added Enter-to-open on
  `tabindex=0` icons.

## Content additions (VOICE.md pass)

v2 had trimmed content "to the bone" — some sections felt thin. v3 fleshes
out where the rhythm called for more substance, without buzzword bloat:

- **New About panel** keeps the Stock Unlock framing rule verbatim, then
  adds the Oscar arc (associate → mid → senior, declined the manager
  track twice, ~50 to ~150 engineers) and the CommerceHub one-liner
  (intern-me took down prod). Third paragraph surfaces the cube + unicycle
  + getting-married life-texture that the resume-mode lacks.
- **New AI philosophy panel** (`#ai`). Leads with "Driver in the driver's
  seat, not driven by the car." Concrete receipts: Customer.io → AWS SES
  migration (~$6K/yr saved), Webflow marketing rewrite, internal Discord
  bot on EC2. Closes with the vibe-coding-vs-engineering distinction.
- **Stock Unlock panel got the full origin beat** — Pronk's 5-10 weekend
  hours on Excel, the Python weekend, the six weeks of emails, the video
  call with a beer. Plus the full fundraise numbers ($1.335M = $500K YC
  SAFE + $835K others) and Jake's lead-the-YC-interview receipt. Pull-quote
  from Daniel ("I ignored his emails for weeks. That was the mistake.").
- **Stories panel** (new). Five first-person anecdotes drawn directly from
  `content.json.stories`: AP CS switch, production takedown, Pronk emails,
  unicycle cube, Customer.io hack-off. Each has a short date-marker and a
  tight paragraph. Per VOICE.md, no more than 2-3 forced per experience —
  these are all load-bearing, all pulled from the canonical spine.
- **Work history expanded** from one-line roles to real role descriptions
  — stack, scale, defining actions. Added SUNY Albany (3.88 GPA, Dean's
  List, ACM president arc that led to the CommerceHub handshake).
- **Task pane grew** from 7 links to 13, including a "Launch CubeMaster"
  shortcut and an AI philosophy jump link. Details section gained a
  faux-XP attribute checklist ("ships production code day one", "won't
  manage unless team's right", "will buy you coffee first").
- **Hero CTAs** gained a third option ("Watch the cube") because the
  CubeMaster is a load-bearing piece of the experience and deserves a
  door from the hero.
- **Contact** expanded with location, prefers-email line, and the "not
  interested in" line per Jake's phrasing.

Stock Unlock framing rule audited line by line:
- "I built it" / "scaled to eight employees and thousands of paying
  customers" / "runs today as a profitable side business" / "not full-time
  there anymore" / "redefining my next chapter" — all present, nothing
  implying he currently runs it day-to-day.

Pricing rule audited:
- Tiers: Full-Time / Equity Founding / Contract.
- Prices: "Market rate + equity", "Let's talk", "Contact". No dollar numbers.

Buzzword audit run:
- No "passionate", "leverage", "synergy", "holistic", "ecosystem",
  "rockstar", "ninja", "innovative solutions", "results-oriented", "dynamic
  team player", "next challenge", "driven to".

## Cube polish

- **Live timer** overlaid on the cube stage. Starts when a scramble
  completes. Flips to green when solved. Shows `MM.SS` with hundredths.
  "PB avg 13.95" anchored to the top-right of the stage as a constant
  reference point.
- **Last solve** row in the side panel records the most recent solve
  time for quick comparison.
- **Reset button** to return to solved state. Disabled while the solver
  queue is playing.
- **Scramble toast** now acknowledges the timer started. Solve toast
  compares against PB.

## Wallpaper

CSS-only. Added a diffuse sun (soft radial, upper-right) and a third
mid-distance hill that fills the gap in v2's silhouette. Thin grass-shine
gradient at the very bottom for a touch of scanline realism. Still zero
images.

## Taskbar / Start

- Green Start button redone with a proper radial ellipse gloss — top
  highlight stripe, side curl highlight, shadow ring. Pressed state
  inverts the gloss like the real Luna theme.
- Task strip pills: focused pill now has the inset "pressed-in" shadow
  that XP uses, not just a darker gradient.
- Start menu has a tight pop-in animation (scale + fade) on open.
- Tray now has Network + Messenger icons alongside the clock, matching
  stock XP behavior.
- Added a fourth desktop icon ("Email Jake") as a direct shortcut to
  `jake@stockunlock.com`.

## Kept exactly as Jake liked it

- Bliss wallpaper, CSS-only
- XP-blue titlebar with top gloss stripe
- Green Start button (gloss sharpened, not replaced)
- Blue Task Pane with collapsible sections
- Search Companion dog + speech bubble over the network graph
- CubeMaster XP.exe as a desktop-launched window
- Ticking taskbar clock, tray
- Explorer address bar showing `C:\Jake\`

## Try these

- Double-click **CubeMaster XP.exe** on the desktop. Scramble. Solve.
  Watch the timer.
- Click any **Start > Navigate** item — smooth scroll to that section
  with a brief highlight pulse on arrival.
- Drag any window by its titlebar. Watch the focus transfer.
- Minimize the Explorer via its `_` button. Click its taskbar pill to
  restore. Click again to minimize.
- Open **Search Companion**. Click the **Unicycle** or **Stock Unlock**
  node. Click the dog for a one-liner.
- Click the **Email Jake** desktop icon or the Start > E-mail item.
  Toast pops with the clipboard acknowledgment.

## If I had more time

- Trackball camera on the cube so you can inspect it mid-solve.
- Hand-coded LBL case algorithms for human-readable solve notation.
- XP startup chime on first interaction.
- Notepad-style Readme.txt window containing the full resume PDF embed.
- A proper "shut down" dialog on the Turn Off button.
