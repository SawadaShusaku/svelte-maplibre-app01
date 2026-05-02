import { describe, expect, it } from 'vitest';

import { WARD_REGISTRY } from '../registry';

const geojsonModules = import.meta.glob('../data/*/*.geojson', {
  eager: true,
  query: '?raw',
  import: 'default'
});

describe('WARD_REGISTRY', () => {
  it('includes every ward that has GeoJSON data', () => {
    expect(WARD_REGISTRY).toHaveLength(Object.keys(geojsonModules).length);
  });

  it('builds selectable keys for every ward data file', () => {
    const registryKeys = new Set(
      WARD_REGISTRY.map((ward) => `${ward.prefecture}/${ward.city}`)
    );

    for (const path of Object.keys(geojsonModules)) {
      const match = path.match(/\.\.\/data\/([^/]+)\/([^/.]+)\.geojson$/);
      expect(match).not.toBeNull();

      const [, prefecture, city] = match as RegExpMatchArray;
      expect(registryKeys.has(`${prefecture}/${city}`)).toBe(true);
    }
  });
});
