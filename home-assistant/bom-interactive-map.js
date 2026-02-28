/**
 * BOM Interactive Map Card for Home Assistant
 * Embeds the BOM Interactive Proxy for full weather map functionality
 */

class BOMInteractiveMap extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  setConfig(config) {
    if (!config.proxy_url) {
      throw new Error('proxy_url is required');
    }
    
    this.config = {
      proxy_url: config.proxy_url,
      location: config.location || 'ashburton',
      state: config.state || 'vic', 
      bom_path: config.bom_path || 'australia/victoria/central/o2594692629-ashburton',
      height: config.height || '400px',
      title: config.title || '',
      ...config
    };
    
    this.render();
  }

  render() {
    // Build the map URL with parameters
    const mapUrl = new URL('/map', this.config.proxy_url);
    mapUrl.searchParams.set('location', this.config.location);
    mapUrl.searchParams.set('state', this.config.state);
    mapUrl.searchParams.set('path', this.config.bom_path);

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          width: 100%;
        }
        
        .card-container {
          background: var(--card-background-color, #fff);
          border-radius: 8px;
          box-shadow: var(--ha-card-box-shadow, 0 2px 8px rgba(0,0,0,0.1));
          overflow: hidden;
          position: relative;
        }
        
        .card-header {
          padding: 16px 16px 0 16px;
          font-size: 18px;
          font-weight: 500;
          color: var(--primary-text-color);
        }
        
        .map-wrapper {
          position: relative;
          width: 100%;
          height: ${this.config.height};
          background: #000;
        }
        
        .map-frame {
          width: 100%;
          height: 100%;
          border: none;
          display: block;
        }
        
        .loading-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 14px;
          z-index: 10;
          transition: opacity 0.3s ease;
        }
        
        .loading-overlay.hidden {
          opacity: 0;
          pointer-events: none;
        }
        
        .loading-spinner {
          width: 32px;
          height: 32px;
          border: 3px solid #333;
          border-top: 3px solid #0080ff;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-right: 12px;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .error-message {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: rgba(220, 53, 69, 0.9);
          color: white;
          padding: 16px;
          border-radius: 8px;
          text-align: center;
          max-width: 280px;
          z-index: 20;
        }
        
        .retry-button {
          margin-top: 12px;
          padding: 8px 16px;
          background: rgba(255, 255, 255, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 4px;
          color: white;
          cursor: pointer;
          font-size: 12px;
        }
        
        .retry-button:hover {
          background: rgba(255, 255, 255, 0.3);
        }
      </style>
      
      <div class="card-container">
        ${this.config.title ? `<div class="card-header">${this.config.title}</div>` : ''}
        
        <div class="map-wrapper">
          <iframe 
            id="mapFrame"
            class="map-frame"
            src="${mapUrl.toString()}"
            loading="lazy"
            sandbox="allow-scripts allow-same-origin allow-forms"
            referrerpolicy="no-referrer-when-downgrade">
          </iframe>
          
          <div id="loadingOverlay" class="loading-overlay">
            <div class="loading-spinner"></div>
            <span>Loading Interactive Weather Map...</span>
          </div>
          
          <div id="errorMessage" class="error-message" style="display: none;">
            <div>🌧️ Unable to Load Weather Map</div>
            <div style="font-size: 12px; margin-top: 8px; opacity: 0.9;">
              Check proxy connection: ${this.config.proxy_url}
            </div>
            <button class="retry-button" onclick="this.parentElement.parentElement.querySelector('iframe').contentWindow.location.reload()">
              Retry
            </button>
          </div>
        </div>
      </div>
    `;

    this.setupEventHandlers();
  }

  setupEventHandlers() {
    const frame = this.shadowRoot.getElementById('mapFrame');
    const loading = this.shadowRoot.getElementById('loadingOverlay');
    const error = this.shadowRoot.getElementById('errorMessage');

    // Handle frame load success
    frame.addEventListener('load', () => {
      console.log('BOM Interactive Map loaded successfully');
      loading.classList.add('hidden');
      setTimeout(() => loading.style.display = 'none', 300);
    });

    // Handle frame errors
    frame.addEventListener('error', () => {
      console.error('Failed to load BOM Interactive Map');
      loading.style.display = 'none';
      error.style.display = 'block';
    });

    // Timeout handling
    setTimeout(() => {
      if (!loading.classList.contains('hidden')) {
        console.warn('Map loading timeout');
        loading.style.display = 'none';
        error.style.display = 'block';
        error.querySelector('div').textContent = '⏱️ Map Loading Timeout';
      }
    }, 15000); // 15 second timeout
  }

  // Home Assistant integration methods
  getCardSize() {
    return Math.ceil(parseInt(this.config.height) / 50) || 8;
  }

  static getStubConfig() {
    return {
      proxy_url: 'http://192.168.1.100:8083',
      location: 'ashburton',
      state: 'vic',
      height: '400px',
      title: 'Weather Radar'
    };
  }
}

// Register the custom element
if (!customElements.get('bom-interactive-map')) {
  customElements.define('bom-interactive-map', BOMInteractiveMap);
  console.info(
    '%c BOM-INTERACTIVE-MAP %c v1.0.0 ',
    'color: orange; font-weight: bold; background: black',
    'color: white; font-weight: bold; background: dimgray'
  );
}

// Add to custom cards registry
window.customCards = window.customCards || [];
window.customCards.push({
  type: 'bom-interactive-map',
  name: 'BOM Interactive Map',
  description: 'Interactive Australian Bureau of Meteorology weather maps',
  preview: true
});