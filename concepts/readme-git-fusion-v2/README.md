# readme-git-fusion-v2

Polish pass on `readme-git-fusion`. Same foundation: GitHub-repo chrome is the
primary shell, git-log is folded in as a TIMELINE file, terminal skin is an
optional modulation. No build step. CDN-only libs (marked.js, highlight.js).
Opens via `file://` or `python3 -m http.server`.

## What changed vs v1

### Content depth (more, deeper, in-voice)

- **New files in the tree:** `ABOUT.md`, `STOCK_UNLOCK.md`, `HOBBIES.md`, `FAQ.md`.
  All four are now clickable and render in the main pane.
- **STOCK_UNLOCK.md** is the long-form version of the SU story: origin, YC,
  the raise, scale, the "why it exists" conviction, the flattening, and what
  "not full-time" actually means. Respects the framing rule verbatim.
- **ABOUT.md** walks Westchester -> Albany -> NYC with the AP CS switch, the
  CommerceHub prod-takedown, Oscar under Alan Warren, and the unicycle cube.
- **HOBBIES.md** covers cubing (13.95s), unicycle, skate/DDR/Guitar Hero, track,
  soccer, rugby, climbing, guitar, meditation.
- **FAQ.md** expands the README FAQ, and the same questions are mirrored in
  the Issues tab for a second read path.
- **README.md** itself tightened: extra FAQ items (remote vs. onsite,
  will-you-manage), added programmatic cross-links to the doc files.

### New features

- **Star / Fork buttons** in the header. Star is a mock GitHub star with a
  persisted fake count (starts at 347; clicking toggles and pops +1).
  Fork opens a pre-filled mailto ("fork my career").
- **Issues tab works.** Top-bar `Issues` tab renders the FAQ as five open
  issues with labels, meta, and a labels rail on the right that filters the
  list on click. Labels are color-coded per label.
- **Pull requests tab works.** Top-bar `Pull requests` tab renders four
  career-event PRs (chapter-II open PR + three merged PRs) with state chips,
  branch -> base, commits/files/+/- stats, and a reviewers rail on the right
  (JR, DP, NP).
- **Toasts.** Small toast for "Anchor link copied," "Starred," "Copied source
  to clipboard," "That tab is decorative."
- **Copy rendered source** from the file-chrome icon copies the current view's
  source to clipboard.
- **Deep link to doc files** via hash: `#ABOUT`, `#STOCK_UNLOCK`, `#HOBBIES`,
  `#FAQ` all route to the right file. In-content `[link](#STOCK_UNLOCK)` works.

### Typography and spacing

- Light-mode gets **Source Serif 4** for H1/H2/H3 in readme skin, plus serif
  body on commit-expand prose and issue/PR previews. Contrast and weights
  tuned for GitHub-light parity.
- Baseline line-height raised to 1.65 (body) and 1.7 (terminal skin).
- Paragraph / list / blockquote max-width clamped to 75ch so long lines do
  not stretch full-pane.
- Larger content padding on the README pane (`48px 64px`) and extra breathing
  room between sections (`h2` top margin 44px).
- Details/summary animates smoothly and has padded internal spacing.
- Inline code gets a subtle border in addition to the background tint.
- Project cards lift on hover with a soft shadow; pc-name is mono.

### Timeline polish

- **Date ordering fixed.** v1 placed oscar-health 2021-06-30 before SU launch
  2021-09-14; v2 enforces strict reverse-chrono within each year header.
- Year dividers have more breathing room.
- Commit grid widened slightly (`44/76/100`) so dates never ellipsize at 1100+.
- Hash/date/message columns all use `text-overflow: ellipsis` and no longer
  collide on narrow panes.
- HEAD dot pulses gently (2.4s) with a `prefers-reduced-motion` guard.
- Commit row hover scales the rail dot 15%.
- Expand panel uses a 180ms fade-in, no layout snap.
- Commit rows carry `id="c-<sha>"` for future deep-linking.
- Branch rail and jump rail right-rail elements are unchanged but styled
  consistently with the new label rail on Issues.

