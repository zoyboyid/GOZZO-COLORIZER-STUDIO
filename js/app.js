/**
 * GOZZO COLORIZER STUDIO - Main Application Controller
 * Handles user interactions, mode switching, character limit gating,
 * live preview updates, and clipboard feedback.
 */

// Application State
let currentMode = 'Gradient';
let currentFormat = 'ONCE HUMAN';
let solidColor = '#00f0ff';
let gradientStart = '#6366f1';
let gradientEnd = '#ec4899';
let toastTimeout = null;

// DOM Elements Cache
const textInput = document.getElementById('textInput');
const charCount = document.getElementById('charCount');
const colorPickerContainer = document.getElementById('colorPickerContainer');
const livePreview = document.getElementById('livePreview');
const outputBox = document.getElementById('outputBox');
const formatBadge = document.getElementById('formatBadge');
const toast = document.getElementById('toast');
const toastMessage = document.getElementById('toastMessage');

// Character Limit Logic (Solid: 83, Gradient & Rainbow: 131)
function getMaxLimit() {
    return currentMode === 'Solid' ? 131 : 83;
}

function updateLimitUI() {
    const maxLimit = getMaxLimit();
    if (textInput) textInput.maxLength = maxLimit;

    const tagSolid = document.getElementById('limitTagSolid');
    const tagGradient = document.getElementById('limitTagGradient');

    if (currentMode === 'Solid') {
        if (tagSolid) tagSolid.className = 'limit-tag active';
        if (tagGradient) tagGradient.className = 'limit-tag inactive';
    } else {
        if (tagSolid) tagSolid.className = 'limit-tag inactive';
        if (tagGradient) tagGradient.className = 'limit-tag active';
    }
}

// Info Tooltip Controls
function toggleInfoTooltip(e) {
    if (e) e.stopPropagation();
    const container = document.getElementById('infoTooltipContainer');
    if (container) container.classList.toggle('open');
}

document.addEventListener('click', () => {
    const container = document.getElementById('infoTooltipContainer');
    if (container) container.classList.remove('open');
});

// Text Helper Actions
function clearText() {
    if (textInput) {
        textInput.value = '';
        updateApp();
        textInput.focus();
    }
}

function loadSampleText() {
    const maxLimit = getMaxLimit();
    let sample = "Welcome to the GOZZO app for changing chat text colors.";
    if (sample.length > maxLimit) sample = sample.slice(0, maxLimit);
    if (textInput) {
        textInput.value = sample;
        updateApp();
    }
}

// Mode Selection
function setMode(mode) {
    currentMode = mode;
    ['Solid', 'Gradient', 'Pelangi'].forEach(m => {
        const btn = document.getElementById('mode' + m);
        if (btn) {
            if (m === mode) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        }
    });

    const maxLimit = getMaxLimit();
    if (textInput && textInput.value.length > maxLimit) {
        textInput.value = textInput.value.slice(0, maxLimit);
        showToast(`Teks disesuaikan ke batas ${maxLimit} karakter (${mode})!`);
    }

    updateLimitUI();
    renderColorPickers();
    updateApp();
}

// Format Selection
function setFormat(format) {
    currentFormat = format;
    if (formatBadge) formatBadge.innerText = format;
    ['OnceHuman', 'Minecraft', 'Html'].forEach(f => {
        const btn = document.getElementById('fmt' + f);
        if (btn) {
            const isTarget = 
                (format === 'ONCE HUMAN' && f === 'OnceHuman') || 
                (format === 'Minecraft' && f === 'Minecraft') || 
                (format === 'HTML' && f === 'Html');
            if (isTarget) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        }
    });
    updateApp();
}

// Color Controls
function updateColorFromInput(which, val) {
    if (which === 'solid') solidColor = val;
    if (which === 'start') gradientStart = val;
    if (which === 'end') gradientEnd = val;

    const hexSpan = document.getElementById(which + 'ColorHex');
    const dialCore = document.getElementById(which + 'DialCore');
    if (hexSpan) hexSpan.innerText = val.toUpperCase();
    if (dialCore) dialCore.style.backgroundColor = val;

    updateApp();
}

