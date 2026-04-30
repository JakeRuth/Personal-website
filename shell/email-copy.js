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

  function showToast(message) {
    let t = document.getElementById("shell-email-toast");
    if (!t) {
      t = document.createElement("div");
      t.id = "shell-email-toast";
      t.style.cssText =
        "position:fixed;bottom:24px;left:50%;transform:translateX(-50%) translateY(20px);" +
        "background:#1a1a1a;color:#fff;padding:10px 16px;border-radius:6px;" +
        "font:500 13px/1.3 system-ui,-apple-system,Segoe UI,sans-serif;" +
        "box-shadow:0 4px 18px rgba(0,0,0,0.25);z-index:99999;" +
        "opacity:0;transition:opacity .18s,transform .18s;pointer-events:none;";
      document.body.appendChild(t);
    }
    t.textContent = message;
    requestAnimationFrame(() => {
      t.style.opacity = "1";
      t.style.transform = "translateX(-50%) translateY(0)";
    });
    clearTimeout(t._hideTimer);
    t._hideTimer = setTimeout(() => {
      t.style.opacity = "0";
      t.style.transform = "translateX(-50%) translateY(20px)";
    }, 1900);
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
