/* Network graph data for Jake Ruth.
   Categories: career, skill, project, hobby, person.
   Each node has: id, label, category, blurb (short 2-3 sentence Jake-voice context).
   Edges are relational: shared story, shared skill, same era, shared person.
*/

window.GRAPH_DATA = (function () {
  const nodes = [
    // ----- CAREER (blue) -----
    { id: "commercehub",  label: "CommerceHub",   category: "career",
      blurb: "First real job, 2013–2016. Learned how big Java systems actually behave when nobody's looking. Cut my teeth shipping e-commerce integrations at scale." },
    { id: "youni",        label: "Youni",         category: "career",
      blurb: "2015–16. Tiny startup, giant product surface. This is where I learned that shipping fast and shipping right aren't the same sentence — but they can be the same week." },
    { id: "oscar",        label: "Oscar Health",  category: "career",
      blurb: "2017–2021. Four years building health-insurance infrastructure that shouldn't be this hard. Lots of Python, lots of Postgres, lots of humans." },
    { id: "stockunlock",  label: "Stock Unlock",  category: "career",
      blurb: "YC W22, $1.335M seed, peaked at 8 employees, profitable side business. Built it, scaled it, still running — but not full-time anymore. Next chapter." },
    { id: "acm",          label: "ACM @ UAlbany", category: "career",
      blurb: "President of the computer science club in college. First taste of organizing engineers into something that resembled a team." },
    { id: "yc",           label: "YC W22",        category: "career",
      blurb: "Three months of office hours, demo day, and learning that 'talk to users' is not a cliché, it's an operating system." },

    // ----- SKILLS (green) -----
    { id: "python",       label: "Python",         category: "skill",
      blurb: "My daily driver for a decade. Great for moving data, modeling financials, and writing scripts that end up running in production for three years." },
    { id: "typescript",   label: "TypeScript",     category: "skill",
      blurb: "The only JavaScript I trust. Stock Unlock's front-end is a large TS codebase and I still enjoy touching it." },
    { id: "golang",       label: "Go",             category: "skill",
      blurb: "For services that need to be fast, small, and boring in all the right ways." },
    { id: "react",        label: "React",          category: "skill",
      blurb: "I've shipped React since hooks were a proposal. These days I lean on it for product surfaces, not portfolios." },
    { id: "aws",          label: "AWS",            category: "skill",
      blurb: "Have run it in anger: ECS, RDS, SES, Lambda, the whole alphabet. I prefer boring primitives over magical platforms." },
    { id: "postgres",     label: "Postgres",       category: "skill",
      blurb: "My default database. If you think you need something else, you probably don't yet." },
    { id: "docker",       label: "Docker",         category: "skill",
      blurb: "Containers for every service I ship. Not glamorous, just correct." },
    { id: "ai-tooling",   label: "AI tooling",     category: "skill",
      blurb: "Driver-in-the-driver's-seat philosophy: I use LLMs like a power tool, not a pilot. Saved me weeks across Stock Unlock and side projects." },
    { id: "sysdesign",    label: "System design",  category: "skill",
      blurb: "The part of the job I like most. Drawing boxes and making them true." },
    { id: "pattern-rec",  label: "Pattern recognition", category: "skill",
      blurb: "The meta-skill behind cubing, coding, and investing. The job is seeing the shape before anyone names it." },
    { id: "finance",      label: "Financial modeling", category: "skill",
      blurb: "Years of building DCFs, ratio tables, and stock screeners. Spreadsheets became Python became a product." },

    // ----- PROJECTS (red) -----
    { id: "p-stockunlock", label: "Stock Unlock app", category: "project",
      blurb: "A stock research platform for retail investors who are sick of being overcharged for bad software. Charts, fundamentals, screeners, alerts — the whole stack, built to be fair." },
    { id: "p-youni",       label: "Youni app",        category: "project",
      blurb: "A college-focused social app. Shipped the mobile and server side. Great scar tissue for an early-20s engineer." },
    { id: "p-oscar-bot",   label: "Oscar chatbot",    category: "project",
      blurb: "Internal tool at Oscar Health to automate answering the same questions the same way every time. Early NLP, before LLMs made this easy." },
    { id: "p-discord-bot", label: "Discord log-query bot", category: "project",
      blurb: "A little bot that grep's production logs from Discord. Saved me a browser tab every day for two years." },
    { id: "p-webflow",     label: "Webflow rebuild",  category: "project",
      blurb: "Rebuilt the Stock Unlock marketing site in Webflow so non-engineers could ship landing pages without waiting on me." },
    { id: "p-email",       label: "Self-hosted email", category: "project",
      blurb: "Spun up my own transactional email stack because SES on a weekend is cheaper than Mailgun on a Tuesday." },
    { id: "p-personal",    label: "This website",     category: "project",
      blurb: "The site you're on. A rebuild from first principles — vanilla stack, twelve parallel concepts, one voice." },

    // ----- HOBBIES (orange) -----
    { id: "rubiks",        label: "Rubik's cube",     category: "hobby",
      blurb: "13.95s average. Competed on and off for years. It's the closest thing I have to a meditation that also ships." },
    { id: "unicycle",      label: "Unicycle",         category: "hobby",
      blurb: "The talent-show classic: solve a Rubik's cube while riding a unicycle. Yes, at the same time. Yes, on a stage." },
    { id: "skate",         label: "Skateboarding",    category: "hobby",
      blurb: "The hobby that taught me how to fall in public and get back up." },
    { id: "rugby",         label: "Rugby",            category: "hobby",
      blurb: "Played through college. Rugby is the best on-ramp I know for trusting 14 other people to do their jobs while you do yours." },
    { id: "meditation",    label: "Meditation",       category: "hobby",
      blurb: "A daily practice. The cheat code for staying calm while building a company and planning a wedding." },
    { id: "ddr",           label: "DDR",              category: "hobby",
      blurb: "Dance Dance Revolution. Cardio that feels like a video game. I take the arrows seriously." },
    { id: "guitar-hero",   label: "Guitar Hero",      category: "hobby",
      blurb: "Still the best-designed rhythm game ever shipped. Fight me." },
    { id: "climbing",      label: "Rock climbing",    category: "hobby",
      blurb: "Project-based problem solving with real consequences. A good reset for a software brain." },
    { id: "wedding",       label: "Getting married",  category: "hobby",
      blurb: "Not a hobby, a life event. But it lives on this graph because it's shaping the year." },
    { id: "nyc",           label: "NYC",              category: "hobby",
      blurb: "Home base. The city where most of this graph actually happened." },

    // ----- PEOPLE (purple) -----
    { id: "daniel",        label: "Daniel Pronk",     category: "person",
      blurb: "YouTube investor, collaborator, and a big part of why Stock Unlock exists as a product people actually use. We built the tool he wished he had." },
    { id: "nick",          label: "Nick Puljik",      category: "person",
      blurb: "Co-conspirator on Stock Unlock and long-time collaborator. The person I trust to tell me when an idea is bad before it costs six months." },
    { id: "alan",          label: "Alan Warren",      category: "person",
      blurb: "Mentor and manager from Oscar Health era. Taught me how to operate in a big system without losing the thread." },
    { id: "prof-ravi",     label: "Prof. Ravi",       category: "person",
      blurb: "College mentor. First person who treated my questions like they were worth an hour of real time." },
    { id: "prof-ellen",    label: "Prof. Ellen",      category: "person",
      blurb: "Another college mentor. Pushed me into research and into running ACM when I didn't think I was ready." },
    { id: "fiancee",       label: "Fiancée",          category: "person",
      blurb: "The person the rest of the graph is for." },
  ];

  // edges: undirected relationships. Keep the narrative tight.
  const edges = [
    // Career timeline + affiliations
    ["acm", "commercehub"],
    ["commercehub", "youni"],
    ["youni", "oscar"],
    ["oscar", "stockunlock"],
    ["stockunlock", "yc"],

    // People to career
    ["alan", "oscar"],
    ["daniel", "stockunlock"],
    ["nick", "stockunlock"],
    ["daniel", "nick"],
    ["prof-ravi", "acm"],
    ["prof-ellen", "acm"],
    ["prof-ravi", "prof-ellen"],
    ["fiancee", "nyc"],
    ["fiancee", "wedding"],

    // Career to projects
    ["stockunlock", "p-stockunlock"],
    ["stockunlock", "p-webflow"],
    ["stockunlock", "p-email"],
    ["oscar", "p-oscar-bot"],
    ["youni", "p-youni"],
    ["p-personal", "stockunlock"],

    // Projects to skills
    ["p-stockunlock", "typescript"],
    ["p-stockunlock", "react"],
    ["p-stockunlock", "python"],
    ["p-stockunlock", "postgres"],
    ["p-stockunlock", "aws"],
    ["p-stockunlock", "docker"],
    ["p-stockunlock", "sysdesign"],
    ["p-stockunlock", "finance"],
    ["p-stockunlock", "ai-tooling"],
    ["p-oscar-bot", "python"],
    ["p-oscar-bot", "ai-tooling"],
    ["p-discord-bot", "python"],
    ["p-discord-bot", "golang"],
    ["p-email", "aws"],
    ["p-email", "docker"],
    ["p-webflow", "react"],
    ["p-youni", "react"],
    ["p-youni", "postgres"],
    ["p-personal", "react"],

    // Career to skills (stuff used there)
    ["commercehub", "sysdesign"],
    ["oscar", "python"],
    ["oscar", "postgres"],
    ["oscar", "aws"],
    ["oscar", "sysdesign"],
    ["stockunlock", "typescript"],
    ["stockunlock", "ai-tooling"],

    // Skill clusters
    ["react", "typescript"],
    ["postgres", "sysdesign"],
    ["docker", "aws"],
    ["golang", "sysdesign"],
    ["ai-tooling", "sysdesign"],
    ["python", "finance"],
    ["finance", "p-stockunlock"],

    // Pattern recognition bridge — the thesis
    ["pattern-rec", "rubiks"],
    ["pattern-rec", "sysdesign"],
    ["pattern-rec", "finance"],
    ["pattern-rec", "ai-tooling"],

    // Hobby connections
    ["rubiks", "unicycle"],
    ["rubiks", "acm"],
    ["skate", "rugby"],
    ["rugby", "nyc"],
    ["meditation", "wedding"],
    ["meditation", "stockunlock"],
    ["ddr", "guitar-hero"],
    ["guitar-hero", "pattern-rec"],
    ["climbing", "meditation"],
    ["climbing", "nyc"],

    // Daniel ↔ investing thesis
    ["daniel", "finance"],
    ["daniel", "p-stockunlock"],

    // YC connective tissue
    ["yc", "p-stockunlock"],
    ["yc", "nick"],
    ["yc", "daniel"],
  ];

  return { nodes, edges: edges.map(([source, target]) => ({ source, target })) };
})();
