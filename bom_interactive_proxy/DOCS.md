# BOM Interactive Proxy (Home Assistant App)

## Install

1. Open **Settings -> Add-ons (Apps) -> Add-on Store**.
2. Open the top-right menu -> **Repositories**.
3. Add repository URL:
   - `https://github.com/turkflix/bom-interactive-proxy`
4. Install **BOM Interactive Proxy**.
5. Start the app.

## Access

- Main URL: `http://HOME_ASSISTANT_HOST:8083/`
- Health check: `http://HOME_ASSISTANT_HOST:8083/health`
- Test harness: `http://HOME_ASSISTANT_HOST:8083/test-harness`

If port `8083` is in use, change it in app Network settings.

## Recommended URLs

- Full-screen rain radar:
  - `/map-only?place=melbourne`
- Full-screen with frame time + zoom:
  - `/map-only?place=sydney&showFrameTime=1&zoom=9`
- Animated throttle mode:
  - `/map-only?place=melbourne&animate=1&animateMode=throttle&animateInterval=2500&frameSkip=1`
- GPS coordinate lookup:
  - `/map-only?coords=-37.8136,144.9631&zoom=10`
- Full path lookup:
  - `/map-only?path=australia/victoria/central/bvic_pt042-melbourne&zoom=9`

## Dashboard Card

### Built-in iframe card

```yaml
type: iframe
url: http://HOME_ASSISTANT_HOST:8083/map-only?place=melbourne&showFrameTime=1&animate=1&animateMode=throttle&animateInterval=2500&frameSkip=1
aspect_ratio: 100%
```

### Custom card

Use a custom card if you want reusable options and cleaner dashboard YAML.
The complete implementation checklist and example custom-card JavaScript are documented in:

- root `README.md` -> **Home Assistant Dashboard Card Guide**

## Notes

- This app proxies upstream BOM web/API traffic and rewrites URLs locally.
- If upstream BOM assets or APIs change, proxy rules may need updating.
