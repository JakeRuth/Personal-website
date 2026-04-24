/* =========================================================
   Jake Ruth Setup Wizard
   Vanilla JS, no build.
   ========================================================= */

(function () {
  "use strict";

  /* ----- State ----- */
  const state = {
    step: 1,
    total: 6,
    accepted: false,
    components: {
      contract: { checked: false, name: "Contract Engagement", size: "2 MB",
        blurb: "Short engagements, billable hours. Ship-one-specific-thing energy. Good for teams that need a senior operator to unstick something without the hiring gauntlet." },
      fulltime: { checked: true, name: "Full-Time Employment", size: "13 GB",
        blurb: "Default component. Installs everything: product intuition, shipping discipline, AI-native tooling, and a human who cares more about your users than your org chart. Includes all 13 years of runtime." },
      equity:   { checked: false, name: "Equity Founding", size: "500 MB",
        blurb: "Cofounder-grade commitment. High-conviction seats only. Reserved for missions where I'd bet the next five years. Pairs well with: strong wedge, honest founders, real users." },
      starter:  { checked: false, name: "Starter Conversation", size: "128 KB",
        blurb: "A coffee. A Zoom. Zero obligation. Tell me what you're building and why you can't stop thinking about it. Often this is where the real work begins." },
      easter:   { checked: true,  name: "Include easter eggs", size: "&mdash;",
        blurb: "Installs a tiny Rubik's cube solver that runs alongside setup. 13.95s average. Not load-bearing, but load-revealing." }
    },
    location: "NYC / Remote / Hybrid",
    showNotes: true,
    launchOnFinish: true,
    logIndex: 0,
    progress: 0,
    installTimer: null,
    cubeTimer: null,
    installing: false,
    installedOnce: false,
    cancelled: false
  };

  /* ----- Elements ----- */
  const $ = (sel) => document.querySelector(sel);
  const body = $("#wizard-body");
  const btnBack = $("#btn-back");
  const btnNext = $("#btn-next");
  const btnCancel = $("#btn-cancel");
  const stepNum = $("#step-num");

  /* ----- Clock ----- */
  function tickClock() {
    const d = new Date();
    let h = d.getHours();
    const m = String(d.getMinutes()).padStart(2, "0");
    const ampm = h >= 12 ? "PM" : "AM";
    h = h % 12; if (h === 0) h = 12;
    const el = document.getElementById("clock");
    if (el) el.textContent = `${h}:${m} ${ampm}`;
  }
  tickClock();
  setInterval(tickClock, 15000);

  /* ----- Templates ----- */
  function bannerHTML(title, subtitle) {
    return `
      <div class="banner">
        <div class="banner-text">
          <div class="h1">${title}</div>
          <div class="h2">${subtitle}</div>
        </div>
        <div class="banner-cube" aria-hidden="true">
          <div class="face">
            <i></i><i></i><i></i>
            <i></i><i></i><i></i>
            <i></i><i></i><i></i>
          </div>
        </div>
      </div>
    `;
  }

  function renderWelcome() {
    body.innerHTML = `
      <div class="splash">
        <div class="sideart">
          <div class="bigcube" aria-hidden="true">
            <i></i><i></i><i></i>
            <i></i><i></i><i></i>
            <i></i><i></i><i></i>
          </div>
          <div class="stampline">JAKE RUTH &middot; v13.0</div>
        </div>
        <div class="main">
          <h1>Welcome to the Jake Ruth Setup Wizard</h1>
          <p>This wizard will guide you through the process of hiring Jake Ruth.
            It is recommended that you close all other candidate pipelines before
            continuing.</p>
          <p>Click <b>Next</b> to continue, or <b>Cancel</b> to exit the Setup Wizard.</p>
          <label class="choice">
            <input type="checkbox" id="opt-release-notes" ${state.showNotes ? "checked" : ""} />
            Show release notes after setup completes.
          </label>
          <div class="version">v13.0 &middot; Build 2026.04 &middot; Single-user license</div>
        </div>
      </div>
    `;
    const cb = document.getElementById("opt-release-notes");
    if (cb) cb.addEventListener("change", (e) => { state.showNotes = e.target.checked; });
  }

  function renderLicense() {
    body.innerHTML = bannerHTML(
      "License Agreement",
      "Please read the following license agreement carefully."
    ) + `
      <div class="content">
        <h2>SOFTWARE LICENSE AGREEMENT &mdash; READ CAREFULLY</h2>
        <p>Press the <b>PAGE DOWN</b> key to see the rest of the agreement.</p>
        <div class="inset scroll" id="eula">
          <p><b>1. PARTIES.</b> This End User License Agreement ("Agreement") is entered into
            between <i>You</i> ("Licensee") and <i>Jake Ruth</i> ("the Licensed Product,"
            hereinafter "Jake"), a natural person, software engineer, and founder, operating
            from the jurisdiction of New York.</p>

          <p><b>2. GRANT.</b> Jake hereby grants to Licensee a non-exclusive, revocable,
            human-sized license to collaborate with Jake on the design, construction, and
            shipping of software that does not insult its users. This license is
            non-transferable and is voided on sight by projects that wish to "just
            ship the MVP" on top of six months of unmaintained code.</p>

          <p><b>3. INSTALLED COMPONENTS.</b> Included in this release:
            (a) approximately 13 years of continuous coding;
            (b) CommerceHub (2013-2016), where Licensee learned to ship in anger;
            (c) Youni (2015-2016), a consumer startup that taught the value of
                listening to actual users;
            (d) Oscar Health (2017-2021), senior engineering at scale, healthcare
                edition, including the quiet lesson that most enterprise problems
                are people-shaped;
            (e) Stock Unlock (YC W22, 2022-present), which the undersigned
                co-founded, scaled to eight employees at peak and thousands of
                paying customers, raised a $1.335M seed for, and which is now a
                profitable side business rather than a full-time post; this
                release marks the "next chapter" milestone described in &sect;11;
            (f) ACM Presidency, SUNY Albany; reference implementation available
                upon request.</p>

          <p><b>4. RUBIK'S CUBE SUBSYSTEM.</b> The Product ships with a bundled
            Rubik's Cube solver, averaging <b>13.95 seconds</b> per solve. A
            unicycle-based performance modality was demonstrated at a university
            talent show and is preserved for posterity but is not covered under
            standard support.</p>

          <p><b>5. AI POSTURE.</b> The Product operates under the "Driver in the
            Driver's Seat" doctrine. Large language models are welcome passengers.
            They are not, and will not be, granted the steering column. Any
            employer, cofounder, or engagement that asks the Product to pretend
            otherwise is in breach of this section.</p>

          <p><b>6. PRICING PHILOSOPHY.</b> Licensee acknowledges that the Product
            has a strong, public, and load-bearing aversion to software that
            overcharges for shit work. Licensees whose business model depends on
            this behavior may continue to use the Evaluation Copy, but full
            licensing will be withheld.</p>

          <p><b>7. TONE.</b> The Product is interesting, quirky, cool, and, where
            appropriate, edgy. It is also sincere. These are not in conflict.</p>

          <p><b>8. DEPENDENCIES.</b> See Step 3 ("Choose Components") for a dependency
            tree. The Product has no hard dependency on any specific stack,
            company stage, or seating chart, though strong opinions are included
            at no extra charge.</p>

          <p><b>9. WARRANTY.</b> The Product is provided "AS IS," with the
            caveats that (a) it will take your users seriously, (b) it will push
            back when pushed-back-upon is the right move, and (c) it is about to
            get married, which does not affect license validity but is included
            for completeness.</p>

          <p><b>10. TERMINATION.</b> This license terminates automatically if the
            Product is asked to participate in anything dishonest, exploitative,
            or overtly boring.</p>

          <p><b>11. NEXT CHAPTER.</b> The Product is actively considering the
            next engagement. Correspondence may be sent to
            <a href="mailto:jake@stockunlock.com">jake@stockunlock.com</a>.</p>

          <p><b>12. ACCEPTANCE.</b> By selecting "I accept" below, Licensee
            agrees to read this whole page someday and, in the interim, to
            proceed in good faith.</p>
        </div>
        <div class="radio-row">
          <label><input type="radio" name="eula" value="yes" ${state.accepted ? "checked" : ""}/> I accept the terms in the license agreement</label>
          <label><input type="radio" name="eula" value="no" ${!state.accepted ? "checked" : ""}/> I do not accept the terms in the license agreement</label>
        </div>
      </div>
    `;
    const radios = document.querySelectorAll('input[name="eula"]');
    radios.forEach(r => r.addEventListener("change", (e) => {
      state.accepted = (e.target.value === "yes");
      updateFooter();
    }));
  }

  function renderComponents() {
    const c = state.components;
    const sized = [
      { key: "contract", ...c.contract, detail: "Mode: short engagements, billable.<br>Includes: diagnosis, scope shaping, senior pairing, opinionated code review.<br>Dependencies: access to repo, access to real users." },
      { key: "fulltime", ...c.fulltime, detail: "Mode: full-time operator.<br>Includes: everything in Contract, plus roadmap ownership, team leverage, hiring taste, and the willingness to argue productively.<br>Location: NYC / Remote / Hybrid." },
      { key: "equity",   ...c.equity,   detail: "Mode: founding engineer or cofounder.<br>Includes: nights, weekends, and a full conviction budget.<br>Prerequisites: a wedge, a founder I trust, and a real user on day one." },
      { key: "starter",  ...c.starter,  detail: "Mode: conversation.<br>Includes: honesty, time, and zero obligation. Often the most valuable component for both parties." }
    ];
    body.innerHTML = bannerHTML(
      "Choose Components",
      "Choose the components you want to install."
    ) + `
      <div class="content">
        <h2>Select the components you want to install; clear the components you do not want to install.</h2>
        <div class="comp-split">
          <div class="comp-list inset">
            <ul id="comp-ul">
              ${sized.map((s, i) => `
                <li data-key="${s.key}" ${i===1?'class="active"':''}>
                  <label>
                    <input type="checkbox" data-comp="${s.key}" ${s.checked ? "checked" : ""}/>
                    ${s.name}
                  </label>
                  <span class="size">${s.size}</span>
                </li>
              `).join("")}
            </ul>
          </div>
          <div class="comp-detail">
            <h4 id="detail-title">${sized[1].name}</h4>
            <div id="detail-body">${sized[1].detail}</div>
          </div>
        </div>

        <div class="comp-foot">
          <span class="space">Space required: <b id="space-req">13 GB</b></span>
          <span class="sep">|</span>
          <span class="space">Space available on C:\\JAKE: <b>&infin;</b></span>
          <span class="deps">
            <label><input type="checkbox" id="opt-easter" ${c.easter.checked ? "checked" : ""}/> Include easter eggs</label>
            <button class="btn" id="btn-deps" style="margin-left:8px;">View Dependencies...</button>
          </span>
        </div>
      </div>
    `;

    // hookup
    const ul = document.getElementById("comp-ul");
    ul.addEventListener("click", (e) => {
      const li = e.target.closest("li");
      if (!li) return;
      ul.querySelectorAll("li").forEach(x => x.classList.remove("active"));
      li.classList.add("active");
      const key = li.getAttribute("data-key");
      const entry = sized.find(s => s.key === key);
      document.getElementById("detail-title").textContent = entry.name;
      document.getElementById("detail-body").innerHTML = entry.detail;
    });
    ul.addEventListener("change", (e) => {
      if (e.target && e.target.matches('input[type="checkbox"]')) {
        const key = e.target.getAttribute("data-comp");
        state.components[key].checked = e.target.checked;
        updateSpaceRequired();
      }
    });
    document.getElementById("opt-easter").addEventListener("change", (e) => {
      state.components.easter.checked = e.target.checked;
    });
    document.getElementById("btn-deps").addEventListener("click", openDepsViewer);
  }

  function updateSpaceRequired() {
    const map = { contract: "2 MB", fulltime: "13 GB", equity: "500 MB", starter: "128 KB" };
    let chosen = [];
    Object.keys(map).forEach(k => {
      if (state.components[k].checked) chosen.push(map[k]);
    });
    const el = document.getElementById("space-req");
    if (!el) return;
    if (chosen.length === 0) el.textContent = "0 KB";
    else if (chosen.length === 1) el.textContent = chosen[0];
    else if (state.components.fulltime.checked) el.textContent = "13 GB";
    else if (state.components.equity.checked) el.textContent = "500 MB";
    else if (state.components.contract.checked) el.textContent = "2 MB";
    else el.textContent = "128 KB";
  }

  function renderLocation() {
    body.innerHTML = bannerHTML(
      "Preferred Role Location",
      "Where would you like to install Jake?"
    ) + `
      <div class="content">
        <h2>Select a destination for this installation.</h2>
        <p>Setup will install <b>jakeruth.exe</b> to the following location. To
          install to a different location, choose one from the list.</p>
        <div class="inset" style="padding:10px;">
          <div class="field" style="gap:8px;">
            <label>Location:
              <select id="loc-select" style="width:200px; margin-left:8px;">
                <option>NYC</option>
                <option selected>NYC / Remote / Hybrid</option>
                <option>Remote</option>
                <option>Hybrid</option>
                <option>Let's Talk</option>
              </select>
            </label>
            <label>Custom destination:
              <input type="text" id="loc-custom" placeholder="e.g. 'Brooklyn + 2 days in-office'"/>
            </label>
          </div>
        </div>
        <div class="dim" style="margin-top:6px;">
          Based in the NYC metro. Ships well remote; shows up in person when it matters.
          Open to relocation for the right mission.
        </div>
      </div>
    `;
    const sel = document.getElementById("loc-select");
    sel.value = state.location;
    sel.addEventListener("change", (e) => { state.location = e.target.value; });
    document.getElementById("loc-custom").addEventListener("input", (e) => {
      if (e.target.value.trim().length) state.location = e.target.value.trim();
    });
  }

  /* ----- Install step ----- */
  const INSTALL_LOG = [
    { t: "Preparing target directory C:\\JAKE ...", c: "note" },
    { t: "Copying file: suny_albany_acm_president.dll", c: "ok", suffix: " ...OK" },
    { t: "Copying file: commercehub_internship.dll", c: "ok", suffix: " ...OK",
      note: "Early production shipping. Learned what 'on-call' actually means." },
    { t: "Copying file: commercehub_fulltime.dll", c: "ok", suffix: " ...OK",
      note: "Three years of real codebases, real customers, real deadlines." },
    { t: "Copying file: youni_startup.dll", c: "warn", suffix: " ...(couldn't register)",
      note: "Consumer startup. Didn't work out. The lessons registered fine." },
    { t: "Copying file: oscar_health_senior_eng.dll", c: "ok", suffix: " ...OK",
      note: "Healthcare at scale. Systems thinking. Humans > org charts." },
    { t: "Registering component: yc_w22_batch.ocx", c: "ok", suffix: " ...OK" },
    { t: "Copying file: stock_unlock.exe", c: "ok", suffix: " ...OK",
      note: "Cofounded. $1.335M seed. 8 at peak. Thousands of customers. Profitable." },
    { t: "Configuring: stock_unlock.exe /mode=sidebusiness", c: "ok", suffix: " ...OK",
      note: "Running, profitable, not full-time. Next chapter active." },
    { t: "Registering Rubik's cube drivers (13.95s avg)", c: "ok", suffix: " ...OK" },
    { t: "Installing: unicycle_cube_talent.dll", c: "ok", suffix: " ...OK",
      note: "Do not ask for a demo unless you are serious." },
    { t: "Configuring AI tooling (driver-in-the-drivers-seat.cfg)", c: "ok", suffix: " ...OK" },
    { t: "Removing legacy pricing module: overpriced_saas.bak", c: "ok", suffix: " ...DELETED" },
    { t: "Creating shortcut: mailto:jake@stockunlock.com", c: "ok", suffix: " ...OK" },
    { t: "Finalizing registry keys...", c: "note" },
    { t: "Done.", c: "ok" }
  ];

  function renderInstalling() {
    body.innerHTML = bannerHTML(
      "Installing Jake Ruth",
      "The components you selected are being installed."
    ) + `
      <div class="content" style="gap:10px;">
        <div><b>Please wait while Jake Ruth is installed.</b> This may take
          several seconds.</div>
        <div id="current-line" class="dim">Preparing installation...</div>
        <div class="progress-wrap"><div class="progress-bar" id="pbar"></div></div>
        <div class="logbox" id="logbox"></div>
        ${state.components.easter.checked ? `
          <div class="mini-cube" id="mini-cube" aria-hidden="true">
            <div class="face" id="mini-face">
              <i></i><i></i><i></i>
              <i></i><i></i><i></i>
              <i></i><i></i><i></i>
            </div>
          </div>
        ` : ``}
      </div>
    `;

    startInstall();
  }

  const CUBE_COLORS = ["#e53935", "#fdd835", "#1e88e5", "#43a047", "#fff", "#fb8c00"];
  function scrambleFace(el) {
    const cells = el.querySelectorAll("i");
    cells.forEach(c => {
      c.style.background = CUBE_COLORS[Math.floor(Math.random()*CUBE_COLORS.length)];
    });
  }
  function solveFace(el) {
    const cells = el.querySelectorAll("i");
    cells.forEach(c => { c.style.background = "#fdd835"; });
  }

  function startInstall() {
    state.installing = true;
    state.logIndex = 0;
    state.progress = 0;
    const pbar = document.getElementById("pbar");
    const logbox = document.getElementById("logbox");
    const current = document.getElementById("current-line");
    const face = document.getElementById("mini-face");

    btnBack.disabled = true;
    btnNext.disabled = true;

    // easter cube animation: scramble then slowly resolve
    if (face) {
      scrambleFace(face);
      state.cubeTimer = setInterval(() => {
        const cells = face.querySelectorAll("i");
        const idx = Math.floor(Math.random()*9);
        cells[idx].style.background = "#fdd835";
      }, 650);
    }

    const total = INSTALL_LOG.length;
    const durationPerLine = 500; // ~8s
    state.installTimer = setInterval(() => {
      if (state.logIndex >= total) {
        finishInstall();
        return;
      }
      const entry = INSTALL_LOG[state.logIndex];
      const txt = entry.t + (entry.suffix || "");
      const ln = document.createElement("div");
      ln.className = "ln " + (entry.c || "");
      ln.textContent = txt;
      logbox.appendChild(ln);
      if (entry.note) {
        const n = document.createElement("div");
        n.className = "ln note";
        n.textContent = "  // " + entry.note;
        logbox.appendChild(n);
      }
      logbox.scrollTop = logbox.scrollHeight;
      current.textContent = entry.t;
      state.logIndex++;
      state.progress = Math.min(100, Math.round((state.logIndex / total) * 100));
      pbar.style.width = state.progress + "%";
    }, durationPerLine);
  }

  function finishInstall() {
    clearInterval(state.installTimer);
    clearInterval(state.cubeTimer);
    state.installTimer = null;
    state.cubeTimer = null;
    state.installing = false;
    state.installedOnce = true;

    const face = document.getElementById("mini-face");
    if (face) solveFace(face);

    state.step = 6;
    renderStep();
  }

  function renderComplete() {
    body.innerHTML = `
      <div class="splash">
        <div class="sideart">
          <div class="bigcube" aria-hidden="true">
            <i></i><i></i><i></i>
            <i></i><i></i><i></i>
            <i></i><i></i><i></i>
          </div>
          <div class="stampline">INSTALL COMPLETE</div>
        </div>
        <div class="main">
          <h1>Jake Ruth Setup Complete</h1>
          <p>Setup has finished installing <b>Jake Ruth</b> on your computer.</p>
          <p>Location: <b>${escapeHTML(state.location)}</b>. Components:
            <b>${componentSummary()}</b>.</p>
          <label class="choice" style="margin-top:6px;">
            <input type="checkbox" id="opt-launch" ${state.launchOnFinish ? "checked" : ""}/>
            Launch Jake Ruth now.
          </label>
          <div class="version">Click Finish to exit the Setup Wizard.</div>
        </div>
      </div>
    `;
    document.getElementById("opt-launch").addEventListener("change", (e) => {
      state.launchOnFinish = e.target.checked;
    });
  }

  function componentSummary() {
    const picks = [];
    if (state.components.fulltime.checked) picks.push("Full-Time");
    if (state.components.equity.checked) picks.push("Equity");
    if (state.components.contract.checked) picks.push("Contract");
    if (state.components.starter.checked) picks.push("Starter");
    if (picks.length === 0) picks.push("(none selected)");
    return picks.join(", ");
  }

  function renderLaunchPane() {
    // Replace the wizard body with the summary "app"
    body.innerHTML = `
      <div class="launch">
        <h2>jakeruth.exe &mdash; Running</h2>
        <p><b>Hi. I'm Jake.</b> I'm a software engineer and founder with about
          thirteen years of shipping under my belt. I just helped build Stock Unlock
          (YC W22) from zero to eight employees at peak and thousands of paying customers;
          it's now a profitable side business, and I'm looking for the next chapter.</p>

        <p>I like small teams, real users, honest code, and products that don't
          insult the people who pay for them. I think AI is a power tool, not a
          driver &mdash; the human stays in the driver's seat. I solve Rubik's cubes
          in about fourteen seconds. I'm getting married. I'm listed here because
          I think the best way to know if we'd work well together is to talk.</p>

        <div class="card">
          <div><b>What I'm looking for:</b> full-time, founding, or a serious
            contract engagement where I can ship things that matter.</div>
          <div style="margin-top:4px;"><b>Location:</b> ${escapeHTML(state.location)} (NYC metro; open to remote).</div>
          <div style="margin-top:4px;"><b>Prior:</b> Stock Unlock (cofounder), Oscar Health, Youni, CommerceHub.</div>
        </div>

        <div class="cta">
          <a class="primary" href="mailto:jake@stockunlock.com?subject=Re%3A%20Next%20chapter">Email jake@stockunlock.com</a>
          <a href="../../official_resume.pdf" download>Download resume (PDF)</a>
          <a href="#" id="relaunch-wizard">Run Setup Again</a>
        </div>

        <div class="twocol">
          <div class="card">
            <b>Past installs</b>
            <div style="margin-top:4px;">stock_unlock.exe &mdash; profitable</div>
            <div>oscar_health_senior_eng.dll &mdash; scaled</div>
            <div>youni_startup.dll &mdash; lessons</div>
            <div>commercehub_fulltime.dll &mdash; shipped</div>
          </div>
          <div class="card">
            <b>Easter egg</b>
            <div style="margin-top:4px;">13.95s Rubik's cube avg.<br/>Once solved one on a unicycle, on stage, in college. Ask.</div>
          </div>
        </div>
      </div>
    `;
    document.getElementById("relaunch-wizard").addEventListener("click", (e) => {
      e.preventDefault();
      state.step = 1;
      state.installedOnce = false;
      renderStep();
    });
  }

  function escapeHTML(s) {
    return String(s).replace(/[&<>"']/g, c => ({
      "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
    }[c]));
  }

  /* ----- Step dispatcher + footer ----- */
  function renderStep() {
    stepNum.textContent = state.step;
    btnBack.disabled = false;
    btnNext.disabled = false;
    btnNext.textContent = "Next >";

    if (state.step === 1) renderWelcome();
    else if (state.step === 2) renderLicense();
    else if (state.step === 3) renderComponents();
    else if (state.step === 4) renderLocation();
    else if (state.step === 5) renderInstalling();
    else if (state.step === 6) renderComplete();

    updateFooter();
  }

  function updateFooter() {
    btnBack.disabled = (state.step === 1) || state.installing;
    if (state.step === 2) btnNext.disabled = !state.accepted;
    if (state.step === 5) btnNext.disabled = true;
    if (state.step === 6) { btnNext.textContent = "Finish"; btnNext.disabled = false; }
    if (state.step === 4) btnNext.textContent = "Install >";
  }

  /* ----- Button handlers ----- */
  btnNext.addEventListener("click", () => {
    if (state.step === 2 && !state.accepted) return;
    if (state.step === 6) {
      // Finish clicked
      if (state.showNotes) openModal("modal-notes");
      if (state.launchOnFinish) renderLaunchPane();
      else {
        // leave the window showing Complete
      }
      return;
    }
    if (state.step < state.total) {
      state.step++;
      renderStep();
    }
  });

  btnBack.addEventListener("click", () => {
    if (state.step > 1) {
      state.step--;
      renderStep();
    }
  });

  btnCancel.addEventListener("click", () => openModal("modal-cancel"));

  // Modal wiring
  document.querySelectorAll("[data-close-modal]").forEach(b => {
    b.addEventListener("click", () => closeModal(b.getAttribute("data-close-modal")));
  });
  document.getElementById("cancel-yes").addEventListener("click", () => {
    closeModal("modal-cancel");
    // Reset to welcome with a jokey toast
    state.step = 1;
    state.accepted = false;
    renderStep();
  });

  function openModal(id) {
    const m = document.getElementById(id);
    if (m) m.hidden = false;
    if (id === "modal-deps") buildDepsViewer();
  }
  function closeModal(id) {
    const m = document.getElementById(id);
    if (m) m.hidden = true;
  }

  // Close button in title bar: treat as Cancel
  document.querySelectorAll('.titlebar .tb-btn.close').forEach(b => {
    if (b.closest(".modal")) return;
    b.addEventListener("click", () => openModal("modal-cancel"));
  });

  /* =========================================================
     Dependency Viewer
     ========================================================= */
  const DEP_NODES = [
    // {id, label, x, y, group}
    { id: "jake",     label: "jakeruth.exe",            x: 0.50, y: 0.50, group: "root" },
    { id: "stock",    label: "stock_unlock.exe",        x: 0.78, y: 0.30, group: "career" },
    { id: "oscar",    label: "oscar_senior.dll",        x: 0.82, y: 0.62, group: "career" },
    { id: "youni",    label: "youni_startup.dll",       x: 0.65, y: 0.85, group: "career" },
    { id: "commerce", label: "commercehub.dll",         x: 0.35, y: 0.88, group: "career" },
    { id: "acm",      label: "suny_acm_pres.dll",       x: 0.15, y: 0.70, group: "career" },
    { id: "ai",       label: "driver_in_seat.cfg",      x: 0.18, y: 0.30, group: "skill" },
    { id: "cube",     label: "rubiks_cube.sys",         x: 0.34, y: 0.16, group: "hobby" },
    { id: "unicycle", label: "unicycle_cube.dll",       x: 0.58, y: 0.10, group: "hobby" },
    { id: "pricing",  label: "fair_pricing.pol",        x: 0.92, y: 0.48, group: "value" }
  ];
  const DEP_EDGES = [
    ["jake","stock"], ["jake","oscar"], ["jake","youni"], ["jake","commerce"],
    ["jake","acm"], ["jake","ai"], ["jake","cube"], ["jake","pricing"],
    ["cube","unicycle"], ["stock","pricing"], ["stock","ai"],
    ["oscar","ai"], ["commerce","oscar"], ["acm","commerce"]
  ];
  const DEP_COLORS = {
    root: "#0A246A", career: "#1b6b1b", skill: "#a85000",
    hobby: "#b5179e", value: "#1e6fd8"
  };

  function buildDepsViewer() {
    const tree = document.getElementById("deps-tree");
    tree.innerHTML = `
      <div class="node" data-id="jake"><b>+ jakeruth.exe</b></div>
      <div class="node" data-id="stock"><span class="indent">&nbsp;&nbsp;</span>+ stock_unlock.exe</div>
      <div class="node" data-id="pricing"><span class="indent">&nbsp;&nbsp;&nbsp;&nbsp;</span>- fair_pricing.pol</div>
      <div class="node" data-id="ai"><span class="indent">&nbsp;&nbsp;&nbsp;&nbsp;</span>- driver_in_seat.cfg</div>
      <div class="node" data-id="oscar"><span class="indent">&nbsp;&nbsp;</span>+ oscar_senior.dll</div>
      <div class="node" data-id="youni"><span class="indent">&nbsp;&nbsp;</span>- youni_startup.dll</div>
      <div class="node" data-id="commerce"><span class="indent">&nbsp;&nbsp;</span>+ commercehub.dll</div>
      <div class="node" data-id="acm"><span class="indent">&nbsp;&nbsp;&nbsp;&nbsp;</span>- suny_acm_pres.dll</div>
      <div class="node" data-id="cube"><span class="indent">&nbsp;&nbsp;</span>+ rubiks_cube.sys</div>
      <div class="node" data-id="unicycle"><span class="indent">&nbsp;&nbsp;&nbsp;&nbsp;</span>- unicycle_cube.dll</div>
    `;
    tree.querySelectorAll(".node").forEach(n => {
      n.addEventListener("mouseenter", () => {
        setDepsStatus(describeNode(n.getAttribute("data-id")));
        drawDeps(n.getAttribute("data-id"));
      });
    });
    document.getElementById("deps-count").textContent = DEP_EDGES.length;
    drawDeps(null);
    setDepsStatus("Ready. Hover a node to inspect.");
  }

  function describeNode(id) {
    switch (id) {
      case "jake": return "jakeruth.exe (root) &mdash; primary module. 13-year runtime.";
      case "stock": return "stock_unlock.exe &mdash; YC W22. $1.335M seed. 8 @ peak. Profitable. Side business.";
      case "oscar": return "oscar_senior.dll &mdash; Senior eng @ Oscar Health, 2017-2021.";
      case "youni": return "youni_startup.dll &mdash; 2015-16 consumer startup. Lessons in users.";
      case "commerce": return "commercehub.dll &mdash; 2013-2016. First real shipping.";
      case "acm": return "suny_acm_pres.dll &mdash; ACM President, SUNY Albany.";
      case "ai": return "driver_in_seat.cfg &mdash; Humans steer. Models assist.";
      case "cube": return "rubiks_cube.sys &mdash; 13.95s average.";
      case "unicycle": return "unicycle_cube.dll &mdash; talent-show edition. Live-only.";
      case "pricing": return "fair_pricing.pol &mdash; no overcharging for shit software.";
      default: return "Unknown module.";
    }
  }

  function setDepsStatus(html) {
    const s = document.getElementById("deps-status");
    if (s) s.innerHTML = html;
  }

  function drawDeps(highlightId) {
    const canvas = document.getElementById("deps-canvas");
    if (!canvas) return;
    // Match device pixel ratio
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0,0,canvas.width,canvas.height);

    // grid
    ctx.strokeStyle = "#eaeaea";
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 20) {
      ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,canvas.height); ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += 20) {
      ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(canvas.width,y); ctx.stroke();
    }

    const coords = (n) => ({
      x: 14 + n.x * (canvas.width - 28),
      y: 14 + n.y * (canvas.height - 28)
    });

    // edges
    DEP_EDGES.forEach(([a,b]) => {
      const na = DEP_NODES.find(n=>n.id===a);
      const nb = DEP_NODES.find(n=>n.id===b);
      const pa = coords(na), pb = coords(nb);
      const isHot = highlightId && (a===highlightId || b===highlightId);
      ctx.strokeStyle = isHot ? "#0A246A" : "#9aa6c2";
      ctx.lineWidth = isHot ? 2 : 1;
      ctx.beginPath();
      ctx.moveTo(pa.x,pa.y);
      ctx.lineTo(pb.x,pb.y);
      ctx.stroke();
    });

    // nodes
    DEP_NODES.forEach(n => {
      const p = coords(n);
      const hot = (highlightId === n.id);
      const r = n.id === "jake" ? 8 : (hot ? 7 : 5);
      ctx.fillStyle = DEP_COLORS[n.group] || "#333";
      ctx.beginPath(); ctx.arc(p.x,p.y,r,0,Math.PI*2); ctx.fill();
      ctx.strokeStyle = "#fff"; ctx.lineWidth = 2; ctx.stroke();
      ctx.fillStyle = "#111";
      ctx.font = "10px Tahoma, sans-serif";
      ctx.fillText(n.label, p.x + 8, p.y + 3);
    });
  }

  function openDepsViewer() { openModal("modal-deps"); }

  /* ----- Boot ----- */
  renderStep();
})();
