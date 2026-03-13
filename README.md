# Squawk

A self-hosted, YAML-configured startpage dashboard. Zero backend — static HTML/CSS/JS served by nginx. All configuration lives in the Helm `values.yaml` and is rendered into a ConfigMap mounted as `config.yaml` in the container.

## Features

- **Tab-based navigation** with grouped links and subgroups
- **Cross-tab search** with keyboard shortcuts
- **Dark/light theme** with accent-color-driven palette auto-derivation
- **Widgets** — clock, greeting, and more
- **Helm-native configuration** — no standalone config files
- **Tiny footprint** — ~5 MB Docker image, minimal resource usage

## Quick Start

### Local Development

Place a `config.yaml` in `src/` and serve:

```bash
cd src && python3 -m http.server 8080
```

### Docker

```bash
docker build -f docker/Dockerfile -t squawk .
docker run -p 8080:80 -v ./config.yaml:/config/config.yaml:ro squawk
```

### Helm

```bash
helm install squawk ./helm/squawk
```

All configuration is done via `values.yaml` under the `squawk` key.

## Configuration

See [`helm/squawk/values.yaml`](helm/squawk/values.yaml) for the full configuration schema including branding, theming, tabs, groups, links, and widgets.

## License

MIT
