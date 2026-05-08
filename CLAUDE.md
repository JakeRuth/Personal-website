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

**`/xp/` is the rendered source of truth for content.** When the three mediums diverge, `/xp/` wins. `/readme/` and `/saas/` adapt voice and structure to fit their chrome (GitHub markdown, marketing prose) but never carry a fact, story, or framing that isn't on `/xp/`. If `/xp/` doesn't say it, no medium says it. If `/xp/` says it, every medium says it. `BACKBONE.md` is the upstream reference doc; `/xp/` is the rendered ground truth.

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

**Stock Unlock voice: glass-half-full, never glass-half-empty.** SU is a profitable, durable business with thousands of customers who love it. The narrative leans positive without over-embellishing. Banned framings on every rendered surface: `wall`, `hit a wall`, `~3.9k-paying-subscriber wall`, `burned the team`, `didn't land`, `didn't reach VC-backed scale goals`, `plateau` (as a heading or noun for the era), `failed`, `flatlined`. Canonical framings: `sustained ~3.9k paying customers at a profitable, durable steady-state`, `explored adjacent paths to keep growing`, `made a heavy late-2025 feature push`, `right-sized in early 2026 around the steady-state we'd built`, `runs profitably today`, `a small, lean team handles day-to-day`. Steady-state is the canonical noun; right-size is the canonical verb. The XP page is the rendered reference, voice it like that. Jake has corrected this multiple times. Do not regress.

**Co-founder mentions.** When introducing the Youni co-founders, lead with the descriptor (`two UAlbany D1 soccer players (Anthony, CEO; Jordan)`), not the bare names. Names alone don't carry signal for an outside reader.

**Stock Unlock third co-founder is unnamed on the rendered site.** Refer to him as `a third co-founder`, `a fellow Oscar engineer`, or `a fellow engineer from Oscar`, depending on context. Never use his name (it stays in private notes only). Daniel Pronk is named.

**Emotiqueue co-builder is unnamed on the rendered site.** Earlier drafts referred to "with my coworker Peter" or "with Peter"; Jake doesn't want the name surfaced. Frame Emotiqueue without attribution: `Built Emotiqueue, the internal Slack bot. Half goof, half real tool, the kind of culture-carrier energy I try to seed wherever I work.` (or similar). The "we" in the timeline story body is fine since it's unnamed plural.

**Senior Software Engineer.** When referring to Jake's exit level at Oscar, use the full term ("Senior Software Engineer") on first mention in a section. "Senior" alone is fine afterward.

**Team-lead path: NOT surfaced on rendered pages.** The fact (declined once, near the end of Senior SWE year, to stay close to the code) lives in BACKBONE.md only as historical context. Earlier drafts mentioned it on xp/, readme/, and saas/; Jake removed it as not pulling its weight on the site. Do NOT re-add the "declined the team-lead path near the end" sentence (or any variant) to any rendered surface, including work-history accordions, case-cards, timeline commits, FAQ answers, or PR descriptions. If a future prompt asks for the fact, point to BACKBONE. If you also see "twice" or "both times" in any team-lead-path context (including in BACKBONE), that's a separate regression: canonical is "once, near the end".

**The fifteen-plus-year through-line is software engineering, NOT "code and cubes".** Earlier drafts paired the two as "the two that have held fifteen-plus years"; Jake corrected this because he hasn't been consistently cubing for fifteen years. Cubing belongs in the mastery section as a competed-then-moved-past pursuit (2008–2014). Canonical framing: **"Software engineering is the one that stuck."** ("Software engineering is the through-line that's held fifteen-plus years" was tried and Jake rejected it as clunky.) The mastery section does NOT use a "the rest are X" framing sentence (every variant — "receipts that the pattern is real", "things I got weirdly good at along the way" — was rejected). The hobby list speaks for itself; the section header carries the framing. If you see "code and cubes" / "cubes and code" framed as the dual through-line, it's a regression.

**Pattern phrase: sentence form, no colon prefix.** The canonical phrasing is **"Committing hard to things with depth has been the pattern through my life. Software engineering is the one that stuck."** Earlier drafts used the colon-prefixed forms `Pattern: I commit hard to things with depth.` and `Pattern throughout my life: I commit hard to things with depth.` — both rejected as abrupt. If you see either colon form return on rendered surfaces (xp/, readme/, saas/), it's a regression.

