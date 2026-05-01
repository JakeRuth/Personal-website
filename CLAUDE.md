# jakeruth.com, Personal Website Rebuild

Project context for future Claude sessions. Read this first, then `rambles-personal-bio-conversations.md` (gitignored, repo root, Jake's voice-to-text transcripts).

## Mission

Complete rebuild of jakeruth.com as a portfolio showcase. Genuinely unique site, not a template. Communicates who Jake is quickly while impressing visitors with build quality and creativity. No deadline.

## Hard constraints

- **100% built with AI (Claude Code), reviewed by Jake.** Intentional, declared in the README on push. Exact framing wording TBD.
- **Code must be elegant.** No over-engineering. Smallest implementation that works. Delete dead code fully.
- **Tech stack settled:** vanilla HTML/CSS/JS, no build, GitHub Pages.

## Current shape

```
/                  Setup wizard (InstallShield-style)
/xp/               Windows XP experience
/readme/           GitHub repo experience
/saas/             Marketing-site experience
/shell/            Shared chrome (top-nav, cube transition, BFS solver)
```

Visitor flow: wizard → pick experience → cube transition → land on experience → top-nav lets them switch experiences (cube transition between). One Jake, three chromes.

The three mediums must satisfy **hard parity**: every fact, story, or claim present in any one medium must be present in all three. Mediums differ visually, not in information content.

**Live site (`jakeruth.com`)** still serves the 2017-era React build. Local alpha is many commits ahead and unpushed.

**Personal email throughout the site:** `jake2ruth@gmail.com`.

## Cross-page consistency rules

These apply on every medium (`xp/`, `readme/`, `saas/`) and the wizard at `/`. When you add/edit content, follow these.

**Branded link conventions.** Every body-prose mention of these terms gets a hyperlink. Skip chrome elements (section headings, nav labels, status pills, JS-injected toast strings).

| Term | Link |
|---|---|
| `Stock Unlock` | `https://stockunlock.com` |
| `YC W22` / `YC Winter 2022` | `https://www.ycombinator.com/companies/stock-unlock` |

**Email behavior.** Every `mailto:jake2ruth@gmail.com` link and every `data-copy-email` element copies the address to clipboard and shows a toast (no mail client launch). Implemented site-wide via `shell/email-copy.js`. Don't add new mailto launches.

**No em-dashes (`—`) or `&mdash;` in any rendered output.** This includes ARIA labels, alt text, and JS-injected strings, anything a screen reader or browser surfaces. Use `,`, `.`, `;`, `:`, `(parens)`, or ` · ` (middle dot, for label/sublabel separators in section headers) depending on context. Em-dashes are a recognized AI tell. Comments in source are exempt.

**No specific dollar prices, no explicit ARR figures** anywhere in pricing UI. Use "Contact", "Talk to Jake", "Market rate + equity".

**Number formatting.** Subscriber counts in the thousands render as `~3.9k`, not `~3,900` or `3,900 sustained`. The tilde + k form is the house style.

**Stock Unlock framing.** See `BACKBONE.md → Companies and orgs → Stock Unlock` for the canonical frame. The non-negotiables: never imply Jake is full-time at SU, never imply the company is dead. Title is **Co-founder, CEO**.

**Co-founder mentions.** When introducing the Youni co-founders, lead with the descriptor (`two UAlbany D1 soccer players (Anthony, CEO; Jordan)`), not the bare names. Names alone don't carry signal for an outside reader.

**Senior Software Engineer.** When referring to Jake's exit level at Oscar, use the full term ("Senior Software Engineer") on first mention in a section. "Senior" alone is fine afterward.

**No invented acronyms.** Spell out **CommerceHub** and **My Plastic Brain** in full every time. Don't shorten to "CH" / "MPB" / similar. The only acronyms allowed in rendered content are real, externally-recognized ones (YC, ACM, WCA, NYC, MVP, JV, FT, IDE, API, AWS, SES, SEO, GEO, etc.). 2-letter brand monograms in avatar/chip UI (e.g. `SU`, `OH`, `JR`) are fine because they're visual, not prose.

**Resume usage (`official_resume.pdf`).** ~9 years out of date. Authoritative for **pre-2017 dates only** (CommerceHub start/end, SUNY Albany graduation, ACM and TA dates). Do **not** pull post-2017 facts from it; those still come from `BACKBONE.md` and `rambles-personal-bio-conversations.md`. The resume is staying as-is until Jake updates it as a separate effort.

**No "next chapter" framing.** Anywhere.

**No surfacing of personal-life content.** "Engaged", wedding planning, etc., out. Site is professional.
