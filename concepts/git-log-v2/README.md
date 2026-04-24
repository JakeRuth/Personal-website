# git-log-v2

**`$ git log --graph --oneline --all --decorate jakeruth/life  # now with rendered markdown and keyboard nav`**

v2 of the engineer-native resume-as-repo. Same core idea as `graph-c-gitlog`: Jake's life rendered as a `git log --graph` in a GitHub-Dark terminal. New in this pass: clickable `.md` files that render as real HTML, tighter display hierarchy, year dividers, and `j`/`k`/`/`/`Enter` keyboard navigation.

## Run

```sh
cd concepts/git-log-v2
python3 -m http.server 8000
# then open http://localhost:8000
```

Or double-click `index.html`. Works on `file://`. No build, no bundler, no npm. Two CDN deps: JetBrains Mono + Inter fonts, and `marked.js` for markdown rendering.

## What changed vs v1

### 1. Markdown files open with rendered previews

This was Jake's headline ask. The sidebar now has a clickable `Files` section with the real resume-flavored markdown files:

- **`README.md`**  landing / status / "why me" / repo map
- **`ABOUT.md`**  the longer arc, values, what I won't do
- **`PROJECTS.md`**  SU, Discord bot, Customer.io migration, Webflow rewrite, Oscar chatbot, Youni, grails-shiro-guard
- **`STOCK_UNLOCK.md`**  the framing-rule-compliant SU writeup: seed, peak, current state
- **`HOBBIES.md`**  speedcubing 13.95s, unicycle-with-cube, guitar, meditation
- **`CONTACT.md`**  how to reach out, what a good email looks like, hire tiers (no prices)

Clicking any file swaps the center pane from `git log` view to a rendered markdown pane. Supports headers, tables, inline code, fenced code blocks, blockquotes, lists, links. The render uses `marked.js` via CDN; the body uses Inter (prose font) while the rest of the UI stays in JetBrains Mono, so the markdown feels like a real README and the terminal feels like a real terminal.

The markdown content is authored from `_shared/content.json` and polished against `_shared/VOICE.md`.

### 2. Tightened display + wider detail pane

- Commit rows got a **bigger row height** (32px) and slightly larger font.
- Detail pane widened from **380px  440px** and its typography got cleaner (Inter for the body, mono for metadata).
- Decorations (`HEAD  next-chapter`, `origin/stock-unlock`, branch names) are now **pill-shaped tags** with branch-appropriate colors instead of bare strings.
- Sidebar got real section dividers, live-status dot, and bigger line spacing.
- Global font bumped 13  14px; line-height 1.55.

### 3. Year dividers + "jump to" nav

The graph now has **year headers** between decade-years (2008, 2011, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026) with a one-line label ("seed round", "scale peak", "YC + seed"). A **Jump-to** block in the sidebar scrolls to any year instantly. A **search box** at the top of the log filters commits live (matches subject, body, tags, hash, author; highlights the match).

### 4. Keyboard shortcuts

- **`j`** / **`ArrowDown`**  move cursor down a commit
- **`k`** / **`ArrowUp`**  move cursor up a commit
- **`Enter`**  pin / un-pin the cursor's commit in the detail pane
- **`/`**  focus the search input
- **`o`**  open `README.md` in markdown view
- **`g`**  jump to top (log view)
- **`G`**  jump to bottom
- **`Esc`**  clear search, pin, and filter

The cursor row gets an accent bar on the left so it's obvious where you are, even without the mouse.

### 5. `git show --stat`-style numstats flavored as life-events

Each commit carries a miniature diffstat with files, `+added/-removed`, per-file `+-+-` bars (scaled), and a one-line summary that reads like a life-event rather than a diff:

- scale-peak commit: `8 employees added, 0 removed  for now`
- wedding: `1 person added, 0 removed`
- AI renaissance: `3 tools added, 1 mindset shifted`
- AP CS switch: `1 sideways pivot, 13 years of consequences`
- public launch: `211 files changed, +18,420 insertions, 1 customer`

### 6. Voice pass

Commit subjects and bodies went through VOICE.md. Removed weak modifiers. Kept the unicycle. Added the AP CS pivot as its own 2011 commit. Added the talent show as its own 2018 commit. Reframed the Stock Unlock stepping-back commit per the framing rule ("profitable side business", not "scaled back"). Dropped em-dashes that were load-bearing; kept the ones that land.

## What's still mocked

- Hashes are plausibly-formatted but synthetic.
- Diffstat numbers are flavor. The scale-peak commit really does correspond to 8 FTE and thousands of customers, but nobody actually committed `ops/payroll +8, -0`.
- The graph glyphs are hand-drawn per row  not auto-laid-out from a real DAG  because the art reads better curated.
- Dates are accurate to month; exact days are best-guess where not specified in content.json.

## If I had more time

- **Real markdown editor** (contenteditable) so Jake can live-edit the README right in the page before export.
- **Routing on hashes**  deep-link every commit (`#c0d3baf`) and every file (`#file=ABOUT.md`) so they're shareable.
- **`git blame` mode**: click a file in the tree and see every line annotated with the commit that introduced it (the ABOUT.md timeline).
- **Syntax highlighting in fenced code blocks** via Prism (CDN) once the rest of the frame feels right.
- **Real DAG layout**: topologic sort + column assignment rendered as SVG Bezier curves behind the glyph column. Would support zoom and "collapse this branch."
- **Two-finger scroll on the glyph column** to peek at column indices over time (like GitHub's graph hover).
- **Contribution heatmap** under the file tree  the green-square grid for the last year of life-commits.
- **Reflog view**  the un-chosen paths: the jobs I turned down, the startup I didn't start. Same engine, different dataset.
- **Screen-reader pass**  add proper ARIA roles to the commit rows, keyboard-announce the cursor, make the markdown pane semantically accurate.

## Files

- `index.html`  three-pane layout + tab switcher
- `styles.css`  GitHub Dark tokens, branch colors, log + md pane typography, detail-pane redesign
- `app.js`  commit dataset (tightened voice), render, keyboard nav, filter, search, diffstat rendering, view switching
- `content-md.js`  the six `.md` files (README/ABOUT/PROJECTS/STOCK_UNLOCK/HOBBIES/CONTACT) as markdown strings, sourced from `_shared/content.json`

## CDN deps

- `fonts.googleapis.com`  JetBrains Mono (terminal chrome) + Inter (markdown body)
- `cdn.jsdelivr.net/npm/marked`  markdown-to-HTML
