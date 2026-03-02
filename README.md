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
- Applies lean defaults for map-only use by disabling BOM tag-manager scripts and blocking third-party script loads inside proxied location pages.
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
- **Configurable cache directory (Docker):**
  - Container cache root is controlled by `NGINX_CACHE_PATH` (default: `/tmp/nginx_cache`).
  - `docker-compose.yml`/`docker-compose.dev.yml` expose:
    - `CACHE_HOST_PATH` (default: `./cache`)
    - `CACHE_CONTAINER_PATH` (default: `/tmp/nginx_cache`)
  - Example:
    - `CACHE_HOST_PATH=/mnt/fast-ssd/bom-cache CACHE_CONTAINER_PATH=/var/cache/bom docker compose up -d`
- **Lean page-script policy (default):**
  - `/location/...` responses send a restrictive same-origin CSP and remove `Link` preconnect headers.
  - `/location/...` HTML is served with `Cache-Control: no-store` so stale pre-strip pages are not reused by the browser.
  - Injected local bootstrap script (`/inject-api-override.js`) initializes `window.drupalSettings` from Drupal JSON, prunes non-essential map overlays, and rewrites hardcoded `api.bom.gov.au`/`api.test2.bom.gov.au` calls back to local proxy origin.
  - Drupal aggregate JS bundles (`/sites/default/files/js/js_*.js`) remain enabled because BOM React runtime depends on data they provide.
  - BOM HTML is rewritten to disable non-essential external/tag scripts (`recaptcha`, `googletagmanager`, `gtag`, `gtm`).
  - Residual third-party telemetry/search URLs are rewritten to local `/blocked-external/...` `204` responses (including `go-mpulse`, BOM APM analytics, and Akamai script/pixel loaders).
  - `/modules/contrib/google_tag/js/gtag.js` and `/modules/contrib/google_tag/js/gtm.js` are also served as no-op stubs as a fallback.
  - Requests to `/akam/...` are dropped locally (`204`) to avoid loading non-map anti-bot assets in map-only mode.
  - Non-map content widget APIs are served locally in map-only profile (`/api/v1/curated-alerts`, `/api/v1/global-alerts`, `/api/v1/nearby-news`, `/api/v1/webform/webform/*`) to avoid intermittent upstream anti-bot 403s.

## Query Parameters

`/map-only` is a wrapper that always launches `/map` with:
- `cleanup=1`
- `mapOnly=1`
- `rain=1`

It also forwards only a safe allowlist of user params:
`path`, `place`, `name`, `lat`, `lon`, `lng`, `latitude`, `longitude`, `coords`, `zoom`, `lowPower`, `lowpower`, `animate`, `autoplay`, `animateMode`, `animatemode`, `animateInterval`, `animatems`, `frameSkip`, `frameskip`, `showFrameTime`, `showTime`.

`/map-only` does not forward `cleanup`, `mapOnly`, `rain`, or `mode`; use `/map` directly if you need to control those internals.

### Parameter Resolution Order

Location is resolved in this order:
1. `path`
2. `place` or `name`
3. `lat/lon` (and aliases) or `coords`
4. fallback: `australia/victoria/central/o2594692629-ashburton`

### Boolean Parsing Rules

Two boolean parsers are used:
- Strict (`mapOnly`, `rain`, `cleanup`): only exact `1` means true.
- Flexible (`animate`, `showFrameTime`, `lowPower`): false only for `0`, `false`, `off`, `no` (case-insensitive). Any other present value is treated as true.

### Full Parameter Reference (`/map`)

| Parameter | Aliases | Type | Default on `/map` | Notes |
|---|---|---|---|---|
| `path` | none | string | none | Full BOM location path, e.g. `australia/victoria/central/o2594692629-ashburton`. If set, lookup by place/coords is skipped. |
| `place` | `name` | string | none | Place name lookup using BOM autocomplete/details APIs. |
| `lat` + `lon` | `latitude`, `longitude`, `lng` | numbers | none | Coordinate lookup when `path` and `place/name` are not supplied. |
| `coords` | none | `lat,lon` string | none | Alternative coordinate input, e.g. `-37.865,145.081`. |
| `zoom` | none | integer | none | Best-effort target zoom, rounded and clamped to `0..20`. Applied after initial map load. |
| `showFrameTime` | `showTime` | boolean (flexible parser) | `0` unless `mapOnly=1` | Enables bottom-right frame/time badge. |
| `animate` | `autoplay` | boolean (flexible parser) | `1` unless `mapOnly=1` | Controls timeline autoplay behavior. |
| `animateMode` | `animatemode` | enum | `native` | `native` or throttled stepping. `throttle`, `throttled`, `step`, `stepped` all map to throttle mode. |
| `animateInterval` | `animatems` | integer milliseconds | `2000` | Used in throttle mode. Clamped to `500..30000`. |
| `frameSkip` | `frameskip` | integer | `1` | Used in throttle mode. Frames advanced per step. Clamped to `1..6`. |
| `lowPower` | `lowpower` | boolean (flexible parser) | `0` | Forces reduced activity: disables animation and frame-time overlay, reduces cleanup cadence. |
| `mapOnly` | `mode=maponly` | boolean (strict parser) | `0` | Enables map-only cleanup behavior and map-only defaults (`showFrameTime` default on, `animate` default off). |
| `rain` | none | boolean (strict parser) | `0` | Forces the Rain tab workflow. |
| `cleanup` | none | boolean (strict parser) | `0` | Enables repeated BOM chrome cleanup loop. |

### Effective Defaults on `/map-only`

Because `/map-only` injects internal flags, effective defaults are:
- `mapOnly=1`
- `rain=1`
- `cleanup=1`
- `showFrameTime=1` (unless `lowPower=1`)
- `animate=0` (unless explicitly enabled and `lowPower=0`)

### Examples

- `/map-only?place=ashburton`
- `/map-only?path=australia/victoria/central/o2594692629-ashburton&zoom=8`
- `/map-only?coords=-37.865,145.081&zoom=10`
- `/map-only?place=ashburton&animate=1&animateMode=throttle&animateInterval=2500&frameSkip=1&showFrameTime=1`

## Quick Start (Docker)

### Run Prebuilt Image

```bash
docker run -d \
  --name bom-proxy \
  -p 8083:80 \
  -e NGINX_CACHE_PATH=/var/cache/bom \
  -v /your/host/cache/path:/var/cache/bom \
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
