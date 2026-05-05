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

**Stock Unlock third co-founder is unnamed on the rendered site.** Refer to him as `a third co-founder`, `a fellow Oscar engineer`, or `a fellow engineer from Oscar`, depending on context. Never use his name (it stays in private notes only). Daniel Pronk is named.

**Emotiqueue co-builder is unnamed on the rendered site.** Earlier drafts referred to "with my coworker Peter" or "with Peter"; Jake doesn't want the name surfaced. Frame Emotiqueue without attribution: `Built Emotiqueue, the internal Slack bot. Half goof, half real tool, the kind of culture-carrier energy I try to seed wherever I work.` (or similar). The "we" in the timeline story body is fine since it's unnamed plural.

**Senior Software Engineer.** When referring to Jake's exit level at Oscar, use the full term ("Senior Software Engineer") on first mention in a section. "Senior" alone is fine afterward.

**Team-lead path: declined ONCE, near the end.** Not twice. Earlier drafts said "twice" and "declined both times"; that's wrong and Jake has corrected it multiple times. Canonical: "Declined the team-lead path near the end" (or "once, near the end"). If you see "twice" or "both times" in a team-lead-path context anywhere, it's a regression, fix it.

**The fifteen-plus-year through-line is software engineering, NOT "code and cubes".** Earlier drafts paired the two as "the two that have held fifteen-plus years"; Jake corrected this because he hasn't been consistently cubing for fifteen years. Cubing belongs in the mastery section as a competed-then-moved-past pursuit (2008–2014). Canonical framing: **"Software engineering is the one that stuck."** ("Software engineering is the through-line that's held fifteen-plus years" was tried and Jake rejected it as clunky.) The mastery section does NOT use a "the rest are X" framing sentence (every variant — "receipts that the pattern is real", "things I got weirdly good at along the way" — was rejected). The hobby list speaks for itself; the section header carries the framing. If you see "code and cubes" / "cubes and code" framed as the dual through-line, it's a regression.

**Pattern phrase: sentence form, no colon prefix.** The canonical phrasing is **"Committing hard to things with depth has been the pattern through my life. Software engineering is the one that stuck."** Earlier drafts used the colon-prefixed forms `Pattern: I commit hard to things with depth.` and `Pattern throughout my life: I commit hard to things with depth.` — both rejected as abrupt. If you see either colon form return on rendered surfaces (xp/, readme/, saas/), it's a regression.

**No invented acronyms.** Spell out **CommerceHub** and **My Plastic Brain** in full every time. Don't shorten to "CH" / "MPB" / similar. The only acronyms allowed in rendered content are real, externally-recognized ones (YC, ACM, WCA, NYC, MVP, JV, FT, IDE, API, AWS, SES, SEO, GEO, etc.). 2-letter brand monograms in avatar/chip UI (e.g. `SU`, `OH`, `JR`) are fine because they're visual, not prose.

**Resume usage (`official_resume.pdf`).** ~9 years out of date. Authoritative for **pre-2017 dates only** (CommerceHub start/end, SUNY Albany graduation, ACM and TA dates). Do **not** pull post-2017 facts from it; those still come from `BACKBONE.md` and `rambles-personal-bio-conversations.md`. The resume is staying as-is until Jake updates it as a separate effort.

**Stock Unlock day-to-day team is "small, lean team", NOT "three-person team".** On rendered surfaces describing the post-rightsizing team (e.g., the Discord agent's audience, "who runs SU now"), use `small, lean team`. The factual `three full-time (two engineers + an exec assistant)` phrasing is fine in Stock Unlock company-history context where the headcount itself is the point. `three-person team` was tried and Jake rejected it as flat. Do not regress.

**Stock Unlock chat is Discord, not Slack.** Never say `Slack` for Stock Unlock day-to-day chat. Use `Discord` (the actual tool) or `in chat` (generic). Saying `Slack` adjacent to "Discord bot" makes the writer look ridiculous.

**Discord agent model invocation: direct Anthropic + MiniMax SDKs, NOT Bedrock.** Heads-up for any agent fact-checking the Discord agent's model layer: the EC2 IAM role at `../stock-unlock/infra/agents/iam/agent-ec2-role-policy.json` permits Bedrock invocation, but the bot doesn't actually call Bedrock. Model IDs in code are `anthropic/claude-sonnet-4-6` and `minimax/MiniMax-M2.7` (LiteLLM direct-API format, not Bedrock's `bedrock/anthropic.claude-...` format). API keys live in AWS Secrets Manager. Don't claim Bedrock on rendered surfaces or in BACKBONE — the IAM-permission-vs-actual-usage gotcha has bitten this site once already.

**No "next chapter" framing.** Anywhere.

**No surfacing of personal-life content.** "Engaged", wedding planning, etc., out. Site is professional.

**No Convictions / "What I'm for, what I'm against" section anywhere.** Removed from `xp/` 2026-04-30 per Jake's call ("not driving any value"). The substance lives in `BACKBONE.md` as private reference only. Don't propagate to readme/saas; remove on the parity sweep. Serendipity-as-working-principle survives, but only as a small italic aside at the very bottom of the page, framed personal ("I'll shoot my shot"). Not as a section heading.

**AI section is "Recent AI projects".** Section h2 reads `Recent AI projects · post-Opus 4.5` (or equivalent on other mediums). Above the project accordion sits a minimal lead, no green callout: the label `My AI philosophy:`, the italic quoted headline `"I drive AI. It doesn't drive me."`, a muted parenthetical aside `(yes, like a car)`, then 3 numbered points (capability changes weekly; stay on top of architecture; never go blind). Project accordion uses the same `.work-row` pattern as work history. Don't expand the bullets back into prose paragraphs and don't reintroduce the green callout, both were tried and rejected.
