import fs from 'node:fs';
import path from 'node:path';
import {
	applyAutoDuplicateRedirects,
	createAutoDuplicateRedirects,
	findDuplicateCandidates,
	formatDuplicateReviewReport,
	type DedupablePlace
} from '../src/lib/data-quality/place-dedup';
import {
	containsTokenBearingUrl,
	isApprovedPublicMediaUrl,
	sanitizePublicText
} from '../src/lib/public-data-quality';

type PublicFacilitySeed = DedupablePlace & Record<string, unknown>;
type FacilityCategorySeed = {
	facility_id: string;
	category_id: string;
};
type SourceLinkSeed = {
	facility_id: string;
	sources: unknown[];
};

type PublicDataSeed = {
	facilities?: PublicFacilitySeed[];
	facility_categories?: FacilityCategorySeed[];
	ward_categories?: Array<[string, string]>;
	source_links?: SourceLinkSeed[];
	[key: string]: unknown;
};

const [, , inputPath, outputPath, reviewPath] = process.argv;

if (!inputPath || !outputPath) {
	console.error('Usage: tsx scripts/dedupe-d1-public-data.ts /private/input-seed.json /private/output-seed.json [/private/duplicate-review.md] [--sql /private/output-seed.sql]');
	console.error('Generated seed data and review reports are private operational artifacts. Do not commit them.');
	process.exit(2);
}

function readSeed(filePath: string): PublicDataSeed {
	return JSON.parse(fs.readFileSync(path.resolve(filePath), 'utf-8')) as PublicDataSeed;
}

function asFacilityCategories(value: unknown): FacilityCategorySeed[] {
	if (!Array.isArray(value)) return [];
	return value.filter((entry): entry is FacilityCategorySeed => {
		return (
			typeof entry === 'object' &&
			entry !== null &&
			typeof (entry as FacilityCategorySeed).facility_id === 'string' &&
			typeof (entry as FacilityCategorySeed).category_id === 'string'
		);
	});
}

function asSourceLinks(value: unknown): SourceLinkSeed[] {
	if (!Array.isArray(value)) return [];
	return value.filter((entry): entry is SourceLinkSeed => {
		return (
			typeof entry === 'object' &&
			entry !== null &&
			typeof (entry as SourceLinkSeed).facility_id === 'string' &&
			Array.isArray((entry as SourceLinkSeed).sources)
		);
	});
}

function categoryList(value: unknown): string[] {
	if (!Array.isArray(value)) return [];
	return value.filter((category): category is string => typeof category === 'string' && category.trim().length > 0);
}

function sanitizeOptionalText(value: unknown): string | null {
	return sanitizePublicText(typeof value === 'string' ? value : null);
}

function sanitizeOptionalUrl(value: unknown): string | null {
	if (typeof value !== 'string') return null;
	const trimmed = value.trim();
	if (!trimmed || containsTokenBearingUrl(trimmed)) return null;
	return trimmed;
}

