import type { MarkerStyle } from './types.js';

const STORAGE_KEY = 'recycling-map:marker-style';
const SOLID_COLOR_KEY = 'recycling-map:solid-color';
const DEFAULT_STYLE: MarkerStyle = 'adaptive';
const DEFAULT_SOLID_COLOR = '#EF5350'; // Softer red

function isLocalStorageAvailable(): boolean {
  try {
    return typeof localStorage !== 'undefined' && typeof localStorage.getItem === 'function';
  } catch {
    return false;
  }
}

export function getMarkerStyle(): MarkerStyle {
  if (!isLocalStorageAvailable()) return DEFAULT_STYLE;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'adaptive' || stored === 'solid' || stored === 'gradient') {
    return stored;
  }
  return DEFAULT_STYLE;
}

export function setMarkerStyle(style: MarkerStyle): void {
  if (!isLocalStorageAvailable()) return;
  localStorage.setItem(STORAGE_KEY, style);
}

export function getSolidColor(): string {
  if (!isLocalStorageAvailable()) return DEFAULT_SOLID_COLOR;
  const stored = localStorage.getItem(SOLID_COLOR_KEY);
  if (stored && /^#[0-9A-Fa-f]{6}$/.test(stored)) {
    return stored;
  }
  return DEFAULT_SOLID_COLOR;
}

export function setSolidColor(color: string): void {
  if (!isLocalStorageAvailable()) return;
  localStorage.setItem(SOLID_COLOR_KEY, color);
}
