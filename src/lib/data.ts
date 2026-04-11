import type { CategoryId, RecycleFacility } from './types.js';
import toshimaData from './data/toshima.geojson';

interface GeoFeature {
  type: 'Feature';
  geometry: { type: 'Point'; coordinates: [number, number] };
  properties: RecycleFacility;
}

interface GeoFeatureCollection {
  type: 'FeatureCollection';
  features: GeoFeature[];
}

const geojson = toshimaData as unknown as GeoFeatureCollection;

export function getFacilities(selectedCategories: CategoryId[]): GeoFeature[] {
  if (selectedCategories.length === 0) return [];
  return geojson.features.filter((f) =>
    f.properties.categories.some((c) => selectedCategories.includes(c))
  );
}

export function getAllFacilities(): GeoFeature[] {
  return geojson.features;
}
