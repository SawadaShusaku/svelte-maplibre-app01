import { error, json } from '@sveltejs/kit';
import { MAPILLARY_TOKEN } from '$env/static/private';
import type { RequestHandler } from './$types';

/**
 * Mapillary 画像検索プロキシ。
 *
 * - 入力: ?lng=139.x&lat=35.x[&radius=80][&limit=8]
 * - Cloudflare KV (binding `MAPILLARY_CACHE`) に 24 時間キャッシュ
 * - クライアントには整形済みサムネ配列のみ返す（Mapillary トークンは隠蔽）
 */

const ENDPOINT = 'https://graph.mapillary.com/images';
const CACHE_TTL_SECONDS = 60 * 60 * 24; // 24h
const DEFAULT_RADIUS_M = 80;
const DEFAULT_LIMIT = 12;
const MAX_LIMIT = 24;

type ApiImage = {
  id: string;
  thumb_1024_url?: string;
  captured_at?: number;
  is_pano?: boolean;
  compass_angle?: number;
  computed_compass_angle?: number;
  computed_geometry?: { type: string; coordinates: [number, number] };
  geometry?: { type: string; coordinates: [number, number] };
};

type Thumb = {
  id: string;
  url: string;
  capturedAt: number | null;
};

function bboxAround(lng: number, lat: number, meters: number): string {
  const dLat = meters / 111_000;
  const dLng = meters / (111_000 * Math.cos((lat * Math.PI) / 180));
  return [lng - dLng, lat - dLat, lng + dLng, lat + dLat].join(',');
}

function squaredDistance(a: [number, number], b: [number, number]): number {
  const dx = a[0] - b[0];
  const dy = a[1] - b[1];
  return dx * dx + dy * dy;
}

function bearing(from: [number, number], to: [number, number]): number {
  const [lng1, lat1] = from.map((v) => (v * Math.PI) / 180);
  const [lng2, lat2] = to.map((v) => (v * Math.PI) / 180);
  const y = Math.sin(lng2 - lng1) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(lng2 - lng1);
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

function angleDelta(a: number, b: number): number {
  return Math.abs(((a - b + 540) % 360) - 180);
}

function rankAndShape(images: ApiImage[], lng: number, lat: number, limit: number): Thumb[] {
  const target: [number, number] = [lng, lat];
  return images
    .filter((img) => Boolean(img.thumb_1024_url))
    .map((img) => {
      const coords = img.computed_geometry?.coordinates ?? img.geometry?.coordinates;
      const dist = coords ? squaredDistance(coords, target) : Infinity;
      const camAngle = img.computed_compass_angle ?? img.compass_angle;
      const facingDelta =
        coords && camAngle != null ? angleDelta(camAngle, bearing(coords, target)) : 90;
      const score = (img.is_pano ? 1e6 : 0) + dist * 1e8 + facingDelta * 0.5;
      return { img, score };
    })
    .sort((a, b) => a.score - b.score)
    .slice(0, limit)
    .map(({ img }) => ({
      id: img.id,
      url: img.thumb_1024_url!,
      capturedAt: img.captured_at ?? null,
    }));
}

export const GET: RequestHandler = async ({ url, platform }) => {
  const lng = Number(url.searchParams.get('lng'));
  const lat = Number(url.searchParams.get('lat'));
  const radius = Math.min(
    300,
    Math.max(20, Number(url.searchParams.get('radius')) || DEFAULT_RADIUS_M),
  );
  const limit = Math.min(
    MAX_LIMIT,
    Math.max(1, Number(url.searchParams.get('limit')) || DEFAULT_LIMIT),
  );

  if (!Number.isFinite(lng) || !Number.isFinite(lat)) {
    throw error(400, 'lng/lat required');
  }

  // ~10m grid (5 decimals at this latitude is ~1.1m, so we round to 4 to share cache across nearby clicks)
  const cacheKey = `mly:${lng.toFixed(4)}:${lat.toFixed(4)}:${radius}:${limit}`;
  const kv = platform?.env?.MAPILLARY_CACHE;

  if (kv) {
    const cached = await kv.get(cacheKey, { type: 'json' });
    if (cached) {
      return json(cached, {
        headers: { 'cache-control': 'public, max-age=300', 'x-cache': 'HIT' },
      });
    }
  }

  if (!MAPILLARY_TOKEN) {
    throw error(500, 'MAPILLARY_TOKEN secret not configured');
  }

  const apiUrl =
    `${ENDPOINT}?access_token=${encodeURIComponent(MAPILLARY_TOKEN)}` +
    `&bbox=${bboxAround(lng, lat, radius)}` +
    `&fields=id,thumb_1024_url,captured_at,is_pano,compass_angle,computed_compass_angle,computed_geometry,geometry` +
    `&limit=24`;

  const res = await fetch(apiUrl);
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    console.warn('[mapillary proxy] non-ok', res.status, body.slice(0, 200));
    return json({ thumbs: [] }, { headers: { 'x-cache': 'BYPASS' } });
  }

  const data = (await res.json()) as { data?: ApiImage[] };
  const thumbs = rankAndShape(data.data ?? [], lng, lat, limit);
  const payload = { thumbs };

  if (kv) {
    // ctx.waitUntil 相当: 失敗してもレスポンスは返したいので await しない
    void kv
      .put(cacheKey, JSON.stringify(payload), { expirationTtl: CACHE_TTL_SECONDS })
      .catch((err: unknown) => console.warn('[mapillary proxy] kv put failed', err));
  }

  return json(payload, {
    headers: { 'cache-control': 'public, max-age=300', 'x-cache': 'MISS' },
  });
};
