/* jake-bot — chatbot-as-site prototype.
 * no real LLM. keyword router + hand-written responses + char-by-char streaming.
 */

(function () {
  "use strict";

  const chatEl = document.getElementById("chat");
  const form = document.getElementById("composer");
  const input = document.getElementById("input");
  const sendBtn = document.getElementById("send");
  const chipsEl = document.getElementById("suggestions");

  // ----------- response database -----------
  // each entry: { keys: [regex or string], reply: string|fn(), blocks?: [] }
  // blocks are rich embeds rendered after the streamed text.

  const RESUME_BLOCK = () => ({
    type: "resume",
    title: "jake_ruth_resume.pdf",
    sub: "download · single page · updated apr 2026",
  });

  const SU_STATS_BLOCK = () => ({
    type: "stats",
    title: "Stock Unlock — by the numbers",
    stats: [
      { num: "YC W22", label: "cohort" },
      { num: "$1.335M", label: "seed raised" },
      { num: "8", label: "employees (peak)" },
      { num: "1.2K+", label: "paying customers" },
    ],
  });

  const CAREER_TIMELINE_BLOCK = () => ({
    type: "timeline",
    title: "Jake's career path",
    rows: [
      { year: "2013", title: "Intern → SWE at CommerceHub", note: "took prod down once. manager took the blame." },
      { year: "2015", title: "BS CS + Applied Math, SUNY Albany", note: "3.88 GPA. ACM club president." },
      { year: "2015–16", title: "Co-founder/CTO, Youni", note: "college social app on React Native 0.13. shut down." },
      { year: "2017–21", title: "Senior SWE, Oscar Health", note: "joined ~50 eng, left ~150+. built a chatbot with Peter." },
      { year: "2022", title: "Co-founder, Stock Unlock (YC W22)", note: "raised $1.335M seed. scaled + profitable side business." },
      { year: "2026", title: "Next chapter", note: "redefining. NYC. open to the right thing." },
    ],
  });

  // canned responses — written in Jake's voice.
  const RESPONSES = [
    {
      id: "greeting",
      keys: [/\b(hi|hey|hello|yo|sup|howdy)\b/i],
      reply:
        "hey. what do you want to know about jake? try one of the chips below, or just type something — i'll do my best.",
    },
    {
      id: "hire",
      keys: [/\bhire\b/i, /\bhiring\b/i, /\bwork with\b/i, /should i hire/i, /why him/i],
      reply:
        "short version: jake writes systems that don't fall over and he ships. 13 years coding, went through YC, scaled Stock Unlock to 8 engineers and thousands of paying customers (profitable now, side business), and he's a senior engineer who actually leads — at Oscar Health he joined at ~50 engineers and left at 150+ having become one of the people who shaped the eng culture.\n\nhe's also the kind of person who'll stay up until 2am to fix a bug, then unicycle across the office while solving a rubik's cube at the talent show. you want that person on your team.\n\nemail him: jake@stockunlock.com.",
    },
    {
      id: "stock-unlock",
      keys: [/stock[- ]?unlock/i, /\bSU\b/, /\bstartup\b/i, /\byc\b/i, /y combinator/i],
      reply:
        "Stock Unlock — investing research platform jake co-founded with Daniel Pronk (youtuber). YC W22. raised $1.335M seed. scaled to 8 employees and thousands of paying customers. it's profitable now as a side business doing ~$100–200K/yr net. jake is **not** full-time there anymore as of april 2026 — the product runs itself, the team is strong, and he's redefining his next chapter.\n\nhe's allergic to the rest of the industry overcharging retail investors for garbage. one competitor computes 'margin of safety = current price / all-time-high' which is, and i quote, 'ape-shit retarded'. stock unlock exists to not do that.",
      blocks: [SU_STATS_BLOCK],
    },
    {
      id: "rubik",
      keys: [/rubik/i, /\bcube\b/i, /cubing/i],
      reply:
        "competitive speedcuber 2008–2014. 13.95s average on 3x3. competed at Northeast US opens and US Nationals. also: solved a rubik's cube **while unicycling** at the Oscar Health talent show. not a metaphor — literal unicycle, literal cube, literal applause.\n\nthe cubing thing is why jake is good at debugging: pattern recognition under time pressure, with a plan.",
    },
    {
      id: "unicycle",
      keys: [/unicycle/i, /unicycling/i, /talent show/i],
      reply:
        "yep. at Oscar Health's office talent show jake rode a unicycle across the room while solving a rubik's cube. it's now one of the more durable legends in that eng org's history, which is saying something because those are the same people who greenlit him and peter spending a hackathon building an over-engineered internal chatbot they kept shipping new features onto for years.",
    },
    {
      id: "ai-philosophy",
      keys: [/ai philosophy/i, /\bphilosophy\b/i, /driver.*seat/i, /driven by/i, /worldview/i],
      reply:
        "**'driver in the driver's seat, not driven by the car.'**\n\njake uses AI tooling aggressively — Claude Code, Codex, CMUX for multi-instance orchestration — but he's the one making decisions. Opus 4.5 was the moment it all clicked for him; the step-change from 'clever autocomplete' to 'genuine pair engineer'. he thinks most of the AI-for-coding discourse is being led by people who either haven't used these tools seriously or who've fully surrendered to them. neither is the right answer.\n\nuse the tools. don't let the tools use you.",
    },
    {
      id: "ai-tooling",
      keys: [/claude code/i, /codex/i, /cmux/i, /ghostty/i, /tooling/i, /what tools/i, /what does he use/i, /discord bot/i],
      reply:
        "daily driver stack:\n- **Claude Code + Codex** — main pair-programmers. Opus 4.5 was his tidal-wave inflection point; 4.7 cemented it.\n- **CMUX** (wraps Ghostty) — orchestrates multiple Claude instances in parallel. one terminal, many agents.\n- **internal Discord bot** he built for Stock Unlock — non-technical teammates can ask it about logs, errors, code, and user data in plain english. it's ridiculously useful.\n\nphilosophy stays the same: he drives, the tools don't.",
    },
    {
      id: "career",
      keys: [/career/i, /\bjobs?\b/i, /resume history/i, /\bhistory\b/i, /work history/i, /oscar/i, /commercehub/i, /experience/i, /\bpast\b/i, /where has he worked/i],
      reply:
        "quick path:\n\n- **CommerceHub** (2013–16) — intern → full-time. took prod down as an intern; his manager said 'that shouldn't have been allowed to happen' and took the blame. got the internship by organizing an ACM club field trip to Tekkapalooza and handing out his resume in person.\n- **Youni** (2015–16) — co-founder/CTO. iOS social app on React Native 0.13. couldn't crack the cold-start problem. shut it down. learned a lot.\n- **Oscar Health** (2017–21) — senior SWE. joined ~50 engineers, left ~150+. one of the culture-builders. built a famously over-engineered hackathon chatbot with his coworker peter.\n- **Stock Unlock** (2022–) — co-founder. YC W22. scaled it, made it profitable, stepped back.\n\ntimeline below.",
      blocks: [CAREER_TIMELINE_BLOCK],
    },
    {
      id: "youni",
      keys: [/youni/i, /college app/i, /react native/i, /first startup/i],
      reply:
        "Youni (2015–16). jake's first startup. co-founder + CTO. a college-focused social media iOS app, built on React Native v0.13 — which in 2015 meant rewriting half the framework yourself. classic cold-start problem: you need users to attract users. they couldn't solve it. they shut it down.\n\nit's the kind of failure that aged well. jake knows what a zero-to-one product with no distribution actually feels like, and that's why stock unlock made it.",
    },
    {
      id: "resume",
      keys: [/resume/i, /\bcv\b/i, /download/i, /pdf/i],
      reply:
        "here you go — single-page PDF, updated april 2026. click the card to download.",
      blocks: [RESUME_BLOCK],
    },
    {
      id: "married",
      keys: [/married/i, /wedding/i, /fianc/i, /wife/i, /personal life/i],
      reply:
        "getting married soon. NYC area. that's about as much personal detail as the bot is authorized to share.",
    },
    {
      id: "hobbies",
      keys: [/hobbies/i, /hobby/i, /fun/i, /outside work/i, /interests/i],
      reply:
        "rubik's cubes (competitive for years), unicycling (well enough to pair it with the cube), building weird side projects, and messing with whatever the current-generation AI tools can do. if he's not coding, he's probably reading about something that will eventually become code.",
    },
    {
      id: "contact",
      keys: [/contact/i, /email/i, /reach him/i, /get in touch/i, /how do i/i, /dm/i],
      reply:
        "email: **jake@stockunlock.com**. he reads it. if it's interesting, he replies.",
    },
    {
      id: "different",
      keys: [/different/i, /unique/i, /stand out/i, /what makes him/i, /why jake/i, /why is he/i],
      reply:
        "most engineers can build a thing. a smaller set can ship a thing that real customers pay for. a smaller set still can do it while running the culture of the eng org they're in. jake is in that last set.\n\nhe's also — and this matters — **not** precious about it. took prod down as an intern. shut down his first startup. stepped back from stock unlock when the right call was to step back. he'll tell you what went wrong before you ask.\n\nalso: he can ride a unicycle while solving a rubik's cube. nobody else you're interviewing can do that.",
    },
    {
      id: "location",
      keys: [/where (does|is) he/i, /nyc/i, /new york/i, /location/i, /based/i],
      reply: "NYC area. has been for years.",
    },
    {
      id: "education",
      keys: [/education/i, /college/i, /degree/i, /school/i, /university/i, /albany/i, /suny/i, /gpa/i],
      reply:
        "BS Computer Science + Applied Math, SUNY Albany, 2015. 3.88 GPA. president of the ACM club — which was directly how he got his CommerceHub internship (organized a field trip to Tekkapalooza and handed out resumes in person, classic).",
    },
    {
      id: "thanks",
      keys: [/\bthanks\b/i, /thank you/i, /\bty\b/i, /appreciated/i],
      reply: "anytime. if you want a human, jake@stockunlock.com.",
    },
    {
      id: "who",
      keys: [/who (is|are) (you|this|he|jake)/i, /about jake/i, /tell me about jake/i, /intro/i],
      reply:
        "jake ruth. software engineer and founder. ~13 years coding since 2013. co-founded stock unlock (YC W22, profitable, scaled to 8 employees + thousands of paying customers, now a side business). ex-Oscar Health senior engineer. ex-CommerceHub. competitive rubik's cuber. getting married. NYC. email jake@stockunlock.com.\n\nask me about any of that and i'll go deeper.",
    },
  ];

  // ----------- router -----------
  function route(text) {
    if (!text || !text.trim()) return null;
    const t = text.trim();
    // score each entry by how many of its keys match
    let best = null;
    let bestScore = 0;
    for (const entry of RESPONSES) {
      let score = 0;
      for (const k of entry.keys) {
        if (k instanceof RegExp) {
          if (k.test(t)) score += 1;
        } else if (typeof k === "string") {
          if (t.toLowerCase().includes(k.toLowerCase())) score += 1;
        }
      }
      if (score > bestScore) {
        bestScore = score;
        best = entry;
      }
    }
    return best;
  }

  function fallback(text) {
    return {
      id: "fallback",
      reply:
        "hmm, i don't have a pre-canned answer for that. try asking about: **stock unlock**, **his career**, **the rubik's cube thing**, **AI philosophy**, **why to hire him**, or **resume** — or email jake directly at **jake@stockunlock.com**.",
    };
  }

  // ----------- rendering -----------
  function el(tag, cls, text) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  function scrollBottom() {
    // scroll the document since chat is in-flow
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
  }

  function addUserMessage(text) {
    const wrap = el("div", "msg msg-user");
    const col = el("div", "msg-col");
    const sender = el("div", "sender", "you");
    sender.style.alignSelf = "flex-end";
    const bubble = el("div", "bubble", text);
    col.appendChild(sender);
    col.appendChild(bubble);
    wrap.appendChild(col);
    chatEl.appendChild(wrap);
    scrollBottom();
  }

  function addBotMessageShell() {
    const wrap = el("div", "msg msg-bot");
    const col = el("div", "msg-col");
    const sender = el("div", "sender", "jake-bot");
    const bubble = el("div", "bubble");
    col.appendChild(sender);
    col.appendChild(bubble);
    wrap.appendChild(col);
    chatEl.appendChild(wrap);
    scrollBottom();
    return { wrap, bubble };
  }

  function addTypingIndicator() {
    const { wrap, bubble } = addBotMessageShell();
    const t = el("div", "typing");
    t.appendChild(el("span"));
    t.appendChild(el("span"));
    t.appendChild(el("span"));
    bubble.appendChild(t);
    return { wrap, bubble };
  }

  // very light markdown: **bold**, *italic*, `code`, and newlines
  function miniMarkdown(text) {
    // escape html
    let s = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    s = s.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    s = s.replace(/`([^`]+)`/g, "<code>$1</code>");
    // basic list rendering for lines starting with "- "
    s = s.replace(/(^|\n)- (.+?)(?=\n|$)/g, "$1• $2");
    // linkify bare emails
    s = s.replace(/([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,})/g, '<a href="mailto:$1">$1</a>');
    return s;
  }

  // streaming writer — character by character
  let currentStream = null;

  function streamInto(bubble, text, perChar = 18) {
    return new Promise((resolve) => {
      bubble.innerHTML = "";
      const live = el("span", "live");
      const caret = el("span", "caret");
      bubble.appendChild(live);
      bubble.appendChild(caret);

      let i = 0;
      const total = text.length;
      let cancelled = false;

      const tick = () => {
        if (cancelled) {
          resolve({ cancelled: true });
          return;
        }
        // write a small chunk per tick for a more natural feel
        const chunk = Math.max(1, Math.round(1 + Math.random() * 2));
        i = Math.min(total, i + chunk);
        live.innerHTML = miniMarkdown(text.slice(0, i));
        scrollBottom();
        if (i >= total) {
          caret.remove();
          resolve({ cancelled: false });
          return;
        }
        const jitter = perChar + Math.random() * 10 - 3;
        currentStream.timer = setTimeout(tick, jitter);
      };

      currentStream = {
        cancel() {
          cancelled = true;
          clearTimeout(currentStream && currentStream.timer);
          // render full text immediately
          caret.remove();
          live.innerHTML = miniMarkdown(text);
          scrollBottom();
        },
        timer: null,
      };
      tick();
    });
  }

  // ----------- rich blocks -----------
  function renderBlock(block, container) {
    const card = el("div", "card");
    if (block.title) {
      const t = el("div", "card-title", block.title);
      card.appendChild(t);
    }
    if (block.type === "stats") {
      const grid = el("div", "stats-grid");
      for (const s of block.stats) {
        const cell = el("div", "stat");
        cell.appendChild(el("div", "stat-num", s.num));
        cell.appendChild(el("div", "stat-label", s.label));
        grid.appendChild(cell);
      }
      card.appendChild(grid);
    } else if (block.type === "timeline") {
      const tl = el("div", "timeline");
      for (const row of block.rows) {
        const r = el("div", "tl-row");
        r.appendChild(el("div", "tl-year", row.year));
        r.appendChild(el("div", "tl-node"));
        const text = el("div", "tl-text");
        const b = el("b");
        b.textContent = row.title;
        text.appendChild(b);
        if (row.note) {
          const em = el("em");
          em.textContent = row.note;
          text.appendChild(em);
        }
        r.appendChild(text);
        tl.appendChild(r);
      }
      card.appendChild(tl);
    } else if (block.type === "resume") {
      card.classList.add("resume-card");
      const icon = el("div", "resume-icon", "PDF");
      const meta = el("div", "resume-meta");
      meta.appendChild(el("div", "resume-title", block.title));
      meta.appendChild(el("div", "resume-sub", block.sub));
      card.appendChild(icon);
      card.appendChild(meta);
      card.addEventListener("click", () => {
        // no actual PDF — mock download. fire a fake message.
        triggerBotMessage(
          "heh — this is a prototype, so there's no real PDF wired up yet. email jake@stockunlock.com and he'll send the real one.",
          []
        );
      });
    }
    container.appendChild(card);
  }

  // ----------- bot speak pipeline -----------
  let busy = false;

  async function triggerBotMessage(text, blocks) {
    // remove any existing typing indicators before speaking (defensive)
    const typing = addTypingIndicator();
    await wait(500 + Math.random() * 500);
    // remove typing dots
    typing.bubble.innerHTML = "";
    // stream text
    await streamInto(typing.bubble, text, 18);
    // render blocks
    if (blocks && blocks.length) {
      for (const b of blocks) {
        const block = typeof b === "function" ? b() : b;
        renderBlock(block, typing.bubble);
      }
    }
    scrollBottom();
  }

  async function handleUserInput(text) {
    if (busy) {
      // cancel any in-flight stream first
      if (currentStream) currentStream.cancel();
    }
    busy = true;
    setComposerEnabled(false);
    addUserMessage(text);

    let match = route(text);
    if (!match) match = fallback(text);

    const blocks = match.blocks || [];
    try {
      await triggerBotMessage(match.reply, blocks);
    } finally {
      busy = false;
      setComposerEnabled(true);
      input.focus();
    }
  }

  function setComposerEnabled(on) {
    input.disabled = !on;
    sendBtn.disabled = !on;
    for (const c of chipsEl.querySelectorAll(".chip")) c.disabled = !on;
  }

  function wait(ms) {
    return new Promise((r) => setTimeout(r, ms));
  }

  // ----------- wire up UI -----------
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const v = input.value.trim();
    if (!v) return;
    input.value = "";
    handleUserInput(v);
  });

  chipsEl.addEventListener("click", (e) => {
    const t = e.target.closest(".chip");
    if (!t) return;
    const p = t.getAttribute("data-prompt");
    if (!p) return;
    handleUserInput(p);
  });

  // greet on load
  (async function boot() {
    setComposerEnabled(false);
    await wait(250);
    const greet = addTypingIndicator();
    await wait(600);
    greet.bubble.innerHTML = "";
    await streamInto(
      greet.bubble,
      "hey. ask me anything about jake. i know his work, his story, and his worldview. try 'why should i hire him?' to start.",
      22
    );
    setComposerEnabled(true);
    input.focus();
  })();
})();
