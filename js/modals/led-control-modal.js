'use strict';
import { Storage } from '../storage.js';

/**
 * LED Control Modal
 * Handles RGB LED color, brightness, player indicators and animation effects
 * for DualSense / DualShock 4 controllers
 */

let _ledController = null;
let _ledAnimationTimer = null;
let _ledRainbowHue = 0;

const LED_EFFECTS = {
  static: 'static',
  breathe: 'breathe',
  rainbow: 'rainbow',
};

/**
 * Initialize LED control modal with controller instance
 * @param {object} controllerInstance
 */
export function show_led_control_modal(controllerInstance) {
  _ledController = controllerInstance;

  // Stop any ongoing animation
  _stopLedAnimation();

  // Reset UI state
  _refreshLedUI();

  bootstrap.Modal.getOrCreateInstance('#ledControlModal').show();

  // Start animation if needed
  const effect = document.getElementById('led-effect')?.value || 'static';
  if (effect !== 'static') _startLedAnimation(effect);
}

/**
 * Called when modal is hidden — stop all animations
 */
export function on_led_modal_hidden() {
  _stopLedAnimation();
  _ledController = null;
}

/* ── Helpers ── */

function _refreshLedUI() {
  const color = document.getElementById('led-color-picker')?.value || '#0040ff';
  const brightness = parseInt(document.getElementById('led-brightness')?.value || '128');
  _updatePreview(color, brightness);
}

function _updatePreview(hexColor, brightness) {
  const preview = document.getElementById('led-preview');
  if (!preview) return;

  const scale = brightness / 255;
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  const dimR = Math.round(r * scale);
  const dimG = Math.round(g * scale);
  const dimB = Math.round(b * scale);
  const dimHex = `#${dimR.toString(16).padStart(2,'0')}${dimG.toString(16).padStart(2,'0')}${dimB.toString(16).padStart(2,'0')}`;

  preview.style.backgroundColor = dimHex;
  preview.style.boxShadow = `0 0 ${20 * scale}px ${10 * scale}px ${hexColor}88`;
  preview.style.setProperty('--led-color', hexColor);
}

function _hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b };
}

function _hsvToRgb(h, s, v) {
  const i = Math.floor(h * 6);
  const f = h * 6 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);
  let r, g, b;
  switch (i % 6) {
    case 0: r=v; g=t; b=p; break;
    case 1: r=q; g=v; b=p; break;
    case 2: r=p; g=v; b=t; break;
    case 3: r=p; g=q; b=v; break;
    case 4: r=t; g=p; b=v; break;
    case 5: r=v; g=p; b=q; break;
    default: r=0; g=0; b=0;
  }
  return { r: Math.round(r*255), g: Math.round(g*255), b: Math.round(b*255) };
}

function _showLedStatus(msg, type = 'info') {
  const el = document.getElementById('led-status');
  const txt = document.getElementById('led-status-text');
  if (!el || !txt) return;
  el.className = `alert alert-${type} py-2`;
  txt.textContent = msg;
  el.classList.remove('d-none');
  setTimeout(() => el.classList.add('d-none'), 3000);
}

/* ── Animations ── */

function _stopLedAnimation() {
  if (_ledAnimationTimer) {
    clearInterval(_ledAnimationTimer);
    _ledAnimationTimer = null;
  }
}

function _startLedAnimation(effect) {
  _stopLedAnimation();
  if (effect === 'breathe') {
    let t = 0;
    _ledAnimationTimer = setInterval(() => {
      t += 0.05;
      const bright = Math.round(((Math.sin(t) + 1) / 2) * 255);
      const el = document.getElementById('led-brightness');
      const val = document.getElementById('led-brightness-val');
      if (el) el.value = bright;
      if (val) val.textContent = bright;
      const color = document.getElementById('led-color-picker')?.value || '#0040ff';
      _updatePreview(color, bright);
    }, 50);
  } else if (effect === 'rainbow') {
    _ledAnimationTimer = setInterval(() => {
      _ledRainbowHue = (_ledRainbowHue + 2) % 360;
      const { r, g, b } = _hsvToRgb(_ledRainbowHue / 360, 1, 1);
      const hex = `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`;
      const brightnessEl = document.getElementById('led-brightness');
      const brightness = parseInt(brightnessEl?.value || '255');
      _updatePreview(hex, brightness);
      const picker = document.getElementById('led-color-picker');
      if (picker) picker.value = hex;
    }, 30);
  }
}

