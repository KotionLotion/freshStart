(() => {
  const settingsKey = "fresh-start-accessibility";
  const defaults = { textSize: "1", highContrast: false, readableFont: false, underlineLinks: false };

  function loadSettings() {
    try {
      const saved = localStorage.getItem(settingsKey);
      if (!saved) return { ...defaults };
      const parsed = JSON.parse(saved);
      return {
        textSize: ["1", "1.15", "1.3"].includes(parsed.textSize) ? parsed.textSize : defaults.textSize,
        highContrast: Boolean(parsed.highContrast),
        readableFont: Boolean(parsed.readableFont),
        underlineLinks: Boolean(parsed.underlineLinks)
      };
    } catch (error) {
      console.error("Could not read saved accessibility settings.", error);
      return { ...defaults };
    }
  }

  function initializeAccessibility() {
    const root = document.querySelector(".accessibility-root");
    if (!root || root.dataset.initialized === "true") return;
    root.dataset.initialized = "true";

    const launcher = root.querySelector(".accessibility-launcher");
    const panel = root.querySelector(".accessibility-panel");
    const closeButton = root.querySelector(".accessibility-panel__close");
    const backdrop = root.querySelector(".accessibility-backdrop");
    const textSize = root.querySelector("#accessibility-text-size");
    const highContrast = root.querySelector("#accessibility-high-contrast");
    const readableFont = root.querySelector("#accessibility-readable-font");
    const underlineLinks = root.querySelector("#accessibility-underline-links");
    const reset = root.querySelector(".accessibility-reset");
    const status = root.querySelector(".accessibility-status");
    let settings = loadSettings();

    function applySettings() {
      document.documentElement.style.setProperty("--accessibility-text-scale", settings.textSize);
      document.documentElement.dataset.highContrast = String(settings.highContrast);
      document.documentElement.dataset.readableFont = String(settings.readableFont);
      document.documentElement.dataset.underlineLinks = String(settings.underlineLinks);
      textSize.value = settings.textSize;
      highContrast.checked = settings.highContrast;
      readableFont.checked = settings.readableFont;
      underlineLinks.checked = settings.underlineLinks;
    }

    function saveSettings() {
      applySettings();
      try {
        localStorage.setItem(settingsKey, JSON.stringify(settings));
        status.textContent = "Settings saved for all pages.";
      } catch (error) {
        status.textContent = "Settings could not be saved in this browser.";
        console.error("Could not save accessibility settings.", error);
      }
    }

    function setOpen(open) {
      panel.dataset.open = String(open);
      panel.setAttribute("aria-hidden", String(!open));
      launcher.setAttribute("aria-expanded", String(open));
      backdrop.hidden = !open;
      if (open) closeButton.focus();
      else launcher.focus();
    }

    applySettings();
    launcher.addEventListener("click", () => setOpen(true));
    closeButton.addEventListener("click", () => setOpen(false));
    backdrop.addEventListener("click", () => setOpen(false));
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && panel.dataset.open === "true") setOpen(false);
      if (event.key !== "Tab" || panel.dataset.open !== "true") return;

      const focusable = [...panel.querySelectorAll('button:not([disabled]), select, input:not([disabled])')];
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });

    textSize.addEventListener("change", () => {
      settings.textSize = textSize.value;
      saveSettings();
    });
    highContrast.addEventListener("change", () => {
      settings.highContrast = highContrast.checked;
      saveSettings();
    });
    readableFont.addEventListener("change", () => {
      settings.readableFont = readableFont.checked;
      saveSettings();
    });
    underlineLinks.addEventListener("change", () => {
      settings.underlineLinks = underlineLinks.checked;
      saveSettings();
    });
    reset.addEventListener("click", () => {
      settings = { ...defaults };
      saveSettings();
      status.textContent = "Settings reset for all pages.";
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeAccessibility, { once: true });
  } else {
    initializeAccessibility();
  }
})();
