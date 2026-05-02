#!/usr/bin/env node
/**
 * Process Tokyo CSV datasets for a single ward and append to GeoJSON.
 *
 * Usage:
 *   node scripts/process-ward-csvs.js <ward-name> <city-code> [city-label]
 *
 * Example:
 *   node scripts/process-ward-csvs.js 港区 minato
 *
 * This script:
 * 1. Filters tokyo_ink_with_address.csv for the ward (has lat/lon)
 * 2. Filters tokyo_jbrc_battery_shops.csv for the ward (has lat/lon)
 * 3. Filters tokyo_button_battery.csv for the ward, then geocodes addresses via GSI API
 * 4. Appends all features to src/lib/data/tokyo/{city-code}.geojson
 *
 * The GSI Address Search API is free; we add a 200ms delay between requests to be polite.
 */
const fs = require('fs');
const https = require('https');
const path = require('path');

const WARD_NAME = process.argv[2];
const CITY_CODE = process.argv[3];
const CITY_LABEL = process.argv[4] || WARD_NAME;

if (!WARD_NAME || !CITY_CODE) {
  console.error('Usage: node scripts/process-ward-csvs.js <ward-name> <city-code> [city-label]');
  console.error('  ward-name : e.g. 港区');
  console.error('  city-code : e.g. minato');
  console.error('  city-label: optional display label (defaults to ward-name)');
  process.exit(1);
}

const GEOJSON_DIR = path.join('src', 'lib', 'data', 'tokyo');
const GEOJSON_FILE = path.join(GEOJSON_DIR, `${CITY_CODE}.geojson`);
const CSV_DIR = 'docs';

// Load existing GeoJSON or create new one
let geojson;
if (fs.existsSync(GEOJSON_FILE)) {
  geojson = JSON.parse(fs.readFileSync(GEOJSON_FILE, 'utf8'));
  console.log(`Loaded existing ${GEOJSON_FILE} with ${geojson.features.length} features`);
} else {
  fs.mkdirSync(GEOJSON_DIR, { recursive: true });
  geojson = { type: 'FeatureCollection', features: [] };
  console.log(`Creating new GeoJSON: ${GEOJSON_FILE}`);
}

let nextId = geojson.features.length + 1;
function genId() {
  const id = `${CITY_CODE}-${String(nextId).padStart(3, '0')}`;
  nextId++;
  return id;
}

function makeFeature(name, address, lat, lon, categories, notes = '', url = '') {
  const officialUrl = url || `https://www.city.${CITY_CODE}.lg.jp/`;
  return {
    type: 'Feature',
    geometry: { type: 'Point', coordinates: [lon, lat] },
    properties: {
      id: genId(),
      prefecture: 'tokyo',
      city: CITY_CODE,
      cityLabel: CITY_LABEL,
      name,
      address,
      categories,
      hours: '',
      notes,
      officialUrl,
      categoryUrls: {}
    }
  };
}

/* ===================== 1. Ink Collection (has coordinates) ===================== */
function processInkCollection() {
  const file = path.join(CSV_DIR, 'tokyo_ink_with_address.csv');
  if (!fs.existsSync(file)) {
    console.log('  [skip] tokyo_ink_with_address.csv not found');
    return 0;
  }
  let content = fs.readFileSync(file, 'utf8');
  if (content.charCodeAt(0) === 0xFEFF) content = content.substring(1);

  const lines = content.split('\n');
  let added = 0;
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const cols = line.split(',');
    if (cols.length < 6) continue;
    if (cols[4] !== WARD_NAME) continue;

    const lat = parseFloat(cols[1]);
    const lon = parseFloat(cols[2]);
    const name = cols[5];
    if (isNaN(lat) || isNaN(lon)) continue;

    geojson.features.push(makeFeature(name, WARD_NAME, lat, lon, ['ink-cartridge']));
    added++;
  }
  console.log(`  Ink collection: ${added} added`);
  return added;
}

