# Nav-Topbar-Pills

A persistent top-bar mode switcher for the jakeruth.com rebuild.

One of thirteen parallel prototypes. This one isn't an experience &mdash; it's the connective
tissue between experiences. Five pills, always reachable, one click from anywhere to
anywhere.

## What's in this folder

```
nav-topbar-pills/
  index.html        Demo stage + mount point
  styles.css        Styles for the demo stage (not the component)
  topbar-nav.js     The actual deliverable. Drop-in component.
  README.md         This file
```

## Run it

```bash
cd concepts/nav-topbar-pills
python3 -m http.server 8000
# http://localhost:8000
```

Or just double-click `index.html`. It works on `file://`.

## Behavior

- **Five pills** &mdash; XP, SaaS, Git, README, Vista. One is active with a filled accent. The rest are outlined.
- **Click a pill** &mdash; triggers `onSelect`. In this prototype, a transition overlay fades
  in with "XP &rarr; Git", holds briefly, then snaps back to the demo's original active
  state. In a real experience you'd route to that mode's URL instead.
- **Hover a pill** &mdash; preview tooltip appears with a tiny per-mode thumbnail and the
  Jake-voice tagline ("XP Luna &middot; the nostalgic one").
- **Scroll down past 80px** &mdash; bar collapses: thinner padding, scales to 86%, brand
  text hides.
- **Scroll up** &mdash; bar expands back to full.
- **Mobile (&le; 640px)** &mdash; the pill row hides and a "Modes" hamburger reveals a
  dropdown drawer below the bar.
- **Keyboard** &mdash; <kbd>1</kbd>&hellip;<kbd>5</kbd> jumps between modes. Ignored while
  typing in an input. No modifier keys.
- **A11y** &mdash; pills are real `<button>`s with `aria-current="page"` on the active one.
  Tooltips have `role="tooltip"`. Focus-visible outlines in the accent color. Respects
  `prefers-reduced-motion`.

## Keyboard shortcuts

| Key | Action |
| --- | ------ |
| <kbd>1</kbd> | Go to XP |
| <kbd>2</kbd> | Go to SaaS |
| <kbd>3</kbd> | Go to Git |
| <kbd>4</kbd> | Go to README |
| <kbd>5</kbd> | Go to Vista |

Shortcuts are suppressed when focus is inside an `input`, `textarea`, `select`, or
contenteditable element.

## Reuse: drop into another experience

```html
<!-- Anywhere in <body>, preferably top. Style/position is handled by the component. -->
<div id="topbar" data-topbar-nav data-active="saas" data-accent="teal"></div>

<script src="/concepts/nav-topbar-pills/topbar-nav.js"></script>
<script>
  TopbarNav.mount('#topbar', {
    active: 'saas',
    onSelect: function (mode, ctx) {
      // In a real experience, navigate:
      window.location.href = ctx.modes[mode].href;
    },
  });
</script>
```

### Configuration

| Option | Type | Default | Notes |
| ------ | ---- | ------- | ----- |
| `active` | string | first mode id | Which pill starts highlighted |
| `accent` | `'teal' \| 'amber' \| 'blue'` | `'teal'` | Single accent color |
| `scrollCollapsePx` | number | `80` | Scroll-Y threshold to collapse |
| `onSelect` | `(id, ctx) => void` | default (navigate by href) | Called on pill click + keyboard 1-5 |
| `modes` | array | five defaults | Override labels, taglines, hints, hrefs |

Any of the above can also be passed via `data-*` attributes on the mount element
(`data-active`, `data-accent`, `data-scroll-collapse-px`). Option object wins if both
are set.

### Mode shape

```js
{
  id:      'xp',                                // unique string, used for state
  label:   'XP',                                // 1-2 word pill text
  tagline: 'XP Luna · the nostalgic one',       // tooltip title (Jake voice)
  hint:    'Senior-year desktop. Start menu.',  // tooltip second line
  href:    '../xp-luna-v2/',                    // navigation target
}
```

### Instance API

```js
var nav = TopbarNav.mount('#topbar');
nav.setActive('git');       // programmatic switch (no onSelect fired)
nav.simulateTransition('git'); // for prototype demos only
nav.destroy();              // remove listeners + DOM
```

## Design notes

- Dark base (`#0b0d10`). Single teal accent (`#2dd4bf`). Inter.
- Bar floats with a subtle glass effect (`backdrop-filter: blur(14px) saturate(140%)`)
  so the experience underneath can bleed through.
- Active pill is filled &mdash; it reads as "you are here" at a glance. Inactive pills
  are outlined, not ghosted, so they don't feel like secondary content.
- Collapse uses `transform: scale()` + padding/gap tweens. No layout-thrash on scroll.
- Tooltips use per-mode thumbnail "moods" &mdash; not screenshots. A blue XP stripe, a
  grey SaaS dashboard block, a green-on-black git log, a markdown page, a glass pane.
  Just enough visual to hint at the destination without promising a real preview.

## If I had more time&hellip;

- **Real route transitions.** Wire `onSelect` up to a shared `view-transition` API so
  mode switches morph instead of overlay-fade.
- **Thumbnail snapshots.** Replace the CSS moods with actual live snapshots of each
  experience (built at deploy time via Playwright + tiny WebP).
- **Mode memory.** Remember the last-visited mode in `localStorage` and boot new visits
  there, with a "reset to default" escape hatch.
- **Reveal-on-idle.** If the user hasn't scrolled or moved in 30 seconds, gently pulse
  the pill row to remind them other modes exist. Once per session.
- **Swipe gestures.** Horizontal swipe on mobile to move between adjacent modes.
- **Keyboard "cycle" bindings.** `[` and `]` to move prev/next, not just `1-5`.
- **Theme reactivity.** Have each experience publish its dominant color, and have the
  bar pick an accent that maintains AA contrast against it.
- **Announce transitions to AT.** An `aria-live="polite"` region that says
  "Loading XP Luna" when a mode is picked.
- **Tests.** Vitest on the state machine, Playwright for scroll + keyboard + mobile
  behaviors.

## Voice check

Pill labels are deliberately short &mdash; the tooltip is where the Jake voice lives.
"XP Luna &middot; the nostalgic one" earns its second read. The pills themselves are
furniture; the experiences are the work.
