#!/usr/bin/env tsx
/**
 * GeoJSON Data Quality Audit Script
 * Read-only: never modifies source files.
 */
import { readFileSync } from 'node:fs';
import { globSync } from 'node:fs';
import { writeFileSync } from 'node:fs';
import { basename, dirname, relative } from 'node:path';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Severity = 'error' | 'warning';

interface AuditIssue {
	file: string;
	featureId?: string;
	name?: string;
	address?: string;
	city?: string;
	categories?: string[];
	type: string;
	message: string;
	severity: Severity;
}

interface AuditReport {
	errors: AuditIssue[];
	warnings: AuditIssue[];
	summary: {
		files: number;
		features: number;
		errorCount: number;
		warningCount: number;
	};
}

interface FeatureProperties {
	id: string;
	prefecture: string;
	city: string;
	cityLabel: string;
	name: string;
	address: string;
	categories: string[];
	hours?: string;
	notes?: string;
	officialUrl?: string;
	categoryUrls?: Record<string, string>;
	[k: string]: unknown;
}

interface GeoJsonFeature {
	type: 'Feature';
	geometry: {
		type: 'Point';
		coordinates: [number, number];
	};
	properties: FeatureProperties;
}

interface GeoJsonCollection {
	type: 'FeatureCollection';
	features: GeoJsonFeature[];
}

// ---------------------------------------------------------------------------
// CLI arguments
// ---------------------------------------------------------------------------

const args = process.argv.slice(2);
const strictMode = args.includes('--strict');
const jsonMode = args.includes('--json');
const csvIndex = args.indexOf('--csv');
const csvPath = csvIndex >= 0 ? args[csvIndex + 1] : undefined;

// ---------------------------------------------------------------------------
// Load valid categories
// ---------------------------------------------------------------------------

const categoriesJson = JSON.parse(readFileSync('src/lib/db/categories.json', 'utf-8')) as {
	categories: Array<{ id: string }>;
};
const VALID_CATEGORY_IDS = new Set(categoriesJson.categories.map((c) => c.id));
const VALID_CATEGORY_IDS_WITH_DEPRECATED = new Set([...VALID_CATEGORY_IDS, 'battery']);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function addIssue(
	issues: AuditIssue[],
	file: string,
	featureId: string | undefined,
	name: string | undefined,
	address: string | undefined,
	city: string | undefined,
	categories: string[] | undefined,
	type: string,
	message: string,
	severity: Severity
) {
	issues.push({ file, featureId, name, address, city, categories, type, message, severity });
}

function normalizeAddress(addr: string): string {
	return addr
		.replace(/[０-９]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0xfee0))
		.replace(/[−—‑–]/g, '-')
		.replace(/\s+/g, ' ')
		.trim();
}

function hasStreetNumber(addr: string): boolean {
	// Matches: 1丁目, 1-2, 1番, 1号, 1番地, 1号室, ビル名, etc.
	return /(\d+|[一二三四五六七八九十]+)(丁目|番(地|号)?|号|[-－]|[号室階]|ビル|マンション|アパート|ハイツ|コーポ|プラザ|センター|館|店|ビル|ビルディング)/.test(addr);
}

function isIncompleteAddress(addr: string): boolean {
	// Just "北区" or "杉並区" or "東京都中央区" without any street/building info
	const normalized = addr.trim();
	if (/^.+?区$/.test(normalized) && !hasStreetNumber(normalized)) return true;
	if (/^.+?市$/.test(normalized) && !hasStreetNumber(normalized)) return true;
	if (/^.+?町$/.test(normalized) && !hasStreetNumber(normalized)) return true;
	// Ends with "丁目" only (no ban/building)
	if (/^.+\d+丁目$/.test(normalized)) return true;
	if (/^.+[一二三四五六七八九十]+丁目$/.test(normalized)) return true;
	return false;
}

// ---------------------------------------------------------------------------
// Validation rules
// ---------------------------------------------------------------------------

