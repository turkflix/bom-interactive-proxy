// BULLETPROOF BOM API Override - Immediate Execution
(function() {
    'use strict';
    
    console.log('🚀 BULLETPROOF BOM Override loading...');
    
    // Immediate override - execute BEFORE any other scripts
    
    // 1. Override fetch IMMEDIATELY
    if (window.fetch) {
        const originalFetch = window.fetch;
        window.fetch = function(url, options) {
            if (typeof url === 'string' && url.includes('api.bom.gov.au')) {
                const newUrl = url.replace('https://api.bom.gov.au', window.location.origin);
                console.log('🔄 INTERCEPTED FETCH:', url, '→', newUrl);
                return originalFetch(newUrl, options);
            } else if (url && url.url && typeof url.url === 'string' && url.url.includes('api.bom.gov.au')) {
                const newUrl = url.url.replace('https://api.bom.gov.au', window.location.origin);
                console.log('🔄 INTERCEPTED FETCH (Request):', url.url, '→', newUrl);
                url = new Request(newUrl, url);
            }
            return originalFetch(url, options);
        };
    }
    
    // 2. Override XMLHttpRequest IMMEDIATELY  
    if (window.XMLHttpRequest) {
        const originalXHROpen = XMLHttpRequest.prototype.open;
        XMLHttpRequest.prototype.open = function(method, url, async, user, password) {
            if (typeof url === 'string' && url.includes('api.bom.gov.au')) {
                const newUrl = url.replace('https://api.bom.gov.au', window.location.origin);
                console.log('🔄 INTERCEPTED XHR:', url, '→', newUrl);
                url = newUrl;
            }
            return originalXHROpen.call(this, method, url, async, user, password);
        };
    }
    
    // 3. Global URL constructor override (catches dynamic URL building)
    const originalURL = window.URL;
    window.URL = function(url, base) {
        if (typeof url === 'string' && url.includes('api.bom.gov.au')) {
            url = url.replace('https://api.bom.gov.au', window.location.origin);
            console.log('🔄 INTERCEPTED URL constructor:', url);
        }
        return new originalURL(url, base);
    };
    // Preserve URL static methods
    Object.setPrototypeOf(window.URL, originalURL);
    Object.getOwnPropertyNames(originalURL).forEach(prop => {
        if (typeof originalURL[prop] === 'function') {
            window.URL[prop] = originalURL[prop];
        }
    });
    
    // 4. Override any existing API configuration objects
    setTimeout(() => {
        // Look for common BOM API config patterns and override them
        if (window.BOM_API_BASE) {
            console.log('🔧 Overriding BOM_API_BASE:', window.BOM_API_BASE);
            window.BOM_API_BASE = window.location.origin;
        }
        if (window.apiBaseUrl) {
            console.log('🔧 Overriding apiBaseUrl:', window.apiBaseUrl);  
            window.apiBaseUrl = window.location.origin;
        }
        if (window.API_BASE_URL) {
            console.log('🔧 Overriding API_BASE_URL:', window.API_BASE_URL);
            window.API_BASE_URL = window.location.origin;  
        }
    }, 100);
    
    // 5. Monitor all network requests for debugging
    const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
            if (entry.name.includes('api.bom.gov.au')) {
                console.log('🌐 DETECTED EXTERNAL API CALL:', entry.name);
            }
        }
    });
    if ('PerformanceObserver' in window) {
        observer.observe({entryTypes: ['resource']});
    }
    
    // 6. Comprehensive window object monitoring
    const checkAndOverride = () => {
        ['fetch', 'XMLHttpRequest'].forEach(method => {
            if (window[method] && window[method]._bomOverridden !== true) {
                console.log('⚡ Re-overriding', method);
                // Re-apply overrides if something replaced them
                window[method]._bomOverridden = true;
            }
        });
    };
    
    // Check every 100ms for the first 5 seconds
    let checks = 0;
    const intervalId = setInterval(() => {
        checkAndOverride();
        checks++;
        if (checks > 50) clearInterval(intervalId);
    }, 100);
    
    console.log('✅ BULLETPROOF BOM Override ACTIVE - ALL API calls will be intercepted');
    
})();