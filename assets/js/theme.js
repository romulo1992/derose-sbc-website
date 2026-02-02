(() => {
  "use strict";

  const THEME_KEY = "theme";

  function systemPrefersDark() {
    return !!(
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    );
  }

  function getSavedTheme() {
    try {
      return localStorage.getItem(THEME_KEY);
    } catch {
      return null;
    }
  }

  function applyTheme(theme, { persist = true } = {}) {
    const root = document.documentElement;
    const themeBtn = document.getElementById("themeToggle");
    const metaTheme = document.querySelector('meta[name="theme-color"]');

    if (theme === "dark") root.setAttribute("data-theme", "dark");
    else root.removeAttribute("data-theme");

    if (persist) {
      try {
        localStorage.setItem(THEME_KEY, theme);
      } catch {
        // ignore
      }
    }

    if (themeBtn) {
      const isDark = theme === "dark";
      themeBtn.setAttribute("aria-pressed", isDark ? "true" : "false");
      themeBtn.setAttribute(
        "aria-label",
        isDark ? "Desativar modo escuro" : "Ativar modo escuro"
      );
    }

    if (metaTheme) {
      metaTheme.setAttribute("content", theme === "dark" ? "#0b1012" : "#297E8A");
    }
  }

  function initTheme() {
    const saved = getSavedTheme();
    if (saved === "light" || saved === "dark") {
      applyTheme(saved, { persist: false });
    } else {
      applyTheme(systemPrefersDark() ? "dark" : "light", { persist: false });
    }
  }

  function bindToggle() {
    const btn = document.getElementById("themeToggle");
    if (!btn) return;

    btn.addEventListener("click", () => {
      const root = document.documentElement;
      const current = root.getAttribute("data-theme") === "dark" ? "dark" : "light";
      applyTheme(current === "dark" ? "light" : "dark");
    });
  }

  function followSystemIfNoChoice() {
    if (!window.matchMedia) return;

    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e) => {
      const saved = getSavedTheme();
      if (saved !== "light" && saved !== "dark") {
        applyTheme(e.matches ? "dark" : "light", { persist: false });
      }
    };

    // Compat
    if (typeof mq.addEventListener === "function") mq.addEventListener("change", handler);
    else if (typeof mq.addListener === "function") mq.addListener(handler);
  }

  function init() {
    initTheme();
    bindToggle();
    followSystemIfNoChoice();
  }

  window.Theme = { init, applyTheme, initTheme };

  if (window.Utils && window.Utils.ready) window.Utils.ready(init);
  else document.addEventListener("DOMContentLoaded", init, { once: true });
})();
