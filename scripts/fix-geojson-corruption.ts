#!/usr/bin/env tsx
/**
 * GeoJSON Corruption Fix Script
 * Uses Google Geocoding API and Places API to repair corrupted names/addresses.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { globSync } from 'node:fs';
import { basename, relative } from 'node:path';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

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

interface FixResult {
	featureId: string;
	file: string;
	oldName: string;
	newName: string;
	oldAddress: string;
	newAddress: string;
	success: boolean;
	error?: string;
}

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
if (!GOOGLE_API_KEY) {
	console.error('❌ GOOGLE_API_KEY environment variable is required');
	process.exit(1);
}

const GEOCODING_API = 'https://maps.googleapis.com/maps/api/geocode/json';
const PLACES_API = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json';

// Rate limiting: Google Maps API has generous limits, but be polite
const DELAY_MS = 200;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchGeocode(lat: number, lng: number): Promise<string | null> {
	const url = new URL(GEOCODING_API);
	url.searchParams.set('latlng', `${lat},${lng}`);
	url.searchParams.set('key', GOOGLE_API_KEY);
	url.searchParams.set('language', 'ja');

	try {
		const res = await fetch(url.toString());
		if (!res.ok) {
			console.error(`Geocoding API error: ${res.status}`);
			return null;
		}
		const data = await res.json();
		if (data.status !== 'OK' || !data.results?.length) {
			console.error(`Geocoding API status: ${data.status}`);
			return null;
		}
		return data.results[0].formatted_address;
	} catch (e) {
		console.error(`Geocoding fetch error: ${e}`);
		return null;
	}
}

async function fetchPlaceName(lat: number, lng: number): Promise<string | null> {
	const url = new URL(PLACES_API);
	url.searchParams.set('location', `${lat},${lng}`);
	url.searchParams.set('radius', '50');
	url.searchParams.set('key', GOOGLE_API_KEY);
	url.searchParams.set('language', 'ja');

	try {
		const res = await fetch(url.toString());
		if (!res.ok) {
			console.error(`Places API error: ${res.status}`);
			return null;
		}
		const data = await res.json();
		if (data.status !== 'OK' || !data.results?.length) {
			console.error(`Places API status: ${data.status}`);
			return null;
		}
		// Return the nearest place name
		return data.results[0].name;
	} catch (e) {
		console.error(`Places fetch error: ${e}`);
		return null;
	}
}

function hasCorruption(text: string): boolean {
	return text.includes('\uFFFD');
}

function extractCleanPrefix(name: string): string | null {
	// Some names have format: "（株）ヤマダデンキ　ＬＡＢＩ　自由が丘 / �螢筌泪瀬妊鵐�　ＬＡＢＩ　自由が丘"
	const parts = name.split(/\s*\/\s*/);
	if (parts.length >= 2) {
		const clean = parts.find((p) => !hasCorruption(p));
		if (clean) return clean.trim();
	}
	return null;
}

function extractCleanSuffix(name: string): string | null {
	// Some names have format: "�螢灰献沺．灰献沺潺咼奪�カメラ南砂町SUNAMO店"
	// Extract the clean part after the last corrupted block
	// Split by U+FFFD and take the last part if it's mostly clean Japanese
	const parts = name.split('\uFFFD');
	if (parts.length >= 2) {
		const lastPart = parts[parts.length - 1].trim();
		// Check if last part is mostly valid Japanese characters
		if (lastPart.length >= 3 && /^[\p{Script=Han}\p{Script=Katakana}\p{Script=Hiragana}\w\s\-・．()（）]+$/u.test(lastPart)) {
			return lastPart;
		}
	}
	return null;
}

function extractCleanPart(name: string): string | null {
	// Try prefix first (clean / corrupted)
	const prefix = extractCleanPrefix(name);
	if (prefix) return prefix;
	
	// Then try suffix (corrupted + clean)
	const suffix = extractCleanSuffix(name);
	if (suffix) return suffix;
	
	return null;
}

// ---------------------------------------------------------------------------
// Main fix logic
// ---------------------------------------------------------------------------

