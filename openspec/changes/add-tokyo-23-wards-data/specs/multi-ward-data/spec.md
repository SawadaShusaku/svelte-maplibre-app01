## MODIFIED Requirements

### Requirement: 動的マルチ区データロード
アプリは選択された区のGeoJSONファイルを動的にロードしなければならない（SHALL）。新しい区のGeoJSONファイルを `src/lib/data/{prefecture}/{city}.geojson` に追加し `registry.ts` に1行追記するだけで地図に表示できる。施設データには `officialUrl` と `categoryUrls` を含む。

#### Scenario: 複数区の同時表示
- **WHEN** 豊島区と千代田区が両方選択されている
- **THEN** 両区のGeoJSONがロードされ、全施設が地図に表示される

#### Scenario: 新規区の追加
- **WHEN** `src/lib/data/tokyo/shinjuku.geojson` を追加し `registry.ts` に新宿区を追記する
- **THEN** アプリ起動時にサイドバーに「新宿区」チップが表示され、施設が地図に表示される（コード変更不要）

#### Scenario: URL付き施設データのロード
- **WHEN** 施設データに `officialUrl` と `categoryUrls` が含まれている
- **THEN** アプリはこれらのフィールドを保持し、アクセス可能にする

### Requirement: 区レジストリ
`src/lib/registry.ts` に利用可能な区のメタ情報（prefecture・city・cityLabel・prefectureLabel・officialUrl・categorySourceUrls）を定義しなければならない（SHALL）。

#### Scenario: レジストリ参照
- **WHEN** アプリが起動する
- **THEN** registry.ts に定義された区のみサイドバーに表示される

#### Scenario: 新規区のレジストリ登録
- **WHEN** 新宿区を `WARD_REGISTRY` に追加する
- **THEN** `officialUrl` と `categorySourceUrls` も登録される
