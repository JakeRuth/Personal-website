# graph-c-gitlog

**`$ git log --graph --oneline --all --decorate jakeruth/life`**

Jake's life rendered as the one visualization every engineer already knows how to read: a `git log --graph` in a GitHub-Dark terminal. Vertical timeline, colored branches, merges, decorations, a sidebar with a file-tree of `~/life`, and a commit-detail pane on the right that behaves like `git show`.

## Run

```sh
# from the repo root
cd concepts/graph-c-gitlog
python3 -m http.server 8000
# → http://localhost:8000
```

Or just double-click `index.html` — works on `file://`. No build, no bundler, no npm. One CDN font (JetBrains Mono).

## What's implemented

- **Authentic `git log --graph` layout.** Monospace glyph column (`*`, `|`, `\`, `/`, `-.`) drawn per-commit with correctly-colored branch lines per thread. Looks like a real `git log` before any interaction.
- **GitHub Dark palette.** `#0d1117` base, `#c9d1d9` text, yellow SHAs (`#d29922`), cyan decorations, branch-specific accent colors. JetBrains Mono everywhere.
- **Terminal chrome.** Traffic-light titlebar, command prompt with blinking caret (`jake@stockunlock:~/life (main) $ git log --graph ...█`), footer statusbar.
- **9 branches** with swatches + years in the sidebar: `next-chapter` (HEAD), `main`, `stock-unlock`, `pronk`, `oscar-health`, `youni`, `commercehub`, `rubiks-cube`, `married`.
- **Real commit content** in Jake's voice: SUNY Albany BS CS+Math, ACM president, Rubik's cube 13.95s avg (+ unicycle talent show), CommerceHub 2013–2016, Youni 2015–2016 (merges back when it wound down), Oscar Health 2017–2021, the free Python screener → Daniel Pronk cold-DM reply → Stock Unlock merge, YC W22, $1.335M seed, scaling to 8, scaling pains, stabilizing at profit, Daniel going full-time YouTube, engagement/wedding, and a `next-chapter` HEAD placeholder.
- **Commit metadata.** 7-char hash, full 40-char hash in the detail pane, author (mostly `Jake Ruth <jake@stockunlock.com>`, `Daniel Pronk <daniel@pronk.yt>` on the pronk branch, `Y Combinator <bot@yc>` for the YC-reaches-out commit), ISO date + relative ("4.2 years ago"), decorations (`HEAD -> next/main`, `origin/stock-unlock`, branch tips), and mock diffstats (`+1335000 -0 balance.json, cap-table.md` on the seed commit, etc.).
- **Interactions:**
  - **Hover** a commit → detail pane fills with hash, author, date, branch, subject, 2–4 line body in Jake's voice, and diffstat.
  - **Click** a commit → pin the detail pane (subsequent hovers don't override). Click the same commit again or press **ESC** to unpin.
  - **Click a branch** in the sidebar → filter; other commits dim to 25%. Click again or ESC to clear.
  - **ESC** clears pin + filter at once.
- **Sidebar.** Repo header, branch list with swatches + HEAD markers, `~/life/` file-tree with `careers/`, `hobbies/`, `personal/`, and a contact block (`jake@stockunlock.com` + a cheeky `curl -sSL jake.sh | sh`).
- **Statusbar.** Current HEAD, years tracked, active filter, keyboard hint.

## What's mocked

- Hashes are synthetic but formatted plausibly (7-char short + 40-char full).
- Diffstats are flavor-text, not computed.
- The graph glyphs are hand-crafted per row, not auto-routed from a real DAG — this lets the art stay tight and readable without an SVG layout engine.
- Dates are accurate to year/month; days are best-guess.
- The avatar is a tiny ASCII art block rather than a real image, because terminal.

## If I had more time

- **Real DAG layout.** Feed a JSON commit graph into a small topo-sort + column-assignment routine and render branches as SVG Bezier curves on a canvas layer behind the glyph column. Would allow dragging the timeline, zooming, and searching.
- **`git blame` mode.** Click a file in the tree → open a side view where each line is annotated with the commit that introduced it (so `careers/stock-unlock.md` reads as a timeline of its own).
- **`/git show <sha>` URL routing.** Deep-link every commit so a tweet can point at `/#7d9e041`.
- **Keyboard-first nav.** `j`/`k` to walk commits, `/` to fuzzy-search subjects, `gg` / `G` to jump to root / HEAD — fully vim-native.
- **`git reflog`-style secondary view.** Un-chosen paths: the startup I didn't start, the job I turned down. Same engine, different data.
- **Sound.** Typewriter click on hover; a faint terminal bell on merge commits. Optional, toggleable.
- **Contribution heatmap** under the file tree (the GitHub profile square grid) for the last year of life-commits.

## Files

- `index.html` — terminal shell + three-pane layout.
- `styles.css` — GitHub Dark tokens, branch color palette, row/glyph styling, detail pane.
- `app.js` — commit dataset, glyph renderer, hover/click/filter interactions.