function renderColorPickers() {
    if (!colorPickerContainer) return;

    if (currentMode === 'Solid') {
        colorPickerContainer.innerHTML = `
            <div class="color-slot">
                <div style="display: flex; flex-direction: column; gap: 0.15rem;">
                    <span style="font-size: 0.68rem; font-weight: 700; color: #8492a6; text-transform: uppercase; letter-spacing: 0.08em;">Warna Pilihan</span>
                    <span id="solidColorHex" class="mono-font" style="font-size: 0.85rem; font-weight: 700; color: #f1f5f9;">${solidColor.toUpperCase()}</span>
                </div>
                <div class="color-dial-wrapper">
                    <div id="solidDialCore" class="color-dial-core" style="background-color: ${solidColor};"></div>
                    <input type="color" id="solidColorInput" value="${solidColor}" oninput="updateColorFromInput('solid', this.value)">
                </div>
            </div>
        `;
    } else if (currentMode === 'Gradient') {
        colorPickerContainer.innerHTML = `
            <div class="color-slot">
                <div style="display: flex; flex-direction: column; gap: 0.15rem;">
                    <span style="font-size: 0.68rem; font-weight: 700; color: #8492a6; text-transform: uppercase; letter-spacing: 0.08em;">Warna Awal (Start)</span>
                    <span id="startColorHex" class="mono-font" style="font-size: 0.85rem; font-weight: 700; color: #f1f5f9;">${gradientStart.toUpperCase()}</span>
                </div>
                <div class="color-dial-wrapper">
                    <div id="startDialCore" class="color-dial-core" style="background-color: ${gradientStart};"></div>
                    <input type="color" id="startColorInput" value="${gradientStart}" oninput="updateColorFromInput('start', this.value)">
                </div>
            </div>
            <div class="color-slot">
                <div style="display: flex; flex-direction: column; gap: 0.15rem;">
                    <span style="font-size: 0.68rem; font-weight: 700; color: #8492a6; text-transform: uppercase; letter-spacing: 0.08em;">Warna Akhir (End)</span>
                    <span id="endColorHex" class="mono-font" style="font-size: 0.85rem; font-weight: 700; color: #f1f5f9;">${gradientEnd.toUpperCase()}</span>
                </div>
                <div class="color-dial-wrapper">
                    <div id="endDialCore" class="color-dial-core" style="background-color: ${gradientEnd};"></div>
                    <input type="color" id="endColorInput" value="${gradientEnd}" oninput="updateColorFromInput('end', this.value)">
                </div>
            </div>
        `;
    } else if (currentMode === 'Pelangi') {
        colorPickerContainer.innerHTML = `
            <div class="color-slot" style="border-color: rgba(255, 42, 133, 0.25); background: linear-gradient(145deg, #1d1828, #14111d);">
                <div style="display: flex; align-items: center; gap: 0.75rem;">
                    <span style="font-size: 1.1rem; filter: drop-shadow(0 0 6px #ff2a85);">⚡</span>
                    <span style="font-size: 0.72rem; font-weight: 600; color: #f472b6; line-height: 1.4;">
                        Spektrum RGB Rainbow 360&deg; otomatis terdistribusi di setiap karakter teks.
                    </span>
                </div>
            </div>
        `;
    }
}

// Master Render Update
function updateApp() {
    if (!textInput || !charCount || !livePreview || !outputBox) return;

    const maxLimit = getMaxLimit();
    updateLimitUI();

    let text = textInput.value;
    if (text.length > maxLimit) {
        text = text.slice(0, maxLimit);
        textInput.value = text;
    }

    const currentLen = text.length;
    charCount.innerText = `${currentLen} / ${maxLimit} karakter`;

    if (currentLen >= maxLimit) {
        charCount.classList.add('limit-reached');
    } else {
        charCount.classList.remove('limit-reached');
    }

    if (text.length === 0) {
        livePreview.innerHTML = '<span style="color: #64748b; font-weight: 500; font-size: 0.85rem;">Masukkan teks di sebelah kiri untuk melihat live preview...</span>';
        outputBox.innerText = '';
        return;
    }

    // 1. Live Preview Rendering
    let previewHTML = '';
    for (let i = 0; i < text.length; i++) {
        let rgb = ColorEngine.getColorForIndex(i, text.length, currentMode, solidColor, gradientStart, gradientEnd);
        let hex = ColorEngine.rgbToHex(rgb[0], rgb[1], rgb[2]);
        let char = text[i];
        if (char === '\n') {
            previewHTML += '<br>';
        } else {
            if (char === ' ') char = '&nbsp;';
            previewHTML += `<span style="color:${hex}; text-shadow: 0 0 12px ${hex}44;">${char}</span>`;
        }
    }
    livePreview.innerHTML = previewHTML;

    // 2. Output Code Generation
    outputBox.innerText = ColorEngine.generateOutputCode(text, currentMode, currentFormat, solidColor, gradientStart, gradientEnd);
}

// Clipboard Copy
function copyToClipboard() {
    if (!outputBox) return;
    const textToCopy = outputBox.innerText;
    if (!textToCopy) return;

    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(textToCopy).then(() => {
            showToast('BERHASIL DISALIN KE CLIPBOARD!');
        }).catch(() => {
            fallbackCopy(textToCopy);
        });
    } else {
        fallbackCopy(textToCopy);
    }
}

function fallbackCopy(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();
    try {
        document.execCommand('copy');
        showToast('BERHASIL DISALIN KE CLIPBOARD!');
    } catch (err) {
        showToast('GAGAL MENYALIN TEKS', true);
    }
    document.body.removeChild(textarea);
}

// Toast Feedback Notification
function showToast(message, isError = false) {
    if (!toast || !toastMessage) return;
    clearTimeout(toastTimeout);
    toastMessage.innerText = message;
    toast.style.borderColor = isError ? 'var(--accent-pink)' : 'var(--accent-cyan)';
    toast.classList.add('show');
    toastTimeout = setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Event Listeners and Bootstrapping
if (textInput) {
    textInput.addEventListener('input', updateApp);
}

// Initialize on page load
renderColorPickers();
updateApp();
