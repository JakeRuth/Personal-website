/* ================================================================
   timeline.js, the git-log view of the Stories section from /xp/.
   Mirrors XP "Stories · Shared Documents" 1:1: same eras, same
   stories, same bodies. Chronological ascending (oldest to latest).
   The canonical COMMITS array below is authored newest-first for
   readability; getOrderedCommits() flips it before rendering.
   ================================================================ */

window.TIMELINE = (function () {
  'use strict';

  /* ---------- branches (one per life-era arc) ---------- */
  const BRANCHES = [
    // Right-rail branches list, chronological by start year. `main`
    // omitted — every commit is on it implicitly, so listing it
    // clutters the visible life-phase threads. No commit references
    // 'main' as its branch field.
    { id: 'preteen',     name: 'pre-teen',     colorVar: '--c-next',        years: '~2003 – 2005' },
    { id: 'highschool',  name: 'high-school',  colorVar: '--c-rubiks',      years: '2007 – 2011' },
    { id: 'albany',      name: 'suny-albany',  colorVar: '--c-pronk',       years: '2011 – 2015' },
    { id: 'commercehub', name: 'commercehub',  colorVar: '--c-commercehub', years: '2013 – 2016' },
    { id: 'youni',       name: 'youni',        colorVar: '--c-youni',       years: '2014 – 2016' },
    { id: 'oscar',       name: 'oscar-health', colorVar: '--c-oscar',       years: '2016 – 2021' },
    { id: 'stockunlock', name: 'stock-unlock', colorVar: '--c-stockunlock', years: '2020 – 2026' },
  ];

  /* ---------- commits: one per Story on /xp/, reverse chrono ---------- */
  const COMMITS = [
    { year: '2026' },
    {
      sha: 'now2026', fullSha: 'now2026a1b2c3d4e5f6789abcdef0123456789ab',
      branch: 'stockunlock', author: 'Jake Ruth <jake2ruth@gmail.com>',
      date: '2026-04',
      decoration: [{ kind: 'head', text: 'HEAD -> main' }],
      subject: 'now: SU runs profitably; on key decisions and weekend pokes',
      tags: ['available', 'NYC', 'open to talk'],
      body:
        "Stock Unlock runs profitably without me in the seat day-to-day. Handed off to a small, lean team; I'm on key decisions and weekend pokes only.\n\n" +
        "Working on what's next. Open to full-time, contract, or equity-founding conversations on a problem worth caring about.",
      diffstat: {
        items: [
          { file: 'status.md',  added: 1, removed: 1, note: 'available' },
          { file: 'inbox/',     added: 0, removed: 0, note: 'open' },
        ],
        summary: '1 status updated, 0 banners raised',
      },
    },

    { year: '2021' },
    {
      sha: 'su2021', fullSha: 'su2021a1b2c3d4e5f67890abcdef0123456789ab',
      branch: 'stockunlock', author: 'Jake Ruth <jake2ruth@gmail.com>',
      date: '2021-06',
      decoration: [{ kind: 'branch', text: 'stock-unlock' }],
      subject: 'building Stock Unlock (2021 – early 2026)',
      tags: ['YC W22', '$1.335M seed', '~3.9k sustained', 'team of 8'],
      body:
        "Co-founded with Daniel Pronk and a third co-founder (a fellow Oscar engineer). YC W22. " +
        "Led the YC interview. Raised $1.335M seed. Scaled to a team of eight, grew to and sustained ~3.9k paying customers. " +
        "Worked it full-tilt through the scale era.\n\n" +
        "Sustained ~3.9k paying customers through 2024-2025 at a profitable, durable steady-state. " +
        "Explored adjacent paths to keep growing (partial pivots, B2B motions, a late-2025 feature push). " +
        "In early 2026, made the call to right-size around the steady-state we'd built.",
      diffstat: {
        items: [
          { file: 'src/**/*',       added: 18000, removed: 6200, note: 'years of build' },
          { file: 'finance/p&l',    added:   400, removed:    0, note: 'profitable' },
          { file: 'ops/structure',  added:     1, removed:    0, note: 'right-sized' },
        ],
        summary: '~5 years of company packed into one merge',
      },
    },
    {
      sha: 'discpop', fullSha: 'discpop12d99cc04a51be3d2f2340987a6e5f3c1c',
      branch: 'stockunlock', author: 'Jake Ruth <jake2ruth@gmail.com>',
      date: '2021-05',
      subject: 'Discord drop: PMF moment',
      tags: ['"I would pay for this"'],
      body:
        "Daniel's paid Discord: about a thousand members, behind a YouTube channel of ~100K subscribers at the time. " +
        "I dropped an early alpha, a basic Excel generator that worked for a handful of stocks. The replies came fast: " +
        "'are you selling this?' / 'could you add this stock?' / 'I would pay for this.' " +
        "That's the moment I knew there was a business in it.",
      diffstat: {
        items: [
          { file: 'discord/replies.txt', added: 47, removed: 0, note: 'PMF signal' },
        ],
        summary: '1 alpha dropped, 1 thesis confirmed',
      },
    },

    { year: '2020' },
    {
      sha: 'pronkml', fullSha: 'pronkml112233445566778899aabbccddeeff001',
      branch: 'stockunlock', author: 'Jake Ruth <jake2ruth@gmail.com>',
      date: '2020-09',
      decoration: [{ kind: 'branch', text: 'stock-unlock' }],
      subject: 'the Pronk emails: six weeks until he replied',
      tags: ['COVID era', 'persistence', "'how can I help you?'"],
      body:
        "Watching Daniel Pronk's investing YouTube channel. He mentioned spending 5–10 hours every weekend building Excel sheets for his content. " +
        "I thought: 'Damn, that's so dumb. This guy's smart. Why is he wasting that time?'\n\n" +
        "Built a Python automation in a weekend that hit cheap financial APIs and exported the same Excel format he was making by hand. " +
        "Then I started emailing him. Commenting on his content. Trying to give him the tool for free. " +
        "Daniel ignored me for about six weeks. He eventually replied, not because he was sold but to get me to go away: 'How can I help you?' " +
        "Instead of going away, I jumped on a video call, cracked a beer, and we instantly hit it off. " +
        "He let me into his paid Discord for free. He asked if I could build web apps. I'd been doing it professionally for six years.",
      diffstat: {
        items: [{ file: 'inbox/daniel.eml', added: 2, removed: 0, note: 'first reply' }],
        summary: '6 weeks of silence resolved',
      },
    },

    { year: '2019' },
    {
      sha: 'un1cy13', fullSha: 'un1cy13abcde1234567890abcdef1234567890ab',
      branch: 'oscar', author: 'Jake Ruth <jake2ruth@gmail.com>',
      date: '2019-06',
      subject: 'the unicycle cube (twice): talent show + encore',
      tags: ['legendary', "'All the Small Things'", 'encore ~2 yrs later'],
      body:
        "Oscar Health all-hands talent show. Crowd was loose, half-drunk, having a good time. I'd been a competitive cuber since 2008 and a trick-grade unicyclist since junior year of high school. The plan, in order:\n\n" +
        "1. Hand a Rubik's cube to someone in the audience at the start. 'Scramble this. We'll come back for it.'\n" +
        "2. Ride out from the side of the room on the unicycle. Across the crowd, waving.\n" +
        "3. Switch to riding backwards.\n" +
        "4. Stack chairs and a table and a bench from the all-hands room into an obstacle course. Jump across them on the unicycle.\n" +
        "5. Have the audience member toss back the now-scrambled cube.\n" +
        "6. Solve it on the unicycle, as the finale.\n\n" +
        "'All the Small Things' by Blink-182 in the background. Crowd lost it. People talked about it for weeks.\n\n" +
        "Did it again about two years later for the encore. Slightly less elaborate; kept the cube-on-unicycle finale, dropped most of the obstacle course. Had to retrain, mastery decays fast if you don't tend it. Spent a couple of days outside my apartment before the show re-grinding the basics.",
      diffstat: {
        items: [{ file: 'hobbies/talent-show.md', added: 14, removed: 0, note: 'twice' }],
        summary: '2 cubes solved, 0 dignity lost',
      },
    },
    {
      sha: 'em0t1qu', fullSha: 'em0t1qu112233445566778899aabbccddeeff001',
      branch: 'oscar', author: 'Jake Ruth <jake2ruth@gmail.com>',
      date: '2019-05',
      subject: 'Emotiqueue: hackathon → real internal tool',
      tags: ['culture carrier', '3,000+ emoticons', '50+ commands'],
      body:
        "Started as a goof: I kept making custom emoticons for our team chat (HipChat at the time, later Slack after the company switched tools). " +
        "That habit grew into a hackathon project where messages got routed through a deliberately ridiculous pipeline (queues into queues, then a ticketing system, then back into chat) that ended in a chatbot. We named it Emotiqueue.\n\n" +
        "Over time we added commands. By the time I left, Emotiqueue had 3,000+ custom emoticons, 50+ silly entertainment-focused commands that did ridiculously dumb things, and an active codebase that other engineers across the company committed to. " +
        "Half goof, half real internal tool. The kind of culture moment that's missing from most engineering orgs, which is a thing I care about and try to seed wherever I work.",
      diffstat: {
        items: [{ file: 'fun/emotiqueue/*', added: 2400, removed: 60, note: 'real users' }],
        summary: '1 chatbot shipped, 1 culture moment seeded',
      },
    },

    { year: '2016' },
    {
      sha: 'oscar-q', fullSha: 'oscarq16d2c3b4a5f6e7d8c9b0a1f2e3d4c5b6a7',
      branch: 'oscar', author: 'Jake Ruth <jake2ruth@gmail.com>',
      date: '2016-12',
      decoration: [{ kind: 'branch', text: 'oscar-health' }],
      subject: 'ready for the question that came (Oscar interview)',
      tags: ['serendipity', 'Youni preceded Oscar'],
      body:
        "Oscar Health interview. The design question they asked: 'if you were going to build a social-media app where people could follow each other, how would you architect it?' " +
        "In my head: 'Wow. They really studied my resume.' I'd just spent eighteen months building Youni, a college-localized social-media iOS app. I crushed the answer.\n\n" +
        "Years later, my manager told me it was a standard rotation question, asked at random, by people who hadn't read my resume. " +
        "The catch was random; the prep wasn't. The single most architecturally similar question they could have asked, asked by chance, on the day my eighteen months of work had me fully ready for it. " +
        "That's what serendipity actually means: luck only lands on the prepared.",
      diffstat: {
        items: [{ file: 'inbox/offer.eml', added: 1, removed: 0, note: 'crushed it' }],
        summary: '1 interview answered, 1 lucky question landed',
      },
    },
    {
      sha: 'youni16', fullSha: 'youni16991122334455667788aabbccddeeff001',
      branch: 'youni', author: 'Jake Ruth <jake2ruth@gmail.com>',
      date: '2016-11',
      decoration: [{ kind: 'branch', text: 'youni' }],
      subject: 'Youni (late 2014 – Nov 2016): co-founded → folded',
      tags: ['React Native v0.13/0.14', '20,000+ posts', 'eyes bigger than my stomach'],
      body:
        "Co-founded with two UAlbany D1 soccer players (Anthony, CEO; Jordan). " +
        "College-localized social-media iOS app on React Native v0.13/0.14, built out of free accelerator space in Troy. " +
        "A 'school-localized Instagram': closed-loop networks per college, with Greek-life and sports-team features.\n\n" +
        "Anthony and Jordan won ~$25K in equity-free grants while still in school. Launched at SUNY Albany and SUNY Binghamton; ran a 70-person paid-in-credits brand-ambassador program; 20,000+ posts at peak.\n\n" +
        "Started on the side late 2014 alongside CommerceHub, ramped up over my last few months there, full-time July 2016. " +
        "No business model and an unsolved cold-start; folded after about four to five months full-time. " +
        "Eyes bigger than my stomach. The eighteen months of building it paid off in an unexpected place, the Oscar interview question that came right after.",
      diffstat: {
        items: [{ file: 'projects/youni/**', added: 4800, removed: 2300, note: 'shipped, folded' }],
        summary: '1 startup founded, 1 startup retired',
      },
    },

    { year: '2014' },
    {
      sha: 'ie7el1p', fullSha: 'ie7el1pdeadbeefcafebabef00dbaadf00df00df',
      branch: 'commercehub', author: 'Jake Ruth <jake2ruth@gmail.com>',
      date: '2014-09',
      subject: 'the IE7 ellipsis: fixed via Windows VM in 2014',
      tags: ['QVC', 'Internet Explorer 7'],
      body:
        "Quick trench memory. Had to fix a string-truncation bug in a company-name display where the ellipsis didn't render properly in Internet Explorer 7. " +
        "QVC, one of CommerceHub's customers, was pinned to IE7. To test the fix I had to spin up a virtual machine running an old version of Windows just to load the browser. In 2014. " +
        "Engineering history is preserved in QVC's procurement contracts.",
      diffstat: {
        items: [{ file: 'fix/ellipsis.js', added: 6, removed: 2, note: 'IE7 quirk' }],
        summary: '1 bug fixed, 1 era visited',
      },
    },
    {
      sha: 'tekkapa', fullSha: 'tekkapa11222333444555666777888999aaabbbcc',
      branch: 'albany', author: 'Jake Ruth <jake2ruth@gmail.com>',
      date: '2014-04',
      subject: 'Tekkapalooza: the resume drop that became CommerceHub',
      tags: ['ACM era', 'not a recruiting event'],
      body:
        "Organized a field trip to Tekkapalooza on behalf of the ACM club, a regional showcase of Albany-area tech companies. " +
        "Wasn't framed as a recruiting event. I told members to bring resumes anyway.\n\n" +
        "Handed mine directly to a company called CommerceHub. They liked me enough to offer an interview. " +
        "In the interview I told them I really wanted to learn how to code and hopefully it wasn't going to be about getting coffee. They laughed because that's not what actually happens, that's what you see in movies. " +
        "I got the internship. Three years of internship work and a full-time role grew out of one resume drop at a non-recruiting event.",
      diffstat: {
        items: [{ file: 'jobs/commercehub.eml', added: 1, removed: 0, note: 'offer' }],
        summary: '1 resume dropped, 1 career launched',
      },
    },
    {
      sha: 'acmreviv', fullSha: 'acmreviv1b2c3d4e5f6789abcdeffedcba987654',
      branch: 'albany', author: 'Jake Ruth <jake2ruth@gmail.com>',
      date: '2014-02',
      decoration: [{ kind: 'branch', text: 'suny-albany' }],
      subject: 'ACM revival: dying CS club, ~50-100 students at the relaunch',
      tags: ['ran it 2 years', 'survived past me'],
      body:
        "The SUNY Albany CS Club (ACM) was quietly dying. Outgoing seniors had identified me from time in the CS lounge and from class performance. " +
        "They handed me the presidency. I took it because it was a great resume builder; ran it for two years.\n\n" +
        "Got a handful of professors to let me make end-of-class announcements about an interest meeting. " +
        "Booked a lecture hall, ~7pm on a weeknight. ~50 to 100 students showed; a few dozen joined. " +
        "Ran weekly meetings, LAN parties, and taught workshops on what I was learning at my CommerceHub internship. " +
        "The club survived past me, which mattered more than the headcount.",
      diffstat: {
        items: [{ file: 'clubs/acm/*', added: 80, removed: 0, note: 'rebuilt' }],
        summary: 'few dozen members recruited, 1 club survived',
      },
    },

    { year: '2013' },
    {
      sha: 'prodt0k', fullSha: 'prodt0k198af1cc003feedbeef0a0b0c0d0e0f010',
      branch: 'commercehub', author: 'Jake Ruth <jake2ruth@gmail.com>',
      date: '2013-12',
      decoration: [{ kind: 'branch', text: 'commercehub' }],
      subject: "the production takedown: \"the system was the problem, not you\"",
      tags: ['intern era', 'blameless culture'],
      body:
        "I had admin access to our Apache Solr cluster, the search index powering parts of the production site. " +
        "Thought I was clicking around in the dev environment; cleared a Solr core. Turned out I was in production. The site went down. Big deal.\n\n" +
        "Walked into the retrospective nervous, started apologizing before anyone spoke. The manager stood up before I finished and said: " +
        "'That wasn't your fault, you shouldn't have had access to that tool. We're not celebrating that this happened, but the system was the problem, not you.'\n\n" +
        "That sentence rewired how I think about systems, access, and blameless culture. It's the engineering culture I've tried to rebuild ever since.",
      diffstat: {
        items: [{ file: 'incidents/solr.md', added: 1, removed: 0, note: 'retrospective' }],
        summary: '1 prod takedown survived, 1 culture lesson banked',
      },
    },

    { year: '2012' },
    {
      sha: 'b4rrm0v', fullSha: 'b4rrm0v0000111122223333444455556666777788',
      branch: 'albany', author: 'Jake Ruth <jake2ruth@gmail.com>',
      date: '2012-08',
      subject: 'the moving-van summers: Barr Brothers Moving Co (NYC)',
      tags: ['NYC summers', 'work-ethic floor'],
      body:
        "Two summers as a mover at Barr Brothers Moving Company in NYC, between freshman/sophomore and " +
        "sophomore/junior year of college. Five to six days a week, up to 80 hours, 100% humidity in the sun.\n\n" +
        "You learn fast that you can't drop a heavy thing even when your hands are slipping, because it isn't yours. " +
        "Set the work-ethic floor and made the case for college sharper; the not-dropping lesson has cashed in on engineering work plenty since.",
      diffstat: {
        items: [{ file: 'jobs/barr-brothers.md', added: 80, removed: 0, note: '2 summers' }],
        summary: '2 summers logged, 0 things dropped',
      },
    },

    { year: '2010' },
    {
      sha: 'apcs010', fullSha: 'apcs0101111222223333344444555556666677777',
      branch: 'highschool', author: 'Jake Ruth <jake2ruth@gmail.com>',
      date: '2010-09',
      decoration: [{ kind: 'branch', text: 'high-school' }],
      subject: 'the AP CS switch: AP CS instead of AP Calc, loop closed in week one',
      tags: ['Mrs. Nalbandian', 'pivotal'],
      body:
        "Catch-22: school required seniors to take a math credit, but I'd accelerated since third grade and burned through every math class except AP Calc. I refused AP Calc.\n\n" +
        "Mrs. Nalbandian, a teacher who liked me but was annoyed I was clearly smart and clearly coasting, mentioned in passing she taught AP Computer Science. " +
        "I asked: 'Does that count as a math credit?' She said, begrudgingly: 'Yes. Why are you asking?' " +
        "I said: 'Okay, great. Now I don't need to take AP Calc. I'll take your computer science class instead.'\n\n" +
        "She had mixed feelings. Took me anyway. She ran a function on the board in the first five minutes of the first class. I knew right there. " +
        "Fifteen years later, that sideways pivot is still the main road.",
      diffstat: {
        items: [{ file: 'school/schedule.txt', added: 1, removed: 1, note: 'AP CS in, AP Calc out' }],
        summary: '1 sideways pivot, 15 years of consequences',
      },
    },

    { year: '2004' },
    {
      sha: 'preteen', fullSha: 'preteen04a5f6789abcdeffedcba9876543210fedc',
      branch: 'preteen', author: 'Jake Ruth <jake2ruth@gmail.com>',
      date: '2004-06',
      decoration: [{ kind: 'branch', text: 'pre-teen' }],
      subject: 'the pre-teen pattern: lemonade stands, snow shoveling, garage sale',
      tags: ['Westchester', 'lock-in pattern'],
      body:
        "Westchester, NY. Lemonade stands frequent enough that my parents told me to stop. " +
        "Snow shoveling for cash. Around age 11 or 12, dragged my old toys onto the curb for a mini garage sale on the street.\n\n" +
        "The lock-in-and-go-deep pattern was already there before any career existed. " +
        "Same intensity that later showed up in skateboarding, DDR, Guitar Hero, and RuneScape. Every one of them got the same obsessive attention.",
      diffstat: {
        items: [{ file: 'patterns/lock-in.md', added: 1, removed: 0, note: 'pre-existing' }],
        summary: '1 pattern recognized, 0 careers yet',
      },
    },
  ];

  /* ---------- jump points (synced with year dividers, chrono asc) ---------- */
  const JUMPS = [
    { year: '2004', label: 'pre-teen pattern' },
    { year: '2010', label: 'AP CS switch' },
    { year: '2012', label: 'moving-van summers' },
    { year: '2013', label: 'production takedown' },
    { year: '2014', label: 'CommerceHub · ACM · Tekkapalooza' },
    { year: '2016', label: 'Youni folds · Oscar interview' },
    { year: '2019', label: 'Emotiqueue + unicycle cube' },
    { year: '2020', label: 'COVID · the Pronk emails' },
    { year: '2021', label: 'Discord drop · building Stock Unlock' },
    { year: '2026', label: 'now · key decisions only' },
  ];

  /* ---------- chronological-ascending order helper ---------- */
  /* COMMITS is authored newest-first; flip into oldest-first groups. */
  function buildOrdered() {
    const groups = {};
    const yearOrder = [];
    let currentYear = null;
    for (const c of COMMITS) {
      if (c.year) {
        currentYear = c.year;
        if (!groups[currentYear]) {
          groups[currentYear] = [];
          yearOrder.push(currentYear);
        }
        continue;
      }
      groups[currentYear].push(c);
    }
    yearOrder.sort();
    const out = [];
    for (const y of yearOrder) {
      out.push({ year: y });
      // within-year reverse: COMMITS lists newest-first within a year,
      // we want oldest-first.
      for (const c of groups[y].slice().reverse()) out.push(c);
    }
    return out;
  }
  const ORDERED = buildOrdered();

  /* ---------- helpers ---------- */
  const escape = (s) => String(s).replace(/[&<>"']/g, (c) => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;',
  }[c]));

  // Wrap branded mentions in escaped commit-body prose with their
  // canonical hyperlinks (CLAUDE.md hard rule: every body-prose
  // mention of these terms is linked).
  const SU_LINK = '<a href="https://stockunlock.com" target="_blank" rel="noopener">Stock Unlock</a>';
  const YC_LINK_LONG = '<a href="https://www.ycombinator.com/companies/stock-unlock" target="_blank" rel="noopener">YC Winter 2022</a>';
  const YC_LINK_SHORT = '<a href="https://www.ycombinator.com/companies/stock-unlock" target="_blank" rel="noopener">YC W22</a>';
  function brandify(html) {
    return html
      .replace(/Stock Unlock/g, SU_LINK)
      .replace(/YC Winter 2022/g, YC_LINK_LONG)
      .replace(/YC W22\b/g, YC_LINK_SHORT);
  }

  /* Custom eased scroll. Browser smooth-scroll lands abruptly on long
     jumps; this uses an easeOutQuart curve over a distance-aware
     duration for a calmer arrival. Honors scroll-margin-top via the
     element's CSS so we don't bake an offset here. */
  const STICKY_OFFSET = 170;
  let activeScrollAnim = 0;
  function smoothScrollTo(el, opts = {}) {
    if (!el) return;
    const block = opts.block || 'start';
    cancelAnimationFrame(activeScrollAnim);
    const rect = el.getBoundingClientRect();
    const viewH = window.innerHeight;
    let targetTop;
    if (block === 'center') {
      targetTop = window.scrollY + rect.top - (viewH / 2) + (rect.height / 2);
    } else {
      targetTop = window.scrollY + rect.top - STICKY_OFFSET;
    }
    targetTop = Math.max(0, targetTop);
    const startY = window.scrollY;
    const dy = targetTop - startY;
    if (Math.abs(dy) < 2) return;
    // Distance-aware duration: ~520ms for short hops, up to ~1100ms for big jumps.
    const dur = Math.min(1100, 320 + Math.sqrt(Math.abs(dy)) * 18);
    const startT = performance.now();
    const ease = (t) => 1 - Math.pow(1 - t, 4); // easeOutQuart
    const step = (now) => {
      const t = Math.min(1, (now - startT) / dur);
      window.scrollTo(0, startY + dy * ease(t));
      if (t < 1) activeScrollAnim = requestAnimationFrame(step);
    };
    activeScrollAnim = requestAnimationFrame(step);
  }

  const relativeDate = (iso) => {
    const d = new Date(iso.length <= 7 ? iso + '-01' : iso);
    const now = new Date('2026-05-06');
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

  /* Bar width tracks the magnitude of the count, not a per-row ratio,
     so +1 / -1 is a single tick and +18000 dwarfs +47. log10 + a small
     boost: 1 → 1, 5 → 1, 47 → 2, 400 → 3, 3.9k → 4, 18k → 5, 1.3M → 7. */
  function magBars(n) {
    if (!n || n < 1) return 0;
    return Math.max(1, Math.ceil(Math.log10(n + 1)));
  }
  const renderDiffstat = (diffstat) => {
    if (!diffstat || !diffstat.items) return '';
    const items = diffstat.items;
    const lines = items.map((i) => {
      const a = i.added || 0, r = i.removed || 0;
      const aBars = magBars(a), rBars = magBars(r);
      const bars = '<span class="added">' + '+'.repeat(aBars) + '</span>' +
                   '<span class="removed">' + '-'.repeat(rBars) + '</span>';
      const stat = `<span class="added">+${a.toLocaleString()}</span> <span class="removed">-${r.toLocaleString()}</span>`;
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
    for (const c of ORDERED) {
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
          <div class="tl-show-body"><p>${brandify(escape(c.body || '')).split(/\n\n+/).join('</p><p>')}</p></div>
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
        // Wait one frame so the .tl-expand reveal lands before measuring.
        requestAnimationFrame(() => {
          const rect = row.getBoundingClientRect();
          if (rect.top < STICKY_OFFSET + 8 || rect.bottom > window.innerHeight - 80) {
            smoothScrollTo(row, { block: 'start' });
          }
        });
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
      if (el) smoothScrollTo(el, { block: 'start' });
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
    for (const c of ORDERED) {
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
