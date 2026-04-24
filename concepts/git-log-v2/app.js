/* git-log-v2 app.js
 * - Renders a git-log --graph with year dividers.
 * - Keyboard: j/k (move), Enter (pin), / (search), Esc (clear), o (open md), g (back to log).
 * - Markdown preview pane powered by marked.js (CDN).
 * - Commit messages tightened against VOICE.md.
 */

const BRANCHES = [
  { id: 'next',        name: 'next-chapter',             color: 'c-next',        head: 'HEAD  next-chapter',  years: '2026 ' },
  { id: 'main',        name: 'main',                     color: 'c-main',        head: '',                       years: '2013 ' },
  { id: 'stockunlock', name: 'stock-unlock',             color: 'c-stockunlock', head: 'origin/stock-unlock',    years: '2021  2026' },
  { id: 'pronk',       name: 'pronk (co-founder)',       color: 'c-pronk',       head: '',                       years: '2021' },
  { id: 'oscar',       name: 'oscar-health',             color: 'c-oscar',       head: '',                       years: '2017  2021' },
  { id: 'youni',       name: 'youni',                    color: 'c-youni',       head: '',                       years: '2015  2016' },
  { id: 'commercehub', name: 'commercehub',              color: 'c-commercehub', head: '',                       years: '2013  2016' },
  { id: 'rubiks',      name: 'rubiks-cube',              color: 'c-rubiks',      head: '',                       years: '2008  2014' },
  { id: 'married',     name: 'married',                  color: 'c-married',     head: '',                       years: '2025  2026' },
];

/* ------------------------------------------------------------------
 * COMMITS
 * diffstat.items = array of { file, added, removed, note? }
 * diffstat.summary = "X things changed, +Y, -Z" rendered as life-events
 * ------------------------------------------------------------------ */
