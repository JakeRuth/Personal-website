# Graph A — Subway Map

**The Ruth Transit Authority.** Jake's career, education, hobbies, projects, people, tools, and identity routed as a schematic transit map in the Harry Beck / Massimo Vignelli tradition.

## Run
Open `index.html` via `file://`, or serve the concepts folder:

```
cd /Users/hippofluff/code/Personal-website/concepts/graph-a-subway
python3 -m http.server 8000
```

Then hit `http://localhost:8000/`.

## What's implemented

- **Seven subway lines**, each a classic saturated transit color, drawn as SVG paths with horizontal / vertical / 45-degree segments and rounded corners at every waypoint.
- **Hand-placed stations** on a `1600 x 1000` viewBox so interchanges line up intentionally (Oscar Health, Stock Unlock, Rubik's Cube, Talent Show, Albany NY, Next Chapter).
- **Three station variants**: normal stops, larger capsule interchanges with a dark inner dot, and a filled terminus with a `?` for the Next Chapter terminus.
- **Legend** in the bottom-left corner showing all seven lines + their letter tags.
- **Geographic flair**: "Hudson Bay" and "Westchester Park" features, compass rose, schematic scale bar ("~13 years").
- **Tooltip on hover** — station name, a one-line Jake-voice brief, and chips for every line it serves.
- **Click a station** → side panel slides in with kicker / title / line chips / Jake-voice body copy / meta grid (era, role, stack, etc.), and the map dims everything that isn't connected to that station.
- **Click a line** (either the path itself or the legend row) → that line pulses + thickens, other lines dim, and the side panel shows the full ordered stop list with the line's color as a left rail.
- **Legend hover** previews the same dim/highlight effect without committing to a panel.
- **Search input** at the top (`try: Oscar · Rubik's · AI · Daniel`) filters in real time against station name/brief/body/meta and line name/motto, dimming everything that doesn't match.
- **Esc** and background click close the side panel.

## Voice
Every station has its own Jake-voice blurb. Stock Unlock carries the "YC W22, $1.335M seed, peak 8 employees, thousands of customers, profitable side business, not full-time" framing exactly. The fiancée station is tastefully opaque on purpose.

## What's mocked / simplified
- Geography is schematic only — no real NYC grid underneath.
- Station label collision handling is manual via hand-tuned `label.dx / dy / anchor` in `data.js` rather than auto-layout.
- No persistence, no URL state, no deep-linking to stations.
- No zoom / pan yet; the whole map fits one viewport (SVG scales with `preserveAspectRatio`).

## If I had more time
- **URL state**: `#station=stock_unlock` to deep-link any station, so this map becomes shareable as a resume.
- **Line sheets**: clicking a line could open a full "service bulletin" PDF-style overlay with inline photos and project links.
- **Pan / zoom** for mobile with pinch gestures — right now it's sized to a desktop viewport.
- **Audio**: a faint subway-station ambience on hover over interchanges. Just for vibes.
- **Printed poster export**: an "export to PDF" button that strips chrome and outputs a print-ready schematic.
- **Timeline overlay toggle** — flip from schematic into a true time-axis Marey chart when you want the dates to mean something literal.

## Files
- `index.html` — SVG shell, topbar, legend mount, side panel, footer.
- `style.css` — paper + ink palette, line colors as custom properties, interchange capsules, panel slide-in.
- `data.js` — the entire system: `LINES`, `STATIONS` (with coords + copy + meta), `LEGEND_ORDER`.
- `app.js` — path router (45/90 with rounded corners), station/label rendering, tooltip, panel, search, legend interactions.
