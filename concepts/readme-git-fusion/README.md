# readme-git-fusion

GitHub-repo chrome is the primary shell. The git-log is folded in as a feature,
not a mode.

Vanilla HTML/CSS/JS. No build step. Opens via `file://` or
`python3 -m http.server`. Only external libs are marked.js and highlight.js
(CDN).

## Files

- `index.html`  shell markup (header, file tree, main pane, right rail, raw
  modal). Loads marked + highlight + three local scripts.
- `styles.css`  inherited GitHub-dark/light palette from readme-mode, plus a
  Timeline pane and a `data-skin="terminal"` modulation.
- `content.js`  README / PROJECTS / HIRE / CONTACT / CHANGELOG markdown
  strings, voiced per `_shared/VOICE.md`, facts sourced from
  `_shared/content.json`.
- `timeline.js`  branches + commits for the git-log view, plus the render
  pipeline (year dividers, rail glyphs, expandable `git show` panels, branch
  filter, search).
- `app.js`  glue: marked renderer, file tree / tab state, theme toggle,
  terminal skin toggle, raw modal, in-content anchor nav, TIMELINE entry
  point.

## What's implemented

- **README chrome kept verbatim.** Repo breadcrumb, Code/Issues/PRs tabs,
  file tree, TOC scroll-spy, GitHub Dark/Light theme toggle, anchor-link
  headers, copy buttons on code blocks, collapsible FAQ `<details>`, Raw
  source modal.
- **TIMELINE file in the tree.** Renders in the same main pane the
  markdown files use  no modal, no page swap. Four tidy columns:
  rail/glyph, short SHA, date, message. Branch-colored dots on a vertical
  rail. HEAD commit pulses. Year dividers separate eras.
- **Clickable commits expand in-place.** Click a commit  a `git show`
  style panel drops inline below the row: full SHA, author, relative
  date, branch, body, tags, and a mini-diffstat with `+`/`-` bars. Click
  again (or the `close` chip) to collapse. Only one expanded at a time,
  so the log never turns into a wall.
- **Right rail swaps by view.** On markdown files: "On this page" TOC +
  repo metadata. On TIMELINE: branches list (click to filter) and
  Jump-to-year.
- **Branch filter + search.** Live filter in the Timeline header. Search
  highlights matches in subject lines. `Esc` clears.
- **Terminal skin toggle** (header button, near theme toggle). Flips
  `data-skin="readme" | "terminal"` on `<html>`. In terminal skin:
  slightly darker background tint, monospace body typography,
  `$`-prefixed headers, `$ ls -la` label over the file tree. **Subtle,
  not CRT.** Linear's in-app terminal, not tmux. Flip back any time.
- **Pronk branch merges into stock-unlock.** Preserved as a commit on
  the stock-unlock branch with the `Merge branch 'pronk' into
  stock-unlock` subject, styled as a merge node (hollow dot).

## Mode toggle behavior

- `Theme` (Dark/Light): swaps CSS variables + highlight.js theme. Persisted
  in `localStorage` as `rgf-theme`.
- `Terminal` (README/Terminal): flips `data-skin`. Persisted as `rgf-skin`.
  The two are orthogonal: terminal-skin + light, terminal-skin + dark,
  readme-skin + light, readme-skin + dark all work.

## Clickable commits

- Click anywhere on a commit row  inline expansion.
- Only one expanded at a time  clicking another collapses the open one.
- The expanded panel contains:
  - `commit <40-char sha>`  `Author`  `Date (relative)`  `Branch`
  - Prose body in Jake's voice (the "why it mattered" the raw subject
    can't fit)
  - Tag chips
  - Diffstat with per-file `+`/`-` bars and a life-event summary line
- `close` chip or a second click on the row collapses it.

## Fixes relative to git-log-v2

- **No text splashing.** Log body clamped to `max-width: 980px`. Commit
  columns share a 4-column grid, not free-flow.
- **Fonts sized correctly.** 13px mono for log rows (14px tabular
  comfort). 14px Inter for commit bodies (13px in terminal skin).
  Leading at 1.45-1.6 everywhere.
- **Clean alignment.** `44px / 72px / 96px / 1fr` grid. Hash, date, and
  message never jitter between rows.
- **Approachable terminal feel.** Kept the GitHub chrome. The "terminal"
  is an optional skin, not the whole site. No phosphor/scanline/CRT.

## If I had more time...

- Real inline diff snippets under the diffstat (a few colored lines per
  file), not just bars.
- A "branch diagram" mini-map at the top of TIMELINE that matches the
  rail glyph exactly and lets you drag to filter a year range.
- Commit permalinks (`#c0d3baf`) so you can deep-link to an expanded
  commit.
- Merge-commit glyph that visibly forks-and-joins across rows (the
  `pronk -> stock-unlock` merge is marked with a hollow dot today, but
  not drawn as a joining line).
- Keyboard navigation (j/k, Enter) in Timeline matching the vim-ish
  feel of git-log-v2, without forcing it on the non-terminal user.
- A subtle per-branch left-rail stripe in the expanded panel that
  continues the commit color into the `git show` region.
