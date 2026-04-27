# jakeruth.com — Personal Website Rebuild

This file is the project's durable context. New Claude sessions starting here should read this first, then `DISCOVERY.md` (Jake's interview notes), then the auto-memory at `~/.claude/projects/-Users-hippofluff-code-Personal-website/memory/`.

## Mission

Complete rebuild of jakeruth.com as a portfolio showcase. Jake is re-entering the workforce (April 2026) after running his own company for ~4 years. The site must be genuinely unique — not a template — and must communicate who he is quickly while impressing visitors with build quality and creativity.

## Hard constraints

- **100% built with AI (Claude Code), reviewed by Jake.** Intentional design choice, declared openly in the README on push. Exact framing wording TBD.
- **Code must be elegant.** Priority over speed of delivery. No deadline pressure. No over-engineering. (See memory `feedback_no_overengineering`.)
- **Tech stack settled:** vanilla HTML/CSS/JS, no build, GitHub Pages.

## Current shape

```
/                  Setup wizard (InstallShield-style)
/xp/               Windows XP experience
/readme/           GitHub repo experience
/saas/             Marketing-site experience
/shell/            Shared chrome (top-nav, cube transition, BFS solver)
/content/          Canonical content + voice + parity audit
```

Visitors flow: wizard → pick experience → cube transition → land on experience → top-nav lets them switch experiences (cube transition between). The three experiences surface the same Jake, different chromes.

**Live site (`jakeruth.com`)** still serves the 2017-era React build. The local alpha is many commits ahead and unpushed.

**Personal email throughout the site:** `jake2ruth@gmail.com`. Not `jake@stockunlock.com`.

**Dev server gotcha:** Speculation Rules / Chrome prerender requires the server NOT send `Cache-Control: no-store`. Use `no-cache, must-revalidate` instead if you need fresh files in dev.

## What's next

The alpha is at clean checkpoint. Next focus is **content depth + per-experience design polish**, both informed by first-principles thinking:

1. **Content / vibes / themes.** Re-read `DISCOVERY.md` and `content/content.json`. What are we actually communicating? What groups together? What's the right narrative arc per experience? `VOICE.md` rules still apply (Stock Unlock framing, no buzzwords, no listed dollar prices, etc.).
2. **Per-experience design + interaction depth.** Each chrome should be a complete, native-feeling artifact. Polish information architecture, micro-interactions, density. Cross-experience parity tracked in `content/PARITY_AUDIT.md`.

See memory `project_active_workstreams` for fuller framing.

## Collaboration norms

Memory files cover these in detail. The short version:

- **Truth-seeking.** Verify with tools before stating a cause. (`feedback_work_style`)
- **No over-engineering.** Smallest implementation that works. Delete dead code fully — git is the safety net. (`feedback_no_overengineering`)
- **Test it yourself.** UI changes verified via `mcp__chrome-devtools__*` before reporting done. "No console errors" ≠ "feature works." (`feedback_test_before_reporting`)
- **Surface tradeoffs as labeled options** when a real decision exists. Don't silently pick.
- **Don't ask Jake to wrap.** No "keep going or stop" framings. (`feedback_dont_ask_to_wrap`)

## Pointers

- `DISCOVERY.md` — interview notes, raw thinking. Primary source for Jake's voice/life.
- `README.md` — short repo overview.
- `content/content.json` — canonical structured facts (every experience reads from this).
- `content/VOICE.md` — tone rules.
- `content/PARITY_AUDIT.md` — cross-experience parity tracking.
- `official_resume.pdf` — authoritative résumé.
- Memory directory — user profile, work-style feedback, current workstreams.
