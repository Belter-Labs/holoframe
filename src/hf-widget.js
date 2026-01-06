/**
 * Holoframe - Embeddable Version
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

  // Get configuration from global variable OR URL params (for QR code scanning)
  const _urlParams = new URLSearchParams(window.location.search);
  const config = window.hfWidgetConfig || {};
  const collection = config.collection || _urlParams.get('collection') || '';
  const contract = config.contract || _urlParams.get('contract') || '';
  const chain = config.chain || _urlParams.get('chain') || 'ethereum';
  const brandColor = config.brandColor || '#00a6fb';
  const displayMode = config.displayMode || 'button-input';
  const theme = config.theme || 'light';
  const buttonAlign = config.buttonAlign || 'center'; // 'left', 'center', 'right' - for button-only and button-input
  const buttonPadding = config.buttonPadding !== undefined ? config.buttonPadding : 20; // Padding for page button container
  const isMobileAR = _urlParams.get('mobile') === '1';
  
  // Theme colors
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

  let nftData = { id: null, img: null, name: null };
  let materialProps = { metalness: 0.5, roughness: 0.5, color: '#ffffff' };
  let currentModelUrl = 'https://res.cloudinary.com/dfxigf84x/image/upload/v1682424956/Modern%20Frames/bfxepvl58yt5oiu9sgy1.glb';

  // Load dependencies
  function loadDependencies() {
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
  }

  // Inject CSS
  function injectCSS() {
    const brandColorHover = adjustBrightness(brandColor, -10);
    
    const css = `
      :root {
        --hfw-font: 'Quattrocento Sans', sans-serif;
        --hfw-brand-color: ${brandColor};
        --hfw-brand-hover: ${brandColorHover};
        --hfw-bg: ${colors.bg};
        --hfw-text: ${colors.text};
        --hfw-border: ${colors.border};
        --hfw-input-bg: ${colors.inputBg};
        --hfw-placeholder: ${colors.placeholder};
        --hfw-success: ${colors.success};
        --hfw-error: ${colors.error};
        --hfw-radius: 8px;
        --hfw-spacing: 20px;
      }

      .hfw-widget-container {
        font-family: var(--hfw-font);
        max-width: ${displayMode === 'embed' ? '100%' : (displayMode === 'button-only' || displayMode === 'button-input') ? '400px' : '600px'};
        margin: 0 ${(displayMode === 'button-only' || displayMode === 'button-input') && buttonAlign === 'left' ? '0 auto 0' : (displayMode === 'button-only' || displayMode === 'button-input') && buttonAlign === 'right' ? 'auto 0 0' : 'auto'};
        padding: ${buttonPadding}px;
        background: ${displayMode === 'embed' ? colors.bg : 'transparent'};
        border-radius: ${displayMode === 'embed' ? '12px' : '0'};
      }

      .hfw-embed-title {
        font-size: 1.5rem;
        font-weight: 700;
        color: var(--hfw-text);
        margin: 0 0 1.5rem 0;
        text-align: center;
        font-family: var(--hfw-font);
      }

      .hfw-input-section {
        display: flex;
        flex-direction: column;
        gap: 15px;
        margin-bottom: 30px;
      }

      .hfw-input {
        padding: 12px;
        font-size: 0.95rem;
        border: 2px solid var(--hfw-border);
        border-radius: var(--hfw-radius);
        background: var(--hfw-input-bg);
        color: var(--hfw-text);
        font-family: var(--hfw-font);
        width: 100%;
        box-sizing: border-box;
      }

      .hfw-input::placeholder {
        color: ${colors.placeholder};
      }

      .hfw-input:focus {
        outline: none;
        border-color: ${brandColor};
        box-shadow: 0 0 0 3px ${brandColor}20;
      }

      .hfw-button {
        padding: 12px 24px;
        font-size: 1.125rem;
        background: var(--hfw-brand-color);
        color: white;
        border: none;
        border-radius: var(--hfw-radius);
        cursor: pointer;
        font-weight: 600;
        transition: all 0.2s;
        font-family: var(--hfw-font);
        width: 100%;
      }

      .hfw-button:disabled {
        background: ${colors.border};
        cursor: not-allowed;
      }

      .hfw-button:not(:disabled):hover {
        background: var(--hfw-brand-hover);
      }

      .hfw-modal {
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: ${colors.modalBg};
        z-index: 9999;
        align-items: center;
        justify-content: center;
        backdrop-filter: blur(4px);
      }

      .hfw-modal.active {
        display: flex;
      }

      .hfw-modal-content {
        background: ${colors.cardBg};
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
        color: var(--hfw-text);
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
        color: ${colors.error};
      }

      .hfw-title {
        font-size: 1.25rem;
        font-weight: 700;
        margin-bottom: 0.5rem;
        margin-top: 0;
        color: var(--hfw-text);
        text-align: center;
        font-family: var(--hfw-font);
      }

      .hfw-subtitle {
        font-size: 0.9rem;
        color: ${isDark ? '#9ca3af' : '#6b7280'};
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
        color: var(--hfw-text);
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
        color: var(--hfw-text);
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
        border: 1px solid var(--hfw-border);
      }

      .hfw-color-hex {
        flex-grow: 1;
        padding: 10px;
        border: 1px solid var(--hfw-border);
        border-radius: 6px;
        background: ${isDark ? '#111827' : '#f9fafb'};
        color: var(--hfw-text);
        font-family: var(--hfw-font);
      }

      .hfw-select {
        width: 100%;
        padding: 10px;
        font-size: 0.9rem;
        border: 1px solid var(--hfw-border);
        border-radius: 6px;
        background: var(--hfw-input-bg);
        color: var(--hfw-text);
        font-family: var(--hfw-font);
        cursor: pointer;
      }

      .hfw-range {
        -webkit-appearance: none;
        width: 100%;
        height: 6px;
        background: ${colors.border};
        border-radius: 3px;
        margin: 0;
        cursor: pointer;
      }

      .hfw-range::-webkit-slider-thumb {
        -webkit-appearance: none;
        width: 18px;
        height: 18px;
        border-radius: 50%;
        background: var(--hfw-brand-color);
        cursor: pointer;
      }

      .hfw-range::-moz-range-thumb {
        width: 18px;
        height: 18px;
        border-radius: 50%;
        background: var(--hfw-brand-color);
        cursor: pointer;
        border: none;
      }

      .hfw-model-viewer {
        width: 100%;
        height: ${displayMode === 'embed' ? '300px' : '400px'};
        background-color: ${colors.viewerBg};
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
        background: var(--hfw-brand-color);
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

      .hfw-ar-button:hover {
        background: ${adjustBrightness(brandColor, -10)};
      }

      .hfw-qr-container {
        margin-top: 0;
        padding: 15px;
        border: 2px dashed ${brandColor};
        border-radius: var(--hfw-radius);
        display: none;
        background: ${brandColor}10;
        text-align: center;
      }

      .hfw-qr-container p {
        font-size: 0.85rem;
        margin: 0 0 10px 0;
        color: ${isDark ? '#9ca3af' : '#6b7280'};
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
        color: var(--hfw-text);
        font-family: var(--hfw-font);
      }

      .hfw-error {
        color: ${colors.error};
        font-weight: 500;
      }

      .hfw-success {
        color: ${colors.success};
        font-weight: 500;
      }

      .hfw-powered {
        font-size: 0.75rem;
        text-align: center;
        color: ${isDark ? '#6b7280' : '#9ca3af'};
        margin-top: 1rem;
        font-family: var(--hfw-font);
      }

      .hfw-powered a {
        color: var(--hfw-brand-color);
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
        
        .hfw-embed-title {
          font-size: 1.25rem;
        }
        
        .hfw-widget-container {
          padding: 15px;
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
    document.head.appendChild(styleEl);
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

  // Helper: Setup input and button event listeners
  function setupInputButton(inputId, buttonId, onSubmit) {
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

  // Render widget based on display mode
  function renderWidget() {
    const container = document.getElementById('hf-widget');
    if (!container) return;

    if (displayMode === 'button-only') {
      container.innerHTML = `
        <div class="hfw-widget-container">
          <button class="hfw-button" id="hfwOpenModal">View NFT in AR</button>
        </div>
        ${renderModal(true)}
      `;
      document.getElementById('hfwOpenModal').addEventListener('click', openModal);
    } else if (displayMode === 'button-input') {
      container.innerHTML = `
        <div class="hfw-widget-container">
          <div class="hfw-input-section">
            <input 
              type="text" 
              id="hfwTokenInput" 
              class="hfw-input" 
              placeholder="Enter Token ID (e.g. 1234)"
            />
            <button class="hfw-button" id="hfwLoadButton" disabled>View in AR</button>
          </div>
        </div>
        ${renderModal(false)}
      `;
      setupInputButton('hfwTokenInput', 'hfwLoadButton', openModal);
    } else {
      // embed mode
      container.innerHTML = `
        <div class="hfw-widget-container">
          <h2 class="hfw-embed-title">See Your NFT in Augmented Reality</h2>
          ${!isMobileAR ? `
          <div class="hfw-input-section">
            <input 
              type="text" 
              id="hfwTokenInput" 
              class="hfw-input" 
              placeholder="Enter Token ID"
            />
            <button class="hfw-button" id="hfwEmbedLoadButton" disabled>Load NFT</button>
          </div>
          ` : ''}
          ${renderViewer()}
        </div>
      `;
      
      if (!isMobileAR) {
        setupInputButton('hfwTokenInput', 'hfwEmbedLoadButton', loadNFT);
      }
    }

    initializeControls();
  }

  function renderModal(includeInput) {
    return `
      <div id="hfwModal" class="hfw-modal">
        <div class="hfw-modal-content">
          <button class="hfw-modal-close" onclick="window.closeHFWidget()">×</button>
          <p class="hfw-title">View Your NFT in AR</p>
          <p class="hfw-subtitle">Customize your frame and scan the QR code to view in augmented reality</p>
          
          ${includeInput && !isMobileAR ? `
          <div class="hfw-input-section" style="margin-bottom: 40px;">
            <input 
              type="text" 
              id="hfwModalTokenInput" 
              class="hfw-input" 
              placeholder="Enter Token ID (e.g. 1234)"
            />
            <button class="hfw-button" id="hfwModalLoadButton" disabled style="margin-top: 10px;">Load NFT</button>
          </div>
          ` : ''}
          
          ${renderViewer()}
        </div>
      </div>
    `;
  }

  function renderViewer() {
    return `
      <div class="hfw-controls-container">
        <div class="hfw-controls-left">
          <div class="hfw-slider-group">
            <label>Shape</label>
            <div style="flex-grow: 1;">
              <select id="hfwShapeSelect" class="hfw-select">
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
              <input type="color" id="hfwColorPicker" value="#ffffff" class="hfw-color-picker">
              <input type="text" id="hfwColorHex" value="#ffffff" readonly class="hfw-color-hex">
            </div>
          </div>

          <div class="hfw-slider-group">
            <label>Metalness</label>
            <div class="hfw-slider-container">
              <input type="range" id="hfwMetalness" min="0" max="100" value="50" class="hfw-range">
            </div>
            <span id="hfwMetalnessValue" class="hfw-slider-value">0.50</span>
          </div>

          <div class="hfw-slider-group">
            <label>Roughness</label>
            <div class="hfw-slider-container">
              <input type="range" id="hfwRoughness" min="0" max="100" value="50" class="hfw-range">
            </div>
            <span id="hfwRoughnessValue" class="hfw-slider-value">0.50</span>
          </div>
        </div>

        <div class="hfw-qr-right">
          <div id="hfwQrContainer" class="hfw-qr-container">
            <p>Scan to view in AR</p>
            <div id="hfwQrCode" class="hfw-qr-code"></div>
          </div>
        </div>
      </div>

      <model-viewer
        id="hfwModelViewer"
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
      
      <button id="hfwArButton" class="hfw-ar-button">View in AR</button>
      
      <p id="hfwStatus" class="hfw-status">Enter a token ID to load your NFT</p>
      <p class="hfw-powered">Powered by <a href="https://holoframe.io" target="_blank" rel="noopener">Holoframe</a></p>
    `;
  }

  function initializeControls() {
    const colorPicker = document.getElementById('hfwColorPicker');
    const colorHex = document.getElementById('hfwColorHex');
    const metalness = document.getElementById('hfwMetalness');
    const roughness = document.getElementById('hfwRoughness');
    const metalnessValue = document.getElementById('hfwMetalnessValue');
    const roughnessValue = document.getElementById('hfwRoughnessValue');
    const shapeSelect = document.getElementById('hfwShapeSelect');
    const modelViewer = document.getElementById('hfwModelViewer');
    const arButton = document.getElementById('hfwArButton');

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

    // Show AR button on mobile devices when NFT is loaded
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (arButton && isMobile) {
      modelViewer.addEventListener('load', () => {
        if (nftData.id) {
          arButton.classList.add('show');
        }
      }, { once: true });
    }
    
    // Hide QR code on mobile devices
    if (isMobile) {
      const qrWrapper = document.getElementById('hfwQrContainer');
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
          materialProps.color = colorPicker.value;
          updateMaterials();
          generateQR();
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
          materialProps.metalness = val;
          updateMaterials();
          generateQR();
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
          materialProps.roughness = val;
          updateMaterials();
          generateQR();
        }, 150);
      });
    }

    // Shape select
    if (shapeSelect) {
      shapeSelect.addEventListener('change', () => {
        currentModelUrl = shapeSelect.value;
        modelViewer.src = currentModelUrl;
        if (nftData.img) {
          modelViewer.addEventListener('load', () => applyTexture(), { once: true });
        }
        generateQR();
      });
    }

    // Model ready
    modelViewer.addEventListener('load', () => {
      if (nftData.img) {
        applyTexture();
      }
      updateMaterials();
    });
  }

  function updateMaterials() {
    const modelViewer = document.getElementById('hfwModelViewer');
    if (!modelViewer || !modelViewer.model) return;

    const material = modelViewer.model.materials[0];
    if (!material) return;

    material.pbrMetallicRoughness.setMetallicFactor(materialProps.metalness);
    material.pbrMetallicRoughness.setRoughnessFactor(materialProps.roughness);
    material.pbrMetallicRoughness.setBaseColorFactor(hex2rgb(materialProps.color));
  }

  async function applyTexture() {
    const modelViewer = document.getElementById('hfwModelViewer');
    if (!nftData.img || !modelViewer || !modelViewer.model) return;

    try {
      const material = modelViewer.model.materials[1];
      if (!material) return;

      const texture = await modelViewer.createTexture(nftData.img);
      material.pbrMetallicRoughness.baseColorTexture.setTexture(texture);
      material.emissiveTexture.setTexture(texture);
      material.pbrMetallicRoughness.setBaseColorFactor([1, 1, 1, 1]);
      
      setStatus(`✅ Successfully loaded ${nftData.name}!`, 'success');
      generateQR();
      
      // Show AR button on mobile after NFT loads
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      const arButton = document.getElementById('hfwArButton');
      if (arButton && isMobile) {
        arButton.classList.add('show');
      }
    } catch (error) {
      console.error('Texture error:', error);
      setStatus('Error applying NFT texture', 'error');
    }
  }

  async function loadNFT(tokenId) {
    if (!tokenId || !contract) {
      setStatus('Invalid token ID', 'error');
      return;
    }

    setStatus('Loading NFT data...', '');
    
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

      nftData = {
        id: tokenId,
        img: nft.display_image_url || nft.image_url,
        name: nft.name || `Token #${tokenId}`
      };

      const modelViewer = document.getElementById('hfwModelViewer');
      if (modelViewer && modelViewer.model) {
        await applyTexture();
      } else {
        setStatus('NFT data loaded. Waiting for 3D model...', '');
      }
    } catch (error) {
      console.error('Load NFT error:', error);
      setStatus(`Error: ${error.message}`, 'error');
      nftData = { id: null, img: null, name: null };
    }
  }

  function generateQR() {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (!nftData.id || isMobileAR || isMobile) return;

    const qrContainer = document.getElementById('hfwQrCode');
    const qrWrapper = document.getElementById('hfwQrContainer');
    if (!qrContainer || !qrWrapper || !window.QRCode) return;

    const baseUrl = window.location.href.split('?')[0].split('#')[0];
    const params = new URLSearchParams({
      tokenId: nftData.id,
      collection: collection,
      contract: contract,
      chain: chain,
      model: encodeURIComponent(currentModelUrl),
      metalness: materialProps.metalness.toFixed(1),
      roughness: materialProps.roughness.toFixed(1),
      color: materialProps.color.substring(1),
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

  function openModal() {
    const modal = document.getElementById('hfwModal');
    if (!modal) return;

    modal.classList.add('active');

    // Close modal when clicking outside
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal();
      }
    });

    // Get token ID from input
    let tokenInput = document.getElementById('hfwTokenInput');
    if (!tokenInput) {
      tokenInput = document.getElementById('hfwModalTokenInput');
    }

    if (tokenInput && tokenInput.value.trim()) {
      setTimeout(() => loadNFT(tokenInput.value.trim()), 100);
    }

    // Setup modal input and button listeners
    setupInputButton('hfwModalTokenInput', 'hfwModalLoadButton', loadNFT);
  }

  function closeModal() {
    const modal = document.getElementById('hfwModal');
    if (modal) {
      modal.classList.remove('active');
    }
  }

  window.closeHFWidget = closeModal;

  function setStatus(message, type = '') {
    const status = document.getElementById('hfwStatus');
    if (!status) return;

    status.textContent = message;
    status.className = 'hfw-status';
    if (type === 'error') {
      status.classList.add('hfw-error');
    } else if (type === 'success') {
      status.classList.add('hfw-success');
    }
  }

  // Check for mobile AR parameters
  function checkMobileParams() {
    const params = new URLSearchParams(window.location.search);
    if (params.get('mobile') === '1' && params.get('tokenId')) {
      document.body.classList.add('hfw-mobile-ar');
      
      const tokenId = params.get('tokenId');
      const modelUrl = params.get('model');
      const metal = params.get('metalness');
      const rough = params.get('roughness');
      const color = params.get('color');

      if (modelUrl) currentModelUrl = decodeURIComponent(modelUrl);
      if (metal) materialProps.metalness = parseFloat(metal);
      if (rough) materialProps.roughness = parseFloat(rough);
      if (color) materialProps.color = color.startsWith('#') ? color : '#' + color;

      setTimeout(() => {
        if (displayMode !== 'embed') {
          const modal = document.getElementById('hfwModal');
          if (modal) {
            modal.classList.add('active');
          }
        }
        
        const modelViewer = document.getElementById('hfwModelViewer');
        if (modelViewer && modelUrl) {
          modelViewer.src = currentModelUrl;
        }
        
        const shapeSelect = document.getElementById('hfwShapeSelect');
        if (shapeSelect && modelUrl) {
          shapeSelect.value = currentModelUrl;
        }
        
        const qrWrapper = document.getElementById('hfwQrContainer');
        if (qrWrapper) {
          qrWrapper.style.display = 'none';
        }
        
        loadNFT(tokenId);
      }, 500);
      
      return true;
    }
    return false;
  }

  // Initialize
  function init() {
    
    if (!collection || !contract) {
      console.error('NFT AR Widget: Missing required configuration (collection, contract)');
      return;
    }

    loadDependencies();
    injectCSS();
    
    // Wait for dependencies
    const checkDeps = setInterval(() => {
      if (window.customElements && window.customElements.get('model-viewer') && window.QRCode) {
        clearInterval(checkDeps);
        renderWidget();
        checkMobileParams();
      }
    }, 100);
  }

  // Start initialization
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  
  setTimeout(() => {
    const container = document.getElementById('hf-widget');
    if (container && container.innerHTML === '') {
      init();
    }
  }, 500);
})();