# Concept 02 — Terminal

A fake shell that is the entire site. Green-on-black phosphor CRT. Boot sequence, prompt, real command routing, tab complete, history, the whole deal.

## Run it

```
# from repo root
python3 -m http.server
# open http://localhost:8000/concepts/02-terminal/
```

`file://` also works — just double-click `index.html`. No build step, no npm, no bundler. One HTML, one CSS, one JS. Font pulled from Google Fonts (JetBrains Mono).

## What's implemented

- **Boot sequence** on load. Dramatic startup lines with [ OK ] / [FAIL] tags, ending at the prompt.
- **Prompt**: `jake@ruth:~$` with a blinking block caret.
- **CRT feel**: scanlines, subtle flicker, vignette, phosphor glow text-shadow, low-opacity mouse-trail phosphor on the background canvas.
- **Input**: `contenteditable` span; Enter runs the command, the command and its output render in the scrollback like a real shell.
- **Tab autocomplete**: single match completes; multiple matches print the candidate list and resolve the common prefix.
- **Up/Down arrow** cycles command history; `Ctrl+L` clears; `Ctrl+C` aborts the line.
- **`help`** prints clickable buttons for every command so non-terminal users can still navigate.
- **Commands implemented**:
  - `help`, `whoami`, `bio`, `history`, `career` (alias), `projects`, `stock-unlock`, `contact`, `resume`, `clear`, `fortune`
  - `cube --solve` — ASCII 3x3 net that visually converges from scrambled to solved while moves scroll below it; prints wall time and his 13.95s PB.
  - `sudo hire-me` — prompts `[sudo] password for employer: ****`, fakes a reject, then lets you in with a cheeky hire-me blurb.
  - `sudo <anything-else>` — "jake is not in the sudoers file. This incident will be reported."
- **Content** follows the brief: Stock Unlock framing ("built it, still runs, not full-time, next chapter"), retail-investor advocacy, Rubik's cube / unicycle lore, NYC, getting married.

## What's mocked

- The cube solve is a **visual** solve, not a real Kociemba solver. Faces tween from a hardcoded "scrambled" state to the solved state over a hardcoded move list. The vibe is real, the algorithm is not.
- Autocomplete only completes command names, not arguments/paths.
- `resume` attempts `window.open('../../official_resume.pdf')` and also renders a click-through link. Some browsers block the popup on first call; the link always works.
- No real filesystem. `ls`, `pwd`, `cat`, `echo`, `man`, `exit` all have one-liner jokey responses.
- The phosphor mouse trail is a soft radial-gradient blob on a canvas — stylized, not a true persistence-of-vision simulation.

## Keyboard shortcuts

| Key           | What it does                                    |
| ------------- | ----------------------------------------------- |
| `Enter`       | Run the current command                         |
| `Tab`         | Autocomplete command name                       |
| `ArrowUp`     | Previous command in history                     |
| `ArrowDown`   | Next command in history                         |
| `Ctrl+L`      | Clear screen                                    |
| `Ctrl+C`      | Abort the line (prints `^C`)                    |

Clicking anywhere on the terminal re-focuses the input.

## Easter eggs worth discovering

- `sudo hire-me` — masked password animation, then a real hire-me pitch.
- `sudo <anything else>` — classic sudoers rejection line.
- `rm -rf /` — polite refusal.
- `vim` / `vi` / `nano` — "not installed. This is a resume, not an IDE."
- `exit` / `logout` — "nice try. this shell is forever."
- `fortune` — rotating Jake-flavored aphorisms including the margin-of-safety rant and the "driver in the driver's seat" line.
- `ls` / `pwd` / `cat whatever` — all have sass.
- `echo anything` — echoes.
- Boot log includes `retail-investor-advocacy.ko` being loaded and an "overcharging-for-bad-software" check that deliberately FAILs then recovers.

## If I had more time...

- Replace the fake cube solve with a real solver (Kociemba's algorithm in JS) and render actual face rotations with proper color wrapping.
- Support piping: `fortune | tee`, `history | grep ...`.
- Add a `tree` command with a fake home directory tree.
- Richer autocomplete: arg completion for `cube`, filename completion for `cat`.
- Real `bell` (`\a`) on unknown command, optional off-switch.
- SSH-style MOTD that rotates on each boot.
- Optional amber-on-black palette toggle (`theme amber`).
- Persist command history in `localStorage` across sessions.
- A `matrix` command just for the hell of it.
- Mobile: virtual key row for `Tab` / `Up` / `Down` / `Ctrl+L` since phones don't have those keys.

## Files

- `index.html` — shell markup, overlays, canvas for phosphor trail.
- `styles.css` — CRT palette, scanlines, flicker, caret blink, help-grid buttons.
- `terminal.js` — boot sequence, command registry, input/history/autocomplete, cube animation, mouse-trail canvas loop.
