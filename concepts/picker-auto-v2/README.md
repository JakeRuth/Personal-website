# picker-auto-v2

Iteration on `picker-auto`. Same minimalist aesthetic, zero auto-pick. The
visitor lands, sees the five experiences stacked like a short menu of
models, picks one. That's it.

## Files

- `index.html` — the picker landing.
- `switcher.js` — the drop-in pill component for the five experiences.
- `README.md` — this file.

Open `index.html` directly via `file://`, or from the `concepts/` root:

```
cd concepts
python3 -m http.server 8000
# then visit http://localhost:8000/picker-auto-v2/
```

## Layout chosen: vertical list of 5, hair-line rules between

Option (b) from the brief. Why:

- **Five is awkward for a horizontal row.** At desktop widths the labels
  have to shrink or the row spills; at tablet widths it fights the grid.
  A vertical stack reads the same on any viewport.
- **Five clock-positions (option d) is cute but not obvious.** The brief
  specifically asks for "minimalist but obvious." A radial dial makes
  visitors think. A vertical list does not.
- **A 2x3 card grid (option c) introduces chrome** — borders, padding, a
  hero tile — that fights the high-end watch-ad direction.

The final layout borrows from a luxury manufacturer's "our collection"
page. Header with the wordmark. One line of orienting copy:

> Five ways to read the same person.
> Same content, five _rooms_. Pick one.

Below it, five rows, each:

```
01   XP Luna                                                      >
     Windows XP, warmed over. Teal task bar, Bliss wallpaper,
     real content underneath.
------------------------------------------------------------------
02   Vista Faithful                                               >
     Glass, Aero, maximum chrome. Everything 2007 promised and
     then apologized for.
...
```

Hair-line dividers in `rgba(245, 243, 238, 0.12)`. On hover, the row slides
right by 18px, a short accent rule grows in from the left margin, and the
chevron nudges forward. Clear affordance without adding visual noise.

Everything fits in one viewport by design: `body` is a `grid` with
`auto 1fr auto` rows, rows use clamped vertical padding, and a
`@media (max-height: 720px)` shrinks labels further so laptop screens still
show all five without scroll.

## Copy (Jake-voice one-liners)

Each mode gets one short line that describes the room, not the resume:

- **XP Luna** — "Windows XP, warmed over. Teal task bar, Bliss wallpaper,
  real content underneath."
- **Vista Faithful** — "Glass, Aero, maximum chrome. Everything 2007
  promised and then apologized for."
- **Enterprise SaaS** — "The parody pitch. Pricing cards, logos, CTA stack.
  I am not actually for sale."
- **README x Git** — "Markdown resume plus a scrollable commit log.
  Engineer-native."
- **README** — "Plain text. Zero chrome. The version you'd paste into a
  terminal."

Tested against VOICE.md: no "passionate," no "innovative," no buzz phrases,
short sentences, dry where it fits ("I am not actually for sale").

## Keyboard

- `1` – `5` jump to that experience immediately.
- `↑` / `↓` (or `j` / `k`) move a focus ring through the list.
- `↵` on a focused row launches it.

Shown subtly in the footer. Not required, just rewarded.

## How v2 differs from v1 (`../picker-auto/`)

| Concern | v1 (picker-auto) | v2 (picker-auto-v2) |
|---|---|---|
| Auto-pick | Time-of-day, mobile width, referrer rules, localStorage lock, 3.2s auto-launch | **Removed entirely.** Visitor picks, always. |
| Primary UI | One sentence ("Chose: Enterprise SaaS. Mid-afternoon. Buy-mode feels right."), three buttons, inline dropdown | **Five big clickable rows, always visible.** |
| First interaction | Cancel countdown, then pick | Pick. That's the whole screen. |
| Footprint in viewport | Single card, 640px | Full-page layout, header + list + footer |
| Voice role | Explain *why* the site guessed | Describe *what each room is* |
| Minimalism | Preserved | Preserved — same type scale, same dark palette, same gold accent |
| `switcher.js` | Works standalone on experience pages | Same, catalog updated to match the five targets the brief specified (`vista-faithful-v3`, `readme-git-fusion`) |

Jake's complaint about v1 was that it felt confusing and the auto-pick was
hostile. v2 keeps the restraint he liked (big type, dark background,
restrained chrome, gold accent) and trades the "we picked for you" act for
a clean index: here are the five, walk into any one.

## Voice + pricing rule

- No auto-pick means no cute rationalization copy to get wrong.
- No pricing shown. The `Enterprise SaaS` description openly says "I am
  not actually for sale" — consistent with the framing rule that pricing
  UI is fine but real numbers are not.
- Stock Unlock framing is not touched on this page (it's a router, not a
  resume page).

## If I had more time...

- **Hover preview.** On desktop, a tiny preview swatch of each experience's
  palette could slide in on hover, so the label gets reinforced by a color
  story without pulling focus.
- **Keyboard-first polish.** Wrap the five rows in a proper `listbox` with
  roving tabindex, announce selection via `aria-live`. Current implementation
  is good; accessibility-audit-clean would be better.
- **Remember-last on this page too.** The pill inside each experience
  already supports "Remember this pick." If the visitor has one pinned, the
  landing could show "Last time you picked XP Luna — go there" as a subtle
  shortcut link above the list, without ever auto-launching.
- **Return-visitor fade.** On revisit, fade the intro copy out faster
  (400ms vs. 700ms) so repeat visitors get to the list quicker without
  changing the layout.
- **Print / screen-reader route.** A `<noscript>` / list fallback that
  still renders all five as real `<a>` links (the JS already uses real
  `<a href>` elements, but the page should also work without JS — today
  the list is injected by JS, which is not strictly necessary).
- **Hand-audit the copy with Jake.** Five one-liners is a small surface;
  it's also five chances to sound off. Worth a second pass.
