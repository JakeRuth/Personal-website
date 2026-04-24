# SaaS Vector A — Apple Keynote Style

**Concept:** Jake Ruth as an Apple product launch. `Introducing Jake 4.7.` Thirteen years of shipping. One human. Infinite scale.

The site reads like an Apple.com launch page for a piece of hardware — huge whitespace, restrained copy, centered hero with a glossy "product shot" (a rotating Rubik's cube), a feature grid, a Mac-configurator-style "Configure your Jake" section, reviews, comparison table, architecture diagram, and an Apple-style footer with subtly Jake-flavored legalese.

Meta-joke: Jake is at version 4.7 — same as Claude Opus 4.7 (this exact model). The footer legalese calls it out.

## Run it

Open `index.html` directly via `file://`, or serve it:

```
cd concepts/saas-a-apple-keynote
python3 -m http.server 8080
# then visit http://localhost:8080
```

No build, no npm. Inter Tight loads from Google Fonts; Three.js r128 loads from cdnjs.

## Files

- `index.html` — structure, all sections inline
- `styles.css` — full Apple-inspired design system (nav, hero, scroll sections, cards, configurator, compare table, modal, footer)
- `app.js` — configurator logic, hero cube scroll-progress, Three.js cube in the accessory modal

## What's implemented

### Navigation
- Apple-style translucent sticky nav with blurred backdrop (section links)
- Sub-nav banner announcing "Jake 4.7 is here"
- Smooth anchor scroll with sticky-nav offset compensation

### Hero
- Massive 128px "Introducing Jake 4.7." headline (Inter Tight as SF Pro Display stand-in)
- Subhead: "Thirteen years of shipping. One human. Infinite scale."
- "Hire now" (filled blue pill) and "Learn more" (ghost) CTAs — both Apple-accurate
- "From $0/hr* for a 30-minute call" pricing microcopy with footnote
- CSS-only 3D rotating Rubik's cube as the hero "product shot" with ambient shadow floor. Scroll progress nudges the cube's rotation and pauses its auto-spin once you scroll past the hero — implements the "cube scroll-progresses toward solved" hook (visually, not a real solve)

### "A new generation of engineer." scroll section
- Huge scroll headline + 3-sentence body copy
- Four floating Apple-style stat cards (13 years, 4 companies, $1.335M YC W22 seed, 13.95s cube avg)

### Feature grid (six spotlights)
All six required features, each with a custom CSS-built visual:
- **Full-stack. Refined.** — spans 2 columns, stacked gradient bars representing a layered stack
- **Zero-to-one. Ready.** — triangle-and-dot glyph
- **AI-native. Restrained.** — steering wheel with gradient hands (driver in the driver's seat)
- **Culture-additive.** — floating colored orbs
- **Four-figure hours saved.** — downward-trend visual with "−$6K/yr" callout
- **Rubik's-cube tested.** — spinning mini-cube

### The Cube accessory section
- Dark (Apple product-page black) section
- Apple-style product card: left side is a spinning stickered CSS cube, right side is "The Cube" / $89 / "Includes one talent-show unicycle routine (historical)" / "Try it" button
- **Try it** opens a modal with a real interactive Three.js Rubik's cube: drag to rotate, Spacebar scrambles, "Solve (13.95s)" button animates back to solved

### Configure your Jake (Mac-configurator style)
Three fieldsets, live-updating summary card on the left and a dark total-panel at the bottom:
- **Tier:** Contract ($175/hr) · Full-time ($220K/yr) · Equity Founding (ask for terms)
- **Commitment:** 10 / 20 / 40 hrs/wk (multiplier applied)
- **Add-ons:** Zero-to-One Package (+$12,500) · AI Architecture Review (+$4,000) · Rubik's Cube Onboarding (+$89)
- Live-updated SKU string, monthly computed total, contextual fine print
- "Add to bag" button fires an Apple-style bottom toast

### Reviews
- 3 testimonial cards, Apple's oversized-pull-quote style

### Compare plans
- Apple's four-column comparison table (header row + Contract / Full-time / Founding with "Most popular" pill on Full-time)
- Six comparison rows (ships day one, zero-to-one, AI review, fundraising sparring, cap table, unicycle demos)
- Responsive: collapses to stacked cards on narrow screens

### Inside the architecture
- Small SVG node graph showing the four companies (CommerceHub → Youni → Oscar Health → Stock Unlock → Next chapter) with Apple-style styling

### Hire CTA
- Big closing section with "Ready to meet Jake 4.7?" and email-to-jake CTA

### Footer
- Four-column Apple-style sitemap (Shop & Hire, About, Prior companies, Contact)
- Honest Jake-legalese: "Jake 4.7 is sold as-is, as a whole human, without warranty except the warranty of shipping. Version numbering chosen independently from any large language model, which happens to share it. Rubik's® is a registered trademark of someone else; the 13.95-second average is not..."
- Privacy / Terms / Honesty policy / Site map links

## Interactions

- **Scroll** the hero — cube nudges rotation and pauses spin once past the fold
- **Configure** — radio/checkbox changes instantly update the summary card, SKU string, monthly total, and fine print
- **Add to bag** — fires an Apple-style toast
- **Click "Try it"** on the Cube card — opens the modal with a real Three.js 3×3 Rubik's cube
  - **Drag** to rotate the cube on both axes
  - **Space** or the **Scramble** button jiggles each cubie to a random rotation
  - **Solve (13.95s)** animates everything back to identity over 1.395s (faster than reality, for patience reasons)
  - **Esc** or click outside closes the modal
- **Any anchor link** smooth-scrolls with a 70px top offset so the sticky nav doesn't cover section headers

## What's mocked / simplified

- The "hero cube" is CSS 3D, not Three.js — lighter weight and it rotates as a single body. The real Three.js cube lives in the modal where interaction makes it worth the overhead.
- The Three.js cube rotates as a whole group; individual face twists would require a proper Rubik's cube engine (axis-of-rotation layer grouping, animation queues, sticker color tracking). The Scramble/Solve here is a deliberately stylized "visual noise → clean" animation, not a real solver.
- The architecture graph is a static SVG with hardcoded positions, not a force-directed layout.
- Dark mode toggle mentioned as a nice-to-have was skipped for this pass — the accessory section already provides a dark-mode contrast moment. Everything else commits to Apple's light-mode default.
- Rubik's cube face colors on the CSS hero/preview cubes use one shared sticker grid + `hue-rotate()` per face for variation — a real cube would have dedicated per-face sticker maps. The Three.js cube in the modal has properly assigned per-face colors.

## If I had more time...

- **Real layer twists** on the Three.js cube — implement U/D/L/R/F/B moves with proper layer grouping, animation queue, and a real scramble (e.g. 25 random moves) followed by a recorded solve playback
- **Keyboard shortcuts** on the configurator (1/2/3 for tiers, etc.)
- **Scroll-reveal** on each feature card with IntersectionObserver, Apple-style fade-and-rise
- **Parallax** on the story-section stat cards
- **Dark mode toggle** in the nav that flips `--bg`, `--ink` etc.
- **Video loops** on the feature art tiles (Apple's signature muted auto-play)
- **Sticky section titles** during scroll (the "A new generation of engineer." style)
- **More meta-jokes** around the 4.7 version number — a "What's new in 4.7" bullet list vs. 4.6 (e.g. "Ships production code 30% faster. Now with unicycle support.")
- **"Gallery" section** — Apple's photo carousel, but with screenshots/sketches from Stock Unlock and past projects
- **Configurator save/share** — URL hash that encodes the current config so Jake can send a prospective hirer a direct link to a specific setup
