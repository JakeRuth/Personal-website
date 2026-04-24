# flow-demo

Two flows, one page. Each flow walks a visitor from a condensed version of
one of the two leading pickers, through a short transition, and into the
same README-flavored experience — where the nav chrome looks unmistakably
like it came out of the picker you entered through.

This isn't a functional site. It's a design prototype that answers Jake's
question:

> "I'm starting to think that the picker and this switcher might need to
> be linked together in some ways, even visually. I'm not really sure
> where I'm going out with that, but curious what you think."

## Run

Vanilla HTML/CSS/JS. No build step.

- Open `index.html` directly in a browser (`file://`), or
- From `concepts/`, run `python3 -m http.server 8000` and visit
  `http://localhost:8000/flow-demo/`.

## The thesis

**The picker is the visual ancestor of the nav.**

Every experience on the site has a nav — the thing that lets a visitor
change rooms without going back to the front door. Until now, we'd been
treating the picker and the in-experience nav as two separate design
problems with two separate visual vocabularies. That's a missed
opportunity and, worse, a small betrayal of continuity: a visitor who
entered through a wizard and then lands in an experience with a pill
dropdown in the corner has just been handed two different mental models
for the same underlying action ("switch rooms").

The move is simpler: **whatever the picker's chrome is, the nav is a
smaller version of it.** If the picker is an InstallShield wizard, the
nav is a Setup button in a system tray that opens a tiny wizard. If the
picker is a dark minimalist list, the nav is a thin typographic top bar
in the same font with the same gold underline. Same DNA, different
organ.

## What's on screen

Two flows run side-by-side on one page.

### Flow A — Wizard picker → wizard-flavored nav

1. **Picker** — a condensed version of `picker-wizard-v2`: InstallShield
   titlebar, blue banner with the Rubik's cube, radio list of four
   experiences, footer with Back / Launch Jake / Cancel.
2. **Transition** — a small progress-bar card with the monospaced log
   that the real wizard uses on its Launching step. Ticks to 100%, then
   fades into the experience.
3. **Experience** — a README-flavored page. Above it sits a **system tray
   panel** with a **Setup** button. The button icon is the same three-by-
   three Rubik's cube mini-grid from the picker's banner. Clicking
   Setup opens a **wizard-style window** anchored to the tray —
   identical titlebar, same radio list with dotted focus rings, Cancel
   and Apply buttons in the wizard-button style.

The gestures that carry from picker to nav:

- InstallShield titlebar gradient, cube favicon, pixelly close button.
- The radio list with its dotted focus border and "Name — tag" rhythm.
- Deep blue (`#0A246A`) for actionable affordances.
- The monospace strip for system info (`mode: readme · build 20260420.2`).

### Flow B — Minimalist picker → minimalist top-bar nav

1. **Picker** — a condensed `picker-auto-v2`: uppercase tracked wordmark,
   gold dot, hairline-ruled list of four experiences, thin kbd hints
   at the bottom.
2. **Transition** — a full-viewport fade on the same dark background with
   the wordmark in the corner and an "Opening *XP Luna*" line centered.
   No progress bar. Minimalism doesn't load; it opens.
3. **Experience** — a README-flavored page. Above it sits a **thin top-
   bar** with the wordmark + gold dot on the left, the four room names
   spaced across the center as tracked-out uppercase labels, and a
   monospace `room · readme` meta on the right. The current room gets a
   thin gold underline.

The gestures that carry from picker to nav:

- Inter 300, letter-spacing `-0.015em` for display text.
- Tracked-out uppercase (`0.22em`) for meta lines.
- `#e9c46a` gold as the only accent, always as a hairline or a dot.
- Hairline rules in `rgba(245,243,238,0.12)` as the only divider language.
- Black background. No gradients, no shadows.

## Both flows share one experience body

Deliberately. The page inside is the same four-section README in both
flows: status, Stock Unlock, AI philosophy, contact. Only the nav chrome
differs. That's the whole demo: **voice is invariant, chrome varies by
entry point.**

## Tradeoffs observed

**When cohesion helps:**

- **Continuity of action.** The visitor already learned how to pick a
  room in the picker. The nav uses the same vocabulary, so "switch
  rooms" is learned once and reused everywhere.
- **Pride-of-craft signal.** A system tray with a Setup menu that
  opens an actual wizard window is a detail someone will notice. The
  minimalist top bar with the same gold underline as the picker is a
  detail someone else will notice. Either one reads as "the designer
  thought about this."
- **Narrative glue.** The picker is act one, the experience is act two.
  Same language across both makes it feel like one piece of software,
  not a portfolio of disconnected experiments.

**When cohesion constrains:**

