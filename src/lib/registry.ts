export interface WardMeta {
  prefecture: string;
  prefectureLabel: string;
  city: string;
  cityLabel: string;
}

export const WARD_REGISTRY: WardMeta[] = [
  { prefecture: 'tokyo', prefectureLabel: '東京都', city: 'toshima',  cityLabel: '豊島区' },
  { prefecture: 'tokyo', prefectureLabel: '東京都', city: 'chiyoda',  cityLabel: '千代田区' },
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
