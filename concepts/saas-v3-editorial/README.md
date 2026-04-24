# SaaS v3 — Editorial (Ruth & Co.)

A lighter, magazine-flavoured take on the SaaS-parody direction. The
premise is the same as v2 — Jake is an engineer-as-a-service, documented
plainly — but the chrome is an editorial magazine instead of a
product-dashboard.

**Status**: GA. Open `index.html` directly, or
`python3 -m http.server` in this directory.

No build. No npm. Google Fonts CDN only. Vanilla HTML/CSS/JS.

---

## Approach

The working idea: "a hardcover business book, not a dashboard."

- **Light theme is the default.** Cream (`#f6f1e7`) base, warm near-black
  ink, a single accent colour (**burnt orange, `#c24d00`**) used for
  emphasis and italic display text. A small `Day / Night` toggle in the
  top-right flips to a matching dark mode; the preference is persisted to
  `localStorage`.
- **Editorial typography.** Display serif (**Fraunces**, with opsz and
  SOFT variation axes) for titles, italics, and pull-quotes. Clean sans
  (**Inter**) for UI + body meta. **JetBrains Mono** for eyebrows,
  kickers, and code. Body copy is set in serif at ~19px with a capped
  measure near 60–62ch.
- **One idea per scroll section.** Each chapter (Cover → Case → Arch →
  API → Configure → Compare → Dispatch → Letters → Endmark) gets real
  vertical breathing room (`120px` of section padding by default). No
  section crams three features into one fold.
- **Magazine furniture.** Masthead with a volume/issue kicker, subnav as
  a table of contents, an ornamental rule between chapters, a "Plate I"
  portrait with figcaption on the cover, a contents strip ("In this
  issue"), a drop-cap for the essay, and a colophon in place of a
  legal-ish footer.

## Content it still carries

Despite the lighter chrome, every Jake-voice and content rule holds:

- Stock Unlock framing rule (built → scaled → profitable → not
  full-time → redefining next chapter) — rendered verbatim in the
  "Dispatch" section.
- No real dollar prices. Summary plate and compare table use
  `Market rate + equity`, `Let's talk`, `Contact`, `Free · 30 min`.
- AI philosophy one-liner ("Driver in the driver's seat, not driven by
  the car") lives as the essay pull-quote.
- Two of the anecdotes (Pronk emails + a CommerceHub nod) land
  naturally. Others left out on purpose — one experience shouldn't pack
  all five.
- Numbers Jake owns (13, $1.335M, 8 engineers, 13.95s) appear as the
  essay stat bar — receipts, not vanity metrics.

---

## How it differs from v2

Jake's feedback on v2: "super heavy and dense, very very very dark
themed. Starting to feel a little bit more like AI slop than before."

v3 is a reaction to that, section by section.

| v2 piece | v3 treatment |
|---|---|
| Dark near-black dashboard | **Light cream** by default, dark is an opt-in toggle |
| Announcement bar + heavy nav + `⌘K` search | **Masthead + subnav** (TOC) + one theme toggle |
| Hero with live status card (uptime bars, latency) | **Cover page** with editorial portrait plate, dek, byline |
| Logo row ("Shipped at…") | Removed. One good portrait beats eight greyed-out logos |
| 5-metric numbers strip in solid colour | **Essay stat bar** — four receipts under a hairline rule |
| 6-card feature grid | **One essay** with a drop-cap, pull-quote, four stats |
| 12-node architecture diagram, clickable, SLO panel | **Figure 1** — one center node, four surfaces, dashed lines, a caption. No clicks needed |
| 5-endpoint API docs section | **One endpoint.** `POST /api/hire`, with a `Copy` button |
| 11-row feature matrix | **2-column comparison, 5 rows.** Explicitly called out in the lede as "two shapes, honestly" |
| Configurator with 3 groups + addons | **Configurator, simplified.** Shape + surface only. SKU still generated; the SKU-to-mailto wiring is preserved, add-ons cut |
| Status card + uptime bar + integrations grid | **Cut entirely.** Those were the pieces that pushed v2 into dashboard territory |
| Dense enterprise footer (badges, newsletter, legal column) | **Tight colophon** — name, one paragraph of "set in Fraunces, printed on cream, no tracking pixel", email + GitHub, vol./no. folio |
| Rubik's cube widget + scroll-linked solver | Not carried forward. It was a v2 centerpiece but doesn't belong in an editorial concept — would fight the typography and split focus |

### Visual discipline rules I held myself to

- **One accent.** Burnt orange. No secondary blues, no green status
  dots, no amber warnings. Italics and eyebrows get the colour; most of
  the page is ink on cream.
- **Hairlines, not borders.** 1px `var(--rule)` for section dividers and
  card edges. The strongest line on the page is the single ink-coloured
  bottom border on the comparison-table head.
- **Subtle shadows max.** Cover plate has a ~1px shadow against its
  frame; everything else is flat.
- **No emoji, no icons** other than the decorative `❦` endmark glyph and
  the SVG arrowhead in the architecture diagram. Lucide was pulled; the
  code-block `Copy` is a text button.
- **One display face, one text face, one mono.** Font loading is a
  single Google Fonts request.

---

## If I had more time…

1. **Real pagination** — render the cover + each chapter on its own
   "page", with drop shadows and page numbers in the margin, so
   scrolling feels like turning pages. Would still be CSS-only, using
   `break-before` and a wider-than-viewport stage.
2. **A printed-style `@media print` stylesheet.** The thing actually
   wants to be printed. Matching the screen version to a clean A4
   PDF — complete with running header, page numbers, and a hairline
   folio — would be on-brief and a fun flex.
3. **A second pull-quote inside the essay,** floated right, to break up
   the column the way a long-form magazine spread does. Cut for
   simplicity this pass.
4. **Configurator state in the URL query.** Same idea as v2 — a
   shareable `/?sku=JAKE-13-FT-PRODUCT` link — but never got to it.
5. **Soft light/dark transition.** The current toggle is instant. A
   one-frame cross-fade on `background` and `color` would feel less
   jarring. The reduced-motion guard is already in place.
6. **Real photography.** The cover's `Plate I` is a typographic
   stand-in (a big italic `J`). Jake's actual photo (or a portrait
   engraving) would let the magazine concept land harder — today it
   reads more "letterform portfolio" than "magazine cover".
7. **Voice pass on the stat bar.** "years shipping", "engineers at
   peak" — fine, but a second pass could make these captions sound
   more like Jake writing about himself ("years of not getting bored",
   "engineers I hired and then cut loose").
8. **Tighter mobile breakpoint for the cover title.** `clamp(54px, 8vw,
   104px)` is serviceable but the italic-em line wraps awkwardly around
   420px on some devices. Would hand-tune two more breakpoints.

---

## File map

| File | What it does |
|---|---|
| `index.html` | All markup. Masthead, cover, essay, arch (inline SVG), API, configurator, compare, dispatch, letters, endmark, colophon |
| `styles.css` | ~700 lines. Tokens for light + dark, editorial typography, responsive shell at 980 / 560 |
| `app.js` | ~100 lines. Theme toggle (persisted), configurator wiring, copy-curl button |
| `README.md` | This file |
