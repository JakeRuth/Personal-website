/* jakeruth/life — git log --graph
 * Static-first visualization. Commits ordered newest → oldest (top → bottom).
 * Each commit carries a pre-rendered "glyph" column (ASCII graph art) so the
 * graph reads authentically even without JS-drawn SVG lines.
 */

const BRANCHES = [
  { id: 'next',         name: 'next-chapter',             color: 'c-next',        head: 'HEAD -> next/main', years: '2026 –' },
  { id: 'main',         name: 'main',                     color: 'c-main',        head: '',                  years: '2013 –' },
  { id: 'stockunlock',  name: 'stock-unlock',             color: 'c-stockunlock', head: 'origin/stock-unlock', years: '2021 – 2026' },
  { id: 'pronk',        name: 'pronk (co-founder branch)',color: 'c-pronk',       head: '',                  years: '2021' },
  { id: 'oscar',        name: 'oscar-health',             color: 'c-oscar',       head: '',                  years: '2017 – 2021' },
  { id: 'youni',        name: 'youni',                    color: 'c-youni',       head: '',                  years: '2015 – 2016' },
  { id: 'commercehub',  name: 'commercehub',              color: 'c-commercehub', head: '',                  years: '2013 – 2016' },
  { id: 'rubiks',       name: 'rubiks-cube',              color: 'c-rubiks',      head: '',                  years: '2008 – 2014' },
  { id: 'married',      name: 'married',                  color: 'c-married',     head: '',                  years: '2025 – 2026' },
];

