const INTERNAL_NOTE_PATTERNS = [
	/公式ページに緯度経度なし/,
	/必要に応じて後段でジオコーディング/,
	/正確なジオコーディング未解決/,
	/座標は仮/,
	/geocod(?:e|ing)/i,
	/geocode_/i,
	/source[_ -]?payload/i,
	/raw[_ -]?source/i,
	/review[_ -]?comment/i,
	/private[_ -]?review/i,
	/内部メモ/,
	/要確認/
];

const TOKEN_BEARING_URL_PATTERNS = [
	/[?&]access_token=/i,
	/[?&]token=/i,
	/[?&]key=/i,
	/[?&]signature=/i,
	/[?&]sig=/i
];

export function containsInternalPublicNote(value: unknown): boolean {
	if (typeof value !== 'string') return false;
	return INTERNAL_NOTE_PATTERNS.some((pattern) => pattern.test(value));
}

export function sanitizePublicText(value: string | null | undefined): string | null {
	if (value == null) return null;
	const trimmed = value.trim();
	if (!trimmed) return null;
	return containsInternalPublicNote(trimmed) ? null : trimmed;
}

export function containsTokenBearingUrl(value: unknown): boolean {
	if (typeof value !== 'string') return false;
	return TOKEN_BEARING_URL_PATTERNS.some((pattern) => pattern.test(value));
}

export function isApprovedPublicMediaUrl(value: unknown): value is string {
	return typeof value === 'string' && value.trim().length > 0 && !containsTokenBearingUrl(value);
}
