# SaaS Vector C — Enterprise B2B SaaS

One of 17 parallel prototypes for Jake Ruth's personal-website rebuild.

The IRONY: Jake, treated like the most serious enterprise B2B product you've ever seen. PagerDuty / Datadog / Linear Enterprise / Retool-flavored marketing page, dense and info-heavy, dead-serious. The comedy is how sincere it is. No winking.

Open via `file://` or `python3 -m http.server` from this directory.

---

## What's implemented

- **Announcement bar** with live status indicator.
- **Top nav** (sticky, blurred) with three hover menus (Product / Solutions / Developers), Pricing and Customers links, a `⌘K` search affordance, Sign in, and a Start-free-trial CTA.
- **Hero** — "The engineer your team actually needs." with CTA pair and three assurance pills.
- **Live status card** on hero right — big "All systems operational" block, per-subsystem status list with latencies, 90-day uptime bar row, ticking response-latency gauge. "Currently deploying: career pivot v1.0" line item is present.
- **Social-proof logos bar** — 8 client "logos" (Oscar, Stock Unlock, CommerceHub, Youni, YC, ACM SUNY, Webflow, Postgres, Inc.).
- **Metrics band** — 5-metric strip (13 years, 200+ teams, $1.335M seed, 13.95s cube avg, 99.97% uptime) with scroll-triggered count-up.
- **Feature spotlights** — 6-card grid (Full-Stack Delivery, AI-Native Workflows featured, Zero-Downtime Migration, Observability, Enterprise-grade comms, Audit trail).
- **Architecture diagram** (§5) — hand-rolled SVG graph of 12 competency nodes (Ruby Core, Python, TypeScript, Go, Frontend, Data Layer, AWS, AI Orchestrator, System Design, Observability, Delivery Pipeline, Humans API) connected by 20 labeled arrows. Hover highlights the neighborhood; click pins a node and populates the side spec panel (title, blurb, SLO, owner, region).
- **Pricing** — 4 tiers (Starter / Team / Scale featured / Enterprise), annual-monthly billing toggle that swaps prices, and a full **feature comparison matrix** with 11 capability rows including "Unicycle & cube talent-show integration" (Enterprise-only).
- **Case studies** — 3 cards, each with ROI metrics, clickable to open a modal with full written case study (Stock Unlock $6K SES migration, Oscar 50→150 engineers, CommerceHub 18-mo intern-to-engineer). Pull quote below.
- **Integrations** — 16-tile grid (AWS, Python, Go, React, Three.js, D3, Claude Code, Cursor, GitHub, Linear, Notion, Slack, Stripe, Postgres, Docker, Webflow, Rubik's Cube). Each tile opens a modal with version / latency / auth / region metadata and a JSON manifest. Rubik's Cube tile opens the cube modal.
- **Rubik's Cube modal** — Three.js 3D cube (vanilla, importmap, no build). Drag to orbit, ambient auto-rotate, Scramble / Solve controls. Opened from the Rubik's Cube integration tile and from the docs `GET /api/cube/solve` endpoint.
- **Ambient cube-solve ticker** — bottom-left overlay; a 13.95s counter ticks up whenever the user scrolls, then fades on idle. (The "ambient-solves somewhere on the page as user scrolls" cue.)
- **Developer docs** — left-sidebar + right-content layout, 5 endpoints (`POST /api/hire`, `GET /api/status`, `PATCH /api/role`, `POST /api/meeting`, `GET /api/cube/solve`), cURL code blocks with syntax coloring, copy-to-clipboard buttons, example responses. Every endpoint is, comedically, a way to contact Jake.
- **CTA band** — "Stop evaluating. Start shipping."
- **Footer** — 4 columns (Product / Solutions / Company / Legal), newsletter signup with success confirmation, SOC 2 / GDPR / HIPAA-adjacent / 99.97% uptime compliance badges.
- **Keyboard** — `⌘K` / `Ctrl+K` flashes the search affordance; `Esc` closes any open modal.
- **Scroll-spy** on docs endpoints.

## What's mocked

- All metrics, client logos, SLAs, and compliance badges are fictional (the bit).
- The "search" input is a visual affordance; there is no real command palette.
- Code blocks are pre-syntax-highlighted HTML rather than a real highlighter.
- Billing toggle only swaps the three mid-tier prices; Starter stays $0 and Enterprise stays "Custom".
- Case study "detail pages" are in-page modals.

## Tech

- Vanilla HTML/CSS/JS. No build. No framework.
- CDN-loaded: Inter (rsms.me), Lucide icon font, Three.js (via importmap).
- One HTML file (`index.html`), one stylesheet (`styles.css`), two scripts (`app.js`, `cube-modal.js`).
- ~1.4K lines total across the three code files.

## Interactions worth exercising

1. Hover the nav's Product / Solutions / Developers items to see the mega-menus.
2. Scroll the page — metrics count up, and the ambient cube-solve ticker appears bottom-left, counting toward 13.95s.
3. Click a node in the Architecture diagram; click the background to deselect.
4. Toggle annual/monthly on pricing.
5. Click any of the 3 case-study cards to read the fake case study.
6. Click any of the 16 integration tiles for the manifest modal; click the Rubik's Cube tile (bottom right of the grid) for the 3D cube.
7. In the cube modal: drag the cube, scramble, solve.
8. In the docs: click the link in `GET /api/cube/solve`'s description — it also opens the cube.
9. `⌘K` flashes the search bar. `Esc` closes any open modal.

## If I had more time

- Real command palette on `⌘K` with fuzzy search across features / endpoints / integrations.
- A working "request a demo" flow that actually composes an email draft with structured fields.
- Real syntax-highlighted code blocks (Prism.js).
- A dedicated `/status` sub-page for the enterprise-grade status page bit.
- Animate the architecture graph with a proper force simulation (reusing the 09-network-graph engine).
- A sticky bottom-of-page "changelog" drawer with v13.0 release notes.
- More SOC 2 theatre: a trust center page with real-looking policy docs.
- Dark/light toggle (currently dark-only, deliberately).
