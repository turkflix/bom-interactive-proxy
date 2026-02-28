// Override BOM API calls at runtime
(function() {
    'use strict';
    
    console.log('BOM API Override loaded');
    
    // Override fetch to redirect API calls
    const originalFetch = window.fetch;
    window.fetch = function(url, options) {
        if (typeof url === 'string') {
            // Redirect all api.bom.gov.au calls to proxy
            if (url.includes('api.bom.gov.au')) {
                const newUrl = url.replace('https://api.bom.gov.au', window.location.origin);
                console.log('Redirecting API call:', url, '→', newUrl);
                return originalFetch(newUrl, options);
            }
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
    
    console.log('BOM API Override active - all api.bom.gov.au calls will be redirected');
})();