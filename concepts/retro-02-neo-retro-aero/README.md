# Retro Hybrid 02 — Neo-Retro Aero

"What Vista would look like if Apple + Rauno Freiberg co-designed it today."

Deep charcoal desktop, tasteful glass panels, tight display type, one teal
accent, outlined icons. Vista's silhouette (desktop + sidebar + glass windows
+ gadgets) — rendered with 2026 polish and discipline.

## Run

No build. Open directly:

```
open index.html
```

or serve locally:

```
python3 -m http.server 8000
# then visit http://localhost:8000/concepts/retro-02-neo-retro-aero/
```

## What's implemented

- **Desktop shell** — animated aurora background (very slow, desaturated),
  grain texture, vignette. No wallpaper abuse.
- **Top menubar** — brand dot, section nav (jumps the inner window),
  live status pills (`signal` / `battery` / clock).
- **Main glass window** (centered-left, Vista-shaped) with chrome:
  - macOS-style traffic-light buttons + centered title `Jake Ruth / personal.exe`
  - Back/forward/reload icon buttons
  - **SaaS-parody content with modern type treatment**: Hero, Features,
    Cube section, Pricing, Testimonials, Legal footer. Tight display
    sizes, generous spacing — not 2006-cramped.
- **Sidebar (right) with modern gadgets**, all executed as the same glass
  primitive:
  - **Identity card** — avatar, handle, pulsing presence dot, tag pills
  - **Clock** — minimalist digital clock + date
  - **Cube state** — live 3×3 front-face preview synced to the main cube
  - **Latest** — four mock Jake notes/tweets
  - **Network** — tiny meters (Uplink / Caffeine / Focus / Inbox)
- **Rubik's cube, scroll-solves.**
  - Pure CSS 3D (transform-style: preserve-3d, six faces, 54 sticker spans).
  - Deterministic scramble at load; scrolling through the cube section
    interpolates scramble → solved. Corners solve first, then edges; faces
    are slightly offset so the solve feels alive, not robotic.
  - Progress bar + caption (`SCRAMBLED → SOLVING → SOLVED`) + mini cube
    in the sidebar stays in sync.
  - Matte sticker palette (desaturated classic cube), subtle inner
    highlight + floor bloom. **No plastic sheen.**
  - On reach-solved: teal brightness flash.
  - When the cube is scrolled out of view, it gently drifts in place so the
    gadget preview never feels frozen.
- **Typography** — Geist (display) + Inter Tight (body) + Geist Mono (chrome,
  eyebrows, meta). Tight tracking on display, generous body leading.
- **Accent discipline** — one teal (`#64FFDA`) used for: progress bar, the
  single `accent` span in the hero, presence dot, featured pricing tier,
  eyebrow dot, gadget glyphs. That's the budget.
- **Shadows** — `0 8px 40px rgba(0,0,0,0.4)` with a single 1px inner-top
  highlight. No stacked drop-shadows, no inner-glow abuse.
- **Icons** — Lucide via CDN UMD. Stroke-width 1.5 everywhere — no raster
  Vista icons.
- **Reduced motion** — aurora/pulse animations disabled under
  `prefers-reduced-motion`.
- **Responsive** — sidebar stacks below main window under 1100px; cards
  reflow to single column below 700–820px.

## Interactions

- Click any topbar nav item → smooth-scrolls the main-window body to that
  section (the window itself is the scroller, not the page).
- Active section is highlighted in the nav as you scroll.
- Scrolling the main window through the **Cube** section drives the solve
  animation; scroll back up to scramble again.
- The sidebar cube tag and the center-caption chip both react to the
  cube's live state.

## What's mocked

- Latest feed items.
- Network gadget metrics (they're vibes, not real metrics).
- Testimonials quotes (lightly paraphrased, labeled clearly as "Field reports").
- Pricing — it's the SaaS-parody tiers, not a real rate card.

## If I had more time...

- Replace the scroll-driven CSS cube with a real sliced-rotation simulation
  (Three.js), still in the matte-aero aesthetic — so the solve is a genuine
  reverse-scramble of valid moves, not a sticker-crossfade.
- Wire the Latest gadget to a tiny JSON file (or the GitHub API) so it's
  actually live.
- Add a command palette (`⌘K`) — very Vista-superbar, very 2026-Raycast,
  the hybrid the concept is going for.
- Per-section "window" effect where a secondary glass panel slides in from
  the side with deeper content (career timeline, project case studies).
- A properly rendered ambient wallpaper photograph dimmed to ~30% rather
  than the purely synthetic aurora background.
- Sound design: a single subtle soft chime on solve, with a mute toggle.
