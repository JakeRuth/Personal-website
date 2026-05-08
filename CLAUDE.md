# jakeruth.com, Personal Website Rebuild

Project context for future Claude sessions. Read this first, then `BACKBONE.md` for canonical content, then `rambles-personal-bio-conversations.md` (gitignored, repo root, Jake's voice-to-text transcripts).

## Mission

Complete rebuild of jakeruth.com as a portfolio showcase. Genuinely unique site, not a template. Communicates who Jake is quickly while impressing visitors with build quality and creativity.

## Hard constraints

- **100% built with AI (Claude Code), reviewed by Jake.** Canonical wording in footer / README: `100% built with AI (Claude Code), reviewed by Jake`.
- **Code must be elegant.** No over-engineering. Smallest implementation that works. Delete dead code fully.
- **Tech stack settled:** vanilla HTML/CSS/JS, no build, GitHub Pages.

## Current shape

```
/                  Setup wizard (InstallShield-style)
/xp/               Windows XP experience
/readme/           GitHub repo experience
/saas/             Marketing-site experience
/shell/            Shared chrome (top-nav, cube transition, BFS solver)
/resume/           Resume HTML source + rendered PDF
```

Visitor flow: wizard → pick experience → cube transition → land on experience → top-nav lets them switch experiences (cube transition between). One Jake, three chromes.

The three mediums must satisfy **hard parity**: every fact, story, or claim present in any one medium must be present in all three. Mediums differ visually, not in information content.

**`/xp/` is the rendered source of truth for content.** When the three mediums diverge, `/xp/` wins. `/readme/` and `/saas/` adapt voice and structure to fit their chrome (GitHub markdown, marketing prose) but never carry a fact, story, or framing that isn't on `/xp/`. `BACKBONE.md` is the upstream reference doc; `/xp/` is the rendered ground truth.

Personal email throughout the site: `jake2ruth@gmail.com`.

## Style and voice rules

These apply on every medium and the wizard at `/`.

**Branded link conventions.** Each page links these terms at least once near the top mention. Chrome elements (section headings, nav labels, status pills, JS-injected toast strings) are exempt.

| Term | Link |
|---|---|
| `Stock Unlock` | `https://stockunlock.com` |
| `YC W22` / `YC Winter 2022` | `https://www.ycombinator.com/companies/stock-unlock` |

**Email behavior.** Every `mailto:jake2ruth@gmail.com` link and every `data-copy-email` element copies the address to clipboard and shows a toast (no mail client launch). Implemented site-wide via `shell/email-copy.js`. Don't add new mailto launches.

**No em-dashes (`—`) or `&mdash;` in any rendered output.** Includes ARIA labels, alt text, and JS-injected strings. Use `,`, `.`, `;`, `:`, `(parens)`, or ` · ` (middle dot, for label/sublabel separators) depending on context. Em-dashes are a recognized AI tell. Source comments are exempt.

**No specific dollar prices, no explicit ARR figures.** Use "Contact", "Talk to Jake", "Market rate + equity".

**Number formatting.** Subscriber counts in the thousands render as `~3.9k`, not `~3,900`.

**Stock Unlock title is Co-founder, CEO.** Day-to-day team is `a small, lean team` (no specific headcount on rendered surfaces). Voice is glass-half-full: profitable, durable steady-state, right-sized in early 2026, runs profitably today. Never imply Jake is full-time at SU; never imply the company is dead.

**Stock Unlock chat is Discord, not Slack.**

**Co-founder mentions.** When introducing the Youni co-founders, lead with the descriptor (`two UAlbany D1 soccer players (Anthony, CEO; Jordan)`), not bare names. Daniel Pronk is named at Stock Unlock; the third Stock Unlock co-founder and the Emotiqueue co-builder are unnamed on rendered surfaces.

**Senior Software Engineer.** Use the full term on first mention in a section for Jake's exit level at Oscar. "Senior" alone is fine after.

**No invented acronyms.** Spell out **CommerceHub** and **My Plastic Brain** in full. Real, externally-recognized acronyms (YC, ACM, WCA, NYC, MVP, JV, FT, IDE, API, AWS, SES, SEO, GEO, etc.) are fine. 2-letter brand monograms in avatar/chip UI are fine because they're visual, not prose.

**Resume.** Canonical resume HTML at `/resume/index.html`; rendered PDF at `/resume/Jake_Ruth_Resume.pdf`. Every "Resume" link points to the PDF.

**No "next chapter" framing.** Anywhere.

**No personal-life content.** Site is professional.

**No pronouns about Jake (he/him, his) on rendered surfaces.** The rule scopes to first-person framing of Jake's bio, profile chips, hover panels, signatures. Third-party pronouns (about Daniel, Anthony, Mrs. Nalbandian, etc.) are fine in narrative prose.

**No meta dev-notes on rendered surfaces.** If a section is meant to be quiet/subtle, just write the quiet/subtle version; don't narrate the intent. Editorial scaffolding stays in BACKBONE.md.

**AI section is "Recent AI projects".** Section h2 reads `Recent AI projects · post-Opus 4.5`. Above the project accordion sits a minimal lead: the label `My AI philosophy:`, the italic quoted headline `"I drive AI. It doesn't drive me."`, a muted parenthetical aside `(yes, like a car)`, then 3 numbered points. Project accordion uses the same `.work-row` pattern as work history.
