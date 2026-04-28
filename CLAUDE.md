# jakeruth.com — Personal Website Rebuild

Project context for future Claude sessions. Read this first, then `DISCOVERY.md` (Jake's interview transcripts), then `~/.claude/projects/-Users-hippofluff-code-Personal-website/memory/`.

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

The three mediums must satisfy **hard parity**: every fact, story, or claim present in any one medium must be present in all three. Mediums differ visually, not in information content. Verify this before declaring a copy round done.

**Live site (`jakeruth.com`)** still serves the 2017-era React build. Local alpha is many commits ahead and unpushed.

**Personal email throughout the site:** `jake2ruth@gmail.com`.

**Dev server gotcha:** Speculation Rules / Chrome prerender requires `Cache-Control: no-store` is NOT sent. Use `no-cache, must-revalidate` if testing prerender locally.

## Voice essentials

The site ships with **one voice across all three mediums** — chrome varies, voice does not. Jake is a founder + veteran engineer with conviction and receipts; he doesn't sell himself.

**Say:**
- Plain sentences over buzzwords. Specific numbers over vague claims.
- Real anecdotes when they fit. Confidence without bragging.
- Dry humor. Short sentences in hero spots, longer in body.

**Don't say:**
- No "passionate," "innovative," "leverage," "synergy," "rockstar," "ninja," "results-oriented."
- No reflexive modesty, no audience-adapted messaging, no em-dash abuse.
- No slurs in shipped copy (the site hosts a resume).

**Stock Unlock framing rule** — when writing about Stock Unlock, frame as: *YC W22 company, scaled to 8 employees + thousands of paying customers, profitable today, runs without me, three FT (2 engineers + an exec assistant) handle day-to-day, I'm consulted on key decisions only.* NEVER imply Jake is full-time there or that the company is dead.

**No listed dollar prices anywhere.** Pricing-card UI is fine; specific numbers aren't. Use "Contact," "Talk to Jake," "Let's talk," "Market rate + equity."

**No "next chapter" framing as the through-line.** Jake is on the market, but the site is *Jake doing cool stuff*, not *Jake on the market*. Hire-availability is a subtle action, not a banner.

## Working artifacts (local-only, gitignored)

- `DISCOVERY.md` — Jake's voice-to-text transcripts. Canonical source for voice/content.
- `content/` — local scratch (any working JSON, parity notes, etc.). Gitignored. Re-derive from DISCOVERY each session if needed.

These never reach the public repo. Treat as agent context only.

## Collaboration norms

Memory files cover these in detail. Short version:

- **Truth-seeking.** Verify with tools before stating a cause.
- **No over-engineering.** Smallest implementation that works.
- **Test it yourself.** UI changes verified via `mcp__chrome-devtools__*` before reporting done. "No console errors" ≠ "feature works."
- **Surface tradeoffs as labeled options** when a real decision exists. Don't silently pick.
- **Don't ask Jake to wrap.** No "keep going or stop" framings.
- **Don't write history-style docs** (changelogs, decision logs, "what we did" summaries). Implementation history lives in git.

## Pointers

- `DISCOVERY.md` — Jake's voice-to-text transcripts (gitignored). Primary source.
- `README.md` — short repo overview.
- `official_resume.pdf` — authoritative résumé.
- Memory directory — user profile, work-style feedback, current workstreams.