/* ── Public Handlers (called from HTML onclick) ── */

export function ledColorChanged() {
  const color = document.getElementById('led-color-picker')?.value || '#0040ff';
  const brightness = parseInt(document.getElementById('led-brightness')?.value || '128');
  _updatePreview(color, brightness);
}

export function ledBrightnessChanged() {
  const val = document.getElementById('led-brightness')?.value || '128';
  const valEl = document.getElementById('led-brightness-val');
  if (valEl) valEl.textContent = val;
  const color = document.getElementById('led-color-picker')?.value || '#0040ff';
  _updatePreview(color, parseInt(val));
}

export function ledEffectChanged() {
  const effect = document.getElementById('led-effect')?.value || 'static';
  _stopLedAnimation();
  if (effect !== 'static') {
    _startLedAnimation(effect);
  }
}

export function setLedPreset(hex) {
  const picker = document.getElementById('led-color-picker');
  if (picker) picker.value = hex;
  const brightness = parseInt(document.getElementById('led-brightness')?.value || '128');
  _updatePreview(hex, brightness);
}

export function setPlayerLed(playerNum) {
  // Highlight active player button
  [1, 2, 3, 4].forEach(n => {
    document.getElementById(`led-p${n}`)?.classList.remove('btn-primary');
    document.getElementById(`led-p${n}`)?.classList.add('btn-outline-secondary');
  });
  document.getElementById(`led-p${playerNum}`)?.classList.remove('btn-outline-secondary');
  document.getElementById(`led-p${playerNum}`)?.classList.add('btn-primary');

  _showLedStatus(`Player ${playerNum} indicator set`, 'success');
}

export async function applyLedSettings() {
  if (!_ledController) {
    _showLedStatus('No controller connected', 'danger');
    return;
  }

  const effect = document.getElementById('led-effect')?.value || 'static';
  const brightness = parseInt(document.getElementById('led-brightness')?.value || '128');

  let r, g, b;

  if (effect === 'rainbow') {
    const rgb = _hsvToRgb(_ledRainbowHue / 360, 1, 1);
    r = rgb.r; g = rgb.g; b = rgb.b;
  } else {
    const hex = document.getElementById('led-color-picker')?.value || '#0040ff';
    const rgb = _hexToRgb(hex);
    r = rgb.r; g = rgb.g; b = rgb.b;
  }

  // Scale by brightness
  const scale = brightness / 255;
  r = Math.round(r * scale);
  g = Math.round(g * scale);
  b = Math.round(b * scale);

  try {
    // Try to call setLightbarColor if the controller supports it
    if (typeof _ledController?.setLightbarColor === 'function') {
      await _ledController.setLightbarColor(r, g, b);
      _showLedStatus(`LED applied: rgb(${r},${g},${b})`, 'success');
    } else if (typeof _ledController?.currentController?.setLightbarColor === 'function') {
      await _ledController.currentController.setLightbarColor(r, g, b);
      _showLedStatus(`LED applied: rgb(${r},${g},${b})`, 'success');
    } else {
      _showLedStatus('LED control not supported for this controller model', 'warning');
    }

    // Save to profile
    if (typeof _ledController?.getSerialNumber === 'function') {
      const sn = await _ledController.getSerialNumber();
      Storage.saveProfile(sn, { led: { r, g, b } });
    } else if (typeof _ledController?.currentController?.getSerialNumber === 'function') {
      const sn = await _ledController.currentController.getSerialNumber();
      Storage.saveProfile(sn, { led: { r, g, b } });
    }
  } catch (err) {
    _showLedStatus(`Error: ${err.message}`, 'danger');
  }
}
