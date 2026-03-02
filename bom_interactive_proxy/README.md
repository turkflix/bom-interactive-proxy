# BOM Interactive Proxy (Home Assistant App)

Run the BOM Interactive Proxy inside Home Assistant as a custom App/Add-on.

The app starts an nginx service that exposes:

- `/` map-only full-screen rain radar (default)
- `/map-only` map-only endpoint
- `/map` direct map endpoint
- `/test-harness` diagnostics page
- `/health` health check

Install via Home Assistant App Store repository URL:

- `https://github.com/turkflix/bom-interactive-proxy`

For full deployment modes (Home Assistant + Docker), query parameters, and dashboard card build instructions, see:

- root [`README.md`](../README.md)
- [`DOCS.md`](./DOCS.md)
