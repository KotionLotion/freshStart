(() => {
  function initializeNavbars() {
    document.querySelectorAll("[data-navbar-root]").forEach((navbar) => {
      if (navbar.dataset.navInitialized === "true") return;
      navbar.dataset.navInitialized = "true";

      const toggle = navbar.querySelector(".site-navbar__toggle");
      const links = navbar.querySelector(".site-navbar__links");

      function closeMenu() {
        navbar.dataset.navOpen = "false";
        toggle.setAttribute("aria-expanded", "false");
        toggle.setAttribute("aria-label", "Open navigation menu");
      }

      toggle.addEventListener("click", () => {
        const isOpen = navbar.dataset.navOpen === "true";
        navbar.dataset.navOpen = String(!isOpen);
        toggle.setAttribute("aria-expanded", String(!isOpen));
        toggle.setAttribute("aria-label", isOpen ? "Open navigation menu" : "Close navigation menu");
      });

      links.addEventListener("click", closeMenu);
      document.addEventListener("click", (event) => {
        if (!navbar.contains(event.target)) closeMenu();
      });
      window.addEventListener("resize", () => {
        if (window.innerWidth > 720) closeMenu();
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeNavbars, { once: true });
  } else {
    initializeNavbars();
  }
})();
