# saas-v4-minimal

A pulled-back version of the SaaS-parody framing from `enterprise-saas-v2`. Jake as a
dev-tool-you-hire, but quiet and confident — closer to how a small, serious company
actually shows up online in 2026 than to a 2021 landing-page template.

## Approach

- **Five sections, strictly.** Hero, three feature cards, pricing (contact-only), two
  case studies, contact. No more. The constraint is the concept.
- **Contrast dialed back ~20%.** Backgrounds lifted from `#0F1117` / `#0B0D12` to
  `#14161C` / `#191B22`. Ink softened from `#EDF0F5` to `#E6E8ED`. Grid lines lifted
  from `#242935` to `#2A2D37`. The page feels less like a console and more like a
  surface.
- **One accent, used sparingly.** A warmer, quieter blue (`#7DA9FF`). It shows up on
  the primary CTA, a single "Most likely" tag, three feature kickers, and links.
  Every other element is ink or muted ink.
- **Generous whitespace.** Sections are 120px vertical. Hero is 140/120. Container
  shrinks to 1080px so nothing shouts. Feature cards have 32px padding. Case cards
  get 36px.
- **Tight typography.** Inter only, via rsms.me. One display size (56px hero), one
  section size (36px), one card size (18px / 24px for case titles). Body is 15-16px,
  line-height 1.6+ everywhere.
- **Vanilla HTML + CSS.** No JS. Opens via `file://` or `python3 -m http.server`.

## What was cut from v2

Hard list, so the diff is honest:

- Announcement bar, "v2" pill, "All systems operational" ticker.
- Sticky mega-menu with three nested columns.
- Product dropdown, search palette, `⌘K`, `nav-search`.
- Hero right-rail "status-card" with live dot, uptime bars, latency, region strip.
- "Shipped at" logo wall (8 logos).
- Five-up metrics bar (13 / $1.335M / 8 / 13.95s / 99.97%). Numbers now live in
  paragraphs and case-study stat blocks, not a countdown banner.
- Six feature cards -> three. Cut Observability, Zero-downtime migration, Audit trail.
  Merged the survivors into single-paragraph descriptors.
- The entire Architecture section (SVG node graph, legend, side panel, clickable
  SLOs). Beautiful, unnecessary for "quiet and confident."
- The Configure-your-Jake configurator (three groups, radios, checkbox add-ons,
  sticky summary panel, SKU string).
- The 11-row feature-comparison matrix with enterprise column highlight.
- The entire Cube panel (interactive LBL solver with moves log, controls).
- The ambient corner cube widget that scroll-solves.
- The Developers / API reference section (`POST /api/hire`, `GET /api/status`,
  `PATCH /api/role`, cURL + Node + Python tabs, response panels).
- The CTA band between sections.
- The 4-column mega-footer with newsletter form, 4 trust badges, "SOC 2 (pending)",
  "GDPR compliant," "99.97% uptime," honesty policy.
- CommerceHub as a third case study. Not cut from Jake's life — just out of scope
  for a two-card section.

`cube.js` / `app.js` don't exist here. There's nothing interactive to script.

## If I had more time

- **Light mode toggle.** The darker palette is softer than v2, but a true light
  variant would prove the "quiet and confident" thesis harder. Would scope a single
  `[data-theme="light"]` branch on `:root`.
- **A third micro-section between pricing and case studies.** Something like a
  single pull-quote from the Daniel Pronk line ("I ignored his emails for weeks.
  That was the mistake.") — one line, 60px type, lots of air. Would earn its keep
  because it's voice, not chrome.
- **Resume link.** `content.json` references `../../official_resume.pdf`. A
  discreet "Resume (PDF)" link near the contact block would be the obvious add.
- **Favicon + OG image.** Both would take fifteen minutes and would make the
  page feel shipped rather than drafted.
- **Reduced-motion polish.** The two hover translate-Y transforms are tasteful
  but should branch on `prefers-reduced-motion: reduce`.
- **A real type-pairing pass.** Inter carries this fine, but swapping the case
  card headline to a slightly different tracking / weight treatment would give
  the stories section a tiny bit more "editorial" weight without adding noise.
