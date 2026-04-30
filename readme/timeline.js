/* ================================================================
   timeline.js, the git-log view folded into the README chrome.
   Four-column log (rail / hash / date / message) with expandable
   `git show` panels. Reverse-chronological within year headers.
   ================================================================ */

window.TIMELINE = (function () {
  'use strict';

  /* ---------- branches ---------- */
  const BRANCHES = [
    { id: 'main',        name: 'main',         colorVar: '--c-main',        years: '2011 → now' },
    { id: 'ai',          name: 'ai-era',       colorVar: '--c-next',        years: '2022 → now' },
    { id: 'stockunlock', name: 'stock-unlock', colorVar: '--c-stockunlock', years: '2021 → now' },
    { id: 'pronk',       name: 'pronk',        colorVar: '--c-pronk',       years: '2021' },
    { id: 'oscar',       name: 'oscar-health', colorVar: '--c-oscar',       years: '2017–2021' },
    { id: 'youni',       name: 'youni',        colorVar: '--c-youni',       years: '2015–2017' },
    { id: 'commercehub', name: 'commercehub',  colorVar: '--c-commercehub', years: '2013–2016' },
    { id: 'rubiks',      name: 'rubiks-cube',  colorVar: '--c-rubiks',      years: '2008–2014' },
  ];

  /* ---------- commits (newest first, year headers, strict chrono within year) ---------- */
  const COMMITS = [
    { year: '2026' },
    {
      sha: 'c0d3baf', fullSha: 'c0d3baf8e27a1d33f9b0c5e7e1a9a2b4f7c8d99e',
      branch: 'main', author: 'Jake Ruth <jake2ruth@gmail.com>',
      date: '2026-04',
      decoration: [{ kind: 'head', text: 'HEAD -> main' }],
      subject: 'working on what is up next; quietly open',
      tags: ['available', 'NYC', 'open to talk'],
      body:
        "Stock Unlock runs profitably without me in the seat day-to-day. Open to full-time, contract, or equity-founding " +
        "conversations, quietly, not as a banner. Has to be a problem I'd care about. " +
        "Driver in the seat, not driven by the car.",
      diffstat: {
        items: [
          { file: 'status.md',  added: 1, removed: 1, note: 'available' },
          { file: 'inbox/',     added: 0, removed: 0, note: 'open' },
        ],
        summary: '1 status updated, 0 banners raised',
      },
    },
    {
      sha: 'op4dot5', fullSha: 'op4dot5beefcafe1234567890abcdef0123456789',
      branch: 'ai', author: 'Jake Ruth <jake2ruth@gmail.com>',
      date: '2026-03',
      decoration: [{ kind: 'branch', text: 'ai-era' }],
      subject: 'Opus 4.5: 10x → 100x inflection',
      tags: ['Opus 4.5', 'tidal-wave inflection'],
      body:
        "Tool progression: Copilot ('cool, not life-changing') → Cursor (~1-2 years heavy) → Claude Code dabble through 2025 → " +
        "Opus 4.5 in early 2026 was the tidal-wave inflection. Now on Opus 4.7. " +
        "Heavy Claude Code + Codex + CMUX. Built my own harness via Open Hands. " +
        "Driver in the seat, not driven by the car.",
      diffstat: {
        items: [
          { file: 'tools/claude-code', added: 1200, removed: 0, note: 'heavy' },
          { file: 'tools/codex',       added:  400, removed: 0, note: 'heavy' },
          { file: 'tools/cmux',        added:  150, removed: 0, note: 'multi-instance' },
          { file: 'tools/open-hands',  added:  300, removed: 0, note: 'own harness' },
        ],
        summary: '4 tools adopted, 1 mindset shifted',
      },
    },
    {
      sha: '5741a8c', fullSha: '5741a8c0b2e1f3d49a8b76c2d5e7f01122334455',
      branch: 'stockunlock', author: 'Jake Ruth <jake2ruth@gmail.com>',
      date: '2026-02',
      decoration: [{ kind: 'remote', text: 'origin/stock-unlock' }],
      subject: 'right-size SU to three FT; move to key decisions only',
      tags: ['~3,900 wall in 2024', '3 FT remain', 'profitable'],
      body:
        "Hit a ~3,900-paying-subscriber wall in 2024, sign-ups roughly equaled churn. " +
        "Tried partial pivots, including B2B sales attempts. Bet on big late-2025 feature launches; " +
        "they took too long, burned the team, didn't land. Right-sized in early 2026. " +
        "Three full-time (two engineers + an exec assistant) handle day-to-day. Worked it full-tilt up to that point.",
      diffstat: {
        items: [
          { file: 'ops/payroll', added: 0,   removed: 5, note: 'right-sized' },
          { file: 'ops/oncall',  added: 0,   removed: 1, note: 'jake removed' },
          { file: 'finance/',    added: 400, removed: 0, note: 'profitability held' },
        ],
        summary: 'team right-sized respectfully, profitability held',
      },
    },

    { year: '2025' },
    {
      sha: 'a1c0de0', fullSha: 'a1c0de0beefcafe1234567890abcdef012345678',
      branch: 'ai', author: 'Jake Ruth <jake2ruth@gmail.com>',
      date: '2025-12',
      subject: 'ship X poster, marketing rewrite, ops bot, SEO',
      tags: ['LangChain', 'Playwright', 'self-improving'],
      body:
        "Migrated off Customer.io to self-hosted AWS SES (~$5-6K/yr saved, one weekend). " +
        "Migrated marketing site off Webflow to a self-hosted codebase (~$1K/yr saved, 20x content footprint, no more contractors). " +
        "Built the X poster, a self-improving social-AI agent with a human-in-the-loop. Bootstrap-trained on thousands of tagged posts; " +
        "Playwright for in-product screenshots; LangChain pipeline rewrites its own prompt from human feedback + live engagement. " +
        "Built a permissioned Discord ops bot on EC2 + Docker Compose for non-technical teammates. Programmatic SEO + GEO pages. " +
        "Code review automation across the team.",
      diffstat: {
        items: [
          { file: 'infra/aws-ses/*',     added: 1840, removed: 0,    note: 'self-hosted' },
          { file: 'marketing/site/*',    added: 2500, removed: 800,  note: '20x pages' },
          { file: 'agents/x-poster/*',   added: 1200, removed: 0,    note: 'self-improving' },
          { file: 'agents/ops-bot/*',    added: 600,  removed: 0,    note: 'permissioned' },
        ],
        summary: '4 systems shipped, $6-7K/yr saved, 20x marketing footprint',
      },
    },
    { year: '2024' },
    {
      sha: '9234f1a', fullSha: '9234f1abe77c1180cafe4d2b101f012bdeadbeef',
      branch: 'stockunlock', author: 'Jake Ruth <jake2ruth@gmail.com>',
      date: '2024-09',
      subject: 'hit ~3,900-paying-subscriber wall',
      tags: ['plateau', 'churn ≈ signups'],
      body:
        "Growth flattened, new sign-ups roughly equaled churn. Tried partial pivots, including B2B sales attempts. " +
        "Began betting on a set of big feature launches for late 2025.",
      diffstat: {
        items: [
          { file: 'metrics/subs.csv', added: 0, removed: 0, note: 'flat' },
        ],
        summary: 'plateau identified',
      },
    },

    { year: '2023' },
    {
      sha: 'abc1234', fullSha: 'abc12349d1aa0f4c78ef5b2113a0b4f5c6d7e8f9',
      branch: 'stockunlock', author: 'Jake Ruth <jake2ruth@gmail.com>',
      date: '2023-05',
      subject: 'scale: 8 employees, thousands of paying customers',
      tags: ['8 FTE', 'thousands of customers'],
      body:
        "Team of eight. Thousands of paying subscribers. Worked it full-tilt.",
      diffstat: {
        items: [
          { file: 'ops/payroll',    added: 8,    removed: 0,  note: 'team of 8' },
          { file: 'customers/',     added: 2800, removed: 40, note: 'net growth' },
        ],
        summary: '8 employees, thousands of customers',
      },
    },

    { year: '2022' },
    {
      sha: '0f8d1cc', fullSha: '0f8d1cc7b2a9e034f58cd27e39a11cf482a7c91e',
      branch: 'stockunlock', author: 'Jake Ruth <jake2ruth@gmail.com>',
      date: '2022-03',
      subject: 'YC W22: launched before raising',
      tags: ['YC W22', 'launched'],
      body:
        "YC pushed us to launch before raising. We did. Subscribers came on fast.",
      diffstat: {
        items: [
          { file: 'product/v1',   added: 1,   removed: 0, note: 'launched' },
        ],
        summary: '1 product launched',
      },
    },
    {
      sha: '3e5b192', fullSha: '3e5b192a11c3d55f67ab9921dd04e6faabbccdd1',
      branch: 'stockunlock', author: 'Jake Ruth <jake2ruth@gmail.com>',
      date: '2022-01',
      subject: 'raised $1.35M seed',
      tags: ['led the YC interview'],
      body:
        "Closed a $1.35M seed. I led the YC interview.",
      diffstat: {
        items: [
          { file: 'balance.json', added: 1350000, removed: 0, note: 'seed' },
        ],
        summary: '$1.35M deposited',
      },
    },

    { year: '2021' },
    {
      sha: '7d9e041', fullSha: '7d9e041c882a4bdde1fa43b2109876543210fedc',
      branch: 'stockunlock', author: 'Y Combinator <bot@yc>',
      date: '2021-12',
      subject: 'YC reaches out cold via LinkedIn',
      tags: ['cold inbound', 'before we applied'],
      body:
        "An email. A calendar invite. A group chat melt-down in a two-person company. " +
        "They found us before we found them.",
      diffstat: {
        items: [{ file: 'inbox/yc.eml', added: 1, removed: 0, note: 'cold intro' }],
        summary: '1 inbound changed everything',
      },
    },
    {
      sha: 'd5a9e42', fullSha: 'd5a9e42f0123456789abcdef0123456789abcdef',
      branch: 'oscar', author: 'Jake Ruth <jake2ruth@gmail.com>',
      date: '2021-08',
      decoration: [{ kind: 'branch', text: 'oscar-health' }],
      subject: 'oscar-health: final commit; brought Nick Puljik with me',
      tags: ['~150+ engineers at exit', 'declined team-lead twice'],
      body:
        "Four+ years at Oscar. Joined at ~50 engineers under Alan Warren, left at ~150+. " +
        "Associate → Mid → Senior. Declined the team-lead path twice. " +
        "Brought Nick over to Stock Unlock.",
      diffstat: {
        items: [{ file: 'offboarding.md', added: 1, removed: 0, note: 'exit' }],
        summary: '1 exit, 1 co-founder recruited',
      },
    },
    {
      sha: '22f0a91', fullSha: '22f0a918d2c3b4a5f6e7d8c9b0a1f2e3d4c5b6a7',
      branch: 'stockunlock', author: 'Jake Ruth <jake2ruth@gmail.com>',
      date: '2021-06',
      merge: true,
      subject: "Merge branch 'pronk' into stock-unlock",
      tags: ['cofounders', 'merge'],
      body:
        "Daniel and I joined forces. He brought voice and audience; I brought the backend.",
      diffstat: {
        items: [
          { file: 'src/**/*',  added: 3120, removed: 200, note: 'merged' },
        ],
        summary: '2 efforts merged, 1 co-founder acquired',
      },
    },
    {
      sha: 'discpop', fullSha: 'discpop12d99cc04a51be3d2f2340987a6e5f3c1c',
      branch: 'pronk', author: 'Jake Ruth <jake2ruth@gmail.com>',
      date: '2021-05',
      subject: 'Discord drop: PMF moment',
      tags: ['"I would pay for this"'],
      body:
        "Daniel let me into his paid Discord (~1,000 members behind a ~100K-subscriber YouTube channel). " +
        "Dropped an early Excel-generator alpha that worked for a handful of stocks. Replies came fast: " +
        "'are you selling this?' / 'could you add this stock?' / 'I would pay for this.' " +
        "That's the moment I knew there was a business in it.",
      diffstat: {
        items: [
          { file: 'discord/replies.txt', added: 47, removed: 0, note: 'PMF signal' },
        ],
        summary: '1 alpha dropped, 1 thesis confirmed',
      },
    },
    {
      sha: '8fea115', fullSha: '8fea115c1d0b0f9e8d7c6b5a4f3e2d1c0b9a8877',
      branch: 'pronk', author: 'Daniel Pronk <daniel@pronk.yt>',
      date: '2021-04',
      decoration: [{ kind: 'branch', text: 'pronk' }],
      subject: 'finally replies after ~6 weeks of cold emails',
      tags: ['persistence', "'how can I help you?'"],
      body:
        "I'd built a Python automation in a weekend that hit cheap financial APIs and exported the same Excel format he was making by hand. " +
        "Emailed him weekly. Commented on his content. Tried to give him the tool for free. " +
        "Six weeks in, he replied, to make me stop. Hopped on a video call, cracked a beer, instantly hit it off. " +
        "He let me into his paid Discord. Asked if I could build web apps. I'd been doing it professionally for six years.",
      diffstat: {
        items: [{ file: 'inbox/daniel.eml', added: 2, removed: 0, note: 'first reply' }],
        summary: '6 weeks of silence resolved',
      },
    },

    { year: '2020' },
    {
      sha: 'c0ffee1', fullSha: 'c0ffee1deadbeefcafebabef00dbaadf00df00df',
      branch: 'oscar', author: 'Jake Ruth <jake2ruth@gmail.com>',
      date: '2020-09',
      subject: 'senior at Oscar; declined team-lead path twice',
      tags: ['Senior', 'go-to across two teams'],
      body:
        "Owned services across Python and Golang back-ends and a React front-end, including the internal site for hundreds of " +
        "Tempe care-ops staff. SRE-adjacent on a custom-hosted analytics integration. By senior year, go-to across two teams " +
        "for full-stack questions. Declined team-lead twice, already writing the early Stock Unlock code on the side.",
      diffstat: {
        items: [{ file: 'services/**/*', added: 3400, removed: 1100, note: 'ownership' }],
        summary: '54 files changed, 2 manager offers declined',
      },
    },
    {
      sha: 'tshow02', fullSha: 'tshow02abcde1234567890abcdef0123456789ab',
      branch: 'rubiks', author: 'Jake Ruth <jake2ruth@gmail.com>',
      date: '2020-08',
      subject: 'talent show #2 (encore)',
      tags: ['retraining', 'mastery decays'],
      body:
        "Two years later, mid-20s. Slightly less elaborate, kept the cube-on-unicycle finale, dropped most of the obstacle course. " +
        "The funny part: I had to retrain. Spent a couple of days outside my apartment before the show re-grinding the basics, " +
        "riding backwards, the cube-on-wheels combo. Mastery decays fast if you don't tend it.",
      diffstat: {
        items: [{ file: 'hobbies/talent-show-2.md', added: 8, removed: 0, note: 'encore' }],
        summary: '1 encore shipped, 2 days retraining',
      },
    },

    { year: '2019' },
    {
      sha: 'climb20', fullSha: 'climb20cafebabe0011223344556677889900aabb',
      branch: 'oscar', author: 'Jake Ruth <jake2ruth@gmail.com>',
      date: '2019-08',
      subject: 'picked up indoor rock climbing',
      tags: ['hobby', 'with the team'],
      body:
        "Indoor, with friends from the Oscar team. Two-ish years of steady climbing. " +
        "Problem-solving with your body, plus the social side. Would pick it up again in a heartbeat.",
      diffstat: {
        items: [{ file: 'hobbies/climbing.md', added: 14, removed: 0, note: 'new' }],
        summary: '1 hobby acquired',
      },
    },
    {
      sha: 'em0t1qu', fullSha: 'em0t1qu112233445566778899aabbccddeeff001',
      branch: 'oscar', author: 'Jake Ruth <jake2ruth@gmail.com>',
      date: '2019-05',
      subject: 'Emotiqueue: hackathon → real internal tool',
      tags: ['Peter', '3,000+ emoticons', '50+ commands'],
      body:
        "Built with my coworker Peter. Started as a custom-emoticon flood (HipChat → Slack). " +
        "Hackathon project that routed messages through queues-into-queues + a ticketing system back into chat. " +
        "By the time I left: 3,000+ custom emoticons, 50+ silly entertainment-focused commands, " +
        "and a codebase other engineers across the company committed to. Half goof, half real internal tool.",
      diffstat: {
        items: [{ file: 'fun/emotiqueue/*', added: 2400, removed: 60, note: 'real users' }],
        summary: '1 chatbot shipped, 1 culture moment seeded',
      },
    },
    {
      sha: '9badc0d', fullSha: '9badc0de112233445566778899aabbccddeeff00',
      branch: 'oscar', author: 'Jake Ruth <jake2ruth@gmail.com>',
      date: '2019-03',
      subject: 'Mid level at Oscar',
      tags: ['Associate → Mid'],
      body:
        "Promoted to Mid within ~1 year of leveling.",
      diffstat: {
        items: [
          { file: 'services/**/*', added: 980, removed: 310, note: 'real work' },
        ],
        summary: '1 level up',
      },
    },

    { year: '2018' },
    {
      sha: 'un1cy13', fullSha: 'un1cy13abcde1234567890abcdef1234567890ab',
      branch: 'rubiks', author: 'Jake Ruth <jake2ruth@gmail.com>',
      date: '2018-06',
      subject: 'talent show #1: cube on a unicycle',
      tags: ['legendary', "'All the Small Things'"],
      body:
        "The plan: hand a cube to someone in the audience to scramble. Ride out on the unicycle. " +
        "Switch to riding backwards. Stack chairs and a table from the all-hands room into an obstacle course. " +
        "Jump across them. Take the cube back. Solve it on the unicycle, as the finale. " +
        "'All the Small Things' by Blink-182 in the background. People talked about it for weeks.",
      diffstat: {
        items: [{ file: 'hobbies/talent-show-1.md', added: 14, removed: 0, note: 'shipped' }],
        summary: '1 cube solved, 0 dignity lost',
      },
    },

    { year: '2017' },
    {
      sha: '4e7a1b0', fullSha: '4e7a1b0aa55bb66cc77dd88ee99ff001122334455',
      branch: 'oscar', author: 'Jake Ruth <jake2ruth@gmail.com>',
      date: '2017-03',
      decoration: [{ kind: 'branch', text: 'oscar-health' }],
      subject: 'start oscar-health (under Alan Warren)',
      tags: ['~50 engineers at join', 'serendipity question'],
      body:
        "NYC. Joined under Alan Warren, formerly the Google leader who scaled Google Docs from 2-3 people to thousands. " +
        "Got the offer partly via an interview question that just happened to match my last project (a social-media architecture question). " +
        "Found out years later it was random luck, they hadn't read my resume at all. " +
        "First time touching systems where a bad deploy had downstream consequences measured in humans.",
      diffstat: {
        items: [{ file: 'onboarding.md', added: 1, removed: 0, note: 'day one' }],
        summary: '1 engineer added, 1 lucky question landed',
      },
    },

    { year: '2016' },
    {
      sha: 'f00d721', fullSha: 'f00d72198af1cc003feedbeef0a0b0c0d0e0f010',
      branch: 'commercehub', author: 'Jake Ruth <jake2ruth@gmail.com>',
      date: '2016-12',
      decoration: [{ kind: 'branch', text: 'commercehub' }],
      subject: "commercehub: final commit, off to NYC",
      tags: ['"the system was the problem, not you"'],
      body:
        "Three years of e-commerce plumbing. Groovy/Grails on the back, early-pre-hooks React on the front. " +
        "Took down production once with a button I shouldn't have had access to as an intern. " +
        "Manager stood up before I finished apologizing: 'That wasn't your fault, you shouldn't have had access to that tool. " +
        "We're not celebrating that this happened, but the system was the problem, not you.' " +
        "That sentence rewired how I think about systems, access, and blameless culture. " +
        "Left exactly one year and seven days into FT to go full-time on Youni.",
      diffstat: {
        items: [{ file: 'offboarding.md', added: 1, removed: 0, note: 'exit' }],
        summary: '3 years banked, 1 prod takedown survived',
      },
    },
    {
      sha: '7ce99da', fullSha: '7ce99da991122334455667788aabbccddeeff001',
      branch: 'youni', author: 'Jake Ruth <jake2ruth@gmail.com>',
      date: '2016-09',
      merge: true,
      subject: "Merge branch 'youni' (project ended)",
      tags: ['React Native v0.13/0.14', '20,000+ posts', 'shut down'],
      body:
        "Co-founded with Anthony (CEO) and Jordan, both UAlbany D1 soccer. Launched at SUNY Albany and Binghamton. " +
        "70-person paid-in-credits brand-ambassador program. 20,000+ posts at peak. " +
        "Anthony and Jordan won ~$25K in equity-free business grants while still students. " +
        "No business model and an unsolved cold-start. Folded after ~4-5 months full-time. Eyes definitely bigger than my stomach.",
      diffstat: {
        items: [{ file: 'projects/youni/**', added: 120, removed: 2300, note: 'retired' }],
        summary: '1 startup retired, 1 founder matured',
      },
    },

    { year: '2015' },
    {
      sha: 'b1e7a03', fullSha: 'b1e7a031a2b3c4d5e6f708192a3b4c5d6e7f8090',
      branch: 'youni', author: 'Jake Ruth <jake2ruth@gmail.com>',
      date: '2015-09',
      decoration: [{ kind: 'branch', text: 'youni' }],
      subject: 'youni: co-founded with Anthony and Jordan',
      tags: ['React Native', "Anthony's brand-ambassador design"],
      body:
        "Worked it nights and weekends through CommerceHub at first, then went full-time. " +
        "iOS social-media app on React Native v0.13/0.14, plus a simple companion site. Free office space at an accelerator near Troy. " +
        "School-localized Instagram with Greek-life and sports-team features.",
      diffstat: {
        items: [{ file: 'app/**/*', added: 4800, removed: 120, note: 'initial build' }],
        summary: '1 startup started',
      },
    },
    {
      sha: 'a1b2c3d', fullSha: 'a1b2c3d4e5f6071829aabbccddeeff001122334',
      branch: 'main', author: 'Jake Ruth <jake2ruth@gmail.com>',
      date: '2015-05',
      subject: 'BS CS + Applied Math, SUNY Albany',
      tags: ['3.88 GPA', "Dean's List every semester"],
      body:
        "Double major shipped. 3.88 GPA, Dean's List every semester. Freshman year: 99/100 on the standardized Calc 1 exam, " +
        "best score among the ~500 students who took it that semester (the cohort included grad students). " +
        "ACM chapter: president for two years. The club survived past me.",
      diffstat: {
        items: [{ file: 'education/diploma.pdf', added: 120, removed: 0, note: 'earned' }],
        summary: '2 majors completed',
      },
    },

    { year: '2014' },
    {
      sha: 'ie7el1p', fullSha: 'ie7el1pdeadbeefcafebabef00dbaadf00df00df',
      branch: 'commercehub', author: 'Jake Ruth <jake2ruth@gmail.com>',
      date: '2014-09',
      subject: 'IE7 ellipsis bug for QVC, fixed via Windows VM',
      tags: ['QVC', 'Internet Explorer 7', '2014'],
      body:
        "Fixed a string-truncation bug where the ellipsis didn't render properly in IE7. " +
        "QVC was pinned to IE7. To test the fix I had to spin up a virtual machine running an old version of Windows just to load the browser. In 2014. " +
        "Engineering history is preserved in QVC's procurement contracts.",
      diffstat: {
        items: [{ file: 'fix/ellipsis.js', added: 6, removed: 2, note: 'IE7 quirk' }],
        summary: '1 bug fixed, 1 era visited',
      },
    },
    {
      sha: '5u1ff1e', fullSha: '5u1ff1ea1b2c3d4e5f6789abcdeffedcba987654',
      branch: 'main', author: 'Jake Ruth <jake2ruth@gmail.com>',
      date: '2014-04',
      subject: 'ACM @ SUNY Albany, president (year two)',
      tags: ['~50-100 students at interest meeting', 'survived past me'],
      body:
        "Took over a dying CS club junior year. Outgoing seniors handed me the presidency. " +
        "Got professors to let me announce an interest meeting at the end of their classes. Booked a lecture hall, ~7pm on a weeknight. " +
        "~50-100 students showed; few dozen joined. Ran weekly meetings, LAN parties, and workshops on what I was learning at CommerceHub. " +
        "Organized the Tekkapalooza field trip that became my CommerceHub on-ramp. The club survived past me.",
      diffstat: {
        items: [{ file: 'clubs/acm/*', added: 80, removed: 0, note: 'rebuilt' }],
        summary: 'few dozen members recruited, 1 career launched',
      },
    },
    {
      sha: 'cube0fe', fullSha: 'cube0fe111222333444555666777888999aaabbb',
      branch: 'rubiks', author: 'Jake Ruth <jake2ruth@gmail.com>',
      date: '2014-02',
      subject: 'speed-cubing peak: 13.95s avg, top-20 US Pyraminx',
      tags: ['Northeast US', 'Nationals', 'WCA-sanctioned'],
      body:
        "Competed 2008-2014 at Northeast US events and Nationals (WCA-sanctioned). " +
        "3×3 average: 13.95 seconds. Top-20 in the US at the Pyraminx at peak.",
      diffstat: {
        items: [{ file: 'hobbies/rubiks.md', added: 14, removed: 0, note: 'peak avg' }],
        summary: '~14 seconds per cube, 6 years per reflex',
      },
    },

    { year: '2013' },
    {
      sha: 'mpb2013', fullSha: 'mpb20130000000000000000000000000000000000',
      branch: 'main', author: 'Jake Ruth <jake2ruth@gmail.com>',
      date: '2013-09',
      subject: 'My Plastic Brain contracting (parallel)',
      tags: ['KineticJS', 'brain-injury rehab'],
      body:
        "Several hundred hours of paid contract work in college, parallel to the CH internship. " +
        "Built KineticJS card games, digital adaptations of physical card games that brain-injury rehab patients used in real life. " +
        "Self-directed end-to-end. Now-defunct company.",
      diffstat: {
        items: [{ file: 'contract/mpb/*', added: 1200, removed: 50, note: 'card games' }],
        summary: '1 contract delivered',
      },
    },
    {
      sha: 'c0de013', fullSha: 'c0de013abcdef1234567890fedcba0987654321f',
      branch: 'commercehub', author: 'Jake Ruth <jake2ruth@gmail.com>',
      date: '2013-06',
      decoration: [{ kind: 'branch', text: 'commercehub' }],
      subject: 'first day: commercehub intern (became FT)',
      tags: ['Groovy/Grails', 'React pre-hooks', 'Tekkapalooza drop'],
      body:
        "First real codebase. First real deploy. Agile team, Groovy/Grails on the back, early-pre-hooks React on the front, code-review culture. " +
        "Got here via the Tekkapalooza resume drop while running ACM. Career clock starts ticking now.",
      diffstat: {
        items: [{ file: 'onboarding.md', added: 1, removed: 0, note: 'day one' }],
        summary: '1 engineer added, career started',
      },
    },

    { year: '2011' },
    {
      sha: 'apcs011', fullSha: 'apcs0111111222223333344444555556666677777',
      branch: 'main', author: 'Jake Ruth <jake2ruth@gmail.com>',
      date: '2011-09',
      subject: 'AP CS instead of AP Calc, loop closed in week one',
      tags: ['pivotal', 'Mrs. Nalbandian'],
      body:
        "Senior year of high school. Catch-22: required to take a math credit, but I'd burned through every math class except AP Calc. " +
        "I refused AP Calc. Mrs. Nalbandian mentioned in passing she taught AP Computer Science. " +
        "I asked: 'Does that count as a math credit?' She said yes. I signed up to avoid Calc. " +
        "She ran a function on the board in the first five minutes of the first class. I knew right there. " +
        "Fifteen years later, that sideways pivot is still the main road.",
      diffstat: {
        items: [{ file: 'school/schedule.txt', added: 1, removed: 1, note: 'AP CS in, AP Calc out' }],
        summary: '1 sideways pivot, 15 years of consequences',
      },
    },

    { year: '2008' },
    {
      sha: '2008cub', fullSha: '2008cub1111222233334444555566667777888899',
      branch: 'rubiks', author: 'Jake Ruth <jake2ruth@gmail.com>',
      date: '2008-09',
      decoration: [{ kind: 'branch', text: 'rubiks-cube' }],
      subject: 'started speed-cubing',
      tags: ['first cube'],
      body:
        "Competed through 2014. 3×3 average peaked at 13.95 seconds. Top-20 in the US at the Pyraminx.",
      diffstat: {
        items: [{ file: 'hobbies/rubiks.md', added: 1, removed: 0, note: 'new hobby' }],
        summary: '1 obsession started',
      },
    },
  ];

  /* ---------- jump points (synced with year dividers) ---------- */
  const JUMPS = [
    { year: '2026', label: 'SU on key decisions only · quietly open' },
    { year: '2025', label: 'AI era ships' },
    { year: '2024', label: 'SU plateau' },
    { year: '2023', label: 'scale peak' },
    { year: '2022', label: 'YC + seed' },
    { year: '2021', label: 'SU starts' },
    { year: '2020', label: 'senior at Oscar' },
    { year: '2019', label: 'Emotiqueue + Mid' },
    { year: '2018', label: 'talent show' },
    { year: '2017', label: 'Oscar starts' },
    { year: '2016', label: 'Youni ends' },
    { year: '2015', label: 'graduated' },
    { year: '2014', label: 'cube peak · ACM' },
    { year: '2013', label: 'CommerceHub starts' },
    { year: '2011', label: 'AP CS' },
    { year: '2008', label: 'first cube' },
  ];

  /* ---------- helpers ---------- */
  const escape = (s) => String(s).replace(/[&<>"']/g, (c) => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;',
  }[c]));

  const relativeDate = (iso) => {
    const d = new Date(iso.length <= 7 ? iso + '-01' : iso);
    const now = new Date('2026-04-20');
    const yrs = (now - d) / (1000 * 60 * 60 * 24 * 365);
    if (yrs < 0.08) return 'days ago';
    if (yrs < 1) return Math.max(1, Math.round(yrs * 12)) + ' months ago';
    return yrs.toFixed(1) + ' years ago';
  };

  const branchById = (id) => BRANCHES.find((b) => b.id === id);

  const renderDecoration = (deco) => {
    if (!Array.isArray(deco)) return '';
    return deco.map((d) => {
      const cls = d.kind === 'head' ? 'head'
                : d.kind === 'remote' ? 'remote'
                : 'branch';
      return `<span class="tl-deco ${cls}">${escape(d.text)}</span>`;
    }).join(' ');
  };

  const renderDiffstat = (diffstat) => {
    if (!diffstat || !diffstat.items) return '';
    const items = diffstat.items;
    const maxBar = 16;
    const maxTotal = Math.max(1, ...items.map((i) => (i.added || 0) + (i.removed || 0)));
    const lines = items.map((i) => {
      const total = (i.added || 0) + (i.removed || 0);
      const scale = total === 0 ? 0 : Math.max(1, Math.round((total / maxTotal) * maxBar));
      const addBars = total === 0 ? 0 : Math.max(0, Math.round(((i.added || 0) / total) * scale));
      const remBars = Math.max(0, scale - addBars);
      const bars = '<span class="added">' + '+'.repeat(addBars) + '</span>' +
                   '<span class="removed">' + '-'.repeat(remBars) + '</span>';
      const stat = `<span class="added">+${i.added || 0}</span> <span class="removed">-${i.removed || 0}</span>`;
      const note = i.note ? ` <span class="note">// ${escape(i.note)}</span>` : '';
      return `<div class="tl-diff-line">
        <span class="tl-diff-file">${escape(i.file)}${note}</span>
        <span class="tl-diff-bars">${stat} ${bars}</span>
      </div>`;
    }).join('');
    const summary = diffstat.summary ? `<div class="tl-diff-summary">${escape(diffstat.summary)}</div>` : '';
    return `<div class="tl-diffstat">${lines}${summary}</div>`;
  };

  /* ---------- render body ---------- */
  function render(bodyEl) {
    const out = [];
    for (const c of COMMITS) {
      if (c.year) {
        const j = JUMPS.find((x) => x.year === c.year);
        const note = j ? j.label : '';
        out.push(`<div class="tl-year" id="tl-year-${c.year}">
          <span class="tl-year-num">${c.year}</span>
          <span class="tl-year-note">${escape(note)}</span>
        </div>`);
        continue;
      }
      const b = branchById(c.branch);
      const colorStyle = b ? `style="--branch-color: var(${b.colorVar})"` : '';
      const classes = ['tl-commit'];
      if (c.merge) classes.push('merge');
      const isHead = Array.isArray(c.decoration) && c.decoration.some((d) => d.kind === 'head');
      if (isHead) classes.push('head');

      const deco = renderDecoration(c.decoration);
      const subject = escape(c.subject);

      out.push(`<div class="${classes.join(' ')}" ${colorStyle} data-sha="${c.sha}" data-branch="${c.branch}" id="c-${c.sha}">
        <div class="tl-rail"></div>
        <div class="tl-hash">${escape(c.sha)}</div>
        <div class="tl-date">${escape(c.date)}</div>
        <div class="tl-msg">
          ${deco}
          <span class="tl-subject">${subject}</span>
        </div>
        <div class="tl-expand">
          <button class="tl-close" data-close aria-label="Close commit">close</button>
          <div class="tl-show-meta">
            <span class="k">commit</span><span class="v"><span class="mono">${escape(c.fullSha)}</span></span>
            <span class="k">Author</span><span class="v">${escape(c.author)}</span>
            <span class="k">Date</span><span class="v">${escape(c.date)} <span class="muted">(${escape(relativeDate(c.date))})</span></span>
            <span class="k">Branch</span><span class="v"><span style="color: var(${b ? b.colorVar : '--accent'}); font-weight:600">${escape(b ? b.name : c.branch)}</span></span>
          </div>
          <div class="tl-show-body"><p>${escape(c.body || '').split(/\n\n+/).join('</p><p>')}</p></div>
          ${(c.tags && c.tags.length) ? `<div class="tl-tags">${c.tags.map((t) => `<span class="tl-tag">${escape(t)}</span>`).join('')}</div>` : ''}
          ${renderDiffstat(c.diffstat)}
        </div>
      </div>`);
    }
    bodyEl.innerHTML = out.join('\n');
  }

  function renderBranchRail(listEl) {
    listEl.innerHTML = BRANCHES.map((b) => `
      <li data-branch="${b.id}">
        <span class="swatch" style="background: var(${b.colorVar})"></span>
        <span class="name">${escape(b.name)}</span>
        <span class="years">${escape(b.years)}</span>
      </li>
    `).join('');
  }

  function renderJumpRail(listEl) {
    listEl.innerHTML = JUMPS.map((j) => `
      <li data-year="${j.year}">
        <span class="year">${j.year}</span>
        <span class="label muted">${escape(j.label)}</span>
      </li>
    `).join('');
  }

  /* ---------- interactions ---------- */
  let activeBranch = null;

  function applyBranchFilter(id, root) {
    activeBranch = id;
    root.querySelectorAll('.tl-commit').forEach((row) => {
      if (!id) { row.classList.remove('dim'); return; }
      row.classList.toggle('dim', row.dataset.branch !== id);
    });
  }

  function applySearch(q, root) {
    const query = q.trim().toLowerCase();
    let matches = 0;
    root.querySelectorAll('.tl-commit').forEach((row) => {
      const sha = row.dataset.sha;
      const c = COMMITS.find((x) => x.sha === sha);
      if (!c) return;
      const hay = (c.subject + ' ' + (c.body || '') + ' ' + (c.tags || []).join(' ') + ' ' + c.sha + ' ' + c.author).toLowerCase();
      const subjEl = row.querySelector('.tl-subject');
      if (!query) {
        row.classList.remove('dim');
        subjEl.innerHTML = escape(c.subject);
        if (activeBranch && row.dataset.branch !== activeBranch) row.classList.add('dim');
        return;
      }
      if (hay.includes(query)) {
        matches++;
        row.classList.remove('dim');
        const subj = c.subject;
        const idx = subj.toLowerCase().indexOf(query);
        subjEl.innerHTML = idx >= 0
          ? escape(subj.slice(0, idx)) + '<mark>' + escape(subj.slice(idx, idx + query.length)) + '</mark>' + escape(subj.slice(idx + query.length))
          : escape(subj);
      } else {
        row.classList.add('dim');
        subjEl.innerHTML = escape(c.subject);
      }
    });
    return matches;
  }

  function wire(bodyEl, opts) {
    const { footEl, branchListEl, jumpListEl, searchEl } = opts;

    bodyEl.addEventListener('click', (e) => {
      const close = e.target.closest('[data-close]');
      if (close) {
        const row = close.closest('.tl-commit');
        if (row) row.classList.remove('open');
        e.stopPropagation();
        return;
      }
      const row = e.target.closest('.tl-commit');
      if (!row) return;
      if (e.target.closest('a')) return;
      const isOpen = row.classList.contains('open');
      bodyEl.querySelectorAll('.tl-commit.open').forEach((r) => { if (r !== row) r.classList.remove('open'); });
      row.classList.toggle('open', !isOpen);
      if (!isOpen) {
        // nudge into view only if needed
        const rect = row.getBoundingClientRect();
        if (rect.top < 100 || rect.bottom > window.innerHeight - 100) {
          row.scrollIntoView({ block: 'start', behavior: 'smooth' });
        }
      }
    });

    branchListEl.addEventListener('click', (e) => {
      const li = e.target.closest('li');
      if (!li) return;
      const id = li.dataset.branch;
      const next = activeBranch === id ? null : id;
      branchListEl.querySelectorAll('li').forEach((x) => x.classList.toggle('active', x === li && next));
      applyBranchFilter(next, bodyEl);
      if (footEl) {
        footEl.textContent = next
          ? `Filtered to branch: ${branchById(next).name}. Click the branch again to clear.`
          : 'Click any commit to expand. Click again to collapse.';
      }
    });

    jumpListEl.addEventListener('click', (e) => {
      const li = e.target.closest('li');
      if (!li) return;
      const el = document.getElementById('tl-year-' + li.dataset.year);
      if (el) el.scrollIntoView({ block: 'start', behavior: 'smooth' });
    });

    searchEl.addEventListener('input', (e) => {
      const n = applySearch(e.target.value, bodyEl);
      if (footEl && e.target.value.trim()) {
        footEl.textContent = `${n} match${n === 1 ? '' : 'es'} for "${e.target.value.trim()}"`;
      } else if (footEl) {
        footEl.textContent = activeBranch
          ? `Filtered to branch: ${branchById(activeBranch).name}. Click the branch again to clear.`
          : 'Click any commit to expand. Click again to collapse.';
      }
    });
    searchEl.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        searchEl.value = '';
        applySearch('', bodyEl);
        searchEl.blur();
      }
    });
  }

  function rawSource() {
    const rows = [];
    for (const c of COMMITS) {
      if (c.year) { rows.push(''); rows.push(`===== ${c.year} =====`); continue; }
      const deco = Array.isArray(c.decoration)
        ? c.decoration.map((d) => d.text).join(', ')
        : '';
      rows.push(`${c.sha}  ${c.date}  (${c.branch})${deco ? '  [' + deco + ']' : ''}`);
      rows.push(`    ${c.subject}`);
    }
    return rows.join('\n');
  }

  return {
    BRANCHES, COMMITS, JUMPS,
    render, renderBranchRail, renderJumpRail,
    wire, rawSource,
  };
})();
