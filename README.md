# BOM Interactive Proxy

Interactive BOM weather map proxy designed for browser embedding, Home Assistant dashboards, and kiosk-style displays.

This repository ships the proxy service (nginx + static map wrappers) and Home Assistant App/Add-on packaging.

## What It Does

- Proxies BOM web and API traffic through one local origin.
- Rewrites upstream host references so map assets load cleanly in embedded contexts.
- Serves map-first pages (`/` and `/map-only`) with optional controls via query params.
- Supports throttled animation and frame/timestamp overlays for dashboards.
- Caches map tiles in nginx and browser cache, with optional browser service-worker tile cache.
- Includes Home Assistant custom App/Add-on metadata.

## Endpoints

- `/` default map-only page
- `/map-only` full-screen map wrapper
- `/map` direct map page (advanced params)
- `/test-harness` smoke test page
- `/debug-harness` diagnostics page
- `/health` health check (`OK`)

## Install And Run

### 1. Home Assistant App/Add-on (Recommended)

1. Open **Settings -> Add-ons (Apps) -> Add-on Store**.
2. Open the top-right menu -> **Repositories**.
3. Add: `https://github.com/turkflix/bom-interactive-proxy`
4. Install **BOM Interactive Proxy**.
5. Start the app.

Default URLs:

- `http://HOME_ASSISTANT_HOST:8083/`
- `http://HOME_ASSISTANT_HOST:8083/health`
- `http://HOME_ASSISTANT_HOST:8083/test-harness`

### 2. Docker Run (Prebuilt Image)

```bash
docker run -d \
  --name bom-interactive-proxy \
  -p 8083:80 \
  -e TIMEZONE=Australia/Melbourne \
  -e NGINX_CACHE_PATH=/var/cache/bom \
  -e NGINX_CACHE_INACTIVE=24h \
  -e NGINX_CACHE_MAX_SIZE=2g \
  -v /your/host/cache/path:/var/cache/bom \
  --restart unless-stopped \
  ghcr.io/turkflix/bom-interactive-proxy:latest
```

### 3. Docker Compose (Prebuilt)

```yaml
services:
  bom-interactive-proxy:
    image: ghcr.io/turkflix/bom-interactive-proxy:latest
    container_name: bom-interactive-proxy
    ports:
      - "8083:80"
    environment:
      - TIMEZONE=Australia/Melbourne
      - NGINX_CACHE_PATH=/var/cache/bom
      - NGINX_CACHE_INACTIVE=24h
      - NGINX_CACHE_MAX_SIZE=2g
    volumes:
      - /your/host/cache/path:/var/cache/bom
    restart: unless-stopped
```

### 4. Build From Source

```bash
git clone https://github.com/turkflix/bom-interactive-proxy.git
cd bom-interactive-proxy
docker build -t bom-interactive-proxy:local .
docker rm -f bom-interactive-proxy 2>/dev/null || true
docker run -d --name bom-interactive-proxy -p 8083:80 -e TIMEZONE=Australia/Melbourne bom-interactive-proxy:local
```

## Cache Behavior And Cleanup

### Cache Layers

- nginx proxy cache for BOM map/tile traffic
- browser HTTP cache (`Cache-Control: public, max-age=60` on tiles)
- optional browser service-worker tile cache (`map-sw.js`)

### Cache Path Configuration

- Container cache root: `NGINX_CACHE_PATH` (default `/tmp/nginx_cache`)
- Compose helpers:
  - `CACHE_HOST_PATH` (default `./cache`)
  - `CACHE_CONTAINER_PATH` (default `/tmp/nginx_cache`)

Example:

```bash
CACHE_HOST_PATH=/mnt/fast-ssd/bom-cache CACHE_CONTAINER_PATH=/var/cache/bom docker compose up -d
```

### Manual Cache Purge

```bash
docker exec bom-interactive-proxy sh -lc 'rm -rf "${NGINX_CACHE_PATH:-/tmp/nginx_cache}/bom_tiles"/*'
docker restart bom-interactive-proxy
```

## Query Parameters

`/map-only` always launches `/map` with:

- `cleanup=1`
- `mapOnly=1`
- `rain=1`

`/map-only` forwards this allowlist:

