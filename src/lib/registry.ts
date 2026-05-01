import type { CategoryId } from './types';

export interface WardMeta {
  prefecture: string;
  prefectureLabel: string;
  city: string;
  cityLabel: string;
  officialUrl?: string;
  categorySourceUrls?: Partial<Record<CategoryId, string>>;
}

export const WARD_REGISTRY: WardMeta[] = [
  {
    prefecture: 'tokyo',
    prefectureLabel: '東京都',
    city: 'toshima',
    cityLabel: '豊島区',
    officialUrl: 'https://www.city.toshima.lg.jp/',
    categorySourceUrls: {
      fluorescent: 'https://www.city.toshima.lg.jp/150/kurashi/gomi/shigen/026267.html',
      'dry-battery': 'https://www.city.toshima.lg.jp/150/kurashi/gomi/shigen/2509251342.html',
      'cooking-oil': 'https://www.city.toshima.lg.jp/150/kurashi/gomi/shigen/013326.html',
      'ink-cartridge': 'https://www.city.toshima.lg.jp/150/kurashi/gomi/shigen/022688.html',
      'small-appliance': 'https://www.city.toshima.lg.jp/150/kurashi/gomi/shigen/034106.html'
    }
  },
  {
    prefecture: 'tokyo',
    prefectureLabel: '東京都',
    city: 'chiyoda',
    cityLabel: '千代田区',
    officialUrl: 'https://www.city.chiyoda.lg.jp/',
    categorySourceUrls: {
      fluorescent: 'https://www.city.chiyoda.lg.jp/koho/kurashi/gomi/wakekata/keikokan.html',
      'ink-cartridge': 'https://www.city.chiyoda.lg.jp/koho/kurashi/gomi/wakekata/ink.html'
    }
  },
  {
    prefecture: 'tokyo',
    prefectureLabel: '東京都',
    city: 'chuo',
    cityLabel: '中央区',
    officialUrl: 'https://www.city.chuo.lg.jp/'
  },
  {
    prefecture: 'tokyo',
    prefectureLabel: '東京都',
    city: 'minato',
    cityLabel: '港区',
    officialUrl: 'https://www.city.minato.tokyo.jp/'
  },
  {
    prefecture: 'tokyo',
    prefectureLabel: '東京都',
    city: 'shinjuku',
    cityLabel: '新宿区',
    officialUrl: 'https://www.city.shinjuku.lg.jp/'
  },
  {
    prefecture: 'tokyo',
    prefectureLabel: '東京都',
    city: 'bunkyo',
    cityLabel: '文京区',
    officialUrl: 'https://www.city.bunkyo.lg.jp/'
  },
  {
    prefecture: 'tokyo',
    prefectureLabel: '東京都',
    city: 'taito',
    cityLabel: '台東区',
    officialUrl: 'https://www.city.taito.lg.jp/'
  }
];

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
