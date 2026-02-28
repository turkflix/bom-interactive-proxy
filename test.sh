#!/bin/bash

# BOM Interactive Proxy Test Script

echo "🌦️  Testing BOM Interactive Proxy..."

PROXY_URL="http://localhost:8083"

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

# Test 3: CORS headers
echo "🔗 Testing CORS headers..."
CORS=$(curl -s -I ${PROXY_URL}/health | grep -i "access-control-allow-origin")
if [ ! -z "$CORS" ]; then
    echo "✅ CORS headers present: $CORS"
else
    echo "❌ CORS headers missing"
    exit 1
fi

# Test 4: BOM proxy (basic)
echo "🌐 Testing BOM proxy..."
BOM=$(curl -s -o /dev/null -w "%{http_code}" ${PROXY_URL}/location/australia)
if [ "$BOM" = "200" ] || [ "$BOM" = "301" ] || [ "$BOM" = "302" ]; then
    echo "✅ BOM proxy responding (HTTP $BOM)"
else
    echo "❌ BOM proxy failed (HTTP $BOM)"
    exit 1
fi

echo ""
echo "🎉 All tests passed!"
echo "💡 Test the interactive map at: ${PROXY_URL}/map"
echo "🏠 Use in Home Assistant with proxy_url: ${PROXY_URL}"