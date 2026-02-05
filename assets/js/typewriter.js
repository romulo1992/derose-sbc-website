(() => {
  "use strict";

  const SELECTOR = ".tw[data-words]";
  const TYPE_SPEED = 110;
  const DELETE_SPEED = 75;
  const HOLD_DELAY = 1200;
  const BETWEEN_DELAY = 250;
  const REDUCED_MOTION_INTERVAL = 2500;

  const prefersReducedMotion = () =>
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const parseWords = (el) => {
    const raw = el.getAttribute("data-words");
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  const initTypewriter = (el) => {
    if (el.dataset.twInit === "1") return;

    const words = parseWords(el);
    if (!words.length) return;

    el.dataset.twInit = "1";

    if (prefersReducedMotion()) {
      let index = 0;
      el.textContent = words[index];
      if (words.length < 2) return;
      setInterval(() => {
        index = (index + 1) % words.length;
        el.textContent = words[index];
      }, REDUCED_MOTION_INTERVAL);
      return;
    }

    let wordIndex = 0;
    let charIndex = 0;
    let direction = 1;

    const tick = () => {
      const currentWord = words[wordIndex];

      if (direction === 1) {
        charIndex += 1;
        el.textContent = currentWord.slice(0, charIndex);

        if (charIndex < currentWord.length) {
          setTimeout(tick, TYPE_SPEED);
        } else {
          setTimeout(() => {
            direction = -1;
            setTimeout(tick, DELETE_SPEED);
          }, HOLD_DELAY);
        }
      } else {
        charIndex -= 1;
        el.textContent = currentWord.slice(0, charIndex);

        if (charIndex > 0) {
          setTimeout(tick, DELETE_SPEED);
        } else {
          direction = 1;
          wordIndex = (wordIndex + 1) % words.length;
          setTimeout(tick, BETWEEN_DELAY);
        }
      }
    };

    el.textContent = "";
    setTimeout(tick, BETWEEN_DELAY);
  };

  const initAll = () => {
    document.querySelectorAll(SELECTOR).forEach(initTypewriter);
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAll, { once: true });
  } else {
    initAll();
  }

  document.addEventListener("softnav:loaded", initAll);
})();
