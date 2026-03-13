const SquawkRenderer = (() => {
  const FAVICON_BASE = "https://www.google.com/s2/favicons?domain=";
  const FAVICON_SIZE = 32;
  let _activeTab = 0;
  let _tabs = [];

  // Known service icons — matched against link name and URL (lowercase)
  const SERVICE_ICONS = [
    { match: ["argocd", "argo-cd"], favicon: "https://argo-cd.readthedocs.io/en/stable/assets/favicon/favicon-32x32.png" },
    { match: ["jira"], favicon: "https://jira.atlassian.com/s/d41d8cd98f00b204e9800998ecf8427e-CDN/lu2cib/820016/12ta74/1.0/_/favicon-update.ico" },
    { match: ["confluence", "conflu"], favicon: "https://confluence.atlassian.com/s/d41d8cd98f00b204e9800998ecf8427e-CDN/li2p18/9012/12ta74/1.0/_/favicon-update.ico" },
    { match: ["rabbitmq", "rabbit"], favicon: "https://www.rabbitmq.com/favicon.ico" },
    { match: ["wso2"], favicon: "https://wso2.com/favicon.ico" },
    { match: ["grafana"], favicon: "https://grafana.com/static/assets/img/fav32.png" },
    { match: ["harbor"], favicon: "https://goharbor.io/favicon.ico" },
    { match: ["gitlab"], favicon: "https://gitlab.com/assets/favicon-72a2cad5025aa931d6ea56c3201d1f18e68a8571fc4fa9571b7571f9814f5e.ico" },
    { match: ["github"], favicon: "https://github.com/favicon.ico" },
    { match: ["azure", "portal.azure"], favicon: "https://portal.azure.com/favicon.ico" },
    { match: ["kubernetes", "k8s"], favicon: "https://kubernetes.io/images/favicon.png" },
    { match: ["openshift", "okd"], favicon: "https://www.redhat.com/favicon.ico" },
    { match: ["sharepoint"], favicon: "https://www.microsoft.com/favicon.ico" },
    { match: ["youtrack"], favicon: "https://www.jetbrains.com/favicon.ico" },
    { match: ["slack"], favicon: "https://slack.com/favicon.ico" },
    { match: ["datadog"], favicon: "https://www.datadoghq.com/favicon.ico" },
    { match: ["pagerduty"], favicon: "https://www.pagerduty.com/favicon.ico" },
    { match: ["terraform"], favicon: "https://www.terraform.io/favicon.ico" },
    { match: ["docker"], favicon: "https://www.docker.com/favicon.ico" },
    { match: ["devops", "dev.azure"], favicon: "https://cdn.vsassets.io/content/icons/favicon.ico" },
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

  function createFavicon(name, url) {
    const img = document.createElement("img");
    img.className = "link-icon";
    img.loading = "lazy";
    img.width = 20;
    img.height = 20;

    const serviceIcon = getServiceIcon(name, url);
    if (serviceIcon) {
      img.src = serviceIcon;
      img.onerror = () => {
        // Fall back to Google favicon API
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
    a.appendChild(createFavicon(link.name, link.url));
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
