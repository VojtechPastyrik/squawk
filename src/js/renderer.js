const SquawkRenderer = (() => {
  const FAVICON_BASE = "https://www.google.com/s2/favicons?domain=";
  const FAVICON_SIZE = 32;
  let _activeTab = 0;
  let _tabs = [];

  // Known service icons via dashboard-icons CDN
  const CDN = "https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/";
  const SERVICE_ICONS = [
    { match: ["argocd", "argo-cd", "argo cd"], favicon: CDN + "argo-cd.png" },
    { match: ["jira"], favicon: CDN + "jira.png" },
    { match: ["confluence", "conflu"], favicon: CDN + "confluence.png" },
    { match: ["rabbitmq", "rabbit"], favicon: CDN + "rabbitmq.png" },
    { match: ["wso2"], favicon: "https://www.google.com/s2/favicons?domain=wso2.com&sz=32" },
    { match: ["grafana"], favicon: CDN + "grafana.png" },
    { match: ["harbor"], favicon: CDN + "harbor.png" },
    { match: ["gitlab"], favicon: CDN + "gitlab.png" },
    { match: ["github"], favicon: CDN + "github.png" },
    { match: ["azure devops", "dev.azure"], favicon: CDN + "azure-devops.png" },
    { match: ["azure", "portal.azure"], favicon: "https://portal.azure.com/favicon.ico" },
    { match: ["kubernetes", "k8s"], favicon: CDN + "kubernetes-dashboard.png" },
    { match: ["openshift", "okd"], favicon: CDN + "openshift.png" },
    { match: ["sharepoint"], favicon: CDN + "microsoft-sharepoint.png" },
    { match: ["youtrack"], favicon: CDN + "jetbrains-youtrack.png" },
    { match: ["slack"], favicon: CDN + "slack.png" },
    { match: ["datadog"], favicon: CDN + "datadog.png" },
    { match: ["pagerduty"], favicon: CDN + "pagerduty.png" },
    { match: ["terraform"], favicon: CDN + "terraform.png" },
    { match: ["docker"], favicon: CDN + "docker.png" },
    { match: ["hawtio"], favicon: "https://www.google.com/s2/favicons?domain=hawt.io&sz=32" },
  ];

  function getServiceIcon(name, url) {
    const haystack = (name + " " + url).toLowerCase();
    for (const svc of SERVICE_ICONS) {
      if (svc.match.some(keyword => haystack.includes(keyword))) {
        return svc.favicon;
      }
    }
    return null;
  }

  function getFaviconUrl(url) {
    try {
      const domain = new URL(url).hostname;
      return `${FAVICON_BASE}${domain}&sz=${FAVICON_SIZE}`;
    } catch {
      return "";
    }
  }

  function createFavicon(name, url, icon) {
    const img = document.createElement("img");
    img.className = "link-icon";
    img.loading = "lazy";
    img.width = 20;
    img.height = 20;

    // Priority: 1) explicit icon from config, 2) service match, 3) Google favicon, 4) fallback
    const resolved = icon || getServiceIcon(name, url);
    if (resolved) {
      img.src = resolved;
      img.onerror = () => {
        const googleSrc = getFaviconUrl(url);
        if (googleSrc) {
          img.src = googleSrc;
          img.onerror = () => { img.src = "assets/logo-fallback.svg"; };
        } else {
          img.src = "assets/logo-fallback.svg";
        }
      };
    } else {
      const src = getFaviconUrl(url);
      if (src) {
        img.src = src;
        img.onerror = () => { img.src = "assets/logo-fallback.svg"; };
      } else {
        img.src = "assets/logo-fallback.svg";
      }
    }
    return img;
  }

  function createLink(link) {
    const a = document.createElement("a");
    a.className = "link-item";
    a.href = link.url;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.appendChild(createFavicon(link.name, link.url, link.icon));
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

  function getIconUrl(name, url) {
    return getServiceIcon(name, url) || getFaviconUrl(url) || "assets/logo-fallback.svg";
  }

  return Object.freeze({ render, getIconUrl });
})();
