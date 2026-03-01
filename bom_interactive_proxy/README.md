# BOM Interactive Proxy (Home Assistant App)

Run the BOM Interactive Proxy inside Home Assistant as a custom App/Add-on.

The app starts an nginx service that exposes:
- `/` map-only full-screen rain radar (default)
- `/map-only` map-only endpoint
- `/map` direct map endpoint
- `/test-harness` diagnostics page
- `/health` health check

Use the Home Assistant App Store "Repositories" feature to add this GitHub repo URL, then install **BOM Interactive Proxy**.
