# BOM Interactive Proxy Backlog

## Scope
This backlog maps `BOM_WEATHER_RADAR_REQUIREMENTS.md` into incremental delivery with a focus on:
- browser-testable outcomes first,
- low-ops setup for Home Assistant users,
- clear pass/fail acceptance checks.

## Current Snapshot
- `done`: Basic Docker image and nginx proxy are in place.
- `done`: Health endpoint (`/health`) and map endpoint (`/map`) exist.
- `done`: Initial debug page exists (`/debug-harness`).
- `in-progress`: Formalized backlog and test harness hardening.
- `pending`: Automated browser tests in CI, resilience hardening, and production monitoring.

## P0 - Browser-Testable MVP
Status: `in-progress`

1. Serve a first-class in-container test harness page.
Acceptance criteria:
- `/test-harness` loads from the proxy container.
- Harness runs health/CORS/map/proxy checks and shows pass/fail states.
- Harness embeds the interactive map for manual drag/zoom validation.

2. Make entrypoint discovery easy.
Acceptance criteria:
- `/` shows links for map, harness, debug harness, and health.
- First-time user can reach a working test flow in one click.

3. Expand smoke test coverage.
Acceptance criteria:
- `test.sh` checks `/health`, `/map`, `/test-harness`, CORS, and `/location/...`.
- Script exits non-zero on failure.

## P1 - Proxy Reliability and Safety
Status: `pending`

1. Consolidate nginx rules to reduce brittle rewrite behavior.
Acceptance criteria:
- Duplicate/overlapping location rules are reduced.
- Config remains valid under `nginx -t`.
- Main BOM location and API paths still resolve via proxy.

2. Add upstream resilience defaults.
Acceptance criteria:
- Timeouts, retry behavior, and error responses are explicit.
- Failure modes are user-visible in harness and logs.

3. Add optional rate-limit tuning via env/templating.
Acceptance criteria:
- Key rate and timeout values can be tuned without source edits.

## P2 - Automated Verification
Status: `pending`

1. Add CI smoke tests.
Acceptance criteria:
- On each push/PR, container starts and smoke endpoints pass.

2. Add browser automation tests (Playwright).
Acceptance criteria:
- Automated load of `/test-harness` and `/map`.
- Assertions for visible map frame and no fatal runtime errors.

3. Add scheduled canary checks.
Acceptance criteria:
- Periodic run detects upstream BOM breakages early.
- Failure notification path is documented.

## P3 - Home Assistant Experience
Status: `pending`

1. Improve card diagnostics and error recovery.
Acceptance criteria:
- Card surfaces connection and timeout details.
- Retry path is reliable and user-visible.

2. Configuration presets for common BOM locations.
Acceptance criteria:
- Documented examples for multiple suburbs/states.
- Quick-start config is copy/paste ready.

## Execution Order
1. Complete P0 and release a browser-testable build.
2. Stabilize P1 proxy behavior.
3. Add P2 automation to prevent regressions.
4. Refine P3 UX/documentation for Home Assistant users.
