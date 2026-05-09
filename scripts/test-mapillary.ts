/**
 * Mapillary API カバレッジテスト
 *
 * 使い方:
 *   MAPILLARY_TOKEN=MLY|xxxxx|yyyyy npx tsx scripts/test-mapillary.ts
 *
 * 各施設座標の周囲 50m 圏で画像を検索し、サムネ URL とキャプチャ日時を出力します。
 */

import Database from 'better-sqlite3';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const TOKEN = process.env.MAPILLARY_TOKEN;
if (!TOKEN) {
  console.error('Set MAPILLARY_TOKEN env var (https://www.mapillary.com/dashboard/developers).');
  process.exit(1);
}

const SAMPLE_COUNT = 12;
const RADIUS_M = 50; // 50m

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, '..', 'static', 'recycling.db');
const db = new Database(dbPath, { readonly: true });

type Facility = { id: string; name: string; lng: number; lat: number };

const rows = db
  .prepare(
    `SELECT id, name, longitude AS lng, latitude AS lat
     FROM facilities
     ORDER BY RANDOM()
     LIMIT ?`,
  )
  .all(SAMPLE_COUNT) as Facility[];

function bboxAround(lng: number, lat: number, meters: number): string {
  const dLat = meters / 111_000;
  const dLng = meters / (111_000 * Math.cos((lat * Math.PI) / 180));
  return [lng - dLng, lat - dLat, lng + dLng, lat + dLat].join(',');
}

type MapillaryImage = {
  id: string;
  thumb_1024_url?: string;
  captured_at?: number;
};

async function queryNearest(facility: Facility): Promise<MapillaryImage[]> {
  const bbox = bboxAround(facility.lng, facility.lat, RADIUS_M);
  const url =
    `https://graph.mapillary.com/images` +
    `?access_token=${encodeURIComponent(TOKEN!)}` +
    `&bbox=${bbox}` +
    `&fields=id,thumb_1024_url,captured_at` +
    `&limit=3`;

  const res = await fetch(url);
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`HTTP ${res.status}: ${txt.slice(0, 200)}`);
  }
  const data = (await res.json()) as { data: MapillaryImage[] };
  return data.data;
}

let hits = 0;
for (const f of rows) {
  try {
    const imgs = await queryNearest(f);
    const has = imgs.length > 0;
    if (has) hits++;
    console.log(
      `${has ? '✓' : '·'} ${f.name}  (${f.lng.toFixed(4)}, ${f.lat.toFixed(4)})  → ${imgs.length} images`,
    );
    if (has) {
      const top = imgs[0];
      const date = top.captured_at ? new Date(top.captured_at).toISOString().slice(0, 10) : '?';
      console.log(`     ${date}  ${top.thumb_1024_url}`);
    }
  } catch (err) {
    console.log(`✗ ${f.name}: ${(err as Error).message}`);
  }
}

console.log(`\nCoverage: ${hits}/${rows.length} (${((hits / rows.length) * 100).toFixed(0)}%) within ${RADIUS_M}m radius`);

db.close();
