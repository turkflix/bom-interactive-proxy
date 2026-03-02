# Installation Guide

This repo is for the BOM Interactive Proxy service (Home Assistant App/Add-on + Docker).  
It does not include a HACS frontend card.

## Option 1: Home Assistant App/Add-on (Recommended)

1. Open **Settings -> Add-ons (Apps) -> Add-on Store**.
2. Open the top-right menu and select **Repositories**.
3. Add repository URL:
   - `https://github.com/turkflix/bom-interactive-proxy`
4. Install **BOM Interactive Proxy**.
5. Start the app.

Service URLs (default port):
- `http://HOME_ASSISTANT_HOST:8083/`
- `http://HOME_ASSISTANT_HOST:8083/health`
- `http://HOME_ASSISTANT_HOST:8083/test-harness`

## Option 2: Docker

```bash
docker run -d \
  --name bom-proxy \
  -p 8083:80 \
  --restart unless-stopped \
  ghcr.io/turkflix/bom-interactive-proxy:latest
```

Verify:

```bash
curl -f http://localhost:8083/health
```

## Test URLs

- `http://HOST:8083/` (map-only default)
- `http://HOST:8083/map-only?place=ashburton&zoom=8&showFrameTime=1`
- `http://HOST:8083/test-harness`

For the complete querystring reference (all options, aliases, defaults, and behavior), see:
- `README.md` -> **Query Parameters**

## Home Assistant Dashboard Embed (iframe)

```yaml
type: iframe
url: http://HOME_ASSISTANT_HOST:8083/map-only?place=ashburton&zoom=8&showFrameTime=1
aspect_ratio: 100%
```

## Notes

- If port `8083` is in use, change the host port mapping.
- Cache path is configurable in Docker compose:
  - `CACHE_HOST_PATH=/your/host/cache/path`
  - `CACHE_CONTAINER_PATH=/your/container/cache/path` (must match `NGINX_CACHE_PATH`)
  - Example: `CACHE_HOST_PATH=/mnt/fast-ssd/bom-cache CACHE_CONTAINER_PATH=/var/cache/bom docker compose up -d`
- If map tiles fail, restart the container/app and re-test.
- Dashboard custom card support should be implemented in a separate repository that talks to this proxy.
