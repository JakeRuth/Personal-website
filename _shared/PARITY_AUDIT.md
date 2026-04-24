# PARITY_AUDIT.md

Audit of the three alpha-approved experiences against `_shared/content.json` and `_shared/VOICE.md`.

Scope of edits: `xp-luna-v3/`, `readme-git-fusion-v2/`, `saas-v5/` (only).

Date: 2026-04-20.

---

## Checklist built from the prompt

### Hard parity (must match exactly across all three)

| # | Fact | Canonical form |
|---|------|----------------|
| H1 | Peak team size | 8 employees (eight employees) |
| H2 | Customer count | thousands of paying customers |
| H3 | Seed total | $1.335M |
| H4 | Seed breakdown | $500K YC SAFE + $835K other investors |
| H5 | Cube average | 13.95s on 3x3 |
| H6 | Cube years | 2008-2014, Northeast US + Nationals |
| H7 | Oscar scale | ~50 → ~150+ engineers |
| H8 | Oscar dates | March 2017 – 2021 |
| H9 | CommerceHub dates | 2013-2016 |
| H10 | Stock Unlock framing | Built / scaled / profitable side business / not full-time / redefining next chapter |
| H11 | Contact email | jake@stockunlock.com |
| H12 | GitHub | github.com/JakeRuth |
| H13 | Career order | CommerceHub → Youni → Oscar → Stock Unlock → next |
| H14 | AI one-liner | Driver in the driver's seat, not driven by the car. |

### Soft parity (must be PRESENT, voice can adapt)

| # | Story |
|---|-------|
| S1 | AP CS switch |
| S2 | Pronk emails |
| S3 | Unicycle cube |
| S4 | Customer.io / AWS SES migration |
| S5 | Getting married |
| S6 | Re-entering the workforce April 2026 |

---

## Per-experience audit results

### xp-luna-v3 (Alpha 1)

**Initial state: in near-complete parity.** No gaps found.

| Check | Status | Note |
|---|---|---|
| H1 8 employees | PASS | `index.html` hero chip, about, stock-unlock panel, work history; `app.js` search bubble |
| H2 thousands of customers | PASS | Multiple placements |
| H3 $1.335M | PASS | Stock Unlock panel + graph blurb |
| H4 $500K + $835K | PASS | Stock Unlock build-log KV block |
| H5 13.95s | PASS | Hero chip, cube HUD, cube reference panel, toast comparison |
| H6 2008-2014 Nationals | PASS | About + cube panel |
| H7 ~50 → ~150+ | PASS | About + work history |
| H8 March 2017 | PASS | Work history row |
| H9 2013-2016 CH | PASS | Work history (Nov 2013 – July 2016) |
| H10 SU framing | PASS | About + Stock Unlock panel use canonical rule |
| H11 email | PASS | Multiple anchors + copy buttons |
| H12 GitHub | PASS | Start menu + contact |
| H13 career order | PASS | Work list in canonical order |
| H14 AI one-liner | PASS | AI panel italic + graph blurb |
| S1 AP CS | PASS | Stories panel |
| S2 Pronk | PASS | Stories panel + Stock Unlock copy |
| S3 Unicycle | PASS | Stories + About + graph + cube fine print |
| S4 Customer.io | PASS | AI panel + Stories |
| S5 Married | PASS | About + graph node |
| S6 Re-entering | PASS | Detail pane + graph blurb |

**Verdict:** no edits required.

### readme-git-fusion-v2 (Alpha 2)

**Initial state: in near-complete parity. One small date-specificity gap.**

| Check | Status | Note |
|---|---|---|
| H1 8 employees | PASS | README, STOCK_UNLOCK, PROJECTS, ABOUT |
| H2 thousands of customers | PASS | Multiple |
| H3 $1.335M | PASS | README, STOCK_UNLOCK, CHANGELOG, timeline commit |
| H4 $500K + $835K | PASS | Timeline commit, STOCK_UNLOCK, CHANGELOG |
| H5 13.95s | PASS | FAQ + HOBBIES + README badge |
| H6 2008-2014 Nationals | PASS | HOBBIES + FAQ + timeline |
| H7 ~50 → ~150+ | PASS | README + ABOUT + timeline |
| H8 March 2017 | FIXED | ABOUT.md previously said just "2017-2021"; now says "March 2017 – 2021" and "Landed at Oscar Health in March 2017" |
| H9 2013-2016 CH | PASS | ABOUT + PROJECTS + timeline |
| H10 SU framing | PASS | STOCK_UNLOCK.md renders the canonical rule verbatim |
| H11 email | PASS | Multiple |
| H12 GitHub | PASS | Header breadcrumb + contact card |
| H13 career order | PASS | ABOUT + timeline |
| H14 AI one-liner | PASS | README + ABOUT + FAQ + Issues + timeline |
| S1 AP CS | PASS | ABOUT + timeline (2011 commit) |
| S2 Pronk | PASS | README + STOCK_UNLOCK + timeline |
| S3 Unicycle | PASS | FAQ + HOBBIES + timeline |
| S4 Customer.io | PASS | PROJECTS + CHANGELOG + timeline |
| S5 Married | PASS | ABOUT + timeline (married branch) |
| S6 Re-entering | PASS | README note + CHANGELOG + timeline |

### saas-v5 (Alpha 3)

**Initial state: most hard-parity numbers present but multiple soft-parity stories missing.** Needed the most work.

