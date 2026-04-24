# Concept 06 — Diary (Longform Scrolly)

A single, very long designed scroll that tells Jake Ruth's career as six acts. Editorial / NYT-magazine-meets-Stripe-Press vibe. Dark background, serif display, mono accents, each chapter has its own accent color. Scroll is the only navigation device.

## Run it

Open `index.html` directly via `file://`, or:

```
cd concepts/06-diary
python3 -m http.server 8006
# then open http://localhost:8006
```

No build step. No npm. Fonts from Google, everything else local.

## What's implemented

- **Overture / masthead** — `Vol. 01 · A Diary in Six Acts`, big display lockup, meta strip, scroll hint.
- **Chapter 1 — Before Code** — ASCII Win 95 + Guitar Hero art, a pixel/gradient Rubik's cube with a subtle hover rotation, three metric tiles (13.95s, 1995, ∞).
- **Chapter 2 — The Pivot** — A fake `javac Hello.java && java Hello` terminal whose contents type themselves out **tied to scroll position** (reversible when you scroll back).
- **Chapter 3 — Rising** — A horizontal `code quality` meter that fills non-linearly as you scroll: it climbs, dips at "took down prod," then finishes at ~94%. Year ticks + callout labels.
- **Chapter 4 — Oscar** — A procedurally generated SVG timeline showing eng headcount (blue bars, 50→158) vs. my scope (yellow), drawn and animated when the chapter enters view.
- **Chapter 5 — Stock Unlock** — A scroll-tied SVG stock chart that draws on (stroke-dashoffset) as you scroll; milestone dots + labels reveal once their x-position has been drawn (`YC W22`, `$1.335M seed`, `8 @ peak`, `profitable`). Gradient fill underneath.
- **Chapter 6 — Now** — A terminal showing `cat thesis.md` that types out Jake's AI thesis as you scroll, with syntax highlighting (headers, keywords, sign-off). Sign-off links to jake@stockunlock.com. Colophon at the end.

## Scroll interactions to notice

- **Progress bar** at the top of the viewport changes color to match the current chapter's accent.
- **Right-side rail** of chapter dots: active chapter expands its label; click any dot to smooth-scroll there.
- **Custom cursor** — small circle that expands over interactive targets. Uses `mix-blend-mode: difference`.
- **Reveal-on-scroll** for headings, prose blocks, and visuals via IntersectionObserver.
- **Four scroll-tied animations** (Hello World typewriter, code-quality meter, stock chart draw-on, AI thesis typewriter) that all read from `getBoundingClientRect()` and compute a local 0..1 progress band. Scrolling back up reverses them.
- **Oscar timeline** uses a different pattern (fire-and-forget once in view, with staggered transition delays) so the bars feel like they're being plotted, not scrubbed.

## What's mocked / stubbed

- **Rubik's algorithm replay** — listed in the brief as a possible interactive. Stubbed here as a static pixel-gradient cube tile with a hover rotation rather than a live solve animation. The two scroll-tied typewriters (Hello World, AI thesis) and the scroll-tied stock chart cover the two required "working interactive moments."
- **Timeline numbers** — Oscar headcount bars use representative numbers (50→158) consistent with the brief's "50 to 150+" framing, not a leaked org chart.
- **Stock chart** — not real Stock Unlock revenue. It's a narrative curve: pre-product flat, Daniel-saga lift, YC / seed spike, peak at 8 employees, post-handoff stabilization.
- **Code quality meter** — obviously vibes-based.
- **Reduced-motion** — not yet handled; on a real build I'd honor `prefers-reduced-motion`.

## If I had more time

- Build the Rubik's algorithm replay for real: a text-based cube state stepping through `R U R' U' R U R' U'` with a scrub-along-scroll transformation.
- Pin the stock chart with real sticky behavior so it stays locked center-screen while the prose beats on the left scroll past it (currently sticky on desktop, static on mobile).
- Snap-to-chapter on desktop trackpad, with a soft easing so you can still free-scroll.
- Drop-caps on the first paragraph of each chapter.
- A sound toggle: very quiet ambient tone that shifts pitch per chapter.
- Share-a-chapter deep links that auto-scroll + highlight.
- Real `prefers-reduced-motion` fallback that presents the whole thing as static article.
- Inline pull-quotes (NYT-style) every other chapter.
- Swap the ASCII Win 95 block for a proper CSS-art scene (skateboard, cube, guitar controller as separate parallax layers).

## File map

```
06-diary/
├── index.html   markup for all six chapters + overture + colophon
├── style.css    typography system, per-chapter themes, terminal/meter/chart styling
├── script.js    scroll orchestration, 4 scroll-tied animations, custom cursor, rail
└── README.md    you are here
```
