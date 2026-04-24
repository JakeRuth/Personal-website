# nav-wizard-reopen

A persistent **Setup** button that reopens the picker wizard as a compact modal. Drop it on any experience and the installer never really leaves &mdash; click it to re-pick the flavor of jakeruth.com.

**The picker is the nav. This is just the picker, smaller.**

---

## What's in the box

- `index.html` &mdash; staging demo page with placeholder Jake-content and the button pinned bottom-right
- `wizard-reopen-nav.js` &mdash; the reusable component (exposes `window.WizardReopenNav`)
- `styles.css` &mdash; all styles, namespaced under `.jr-wrn-*` so they don't leak
- `README.md` &mdash; this file

---

## Run it

No build step. No dependencies except optionally three.js (CDN) when the transition-cube is used.

```
# open directly:
open index.html

# or serve it:
python3 -m http.server
# then visit http://localhost:8000/concepts/nav-wizard-reopen/
```

If you're on `file://` and toggle `useTransitionCube: true`, the first click has to fetch three.js from the CDN. On air-gapped file:// loads the cube fails gracefully to a plain redirect.

---

## Use it on an experience

```html
<link rel="stylesheet" href="../nav-wizard-reopen/styles.css" />
<script src="../nav-wizard-reopen/wizard-reopen-nav.js"></script>
<script>
  WizardReopenNav.mount({
    current: 'xp',            // 'xp' | 'readme-git' | 'saas'
    useTransitionCube: true,  // optional
  });
</script>
```

That's it. A Setup pill appears in the bottom-right. Click &rarr; compact wizard &rarr; pick &rarr; navigate.

---

## API

```js
WizardReopenNav.mount(options) -> { open, close, destroy, element }
```

| option | type | default | notes |
|---|---|---|---|
| `current` | `'xp'` / `'readme-git'` / `'saas'` or slug | *none* | Marks the currently-loaded experience. That card gets a "Current" chip and the Launch button disables when it's selected. |
| `label` | string | `'Setup'` | Text on the persistent button. |
| `sublabel` | string &#124; null | `'Change experience'` | Smaller secondary text; pass `null` or `''` to hide. |
| `position` | `'bottom-right'` / `'bottom-left'` / `'top-right'` / `'top-left'` | `'bottom-right'` | Where the button lives. |
| `useTransitionCube` | boolean | `false` | Plays `../transition-cube/` on confirm before redirect. Falls back to plain redirect if the cube fails to load. |
| `transitionCubeBase` | string | `'../transition-cube/'` | Override if the component lives somewhere else. |
| `onChange` | `({ id, slug, path }) => void` | `null` | If provided, replaces the redirect. Useful for SPA-style embedding. |

Also exposed:

```js
WizardReopenNav.open()         // opens the most-recently-mounted instance
WizardReopenNav.close()
WizardReopenNav.destroy()      // removes every mounted instance
WizardReopenNav.experiences    // read-only array of the 3 options
```

---

## The 3 experiences (hard-coded)

| id | slug / path | flavor |
|---|---|---|
| `xp` | `../xp-luna-v3/` | The nostalgic one |
| `readme-git` | `../readme-git-fusion-v2/` | The engineer one |
| `saas` | `../saas-v5/` | The dev-tool one |

The compact picker always shows all three. Per the brief, this is the canonical trio.

---

## Chrome

The persistent button is a small InstallShield-bevel pill with a 3x3 Rubik's cube icon. Sits ~32px tall, 18px from the corner. On hover it lifts 1px; on focus it gets a blue outline. A small yellow tooltip ("Reopen Setup Wizard") fades in on hover.

The modal is a 520px-wide wizard window with the same titlebar gradient, banner, and 26px title buttons as `picker-wizard-v2/`. Radio cards are compact (one row each, with a mini thumbnail). The footer advertises the keyboard shortcuts inline.

---

## Keyboard

| key | action |
|---|---|
| arrow up/down/left/right | move selection between options |
| Home / End | jump to first / last |
| Enter | confirm &amp; launch |
| Esc | close modal |
| Tab / Shift-Tab | cycle focusable elements (trapped inside modal) |

When the modal opens, focus lands on the current experience's radio card. When it closes, focus returns to whatever had it before (usually the Setup button).

---

## Transition-cube integration

When `useTransitionCube: true` is set, the component lazy-loads three.js + the two scripts from `../transition-cube/` on first confirm. Then:

```js
TransitionCube.playTransition({
  duration: 3000,
  destinationUrl: sel.path
});
```

If any of that fails (wrong base path, offline, blocked CDN), the component silently falls back to `window.location.href = destination`. The cube is polish, not plumbing.

---

## Accessibility

- `role="dialog"` + `aria-modal="true"` on the wizard window
- `role="radiogroup"` on the options list, `role="radio"` + `aria-checked` on each card
- `aria-haspopup="dialog"` + `aria-expanded` on the launcher
- Focus trap while modal is open; focus restoration on close
- Respects `prefers-reduced-motion` (via the transition-cube itself and CSS fallback)
- Tooltip duplicates the launcher's `aria-label` for hover users

---

## Voice notes

Labels live in one place, tuned to VOICE.md:

- Button: **Setup** / *Change experience*
- Tooltip: *Reopen Setup Wizard*
- Modal title: *Change Experience*
- Banner h1: *Reopen Setup Wizard*
- Banner h2: *Same voice, different chrome. Pick again.*
- Confirm button: *Launch &gt;* (goes to *Already loaded* + disabled when you pick the current one)

No "passionate," no "excited," no emoji. Dry and sparse.

---

## What this does NOT do

- Does not carry the welcome / confirm / launching steps from the full picker. It's one step: pick &amp; go.
- Does not persist anything to localStorage. The `current` value comes from the host experience, which is authoritative.
- Does not know about the `advancedPrefs` panel from picker-wizard-v2. If those matter on reopen, pass them in through a wrapper.
