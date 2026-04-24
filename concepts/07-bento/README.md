# Concept 07 — Bento Grid (Maximalist)

A dashboard of Jake's life: each tile is a miniature interactive experiment with its own personality. Apple iPadOS widgets × vercel.com homepage, but denser and weirder.

## Run it

Open `index.html` directly in a browser (`file://`), or:

```bash
cd concepts/07-bento
python3 -m http.server 8007
# open http://localhost:8007
```

No build step. No npm. Vanilla HTML/CSS/JS only.

## What's implemented

Ten tiles on a 4-column CSS grid (stacks to 2 and 1 on narrower screens).

| # | Tile           | Span | Accent   | Behavior                                                                 |
|---|----------------|------|----------|--------------------------------------------------------------------------|
| 01 | **Bio**         | 2x2  | lime     | Spinning conic-gradient "cube" inside a portrait slot, name, tagline, chips (YC W22, ~13y shipping, NYC, getting married 04/2026). |
| 02 | **NYC clock**   | 1x1  | cyan     | Live NYC time ticking every second; ring shows fraction of day elapsed. |
| 03 | **Stock Unlock**| 2x1  | green    | Count-up animation for 1,400+ users · $450K ARR · $1.335M seed. Tiny SVG sparkline trending up. "Built it · Scaled it · Next chapter." |
| 04 | **Rubik's cube**| 1x1  | magenta  | 3D CSS cube slowly rotating, six colored faces. Click tile to cycle through a handful of mock solve times. |
| 05 | **Now playing** | 1x1  | violet   | Fake Spotify widget, spinning disc, animated equalizer bars, skip button cycles through a mini playlist. |
| 06 | **Reading**     | 1x1  | amber    | Three book spines (color-coded) + titles/authors. |
| 07 | **Contact**     | 1x1  | coral    | Email + GitHub/X/LinkedIn rows. Hover accent + slide. Email is a real `mailto:`. |
| 08 | **Resume**      | 2x1  | sky      | Mock download button (confirms "mock download" briefly). 4 stats tiles. Career trail: CommerceHub → Youni → Oscar → **Stock Unlock** → `?`. |
| 09 | **Reaction timer** | 2x1 | red    | Functional mini game. Click to start, wait for green (random delay), click again to record reaction time. Tracks best. Early clicks register as fails. |
| 10 | **Quote**       | 1x1  | lime2    | Click to rotate through 5 Jake-voice one-liners. Also bound to `q` key globally. |

### Ambient details
- **Cursor spotlight**: soft radial gradient fixed to the viewport follows the cursor.
- **Per-tile spotlight**: each tile has its own accent-tinted radial gradient that follows cursor locally.
- **Subtle 3D tilt**: tiles lean toward the cursor on hover (perspective rotateX/rotateY).
- **Accent-aware borders/shadows**: hover adds an outer glow in the tile's accent color via `color-mix`.
- **Motion**: conic cube spin, 3D cube rotation, equalizer bars, status pulse, `?` pulse on career trail, bobbing download arrow.
- **A11y**: `prefers-reduced-motion` disables animations; every tile is `tabindex="0"` and the spotlight renders on focus too.

## What's mocked
- Stock Unlock stats are the framing numbers (1,400+ users, $450K ARR, $1.335M YC W22 seed). The chart is a seeded noisy uptrend, not real data.
- Resume download shows a mock confirmation instead of downloading a real PDF.
- Now Playing is a canned playlist — no Spotify API hookup.
- Social links point to generic homepages (`github.com`, `x.com`, `linkedin.com`).
- "Personal best: 13.95s" is the stated real number; the other cube times are filler.

## If I had more time
- Wire Now Playing to the real Spotify "currently playing" API (oauth + token refresh on a tiny worker).
- Replace the CSS cube with a real 3D scrambled/solving Rubik's cube (three.js) and let users type a scramble.
- Make the reaction timer leaderboard persist (localStorage already does best; add a last-10 log and distribution).
- A "spring" physics layer so tiles jiggle a touch on grid interaction.
- Drag-to-reorder tiles with layout saved to localStorage — real bento vibes.
- Dark/light toggle, and a "demo mode" that auto-cycles interactions.
- Real portrait image instead of the conic-gradient placeholder.

## Files
- `index.html` — markup for all 10 tiles.
- `styles.css` — dark theme, grid, per-tile styling, accents via CSS custom props + `color-mix`.
- `app.js` — clock, count-ups, chart path, cube cycle, song cycle, reaction game, quote rotate, spotlight + tilt.
