# picker-wizard

Entry-point prototype for jakeruth.com. An InstallShield-style setup wizard that
lets visitors configure their experience and then launches them into the chosen
mode.

## Run

Vanilla HTML/CSS/JS. No build.

- Open `index.html` directly in a browser (`file://`), or
- `python3 -m http.server` and visit `http://localhost:8000/`.

## What's implemented

- **Jake Ruth Setup Wizard** dialog: ~520x400, InstallShield gray + blue title
  bar, Tahoma/MS Sans Serif stack, pixel-rendered feel.
- **Faux desktop background**: XP-era taskbar with Start button, running app,
  system tray, live clock, plus a couple of desktop icons (folders, a `resume.pdf`,
  a Rubik's cube `.exe`).
- **Four-step wizard flow**:
  1. **Welcome** - sideart + splash copy in Jake's voice. "Total install time:
     fewer than three minutes. Disk space required: about the same as a PDF
     resume."
  2. **Choose Your Experience** - radio list of five modes (XP Luna, Enterprise
     SaaS, Git Log, README, Vista) each with a 1-line description. Selected mode
     shows a small live preview thumbnail rendered in CSS. Below the list is an
     "Advanced options..." toggle that expands a checkbox grid (cube ambient
     animation, audio, dark mode, CRT scanlines, reduced motion, Konami code).
     Non-functional - just shows the wizard can go deeper.
  3. **Confirm** - "You chose [X]. Ready to launch?" with a summary card
     (experience, target path, install size, advanced prefs). `[< Back]`
     `[Launch Jake]`.
  4. **Launching...** - animated progress bar with rolling log
     ("Starting services...", "Mounting career...", "Registering cube
     drivers...", "OK. Redirecting.") then `window.location.href` redirects to
     the chosen experience's `../<mode>/` directory.
- **Cancel flow** - bottom-right Cancel button (and title-bar close) opens a
  classic "Are you sure you want to cancel Jake Ruth Setup?" modal with the
  yellow warning circle. Yes resets the wizard; No dismisses.
- **Keyboard navigation**:
  - `Up`/`Down` (and `Left`/`Right`) move between radio options on step 2.
  - `Enter` advances (Next / Launch).
  - `Backspace` goes Back.
  - `Esc` triggers Cancel.
- **Redirect paths** point at the v2 directories so this works end-to-end once
  siblings are built:
  - `../xp-luna-v2/`
  - `../enterprise-saas-v2/`
  - `../git-log-v2/`
  - `../readme-mode/`
  - `../vista-faithful-v2/`

## Voice notes

All copy is straight Jake: dry, specific, no buzzwords, no "passionate." The
wizard explains itself with InstallShield deadpan. Nothing about Stock Unlock
implies he still runs it day-to-day. No dollar prices anywhere.

## Files

- `index.html` - wizard shell, taskbar, modal
- `styles.css` - all retro chrome + thumbnails + progress bar
- `wizard.js` - state machine, rendering, keyboard, launch animation, redirect

## If I had more time

- **Real preview thumbnails** - iframe-embed each mode's index (throttled /
  muted) rather than CSS-only fakes.
- **Persist Advanced prefs** to `localStorage` and forward them as a query
  string (`?cube=0&dark=1`) so each experience can honor them.
- **License agreement step** - between Welcome and Choose, a scroll-to-accept
  EULA with Jake's Anti-Bullshit License. Pure flavor.
- **Sound** - disabled by default, but add the classic "ding" on Cancel and
  the XP startup sound on final launch when audio is enabled in Advanced.
- **Remember last choice** - skip straight to Confirm for return visitors, with
  a "Reconfigure" link that dumps them back on step 2.
- **Accessibility pass** - proper focus ring management across steps, ARIA
  roles on the radio list, and an "Accessibility" opt-out for the whole retro
  vibe (high-contrast, system font fallback).
- **Easter egg** - a working dependency viewer sub-window like the original
  `retro-09-installer-wizard` had (canvas graph of dependencies rendered from
  `content.json`).
