function getFreshStartLanguage() {
  return "en";
}

function getHomeTranslation(key) {
  return key;
}

function applyGlobalTranslations() {
  return;
}

function applyHomeTranslations() {
  return;
}

document.addEventListener("fresh-start-language-change", () => {});

document.addEventListener("DOMContentLoaded", () => {
  const viewToggle = document.querySelector("#view-toggle");
  const viewToggleLabel = viewToggle?.querySelector(".view-toggle-label");
  const viewToggleIcon = viewToggle?.querySelector(".view-toggle-icon");
  const circle = document.querySelector("#circle-navigation");
  const list = document.querySelector("#list-navigation");
  const radarHost = document.querySelector("#radar-background");
  const loadedStylesheets = new Map();
  const loadedScripts = new Map();
  let radarPattern;

  function loadStylesheet(url) {
    const stylesheetUrl = url.href;
    if (loadedStylesheets.has(stylesheetUrl)) return loadedStylesheets.get(stylesheetUrl);

    const existingLink = [...document.querySelectorAll('link[rel="stylesheet"]')]
      .find((link) => link.href === stylesheetUrl);
    if (existingLink) {
      const loaded = Promise.resolve();
      loadedStylesheets.set(stylesheetUrl, loaded);
      return loaded;
    }

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = stylesheetUrl;
    const loaded = new Promise((resolve, reject) => {
      link.addEventListener("load", resolve, { once: true });
      link.addEventListener("error", () => reject(new Error(`Could not load ${stylesheetUrl}`)), { once: true });
    });
    loadedStylesheets.set(stylesheetUrl, loaded);
    document.head.append(link);
    return loaded;
  }

  function loadScript(url) {
    const scriptUrl = url.href;
    if (loadedScripts.has(scriptUrl)) return loadedScripts.get(scriptUrl);

    const script = document.createElement("script");
    script.src = scriptUrl;
    const loaded = new Promise((resolve, reject) => {
      script.addEventListener("load", resolve, { once: true });
      script.addEventListener("error", () => reject(new Error(`Could not load ${scriptUrl}`)), { once: true });
    });
    loadedScripts.set(scriptUrl, loaded);
    document.body.append(script);
    return loaded;
  }

  const componentTemplates = {
    "/components/navbar/navbar.html": {
      html: `
        <header class="site-navbar" data-navbar-root data-nav-open="false">
          <div class="site-navbar__inner">
            <a class="site-navbar__brand" href="/index.html" aria-label="Fresh Start Inc. home">Fresh Start Inc.</a>
            <button class="site-navbar__toggle" type="button" aria-label="Open navigation menu" aria-expanded="false" aria-controls="primary-navigation">
              <span class="site-navbar__menu-icon" aria-hidden="true"><span></span><span></span><span></span></span>
            </button>
            <nav class="site-navbar__links" id="primary-navigation" aria-label="Primary navigation">
              <a href="/index.html" aria-label="Home" title="Home"><i class="bi bi-house-door-fill" aria-hidden="true"></i></a>
              <a href="/pages/resumeBuilder/resumeBuilder.html" aria-label="Build resume" title="Build resume"><i class="bi bi-person-vcard-fill" aria-hidden="true"></i></a>
              <a href="/pages/findJob/findJob.html" aria-label="Find jobs" title="Find jobs"><i class="bi bi-briefcase-fill" aria-hidden="true"></i></a>
              <a href="/pages/applyJob/applyJob.html" aria-label="Apply for a job" title="Apply for a job"><i class="bi bi-send-fill" aria-hidden="true"></i></a>
              <a href="/pages/mySubmissions/mySubmissions.html" aria-label="My submissions" title="My submissions"><i class="bi bi-clipboard-check-fill" aria-hidden="true"></i></a>
              <button class="site-navbar__logout" type="button" aria-label="Logout (not connected yet)" title="Logout (not connected yet)" disabled><i class="bi bi-box-arrow-right" aria-hidden="true"></i><span>Logout</span></button>
            </nav>
          </div>
        </header>
      `,
      stylesheets: ["navbar.css"],
      scripts: ["navbar.js"]
    },
    "/components/accessibility/accessibility.html": {
      html: `
        <div class="accessibility-root">
          <button class="accessibility-launcher" type="button" aria-label="Open accessibility settings" aria-expanded="false" aria-controls="accessibility-panel">
            <i class="bi bi-universal-access-circle" aria-hidden="true"></i>
          </button>
          <button class="accessibility-backdrop" type="button" aria-label="Close accessibility settings" hidden></button>
          <aside class="accessibility-panel" id="accessibility-panel" role="dialog" aria-modal="true" aria-labelledby="accessibility-title" aria-hidden="true">
            <div class="accessibility-panel__header">
              <h2 id="accessibility-title" data-i18n="accessibility">Accessibility</h2>
              <button class="accessibility-panel__close" type="button" aria-label="Close accessibility settings"><i class="bi bi-x-lg" aria-hidden="true"></i></button>
            </div>
            <p class="accessibility-panel__intro" data-i18n="savedIntro">Display settings are saved and applied across every page.</p>

            <label class="accessibility-field" for="accessibility-language">
              <span data-i18n="language">Language</span>
              <select id="accessibility-language" name="language">
                <option value="en">English</option>
              </select>
            </label>

            <label class="accessibility-field" for="accessibility-text-size">
              <span data-i18n="textSize">Text size</span>
              <select id="accessibility-text-size" name="text-size">
                <option value="1" data-i18n-option="default">Default</option>
                <option value="1.15" data-i18n-option="larger">Larger</option>
                <option value="1.3" data-i18n-option="largest">Largest</option>
              </select>
            </label>
            <label class="accessibility-option" for="accessibility-high-contrast">
              <span data-i18n="highContrast">High contrast</span>
              <input id="accessibility-high-contrast" type="checkbox" />
            </label>
            <label class="accessibility-option" for="accessibility-readable-font">
              <span data-i18n="readableFont">Readable font and spacing</span>
              <input id="accessibility-readable-font" type="checkbox" />
            </label>
            <label class="accessibility-option" for="accessibility-dyslexia-mode">
              <span data-i18n="dyslexiaMode">Dyslexia-friendly mode</span>
              <input id="accessibility-dyslexia-mode" type="checkbox" />
            </label>
            <label class="accessibility-option" for="accessibility-night-mode">
              <span data-i18n="nightMode">Night mode</span>
              <input id="accessibility-night-mode" type="checkbox" />
            </label>
            <label class="accessibility-option" for="accessibility-underline-links">
              <span data-i18n="underlineLinks">Underline links and buttons</span>
              <input id="accessibility-underline-links" type="checkbox" />
            </label>

            <button class="accessibility-tts" type="button" data-i18n="readPage">Read page aloud</button>
            <button class="accessibility-reset" type="button" data-i18n="resetSettings">Reset settings</button>
            <p class="accessibility-status" role="status" aria-live="polite"></p>
          </aside>
        </div>
        <div class="accessibility-toast" id="accessibility-toast" role="status" aria-live="polite" aria-atomic="true" hidden></div>
      `,
      stylesheets: ["accessibility.css"],
      scripts: ["accessibility.js"]
    },
    "/components/radar/radar.html": {
      html: `<div class="radar-pattern"></div>`,
      stylesheets: ["radar.css"],
      scripts: []
    }
  };

  function loadComponent(mount) {
    const componentUrl = new URL(mount.dataset.componentUrl, document.baseURI);
    const key = `/${componentUrl.pathname.replace(/\\/g, "/").replace(/^\//, "")}`;
    const template = componentTemplates[key];

    if (!template) {
      console.warn("No component template found for", key);
      return;
    }

    mount.innerHTML = template.html;
    mount.dataset.componentLoaded = "true";

    template.stylesheets.forEach((sheet) => {
      const url = new URL(sheet, componentUrl);
      if (![...document.querySelectorAll('link[rel="stylesheet"]')].some((link) => link.href === url.href)) {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = url.href;
        document.head.appendChild(link);
      }
    });

    template.scripts.forEach((scriptName) => {
      const url = new URL(scriptName, componentUrl);
      if (![...document.querySelectorAll("script[src]")].some((script) => script.src === url.href)) {
        const script = document.createElement("script");
        script.src = url.href;
        script.defer = true;
        document.body.appendChild(script);
      }
    });
  }

  function alignRadar() {
    if (!radarPattern || !circle || !list) return;

    const target = circle.getBoundingClientRect().width > 0 ? circle : list;
    const bounds = target.getBoundingClientRect();
    radarPattern.style.setProperty("--radar-x", `${bounds.left + bounds.width / 2}px`);
    radarPattern.style.setProperty("--radar-y", `${bounds.top + bounds.height / 2}px`);
  }

  [...document.querySelectorAll("[data-component-url]")].forEach(loadComponent);
  radarPattern = radarHost?.querySelector(".radar-pattern");
  alignRadar();

  window.addEventListener("resize", alignRadar);
  window.addEventListener("scroll", alignRadar, { passive: true });

  viewToggle?.addEventListener("click", () => {
    const showingList = list.classList.toggle("is-visible");
    circle.classList.toggle("is-hidden", showingList);
    viewToggle.setAttribute("aria-pressed", String(showingList));
    viewToggleLabel.textContent = showingList ? getHomeTranslation("viewToggleBack") : getHomeTranslation("viewToggleList");
    viewToggleIcon.className = showingList ? "view-toggle-icon bi bi-grid-3x3-gap" : "view-toggle-icon bi bi-list-ul";
    requestAnimationFrame(alignRadar);
    if (showingList) list.querySelector("a").focus();
  });

  applyGlobalTranslations();
  applyHomeTranslations();
});
