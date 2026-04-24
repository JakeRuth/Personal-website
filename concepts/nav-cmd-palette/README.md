# Nav-Cmd-Palette

Raycast / Linear / Superhuman-style command palette for navigating Jake's site. Press a key, type, hit enter. Used for both experience-switching (primary) and intra-page navigation (secondary).

## Open it

- `Cmd+K` / `Ctrl+K` — anywhere.
- `/` or `?` — when focus is outside a text field.
- Click the top pill or the "Open command palette" button on the demo page.

## Inside the palette

| Key | Action |
|---|---|
| `↑` / `↓` | Move selection |
| `Enter` | Run selected command |
| `Esc` | Close |
| Mouse hover | Preview-select a row |
| Click | Run |

## Commands

### Switch experience
Switch to XP Luna, Enterprise SaaS, Git Log, README, or Vista. Currently fires a toast — wire up `onExperienceSwitch(target)` to navigate between prototypes.

### Jump to
About, Career, Stock Unlock, Projects, Hobbies, Contact. Smooth-scrolls to the section anchor and updates the URL hash.

### Actions
Download resume, Email Jake, Copy email, View GitHub, Toggle theme (dark ↔ light), Print.

### Easter eggs (hidden until matched)
- Type `rubik` or `cube` → reveals "Solve the Rubik's cube" (ambient spinning cube overlay).
- Type `ship` or `hire` → "Ship Jake" (opens a pre-filled mailto).
- Type `whoami` → jumps to About.

## Design notes

- Dark mode by default. Inter for UI labels, JetBrains Mono for kbd hints and section labels.
- Orange accent (`#f97316`) — same feel across the broader site prototypes.
- Fuzzy scoring: substring hits first, then subsequence matching with consecutive/leading/word-boundary bonuses. Matched characters are highlighted in the label.
- Recents persist in `localStorage` under `cp:recent` (max 5). Shown when the input is empty.
- Corner hint fades after the first open.
- Top pill always visible so the affordance is discoverable without the user having to guess at shortcuts.
- Full-keyboard operable, includes ARIA dialog role and a labeled, focusable mount point.

## Reusing the component

`palette.js` exposes a single `window.CommandPalette` class. Zero dependencies, zero build step. Wire it to whichever page you want:

```html
<link rel="stylesheet" href="styles.css" />
<script src="palette.js"></script>
<script>
  const palette = new CommandPalette({
    mount: document.body,
    // Optional — replace the full command list if you want:
    // commands: [ { id, section, label, sub, icon, run, keywords, hidden, triggers, shortcut } ],
    onExperienceSwitch: (target) => { /* route to another prototype */ },
    onDownloadResume:   () => { window.open('../../official_resume.pdf'); },
    onCopyEmail:        () => navigator.clipboard.writeText('jake@stockunlock.com'),
    onToggleTheme:      () => document.body.classList.toggle('theme-light'),
    onRubikEasterEgg:   () => { /* kick off your cube animation */ },
    onShipJake:         () => { window.location.href = 'mailto:jake@stockunlock.com'; },
  });

  palette.on('open',  () => {});
  palette.on('close', () => {});
  palette.on('run',   (cmd) => console.log('ran', cmd.id));

  palette.open();   // programmatic
  palette.close();
  palette.toggle();
</script>
```

### Command shape

```js
{
  id: 'jump-about',
  section: 'Jump to',
  label: 'About',
  sub: 'Who Jake is, plainly',
  icon: '↗',                  // string or SVG markup
  keywords: 'bio intro jake', // extra terms fed to the fuzzy matcher
  shortcut: '⌘+1',            // optional visual hint
  hidden: false,              // if true, only shown when triggers match
  triggers: ['rubik'],        // substrings that unlock a hidden command
  run: (evt) => { /* do it */ },
}
```

## Run locally

Open `index.html` directly with `file://` or:

```
python3 -m http.server 8000
# → http://localhost:8000/concepts/nav-cmd-palette/
```

No build, no deps, just the browser.

## If I had more time

- **Per-command shortcuts.** `⌘+R` for resume, `⌘+E` for email, etc., honored globally and shown on the right of each row.
- **Context awareness.** The palette would know which experience is active and reshuffle "Jump to" entries to that experience's sections instead of the demo page's.
- **Nested palettes.** Typing `switch ` and hitting Tab would drill into a "Which experience?" sub-palette with preview thumbnails — the Linear pattern.
- **Inline previews.** Hover over a "Jump to" row to see a small screenshot of the section on the right side of the panel.
- **Better fuzzy matching.** Replace the hand-rolled scorer with Fuse.js or a mini-fzf port; add typo tolerance.
- **Voice.** Accept a `?` help command that explains how to use the palette in Jake's voice ("you type, it goes").
- **Telemetry.** A local counter for which commands get run most — surface those to the top automatically (without cloud analytics).
- **Command chaining.** `>` prefix to run a multi-step macro (e.g. `> email + copy`).
- **Theme persistence.** Remember the dark/light choice across reloads (currently resets to dark).
- **Reduced-motion respect.** Honor `prefers-reduced-motion` to disable the cube spin and panel scale-in.
