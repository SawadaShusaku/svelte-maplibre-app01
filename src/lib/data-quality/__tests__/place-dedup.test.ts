import { describe, expect, it } from 'vitest';
import {
	decidePlaceMerge,
	findDuplicateCandidates,
	formatDuplicateReviewReport,
	mergeAutoDuplicatePlaces,
	normalizeJapaneseAddress,
	normalizePlaceName
} from '../place-dedup';
import type { DedupablePlace } from '../place-dedup';

const oilStockyard: DedupablePlace = {
	id: 'oil-kanda',
	name: '神田公園出張所ストックヤード',
	address: '東京都千代田区神田司町2-2',
	prefecture: '東京都',
	ward_id: 'chiyoda',
	city_label: '千代田区',
	latitude: 35.694,
	longitude: 139.768,
	categories: ['cooking-oil']
};

const inkBase: DedupablePlace = {
	id: 'ink-kanda',
	name: '神田公園出張所',
	address: '東京都千代田区神田司町二丁目２番地',
	prefecture: '東京都',
	ward_id: 'chiyoda',
	city_label: '千代田区',
	latitude: 35.69405,
	longitude: 139.76803,
	categories: ['ink-cartridge']
};

describe('place deduplication helpers', () => {
	it('normalizes Japanese address notation used by the known Kanda sample', () => {
		expect(normalizeJapaneseAddress('東京都千代田区神田司町2-2')).toBe(
			normalizeJapaneseAddress('東京都千代田区神田司町二丁目２番地')
		);
	});

	it('normalizes 番/号 notations to hyphen for cross-notation deduplication', () => {
		expect(normalizeJapaneseAddress('千代田区1番3号')).toBe(
			normalizeJapaneseAddress('千代田区1-3')
		);
	});

	it('removes category-specific name suffixes without erasing the base place name', () => {
		expect(normalizePlaceName('神田公園出張所ストックヤード')).toBe('神田公園出張所');
	});

	it('strips municipality prefix from place names', () => {
		expect(normalizePlaceName('城陽市 保健センター')).toBe('保健センター');
		expect(normalizePlaceName('東京都千代田区神田公園')).toBe('千代田区神田公園');
		expect(normalizePlaceName('千代田区神田公園')).toBe('神田公園');
	});

	it('auto-merges the known Kanda sample when address and coordinates are compatible', () => {
		const decision = decidePlaceMerge(oilStockyard, inkBase);
		expect(decision.kind).toBe('auto-merge');
		expect(decision.reasons).toContain('same-normalized-address');
		expect(decision.reasons).toContain('compatible-normalized-name');
		expect(decision.reasons).toContain('compatible-coordinates');
	});

	it('does not auto-merge similar names when coordinates are incompatible', () => {
		const farAway: DedupablePlace = {
			...inkBase,
			id: 'ink-other',
			latitude: 35.8,
			longitude: 139.9
		};

		expect(decidePlaceMerge(oilStockyard, farAway).kind).not.toBe('auto-merge');
	});

	it('merges categories for automatic duplicate public places', () => {
		const merged = mergeAutoDuplicatePlaces([oilStockyard, inkBase]);
		expect(merged).toHaveLength(1);
		expect(merged[0].categories?.sort()).toEqual(['cooking-oil', 'ink-cartridge']);
	});

	it('reports ambiguous candidates without treating vector similarity as an automatic merge input', () => {
		const missingCoordinates: DedupablePlace = {
			...inkBase,
			id: 'ink-review',
			latitude: null,
			longitude: null
		};

		const candidates = findDuplicateCandidates([oilStockyard, missingCoordinates]);
		expect(candidates).toHaveLength(1);
		expect(candidates[0].decision.kind).toBe('review');
		expect(formatDuplicateReviewReport(candidates)).toContain('ink-review');
	});
});
