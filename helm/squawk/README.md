# Squawk

A self-hosted, YAML-configured startpage dashboard. Zero backend — static HTML/CSS/JS served by nginx. All configuration lives in Helm `values.yaml` and is rendered into a ConfigMap.

## Features

- **Tab-based navigation** with grouped links and subgroups
- **Collapsible groups** with state persisted in localStorage
- **Cross-tab search** with keyboard shortcuts
- **Dark/light/auto theme** with accent-color-driven palette auto-derivation
- **Widgets** — clock, greeting, weather with animated windsock
- **Smart favicons** — automatic service icon detection (Grafana, ArgoCD, Jira, etc.) with fallback chain
- **Tiny footprint** — ~5 MB Docker image, minimal resource usage

## Installation

```bash
helm repo add vojtechpastyrik https://vojtechpastyrik.github.io/charts
helm repo update
helm install squawk vojtechpastyrik/squawk
```

## Configuration

All configuration is done via `values.yaml`. Below are the available parameters.

### General

| Parameter | Description | Default |
|-----------|-------------|---------|
| `replicaCount` | Number of replicas | `1` |
| `image.repository` | Image repository | `ghcr.io/vojtechpastyrik/squawk` |
| `image.tag` | Image tag (defaults to appVersion) | `""` |
| `image.pullPolicy` | Image pull policy | `IfNotPresent` |
| `service.type` | Service type | `ClusterIP` |
| `service.port` | Service port | `80` |

### Ingress

| Parameter | Description | Default |
|-----------|-------------|---------|
| `ingress.enabled` | Enable ingress | `false` |
| `ingress.className` | Ingress class name | `""` |
| `ingress.annotations` | Ingress annotations | `{}` |
| `ingress.hosts` | Ingress hosts configuration | `[{host: squawk.local, paths: [{path: /, pathType: Prefix}]}]` |
| `ingress.tls` | Ingress TLS configuration | `[]` |

### HTTPRoute (Gateway API)

| Parameter | Description | Default |
|-----------|-------------|---------|
| `httpRoute.enabled` | Enable HTTPRoute | `false` |
| `httpRoute.parentRefs` | Gateway references | `[]` |
| `httpRoute.hostnames` | Route hostnames | `[]` |

### Resources

| Parameter | Description | Default |
|-----------|-------------|---------|
| `resources.limits.cpu` | CPU limit | `50m` |
| `resources.limits.memory` | Memory limit | `16Mi` |
| `resources.requests.cpu` | CPU request | `10m` |
| `resources.requests.memory` | Memory request | `8Mi` |

### Squawk Application

| Parameter | Description | Default |
|-----------|-------------|---------|
| `squawk.branding.title` | Page title | `"Squawk"` |
| `squawk.branding.logo` | Logo URL | `""` |
| `squawk.branding.greeting` | Greeting template (`%name%`, `%time%`) | `"Hello, %name%"` |
| `squawk.branding.name` | User name for greeting | `"User"` |
| `squawk.theme.default` | Default theme (`dark`, `light`, `auto`) | `"dark"` |
| `squawk.theme.colors.dark.accent` | Dark theme accent color | `"#7a4cf2"` |
| `squawk.theme.colors.light.accent` | Light theme accent color | `"#6fd4bb"` |
| `squawk.search.placeholder` | Search placeholder text | `"Search links..."` |
| `squawk.search.hotkey` | Search hotkey | `"/"` |
| `squawk.tabs` | Tab definitions with groups and links | See `values.yaml` |
| `squawk.widgets` | Widget definitions (clock, greeting, weather) | See `values.yaml` |

### Example

```yaml
squawk:
  branding:
    title: "My Dashboard"
    name: "Vojta"

  theme:
    default: "dark"
    colors:
      dark:
        accent: "#7a4cf2"

  tabs:
    - name: "Home"
      icon: "🏠"
      groups:
        - name: "Monitoring"
          links:
            - name: "Grafana"
              url: "https://grafana.example.com"
            - name: "ArgoCD"
              url: "https://argocd.example.com"
        - name: "Communication"
          links:
            - name: "Slack"
              url: "https://myorg.slack.com"

  widgets:
    - type: "clock"
      position: "top-right"
      format: "24h"
      show_date: true
    - type: "greeting"
      position: "top-center"
    - type: "weather"
      position: "top-left"
      latitude: 50.0755
      longitude: 14.4378
      qnh_station: "LKPR"
```
