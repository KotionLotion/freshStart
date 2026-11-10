// Small, focused interactions for the Fresh Start Inc. homepage.
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

  async function loadComponent(mount) {
    const componentUrl = new URL(mount.dataset.componentUrl, document.baseURI);
    const response = await fetch(componentUrl);
    if (!response.ok) throw new Error(`Could not load ${componentUrl.href}`);

    const template = new DOMParser().parseFromString(await response.text(), "text/html");
    const stylesheets = [...template.querySelectorAll('link[rel="stylesheet"]')];
    const scripts = [...template.querySelectorAll("script[src]")];

    await Promise.all(stylesheets.map((link) => loadStylesheet(new URL(link.getAttribute("href"), componentUrl))));
    mount.innerHTML = template.body.innerHTML;
    mount.dataset.componentLoaded = "true";

    for (const script of scripts) {
      await loadScript(new URL(script.getAttribute("src"), componentUrl));
    }
  }

  function alignRadar() {
    if (!radarPattern || !circle || !list) return;

    const target = circle.getBoundingClientRect().width > 0 ? circle : list;
    const bounds = target.getBoundingClientRect();
    radarPattern.style.setProperty("--radar-x", `${bounds.left + bounds.width / 2}px`);
    radarPattern.style.setProperty("--radar-y", `${bounds.top + bounds.height / 2}px`);
  }

  Promise.all([...document.querySelectorAll("[data-component-url]")].map(loadComponent))
    .then(() => {
      radarPattern = radarHost?.querySelector(".radar-pattern");
      alignRadar();
    })
    .catch((error) => console.error(error));

  window.addEventListener("resize", alignRadar);
  window.addEventListener("scroll", alignRadar, { passive: true });

  viewToggle?.addEventListener("click", () => {
    const showingList = list.classList.toggle("is-visible");
    circle.classList.toggle("is-hidden", showingList);
    viewToggle.setAttribute("aria-pressed", String(showingList));
    viewToggleLabel.textContent = showingList ? "Back to the circle" : "Browse as a list";
    viewToggleIcon.className = showingList ? "view-toggle-icon bi bi-grid-3x3-gap" : "view-toggle-icon bi bi-list-ul";
    requestAnimationFrame(alignRadar);
    if (showingList) list.querySelector("a").focus();
  });
});
