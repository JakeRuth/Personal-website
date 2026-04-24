/* Ruth & Co. — small, editorial, no framework.
   Three jobs: theme toggle, configurator wiring, copy-curl. */

(function () {
  "use strict";

  // ---------- Theme toggle ----------
  const root = document.body;
  const stored = localStorage.getItem("ruthco-theme");
  if (stored === "dark" || stored === "light") {
    root.setAttribute("data-theme", stored);
  }
  const tt = document.getElementById("theme-toggle");
  if (tt) {
    tt.addEventListener("click", function () {
      const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      try { localStorage.setItem("ruthco-theme", next); } catch (e) { /* noop */ }
    });
  }

  // ---------- Configurator ----------
  const shapeCopy = {
    fulltime: {
      label: "Full-time",
      title: function (s) { return "Full-time employment, " + s.label.toLowerCase() + " surface."; },
      desc: "A senior IC who ships the feature, the docs, and the runbook. Day one.",
      terms: "Market rate + equity"
    },
    founding: {
      label: "Founding",
      title: function (s) { return "Equity founding, " + s.label.toLowerCase() + " surface."; },
      desc: "Co-founder track. Real equity, small seed or earlier. Has to be a problem I care about.",
      terms: "Let's talk"
    },
    contract: {
      label: "Contract",
      title: function (s) { return "Contract engagement, " + s.label.toLowerCase() + " surface."; },
      desc: "Defined deliverable, defined timeline. Selective — I take work I can ship.",
      terms: "Contact"
    },
    starter: {
      label: "Starter",
      title: function () { return "A thirty-minute starter conversation."; },
      desc: "If you're not sure yet. Email me; we'll figure it out.",
      terms: "Free · 30 min"
    }
  };
  const surfaceCopy = {
    product:  { label: "Product",  sku: "PRODUCT"  },
    platform: { label: "Platform", sku: "PLATFORM" },
    ai:       { label: "AI-native", sku: "AI" },
    founding: { label: "Founding", sku: "FOUND" }
  };
  const shapeSku = {
    fulltime: "FT", founding: "FD", contract: "CT", starter: "ST"
  };

  function getChecked(name) {
    const el = document.querySelector('input[name="' + name + '"]:checked');
    return el ? el.value : null;
  }

  function renderConfig() {
    const shape = getChecked("shape") || "fulltime";
    const surface = getChecked("surface") || "product";
    const s = shapeCopy[shape];
    const surf = surfaceCopy[surface];

    const sku = "JAKE-13-" + shapeSku[shape] + "-" + surf.sku;
    setText("sku", sku);
    setText("summary-title", s.title(surf));
    setText("summary-desc", s.desc);
    setText("kv-shape", s.label);
    setText("kv-surface", surf.label);

    const subject = "Ruth & Co. — " + sku;
    const body = [
      "Configuration: " + sku,
      "Shape: " + s.label,
      "Surface: " + surf.label,
      "Terms: " + s.terms,
      "",
      "Two paragraphs of context, if you can spare them."
    ].join("\n");
    const cta = document.getElementById("summary-cta");
    if (cta) {
      cta.href = "mailto:jake@stockunlock.com"
        + "?subject=" + encodeURIComponent(subject)
        + "&body=" + encodeURIComponent(body);
    }
  }

  function setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  document.querySelectorAll('input[name="shape"], input[name="surface"]').forEach(function (el) {
    el.addEventListener("change", renderConfig);
  });
  renderConfig();

  // ---------- Copy curl ----------
  const copyBtn = document.getElementById("copy-curl");
  const codeBody = document.querySelector(".code-body");
  if (copyBtn && codeBody) {
    copyBtn.addEventListener("click", async function () {
      const text = codeBody.innerText;
      try {
        await navigator.clipboard.writeText(text);
      } catch (e) {
        // Fallback for file:// etc.
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.left = "-9999px";
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand("copy"); } catch (_) { /* noop */ }
        document.body.removeChild(ta);
      }
      copyBtn.textContent = "Copied";
      copyBtn.classList.add("copied");
      setTimeout(function () {
        copyBtn.textContent = "Copy";
        copyBtn.classList.remove("copied");
      }, 1400);
    });
  }
})();
