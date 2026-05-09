# Ward Filter

## Purpose
Define area filter behavior for narrowing displayed recycling facilities.
## Requirements
### Requirement: 都道府県・区フィルタUI
サイドバーはD1から取得した都道府県と区・市町村の選択肢を表示しなければならない（SHALL）。ユーザーは全国表示と、複数の区・市町村を選択する絞り込み表示を切り替えられ、選択された範囲の施設のみ地図に表示される。

#### Scenario: 初期状態
- **WHEN** ページを開く
- **THEN** 全国表示スコープで表示され、D1に登録された全国の施設が現在のズーム階層に応じて表示される

#### Scenario: 区の絞り込み
- **WHEN** ユーザーが「豊島区」のみを選択する
- **THEN** 豊島区の施設のみ地図とサイドバー一覧に表示される

#### Scenario: 複数区の選択
- **WHEN** ユーザーが「豊島区」と「千代田区」を選択する
- **THEN** 両区の施設が地図に表示される

#### Scenario: 都道府県グループ表示
- **WHEN** 複数の都道府県の区・市町村が登録されている
- **THEN** 区・市町村チップは都道府県ごとにグループ化されて表示される

#### Scenario: 東京以外の市町村表示
- **WHEN** D1に東京以外の市町村が登録されている
- **THEN** その市町村はローカルの東京 ward registry に存在しなくても選択肢として表示される

