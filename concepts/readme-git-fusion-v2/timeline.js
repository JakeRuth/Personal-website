/* ================================================================
   timeline.js — the git-log view folded into the README chrome.
   Four-column log (rail / hash / date / message) with expandable
   `git show` panels. Reverse-chronological within year headers.
   ================================================================ */

window.TIMELINE = (function () {
  'use strict';

  /* ---------- branches ---------- */
  const BRANCHES = [
    { id: 'next',        name: 'next-chapter', colorVar: '--c-next',        years: '2026 → now' },
    { id: 'main',        name: 'main',         colorVar: '--c-main',        years: '2013 → now' },
    { id: 'stockunlock', name: 'stock-unlock', colorVar: '--c-stockunlock', years: '2021 → now' },
    { id: 'pronk',       name: 'pronk',        colorVar: '--c-pronk',       years: '2021' },
    { id: 'oscar',       name: 'oscar-health', colorVar: '--c-oscar',       years: '2017–2021' },
    { id: 'youni',       name: 'youni',        colorVar: '--c-youni',       years: '2015–2016' },
    { id: 'commercehub', name: 'commercehub',  colorVar: '--c-commercehub', years: '2013–2016' },
    { id: 'rubiks',      name: 'rubiks-cube',  colorVar: '--c-rubiks',      years: '2008–2014' },
    { id: 'married',     name: 'married',      colorVar: '--c-married',     years: '2025–2026' },
  ];

  /* ---------- commits (newest first, year headers, strict chrono within year) ---------- */
  const COMMITS = [
    { year: '2026' },
    {
      sha: 'c0d3baf', fullSha: 'c0d3baf8e27a1d33f9b0c5e7e1a9a2b4f7c8d99e',
      branch: 'next', author: 'Jake Ruth <jake@stockunlock.com>',
      date: '2026-04-20',
      decoration: [{ kind: 'head', text: 'HEAD -> next-chapter' }],
      subject: "the driver's seat, chapter II",
      tags: ['available', 'NYC', 'open-to-work'],
      body:
        "Stock Unlock is humming as a profitable side business. Not the day job anymore. " +
        "Opening a new branch. Undecided on upstream — could be agents, could be tools for builders, " +
        "could be something dumber and more fun. What I do know: the driver stays in the driver's seat. " +
        "AI is the car, not the chauffeur.",
      diffstat: {
        items: [
          { file: 'status.md',  added: 1, removed: 1, note: 'available: true' },
          { file: 'inbox/',     added: 0, removed: 0, note: 'accepting applications' },
        ],
        summary: '1 chapter changed, +1 fresh start, -1 job title',
      },
    },
    {
      sha: '5741a8c', fullSha: '5741a8c0b2e1f3d49a8b76c2d5e7f01122334455',
      branch: 'stockunlock', author: 'Jake Ruth <jake@stockunlock.com>',
      date: '2026-02-11',
      decoration: [{ kind: 'remote', text: 'origin/stock-unlock' }],
      subject: 'refactor SU into a profitable side business',
      tags: ['$5-6K/yr saved', 'AWS SES', 'Webflow'],
      body:
        "Migrated off Customer.io to self-hosted AWS SES with custom admin panels. " +
        "Rewrote the marketing site in Webflow. Overhauled SEO and GEO. " +
        "Trimmed what did not compound. Kept the parts customers hug.",
      diffstat: {
        items: [
          { file: 'infra/customer.io',    added: 0,    removed: 2100, note: 'removed' },
          { file: 'infra/aws-ses/*',      added: 1840, removed: 0,    note: 'self-hosted' },
          { file: 'marketing/webflow/*',  added: 2500, removed: 800,  note: 'rewrite' },
        ],
        summary: '3 systems changed, +$5-6K/yr saved, -1 vendor',
      },
    },
    {
      sha: '8b3a7ef', fullSha: '8b3a7ef12d99cc04a51be3d2f2340987a6e5f3c1',
      branch: 'married', author: 'Jake Ruth <jake@stockunlock.com>',
      date: '2026-01-04',
      subject: 'wedding: ship v1.0',
      tags: ['life', 'merged'],
      body:
        "Years of pair programming, now under a legal contract. Vows compiled cleanly. " +
        "No rollback plan needed. Receipts: a small photo album, a bigger group chat, and a stupidly good playlist.",
      diffstat: {
        items: [
          { file: 'personal/wedding.md', added: 1, removed: 0, note: 'married' },
          { file: '.gitignore',          added: 1, removed: 0, note: 'cold feet' },
        ],
        summary: '1 person added, 0 removed',
      },
    },

    { year: '2025' },
    {
      sha: 'e1c4d22', fullSha: 'e1c4d22aa9fc10b7d3a64e8b8a8a8a8a8a8a8a8a',
      branch: 'married', author: 'Jake Ruth <jake@stockunlock.com>',
      date: '2025-10-02',
      subject: 'engaged: open PR -> main',
      tags: ['life'],
      body:
        "Asked, got a yes. Probably the only merge I have ever been nervous about. " +
        "Rings fit. Parents cried. Schema migration forthcoming.",
      diffstat: {
        items: [
          { file: 'personal/wedding.md', added: 64, removed: 4, note: 'drafting vows' },
        ],
        summary: '1 relationship upgraded, zero regressions',
      },
    },
    {
      sha: 'a1c0de0', fullSha: 'a1c0de0beefcafe1234567890abcdef012345678',
      branch: 'stockunlock', author: 'Jake Ruth <jake@stockunlock.com>',
      date: '2025-06-14',
      subject: 'AI-driven personal renaissance',
      tags: ['Opus 4.5 tipping point', 'Claude Code', 'Codex'],
      body:
        "Opus 4.5 was the inflection point. Driver in the driver's seat, not driven by the car. " +
        "AI now writes more code than I do — and I read every line before it ships. " +
        "Rebuilt half of SU this way without hiring.",
      diffstat: {
        items: [
          { file: 'tools/claude-code', added: 1200, removed: 0, note: 'adopted' },
          { file: 'tools/codex',       added:  400, removed: 0, note: 'adopted' },
          { file: 'tools/cmux',        added:  150, removed: 0, note: 'adopted' },
        ],
        summary: '3 tools added, 1 mindset shifted',
      },
    },

    { year: '2024' },
    {
      sha: '9234f1a', fullSha: '9234f1abe77c1180cafe4d2b101f012bdeadbeef',
      branch: 'stockunlock', author: 'Jake Ruth <jake@stockunlock.com>',
      date: '2024-12-01',
      subject: 'stepped back to key-decisions-only',
      tags: ['maintenance mode', '3 FTE remain', 'profitable'],
      body:
        "Stall point. Hard numbers, hard conversations, right-sized the team. " +
        "Company continues with three full-time employees. Focus switched from " +
        "\"grow at all costs\" to \"operate profitably.\" Both goals now hit.",
      diffstat: {
        items: [
          { file: 'ops/payroll', added: 0,   removed: 5, note: '5 employees off' },
          { file: 'ops/oncall',  added: 0,   removed: 1, note: 'jake removed' },
          { file: 'finance/',    added: 400, removed: 0, note: 'profitability' },
        ],
        summary: '5 employees removed (respectfully), profitability added',
      },
    },
    {
      sha: 'a17d3ca', fullSha: 'a17d3caf0b0c1d2e3f4a5b6c7d8e9f0011223344',
      branch: 'stockunlock', author: 'Daniel Pronk <daniel@stockunlock.com>',
      date: '2024-08-12',
      subject: 'daniel -> youtube full-time',
      tags: ['division of labor'],
      body:
        "Daniel goes all-in on the channel and the education side. We keep the product tight. " +
        "Division of labor that actually labors.",
      diffstat: {
        items: [
          { file: 'content/youtube/*', added: 220, removed: 80, note: 'daniel' },
        ],
        summary: '1 co-founder re-routed, 0 burned bridges',
      },
    },

    { year: '2023' },
    {
      sha: 'abc1234', fullSha: 'abc12349d1aa0f4c78ef5b2113a0b4f5c6d7e8f9',
      branch: 'stockunlock', author: 'Jake Ruth <jake@stockunlock.com>',
      date: '2023-05-19',
      subject: 'scale peak: 8 employees, thousands of customers',
      tags: ['8 FTE', '~$450K ARR', 'thousands of customers'],
      body:
        "Peak team of eight. Thousands of paying customers. ARR around $450K. " +
        "The market caught a cold — we caught a fever. Every decision felt like merging into prod.",
      diffstat: {
        items: [
          { file: 'ops/payroll',    added: 8,    removed: 0,  note: 'peak headcount' },
          { file: 'customers/',     added: 2800, removed: 40, note: 'net growth' },
          { file: 'ops/burn-rate',  added: 1,    removed: 0,  note: 'climbing' },
        ],
        summary: '8 employees added, 0 removed — for now',
      },
    },

    { year: '2022' },
    {
      sha: '0f8d1cc', fullSha: '0f8d1cc7b2a9e034f58cd27e39a11cf482a7c91e',
      branch: 'stockunlock', author: 'Jake Ruth <jake@stockunlock.com>',
      date: '2022-02-28',
      subject: 'YC W22 demo day',
      tags: ['YC W22', '400 users in 2 weeks', '800-900 at close'],
      body:
        "Three minutes to explain why retail investors deserve pro tools. Slides tight, voice steady. " +
        "YC pushed us to launch before raising. 400 paying users in two weeks. 800-900 at seed close.",
      diffstat: {
        items: [
          { file: 'deck/demo-day.key', added: 1,   removed: 0, note: 'presented' },
          { file: 'users/paying',      added: 400, removed: 0, note: 'in 2 weeks' },
        ],
        summary: '1 pitch delivered, 400 users acquired',
      },
    },
    {
      sha: '3e5b192', fullSha: '3e5b192a11c3d55f67ab9921dd04e6faabbccdd1',
      branch: 'stockunlock', author: 'Jake Ruth <jake@stockunlock.com>',
      date: '2022-01-10',
      subject: 'raised $1.335M seed',
      tags: ['$500K YC SAFE', '$835K other', 'CEO + lead interviewer'],
      body:
        "SAFEs signed. Fund counter ticked. Felt less like winning and more like someone handing you a bigger backpack before a longer hike. " +
        "I led the YC interview myself. Nick was mostly there for the beer.",
      diffstat: {
        items: [
          { file: 'balance.json', added: 1335000, removed: 0, note: 'seed round' },
          { file: 'cap-table.md', added: 14,      removed: 0, note: 'investors' },
        ],
        summary: '$1.335M deposited, 0 walked away',
      },
    },

    { year: '2021' },
    {
      sha: '7d9e041', fullSha: '7d9e041c882a4bdde1fa43b2109876543210fedc',
      branch: 'stockunlock', author: 'Y Combinator <bot@yc>',
      date: '2021-12-05',
      subject: 'YC reaches out cold via LinkedIn',
      tags: ['cold outreach', 'before we even applied'],
      body:
        "An email. A calendar invite. A group chat melt-down in a two-person company. " +
        "They found us before we found them.",
      diffstat: {
        items: [{ file: 'inbox/yc.eml', added: 1, removed: 0, note: 'cold intro' }],
        summary: '1 inbound changed everything',
      },
    },
    {
      sha: '2b4c887', fullSha: '2b4c8874a8b1f201a998c2b3e4d5f60711223344',
      branch: 'stockunlock', author: 'Jake Ruth <jake@stockunlock.com>',
      date: '2021-09-14',
      subject: 'stock-unlock: public launch',
      tags: ['first paying customer before dinner'],
      body:
        "v1 out the door. Screens, ratios, watchlists, a scary login button. " +
        "First paying customer before dinner. I ate dinner twice.",
      diffstat: {
        items: [
          { file: 'src/**/*',   added: 18420, removed: 0, note: 'initial ship' },
          { file: 'customers/', added: 1,     removed: 0, note: 'first paying' },
        ],
        summary: '211 files changed, +18,420 insertions, 1 customer',
      },
    },
    {
      sha: 'd5a9e42', fullSha: 'd5a9e42f0123456789abcdef0123456789abcdef',
      branch: 'oscar', author: 'Jake Ruth <jake@stockunlock.com>',
      date: '2021-06-30',
      decoration: [{ kind: 'branch', text: 'oscar-health' }],
      subject: 'oscar-health: final commit',
      tags: ['left Oscar', 'brought Nick'],
      body:
        "Four years in health insurance. Learned how real systems get built and broken. " +
        "Thanked the team, shipped the last PR, closed the laptop on a Friday. Brought Nick with me.",
      diffstat: {
        items: [{ file: 'offboarding.md', added: 1, removed: 0, note: 'exit' }],
        summary: '1 exit, 1 co-founder recruited',
      },
    },
    {
      sha: '22f0a91', fullSha: '22f0a918d2c3b4a5f6e7d8c9b0a1f2e3d4c5b6a7',
      branch: 'stockunlock', author: 'Jake Ruth <jake@stockunlock.com>',
      date: '2021-06-21',
      merge: true,
      subject: "Merge branch 'pronk' into stock-unlock",
      tags: ['merge', 'cofounders'],
      body:
        "Fast-forward not possible. Daniel and I had been drifting on two repos of the same idea. " +
        "Combined them. He brought the voice, I brought the backend. Conflicts resolved in favor of shipping.",
      diffstat: {
        items: [
          { file: 'src/**/*',  added: 3120, removed: 200, note: 'merged' },
          { file: 'content/*', added: 900,  removed: 0,   note: 'daniel' },
        ],
        summary: '2 repos merged, 1 co-founder acquired',
      },
    },
    {
      sha: '8fea115', fullSha: '8fea115c1d0b0f9e8d7c6b5a4f3e2d1c0b9a8877',
      branch: 'pronk', author: 'Daniel Pronk <daniel@pronk.yt>',
      date: '2021-04-02',
      decoration: [{ kind: 'branch', text: 'pronk' }],
      subject: 'finally replies to the cold DM',
      tags: ['persistence'],
      body:
        "I had built a Python screener and shipped it free on his forum. Kept emailing him weekly. " +
        "He replied after about six weeks to make me stop. We got on a call. I cracked a beer. He got it anyway.",
      diffstat: {
        items: [{ file: 'inbox/daniel.eml', added: 2, removed: 0, note: 'first reply' }],
        summary: '6 weeks of silence resolved',
      },
    },
    {
      sha: '1a2b3c4', fullSha: '1a2b3c4d5e6f708192a3b4c5d6e7f8091a2b3c4d',
      branch: 'stockunlock', author: 'Jake Ruth <jake@stockunlock.com>',
      date: '2021-02-11',
      subject: 'wrote the python screener, shipped it free',
      tags: ['free', 'weekend project'],
      body:
        "Open-sourced weekend project for retail investors on Daniel's forum. " +
        "Free. No ask. Just \"does this help?\" The answer came back loud.",
      diffstat: {
        items: [
          { file: 'screener.py', added: 480, removed: 10, note: 'core logic' },
          { file: 'README.md',   added: 60,  removed: 0,  note: 'instructions' },
        ],
        summary: '480 lines given away, 1 cofounder earned',
      },
    },

    { year: '2020' },
    {
      sha: 'c0ffee1', fullSha: 'c0ffee1deadbeefcafebabef00dbaadf00df00df',
      branch: 'oscar', author: 'Jake Ruth <jake@stockunlock.com>',
      date: '2020-05-12',
      subject: 'senior engineer: own systems end-to-end',
      tags: ['Senior', 'pandemic pivots'],
      body:
        "Pandemic rewrote every roadmap. We rewrote ours twice. Became the person whose name lands " +
        "in the on-call rotation for the weird bugs. Declined the manager track — twice.",
      diffstat: {
        items: [{ file: 'services/**/*', added: 3400, removed: 1100, note: 'rewrite' }],
        summary: '54 files changed, 2 pivots absorbed',
      },
    },

    { year: '2019' },
    {
      sha: '9badc0d', fullSha: '9badc0de112233445566778899aabbccddeeff00',
      branch: 'oscar', author: 'Jake Ruth <jake@stockunlock.com>',
      date: '2019-03-18',
      subject: 'mid-level: assigned problems, not tickets',
      tags: ['Associate -> Mid'],
      body:
        "Went from \"assigned tickets\" to \"assigned problems.\" Much better. Also: built an over-engineered " +
        "internal chatbot from hackathon scraps with Peter. Started as a HipChat emoji pipeline. Got out of hand.",
      diffstat: {
        items: [
          { file: 'services/**/*', added: 980, removed: 310, note: 'real work' },
          { file: 'fun/chatbot',   added: 420, removed: 10,  note: 'with Peter' },
        ],
        summary: '1 level up, 1 friendship compiled',
      },
    },

    { year: '2018' },
    {
      sha: 'un1cy13', fullSha: 'un1cy13abcde1234567890abcdef1234567890ab',
      branch: 'rubiks', author: 'Jake Ruth <jake@stockunlock.com>',
      date: '2018-06-22',
      subject: 'talent show: unicycle + rubiks cube',
      tags: ['Josh Kushner was there'],
      body:
        "Rode a unicycle while solving a Rubik's cube at the Oscar Health talent show. " +
        "Josh Kushner was in the audience. No regrets. Branch remains on disk — you never really close that one.",
      diffstat: {
        items: [{ file: 'hobbies/unicycle.md', added: 14, removed: 0, note: 'field test' }],
        summary: '1 cube solved, 0 dignity lost',
      },
    },

    { year: '2017' },
    {
      sha: '4e7a1b0', fullSha: '4e7a1b0aa55bb66cc77dd88ee99ff001122334455',
      branch: 'oscar', author: 'Jake Ruth <jake@stockunlock.com>',
      date: '2017-03-06',
      decoration: [{ kind: 'branch', text: 'oscar-health' }],
      subject: 'start oscar-health (under Alan Warren)',
      tags: ['~50 engineers at join', '~150+ at exit'],
      body:
        "NYC. Joined under Alan Warren, who had previously scaled Google Docs from two-three people to thousands. " +
        "New stack, new scale, new problems. First time touching systems where a bad deploy had downstream consequences measured in humans.",
      diffstat: {
        items: [{ file: 'onboarding.md', added: 1, removed: 0, note: 'day one' }],
        summary: '1 engineer added, 0 onboarding curve',
      },
    },

    { year: '2016' },
    {
      sha: 'f00d721', fullSha: 'f00d72198af1cc003feedbeef0a0b0c0d0e0f010',
      branch: 'commercehub', author: 'Jake Ruth <jake@stockunlock.com>',
      date: '2016-12-22',
      decoration: [{ kind: 'branch', text: 'commercehub' }],
      subject: "commercehub: final commit, off to NYC",
      tags: ['interview squad', 'micro-services'],
      body:
        "Three years of e-commerce plumbing. Learned what production actually means. " +
        "Learned to read stack traces like poetry. Took down production once as an intern — manager stood up and said " +
        "\"that was not your fault, you should not have had access to that button.\" That sentence shaped how I think about systems.",
      diffstat: {
        items: [{ file: 'offboarding.md', added: 1, removed: 0, note: 'exit' }],
        summary: '3 years banked, 1 prod takedown survived',
      },
    },
    {
      sha: '7ce99da', fullSha: '7ce99da991122334455667788aabbccddeeff001',
      branch: 'youni', author: 'Jake Ruth <jake@stockunlock.com>',
      date: '2016-04-10',
      merge: true,
      subject: "Merge branch 'youni' (project ended)",
      tags: ['React Native v0.13', 'thousands of signups', 'shut down'],
      body:
        "Youni wound down. Great people, hard market. Could not solve cold-start. " +
        "Dragged the lessons back into main — you cannot un-learn \"ship weekly or perish.\"",
      diffstat: {
        items: [{ file: 'projects/youni/**', added: 120, removed: 2300, note: 'retired' }],
        summary: '1 startup retired, 1 founder matured',
      },
    },

    { year: '2015' },
    {
      sha: 'b1e7a03', fullSha: 'b1e7a031a2b3c4d5e6f708192a3b4c5d6e7f8090',
      branch: 'youni', author: 'Jake Ruth <jake@stockunlock.com>',
      date: '2015-09-02',
      decoration: [{ kind: 'branch', text: 'youni' }],
      subject: 'youni: co-building a campus social thing',
      tags: ['CTO', 'iOS', 'React Native'],
      body:
        "Side hustle that felt like a main hustle. React Native v0.13, late nights, group chats that never slept. " +
        "Did not win the market. Won the reps.",
      diffstat: {
        items: [{ file: 'app/**/*', added: 4800, removed: 120, note: 'initial build' }],
        summary: '1 startup started, zero excuses later',
      },
    },
    {
      sha: 'a1b2c3d', fullSha: 'a1b2c3d4e5f6071829aabbccddeeff001122334',
      branch: 'main', author: 'Jake Ruth <jake@stockunlock.com>',
      date: '2015-05-17',
      subject: 'B.S. CS + Applied Math, SUNY Albany',
      tags: ['3.88 GPA', "Dean's List every semester"],
      body:
        "Double major shipped. 3.88 GPA, Dean's List every semester. ACM chapter: president. " +
        "Most useful class: the one that taught me I could teach myself the rest.",
      diffstat: {
        items: [{ file: 'education/diploma.pdf', added: 120, removed: 0, note: 'earned' }],
        summary: '2 majors completed, 1 career compiled',
      },
    },

    { year: '2014' },
    {
      sha: '5u1ff1e', fullSha: '5u1ff1ea1b2c3d4e5f6789abcdeffedcba987654',
      branch: 'main', author: 'Jake Ruth <jake@stockunlock.com>',
      date: '2014-04-01',
      subject: 'ACM @ SUNY Albany — elected president',
      tags: ['took over a failing club', 'recruited 20+'],
      body:
        "Took over a failing club. Recruited 20+ members. Ran hackathons, pizza nights, resume clinics. " +
        "Organized the Tekkapalooza field trip where I handed my resume to CommerceHub. Learned more engineering from organizing engineers than from most coursework.",
      diffstat: {
        items: [{ file: 'clubs/acm/*', added: 80, removed: 0, note: 'rebuilt' }],
        summary: '20+ members recruited, 1 career launched',
      },
    },
    {
      sha: 'cube0fe', fullSha: 'cube0fe111222333444555666777888999aaabbb',
      branch: 'rubiks', author: 'Jake Ruth <jake@stockunlock.com>',
      date: '2014-02-14',
      subject: 'peak: 13.95s avg, 3x3',
      tags: ['Northeast US', 'Nationals'],
      body:
        "Competed 2008-2014 at Northeast US and Nationals. 3x3 average: 13.95 seconds. " +
        "The patience tax this cost still pays dividends.",
      diffstat: {
        items: [{ file: 'hobbies/rubiks.md', added: 14, removed: 0, note: 'peak avg' }],
        summary: '~14 seconds per cube, 6 years per reflex',
      },
    },

    { year: '2013' },
    {
      sha: 'c0de013', fullSha: 'c0de013abcdef1234567890fedcba0987654321f',
      branch: 'commercehub', author: 'Jake Ruth <jake@stockunlock.com>',
      date: '2013-11-04',
      decoration: [{ kind: 'branch', text: 'commercehub' }],
      subject: 'first day: commercehub intern (became FT)',
      tags: ['Groovy/Grails', 'React pre-hooks', 'Java'],
      body:
        "First real codebase. First real deploy. First real \"do not do that in prod\" talk. " +
        "Agile team of ten, micro-service architecture, interview squad participant. Career clock starts ticking now.",
      diffstat: {
        items: [{ file: 'onboarding.md', added: 1, removed: 0, note: 'day one' }],
        summary: '1 engineer added, career started',
      },
    },
    {
      sha: 'b1rthff', fullSha: 'b1rthff0000000000000000000000000000000000',
      branch: 'main', author: 'Jake Ruth <jake@stockunlock.com>',
      date: '2013-01-01',
      subject: 'git init — start learning to code',
      tags: ['empty repo, curious brain'],
      body:
        "Genesis commit. Thirteen years later the repo has branches for a fintech, a health insurer, a degree, " +
        "a wedding, and a Rubik's cube.",
      diffstat: {
        items: [{ file: 'README.md', added: 1, removed: 0, note: 'hello world' }],
        summary: '1 file added, 1 life started',
      },
    },

    { year: '2011' },
    {
      sha: 'apcs011', fullSha: 'apcs0111111222223333344444555556666677777',
      branch: 'main', author: 'Jake Ruth <jake@stockunlock.com>',
      date: '2011-09-06',
      subject: 'AP CS instead of AP Calc — fell in love week 1',
      tags: ['pivotal'],
      body:
        "Needed a math credit senior year. Refused to take AP Calculus. Ms. Nalbandian mentioned she taught AP Computer Science. " +
        "Asked if it counted. She said yes. Took it to avoid Calc. Fell in love with code in the first week. That sideways pivot became my career.",
      diffstat: {
        items: [{ file: 'school/schedule.txt', added: 1, removed: 1, note: 'AP CS in, AP Calc out' }],
        summary: '1 sideways pivot, 13 years of consequences',
      },
    },

    { year: '2008' },
    {
      sha: '2008cub', fullSha: '2008cub1111222233334444555566667777888899',
      branch: 'rubiks', author: 'Jake Ruth <jake@stockunlock.com>',
      date: '2008-09-01',
      decoration: [{ kind: 'branch', text: 'rubiks-cube' }],
      subject: 'rubiks-cube: branch created',
      tags: ['first cube'],
      body:
        "A cube, a stopwatch, a stubborn streak. Competitive speedcubing for years.",
      diffstat: {
        items: [{ file: 'hobbies/rubiks.md', added: 1, removed: 0, note: 'new hobby' }],
        summary: '1 obsession started',
      },
    },
  ];

  /* ---------- jump points (synced with year dividers) ---------- */
  const JUMPS = [
    { year: '2026', label: 'next-chapter' },
    { year: '2025', label: 'married, renaissance' },
    { year: '2024', label: 'SU maintenance' },
    { year: '2023', label: 'scale peak' },
    { year: '2022', label: 'YC + seed' },
    { year: '2021', label: 'SU starts' },
    { year: '2017', label: 'Oscar starts' },
    { year: '2016', label: 'Youni ends' },
    { year: '2015', label: 'graduated' },
    { year: '2013', label: 'career starts' },
    { year: '2011', label: 'AP CS' },
    { year: '2008', label: 'first cube' },
  ];

  /* ---------- helpers ---------- */
  const escape = (s) => String(s).replace(/[&<>"']/g, (c) => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;',
  }[c]));

  const relativeDate = (iso) => {
    const d = new Date(iso);
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
