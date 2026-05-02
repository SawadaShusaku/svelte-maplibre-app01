import type { CategoryId } from './types';

export interface WardMeta {
  prefecture: string;
  prefectureLabel: string;
  city: string;
  cityLabel: string;
  officialUrl?: string;
  categorySourceUrls?: Partial<Record<CategoryId, string>>;
}

interface GeoJsonFeatureCollection {
  features?: Array<{
    properties?: {
      prefecture?: string;
      city?: string;
      cityLabel?: string;
      officialUrl?: string;
      categoryUrls?: Partial<Record<CategoryId, string>>;
    };
  }>;
}

const PREFECTURE_LABELS: Record<string, string> = {
  tokyo: '東京都'
};

function toWardMeta(path: string, geojson: GeoJsonFeatureCollection): WardMeta | null {
  const match = path.match(/\.\/data\/([^/]+)\/([^/.]+)\.geojson$/);
  if (!match) return null;

  const [, prefectureFromPath, cityFromPath] = match;
  const firstFeature = geojson.features?.[0]?.properties;
  const prefecture = firstFeature?.prefecture ?? prefectureFromPath;
  const city = firstFeature?.city ?? cityFromPath;

  return {
    prefecture,
    prefectureLabel: PREFECTURE_LABELS[prefecture] ?? prefecture,
    city,
    cityLabel: firstFeature?.cityLabel ?? city,
    officialUrl: firstFeature?.officialUrl,
    categorySourceUrls: firstFeature?.categoryUrls
  };
}

const wardDataModules = import.meta.glob('./data/*/*.geojson', {
  eager: true,
  query: '?raw',
  import: 'default'
}) as Record<string, string>;

export const WARD_REGISTRY: WardMeta[] = Object.entries(wardDataModules)
  .map(([path, rawGeojson]) => toWardMeta(path, JSON.parse(rawGeojson) as GeoJsonFeatureCollection))
  .filter((ward): ward is WardMeta => ward !== null)
  .sort((a, b) => a.cityLabel.localeCompare(b.cityLabel, 'ja'));

/** 都道府県ごとにグループ化 */
export function groupByPrefecture(wards: WardMeta[]): Map<string, WardMeta[]> {
  const map = new Map<string, WardMeta[]>();
  for (const w of wards) {
    const list = map.get(w.prefecture) ?? [];
    list.push(w);
    map.set(w.prefecture, list);
  }
  return map;
}

export function getWardMeta(city: string): WardMeta | undefined {
  return WARD_REGISTRY.find((ward) => ward.city === city);
}

export function getCategorySourceUrl(city: string, categoryId: string): string | undefined {
  return getWardMeta(city)?.categorySourceUrls?.[categoryId as CategoryId];
}
