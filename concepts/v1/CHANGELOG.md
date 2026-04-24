# v1 — CHANGELOG

## 2026-04-20 — integration round (wizard v5 + topnav v4 + transition v4)

Driven by Jake's feedback:
> "The loading's too fast on the last screen for you to actually like
> read the message. So I think that message should go away. There should
> be some obvious transition of you entering in."
> "Very clear guiding to the user where it's like obvious that they click
> the top to navigate from there after going through the startup wizard."

Changes:

- **Wizard is now 2 steps, not 3.** Step 3 ("Booting your Jake Ruth
  experience…") removed entirely. The transition cube IS the loading
  animation.
  - `v1/index.html` rebuilt from `picker-wizard-v5/index.html` with the
    demo variant toggle stripped.
  - `v1/wizard.js` rewritten: Variant A sidebar is the only sidebar
    (v5's B/C banner variants and the `v` keypress cycler are gone).
    On Launch it calls `TransitionCubeV4.playTransition({ destinationUrl })`.
  - `v1/styles.css` slimmed: removed variant B/C CSS, variant toggle
    chrome, and the `.loading` / `.progress-bar` / `.loading-spinner`
    rules.
- **Picker destinations updated** to be direct subpaths (`./xp/`,
  `./readme/`, `./saas/`) instead of `../v1/<exp>/` from the v5 demo.
- **Ambient background** (`v1/ambient.js`) refreshed from v5 — identical
  behavior, kept the file in sync.
- **Top-nav v4 dropped in.**
  - `v1/shared/topnav.js` rebuilt around `v1-topnav-v4/topnav.js` —
    auto-mounts on DOMContentLoaded (the v4 source exposed a manual
    `mount()`; we wrapped it so experiences stay drop-in). Paths
    adjusted from the v4 demo's `../v1/xp/` form back to `../xp/` to
    match the `/v1/<exp>/` deployment shape.
  - `v1/shared/topnav.css` rebuilt from `v1-topnav-v4/topnav.css`,
    merged with the per-experience layout nudges from the old shared
    topnav (xp `.xp-window.explorer`, readme `.gh-header`, saas `.nav`),
    recalculated for the v4 nav height (56px / 52px narrow).
  - JR logo loads from `../../images/logo.gif`. From an experience
    page at `/concepts/v1/<exp>/index.html`, that resolves to
    `Personal-website/images/logo.gif` — verified.
- **Transition cube v4 dropped in.**
  - `v1/shared/cube-solver.js` ← copy of
    `transition-cube-v4/cube-solver.js` (V4 solver, exposed as
    `window.TransitionCubeV4Solver`).
  - `v1/shared/transition-cube.js` ← copy of
    `transition-cube-v4/transition-cube-v4.js`, renamed. Added one
    branch to `resolveSolverSrc` so the renamed file can still find
    its solver when the loader needs to chase it.
  - `window.TransitionCube` alias is preserved — the existing
    `V1Transition` wrapper continues to work.
  - Inline `TransitionCubeV4.initArrival()` call injected at the end of
    `<body>` in each of `v1/xp/index.html`, `v1/readme/index.html`, and
    `v1/saas/index.html` so the arrival-half shrink animation plays on
    every incoming cross-page transition.
- **V1Transition wrapper** updated to prefer `TransitionCubeV4` by name
  first, then the generic `TransitionCube` alias, then hard navigation.
  Dropped the unused `duration: 2800` param that v4 ignores.
- **First-arrival nav onboarding** (new): `shared/topnav.js` shows a
  one-time-per-session cue after the arrival animation settles:
  - Non-current tabs pulse (soft blue glow) for ~3.6s.
  - A floating pill reading `↑ Switch experiences anytime from the top`
    fades in 400ms after cue start and auto-fades after 4s.
  - Gated by `sessionStorage.jrNavOnboardingShown`.
  - `prefers-reduced-motion`: pill shown static, pulse suppressed.
  - Delay: 1000ms after DOMContentLoaded to clear the ~700ms arrival
    phase 3.
- **Docs**: `v1/README.md` rewritten to document the integrated flow.
