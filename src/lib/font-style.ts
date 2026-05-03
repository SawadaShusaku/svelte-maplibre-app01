import type { FontChoices, FontTarget, LogoFont } from './types.js';

const LEGACY_STORAGE_KEY = 'recycling-map:logo-font';
const STORAGE_KEY = 'recycling-map:font-choices';

const DEFAULT_CHOICES: FontChoices = {
  logo: 'dela-gothic',
  popup: 'klee-one',
  ui: 'zen-kaku-gothic',
};

const fontMap: Record<LogoFont, string> = {
  'dela-gothic': '"Dela Gothic One"',
  'zen-kaku-gothic': '"Zen Kaku Gothic New"',
  'm-plus-rounded': '"M PLUS Rounded 1c"',
  'klee-one': '"Klee One"',
};

const cssVarMap: Record<FontTarget, string> = {
  logo: '--font-logo',
  popup: '--font-popup',
  ui: '--font-ui',
};

function isLocalStorageAvailable(): boolean {
  try {
    return typeof localStorage !== 'undefined' && typeof localStorage.getItem === 'function';
  } catch {
    return false;
  }
}

function migrateLegacy(): FontChoices | null {
  if (!isLocalStorageAvailable()) return null;
  const legacy = localStorage.getItem(LEGACY_STORAGE_KEY);
  if (legacy && legacy in fontMap) {
    const choices: FontChoices = { ...DEFAULT_CHOICES, logo: legacy as LogoFont };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(choices));
    localStorage.removeItem(LEGACY_STORAGE_KEY);
    return choices;
  }
  return null;
}

export function getFontChoices(): FontChoices {
  if (!isLocalStorageAvailable()) return DEFAULT_CHOICES;

  const migrated = migrateLegacy();
  if (migrated) return migrated;

  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored) as Partial<FontChoices>;
      return {
        logo: parsed.logo && parsed.logo in fontMap ? parsed.logo : DEFAULT_CHOICES.logo,
        popup: parsed.popup && parsed.popup in fontMap ? parsed.popup : DEFAULT_CHOICES.popup,
        ui: parsed.ui && parsed.ui in fontMap ? parsed.ui : DEFAULT_CHOICES.ui,
      };
    } catch {
      return DEFAULT_CHOICES;
    }
  }
  return DEFAULT_CHOICES;
}

export function getFontChoice(target: FontTarget): LogoFont {
  return getFontChoices()[target];
}

export function setFontChoice(target: FontTarget, font: LogoFont): void {
  if (!isLocalStorageAvailable()) return;
  const choices = getFontChoices();
  choices[target] = font;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(choices));
  applyFontChoice(target, font);
}

export function applyFontChoice(target: FontTarget, font: LogoFont): void {
  if (typeof document === 'undefined') return;
  document.documentElement.style.setProperty(cssVarMap[target], fontMap[font]);
}

export function applyFontChoices(): void {
  if (typeof document === 'undefined') return;
  const choices = getFontChoices();
  (Object.keys(choices) as FontTarget[]).forEach((target) => {
    document.documentElement.style.setProperty(cssVarMap[target], fontMap[choices[target]]);
  });
}

export function getLogoFontLabel(font: LogoFont): string {
  const labels: Record<LogoFont, string> = {
    'dela-gothic': 'Dela Gothic One',
    'zen-kaku-gothic': 'Zen Kaku Gothic New',
    'm-plus-rounded': 'M PLUS Rounded 1c',
    'klee-one': 'Klee One',
  };
  return labels[font];
}
