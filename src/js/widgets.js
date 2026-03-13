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

  function createWindsockSvg(degrees, speed) {
    // Speed determines how extended the sock is (0-100% based on knots, max ~25kt)
    const extension = Math.min(speed / 25, 1);
    const ns = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(ns, "svg");
    svg.setAttribute("viewBox", "0 0 64 64");

    // Pole
    const pole = document.createElementNS(ns, "line");
    pole.setAttribute("x1", "32"); pole.setAttribute("y1", "58");
    pole.setAttribute("x2", "32"); pole.setAttribute("y2", "10");
    pole.setAttribute("stroke", "var(--text-secondary)");
    pole.setAttribute("stroke-width", "2");
    pole.setAttribute("stroke-linecap", "round");
    svg.appendChild(pole);

    // Windsock (rotated by wind direction; 0° = north = sock points south, i.e. wind FROM north)
    // The sock hangs from the top of the pole and points in wind direction
    const g = document.createElementNS(ns, "g");
    g.setAttribute("transform", `rotate(${degrees}, 32, 10)`);

    const sock = document.createElementNS(ns, "polygon");
    const tipY = 10 + extension * 28;
    const tipHalf = 2 + (1 - extension) * 3;
    sock.setAttribute("points", `27,10 37,10 ${32 + tipHalf},${tipY} ${32 - tipHalf},${tipY}`);
    sock.setAttribute("fill", "var(--accent)");
    sock.setAttribute("opacity", "0.85");
    g.appendChild(sock);

    // Stripes on the sock
    const stripeCount = 4;
    for (let i = 1; i <= stripeCount; i++) {
      const t = i / (stripeCount + 1);
      const y = 10 + t * extension * 28;
      const halfW = 5 - t * (5 - tipHalf);
      const stripe = document.createElementNS(ns, "line");
      stripe.setAttribute("x1", String(32 - halfW));
      stripe.setAttribute("y1", String(y));
      stripe.setAttribute("x2", String(32 + halfW));
      stripe.setAttribute("y2", String(y));
      stripe.setAttribute("stroke", i % 2 === 0 ? "var(--accent)" : "var(--bg-primary)");
      stripe.setAttribute("stroke-width", "1.5");
      g.appendChild(stripe);
    }

    svg.appendChild(g);
    return svg;
  }

  async function fetchOpenMeteo(lat, lon) {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=wind_speed_10m,wind_direction_10m,temperature_2m,relative_humidity_2m`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const c = (await res.json()).current;
    const temp = c.temperature_2m;
    const rh = c.relative_humidity_2m;
    // Dewpoint approximation (Magnus formula simplified)
    const dewpoint = temp - ((100 - rh) / 5);
    // Cloud base estimate: (T - Td) / 2.5 * 1000 ft
    const cloudBaseFt = Math.round(((temp - dewpoint) / 2.5) * 1000);
    return {
      windDir: c.wind_direction_10m,
      windSpeed: c.wind_speed_10m, // km/h
      temp: Math.round(temp),
      cloudBaseFt: cloudBaseFt
    };
  }

  async function fetchQnh(station) {
    const url = `/api/metar?ids=${encodeURIComponent(station)}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    if (data && data.length > 0 && data[0].altim) {
      return Math.round(data[0].altim);
    }
    return null;
  }

  function createInfoRow(parent, label, initialValue) {
    const row = document.createElement("div");
    row.className = "widget-weather-row";
    const valEl = document.createElement("span");
    valEl.className = "widget-weather-value";
    valEl.textContent = initialValue;
    const lblEl = document.createElement("span");
    lblEl.className = "widget-weather-label";
    lblEl.textContent = label;
    row.appendChild(valEl);
    row.appendChild(lblEl);
    parent.appendChild(row);
    return valEl;
  }

  function renderWeather(widget) {
    const container = document.createElement("div");
    container.className = "widget-weather";

    const lat = widget.latitude;
    const lon = widget.longitude;
    const refreshMs = (widget.refresh_minutes || 10) * 60000;

    // Windsock element
    let windsockEl = null;
    let windInfoEl = null;
    if (widget.show_windsock !== false) {
      const wsWrap = document.createElement("div");
      wsWrap.className = "widget-windsock";
      windsockEl = wsWrap;
      container.appendChild(wsWrap);

      windInfoEl = document.createElement("div");
      windInfoEl.className = "widget-wind-info";
      container.appendChild(windInfoEl);
    }

    // Info block (QNH, temp, cloud base)
    const infoWrap = document.createElement("div");
    infoWrap.className = "widget-weather-info";

    let qnhValueEl = null;
    if (widget.show_qnh !== false && widget.qnh_station) {
      qnhValueEl = createInfoRow(infoWrap, "QNH", "---");
    }

    let tempValueEl = null;
    if (widget.show_temp !== false) {
      tempValueEl = createInfoRow(infoWrap, "OAT", "---");
    }

    let cloudBaseValueEl = null;
    if (widget.show_cloud_base !== false) {
      cloudBaseValueEl = createInfoRow(infoWrap, "CLD BASE", "---");
    }

    container.appendChild(infoWrap);

    async function update() {
      if (lat != null && lon != null) {
        const wx = await fetchOpenMeteo(lat, lon);
        if (wx) {
          if (windsockEl) {
            windsockEl.innerHTML = "";
            const speedKt = wx.windSpeed * 0.539957;
            windsockEl.appendChild(createWindsockSvg(wx.windDir, speedKt));
            windInfoEl.textContent = `${Math.round(wx.windDir)}° / ${Math.round(wx.windSpeed)} km/h`;
          }
          if (tempValueEl) tempValueEl.textContent = wx.temp + " °C";
          if (cloudBaseValueEl) cloudBaseValueEl.textContent = wx.cloudBaseFt + " ft";
        }
      }
      if (qnhValueEl && widget.qnh_station) {
        const qnh = await fetchQnh(widget.qnh_station);
        if (qnh) qnhValueEl.textContent = qnh + " hPa";
      }
    }

    update();
    setInterval(update, refreshMs);
    return container;
  }

  const registry = {
    clock: renderClock,
    greeting: renderGreeting,
    weather: renderWeather
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
