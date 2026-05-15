import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {
	applyAutoDuplicateRedirects,
	createAutoDuplicateRedirects,
	createDedupeKey,
	findDuplicateCandidates,
	normalizeJapaneseAddress,
	type DedupablePlace
} from '../src/lib/data-quality/place-dedup';
import {
	containsTokenBearingUrl,
	isApprovedPublicMediaUrl,
	sanitizePublicText
} from '../src/lib/public-data-quality';

type SeedRecord = Record<string, unknown>;
type PublicFacilitySeed = DedupablePlace & SeedRecord;
type FacilityCategorySeed = { facility_id: string; category_id: string };
type NormalizedSeed = SeedRecord & {
	areas: SeedRecord[];
	data_sources: SeedRecord[];
	places: SeedRecord[];
	place_collection_entries: SeedRecord[];
	facilities: SeedRecord[];
	facility_categories: FacilityCategorySeed[];
	ward_categories: Array<[string, string]>;
};

const [, , inputPath, outputPath, reviewPath] = process.argv;

if (!inputPath || !outputPath) {
	console.error('Usage: tsx scripts/normalize-d1-public-data.ts /private/input-seed.json /private/output-seed.json [/private/group-review.md] [--sql /private/output-seed.sql] [--review-csv /private/group-review.csv]');
	console.error('Generated seed data and review reports are private operational artifacts. Do not commit them.');
	process.exit(2);
}

function text(value: unknown): string | null {
	return typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;
}

function sqlString(value: unknown): string {
	if (value == null) return 'NULL';
	return `'${String(value).replaceAll("'", "''")}'`;
}

function sqlNumber(value: unknown): string {
	return typeof value === 'number' && Number.isFinite(value) ? String(value) : 'NULL';
}

function hashId(prefix: string, value: string): string {
	return `${prefix}-${crypto.createHash('sha256').update(value).digest('hex').slice(0, 16)}`;
}

function readSeed(filePath: string): SeedRecord {
	return JSON.parse(fs.readFileSync(path.resolve(filePath), 'utf-8')) as SeedRecord;
}

function arrayOfRecords(value: unknown): SeedRecord[] {
	return Array.isArray(value) ? value.filter((item): item is SeedRecord => typeof item === 'object' && item !== null) : [];
}

function asFacilities(value: unknown): PublicFacilitySeed[] {
	return arrayOfRecords(value).filter((item): item is PublicFacilitySeed => {
		return typeof item.id === 'string' && typeof item.name === 'string' && typeof item.address === 'string';
	});
}

function categoryList(value: unknown): string[] {
	if (!Array.isArray(value)) return [];
	return [...new Set(value.filter((category): category is string => typeof category === 'string' && category.trim().length > 0))].sort();
}

function sanitizeOptionalText(value: unknown): string | null {
	return sanitizePublicText(typeof value === 'string' ? value : null);
}

function sanitizeOptionalUrl(value: unknown): string | null {
	const valueText = text(value);
	if (!valueText || containsTokenBearingUrl(valueText)) return null;
	return valueText;
}

function sanitizeMediaUrl(value: unknown): string | null {
	return isApprovedPublicMediaUrl(value) ? value.trim() : null;
}

function sanitizeFacility(facility: PublicFacilitySeed): PublicFacilitySeed {
	return {
		...facility,
		name: sanitizeOptionalText(facility.name) ?? facility.name,
		address: sanitizeOptionalText(facility.address) ?? facility.address,
		url: sanitizeOptionalUrl(facility.url),
		official_url: sanitizeOptionalUrl(facility.official_url),
		category_urls: sanitizeOptionalUrl(facility.category_urls),
		hours: sanitizeOptionalText(facility.hours),
		notes: sanitizeOptionalText(facility.notes),
		image_url: sanitizeMediaUrl(facility.image_url),
		image_alt: sanitizeOptionalText(facility.image_alt),
		image_credit: sanitizeOptionalText(facility.image_credit),
		image_source_url: sanitizeMediaUrl(facility.image_source_url),
		mapillary_image_id: sanitizeOptionalText(facility.mapillary_image_id)
	};
}

