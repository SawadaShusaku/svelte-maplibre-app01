/**
 * Mapillary 画像取得（クライアント側）。
 *
 * `/api/mapillary` プロキシ越しに呼び出します。プロキシ側で:
 *   - Mapillary トークンを保持（クライアントには露出しない）
 *   - Cloudflare KV で 24 時間キャッシュ
 *   - 360°除外・距離・向きでスコアリングしてサムネ配列を返す
 * 失敗時は空配列を返し、呼び出し側はミニマップへフォールバックします。
 */

const DEFAULT_RADIUS_M = 80;
const DEFAULT_LIMIT = 12;

export type MapillaryThumb = {
  id: string;
  url: string;
  capturedAt: number | null;
};

const cache = new Map<string, Promise<MapillaryThumb[]>>();

export function fetchNearbyThumbs(
  lng: number,
  lat: number,
  options: { radiusM?: number; limit?: number } = {},
): Promise<MapillaryThumb[]> {
  const radius = options.radiusM ?? DEFAULT_RADIUS_M;
  const limit = options.limit ?? DEFAULT_LIMIT;
  const cacheKey = `${lng.toFixed(5)}|${lat.toFixed(5)}|${radius}|${limit}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const promise = (async (): Promise<MapillaryThumb[]> => {
    const params = new URLSearchParams({
      lng: String(lng),
      lat: String(lat),
      radius: String(radius),
      limit: String(limit),
    });
    try {
      const res = await fetch(`/api/mapillary?${params}`);
      if (!res.ok) return [];
      const data = (await res.json()) as { thumbs?: MapillaryThumb[] };
      return data.thumbs ?? [];
    } catch (err) {
      console.warn('[mapillary] proxy fetch failed', err);
      return [];
    }
  })();

  cache.set(cacheKey, promise);
  return promise;
}
