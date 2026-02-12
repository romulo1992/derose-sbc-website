(() => {
  "use strict";

  const PARTIAL_URL = "/assets/partials/navbar.html";
  const MOUNT_SEL = "[data-navbar]";

  function isLpPage() {
    const body = document.body;
    if (!body) return false;
    return body.classList.contains("lp-page") || body.dataset.page === "lp";
  }

  function cleanupNavbar() {
    document.querySelectorAll(MOUNT_SEL).forEach((mount) => {
      mount.innerHTML = "";
      if (mount.childElementCount === 0) mount.remove();
    });

    const drawers = document.querySelectorAll("#drawer");
    drawers.forEach((drawer) => {
      const parent = drawer.parentElement;
      if (parent && parent.matches(MOUNT_SEL)) {
        parent.innerHTML = "";
        parent.remove();
      } else {
        drawer.remove();
      }
    });

    document.querySelectorAll("body > header").forEach((header) => header.remove());
    document.body.style.overflow = "";
    window.Navbar = undefined;
  }

  function disablePlaceholderLinks(scope) {
    const links = scope.querySelectorAll('a[aria-disabled="true"]');
    links.forEach((a) => a.addEventListener("click", (e) => e.preventDefault()));
  }

  function initDrawer(scope) {
    const drawer = scope.querySelector("#drawer");
    const toggle = scope.querySelector("#mobileToggle");
    const closeBtn = scope.querySelector("#drawerClose");
    const aulasToggle = scope.querySelector("#aulasToggle");
    const aulasSubmenu = scope.querySelector("#aulasSubmenu");
    const aulasItem = scope.querySelector(".drawer-item-accordion");
    const desktopQuery = window.matchMedia("(min-width: 981px)");

    if (!drawer) return;

    if (toggle) {
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-controls", "drawer");
    }

    function collapseAulas() {
      if (!aulasToggle || !aulasSubmenu) return;
      aulasToggle.setAttribute("aria-expanded", "false");
      aulasSubmenu.hidden = true;
      if (aulasItem) aulasItem.classList.remove("is-open");
    }

    function toggleAulas() {
      if (!aulasToggle || !aulasSubmenu) return;
      const willOpen = aulasToggle.getAttribute("aria-expanded") !== "true";
      aulasToggle.setAttribute("aria-expanded", String(willOpen));
      aulasSubmenu.hidden = !willOpen;
      if (aulasItem) aulasItem.classList.toggle("is-open", willOpen);
    }

    function handleAulasToggle(event) {
      event.preventDefault();
      event.stopPropagation();
      toggleAulas();
    }

    collapseAulas();

    function openDrawer() {
      drawer.classList.add("open");
      drawer.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
      if (toggle) toggle.setAttribute("aria-expanded", "true");
    }

    function closeDrawer() {
      drawer.classList.remove("open");
      drawer.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
      if (toggle) toggle.setAttribute("aria-expanded", "false");
      collapseAulas();
    }

    if (toggle) toggle.addEventListener("click", openDrawer);
    if (closeBtn) closeBtn.addEventListener("click", closeDrawer);
    if (aulasToggle) aulasToggle.addEventListener("click", handleAulasToggle);

    drawer.addEventListener("click", (e) => {
      if (e.target === drawer) closeDrawer();
    });

    drawer.querySelectorAll("[data-close]").forEach((el) => {
      el.addEventListener("click", closeDrawer);
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && drawer.classList.contains("open")) closeDrawer();
    });

    desktopQuery.addEventListener("change", (event) => {
      if (event.matches && drawer.classList.contains("open")) closeDrawer();
    });

    window.Navbar = { openDrawer, closeDrawer };
  }

  function setActiveLink(scope) {
    const links = scope.querySelectorAll('nav [data-nav]');
    links.forEach((a) => {
      a.classList.remove("active");
      a.removeAttribute("aria-current");
    });

    const path = (location.pathname || "/").replace(/\/+$/, "") || "/";
    const sectionMap = [
      { prefix: "/blog", key: "blog" },
      { prefix: "/aulas", key: "aulas" },
      { prefix: "/cursos", key: "cursos" },
      { prefix: "/formacao", key: "formacao" },
      { prefix: "/eventos", key: "eventos" },
      { prefix: "/bistro", key: "bistro" },
    ];

    const match = sectionMap.find((item) => path === item.prefix || path.startsWith(`${item.prefix}/`));
    if (match) {
      const active = scope.querySelector(`nav [data-nav="${match.key}"]`);
      if (active) {
        active.classList.add("active");
        active.setAttribute("aria-current", "page");
      }
      return;
    }

    const hash = (location.hash || "").replace("#", "");
    if (!hash) return;

    const a = scope.querySelector(`nav [data-nav="${hash}"]`);
    if (a) {
      a.classList.add("active");
      a.setAttribute("aria-current", "page");
    }
  }

  function wireNavbar(scope) {
    disablePlaceholderLinks(scope);
    initDrawer(scope);
    setActiveLink(scope);

    window.addEventListener("hashchange", () => setActiveLink(scope));
    document.addEventListener("softnav:loaded", () => setActiveLink(scope));
  }

  function injectNavbar() {
    if (isLpPage()) {
      cleanupNavbar();
      return;
    }

    const mount = document.querySelector(MOUNT_SEL);
    if (!mount) return;
    if (mount.querySelector("header")) {
      setActiveLink(mount);
      return;
    }

    fetch(PARTIAL_URL, { cache: "no-cache" })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch navbar: " + res.status);
        return res.text();
      })
      .then((html) => {
        mount.innerHTML = html;
        wireNavbar(mount);

        document.dispatchEvent(new CustomEvent("navbar:ready"));
      })
      .catch((err) => {
        console.warn("[navbar] inject failed:", err);
      });
  }

  function init() {
    if (isLpPage()) {
      cleanupNavbar();
      return;
    }

    injectNavbar();
    document.addEventListener("softnav:loaded", injectNavbar);
  }

  if (window.Utils && window.Utils.ready) window.Utils.ready(init);
  else document.addEventListener("DOMContentLoaded", init, { once: true });
})();