function sourceUrlForFacility(facility: SeedRecord): string | null {
	return sanitizeOptionalUrl(facility.official_url) ?? sanitizeOptionalUrl(facility.url);
}

function remapFacilityCategories(facilities: PublicFacilitySeed[], redirects: Map<string, string>): FacilityCategorySeed[] {
	const categoriesByFacility = new Map<string, Set<string>>();
	for (const facility of facilities) {
		const placeId = redirects.get(facility.id) ?? facility.id;
		const categories = categoriesByFacility.get(placeId) ?? new Set<string>();
		for (const category of categoryList(facility.categories)) categories.add(category);
		categoriesByFacility.set(placeId, categories);
	}
	return [...categoriesByFacility.entries()].flatMap(([facility_id, categories]) =>
		[...categories].sort().map((category_id) => ({ facility_id, category_id }))
	);
}

function buildNormalizedSeed(seed: SeedRecord): NormalizedSeed {
	const now = new Date().toISOString();
	const sourceFacilities = asFacilities(seed.facilities);
	const redirects = createAutoDuplicateRedirects(sourceFacilities);
	const dedupedFacilities = applyAutoDuplicateRedirects(sourceFacilities, redirects).map(sanitizeFacility);
	const placeById = new Map(dedupedFacilities.map((facility) => [facility.id, facility]));
	const facilityCategories = remapFacilityCategories(sourceFacilities, redirects);
	const categories = arrayOfRecords(seed.categories);
	const collectors = arrayOfRecords(seed.collectors);
	const wards = arrayOfRecords(seed.wards);

	const areas = wards.map((ward) => ({
		id: ward.id,
		prefecture: ward.prefecture,
		city_label: ward.city_label,
		normalized_label: text(ward.city_label)?.normalize('NFKC') ?? null,
		url: ward.url ?? null,
		is_active: 1,
		created_at: now,
		updated_at: now
	}));

	const dataSources = collectors.map((collector) => ({
		id: collector.id,
		name: collector.name,
		url: collector.url ?? '',
		organization_name: collector.name,
		license_note: null,
		last_fetched_at: now,
		is_active: 1,
		created_at: now,
		updated_at: now
	}));

	const knownDataSources = new Set(dataSources.map((source) => source.id));
	if (!knownDataSources.has('data-source-unknown')) {
		dataSources.push({
			id: 'data-source-unknown',
			name: '未分類データソース',
			url: 'https://example.invalid/',
			organization_name: null,
			license_note: null,
			last_fetched_at: now,
			is_active: 1,
			created_at: now,
			updated_at: now
		});
	}

	const places = dedupedFacilities.map((facility) => ({
		id: facility.id,
		area_id: facility.ward_id,
		canonical_name: facility.name,
		display_address: facility.address,
		normalized_address: normalizeJapaneseAddress(facility.address),
		latitude: facility.latitude,
		longitude: facility.longitude,
		dedupe_key: createDedupeKey(facility),
		url: sanitizeOptionalUrl(facility.url),
		image_url: sanitizeMediaUrl(facility.image_url),
		image_alt: sanitizeOptionalText(facility.image_alt),
		image_credit: sanitizeOptionalText(facility.image_credit),
		image_source_url: sanitizeMediaUrl(facility.image_source_url),
		mapillary_image_id: sanitizeOptionalText(facility.mapillary_image_id),
		is_active: 1,
		created_at: now,
		updated_at: now
	}));

	const entries: SeedRecord[] = [];
	const seenEntries = new Set<string>();
	for (const sourceFacility of sourceFacilities) {
		const placeId = redirects.get(sourceFacility.id) ?? sourceFacility.id;
		const place = placeById.get(placeId);
		if (!place) continue;
		const categoriesForFacility = categoryList(sourceFacility.categories);
		for (const categoryId of categoriesForFacility) {
			const entryKey = `${placeId}|${sourceFacility.id}|${categoryId}`;
			if (seenEntries.has(entryKey)) continue;
			seenEntries.add(entryKey);
			const dataSourceId = text(sourceFacility.collector_id) ?? 'data-source-unknown';
			entries.push({
				id: hashId('entry', entryKey),
				place_id: placeId,
				category_id: categoryId,
				data_source_id: knownDataSources.has(dataSourceId) ? dataSourceId : 'data-source-unknown',
				source_display_name: sanitizeOptionalText(sourceFacility.name),
				source_address: sanitizeOptionalText(sourceFacility.address),
				normalized_source_address: normalizeJapaneseAddress(sourceFacility.address),
				source_url: sourceUrlForFacility(sourceFacility),
				hours: sanitizeOptionalText(sourceFacility.hours),
				notes: sanitizeOptionalText(sourceFacility.notes),
				location_hint: null,
				image_url: sanitizeMediaUrl(sourceFacility.image_url),
				image_alt: sanitizeOptionalText(sourceFacility.image_alt),
				image_credit: sanitizeOptionalText(sourceFacility.image_credit),
				image_source_url: sanitizeMediaUrl(sourceFacility.image_source_url),
				mapillary_image_id: sanitizeOptionalText(sourceFacility.mapillary_image_id),
				source_fetched_at: now,
				source_published_at: null,
				is_active: 1,
				created_at: now,
				updated_at: now
			});
		}
	}

	const wardCategories = [...new Set(entries.map((entry) => `${placeById.get(String(entry.place_id))?.ward_id}\t${entry.category_id}`))]
		.filter((value) => !value.startsWith('undefined\t'))
		.sort()
		.map((entry) => entry.split('\t') as [string, string]);

	return {
		...seed,
		categories,
		collectors,
		wards,
		facilities: dedupedFacilities,
		facility_categories: facilityCategories,
		ward_categories: wardCategories,
		areas,
		data_sources: dataSources,
		places,
		place_collection_entries: entries
	};
}

