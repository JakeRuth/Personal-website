# jakeruth.com

Personal website. One Setup wizard → three experiences, stitched by a cube transition.

No build step. Vanilla HTML/CSS/JS, CDN libs only. Deployed to GitHub Pages from `master`.

> **AI-built framing (TBD):** Per `CLAUDE.md`, this site is built entirely with Claude Code and reviewed by Jake. Exact public framing wording to be decided before re-push.

## Routes

| Route | What it is |
| --- | --- |
| `/` | Setup Wizard (entry) |
| `/xp/` | Windows XP Luna desktop |
| `/readme/` | GitHub-flavored README + git log |
| `/saas/` | SaaS marketing page |

## Flow

1. Visitor lands at `/`. Two-step Setup Wizard: **Welcome** → **Pick an experience**. On Launch the transition cube grows to fullscreen, scrambles + solves, navigates, and shrinks away as the destination fades in.
2. Inside any experience, the shared top-nav is pinned top. Three tabs switch experiences via the same cube transition. JR brand (far left) returns to the Setup wizard.
3. First visit of a session: non-current tabs pulse briefly + a one-time pill appears under the nav hinting at the switch affordance. Gated by `sessionStorage.jrNavOnboardingShown`. `prefers-reduced-motion` suppresses pulse and static-renders the pill.

## Layout

```
/
├── index.html         ← Setup Wizard
├── styles.css         ← wizard styles
├── ambient.js         ← drifting-cubes WebGL background
├── wizard.js          ← 2-step flow, fires TransitionCube on Launch
├── shell/             ← cross-experience chrome (nav + transition)
│   ├── topnav.{css,js}    ← top-nav, auto-injected on every experience
│   ├── transition-cube.js ← grow → solve → navigate → shrink
│   └── cube-solver.js     ← 3x3 solver (used by the transition + XP widget)
├── xp/                ← Windows XP Luna experience
├── readme/            ← GitHub README + git log experience
├── saas/              ← SaaS marketing experience
├── content/           ← canonical content + voice rules
│   ├── content.json       ← single source of truth for facts
│   ├── VOICE.md           ← tone rules
│   └── PARITY_AUDIT.md    ← cross-experience parity tracking
├── images/            ← logo, portraits, etc.
├── CLAUDE.md          ← durable project context for AI sessions
├── DISCOVERY.md       ← discovery-phase voice-to-text notes
├── CHANGELOG.md       ← integration history
└── CNAME              ← binds jakeruth.com
```

## Cross-page transition

`TransitionCube` is available on `window` and has two entry points:

- `TransitionCube.playTransition({ destinationUrl })` — runs grow + solve on the source page, writes `sessionStorage.jrTransitionArrive`, navigates. Called by `wizard.js` on Launch and by `shell/topnav.js` on any nav click.
- `TransitionCube.initArrival()` — no-op unless a fresh session flag is set. When set, plays shrink + dest fade-in. Auto-fires on DOMContentLoaded; pages don't need to call it explicitly. Stale-flag guard: ignores flags older than 3 seconds.

Three.js falls back to a 220ms crossfade if the CDN fails to load, and the whole transition collapses to the crossfade under `prefers-reduced-motion: reduce`.

## Serve locally

```sh
python3 -m http.server 8000
```

Then visit `http://localhost:8000/`.

## Deployment

GitHub Pages serves `master` at `jakeruth.com` via the `CNAME` file. HTTPS auto-renewed by GitHub's Let's Encrypt integration. To ship changes: commit to `master`, push. See `CLAUDE.md` for DNS / cert details.
