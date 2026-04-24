# picker-auto

The lowest-friction picker in the bake-off. No menu. No wizard. No keyboard
commander. The site just picks one of the five experiences for the visitor,
announces it in one sentence, and launches. Power users override via a
persistent pill.

## Files

- `index.html` — the landing/auto-pick intro screen.
- `switcher.js` — reusable pill component that drops into every experience.
- `README.md` — this file.

Open `index.html` directly via `file://` or serve from the `concepts/` root:

```
cd concepts
python3 -m http.server 8000
# then visit http://localhost:8000/picker-auto/
```

## Auto-selection rules

Priority order. First rule that matches wins.

1. **Locked choice.** If the visitor previously ticked "Remember this pick,"
   `localStorage.jr_experience_locked` holds the slug and we honor it.
2. **Mobile width** (`max-width: 640px`) → `readme-mode`. Plain text reads
   best on a phone; Vista's glass chrome does not.
3. **Referrer nudge.**
   - From `github.*` → `git-log-v2` (engineer-native timeline).
   - From `linkedin.*` → `readme-mode` (plain-text resume surface).
4. **Time of day** (visitor's local clock).
   - 05:00–12:00 → `git-log-v2` (engineers pre-coffee).
   - 12:00–17:00 → `enterprise-saas-v2` (buy-mode at buy-hours).
   - 17:00–21:00 → `xp-luna-v2` (warm, evening).
   - 21:00–05:00 → `vista-faithful-v2` (glass, night owl).

Each rule fires a one-line explanation shown to the visitor, so the selection
never feels magic. They see *what* was picked and *why*, and can override.

## The intro screen

Three lines, max. Dark. Typographic. Total time to redirect: ~3.2 seconds if
the visitor does nothing.

```
Picking an experience for you... done.
Chose: Enterprise SaaS.
    Mid-afternoon. Buy-mode feels right.

[Take me there]  [Not right? Switch]  [Hold up]
```

Buttons:
- **Take me there** — launch immediately.
- **Not right? Switch** — opens inline dropdown with the other four, plus
  "Surprise me" and "Remember this pick."
- **Hold up** — cancels the auto-launch countdown; screen stays up.

Keys:
- `Enter` — launch the picked experience.
- `Escape` — cancel the auto-launch.
- `?` or `/` — open the inline switcher dropdown.

## The switcher pill (`switcher.js`)

A self-initializing JS component. No build step, no dependencies, one
`<script src>` per page.

### Include it

```html
<!-- at the end of <body>, or in <head> with defer -->
<script src="../picker-auto/switcher.js" defer></script>
```

That is the whole integration. The script:

1. Injects its own scoped CSS (`.jr-sw-*` classes — won't collide).
2. Detects the current experience from (in order): `window.JR_CURRENT_SLUG`,
   `<body data-jr-slug="...">`, or the URL path.
3. Appends a pill to the bottom-right of the page reading
   `Experience: <current mode> v`.
4. On click, slides up a menu with the four other modes, "Surprise me"
   (random), and a "Remember this pick" checkbox that writes
   `localStorage.jr_experience_locked`.
5. Listens globally for `?` / `/` to toggle open, and `Escape` to close.
6. Exposes `window.JRSwitcher = { open, close, toggle, go, remember, forget,
   current, experiences }` for host pages that want programmatic control.

Guards against double-init via `window.__jrSwitcherLoaded`. Safe to include
twice — the second load is a no-op.

### What it does NOT do

It does not modify any existing experience. Integration is "add one script
tag." The component doesn't assume anything about the host page's DOM, stack,
or styling — it owns a fixed-position div and stays out of the way.

## Design choices worth calling out

- **Skippable announcement over silent redirect.** A silent auto-redirect
  would feel hostile on a personal site — visitors deserve to see what was
  picked and why. The countdown bar makes the ~3-second wait feel like
  forward motion rather than a loading screen.
- **Dark, typographic intro, not themed.** The landing intentionally does
  not lean into any single experience's aesthetic. It's a neutral foyer so
  every mode gets a fresh entrance.
- **Reason text, not just a slug.** "Mid-afternoon. Buy-mode feels right."
  reads like Jake, lands with dry humor, and explains the logic without
  exposing the rule table.
- **Voice.** Landing copy follows VOICE.md — short sentences, no "passionate,"
  no exclamation points, dry where it fits.

## If I had more time...

- **Calibrate the time-of-day buckets** to Jake's actual traffic (assuming
  a sane percentage of visitors are in US ET). Right now the ranges are
  intuition, not data.
- **Second-visit behavior.** On a returning visitor who didn't pin, rotate
  to a different experience on purpose — "You've seen this one. Try this."
  Good for recruiters who come back twice and leave with a richer picture.
- **A/B the announcement length.** One line vs. three. Instinct says three
  lines with a countdown feels premium; one line might convert faster to
  "actually look at the content."
- **Server-side hint.** If ever hosted on something with a cheap edge
  function, the first render could come back already committed to a mode
  rather than the brief client-side decision frame. Under `file://` it
  doesn't matter.
- **Better tie-in with the switcher.** The landing page could also drop the
  pill so the override is available from moment one, not just after the
  redirect. Currently the landing has its own inline switch; the pill takes
  over once you're inside an experience.
- **Tests for the rule table.** Tiny harness that stubs `Date`, `navigator`,
  `document.referrer` and asserts the selected slug. The logic is simple
  enough today that it's fine uncovered; a week from now it won't be.
