const SquawkWidgets = (() => {
  function getTimeOfDay() {
    const h = new Date().getHours();
    if (h < 12) return "morning";
    if (h < 17) return "afternoon";
    return "evening";
  }

  function renderClock(widget) {
    const container = document.createElement("div");
    container.className = "widget-clock";

    const timeEl = document.createElement("div");
    timeEl.className = "widget-clock-time";
    container.appendChild(timeEl);

    const dateEl = document.createElement("div");
    dateEl.className = "widget-clock-date";
    if (!widget.show_date) dateEl.style.display = "none";
    container.appendChild(dateEl);

    function update() {
      const now = new Date();
      const opts = widget.format === "12h"
        ? { hour: "numeric", minute: "2-digit", hour12: true }
        : { hour: "2-digit", minute: "2-digit", hour12: false };
      timeEl.textContent = now.toLocaleTimeString(undefined, opts);
      dateEl.textContent = now.toLocaleDateString(undefined, {
        weekday: "long", year: "numeric", month: "long", day: "numeric"
      });
    }

    update();
    setInterval(update, 1000);
    return container;
  }

  function renderGreeting(widget, config) {
    const div = document.createElement("div");
    div.className = "widget-greeting";
    const template = config.branding.greeting || "Hello, %name%";
    const text = template
      .replace(/%name%/g, config.branding.name || "User")
      .replace(/%time%/g, getTimeOfDay());
    div.textContent = text;
    return div;
  }

  const registry = {
    clock: renderClock,
    greeting: renderGreeting
  };

  const AREA_MAP = {
    "top-right": "widget-area-top-right",
    "top-center": "widget-area-top-center",
    "bottom": "widget-area-bottom"
  };

  function init(config) {
    for (const widget of config.widgets || []) {
      const fn = registry[widget.type];
      if (!fn) continue;
      const el = fn(widget, config);
      if (!el) continue;
      const areaId = AREA_MAP[widget.position] || "widget-area-bottom";
      const area = document.getElementById(areaId);
      if (area) area.appendChild(el);
    }
  }

  return Object.freeze({ init });
})();