// Commits in newest → oldest order.
// `g` field = pre-rendered glyph column for the graph gutter.
// Colors in the glyph are applied via <span class="c-xxx"> wrappers built at render time.
const COMMITS = [
  // ---- next-chapter ----
  {
    sha: 'c0d3baf', fullSha: 'c0d3baf8e27a1d33f9b0c5e7e1a9a2b4f7c8d99e',
    branch: 'next', author: 'Jake Ruth <jake@stockunlock.com>',
    date: '2026-04-20', decoration: 'HEAD -> next/main',
    subject: "the driver's seat, chapter II",
    body: [
      "Stock Unlock is humming as a profitable side business — not the day job anymore.",
      "Opening a new branch. Undecided on upstream. Could be agents, could be tools for",
      "builders, could be something dumber and more fun. What I do know: the driver",
      "stays in the driver's seat. AI is the car, not the chauffeur.",
    ].join('\n'),
    diffstat: { files: 1, added: 1337, removed: 0, text: 'README.md' },
    g: [' * ', 'c-next'],
  },
  { sec: "/* === 2026 === */" },

  {
    sha: '5741a8c', fullSha: '5741a8c0b2e1f3d49a8b76c2d5e7f01122334455',
    branch: 'stockunlock', author: 'Jake Ruth <jake@stockunlock.com>',
    date: '2026-02-11', decoration: 'origin/stock-unlock',
    subject: 'scaling stabilized at profit',
    body: [
      "Team right-sized. Unit economics sing. Thousands of investors running screens,",
      "watchlists, DCFs daily. Built for the patient crowd and it stuck.",
      "Stepping back from day-to-day. Daniel keeps the YT engine on.",
    ].join('\n'),
    diffstat: { files: 6, added: 412, removed: 1_180, text: 'payroll/*, on-call/*' },
    g: ['|  * ', 'c-main', 'c-stockunlock'],
  },

  {
    sha: '8b3a7ef', fullSha: '8b3a7ef12d99cc04a51be3d2f2340987a6e5f3c1',
    branch: 'married', author: 'Jake Ruth <jake@stockunlock.com>',
    date: '2026-01-04', decoration: '',
    subject: 'wedding: ship v1.0',
    body: [
      "Ten years of pair programming, now under a legal contract.",
      "Vows compiled cleanly. No rollback plan needed. Receipts: a tiny photo album,",
      "a bigger group chat, and a stupidly good playlist.",
    ].join('\n'),
    diffstat: { files: 2, added: 2, removed: 0, text: 'personal/wedding.md, .gitignore' },
    g: ['| |  * ', 'c-main', 'c-stockunlock', 'c-married'],
  },

  { sec: "/* === 2025 === */" },
  {
    sha: 'e1c4d22', fullSha: 'e1c4d22aa9fc10b7d3a64e8b8a8a8a8a8a8a8a8a',
    branch: 'married', author: 'Jake Ruth <jake@stockunlock.com>',
    date: '2025-10-02', decoration: '',
    subject: 'engaged: open PR -> main',
    body: [
      "Asked, got a yes. Probably the only merge I've ever been nervous about.",
      "Rings fit. Parents cried. Schema migration forthcoming.",
    ].join('\n'),
    diffstat: { files: 1, added: 64, removed: 4, text: 'personal/wedding.md' },
    g: ['| |  * ', 'c-main', 'c-stockunlock', 'c-married'],
  },

  {
    sha: '9234f1a', fullSha: '9234f1abe77c1180cafe4d2b101f012bdeadbeef',
    branch: 'stockunlock', author: 'Daniel Pronk <daniel@stockunlock.com>',
    date: '2024-08-12', decoration: '',
    subject: 'daniel → youtube full-time',
    body: [
      "Daniel goes all-in on the YouTube channel / education side.",
      "We keep the product tight. Division of labor that actually labors.",
    ].join('\n'),
    diffstat: { files: 3, added: 220, removed: 80, text: 'content/*.md' },
    g: ['|  * | ', 'c-main', 'c-stockunlock', 'c-married'],
  },

  { sec: "/* === 2024 === */" },
  {
    sha: 'a17d3ca', fullSha: 'a17d3caf0b0c1d2e3f4a5b6c7d8e9f0011223344',
    branch: 'stockunlock', author: 'Jake Ruth <jake@stockunlock.com>',
    date: '2024-03-30', decoration: '',
    subject: 'refactor: SU into a lean profitable side-biz',
    body: [
      "Trimmed what didn't compound. Kept the parts customers actually hug.",
      "Profitable, sustainable, optional. Rare combo; protect it.",
    ].join('\n'),
    diffstat: { files: 28, added: 900, removed: 3_200, text: 'src/**/*' },
    g: ['|  * | ', 'c-main', 'c-stockunlock', 'c-married'],
  },

  { sec: "/* === 2023 === */" },
  {
    sha: 'abc1234', fullSha: 'abc12349d1aa0f4c78ef5b2113a0b4f5c6d7e8f9',
    branch: 'stockunlock', author: 'Jake Ruth <jake@stockunlock.com>',
    date: '2023-05-19', decoration: '',
    subject: 'scaling pains, pivot convos',
    body: [
      "Peak team of 8. The market caught a cold; we caught a fever.",
      "Hard conversations. Hard numbers. Every decision felt like merging into prod.",
    ].join('\n'),
    diffstat: { files: 14, added: 120, removed: 560, text: 'ops/*, hr/*' },
    g: ['|  * | ', 'c-main', 'c-stockunlock', 'c-married'],
  },

  { sec: "/* === 2022 === */" },
  {
    sha: '0f8d1cc', fullSha: '0f8d1cc7b2a9e034f58cd27e39a11cf482a7c91e',
    branch: 'stockunlock', author: 'Jake Ruth <jake@stockunlock.com>',
    date: '2022-02-28', decoration: '',
    subject: 'YC W22 demo day',
    body: [
      "3 minutes to explain why retail investors deserve pro tools.",
      "Slides tight, voice steady. Walked off stage and didn't remember a word of it.",
    ].join('\n'),
    diffstat: { files: 1, added: 60, removed: 2, text: 'deck/demo-day.key' },
    g: ['|  * | ', 'c-main', 'c-stockunlock', 'c-married'],
  },
  {
    sha: '3e5b192', fullSha: '3e5b192a11c3d55f67ab9921dd04e6faabbccdd1',
    branch: 'stockunlock', author: 'Jake Ruth <jake@stockunlock.com>',
    date: '2022-01-10', decoration: '',
    subject: 'raised $1.335M seed',
    body: [
      "SAFEs signed. Fund counter ticked. Felt less like winning and more like",
      "someone handing you a bigger backpack before a longer hike.",
    ].join('\n'),
    diffstat: { files: 2, added: 1335000, removed: 0, text: 'balance.json, cap-table.md' },
    g: ['|  * | ', 'c-main', 'c-stockunlock', 'c-married'],
  },

  { sec: "/* === 2021 === */" },
  {
    sha: '7d9e041', fullSha: '7d9e041c882a4bdde1fa43b2109876543210fedc',
    branch: 'stockunlock', author: 'Y Combinator <bot@yc>',
    date: '2021-12-05', decoration: '',
    subject: 'YC reaches out',
    body: [
      "An email. A calendar invite. A group chat melt-down in a 2-person company.",
    ].join('\n'),
    diffstat: { files: 1, added: 1, removed: 0, text: 'inbox/yc.eml' },
    g: ['|  * | ', 'c-main', 'c-stockunlock', 'c-married'],
  },
  {
    sha: '2b4c887', fullSha: '2b4c8874a8b1f201a998c2b3e4d5f60711223344',
    branch: 'stockunlock', author: 'Jake Ruth <jake@stockunlock.com>',
    date: '2021-09-14', decoration: '',
    subject: 'stock-unlock: public launch',
    body: [
      "v1 out the door. Screens, ratios, watchlists, a scary login button.",
      "First paying customer before dinner. I ate dinner twice.",
    ].join('\n'),
    diffstat: { files: 211, added: 18_420, removed: 0, text: 'src/**/*' },
    g: ['|  * | ', 'c-main', 'c-stockunlock', 'c-married'],
  },
  {
    sha: '22f0a91', fullSha: '22f0a918d2c3b4a5f6e7d8c9b0a1f2e3d4c5b6a7',
    branch: 'stockunlock', author: 'Jake Ruth <jake@stockunlock.com>',
    date: '2021-06-21', decoration: '',
    subject: "Merge branch 'pronk' into stock-unlock",
    merge: true,
    body: [
      "Fast-forward not possible. Daniel and I had been drifting on two repos of the",
      "same idea. Combined them. He brought the voice, I brought the backend.",
      "Conflicts resolved in favor of: shipping.",
    ].join('\n'),
    diffstat: { files: 47, added: 3_120, removed: 200, text: 'src/**/*, content/*' },
    g: ['|  *-. | ', 'c-main', 'c-stockunlock', 'c-married'],
  },
  {
    sha: '8fea115', fullSha: '8fea115c1d0b0f9e8d7c6b5a4f3e2d1c0b9a8877',
    branch: 'pronk', author: 'Daniel Pronk <daniel@pronk.yt>',
    date: '2021-04-02', decoration: 'pronk',
    subject: 'finally replies to the cold DM',
    body: [
      "I'd built a little python screener and shipped it for free on his forum.",
      "He replies. We get on a call. I talk too fast. He gets it anyway.",
    ].join('\n'),
    diffstat: { files: 1, added: 2, removed: 0, text: 'inbox/daniel.eml' },
    g: ['|  |\\ \\| ', 'c-main', 'c-stockunlock', 'c-pronk', 'c-married'],
  },
  {
    sha: '1a2b3c4', fullSha: '1a2b3c4d5e6f708192a3b4c5d6e7f8091a2b3c4d',
    branch: 'stockunlock', author: 'Jake Ruth <jake@stockunlock.com>',
    date: '2021-02-11', decoration: '',
    subject: 'built python screener, shipped it for free',
    body: [
      "Open-sourced weekend project for retail investors on Daniel's forum.",
      "Free. No ask. Just 'does this help?' The answer came back loud.",
    ].join('\n'),
    diffstat: { files: 4, added: 480, removed: 10, text: 'screener.py, README.md' },
    g: ['|  * | | ', 'c-main', 'c-stockunlock', 'c-pronk', 'c-married'],
  },
  {
    sha: 'd5a9e42', fullSha: 'd5a9e42f0123456789abcdef0123456789abcdef',
    branch: 'oscar', author: 'Jake Ruth <jake@stockunlock.com>',
    date: '2021-06-30', decoration: 'oscar-health',
    subject: 'oscar-health: final commit, exit stage left',
    body: [
      "4 years in fintech-adjacent health insurance. Learned how real systems",
      "actually get built and broken. Thanked the team, shipped the last PR,",
      "closed the laptop on a Friday.",
    ].join('\n'),
    diffstat: { files: 0, added: 0, removed: 0, text: 'offboarding' },
    g: ['* |    ', 'c-oscar'],
  },

  { sec: "/* === 2020 === */" },
  {
    sha: 'c0ffee1', fullSha: 'c0ffee1deadbeefcafebabef00dbaadf00df00df',
    branch: 'oscar', author: 'Jake Ruth <jake@stockunlock.com>',
    date: '2020-05-12', decoration: '',
    subject: 'senior engineer: owning systems end-to-end',
    body: [
      "Pandemic rewrote every roadmap. We rewrote ours twice.",
      "Became the person whose name lands in the on-call rotation for the weird bugs.",
    ].join('\n'),
    diffstat: { files: 54, added: 3_400, removed: 1_100, text: 'services/**/*' },
    g: ['* |    ', 'c-oscar'],
  },

  { sec: "/* === 2019 === */" },
  {
    sha: '9badc0d', fullSha: '9badc0de112233445566778899aabbccddeeff00',
    branch: 'oscar', author: 'Jake Ruth <jake@stockunlock.com>',
    date: '2019-03-18', decoration: '',
    subject: 'mid-level: shipping real things to real members',
    body: [
      "Went from 'assigned tickets' to 'assigned problems'. Much better.",
    ].join('\n'),
    diffstat: { files: 22, added: 980, removed: 310, text: 'services/**/*' },
    g: ['* |    ', 'c-oscar'],
  },

  { sec: "/* === 2017 === */" },
  {
    sha: '4e7a1b0', fullSha: '4e7a1b0aa55bb66cc77dd88ee99ff001122334455',
    branch: 'oscar', author: 'Jake Ruth <jake@stockunlock.com>',
    date: '2017-03-06', decoration: 'oscar-health',
    subject: 'start oscar-health',
    body: [
      "NYC. New stack, new scale, new problems. First time touching systems where",
      "a bad deploy had downstream consequences measured in humans.",
    ].join('\n'),
    diffstat: { files: 1, added: 1, removed: 0, text: 'onboarding.md' },
    g: ['* |    ', 'c-oscar'],
  },

  { sec: "/* === 2016 === */" },
  {
    sha: 'f00d721', fullSha: 'f00d72198af1cc003feedbeef0a0b0c0d0e0f010',
    branch: 'commercehub', author: 'Jake Ruth <jake@stockunlock.com>',
    date: '2016-12-22', decoration: 'commercehub',
    subject: "commercehub: final commit, off to NYC",
    body: [
      "3 years of e-commerce plumbing. Learned what production actually means.",
      "Learned to read stack traces like poetry. Time to try bigger.",
    ].join('\n'),
    diffstat: { files: 0, added: 0, removed: 0, text: 'offboarding' },
    g: ['*     ', 'c-commercehub'],
  },
  {
    sha: '7ce99da', fullSha: '7ce99da991122334455667788aabbccddeeff001',
    branch: 'youni', author: 'Jake Ruth <jake@stockunlock.com>',
    date: '2016-04-10', decoration: '',
    subject: "Merge branch 'youni' (project ended)",
    merge: true,
    body: [
      "Youni wound down. Great people, hard market. Dragged the lessons back into",
      "main — you can't un-learn 'ship weekly or perish'.",
    ].join('\n'),
    diffstat: { files: 8, added: 120, removed: 2_300, text: 'projects/youni/**' },
    g: ['*-.    ', 'c-commercehub', 'c-youni'],
  },

  { sec: "/* === 2015 === */" },
  {
    sha: 'b1e7a03', fullSha: 'b1e7a031a2b3c4d5e6f708192a3b4c5d6e7f8090',
    branch: 'youni', author: 'Jake Ruth <jake@stockunlock.com>',
    date: '2015-09-02', decoration: 'youni',
    subject: 'youni: co-building a campus social thing',
    body: [
      "Side-hustle that felt like a main-hustle. Native app, late nights, group chats",
      "that never slept. Didn't win the market. Won the reps.",
    ].join('\n'),
    diffstat: { files: 92, added: 4_800, removed: 120, text: 'app/**/*' },
    g: ['| *    ', 'c-commercehub', 'c-youni'],
  },
  {
    sha: 'a1b2c3d', fullSha: 'a1b2c3d4e5f6071829aabbccddeeff001122334',
    branch: 'main', author: 'Jake Ruth <jake@stockunlock.com>',
    date: '2015-05-17', decoration: '',
    subject: 'B.S. Computer Science + Mathematics — SUNY Albany',
    body: [
      "Double-major shipped. ACM chapter: president. Tau Beta Pi tassel.",
      "Most useful class: the one that taught me I could teach myself the rest.",
    ].join('\n'),
    diffstat: { files: 1, added: 120, removed: 0, text: 'education/diploma.pdf' },
    g: ['*     ', 'c-main'],
  },

  { sec: "/* === 2014 === */" },
  {
    sha: '5u1ff1e', fullSha: '5u1ff1ea1b2c3d4e5f6789abcdeffedcba987654',
    branch: 'main', author: 'Jake Ruth <jake@stockunlock.com>',
    date: '2014-04-01', decoration: '',
    subject: 'ACM @ SUNY Albany — elected president',
    body: [
      "Ran hackathons, pizza nights, resume clinics. Turns out you learn more",
      "engineering from organizing engineers than from a lot of coursework.",
    ].join('\n'),
    diffstat: { files: 3, added: 80, removed: 0, text: 'clubs/acm/*' },
    g: ['*     ', 'c-main'],
  },
  {
    sha: 'cube0fe', fullSha: 'cube0fe111222333444555666777888999aaabbb',
    branch: 'rubiks', author: 'Jake Ruth <jake@stockunlock.com>',
    date: '2014-02-14', decoration: '',
    subject: "Merge branch 'rubiks-cube' into main (talent show)",
    merge: true,
    body: [
      "Peak: 13.95s avg. Unicycle-while-solving talent show. No regrets.",
      "Branch remains on disk — you never really close that one.",
    ].join('\n'),
    diffstat: { files: 1, added: 14, removed: 0, text: 'hobbies/rubiks.md' },
    g: ['*-.    ', 'c-main', 'c-rubiks'],
  },

  { sec: "/* === 2013 === */" },
  {
    sha: 'c0de013', fullSha: 'c0de013abcdef1234567890fedcba0987654321f',
    branch: 'commercehub', author: 'Jake Ruth <jake@stockunlock.com>',
    date: '2013-06-15', decoration: 'commercehub',
    subject: 'first day: commercehub intern (became FT)',
    body: [
      "First real codebase. First real deploy. First real 'don't do that in prod' talk.",
      "~13 years of this career clock start ticking now.",
    ].join('\n'),
    diffstat: { files: 1, added: 1, removed: 0, text: 'onboarding.md' },
    g: ['*     ', 'c-commercehub'],
  },
  {
    sha: 'b1rthff', fullSha: 'b1rthff0000000000000000000000000000000000',
    branch: 'main', author: 'Jake Ruth <jake@stockunlock.com>',
    date: '2013-01-01', decoration: '',
    subject: 'git init — start learning to code',
    body: [
      "Genesis commit. Empty repo, curious brain. ~13 years later it has branches",
      "for a fintech, a health insurer, a degree, a wedding, and a Rubik's cube.",
    ].join('\n'),
    diffstat: { files: 1, added: 1, removed: 0, text: 'README.md' },
    g: ['*     ', 'c-main'],
  },

  { sec: "/* === earlier === */" },
  {
    sha: '2008cub', fullSha: '2008cub1111222233334444555566667777888899',
    branch: 'rubiks', author: 'Jake Ruth <jake@stockunlock.com>',
    date: '2008-09-01', decoration: 'rubiks-cube',
    subject: 'rubiks-cube: branch created',
    body: [
      "A cube, a stopwatch, a stubborn streak. Competitive speedcubing for years.",
      "Best avg: 13.95s. The patience tax this cost still pays dividends.",
    ].join('\n'),
    diffstat: { files: 1, added: 1, removed: 0, text: 'hobbies/rubiks.md' },
    g: ['| *   ', 'c-main', 'c-rubiks'],
  },
];

