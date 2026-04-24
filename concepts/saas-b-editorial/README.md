# SaaS Vector B — Editorial Minimal

**Jake Ruth — A Monograph.**
Stripe Press / Arc Browser / Rauno Freiberg lineage. The quiet one.

---

## How to run

Open `index.html` directly (works over `file://`), or serve:

```
python3 -m http.server 8000
# then visit http://localhost:8000/concepts/saas-b-editorial/
```

No build step. No npm. Three files: `index.html`, `styles.css`, `script.js`.

---

## What's implemented

- **Nav** — sticky, hairline-ruled, four links (Work · Thinking · Stock Unlock · Hire). The "Hire" link is in the house accent (burnt orange, italic Fraunces). Active section underlines automatically while you scroll.
- **Hero** — Fraunces italic display type, variable optical sizing pushed to 144. Eyebrow small-caps in JetBrains Mono. One sentence of understated pitch. No CTA buttons — just the Hire link up top.
- **Chapter One — "The work"** — Contract / Full-Time / Equity Founding rendered as a **pricing TABLE**, no buttons. Columns: Tier · Scope · Rate · Availability. Availability dots in accent for "taking", outlined for "rare". Roman numerals for tier numbers. Italic footnote on walk-away terms.
- **Chapter Two — "What I bring"** — six typographic list items with 2-line descriptors, no icons. Includes a **small chapter map** (SVG network graph, 7 nodes) above the list, captioned "Figure 1".
- **Chapter Three — "Thinking"** — four pull-quotes in large Fraunces italic, including the "theft from people who can't afford to be robbed" quote, the driver-in-the-driver's-seat AI quote, the Stock Unlock next-chapter quote, and a craft note.
- **Chapter Four — "Currently"** — colophon-style `<dl>` status block: Based (NYC), Taking, Running (Stock Unlock framing: YC W22, $1.335M, 8 peak, thousands of customers, profitable side business, not the last thing), Reading, Shipping, Cubing (13.95s, unicycle talent show), Life (getting married).
- **Chapter Five — "References"** — three testimonials rendered as **epigraphs** with a left rule, initials + role attribution.
- **Correspondence section** — the only email-forward moment. Fraunces italic `jake@stockunlock.com`, with a polite note on what to include.
- **Footer colophon** — "Set in / Made with / Published from / Correspondence" grid, hairline horizontal rule, signature line with First Edition mark.
- **Rubik's cube dingbat** — a small 28px 3D cube between every section. Subtle idle breathing rotation, hover to do a full turn. Focusable for keyboard. Not a hero element; used exactly as an ornamental chapter marker.
- **Network graph** — small, quiet, hand-placed. 7 nodes (Jake at center, connected to Systems / Founding / Product / AI / Finance / Craft). Accent dot on self. Mono labels. Deliberately not interactive — it's a diagram in a book.
- **Dark mode** — responds to `prefers-color-scheme: dark`. Warm dark paper (not black), same ink hierarchy. Accent shifts a half-step lighter for contrast.
- **Reduced motion** — respected. Cubes stop breathing, smooth scroll disables, fade-ins hold.
- **Responsive** — table collapses to stacked rows under 860px, nav tightens, colophon grid folds to one column on small phones.

## Typography

- **Fraunces** — display and most body. Uses variable axes: `opsz` (9–144), `SOFT`, `WONK`. Italic gets `WONK` bumped to get the funky curly tails that make it feel like Stripe Press / Arc.
- **Inter Tight** — small UI text, availability labels, occasional body.
- **JetBrains Mono** — signage: eyebrows, chapter markers, column headers, figcaptions, colophon labels.

All from Google Fonts via a single link tag. No FOIT tricks.

## Interactions

- Hover any Rubik's cube dingbat — it completes a full rotation.
- Scroll — sections fade in 12px from below, once.
- Scroll — nav underlines the current section.
- Open devtools — there's a quiet console colophon.

## What's mocked

- Testimonial initials are fictional placeholders (A.L., M.R., K.D.).
- "Currently reading" book list is illustrative.
- Contract hourly rate (`$325`) is a plausible placeholder — real number is Jake's call.
- The chapter map graph is a static diagram, not data-driven.

## If I had more time

- Typeset a second page: a proper "Thinking" long-read with drop caps, side notes, and a real running-text layout — use Fraunces' `opsz` properly as body.
- Replace SVG chapter map with a tiny d3-force layout (still tasteful, still small) so hovering a node previews a short essay on that discipline.
- A "Print" stylesheet that actually produces a beautiful PDF monograph — the content is already written for it.
- Commission real testimonials with real names.
- A Monograph, Second Edition page with a changelog. Because this aesthetic wants a changelog.
- Swap the generic cube faces for a proper solved-state Rubik's cube with sticker colors — restrained palette though (the cube should still feel like an ornament, not a logo).

---

Made on the open web, NYC, 2026.