function writeSql(seed: NormalizedSeed, sqlPath: string): void {
	const lines = [
		'PRAGMA foreign_keys = OFF;',
		'DELETE FROM place_collection_entries;',
		'DELETE FROM places;',
		'DELETE FROM data_sources;',
		'DELETE FROM areas;',
		'DELETE FROM facility_categories;',
		'DELETE FROM ward_categories;',
		'DELETE FROM facilities;',
		'DELETE FROM category_details;',
		'DELETE FROM wards;',
		'DELETE FROM collectors;',
		'DELETE FROM categories;',
		'PRAGMA foreign_keys = ON;'
	];

	for (const category of seed.categories) {
		lines.push(
			`INSERT INTO categories (id, label, color, icon, sort_order) VALUES (${sqlString(category.id)}, ${sqlString(category.label)}, ${sqlString(category.color)}, ${sqlString(category.icon)}, ${Number(category.sort_order ?? 999)});`
		);
	}
	for (const source of seed.data_sources) {
		lines.push(
			`INSERT INTO data_sources (id, name, url, organization_name, license_note, last_fetched_at, is_active, created_at, updated_at) VALUES (${sqlString(source.id)}, ${sqlString(source.name)}, ${sqlString(source.url)}, ${sqlString(source.organization_name)}, ${sqlString(source.license_note)}, ${sqlString(source.last_fetched_at)}, ${Number(source.is_active ?? 1)}, ${sqlString(source.created_at)}, ${sqlString(source.updated_at)});`
		);
	}
	for (const collector of seed.collectors) {
		lines.push(
			`INSERT INTO collectors (id, name, url) VALUES (${sqlString(collector.id)}, ${sqlString(collector.name)}, ${sqlString(collector.url)});`
		);
	}
	for (const area of seed.areas) {
		lines.push(
			`INSERT INTO areas (id, prefecture, city_label, normalized_label, url, is_active, created_at, updated_at) VALUES (${sqlString(area.id)}, ${sqlString(area.prefecture)}, ${sqlString(area.city_label)}, ${sqlString(area.normalized_label)}, ${sqlString(area.url)}, ${Number(area.is_active ?? 1)}, ${sqlString(area.created_at)}, ${sqlString(area.updated_at)});`
		);
		lines.push(
			`INSERT INTO wards (id, prefecture, city_label, url) VALUES (${sqlString(area.id)}, ${sqlString(area.prefecture)}, ${sqlString(area.city_label)}, ${sqlString(area.url)});`
		);
	}
	for (const place of seed.places) {
		lines.push(
			'INSERT INTO places (id, area_id, canonical_name, display_address, normalized_address, latitude, longitude, dedupe_key, url, image_url, image_alt, image_credit, image_source_url, mapillary_image_id, is_active, created_at, updated_at) VALUES ' +
				`(${sqlString(place.id)}, ${sqlString(place.area_id)}, ${sqlString(place.canonical_name)}, ${sqlString(place.display_address)}, ${sqlString(place.normalized_address)}, ${sqlNumber(place.latitude)}, ${sqlNumber(place.longitude)}, ${sqlString(place.dedupe_key)}, ${sqlString(place.url)}, ${sqlString(place.image_url)}, ${sqlString(place.image_alt)}, ${sqlString(place.image_credit)}, ${sqlString(place.image_source_url)}, ${sqlString(place.mapillary_image_id)}, ${Number(place.is_active ?? 1)}, ${sqlString(place.created_at)}, ${sqlString(place.updated_at)});`
		);
	}
	for (const facility of seed.facilities) {
		lines.push(
			'INSERT INTO facilities (id, ward_id, name, address, latitude, longitude, url, official_url, category_urls, collector_id, hours, notes, image_url, image_alt, image_credit, image_source_url, mapillary_image_id) VALUES ' +
				`(${sqlString(facility.id)}, ${sqlString(facility.ward_id)}, ${sqlString(facility.name)}, ${sqlString(facility.address)}, ${sqlNumber(facility.latitude)}, ${sqlNumber(facility.longitude)}, ${sqlString(facility.url)}, ${sqlString(facility.official_url)}, ${sqlString(facility.category_urls)}, ${sqlString(facility.collector_id)}, ${sqlString(facility.hours)}, ${sqlString(facility.notes)}, ${sqlString(facility.image_url)}, ${sqlString(facility.image_alt)}, ${sqlString(facility.image_credit)}, ${sqlString(facility.image_source_url)}, ${sqlString(facility.mapillary_image_id)});`
		);
	}
	for (const entry of seed.ward_categories) {
		lines.push(
			`INSERT INTO ward_categories (ward_id, category_id) VALUES (${sqlString(entry[0])}, ${sqlString(entry[1])});`
		);
	}
	for (const link of seed.facility_categories) {
		lines.push(
			`INSERT INTO facility_categories (facility_id, category_id) VALUES (${sqlString(link.facility_id)}, ${sqlString(link.category_id)});`
		);
	}
	for (const entry of seed.place_collection_entries) {
		lines.push(
			'INSERT INTO place_collection_entries (id, place_id, category_id, data_source_id, source_display_name, source_address, normalized_source_address, source_url, hours, notes, location_hint, image_url, image_alt, image_credit, image_source_url, mapillary_image_id, source_fetched_at, source_published_at, is_active, created_at, updated_at) VALUES ' +
				`(${sqlString(entry.id)}, ${sqlString(entry.place_id)}, ${sqlString(entry.category_id)}, ${sqlString(entry.data_source_id)}, ${sqlString(entry.source_display_name)}, ${sqlString(entry.source_address)}, ${sqlString(entry.normalized_source_address)}, ${sqlString(entry.source_url)}, ${sqlString(entry.hours)}, ${sqlString(entry.notes)}, ${sqlString(entry.location_hint)}, ${sqlString(entry.image_url)}, ${sqlString(entry.image_alt)}, ${sqlString(entry.image_credit)}, ${sqlString(entry.image_source_url)}, ${sqlString(entry.mapillary_image_id)}, ${sqlString(entry.source_fetched_at)}, ${sqlString(entry.source_published_at)}, ${Number(entry.is_active ?? 1)}, ${sqlString(entry.created_at)}, ${sqlString(entry.updated_at)});`
		);
	}

	fs.mkdirSync(path.dirname(path.resolve(sqlPath)), { recursive: true });
	fs.writeFileSync(path.resolve(sqlPath), `${lines.join('\n')}\n`);
}

