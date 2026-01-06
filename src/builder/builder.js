/* Holoframe Widget Builder JS */

(function() {
'use strict';

const WORKER_API_URL = 'https://holoframe-api.soft-flower-d4fe.workers.dev';

// Widget URLs with version and SRI hashes
const WIDGET_VERSION = 'v1.0.0';
const WIDGET_URLS = {
  universal: {
    url: 'https://cdn.jsdelivr.net/gh/Belter-Labs/holoframe@v1.0.0/src/hf-widget.js',
    integrity: 'sha384-OMFTEQstT5WYlhsT/xZvOtJz07x71GVvbWm3eD0HgUAIISO8yYJW1F5rHsAM67Sg'
  },
  collection: {
    url: 'https://cdn.jsdelivr.net/gh/Belter-Labs/holoframe@v1.0.0/src/hf-core.js',
    integrity: 'sha384-Pn40aEA4Ut/ppJrIPnYW4loJhdG4nVLcL+Qtbogd1wgwkNMhLWeoYdE0xlU83uM/'
  }
};

let builderState = {
collectionSlug: '',
collectionName: '',
collectionContract: '',
collectionChain: '',
brandColor: '#00a6fb',
displayMode: 'button-input',
buttonAlign: 'center',
theme: 'light'
};

// DOM Elements
const elements = {
modal: document.getElementById('hfwb-modal'),
openBtn: document.getElementById('hfwb-open'),

// Step 1
step1: document.getElementById('hfwbStep1'),
collectionUrl: document.getElementById('hfwbCollectionUrl'),
collectionError: document.getElementById('hfwbCollectionError'),
collectionSuccess: document.getElementById('hfwbCollectionSuccess'),
collectionName: document.getElementById('hfwbCollectionName'),
step1Next: document.getElementById('hfwbStep1Next'),

// Step 2
step2: document.getElementById('hfwbStep2'),
brandColor: document.getElementById('hfwbBrandColor'),
brandColorHex: document.getElementById('hfwbBrandColorHex'),
alignmentGroup: document.getElementById('hfwbAlignmentGroup'),
preview: document.getElementById('hfwbPreview'),
step2Back: document.getElementById('hfwbStep2Back'),
step2Next: document.getElementById('hfwbStep2Next'),

// Step 3
step3: document.getElementById('hfwbStep3'),
embedCode: document.getElementById('hfwbEmbedCode'),
copyBtn: document.getElementById('hfwbCopyCode'),
finalPreview: document.getElementById('hfwbFinalPreview'),
step3Back: document.getElementById('hfwbStep3Back'),
step3Done: document.getElementById('hfwbStep3Done'),

// Steps progress
steps: document.querySelectorAll('.hfwb-step')
};

// Initialize
function init() {
elements.openBtn.addEventListener('click', openBuilder);
elements.collectionUrl.addEventListener('input', validateCollectionUrl);
elements.step1Next.addEventListener('click', function() { goToStep(2); });
elements.step2Back.addEventListener('click', function() { goToStep(1); });
elements.step2Next.addEventListener('click', function() { goToStep(3); });
elements.step3Back.addEventListener('click', function() { goToStep(2); });
elements.step3Done.addEventListener('click', closeBuilder);
elements.copyBtn.addEventListener('click', copyCode);

// Color picker
elements.brandColor.addEventListener('input', updateBrandColor);

// Display mode radios
document.querySelectorAll('input[name="displayMode"]').forEach(function(radio) {
radio.addEventListener('change', function(e) {
builderState.displayMode = e.target.value;
updateAlignmentVisibility();
updatePreview();
});
});

// Button alignment toggles
document.querySelectorAll('[data-align]').forEach(function(btn) {
btn.addEventListener('click', function() {
document.querySelectorAll('[data-align]').forEach(function(b) {
b.classList.remove('hfwb-toggle-active');
});
this.classList.add('hfwb-toggle-active');
builderState.buttonAlign = this.dataset.align;
updatePreview();
});
});

// Theme toggles
document.querySelectorAll('[data-theme]').forEach(function(btn) {
btn.addEventListener('click', function() {
document.querySelectorAll('[data-theme]').forEach(function(b) {
b.classList.remove('hfwb-toggle-active');
});
this.classList.add('hfwb-toggle-active');
builderState.theme = this.dataset.theme;
updatePreview();
});
});

// Close modal on outside click
elements.modal.addEventListener('click', function(e) {
if (e.target === elements.modal) closeBuilder();
});
}

function openBuilder() {
elements.modal.classList.add('active');
resetBuilder();
}

function closeBuilder() {
elements.modal.classList.remove('active');
}

window.closeHFWidgetBuilder = closeBuilder;

function resetBuilder() {
goToStep(1);
elements.collectionUrl.value = '';
elements.collectionError.style.display = 'none';
elements.collectionSuccess.style.display = 'none';
elements.step1Next.disabled = true;
builderState = {
collectionSlug: '',
collectionName: '',
collectionContract: '',
collectionChain: '',
brandColor: '#00a6fb',
displayMode: 'button-input',
buttonAlign: 'center',
theme: 'light'
};
}

function goToStep(stepNum) {
// Hide all steps
elements.step1.style.display = 'none';
elements.step2.style.display = 'none';
elements.step3.style.display = 'none';

// Update progress
elements.steps.forEach((step, index) => {
step.classList.remove('hfwb-step-active', 'hfwb-step-completed');
if (index + 1 < stepNum) {
step.classList.add('hfwb-step-completed');
} else if (index + 1 === stepNum) {
step.classList.add('hfwb-step-active');
}
});

// Show current step
if (stepNum === 1) {
elements.step1.style.display = 'block';
} else if (stepNum === 2) {
elements.step2.style.display = 'block';
updateAlignmentVisibility();
updatePreview();
} else if (stepNum === 3) {
elements.step3.style.display = 'block';
generateEmbedCode();
updateFinalPreview();
}
}

function updateAlignmentVisibility() {
// Show alignment options only for button-only and button-input modes
if (builderState.displayMode === 'button-only' || builderState.displayMode === 'button-input') {
elements.alignmentGroup.style.display = 'block';
} else {
elements.alignmentGroup.style.display = 'none';
}
}

async function validateCollectionUrl() {
const input = elements.collectionUrl.value.trim();
elements.collectionError.style.display = 'none';
elements.collectionSuccess.style.display = 'none';
elements.step1Next.disabled = true;

if (!input) return;

// Extract slug from URL or use as-is if it's just a slug
let slug = input;
const urlMatch = input.match(/opensea\.io\/collection\/([^/?#]+)/i);
if (urlMatch) {
slug = urlMatch[1];
}

if (!slug) {
showError('Invalid OpenSea collection URL');
return;
}

// Validate with Worker API
try {
const response = await fetch(WORKER_API_URL + '/validate-collection?slug=' + encodeURIComponent(slug));

if (!response.ok) {
const errorData = await response.json().catch(() => ({}));
if (response.status === 404) {
showError('Collection not found on OpenSea');
} else if (response.status === 429) {
showError('Rate limit exceeded. Please wait a moment.');
} else {
showError(errorData.error || 'API Error: ' + response.status);
}
return;
}

const data = await response.json();

if (!data || !data.contracts || data.contracts.length === 0) {
showError('No contract found for this collection');
return;
}

// Store collection data
builderState.collectionSlug = slug;
builderState.collectionName = data.name || slug;
builderState.collectionContract = data.contracts[0].address;
builderState.collectionChain = data.contracts[0].chain;

// Show success
elements.collectionName.textContent = builderState.collectionName;
elements.collectionSuccess.style.display = 'flex';
elements.step1Next.disabled = false;

} catch (error) {
console.error('Validation error:', error);
showError('Failed to validate collection. Please try again.');
}
}

function showError(message) {
elements.collectionError.textContent = message;
elements.collectionError.style.display = 'block';
elements.step1Next.disabled = true;
}

function updateBrandColor() {
builderState.brandColor = elements.brandColor.value;
elements.brandColorHex.value = builderState.brandColor;
updatePreview();
}

function updatePreview() {
const preview = generatePreviewHTML();
elements.preview.innerHTML = preview;
}

function updateFinalPreview() {
const preview = generatePreviewHTML();
elements.finalPreview.innerHTML = preview;
}

function generatePreviewHTML() {
const isDark = builderState.theme === 'dark';
const bgColor = isDark ? '#1f2937' : '#ffffff';
const textColor = isDark ? '#f9fafb' : '#1f2937';
const borderColor = isDark ? '#374151' : '#d1d5db';
const placeholderColor = isDark ? '#6b7280' : '#d1d5db';

// Determine alignment styles
let alignStyle = 'margin: 0 auto;'; // center
if (builderState.buttonAlign === 'left') {
alignStyle = 'margin: 0 auto 0 0;';
} else if (builderState.buttonAlign === 'right') {
alignStyle = 'margin: 0 0 0 auto;';
}

if (builderState.displayMode === 'button-input') {
return '<div style="width: 100%; max-width: 400px; ' + alignStyle + ' font-family: \'Quattrocento Sans\', sans-serif;">' +
'<div style="display: flex; flex-direction: column; gap: 10px;">' +
'<input type="text" placeholder="Enter Token ID (e.g. 1234)" style="padding: 12px; font-size: 0.95rem; border: 2px solid ' + borderColor + '; border-radius: 8px; background: ' + bgColor + '; color: ' + textColor + '; font-family: \'Quattrocento Sans\', sans-serif;" disabled />' +
'<button style="padding: 12px; font-size: 1rem; background: ' + builderState.brandColor + '; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; font-family: \'Quattrocento Sans\', sans-serif;">View in AR</button>' +
'</div></div>';
} else if (builderState.displayMode === 'button-only') {
return '<div style="width: 100%; max-width: 400px; ' + alignStyle + ' font-family: \'Quattrocento Sans\', sans-serif;">' +
'<button style="padding: 14px 24px; font-size: 1rem; background: ' + builderState.brandColor + '; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; width: 100%; font-family: \'Quattrocento Sans\', sans-serif;">View NFT in AR</button>' +
'</div>';
} else {
return '<div style="width: 100%; max-width: 400px; padding: 20px; background: ' + bgColor + '; border: 2px solid ' + borderColor + '; border-radius: 12px; font-family: \'Quattrocento Sans\', sans-serif; color: ' + textColor + ';">' +
'<div style="margin-bottom: 15px;">' +
'<input type="text" placeholder="Enter Token ID" style="width: 100%; padding: 12px; font-size: 0.95rem; border: 2px solid ' + borderColor + '; border-radius: 8px; background: ' + bgColor + '; color: ' + textColor + '; font-family: \'Quattrocento Sans\', sans-serif;" disabled />' +
'</div>' +
'<div style="width: 100%; height: 200px; background: ' + (isDark ? '#111827' : '#f3f4f6') + '; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: ' + placeholderColor + '; font-size: 0.9rem;">3D Viewer</div>' +
'<button style="width: 100%; padding: 12px; font-size: 1rem; background: ' + builderState.brandColor + '; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; margin-top: 15px; font-family: \'Quattrocento Sans\', sans-serif;">View in AR</button>' +
'</div>';
}
}

function generateEmbedCode() {
const config = {
collection: builderState.collectionSlug,
contract: builderState.collectionContract,
chain: builderState.collectionChain,
brandColor: builderState.brandColor,
displayMode: builderState.displayMode,
theme: builderState.theme
};

// Only add buttonAlign if not embed mode (since it doesn't apply there)
if (builderState.displayMode !== 'embed') {
config.buttonAlign = builderState.buttonAlign;
config.buttonPadding = 0;
}

const configJson = JSON.stringify(config, null, 2);

// Use collection-specific widget (hf-core.js) since we have collection data
const widgetInfo = WIDGET_URLS.collection;

const code = '<!-- Holoframe Widget for ' + builderState.collectionName + ' -->\n' +
'<div id="hf-widget"></div>\n' +
'<script>\n' +
'window.hfWidgetConfig = ' + configJson + ';\n' +
'</script' + '>\n' +
'<script \n' +
'  src="' + widgetInfo.url + '"\n' +
'  integrity="' + widgetInfo.integrity + '"\n' +
'  crossorigin="anonymous">\n' +
'</script' + '>';

elements.embedCode.textContent = code;
}

function copyCode() {
const code = elements.embedCode.textContent;
navigator.clipboard.writeText(code).then(function() {
const originalText = elements.copyBtn.innerHTML;
elements.copyBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z"/></svg> Copied!';
elements.copyBtn.classList.add('copied');

setTimeout(function() {
elements.copyBtn.innerHTML = originalText;
elements.copyBtn.classList.remove('copied');
}, 2000);
}).catch(function(err) {
console.error('Failed to copy:', err);
alert('Failed to copy code. Please copy manually.');
});
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
document.addEventListener('DOMContentLoaded', init);
} else {
init();
}
})();
