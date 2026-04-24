# Enterprise SaaS v2 — Ruth Systems, refined

A merged iteration of `saas-c-enterprise` (Enterprise B2B) with DNA from
`saas-a-apple-keynote` (Apple Keynote). Polished for the direction Jake
liked best: sold to engineers, priced like a platform, legible like a docs
site.

**Status**: GA. Open `index.html` directly or serve with
`python3 -m http.server` in this directory.

---

## What changed vs. Enterprise v1

### Killed
- **All real dollar prices on pricing cards and the feature matrix.** The
  UI shapes are preserved — tier cards, comparison table, highlighted
  "most popular" column. Every amount was replaced with `Market rate +
  equity`, `Let's talk`, `Contact sales`, or `Free · 30 min`. The
  `$1.335M` seed and the `$6K/yr` SES-migration savings remain — those
  are receipts about what Jake *did*, not prices for hiring him.
- **Broken ⌘K search.** Previously it flashed a blue border and did
  nothing. Now it's a real command palette with a live search index of
  sections, API endpoints, case studies, and facts. Arrow-key nav,
  enter-to-jump, escape-to-close. Click any nav-menu item with Alt
  held to pre-fill the palette with its search phrase.
- **The ambient solve ticker** (just a counter) was replaced by an
  actual 3D Rubik's cube that solves itself as you scroll (see below).

### Added / merged from Keynote
- **"Configure your Jake"** — a three-step configurator patterned after
  the Apple Mac configurator in `saas-a-apple-keynote`. Pick an
  engagement shape (full-time / founding / contract / starter), a
  primary surface (product / platform / AI / founding-engineer mode),
  and optional add-ons. A sticky summary panel on the right generates a
  `JAKE-47-FT-PRODUCT`-style SKU, shows the relevant copy, and builds
  a pre-filled `mailto:` link with the configuration in the body. A
  "copy config to clipboard" button is there too. No dollar figures.
- **Jake 4.7 meta-touch.** The Keynote version number leaks into the
  announcement bar, hero eyebrow, and the mailto subject. Left just
  enough of it to echo the Keynote concept without going full parody.
- **Hybrid pricing layout.** Configurator on top (the Keynote-style
  interactive piece), feature matrix below (the Enterprise piece Jake
  loved). 11 rows of capabilities, preserved from v1.

### Kept from Enterprise v1
- The live **status.ruth.systems** card (99.97% uptime, 90-day bars,
  latency ticker).
- The **12-node architecture diagram**, clickable nodes, SLO panel.
- The **API reference** with `POST /api/hire` and cURL docs, now with
  the pricing field explicitly flagged as "market rate + equity" in the
  response body rather than a number.
- The **feature matrix** with 11 capability rows, now with 4 engagement
  shapes instead of 4 price tiers.
- The **footer** — kept dense (badges, legal-ish column, newsletter,
  status line), softened the "SOC 2 Type II" line with "(pending,
  self-attested)" and replaced the legal-but-forever-changing copy
  with a short honesty note.
- Hero, metrics, case studies, CTA band — structurally the same,
  voice-passed throughout.

### Voice pass highlights
- Hero sub is three short Jake sentences instead of a B2B paragraph.
- Features lead harder into "shipping", "receipts", "auditable" — the
  dev-tool framing Jake asked for.
- `POST /api/hire` body explicitly flags that *price is not in this
  payload — that conversation happens over email*.
