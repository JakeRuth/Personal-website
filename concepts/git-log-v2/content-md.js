/* content-md.js
 * Markdown strings for jakeruth/life. Content is drawn from /concepts/_shared/content.json
 * and written in Jake's voice per VOICE.md. All copy is editable; no facts invented.
 */

const MD_FILES = {
  "README.md": `# jakeruth/life

\`\`\`
$ git log --oneline --all | wc -l
13 years tracked.
\`\`\`

**Jake Ruth**  NYC area  \`jake@stockunlock.com\`

Thirteen years shipping. One chapter ending, another beginning.

---

## Status

Re-entering the workforce. Running Stock Unlock has been on autopilot for about fifteen months. Open to full-time roles, contract work, or equity-founding conversations.

\`\`\`js
// HEAD  next-chapter
{
  location:     "NYC area",
  available:    true,
  looking_for:  ["full-time", "equity-founding", "contract"],
  last_shipped: "this week",
}
\`\`\`

## Why me

- Founded and ran a profitable SaaS without burning venture dollars. That perspective doesn't come from a bootcamp.
- Been the senior IC who knows the codebase cold *and* the CEO who raised a seed. Those two rarely live in the same person.
- Ships production code on day one. No onboarding curve  just let me loose.

## Repo map

| File                 | What's in it                                           |
|----------------------|--------------------------------------------------------|
| \`ABOUT.md\`           | The longer version. Origin, arc, values.               |
| \`PROJECTS.md\`        | The things I've shipped.                               |
| \`STOCK_UNLOCK.md\`    | The company. Built, scaled, stabilized at profit.     |
| \`HOBBIES.md\`         | Unicycles, Rubik's cubes, guitars, mats.               |
| \`CONTACT.md\`         | How to get in touch.                                   |

> Click any file in the sidebar to open it. Press \`g\` to return to \`git log\`.

---

*Built with vanilla HTML/CSS/JS and \`marked.js\`. No build step. This whole page is one \`file://\` away from running.*
`,

  "ABOUT.md": `# ABOUT.md

Thirteen years of writing software, running a company, and shipping the kind of work most people only describe in decks.

## The short version

Engineer since high school. Took AP Computer Science senior year **specifically to avoid AP Calculus**. Fell in love with code in the first week. Still doing it thirteen years later.

Double majored in CS and Applied Math at SUNY Albany (3.88, Dean's List every semester). Ran the ACM chapter. Interned at CommerceHub, turned it into a full-time job.

Moved to NYC. Landed at Oscar Health under Alan Warren, the guy who scaled Google Docs from three engineers to thousands. Leveled Associate to Senior. Declined the manager track.

Left Oscar in 2021 to start **Stock Unlock** with Daniel Pronk and Nick Puljik. YC reached out cold via LinkedIn. We raised **$1.335M**, scaled to **eight employees and thousands of paying customers**, and built it into a profitable business. Stepped back to maintenance in late 2024.

Getting married. Redefining next chapter.

## Arc

- **Westchester NY** (childhood)
- **Albany NY** (college, first job)
- **NYC** (work and founding and marriage)

## What I'm good at

- Full-stack shipping. Python, Go, TypeScript, React since pre-hooks era.
- System design that survives contact with reality.
- AI-leveraged engineering. Driver in the driver's seat, not driven by the car.
- Founding. Hiring. Firing. Raising. Scaling. Winding down responsibly.
- Running the YC interview myself with a beer in hand.

## What I won't do

- Compliment sandwiches in feedback.
- Bureaucracy and politics over shipping.
- "Fisher-Price" software that looks polished and breaks under real use.
- Overcharging retail investors for broken analysis tools.

## What I want

- Brutally honest teammates who disagree directly, with reason.
- Autonomy and real ownership.
- Things that matter, that aren't bullshit.
- High-bar teams.
- Get-shit-done culture.

---

> I state what I am and let you decide.
`,

  "PROJECTS.md": `# PROJECTS.md

Things I've built. Some shipped publicly. Some internal.

---

## Stock Unlock
**Company  2021  present (side business since late 2024)**

Software that doesn't rip off retail investors.

Built it. Scaled it to eight employees and thousands of paying customers. It runs today as a profitable side business. I'm not full-time there anymore.

See \`STOCK_UNLOCK.md\` for the long version.

---

## Internal Discord bot (Stock Unlock)
**AI infrastructure  2026**

Tightly-permissioned Discord bot deployed via Docker Compose on EC2, built with Open Hands. Lets non-technical teammates query logs, errors, code, and user data in natural language. Every permission scoped. No wildcard superpowers.

\`\`\`
/logs service=billing since=1h grep="stripe_error"
/users email="..." last_active=true
/code where="renderChart" with_context=true
\`\`\`

---

## Customer.io  AWS SES migration
**Cost optimization  2026**

Migrated Stock Unlock off Customer.io. Self-hosted on AWS SES with custom admin panels. Built largely with AI. One person, one weekend of focused work. Saved **$5-6K/yr**.

> The kind of thing that used to cost a Q to scope.

---

## Stock Unlock Webflow rewrite
**Marketing rebuild  2025**

Rewrote the full marketing site in Webflow with AI-assisted code. **10xd marketing footprint.** Overhauled SEO and GEO.

---

## Oscar internal chatbot
**Internal tool  2018-2021**

Built with Peter at Oscar from hackathon scraps. Started as a HipChat emoji pipeline and evolved into a command-routable bot for an engineering org that grew from ~50 to ~150+.

The before-Claude-existed version of the thing everybody's shipping now.

---

## Youni
**Startup  2015-2016  shut down**

College-focused social media iOS app on React Native v0.13. Thousands of signups across two campuses. Couldn't solve cold-start. Shut down within six months.

Won the reps. Didn't win the market.

---

## grails-shiro-guard
**Open source  CommerceHub era**

Grails plugin for permission-string caching. Still on GitHub: [commercehub-oss/grails-shiro-guard](https://github.com/commercehub-oss/grails-shiro-guard).
`,

  "STOCK_UNLOCK.md": `# STOCK_UNLOCK.md

> Software that doesn't rip off retail investors.

## Snapshot

| Field           | Value                                            |
|-----------------|--------------------------------------------------|
| Role            | Co-founder, former CEO                           |
| Dates           | 2021  present (not full-time since late 2024) |
| YC batch        | Winter 2022                                      |
| Seed            | $1.335M ($500K YC SAFE + $835K other investors)  |
| Peak team       | 8 employees                                      |
| Customers       | Thousands of paying customers                    |
| Today           | Profitable side business                         |
| Co-founders     | Daniel Pronk, Nick Puljik                        |

## Framing rule

Built it. Scaled it to eight employees and thousands of paying customers. It runs today as a profitable side business. I'm not full-time there anymore. I'm redefining my next chapter.

Not a failed startup. Not a current day job. A won battle, now in maintenance mode.

## How it started

Daniel Pronk spent **5-10 hours every weekend** on Excel sheets for his investing YouTube content. I wrote a Python automation in a weekend and emailed him, free. He ignored me for about six weeks. Then he answered to make me stop. First call was a video call with a beer.

YC reached out cold via LinkedIn before we applied. I led the YC interview. We raised $500K SAFE + $835K from other investors.

Launched before the seed closed. **400 paying users in two weeks. 800-900 at seed close.**

## How it went

Scaled to **thousands of paying customers and eight employees.** Hit a stall point late 2024. Stepped back to key-decisions-only. Right-sized the team.

Today it runs with three full-time employees. The goal switched from "grow at all costs" to "operate profitably". The goal is hit.

## Why it exists

A competitor's "margin of safety score" was computed as \`current_price / all_time_high\`. That's not a score. That's theft from people who can't afford to be robbed.

Stock Unlock exists partly as a response to that.

---

> "I ignored his emails for weeks. That was the mistake."   Daniel Pronk
`,

  "HOBBIES.md": `# HOBBIES.md

The things that aren't work, but show up in how I work anyway.

## Speedcubing
Competed 2008-2014 at Northeast US and Nationals. **3x3 average: 13.95 seconds.**

At an Oscar Health talent show I rode a unicycle while solving a Rubik's cube. Josh Kushner was in the audience.

## Unicycle
See above. Currently mostly storage.

## Skateboarding
Serious skater as a teenager. Still a weakness for a good push down a quiet street.

## Track, soccer, rugby
- Track captain and MVP senior year of high school.
- Soccer JV captain sophomore year.
- Rugby briefly at UAlbany.

## DDR / Guitar Hero
Obsessed and competitive, teen years.

## Guitar
Play.

## Meditation
Regular practice. Believes in serendipity as a lived principle. It's the reason I answered a cold email from a YouTuber seven years ago.

## Rock climbing
College phase. Fingers still remember most of it.

---

*The Rubik's cube branch is still on disk. You never really close that one.*
`,

  "CONTACT.md": `# CONTACT.md

## Direct

**Email** [jake@stockunlock.com](mailto:jake@stockunlock.com)
**GitHub**   [github.com/JakeRuth](https://github.com/JakeRuth)

## Response posture

Fast during business hours ET. I prefer email to DMs.

## What a good email looks like

\`\`\`
From:    you@somewhere.com
Subject: [role or project name]  one line of context

Two or three lines on:
 - What the thing is.
 - Why me specifically.
 - What "good" looks like for you.
\`\`\`

I like short emails. I'll answer with a short one, or ask to jump on a call.

## Hiring me

### Full-time employment
Senior IC, founding engineer, or early-stage CTO. NYC / remote / hybrid. Market rate + equity. Not looking to manage unless the team is right.

### Equity founding
Co-founder track with real equity. Small seed round or earlier. Has to be a problem I care about.

### Contract engagement
Defined deliverable, defined timeline. Open to this selectively.

### Not sure yet
Email me. We'll figure it out.

---

> One voice. Does not change based on target audience. This site sounds like me because it is me.
`
};
