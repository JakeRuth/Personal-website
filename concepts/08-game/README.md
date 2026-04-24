# Concept 08 — Explorable Pixel World

A tiny top-down pixel world you walk through. Career landmarks are scattered
around a small twilight map; approach one and a tooltip appears, press E or
Space and a modal tells you the story.

Pure vanilla HTML/CSS/JS. Canvas API. No build step, no engine, no npm.

## Run it

From the repo root:

```
python3 -m http.server 8000
# open http://localhost:8000/concepts/08-game/
```

Or just open `index.html` directly via `file://` — it works.

## Controls

- `W A S D` or arrow keys — move
- `E` or `Space` — interact with nearby landmark / close modal
- `Esc` — close modal
- Click outside modal — close modal

## What's implemented

- 1600x1200 world, 800x600 viewport, smooth camera follow.
- Pixel-art-style player with 4 facing directions, walking bob, drop shadow.
- Axis-aligned bounding-box collision with world edges and every landmark.
  Movement is smooth (not grid-based); player slides along walls.
- 6 landmarks, each with a unique pixel drawing, colored glow pulse, and
  floating name plate:
  1. **SUNY Albany** — brick building with lit windows and an ACM flag
  2. **Oscar Health HQ** — tall NYC tower with animated window lights
  3. **Stock Unlock HQ** — neon-outlined cube with an animated chart inside
  4. **Talent Show Stage** — curtained stage with a tiny unicycle + cube rider
  5. **Wedding Altar** — floral arch on a red carpet
  6. **The Rubik's Monument** — animated 3x3 face
- Proximity detection: inside a landmark's trigger radius, a tooltip floats
  above the structure with name + one-line blurb + interact hint.
- Modal overlay with Jake-voice content for each landmark, era dateline,
  email link, close button, click-outside-to-close, Esc to close.
- Minimap (top right) with colored landmark dots, player dot, and a box
  showing the current camera viewport.
- Ambient decorations: ~130 trees, rocks, and flowers scattered with
  deterministic seeded placement (avoiding landmark footprints), with
  gentle sway / twinkle animations.
- Twilight atmosphere: layered sky gradient, 160 parallax stars, winding
  glow path connecting landmarks, procedural ground tiles, subtle CRT
  scanlines, and a soft vignette over the viewport.

## Landmarks and what they reveal

| Landmark | Era | Reveals |
| --- | --- | --- |
| SUNY Albany | 2011–2015 | Upstate NY, ACM president, first taste of shipping |
| Oscar Health HQ | 2017–2021 | Four years in NYC health-tech at scale |
| Stock Unlock HQ | 2021–now | YC W22, $1.335M seed, profitable side business |
| Talent Show Stage | One afternoon | Unicycle + Rubik's cube onstage at Oscar |
| Wedding Altar | Soon | Getting married, next chapter |
| Rubik's Monument | Always | Competitive cuber, pattern-recognition brain |

## If I had more time

- NPC dialogue: Jake's past selves at each landmark, walking loops.
- Day/night cycle you can scrub with a key.
- Sprite sheet with proper animation frames instead of procedural draw.
- A tiny chiptune loop (WebAudio) and soft footstep blips.
- Touch joystick so it works on phones.
- A "fast travel" option from the minimap (click a dot to warp).
- Coastline / river so the map reads as a place, not just a flat plane.
- Hidden easter-egg landmark (Westchester hometown, Youni, CommerceHub).