async function fixCorruptedData(): Promise<FixResult[]> {
	const files = globSync('src/lib/data/**/*.geojson');
	const results: FixResult[] = [];

	for (const file of files) {
		const relFile = relative('.', file);
		const data: GeoJsonCollection = JSON.parse(readFileSync(file, 'utf-8'));
		let modified = false;

		for (const feat of data.features) {
			const props = feat.properties;
			const [lng, lat] = feat.geometry.coordinates;
			let nameFixed = false;
			let addressFixed = false;

			const oldName = props.name;
			const oldAddress = props.address;
			let newName = oldName;
			let newAddress = oldAddress;

			// Check name corruption
			if (hasCorruption(oldName)) {
				console.log(`🔧 Fixing ${props.id}: ${oldName.substring(0, 40)}...`);

				// Try to extract clean part (prefix or suffix)
				const cleanPart = extractCleanPart(oldName);
				if (cleanPart) {
					newName = cleanPart;
					nameFixed = true;
					console.log(`   → Extracted clean part: ${newName}`);
				} else {
					// Fetch from Google Places API as last resort
					const placeName = await fetchPlaceName(lat, lng);
					if (placeName && placeName !== '東京' && !placeName.includes('通り') && !placeName.includes('道路')) {
						newName = placeName;
						nameFixed = true;
						console.log(`   → Fetched from Places API: ${newName}`);
					} else {
						console.log(`   ⚠️ Could not determine name (Places: ${placeName ?? 'N/A'})`);
					}
				}
			}

			// Check address corruption
			if (hasCorruption(oldAddress)) {
				const geocodedAddress = await fetchGeocode(lat, lng);
				if (geocodedAddress) {
					newAddress = geocodedAddress;
					addressFixed = true;
					console.log(`   → Fetched from Geocoding API: ${newAddress}`);
				} else {
					console.log(`   ⚠️ Could not fetch address from API`);
				}
			}

			// Apply fixes
			if (nameFixed || addressFixed) {
				props.name = newName;
				props.address = newAddress;
				modified = true;

				results.push({
					featureId: props.id,
					file: relFile,
					oldName,
					newName,
					oldAddress,
					newAddress,
					success: nameFixed || addressFixed
				});
			}

			// Rate limit
			if (nameFixed || addressFixed) {
				await sleep(DELAY_MS);
			}
		}

		// Write back if modified
		if (modified) {
			// Backup original
			const backupPath = file + '.backup';
			if (!existsSync(backupPath)) {
				writeFileSync(backupPath, readFileSync(file, 'utf-8'));
				console.log(`📦 Backup created: ${backupPath}`);
			}
			writeFileSync(file, JSON.stringify(data, null, 2), 'utf-8');
			console.log(`✅ Updated: ${relFile}`);
		}
	}

	return results;
}

// ---------------------------------------------------------------------------
// Entrypoint
// ---------------------------------------------------------------------------

async function main() {
	console.log('🚀 Starting GeoJSON corruption fix...\n');
	console.log(`Using GOOGLE_API_KEY: ${GOOGLE_API_KEY?.substring(0, 10)}...\n`);

	const results = await fixCorruptedData();

	console.log('\n' + '='.repeat(60));
	console.log('Fix Results');
	console.log('='.repeat(60));
	console.log(`Total features fixed: ${results.length}`);

	if (results.length > 0) {
		console.log('\nDetails:');
		for (const r of results) {
			console.log(`\n${r.featureId} (${r.file}):`);
			if (r.oldName !== r.newName) {
				console.log(`  name: "${r.oldName.substring(0, 50)}..." → "${r.newName}"`);
			}
			if (r.oldAddress !== r.newAddress) {
				console.log(`  address: "${r.oldAddress.substring(0, 50)}..." → "${r.newAddress}"`);
			}
		}
	}

	console.log('\n✅ Fix complete. Run `npm run audit:data` to verify.');
}

main().catch((e) => {
	console.error('❌ Fix failed:', e);
	process.exit(1);
});
