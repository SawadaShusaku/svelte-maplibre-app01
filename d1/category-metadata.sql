UPDATE categories
SET label = '充電池',
	color = '#10b981',
	icon = 'BatteryCharging',
	sort_order = 0
WHERE id = 'rechargeable-battery';

UPDATE categories
SET label = '自転車用充電池',
	color = '#f97316',
	icon = 'Bike',
	sort_order = 1
WHERE id = 'e-bike-rechargeable-battery';

UPDATE categories
SET label = 'ボタン電池',
	color = '#fde047',
	icon = 'CircleDot',
	sort_order = 2
WHERE id = 'button-battery';

UPDATE categories
SET label = 'インクカートリッジ',
	color = '#a855f7',
	icon = 'Printer',
	sort_order = 3
WHERE id = 'ink-cartridge';

UPDATE categories
SET label = '廃食用油',
	color = '#c9956a',
	icon = 'Droplet',
	sort_order = 4
WHERE id = 'cooking-oil';

UPDATE categories
SET label = '加熱式たばこ機器等',
	color = '#64748b',
	icon = 'Cigarette',
	sort_order = 5
WHERE id = 'heated-tobacco-device';

DELETE FROM category_details
WHERE category_id IN (
	'rechargeable-battery',
	'e-bike-rechargeable-battery',
	'button-battery',
	'ink-cartridge',
	'cooking-oil',
	'heated-tobacco-device'
);

INSERT INTO category_details (category_id, field, content) VALUES
	('rechargeable-battery', 'warning', '端子を絶縁テープで覆うこと。可燃ごみに出さない。'),
	('rechargeable-battery', 'examples', 'リチウムイオン電池、モバイルバッテリー、充電式電池'),
	('e-bike-rechargeable-battery', 'warning', '対象機器・電池の回収条件は店舗や回収協力店ごとに異なるため、持ち込み前に確認してください。'),
	('button-battery', 'examples', '時計、体温計、電卓、補聴器用電池'),
	('ink-cartridge', 'note', '純正・互換インクカートリッジどちらも回収可。包装材は外して出す。'),
	('cooking-oil', 'warning', '天カス等不純物は紙でこして取り除く。温度が下がってから容器に入れる。ガラス瓶は使用不可。'),
	('cooking-oil', 'note', 'A方式（対面回収）またはB方式（ボックス回収）で回収。未使用の油も回収可。'),
	('heated-tobacco-device', 'note', '加熱式たばこ機器等の回収対象や受付方法は店舗により異なる場合があります。');
