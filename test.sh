#!/bin/bash

# BOM Interactive Proxy Test Script

echo "🌦️  Testing BOM Interactive Proxy..."

PROXY_URL="${PROXY_URL:-http://localhost:8083}"

# Test 1: Health check
echo "📊 Testing health endpoint..."
HEALTH=$(curl -s -o /dev/null -w "%{http_code}" ${PROXY_URL}/health)
if [ "$HEALTH" = "200" ]; then
    echo "✅ Health check passed"
else
    echo "❌ Health check failed (HTTP $HEALTH)"
    exit 1
fi

# Test 2: Map page
echo "🗺️  Testing map page..."
MAP=$(curl -s -o /dev/null -w "%{http_code}" ${PROXY_URL}/map)
if [ "$MAP" = "200" ]; then
    echo "✅ Map page accessible"
else
    echo "❌ Map page failed (HTTP $MAP)"
    exit 1
fi

# Test 3: Test harness page
echo "🧪 Testing test harness page..."
HARNESS=$(curl -s -o /dev/null -w "%{http_code}" ${PROXY_URL}/test-harness)
if [ "$HARNESS" = "200" ]; then
    echo "✅ Test harness accessible"
else
    echo "❌ Test harness failed (HTTP $HARNESS)"
    exit 1
fi

# Test 4: CORS headers
echo "🔗 Testing CORS headers..."
CORS=$(curl -s -I ${PROXY_URL}/health | grep -i "access-control-allow-origin")
if [ ! -z "$CORS" ]; then
    echo "✅ CORS headers present: $CORS"
else
    echo "❌ CORS headers missing"
    exit 1
fi

# Test 5: BOM proxy (basic)
echo "🌐 Testing BOM proxy..."
BOM=$(curl -s -o /dev/null -w "%{http_code}" ${PROXY_URL}/location/australia)
if [ "$BOM" = "200" ] || [ "$BOM" = "301" ] || [ "$BOM" = "302" ]; then
    echo "✅ BOM proxy responding (HTTP $BOM)"
else
    echo "❌ BOM proxy failed (HTTP $BOM)"
    exit 1
fi

# Test 6: Mapping endpoints used by interactive map
echo "🛰️  Testing mapping service endpoints..."
WMTS=$(curl -s -o /dev/null -w "%{http_code}" "${PROXY_URL}/timeseries/wmts?service=WMTS&request=GetCapabilities")
OVERLAY=$(curl -s -o /dev/null -w "%{http_code}" "${PROXY_URL}/overlays/forecast_districts/MapServer/0?f=pjson")
BASEMAP=$(curl -s -o /dev/null -w "%{http_code}" "${PROXY_URL}/basemaps/basemap_default/MapServer?f=pjson")
if [ "$WMTS" = "200" ] && [ "$OVERLAY" = "200" ] && [ "$BASEMAP" = "200" ]; then
    echo "✅ Mapping endpoints reachable (WMTS=$WMTS OVERLAY=$OVERLAY BASEMAP=$BASEMAP)"
else
    echo "❌ Mapping endpoint failure (WMTS=$WMTS OVERLAY=$OVERLAY BASEMAP=$BASEMAP)"
    exit 1
fi

# Test 7: Location HTML rewrite guardrail (must not leak direct API hosts)
echo "🧩 Testing location HTML rewrite..."
LOC_HTML=$(curl -sS --compressed "${PROXY_URL}/location/australia/victoria/central/o2594692629-ashburton")
if echo "$LOC_HTML" | rg -q "https://api\\.bom\\.gov\\.au|https:\\\\/\\\\/api\\.bom\\.gov\\.au|https://api\\.test2\\.bom\\.gov\\.au|https:\\\\/\\\\/api\\.test2\\.bom\\.gov\\.au"; then
    echo "❌ Rewrite check failed (external BOM API host references still present)"
    exit 1
fi
if echo "$LOC_HTML" | rg -Pq "<script[^>]*\\ssrc=['\"]https://(www\\.bom\\.gov\\.au/akam/|apm\\.analytics\\.bom\\.gov\\.au|s2?\\.go-mpulse\\.net/boomerang/|www\\.googletagmanager\\.com|www\\.google\\.com/recaptcha/|www\\.gstatic\\.com/recaptcha/)"; then
    echo "❌ Rewrite check failed (external telemetry/anti-bot script sources still active)"
    exit 1
fi
if ! echo "$LOC_HTML" | rg -Pq "<script[^>]*\\ssrc=['\"]/themes/custom/bom_theme/bom-react/dist/main\\.bundle\\.js"; then
    echo "❌ Rewrite check failed (required BOM React main bundle missing)"
    exit 1
fi
if echo "$LOC_HTML" | rg -Fq "API_HOST_RE=/https:\\/\\/api(?:\\.test2)?\\.bom\\.gov\\.au/g"; then
    echo "✅ Rewrite guardrail passed (inline override present + external telemetry stripped)"
else
    echo "❌ Rewrite guardrail failed (inline override marker missing)"
    exit 1
fi

echo ""
echo "🎉 All tests passed!"
echo "💡 Test the interactive map at: ${PROXY_URL}/map"
echo "🧪 Test harness available at: ${PROXY_URL}/test-harness"
echo "🏠 Use in Home Assistant with proxy_url: ${PROXY_URL}"
