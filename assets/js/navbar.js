(() => {
  "use strict";

  function disablePlaceholderLinks() {
    const links = document.querySelectorAll('a[aria-disabled="true"]');
    links.forEach((a) => {
      a.addEventListener("click", (e) => e.preventDefault());
    });
  }

  function initDrawer() {
    const drawer = document.getElementById("drawer");
    const toggle = document.getElementById("mobileToggle");
    const closeBtn = document.getElementById("drawerClose");

    if (!drawer) return;

    function openDrawer() {
      drawer.classList.add("open");
      drawer.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
    }

    function closeDrawer() {
      drawer.classList.remove("open");
      drawer.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
    }

    if (toggle) toggle.addEventListener("click", openDrawer);
    if (closeBtn) closeBtn.addEventListener("click", closeDrawer);

    drawer.addEventListener("click", (e) => {
      if (e.target === drawer) closeDrawer();
    });

    drawer.querySelectorAll("[data-close]").forEach((el) => {
      el.addEventListener("click", closeDrawer);
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && drawer.classList.contains("open")) {
        closeDrawer();
      }
    });

    window.Navbar = { openDrawer, closeDrawer };
  }

  function init() {
    disablePlaceholderLinks();
    initDrawer();
  }

  if (window.Utils && window.Utils.ready) window.Utils.ready(init);
  else document.addEventListener("DOMContentLoaded", init, { once: true });
})();
