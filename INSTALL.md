# Installation Guide

This repository provides the BOM Interactive Proxy service for Home Assistant and Docker deployments.

## Home Assistant App/Add-on (Recommended)

1. Open **Settings -> Add-ons (Apps) -> Add-on Store**.
2. Open the top-right menu -> **Repositories**.
3. Add repository URL: `https://github.com/turkflix/bom-interactive-proxy`
4. Install **BOM Interactive Proxy**.
5. Start the app.

Default URLs:

- `http://HOME_ASSISTANT_HOST:8083/`
- `http://HOME_ASSISTANT_HOST:8083/health`
- `http://HOME_ASSISTANT_HOST:8083/test-harness`

## Docker Deployment Methods

### Method 1: Prebuilt Image (`docker run`)

```bash
docker run -d \
  --name bom-interactive-proxy \
  -p 8083:80 \
  -e TIMEZONE=Australia/Melbourne \
  -e NGINX_CACHE_PATH=/var/cache/bom \
  -v /your/host/cache/path:/var/cache/bom \
  --restart unless-stopped \
  ghcr.io/turkflix/bom-interactive-proxy:latest
```

### Method 2: Docker Compose

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

### Method 3: Build Locally

```bash
git clone https://github.com/turkflix/bom-interactive-proxy.git
cd bom-interactive-proxy
docker build -t bom-interactive-proxy:local .
docker rm -f bom-interactive-proxy 2>/dev/null || true
docker run -d --name bom-interactive-proxy -p 8083:80 -e TIMEZONE=Australia/Melbourne bom-interactive-proxy:local
```

## Verify Service

```bash
curl -f http://localhost:8083/health
```

## Test URLs

- `http://HOST:8083/` (map-only default)
- `http://HOST:8083/map-only?place=melbourne&zoom=9&showFrameTime=1`
- `http://HOST:8083/map-only?place=sydney&animate=1&animateMode=throttle&animateInterval=2500&frameSkip=1`
- `http://HOST:8083/map-only?coords=-37.8136,144.9631&zoom=10`
- `http://HOST:8083/map-only?path=australia/new-south-wales/metropolitan/bnsw_pt131-sydney&zoom=9`
- `http://HOST:8083/test-harness`

## Home Assistant Dashboard Card Setup

### Built-in iframe card

```yaml
type: iframe
url: http://HOME_ASSISTANT_HOST:8083/map-only?place=melbourne&showFrameTime=1&animate=1&animateMode=throttle&animateInterval=2500&frameSkip=1
aspect_ratio: 100%
```

### Custom card

For a complete custom-card implementation guide (resource registration, JavaScript scaffold, and YAML examples), see:

- `README.md` -> **Home Assistant Dashboard Card Guide**

## Notes

- If port `8083` is in use, change host port mapping.
- Cache path can be customized with `NGINX_CACHE_PATH`.
- If map tiles fail, restart the container/app and retest.
- For full query parameter behavior, see `README.md` -> **Query Parameters**.
