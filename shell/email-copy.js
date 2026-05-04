/* Site-wide email behavior.
   Every "Email Jake" affordance — mailto: links, the literal email
   shown anywhere, or any element marked data-copy-email — copies
   jake2ruth@gmail.com to the clipboard and shows a small toast.
   Never launches a mail client. Single source of truth. */

(function () {
  "use strict";

  const EMAIL = "jake2ruth@gmail.com";

  // Match a mailto: link addressed to Jake's email (with or without
  // ?subject=… params). Anything else (different recipient) falls
  // through untouched.
  function isJakeMailto(el) {
    if (!el || el.tagName !== "A") return false;
    const href = el.getAttribute("href") || "";
    return href.startsWith("mailto:" + EMAIL);
  }

  function ensureToast() {
    let t = document.getElementById("shell-email-toast");
    if (t) return t;
    t = document.createElement("div");
    t.id = "shell-email-toast";
    t.style.cssText =
      "position:fixed;bottom:48px;left:50%;transform:translateX(-50%) translateY(28px) scale(0.96);" +
      "display:flex;align-items:center;gap:10px;" +
      "background:linear-gradient(180deg,#2faa54 0%,#1f8a3f 100%);color:#fff;" +
      "padding:13px 22px 13px 18px;border-radius:999px;" +
      "border:1px solid rgba(255,255,255,0.35);" +
      "font:600 14px/1.2 'Segoe UI','Trebuchet MS',system-ui,-apple-system,sans-serif;" +
      "letter-spacing:0.2px;" +
      "box-shadow:0 10px 30px rgba(20,80,40,0.42),0 2px 6px rgba(0,0,0,0.2);" +
      "z-index:99999;opacity:0;transition:opacity .22s ease,transform .22s ease;" +
      "pointer-events:none;max-width:90vw;white-space:nowrap;" +
      "text-shadow:0 1px 1px rgba(0,0,0,0.18);";
    const check = document.createElement("span");
    check.setAttribute("aria-hidden", "true");
    check.style.cssText =
      "display:inline-flex;align-items:center;justify-content:center;" +
      "width:22px;height:22px;border-radius:50%;" +
      "background:rgba(255,255,255,0.22);" +
      "border:1px solid rgba(255,255,255,0.5);" +
      "font-size:13px;font-weight:700;line-height:1;color:#fff;";
    check.textContent = "✓";
    const text = document.createElement("span");
    text.id = "shell-email-toast-text";
    t.appendChild(check);
    t.appendChild(text);
    document.body.appendChild(t);
    return t;
  }

  function showToast(message) {
    const t = ensureToast();
    t.querySelector("#shell-email-toast-text").textContent = message;
    requestAnimationFrame(() => {
      t.style.opacity = "1";
      t.style.transform = "translateX(-50%) translateY(0) scale(1)";
    });
    clearTimeout(t._hideTimer);
    t._hideTimer = setTimeout(() => {
      t.style.opacity = "0";
      t.style.transform = "translateX(-50%) translateY(28px) scale(0.96)";
    }, 2600);
  }

  function copyEmail() {
    const writer = navigator.clipboard && navigator.clipboard.writeText
      ? navigator.clipboard.writeText(EMAIL)
      : Promise.reject();
    writer.then(
      () => showToast("Copied " + EMAIL + " to clipboard"),
      () => showToast(EMAIL)
    );
  }

  // Public hook for other scripts that want to trigger the same flow.
  window.copyJakeEmail = copyEmail;

  // Global click delegate. Intercepts mailto: + any [data-copy-email].
  document.addEventListener("click", (e) => {
    const target = e.target.closest("a, [data-copy-email]");
    if (!target) return;
    const isExplicit = target.hasAttribute("data-copy-email");
    if (isExplicit || isJakeMailto(target)) {
      e.preventDefault();
      copyEmail();
    }
  }, true);
})();
