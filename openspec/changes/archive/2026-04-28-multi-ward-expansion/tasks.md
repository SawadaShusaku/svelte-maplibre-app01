## 1. 型・カテゴリ定義の更新

- [x] 1.1 `src/lib/types.ts` の `RecycleFacility` 型を更新（`ward` 削除 → `prefecture` / `city` / `cityLabel` 追加）
- [x] 1.2 `src/lib/categories.ts` に `used-clothing`（古布、色: `#EC4899`）を追加
- [x] 1.3 `src/lib/registry.ts` を新規作成（`WardMeta` 型と豊島区・千代田区のレジストリ定義）

## 2. データスクリプトの更新と再生成

- [x] 2.1 `scripts/geocode.ts` を更新（出力スキーマを `prefecture`/`city`/`cityLabel` に変更）
- [x] 2.2 `scripts/facilities.csv` を更新（`prefecture` 列と `city` 列を追加）
- [x] 2.3 `src/lib/data/tokyo/` ディレクトリを作成し、豊島区データを再生成（`src/lib/data/toshima.geojson` → `src/lib/data/tokyo/toshima.geojson`）
- [x] 2.4 千代田区の施設データCSV（`scripts/chiyoda.csv`）を作成（小型家電18件・廃食用油9件・古布9件・乾電池4件）
- [x] 2.5 千代田区データをジオコーディングして `src/lib/data/tokyo/chiyoda.geojson` を生成

## 3. データローダーの書き換え

- [x] 3.1 `src/lib/data.ts` を `import.meta.glob` 方式に全面書き換え（選択中の区のGeoJSONを動的ロード）
- [x] 3.2 古い `src/lib/data/toshima.geojson` を削除

## 4. サイドバーUIの更新

- [x] 4.1 `src/routes/+page.svelte` のタイトルを「東京リサイクルマップ」に変更
- [x] 4.2 選択中の区を管理する `$state`（`selectedCities: string[]`）を追加
- [x] 4.3 サイドバーに都道府県ラベル + 区チップUI（`registry.ts` から動的生成）を追加
- [x] 4.4 区フィルタと施設一覧・地図マーカーを `selectedCities` で連動させる

## 5. 動作確認

- [ ] 5.1 豊島区・千代田区の両方が地図に表示されることを確認する
- [ ] 5.2 区チップで絞り込むと対応する区の施設だけ表示されることを確認する
- [ ] 5.3 「古布」カテゴリフィルタが正しく動作することを確認する
- [x] 5.4 `npm run check` で型エラーがないことを確認する
