export type DedupablePlace = {
	id: string;
	name: string;
	address: string;
	prefecture?: string | null;
	ward_id?: string | null;
	city_label?: string | null;
	latitude?: number | null;
	longitude?: number | null;
	categories?: string[];
};

export type PlaceMergeDecision = {
	kind: 'auto-merge' | 'review' | 'separate';
	reasons: string[];
	distanceMeters: number | null;
};

export type DuplicateCandidate = {
	a: DedupablePlace;
	b: DedupablePlace;
	decision: PlaceMergeDecision;
};

const KANJI_NUMERALS: Record<string, string> = {
	一: '1',
	二: '2',
	三: '3',
	四: '4',
	五: '5',
	六: '6',
	七: '7',
	八: '8',
	九: '9'
};

const CORPORATE_PREFIXES = [
	/^株式会社/u,
	/^有限会社/u,
	/^合同会社/u,
	/^㈱/u,
	/^㈲/u,
	/^（株）/u,
	/^（有）/u,
	/^\(株\)/u,
	/^\(有\)/u
];

const CATEGORY_NAME_SUFFIXES = [
	/ストックヤード$/u,
	/回収(?:場所|拠点|箱|ボックス|協力店|窓口)$/u,
	/(?:廃食用油|廃油|インクカートリッジ|ボタン電池|乾電池|充電式電池|小型家電)(?:回収)?$/u,
	/(?:本庁舎|庁舎|本館|別館|１号館|1号館)$/u,
	/店頭$/u
];

function normalizeSpaces(value: string): string {
	return value.normalize('NFKC').replace(/\s+/g, '').trim();
}

function normalizeKanjiChome(value: string): string {
	return value.replace(/[一二三四五六七八九]丁目/g, (match) => `${KANJI_NUMERALS[match[0]]}丁目`);
}

export function normalizeJapaneseAddress(address: string): string {
	return normalizeKanjiChome(normalizeSpaces(address))
		.replace(/^〒?\d{3}-?\d{0,4}/, '')
		.replace(/[ヶケ]/g, 'ケ')
		.replace(/[−ー－―]/g, '-')
		.replace(/番地の/g, '-')
		.replace(/の/g, '-')
		.replace(/番地/g, '-')
		.replace(/番/g, '-')
		.replace(/号/g, '-')
		.replace(/丁目/g, '-')
		.replace(/−/g, '-')
		.replace(/--+/g, '-')
		.replace(/-$/g, '');
}

export function normalizePlaceName(name: string): string {
	let normalized = normalizeSpaces(name)
		.replace(/^㈱/u, '株式会社')
		.replace(/^㈲/u, '有限会社')
		.replace(/^（株）/u, '株式会社')
		.replace(/^（有）/u, '有限会社')
		.replace(/^(.*?[都道府県市区町村])/u, '')
		.replace(/（.*?）/gu, '')
		.replace(/\(.*?\)/gu, '');
	for (const prefix of CORPORATE_PREFIXES) {
		normalized = normalized.replace(prefix, '');
	}
	for (const suffix of CATEGORY_NAME_SUFFIXES) {
		normalized = normalized.replace(suffix, '');
	}
	return normalized;
}

export function createDedupeKey(place: Pick<DedupablePlace, 'name' | 'address' | 'prefecture' | 'ward_id' | 'city_label'>): string {
	const area = place.ward_id ?? place.city_label ?? '';
	return [
		place.prefecture ?? '',
		area,
		normalizeJapaneseAddress(place.address),
		normalizePlaceName(place.name)
	].join('|');
}

function hasSameAdminArea(a: DedupablePlace, b: DedupablePlace): boolean {
	const aArea = a.ward_id ?? a.city_label ?? '';
	const bArea = b.ward_id ?? b.city_label ?? '';
	return Boolean(aArea && bArea && aArea === bArea) && (a.prefecture ?? '') === (b.prefecture ?? '');
}

function duplicateBucketKey(place: DedupablePlace): string | null {
	const adminArea = place.ward_id ?? place.city_label ?? '';
	const normalizedAddress = normalizeJapaneseAddress(place.address);
	if (!adminArea || !normalizedAddress) return null;
	return `${place.prefecture ?? ''}|${adminArea}|${normalizedAddress}`;
}

export function distanceMeters(a: DedupablePlace, b: DedupablePlace): number | null {
	if (
		typeof a.latitude !== 'number' ||
		typeof a.longitude !== 'number' ||
		typeof b.latitude !== 'number' ||
		typeof b.longitude !== 'number'
	) {
		return null;
	}

	const radius = 6_371_000;
	const lat1 = (a.latitude * Math.PI) / 180;
	const lat2 = (b.latitude * Math.PI) / 180;
	const dLat = ((b.latitude - a.latitude) * Math.PI) / 180;
	const dLng = ((b.longitude - a.longitude) * Math.PI) / 180;
	const h =
		Math.sin(dLat / 2) ** 2 +
		Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
	return 2 * radius * Math.asin(Math.sqrt(h));
}

function namesCompatible(a: string, b: string): boolean {
	return a === b || a.includes(b) || b.includes(a);
}