`path`, `place`, `name`, `lat`, `lon`, `lng`, `latitude`, `longitude`, `coords`, `zoom`, `zoomStart`, `zoomstart`, `zoomFrom`, `zoomfrom`, `lowPower`, `lowpower`, `animate`, `autoplay`, `animateMode`, `animatemode`, `animateInterval`, `animatems`, `frameSkip`, `frameskip`, `tz`, `timezone`, `timeZone`, `showFrameTime`, `showTime`, `showTownNames`, `townNames`, `townnames`, `townLabels`, `townlabels`, `towns`, `interactive`, `interact`, `allowInteraction`, `allowinteraction`, `cb`.

`/map-only` does not forward internal flags like `cleanup`, `mapOnly`, `rain`, or `mode`.

### Location Resolution Order

1. `path`
2. `place` or `name`
3. `lat/lon` aliases or `coords`
4. built-in fallback location path

### Boolean Parsing Rules

- Strict parser (`mapOnly`, `rain`, `cleanup`): only exact `1` = true.
- Flexible parser (`animate`, `showFrameTime`, `showTownNames`, `lowPower`, `interactive`): false only for `0`, `false`, `off`, `no` (case-insensitive).

### Full Parameter Reference (`/map`)

| Parameter | Aliases | Type | Default on `/map` | Notes |
|---|---|---|---|---|
| `path` | none | string | none | Full BOM location path. If present, place/coord lookup is skipped. |
| `place` | `name` | string | none | Place-name lookup via BOM location APIs. |
| `lat` + `lon` | `latitude`, `longitude`, `lng` | numbers | none | Coordinate lookup when `path` and `place/name` are absent. |
| `coords` | none | `lat,lon` string | none | Alternative coordinate input, e.g. `-37.8136,144.9631`. |
| `zoom` | none | integer | none | Best-effort zoom target, clamped to `0..20`. |
| `zoomStart` | `zoomstart`, `zoomFrom`, `zoomfrom` | integer | none | Optional pre-target zoom stage, clamped to `0..20`. |
| `showFrameTime` | `showTime` | boolean | `0` unless `mapOnly=1` | Enables frame/time badge. |
| `showTownNames` | `townNames`, `townnames`, `townLabels`, `townlabels`, `towns` | boolean | `0` | Enables town/city labels. |
| `interactive` | `interact`, `allowInteraction`, `allowinteraction` | boolean | `0` | Enables map drag/pan input in map-only mode. |
| `animate` | `autoplay` | boolean | `1` unless `mapOnly=1` | Controls timeline autoplay behavior. |
| `animateMode` | `animatemode` | enum | `native` | `native` or throttle mode (`throttle`, `throttled`, `step`, `stepped`). |
| `animateInterval` | `animatems` | integer ms | `2000` | Throttle step interval, clamped `500..30000`. |
| `frameSkip` | `frameskip` | integer | `1` | Frames advanced per throttle step, clamped `1..6`. |
| `tz` | `timezone`, `timeZone` | IANA timezone string | `Australia/Melbourne` | Overlay timezone formatting. Invalid values fall back to default. |
| `lowPower` | `lowpower` | boolean | `0` | Disables animation and frame overlay for reduced CPU/network. |
| `mapOnly` | `mode=maponly` | boolean | `0` | Enables map-only cleanup behavior and map-only defaults. |
| `rain` | none | boolean | `0` | Forces rain tab workflow. |
| `cleanup` | none | boolean | `0` | Enables repeated page chrome cleanup loop. |
| `cb` | none | string | none | Cache-bust token for troubleshooting stale browser assets. |

### Effective Defaults on `/map-only`

- `mapOnly=1`
- `rain=1`
- `cleanup=1`
- `showFrameTime=1` (unless `lowPower=1`)
- `showTownNames=0`
- `animate=0` (unless explicitly enabled)
- `interactive=0`

## Place Reference Examples

All of the following are valid location-reference styles.

### By Place Name (`place`)

- `/map-only?place=melbourne`
- `/map-only?place=sydney&zoom=9`

### By Name Alias (`name`)

- `/map-only?name=brisbane&showFrameTime=1`

### By `coords=lat,lon`

- `/map-only?coords=-37.8136,144.9631&zoom=10`
- `/map-only?coords=-33.8688,151.2093&animate=1&animateMode=throttle`

### By `lat` + `lon`