const COMMITS = [
  {
    sha: 'c0d3baf', fullSha: 'c0d3baf8e27a1d33f9b0c5e7e1a9a2b4f7c8d99e',
    branch: 'next', author: 'Jake Ruth <jake@stockunlock.com>',
    date: '2026-04-20', decoration: 'HEAD  next/main',
    subject: "the driver's seat, chapter II",
    tags: ['available', 'NYC', 'open-to-work'],
    body:
      "Stock Unlock is humming as a profitable side business. Not the day job anymore. " +
      "Opening a new branch. Undecided on upstream  could be agents, could be tools for builders, " +
      "could be something dumber and more fun. What I do know: the driver stays in the driver's seat. " +
      "AI is the car, not the chauffeur.",
    diffstat: {
      items: [
        { file: 'status.md',   added: 1, removed: 1, note: 'available: true' },
        { file: 'inbox/',      added: 0, removed: 0, note: 'accepting applications' },
      ],
      summary: '1 chapter changed, +1 fresh start, -1 job title',
    },
    g: [' * ', 'c-next'],
  },

  { sec: "2026" },
  {
    sha: '5741a8c', fullSha: '5741a8c0b2e1f3d49a8b76c2d5e7f01122334455',
    branch: 'stockunlock', author: 'Jake Ruth <jake@stockunlock.com>',
    date: '2026-02-11', decoration: 'origin/stock-unlock',
    subject: 'refactor SU into a profitable side business',
    tags: ['$5-6K/yr saved', 'AWS SES', 'Webflow'],
    body:
      "Migrated off Customer.io to self-hosted AWS SES with custom admin panels. " +
      "Rewrote the marketing site in Webflow. Overhauled SEO + GEO. " +
      "Trimmed what didn't compound. Kept the parts customers hug.",
    diffstat: {
      items: [
        { file: 'infra/customer.io',     added: 0, removed: 2100, note: 'removed' },
        { file: 'infra/aws-ses/*',       added: 1840, removed: 0, note: 'self-hosted' },
        { file: 'marketing/webflow/*',   added: 2500, removed: 800, note: 'rewrite' },
      ],
      summary: '3 systems changed, +5,600/yr saved, -1 vendor',
    },
    g: ['|  * ', 'c-main', 'c-stockunlock'],
  },
  {
    sha: '8b3a7ef', fullSha: '8b3a7ef12d99cc04a51be3d2f2340987a6e5f3c1',
    branch: 'married', author: 'Jake Ruth <jake@stockunlock.com>',
    date: '2026-01-04', decoration: '',
    subject: 'wedding: ship v1.0',
    tags: ['life', 'merged'],
    body:
      "Ten years of pair programming, now under a legal contract. Vows compiled cleanly. " +
      "No rollback plan needed. Receipts: a small photo album, a bigger group chat, and a stupidly good playlist.",
    diffstat: {
      items: [
        { file: 'personal/wedding.md', added: 1, removed: 0, note: 'married' },
        { file: '.gitignore',          added: 1, removed: 0, note: 'cold feet' },
      ],
      summary: '1 person added, 0 removed',
    },
    g: ['| |  * ', 'c-main', 'c-stockunlock', 'c-married'],
  },

  { sec: "2025" },
  {
    sha: 'e1c4d22', fullSha: 'e1c4d22aa9fc10b7d3a64e8b8a8a8a8a8a8a8a8a',
    branch: 'married', author: 'Jake Ruth <jake@stockunlock.com>',
    date: '2025-10-02', decoration: '',
    subject: 'engaged: open PR  main',
    tags: ['life'],
    body:
      "Asked, got a yes. Probably the only merge I've ever been nervous about. " +
      "Rings fit. Parents cried. Schema migration forthcoming.",
    diffstat: {
      items: [
        { file: 'personal/wedding.md', added: 64, removed: 4, note: 'drafting vows' },
      ],
      summary: '1 relationship upgraded, zero regressions',
    },
    g: ['| |  * ', 'c-main', 'c-stockunlock', 'c-married'],
  },
  {
    sha: 'a1c0de0', fullSha: 'a1c0de0beefcafe1234567890abcdef012345678',
    branch: 'stockunlock', author: 'Jake Ruth <jake@stockunlock.com>',
    date: '2025-06-14', decoration: '',
    subject: 'AI-driven personal renaissance',
    tags: ['Opus 4.5 tipping point', 'Claude Code', 'Codex'],
    body:
      "Opus 4.5 was the inflection point. Driver in the driver's seat, not driven by the car. " +
      "AI now writes more code than I do  and I read every line before it ships. " +
      "Rebuilt half of SU this way without hiring.",
    diffstat: {
      items: [
        { file: 'tools/claude-code',  added: 1200, removed: 0, note: 'adopted' },
        { file: 'tools/codex',        added:  400, removed: 0, note: 'adopted' },
        { file: 'tools/cmux',         added:  150, removed: 0, note: 'adopted' },
      ],
      summary: '3 tools added, 1 mindset shifted',
    },
    g: ['|  * | ', 'c-main', 'c-stockunlock', 'c-married'],
  },

  { sec: "2024" },
  {
    sha: '9234f1a', fullSha: '9234f1abe77c1180cafe4d2b101f012bdeadbeef',
    branch: 'stockunlock', author: 'Jake Ruth <jake@stockunlock.com>',
    date: '2024-12-01', decoration: '',
    subject: 'stepped back to key-decisions-only',
    tags: ['maintenance mode', '3 FTE remain', 'profitable'],
    body:
      "Stall point. Hard numbers, hard conversations, right-sized the team. " +
      "Company continues with three full-time employees. Focus switched from " +
      "'grow at all costs' to 'operate profitably.' Both goals now hit.",
    diffstat: {
      items: [
        { file: 'ops/payroll', added: 0, removed: 5, note: '5 employees off' },
        { file: 'ops/oncall',  added: 0, removed: 1, note: 'jake removed' },
        { file: 'finance/',    added: 400, removed: 0, note: 'profitability' },
      ],
      summary: '5 employees removed (respectfully), profitability added',
    },
    g: ['|  * | ', 'c-main', 'c-stockunlock', 'c-married'],
  },
  {
    sha: 'a17d3ca', fullSha: 'a17d3caf0b0c1d2e3f4a5b6c7d8e9f0011223344',
    branch: 'stockunlock', author: 'Daniel Pronk <daniel@stockunlock.com>',
    date: '2024-08-12', decoration: '',
    subject: 'daniel  youtube full-time',
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
    g: ['|  * | ', 'c-main', 'c-stockunlock', 'c-married'],
  },

  { sec: "2023" },
  {
    sha: 'abc1234', fullSha: 'abc12349d1aa0f4c78ef5b2113a0b4f5c6d7e8f9',
    branch: 'stockunlock', author: 'Jake Ruth <jake@stockunlock.com>',
    date: '2023-05-19', decoration: '',
    subject: 'scale peak: 8 employees, thousands of customers',
    tags: ['8 FTE', '~$450K ARR', 'thousands of customers'],
    body:
      "Peak team of 8. Thousands of paying customers. ARR around $450K. " +
      "The market caught a cold  we caught a fever. Every decision felt like merging into prod.",
    diffstat: {
      items: [
        { file: 'ops/payroll',   added: 8, removed: 0, note: 'peak headcount' },
        { file: 'customers/',    added: 2800, removed: 40, note: 'net growth' },
        { file: 'ops/burn-rate', added: 1, removed: 0, note: 'climbing' },
      ],
      summary: '8 employees added, 0 removed  for now',
    },
    g: ['|  * | ', 'c-main', 'c-stockunlock', 'c-married'],
  },

  { sec: "2022" },
  {
    sha: '0f8d1cc', fullSha: '0f8d1cc7b2a9e034f58cd27e39a11cf482a7c91e',
    branch: 'stockunlock', author: 'Jake Ruth <jake@stockunlock.com>',
    date: '2022-02-28', decoration: '',
    subject: 'YC W22 demo day',
    tags: ['YC W22', '400 users in 2 weeks', '800-900 at close'],
    body:
      "Three minutes to explain why retail investors deserve pro tools. Slides tight, voice steady. " +
      "YC pushed us to launch before raising. 400 paying users in two weeks. 800-900 at seed close.",
    diffstat: {
      items: [
        { file: 'deck/demo-day.key', added: 1, removed: 0, note: 'presented' },
        { file: 'users/paying',      added: 400, removed: 0, note: 'in 2 weeks' },
      ],
      summary: '1 pitch delivered, 400 users acquired',
    },
    g: ['|  * | ', 'c-main', 'c-stockunlock', 'c-married'],
  },
  {
    sha: '3e5b192', fullSha: '3e5b192a11c3d55f67ab9921dd04e6faabbccdd1',
    branch: 'stockunlock', author: 'Jake Ruth <jake@stockunlock.com>',
    date: '2022-01-10', decoration: '',
    subject: 'raised $1.335M seed',
    tags: ['$500K YC SAFE', '$835K other', 'CEO + lead interviewer'],
    body:
      "SAFEs signed. Fund counter ticked. Felt less like winning and more like someone handing you a bigger backpack before a longer hike. " +
      "I led the YC interview myself. Nick was mostly there for the beer.",
    diffstat: {
      items: [
        { file: 'balance.json',   added: 1335000, removed: 0, note: 'seed round' },
        { file: 'cap-table.md',   added: 14,      removed: 0, note: 'investors' },
      ],
      summary: '$1.335M deposited, 0 walked away',
    },
    g: ['|  * | ', 'c-main', 'c-stockunlock', 'c-married'],
  },

  { sec: "2021" },
  {
    sha: '7d9e041', fullSha: '7d9e041c882a4bdde1fa43b2109876543210fedc',
    branch: 'stockunlock', author: 'Y Combinator <bot@yc>',
    date: '2021-12-05', decoration: '',
    subject: 'YC reaches out cold via LinkedIn',
    tags: ['cold outreach', 'before we even applied'],
    body:
      "An email. A calendar invite. A group chat melt-down in a two-person company. " +
      "They found us before we found them.",
    diffstat: {
      items: [
        { file: 'inbox/yc.eml', added: 1, removed: 0, note: 'cold intro' },
      ],
      summary: '1 inbound changed everything',
    },
    g: ['|  * | ', 'c-main', 'c-stockunlock', 'c-married'],
  },
  {
    sha: '2b4c887', fullSha: '2b4c8874a8b1f201a998c2b3e4d5f60711223344',
    branch: 'stockunlock', author: 'Jake Ruth <jake@stockunlock.com>',
    date: '2021-09-14', decoration: '',
    subject: 'stock-unlock: public launch',
    tags: ['first paying customer before dinner'],
    body:
      "v1 out the door. Screens, ratios, watchlists, a scary login button. " +
      "First paying customer before dinner. I ate dinner twice.",
    diffstat: {
      items: [
        { file: 'src/**/*',    added: 18420, removed: 0, note: 'initial ship' },
        { file: 'customers/',  added: 1,     removed: 0, note: 'first paying' },
      ],
      summary: '211 files changed, +18,420 insertions, 1 customer',
    },
    g: ['|  * | ', 'c-main', 'c-stockunlock', 'c-married'],
  },
  {
    sha: '22f0a91', fullSha: '22f0a918d2c3b4a5f6e7d8c9b0a1f2e3d4c5b6a7',
    branch: 'stockunlock', author: 'Jake Ruth <jake@stockunlock.com>',
    date: '2021-06-21', decoration: '',
    subject: "Merge branch 'pronk' into stock-unlock",
    merge: true,
    tags: ['merge', 'cofounders'],
    body:
      "Fast-forward not possible. Daniel and I had been drifting on two repos of the same idea. " +
      "Combined them. He brought the voice, I brought the backend. Conflicts resolved in favor of: shipping.",
    diffstat: {
      items: [
        { file: 'src/**/*',  added: 3120, removed: 200, note: 'merged' },
        { file: 'content/*', added: 900,  removed: 0,   note: 'daniel' },
      ],
      summary: '2 repos merged, 1 co-founder acquired',
    },
    g: ['|  *-. | ', 'c-main', 'c-stockunlock', 'c-married'],
  },
  {
    sha: '8fea115', fullSha: '8fea115c1d0b0f9e8d7c6b5a4f3e2d1c0b9a8877',
    branch: 'pronk', author: 'Daniel Pronk <daniel@pronk.yt>',
    date: '2021-04-02', decoration: 'pronk',
    subject: 'finally replies to the cold DM',
    tags: ['persistence'],
    body:
      "I'd built a Python screener and shipped it free on his forum. Kept emailing him weekly. " +
      "He replied after about six weeks to make me stop. We got on a call. I cracked a beer. He got it anyway.",
    diffstat: {
      items: [
        { file: 'inbox/daniel.eml', added: 2, removed: 0, note: 'first reply' },
      ],
      summary: '6 weeks of silence resolved',
    },
    g: ['|  |\\ \\| ', 'c-main', 'c-stockunlock', 'c-pronk', 'c-married'],
  },
  {
    sha: '1a2b3c4', fullSha: '1a2b3c4d5e6f708192a3b4c5d6e7f8091a2b3c4d',
    branch: 'stockunlock', author: 'Jake Ruth <jake@stockunlock.com>',
    date: '2021-02-11', decoration: '',
    subject: 'wrote the python screener, shipped it free',
    tags: ['free', 'weekend project'],
    body:
      "Open-sourced weekend project for retail investors on Daniel's forum. " +
      "Free. No ask. Just 'does this help?' The answer came back loud.",
    diffstat: {
      items: [
        { file: 'screener.py', added: 480, removed: 10, note: 'core logic' },
        { file: 'README.md',   added: 60,  removed: 0,  note: 'instructions' },
      ],
      summary: '480 lines given away, 1 cofounder earned',
    },
    g: ['|  * | | ', 'c-main', 'c-stockunlock', 'c-pronk', 'c-married'],
  },
  {
    sha: 'd5a9e42', fullSha: 'd5a9e42f0123456789abcdef0123456789abcdef',
    branch: 'oscar', author: 'Jake Ruth <jake@stockunlock.com>',
    date: '2021-06-30', decoration: 'oscar-health',
    subject: 'oscar-health: final commit',
    tags: ['left Oscar', 'brought Nick'],
    body:
      "Four years in health insurance. Learned how real systems get built and broken. " +
      "Thanked the team, shipped the last PR, closed the laptop on a Friday. Brought Nick with me.",
    diffstat: {
      items: [
        { file: 'offboarding.md', added: 1, removed: 0, note: 'exit' },
      ],
      summary: '1 exit, 1 co-founder recruited',
    },
    g: ['* |    ', 'c-oscar'],
  },

  { sec: "2020" },
  {
    sha: 'c0ffee1', fullSha: 'c0ffee1deadbeefcafebabef00dbaadf00df00df',
    branch: 'oscar', author: 'Jake Ruth <jake@stockunlock.com>',
    date: '2020-05-12', decoration: '',
    subject: 'senior engineer: own systems end-to-end',
    tags: ['Senior', 'pandemic pivots'],
    body:
      "Pandemic rewrote every roadmap. We rewrote ours twice. Became the person whose name lands " +
      "in the on-call rotation for the weird bugs. Declined the manager track  twice.",
    diffstat: {
      items: [
        { file: 'services/**/*', added: 3400, removed: 1100, note: 'rewrite' },
      ],
      summary: '54 files changed, 2 pivots absorbed',
    },
    g: ['* |    ', 'c-oscar'],
  },

  { sec: "2019" },
  {
    sha: '9badc0d', fullSha: '9badc0de112233445566778899aabbccddeeff00',
    branch: 'oscar', author: 'Jake Ruth <jake@stockunlock.com>',
    date: '2019-03-18', decoration: '',
    subject: 'mid-level: assigned problems, not tickets',
    tags: ['Associate  Mid'],
    body:
      "Went from 'assigned tickets' to 'assigned problems'. Much better. Also: built an over-engineered " +
      "internal chatbot from hackathon scraps with Peter. Started as a HipChat emoji pipeline. Got out of hand.",
    diffstat: {
      items: [
        { file: 'services/**/*', added: 980, removed: 310, note: 'real work' },
        { file: 'fun/chatbot',   added: 420, removed: 10,  note: 'with Peter' },
      ],
      summary: '1 level up, 1 friendship compiled',
    },
    g: ['* |    ', 'c-oscar'],
  },

  { sec: "2018" },
  {
    sha: 'unicy13', fullSha: 'unicy13abcde1234567890abcdef1234567890ab',
    branch: 'rubiks', author: 'Jake Ruth <jake@stockunlock.com>',
    date: '2018-06-22', decoration: '',
    subject: 'talent show: unicycle + rubiks cube',
    tags: ['Josh Kushner was there'],
    body:
      "Rode a unicycle while solving a Rubik's cube at the Oscar Health talent show. " +
      "Josh Kushner was in the audience. No regrets. Branch remains on disk  you never really close that one.",
    diffstat: {
      items: [
        { file: 'hobbies/unicycle.md', added: 14, removed: 0, note: 'field test' },
      ],
      summary: '1 cube solved, 0 dignity lost',
    },
    g: ['* |  *', 'c-oscar', 'c-rubiks'],
  },

  { sec: "2017" },
  {
    sha: '4e7a1b0', fullSha: '4e7a1b0aa55bb66cc77dd88ee99ff001122334455',
    branch: 'oscar', author: 'Jake Ruth <jake@stockunlock.com>',
    date: '2017-03-06', decoration: 'oscar-health',
    subject: 'start oscar-health (under Alan Warren)',
    tags: ['~50 engineers at join', '~150+ at exit'],
    body:
      "NYC. Joined under Alan Warren, who'd previously scaled Google Docs from two-three people to thousands. " +
      "New stack, new scale, new problems. First time touching systems where a bad deploy had downstream consequences measured in humans.",
    diffstat: {
      items: [
        { file: 'onboarding.md', added: 1, removed: 0, note: 'day one' },
      ],
      summary: '1 engineer added, 0 onboarding curve',
    },
    g: ['* |    ', 'c-oscar'],
  },

  { sec: "2016" },
  {
    sha: 'f00d721', fullSha: 'f00d72198af1cc003feedbeef0a0b0c0d0e0f010',
    branch: 'commercehub', author: 'Jake Ruth <jake@stockunlock.com>',
    date: '2016-12-22', decoration: 'commercehub',
    subject: "commercehub: final commit, off to NYC",
    tags: ['interview squad', 'micro-services'],
    body:
      "Three years of e-commerce plumbing. Learned what production actually means. " +
      "Learned to read stack traces like poetry. Took down production once as an intern  manager stood up and said " +
      "'that wasn't your fault, you shouldn't have had access to that button.' That sentence shaped how I think about systems.",
    diffstat: {
      items: [
        { file: 'offboarding.md', added: 1, removed: 0, note: 'exit' },
      ],
      summary: '3 years banked, 1 prod takedown survived',
    },
    g: ['*     ', 'c-commercehub'],
  },
  {
    sha: '7ce99da', fullSha: '7ce99da991122334455667788aabbccddeeff001',
    branch: 'youni', author: 'Jake Ruth <jake@stockunlock.com>',
    date: '2016-04-10', decoration: '',
    subject: "Merge branch 'youni' (project ended)",
    merge: true,
    tags: ['React Native v0.13', 'thousands of signups', 'shut down'],
    body:
      "Youni wound down. Great people, hard market. Couldn't solve cold-start. " +
      "Dragged the lessons back into main  you can't un-learn 'ship weekly or perish.'",
    diffstat: {
      items: [
        { file: 'projects/youni/**', added: 120, removed: 2300, note: 'retired' },
      ],
      summary: '1 startup retired, 1 founder matured',
    },
    g: ['*-.    ', 'c-commercehub', 'c-youni'],
  },

  { sec: "2015" },
  {
    sha: 'b1e7a03', fullSha: 'b1e7a031a2b3c4d5e6f708192a3b4c5d6e7f8090',
    branch: 'youni', author: 'Jake Ruth <jake@stockunlock.com>',
    date: '2015-09-02', decoration: 'youni',
    subject: 'youni: co-building a campus social thing',
    tags: ['CTO', 'iOS', 'React Native'],
    body:
      "Side hustle that felt like a main hustle. React Native v0.13, late nights, group chats that never slept. " +
      "Didn't win the market. Won the reps.",
    diffstat: {
      items: [
        { file: 'app/**/*', added: 4800, removed: 120, note: 'initial build' },
      ],
      summary: '1 startup started, zero excuses later',
    },
    g: ['| *    ', 'c-commercehub', 'c-youni'],
  },
  {
    sha: 'a1b2c3d', fullSha: 'a1b2c3d4e5f6071829aabbccddeeff001122334',
    branch: 'main', author: 'Jake Ruth <jake@stockunlock.com>',
    date: '2015-05-17', decoration: '',
    subject: 'B.S. CS + Applied Math  SUNY Albany',
    tags: ['3.88 GPA', "Dean's List every semester"],
    body:
      "Double major shipped. 3.88 GPA, Dean's List every semester. ACM chapter: president. " +
      "Most useful class: the one that taught me I could teach myself the rest.",
    diffstat: {
      items: [
        { file: 'education/diploma.pdf', added: 120, removed: 0, note: 'earned' },
      ],
      summary: '2 majors completed, 1 career compiled',
    },
    g: ['*     ', 'c-main'],
  },

  { sec: "2014" },
  {
    sha: '5u1ff1e', fullSha: '5u1ff1ea1b2c3d4e5f6789abcdeffedcba987654',
    branch: 'main', author: 'Jake Ruth <jake@stockunlock.com>',
    date: '2014-04-01', decoration: '',
    subject: 'ACM @ SUNY Albany  elected president',
    tags: ['took over a failing club', 'recruited 20+'],
    body:
      "Took over a failing club. Recruited 20+ members. Ran hackathons, pizza nights, resume clinics. " +
      "Organized the Tekkapalooza field trip where I handed my resume to CommerceHub. Learn more engineering from organizing engineers than from most coursework.",
    diffstat: {
      items: [
        { file: 'clubs/acm/*', added: 80, removed: 0, note: 'rebuilt' },
      ],
      summary: '20+ members recruited, 1 career launched',
    },
    g: ['*     ', 'c-main'],
  },
  {
    sha: 'cube0fe', fullSha: 'cube0fe111222333444555666777888999aaabbb',
    branch: 'rubiks', author: 'Jake Ruth <jake@stockunlock.com>',
    date: '2014-02-14', decoration: '',
    subject: "peak: 13.95s avg, 3x3",
    tags: ['Northeast US competitor', 'Nationals'],
    body:
      "Competed 2008-2014 at Northeast US and Nationals. 3x3 average: 13.95 seconds. " +
      "The patience tax this cost still pays dividends.",
    diffstat: {
      items: [
        { file: 'hobbies/rubiks.md', added: 14, removed: 0, note: 'peak avg' },
      ],
      summary: '~14 seconds per cube, 6 years per reflex',
    },
    g: ['*-.    ', 'c-main', 'c-rubiks'],
  },

  { sec: "2013" },
  {
    sha: 'c0de013', fullSha: 'c0de013abcdef1234567890fedcba0987654321f',
    branch: 'commercehub', author: 'Jake Ruth <jake@stockunlock.com>',
    date: '2013-11-04', decoration: 'commercehub',
    subject: 'first day: commercehub intern (became FT)',
    tags: ['Groovy/Grails', 'React pre-hooks', 'Java'],
    body:
      "First real codebase. First real deploy. First real 'don't do that in prod' talk. " +
      "Agile team of ten, micro-service architecture, interview squad participant. Career clock starts ticking now.",
    diffstat: {
      items: [
        { file: 'onboarding.md', added: 1, removed: 0, note: 'day one' },
      ],
      summary: '1 engineer added, career started',
    },
    g: ['*     ', 'c-commercehub'],
  },
  {
    sha: 'b1rthff', fullSha: 'b1rthff0000000000000000000000000000000000',
    branch: 'main', author: 'Jake Ruth <jake@stockunlock.com>',
    date: '2013-01-01', decoration: '',
    subject: 'git init  start learning to code',
    tags: ['empty repo, curious brain'],
    body:
      "Genesis commit. ~13 years later the repo has branches for a fintech, a health insurer, a degree, " +
      "a wedding, and a Rubik's cube.",
    diffstat: {
      items: [
        { file: 'README.md', added: 1, removed: 0, note: 'hello world' },
      ],
      summary: '1 file added, 1 life started',
    },
    g: ['*     ', 'c-main'],
  },

  { sec: "2011" },
  {
    sha: 'apcs011', fullSha: 'apcs0111111222223333344444555556666677777',
    branch: 'main', author: 'Jake Ruth <jake@stockunlock.com>',
    date: '2011-09-06', decoration: '',
    subject: 'AP CS instead of AP Calc  fell in love week 1',
    tags: ['pivotal'],
    body:
      "Needed a math credit senior year. Refused to take AP Calculus. Ms. Nalbandian mentioned she taught AP Computer Science. " +
      "Asked if it counted. She said yes. Took it to avoid Calc. Fell in love with code in the first week. That sideways pivot became my career.",
    diffstat: {
      items: [
        { file: 'school/schedule.txt', added: 1, removed: 1, note: 'AP CS ins, AP Calc out' },
      ],
      summary: '1 sideways pivot, 13 years of consequences',
    },
    g: ['*     ', 'c-main'],
  },

  { sec: "2008" },
  {
    sha: '2008cub', fullSha: '2008cub1111222233334444555566667777888899',
    branch: 'rubiks', author: 'Jake Ruth <jake@stockunlock.com>',
    date: '2008-09-01', decoration: 'rubiks-cube',
    subject: 'rubiks-cube: branch created',
    tags: ['first cube'],
    body:
      "A cube, a stopwatch, a stubborn streak. Competitive speedcubing for years.",
    diffstat: {
      items: [
        { file: 'hobbies/rubiks.md', added: 1, removed: 0, note: 'new hobby' },
      ],
      summary: '1 obsession started',
    },
    g: ['| *   ', 'c-main', 'c-rubiks'],
  },
];