function validateCorruption(
	issues: AuditIssue[],
	file: string,
	feat: GeoJsonFeature
) {
	const { id, name, address, city, categories } = feat.properties;
	if (name.includes('\uFFFD')) {
		addIssue(issues, file, id, name, address, city, categories, '文字化け', `nameに文字化け文字(U+FFFD)が含まれています`, 'error');
	}
	if (address.includes('\uFFFD')) {
		addIssue(issues, file, id, name, address, city, categories, '文字化け', `addressに文字化け文字(U+FFFD)が含まれています`, 'error');
	}
}

function validateCityConsistency(
	issues: AuditIssue[],
	file: string,
	feat: GeoJsonFeature,
	expectedCity: string
) {
	const { id, name, address, city, cityLabel, categories } = feat.properties;
	if (city !== expectedCity) {
		addIssue(
			issues,
			file,
			id,
			name,
			address,
			city,
			categories,
			'city不整合',
			`ファイルパスの市区町村(${expectedCity})とproperties.city(${city})が一致しません`,
			'error'
		);
	}
	// Check address contains cityLabel (e.g. "東京都稲城市..." in shinagawa file)
	if (cityLabel && !address.includes(cityLabel)) {
		addIssue(
			issues,
			file,
			id,
			name,
			address,
			city,
			categories,
			'city不整合',
			`住所に ${cityLabel} が含まれていません（住所と市区町村が不整合の可能性があります）`,
			'error'
		);
	}
}

function validateRequiredProperties(
	issues: AuditIssue[],
	file: string,
	feat: GeoJsonFeature
) {
	const props = feat.properties;
	const { city, categories } = props;
	const required: (keyof FeatureProperties)[] = [
		'id',
		'prefecture',
		'city',
		'cityLabel',
		'name',
		'address',
		'categories'
	];
	for (const key of required) {
		if (props[key] === undefined || props[key] === null || props[key] === '') {
			addIssue(
				issues,
				file,
				props.id,
				props.name,
				props.address,
				city,
				categories,
				'必須プロパティ欠損',
				`必須プロパティ "${key}" が欠損または空です`,
				'error'
			);
		}
	}
	if (!Array.isArray(props.categories)) {
		addIssue(
			issues,
			file,
			props.id,
			props.name,
			props.address,
			city,
			categories,
			'必須プロパティ欠損',
			`"categories" が配列ではありません`,
			'error'
		);
	}
}

function validateIdFormat(
	issues: AuditIssue[],
	file: string,
	feat: GeoJsonFeature,
	expectedCity: string
) {
	const { id, name, address, city, categories } = feat.properties;
	const pattern = new RegExp(`^${expectedCity}-\\d+$`);
	if (!pattern.test(id)) {
		addIssue(
			issues,
			file,
			id,
			name,
			address,
			city,
			categories,
			'IDフォーマット違反',
			`id "${id}" が {city}-{number} 形式ではありません (期待: ${expectedCity}-{number})`,
			'error'
		);
	}
}

function validateCategories(
	issues: AuditIssue[],
	file: string,
	feat: GeoJsonFeature
) {
	const { id, name, address, city, categories } = feat.properties;
	for (const cat of categories) {
		if (cat === 'battery') {
			addIssue(
				issues,
				file,
				id,
				name,
				address,
				city,
				categories,
				'古いカテゴリID',
				`廃止されたカテゴリID "battery" が含まれています`,
				'error'
			);
		} else if (!VALID_CATEGORY_IDS.has(cat)) {
			addIssue(
				issues,
				file,
				id,
				name,
				address,
				city,
				categories,
				'未知のカテゴリID',
				`categories.json に定義されていないカテゴリID "${cat}" が含まれています`,
				'error'
			);
		}
	}
}

