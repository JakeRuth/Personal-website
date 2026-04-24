# picker-jukebox

One of thirteen parallel prototypes for the Jake Ruth personal-site rebuild.
This one is the entry picker — a chrome-and-neon jukebox that lets the visitor
dial in which version of the site they want to read.

## Aesthetic chosen

**(a) Retro jukebox.** Wurlitzer energy — chrome bezels, a glass marquee
scrolling across the top, an amber dot-matrix "now playing" display, gold
piping, a red bakelite PLAY button the size of a fist, and the visitor's
five chapters pressed onto the rotor like 45s on a selector wheel.

Why this one over the radio / channel-knob / synth variants:

- Rotary dial is central to the brief, and a jukebox selector is the version
  of a rotary dial that carries the *most* personality per pixel. It already
  expects track names on the wheel, which maps one-to-one onto the five site
  modes.
- The metaphor lands instantly. "Five sides, one artist" — pick a side.
- Chrome + red + gold lets the rest of the UI (the amber scrolling display,
  the neon marquee) read as obviously diegetic rather than decorative.

## How to use

- `open index.html` directly (works over `file://`), or
- `python3 -m http.server` from this directory and open the port.

No build step, no npm, no bundler. One HTML file, one CSS file, one JS file,
pure vanilla.

### Controls

- **Drag the dial** in a circular motion — it has weight, overshoots slightly,
  settles into the nearest detent.
- **Arrow keys** (left/right or up/down) step one side at a time.
- **Mouse wheel** over the dial scrubs it.
- **Number keys 1-5** jump directly to a side.
- **Click a row** in the TRACK LISTING on the right to jump to it.
- **Enter / Space** or the big red PLAY button commits the selection. You
  get a clunk, a shake, a cue card, and a redirect to the matching mode
  under `../<slug>/`.
- **SOUND** toggle (top left of the controls bar) enables a soft tick on
  each detent and a mechanical clack on launch. Muted by default so the
  site doesn't ambush anyone. Press `M` as a shortcut.

### The five sides

| Side | Slug                  | Title            |
|------|-----------------------|------------------|
| A1   | `xp-luna-v2`          | Nostalgic OS     |
| A2   | `enterprise-saas-v2`  | Enterprise SaaS  |
| B1   | `git-log-v2`          | Engineer Native  |
| B2   | `readme-mode`         | README           |
| B3   | `vista-faithful-v2`   | Aero Glass       |

## How the rotor works

- Five slots at 72° apart on a conic stack inside the bezel.
- Pointer-drag maps angle-around-center to disc rotation; released drag hands
  off to a tiny spring-damper loop (`k=0.12`, `damp=0.72`) that pulls to the
  nearest detent with a little overshoot.
- Slots announce themselves to the amber display, the tracklist, and the
  thumbnail stage on every detent change, so the feedback loop is continuous
  whether you drag, key, click, or scroll.
- The thumbnails are CSS-only caricatures of each mode (XP bliss taskbar,
  SaaS dashboard, git log, README markdown, Aero glass pane). They're meant
  to read at a glance, not be faithful.

## If I had more time

- **Real per-mode album art** instead of CSS thumbnails — a tiny 400x300
  still captured from each actual destination mode.
- **A coin-drop easter egg** — clicking the INSERT plate plays a coin-drop
  sound and spins the dial a free half-rotation before coming to rest.
- **Persistent last-pick** in `localStorage` so returning visitors start on
  the side they last played.
- **Tilt parallax** on the chrome bezels tied to cursor position for a
  heavier physical feel.
- **An actual 7-segment VFD font** for the display instead of Courier.
- **Hand-tuned per-mode tick pitches** — a low detent tick for A sides, a
  higher one for B sides. It's small but it's the kind of thing a jukebox
  would do.
- **Kill the marquee when `prefers-reduced-motion`** is set (already handled
  globally via the animation-duration override, but a bespoke static version
  would read better).
- **Mobile polish** — the vertical stack works but the rotor wants a proper
  inline layout on short-and-wide phones.
