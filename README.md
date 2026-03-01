# BOM Interactive Proxy

Interactive BOM weather map proxy designed for browser embedding and Home Assistant.

This repository is **add-on/app only** for the proxy service.  
Frontend dashboard card code is intentionally out of scope and should live in a separate repository.

## What It Does

- Proxies BOM web + API traffic through local nginx.
- Rewrites host references so map assets load from one origin.
- Serves a clean full-screen map page focused on rain radar.
- Suppresses BOM hover popups and "view more at this location" overlays in map-only mode.
- Caches radar/tile frame endpoints locally in nginx to reduce repeated upstream BOM requests.
- Sets browser cache for radar/tile frame endpoints to 60 seconds (`Cache-Control: public, max-age=60`).
- Registers a browser service worker that caches map frame tiles for 60 seconds to reduce repeat frame fetches during animation loops.
- Provides a browser test harness and health endpoint.
- Includes Home Assistant custom App/Add-on repository packaging.

## Current Defaults

- `/` serves **map-only mode** by default.
- Map-only mode forces:
  - rain tab selected
  - chrome cleanup enabled
  - frame-time overlay enabled by default
  - animation/autoplay paused by default (lower CPU/network)

## Endpoints

- `/` default map-only page
- `/map-only` full-screen map wrapper
- `/map` direct map page (advanced params)
- `/test-harness` smoke test page
- `/debug-harness` diagnostics page
- `/health` returns `OK`

## Caching Model

- **Upstream protection (proxy cache):**
  - nginx caches BOM mapping/tile responses for 60 seconds.
  - Confirm via `X-Proxy-Cache` (`MISS` then `HIT`).
- **Browser HTTP cache:**
  - Tile responses include `Cache-Control: public, max-age=60`.
- **Browser service worker tile cache:**
  - `map-sw.js` intercepts WMTS/overlay/basemap tile image requests.
  - Returns cached tile responses for up to 60 seconds before refreshing.
  - This helps when animation loops revisit the same frame URLs.

## Query Parameters

`/map-only` passes through supported parameters to `/map`.

### Location Parameters

- `path=<bom-location-path>`
  - Example:  
    `/map-only?path=australia/victoria/central/o2594692629-ashburton`
- `place=<name>` or `name=<name>`
  - Example:  
    `/map-only?place=ashburton`
- `lat=<latitude>&lon=<longitude>`
  - Aliases: `lng`, `latitude`, `longitude`
  - Example:  
    `/map-only?lat=-37.865&lon=145.081`
- `coords=<lat,lon>`
  - Example:  
    `/map-only?coords=-37.865,145.081`

If none are provided, default location is:
`australia/victoria/central/o2594692629-ashburton`

### Display Parameters

- `showFrameTime=1|0` (alias: `showTime`)
  - Default in `/map-only`: `1`
  - Default in `/map`: `0`
  - Overlay is shown at bottom-right.
- `zoom=<integer>`
  - Rounded and clamped to `0..20`.
  - Higher values request a closer zoom-in view.
  - Applied after map initialization with bounded best-effort control logic.
- `animate=1|0` (alias: `autoplay=1|0`)
  - Default in `/map-only`: `0` (paused / low-power mode)
  - Default in `/map`: `1` (normal BOM behavior)
  - Use `animate=1` if you want continuous looping animation.
- `animateMode=native|throttle`
  - Default: `native`
  - `native`: use BOM's built-in autoplay (higher CPU on low-power devices).
  - `throttle`: pause native autoplay and step frames at a fixed interval (lower CPU).
- `animateInterval=<milliseconds>`
  - Used when `animateMode=throttle`.
  - Default: `2000`
  - Range: `500..30000`
- `frameSkip=<integer>`
  - Used when `animateMode=throttle`.
  - Number of frames advanced per step.
  - Default: `1`
  - Range: `1..6`
- `lowPower=1|0`
  - Forces low-bandwidth behavior:
    - animation paused
    - frame-time overlay disabled
    - lighter cleanup loop
  - Recommended for always-on dashboards and low-power devices.

### Internal Mode Parameters

These are normally set by `/map-only`:
- `mapOnly=1`
- `rain=1`
- `cleanup=1`

## Quick Start (Docker)

### Run Prebuilt Image

```bash
docker run -d \
  --name bom-proxy \
  -p 8083:80 \
  ghcr.io/turkflix/bom-interactive-proxy:latest
```

Open:
- `http://localhost:8083/`
- `http://localhost:8083/test-harness`

### Run From Source

```bash
git clone https://github.com/turkflix/bom-interactive-proxy.git
cd bom-interactive-proxy
docker compose up -d
```

Open:
- `http://localhost:8083/`

## Validation

```bash
./test.sh
```

Recommended browser checks:
- `/map-only?place=ashburton`
- `/map-only?place=ashburton&showFrameTime=1`
- `/map-only?place=ashburton&zoom=8`
- `/map-only?coords=-37.865,145.081&zoom=10`
- `/map-only?place=ashburton&animate=1&animateMode=throttle&animateInterval=2500&frameSkip=1`

## Home Assistant Apps (Custom Repository)

This repo now includes Home Assistant custom App/Add-on metadata:
- root: `repository.yaml`
- app package: `bom_interactive_proxy/`

### Add Repository In Home Assistant

1. Open **Settings -> Add-ons (Apps) -> Add-on Store**.
2. Open the top-right menu.
3. Select **Repositories**.
4. Add:
   - `https://github.com/turkflix/bom-interactive-proxy`
5. Install **BOM Interactive Proxy**.
6. Start the app.

### Home Assistant App Access

- Default host port: `8083`
- Main URL: `http://HOME_ASSISTANT_HOST:8083/`
- Health URL: `http://HOME_ASSISTANT_HOST:8083/health`

If `8083` is already in use, change the host port in the app Network settings.

## Home Assistant Dashboard Embed (iframe)

```yaml
type: iframe
url: http://HOME_ASSISTANT_HOST:8083/map-only?place=ashburton&zoom=8&showFrameTime=1
aspect_ratio: 100%
```

## Troubleshooting

- If map API assets return `403`, restart the container after config updates and re-test.
- If map renders but radar is missing, verify `rain=1` (automatic in `/map-only`).
- If zoom is not applied immediately, wait for initial tile load and re-open the URL.
- If you want to verify cache behavior, inspect `X-Proxy-Cache` response header on tile requests (`MISS` then `HIT`).
- If request headers show `Cache-Control: no-cache` and `Pragma: no-cache`, the browser is forcing revalidation (commonly DevTools `Disable cache`); disable that option when validating browser-level cache behavior.