/* ===================== 2. JBRC Battery Shops (has coordinates) ===================== */
function processJbrcShops() {
  const file = path.join(CSV_DIR, 'tokyo_jbrc_battery_shops.csv');
  if (!fs.existsSync(file)) {
    console.log('  [skip] tokyo_jbrc_battery_shops.csv not found');
    return 0;
  }
  let content = fs.readFileSync(file, 'utf8');
  if (content.charCodeAt(0) === 0xFEFF) content = content.substring(1);

  const lines = content.split('\n');
  let added = 0;

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const parts = line.split(',');
    if (parts.length < 16) continue;

    const address1 = parts[9];
    if (!address1 || !address1.includes(WARD_NAME)) continue;

    const name = parts[6] || parts[5] || 'JBRC回収店';
    const lat = parseFloat(parts[parts.length - 3]);
    const lon = parseFloat(parts[parts.length - 2]);
    const fullAddress = parts[12] || parts[13] || '';

    if (isNaN(lat) || isNaN(lon)) continue;

    geojson.features.push(makeFeature(
      name.replace(/["]/g, '').trim(),
      fullAddress.replace(/["]/g, '').trim() || WARD_NAME,
      lat, lon,
      ['rechargeable-battery'],
      'JBRC（日本小型家電リサイクル協会）回収拠点'
    ));
    added++;
  }
  console.log(`  JBRC shops: ${added} added`);
  return added;
}

/* ===================== 3. Button Battery (needs geocoding) ===================== */
const GEOCODE_CACHE = '/tmp/tokyo_geocode_cache.json';
let geocodeCache = {};

function loadCache() {
  if (fs.existsSync(GEOCODE_CACHE)) {
    try {
      geocodeCache = JSON.parse(fs.readFileSync(GEOCODE_CACHE, 'utf8'));
    } catch {
      geocodeCache = {};
    }
  }
}

function saveCache() {
  fs.writeFileSync(GEOCODE_CACHE, JSON.stringify(geocodeCache, null, 2));
}

function geocodeAddress(address) {
  return new Promise((resolve, reject) => {
    const q = encodeURIComponent(address);
    const url = `https://msearch.gsi.go.jp/address-search/AddressSearch?q=${q}`;
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json && json.length > 0) {
            const [lon, lat] = json[0].geometry.coordinates;
            resolve({ lat, lon });
          } else {
            resolve(null);
          }
        } catch (e) {
          resolve(null);
        }
      });
    }).on('error', () => resolve(null));
  });
}

async function processButtonBattery() {
  const file = path.join(CSV_DIR, 'tokyo_button_battery.csv');
  if (!fs.existsSync(file)) {
    console.log('  [skip] tokyo_button_battery.csv not found');
    return 0;
  }

  let content = fs.readFileSync(file, 'utf8');
  if (content.charCodeAt(0) === 0xFEFF) content = content.substring(1);

  const lines = content.split('\n');
  const entries = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const lastComma = line.lastIndexOf(',');
    if (lastComma === -1) continue;

    const tel = line.substring(lastComma + 1).replace(/["]/g, '').trim();
    const rest = line.substring(0, lastComma);

    const firstComma = rest.indexOf(',');
    if (firstComma === -1) continue;

    const shopName = rest.substring(0, firstComma).replace(/["]/g, '').trim();
    const address = rest.substring(firstComma + 1).replace(/["]/g, '').trim();

    if (!address.includes(WARD_NAME)) continue;

    entries.push({ name: shopName, address, tel });
  }

  console.log(`  Button battery: ${entries.length} entries to geocode`);

  loadCache();
  let added = 0;
  let skipped = 0;

  for (const entry of entries) {
    const cleanAddr = entry.address.replace(/^\d{3}-\d{4}\s*/, '').replace(/\s+/g, '');
    const cacheKey = cleanAddr;

    let coords = geocodeCache[cacheKey];
    if (coords === undefined) {
      coords = await geocodeAddress(cleanAddr);
      geocodeCache[cacheKey] = coords;
      saveCache();
      await new Promise(r => setTimeout(r, 200));
    }

    if (coords) {
      geojson.features.push(makeFeature(
        entry.name,
        cleanAddr,
        coords.lat,
        coords.lon,
        ['button-battery'],
        entry.tel ? `TEL: ${entry.tel}` : ''
      ));
      added++;
    } else {
      console.log(`    [SKIP] No geocode: ${entry.name} | ${cleanAddr}`);
      skipped++;
    }
  }

  console.log(`  Button battery: ${added} geocoded, ${skipped} skipped`);
  return added;
}

/* ===================== Main ===================== */
async function main() {
  console.log(`Processing ${WARD_NAME} (${CITY_CODE})...\n`);

  const inkAdded = processInkCollection();
  const jbrcAdded = processJbrcShops();
  const bbAdded = await processButtonBattery();

  fs.writeFileSync(GEOJSON_FILE, JSON.stringify(geojson, null, 2));

  console.log(`\nTotal features in ${CITY_CODE}.geojson: ${geojson.features.length}`);

  const catCounts = {};
  for (const f of geojson.features) {
    for (const c of f.properties.categories) {
      catCounts[c] = (catCounts[c] || 0) + 1;
    }
  }
  console.log('Category summary:');
  for (const [cat, count] of Object.entries(catCounts).sort()) {
    console.log(`  ${cat}: ${count}`);
  }
}

main();
