(() => {
  async function boot() {
    try {
      const config = await SquawkConfig.load("/config/config.yaml");
      SquawkTheme.init(config);
      SquawkRenderer.render(config);
      SquawkWidgets.init(config);
      SquawkSearch.init(config);
    } catch (err) {
      console.error("Squawk failed to boot:", err);
      document.getElementById("content").textContent = "Failed to load configuration.";
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
