(() => {
  "use strict";

  function qs(sel, root = document) {
    return root.querySelector(sel);
  }

  function qsa(sel, root = document) {
    return Array.prototype.slice.call(root.querySelectorAll(sel));
  }

  function on(el, eventName, handler, options) {
    if (!el) return;
    el.addEventListener(eventName, handler, options || false);
  }

  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn, { once: true });
    } else {
      fn();
    }
  }

  function setText(el, text) {
    if (!el) return;
    el.textContent = text;
  }

  // Expose minimal helper namespace
  window.Utils = { qs, qsa, on, ready, setText };
})();
