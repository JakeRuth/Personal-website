# jakeruth.com — Personal Website Rebuild

Project context for future Claude sessions. Read this first, then `rambles-personal-bio-conversations.md` (gitignored, repo root — Jake's voice-to-text transcripts).

## Mission

Complete rebuild of jakeruth.com as a portfolio showcase. Genuinely unique site — not a template. Communicates who Jake is quickly while impressing visitors with build quality and creativity. No deadline.

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

**Branded link conventions** — every body-prose mention of these terms gets a hyperlink. Skip chrome elements (section headings, nav labels, status pills, JS-injected toast strings).

| Term | Link |
|---|---|
| `Stock Unlock` | `https://stockunlock.com` |
| `YC W22` / `YC Winter 2022` | `https://www.ycombinator.com/companies/stock-unlock` |

**Email behavior** — every `mailto:jake2ruth@gmail.com` link and every `data-copy-email` element copies the address to clipboard and shows a toast (no mail client launch). Implemented site-wide via `shell/email-copy.js`. Don't add new mailto launches.

**No em-dashes (`—`) or `&mdash;` in any rendered output.** Use `,`, `.`, `;`, `:`, `(parens)`, or ` · ` (middle dot, for label/sublabel separators in section headers) depending on context. Em-dashes are a recognized AI tell.

**No specific dollar prices, no explicit ARR figures** anywhere in pricing UI. Use "Contact", "Talk to Jake", "Market rate + equity".

**Stock Unlock framing** — see `BACKBONE.md → Companies and orgs → Stock Unlock` for the canonical frame. The non-negotiables: never imply Jake is full-time at SU, never imply the company is dead.

**No "next chapter" framing.** Anywhere.

**No surfacing of personal-life content.** "Engaged", wedding planning, etc. — out. Site is professional.
