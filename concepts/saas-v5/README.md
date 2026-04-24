# saas-v5

The SaaS iteration that actually hits. One polished, dense-but-not-cluttered landing page for
Jake Ruth rendered as a developer-tool company (`ruth/systems`).

Descended from `saas-c-enterprise` (the "incredibly strong" mock), stripped of the "AI slop" that
`enterprise-saas-v2` layered on top.

## Run it

Open `index.html` directly via `file://`, or:

```bash
python3 -m http.server 8080
# then visit http://localhost:8080/concepts/saas-v5/
```

Zero build. Vanilla HTML/CSS/JS. The only external deps are CDN-served Inter font and Lucide
icon CSS.

## What survived from saas-c-enterprise

- **Dark-theme, dev-tool DNA.** Same voice, same data density, same hairline-border aesthetic.
- **Live status card.** 99.97% uptime, 90-day bar chart, live latency ticker in the hero meta line.
- **Architecture graph.** SVG, hand-rolled, hover-to-highlight-neighborhood, click-to-pin.
- **Feature grid.** 6 cards, same look, tightened copy.
- **Pricing grid + matrix.** Same visual frame.
- **Case-study cards.** Three companies, three outcomes, first-person resume.
- **Integrations tile grid.** Same style.
- **Developer docs.** Endpoint reference with cURL/Node/Python tabs.

## What got cut from enterprise-saas-v2

- **Mega-menu with three hover dropdowns.** Replaced with a flat 5-item nav.
- **⌘K / Cmd-K search flash.** Wasn't real, got removed entirely. No fake keyboard shortcut.
- **Case-study modals with fake detail pages.** Replaced with inline resume cards — the same info,
  but presented up-front instead of gated behind a click.
- **Configurator with SKU generation.** Cut. Never existed here.
- **Fake SOC 2 Type II / HIPAA / GDPR compliance badges.** Gone. Jake isn't a compliance
  department.
- **Count-up metric strip.** Cut. The numbers that mattered (8 employees, ~$450K ARR, $1.335M
  seed) are embedded in the case cards and the hero sub.
- **Ambient Rubik's cube that scroll-solves.** Cut; this isn't the right placement.
- **4-column footer with trust badges and newsletter.** Cut down to a single-row footer.
- **The 5-endpoint API reference.** Trimmed to ONE endpoint: `POST /api/hire`. Node/Python/cURL
  tabs instead of five pretend endpoints.

## What's fresh in v5

- **Copy rewritten from the Stock Unlock framing rule.** Hero and all case cards obey
  `VOICE.md`: "Built it. Scaled it. Not full-time there anymore. Redefining my next chapter."
- **Zero dollar prices.** Per VOICE.md. Pricing card amounts now read
  "Free" / "Let's talk" / "Market + equity" / "Let's build". Matrix still present — the UI shape
  of pricing is fine, just no numbers.
- **Simpler architecture graph.** 9 nodes down from 12, with dependencies that map more cleanly
  to Jake's actual career (Core → SysDesign → Runtime/Delivery/Obs/AI/Humans → Data/Platform).
  Hover reveals neighbors in real time even before clicking to pin.
- **Inline case studies with one-liner quotes.** The Daniel Pronk, post-IPO, and intern-outage
  quotes are embedded in the cards so nobody has to click to learn the best part.
- **Tight single-row footer.** Email, GitHub, pricing, docs, copyright, status — on one line
  (or two on mobile), no badge monstrosity.
- **Nav CTA says "Email Jake".** No "Start free trial", no "Sign in", no "Book a demo" — per
  `content.json` `cta_verbs_avoid`.
- **Social proof row names real places.** "Shipped at: Oscar Health / Stock Unlock / CommerceHub /
  Y Combinator W22 / SUNY Albany / + Youni, one failed startup". The wink at Youni preserves
  honesty over hype.

## File map

```
saas-v5/
├── index.html       single-page; ordered hero → platform → arch → pricing → customers → notes → integrations → docs → cta → footer
├── styles.css       all styles; inherited palette from saas-c, simplified layout
├── app.js           hero latency, uptime bars, arch graph, docs tabs, integ timer
└── README.md        this file
```

## Voice checklist

- [x] Sounds like Jake (plain, confident, dry)
- [x] Stock Unlock framing rule respected (maintenance mode, not current gig)
- [x] No dollar prices
- [x] No "passionate" / "excited" / "results-oriented" / "synergy"
- [x] One voice throughout
- [x] Specific numbers preserved (8 employees, 13.95s, $1.335M, 99.97%)