- `/map-only?lat=-37.8136&lon=144.9631&zoom=10`

### By `latitude` + `longitude`

- `/map-only?latitude=-33.8688&longitude=151.2093&zoom=10`

### By `lat` + `lng`

- `/map-only?lat=-27.4698&lng=153.0251&zoom=10`

### By Full BOM Path (`path`)

- `/map-only?path=australia/victoria/central/bvic_pt042-melbourne&zoom=9`
- `/map-only?path=australia/new-south-wales/metropolitan/bnsw_pt131-sydney&zoom=9`

## Home Assistant Dashboard Card Guide

This service can be consumed by either a built-in `iframe` card or a custom card.

### Option A: Built-in Iframe Card (Fastest)

```yaml
type: iframe
url: http://HOME_ASSISTANT_HOST:8083/map-only?place=melbourne&showFrameTime=1&animate=1&animateMode=throttle&animateInterval=2500&frameSkip=1
aspect_ratio: 100%
```

### Option B: Build A Custom Dashboard Card

Use this when you want reusable config fields and consistent URL generation.

#### 1. Create `bom-radar-card.js`

```javascript
class BomRadarCard extends HTMLElement {
  setConfig(config) {
    this.config = {
      host: config.host || window.location.origin,
      place: config.place || "melbourne",
      zoom: Number.isFinite(Number(config.zoom)) ? Number(config.zoom) : 9,
      showFrameTime: config.show_frame_time !== false,
      animate: config.animate !== false,
      animateMode: config.animate_mode || "throttle",
      animateInterval: Number.isFinite(Number(config.animate_interval)) ? Number(config.animate_interval) : 2500,
      frameSkip: Number.isFinite(Number(config.frame_skip)) ? Number(config.frame_skip) : 1,
      interactive: config.interactive === true,
      height: config.height || "480px"
    };
    this.render();
  }

  render() {
    if (!this.config) return;
    const p = new URLSearchParams({
      place: this.config.place,
      zoom: String(this.config.zoom),
      showFrameTime: this.config.showFrameTime ? "1" : "0",
      animate: this.config.animate ? "1" : "0",
      animateMode: this.config.animateMode,
      animateInterval: String(this.config.animateInterval),
      frameSkip: String(this.config.frameSkip),
      interactive: this.config.interactive ? "1" : "0"
    });

    const src = `${this.config.host.replace(/\/$/, "")}/map-only?${p.toString()}`;
    this.innerHTML = `<ha-card header="BOM Radar"><iframe src="${src}" style="width:100%;height:${this.config.height};border:0;"></iframe></ha-card>`;
  }

  getCardSize() {
    return 6;
  }
}

customElements.define("bom-radar-card", BomRadarCard);
```

#### 2. Add Card Resource in Home Assistant

- **Settings -> Dashboards -> Resources -> Add Resource**
- URL: `/local/bom-radar-card.js`
- Type: `JavaScript Module`

#### 3. Use Card in Dashboard YAML

```yaml
type: custom:bom-radar-card
host: http://HOME_ASSISTANT_HOST:8083
place: sydney
zoom: 9
show_frame_time: true
animate: true
animate_mode: throttle
animate_interval: 2500
frame_skip: 1
interactive: false
height: 520px
```

### Card Build Checklist

- Proxy service reachable from HA (`/health` responds).
- `map-only` URL works in browser first.
- Custom resource loaded as `JavaScript Module`.
- Card uses `iframe` to avoid cross-origin scripting problems.
- Card options map cleanly to query parameters.

## Validation

```bash
./test.sh
```

Recommended checks:

- `/map-only?place=melbourne`
- `/map-only?place=sydney&showFrameTime=1`
- `/map-only?coords=-37.8136,144.9631&zoom=10`
- `/map-only?place=melbourne&animate=1&animateMode=throttle&animateInterval=2500&frameSkip=1`
- `/map-only?name=brisbane&zoom=9&showTownNames=1`

## Additional Docs

- [INSTALL.md](INSTALL.md)
- [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
- Home Assistant app package docs:
  - [bom_interactive_proxy/README.md](bom_interactive_proxy/README.md)
  - [bom_interactive_proxy/DOCS.md](bom_interactive_proxy/DOCS.md)

## Archive

Historical planning/design notes are preserved in `archive/planning/`.
