export const SITE_NAME_JA = '全国リサイクルマップ';
export const SITE_NAME_EN = 'Japan Recycle Map';
export const SITE_NAME_KICKER = 'JAPAN RECYCLE MAP';

export function buildPageTitle(pageTitle?: string): string {
  return pageTitle ? `${pageTitle} | ${SITE_NAME_JA}` : SITE_NAME_JA;
}

export const SITE_URL = (() => {
  const configured = import.meta.env.PUBLIC_SITE_URL?.trim();
  if (configured) return configured;

  if (typeof window !== 'undefined') {
    return window.location.origin;
  }

  return 'https://recycle-map.jp';
})();