export function decidePlaceMerge(a: DedupablePlace, b: DedupablePlace): PlaceMergeDecision {
	const reasons: string[] = [];
	const normalizedAddressA = normalizeJapaneseAddress(a.address);
	const normalizedAddressB = normalizeJapaneseAddress(b.address);
	const normalizedNameA = normalizePlaceName(a.name);
	const normalizedNameB = normalizePlaceName(b.name);
	const distance = distanceMeters(a, b);

	if (hasSameAdminArea(a, b)) reasons.push('same-admin-area');
	if (normalizedAddressA && normalizedAddressA === normalizedAddressB) reasons.push('same-normalized-address');
	if (namesCompatible(normalizedNameA, normalizedNameB)) reasons.push('compatible-normalized-name');
	if (distance != null && distance <= 40) reasons.push('compatible-coordinates');

	const hasStrongAddress = reasons.includes('same-admin-area') && reasons.includes('same-normalized-address');
	const hasStrongCoordinates = distance != null && distance <= 40;
	const hasCompatibleName = reasons.includes('compatible-normalized-name');

	if (hasStrongAddress && hasStrongCoordinates && hasCompatibleName) {
		return { kind: 'auto-merge', reasons, distanceMeters: distance };
	}
	if ((hasStrongAddress && hasCompatibleName) || (hasStrongAddress && hasStrongCoordinates) || (hasCompatibleName && hasStrongCoordinates)) {
		return { kind: 'review', reasons, distanceMeters: distance };
	}
	return { kind: 'separate', reasons, distanceMeters: distance };
}

export function findDuplicateCandidates(places: DedupablePlace[]): DuplicateCandidate[] {
	const candidates: DuplicateCandidate[] = [];
	const buckets = new Map<string, DedupablePlace[]>();

	for (const place of places) {
		const key = duplicateBucketKey(place);
		if (!key) continue;
		const bucket = buckets.get(key) ?? [];
		bucket.push(place);
		buckets.set(key, bucket);
	}

	for (const bucket of buckets.values()) {
		for (let i = 0; i < bucket.length; i += 1) {
			for (let j = i + 1; j < bucket.length; j += 1) {
				const decision = decidePlaceMerge(bucket[i], bucket[j]);
				if (decision.kind !== 'separate') {
					candidates.push({ a: bucket[i], b: bucket[j], decision });
				}
			}
		}
	}

	return candidates;
}

export function findAutoDuplicatePairs(places: DedupablePlace[]): DuplicateCandidate[] {
	return findDuplicateCandidates(places).filter((candidate) => candidate.decision.kind === 'auto-merge');
}

export function createAutoDuplicateRedirects(places: DedupablePlace[]): Map<string, string> {
	const redirects = new Map<string, string>();
	const resolve = (id: string): string => {
		let current = id;
		const seen = new Set<string>();
		while (redirects.has(current) && !seen.has(current)) {
			seen.add(current);
			current = redirects.get(current) ?? current;
		}
		return current;
	};

	for (const candidate of findAutoDuplicatePairs(places)) {
		const left = resolve(candidate.a.id);
		const right = resolve(candidate.b.id);
		if (left === right) continue;
		redirects.set(right, left);
	}

	for (const [from, to] of redirects) {
		redirects.set(from, resolve(to));
	}

	return redirects;
}

export function applyAutoDuplicateRedirects<T extends DedupablePlace>(places: T[], redirects: Map<string, string>): T[] {
	const merged = new Map<string, T>();

	for (const place of places) {
		const targetId = redirects.get(place.id) ?? place.id;
		const existing = merged.get(targetId);
		if (!existing) {
			merged.set(targetId, {
				...place,
				id: targetId,
				categories: [...(place.categories ?? [])]
			});
			continue;
		}

		existing.categories = [...new Set([...(existing.categories ?? []), ...(place.categories ?? [])])];
		if (normalizePlaceName(place.name).length < normalizePlaceName(existing.name).length) {
			existing.name = place.name;
		}
	}

	return [...merged.values()];
}

export function mergeAutoDuplicatePlaces(places: DedupablePlace[]): DedupablePlace[] {
	return applyAutoDuplicateRedirects(places, createAutoDuplicateRedirects(places));
}

export function findDuplicateCandidatesExhaustive(places: DedupablePlace[]): DuplicateCandidate[] {
	const candidates: DuplicateCandidate[] = [];
	for (let i = 0; i < places.length; i += 1) {
		for (let j = i + 1; j < places.length; j += 1) {
			const decision = decidePlaceMerge(places[i], places[j]);
			if (decision.kind !== 'separate') {
				candidates.push({ a: places[i], b: places[j], decision });
			}
		}
	}
	return candidates;
}

export function formatDuplicateReviewReport(candidates: DuplicateCandidate[]): string {
	const reviewCandidates = candidates.filter((candidate) => candidate.decision.kind === 'review');
	const lines = [
		'# Duplicate Place Review Candidates',
		'',
		'This report is private pipeline output and must not be committed as public app data.',
		'',
		'| left_id | right_id | left_name | right_name | reasons | distance_m |',
		'|---|---|---|---|---|---|'
	];

	for (const candidate of reviewCandidates) {
		lines.push([
			candidate.a.id,
			candidate.b.id,
			candidate.a.name,
			candidate.b.name,
			candidate.decision.reasons.join(', '),
			candidate.decision.distanceMeters == null ? '' : candidate.decision.distanceMeters.toFixed(1)
		].map((value) => String(value).replaceAll('|', '\\|')).join(' | ').replace(/^/, '| ').replace(/$/, ' |'));
	}

	return `${lines.join('\n')}\n`;
}
