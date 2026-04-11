/**
 * ジオコーディングスクリプト
 * scripts/facilities.csv を読み込み、国土地理院APIで座標を取得して
 * src/lib/data/toshima.geojson を生成する
 *
 * 使い方: npx tsx scripts/geocode.ts
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

type Category = 'battery' | 'fluorescent' | 'cooking-oil' | 'ink-cartridge' | 'small-appliance';

interface FacilityRow {
  name: string;
  address: string;
  categories: Category[];
  hours: string;
  notes: string;
}

interface GeoFeature {
  type: 'Feature';
  geometry: {
    type: 'Point';
    coordinates: [number, number];
  };
  properties: {
    id: string;
    ward: string;
    name: string;
    address: string;
    categories: Category[];
    hours: string;
    notes: string;
  };
}

interface GeoFeatureCollection {
  type: 'FeatureCollection';
  features: GeoFeature[];
}

function parseCSV(content: string): FacilityRow[] {
  const lines = content.trim().split('\n');
  const headers = lines[0].split(',');
  return lines.slice(1).map((line) => {
    // カンマ区切りだがcategoriesフィールドは"a,b,c"とクォートされている
    const match = line.match(/^([^,]+),([^,]+),"?([^"]+)"?,([^,]*),(.*)$/);
    if (!match) {
      console.warn(`スキップ（パース失敗）: ${line}`);
      return null;
    }
    const [, name, address, categoriesStr, hours, notes] = match;
    const categories = categoriesStr.split(',').map((c) => c.trim()) as Category[];
    return { name: name.trim(), address: address.trim(), categories, hours: hours.trim(), notes: notes.trim() };
  }).filter(Boolean) as FacilityRow[];
}

async function geocode(address: string): Promise<[number, number] | null> {
  const url = `https://msearch.gsi.go.jp/address-search/AddressSearch?q=${encodeURIComponent(address)}`;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json() as Array<{ geometry: { coordinates: [number, number] }; properties: { title: string } }>;
    if (!data.length) {
      console.warn(`  ⚠ 座標取得失敗: ${address}`);
      return null;
    }
    const [lng, lat] = data[0].geometry.coordinates;
    console.log(`  ✓ ${address} → [${lng}, ${lat}]`);
    return [lng, lat];
  } catch (e) {
    console.warn(`  ⚠ APIエラー (${address}): ${e}`);
    return null;
  }
}

async function main() {
  const csvPath = join(ROOT, 'scripts', 'facilities.csv');
  const outPath = join(ROOT, 'src', 'lib', 'data', 'toshima.geojson');

  const csvContent = readFileSync(csvPath, 'utf-8');
  const rows = parseCSV(csvContent);
  console.log(`${rows.length} 件の施設を処理します\n`);

  const features: GeoFeature[] = [];
  let failed = 0;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const id = `toshima-${String(i + 1).padStart('3', '0')}`;
    console.log(`[${i + 1}/${rows.length}] ${row.name}`);

    const coords = await geocode(row.address);
    if (!coords) {
      failed++;
      continue;
    }

    features.push({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: coords },
      properties: {
        id,
        ward: 'toshima',
        name: row.name,
        address: row.address,
        categories: row.categories,
        hours: row.hours,
        notes: row.notes,
      },
    });

    // APIレートリミット対策（100ms間隔）
    await new Promise((r) => setTimeout(r, 100));
  }

  const geojson: GeoFeatureCollection = { type: 'FeatureCollection', features };
  writeFileSync(outPath, JSON.stringify(geojson, null, 2), 'utf-8');

  console.log(`\n完了: ${features.length} 件を ${outPath} に書き込みました`);
  if (failed > 0) {
    console.warn(`⚠ ${failed} 件の座標取得に失敗しました。手動で補正してください。`);
  }
}

main().catch(console.error);