function sanitizeMediaUrl(value: unknown): string | null {
	if (!isApprovedPublicMediaUrl(value)) return null;
	return value.trim();
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

function remapFacilityCategories(
	facilityCategories: FacilityCategorySeed[],
	facilities: PublicFacilitySeed[],
	redirects: Map<string, string>
): FacilityCategorySeed[] {
	const categoriesByFacility = new Map<string, Set<string>>();
	for (const facility of facilities) {
		categoriesByFacility.set(facility.id, new Set(categoryList(facility.categories)));
	}

	for (const link of facilityCategories) {
		const facilityId = redirects.get(link.facility_id) ?? link.facility_id;
		const categories = categoriesByFacility.get(facilityId) ?? new Set<string>();
		categories.add(link.category_id);
		categoriesByFacility.set(facilityId, categories);
	}

	return [...categoriesByFacility.entries()].flatMap(([facility_id, categories]) =>
		[...categories].sort().map((category_id) => ({ facility_id, category_id }))
	);
}

function remapWardCategories(facilities: PublicFacilitySeed[], facilityCategories: FacilityCategorySeed[]): Array<[string, string]> {
	const wardByFacility = new Map(facilities.map((facility) => [facility.id, facility.ward_id]));
	const wardCategories = new Set<string>();
	for (const link of facilityCategories) {
		const wardId = wardByFacility.get(link.facility_id);
		if (wardId) wardCategories.add(`${wardId}\t${link.category_id}`);
	}
	return [...wardCategories].sort().map((entry) => entry.split('\t') as [string, string]);
}

function remapSourceLinks(sourceLinks: SourceLinkSeed[], redirects: Map<string, string>): SourceLinkSeed[] {
	const sourceMap = new Map<string, unknown[]>();
	for (const link of sourceLinks) {
		const facilityId = redirects.get(link.facility_id) ?? link.facility_id;
		const sources = sourceMap.get(facilityId) ?? [];
		sourceMap.set(facilityId, [...sources, ...link.sources]);
	}
	return [...sourceMap.entries()].map(([facility_id, sources]) => ({ facility_id, sources }));
}

function sqlString(value: unknown): string {
	if (value == null) return 'NULL';
	return `'${String(value).replaceAll("'", "''")}'`;
}

function sqlNumber(value: unknown): string {
	return typeof value === 'number' && Number.isFinite(value) ? String(value) : 'NULL';
}

function writeSql(seed: PublicDataSeed, sqlPath: string): void {
	const lines = [
		'PRAGMA foreign_keys = OFF;',
		'DELETE FROM facility_categories;',
		'DELETE FROM ward_categories;',
		'DELETE FROM facilities;',
		'DELETE FROM category_details;',
		'DELETE FROM wards;',
		'DELETE FROM collectors;',
		'DELETE FROM categories;',
		'PRAGMA foreign_keys = ON;'
	];
	const categories = Array.isArray(seed.categories) ? seed.categories : [];
	const collectors = Array.isArray(seed.collectors) ? seed.collectors : [];
	const wards = Array.isArray(seed.wards) ? seed.wards : [];
	const facilities = Array.isArray(seed.facilities) ? seed.facilities : [];
	const wardCategories = Array.isArray(seed.ward_categories) ? seed.ward_categories : [];
	const facilityCategories = asFacilityCategories(seed.facility_categories);

	for (const category of categories as Record<string, unknown>[]) {
		lines.push(
			`INSERT INTO categories (id, label, color, icon, sort_order) VALUES (${sqlString(category.id)}, ${sqlString(category.label)}, ${sqlString(category.color)}, ${sqlString(category.icon)}, ${Number(category.sort_order ?? 999)});`
		);
	}
	for (const collector of collectors as Record<string, unknown>[]) {
		lines.push(
			`INSERT INTO collectors (id, name, url) VALUES (${sqlString(collector.id)}, ${sqlString(collector.name)}, ${sqlString(collector.url)});`
		);
	}
	for (const ward of wards as Record<string, unknown>[]) {
		lines.push(
			`INSERT INTO wards (id, prefecture, city_label, url) VALUES (${sqlString(ward.id)}, ${sqlString(ward.prefecture)}, ${sqlString(ward.city_label)}, ${sqlString(ward.url)});`
		);
	}
	for (const facility of facilities) {
		lines.push(
			'INSERT INTO facilities (id, ward_id, name, address, latitude, longitude, url, official_url, category_urls, collector_id, hours, notes, image_url, image_alt, image_credit, image_source_url, mapillary_image_id) VALUES ' +
				`(${sqlString(facility.id)}, ${sqlString(facility.ward_id)}, ${sqlString(facility.name)}, ${sqlString(facility.address)}, ${sqlNumber(facility.latitude)}, ${sqlNumber(facility.longitude)}, ${sqlString(facility.url)}, ${sqlString(facility.official_url)}, ${sqlString(facility.category_urls)}, ${sqlString(facility.collector_id)}, ${sqlString(facility.hours)}, ${sqlString(facility.notes)}, ${sqlString(facility.image_url)}, ${sqlString(facility.image_alt)}, ${sqlString(facility.image_credit)}, ${sqlString(facility.image_source_url)}, ${sqlString(facility.mapillary_image_id)});`
		);
	}
	for (const entry of wardCategories) {
		if (!Array.isArray(entry) || entry.length < 2) continue;
		lines.push(
			`INSERT INTO ward_categories (ward_id, category_id) VALUES (${sqlString(entry[0])}, ${sqlString(entry[1])});`
		);
	}
	for (const link of facilityCategories) {
		lines.push(
			`INSERT INTO facility_categories (facility_id, category_id) VALUES (${sqlString(link.facility_id)}, ${sqlString(link.category_id)});`
		);
	}

	fs.mkdirSync(path.dirname(path.resolve(sqlPath)), { recursive: true });
	fs.writeFileSync(path.resolve(sqlPath), `${lines.join('\n')}\n`);
}

const seed = readSeed(inputPath);
const facilities = Array.isArray(seed.facilities) ? seed.facilities : [];
const redirects = createAutoDuplicateRedirects(facilities);
const dedupedFacilities = applyAutoDuplicateRedirects(facilities, redirects).map(sanitizeFacility);
const remappedFacilityCategories = remapFacilityCategories(
	asFacilityCategories(seed.facility_categories),
	dedupedFacilities,
	redirects
);
const remappedSeed = {
	...seed,
	facilities: dedupedFacilities,
	facility_categories: remappedFacilityCategories,
	ward_categories: remapWardCategories(dedupedFacilities, remappedFacilityCategories),
	source_links: remapSourceLinks(asSourceLinks(seed.source_links), redirects)
};
const duplicateCandidates = findDuplicateCandidates(facilities);
const reviewReport = formatDuplicateReviewReport(duplicateCandidates);

fs.mkdirSync(path.dirname(path.resolve(outputPath)), { recursive: true });
fs.writeFileSync(path.resolve(outputPath), `${JSON.stringify(remappedSeed, null, 2)}\n`);

if (reviewPath) {
	fs.mkdirSync(path.dirname(path.resolve(reviewPath)), { recursive: true });
	fs.writeFileSync(path.resolve(reviewPath), reviewReport);
}

const sqlFlagIndex = process.argv.indexOf('--sql');
const sqlPath = sqlFlagIndex >= 0 ? process.argv[sqlFlagIndex + 1] : undefined;
if (sqlPath) {
	writeSql(remappedSeed, sqlPath);
}

console.log(`D1 public data dedupe complete: ${facilities.length} -> ${dedupedFacilities.length} facilities`);
console.log(`Auto-merged duplicate facilities: ${redirects.size}`);
const reviewCount = duplicateCandidates.filter((candidate) => candidate.decision.kind === 'review').length;
if (reviewCount > 0) {
	console.log(`Review candidates: ${reviewCount}${reviewPath ? ` (${path.resolve(reviewPath)})` : ''}`);
}
