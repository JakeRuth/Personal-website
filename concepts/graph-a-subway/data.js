// Ruth Transit Authority — system data.
// Coordinates are tuned so interchange stations line up across lines.
// viewBox is 1600 x 1000.

const LINES = {
  red: {
    id: "red",
    name: "Career",
    color: "#E4002B",
    tag: "R",
    motto: "The day-job line. CommerceHub to whatever's next.",
    stops: [
      "commercehub", "youni", "oscar", "stock_unlock", "next_chapter"
    ]
  },
  blue: {
    id: "blue",
    name: "Education",
    color: "#0039A6",
    tag: "E",
    motto: "Albany. CS. ACM. Out by 2015. Straight into the career line.",
    stops: ["albany_ny", "suny_albany", "cs_major", "acm_president", "graduation_2015", "oscar"]
  },
  yellow: {
    id: "yellow",
    name: "Hobbies",
    color: "#F2B600",
    tag: "H",
    motto: "Things I do when nobody's paying me. Occasionally on a stage.",
    stops: ["rubiks_cube", "talent_show", "skateboarding", "ddr_gh", "rugby", "meditation"]
  },
  green: {
    id: "green",
    name: "Projects",
    color: "#00A65A",
    tag: "P",
    motto: "Ship list. Receipts only.",
    stops: ["youni_app", "oscar_chatbot", "stock_unlock", "customerio_migration", "discord_bot"]
  },
  orange: {
    id: "orange",
    name: "People",
    color: "#FF6A13",
    tag: "X",
    motto: "The humans who shaped this system.",
    stops: ["peter", "alan_warren", "oscar", "talent_show", "stock_unlock", "daniel_pronk", "nick_puljik", "fiancee"]
  },
  purple: {
    id: "purple",
    name: "AI / Tools",
    color: "#8E44AD",
    tag: "A",
    motto: "Tool chain, in order of acquisition. Stops at every company it rewired.",
    stops: ["copilot", "cursor", "stock_unlock", "claude_code", "codex", "cmux", "current_stack"]
  },
  teal: {
    id: "teal",
    name: "Identity",
    color: "#00A3A1",
    tag: "I",
    motto: "Where I'm from, who I became, where I'm going.",
    stops: ["albany_ny", "westchester", "nyc", "rubiks_cube", "founder", "next_chapter"]
  }
};

