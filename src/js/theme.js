const SquawkTheme = (() => {
  const STORAGE_KEY = "squawk-theme";

  function hexToHSL(hex) {
    hex = hex.replace("#", "");
    const r = parseInt(hex.substring(0, 2), 16) / 255;
    const g = parseInt(hex.substring(2, 4), 16) / 255;
    const b = parseInt(hex.substring(4, 6), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s;
    const l = (max + min) / 2;

    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }
    return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
  }

  function derivePalette(accent, mode) {
    const { h } = hexToHSL(accent);
    if (mode === "dark") {
      return {
        "bg-primary": `hsl(${h}, 5%, 4%)`,
        "bg-secondary": `hsl(${h}, 5%, 8%)`,
        "bg-card": `hsl(${h}, 5%, 10%)`,
        "text-primary": `hsl(${h}, 5%, 88%)`,
        "text-secondary": `hsl(${h}, 3%, 53%)`,
        "border": `hsl(${h}, 5%, 17%)`,
        "search-bg": `hsl(${h}, 5%, 8%)`
      };
    }
    return {
      "bg-primary": `hsl(${h}, 10%, 96%)`,
      "bg-secondary": `hsl(${h}, 10%, 93%)`,
      "bg-card": `hsl(${h}, 10%, 100%)`,
      "text-primary": `hsl(${h}, 10%, 10%)`,
      "text-secondary": `hsl(${h}, 5%, 40%)`,
      "border": `hsl(${h}, 10%, 87%)`,
      "search-bg": `hsl(${h}, 10%, 100%)`
    };
  }

  function applyTheme(mode, config) {
    const root = document.documentElement;
    root.setAttribute("data-theme", mode);

    const colors = config.theme.colors || {};
    const modeColors = colors[mode] || {};
    const accent = modeColors.accent || (mode === "dark" ? "#7a4cf2" : "#6fd4bb");

    const derived = derivePalette(accent, mode);
    root.style.setProperty("--accent", accent);
    for (const [key, value] of Object.entries(derived)) {
      root.style.setProperty(`--${key}`, value);
    }

    for (const [key, value] of Object.entries(modeColors)) {
      if (key !== "accent") {
        root.style.setProperty(`--${key}`, value);
      }
    }
  }

  function resolveMode(preference) {
    if (preference === "auto") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    return preference;
  }

  function init(config) {
    const stored = localStorage.getItem(STORAGE_KEY);
    const preference = stored || config.theme.default || "dark";
    applyTheme(resolveMode(preference), config);

    // Listen for system theme changes when in auto mode
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
      const current = localStorage.getItem(STORAGE_KEY) || config.theme.default || "dark";
      if (current === "auto") {
        applyTheme(resolveMode("auto"), config);
      }
    });

    document.getElementById("theme-toggle").addEventListener("click", () => {
      const current = localStorage.getItem(STORAGE_KEY) || config.theme.default || "dark";
      let next;
      if (current === "auto") {
        // auto → dark → light → auto
        next = "dark";
      } else if (current === "dark") {
        next = "light";
      } else {
        next = "auto";
      }
      localStorage.setItem(STORAGE_KEY, next);
      applyTheme(resolveMode(next), config);
    });
  }

  return Object.freeze({ init });
})();
