// Content tree for the File Viewer column browser.
// Each node may have children; leaves have `detail` HTML.

const FS_TREE = {
  name: "/Users/jake",
  children: [
    {
      name: "About",
      icon: "¶",
      children: [
        {
          name: "Profile.txt",
          icon: "□",
          detail: `
            <h1>Jake Ruth</h1>
            <div class="ins-subtitle">Software engineer. Founder. ~13 years shipping.</div>
            <p>I build things that shouldn't be hard to build but somehow always are. I'm opinionated about software pricing (most of it overcharges) and about interfaces (most of them condescend). I like systems that respect the operator.</p>
            <div class="pull-quote">"Driver in the driver's seat." &mdash; working philosophy for AI tooling.</div>
            <div class="kv">
              <div class="k">Location</div><div class="v">New York</div>
              <div class="k">Status</div><div class="v">Open to the next chapter</div>
              <div class="k">Email</div><div class="v"><a href="mailto:jake@stockunlock.com">jake@stockunlock.com</a></div>
              <div class="k">Experience</div><div class="v">~13 years</div>
            </div>
            <div class="meta-tag">founder</div>
            <div class="meta-tag">engineer</div>
            <div class="meta-tag">YC W22</div>
            <div class="meta-tag">side-profitable</div>
          `
        },
        {
          name: "Philosophy.rtf",
          icon: "□",
          detail: `
            <h1>How I think about software</h1>
            <h2>1. Don't overcharge for shit</h2>
            <p>If the thing is mediocre, the price should be mediocre. The gap between price and value is where trust dies. I'd rather ship honest tools to many people than extract maximum willingness-to-pay from a few.</p>
            <h2>2. Driver in the driver's seat</h2>
            <p>AI is the passenger. It reads the map, calls out turns, drafts the email. The human stays at the wheel because accountability doesn't delegate. Tools that hide the steering wheel end up crashing someone else's car.</p>
            <h2>3. Small teams, deep ownership</h2>
            <p>Eight people scaled Stock Unlock to thousands of paying users. That wasn't luck &mdash; it was a specific bet that tight loops beat org charts.</p>
          `
        },
        {
          name: "Currently.txt",
          icon: "□",
          detail: `
            <h1>Currently</h1>
            <div class="ins-subtitle">April 2026</div>
            <ul>
              <li>Stock Unlock runs as a profitable side business. I'm not full-time there.</li>
              <li>Figuring out the next thing. Taking meetings; not signed to anything.</li>
              <li>Getting married this year.</li>
              <li>Still averaging sub-14s on the cube.</li>
            </ul>
            <p>If you're building something ambitious and need a second founder / early engineer type, the inbox is open.</p>
          `
        }
      ]
    },
    {
      name: "Career",
      icon: "▶",
      children: [
        {
          name: "Stock Unlock",
          icon: "$",
          detail: `
            <h1>Stock Unlock</h1>
            <div class="ins-subtitle">Co-founder &middot; YC W22 &middot; 2021&ndash;present</div>
            <div class="kv">
              <div class="k">Funding</div><div class="v">$1.335M seed</div>
              <div class="k">Team peak</div><div class="v">8 employees</div>
              <div class="k">Customers</div><div class="v">Thousands, paying</div>
              <div class="k">Status</div><div class="v">Profitable side business</div>
              <div class="k">My role now</div><div class="v">Not full-time</div>
            </div>
            <p>Built a retail-investor research platform that respects its users. Shipped hard. Scaled to 8 peak and thousands of customers. It runs profitably without me full-time, which is the cleanest compliment a product can give you.</p>
            <div class="pull-quote">Built it, scaled it, it pays rent. Next chapter.</div>
          `
        },
        {
          name: "Oscar Health",
          icon: "+",
          detail: `
            <h1>Oscar Health</h1>
            <div class="ins-subtitle">Software Engineer &middot; 2017&ndash;2021</div>
            <p>Four years in a regulated industry taught me more about software-as-responsibility than any startup ever could. Healthcare data doesn't forgive shortcuts.</p>
            <ul>
              <li>Built backend systems at real scale.</li>
              <li>Learned how to ship in a company that couldn't just "move fast and break things."</li>
              <li>Left to start Stock Unlock.</li>
            </ul>
          `
        },
        {
          name: "Youni",
          icon: "Y",
          detail: `
            <h1>Youni</h1>
            <div class="ins-subtitle">Engineer &middot; 2015&ndash;2016</div>
            <p>Early-stage consumer startup. First brush with a small team building something from scratch. I learned how much product you can ship when nobody has to ask permission.</p>
          `
        },
        {
          name: "CommerceHub",
          icon: "C",
          detail: `
            <h1>CommerceHub</h1>
            <div class="ins-subtitle">Engineer &middot; 2013&ndash;2016</div>
            <p>First real job. E-commerce integration infrastructure. Learned enterprise Java the hard way, then learned why I didn't want to write it forever.</p>
          `
        },
        {
          name: "SUNY Albany / ACM",
          icon: "★",
          detail: `
            <h1>SUNY Albany</h1>
            <div class="ins-subtitle">ACM Chapter President</div>
            <p>Ran the computer science student chapter. Organized hackathons, talks, the occasional bad pizza. Got a lot of people into a room to ship code that didn't need to exist, which turns out to be the best training for the rest of a career.</p>
          `
        }
      ]
    },
    {
      name: "Projects",
      icon: "◆",
      children: [
        {
          name: "Stock Unlock.app",
          icon: "$",
          detail: `
            <h1>Stock Unlock.app</h1>
            <div class="ins-subtitle">Retail investor research, priced like it respects you</div>
            <p>Fundamentals, screener, watchlists, and a community of people who actually read 10-Ks. The product bet: serious tools for serious amateurs, at a price that doesn't assume you're a hedge fund.</p>
            <div class="meta-tag">React</div>
            <div class="meta-tag">TypeScript</div>
            <div class="meta-tag">Postgres</div>
            <div class="meta-tag">Python</div>
          `
        },
        {
          name: "personal-website.nextstep",
          icon: "□",
          detail: `
            <h1>You're looking at it</h1>
            <p>This is one of seventeen parallel prototypes for a personal-site rebuild. NeXTSTEP reference. Helvetica, chrome, black workspace, column-view browser, vertical dock, Digital Librarian node graph, Rubik's Cube as an app.</p>
            <p>Vanilla HTML/CSS/JS. No build step. Three.js via CDN for the cube. Designer-prestige retro.</p>
            <div class="meta-tag">vanilla JS</div>
            <div class="meta-tag">three.js</div>
            <div class="meta-tag">helvetica</div>
          `
        },
        {
          name: "ambient.cube",
          icon: "⧉",
          detail: `
            <h1>ambient.cube</h1>
            <p>A 3D Rubik's cube that slowly solves itself while you browse. Open the Cube app on the dock. It's deliberately not fast &mdash; my real solves look different &mdash; but it keeps the room warm.</p>
            <p class="mono">PB: 9.42s &middot; Ao12: 13.95s &middot; method: CFOP</p>
          `
        }
      ]
    },
    {
      name: "Hobbies",
      icon: "♫",
      children: [
        {
          name: "Rubik's Cube",
          icon: "⧉",
          detail: `
            <h1>Rubik's Cube</h1>
            <div class="ins-subtitle">Competitive. Unicycled. Sub-14.</div>
            <div class="kv">
              <div class="k">Personal Best</div><div class="v">9.42 seconds</div>
              <div class="k">Average of 12</div><div class="v">13.95 seconds</div>
              <div class="k">Method</div><div class="v">CFOP (Fridrich)</div>
              <div class="k">Notable stunt</div><div class="v">Solved it on a unicycle in a talent show</div>
            </div>
            <p>I've been solving cubes for a long time. The unicycle happened because at some point "solving a cube" stops being a trick and you have to raise the difficulty on yourself. This is also, in retrospect, how I run companies.</p>
          `
        },
        {
          name: "Getting Married",
          icon: "♥",
          detail: `
            <h1>Getting Married</h1>
            <p>This year. The venue has good WiFi; I checked.</p>
          `
        },
        {
          name: "Reading",
          icon: "✒",
          detail: `
            <h1>Reading</h1>
            <ul>
              <li>Old startup writing &mdash; pmarca, Graham, Bezos letters.</li>
              <li>Anything about failure modes of large systems.</li>
              <li>The design history around this very UI &mdash; Dieter Rams, Tufte, NeXT interface docs.</li>
            </ul>
          `
        }
      ]
    },
    {
      name: "Stock Unlock",
      icon: "$",
      children: [
        {
          name: "The one-liner",
          icon: "¶",
          detail: `
            <h1>Stock Unlock &mdash; the one-liner</h1>
            <p>Built it, scaled to 8 employees + thousands of customers, profitable side business, not full-time, on to the next chapter.</p>
          `
        },
        {
          name: "By the numbers",
          icon: "#",
          detail: `
            <h1>By the numbers</h1>
            <div class="kv">
              <div class="k">YC batch</div><div class="v">W22</div>
              <div class="k">Seed raised</div><div class="v">$1.335M</div>
              <div class="k">Team (peak)</div><div class="v">8</div>
              <div class="k">Paying customers</div><div class="v">Thousands</div>
              <div class="k">Current state</div><div class="v">Profitable, owner-operated side business</div>
            </div>
          `
        },
        {
          name: "What I learned",
          icon: "□",
          detail: `
            <h1>What I learned</h1>
            <ul>
              <li>Small teams outperform. Eight humans who trust each other will outrun fifty who don't.</li>
              <li>Pricing is a product decision. The number on the card defines who shows up.</li>
              <li>Profitability buys optionality. It's also the thing nobody hands you.</li>
              <li>You don't have to sell, exit, or die. "Keep running it quietly" is a legitimate third door.</li>
            </ul>
          `
        }
      ]
    },
    {
      name: "Contact",
      icon: "✉",
      children: [
        {
          name: "Email",
          icon: "@",
          detail: `
            <h1>Email</h1>
            <p class="mono">jake@stockunlock.com</p>
            <p>The fastest channel. I read it. I reply if the message is real.</p>
            <p><a href="mailto:jake@stockunlock.com">Open a draft &#9654;</a></p>
          `
        },
        {
          name: "Social",
          icon: "◎",
          detail: `
            <h1>Social</h1>
            <ul>
              <li><b>Twitter / X</b> &mdash; @jakeruth (occasional, sincere)</li>
              <li><b>LinkedIn</b> &mdash; /in/jakeruth (dormant but accurate)</li>
              <li><b>GitHub</b> &mdash; /jakeruth</li>
            </ul>
          `
        },
        {
          name: "What to say",
          icon: "?",
          detail: `
            <h1>What to say</h1>
            <p>Good messages tell me:</p>
            <ol>
              <li>Who you are in one line.</li>
              <li>What you're building in one line.</li>
              <li>What you want from me in one line.</li>
            </ol>
            <p>Three lines beats three paragraphs. I will read either but reply faster to the first.</p>
          `
        }
      ]
    }
  ]
};

