(() => {
  "use strict";

  function initProgress() {
    const bar = document.getElementById("progress");
    if (!bar) return;

    const update = () => {
      const doc = document.documentElement;
      const scrollTop = doc.scrollTop || document.body.scrollTop;
      const scrollHeight =
        (doc.scrollHeight || document.body.scrollHeight) - doc.clientHeight;
      const pct = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
      bar.style.width = `${Math.min(100, Math.max(0, pct))}%`;
    };

    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();
  }

  function initCopyLink() {
    const btn = document.getElementById("copyLink");
    if (!btn) return;

    const resetLabel = () => {
      btn.textContent = "Copiar link";
    };

    btn.addEventListener("click", async () => {
      try {
        if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(window.location.href);
        } else {
          throw new Error("Clipboard API unavailable.");
        }
      } catch (error) {
        const tmp = document.createElement("input");
        tmp.value = window.location.href;
        document.body.appendChild(tmp);
        tmp.select();
        document.execCommand("copy");
        document.body.removeChild(tmp);
      }

      btn.textContent = "Link copiado ✓";
      window.setTimeout(resetLabel, 1400);
    });
  }

  function init() {
    initProgress();
    initCopyLink();
  }

  if (window.Utils && window.Utils.ready) window.Utils.ready(init);
  else document.addEventListener("DOMContentLoaded", init, { once: true });

  document.addEventListener("softnav:loaded", init);
})();
