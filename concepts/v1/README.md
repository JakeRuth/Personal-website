# v1 — integrated site

End-to-end, cohesive integration of the jakeruth.com rebuild. One Setup
wizard, three experiences, one shared top-nav, one cube transition that
stitches it all together.

No build step. Vanilla HTML/CSS/JS, CDN libs only.

## Routes

| Route | What it is | Source concept |
| --- | --- | --- |
| `/concepts/v1/` | Setup Wizard picker | `picker-wizard-v5` (Variant A baked in) |
| `/concepts/v1/xp/` | Windows XP Luna desktop | `xp-luna-v3` |
| `/concepts/v1/readme/` | GitHub-flavored README + git log | `readme-git-fusion-v2` |
| `/concepts/v1/saas/` | SaaS marketing page | `saas-v5` |

## Flow

1. Visitor lands at `/concepts/v1/`. The Setup Wizard has two steps:
   **Welcome** with the InstallShield-style Variant A sidebar, then
   **Pick an experience** (three mockup cards: Old-school OS / Code repo
   / SaaS product).
2. On Back/Next the wizard pages between steps. Next is disabled on
   step 2 until a card is selected. Cancel opens the confirm dialog.
3. When the user clicks **Launch** on step 2 (or double-clicks a card),
   the **transition cube** IS the entry animation — there is no longer
   a "Booting…" screen with text that flashes by too fast:
   - Phase 1 (~700ms): cube grows from a point; wizard fades out.
   - Phase 2 (~700-1100ms): cube at full viewport, scrambles + solves.
   - Mid-phase-2 the wizard writes `sessionStorage.jrTransitionArrive`
     and navigates to the destination.
   - Phase 3 (~700ms, now on the destination page): cube shrinks;
     destination content fades in on the inverse curve.
4. Inside any experience, the **shared top-nav** is pinned top:
   - Far left (constant): **JR logo + "Jake Ruth"** — click to return
     to the Setup Wizard via the cube transition.
   - Centered segmented pill: three tabs — **Old-school OS / Code repo
     / SaaS product**. Current tab has a filled pill + an experience-
     colored bottom accent (XP blue / README green / SaaS orange).
   - Clicking a non-current tab fires the cube transition and routes.
   - Clicking the current tab smooth-scrolls to top.
5. **First-arrival onboarding**: on the first experience page visited
   in a browser session (after the arrival cube finishes), the two
   non-current tabs pulse for ~3.6s and a pill appears just below the
   nav reading `↑ Switch experiences anytime from the top`. The pill
   fades in at +400ms, stays visible 4s, then fades out. Gated by
   `sessionStorage.jrNavOnboardingShown` — shown exactly once per
   session. `prefers-reduced-motion`: the pill renders statically and
   the pulse is suppressed.

## Layout

```
v1/
├── index.html              ← Setup Wizard (picker-wizard-v5 chrome, Variant A only)
├── styles.css              ← wizard styles (v5 minus toggle + loading)
├── ambient.js              ← drifting-cubes WebGL bg (picker-wizard-v5)
├── wizard.js               ← 2-step flow, fires TransitionCubeV4 on Launch
├── shared/
│   ├── topnav.css          ← topnav-v4 visuals + onboarding styles
│   ├── topnav.js           ← auto-inject topnav + first-arrival cue
│   ├── transition.js       ← V1Transition.go wrapper over TransitionCubeV4
│   ├── transition-cube.js  ← copy of transition-cube-v4/transition-cube-v4.js
│   └── cube-solver.js      ← copy of transition-cube-v4/cube-solver.js
├── xp/                     ← xp-luna-v3 + shared nav/transition + initArrival() tail
├── readme/                 ← readme-git-fusion-v2 + shared nav/transition + initArrival() tail
└── saas/                   ← saas-v5 + shared nav/transition + initArrival() tail
```

## Which component contributes which files

| Component | Files contributed |
| --- | --- |
| `picker-wizard-v5/` | `v1/index.html` (chrome w/ toggle stripped), `v1/styles.css` (variants B/C + loading rules stripped), `v1/wizard.js` (rewritten around Variant A + TransitionCubeV4 launch), `v1/ambient.js` |
| `v1-topnav-v4/` | `v1/shared/topnav.js` (wrapped with auto-mount + onboarding), `v1/shared/topnav.css` (merged with per-experience layout nudges + onboarding styles) |
| `transition-cube-v4/` | `v1/shared/cube-solver.js`, `v1/shared/transition-cube.js` (renamed from `transition-cube-v4.js`, identical content apart from an extra filename heuristic in `resolveSolverSrc`) |

