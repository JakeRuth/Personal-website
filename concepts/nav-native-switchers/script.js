/* ===================================================
   Nav-Native-Switchers — prototype JS
   Each pane fires performSwitch(targetMode, {via})
   The shared handler shows a native-flavored confirmation.
   =================================================== */

const MODES = {
  xp:     { label: "XP Luna Desktop",   desc: "Where would you like to go today?" },
  git:    { label: "Git Log Terminal",  desc: "HEAD detached from main." },
  saas:   { label: "Enterprise SaaS",   desc: "Current shipping version." },
  readme: { label: "README",            desc: "Plain markdown. No chrome." },
  vista:  { label: "Vista Aero",        desc: "Premium glass SKU." },
};

/* ------------- shared switch handler ------------- */

function performSwitch(target, { via }) {
  const m = MODES[target];
  if (!m) return;

  // Flavor the transition by the SOURCE (via). Each source has its own farewell.
  if (via === "xp") {
    showLogoff(`Logging off to ${m.label}…`, "Please wait while Windows prepares your new experience.");
    setTimeout(() => {
      hideLogoff();
      emitToast(via, target, m);
      flashPane(target);
    }, 1100);
  } else if (via === "git") {
    appendGitLine(`<span class="ok">✓ Switched to experience '${target}' (${m.label})</span>`);
    appendGitLine(`<span class="muted"># In the real site, this would route to /${target}</span>`);
    emitToast(via, target, m);
    flashPane(target);
  } else if (via === "saas") {
    // Enterprise does a brief "session reload" flicker
    const pane = document.querySelector('.pane-saas');
    pane.style.opacity = "0.5";
    setTimeout(() => {
      pane.style.opacity = "";
      emitToast(via, target, m);
      flashPane(target);
    }, 500);
  } else if (via === "readme") {
    // README: quietly change the checklist, show a markdown-style toast
    emitToast(via, target, m);
    flashPane(target);
  }

  // Console log for evaluators
  console.log(`[nav-native-switchers] switch target=${target} via=${via}`);
}

function flashPane(target) {
  const pane = document.querySelector(`.pane[data-mode="${target}"]`);
  if (!pane) return;
  pane.classList.remove("flash");
  // force reflow so the animation can restart
  void pane.offsetWidth;
  pane.classList.add("flash");
  pane.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function emitToast(via, target, m) {
  const stack = document.getElementById("toast-stack");
  const t = document.createElement("div");
  t.className = `toast via-${via}`;
  const viaFlavor = {
    xp: `Start &rsaquo; Switch Experience &rsaquo; ${m.label}`,
    git: `git switch ${target}`,
    saas: `Product view &rarr; ${m.label}`,
    readme: `- [x] ${m.label}`,
  }[via];
  t.innerHTML = `
    <strong>Switched &rarr; ${m.label}</strong>
    <div style="color:#9aa3ae;font-family:ui-monospace,Menlo,monospace;font-size:11px;margin-top:2px;">${viaFlavor}</div>
    <div style="margin-top:4px;">${m.desc}</div>
  `;
  stack.appendChild(t);
  setTimeout(() => { t.style.transition = "opacity .3s ease"; t.style.opacity = "0"; }, 3400);
  setTimeout(() => { t.remove(); }, 3800);
}

function showLogoff(main, sub) {
  const ov = document.getElementById("logoff-overlay");
  document.getElementById("logoff-text").textContent = main;
  document.getElementById("logoff-sub").textContent = sub || "";
  ov.classList.add("is-visible");
  ov.removeAttribute("hidden");
}
function hideLogoff() {
  const ov = document.getElementById("logoff-overlay");
  ov.classList.remove("is-visible");
  ov.setAttribute("hidden", "");
}

// Defensive init: force overlay hidden on load regardless of cached CSS or HTML state.
// Runs synchronously at script load (script tag is at end of body, so DOM is ready).
(function forceOverlayHiddenOnLoad() {
  const ov = document.getElementById("logoff-overlay");
  if (ov) {
    ov.classList.remove("is-visible");
    ov.setAttribute("hidden", "");
  }
})();

/* ==================================================
   XP pane — Start menu + Switch Experience submenu
   ================================================== */

(function xpInit() {
  const btn = document.getElementById("xp-start-btn");
  const menu = document.getElementById("xp-startmenu");
  const submenuRow = document.getElementById("xp-switch-trigger");

  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    menu.hidden = !menu.hidden;
    if (menu.hidden) submenuRow.classList.remove("open");
  });

  // Hovering opens the submenu; clicking the row toggles it too.
  submenuRow.addEventListener("mouseenter", () => submenuRow.classList.add("open"));
  submenuRow.addEventListener("click", (e) => {
    e.stopPropagation();
    submenuRow.classList.toggle("open");
  });

  // Submenu items
  document.querySelectorAll("#xp-submenu .xp-sub-item").forEach(el => {
    el.addEventListener("click", (e) => {
      e.stopPropagation();
      const target = el.dataset.target;
      menu.hidden = true;
      submenuRow.classList.remove("open");
      performSwitch(target, { via: "xp" });
    });
  });

  // Close on outside click
  document.addEventListener("click", (e) => {
    if (!menu.contains(e.target) && e.target !== btn) {
      menu.hidden = true;
      submenuRow.classList.remove("open");
    }
  });
})();

