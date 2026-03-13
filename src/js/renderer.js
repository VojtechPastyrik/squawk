const SquawkRenderer = (() => {
  const FAVICON_BASE = "https://www.google.com/s2/favicons?domain=";
  const FAVICON_SIZE = 32;
  let _activeTab = 0;
  let _tabs = [];

  function getFaviconUrl(url) {
    try {
      const domain = new URL(url).hostname;
      return `${FAVICON_BASE}${domain}&sz=${FAVICON_SIZE}`;
    } catch {
      return "";
    }
  }

  function createFavicon(url) {
    const img = document.createElement("img");
    img.className = "link-icon";
    img.loading = "lazy";
    img.width = 20;
    img.height = 20;
    const src = getFaviconUrl(url);
    if (src) {
      img.src = src;
      img.onerror = () => { img.src = "assets/logo-fallback.svg"; };
    } else {
      img.src = "assets/logo-fallback.svg";
    }
    return img;
  }

  function createLink(link) {
    const a = document.createElement("a");
    a.className = "link-item";
    a.href = link.url;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.appendChild(createFavicon(link.url));
    const span = document.createElement("span");
    span.className = "link-name";
    span.textContent = link.name;
    a.appendChild(span);
    return a;
  }

  function createLinksGrid(links) {
    const grid = document.createElement("div");
    grid.className = "links-grid";
    for (const link of links || []) {
      grid.appendChild(createLink(link));
    }
    return grid;
  }

  function createSubgroup(subgroup) {
    const div = document.createElement("div");
    div.className = "subgroup";
    const title = document.createElement("div");
    title.className = "subgroup-title";
    title.textContent = subgroup.name;
    div.appendChild(title);
    div.appendChild(createLinksGrid(subgroup.links));
    return div;
  }

  function createGroup(group) {
    const section = document.createElement("div");
    section.className = "group";
    const title = document.createElement("div");
    title.className = "group-title";
    title.textContent = group.name;
    section.appendChild(title);

    if (group.subgroups) {
      for (const sub of group.subgroups) {
        section.appendChild(createSubgroup(sub));
      }
    }

    if (group.links) {
      section.appendChild(createLinksGrid(group.links));
    }
    return section;
  }

  function renderTab(index) {
    _activeTab = index;
    const content = document.getElementById("content");
    content.innerHTML = "";

    const tab = _tabs[index];
    if (!tab || !tab.groups) return;

    for (const group of tab.groups) {
      content.appendChild(createGroup(group));
    }

    document.querySelectorAll(".tab-btn").forEach((btn, i) => {
      btn.classList.toggle("active", i === index);
    });
  }

  function renderTabs(tabs) {
    const nav = document.getElementById("tabs-nav");
    nav.innerHTML = "";

    tabs.forEach((tab, i) => {
      const btn = document.createElement("button");
      btn.className = "tab-btn";
      btn.textContent = (tab.icon ? tab.icon + " " : "") + tab.name;
      btn.addEventListener("click", () => renderTab(i));
      nav.appendChild(btn);
    });
  }

  function render(config) {
    document.getElementById("site-title").textContent = config.branding.title || "Squawk";
    document.title = config.branding.title || "Squawk";

    if (config.branding.logo) {
      document.getElementById("logo").src = config.branding.logo;
    }

    if (config.branding.logoSize) {
      document.documentElement.style.setProperty("--logo-size", config.branding.logoSize + "px");
    }

    if (config.branding.favicon) {
      const link = document.getElementById("favicon");
      link.href = config.branding.favicon;
      link.type = config.branding.favicon.endsWith(".ico") ? "image/x-icon" : "image/png";
    }

    _tabs = config.tabs || [];
    if (_tabs.length === 0) return;

    renderTabs(_tabs);
    renderTab(0);
  }

  return Object.freeze({ render });
})();
