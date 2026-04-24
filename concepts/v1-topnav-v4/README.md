# v1 topnav v4 — JR brand left, Variant A tabs centered

The final(-ish) top nav. Pulls the positioning of v3's Variant C
together with the visuals of v3's Variant A, and drops Jake's
custom JR logo in the top-left as a constant.

```
[ JR logo + "Jake Ruth" ]       [ Old-school OS · Code repo · SaaS product ]       [ blank ]
     ^ fixed far-left                 ^ centered as one visual unit                ^ empty on purpose
```

## What it inherits from Variant A

- **Tab chrome.** The segmented-control pill that wraps the three
  tabs. Same 10px radius, same subtle inset border, same hover
  brighten.
- **Cube accents.** The tiny 14px 3x3 sticker mark beside each
  label. Same XP-blue / README-green / SaaS-orange palettes per
  experience.
- **Current-tab highlight.** Filled pill with a 2px bottom-border
  accent tinted to the experience's signature color. Not the
  vertical-divider-plus-dots pattern from Variant C.

## What it inherits from Variant C

- **Centered positioning.** Tabs sit dead-center in the bar as one
  visual unit, not cornered on the right. Done with
  `justify-content: center` on the bar plus `margin: 0 auto` on
  the tabs container (belt and suspenders).
- **Empty edges.** The right side of the bar is blank on purpose.
  The nav reads as "brand on the left, one centered group in the
  middle, nothing on the right."

## What's new in v4

- **JR logo + "Jake Ruth" on the far left.** Jake's custom J+R
  mark from the old site (`../../images/logo.gif`), rendered at
  ~30px tall, with his name in Inter/system-sans 14px next to it.
- The brand lockup **replaces the `← Setup` chip** from earlier
  variants. Clicking it is the return-to-Setup affordance.
- No pill-wrapper frame around the whole nav. No divider between
  brand and tabs. The brand and the tab group are two separate
  objects with empty space between them.

## Why the logo is a constant

A personal site has one author. The brand mark in the top-left
answers "whose site is this?" and that answer doesn't change when
the reader moves between experiences.

Keeping the logo in a fixed spot that doesn't shift does two things:

1. **Unifies the experiences.** XP Luna, the README/git log,
   and ruth/systems start feeling like chapters of one book
   instead of three separate sites that happen to share a domain.
2. **Keeps the jobs separate.** The tab group tells you *where you
   are*. The brand tells you *whose space this is*. Two different
   jobs, two different spots on the bar, neither one competing for
   the other's attention.

The brand is anchored with `position: absolute; left: 20px`, so
when the centered tab group re-centers on window resize the brand
doesn't flinch. On narrow screens (&lt;520px) the name hides and
the JR mark alone carries the lockup — the mark is the constant,
the name is a refinement.

## Routing

Same as v3:

- `V1Transition.go(url)` if the transition cube is loaded.
- Plain `window.location.href = url` fallback when it isn't
  (e.g. opening `index.html` straight from the filesystem).

Current-experience detection is a pathname match on `/xp/`,
`/readme/`, or `/saas/`.

## API

```js
V1TopNavV4.mount(hostElement, {
  current:   "xp" | "readme" | "saas" | null, // optional; auto-detected otherwise
  setupHref: "../v1/",                        // optional; where the brand click routes
  logoSrc:   "../../images/logo.gif"          // optional; override the JR mark
});
```

All three options are optional. Unknown values fall back to
auto-detection and the defaults above.

## Files

- `topnav.js` — drop-in replacement for `v1/shared/topnav.js`.
- `topnav.css` — drop-in replacement for `v1/shared/topnav.css`.
- `index.html` — single-page demo with a current-page simulator
  (dropdown chips + number keys `0` / `1` / `2` / `3`).

## Try the demo

Open `index.html` directly in a browser. Use the
"Simulate current page" chips, or press `0` / `1` / `2` / `3`, to
move the highlighted tab across the three experiences. The JR
logo in the top-left stays put in every state — that's the whole
point.
