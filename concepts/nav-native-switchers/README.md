# Nav-Native-Switchers

**1 of 13 prototypes for the jakeruth.com rebuild.**

Each experience is a different world. This prototype argues that the *mode switcher* should be a citizen of that world too.

No universal top-bar. No floating palette. When you're in the XP desktop, you switch modes the way you'd switch anything else in XP: through the **start** menu. When you're in the terminal, you switch with `git switch`. When you're in Enterprise SaaS, you click a product-view dropdown. When you're reading the README, you check a box.

## Modes shown in this prototype

Split-screen quad view. All four are live and interactive simultaneously.

| Pane | Native switcher | Flavor |
|------|-----------------|--------|
| **XP Luna** | Green **start** button &rarr; Start menu &rarr; *Switch Experience* &rsaquo; submenu. Triggers a "Logging off…" overlay. | "Where would you like to go today?" |
| **Git Log terminal** | Typed command. `git switch <mode>` or `git checkout --experience=<mode>`. Autocomplete suggests the five mode slugs; Tab/Enter accept. | "HEAD detached from main." |
| **Enterprise SaaS** | `Product view ▾` in the top nav. Dropdown shows all modes styled as product SKUs — *Current*, *Legacy*, *Dev*, *OSS* badges, B2B marketing copy. | "Switching product view requires session reload." |
| **README** | `<details>` block titled `## Experience Mode` that expands into `- [ ]` checklist items. Tick one to switch. | Plain markdown. No chrome. |

Vista Aero is listed as a target in every switcher but does not have its own pane in this prototype (it would be the fifth, and the quad-grid is already the stronger pitch).

## How to run

```
cd concepts/nav-native-switchers
python3 -m http.server 8000
# then open http://localhost:8000
```

Or just double-click `index.html`; it also works over `file://`.

## Pattern rationale

The multi-experience concept for jakeruth.com is, at its core, a claim that chrome can carry voice. An XP desktop doesn't just *look* different from a terminal — it *feels* different. The way you interact with it is different. The things you do first are different.

If the switcher is a universal chrome element (top-bar pills, floating palette) it undercuts that claim by acting as a reminder that you're inside a meta-frame. The spell breaks. You stop being in XP; you're in an *app that shows XP*.

A native switcher keeps the spell intact. Clicking **start** to leave XP is in-character. Typing `git switch` to leave the terminal is in-character. It also means the switcher is the one feature that *most strongly* shows off each mode's personality — because it's the feature you will definitely touch.

Secondary benefit: every mode needs to have a switcher *anyway*. Making it native doesn't add a feature, it re-costumes a required one.

## Tradeoffs

### vs. universal top-bar pills

- **Topbar wins on**: discoverability, mobile, accessibility, predictability. A user who lands in XP and doesn't know there are other modes will find them immediately with a topbar. Takes roughly zero cognitive load.
- **Native wins on**: voice coherence, delight, memorability. The thing people will screenshot.
- **Mitigation**: ship both. A tiny, slightly-dimmed "more experiences →" affordance that lives in a consistent spot per mode, *plus* the native switcher as the prominent one. Best of both if executed with discipline.

### vs. command palette (`Cmd+K`)

- **Palette wins on**: power-user speed. Fastest possible switch.
- **Native wins on**: first-time user experience. No one discovers `Cmd+K` without a tooltip.
- **Mitigation**: the palette can be a *bonus*, not the primary path. Git-log mode already has it (typed command is a palette). Other modes can opt in silently.

### vs. "pick your mode at entry, stay there"

- **Entry-picker wins on**: simplicity.
- **Native wins on**: the central bit — the site is *about* having multiple voices. Letting someone switch mid-session and see the same facts re-skinned is a substantial part of the pitch.

## Implementation notes

- Pure vanilla HTML/CSS/JS. No build, no dependencies, no CDN calls. Opens over `file://`.
- All four switchers fire a shared `performSwitch(target, { via })` handler that flavors the confirmation differently based on which native switcher triggered it (XP: logoff overlay; git: terminal stdout line; SaaS: pane fade/reload; README: toast). In the real site, this would route; here it logs + flashes the destination pane + drops a toast.
- The terminal autocomplete is the one place this prototype goes slightly beyond sketch quality — it feels meaningfully closer to the real Git-log experience when you Tab through mode names.

## If I had more time…

- **Actual page transitions.** Right now the switcher confirms that it understood your intent, but doesn't actually route anywhere. The payoff beat — *you are now in that mode* — is missing. Would wire this to a real multi-route prototype or a full-page takeover animation per source-destination pair.
- **Per-source transition vocabulary.** XP already has its logoff animation. Git should have a scrolling checkout / "Fast-forwarded to <target>" sequence. SaaS should have an actual session-reload spinner with a progress bar. README should fade the markdown to raw text and then re-render as the new mode. Those mini-animations are what make this pattern sing.
- **Keyboard-native access from every mode.** `Cmd+K` in any mode should open that mode's native switcher. Right now you have to click the affordance.
- **Vista Aero pane** as the fifth native. The sidebar gadget idea from the brief is visually stronger than the README pane; I'd swap README for Vista in a second iteration if pressed.
- **Mobile story.** The native-switcher pattern is harder on mobile because some of the idioms (XP start, SaaS top-nav) are desktop-first. Would need a per-mode mobile affordance that still feels in-world (e.g. XP uses a full-screen Start panel the way a mobile device would present a menu). Prototype doesn't attempt this yet.
- **A11y pass.** Each native switcher needs ARIA role wiring — `menu`/`menuitem` for XP/SaaS, `listbox` for the checklist, a `role="combobox"` + live-region on the terminal autocomplete. Sketched-in focus states only at the moment.
- **Per-source analytics** — measure which native switcher users actually use most. Strong hypothesis: the terminal wins among engineers, SaaS dropdown wins among recruiters, README checklist wins among nerds who want the joke.