/* ==================================================
   GIT pane — terminal input + autocomplete
   ================================================== */

const GIT_CMDS_HELP = [
  "git switch <mode>",
  "git checkout --experience=<mode>",
  "help",
  "clear",
  "whoami",
];

function appendGitLine(html, cls = "") {
  const body = document.getElementById("git-body");
  const pre = document.createElement("pre");
  pre.className = "git-line " + cls;
  pre.innerHTML = html;
  body.appendChild(pre);
  body.scrollTop = body.scrollHeight;
}

(function gitInit() {
  const input = document.getElementById("git-input");
  const ac = document.getElementById("git-autocomplete");
  let acIndex = -1;

  function closeAC() {
    ac.hidden = true;
    ac.innerHTML = "";
    acIndex = -1;
  }

  function renderAC(items) {
    if (!items.length) { closeAC(); return; }
    ac.innerHTML = items.map((it, i) =>
      `<div class="git-ac-item${i === acIndex ? " active" : ""}" data-idx="${i}" data-value="${it.value}">
         <span class="git-ac-mode">${it.value}</span>
         <span class="git-ac-desc">${it.desc}</span>
       </div>`
    ).join("");
    ac.hidden = false;

    ac.querySelectorAll(".git-ac-item").forEach(el => {
      el.addEventListener("mousedown", (e) => {
        e.preventDefault();
        acceptAC(el.dataset.value);
      });
    });
  }

  function computeAC() {
    const val = input.value;
    // Trigger after "git switch " or "git checkout --experience=" or partial mode tokens
    const m1 = val.match(/git\s+switch\s+(\S*)$/);
    const m2 = val.match(/git\s+checkout\s+--experience=(\S*)$/);
    const prefix = (m1 && m1[1]) ?? (m2 && m2[1]) ?? null;

    if (prefix === null) {
      // When the line is empty-ish, suggest the full commands
      if (val.trim() === "" || /^g(i(t)?)?$/.test(val.trim())) {
        const items = GIT_CMDS_HELP.map(c => ({ value: c, desc: "" }));
        renderAC(items);
        return;
      }
      closeAC();
      return;
    }

    const items = Object.entries(MODES)
      .filter(([k]) => k.startsWith(prefix.toLowerCase()))
      .map(([k, m]) => ({ value: k, desc: m.label }));
    renderAC(items);
  }

  function acceptAC(value) {
    const val = input.value;
    let next = val;
    const m1 = val.match(/^(git\s+switch\s+)(\S*)$/);
    const m2 = val.match(/^(git\s+checkout\s+--experience=)(\S*)$/);
    if (m1) next = m1[1] + value;
    else if (m2) next = m2[1] + value;
    else next = value;
    input.value = next;
    closeAC();
    input.focus();
  }

  input.addEventListener("input", computeAC);
  input.addEventListener("focus", computeAC);
  input.addEventListener("blur", () => setTimeout(closeAC, 120));

  input.addEventListener("keydown", (e) => {
    const items = ac.querySelectorAll(".git-ac-item");
    if (!ac.hidden && items.length) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        acIndex = (acIndex + 1) % items.length;
        items.forEach((el, i) => el.classList.toggle("active", i === acIndex));
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        acIndex = (acIndex - 1 + items.length) % items.length;
        items.forEach((el, i) => el.classList.toggle("active", i === acIndex));
        return;
      }
      if (e.key === "Tab") {
        e.preventDefault();
        const pick = items[Math.max(0, acIndex)];
        if (pick) acceptAC(pick.dataset.value);
        return;
      }
    }

    if (e.key === "Enter") {
      e.preventDefault();
      const line = input.value.trim();
      if (!line) return;
      runGit(line);
      input.value = "";
      closeAC();
    }
    if (e.key === "Escape") {
      closeAC();
    }
  });

  function runGit(line) {
    appendGitLine(`<span class="git-ps1" style="color:#7ee787;font-weight:600;">jake@ruth $</span> ${escapeHtml(line)}`);

    // Parse
    const mSwitch = line.match(/^git\s+switch\s+(\S+)/);
    const mCheckout = line.match(/^git\s+checkout\s+--experience=(\S+)/);
    const target = (mSwitch && mSwitch[1]) || (mCheckout && mCheckout[1]);

    if (target) {
      if (MODES[target]) {
        performSwitch(target, { via: "git" });
      } else {
        appendGitLine(`<span class="err">error: pathspec '${escapeHtml(target)}' did not match any experience known to git</span>`);
        appendGitLine(`<span class="muted">Known: ${Object.keys(MODES).join(", ")}</span>`);
      }
      return;
    }

    if (line === "help" || line === "--help") {
      appendGitLine("Available commands:");
      GIT_CMDS_HELP.forEach(c => appendGitLine(`  <b>${c}</b>`));
      appendGitLine(`Modes: <b>${Object.keys(MODES).join(" | ")}</b>`);
      return;
    }

    if (line === "clear") {
      document.getElementById("git-body").innerHTML = "";
      return;
    }

    if (line === "whoami") {
      appendGitLine("Jake Ruth &lt;jake@stockunlock.com&gt;");
      appendGitLine(`<span class="muted">13 years shipping. One chapter ending.</span>`);
      return;
    }

    appendGitLine(`<span class="err">zsh: command not found: ${escapeHtml(line)}</span>`);
    appendGitLine(`<span class="muted">Try: git switch xp | git switch git | git switch saas | git switch readme</span>`);
  }

  function escapeHtml(s) {
    return s.replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }
})();

