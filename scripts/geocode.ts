/**
 * ジオコーディングスクリプト
 * scripts/<name>.csv を読み込み、国土地理院APIで座標を取得して
 * src/lib/data/<prefecture>/<city>.geojson を生成する
 *
 * 使い方: npx tsx scripts/geocode.ts <csvfile>
 * 例:     npx tsx scripts/geocode.ts toshima
 *         npx tsx scripts/geocode.ts chiyoda
 */

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

type CategoryId =
  | 'battery' | 'fluorescent' | 'cooking-oil'
  | 'ink-cartridge' | 'small-appliance' | 'used-clothing';

interface FacilityRow {
  prefecture: string;
  city: string;
  cityLabel: string;
  name: string;
  address: string;
  categories: CategoryId[];
  hours: string;
  notes: string;
}

interface GeoFeature {
  type: 'Feature';
  geometry: { type: 'Point'; coordinates: [number, number] };
  properties: {
    id: string;
    prefecture: string;
    city: string;
    cityLabel: string;
    name: string;
    address: string;
    categories: CategoryId[];
    hours: string;
    notes: string;
  };
}

function parseCSV(content: string): FacilityRow[] {
  const lines = content.trim().split('\n');
  // header: prefecture,city,cityLabel,name,address,categories,hours,notes
  return lines.slice(1).map((line) => {
    const match = line.match(/^([^,]+),([^,]+),([^,]+),([^,]+),([^,]+),"?([^"]+)"?,([^,]*),(.*)$/);
    if (!match) {
      console.warn(`スキップ（パース失敗）: ${line}`);
      return null;
    }
    const [, prefecture, city, cityLabel, name, address, categoriesStr, hours, notes] = match;
    const categories = categoriesStr.split(',').map((c) => c.trim()) as CategoryId[];
    return {
      prefecture: prefecture.trim(),
      city: city.trim(),
      cityLabel: cityLabel.trim(),
      name: name.trim(),
      address: address.trim(),
      categories,
      hours: hours.trim(),
      notes: notes.trim(),
    };
  }).filter(Boolean) as FacilityRow[];
}

async function geocode(address: string): Promise<[number, number] | null> {
  const url = `https://msearch.gsi.go.jp/address-search/AddressSearch?q=${encodeURIComponent(address)}`;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json() as Array<{ geometry: { coordinates: [number, number] } }>;
    if (!data.length) { console.warn(`  ⚠ 座標取得失敗: ${address}`); return null; }
    const [lng, lat] = data[0].geometry.coordinates;
    console.log(`  ✓ ${address} → [${lng}, ${lat}]`);
    return [lng, lat];
  } catch (e) {
    console.warn(`  ⚠ APIエラー (${address}): ${e}`);
    return null;
  }
}

async function main() {
  const target = process.argv[2];
  if (!target) { console.error('使い方: npx tsx scripts/geocode.ts <csvname>'); process.exit(1); }

  const csvPath = join(ROOT, 'scripts', `${target}.csv`);
  const csvContent = readFileSync(csvPath, 'utf-8');
  const rows = parseCSV(csvContent);
  if (!rows.length) { console.error('行が読み込めませんでした'); process.exit(1); }

  const { prefecture, city } = rows[0];
  const outDir = join(ROOT, 'src', 'lib', 'data', prefecture);
  const outPath = join(outDir, `${city}.geojson`);
  mkdirSync(outDir, { recursive: true });

  console.log(`${rows.length} 件の施設を処理します → ${outPath}\n`);

  const features: GeoFeature[] = [];
  let failed = 0;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const id = `${row.city}-${String(i + 1).padStart(3, '0')}`;
    console.log(`[${i + 1}/${rows.length}] ${row.name}`);

    const coords = await geocode(row.address);
    if (!coords) { failed++; continue; }

    features.push({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: coords },
      properties: {
        id, prefecture: row.prefecture, city: row.city, cityLabel: row.cityLabel,
        name: row.name, address: row.address, categories: row.categories,
        hours: row.hours, notes: row.notes,
      },
    });

    await new Promise((r) => setTimeout(r, 100));
  }

  writeFileSync(outPath, JSON.stringify({ type: 'FeatureCollection', features }, null, 2), 'utf-8');
  console.log(`\n完了: ${features.length} 件を書き込みました`);
  if (failed > 0) console.warn(`⚠ ${failed} 件の座標取得に失敗しました`);
}

main().catch(console.error);