function validateAddressCompleteness(
	issues: AuditIssue[],
	file: string,
	feat: GeoJsonFeature
) {
	const { id, name, address, city, categories } = feat.properties;
	if (isIncompleteAddress(address)) {
		addIssue(
			issues,
			file,
			id,
			name,
			address,
			city,
			categories,
			'不完全住所',
			`住所が不完全です（区名・丁目のみ、番地・建物名が欠落している可能性があります）`,
			'warning'
		);
	}
}

// ---------------------------------------------------------------------------
// Main audit logic
// ---------------------------------------------------------------------------

function runAudit(): AuditReport {
	const files = globSync('src/lib/data/**/*.geojson');
	const allIssues: AuditIssue[] = [];
	const allIds = new Map<string, { file: string; name: string }>();
	const coordMap = new Map<string, Array<{ file: string; id: string; name: string }>>();
	const addrMap = new Map<string, Array<{ file: string; id: string; name: string }>>();

	let totalFeatures = 0;

	for (const file of files) {
		const relFile = relative('.', file);
		// Expected city from path: src/lib/data/tokyo/shinagawa.geojson -> shinagawa
		const fileName = basename(file, '.geojson');
		const expectedCity = fileName;

		let data: GeoJsonCollection;
		try {
			data = JSON.parse(readFileSync(file, 'utf-8')) as GeoJsonCollection;
		} catch (e) {
			addIssue(allIssues, relFile, undefined, undefined, undefined, undefined, undefined, 'JSONパースエラー', String(e), 'error');
			continue;
		}

		if (data.type !== 'FeatureCollection') {
			addIssue(allIssues, relFile, undefined, undefined, undefined, undefined, undefined, 'GeoJSON形式違反', 'type が FeatureCollection ではありません', 'error');
			continue;
		}

		if (!Array.isArray(data.features)) {
			addIssue(allIssues, relFile, undefined, undefined, undefined, undefined, undefined, 'GeoJSON形式違反', 'features が配列ではありません', 'error');
			continue;
		}

		console.log(`🔍 Auditing ${relFile} (${data.features.length} features)`);
		totalFeatures += data.features.length;

		for (const feat of data.features) {
			if (feat.type !== 'Feature') {
				addIssue(allIssues, relFile, undefined, undefined, undefined, undefined, undefined, 'Feature形式違反', 'Feature.type が "Feature" ではありません', 'error');
				continue;
			}

			validateCorruption(allIssues, relFile, feat);
			validateCityConsistency(allIssues, relFile, feat, expectedCity);
			validateRequiredProperties(allIssues, relFile, feat);
			validateCategories(allIssues, relFile, feat);
			validateAddressCompleteness(allIssues, relFile, feat);

			// ID uniqueness & format checks
			const { id, name, address, city, categories } = feat.properties;
			if (id) {
				validateIdFormat(allIssues, relFile, feat, expectedCity);
				if (allIds.has(id)) {
					const prev = allIds.get(id)!;
					addIssue(
						allIssues,
						relFile,
						id,
						name,
						address,
						city,
						categories,
						'ID重複',
						`id "${id}" が重複しています（先出: ${prev.file} / ${prev.name}）`,
						'error'
					);
				} else {
					allIds.set(id, { file: relFile, name });
				}
			}

			// Coordinate dedup
			if (feat.geometry?.coordinates) {
				const [lng, lat] = feat.geometry.coordinates;
				const coordKey = `${lat},${lng}`;
				if (!coordMap.has(coordKey)) coordMap.set(coordKey, []);
				coordMap.get(coordKey)!.push({ file: relFile, id, name });
			}

			// Address dedup (normalized)
			if (address) {
				const norm = normalizeAddress(address);
				if (!addrMap.has(norm)) addrMap.set(norm, []);
				addrMap.get(norm)!.push({ file: relFile, id, name });
			}
		}
	}

	// Report coordinate duplicates
	for (const [coordKey, entries] of coordMap) {
		if (entries.length > 1) {
			const ids = entries.map((e) => `${e.id}(${e.name})`).join(', ');
			for (const entry of entries) {
				addIssue(
					allIssues,
					entry.file,
					entry.id,
					entry.name,
					undefined,
					undefined,
					undefined,
					'座標重複',
					`同一座標(${coordKey})を持つ施設が ${entries.length} 件あります: ${ids}`,
					'warning'
				);
			}
		}
	}

	// Report address duplicates
	for (const [normAddr, entries] of addrMap) {
		if (entries.length > 1) {
			const ids = entries.map((e) => `${e.id}(${e.name})`).join(', ');
			for (const entry of entries) {
				addIssue(
					allIssues,
					entry.file,
					entry.id,
					entry.name,
					normAddr,
					undefined,
					undefined,
					'住所重複',
					`同一住所(正規化後)を持つ施設が ${entries.length} 件あります: ${ids}`,
					'warning'
				);
			}
		}
	}

	const errors = allIssues.filter((i) => i.severity === 'error');
	const warnings = allIssues.filter((i) => i.severity === 'warning');

	return {
		errors,
		warnings,
		summary: {
			files: files.length,
			features: totalFeatures,
			errorCount: errors.length,
			warningCount: warnings.length
		}
	};
}

