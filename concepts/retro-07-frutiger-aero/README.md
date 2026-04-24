# Retro Hybrid 07 — Frutiger Aero

Jake Ruth's personal site, rendered in the 2004-2013 Frutiger Aero aesthetic: glass panels, water droplets, spring-green lawns, sunset-orange sun, blue skies, floating bokeh. Optimistic futurism — the opposite of doomer-minimal.

## Run

Open `index.html` directly (`file://...`) or serve the folder:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000/concepts/retro-07-frutiger-aero/
```

No build step. No npm. CDN-only (Three.js r128, Google Fonts Manrope + Karla).

## Files

- `index.html` — markup: sky scene, 3D cube stage, floating glass panels, ribbon nav.
- `styles.css` — all visual styling. Water/spring/sun palette, glass utility, water-droplet buttons, bubble accordions, responsive layout.
- `app.js` — bokeh canvas, chillwave toggle (WebAudio), Three.js translucent Rubik's cube, network-graph canvas, nav spy, bubble expand/collapse.

## What's implemented

- **Full-bleed CSS nature scene** — layered sky gradient with a warm sun, three drifting clouds, a soft green lawn that curves up from the bottom, and a blurred leaf hint in the corner. No external image dependencies.
- **Bokeh particles** — canvas of translucent orbs slowly rising, gentle horizontal sway. ~40 orbs, respects `prefers-reduced-motion`.
- **Hero glass panel** — Jake's name in a reflective water-to-green gradient, pitch copy, two water-droplet buttons, chips for YC W22 / $1.335M / profitable / 13.95s cube average.
- **Bubble panels** — Career, Stock Unlock, Projects, Hobbies. Each is a glass bubble with gloss highlights that expands inline when clicked. Each has a themed specular icon (water / spring / sun / sky).
  - Career: four-stop timeline (Stock Unlock, Oscar Health, Youni, CommerceHub) + SUNY Albany / ACM.
  - Stock Unlock: six-stat glass grid ("YC W22", "$1.335M seed", "8 at peak", "1000s customers", "profitable", "next chapter") plus a short narrative.
  - Projects & Hobbies: water-droplet bulleted lists.
- **Translucent 3D Rubik's cube** (Three.js, CDN) — 27 cubelets with gloss-stickered faces in the site palette (water/spring/sun/pink/white/yellow), wrapped in a faint glass hull. Floats behind the content and **ambient-solves**: it does slow random face turns, with scroll momentum nudging more turns. Fixed to the viewport with pointer-events disabled so it never blocks clicks.
- **Network graph** — canvas panel where Jake's node sits at center, connected by fiber-optic light rays to companies (Stock Unlock, Oscar, Youni, CommerceHub), projects (YC, ACM), and hobbies (cube, unicycle, getting married). Gentle drift animation, traveling packet dots along each edge.
- **Chillwave toggle** — ambient pad synthesized in WebAudio (no external audio file): three detuned sine oscillators on an A-major-ish chord, slow LFO on a lowpass, a quiet bandpassed noise wash. Muted by default. Pill button has a bouncy EQ meter that animates when on. Fades in/out.
- **Ribbon nav** — sticky glass pill ribbon at top with droplet wordmark + section links + chillwave toggle. Active-section highlighting on scroll.
- **Footer** — tiny glass pill with build info.
- **Responsive** — collapses to single-column below 980px, hides nav on mobile.
- **Reduced motion** — clouds, sun pulse, bokeh, and cube turns all pause when `prefers-reduced-motion: reduce`.

## Interactions

- Click any bubble header (Career / Stock Unlock / Projects / Hobbies) to expand its contents.
- Click **chillwave: off** to start the ambient pad; click again to fade it out. Muted by default — never autoplays.
- Scroll the page — the cube behind the panels solves faster while you scroll, idles gently when you stop.
- Ribbon nav links smooth-scroll to each panel and highlight the current section.
- Everything behind the panels (cube, sky) is non-interactive; all clicks fall through to the panels and buttons.

## Voice

Copy is written in Jake's voice: interesting, quirky, a little edgy, but warm. Stock Unlock is framed as "built it · scaled · profitable · not full-time · next chapter" per the brief. Hobbies get their due — the 13.95s cube average, the unicycle-cube talent show, the wedding. Contact CTA leads to `jake@stockunlock.com`.

## If I had more time...

- **Real macro nature photo** background — I committed to a pure CSS scene so it opens from `file://` with zero dependencies, but a real water-on-leaf macro would push the aesthetic harder.
- **Reflective cube environment map** — right now the cube is translucent + glossy but not actually reflecting the scene. A `PMREMGenerator` environment (a procedural sky cubemap) would give the face stickers proper aero reflections.
- **More cube choreography** — queue real 3x3 solve sequences (CFOP cross, F2L, OLL, PLL) rather than random turns, so the cube actually solves over the course of a scroll.
- **Network graph interactivity** — drag nodes, click a node to filter the timeline / bubbles to show only related entries.
- **Weather layer** — occasional slow rainstreak behind the glass, or a drifting hot-air balloon. Pure Aero.
- **Page transitions** — if a visitor clicks "what I built", the hero bubble could physically float aside as the Stock Unlock bubble zooms to prominence (FLIP-style).
- **Swap synth pad for curated chillwave loop** — a real chillwave track, gated behind the same mute-by-default toggle, with attribution.
- **Accessibility pass** — add proper `aria-live` updates when the chillwave state changes; keyboard nav for the cube; tested with a screen reader.
