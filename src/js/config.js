const SquawkConfig = (() => {
  let _config = null;

  const DEFAULTS = {
    branding: {
      title: "Squawk",
      logo: "",
      greeting: "Hello, %name%",
      name: "User"
    },
    theme: {
      default: "dark",
      colors: {
        dark: { accent: "#7a4cf2" },
        light: { accent: "#6fd4bb" }
      }
    },
    search: {
      placeholder: "Search links...",
      hotkey: "/"
    },
    tabs: [],
    widgets: []
  };

  function deepMerge(target, source) {
    const result = { ...target };
    for (const key of Object.keys(source)) {
      if (
        source[key] &&
        typeof source[key] === "object" &&
        !Array.isArray(source[key]) &&
        target[key] &&
        typeof target[key] === "object" &&
        !Array.isArray(target[key])
      ) {
        result[key] = deepMerge(target[key], source[key]);
      } else {
        result[key] = source[key];
      }
    }
    return result;
  }

  async function load(path) {
    const res = await fetch(path);
    if (!res.ok) throw new Error(`Failed to load config: ${res.status}`);
    const text = await res.text();
    const parsed = jsyaml.load(text);
    _config = deepMerge(DEFAULTS, parsed || {});
    return _config;
  }

  function get() {
    return _config;
  }

  return Object.freeze({ load, get });
})();
