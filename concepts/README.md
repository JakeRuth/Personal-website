# Concepts

Twelve prototype directions for the jakeruth.com rebuild, built in parallel by Claude subagents on 2026-04-21. Each is self-contained, runnable from file://, and has its own README inside its directory.

## How to browse

From the repo root:

```bash
python3 -m http.server 8000
```

Then open <http://localhost:8000/concepts/> for the gallery launcher. Click any card to open that concept.

Some concepts (anything with ES modules or 3D) may have issues over `file://` — always use the HTTP server above to be safe.

## The twelve

| # | Name | Direction | Standout interaction |
|---|------|-----------|---|
| 01 | [SaaS Parody](./01-saas-parody/) | marketing parody where Jake IS the product | magnetic hover tiles; type `ship` for easter egg |
| 02 | [Terminal](./02-terminal/) | full CRT shell with 12+ real commands | `cube --solve`, `sudo hire-me`, tab completion |
| 03 | [jakeOS](./03-os/) | desktop with draggable windows, 8 apps | double-click icons, drag windows, embedded terminal |
| 04 | [Rubik's Cube](./04-rubiks-cube/) | 3D Three.js cube, face-click reveals sections | click faces, press Solve, type `R U R' U'` |
| 05 | [Billboard](./05-billboard/) | hyperminimal single viewport, magnetic type | cursor near headline; press K to cycle accent |
| 06 | [Diary](./06-diary/) | longform scrolly editorial, 6 chapters | scroll tied interactives, chapter rail |
| 07 | [Bento Grid](./07-bento/) | 10-tile maximalist dashboard | reaction-timer mini-game, click the quote tile |
| 08 | [Pixel World](./08-game/) | WASD explorable 2D world with landmarks | walk to buildings, press E |
| 09 | [Network Graph](./09-network-graph/) | force-directed graph of career + skills + people | cursor repels nodes; press `/` to search |
| 10 | [Chatbot](./10-chatbot/) | fake chatbot that answers anything about Jake | click suggestions; rich embedded blocks |
| 11 | [Blueprint](./11-blueprint/) | career as engineering floor plan, pan/zoom | drag to pan, wheel to zoom, press 1-6 |
| 12 | [Manifesto](./12-manifesto/) | brutalist typography essay with inline evidence | click underlined phrases; watch the red caret |

## Status

- Prototype fidelity. Not production. Core interactions work; some content/features are stubbed (flagged in each concept's README).
- Nothing committed to git. Everything is local-only until you decide what survives.
- No build step required for any of them. Vanilla HTML/CSS/JS across the board, with CDN libs where needed (Three.js, D3, Google Fonts, GSAP).
