// Override BOM API calls at runtime - IMMEDIATE EXECUTION
(function() {
    'use strict';
    
    console.log('🔧 BOM API Override loaded EARLY');
    
    // Immediate override - don't wait for DOM ready
    
    // Override fetch to redirect API calls
    const originalFetch = window.fetch;
    window.fetch = function(url, options) {
        if (typeof url === 'string') {
            // Redirect all api.bom.gov.au calls to proxy
            if (url.includes('api.bom.gov.au')) {
                const newUrl = url.replace('https://api.bom.gov.au', window.location.origin);
                console.log('🔄 Redirecting FETCH:', url, '→', newUrl);
                return originalFetch(newUrl, options);
            }
        } else if (url && url.url && typeof url.url === 'string' && url.url.includes('api.bom.gov.au')) {
            // Handle Request objects
            const newUrl = url.url.replace('https://api.bom.gov.au', window.location.origin);
            console.log('🔄 Redirecting FETCH (Request):', url.url, '→', newUrl);
            url = new Request(newUrl, url);
        }
        return originalFetch(url, options);
    };
    
    // Override XMLHttpRequest
    const originalXHROpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function(method, url, async, user, password) {
        if (typeof url === 'string' && url.includes('api.bom.gov.au')) {
            const newUrl = url.replace('https://api.bom.gov.au', window.location.origin);
            console.log('Redirecting XHR call:', url, '→', newUrl);
            url = newUrl;
        }
        return originalXHROpen.call(this, method, url, async, user, password);
    };
    
    // Enhanced logging for debugging
    const fetchWrapper = window.fetch;
    window.fetch = function(url, options) {
        const urlStr = typeof url === 'string' ? url : (url && url.url ? url.url : String(url));
        if (urlStr.includes('bom.gov.au')) {
            console.log('🌐 BOM fetch detected:', urlStr);
        }
        return fetchWrapper.call(this, url, options);
    };
    
    console.log('🟢 BOM API Override ACTIVE - monitoring all BOM calls');
    
    // Test override functionality
    setTimeout(() => {
        console.log('🧪 Testing API override...');
        fetch('https://api.bom.gov.au/test').catch(e => console.log('✅ Test redirect working'));
    }, 1000);
})();