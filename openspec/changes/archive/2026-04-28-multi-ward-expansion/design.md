## Context

現状のアプリは豊島区1区のみ対応。データスキーマに `ward` フィールドしかなく都道府県を区別できない。カテゴリは5品目固定でコードに埋め込まれている。千代田区追加の要求を機に、日本全国展開を見据えたスキーマ・ロード方式・UIに刷新する。

## Goals / Non-Goals

**Goals:**
- GeoJSONスキーマに `prefecture` / `city` / `cityLabel` を導入し都道府県・市区町村の階層を表現する
- Viteの `import.meta.glob` で動的データロードを実現し、GeoJSONファイルを置くだけで区が追加できるようにする
- 千代田区データ（小型家電・廃食用油・古布）を追加する
- サイドバーに都道府県・区フィルタUIを追加する
- `used-clothing`（古布）カテゴリを追加する

**Non-Goals:**
- 全国データの収集（Phase 1は東京都内のみ）
- PMTilesへの移行（データ件数が数千件を超えたら検討）
- オフラインサポート

## Decisions

### D1: GeoJSONスキーマ — `ward` を廃止し3フィールドに分割

**変更前:**
```json
{ "ward": "toshima" }
```

**変更後:**
```json
{
  "prefecture": "tokyo",
  "city": "toshima",
  "cityLabel": "豊島区"
}
```

**理由:** `ward` は東京都特有の概念。大阪市・京都市など政令市の「区」と混同しやすく、町村・市にも対応できない。`prefecture`（都道府県）+ `city`（市区町村ID）+ `cityLabel`（表示名）の3フィールドで全国どの行政区分にも対応する。

### D2: データ読み込み — `import.meta.glob` による遅延ロード

```ts
const dataFiles = import.meta.glob<{ default: GeoFeatureCollection }>(
  '../lib/data/**/*.geojson'
);
// ファイルパス → 遅延インポート関数のマップが生成される
// 選択中の prefecture/city に対応するファイルだけロード
```

**ファイル構造:**
```
src/lib/data/
  tokyo/
    toshima.geojson
    chiyoda.geojson
  （将来）
  osaka/
    kita.geojson
```

新しい区は GeoJSON ファイルを正しいパスに置くだけで自動認識。`data.ts` のコード変更不要。

**採用しなかった代替案:**
- 全区まとめた単一ファイル: ファイルが肥大化し全データを常時ロードしてしまう
- 静的インポート列挙: 区を追加するたびにコード変更が必要

### D3: 利用可能区の管理 — `registry.ts` で明示的に定義

`import.meta.glob` で全ファイルは検出できるが、表示名・読み込み順・デフォルト選択状態などのメタ情報はファイルパスだけでは持てない。そこで `src/lib/registry.ts` に区のメタ情報リストを定義する。

```ts
export const WARD_REGISTRY: WardMeta[] = [
  { prefecture: 'tokyo', prefectureLabel: '東京都', city: 'toshima', cityLabel: '豊島区' },
  { prefecture: 'tokyo', prefectureLabel: '東京都', city: 'chiyoda', cityLabel: '千代田区' },
];
```

新しい区を追加するときは GeoJSON ファイル追加 + このリストに1行追記するだけ。

### D4: カテゴリ拡張 — `categories.ts` に追記するだけ

`used-clothing`（古布、色: `#EC4899` ピンク）を追加。他の変更不要。

## Risks / Trade-offs

- **スキーマ移行コスト**: 既存の `toshima.geojson` を全件書き換え必要 → `geocode.ts` スクリプトを更新して再生成で対応
- **glob パターンとVite SSR**: `import.meta.glob` はクライアント側では動くがSSR時に挙動が変わる場合がある → SvelteKitの `+page.ts` でサーバー側ロードに切り出すことで回避
- **registry.ts の二重管理**: ファイルを置いたのにregistryを更新し忘れると表示されない → CIでファイルとregistryの整合チェックを将来追加

## Migration Plan

1. `categories.ts` に `used-clothing` 追加
2. `types.ts` スキーマ型更新
3. `registry.ts` 新規作成
4. `geocode.ts` スクリプトをスキーマ変更に対応、豊島区を再生成
5. `data/tokyo/` ディレクトリ作成、`toshima.geojson` 移動・再生成
6. 千代田区 CSV 作成 → `chiyoda.geojson` 生成
7. `data.ts` を動的ロード方式に書き換え
8. `+page.svelte` サイドバーUI更新

## Open Questions

- 都道府県フィルタは現時点では「東京都」固定表示でよいか → Yes（将来の区追加時に自動で複数表示）
- 千代田区の乾電池は児童館4施設のみで豊島区より少ない。データとして追加するか → 追加する（不完全でも実データが価値）