/* ------------------------------------------------------------------
 * JUMP-TO years (dynamic from commits)
 * ------------------------------------------------------------------ */
const JUMP_YEARS = [
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

/* ==================================================================
 * DOM REFS
 * ================================================================== */
const $ = (id) => document.getElementById(id);
const graphEl     = $('graph');
const branchUl    = $('branchList');
const fileTreeEl  = $('fileTree');
const jumpListEl  = $('jumpList');
const searchInput = $('searchInput');
const searchHint  = $('searchHint');
const paneCount   = $('paneCount');
const graphScroller = $('graphScroller');

const detailEmpty   = $('detailEmpty');
const detailContent = $('detailContent');
const detailHash    = $('detailHash');
const detailDecor   = $('detailDecoration');
const detailAuthor  = $('detailAuthor');
const detailDate    = $('detailDate');
const detailRel     = $('detailRel');
const detailBranch  = $('detailBranch');
const detailSubject = $('detailSubject');
const detailBody    = $('detailBody');
const detailDiff    = $('detailDiffstat');
const detailMeta    = $('detailMeta');
const detailPinHint = $('detailPinHint');

const graphPane = $('graphPane');
const mdPane    = $('mdPane');
const mdBody    = $('mdBody');
const mdBreadcrumb = $('mdBreadcrumb');
const tabLog    = $('tabLog');
const tabMd     = $('tabMd');
const btnBack   = $('btnBackToLog');
const statusView = $('statusView');
const cmdText   = $('cmdText');

/* ==================================================================
 * STATE
 * ================================================================== */
let activeFilter = null;
let pinnedSha    = null;
let cursorIdx    = -1;
let currentView  = 'log';   // 'log' | 'md'
let currentMd    = 'README.md';

const commitRows = COMMITS.filter(c => !c.sec);

/* ==================================================================
 * RENDER
 * ================================================================== */
function escape(s) {
  return String(s).replace(/[&<>"']/g, ch => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[ch]));
}

function glyphHTML(glyphDef) {
  if (!glyphDef) return '';
  const [template, ...cols] = glyphDef;
  let colorIdx = 0;
  let out = '';
  for (let i = 0; i < template.length; i++) {
    const ch = template[i];
    if (/[|*\\/.\-]/.test(ch)) {
      const cls = cols[colorIdx] || cols[cols.length - 1] || 'c-main';
      const extra = ch === '*' ? ' star' : '';
      out += `<span class="${cls}${extra}">${ch}</span>`;
      if (ch === '|' || ch === '*' || ch === '\\' || ch === '/') colorIdx++;
    } else {
      out += ch;
    }
  }
  return out;
}

function renderDecoration(commit) {
  if (!commit.decoration) return '';
  const parts = commit.decoration.split(',').map(s => s.trim());
  return parts.map(p => {
    if (p.startsWith('HEAD')) return `<span class="head">${escape(p)}</span>`;
    if (p.startsWith('origin/') || p.startsWith('upstream/')) return `<span class="remote-tag">${escape(p)}</span>`;
    return `<span class="branch-tag">${escape(p)}</span>`;
  }).join(' ');
}

function renderGraph() {
  const rows = COMMITS.map((c, idx) => {
    if (c.sec) {
      const jump = JUMP_YEARS.find(j => j.year === c.sec);
      const note = jump ? jump.label : '';
      return `<div class="year-divider" data-year="${c.sec}" id="year-${c.sec}">
        <span class="year-tag">${c.sec}</span>
        <span class="year-line"></span>
        <span class="year-note">${escape(note)}</span>
      </div>`;
    }
    const mergeCls = c.merge ? ' merge' : '';
    const headCls  = c.decoration && c.decoration.startsWith('HEAD') ? ' head' : '';
    return `
      <div class="row${mergeCls}${headCls}" data-sha="${c.sha}" data-branch="${c.branch}" data-idx="${idx}">
        <span class="glyph">${glyphHTML(c.g)}</span>
        <span class="hash">${c.sha}</span>
        <span class="decoration">${renderDecoration(c)}</span>
        <span class="date">${c.date}</span>
        <span class="msg">${escape(c.subject)}</span>
      </div>`;
  }).join('\n');
  graphEl.innerHTML = rows;
  paneCount.textContent = `${commitRows.length} commits  9 branches`;
}

function renderBranchList() {
  branchUl.innerHTML = BRANCHES.map(b => `
    <li data-branch="${b.id}">
      <span class="branch-swatch" style="background: var(--${b.color}); color: var(--${b.color})"></span>
      <span class="branch-name">${escape(b.name)}</span>
      <span class="branch-head${b.head.startsWith('HEAD') ? ' on' : ''}">${escape(b.head || b.years)}</span>
    </li>
  `).join('');
}

function renderFileTree() {
  const files = Object.keys(MD_FILES);
  fileTreeEl.innerHTML = `
    <li class="folder-row"><span class="file-icon folder">&#9660;</span> jakeruth/life/</li>
    <ul>
      ${files.map(f => `
        <li class="file-row" data-file="${escape(f)}">
          <span class="file-icon md">M</span> ${escape(f)}
        </li>
      `).join('')}
      <li><span class="file-icon">x</span> <span style="color:var(--fg-muted)">.gitignore</span></li>
    </ul>
  `;
}

function renderJumpList() {
  jumpListEl.innerHTML = JUMP_YEARS.map(j => `
    <li data-year="${j.year}">
      <span class="jump-year">${j.year}</span>
      <span class="jump-label">${escape(j.label)}</span>
    </li>
  `).join('');
}

/* ==================================================================
 * DETAIL PANE
 * ================================================================== */
function relativeDate(iso) {
  const d = new Date(iso);
  const now = new Date('2026-04-20');
  const diff = now - d;
  const yrs = diff / (1000 * 60 * 60 * 24 * 365);
  if (yrs < 0.08)  return 'days ago';
  if (yrs < 1)     return Math.round(yrs * 12) + ' months ago';
  return yrs.toFixed(1) + ' years ago';
}

function renderDiffstat(diffstat) {
  if (!diffstat) return '';
  const { items = [], summary = '' } = diffstat;
  const maxBar = 20;
  const maxTotal = Math.max(1, ...items.map(i => (i.added || 0) + (i.removed || 0)));
  const lines = items.map(i => {
    const total = (i.added || 0) + (i.removed || 0);
    const scale = total === 0 ? 0 : Math.max(1, Math.round((total / maxTotal) * maxBar));
    const addBars = total === 0 ? 0 : Math.max(0, Math.round((i.added / total) * scale));
    const remBars = scale - addBars;
    const bars = '<span class="added">' + '+'.repeat(addBars) + '</span>' +
                 '<span class="removed">' + '-'.repeat(remBars) + '</span>';
    const stat = `<span class="added">+${i.added}</span> <span class="removed">-${i.removed}</span>`;
    const note = i.note ? ` <span style="color:var(--fg-muted)">// ${escape(i.note)}</span>` : '';
    return `<div class="diffstat-line">
      <span class="dfile">${escape(i.file)}${note}</span>
      <span class="dbars">${stat} ${bars}</span>
    </div>`;
  }).join('');
  return lines + (summary ? `<div class="dsummary">${escape(summary)}</div>` : '');
}

function showDetail(sha, pinned) {
  const c = COMMITS.find(x => x.sha === sha);
  if (!c || c.sec) return;
  detailEmpty.hidden = true;
  detailContent.hidden = false;

  const branch = BRANCHES.find(b => b.id === c.branch);
  detailHash.textContent = c.fullSha;
  detailDecor.innerHTML  = c.decoration ? renderDecoration(c) : '';
  detailAuthor.textContent = c.author;
  detailDate.textContent   = c.date;
  detailRel.textContent    = '(' + relativeDate(c.date) + ')';
  detailBranch.innerHTML   = branch
    ? `<span style="color: var(--${branch.color}); font-weight: 600">${escape(branch.name)}</span>`
    : escape(c.branch);
  detailSubject.textContent = c.subject;
  detailBody.innerHTML   = `<p>${escape(c.body || '').replace(/\n\n+/g, '</p><p>')}</p>`;
  detailDiff.innerHTML   = renderDiffstat(c.diffstat);

  detailMeta.innerHTML = (c.tags || []).map(t => `<span class="meta-tag">${escape(t)}</span>`).join('');

  detailPinHint.innerHTML = pinned
    ? `<span class="detail-pinned">pinned</span> click commit or press <kbd>Enter</kbd> to un-pin`
    : `// click or press <kbd>Enter</kbd> to pin`;
}

function clearDetail() {
  detailEmpty.hidden = false;
  detailContent.hidden = true;
}

/* ==================================================================
 * CURSOR / KEYBOARD
 * ================================================================== */
function setCursor(idx, scroll = true) {
  document.querySelectorAll('.row.cursor').forEach(r => r.classList.remove('cursor'));
  if (idx < 0 || idx >= commitRows.length) return;
  cursorIdx = idx;
  const sha = commitRows[idx].sha;
  const row = document.querySelector(`.row[data-sha="${sha}"]`);
  if (row) {
    row.classList.add('cursor');
    if (scroll) {
      row.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
    if (!pinnedSha) showDetail(sha, false);
  }
}

function moveCursor(delta) {
  const next = Math.min(commitRows.length - 1, Math.max(0, cursorIdx + delta));
  setCursor(next);
}

/* ==================================================================
 * FILTERS / SEARCH
 * ================================================================== */
function applyFilter(branchId) {
  activeFilter = branchId;
  $('statusFilter').textContent = 'filter: ' + (branchId || 'none');

  document.querySelectorAll('.row').forEach(r => {
    if (!branchId) { r.classList.remove('dim'); return; }
    const show = r.dataset.branch === branchId;
    r.classList.toggle('dim', !show);
  });
  branchUl.querySelectorAll('li').forEach(li => {
    li.classList.toggle('active', li.dataset.branch === branchId);
  });
}

function applySearch(query) {
  const q = query.trim().toLowerCase();
  let matches = 0;
  document.querySelectorAll('.row').forEach(r => {
    const sha = r.dataset.sha;
    const c = COMMITS.find(x => x.sha === sha);
    if (!c) return;
    const hay = (c.subject + ' ' + (c.body || '') + ' ' + (c.tags || []).join(' ') + ' ' + c.sha + ' ' + c.author).toLowerCase();
    const msgEl = r.querySelector('.msg');
    if (!q) {
      r.classList.remove('dim', 'hit-match');
      msgEl.textContent = c.subject;
      return;
    }
    if (hay.includes(q)) {
      matches++;
      r.classList.remove('dim');
      r.classList.add('hit-match');
      // highlight
      const subj = c.subject;
      const idx = subj.toLowerCase().indexOf(q);
      if (idx >= 0) {
        msgEl.innerHTML = escape(subj.slice(0, idx)) +
          '<mark>' + escape(subj.slice(idx, idx + q.length)) + '</mark>' +
          escape(subj.slice(idx + q.length));
      } else {
        msgEl.textContent = subj;
      }
    } else {
      r.classList.add('dim');
      r.classList.remove('hit-match');
      msgEl.textContent = c.subject;
    }
  });
  searchHint.textContent = q ? `${matches} match${matches === 1 ? '' : 'es'}` : '';
}

/* ==================================================================
 * MD PREVIEW
 * ================================================================== */
function showMdFile(name) {
  if (!MD_FILES[name]) return;
  currentMd = name;
  const md = MD_FILES[name];

  // Configure marked: GFM tables, line-break handling.
  if (typeof marked !== 'undefined') {
    marked.setOptions({ gfm: true, breaks: false, headerIds: false, mangle: false });
    mdBody.innerHTML = marked.parse(md);
  } else {
    // Fallback: just paste preformatted text
    mdBody.innerHTML = '<pre>' + escape(md) + '</pre>';
  }

  mdBreadcrumb.innerHTML = `jakeruth/life  <span class="crumb-current">${escape(name)}</span>`;
  fileTreeEl.querySelectorAll('.file-row').forEach(li => {
    li.classList.toggle('active', li.dataset.file === name);
  });

  setView('md');
  $('mdScroller').scrollTop = 0;
}

function setView(view) {
  currentView = view;
  if (view === 'md') {
    graphPane.hidden = true;
    mdPane.hidden = false;
    tabLog.classList.remove('active');
    tabMd.classList.add('active');
    tabMd.textContent = currentMd;
    statusView.textContent = 'view: ' + currentMd;
    cmdText.textContent = `cat ${currentMd} | glow`;
  } else {
    graphPane.hidden = false;
    mdPane.hidden = true;
    tabLog.classList.add('active');
    tabMd.classList.remove('active');
    tabMd.textContent = currentMd;
    statusView.textContent = 'view: log';
    cmdText.textContent = 'git log --graph --oneline --all --decorate';
  }
}

/* ==================================================================
 * EVENTS
 * ================================================================== */
graphEl.addEventListener('mouseover', (e) => {
  const row = e.target.closest('.row');
  if (!row) return;
  if (pinnedSha) return;
  showDetail(row.dataset.sha, false);
});

graphEl.addEventListener('click', (e) => {
  const row = e.target.closest('.row');
  if (!row) return;
  const sha = row.dataset.sha;
  // set cursor to this row
  const idx = commitRows.findIndex(c => c.sha === sha);
  if (idx >= 0) setCursor(idx, false);
  if (pinnedSha === sha) {
    pinnedSha = null;
    document.querySelectorAll('.row.active').forEach(r => r.classList.remove('active'));
    // keep detail visible but mark as not pinned
    showDetail(sha, false);
  } else {
    document.querySelectorAll('.row.active').forEach(r => r.classList.remove('active'));
    pinnedSha = sha;
    row.classList.add('active');
    showDetail(sha, true);
  }
});

branchUl.addEventListener('click', (e) => {
  const li = e.target.closest('li');
  if (!li) return;
  const id = li.dataset.branch;
  applyFilter(activeFilter === id ? null : id);
});

fileTreeEl.addEventListener('click', (e) => {
  const li = e.target.closest('.file-row');
  if (!li) return;
  showMdFile(li.dataset.file);
});

jumpListEl.addEventListener('click', (e) => {
  const li = e.target.closest('li');
  if (!li) return;
  if (currentView !== 'log') setView('log');
  const el = document.getElementById('year-' + li.dataset.year);
  if (el) el.scrollIntoView({ block: 'start', behavior: 'smooth' });
});

tabLog.addEventListener('click', () => setView('log'));
tabMd.addEventListener('click', () => setView('md'));
btnBack.addEventListener('click', () => setView('log'));

searchInput.addEventListener('input', (e) => applySearch(e.target.value));
searchInput.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    searchInput.value = '';
    applySearch('');
    searchInput.blur();
    e.preventDefault();
  }
});

document.addEventListener('keydown', (e) => {
  // Don't steal keys from the search input or md view typing
  const inInput = document.activeElement === searchInput;

  if (e.key === 'Escape') {
    pinnedSha = null;
    document.querySelectorAll('.row.active').forEach(r => r.classList.remove('active'));
    applyFilter(null);
    searchInput.value = '';
    applySearch('');
    if (!inInput) clearDetail();
    return;
  }

  if (inInput) return;

  if (e.key === '/') {
    e.preventDefault();
    if (currentView !== 'log') setView('log');
    searchInput.focus();
    searchInput.select();
    return;
  }

  if (currentView === 'md') {
    if (e.key === 'g' || e.key === 'o' || e.key === 'Escape') {
      setView('log');
    }
    return;
  }

  if (e.key === 'j' || e.key === 'ArrowDown') {
    e.preventDefault();
    if (cursorIdx < 0) setCursor(0);
    else moveCursor(1);
    return;
  }
  if (e.key === 'k' || e.key === 'ArrowUp') {
    e.preventDefault();
    if (cursorIdx < 0) setCursor(0);
    else moveCursor(-1);
    return;
  }
  if (e.key === 'Enter') {
    e.preventDefault();
    if (cursorIdx >= 0) {
      const sha = commitRows[cursorIdx].sha;
      if (pinnedSha === sha) {
        pinnedSha = null;
        document.querySelectorAll('.row.active').forEach(r => r.classList.remove('active'));
      } else {
        document.querySelectorAll('.row.active').forEach(r => r.classList.remove('active'));
        pinnedSha = sha;
        const row = document.querySelector(`.row[data-sha="${sha}"]`);
        if (row) row.classList.add('active');
        showDetail(sha, true);
      }
    }
    return;
  }
  if (e.key === 'o') {
    e.preventDefault();
    showMdFile('README.md');
    return;
  }
  if (e.key === 'g') {
    e.preventDefault();
    graphScroller.scrollTop = 0;
    setCursor(0);
    return;
  }
  if (e.key === 'G') {
    e.preventDefault();
    setCursor(commitRows.length - 1);
    return;
  }
});

/* ==================================================================
 * BOOT
 * ================================================================== */
renderBranchList();
renderGraph();
renderFileTree();
renderJumpList();

// Prime detail with HEAD on load
const head = COMMITS.find(c => c.decoration && c.decoration.startsWith('HEAD'));
if (head) showDetail(head.sha, false);

// Default cursor to HEAD row (first commit)
setCursor(0, false);

setView('log');