/* ==================================================
   SAAS pane — product view dropdown
   ================================================== */

(function saasInit() {
  const trigger = document.getElementById("saas-dd-trigger");
  const dd = document.getElementById("saas-dropdown");

  trigger.addEventListener("click", (e) => {
    e.stopPropagation();
    dd.hidden = !dd.hidden;
  });

  dd.querySelectorAll(".saas-dd-item").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const target = btn.dataset.target;
      dd.hidden = true;
      performSwitch(target, { via: "saas" });
    });
  });

  document.addEventListener("click", (e) => {
    if (!trigger.contains(e.target)) dd.hidden = true;
  });
})();

/* ==================================================
   README pane — details checklist
   ================================================== */

(function readmeInit() {
  const boxes = document.querySelectorAll(".md-checklist input[type='checkbox']");
  boxes.forEach(cb => {
    cb.addEventListener("change", (e) => {
      if (!cb.checked) { return; }
      // Uncheck siblings (radio-like)
      boxes.forEach(other => { if (other !== cb) other.checked = false; });
      const target = cb.dataset.target;
      performSwitch(target, { via: "readme" });
    });
  });
})();

/* ==================================================
   On load: welcome toast
   ================================================== */

window.addEventListener("load", () => {
  setTimeout(() => {
    const stack = document.getElementById("toast-stack");
    const t = document.createElement("div");
    t.className = "toast";
    t.innerHTML = `
      <strong>Four switchers, one page.</strong>
      <div style="color:#9aa3ae;">Try the green <b>start</b> button, the terminal, the <b>Product view ▾</b> menu, or the <b>## Experience Mode</b> block.</div>
    `;
    stack.appendChild(t);
    setTimeout(() => { t.style.transition = "opacity .4s ease"; t.style.opacity = "0"; }, 5500);
    setTimeout(() => t.remove(), 6000);
  }, 400);
});
