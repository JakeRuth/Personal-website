# jakeruth.com, Personal Website Rebuild

Project context for future Claude sessions. Read this first, then `BACKBONE.md` for canonical content, then `rambles-personal-bio-conversations.md` (gitignored, repo root, Jake's voice-to-text transcripts).

`BACKBONE.md` is the source of truth for what the site says. This file is the source of truth for how it's built. Don't restate content rules here — fix BACKBONE.

## Mission

Complete rebuild of jakeruth.com as a portfolio showcase. Genuinely unique site, not a template. Communicates who Jake is quickly while impressing visitors with build quality and creativity.

## Hard constraints

- **100% built with AI (Claude Code), reviewed by Jake.** Canonical footer / README wording: `100% built with AI (Claude Code), reviewed by Jake`.
- **Code must be elegant.** No over-engineering. Smallest implementation that works. Delete dead code fully.
- **Tech stack settled:** vanilla HTML/CSS/JS, no build, GitHub Pages.

## Shape

```
/                  Setup wizard (InstallShield-style)
/xp/               Windows XP experience
/readme/           GitHub repo experience
/saas/             Marketing-site experience
/shell/            Shared chrome (top-nav, cube transition, BFS solver)
/resume/           Resume HTML source + rendered PDF
```

Visitor flow: wizard → pick experience → cube transition → land on experience → top-nav switches between experiences (cube transition between). One Jake, three chromes.

Three mediums must satisfy **hard parity**: every fact, story, or claim present in any one medium must be present in all three. Mediums differ visually, not in information content. **`/xp/` is the rendered source of truth**; `/readme/` and `/saas/` adapt voice and structure to fit their chrome but never carry a fact that isn't on `/xp/`.

## Markup conventions

These are render-surface choices that BACKBONE doesn't carry.

- **No em-dashes (`—`) or `&mdash;`** in any rendered output, including ARIA labels, alt text, and JS-injected strings. Use `,`, `.`, `;`, `:`, `(parens)`, or ` · ` (middle dot for label/sublabel separators). Source comments exempt.
- **Email behavior.** Every `mailto:jake2ruth@gmail.com` link and every `data-copy-email` element copies the address to clipboard and shows a toast (no mail client launch). Implemented site-wide via `shell/email-copy.js`. Don't add new mailto launches.
- **Branded links.** Each page links these terms at least once near the top mention. Chrome elements (section headings, nav labels, status pills, JS-injected toast strings) are exempt.

  | Term | Link |
  |---|---|
  | `Stock Unlock` | `https://stockunlock.com` |
  | `YC W22` / `YC Winter 2022` | `https://www.ycombinator.com/companies/stock-unlock` |

- **Number style.** Subscriber counts in the thousands render as `~3.9k`, not `~3,900`.
- **No specific dollar prices, no explicit ARR figures.** Use `Contact`, `Talk to Jake`, `Market rate + equity`.
- **Resume.** Canonical HTML at `/resume/index.html`; rendered PDF at `/resume/Jake_Ruth_Resume.pdf`. Every "Resume" link points to the PDF.
- **Personal email throughout the site:** `jake2ruth@gmail.com`.
