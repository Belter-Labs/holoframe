# How Holoframe Works

## Overview

Holoframe fetches NFT metadata from OpenSea and displays it in AR by applying the NFT image as a texture onto pre-built 3D frame models (GLB format) using the model-viewer web component.

## Architecture

```
Widget JS (jsDelivr CDN) → Base GLB (Cloudinary CDN) + NFT Texture (OpenSea via Worker) → model-viewer (texture swap + materials) → AR Display
```

### Components:
1. **Widget JavaScript** - Served from jsDelivr CDN (GitHub repo), runs in browser
2. **Base GLB File** - Pre-built 3D frame hosted on Cloudinary CDN
3. **NFT Texture** - Fetched from OpenSea API via Cloudflare Worker proxy
4. **model-viewer** - Google's web component handles texture application, material properties, and AR modes

### 1. NFT Data Fetching

The widget calls a Cloudflare Worker proxy that fetches NFT metadata from OpenSea's API:

```javascript
fetch('https://holoframe-api.soft-flower-d4fe.workers.dev?chain=ethereum&contract=0x...&tokenId=1')
```

**Response includes:**
- NFT image URL
- Token name
- Collection name
- Metadata

**Rate Limits:**
- NFT fetching: 100 requests/hour per IP
- Collection validation: 20 requests/hour per IP
- Cached for 5 minutes (NFT data) / 1 hour (collection data)

### 2. GLB Model & Texture Application

Holoframe uses a **pre-built base GLB file** (hosted on Cloudinary CDN) containing the 3D frame geometry. The widget then:

1. **Loads base GLB** - Pre-made 3D frame from Cloudinary CDN
2. **Fetches NFT texture** - NFT image from OpenSea (via Cloudflare Worker proxy)
3. **Applies texture** - model-viewer swaps the texture and applies material properties

```html
<model-viewer
  src="https://res.cloudinary.com/dfxigf84x/image/upload/.../frame.glb"
  ar
  ar-modes="webxr scene-viewer quick-look"
  camera-controls
  auto-rotate>
</model-viewer>
```

**Material Customization:**
model-viewer allows dynamic material property changes:
- **Color** - Frame color via hex value
- **Metalness** (0-1) - How metallic the frame appears
- **Roughness** (0-1) - Surface smoothness

These properties are applied client-side by model-viewer without regenerating the GLB file. The NFT image texture is dynamically loaded and mapped onto the frame geometry.

**No GLB generation in the browser** - just texture swapping and material property updates on a pre-existing 3D model.

### 3. AR Display

The **pre-loaded GLB with applied texture** is displayed using the **`<model-viewer>`** web component (loaded from CDN) with multiple AR modes:

```html
<script type="module" src="https://ajax.googleapis.com/ajax/libs/model-viewer/4.0.0/model-viewer.min.js"></script>

<model-viewer
  src="https://res.cloudinary.com/dfxigf84x/image/upload/.../frame.glb"
  ar
  ar-modes="webxr scene-viewer quick-look"
  camera-controls
  auto-rotate>
</model-viewer>
```

**AR Modes (in priority order):**

1. **WebXR** - Modern browsers with WebXR support (Chrome Android, Edge, etc.)
2. **Scene Viewer** - Android devices with ARCore (Android 7.0+)
3. **Quick Look** - iOS devices (iPhone/iPad with iOS 12+)

**How AR Activation Works:**

- **Mobile (iOS/Android):** Tap the AR button in model-viewer
- **Desktop:** Scan the generated QR code with a mobile device

The QR code (generated via QRCode.js from CDN) contains a URL with all customization parameters, allowing the mobile device to reconstruct the exact AR view.

### 4. QR Code Generation

For desktop users, Holoframe generates a QR code containing a URL with all NFT and customization data:

```javascript
// Load QRCode library dynamically
const script = document.createElement('script');
script.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js';

// Build URL with parameters
const params = new URLSearchParams({
  tokenId: nftData.id,
  contract: contract,
  chain: chain,
  model: encodeURIComponent(modelUrl),
  metalness: 0.5,
  roughness: 0.5,
  color: 'ffffff',
  mobile: '1'
});
const qrUrl = `${window.location.href.split('?')[0]}?${params}`;

// Generate QR code
new QRCode(containerElement, {
  text: qrUrl,  // URL with all parameters
  width: 160,
  height: 160,
  colorDark: '#1f2937',
  colorLight: '#ffffff'
});
```

Users scan this QR code, which opens the same page on mobile with all customization data in the URL. The mobile widget reads these parameters and recreates the exact NFT + frame configuration for AR viewing.

## Security & Privacy

### No API Keys Exposed

All OpenSea API requests go through a Cloudflare Worker proxy. Client-side code never exposes API keys.

### Rate Limiting

IP-based rate limiting prevents abuse:
- Temporary IP storage (1 hour TTL)
- Auto-expires via Cloudflare KV
- No persistent tracking

### Data Collection

Holoframe collects **zero analytics or cookies**. Only temporary IP addresses for rate limiting (auto-deleted after 1 hour).

## Performance Optimizations

### Caching Strategy

- **NFT metadata:** 5-minute cache
- **Collection data:** 1-hour cache
- **GLB models:** Loaded from Cloudinary CDN, cached by browser
- **NFT textures:** Cached per-NFT by browser

### API Key Rotation

The Cloudflare Worker automatically rotates between multiple OpenSea API keys to maximize throughput.


### Lazy Loading

The widget script is fetched asynchronously and only loads when needed:

```javascript
fetch('...widget.js')
  .then(r => r.text())
  .then(code => eval(code));
```

## Browser Compatibility

| Feature | Requirement |
|---------|-------------|
| 3D Viewer | Modern browsers (Chrome, Safari, Firefox, Edge) |
| WebXR AR | Chrome 79+, Edge 79+ |
| Quick Look AR | iOS 12+, Safari |
| ARCore AR | Android 7.0+, ARCore support |


## Dependencies

Holoframe loads the following libraries from CDN **only when needed**:

**Core Dependencies:**
- **`<model-viewer>`** (Google) - Handles all 3D rendering and AR display with WebXR/Quick Look/Scene Viewer support

**Optional Dependencies:**
- **QRCode.js** - QR code generation for desktop-to-mobile AR (desktop only)

**That's it!** No Three.js, no GLTFExporter, no build step. Model-viewer does all the heavy lifting for 3D display and AR.
