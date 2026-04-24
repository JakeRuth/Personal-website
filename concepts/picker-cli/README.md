# picker-cli

A terminal CLI prompt as the entry to jakeruth.com. Pick a mode, hit enter, site launches.

Vanilla HTML/CSS/JS. No build step. One Google Font (JetBrains Mono) via CDN. Works from `file://` or a static server.

## Run

```
# from repo root:
python3 -m http.server 8000
# then open
http://localhost:8000/concepts/picker-cli/
```

Or just open `index.html` directly in a browser.

## Commands

Typed at the prompt. Tab completes. Up/down walk history. Ctrl-L (or Cmd-K) clears.

| command                    | effect |
| -------------------------- | ------ |
| `jake-ruth --help`         | print usage + mode list |
| `jake-ruth --mode=<name>`  | launch a mode (see table below) |
| `jake-ruth <name>`         | same as above, shorter |
| `<name>`                   | bare mode name also works |
| `help`                     | alias for `--help` |
| `whoami`                   | one-line bio |
| `ls`                       | list mode directories |
| `clear` / `cls`            | clear the screen |
| `exit` / `quit` / `:q`     | close-out message |
| `sudo` / `sudo su`         | nice try. |

Unknown commands print `command not found: <cmd>` and a hint.

## Modes

Click a mode name in the printed help, or type it. On enter you see a brief `Launching <mode>...` line, then the page navigates.

| name     | launches                     | sibling directory             |
| -------- | ---------------------------- | ----------------------------- |
| `xp`     | nostalgic Windows XP         | `../xp-luna-v2/`              |
| `saas`   | enterprise dev tool          | `../enterprise-saas-v2/`      |
| `git`    | git log / engineer-native    | `../git-log-v2/`              |
| `readme` | styled markdown README       | `../readme-mode/`             |
| `vista`  | Windows Vista Aero           | `../vista-faithful-v2/`       |

## Notes

- No text-layer blur. Jake explicitly called v1 "fucking blurry." The CRT feel here comes from tasteful scanlines, a faint radial phosphor tint behind the screen, and a single 1px green glow on the ASCII header only. The input and output text are crisp.
- The phosphor canvas draws a low-opacity green trail following the mouse. It fades continuously, so it never dominates.
- Tab completion handles both the long form (`jake-ruth --mode=x` -> `xp`) and the bare form (`x` -> `xp`), and falls back to command names (`who` -> `whoami`).
- History is in-memory per session.

## Files

- `index.html` — shell: titlebar, screen, hidden input, phosphor canvas
- `styles.css` — dark terminal theme, scanlines, blinking caret
- `app.js` — boot sequence, input handling, command router, phosphor trail