// Each station: position (x,y), lines it touches, label placement, and Jake-voice copy.
const STATIONS = {
  // ----- RED (career) : lower horizontal sweep -----
  commercehub: {
    name: "CommerceHub",
    x: 150, y: 520, lines: ["red"],
    terminal: true,
    label: { dx: 0, dy: 34, anchor: "middle" },
    kicker: "2013 — 2016",
    brief: "First real job. Albany-based, e-commerce plumbing.",
    body: "My intro to production code. Learned how software actually ships when real money and real deadlines are attached — not the fun part, but the part that makes you a real engineer.",
    meta: { Era: "2013 – 2016", Role: "Engineer", City: "Albany, NY" }
  },
  youni: {
    name: "Youni",
    x: 330, y: 520, lines: ["red"],
    label: { dx: 0, dy: 34, anchor: "middle" },
    kicker: "2015 — 2016",
    brief: "Tiny startup. Wore every hat.",
    body: "Overlapping with the tail of CommerceHub. Small team, big opinions, the first place I got to feel what it's like to own something instead of rent it.",
    meta: { Era: "2015 – 2016", Role: "Engineer", Stack: "Mobile-first" }
  },
  oscar: {
    name: "Oscar Health",
    x: 620, y: 520, lines: ["red", "blue", "orange"],
    interchange: true,
    label: { dx: 0, dy: -20, anchor: "middle", size: "big" },
    kicker: "2017 — 2021",
    brief: "Four years. NYC. Where I met Alan and Peter.",
    body: "Health insurance that didn't hate you. I built the Oscar chatbot, lived the NYC startup life, and met the people who'd shape the next decade — Alan Warren and Peter, still two of the sharpest engineers I know.",
    meta: { Era: "2017 – 2021", City: "NYC", Notables: "Peter, Alan Warren" }
  },
  stock_unlock: {
    name: "Stock Unlock",
    x: 980, y: 520, lines: ["red", "green", "orange", "purple"],
    interchange: true,
    label: { dx: 0, dy: -22, anchor: "middle", size: "big" },
    kicker: "2022 — present",
    brief: "YC W22. Built it, scaled it, profitable, not full-time.",
    body: "YC W22, $1.335M seed, peak 8 employees, thousands of customers, profitable as a side business. I hate overcharging for shit software, so we built retail-investor tooling that doesn't. Daniel Pronk partnered in on the content side; Nick Puljik held it together. Not full-time there as of April 2026 — next chapter.",
    meta: { Era: "2022 – now", Stage: "YC W22 · $1.335M seed", Team: "8 peak · thousands of customers", Status: "Profitable side business" }
  },
  next_chapter: {
    name: "Next Chapter",
    x: 1340, y: 520, lines: ["red", "teal"],
    terminal: true,
    special: "terminus_q",
    label: { dx: 0, dy: 36, anchor: "middle", size: "big" },
    kicker: "2026 — ?",
    brief: "Taking the next train. Destination: TBD.",
    body: "Thirteen years of code behind me, a profitable thing still humming in the background, and the pen uncapped. Looking for the problem worth the next decade. Email me at jake@stockunlock.com if you think you have it.",
    meta: { Status: "Open to conversation", Bias: "Builder · founder · IC at heart" }
  },

  // ----- BLUE (education) : upper-left descent into Oscar -----
  albany_ny: {
    name: "Albany, NY",
    x: 110, y: 220, lines: ["blue", "teal"],
    interchange: true,
    terminal: true,
    label: { dx: 0, dy: -26, anchor: "middle", size: "big" },
    kicker: "Hometown",
    brief: "Where it starts. Upstate, cold, formative.",
    body: "Upstate New York kid. Albany gave me CS, ACM, Rubik's cubes on cafeteria tables, and the first version of the person writing this.",
    meta: { Type: "Origin", Region: "Capital District, NY" }
  },
  suny_albany: {
    name: "SUNY Albany",
    x: 270, y: 200, lines: ["blue"],
    label: { dx: 18, dy: 4 },
    kicker: "Undergrad",
    brief: "State school. Good bones.",
    body: "Not an Ivy. Didn't need to be. SUNY Albany gave me the CS fundamentals and a stage — the ACM chapter — to figure out who I was as a technologist.",
    meta: { Years: "2011 – 2015", Degree: "Computer Science" }
  },
  cs_major: {
    name: "CS Major",
    x: 400, y: 260, lines: ["blue"],
    label: { dx: 18, dy: 4 },
    kicker: "Declared",
    brief: "Algorithms, OS, the usual.",
    body: "The declaration that locked it in. Compilers, operating systems, algorithms — the classics that still quietly run under everything I build.",
    meta: { Focus: "Systems · theory", Language0: "Java, then everything" }
  },
  acm_president: {
    name: "ACM President",
    x: 530, y: 320, lines: ["blue"],
    label: { dx: 18, dy: 4 },
    kicker: "Club leadership",
    brief: "Ran the ACM chapter. First taste of herding nerds.",
    body: "President of the ACM chapter at SUNY Albany. First time I learned that 'leading technical people' is 90% logistics and 10% actually technical — a ratio that has never budged.",
    meta: { Role: "Chapter President", Skill: "Herding nerds" }
  },
  graduation_2015: {
    name: "Graduation 2015",
    x: 620, y: 400, lines: ["blue"],
    label: { dx: 18, dy: 4 },
    kicker: "May 2015",
    brief: "Cap and gown. Next stop: payroll.",
    body: "Walked out with a CS degree, a head full of ideas, and a job lined up. The transfer point from student to engineer.",
    meta: { Year: "2015", Next: "Full-time engineering" }
  },

  // ----- YELLOW (hobbies) : horizontal top band -----
  rubiks_cube: {
    name: "Rubik's Cube",
    x: 780, y: 180, lines: ["yellow", "teal"],
    interchange: true,
    label: { dx: 0, dy: -20, anchor: "middle", size: "big" },
    kicker: "13.95s avg",
    brief: "Competitive speedcuber. Sub-14 average.",
    body: "13.95 second average. Competitive. Years of muscle memory in my fingers. Genuinely one of the things I'm proudest of that has nothing to do with software.",
    meta: { PB: "sub-12", Avg: "13.95s", Since: "high school" }
  },
  skateboarding: {
    name: "Skateboarding",
    x: 920, y: 180, lines: ["yellow"],
    label: { dx: 0, dy: -18, anchor: "middle" },
    kicker: "Four wheels",
    brief: "Scabs and kickflips.",
    body: "The kind of hobby where 99% of the reps end with you on the ground. Great training for startups.",
    meta: { Use: "commute + fun" }
  },
  ddr_gh: {
    name: "DDR / Guitar Hero",
    x: 1060, y: 180, lines: ["yellow"],
    label: { dx: 0, dy: -18, anchor: "middle" },
    kicker: "Rhythm stack",
    brief: "Foot coordination + plastic instruments.",
    body: "Dance Dance Revolution and Guitar Hero — the original 'practice things with your hands until they're automatic' curriculum, long before I knew I was training for coding.",
    meta: { Gear: "soft pad, plastic guitar", Side: "both feet" }
  },
  rugby: {
    name: "Rugby",
    x: 1200, y: 180, lines: ["yellow"],
    label: { dx: 0, dy: -18, anchor: "middle" },
    kicker: "Full contact",
    brief: "Sport that teaches you to get up.",
    body: "No pads. Lots of bruises. A fantastic antidote to being a person who stares at a screen for a living.",
    meta: { Position: "wherever they needed" }
  },
  meditation: {
    name: "Meditation",
    x: 1340, y: 180, lines: ["yellow"],
    terminal: true,
    label: { dx: 0, dy: -18, anchor: "middle" },
    kicker: "Still learning",
    brief: "Counter-balance to everything else on this map.",
    body: "Sitting still on purpose. The hardest hobby on this line, and the one that makes the others work.",
    meta: { Cadence: "most mornings" }
  },

  // ----- GREEN (projects) : middle meandering band -----
  youni_app: {
    name: "Youni App",
    x: 260, y: 640, lines: ["green"],
    terminal: true,
    label: { dx: 0, dy: 30, anchor: "middle" },
    kicker: "Early project",
    brief: "First consumer product work.",
    body: "Shipped at Youni. The first app I worked on that real people opened on real phones.",
    meta: { Platform: "mobile" }
  },
  oscar_chatbot: {
    name: "Oscar Chatbot",
    x: 470, y: 640, lines: ["green"],
    label: { dx: 0, dy: 30, anchor: "middle" },
    kicker: "At Oscar",
    brief: "Conversational UI before it was cool.",
    body: "Oscar's member chatbot. This was NLP before transformers. Rules engines, careful UX, and a whole lot of 'what if they just type nonsense?'",
    meta: { Era: "pre-LLM", Stack: "Node · rules + ML" }
  },
  customerio_migration: {
    name: "Customer.io Migration",
    x: 1140, y: 640, lines: ["green"],
    label: { dx: 0, dy: 30, anchor: "middle" },
    kicker: "Stock Unlock infra",
    brief: "Cut-over without dropping a single drip.",
    body: "Moved Stock Unlock's lifecycle email onto Customer.io without breaking drip campaigns or churning users. The kind of migration you only notice when it goes wrong.",
    meta: { Scope: "Full lifecycle", Risk: "High, because email" }
  },
  discord_bot: {
    name: "Discord Bot",
    x: 1340, y: 640, lines: ["green"],
    terminal: true,
    label: { dx: 0, dy: 30, anchor: "middle" },
    kicker: "Community",
    brief: "Glue for the Stock Unlock community.",
    body: "A Discord bot that holds the Stock Unlock community together — onboarding, alerts, and the occasional custom command because people asked nicely.",
    meta: { Host: "always on", Lang: "TypeScript" }
  },

  // ----- ORANGE (people) : winding through interchanges -----
  peter: {
    name: "Peter",
    x: 380, y: 460, lines: ["orange"],
    terminal: true,
    label: { dx: -14, dy: 4, anchor: "end" },
    kicker: "Oscar era",
    brief: "One of the best engineers I've worked with.",
    body: "Met at Oscar. Engineer's engineer — the kind of person whose PR reviews quietly teach you a whole new layer of taste.",
    meta: { Met: "Oscar Health" }
  },
  alan_warren: {
    name: "Alan Warren",
    x: 520, y: 460, lines: ["orange"],
    label: { dx: 0, dy: -16, anchor: "middle" },
    kicker: "Oscar era",
    brief: "CTO, mentor, sparring partner.",
    body: "Worked with Alan at Oscar. Sharp technical leader, even sharper judge of what problems actually matter. A big reason I understand leverage.",
    meta: { Met: "Oscar Health" }
  },
  talent_show: {
    name: "Talent Show",
    x: 780, y: 420, lines: ["orange", "yellow"],
    interchange: true,
    label: { dx: 24, dy: 4, anchor: "start", size: "big" },
    kicker: "Unicycle + cube",
    brief: "Solved a Rubik's cube on a unicycle. On stage.",
    body: "The Oscar talent show. I rode a unicycle across a stage while solving a Rubik's cube. It went fine. People clapped. One of the more on-brand things I've ever done.",
    meta: { Venue: "Oscar Health talent show", Props: "1 unicycle, 1 cube" }
  },
  daniel_pronk: {
    name: "Daniel Pronk",
    x: 1100, y: 460, lines: ["orange"],
    label: { dx: 0, dy: -18, anchor: "middle" },
    kicker: "Stock Unlock",
    brief: "Content partner. Stock Unlock's voice to the world.",
    body: "Partnered on Stock Unlock. Daniel carries the megaphone and the trust of a huge retail-investor audience — the perfect counter-weight to me in the basement shipping features.",
    meta: { Role: "Co-founder / content" }
  },
  nick_puljik: {
    name: "Nick Puljik",
    x: 1200, y: 460, lines: ["orange"],
    label: { dx: 0, dy: -18, anchor: "middle" },
    kicker: "Stock Unlock",
    brief: "The operator that held it together.",
    body: "Stock Unlock. Nick is the reason a small team ran like a bigger one — operations, product sense, and a bias for doing the un-glamorous thing that actually moves the number.",
    meta: { Role: "Operations / product" }
  },
  fiancee: {
    name: "Fiancée",
    x: 1340, y: 440, lines: ["orange"],
    terminal: true,
    label: { dx: 0, dy: -18, anchor: "middle" },
    kicker: "Getting married",
    brief: "The station that rerouted the whole system.",
    body: "Getting married. The most important person on this map, and tastefully, the one I won't write a blurb about on the internet. You'll have to take the train yourself.",
    meta: { Status: "Engaged" }
  },

  // ----- PURPLE (AI / tools) : diagonal through Stock Unlock -----
  copilot: {
    name: "Copilot",
    x: 780, y: 720, lines: ["purple"],
    terminal: true,
    label: { dx: 0, dy: 30, anchor: "middle" },
    kicker: "The on-ramp",
    brief: "First real AI pair.",
    body: "The first time 'AI in the editor' stopped being a demo and started being muscle memory. Everything downstream on this line is because of this stop.",
    meta: { Year: "2022+" }
  },
  cursor: {
    name: "Cursor",
    x: 880, y: 680, lines: ["purple"],
    label: { dx: 0, dy: 26, anchor: "middle" },
    kicker: "IDE-native",
    brief: "Editor learned to talk back.",
    body: "Cursor made the conversation a first-class citizen of the editor. The first time I felt AI was a collaborator instead of autocomplete-with-a-hat.",
    meta: { Upgrade: "over Copilot" }
  },
  claude_code: {
    name: "Claude Code",
    x: 1060, y: 580, lines: ["purple"],
    label: { dx: 18, dy: -8, anchor: "start", size: "big" },
    kicker: "Agentic",
    brief: "When the assistant started actually doing the work.",
    body: "Claude Code. The step where the agent leaves the sidebar, gets the keys, and starts opening files. Where a lot of my day lives now.",
    meta: { Use: "daily driver" }
  },
  codex: {
    name: "Codex",
    x: 1180, y: 680, lines: ["purple"],
    label: { dx: 0, dy: 26, anchor: "middle" },
    kicker: "Parallel brain",
    brief: "Background async agent.",
    body: "Long-running agent work. Useful in a different shape than the interactive loop.",
    meta: { Mode: "async" }
  },
  cmux: {
    name: "CMUX",
    x: 1280, y: 720, lines: ["purple"],
    label: { dx: 0, dy: 28, anchor: "middle" },
    kicker: "Multiplex",
    brief: "Agents in parallel lanes.",
    body: "Run multiple agents. Watch them work. Pick the branch that's actually good. Parallel development as a practice, not a gimmick.",
    meta: { Pattern: "agent swarm" }
  },
  current_stack: {
    name: "Current Stack",
    x: 1400, y: 740, lines: ["purple"],
    terminal: true,
    label: { dx: 0, dy: 28, anchor: "middle" },
    kicker: "2026",
    brief: "TypeScript, Postgres, and whatever the agent hands me.",
    body: "TypeScript + Postgres + React with an agent in every tab. Pragmatic, boring on purpose, fast on the edges that matter.",
    meta: { Stack: "TS · Postgres · React", Bias: "boring core, sharp edges" }
  },

  // ----- TEAL (identity) : the spine -----
  westchester: {
    name: "Westchester",
    x: 260, y: 820, lines: ["teal"],
    label: { dx: 0, dy: -18, anchor: "middle" },
    kicker: "Post-college",
    brief: "Upstate to just-north-of-NYC.",
    body: "The first move. Not yet the city, but within gravitational pull. The commuter-rail chapter of the story.",
    meta: { City: "Westchester County, NY" }
  },
  nyc: {
    name: "NYC",
    x: 500, y: 820, lines: ["teal"],
    label: { dx: 0, dy: -18, anchor: "middle", size: "big" },
    kicker: "2017+",
    brief: "Oscar moved me in, the city kept me.",
    body: "Manhattan. The version of me that learned to ship at startup speed happened here. Still the backdrop on most of my best memories.",
    meta: { Era: "2017 – now" }
  },
  founder: {
    name: "Founder",
    x: 1060, y: 820, lines: ["teal"],
    label: { dx: 0, dy: -18, anchor: "middle", size: "big" },
    kicker: "Identity shift",
    brief: "The year 'engineer' gained a prefix.",
    body: "Stock Unlock flipped the title. Same job in a lot of ways, but suddenly every decision was mine to own — which is both the pitch and the warning label.",
    meta: { From: "Engineer", To: "Engineer + Founder" }
  }
};

// Legend order (top-to-bottom in the legend block).
const LEGEND_ORDER = ["red", "blue", "yellow", "green", "orange", "purple", "teal"];