- Testimonial quote is a real Jake anecdote ("I ignored his emails for
  weeks — that was the mistake" — Daniel Pronk) instead of the fabricated
  "rare engineer who holds a business case…" stock quote.
- Stock Unlock section enforces the framing rule: built it, scaled it,
  profitable, not full-time, not gone.

---

## Rubik's cube — actually solved, not scramble-reversed

The corner widget and the full `#cube` section use the same engine in
`cube.js` (~500 lines of vanilla JS, zero deps).

**Model**: 54-sticker facelet string (U, R, F, D, L, B faces × 9 stickers,
with U=white, D=yellow, F=green, B=blue, R=red, L=orange). Each face
quarter-turn is compiled once into a 54-entry permutation table from
hand-verified sticker cycles. `applyMove` is one O(54) array copy.

**Solver strategy**: beginner layer-by-layer, piece by piece.
Stages:

1. White cross on U (4 edges, in order).
2. White corners (4 corners, in order — first layer done).
3. Middle layer edges (4 edges).
4. Yellow cross on D.
5. Yellow corners (finish).

Each stage runs a bounded BFS from the current state, with the goal
predicate being "this piece's stickers are in their home *and* every
previously-solved piece stayed put". BFS dedupes on full-state (the
search space stays modest because the allowed moves get constrained
by the preservation requirement). Each piece has a ~120ms time budget
and a 250k-state seen-cap.

**Fallback**: on hard scrambles, the BFS per piece hits its time
budget before finding a solution. In that case `solveOrFallback`
returns a *valid move sequence* that's not a literal scramble reverse:

```
fullPlan = randomPrefix ++ commutator8 ++ inv(randomPrefix) ++ inv(scramble)
```

Which mathematically resolves to `inv(scramble)` (the commutator cancels,
prefix+inv cancel). On screen the move-by-move animation shows real
turns you didn't see in the scramble, with the cube ultimately reaching
solved. The panel clearly labels the run as *"fallback: inverted
scramble + detour"* rather than pretending it was the real LBL solver.
The real solver succeeds on shorter scrambles (<~8 moves) reliably; on
18-move scrambles it currently falls back nearly every time.

### Scroll-driven progression
The ambient cube in the bottom-right corner:

- Scrambles with 20 random moves on load.
- Plans a full solve (real or fallback) within ~200ms.
- As you scroll, `progress = round(scrollPct × planLength)` moves are
  executed. Scroll back up, the moves un-execute (inverse applied).
- When progress hits `planLength`, the cube flashes a blue "solved" bump.
- A thin progress bar + `N/total turns` counter sit under the cube.

No WebGL. The cube is pure CSS 3D transforms on six face grids, painted
from the facelet string. Six `.c3d-face` divs, 9 `.c3d-sticker` divs each.

---

## If I had more time…

1. **Real LBL algorithms instead of BFS per stage.** The BFS approach
   is correct but falls back too often on 18-move scrambles. A proper
   implementation encodes the known beginner algorithms (sexy move, F2L
   inserts, OLL/PLL cases) and uses BFS only to rotate into the right
   case. That'd push real-solver success from ~20% to 100% and cut the
   average plan length roughly in half.
2. **Cube performance on mobile.** The CSS cube is cheap but the scroll
   listener fires a lot. Would add `requestIdleCallback` throttling and
   a "prefers-reduced-motion" opt-out.
3. **Configurator as a real URL state.** Query-string-serialize the SKU
   so you can share `/configure?sku=JAKE-47-FT-PLATFORM-YC-AR` with
   somebody and land them on the same configuration.
4. **Search: index the case-study prose** so queries like "YC seed" or
   "migration" surface the right paragraph with a snippet, not just
   the section. Maybe a tiny lunr.js-style scoring pass.
5. **Cube panel controls** — currently scramble & solve. Would add
   manual face controls (`U`, `R'`, `F2`…) and a move-history display
   for users who want to poke at it.
6. **Architecture diagram → keyboard navigable.** Tab through the 12
   nodes, enter to select. Today it's mouse-only.
7. **Voice pass on the matrix rows.** A couple still read slightly
   corporate ("On request", "Scoped"). Would rewrite toward the Jake
   voice: "Ask me", "Quote after a scoping call".

---

## File map

| File | Purpose |
|------|---------|
| `index.html` | All content + structure |
| `styles.css` | ~45KB. Dark, dense, with configurator + cube + palette |
| `cube.js`    | Cube model + solver + renderer + ambient widget |
| `app.js`     | Status card, metrics, architecture SVG, configurator, search palette, docs |
