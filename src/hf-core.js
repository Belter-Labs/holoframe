/**
 * Holoframe - Universal OpenSea URL Version
 */

(function() {
  'use strict';
  
  const WORKER_API_URL = 'https://holoframe-api.soft-flower-d4fe.workers.dev';
  const MODEL_VIEWER_URL = 'https://ajax.googleapis.com/ajax/libs/model-viewer/4.0.0/model-viewer.min.js';
  const QRCODE_URL = 'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js';
  const FONT_URL = 'https://fonts.googleapis.com/css2?family=Quattrocento+Sans:wght@400;700&display=swap';
  
  const chains = {
    matic: 'polygon',
    arbitrum_nova: 'arbitrum-nova',
    arbitrum_one: 'arbitrum',
    ape_chain: 'apechain',
    bera_chain: 'berachain'
  };

  let dependenciesLoaded = false;
  let instanceCounter = 0;

  // Load dependencies (shared across all instances)
  function loadDependencies(callback) {
    if (dependenciesLoaded) {
      callback();
      return;
    }

    // Load Font
    if (!document.querySelector(`link[href*="Quattrocento+Sans"]`)) {
      const fontLink = document.createElement('link');
      fontLink.rel = 'stylesheet';
      fontLink.href = FONT_URL;
      document.head.appendChild(fontLink);
    }

    // Load Model Viewer
    if (!window.customElements || !window.customElements.get('model-viewer')) {
      const modelViewerScript = document.createElement('script');
      modelViewerScript.type = 'module';
      modelViewerScript.src = MODEL_VIEWER_URL;
      document.head.appendChild(modelViewerScript);
    }

    // Load QRCode
    if (!window.QRCode) {
      const qrcodeScript = document.createElement('script');
      qrcodeScript.src = QRCODE_URL;
      document.head.appendChild(qrcodeScript);
    }

    // Wait for dependencies
    const checkDeps = setInterval(() => {
      if (window.customElements && window.customElements.get('model-viewer') && window.QRCode) {
        clearInterval(checkDeps);
        dependenciesLoaded = true;
        callback();
      }
    }, 100);
  }

  // Create widget instance
  function createInstance(config) {
    const instanceId = instanceCounter++;
    const modalId = `hfwModal-${instanceId}`;
    
    const instance = {
      id: instanceId,
      config: config,
      nftData: { id: null, img: null, name: null, collection: null, contract: null, chain: null },
      materialProps: { metalness: 0.5, roughness: 0.5, color: '#ffffff' },
      currentModelUrl: 'https://res.cloudinary.com/dfxigf84x/image/upload/v1682424956/Modern%20Frames/bfxepvl58yt5oiu9sgy1.glb',
      modalId: modalId
    };

    // Parse config
    const _urlParams = new URLSearchParams(window.location.search);
    const brandColor = config.brandColor || '#00a6fb';
    const displayMode = config.displayMode || 'button-input';
    const theme = config.theme || 'light';
    const buttonAlign = config.buttonAlign || 'center';
    const buttonPadding = config.buttonPadding !== undefined ? config.buttonPadding : 20;
    const triggerClass = config.triggerClass || null;
    const containerId = config.containerId || 'hf-widget';
    const isMobileAR = _urlParams.get('mobile') === '1';
    
    const isDark = theme === 'dark';
    const colors = {
      bg: isDark ? '#1f2937' : '#ffffff',
      text: isDark ? '#f9fafb' : '#1f2937',
      border: isDark ? '#374151' : '#d1d5db',
      inputBg: isDark ? '#111827' : '#ffffff',
      placeholder: isDark ? '#6b7280' : '#9ca3af',
      success: '#10b981',
      error: '#ef4444',
      modalBg: isDark ? 'rgba(0, 0, 0, 0.9)' : 'rgba(0, 0, 0, 0.8)',
      cardBg: isDark ? '#1f2937' : '#fcfcfc',
      viewerBg: isDark ? '#111827' : '#ffffff'
    };

    instance.colors = colors;
    instance.brandColor = brandColor;
    instance.displayMode = displayMode;
    instance.theme = theme;
    instance.buttonAlign = buttonAlign;
    instance.buttonPadding = buttonPadding;
    instance.triggerClass = triggerClass;
    instance.containerId = containerId;
    instance.isMobileAR = isMobileAR;
    instance.isDark = isDark;

    // Inject instance-specific CSS
    injectCSS(instance);

    // Render widget
    renderWidget(instance);

    // Check mobile params
    checkMobileParams(instance);

    return instance;
  }

  // Helper: Adjust brightness
  function adjustBrightness(hex, percent) {
    const num = parseInt(hex.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.min(255, Math.max(0, (num >> 16) + amt));
    const G = Math.min(255, Math.max(0, (num >> 8 & 0x00FF) + amt));
    const B = Math.min(255, Math.max(0, (num & 0x0000FF) + amt));
    return '#' + (0x1000000 + (R << 16) + (G << 8) + B).toString(16).slice(1);
  }

  // Helper: Hex to RGB
  function hex2rgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [
      parseInt(result[1], 16) / 255,
      parseInt(result[2], 16) / 255,
      parseInt(result[3], 16) / 255,
      1
    ] : [1, 1, 1, 1];
  }

  // Parse OpenSea URL
  function parseOpenSeaUrl(url) {
    try {
      const match = url.match(/opensea\.io\/(?:assets|item)\/([^\/]+)\/([^\/]+)\/([^\/\?]+)/i);
      if (!match) {
        throw new Error('Invalid OpenSea URL format');
      }
      return {
        chain: match[1],
        contract: match[2],
        tokenId: match[3]
      };
    } catch (error) {
      throw new Error('Please enter a valid OpenSea URL');
    }
  }

  // Inject CSS for instance
  function injectCSS(instance) {
    const { brandColor, colors, displayMode, buttonAlign, buttonPadding, isDark, id } = instance;
    const brandColorHover = adjustBrightness(brandColor, -10);
    
    const css = `
      .hfw-widget-container-${id} {
        font-family: 'Quattrocento Sans', sans-serif;
        max-width: ${displayMode === 'embed' ? '100%' : (displayMode === 'button-only' || displayMode === 'button-input') ? '400px' : '600px'};
        margin: 0 ${(displayMode === 'button-only' || displayMode === 'button-input') && buttonAlign === 'left' ? '0 auto 0' : (displayMode === 'button-only' || displayMode === 'button-input') && buttonAlign === 'right' ? 'auto 0 0' : 'auto'};
        padding: ${buttonPadding}px;
        background: ${displayMode === 'embed' ? colors.bg : 'transparent'};
        border-radius: ${displayMode === 'embed' ? '12px' : '0'};
      }

      .hfw-button-${id} {
        padding: 12px 24px;
        font-size: 1.125rem;
        background: ${brandColor};
        color: white;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-weight: 400;
        transition: all 0.2s;
        font-family: 'Quattrocento Sans', sans-serif;
        width: 100%;
      }

      .hfw-button-${id}:disabled {
        background: ${colors.border};
        cursor: not-allowed;
      }

      .hfw-button-${id}:not(:disabled):hover {
        background: ${brandColorHover};
      }

      .hfw-modal-${id} {
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: ${colors.modalBg};
        z-index: ${9999 + id};
        align-items: center;
        justify-content: center;
        backdrop-filter: blur(4px);
      }

      .hfw-modal-${id}.active {
        display: flex;
      }
    `;

    const styleEl = document.createElement('style');
    styleEl.textContent = css;
    styleEl.id = `hfw-style-${id}`;
    document.head.appendChild(styleEl);
  }

  // Inject shared CSS (once)
  function injectSharedCSS() {
    if (document.getElementById('hfw-shared-style')) return;

    const css = `
      :root {
        --hfw-font: 'Quattrocento Sans', sans-serif;
        --hfw-radius: 8px;
        --hfw-spacing: 20px;
      }

      .hfw-input {
        padding: 12px;
        font-size: 0.95rem;
        border: 2px solid #d1d5db;
        border-radius: var(--hfw-radius);
        background: #ffffff;
        color: #1f2937;
        font-family: var(--hfw-font);
        width: 100%;
        box-sizing: border-box;
      }

      .hfw-input:focus {
        outline: none;
        border-color: currentColor;
        box-shadow: 0 0 0 3px rgba(0, 166, 251, 0.2);
      }

      .hfw-input-section {
        display: flex;
        flex-direction: column;
        gap: 15px;
        margin-bottom: 30px;
      }

      .hfw-modal-content {
        background: #fcfcfc;
        border-radius: 12px;
        width: 90%;
        max-width: 900px;
        max-height: 90vh;
        overflow-y: auto;
        padding: 30px 40px;
        position: relative;
        box-shadow: 0 20px 60px rgba(0,0,0,0.5);
      }

      .hfw-modal-close {
        position: absolute;
        top: 15px;
        right: 15px;
        background: transparent;
        color: #1f2937;
        border: none;
        width: 32px;
        height: 32px;
        cursor: pointer;
        font-size: 1.8rem;
        line-height: 1;
        z-index: 10;
        font-weight: 300;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .hfw-modal-close:hover {
        color: #ef4444;
      }

      .hfw-title {
        font-size: 1.25rem;
        font-weight: 700;
        margin-bottom: 0.5rem;
        margin-top: 0;
        color: #1f2937;
        text-align: center;
        font-family: var(--hfw-font);
      }

      .hfw-subtitle {
        font-size: 0.9rem;
        color: #6b7280;
        margin-bottom: 1.5rem;
        text-align: center;
        font-family: var(--hfw-font);
      }

      .hfw-controls-container {
        display: flex;
        gap: 30px;
        margin-bottom: 20px;
        margin-top: 30px;
        align-items: flex-start;
      }

      .hfw-controls-left {
        flex: 1;
        min-width: 0;
      }

      .hfw-qr-right {
        flex: 0 0 200px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
      }

      .hfw-slider-group {
        display: flex;
        align-items: center;
        margin: 12px 0;
      }

      .hfw-slider-group label {
        flex: 0 0 100px;
        font-size: 0.95rem;
        color: #1f2937;
        font-weight: 500;
        font-family: var(--hfw-font);
      }

      .hfw-slider-container {
        flex-grow: 1;
        padding: 0 10px;
      }

      .hfw-slider-value {
        flex: 0 0 35px;
        text-align: right;
        font-weight: 600;
        font-size: 0.9rem;
        color: #1f2937;
        font-family: var(--hfw-font);
      }

      .hfw-color-wrapper {
        display: flex;
        gap: 10px;
        align-items: center;
        flex-grow: 1;
      }

      .hfw-color-picker {
        width: 60px;
        height: 42px;
        border-radius: 6px;
        cursor: pointer;
        border: 1px solid #d1d5db;
      }

      .hfw-color-hex {
        flex-grow: 1;
        padding: 10px;
        border: 1px solid #d1d5db;
        border-radius: 6px;
        background: #f9fafb;
        color: #1f2937;
        font-family: var(--hfw-font);
      }

      .hfw-select {
        width: 100%;
        padding: 10px;
        font-size: 0.9rem;
        border: 1px solid #d1d5db;
        border-radius: 6px;
        background: #ffffff;
        color: #1f2937;
        font-family: var(--hfw-font);
        cursor: pointer;
      }

      .hfw-range {
        -webkit-appearance: none;
        width: 100%;
        height: 6px;
        background: #d1d5db;
        border-radius: 3px;
        margin: 0;
        cursor: pointer;
      }

      .hfw-range::-webkit-slider-thumb {
        -webkit-appearance: none;
        width: 18px;
        height: 18px;
        border-radius: 50%;
        background: #00a6fb;
        cursor: pointer;
      }

      .hfw-range::-moz-range-thumb {
        width: 18px;
        height: 18px;
        border-radius: 50%;
        background: #00a6fb;
        cursor: pointer;
        border: none;
      }

      .hfw-model-viewer {
        width: 100%;
        height: 400px;
        background-color: #ffffff;
        border-radius: var(--hfw-radius);
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        margin-top: 0;
      }

      .hfw-model-viewer::part(default-ar-button) {
        display: none;
      }

      .hfw-ar-button {
        width: 100%;
        padding: 14px 24px;
        font-size: 1rem;
        background: #00a6fb;
        color: white;
        border: none;
        border-radius: var(--hfw-radius);
        cursor: pointer;
        font-weight: 600;
        font-family: var(--hfw-font);
        margin-top: 20px;
        transition: all 0.2s;
        display: none;
      }

      .hfw-ar-button.show {
        display: block;
      }

      .hfw-qr-container {
        margin-top: 0;
        padding: 15px;
        border: 2px dashed #00a6fb;
        border-radius: var(--hfw-radius);
        display: none;
        background: rgba(0, 166, 251, 0.1);
        text-align: center;
      }

      .hfw-qr-container p {
        font-size: 0.85rem;
        margin: 0 0 10px 0;
        color: #6b7280;
        font-family: var(--hfw-font);
      }

      .hfw-qr-code {
        display: flex;
        justify-content: center;
        align-items: center;
        margin: 0 auto;
        padding: 10px;
        background: white;
        border-radius: var(--hfw-radius);
        width: fit-content;
        box-shadow: 0 2px 8px rgba(0,0,0,0.08);
      }

      .hfw-status {
        font-size: 0.9rem;
        margin-top: 1rem;
        min-height: 20px;
        text-align: center;
        color: #1f2937;
        font-family: var(--hfw-font);
      }

      .hfw-error {
        color: #ef4444;
        font-weight: 500;
      }

      .hfw-success {
        color: #10b981;
        font-weight: 500;
      }

      .hfw-powered {
        font-size: 0.75rem;
        text-align: center;
        color: #9ca3af;
        margin-top: 1rem;
        font-family: var(--hfw-font);
      }

      .hfw-powered a {
        color: #00a6fb;
        text-decoration: none;
        font-weight: 500;
        transition: opacity 0.2s;
      }

      .hfw-powered a:hover {
        opacity: 0.8;
        text-decoration: underline;
      }

      @media (max-width: 768px) {
        .hfw-modal-content {
          width: 95%;
          padding: 20px;
        }

        .hfw-controls-container {
          flex-direction: column;
          gap: 20px;
        }

        .hfw-qr-right {
          flex: 1;
          width: 100%;
        }

        .hfw-model-viewer {
          height: 300px;
        }
        
        .hfw-slider-group {
          margin: 15px 0;
        }
        
        .hfw-slider-group label {
          flex: 0 0 80px;
          font-size: 0.85rem;
        }
        
        .hfw-slider-container {
          flex: 1;
          min-width: 0;
          padding: 0 8px;
        }
        
        .hfw-slider-value {
          flex: 0 0 40px;
          font-size: 0.85rem;
        }
        
        .hfw-color-wrapper {
          flex-wrap: wrap;
          gap: 8px;
        }
        
        .hfw-color-picker {
          width: 50px;
          height: 40px;
        }
        
        body.hfw-mobile-ar .hfw-controls-container {
          display: none;
        }
        
        body.hfw-mobile-ar .hfw-title {
          font-size: 1.1rem;
        }
        
        body.hfw-mobile-ar .hfw-subtitle {
          display: none;
        }
      }
    `;

    const styleEl = document.createElement('style');
    styleEl.textContent = css;
    styleEl.id = 'hfw-shared-style';
    document.head.appendChild(styleEl);
  }

  function renderWidget(instance) {
    const { containerId, displayMode, triggerClass, id, modalId, isMobileAR } = instance;
    
    // Setup custom triggers if specified
    if (triggerClass) {
      setupCustomTriggers(instance);
      renderModalOnly(instance);
      initializeControls(instance);
      return;
    }

    const container = document.getElementById(containerId);
    if (!container) return;

    if (displayMode === 'button-only') {
      container.innerHTML = `
        <div class="hfw-widget-container-${id}">
          <button class="hfw-button-${id}" id="hfwOpenModal-${id}">View NFT in AR</button>
        </div>
        ${renderModal(instance, true)}
      `;
      document.getElementById(`hfwOpenModal-${id}`).addEventListener('click', () => openModal(instance));
    } else if (displayMode === 'button-input') {
      container.innerHTML = `
        <div class="hfw-widget-container-${id}">
          <div class="hfw-input-section">
            <input 
              type="text" 
              id="hfwTokenInput-${id}" 
              class="hfw-input" 
              placeholder="Paste OpenSea URL (e.g. opensea.io/assets/...)"
            />
            <button class="hfw-button-${id}" id="hfwLoadButton-${id}" disabled>View in AR</button>
          </div>
        </div>
        ${renderModal(instance, false)}
      `;
      setupInputButton(instance, `hfwTokenInput-${id}`, `hfwLoadButton-${id}`, (url) => openModal(instance, url));
    } else {
      // embed mode
      container.innerHTML = `
        <div class="hfw-widget-container-${id}">
          <h2 style="font-size: 1.5rem; font-weight: 700; margin: 0 0 1.5rem 0; text-align: center;">See Your NFT in Augmented Reality</h2>
          ${!isMobileAR ? `
          <div class="hfw-input-section">
            <input 
              type="text" 
              id="hfwTokenInput-${id}" 
              class="hfw-input" 
              placeholder="Paste OpenSea URL"
            />
            <button class="hfw-button-${id}" id="hfwEmbedLoadButton-${id}" disabled>Load NFT</button>
          </div>
          ` : ''}
          ${renderViewer(instance)}
        </div>
      `;
      
      if (!isMobileAR) {
        setupInputButton(instance, `hfwTokenInput-${id}`, `hfwEmbedLoadButton-${id}`, (url) => loadNFTFromUrl(instance, url));
      }
    }

    initializeControls(instance);
  }

  function renderModalOnly(instance) {
    const modalDiv = document.createElement('div');
    modalDiv.innerHTML = renderModal(instance, true);
    document.body.appendChild(modalDiv);
    initializeControls(instance);
  }

  function setupCustomTriggers(instance) {
    const { triggerClass } = instance;
    if (!triggerClass) return;
    
    const triggers = document.querySelectorAll('.' + triggerClass);
    
    triggers.forEach(trigger => {
      trigger.addEventListener('click', (e) => {
        e.preventDefault();
        openModal(instance);
      });
    });
    
    console.log(`Holoframe instance ${instance.id}: ${triggers.length} trigger(s) found with class "${triggerClass}"`);
  }

  function setupInputButton(instance, inputId, buttonId, onSubmit) {
    const input = document.getElementById(inputId);
    const button = document.getElementById(buttonId);
    if (!input || !button) return;
    
    input.addEventListener('input', () => {
      button.disabled = !input.value.trim();
    });
    
    button.addEventListener('click', () => {
      if (input.value.trim()) onSubmit(input.value.trim());
    });
    
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && input.value.trim()) onSubmit(input.value.trim());
    });
  }

  function renderModal(instance, includeInput) {
    const { modalId, id, isMobileAR } = instance;
    
    return `
      <div id="${modalId}" class="hfw-modal-${id}">
        <div class="hfw-modal-content">
          <button class="hfw-modal-close" onclick="window.closeHFWidget_${id}()">×</button>
          <p class="hfw-title">View Your NFT in AR</p>
          <p class="hfw-subtitle">Paste an OpenSea URL, customize your frame and scan the QR code to view in augmented reality</p>
          
          ${includeInput && !isMobileAR ? `
          <div class="hfw-input-section" style="margin-bottom: 40px;">
            <input 
              type="text" 
              id="hfwModalTokenInput-${id}" 
              class="hfw-input" 
              placeholder="Paste OpenSea URL (e.g. opensea.io/assets/...)"
            />
            <button class="hfw-button-${id}" id="hfwModalLoadButton-${id}" disabled style="margin-top: 10px;">Load NFT</button>
          </div>
          ` : ''}
          
          ${renderViewer(instance)}
        </div>
      </div>
    `;
  }

  function renderViewer(instance) {
    const { id, currentModelUrl } = instance;
    
    return `
      <div class="hfw-controls-container">
        <div class="hfw-controls-left">
          <div class="hfw-slider-group">
            <label>Shape</label>
            <div style="flex-grow: 1;">
              <select id="hfwShapeSelect-${id}" class="hfw-select">
                <option value="https://res.cloudinary.com/dfxigf84x/image/upload/v1682424956/Modern%20Frames/bfxepvl58yt5oiu9sgy1.glb" selected>Squircle</option>
                <option value="https://res.cloudinary.com/dfxigf84x/image/upload/v1680441036/Modern%20Frames/v73lrdjdqelbespeswlb.glb">Circle</option>
                <option value="https://res.cloudinary.com/dfxigf84x/image/upload/v1693077849/Modern%20Frames/ydqco8ntbfzkgglj5dzl.glb">Hexagon</option>
                <option value="https://res.cloudinary.com/dfxigf84x/image/upload/v1693077924/Modern%20Frames/feyzozyt3zhlibewphcc.glb">Square</option>
              </select>
            </div>
          </div>

          <div class="hfw-slider-group">
            <label>Color</label>
            <div class="hfw-color-wrapper">
              <input type="color" id="hfwColorPicker-${id}" value="#ffffff" class="hfw-color-picker">
              <input type="text" id="hfwColorHex-${id}" value="#ffffff" readonly class="hfw-color-hex">
            </div>
          </div>

          <div class="hfw-slider-group">
            <label>Metalness</label>
            <div class="hfw-slider-container">
              <input type="range" id="hfwMetalness-${id}" min="0" max="100" value="50" class="hfw-range">
            </div>
            <span id="hfwMetalnessValue-${id}" class="hfw-slider-value">0.50</span>
          </div>

          <div class="hfw-slider-group">
            <label>Roughness</label>
            <div class="hfw-slider-container">
              <input type="range" id="hfwRoughness-${id}" min="0" max="100" value="50" class="hfw-range">
            </div>
            <span id="hfwRoughnessValue-${id}" class="hfw-slider-value">0.50</span>
          </div>
        </div>

        <div class="hfw-qr-right">
          <div id="hfwQrContainer-${id}" class="hfw-qr-container">
            <p>Scan to view in AR</p>
            <div id="hfwQrCode-${id}" class="hfw-qr-code"></div>
          </div>
        </div>
      </div>

      <model-viewer
        id="hfwModelViewer-${id}"
        class="hfw-model-viewer"
        src="${currentModelUrl}"
        alt="NFT in a 3D Frame"
        shadow-intensity="1"
        camera-controls
        auto-rotate
        ar
        ar-modes="webxr scene-viewer quick-look"
        exposure="1.2"
        disable-zoom
      ></model-viewer>
      
      <button id="hfwArButton-${id}" class="hfw-ar-button">View in AR</button>
      
      <p id="hfwStatus-${id}" class="hfw-status">Paste an OpenSea URL to load your NFT</p>
      <p class="hfw-powered">Powered by <a href="https://holoframe.io" target="_blank" rel="noopener">Holoframe</a></p>
    `;
  }

  function initializeControls(instance) {
    const { id } = instance;
    
    const colorPicker = document.getElementById(`hfwColorPicker-${id}`);
    const colorHex = document.getElementById(`hfwColorHex-${id}`);
    const metalness = document.getElementById(`hfwMetalness-${id}`);
    const roughness = document.getElementById(`hfwRoughness-${id}`);
    const metalnessValue = document.getElementById(`hfwMetalnessValue-${id}`);
    const roughnessValue = document.getElementById(`hfwRoughnessValue-${id}`);
    const shapeSelect = document.getElementById(`hfwShapeSelect-${id}`);
    const modelViewer = document.getElementById(`hfwModelViewer-${id}`);
    const arButton = document.getElementById(`hfwArButton-${id}`);

    if (!modelViewer) return;

    // AR button handler
    if (arButton) {
      arButton.addEventListener('click', () => {
        try {
          modelViewer.activateAR();
        } catch (error) {
          console.error('AR activation error:', error);
        }
      });
    }

    // Show AR button on mobile
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (arButton && isMobile) {
      modelViewer.addEventListener('load', () => {
        if (instance.nftData.id) {
          arButton.classList.add('show');
        }
      }, { once: true });
    }
    
    // Hide QR on mobile
    if (isMobile) {
      const qrWrapper = document.getElementById(`hfwQrContainer-${id}`);
      if (qrWrapper) {
        qrWrapper.style.display = 'none';
      }
    }

    // Color picker
    if (colorPicker) {
      let colorTimeout;
      colorPicker.addEventListener('input', () => {
        colorHex.value = colorPicker.value;
        clearTimeout(colorTimeout);
        colorTimeout = setTimeout(() => {
          instance.materialProps.color = colorPicker.value;
          updateMaterials(instance);
          generateQR(instance);
        }, 150);
      });
    }

    // Sliders
    if (metalness) {
      let metalnessTimeout;
      metalness.addEventListener('input', () => {
        const val = Number(metalness.value) / 100;
        metalnessValue.textContent = val.toFixed(2);
        clearTimeout(metalnessTimeout);
        metalnessTimeout = setTimeout(() => {
          instance.materialProps.metalness = val;
          updateMaterials(instance);
          generateQR(instance);
        }, 150);
      });
    }

    if (roughness) {
      let roughnessTimeout;
      roughness.addEventListener('input', () => {
        const val = Number(roughness.value) / 100;
        roughnessValue.textContent = val.toFixed(2);
        clearTimeout(roughnessTimeout);
        roughnessTimeout = setTimeout(() => {
          instance.materialProps.roughness = val;
          updateMaterials(instance);
          generateQR(instance);
        }, 150);
      });
    }

    // Shape select
    if (shapeSelect) {
      shapeSelect.addEventListener('change', () => {
        instance.currentModelUrl = shapeSelect.value;
        modelViewer.src = instance.currentModelUrl;
        if (instance.nftData.img) {
          modelViewer.addEventListener('load', () => applyTexture(instance), { once: true });
        }
        generateQR(instance);
      });
    }

    // Model ready
    modelViewer.addEventListener('load', () => {
      if (instance.nftData.img) {
        applyTexture(instance);
      }
      updateMaterials(instance);
    });
  }

  function updateMaterials(instance) {
    const modelViewer = document.getElementById(`hfwModelViewer-${instance.id}`);
    if (!modelViewer || !modelViewer.model) return;

    const material = modelViewer.model.materials[0];
    if (!material) return;

    material.pbrMetallicRoughness.setMetallicFactor(instance.materialProps.metalness);
    material.pbrMetallicRoughness.setRoughnessFactor(instance.materialProps.roughness);
    material.pbrMetallicRoughness.setBaseColorFactor(hex2rgb(instance.materialProps.color));
  }

  async function applyTexture(instance) {
    const modelViewer = document.getElementById(`hfwModelViewer-${instance.id}`);
    if (!instance.nftData.img || !modelViewer || !modelViewer.model) return;

    try {
      const material = modelViewer.model.materials[1];
      if (!material) return;

      const texture = await modelViewer.createTexture(instance.nftData.img);
      material.pbrMetallicRoughness.baseColorTexture.setTexture(texture);
      material.emissiveTexture.setTexture(texture);
      material.pbrMetallicRoughness.setBaseColorFactor([1, 1, 1, 1]);
      
      setStatus(instance, `✅ Successfully loaded ${instance.nftData.name}!`, 'success');
      generateQR(instance);
      
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      const arButton = document.getElementById(`hfwArButton-${instance.id}`);
      if (arButton && isMobile) {
        arButton.classList.add('show');
      }
    } catch (error) {
      console.error('Texture error:', error);
      setStatus(instance, 'Error applying NFT texture', 'error');
    }
  }

  async function loadNFTFromUrl(instance, url) {
    try {
      const parsed = parseOpenSeaUrl(url);
      await loadNFT(instance, parsed.tokenId, parsed.contract, parsed.chain);
    } catch (error) {
      setStatus(instance, `Error: ${error.message}`, 'error');
    }
  }

  async function loadNFT(instance, tokenId, contract, chain) {
    if (!tokenId || !contract) {
      setStatus(instance, 'Invalid NFT data', 'error');
      return;
    }

    setStatus(instance, 'Loading NFT data...', '');
    
    const chainName = chains[chain] || chain;
    const url = `${WORKER_API_URL}?chain=${chainName}&contract=${contract}&tokenId=${tokenId}`;
    
    try {
      const response = await fetch(url);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP Error ${response.status}`);
      }

      const data = await response.json();
      const nft = data.nft;
      
      if (!nft || !nft.image_url) {
        throw new Error('Image URL not found');
      }

      instance.nftData = {
        id: tokenId,
        img: nft.display_image_url || nft.image_url,
        name: nft.name || `Token #${tokenId}`,
        collection: nft.collection || '',
        contract: contract,
        chain: chain
      };

      const modelViewer = document.getElementById(`hfwModelViewer-${instance.id}`);
      if (modelViewer && modelViewer.model) {
        await applyTexture(instance);
      } else {
        setStatus(instance, 'NFT data loaded. Waiting for 3D model...', '');
      }
    } catch (error) {
      console.error('Load NFT error:', error);
      setStatus(instance, `Error: ${error.message}`, 'error');
      instance.nftData = { id: null, img: null, name: null, collection: null, contract: null, chain: null };
    }
  }

  function generateQR(instance) {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (!instance.nftData.id || instance.isMobileAR || isMobile) return;

    const qrContainer = document.getElementById(`hfwQrCode-${instance.id}`);
    const qrWrapper = document.getElementById(`hfwQrContainer-${instance.id}`);
    if (!qrContainer || !qrWrapper || !window.QRCode) return;

    const baseUrl = window.location.href.split('?')[0].split('#')[0];
    const params = new URLSearchParams({
      tokenId: instance.nftData.id,
      collection: instance.nftData.collection,
      contract: instance.nftData.contract,
      chain: instance.nftData.chain,
      model: encodeURIComponent(instance.currentModelUrl),
      metalness: instance.materialProps.metalness.toFixed(1),
      roughness: instance.materialProps.roughness.toFixed(1),
      color: instance.materialProps.color.substring(1),
      mobile: '1'
    });

    const qrUrl = `${baseUrl}?${params.toString()}`;

    qrContainer.innerHTML = '';
    new QRCode(qrContainer, {
      text: qrUrl,
      width: 160,
      height: 160,
      colorDark: '#1f2937',
      colorLight: '#ffffff',
      correctLevel: QRCode.CorrectLevel.H
    });

    qrWrapper.style.display = 'block';
  }

  function openModal(instance, urlFromInput) {
    const modal = document.getElementById(instance.modalId);
    if (!modal) return;

    modal.classList.add('active');

    // Close on backdrop click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal(instance);
      }
    });

    // If URL provided from page input, load it
    if (urlFromInput) {
      setTimeout(() => loadNFTFromUrl(instance, urlFromInput), 100);
    }

    // Setup modal input and button
    setupInputButton(instance, `hfwModalTokenInput-${instance.id}`, `hfwModalLoadButton-${instance.id}`, (url) => loadNFTFromUrl(instance, url));
  }

  function closeModal(instance) {
    const modal = document.getElementById(instance.modalId);
    if (modal) {
      modal.classList.remove('active');
    }
  }

  function setStatus(instance, message, type = '') {
    const status = document.getElementById(`hfwStatus-${instance.id}`);
    if (!status) return;

    status.textContent = message;
    status.className = 'hfw-status';
    if (type === 'error') {
      status.classList.add('hfw-error');
    } else if (type === 'success') {
      status.classList.add('hfw-success');
    }
  }

  function checkMobileParams(instance) {
    const params = new URLSearchParams(window.location.search);
    if (params.get('mobile') === '1' && params.get('tokenId')) {
      document.body.classList.add('hfw-mobile-ar');
      
      const tokenId = params.get('tokenId');
      const contract = params.get('contract');
      const chain = params.get('chain');
      const modelUrl = params.get('model');
      const metal = params.get('metalness');
      const rough = params.get('roughness');
      const color = params.get('color');

      if (modelUrl) instance.currentModelUrl = decodeURIComponent(modelUrl);
      if (metal) instance.materialProps.metalness = parseFloat(metal);
      if (rough) instance.materialProps.roughness = parseFloat(rough);
      if (color) instance.materialProps.color = color.startsWith('#') ? color : '#' + color;

      setTimeout(() => {
        if (instance.displayMode !== 'embed') {
          const modal = document.getElementById(instance.modalId);
          if (modal) {
            modal.classList.add('active');
          }
        }
        
        const modelViewer = document.getElementById(`hfwModelViewer-${instance.id}`);
        if (modelViewer && modelUrl) {
          modelViewer.src = instance.currentModelUrl;
        }
        
        const shapeSelect = document.getElementById(`hfwShapeSelect-${instance.id}`);
        if (shapeSelect && modelUrl) {
          shapeSelect.value = instance.currentModelUrl;
        }
        
        const qrWrapper = document.getElementById(`hfwQrContainer-${instance.id}`);
        if (qrWrapper) {
          qrWrapper.style.display = 'none';
        }
        
        loadNFT(instance, tokenId, contract, chain);
      }, 500);
    }
  }

  // Initialize all instances
  function initAll() {
    injectSharedCSS();

    // Support old single-instance config (backward compatible)
    if (window.hfWidgetConfig && !window.hfWidgets) {
      window.hfWidgets = [window.hfWidgetConfig];
    }

    if (!window.hfWidgets || !Array.isArray(window.hfWidgets)) {
      console.error('Holoframe: No widget configs found. Set window.hfWidgets = [{config1}, {config2}, ...]');
      return;
    }

    loadDependencies(() => {
      window.hfWidgets.forEach((config, index) => {
        const instance = createInstance(config);
        
        // Expose close function globally for each instance
        window[`closeHFWidget_${instance.id}`] = () => closeModal(instance);
        
        console.log(`Holoframe: Instance ${instance.id} initialized (${config.displayMode || 'button-input'})`);
      });
    });
  }

  // Start
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }
})();