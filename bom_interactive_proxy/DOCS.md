# BOM Interactive Proxy (Home Assistant App)

## Install

1. In Home Assistant, open **Settings -> Add-ons (Apps) -> Add-on Store**.
2. Open the top-right menu and select **Repositories**.
3. Add this repository URL:
   - `https://github.com/turkflix/bom-interactive-proxy`
4. Find and install **BOM Interactive Proxy**.
5. Start the app.

## Access

- Default web UI: `http://HOME_ASSISTANT_HOST:8083/`
- Health check: `http://HOME_ASSISTANT_HOST:8083/health`
- Test harness: `http://HOME_ASSISTANT_HOST:8083/test-harness`

If port `8083` is in use, change the host port in the app Network settings.

## Recommended URLs

- Full-screen rain radar:
  - `/map-only?place=ashburton`
- Full-screen with frame time + zoom:
  - `/map-only?place=ashburton&showFrameTime=1&zoom=8`
- Animated low-CPU mode:
  - `/map-only?place=ashburton&animate=1&animateMode=throttle&animateInterval=2500&frameSkip=1`
- GPS coordinate lookup:
  - `/map-only?coords=-37.865,145.081&zoom=8`

## Notes

- This app uses the upstream BOM website/API via proxying and URL rewriting.
- If BOM changes upstream asset paths, proxy rules may need to be updated.
