# v1 topnav v3 — three layouts, one demo

Iterating on v2. Jake's note:

> "The navigation is definitely getting better, but it's still a little bit
> too sparse. Like, there's the small left thing, and then everything all the
> way on the right. It's just like way too much space in the middle. Maybe
> we could look at a few different concepts for that."

This folder ships three distinct layouts side-by-side so that middle-gap
question gets a real answer. Each variant mounts into its own
full-viewport section with placeholder content underneath, so you can feel
how the bar sits against real page chrome before committing.

## Run it

**file://**: open `index.html` in a browser. Done.

**local server**:

```sh
cd concepts/v1-topnav-v3
python3 -m http.server 8000
# http://localhost:8000/
```

Keyboard: `1`, `2`, `3` jump between variants. The right-edge TOC also
shows which one is currently in view (IntersectionObserver-driven).

Preview switcher links at the top force a fake pathname (`?exp=xp|readme|saas`)
so you can see how each variant handles "current tab" highlighting without
real navigation.

## The three variants

### A — Centered tabs

```
[ <- Setup ]                  [ Old-school OS | Code repo | SaaS product ]
```

Setup anchored far left. Three tabs dead-center on the bar. Empty space
split evenly on both sides.

- **Pros**: cheapest diff from v2. No new elements to design. Respects the
  existing mental model. Current-tab pill + accent underline still does the
  heavy lifting.
- **Cons**: no brand moment. The middle is filled with function, not
  identity.
- **Committed accent choice**: tiny 14px cube marks stay on the tabs here.
  They're the only visual carryover from v2, and the centered layout has
  enough room to breathe with them.
- **Best fit**: if we want the quickest ship that kills the gap complaint
  without introducing new vocabulary.

### B — Wordmark middle + tabs right

```
[ <- Setup ]           JAKE · RUTH              [ OS | Repo | SaaS ]
```

Setup left. Serif wordmark absolutely-centered. Tabs grouped on the right
(same segmented-control treatment as v2). Wordmark is also clickable — a
secondary way back to Setup.

- **Pros**: most personal. Makes the bar feel like a personal site, not a
  product page. Ties the three experiences together under one name. The
  wordmark gives the middle a reason to exist.
- **Cons**: the wordmark has to be typeset well or the whole bar reads
  cheap. Two ways back to Setup could be redundant — though "redundant
  affordances" is usually fine when one is textual (Setup button) and one
  is ambient (wordmark).
- **Committed accent choice**: NO cube marks on tabs. The wordmark is the
  brand moment; putting cubes next to tab labels on top of that would read
  busy.
- **On small screens**: the wordmark hides below 560px, leaving
  Setup + tabs — which is exactly v2. Acceptable fallback.
- **Best fit**: if the site should feel authored. A named person's site.
  Personal brand over SaaS chrome.

### C — Unified center bar

```
       [ <- Setup | Old-school OS · Code repo · SaaS product ]
```

Everything in a single centered pill. Setup on the left inside it,
separated from the tabs by a vertical rule. Dot separators between tabs.
Edges of the screen are empty on purpose.

- **Pros**: most distinctive. Stops the gap question entirely by refusing
  to split Setup and tabs into separate islands. Reads as a
  Spotlight/command-bar control — one unit, four entry points. Feels
  designed, not defaulted.
- **Cons**: on very wide displays the side margins can look wasted if
  page content below doesn't also center. Needs whole-page layout
  consistency to look intentional.
- **Committed accent choice**: NO cube marks. The pill is already visually
  dense; text-only keeps the whole bar scanning as one control.
- **Best fit**: the most "Jake" option. Opinionated. Slightly unusual.
  Reads as a deliberate choice.

## Which fits which experience?

All three variants ship one component that works across all three
experiences — Jake doesn't pick a different nav per experience. But there
are aesthetic compatibilities worth noting:

| | Old-school OS (XP) | Code repo (README) | SaaS product |
|---|---|---|---|
| **A** centered tabs | Neutral. Works. | Works. | Works. |
| **B** wordmark | The serif wordmark against XP Luna chrome is a fun contrast. Most character here. | Serif wordmark + monospace body is a nice classic/modern split. | Can feel like a personal-portfolio banner above a product nav. Acceptable. |
| **C** unified bar | Floats above XP chrome cleanly; the centered pill doesn't fight the task bar. | Aligns with GitHub's own header grammar. Natural. | Best match for a modern product. Reads as a command palette / quick-switch. |

If forced to rank for a single universal default:

1. **C** — most distinctive, solves the gap cleanly, best fit for SaaS and
   README, fine on XP.
2. **B** — most personal, but requires font-loading discipline and has a
   small-screen fallback that's basically v2.
3. **A** — safest. If we want to ship in an hour, pick A.

## Files

- `index.html` — demo page. Three scrolling sections, TOC, keyboard jump.
- `styles.css` — shared base + per-variant layout rules scoped via
  `.v1-topnav[data-variant="a|b|c"]`.
- `topnav-a.js` — Variant A component (`V1TopNavA.mount(hostEl, opts?)`).
- `topnav-b.js` — Variant B component (`V1TopNavB.mount(hostEl, opts?)`).
- `topnav-c.js` — Variant C component (`V1TopNavC.mount(hostEl, opts?)`).

Each component exposes a single `mount(host, opts?)` function. `opts` is
optional and supports:

- `current`: override detection, e.g. `"xp" | "readme" | "saas"`.
- `setupHref`: path back to Setup. Defaults to `"../v1/"`.

## Shared behaviour

- Thin bar, 56px on desktop / 52px on small screens.
- Labels are canonical (match VOICE.md + wizard):
  `Old-school OS · Code repo · SaaS product`. Button reads `Setup`.
- Current experience detected from `window.location.pathname` matching
  `/xp/`, `/readme/`, or `/saas/`.
- Current tab: filled background + 2px bottom accent in experience color
  (XP `#4c8ddb`, README `#3cb371`, SaaS `#e49242`).
- Click a non-current tab → `window.V1Transition.go(url)` if loaded,
  otherwise plain `window.location.href = url`.
- Click Setup (or Variant B's wordmark) → same transition-or-navigate
  back to `../v1/`.
- Transition cube is loaded from `../v1/shared/transition-cube.js` with
  silent fallback if it fails (works fine on `file://` without the chain).

## Adopting one into v1

Once Jake picks a variant, the swap is straightforward. Copy the variant's
JS + the relevant scoped CSS into `concepts/v1/shared/topnav.{js,css}`.
The `mount()` API differs from v2 (v2 auto-injected on script load) — if
we want the v2 drop-in behaviour back, wrap the mount in a DOMContentLoaded
self-call like v2's `topnav.js` did, targeting `document.body` as host.

Example drop-in wrapper:

```js
function autoMount() {
  var host = document.createElement("div");
  host.id = "v1-topnav-host";
  host.style.cssText = "position:fixed;top:0;left:0;right:0;z-index:2147483000;";
  document.body.appendChild(host);
  document.body.classList.add("v1-has-topnav");
  V1TopNavC.mount(host); // pick your variant
}
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", autoMount);
} else {
  autoMount();
}
```

## Accessibility

- `role="tablist"` / `role="tab"` / `aria-selected` / `aria-current="page"`.
- Focus-visible ring on Setup, tabs, and (Variant B) wordmark.
- `prefers-reduced-motion: reduce` disables transitions and smooth scroll.
- Keyboard: `1`/`2`/`3` to jump variants in the demo; inside each nav,
  standard `Tab` / `Space` / `Enter`.

## Voice check

- Labels match VOICE.md canonical terms.
- No pricing. No "passionate." No LinkedIn-ese anywhere on this page.
- Placeholder copy under each variant pulls phrasing from `content.json`
  (Stock Unlock framing rule respected — "profitable side business today,
  not full-time").