/* ------------------------------------------------------------------ */
/* Render                                                              */
/* ------------------------------------------------------------------ */

const graphEl  = document.getElementById('graph');
const branchUl = document.getElementById('branchList');

let activeFilter = null; // branch id or null
let pinnedSha    = null;

function glyphHTML(glyphDef) {
  // glyphDef = [template, ...colorsClass]
  // template uses markers: we re-use the string; recolor pipe/star sequences.
  if (!glyphDef) return '';
  const [template, ...cols] = glyphDef;
  // Walk the template; color pipes, stars, backslashes, slashes in order using cols left-to-right.
  let colorIdx = 0;
  let out = '';
  for (let i = 0; i < template.length; i++) {
    const ch = template[i];
    if (/[|*\\\/\.\-]/.test(ch)) {
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
  const chips = parts.map(p => {
    if (p.startsWith('HEAD')) return `<span class="head">${p}</span>`;
    if (p.startsWith('origin/') || p.startsWith('upstream/')) return `<span class="remote-tag">${p}</span>`;
    return `<span class="branch-tag">${p}</span>`;
  }).join(', ');
  return `(${chips}) `;
}

function renderGraph() {
  const rows = COMMITS.map((c, idx) => {
    if (c.sec) {
      return `<div class="row section-break"><span class="glyph">|</span><span class="break-text">${c.sec}</span></div>`;
    }
    const merge = c.merge ? ' merge' : '';
    const head  = c.decoration && c.decoration.startsWith('HEAD') ? ' head' : '';
    return `
      <div class="row${merge}${head}" data-sha="${c.sha}" data-branch="${c.branch}" data-idx="${idx}">
        <span class="glyph">${glyphHTML(c.g)}</span>
        <span class="hash">${c.sha}</span>
        <span class="decoration">${renderDecoration(c)}</span>
        <span class="date">${c.date}</span>
        <span class="msg">${escape(c.subject)}</span>
      </div>`;
  }).join('\n');
  graphEl.innerHTML = rows;
}

function renderBranchList() {
  branchUl.innerHTML = BRANCHES.map(b => `
    <li data-branch="${b.id}">
      <span class="branch-swatch" style="background: var(--${b.color.replace('c-', 'c-')})"></span>
      <span class="branch-name">${b.name}</span>
      <span class="branch-head${b.head.startsWith('HEAD') ? ' on' : ''}">${b.head || b.years}</span>
    </li>
  `).join('');
  // swatch color via css var
  branchUl.querySelectorAll('li').forEach(li => {
    const branch = BRANCHES.find(b => b.id === li.dataset.branch);
    if (branch) {
      li.querySelector('.branch-swatch').style.background = `var(--${branch.color.replace('c-','c-')})`;
    }
  });
}

// Simple HTML escape for commit subjects.
function escape(s) {
  return s.replace(/[&<>"']/g, ch => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[ch]));
}

/* ------------------------------------------------------------------ */
/* Detail pane                                                         */
/* ------------------------------------------------------------------ */

const detailEmpty   = document.getElementById('detailEmpty');
const detailContent = document.getElementById('detailContent');
const detailHash    = document.getElementById('detailHash');
const detailDecor   = document.getElementById('detailDecoration');
const detailAuthor  = document.getElementById('detailAuthor');
const detailDate    = document.getElementById('detailDate');
const detailBranch  = document.getElementById('detailBranch');
const detailSubject = document.getElementById('detailSubject');
const detailBody    = document.getElementById('detailBody');
const detailDiff    = document.getElementById('detailDiffstat');
const detailPinHint = document.getElementById('detailPinHint');

function showDetail(sha, pinned) {
  const c = COMMITS.find(x => x.sha === sha);
  if (!c || c.sec) return;
  detailEmpty.hidden = true;
  detailContent.hidden = false;

  const branch = BRANCHES.find(b => b.id === c.branch);
  detailHash.textContent = c.fullSha;
  detailDecor.innerHTML  = c.decoration ? `(${c.decoration})` : '';
  detailAuthor.textContent = c.author;
  detailDate.textContent   = c.date + '  (' + relativeDate(c.date) + ')';
  detailBranch.innerHTML   = `<span style="color: var(--${branch.color.replace('c-','c-')})">${branch.name}</span>`;
  detailSubject.textContent = c.subject;
  detailBody.textContent   = c.body || '';

  if (c.diffstat) {
    detailDiff.innerHTML = `
      ${c.diffstat.files} file${c.diffstat.files === 1 ? '' : 's'} changed,
      <span class="added">+${c.diffstat.added}</span>
      <span class="removed">-${c.diffstat.removed}</span>
      <span style="color:var(--fg-muted)"> &nbsp;${c.diffstat.text}</span>
    `;
  } else {
    detailDiff.innerHTML = '';
  }

  detailPinHint.innerHTML = pinned
    ? `<span class="detail-pinned">pinned</span> click same commit to un-pin`
    : `// click a commit to pin`;
}

function clearDetail() {
  detailEmpty.hidden = false;
  detailContent.hidden = true;
}

function relativeDate(iso) {
  const d = new Date(iso);
  const now = new Date('2026-04-20');
  const diff = now - d;
  const yrs = diff / (1000 * 60 * 60 * 24 * 365);
  if (yrs < 0.1)  return 'days ago';
  if (yrs < 1)    return Math.round(yrs * 12) + ' months ago';
  return yrs.toFixed(1) + ' years ago';
}

/* ------------------------------------------------------------------ */
/* Interactions                                                        */
/* ------------------------------------------------------------------ */

function applyFilter(branchId) {
  activeFilter = branchId;
  const statusFilter = document.getElementById('statusFilter');
  statusFilter.textContent = 'filter: ' + (branchId || 'none');

  document.querySelectorAll('.row').forEach(r => {
    if (!branchId) { r.classList.remove('dim'); return; }
    const show = r.dataset.branch === branchId || r.classList.contains('section-break');
    r.classList.toggle('dim', !show);
  });
  branchUl.querySelectorAll('li').forEach(li => {
    li.classList.toggle('active', li.dataset.branch === branchId);
  });
}

graphEl.addEventListener('mouseover', (e) => {
  const row = e.target.closest('.row');
  if (!row || row.classList.contains('section-break')) return;
  if (pinnedSha) return; // pinned, don't override on hover
  showDetail(row.dataset.sha, false);
});

graphEl.addEventListener('mouseleave', () => {
  if (pinnedSha) return;
  clearDetail();
  document.querySelectorAll('.row.active').forEach(r => {
    if (r.dataset.sha !== pinnedSha) r.classList.remove('active');
  });
});

graphEl.addEventListener('click', (e) => {
  const row = e.target.closest('.row');
  if (!row || row.classList.contains('section-break')) return;
  const sha = row.dataset.sha;
  if (pinnedSha === sha) {
    // unpin
    pinnedSha = null;
    row.classList.remove('active');
    clearDetail();
  } else {
    // pin new
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
  if (activeFilter === id) applyFilter(null);
  else applyFilter(id);
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    pinnedSha = null;
    document.querySelectorAll('.row.active').forEach(r => r.classList.remove('active'));
    applyFilter(null);
    clearDetail();
  }
});

/* ------------------------------------------------------------------ */
/* Boot                                                                */
/* ------------------------------------------------------------------ */

renderBranchList();
renderGraph();

// show HEAD by default
const head = COMMITS.find(c => c.decoration && c.decoration.startsWith('HEAD'));
if (head) {
  showDetail(head.sha, false);
}
