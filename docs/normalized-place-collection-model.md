# Normalized Place Collection Model

## 目的

公開DBでは、カテゴリごとの掲載行をそのままマーカーにしない。実在する回収場所を `places` にまとめ、カテゴリ別の掲載元情報を `place_collection_entries` に分けて保持する。

## Mermaid

```mermaid
erDiagram
  AREAS ||--o{ PLACES : "場所が属する"
  PLACES ||--o{ PLACE_COLLECTION_ENTRIES : "カテゴリ別掲載を持つ"
  CATEGORIES ||--o{ PLACE_COLLECTION_ENTRIES : "回収カテゴリ"
  DATA_SOURCES ||--o{ PLACE_COLLECTION_ENTRIES : "掲載データソース"

  AREAS {
    text id "地域ID。都道府県、市区町村、東京23区などの表示・集約単位"
    text prefecture "都道府県"
    text city_label "市区町村・区の表示名"
    text normalized_label "検索・比較用の正規化ラベル"
    integer is_active "公開対象なら1"
    text created_at "作成日時"
    text updated_at "更新日時"
  }

  DATA_SOURCES {
    text id "データソースID"
    text name "公開表示するデータソース名"
    text url "データソースの公開URL"
    text organization_name "運営組織名"
    text license_note "表示可能な注記"
    text last_fetched_at "最終取得日時"
    integer is_active "公開対象なら1"
    text created_at "作成日時"
    text updated_at "更新日時"
  }

  PLACES {
    text id "公開場所ID。統合後の1マーカーに対応"
    text area_id "所属地域ID"
    text canonical_name "代表施設名"
    text display_address "表示住所"
    text normalized_address "重複判定用の正規化住所"
    real latitude "緯度"
    real longitude "経度"
    text dedupe_key "重複判定キー"
    text url "代表URL"
    text image_url "承認済み画像URL"
    integer is_active "公開対象なら1"
    text created_at "作成日時"
    text updated_at "更新日時"
  }

  PLACE_COLLECTION_ENTRIES {
    text id "カテゴリ別掲載ID"
    text place_id "統合先の場所ID"
    text category_id "回収カテゴリID"
    text data_source_id "データソースID"
    text source_display_name "掲載元での施設名"
    text source_address "掲載元での住所"
    text normalized_source_address "比較用の正規化掲載住所"
    text source_url "掲載ページURL"
    text hours "カテゴリ別の受付時間"
    text notes "カテゴリ別の公開補足"
    text location_hint "設置場所の補足"
    text source_fetched_at "取得日時"
    text source_published_at "掲載側の更新日時"
    integer is_active "公開対象なら1"
    text created_at "作成日時"
    text updated_at "更新日時"
  }

  CATEGORIES {
    text id "カテゴリID"
    text label "表示名"
    text color "地図表示色"
    text icon "表示アイコン"
  }
```

## 方針

- `places` はマーカーの粒度。1つの実在場所は1行にまとめる。
- `place_collection_entries` はカテゴリと掲載元の粒度。住所や施設名の表記揺れはここに残せる。
- `data_sources` は旧 `collectors` より意味が広く、自治体ページや業界団体リストも扱う。
- `dedupe_key` は統合候補を安定して再現するためのキー。公開APIには出さない。
- `confidence` は使わない。判断が必要な行は private pipeline 側の review status/reason で管理する。
