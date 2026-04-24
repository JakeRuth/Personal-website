# Concept 12 — Manifesto

Brutalist, typography-first one-pager. A working manifesto in Jake's voice:
conviction up front, proof-of-work inline, austere footer. Stripe Press x
Dieter Rams x mid-century Swiss.

## Run it

Either:

```
open index.html
```

or:

```
python3 -m http.server 8012
# then visit http://localhost:8012/
```

No build step. Vanilla HTML/CSS/JS + Google Fonts over CDN.

## What's implemented

- **Hero thesis** at ~11vw: "Overcharging for bad software is theft from
  people who can't afford to be robbed." Per-line scroll reveal.
- **Four sections**: On Craft, On AI, On Conviction, On Next. Each has a
  numbered kicker (§01–§04), a giant display thesis, and a constrained
  ~60ch serif body.
- **Austere signature footer**: name, place, email, revision, colophon.
- **Custom red caret cursor** — a thin blinking red vertical line. Grows
  over text, grows further over links/buttons/evidence. Hidden on touch
  devices and when `prefers-reduced-motion` is set.
- **Magnetic type** — every character inside the large thesis elements is
  wrapped in a span at load. On mousemove, characters within a ~140px
  radius of the cursor get a gentle repulsive offset and a color lift to
  pure white on the closest ones. Restrained by design: max 6px push,
  no scaling, no weight jitter.
- **Scroll-tied reveal** — `IntersectionObserver` fades each `[data-reveal]`
  element in with a 110ms-per-sibling stagger so multi-line theses
  "type" themselves downward as you scroll into them.
- **Inline expandable evidence** — any underlined dashed-red phrase is a
  click target. Click expands an inline aside beneath the paragraph with
  supporting proof-of-work (Oscar Health, the actual margin-of-safety
  formula, Stock Unlock's stats, the AI house rule). Clicking again
  collapses. Only one evidence panel is open per section at a time.
  Keyboard accessible (Enter / Space).

## Scroll animations to notice

- Hero thesis reveals line-by-line with staggered cubic easing.
- Kicker numerals (§01 etc.) fade in first, then the section thesis
  lines stagger downward, then body paragraphs.
- The scroll hint rule at the bottom of the hero pulses horizontally.
- Top nav uses `mix-blend-mode: difference` so "JR / MANIFESTO" stays
  legible over both dark background and (if any) light blocks.

## Inline expansions — try these

- Hero section: scroll past, all static.
- §01 On Craft: click "not really bugs" or "Oscar Health".
- §02 On AI: click "Money, auth, or shape of the domain?" — reveals the
  hard line between AI-driven and human-reviewed work.
- §03 On Conviction: click "margin of safety as current price divided by
  all-time high" — reveals the exact broken formula. Also click
  "Stock Unlock" for the stats ribbon (YC W22, seed, employees,
  customers, current run rate).
- §04 On Next: click "write to me" for inbound guidance.

## Design notes

- Palette: near-black `#0b0b0c`, bone white `#f3efe7`, single accent
  red `#e23b2b`. Red used exclusively for: caret, the §N kicker numeral,
  italicized accent words inside theses, evidence underlines, the
  left-border of the expanded evidence panel, and the left-border of
  the code callout. That's it.
- Fonts: Unbounded (display), Source Serif 4 (body), JetBrains Mono
  (metadata, code). Mixed deliberately — display is brutalist, body is
  literary, mono is the voice of the machine.
- Measure capped at ~58ch. Body indented from the display column for
  editorial feel.
- No imagery, no icons, no decorations. Typography is the design.

## If I had more time

- Per-character scroll-driven reveal ("type itself" letter by letter)
  tied to `scrollTimeline` when supported, instead of line-level fade.
- A "read aloud" mode that highlights the current sentence with a red
  underline as a synthetic voice reads the manifesto.
- A printable PDF variant generated from the same DOM with proper page
  breaks, headers, and a table of contents — manifestos should survive
  off the web.
- Real hover-preview of the evidence content (tooltip on hover, expand
  on click) so skimmers can sample without committing.
- Anchor links for each section with a thin fixed sidebar of §01–§04
  that highlights the current section as you scroll.
- Variable font weight axis animation on the magnetic chars (requires
  a variable display font — Unbounded's Google Fonts build is static).
- Subtle film grain + vignette for a print-like feel, gated behind a
  toggle.
