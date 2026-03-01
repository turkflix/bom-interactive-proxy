# BOM Weather Radar Integration Requirements

## Project Overview

Build a solution to embed interactive Australian Bureau of Meteorology (BOM) weather radar maps into Home Assistant dashboards, providing full drag/zoom/explore capabilities for the entire Australian continent.

## Core Requirements

### 1. Interactive Weather Map Functionality
- **Full BOM radar experience** - drag around Australia, zoom in/out at any level
- **Real-time radar data** - current weather conditions and radar imagery
- **Multiple radar layers** - precipitation, temperature, wind, satellite imagery
- **Location-specific data** - weather station information, forecasts, alerts
- **Responsive design** - works on desktop and mobile Home Assistant interfaces

### 2. Home Assistant Integration
- **Dashboard embeddable** - works via iframe embedding from Home Assistant
- **Configurable location** - set default location (e.g., Ashburton VIC 3147)
- **Seamless integration** - looks native to Home Assistant interface
- **No external dependencies** - self-contained solution

### 3. Technical Architecture
- **Docker containerized** - single container deployment
- **Production ready** - stable, reliable, handles failures gracefully
- **Security hardened** - no vulnerabilities, proper CORS handling
- **Performance optimized** - fast loading, efficient caching
- **Logging** - comprehensive logs for debugging and monitoring

## Target URLs and Data Sources

### Primary BOM Resources
- **Main site:** https://www.bom.gov.au
- **Ashburton weather:** https://www.bom.gov.au/location/australia/victoria/central/o2594692629-ashburton
- **API endpoints:** https://api.bom.gov.au/apikey/v1/locations/places/details/place/o2594692629
- **Radar data:** Various BOM radar and satellite imagery endpoints
- **Static assets:** CSS, JavaScript, fonts, images from BOM domains

### Known Challenges
- **Anti-bot protection** - BOM has sophisticated bot detection and blocking
- **CORS restrictions** - X-Frame-Options: SAMEORIGIN prevents direct embedding  
- **Multiple domains** - www.bom.gov.au and api.bom.gov.au both required
- **Dynamic JavaScript** - Complex client-side code that constructs API URLs dynamically

## Automated Testing Requirements

### Unit Tests
- **API proxy functionality** - verify all BOM API calls work through proxy
- **URL rewriting** - test that all BOM URLs are correctly rewritten
- **CORS headers** - ensure proper Access-Control-Allow-Origin headers
- **Health checks** - container startup, nginx configuration, basic connectivity

### Integration Tests  
- **Browser automation** - Selenium/Playwright tests for actual map interaction
- **Network monitoring** - verify no external calls leak through
- **JavaScript functionality** - test drag, zoom, layer switching
- **Data loading** - confirm weather data loads correctly
- **Error handling** - graceful failure when BOM is unavailable

### Test Pages
- **Debug dashboard** - comprehensive testing interface with:
  - API proxy health checks
  - Network request monitoring (proxy vs external)
  - JavaScript override verification
  - Interactive map testing
  - Performance metrics
- **Simple test page** - minimal BOM map for basic functionality testing
- **Home Assistant simulator** - test embedding in HA-like interface
- **Mobile responsive test** - verify mobile compatibility

### Test Automation
- **GitHub Actions CI/CD** - automated testing on code changes
- **Docker health checks** - container self-monitoring
- **Scheduled tests** - periodic verification that BOM integration still works
- **Alert system** - notify when tests fail or BOM changes break functionality

## Technical Specifications

### Docker Container
```dockerfile
# Requirements for Dockerfile
FROM nginx:alpine
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=5s --retries=3 CMD curl -f http://localhost/health || exit 1
```

### Home Assistant Configuration
```yaml
# Target HA dashboard card configuration
type: iframe
url: http://[container-ip]:8080/weather-radar?location=ashburton&state=vic
title: "BOM Weather Radar"  
aspect_ratio: 75%
```

