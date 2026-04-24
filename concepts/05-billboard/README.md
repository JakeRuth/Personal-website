# Concept 05 — Billboard (Hyperminimal)

One viewport. No scroll. No nav bar. No footer. The entire site is a single
meticulously-typeset plate — Hermès × Apple × Bauhaus, with a warm amber accent
and a slow, breathing background. The first five seconds should feel less like
a portfolio and more like the opening of a short film.

Open `index.html` directly (`file://`) or run:

```
python3 -m http.server 8000
```

and visit `http://localhost:8000/concepts/05-billboard/`.

## What's implemented

- **Single fullscreen composition.** `html, body { overflow: hidden }`.
  Everything lives in one grid-centered stage.
- **Billboard thesis:** _"Built it. Scaled it. Now, the next thing."_
  Three lines — sans, sans, italic serif — with the last four words (_"next thing."_)
  drawn in the accent amber. The Stock Unlock framing is encoded in the type itself.
- **Magnetic glyphs.** Every letter is wrapped in a `<span class="glyph">`. A
  single `requestAnimationFrame` loop computes the distance from the cursor to
  each glyph's center, applies a smooth falloff, and translates + scales the
  glyph toward the pointer. Interpolated with `lerp(..., 0.14)` so motion feels
  analogue, never twitchy.
- **Word row.** `about · career · stock-unlock · resume · contact` in lowercase
  mono. Hover opens an increased letter-spacing + amber underline that draws
  from the left.
- **Peek panel.** A glass-morphism card with italic serif title and mono
  eyebrow metadata follows the cursor loosely. It does not replace the page —
  it hovers. One peek per link; all copy lives in `PEEK_CONTENT` in `app.js`.
- **Breathing background.** Three colored blur blobs drifting on a 28s loop +
  a procedurally-regenerated noise canvas at ~12 fps + a soft vignette.
  Feels alive, never distracts.
- **Corner marks.** Pulsing amber dot (top-left), live clock (top-right),
  NYC coordinates (bottom-left), and an "Edition 01 / no.05" stamp (bottom-right) —
  the site feels printed, not rendered.
- **Custom cursor.** Small amber ring with `mix-blend-mode: difference`,
  scales up over any link.
- **Keyboard easter egg.** Press `K` to cycle the accent color
  (amber → electric blue → coral → acid lime).
- **Reduced motion respected** — magnetic animations and drift are disabled
  when `prefers-reduced-motion: reduce`.
- **Responsive down to ~380px.**

## What's mocked

Very little by design. The `resume` peek hints at a PDF; there is no PDF —
the anchor is `href="#"`. Likewise `about`, `career`, and `stock-unlock` are
peek-only (there is no page to route to — that is the concept). The contact
link is a real `mailto:`.

## Magnetic interactions to notice

1. Sweep the cursor slowly across the headline — letters lean toward you,
   then settle. Notice how the italic "next thing." glows slightly warmer
   as letters scale up and into the accent shadow.
2. The punctuation (`.` and `,`) is already amber; it reads as a separate
   rhythmic layer from the glyphs.
3. Hover the word row — track how the letter-spacing opens up and the
   underline draws left-to-right in amber.
4. Hover `stock-unlock` — the peek panel glides in and then trails your
   cursor with a softer follow than the cursor itself. The two speeds
   (cursor fast, peek slow) give the page depth without parallax.
5. The corner dot pulses on a 2.6s cycle; the aurora blobs drift on 28s;
   the clock ticks at 1s. Three clocks, unsynced — the site breathes.

## If I had more time...

- Swap the noise canvas for a proper WebGL shader (organic film grain with
  temporal correlation, or a slow Perlin warp on a dark plate).
- Variable-font weight modulation: have glyphs near the cursor gain weight
  rather than scale, using Fraunces' `wght` axis — more elegant than transform.
- Cursor-driven chromatic aberration on the headline (RGB channel split),
  very subtly — the watch-ad move.
- Add a "loader" that types the thesis one glyph at a time with GSAP
  SplitText on first paint.
- SFX: a single sub-audible low tone on hover, the kind that plays under
  perfume ads. Off by default, togglable.
- Second composition that auto-crossfades every 40s, so returning visitors
  see a new billboard each visit.
- Per-peek link targets that smooth-zoom into a second plate (still one
  viewport, no scroll — just a new composition) with a shared-element
  transition on the word.