| Check | Initial | Fixed | Note |
|---|---|---|---|
| H1 8 employees | PASS | — | Hero, feature grid, case card |
| H2 thousands of customers | PASS | — | Hero + case card |
| H3 $1.335M | PASS | — | Feature grid, case card, docs |
| H4 $500K + $835K | MISSING | FIXED | Added to Stock Unlock case card body |
| H5 13.95s | PASS | — | Docs JSON response; also added to Field Notes card |
| H6 2008-2014 Nationals | MISSING | FIXED | Added in new Field Notes "unicycle cube" card |
| H7 ~50 → ~150+ | PASS | — | Oscar case card |
| H8 March 2017 | PARTIAL | FIXED | Case role now reads "March 2017–2021" |
| H9 2013-2016 CH | PASS | — | Case card |
| H10 SU framing | PASS | — | Hero + case card obey canonical rule |
| H11 email | PASS | — | Multiple |
| H12 GitHub | PASS | — | Nav, CTA, footer |
| H13 career order | PARTIAL | FIXED | Youni was only in footer logos as "+ Youni, one failed startup"; added a proper case footnote under case grid |
| H14 AI one-liner | PASS | — | Feature grid + architecture panel |
| S1 AP CS | MISSING | FIXED | New Field Notes card |
| S2 Pronk | PARTIAL | FIXED | Only a lone quote existed; new Field Notes card tells the full arc |
| S3 Unicycle | PARTIAL | FIXED | Only appeared as a pricing-matrix joke; new Field Notes card surfaces it properly |
| S4 Customer.io | PASS | — | Feature grid + architecture panel; also in Field Notes now |
| S5 Married | PARTIAL | FIXED | Only in the pricing-matrix row "Wedding invite (Q4 2026)"; new Field Notes "Chapter II" card mentions it |
| S6 Re-entering | PASS | — | Hero sub + new Field Notes card reinforces |

---

## File-by-file change log

### `saas-v5/index.html`
- Nav: added `#notes` link between Customers and Docs.
- Stock Unlock case card: expanded body to include seed breakdown ($500K YC SAFE + $835K other investors) and "Led the YC interview" note.
- Oscar case card: role now shows "March 2017–2021"; body expanded with Alan Warren context, manager-track-declined, Peter chatbot, and unicycle cube (with Josh Kushner).
- CommerceHub case card: tightened body phrasing (removed "résumé" smart-quote; small voice polish).
- Added `.case-footnote` block under the case grid compactly surfacing Youni (2015-2016, React Native v0.13, thousands of signups, shut down).
- Added a new section `#notes` ("Field notes") between Customers and Integrations with five story cards: AP CS switch, Pronk emails, Unicycle cube (including 13.95s and 2008-2014 Nationals), Customer.io hack-off, Chapter II (re-entering + married).

### `saas-v5/styles.css`
- Added `.case-footnote*` rules for the compact Youni line.
- Added `.notes-grid`, `.note-card`, `.note-head`, `.note-tag` (+ origin/story/fun/ai/next color variants), `.note-date` for the new Field Notes section. Matches the existing card DNA (card bg, hairline borders, hover raise, JetBrains Mono tags).

### `saas-v5/README.md`
- Updated the `index.html` file-map line to reflect the new section order (hero → platform → arch → pricing → customers → notes → integrations → docs → cta → footer).

### `readme-git-fusion-v2/content.js`
- `ABOUT.md` Oscar section header: "Oscar Health (2017-2021)" → "Oscar Health (March 2017 – 2021)".
- Body line updated: "Landed at Oscar Health under Alan Warren…" → "Landed at Oscar Health in March 2017 under Alan Warren…" for hard-parity date specificity.

### `xp-luna-v3/*`
- No edits required. xp-luna-v3 was already in parity.

---

## Voice pass

All new copy written for saas-v5's Field Notes section passed the VOICE.md checklist:

- No "passionate," "excited," "driven," or other verboten modifiers.
- Plain sentences, specific numbers (5-10 hours, 6 weeks, 13.95s, 2008-2014, $6K/year).
- Real anecdotes, not buzzwords.
- Stock Unlock framing rule preserved (Pronk card says "we started a company," not "I run one now"; Chapter II card says "Stock Unlock has been on autopilot for about fifteen months and will keep running").
- No dollar prices introduced to pricing UI. The "$6K/year saved" line is a cost story, not a price.
- No em-dash abuse; em-dashes used sparingly where natural.

---

## Consciously unresolved parity notes

None. Every hard-parity item is present in all three. Every soft-parity story is present in all three. A few items vary in depth by chrome (which the prompt explicitly permits):

- **Unicycle cube in saas-v5** appears both as a real story (Field Notes card + Oscar case card body) and as a wink in the pricing-matrix comparison row — kept the pricing-matrix wink since it's a voice moment, not a claim about facts.
- **"Getting married" in saas-v5** appears in the Field Notes "Chapter II" card as a plain fact; also preserved the pricing-matrix line "Wedding invite (Q4 2026)" as chrome-appropriate dry humor.
- **Customer.io detail depth** differs by experience: saas-v5 has it in three places (feature grid, architecture panel, Field Notes) because it's the flagship AI-era proof; xp-luna-v3 has it in two (AI panel + Stories); readme-git-fusion-v2 has it in four (PROJECTS, CHANGELOG, timeline commit, README featured-projects grid). All consistent with the underlying facts.
- **Stock Unlock long-form STOCK_UNLOCK.md** only exists in readme-git-fusion-v2 — appropriate, since that chrome has docs/*.md files. xp-luna-v3 and saas-v5 surface the same facts at a shorter cadence.
