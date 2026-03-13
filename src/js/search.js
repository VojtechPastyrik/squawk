const SquawkSearch = (() => {
  let _index = [];
  let _activeResult = -1;

  function buildIndex(config) {
    _index = [];
    for (const tab of config.tabs || []) {
      for (const group of tab.groups || []) {
        for (const link of group.links || []) {
          _index.push({ name: link.name, url: link.url, tab: tab.name, group: group.name });
        }
        for (const sub of group.subgroups || []) {
          for (const link of sub.links || []) {
            _index.push({ name: link.name, url: link.url, tab: tab.name, group: group.name + " / " + sub.name });
          }
        }
      }
    }
  }

  function search(query) {
    const q = query.toLowerCase();
    return _index
      .filter(item => item.name.toLowerCase().includes(q) || item.url.toLowerCase().includes(q))
      .slice(0, 15);
  }

  function renderResults(results, container) {
    container.innerHTML = "";
    _activeResult = -1;

    if (results.length === 0) {
      container.classList.add("hidden");
      return;
    }
    container.classList.remove("hidden");

    results.forEach((item, i) => {
      const a = document.createElement("a");
      a.className = "search-result";
      a.href = item.url;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.dataset.index = i;

      // Reuse SquawkRenderer's favicon logic if available, otherwise basic fallback
      const img = document.createElement("img");
      img.className = "search-result-icon";
      img.width = 20;
      img.height = 20;
      if (typeof SquawkRenderer !== "undefined" && SquawkRenderer.getIconUrl) {
        img.src = SquawkRenderer.getIconUrl(item.name, item.url);
        img.onerror = () => { img.src = "assets/logo-fallback.svg"; };
      } else {
        try {
          const domain = new URL(item.url).hostname;
          img.src = `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
          img.onerror = () => { img.src = "assets/logo-fallback.svg"; };
        } catch {
          img.src = "assets/logo-fallback.svg";
        }
      }
      a.appendChild(img);

      const info = document.createElement("div");
      info.className = "search-result-info";
      const name = document.createElement("span");
      name.className = "search-result-name";
      name.textContent = item.name;
      const meta = document.createElement("span");
      meta.className = "search-result-meta";
      meta.textContent = `${item.tab} → ${item.group}`;
      info.appendChild(name);
      info.appendChild(meta);
      a.appendChild(info);

      container.appendChild(a);
    });
  }

  function updateActive(container) {
    const items = container.querySelectorAll(".search-result");
    items.forEach((el, i) => {
      el.classList.toggle("active", i === _activeResult);
    });
  }

  function init(config) {
    buildIndex(config);

    const input = document.getElementById("search-input");
    const results = document.getElementById("search-results");

    input.placeholder = config.search.placeholder || "Search links...";

    input.addEventListener("input", () => {
      const q = input.value.trim();
      if (!q) {
        results.classList.add("hidden");
        results.innerHTML = "";
        return;
      }
      renderResults(search(q), results);
    });

    input.addEventListener("keydown", (e) => {
      const items = results.querySelectorAll(".search-result");
      if (e.key === "ArrowDown") {
        e.preventDefault();
        _activeResult = Math.min(_activeResult + 1, items.length - 1);
        updateActive(results);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        _activeResult = Math.max(_activeResult - 1, 0);
        updateActive(results);
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (_activeResult >= 0 && items[_activeResult]) {
          items[_activeResult].click();
        } else if (items.length > 0) {
          items[0].click();
        }
      } else if (e.key === "Escape") {
        input.value = "";
        results.classList.add("hidden");
        results.innerHTML = "";
        input.blur();
      }
    });

    document.addEventListener("click", (e) => {
      if (!e.target.closest("#search-container")) {
        results.classList.add("hidden");
      }
    });

    const hotkey = config.search.hotkey || "/";
    document.addEventListener("keydown", (e) => {
      if (e.key === hotkey && document.activeElement !== input && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        input.focus();
      }
    });
  }

  return Object.freeze({ init });
})();
