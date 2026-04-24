# graph-b-constellation

Network Graph Vector B — a **star map / constellation** rendering of Jake Ruth's career, skills, hobbies, projects, people, and AI tools.

Open `index.html` directly (`file://`) or serve it:

```
python3 -m http.server 8000
# then visit http://localhost:8000/concepts/graph-b-constellation/
```

No build. Vanilla HTML/CSS/JS. Only external dependency is Google Fonts (Cormorant + Inter) via CDN.

## What's implemented

- **Canvas-based star field** (2D canvas with manual hit-testing). ~260 ambient background stars + 35 named "real" stars across 6 constellations.
- **6 constellations**, each with its own tint:
  - Ursa Careerum (career, warm red-giant)
  - Caelum Fabrorum (skills, blue-white)
  - Lusus Corona (hobbies, pink-rose)
  - Fabrica Stellae (projects, green)
  - Amici Stellarum (people, violet)
  - Machina Lucis (AI tools, pale gold)
- **Faint constellation lines** connecting stars within each constellation.
- **Twinkling** — every star (background + named) phases brightness on its own sine clock with random phase/speed.
- **Ambient drift** — the whole sky very slowly pans; background stars drift less than foreground ones (parallax).
- **Hover** — nearest star within threshold lights up with a bigger glow halo, and a soft Cormorant label appears above it.
- **Click a star** — camera smoothly zooms to 1.8x and offsets the star; all other stars dim to ~20%; a detail panel fades in with a 2-3 sentence Jake-voice blurb and optional meta.
- **Click background** — zoom out, clear selection.
- **Keys 1–6** — focus a constellation (dim the rest + light camera pan). **0** or **Esc** resets.
- **Legend** in the top-right — click a constellation name to focus/unfocus.
- **Shooting stars** — one crosses the sky every ~14–26 seconds with a fading trail.
- **Nebula wisps** via a layered radial-gradient on `body::before` for atmospheric depth.

## What's mocked / shortcuts

- Star **positions are hand-placed** in a virtual 1000x620 sky. Not algorithmically laid out — I chose positions that form roughly recognizable shapes and keep constellations in distinct regions of the sky.
- **Content blurbs** are in Jake voice but the dates / one-liners are a best-effort mix of the brief's facts and plausible filler. They'd want a pass from Jake himself for accuracy.
- **Hit-testing** is distance-based against star centers. No real SVG layer — threshold scales with star magnitude so bigger stars are easier to click.
- Google Fonts is the only CDN dependency. If you open this on a plane with no wifi, it'll fall back to system fonts. The aesthetic still mostly holds.
- **Parallax** is implemented only for background stars. Named stars all live on a single depth plane (mostly to keep constellation geometry readable).
- **Constellation shapes** (Ursa Careerum etc.) are invented — the Latin-ish names are vibes-first, not astronomy.

## Interactions, summarized

| Action | Result |
| --- | --- |
| Hover a star | Star brightens, soft label appears |
| Click a star | Camera zooms in; detail panel fades in; others dim |
| Click empty sky | Zoom out, clear selection |
| Click legend item | Focus that constellation (or unfocus if re-clicked) |
| `1`–`6` | Focus constellation N, light pan toward its centroid |
| `0` / `Esc` | Reset everything |
| Close button on panel | Clear selection |

## If I had more time…

- **Real clickable SVG overlay** for stars — better accessibility (focusable, keyboardable per-star) and fewer hit-test misses at odd aspect ratios.
- **Physics** — a gentle force-directed jiggle so stars breathe, not just twinkle.
- **Audio** — an optional ambient pad (very very quiet) that swells when you select a star. Opt-in obviously.
- **Real parallax across named stars** — currently I prioritize readable constellation shapes over depth. A compromise would be to let constellations wobble as a group with their own depth.
- **Shape-matching the constellations** to things that actually mean something (Career as a rising arc, Skills as a toolbox polygon, etc.).
- **Mobile gestures** — pinch-zoom, two-finger pan. Right now it works on mobile but it's click-driven.
- **Intro moment** — on first load, stars "resolve" in one at a time with a breath of motion before the masthead fades up.
- **Reduced-motion** mode — respect `prefers-reduced-motion` to cut drift, twinkle, and shooting stars.
- **Share / deep-link** — `#stockunlock` in the URL opens with that star selected.