// Digital Librarian graph (concentric rings)
const LIB_GRAPH = {
  center: { id: 'jake', label: 'Jake Ruth', detail: 'Software engineer, founder. The root of the index. 13 years shipping code, most of it still running somewhere.' },
  rings: [
    {
      radius: 90,
      nodes: [
        { id: 'stockunlock', label: 'Stock Unlock', color: '#e5b700', detail: 'Co-founded, YC W22, $1.335M seed, scaled to 8 / thousands of customers. Now a profitable side business.' },
        { id: 'oscar', label: 'Oscar Health', color: '#d4d4d4', detail: 'Software engineer, 2017-2021. Healthcare at real scale. Taught me regulated-industry engineering.' },
        { id: 'youni', label: 'Youni', color: '#b8b8b8', detail: 'Early-stage engineer, 2015-2016. First taste of zero-to-one.' },
        { id: 'commercehub', label: 'CommerceHub', color: '#a0a0a0', detail: 'First job, 2013-2016. Enterprise integration infra. Learned Java, left Java.' },
        { id: 'suny', label: 'SUNY Albany', color: '#7a7a7a', detail: 'BS in CS. ACM Chapter President.' }
      ]
    },
    {
      radius: 165,
      nodes: [
        { id: 'founder', label: 'Founder', color: '#e5b700', detail: 'Built a company from zero. Raised. Hired. Fired. Shipped. Kept the lights on. Available for the next one.' },
        { id: 'engineer', label: 'Engineer', color: '#d4d4d4', detail: '~13 years. Full-stack, leaning backend. TypeScript, Python, Postgres, React. I still prefer code to meetings.' },
        { id: 'yc', label: 'YC W22', color: '#e5b700', detail: 'Y Combinator Winter 2022. The batch that taught me how to ship on a cadence.' },
        { id: 'philosophy', label: 'Driver Philosophy', color: '#b8b8b8', detail: 'AI is the passenger. Humans stay at the wheel. Tools that hide the wheel crash someone else\'s car.' },
        { id: 'pricing', label: 'Pricing Ethics', color: '#b8b8b8', detail: 'Don\'t overcharge for shit software. The gap between price and value is where trust dies.' },
        { id: 'profitable', label: 'Profitable', color: '#e5b700', detail: 'Stock Unlock runs profitably without me full-time. That is the cleanest compliment a product can give you.' }
      ]
    },
    {
      radius: 220,
      nodes: [
        { id: 'cube', label: 'Rubik\'s Cube', color: '#e5b700', detail: 'PB 9.42s. Ao12 13.95s. CFOP method. The cube is how I learned that practice is just debugging yourself.' },
        { id: 'unicycle', label: 'Unicycle', color: '#d4d4d4', detail: 'Solved a cube on a unicycle in a talent show. This is also, somehow, how I run companies.' },
        { id: 'wedding', label: 'Getting Married', color: '#b8b8b8', detail: 'This year. The venue has WiFi.' },
        { id: 'acm', label: 'ACM President', color: '#a0a0a0', detail: 'Ran the SUNY Albany ACM chapter. Hackathons, talks, bad pizza.' },
        { id: 'reading', label: 'Reading', color: '#7a7a7a', detail: 'Old startup writing, failure modes of large systems, interface design history.' },
        { id: 'next', label: 'NeXTSTEP', color: '#d4d4d4', detail: 'The operating system this site is paying tribute to. Jobs\'s post-Apple OS. Later became OS X. The austere one.' }
      ]
    }
  ]
};
