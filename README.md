# BOM Interactive Proxy 🌦️

**Interactive Australian Bureau of Meteorology weather maps for Home Assistant**

Instead of static cached frames, this proxy provides the **full interactive BOM map experience** with zoom, pan, and real-time data - just like the official BOM website, but embedded in your Home Assistant dashboard.

## 🎯 Features

- ✅ **Full interactivity** - Zoom, pan, navigate like the real BOM site
- ✅ **Real-time data** - No caching delays, always current  
- ✅ **CORS bypass** - Works seamlessly in Home Assistant
- ✅ **Location specific** - Configure for your area (Ashburton, etc.)
- ✅ **Clean integration** - Just the map, no BOM website clutter

## 🚀 Quick Start

### 1. Run the Proxy (Pre-built Image)
```bash
docker run -d --name bom-proxy -p 8083:80 ghcr.io/turkflix/bom-interactive-proxy:latest
```

### 2. Test the Proxy (Before Home Assistant)
```bash
# Download the test page
curl -O https://raw.githubusercontent.com/turkflix/bom-interactive-proxy/main/test-page.html

# Open in browser
open test-page.html  # macOS
# or just double-click the file
```

The test page will:
- ✅ **Test proxy connectivity** - health, CORS, BOM access
- 🗺️ **Show interactive map** - exactly like it will appear in HA  
- 🐛 **Debug information** - logs and troubleshooting
- 🎮 **Location controls** - test different Australian locations

### 3. Alternative: Build from Source
```bash
git clone https://github.com/turkflix/bom-interactive-proxy.git
cd bom-interactive-proxy
docker-compose up -d
```

### 4. Add to Home Assistant
```yaml
type: custom:bom-interactive-map
proxy_url: http://192.168.86.62:8083
location: ashburton
state: vic
```

### 3. Enjoy Interactive Weather Maps!
- **Zoom in/out** with mouse wheel
- **Pan around** by dragging  
- **Switch layers** - radar, satellite, etc.
- **Real-time updates** from BOM

## 🏗️ Architecture

```
Home Assistant ──→ BOM Interactive Proxy ──→ Bureau of Meteorology
     ↑                      ↑                        ↑
Custom Card         Docker Container           Original Maps API
(iframe/embed)      (nginx + rewriting)        (with CORS fixed)
```

## 📋 Project Status

🔧 **In Development**
- [x] Project structure  
- [ ] BOM page analysis
- [ ] Proxy server (nginx)
- [ ] URL rewriting rules
- [ ] Home Assistant card
- [ ] Docker packaging
- [ ] Testing & optimization

## 🎯 Target Experience

Replace this static frame approach:
```yaml
# Old way - static cached images
type: custom:bom-weather-radar-card
suburb: ashburton
state: VIC
service_url: http://service:8082
```

With this interactive experience:
```yaml  
# New way - full interactive map
type: custom:bom-interactive-map
proxy_url: http://proxy:8083
location: ashburton
state: vic
```

**The difference:** Instead of cycling through static radar images, you get the full interactive BOM map experience with zoom, pan, layers, and real-time data updates.

## 🔧 Development

Built for Paul's Home Assistant setup with focus on:
- **Ashburton, VIC** location
- **Clean dashboard integration**  
- **Full interactivity** like the real BOM site
- **No static frame limitations**

---

*Built by turkflix for superior BOM weather integration*