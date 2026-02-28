# 🚀 Installation Guide - BOM Interactive Proxy

## Quick Start for Paul's Setup

### Step 1: Run the Proxy Service

#### Option A: Pre-built Image (Recommended)
```bash
# Run the latest build from GitHub Container Registry
docker run -d --name bom-proxy \
  -p 8083:80 \
  --restart unless-stopped \
  ghcr.io/turkflix/bom-interactive-proxy:latest

# Verify it's running
curl http://192.168.86.62:8083/health
# Should return: OK
```

#### Option B: Docker Compose (Pre-built)
```bash
# Clone and start with pre-built image
git clone https://github.com/turkflix/bom-interactive-proxy.git
cd bom-interactive-proxy
docker-compose up -d

# Verify it's running
curl http://192.168.86.62:8083/health
# Should return: OK
```

#### Option C: Build from Source
```bash
# Clone and build locally
git clone https://github.com/turkflix/bom-interactive-proxy.git
cd bom-interactive-proxy
docker-compose -f docker-compose.dev.yml up -d
```

### Step 2: Install Home Assistant Card

#### Option A: HACS (Recommended)
```
1. HACS → Frontend → ⋮ → Custom repositories
2. Repository: turkflix/bom-interactive-proxy
3. Category: Frontend  
4. Install → Restart Home Assistant
```

#### Option B: Manual Installation
```bash
# Copy the card file to Home Assistant
cp home-assistant/bom-interactive-map.js /config/www/community/bom-interactive-map/
```

### Step 3: Add to Dashboard

```yaml
type: custom:bom-interactive-map
proxy_url: http://192.168.86.62:8083
location: ashburton
state: vic
height: 500px
title: "Interactive Weather Map"
```

## 🎯 Result

Instead of static cached frames cycling through, you get:

- ✅ **Full interactive BOM map** - zoom, pan, navigate
- ✅ **Real-time radar data** - always current
- ✅ **Multiple layers** - radar, satellite, etc.
- ✅ **Location search** - find any Australian location  
- ✅ **Clean integration** - just the map in your dashboard

## 🔧 Configuration Options

### Basic Configuration
```yaml
type: custom:bom-interactive-map
proxy_url: http://192.168.86.62:8083
```

### Advanced Configuration
```yaml
type: custom:bom-interactive-map
proxy_url: http://192.168.86.62:8083
location: ashburton              # Location name
state: vic                       # State abbreviation  
bom_path: australia/victoria/central/o2594692629-ashburton  # Custom BOM path
height: 600px                    # Card height
title: "Ashburton Weather Radar" # Card title
```

### Multiple Locations
```yaml
# Melbourne CBD
type: custom:bom-interactive-map
proxy_url: http://192.168.86.62:8083
location: melbourne
state: vic
bom_path: australia/victoria/central/o7671361656-melbourne

# Geelong  
type: custom:bom-interactive-map
proxy_url: http://192.168.86.62:8083
location: geelong
state: vic
bom_path: australia/victoria/central/r1r1v0fw0-geelong
```

## 🐛 Troubleshooting

### Proxy Service Issues
```bash
# Check proxy logs
docker-compose logs bom-interactive-proxy

# Restart proxy
docker-compose restart

# Rebuild if needed
docker-compose build --no-cache
```

### Card Not Loading
1. **Check proxy URL** - ensure http://IP:8083 is accessible from HA
2. **Clear browser cache** - F12 → Right-click refresh → Empty cache  
3. **Check HA logs** - Settings → System → Logs
4. **Verify HACS installation** - HACS → Frontend → BOM Interactive Map

### Map Not Interactive
1. **Check browser console** - F12 → Console for errors
2. **Verify CORS headers** - should see `Access-Control-Allow-Origin: *`
3. **Test direct access** - open http://192.168.86.62:8083/map in browser

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Home Assistant │───▶│ BOM Interactive │───▶│ Bureau of       │
│  Dashboard      │    │ Proxy           │    │ Meteorology     │
│                 │    │ (Docker)        │    │ (bom.gov.au)    │
│ Custom Card     │    │ nginx + CORS    │    │ Original APIs   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## ✅ Success Verification

When working correctly, you should see:
- 🗺️ **Interactive map** with zoom/pan controls
- 🌧️ **Real-time radar overlay** showing current conditions  
- 🎯 **Location marker** for Ashburton
- 🔄 **Auto-refresh** of weather data
- 📱 **Responsive design** working on mobile/desktop

**Much better than static frame cycling!** 🎉