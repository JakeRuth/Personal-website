# README.md mode

Prototype 1 of 13: Jake Ruth's personal site, rendered as if it were the README.md of a thoughtful engineer's GitHub repo. Not just "markdown rendered in a browser" — the full GitHub code-view chrome around it, refined. Pairs conceptually with the Git Log mode as an engineer-native duo.

## Run it

- Double-click `index.html` (opens via `file://`), OR
- `python3 -m http.server` in this directory and visit `/`.

No build step. No npm. CDN-only dependencies: [marked.js](https://cdn.jsdelivr.net/npm/marked@12.0.2/) for markdown, [highlight.js](https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.9.0/) for code, Google Fonts for Inter + JetBrains Mono.

## What's implemented

- **Full GitHub-style code-view chrome.** Top header with repo breadcrumb, Code/Issues/PRs/Actions tabs, branch picker, file tree on the left, file tabs above the rendered markdown, on-this-page TOC on the right.
- **File tree.** Click `README.md`, `CHANGELOG.md`, `PROJECTS.md`, `CONTACT.md`, or `HIRE.md` to open it as a new tab in the main pane. All five files are hand-written, voice-correct, and use the same rendering pipeline.
- **Auto-generated TOC from H2s**, with smooth-scroll on click and an IntersectionObserver scroll-spy that highlights the current section.
- **Title block with version badge** (`v13.0.0`), release date, and seven shields.io-style status badges (YC W22, NYC, status available, AI driver-seat, years shipping, license, 3x3 avg).
- **Styled H2 headings with hover-reveal `#` anchor links** that update the URL hash and copy the deep link.
- **GitHub-style callout blockquotes** (`> [!NOTE]`, `> [!TIP]`, `> [!WARN]`). Rendered with proper icon + color.
- **Real markdown timeline table** pulled from content.json.
- **Featured Projects grid** as HTML-in-markdown cards, one per project (Stock Unlock, Oscar chatbot, Customer.io → SES migration, Discord bot, Webflow rewrite, grails-shiro-guard).
- **Stock Unlock section** that strictly follows the VOICE.md framing rule (built it, scaled to 8 + thousands, profitable today, not full-time, redefining next chapter — never "currently running").
- **Philosophy section** with the "driver in the driver's seat" quote and a Python code block showing the AI-writes / human-reviews pattern. Syntax-highlighted.
- **Hire options pricing table** with no real dollar prices — per VOICE.md, only `Market rate + equity`, `Contact`, `Let's talk`, etc.
- **FAQ as collapsible `<details>` elements** — "Why are you leaving Stock Unlock?", "What's the unicycle cube thing?", and five more.
- **Contact card** with email, GitHub, resume link (uses the canonical `../../official_resume.pdf` path), location, response posture.

## Interactions

- Click any H2 in the right-side TOC to smooth-scroll.
- Hover any heading to reveal a `#` anchor link — click it to deep-link + copy the URL.
- Copy button on every code block (bash / python / ts).
- Collapsible `<details>` on every FAQ.
- File tree opens files as tabs in the main pane (README.md stays pinned; CHANGELOG, PROJECTS, CONTACT, HIRE join as you click).
- "Raw" button in the top-right opens a modal with the active tab's unrendered markdown source (the meta-touch). Copy button inside copies the raw text.
- `Esc` or backdrop click closes the modal.

## Theme toggle

Top-right button switches between **GitHub Dark** and **GitHub Light**. Preference persists in `localStorage`. The highlight.js syntax theme switches with the UI theme. Tokens are all CSS custom properties on `:root[data-theme]`.

## Voice checklist (self-audit)

- Stock Unlock framed per the rule: built / scaled / profitable today / not full-time / redefining next chapter. Never implies current full-time ownership.
- No dollar prices in the pricing table. `Market rate + equity`, `Contact`, `Let's talk` only.
- No "passionate," "excited," "innovative," "synergy," "rockstar," "ninja."
- Uses 2 anecdotes in the main README (Pronk emails in Stock Unlock section, unicycle cube in FAQ), with AP CS switch implied in the Overview. Nothing over-packed.
- The "driver in the driver's seat" line lives in Philosophy, paired with the AI-writes / human-reviews code pattern — concrete, not preachy.

## If I had more time

- **Inline command palette** (`Cmd+K`) for fuzzy-jumping to any heading or file.
- **A real git-blame-style hover** on paragraphs — "committed 2024-12 · stepped back to maintenance."
- **Issue and PR tabs that actually do something** — an "issues" list of things Jake thinks are broken about the software industry, a "PR" opening a real hire conversation.
- **Server-rendered OG cards** that render the hero as an image for social shares.
- **Variable-width vs. fixed-width toggle** to match the real GitHub rendering choice.
- **Dark / Light / High-contrast / Dimmed** — match GitHub's four themes instead of two.
- **Keyboard shortcuts** (`t` for file tree, `g` + `g` for top) borrowed from GitHub.
- **Print stylesheet** so you can literally print the README as a resume.

## File map

- `index.html` — page chrome (header, sidebar, main pane, TOC, modal)
- `styles.css` — all styling (theme tokens, chrome, markdown typography, callouts, tables, cards, details, modal)
- `app.js` — marked + highlight.js wiring, TOC scroll-spy, copy buttons, file-tree / tabs, theme toggle, modal
- `content.js` — the five markdown files as plain strings (README, PROJECTS, CONTACT, HIRE, CHANGELOG)