- **The nav has to work inside every experience.** A wizard-flavored nav
  on top of the Enterprise SaaS page is a hard contrast. On top of XP
  Luna it's nearly invisible (good). On top of the glass Vista page it
  competes for attention (less good). There's a real risk that the
  "picker DNA" starts fighting the experience's own chrome.
- **The picker has to stay legible when miniaturized.** A wizard
  titlebar works at 700×500. At 200×24 as a tray button, it's basically
  one icon and one word. If the picker's visual identity doesn't survive
  compression, the "nav speaks picker" idea degrades to "nav wears a
  logo."
- **Two pickers → two nav systems to maintain.** Today there are two
  candidate pickers (wizard + minimalist). That means two nav designs,
  two sets of chrome rules, two responsive-breakdown stories. Every new
  picker we entertain adds another nav-system surface.
- **Visitor context loss.** If a visitor deep-links directly to an
  experience (shares a URL, hits a bookmark), they never saw the
  picker. The nav still speaks picker-language, but now it's just a
  visual style rather than a continuation of something they did. Still
  fine, but less persuasive — the "you're inside the wizard you
  started" magic only fires on first pass.
- **Entry-point state has to travel.** The nav needs to know which
  picker the visitor came through. That's either a query param, a
  localStorage flag, or a build-time choice of one-picker-wins. Two
  ergonomics choices with two maintenance footprints.

**Middle ground worth trying:** pick one picker as canonical, one nav
language as canonical, and only diverge on a single high-signal gesture
(e.g. the dot + gold underline). This keeps cohesion cheap and avoids
maintaining two nav systems to prove the point.

## File layout

- `index.html` — the split-view page with both flows
- `styles.css` — both visual languages, kept scoped via selector prefixes
  (`.wiz-*` for Flow A, `.min-*` for Flow B). Zero shared component CSS
  on purpose, to stress-test the "two languages under one roof" claim.
- `flow.js` — two small state machines, one per flow
- `README.md` — this file

The wizard styles are lightly simplified copies of
`../picker-wizard-v2/styles.css`. The minimalist styles are lightly
simplified copies of `../picker-auto-v2/index.html`'s inline CSS + the
pill from `../picker-auto-v2/switcher.js`. Both are rewritten here so
this prototype runs without cross-directory asset borrowing — the point
is the cohesion argument, not the implementation.

## Voice

All copy runs through VOICE.md:

- No dollar prices anywhere.
- Stock Unlock framed as "built it, not full-time there anymore."
- "Driver in the driver's seat, not driven by the car" line earns its
  spot in the AI philosophy section.
- No "passionate," "excited," "looking for my next challenge."
- Tray meta lines lean into the dry wizard-era flavor ("build
  20260420.2 · multi-experience edition").
- The minimalist picker keeps the `I am not actually for sale` register
  in the mode descriptions.

## If I had more time...

- **Real cross-page hop.** Today both flows stay inside one file. A
  production version would have the nav carry entry-point state
  (`?via=wizard` or `?via=min`) so that jumping between rooms via the
  nav preserves the visual language across real page loads.
- **Third language.** Add a git-log picker with a nav that's a top-bar
  of real commit hashes. Stress the thesis with a third vocabulary.
  The point of three is that the thesis either collapses or gets
  stronger; today with two it's suggestive.
- **Animated handoff.** The transition could literally show the nav
  being "assembled" from the picker's pieces — the titlebar collapses
  into a tray button, the radio list shrinks into a menu icon. Would
  sell the "picker DNA" claim more viscerally than a fade.
- **A/B in-experience behavior.** Today the nav just lets you switch
  rooms. In the wizard flow, the tray could also expose the real
  wizard's Advanced options (CRT scanlines, Konami, reduced motion),
  sold as "Reconfigure." In the minimalist flow, the only nav verb is
  "jump." Different vocabularies should produce different verbs, not
  the same verb under different chrome.
- **Responsive fold.** At narrow widths the two flows stack. Worth
  deciding whether the tray and the top bar both survive that fold
  gracefully, or whether one of them collapses to a hamburger — and
  whether the hamburger is allowed to look like a wizard artifact.
- **Entry-less visit.** Design the state where someone deep-links into
  an experience without ever seeing the picker. Which nav wins by
  default? Is there a "system default" nav that's closer to one flow
  than the other? Probably yes; the minimalist one is the safer default
  because it's the least visually loud.
- **Audit against all 5 candidate experiences.** Today Flow A's Setup
  tray is designed over the README page. Drop it onto Enterprise SaaS,
  Vista, XP Luna, and README-x-Git in sequence. The ones where it
  visually breaks down are the ones we'll have to resolve before this
  thesis ships.