## Cross-page arrival handoff

The v4 transition component lives on window as **both**
`TransitionCubeV4` and the generic alias `TransitionCube` (the wrapper
`V1Transition.go` tries the v4 name first, falls back to the alias,
then to hard navigation).

Two entry points:

- `TransitionCubeV4.playTransition({ destinationUrl })` — runs phases
  1+2 on the source page, writes `sessionStorage.jrTransitionArrive`,
  navigates. Used by:
  - `v1/wizard.js` on **Launch** (step 2 → experience)
  - `v1/shared/topnav.js` → `V1Transition.go` → `playTransition` on any
    top-nav click (experience ↔ experience, experience → Setup)
- `TransitionCubeV4.initArrival()` — no-op unless the session flag is
  set. When set, plays phase 3 only (shrink + dest fade-in). Wired at
  the end of body on each experience page's `index.html`.

Stale-flag guard: initArrival ignores a flag older than 3 seconds, so a
user pasting a direct experience URL after bouncing away won't play a
mysterious arrival animation.

## How each experience was integrated

Each experience's `index.html` has these five lines in `<head>` (carried
forward from the previous iteration; the script filenames are stable
across versions):

```html
<link rel="stylesheet" href="../shared/topnav.css" />
<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
<script src="../shared/cube-solver.js"></script>
<script src="../shared/transition-cube.js"></script>
<script src="../shared/transition.js"></script>
<script src="../shared/topnav.js" defer></script>
```

And one new inline script at the end of `<body>`:

```html
<script>
  if (window.TransitionCubeV4 && typeof window.TransitionCubeV4.initArrival === "function") {
    window.TransitionCubeV4.initArrival();
  }
</script>
```

Per-experience layout nudges (pushing sticky headers down so they clear
the v1 top-nav) live in `shared/topnav.css` — **not** in each
experience's own CSS. That keeps the alphas drop-in replaceable.

Nav height is **56px desktop / 52px narrow**, unchanged from the prior
shared-nav dimensions within tolerance, so the existing offsets for
xp-luna's explorer window, readme's `.gh-header`, and saas's `.nav`
continue to clear the bar.

## Reduced motion

- **Wizard / picker**: no change; the wizard has no non-essential motion.
- **Transition cube**: v4 falls back to a simple 220ms crossfade when
  `prefers-reduced-motion: reduce` is set. The destination page's
  `initArrival()` no-ops in reduced motion — the page renders normally.
- **Top-nav onboarding**: pulse on non-current tabs is suppressed; the
  pill renders statically without a fade and is removed after its
  normal dwell window.

## How to test locally

```sh
cd /Users/hippofluff/code/Personal-website
python3 -m http.server 8000
```

Then visit:

- `http://localhost:8000/concepts/v1/` — Setup Wizard with Variant A
  sidebar + ambient cubes behind it.
- Next → picker step with three cards + Back/Launch.
- Click a card, click **Launch >** (or double-click a card) — the cube
  should fill the screen, solve, then land on the destination with the
  cube shrinking away as the page fades in.
- Top-nav at top: click a non-current tab — transition + navigate.
- Click the JR brand far-left — transition + return to the wizard.
- First-arrival only: nav onboarding cue plays once per session (~1s
  after arrival) — pulse + pill under the nav.

## Known scaffolding compromises

- The transition relies on three.js loading from a CDN. Offline or
  strict-CSP environments fall back to a crossfade.
- Nav onboarding waits 1000ms after DOMContentLoaded before firing, which
  covers a normal arrival phase 3 (~700ms). A very slow three.js load
  could push arrival past that window — in that (rare) case the cue
  would overlap the tail of the shrink animation. Session flag still
  gets set so it only happens once.
- `shared/transition-cube.js` is a byte-for-byte copy of
  `transition-cube-v4/transition-cube-v4.js` except for one added branch
  in `resolveSolverSrc` that handles the renamed filename. Regenerate
  by re-copying and re-applying that small delta if v4 is updated.
