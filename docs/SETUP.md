# Setup Guide

Complete guide for installing and configuring Holoframe widgets.

## Two Widget Types

### Collection-Specific Widget
- For a **single NFT collection** (users enter token IDs)
- **One widget per page only**
- Requires: collection slug, contract address, blockchain

### Universal Widget
- For **any NFT from OpenSea** (users paste URLs)
- **Multiple widgets per page supported**
- No collection/contract needed

---

## Quick Start

### Option 1: Widget Builder (Easiest - Collection Only)

1. Go to [holoframe.io](https://holoframe.io)
2. Click 'Create your widget' to launch the Widget Builder
3. Enter your OpenSea collection URL
4. Customize colors, display mode, theme
5. Copy the generated code
6. Paste into your website

### Option 2: Manual Integration

Follow the guides below for manual setup or universal widgets.

---

## Collection Widget

**One widget per page** - for a single NFT collection.

### Basic Setup

```html
<!-- 1. Add container -->
<div id="hf-widget"></div>

<!-- 2. Configure -->
<script>
  window.hfWidgetConfig = {
    collection: "pudgypenguins",
    contract: "0xBd3531dA5CF5857e7CfAA92426877b022e612cf8",
    chain: "ethereum",
    brandColor: "#00a6fb",
    displayMode: "button-input",
    theme: "light"
  };
</script>

<!-- 3. Load widget -->
<script src="https://cdn.jsdelivr.net/gh/Belter-Labs/holoframe@v1.0.0/src/hf-widget.js"></script>
```

### Configuration Options

| Option | Type | Required | Default | Description |
|--------|------|----------|---------|-------------|
| `collection` | string | ✅ Yes | - | OpenSea collection slug |
| `contract` | string | ✅ Yes | - | NFT contract address |
| `chain` | string | ✅ Yes | - | Blockchain name |
| `brandColor` | string | No | `#00a6fb` | Accent color (hex format) |
| `displayMode` | string | No | `button-input` | `button-input`, `button-only`, or `embed` |
| `buttonAlign` | string | No | `center` | `left`, `center`, or `right` |
| `buttonPadding` | number | No | `0` | Padding around button (px) |
| `theme` | string | No | `light` | `light` or `dark` |
| `triggerButtonId` | string | No | `null` | ID of custom trigger button |

### Finding Collection Details

Visit your OpenSea collection page and note:

**Collection Slug:**
```
opensea.io/collection/pudgypenguins
                      ^^^^^^^^^^^^^^ (slug)
```

**Contract Address:**
Click collection → "Details" → Copy contract address

**Chain:**
Check collection details (e.g., `ethereum`, `polygon`, `base`)

### Examples

**Minimal:**
```html
<div id="hf-widget"></div>
<script>
  window.hfWidgetConfig = {
    collection: "pudgypenguins",
    contract: "0xBd3531dA5CF5857e7CfAA92426877b022e612cf8",
    chain: "ethereum"
  };
</script>
<script src="https://cdn.jsdelivr.net/gh/Belter-Labs/holoframe@v1.0.0/src/hf-widget.js"></script>
```

**Dark theme, button-only:**
```html
<div id="hf-widget"></div>
<script>
  window.hfWidgetConfig = {
    collection: "azuki",
    contract: "0xED5AF388653567Af2F388E6224dC7C4b3241C544",
    chain: "ethereum",
    brandColor: "#ff0000",
    displayMode: "button-only",
    buttonAlign: "right",
    theme: "dark"
  };
</script>
<script src="https://cdn.jsdelivr.net/gh/Belter-Labs/holoframe@v1.0.0/src/hf-widget.js"></script>
```

**Custom trigger button:**
```html
<button id="my-ar-button">View My NFT</button>
<div id="hf-widget"></div>

<script>
  window.hfWidgetConfig = {
    collection: "pudgypenguins",
    contract: "0xBd3531dA5CF5857e7CfAA92426877b022e612cf8",
    chain: "ethereum",
    triggerButtonId: "my-ar-button"
  };
</script>
<script src="https://cdn.jsdelivr.net/gh/Belter-Labs/holoframe@v1.0.0/src/hf-widget.js"></script>
```

---

## Universal Widget

View **any NFT from OpenSea** - users paste OpenSea URLs.

**Multiple instances supported** - see examples below.

### Single Instance

```html
<!-- 1. Add container -->
<div id="hf-widget"></div>

<!-- 2. Configure -->
<script>
  window.hfWidgetConfig = {
    brandColor: "#00a6fb",
    displayMode: "button-input",
    theme: "light"
  };
</script>

<!-- 3. Load widget -->
<script src="https://cdn.jsdelivr.net/gh/Belter-Labs/holoframe@v1.0.0/src/hf-core.js"></script>
```

### Multiple Instances

```html
<!-- Multiple containers with unique IDs -->
<div id="hf-widget-1"></div>
<div id="hf-widget-2"></div>

<!-- Configuration array -->
<script>
  window.hfWidgets = [
    {
      containerId: 'hf-widget-1',
      brandColor: '#00a6fb',
      displayMode: 'button-only',
      buttonAlign: 'left',
      theme: 'light'
    },
    {
      containerId: 'hf-widget-2',
      brandColor: '#7c3aed',
      displayMode: 'button-input',
      buttonAlign: 'right',
      theme: 'dark'
    }
  ];
</script>

<!-- Load widget -->
<script src="https://cdn.jsdelivr.net/gh/Belter-Labs/holoframe@v1.0.0/src/hf-core.js"></script>
```

### Configuration Options

| Option | Type | Required | Default | Description |
|--------|------|----------|---------|-------------|
| `containerId` | string | No* | `hf-widget` | Container element ID |
| `brandColor` | string | No | `#00a6fb` | Accent color (hex format) |
| `displayMode` | string | No | `button-input` | `button-input`, `button-only`, or `embed` |
| `buttonAlign` | string | No | `center` | `left`, `center`, or `right` |
| `buttonPadding` | number | No | `20` | Padding around button (px) |
| `theme` | string | No | `light` | `light` or `dark` |
| `triggerClass` | string | No | `null` | CSS class for custom triggers |

*`containerId` is **required** for multiple instances, optional for single.

### Examples

**Single widget:**
```html
<div id="hf-widget"></div>
<script>
  window.hfWidgetConfig = {
    brandColor: "#7c3aed",
    displayMode: "button-input",
    theme: "light"
  };
</script>
<script src="https://cdn.jsdelivr.net/gh/Belter-Labs/holoframe@v1.0.0/src/hf-core.js"></script>
```

**Multiple widgets:**
```html
<div id="header-ar"></div>
<div id="footer-ar"></div>

<script>
  window.hfWidgets = [
    {
      containerId: 'header-ar',
      brandColor: '#00a6fb',
      displayMode: 'button-only',
      buttonAlign: 'left'
    },
    {
      containerId: 'footer-ar',
      brandColor: '#10b981',
      displayMode: 'button-only',
      buttonAlign: 'right'
    }
  ];
</script>

<script src="https://cdn.jsdelivr.net/gh/Belter-Labs/holoframe@v1.0.0/src/hf-core.js"></script>
```

**Custom trigger buttons:**
```html
<nav>
  <button class="ar-trigger">View NFT 🖼️</button>
</nav>

<footer>
  <button class="ar-trigger">AR Viewer</button>
</footer>

<div id="hf-widget" style="display:none;"></div>

<script>
  window.hfWidgetConfig = {
    brandColor: "#00a6fb",
    triggerClass: "ar-trigger"  // Both buttons trigger modal
  };
</script>

<script src="https://cdn.jsdelivr.net/gh/Belter-Labs/holoframe@v1.0.0/src/hf-core.js"></script>
```

---

## Display Modes

### `button-input`
Shows input field + button on page. User enters data, clicks button, modal opens.

**Best for:** Collection pages, main widget placement

### `button-only`
Shows single button. Clicking opens modal with input inside.

**Best for:** Clean layouts, sidebars, headers/footers

### `embed`
Everything visible on page (no modal). Input, 3D viewer, controls embedded.

**Best for:** Dedicated AR pages, full-width sections

---

## Supported Blockchains

Ethereum • Polygon • Arbitrum • Optimism • Avalanche • Zora • Base • Blast • Sei • B3 • Berachain • Flow • ApeChain • Soneium • Shape • Unichain • Ronin • Abstract • GUNZ • HyperEVM • Somnia • Monad

**Use lowercase names:** `ethereum`, `polygon`, `base`, etc.

---

## Platform-Specific Installation

### Webflow

1. Add an **Embed** element where you want the widget
2. Paste the complete setup code (container + config + script)
3. Publish your site

### WordPress

1. Add a **Custom HTML** block
2. Paste the complete setup code
3. Update/publish the page

### Squarespace

1. Add a **Code Block**
2. Paste the setup code
3. Save and publish

### Static HTML

Just paste the setup code wherever you want the widget in your HTML file.

---

## Important Notes

### Container Requirements

**Collection widget:**
```html
<div id="hf-widget"></div>  <!-- MUST use this exact ID -->
```

**Universal widget (single):**
```html
<div id="hf-widget"></div>  <!-- Default, or custom via containerId -->
```

**Universal widget (multiple):**
```html
<div id="hf-widget-1"></div>  <!-- Custom IDs required -->
<div id="hf-widget-2"></div>
```

### Configuration Order

Always set config **before** loading widget:

```html
<!-- ✅ CORRECT -->
<script>
  window.hfWidgetConfig = { ... };
</script>
<script src="https://cdn.jsdelivr.net/gh/Belter-Labs/holoframe@v1.0.0/src/hf-widget.js"></script>

<!-- ❌ WRONG -->
<script src="https://cdn.jsdelivr.net/gh/Belter-Labs/holoframe@v1.0.0/src/hf-widget.js"></script>
<script>
  window.hfWidgetConfig = { ... };  // Too late!
</script>
```

### Multiple Instances

- **Collection widget:** ❌ Not supported
- **Universal widget:** ✅ Supported via `window.hfWidgets` array

### Script Loading

Widgets are loaded directly from JSDelivr CDN with version pinning for stability.

---

## Troubleshooting

### Widget doesn't appear
- Check container ID matches config
- Open browser console (F12) for errors
- Verify script URL is correct

### NFT won't load (Collection)
- Verify collection slug is correct
- Check contract address from OpenSea
- Confirm chain name (lowercase)

### Multiple widgets conflict
- Make sure using Universal widget (hf-core.js)
- Each instance needs unique `containerId`
- Use `window.hfWidgets` array, not `window.hfWidgetConfig`

### Custom trigger doesn't work
- Collection: Use `triggerButtonId` with element ID
- Universal: Use `triggerClass` with CSS class
- Triggers must exist in DOM before widget loads
