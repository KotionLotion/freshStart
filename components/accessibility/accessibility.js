(() => {
  const settingsKey = "fresh-start-accessibility";
  const defaults = {
    language: "en",
    textSize: "1",
    highContrast: false,
    readableFont: false,
    dyslexia: false,
    nightMode: false,
    underlineLinks: false,
  };

  const translations = {
    en: {
      accessibility: "Accessibility",
      savedIntro: "Display settings are saved and applied across every page.",
      language: "Language",
      textSize: "Text size",
      default: "Default",
      larger: "Larger",
      largest: "Largest",
      highContrast: "High contrast",
      readableFont: "Readable font and spacing",
      dyslexiaMode: "Dyslexia-friendly mode",
      nightMode: "Night mode",
      underlineLinks: "Underline links and buttons",
      readPage: "Read page aloud",
      stopReading: "Stop reading",
      resetSettings: "Reset settings",
      saved: "Settings saved for all pages.",
      reset: "Settings reset for all pages.",
      unavailable: "Screen reader is not available in this browser.",
      toastSaved: "Accessibility settings saved.",
      toastReset: "Settings reset.",
    }
  };

  function loadSettings() {
    try {
      const saved = localStorage.getItem(settingsKey);
      if (!saved) return { ...defaults };
      const parsed = JSON.parse(saved);
      return {
        language: "en",
        textSize: ["1", "1.15", "1.3"].includes(parsed.textSize) ? parsed.textSize : defaults.textSize,
        highContrast: Boolean(parsed.highContrast),
        readableFont: Boolean(parsed.readableFont),
        dyslexia: Boolean(parsed.dyslexia),
        nightMode: Boolean(parsed.nightMode),
        underlineLinks: Boolean(parsed.underlineLinks),
      };
    } catch (error) {
      console.error("Could not read saved accessibility settings.", error);
      return { ...defaults };
    }
  }

  function showToast(message) {
    const toast = document.getElementById("accessibility-toast");
    if (!toast) return;
    toast.textContent = message;
    toast.hidden = false;
    clearTimeout(showToast.timeoutId);
    showToast.timeoutId = setTimeout(() => {
      toast.hidden = true;
    }, 2600);
  }

  function formatLanguageText(key, language = "en") {
    const map = translations[language] || translations.en;
    return map[key] || translations.en[key] || key;
  }

  function applyTranslations(language) {
    const nodes = document.querySelectorAll("[data-i18n]");
    nodes.forEach((node) => {
      const key = node.dataset.i18n;
      node.textContent = formatLanguageText(key, language);
    });

    const optionNodes = document.querySelectorAll("[data-i18n-option]");
    optionNodes.forEach((node) => {
      const key = node.dataset.i18nOption;
      node.textContent = formatLanguageText(key, language);
    });

    document.documentElement.lang = "en";
    document.documentElement.dataset.language = "en";
  }

  function initializeAccessibility() {
    const root = document.querySelector(".accessibility-root");
    if (!root || root.dataset.initialized === "true") return;
    root.dataset.initialized = "true";

    const launcher = root.querySelector(".accessibility-launcher");
    const panel = root.querySelector(".accessibility-panel");
    const closeButton = root.querySelector(".accessibility-panel__close");
    const backdrop = root.querySelector(".accessibility-backdrop");
    const language = root.querySelector("#accessibility-language");
    const textSize = root.querySelector("#accessibility-text-size");
    const highContrast = root.querySelector("#accessibility-high-contrast");
    const readableFont = root.querySelector("#accessibility-readable-font");
    const dyslexia = root.querySelector("#accessibility-dyslexia-mode");
    const nightMode = root.querySelector("#accessibility-night-mode");
    const underlineLinks = root.querySelector("#accessibility-underline-links");
    const ttsButton = root.querySelector(".accessibility-tts");
    // Disable the read-aloud control even on pages that still include it in their template.
    ttsButton?.remove();
    const reset = root.querySelector(".accessibility-reset");
    const status = root.querySelector(".accessibility-status");
    let settings = loadSettings();

    function announce(message) {
      status.textContent = message;
      showToast(message);
    }

    function applySettings() {
      document.documentElement.style.setProperty("--accessibility-text-scale", settings.textSize);
      document.documentElement.dataset.highContrast = String(settings.highContrast);
      document.documentElement.dataset.readableFont = String(settings.readableFont);
      document.documentElement.dataset.dyslexia = String(settings.dyslexia);
      document.documentElement.dataset.nightMode = String(settings.nightMode);
      document.documentElement.dataset.underlineLinks = String(settings.underlineLinks);
      document.documentElement.dataset.language = settings.language;
      language.value = settings.language;
      textSize.value = settings.textSize;
      highContrast.checked = settings.highContrast;
      readableFont.checked = settings.readableFont;
      dyslexia.checked = settings.dyslexia;
      nightMode.checked = settings.nightMode;
      underlineLinks.checked = settings.underlineLinks;
      applyTranslations(settings.language);
    }

    function stopReading() {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      if (ttsButton) {
        ttsButton.textContent = formatLanguageText("readPage", settings.language);
      }
    }

    function readPageAloud() {
      if (!ttsButton) return;
      if (!("speechSynthesis" in window)) {
        announce(formatLanguageText("unavailable", settings.language));
        return;
      }

      const currentSpeech = window.speechSynthesis.speaking || window.speechSynthesis.pending;
      if (currentSpeech) {
        stopReading();
        return;
      }

      const visibleActionElements = Array.from(
        document.querySelectorAll(
          ".circle-navigation:not([hidden]) .action:not([hidden]), .list-navigation:not([hidden]) .action-list:not([hidden])"
        )
      ).filter((element) => {
        const style = window.getComputedStyle(element);
        return style.display !== "none" && style.visibility !== "hidden" && element.getClientRects().length > 0;
      });

      const pageText = visibleActionElements
        .map((element) => {
          const ariaLabel = element.getAttribute("aria-label");
          if (ariaLabel && ariaLabel.trim()) return ariaLabel.trim();

          const strongText = element.querySelector("strong");
          if (strongText && strongText.textContent.trim()) return strongText.textContent.trim();

          return (element.textContent || "").replace(/\s+/g, " ").trim();
        })
        .filter(Boolean)
        .join(". ");

      if (!pageText) {
        announce("There is no text to read.");
        return;
      }

      const utterance = new SpeechSynthesisUtterance(pageText.slice(0, 4000));
      utterance.lang = "en-US";
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.onend = () => {
        ttsButton.textContent = formatLanguageText("readPage", settings.language);
      };
      utterance.onerror = () => {
        ttsButton.textContent = formatLanguageText("readPage", settings.language);
      };

      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
      ttsButton.textContent = formatLanguageText("stopReading", settings.language);
    }

    function saveSettings() {
      applySettings();
      try {
        localStorage.setItem(settingsKey, JSON.stringify(settings));
        announce(formatLanguageText("saved", settings.language));
      } catch (error) {
        announce(formatLanguageText("saved", settings.language));
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

    language.addEventListener("change", () => {
      settings.language = language.value;
      saveSettings();
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
    dyslexia.addEventListener("change", () => {
      settings.dyslexia = dyslexia.checked;
      saveSettings();
    });
    nightMode.addEventListener("change", () => {
      settings.nightMode = nightMode.checked;
      saveSettings();
    });
    underlineLinks.addEventListener("change", () => {
      settings.underlineLinks = underlineLinks.checked;
      saveSettings();
    });
    if (ttsButton) {
      ttsButton.addEventListener("click", () => {
        readPageAloud();
      });
    }
    reset.addEventListener("click", () => {
      settings = { ...defaults };
      applySettings();
      try {
        localStorage.setItem(settingsKey, JSON.stringify(settings));
        announce(formatLanguageText("reset", settings.language));
      } catch (error) {
        announce(formatLanguageText("reset", settings.language));
        console.error("Could not reset accessibility settings.", error);
      }
      stopReading();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeAccessibility, { once: true });
  } else {
    initializeAccessibility();
  }
})();
