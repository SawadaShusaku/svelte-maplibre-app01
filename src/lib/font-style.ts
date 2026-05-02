import type { LogoFont } from './types.js';

const STORAGE_KEY = 'recycling-map:logo-font';
const DEFAULT_FONT: LogoFont = 'dela-gothic';

const fontMap: Record<LogoFont, string> = {
  'dela-gothic': '"Dela Gothic One"',
  'zen-kaku-gothic': '"Zen Kaku Gothic New"',
  'm-plus-rounded': '"M PLUS Rounded 1c"',
  'klee-one': '"Klee One"',
};

function isLocalStorageAvailable(): boolean {
  try {
    return typeof localStorage !== 'undefined' && typeof localStorage.getItem === 'function';
  } catch {
    return false;
  }
}

export function getLogoFont(): LogoFont {
  if (!isLocalStorageAvailable()) return DEFAULT_FONT;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored && stored in fontMap) {
    return stored as LogoFont;
  }
  return DEFAULT_FONT;
}

export function setLogoFont(font: LogoFont): void {
  if (!isLocalStorageAvailable()) return;
  localStorage.setItem(STORAGE_KEY, font);
  applyLogoFont(font);
}

export function applyLogoFont(font: LogoFont): void {
  if (typeof document === 'undefined') return;
  document.documentElement.style.setProperty('--logo-font', fontMap[font]);
}

export function getLogoFontLabel(font: LogoFont): string {
  const labels: Record<LogoFont, string> = {
    'dela-gothic': 'Dela Gothic One（デフォルト）',
    'zen-kaku-gothic': 'Zen Kaku Gothic New',
    'm-plus-rounded': 'M PLUS Rounded 1c',
    'klee-one': 'Klee One',
  };
  return labels[font];
}