### Terminal-mode toggle

- **Smooth crossfade.** Skin toggle adds a `.skin-transition` class for 260ms
  that transitions `background`, `color`, `border-color`, and `font-family`
  on the major panes. No flash, no layout shift. The class is removed after
  the transition so first-paint never runs the transition.
- Icon-state of the Terminal button still shows the "green shell" look while
  active.

### Theme toggle

- Both dark and light are polished. The light mode is not just "dark with
  colors swapped" anymore — it picks up serif headings, tuned call-out
  backgrounds, and higher-contrast code blocks.
- highlight.js themes swap in lockstep (github-dark <-> github).
- Persistence: `rgf2-theme`, `rgf2-skin`, `rgf2-starred` in localStorage
  (namespaced away from v1).

### Raw source modal

- Fully keyboard-escapable. `Esc` closes, focus moves to the Close button on
  open, backdrop click closes.
- Shows the right raw format per view: `.md` for markdown, `git log` dump for
  TIMELINE, `issues.json` pseudo-dump for Issues, `pulls.json` for PRs.
- Close button shows an inline Esc kbd for affordance.

### Scroll-spy / anchors

- Rewritten to track the **topmost visible heading** instead of the first
  intersecting one. No jitter when two headings are both in view.
- Old observer is properly disconnected between file renders (memory leak fix).
- `rootMargin` adjusted to -92px top, -60% bottom for a comfortable sticky zone.
- Active TOC entry gets a left-border accent instead of just a color swap.

### Voice pass

- Every sentence re-read against `_shared/VOICE.md`. No "passionate,"
  no "leverage," no "synergy," no "excited."
- Contractions lightly reduced where they read too conversationally.
- Stock Unlock framing rule respected verbatim on README, STOCK_UNLOCK,
  PROJECTS, and the CHANGELOG "12.x" entry.
- Pricing rule respected — no dollar figures in hire tiers, only
  "Market rate + equity" / "Contact" / "Let's talk."

### Bug fixes

- Light-mode theme dot was mirrored and looked identical to dark-mode dot;
  v2 flips the gradient so the visible half reflects the current theme.
- "WARN" callout title on v1 said "Warn"; v2 says "Heads up" (friendlier,
  closer to GFM tone).
- Old `22f0a91` merge commit had a subject with a stray unicode character
  (the quote was fine, but the arrow glyph rendered as `->` inconsistently);
  v2 uses plain ASCII everywhere.
- The `un1cy13` fake SHA in v1 was `unicy13` (contains `i`, invalid hex).
  v2 uses `un1cy13` (all hex-legal).
- v1 read the hash `#TIMELINE` but did nothing for `#ABOUT` etc. v2 opens
  any known CONTENT key via hash.

## Files

- `index.html` — shell markup: header + top tabs, file tree, pane shell,
  TOC/branch/labels/reviewers right-rail, modal, toast.
- `styles.css` — GitHub-ish palette, serif light-mode headings,
  crossfade skin transition, Issues + PR styles, label/reviewer rails.
- `content.js` — README + ABOUT + STOCK_UNLOCK + PROJECTS + HOBBIES +
  CONTACT + HIRE + FAQ + CHANGELOG markdown strings, plus ISSUES + PRS +
  ISSUE_LABELS data for the new tabs.
- `timeline.js` — branches, commits (reverse-chrono within year headers),
  jump points, render + filter + search + raw-dump.
- `app.js` — glue: marked renderer, file tree / tab state, theme toggle,
  smooth skin toggle, raw modal, star/fork handlers, top-tab router, toast,
  hash routing, TOC scroll-spy.

## If I had more time...

- Real per-commit permalink handling (scroll to and open `c-<sha>` from
  URL hash).
- Branch diagram mini-map at the top of TIMELINE (actual forks / merges
  drawn in SVG).
- Keyboard nav (j/k, Enter) over commits for power users — without forcing
  it on casual readers.
- Inline diff snippets under the `+`/`-` bars.
- Issues with click-to-expand full comment thread (like actual GitHub).
- PR "Files changed" mini-view.
