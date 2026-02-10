(() => {
  "use strict";

  const MAIN_SELECTOR = "main";
  const EVENT_NAME = "softnav:loaded";
  let isNavigating = false;

  function isModifiedEvent(event) {
    return event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0;
  }

  function isExternalProtocol(href) {
    return href.startsWith("mailto:") || href.startsWith("tel:") || href.startsWith("sms:");
  }

  function shouldHandleLink(link) {
    if (!link || link.tagName !== "A") return false;
    if (link.hasAttribute("data-no-soft")) return false;
    if (link.hasAttribute("download")) return false;

    const target = link.getAttribute("target");
    if (target && target !== "_self") return false;

    const href = link.getAttribute("href") || "";
    if (!href || href.startsWith("#") || isExternalProtocol(href)) return false;

    const url = new URL(link.href, window.location.href);
    if (url.origin !== window.location.origin) return false;

    const samePath = url.pathname === window.location.pathname && url.search === window.location.search;
    if (samePath && url.hash) return false;

    return true;
  }

  function syncMeta(doc, selector) {
    const next = doc.querySelector(selector);
    if (!next) return;

    let current = document.querySelector(selector);
    if (!current) {
      current = next.cloneNode(true);
      document.head.appendChild(current);
      return;
    }

    const content = next.getAttribute("content") || "";
    current.setAttribute("content", content);
  }

  function syncHead(doc) {
    if (doc.title) document.title = doc.title;
    [
      'meta[name="description"]',
      'meta[property="og:title"]',
      'meta[property="og:description"]',
      'meta[property="og:type"]',
    ].forEach((selector) => syncMeta(doc, selector));

    syncStylesheets(doc);
  }

  function syncStylesheets(doc) {
    const desiredLinks = Array.from(doc.querySelectorAll('head link[rel="stylesheet"]'));
    const currentLinks = Array.from(document.querySelectorAll('head link[rel="stylesheet"]'));
    const desiredHrefs = new Set(
      desiredLinks
        .map((link) => link.getAttribute("href"))
        .filter(Boolean)
    );

    currentLinks.forEach((link) => {
      const href = link.getAttribute("href");
      if (href && !desiredHrefs.has(href)) link.remove();
    });

    desiredLinks.forEach((link) => {
      const href = link.getAttribute("href");
      if (!href) return;
      if (document.querySelector(`head link[rel="stylesheet"][href="${href}"]`)) return;

      const next = document.createElement("link");
      next.rel = "stylesheet";
      next.href = href;
      document.head.appendChild(next);
    });
  }

  function syncBody(doc) {
    const nextBody = doc.body;
    if (!nextBody) return;

    document.body.className = nextBody.className;

    Array.from(document.body.attributes).forEach((attr) => {
      if (attr.name === "class") return;
      if (!nextBody.hasAttribute(attr.name)) {
        document.body.removeAttribute(attr.name);
      }
    });

    Array.from(nextBody.attributes).forEach((attr) => {
      if (attr.name === "class") return;
      document.body.setAttribute(attr.name, attr.value);
    });
  }

  function swapMain(doc) {
    const nextMain = doc.querySelector(MAIN_SELECTOR);
    const currentMain = document.querySelector(MAIN_SELECTOR);
    if (!nextMain || !currentMain) return false;
    currentMain.replaceWith(nextMain);
    return true;
  }

  function loadScripts(doc) {
    const scripts = Array.from(doc.querySelectorAll("script[src]"));
    scripts.forEach((script) => {
      const src = script.getAttribute("src");
      if (!src) return;
      if (document.querySelector(`script[src="${src}"]`)) return;

      const next = document.createElement("script");
      next.src = src;
      if (script.type) next.type = script.type;
      if (script.noModule) next.noModule = true;
      if (script.async) next.async = true;
      if (script.defer) next.defer = true;
      document.body.appendChild(next);
    });
  }

  function finalizeNavigation(url) {
    if (url.hash) {
      const id = decodeURIComponent(url.hash.slice(1));
      const target = document.getElementById(id);
      if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
      else window.scrollTo(0, 0);
    } else {
      window.scrollTo(0, 0);
    }

    document.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: { url: url.href } }));
  }

  function navigate(url, { push = true } = {}) {
    if (isNavigating) return;
    isNavigating = true;

    if (window.Navbar && typeof window.Navbar.closeDrawer === "function") {
      window.Navbar.closeDrawer();
    }

    fetch(url.href, { headers: { "X-Requested-With": "soft-nav" } })
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to fetch ${url.href}: ${res.status}`);
        return res.text();
      })
      .then((html) => {
        const doc = new DOMParser().parseFromString(html, "text/html");
        if (!swapMain(doc)) {
          window.location.href = url.href;
          return;
        }

        syncHead(doc);
        syncBody(doc);
        loadScripts(doc);

        if (push) history.pushState({ soft: true }, "", url.href);
        finalizeNavigation(url);
      })
      .catch(() => {
        window.location.href = url.href;
      })
      .finally(() => {
        isNavigating = false;
      });
  }

  function handleClick(event) {
    if (isModifiedEvent(event)) return;
    const link = event.target.closest("a");
    if (!shouldHandleLink(link)) return;
    event.preventDefault();
    navigate(new URL(link.href, window.location.href));
  }

  function handlePopState() {
    navigate(new URL(window.location.href), { push: false });
  }

  function init() {
    document.addEventListener("click", handleClick);
    window.addEventListener("popstate", handlePopState);
  }

  if (window.Utils && window.Utils.ready) window.Utils.ready(init);
  else document.addEventListener("DOMContentLoaded", init, { once: true });
})();
