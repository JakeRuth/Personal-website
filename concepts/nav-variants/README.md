# nav-variants

Three distinct inter-mode nav patterns on one scroll-through demo page. Builds on `nav-topbar-pills` (v1), which Jake liked as a starting point.

## Run it

```
# file:// works, or:
python3 -m http.server 8000
# then open http://localhost:8000/concepts/nav-variants/
```

No build. Vanilla HTML/CSS/JS. One CDN stylesheet (`inter.css`). Three self-contained JS components.

## What's in here

| File | What it is |
| --- | --- |
| `index.html` | Single demo page with three full-viewport variant sections, plus the mini TOC on the right. |
| `styles.css` | Demo page styles (the stage under each nav). Component CSS is injected by each JS file. |
| `topbar-pill-nav.js` | **Variant A.** Refined v2 of the floating pill bar from `nav-topbar-pills`. Exportable. |
| `sidebar-nav.js` | **Variant B.** Thin left-side vertical rail with icons + labels. Exportable. |
| `underline-nav.js` | **Variant C.** Editorial masthead with underline tabs. Exportable. |

## The three variants

### A. Top-bar pills (refined)

Floating pill bar, center-anchored at the top. Refinements over v1:

- Tighter spacing (6px outer padding, 4px pill gap)
- Larger hit targets (36px min-height) without appearing bigger
- Slightly refined accent (`#34d6c0` — a touch warmer) and softer shadow
- Gentler collapse animation curve (360ms, longer ease)

Preserves v1's scroll-to-collapse trick. Click to select; keys map 1-5 to pills (handled at the page level here, inside the component in real use).

### B. Side-nav (vertical rail)

Thin left rail, 208px expanded / 56px collapsed. Five entries, each with an inline-SVG abstract icon, label, and index. Current entry marked with a 3px left-accent bar, a soft tinted fill, and a colored icon. Toggles to icon-only at narrow widths (or via the `Collapse` button on wider screens).

Why this pattern: works especially well for experiences that already feel like applications (Enterprise SaaS, Git Log). The rail reads as app chrome; the content on the right gets the full horizontal canvas.

### C. Underline tabs (editorial)

Horizontal bar with serif masthead on the left, five uppercase tab labels on the right. Current tab gets a 2px underline mark (animated in with `transform: scaleX`). Roman numeral suffix on each tab for a print-feel grace note. Defaults to dark theme; also ships a `light` theme that pairs with a cream paper background — used in the demo for visual contrast.

The restraint is the point. No pills, no buttons, no borders. It looks like it belongs on the top of a magazine page and stays out of the way.

## Tradeoffs, one line each

|  | Pros | Cons |
| --- | --- | --- |
| **A · Pills** | Familiar, playful, collapses cleanly, works on any content | Floats over content &mdash; can cover 80-100px on first load |
| **B · Rail** | Feels "native" for app-like pages, keeps vertical real estate | Eats 200+ px of horizontal room; can feel heavy on marketing-style pages |
| **C · Masthead** | Editorial, calm, never calls attention to itself | Least-discoverable interaction; no visible hint that clicking jumps modes |

## Which Jake might prefer for which experience

- **XP Luna, Vista, Readme** &mdash; probably **A** or **C**. These are stylistic experiences; app chrome would fight them. Masthead (C) suits README especially well because README is already a text-document register. Pills (A) suit XP and Vista because they read as UI flair.
- **Enterprise SaaS, Git Log** &mdash; probably **B**. These already want to feel like real software. A left rail is what real dev tools look like.
- **All five** &mdash; if Jake wanted a single nav across every experience, **A** is still the safest default. It's content-agnostic and doesn't force any horizontal layout on the page underneath.

If forced to pick one pattern for all thirteen prototypes, it's A. If allowed two, it's A for the flamboyant experiences and B for the app-y ones. C is a wildcard worth keeping for whichever experience leans hardest into print.

## How navigation works in the demo

- Mini TOC on the right (fixed) highlights the visible variant via `IntersectionObserver`. Click any entry to smooth-scroll there.
- Number keys `1` / `2` / `3` jump between variants.
- Inside each variant, the 1-5 keys would normally switch modes (handled in the component). The demo doesn't wire 1-5 across all variants to avoid conflict with the TOC jump keys; it just keeps the clicked pill highlighted.
- Each nav is `position: sticky; top: 0` within its section, so it pins to the top of the viewport while you're scrolling through that section, then lets go as the next section comes in.

## Component contracts

All three components follow the same shape, so they're interchangeable at the call site.

```html
<div id="nav" data-active="xp"></div>
<script src="./topbar-pill-nav.js"></script>
<script>
  // Minimal
  TopbarPillNav.mount('#nav');

  // Configured
  TopbarPillNav.mount('#nav', {
    active: 'xp',
    accent: 'teal',          // 'teal' | 'amber' | 'blue'
    fixed: true,             // default true; set false + sticky:true for per-section demos
    sticky: false,           // sticks to top of nearest containing block instead
    onSelect: function (id, ctx) {
      // In production: window.location.href = '/' + id;
      // In a prototype: ctx.setActive(id);
    },
  });
</script>
```

`SidebarNav.mount()` and `UnderlineNav.mount()` take the same options (plus `compact` / `theme` respectively). All three return `{ element, modes, setActive(id), destroy() }`.

### Data attributes

Every option is also readable from data attributes on the mount element, so you can drop in a component with zero JS configuration:

```html
<div
  data-topbar-pill-nav
  data-active="git"
  data-accent="amber"
  data-scroll-collapse-px="100"
></div>
```

Same for `data-sidebar-nav` and `data-underline-nav`.

## If I had more time

- A shared **base module** that owns the mode list, hotkey binding, active-state reducer, and transition overlay. Right now each component re-implements the basics. A `NavBase` with `{ modes, setActive, onSelect, onKey }` would cut ~40% of the code.
- Real cross-fade **transitions** on mode switch in the demo (the v1 `simulateTransition` overlay would port over cleanly).
- **Touch gestures** on variant B: swipe left to collapse, swipe right to expand.
- A **TOC side-by-side variant** that docks itself to whatever nav the current section uses (e.g., becomes inline masthead dots on variant C).
- An **accessibility pass**: roving tabindex on the sidebar items, aria-live on mode change, skip-link at the top of the page.
- **Snapshot mini-previews** on hover (like v1's thumbnails) for the side rail and underline tabs, so hovering a mode name shows a 60px high thumb of what that world looks like. This was already in v1 for the pill bar and would give all three variants a shared affordance.
- A **D** variant: breadcrumb-style with a slash separator (`XP / SaaS / Git / README / Vista`), to see how far minimal can go.