// ---------------------------------------------------------------------------
// Reporters
// ---------------------------------------------------------------------------

function printConsoleReport(report: AuditReport) {
	const { errors, warnings, summary } = report;

	console.log('\n' + '='.repeat(60));
	console.log('GeoJSON Data Quality Audit Report');
	console.log('='.repeat(60));
	console.log(`Files audited : ${summary.files}`);
	console.log(`Features      : ${summary.features}`);
	console.log(`Errors        : ${summary.errorCount}`);
	console.log(`Warnings      : ${summary.warningCount}`);
	console.log('');

	if (errors.length > 0) {
		console.log('\x1b[31m--- ERRORS ---\x1b[0m');
		for (const issue of errors) {
			console.log(
				`\x1b[31m[ERROR]\x1b[0m ${issue.file} | ${issue.featureId ?? 'N/A'} | ${issue.type}: ${issue.message}`
			);
			if (issue.name) console.log(`        name: ${issue.name}`);
			if (issue.address) console.log(`        address: ${issue.address}`);
		}
	}

	if (warnings.length > 0) {
		console.log('\n\x1b[33m--- WARNINGS ---\x1b[0m');
		for (const issue of warnings) {
			console.log(
				`\x1b[33m[WARN]\x1b[0m ${issue.file} | ${issue.featureId ?? 'N/A'} | ${issue.type}: ${issue.message}`
			);
			if (issue.name) console.log(`        name: ${issue.name}`);
			if (issue.address) console.log(`        address: ${issue.address}`);
		}
	}

	if (errors.length === 0 && warnings.length === 0) {
		console.log('\x1b[32m✅ All checks passed!\x1b[0m');
	}
}

function printMarkdownTable(report: AuditReport) {
	const issues = [...report.errors, ...report.warnings];
	if (issues.length === 0) return;

	console.log('\n=== 修正必要データ一覧 ===\n');
	console.log('| ファイル | ID | 施設名 | 住所 | 問題 | 備考 |');
	console.log('|---|---|---|---|---|---|');
	for (const issue of issues) {
		const file = issue.file;
		const id = issue.featureId ?? '';
		const name = issue.name ?? '';
		const address = issue.address ?? '';
		const type = issue.type;
		const note = issue.message.replace(/\|/g, '\\|');
		console.log(`| ${file} | ${id} | ${name} | ${address} | ${type} | ${note} |`);
	}
	console.log('');
}

function writeCsv(report: AuditReport, path: string) {
	const issues = [...report.errors, ...report.warnings];
	const header = 'ファイル,ID,施設名,住所,問題,重大度,備考\n';
	const rows = issues
		.map((issue) => {
			const cols = [
				issue.file,
				issue.featureId ?? '',
				issue.name ?? '',
				issue.address ?? '',
				issue.type,
				issue.severity,
				issue.message
			];
			return cols.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',');
		})
		.join('\n');
	const bom = '\uFEFF';
	writeFileSync(path, bom + header + rows + '\n', 'utf-8');
	console.log(`\n📄 CSV report written to ${path}`);
}

