export const SITE_NAME_JA = '全国リサイクルマップ';
export const SITE_NAME_EN = 'Japan Recycle Map';
export const SITE_NAME_KICKER = 'JAPAN RECYCLE MAP';

export function buildPageTitle(pageTitle?: string): string {
  return pageTitle ? `${pageTitle} | ${SITE_NAME_JA}` : SITE_NAME_JA;
}
