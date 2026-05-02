#!/usr/bin/env tsx
/**
 * Fix incomplete addresses using GSI and Google Geocoding APIs
 */
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

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

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

// Rate limiting
const DELAY_MS = 300;

function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

// ---------------------------------------------------------------------------
// Address validation (same as audit script)
// ---------------------------------------------------------------------------

function hasStreetNumber(addr: string): boolean {
	return /(\d+|[一二三四五六七八九十]+)(丁目|番(地|号)?|号|[-－]|[号室階]|ビル|マンション|アパート|ハイツ|コーポ|プラザ|センター|館|店)/.test(addr);
}

function isIncompleteAddress(addr: string): boolean {
	const normalized = addr.trim();
	if (/^.+?区$/.test(normalized) && !hasStreetNumber(normalized)) return true;
	if (/^.+?市$/.test(normalized) && !hasStreetNumber(normalized)) return true;
	if (/^.+?町$/.test(normalized) && !hasStreetNumber(normalized)) return true;
	if (/^.+\d+丁目$/.test(normalized)) return true;
	if (/^.+[一二三四五六七八九十]+丁目$/.test(normalized)) return true;
	return false;
}

// ---------------------------------------------------------------------------
// API clients
// ---------------------------------------------------------------------------

async function searchGsi(query: string): Promise<string | null> {
	const url = `https://msearch.gsi.go.jp/address-search/AddressSearch?q=${encodeURIComponent(query)}`;
	try {
		const res = await fetch(url);
		if (!res.ok) return null;
		const data = await res.json();
		if (!Array.isArray(data) || data.length === 0) return null;
		// Return the first match's address
		return data[0].properties?.title || null;
	} catch (e) {
		return null;
	}
}

async function searchGoogle(query: string): Promise<string | null> {
	if (!GOOGLE_API_KEY) return null;
	const url = new URL('https://maps.googleapis.com/maps/api/geocode/json');
	url.searchParams.set('address', query);
	url.searchParams.set('key', GOOGLE_API_KEY);
	url.searchParams.set('language', 'ja');
	url.searchParams.set('region', 'jp');

	try {
		const res = await fetch(url.toString());
		if (!res.ok) return null;
		const data = await res.json();
		if (data.status !== 'OK' || !data.results?.length) return null;
		return data.results[0].formatted_address;
	} catch (e) {
		return null;
	}
}

// ---------------------------------------------------------------------------
// Main logic
// ---------------------------------------------------------------------------

async function fixIncompleteAddresses() {
	const targetFile = process.argv[2];
	const files = targetFile 
		? [targetFile]
		: readdirSync('src/lib/data/tokyo')
			.filter(f => f.endsWith('.geojson'))
			.map(f => join('src/lib/data/tokyo', f));
	let fixedCount = 0;
	let skippedCount = 0;
	let failedCount = 0;

	for (const file of files) {
		let data: GeoJsonCollection;
		try {
			data = JSON.parse(readFileSync(file, 'utf-8'));
		} catch (e) {
			console.error(`\n❌ JSON parse error in ${file}: ${e}`);
			continue;
		}
		let modified = false;

		for (const feat of data.features) {
			const addr = feat.properties.address;
			if (!isIncompleteAddress(addr)) continue;

			const { id, name, cityLabel } = feat.properties;
			console.log(`\n🔍 Fixing ${id}: ${name}`);
			console.log(`   Current: ${addr}`);

			// Build search query using existing address + name
			// If address is just "東京都xx区", use name + cityLabel
			// Otherwise use the existing partial address + name
			let query: string;
			if (addr.includes('丁目') || addr.includes('番')) {
				query = `${addr} ${name}`;
			} else {
				query = `${cityLabel} ${name}`;
			}
			let newAddr: string | null = null;

			// Try GSI first with better query
			newAddr = await searchGsi(query);
			if (newAddr && !isIncompleteAddress(newAddr)) {
				console.log(`   → GSI: ${newAddr}`);
			} else {
				// Try Google with the same query
				await sleep(DELAY_MS);
				newAddr = await searchGoogle(query);
				if (newAddr) {
					console.log(`   → Google: ${newAddr}`);
				}
			}

			if (newAddr) {
				// Verify the new address is more complete
				if (!isIncompleteAddress(newAddr)) {
					feat.properties.address = newAddr;
					modified = true;
					fixedCount++;
					console.log(`   ✅ Fixed`);
				} else {
					console.log(`   ⚠️ Still incomplete: ${newAddr}`);
					skippedCount++;
				}
			} else {
				console.log(`   ❌ Could not find address`);
				failedCount++;
			}

			await sleep(DELAY_MS);
		}

		if (modified) {
			writeFileSync(file, JSON.stringify(data, null, 2), 'utf-8');
			console.log(`\n💾 Updated: ${file}`);
		}
	}

	console.log('\n' + '='.repeat(60));
	console.log('Address Fix Summary');
	console.log('='.repeat(60));
	console.log(`Fixed:   ${fixedCount}`);
	console.log(`Skipped: ${skippedCount}`);
	console.log(`Failed:  ${failedCount}`);
	console.log(`Total:   ${fixedCount + skippedCount + failedCount}`);
}

fixIncompleteAddresses().catch((e) => {
	console.error('❌ Fix failed:', e);
	process.exit(1);
});