function writeGroupReview(seed: NormalizedSeed, reviewMdPath?: string, reviewCsvPath?: string): number {
	const placesById = new Map(seed.places.map((place) => [String(place.id), place]));
	const candidates = findDuplicateCandidates(seed.facilities.map((facility) => ({
		id: String(facility.id),
		name: String(facility.name),
		address: String(facility.address),
		prefecture: text(facility.prefecture) ?? undefined,
		ward_id: text(facility.ward_id) ?? undefined,
		city_label: text(facility.city_label) ?? undefined,
		coordinate_source: text(facility.coordinate_source) ?? undefined,
		geocode_location_type: text(facility.geocode_location_type) ?? undefined,
		categories: categoryList(facility.categories),
		latitude: typeof facility.latitude === 'number' ? facility.latitude : null,
		longitude: typeof facility.longitude === 'number' ? facility.longitude : null
	}))).filter((candidate) => candidate.decision.kind === 'review');

	const groupRows = candidates.flatMap((candidate) => [
		{ group_id: hashId('review-group', `${candidate.a.id}|${candidate.b.id}`), place: placesById.get(candidate.a.id), reasons: candidate.decision.reasons.join(';'), distance: candidate.decision.distanceMeters },
		{ group_id: hashId('review-group', `${candidate.a.id}|${candidate.b.id}`), place: placesById.get(candidate.b.id), reasons: candidate.decision.reasons.join(';'), distance: candidate.decision.distanceMeters }
	]).filter((row): row is { group_id: string; place: SeedRecord; reasons: string; distance: number | null } => Boolean(row.place));

	if (reviewMdPath) {
		const lines = [
			'# Duplicate Place Group Review',
			'',
			'自動統合せず、人間確認に残した場所候補です。left/right ではなく group_id 単位で確認します。',
			'',
			'| group_id | place_id | name | address | normalized_address | reasons | distance_m |',
			'|---|---|---|---|---|---|---|'
		];
		for (const row of groupRows) {
			const cells = [
				row.group_id,
				row.place.id,
				row.place.canonical_name,
				row.place.display_address,
				row.place.normalized_address,
				row.reasons,
				row.distance == null ? '' : row.distance.toFixed(1)
			].map((value) => String(value ?? '').replaceAll('|', '\\|'));
			lines.push(`| ${cells.join(' | ')} |`);
		}
		fs.mkdirSync(path.dirname(path.resolve(reviewMdPath)), { recursive: true });
		fs.writeFileSync(path.resolve(reviewMdPath), `${lines.join('\n')}\n`);
	}

	if (reviewCsvPath) {
		const esc = (value: unknown) => `"${String(value ?? '').replaceAll('"', '""')}"`;
		const rows = [['group_id', 'place_id', 'name', 'address', 'normalized_address', 'reasons', 'distance_m']];
		for (const row of groupRows) {
			rows.push([
				row.group_id,
				String(row.place.id ?? ''),
				String(row.place.canonical_name ?? ''),
				String(row.place.display_address ?? ''),
				String(row.place.normalized_address ?? ''),
				row.reasons,
				row.distance == null ? '' : row.distance.toFixed(1)
			]);
		}
		fs.mkdirSync(path.dirname(path.resolve(reviewCsvPath)), { recursive: true });
		fs.writeFileSync(path.resolve(reviewCsvPath), `${rows.map((row) => row.map(esc).join(',')).join('\n')}\n`);
	}

	return candidates.length;
}

const seed = readSeed(inputPath);
const normalizedSeed = buildNormalizedSeed(seed);
fs.mkdirSync(path.dirname(path.resolve(outputPath)), { recursive: true });
fs.writeFileSync(path.resolve(outputPath), `${JSON.stringify(normalizedSeed, null, 2)}\n`);

const sqlFlagIndex = process.argv.indexOf('--sql');
const sqlPath = sqlFlagIndex >= 0 ? process.argv[sqlFlagIndex + 1] : undefined;
if (sqlPath) writeSql(normalizedSeed, sqlPath);

const reviewCsvFlagIndex = process.argv.indexOf('--review-csv');
const reviewCsvPath = reviewCsvFlagIndex >= 0 ? process.argv[reviewCsvFlagIndex + 1] : undefined;
const reviewCount = writeGroupReview(normalizedSeed, reviewPath, reviewCsvPath);

console.log(`Normalized D1 public data generated: ${normalizedSeed.places.length} places, ${normalizedSeed.place_collection_entries.length} collection entries`);
console.log(`Group review candidates: ${reviewCount}`);
