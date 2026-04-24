# jakeruth.com — Personal Website Rebuild

This file is the project's durable context. Any Claude session starting in this repo should read this first, then check `DISCOVERY.md` and the memory system before acting.

## Mission

Complete rebuild of jakeruth.com as a portfolio showcase piece. Jake is re-entering the workforce (as of April 2026) after running his own company for ~4 years. The site must be genuinely unique — not a template — and must communicate who he is quickly while also impressing visitors with build quality and creativity.

## Hard constraints

- **100% built with AI (Claude Code), reviewed by Jake.** This is an intentional design choice, declared openly in the repo README once we re-push. Exact wording TBD (candidates: "100% AI-built", "99% AI-built", etc.). Do not hide or downplay this.
- **Code must be elegant.** Priority over speed of delivery. No deadline pressure.
- **Tech stack is open.** Explicitly not carrying over the 2017-era no-build React/JSX setup. Chosen after discovery and concept, not before.

## Current state (as of 2026-04-24)

- Hosted on **GitHub Pages** (free tier), repo: `github.com/JakeRuth/Personal-website`, branch: `master`, `/CNAME` binds `jakeruth.com`.
- **DNS** managed via Squarespace UI (backed by Google Cloud DNS). Apex A records point at GitHub's 4 Pages IPs; `www` CNAMEs to `jakeruth.github.io`.
- **HTTPS** enforced via Let's Encrypt cert auto-renewed by GitHub (R13 intermediate, issued 2026-04-21, ~90-day rolling).
- **Content** is the alpha: Setup Wizard at `/`, three experiences at `/xp/`, `/readme/`, `/saas/`, stitched by a shared top-nav + cube transition. Vanilla HTML/CSS/JS, no build. Canonical content + voice rules in `/_shared/`. The 2017-era React site was deleted on 2026-04-24 (recoverable via git history pre-commit `08098a5`). The alpha is not yet pushed to `master` remote — jakeruth.com still serves the 2017 site until the next push.

## Workflow

1. **Discovery** — open-ended interviews captured in `DISCOVERY.md`. No code.
2. **Brief** — synthesize discovery into a short design/voice/audience brief.
3. **Concepts** — propose 3-5 *very different* directions. Jake picks/mixes.
4. **Tech stack decision** — chosen to serve the concept.
5. **Build** — iterative, with PRs and review loops.

## Collaboration norms

- Be truth-seeking. Verify with tools before stating a cause. Don't guess or vibe-code.
- When a real tradeoff exists, surface it as labeled options (Option 1 / Option 2 / I lean X because Y) — don't silently pick.
- See memory system (`~/.claude/projects/-Users-hippofluff-code-Personal-website/memory/`) for more on how Jake works.

## Pointers

- `DISCOVERY.md` — interview notes and raw thinking about the rebuild
- `README.md` — will eventually declare the "built by AI" framing (TBD)
- Memory: user profile, work style feedback, project context
