export const SITE_NAME_JA = '東京リサイクルマップ';
export const SITE_NAME_EN = 'Tokyo Recycle Map';
export const SITE_NAME_KICKER = 'TOKYO RECYCLE MAP';

export function buildPageTitle(pageTitle?: string): string {
  return pageTitle ? `${pageTitle} | ${SITE_NAME_JA}` : SITE_NAME_JA;
}
