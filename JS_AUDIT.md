# JavaScript Audit (Map Mode)

Audit target:
- `GET /location/australia/victoria/central/o2594692629-ashburton` via local proxy

Observed script tags:
1. Inline API override injection (`<head>` inline script)
2. Inline `drupal-settings-json` payload
3. `/sites/default/files/js/js_*.js?scope=header&delta=0...`
4. Inline boomerang/Akamai bootstrap script block
5. `/sites/default/files/js/js_*.js?scope=footer&delta=0...`
6. `https://www.google.com/recaptcha/enterprise.js?...`
7. `/sites/default/files/js/js_*.js?scope=footer&delta=2...`
8. `/themes/custom/bom_theme/bom-react/dist/main.bundle.js?...`
9. `/sites/default/files/js/js_*.js?scope=footer&delta=4...`
10. `/modules/contrib/google_tag/js/gtag.js?...`
11. `/sites/default/files/js/js_*.js?scope=footer&delta=6...`
12. `/modules/contrib/google_tag/js/gtm.js?...`

Classification for map-only mode:
- Required:
  - BOM React app bundle/chunks under `/themes/custom/bom_theme/bom-react/dist/*`
  - `drupalSettings` object availability (provided by inline bootstrap)
  - `/sites/default/files/js/js_*.js` Drupal aggregates (required by BOM runtime; disabling causes `towns_places` runtime errors)
- Not required for map rendering:
  - Recaptcha script
  - Google Tag Manager scripts (`gtag`, `gtm`, googletagmanager loader)
  - Akamai/boomerang telemetry loaders

Proxy policy implemented:
- Disable non-map script tags in proxied location HTML:
  - Recaptcha + GTM external script tags disabled
- Keep Drupal aggregate JS enabled (runtime dependency).
- Keep BOM React map bundle available.
- Ensure `window.drupalSettings` is initialized from Drupal JSON inline payload.
- Rewrite `api.bom.gov.au` and `api.test2.bom.gov.au` references to local proxy origin.
- Stub non-map `/api/v1/*` content widget endpoints used by warnings/news/form chrome.

Validation guardrails added:
- Fail if location HTML still contains:
  - external `api.bom.gov.au` or `api.test2.bom.gov.au` references
  - telemetry/anti-bot hosts
- Fail if required BOM React `main.bundle.js` script is missing.