**No invented acronyms.** Spell out **CommerceHub** and **My Plastic Brain** in full every time. Don't shorten to "CH" / "MPB" / similar. The only acronyms allowed in rendered content are real, externally-recognized ones (YC, ACM, WCA, NYC, MVP, JV, FT, IDE, API, AWS, SES, SEO, GEO, etc.). 2-letter brand monograms in avatar/chip UI (e.g. `SU`, `OH`, `JR`) are fine because they're visual, not prose.

**Resume.** Canonical resume is at `/resume/index.html` (HTML source); the rendered PDF lives at `/resume/Jake_Ruth_Resume.pdf` and is what every "Resume" / "Get resume" link on the site points to. The earlier 9-year-old `official_resume.pdf` at the repo root has been removed; do not reintroduce that path. Resume content rules and the render command live in `resume/RESEARCH_HANDOFF.md`.

**Stock Unlock day-to-day team is "small, lean team". No specific headcount on rendered surfaces, anywhere, ever.** This includes prose, build-log / metrics rows, KV pairs, chips, tags, About, footers, hover panels, and timeline commit messages. Banned phrasings on rendered surfaces: `three-person team`, `three full-time`, `three FT`, `3 FT`, `3 FT (2 eng + EA)`, `two engineers + an exec assistant`, `two engineers and an executive assistant`, and any numeric variant. The factual headcount lives in BACKBONE.md only as a private side-note. Canonical rendered phrasing: `a small, lean team handles day-to-day` (or close paraphrase). Jake has corrected this multiple times and explicitly said "we are not saying that, we're saying lean team". Do not regress.

**Stock Unlock chat is Discord, not Slack.** Never say `Slack` for Stock Unlock day-to-day chat. Use `Discord` (the actual tool) or `in chat` (generic). Saying `Slack` adjacent to "Discord bot" makes the writer look ridiculous.

**Discord agent model invocation: direct Anthropic + MiniMax SDKs, NOT Bedrock.** Heads-up for any agent fact-checking the Discord agent's model layer: the EC2 IAM role at `../stock-unlock/infra/agents/iam/agent-ec2-role-policy.json` permits Bedrock invocation, but the bot doesn't actually call Bedrock. Model IDs in code are `anthropic/claude-sonnet-4-6` and `minimax/MiniMax-M2.7` (LiteLLM direct-API format, not Bedrock's `bedrock/anthropic.claude-...` format). API keys live in AWS Secrets Manager. Don't claim Bedrock on rendered surfaces or in BACKBONE — the IAM-permission-vs-actual-usage gotcha has bitten this site once already.

**No "next chapter" framing.** Anywhere.

**No surfacing of personal-life content.** "Engaged", wedding planning, etc., out. Site is professional.

**No pronouns (he/him, she/her, they/them, etc.) anywhere on rendered surfaces.** Banned site-wide. Don't add to bios, avatar rows, profile chips, hover panels, signatures, or anywhere else a reader sees. If you find one in the codebase, remove it.

**No meta dev-notes / internal-direction prose on rendered surfaces.** Lines like "Quiet line, not a banner: ..." that read like internal CMS instructions to a writer rather than content for the reader are banned. If a section is meant to be quiet/subtle, just write the quiet/subtle version; don't narrate the intent. The reader should never see the editorial scaffolding.

**No Convictions / "What I'm for, what I'm against" section anywhere.** Removed from `xp/` 2026-04-30 per Jake's call ("not driving any value"). The substance lives in `BACKBONE.md` as private reference only. Don't propagate to readme/saas; remove on the parity sweep. Serendipity-as-working-principle survives, but only as a small italic aside at the very bottom of the page, framed personal ("I'll shoot my shot"). Not as a section heading.

**AI section is "Recent AI projects".** Section h2 reads `Recent AI projects · post-Opus 4.5` (or equivalent on other mediums). Above the project accordion sits a minimal lead, no green callout: the label `My AI philosophy:`, the italic quoted headline `"I drive AI. It doesn't drive me."`, a muted parenthetical aside `(yes, like a car)`, then 3 numbered points (capability changes weekly; stay on top of architecture; never go blind). Project accordion uses the same `.work-row` pattern as work history. Don't expand the bullets back into prose paragraphs and don't reintroduce the green callout, both were tried and rejected.
