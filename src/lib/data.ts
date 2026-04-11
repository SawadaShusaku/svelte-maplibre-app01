import type { CategoryId, RecycleFacility } from './types.js';

export interface GeoFeature {
  type: 'Feature';
  geometry: { type: 'Point'; coordinates: [number, number] };
  properties: RecycleFacility;
}

interface GeoFeatureCollection {
  type: 'FeatureCollection';
  features: GeoFeature[];
}

// Vite が src/lib/data/**/*.geojson をすべて遅延インポート可能にする
const dataFiles = import.meta.glob<{ default: GeoFeatureCollection }>(
  './data/**/*.geojson'
);

/** prefecture/city に対応する GeoJSON を動的ロード */
export async function loadWard(prefecture: string, city: string): Promise<GeoFeature[]> {
  const key = `./data/${prefecture}/${city}.geojson`;
  const loader = dataFiles[key];
  if (!loader) {
    console.warn(`データファイルが見つかりません: ${key}`);
    return [];
  }
  const mod = await loader();
  return mod.default.features;
}

/** 選択中の区リストに対応する施設をロード・フィルタして返す */
export async function getFacilities(
  selectedCities: string[],
  selectedCategories: CategoryId[]
): Promise<GeoFeature[]> {
  if (selectedCities.length === 0 || selectedCategories.length === 0) return [];

  const allFeatures = (
    await Promise.all(
      selectedCities.map((cityKey) => {
        const [prefecture, city] = cityKey.split('/');
        return loadWard(prefecture, city);
      })
    )
  ).flat();

  return allFeatures.filter((f) =>
    f.properties.categories.some((c) => selectedCategories.includes(c))
  );
}