### Environment Configuration
- **PORT:** Configurable port (default 8080)
- **DEFAULT_LOCATION:** Default weather location
- **CACHE_TTL:** Cache duration for BOM data
- **DEBUG_MODE:** Enable/disable debug logging
- **CORS_ORIGINS:** Allowed origins for CORS

## Success Criteria

### Minimum Viable Product (MVP)
- ✅ **Container starts successfully** - no startup errors
- ✅ **BOM page loads** - displays Ashburton weather information  
- ✅ **Basic interactivity** - can click radar map button
- ✅ **Home Assistant embed** - works as iframe in HA dashboard
- ✅ **Automated tests pass** - all test suites green

### Full Solution
- ✅ **Complete interactivity** - drag, zoom, explore entire Australia
- ✅ **Real-time data** - current weather, radar, forecasts
- ✅ **Multiple locations** - configurable for any Australian location
- ✅ **Production stability** - runs continuously without manual intervention
- ✅ **Comprehensive monitoring** - health checks, alerting, logging

## Deliverables

### Code Repository
- **Dockerfile** and docker-compose.yml
- **nginx configuration** with proxy rules
- **Static assets** (HTML, CSS, JavaScript) 
- **Test suites** (unit, integration, browser automation)
- **Documentation** (setup, configuration, troubleshooting)

### Test Infrastructure
- **Debug dashboard** at /debug with comprehensive testing tools
- **Test pages** at /test-* for different scenarios  
- **Automated test runner** - npm test or similar
- **CI/CD pipeline** - automated testing and deployment

### Deployment Package
- **Docker image** published to registry
- **Home Assistant integration guide** 
- **Configuration examples**
- **Monitoring and alerting setup**

## Technical Approaches to Consider

### Proxy Solutions
- **Reverse proxy** with URL rewriting (nginx, Apache)
- **Application proxy** (Node.js, Python Flask)
- **Browser automation** (Puppeteer, Selenium)
- **API scraping** with session management

### Bypass Techniques
- **Perfect browser simulation** - headers, fingerprinting, behavior
- **JavaScript injection** - runtime API interception
- **Service worker** - intercept all network requests
- **Browser extension approach** - if embedding in browser context

### Data Sources
- **Official BOM APIs** - check for public/documented endpoints
- **Alternative weather services** - OpenWeather, WeatherAPI with radar
- **Screen scraping** - server-side capture of BOM pages
- **Hybrid approach** - combine multiple data sources

## Constraints and Considerations

### Legal and Ethical
- **Respect BOM's terms of service** - don't overload servers
- **Rate limiting** - reasonable request frequency
- **Attribution** - proper credit to Bureau of Meteorology
- **No commercial use** - personal/educational use only

### Technical Limitations
- **BOM may change** - their site, APIs, or protection measures
- **Update dependency** - solution may need maintenance
- **Performance impact** - proxy adds latency
- **Security considerations** - running proxy service

### Maintenance Requirements
- **Monitoring** - detect when BOM changes break functionality
- **Updates** - adapt to BOM site changes
- **Security patches** - keep container dependencies updated
- **Documentation** - maintain setup and troubleshooting guides

## Getting Started

1. **Research phase** - analyze BOM's current implementation
2. **Architecture design** - choose technical approach
3. **MVP development** - basic proxy + embedding
4. **Test framework** - automated verification
5. **Enhancement** - full interactivity and features
6. **Production deployment** - containerization and monitoring

## Success Metrics

- **Functional tests pass** - 100% automated test success rate
- **Home Assistant integration** - works seamlessly in HA dashboard  
- **User experience** - interactive map with drag/zoom/explore
- **Reliability** - 99%+ uptime with automated restarts
- **Maintenance overhead** - minimal manual intervention required

---

*This document provides complete requirements for building a production-ready BOM weather radar integration for Home Assistant with comprehensive testing and Docker deployment.*