function printJson(report: AuditReport) {
	console.log(JSON.stringify(report, null, 2));
}

function extractCityFromFile(file: string): string {
	const name = basename(file, '.geojson');
	return name;
}

function printCityCategoryMatrix(report: AuditReport) {
	// Collect all cities and categories
	const cities = new Set<string>();
	const categories = new Set<string>();
	const errorCounts = new Map<string, Map<string, number>>();
	const warningCounts = new Map<string, Map<string, number>>();

	for (const issue of report.errors) {
		const city = issue.city ?? extractCityFromFile(issue.file);
		cities.add(city);
		if (!errorCounts.has(city)) errorCounts.set(city, new Map());
		const cityMap = errorCounts.get(city)!;
		if (issue.categories) {
			for (const cat of issue.categories) {
				categories.add(cat);
				cityMap.set(cat, (cityMap.get(cat) ?? 0) + 1);
			}
		} else {
			categories.add('(unknown)');
			cityMap.set('(unknown)', (cityMap.get('(unknown)') ?? 0) + 1);
		}
	}

	for (const issue of report.warnings) {
		const city = issue.city ?? extractCityFromFile(issue.file);
		cities.add(city);
		if (!warningCounts.has(city)) warningCounts.set(city, new Map());
		const cityMap = warningCounts.get(city)!;
		if (issue.categories) {
			for (const cat of issue.categories) {
				categories.add(cat);
				cityMap.set(cat, (cityMap.get(cat) ?? 0) + 1);
			}
		} else {
			categories.add('(unknown)');
			cityMap.set('(unknown)', (cityMap.get('(unknown)') ?? 0) + 1);
		}
	}

	const sortedCities = Array.from(cities).sort();
	const sortedCategories = Array.from(categories).sort();

	if (sortedCities.length === 0 || sortedCategories.length === 0) return;

	console.log('\n=== 区 × カテゴリ 別 問題集計（ERROR）===\n');
	console.log('| 区 | ' + sortedCategories.join(' | ') + ' |');
	console.log('|' + '---|'.repeat(sortedCategories.length + 1));
	for (const city of sortedCities) {
		const cityMap = errorCounts.get(city) ?? new Map();
		const row = sortedCategories.map((cat) => {
			const count = cityMap.get(cat) ?? 0;
			return count > 0 ? `**${count}**` : '-';
		});
		console.log(`| ${city} | ${row.join(' | ')} |`);
	}

	console.log('\n=== 区 × カテゴリ 別 問題集計（WARNING）===\n');
	console.log('| 区 | ' + sortedCategories.join(' | ') + ' |');
	console.log('|' + '---|'.repeat(sortedCategories.length + 1));
	for (const city of sortedCities) {
		const cityMap = warningCounts.get(city) ?? new Map();
		const row = sortedCategories.map((cat) => {
			const count = cityMap.get(cat) ?? 0;
			return count > 0 ? `${count}` : '-';
		});
		console.log(`| ${city} | ${row.join(' | ')} |`);
	}
	console.log('');
}

// ---------------------------------------------------------------------------
// Entrypoint
// ---------------------------------------------------------------------------

const report = runAudit();

if (jsonMode) {
	printJson(report);
} else {
	printConsoleReport(report);
	printMarkdownTable(report);
	printCityCategoryMatrix(report);
}

if (csvPath) {
	writeCsv(report, csvPath);
}

const shouldFail = report.errors.length > 0 || (strictMode && report.warnings.length > 0);
if (shouldFail) {
	console.log('\n\x1b[31m❌ Audit failed. 修正データをご提供ください。\x1b[0m\n');
	process.exit(1);
} else {
	console.log('\n\x1b[32m✅ Audit passed.\x1b[0m\n');
	process.exit(0);
}
