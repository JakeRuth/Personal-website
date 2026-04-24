# Picker · Bauhaus

One of thirteen parallel prototypes for the Jake Ruth personal-site rebuild. This one is a picker — the visitor lands, picks an experience, goes.

## Approach

Bauhaus design grammar applied to a modern mode-picker:

- **Primary palette only.** Red (#E63946), blue (#2A4DA8), yellow (#F3C623), black ink, off-white paper (#F5F2EA). One green allowance, only on the XP start-orb (it's the one concession to faithful mode previews).
- **Typography is the design.** Mode names are the hero — `Work Sans 900` broken across two lines ("XP / LUNA", "ENTER / PRISE"), letter-spacing pulled tight, tracking clamped so they scale with viewport.
- **Geometry as punctuation.** Square, circle, triangle recur in the header, footer, and inside the dark about-card — the three Bauhaus primitives sized down to chrome.
- **Structural rules.** Every edge in the grid is a 2px ink line. No box-shadows, no gradients, no blur. Hovers shift *position* or *color*, never depth.
- **Full-bleed grid.** 3x2 on desktop, 2x3 on tablet, single-column on phones. Six cells: five modes + an "ONE VOICE" card in black that carries Jake's one-paragraph pitch (so the picker is also a micro-landing for people who bounce).

## Mode previews

Each card has an abstract SVG composition — not a screenshot, a reduction.

- **XP Luna** — blue rounded window over yellow hills, green start orb.
- **Enterprise SaaS** — hairline column/row grid, a solid blue metric block, a pulsing yellow uptime dot.
- **Git Log** — vertical ink axis, four primary-colored commit dots on main, two branch dots swimming off to the side on hover.
- **README** — three stacked paper pages, the front one holding a giant red "M" glyph and a blue `#`.
- **Vista** — three translucent overlapping discs with `mix-blend-mode: multiply` so the intersections darken like real glass.

## Interactions

- **Click a card** → four primary-color bars wipe down the screen (red → blue → yellow → black, 80ms stagger), then redirect to the matching experience directory.
- **Keyboard**
  - `1`–`5` selects a mode. Pressing the same number twice enters it.
  - `Enter` enters the selected mode.
  - `Arrow keys` walk through cards.
  - `Esc` clears selection.
- **Hover** highlights the card (paper → pale yellow), the "ENTER →" micro-label slides and fades up to full opacity, and each card's preview animates subtly: XP window lifts, SaaS bar widens, Git branch dots slide out, README pages spread apart, Vista orbs drift.
- **Load** fades cards in with an 80ms stagger per index. Respects `prefers-reduced-motion`.
- **Cmd/ctrl-click** bypasses the curtain — opens the target in a new tab normally.

## Voice

Each card gets one line, Jake-voice, from the brief:

- XP Luna — "Fisher-Price era, maximum charm."
- Enterprise SaaS — "Sold to CTOs, bookmarked by PMs."
- Git Log — "Engineer-native. Commit messages included."
- README — "Because of course I wrote one about myself."
- Vista — "Aero glass, without the bloat."

The black about-card uses the canonical Stock Unlock framing from `VOICE.md`: "Built Stock Unlock — eight employees, thousands of paying customers, profitable today. Not full-time there anymore." No em-dash abuse. No "passionate." No prices.

## Files

- `index.html` — structure; SVG previews inline so there's zero asset chain.
- `styles.css` — layout, card grammar, preview animations, transition curtain.
- `app.js` — keyboard handler, selection state, curtain wipe.

No build. No dependencies. Google Fonts (`Work Sans`, `JetBrains Mono`) via CDN. Opens on `file://` or `python3 -m http.server`.

## If I had more time...

- A real custom Futura license instead of Work Sans — the display face is doing most of the work.
- Per-card sound on hover — a single tonal click, mode-coded (XP = bootup blip, SaaS = data-center hum, Git = keyboard tap, README = paper flip, Vista = glass chime). Toggleable.
- Dark-mode flip. Ink inverts to paper, paper to ink, primaries stay identical — that's the Bauhaus trick.
- Track which card a visitor picks and, on a repeat visit, highlight the *other four* more prominently. "You've seen the XP one. Try these."
- A "poster" print-mode that freezes the layout into an 18"x24" exhibition poster — the picker literally becoming the artwork.
- Pre-cache the five destination bundles on hover-intent so the curtain wipe never feels like it's covering a slow load.
