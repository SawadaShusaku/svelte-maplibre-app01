#!/usr/bin/env node
/**
 * GeoJSON to local SQLite validation database migration script.
 * 
 * TRANSITIONAL INPUT: src/lib/data/{prefecture}/{city}.geojson
 * 
 * This script reads GeoJSON files and creates a dev-only SQLite database.
 * Do not write generated facility databases into static public assets.
 * 
 * To inspect the transitional GeoJSON data locally, run: npm run build:db:local
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Use better-sqlite3 for build-time migration
import Database from 'better-sqlite3';


	const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '../../..');

// Category definitions with new split
const CATEGORIES = [
	{ id: 'rechargeable-battery', label: '充電池', color: '#10b981', icon: 'BatteryCharging' },
	{ id: 'e-bike-rechargeable-battery', label: '自転車用充電池', color: '#f97316', icon: 'Bike' },
	{ id: 'dry-battery', label: '乾電池', color: '#7dd3fc', icon: 'Battery' },
	{ id: 'button-battery', label: 'ボタン電池', color: '#fde047', icon: 'CircleDot' },
	{ id: 'small-appliance', label: '小型家電', color: '#0891b2', icon: 'Smartphone' },
	{ id: 'fluorescent', label: '蛍光灯', color: '#fdba74', icon: 'Lightbulb' },
	{ id: 'ink-cartridge', label: 'インクカートリッジ', color: '#a855f7', icon: 'Printer' },
	{ id: 'cooking-oil', label: '廃食用油', color: '#c9956a', icon: 'Droplet' },
	{ id: 'used-clothing', label: '古布・衣類', color: '#db2777', icon: 'Shirt' },
	{ id: 'paper-pack', label: '紙パック', color: '#059669', icon: 'Package' },
	{ id: 'styrofoam', label: '発泡スチロール', color: '#8b5cf6', icon: 'Box' },
	{ id: 'heated-tobacco-device', label: '加熱式たばこ機器等', color: '#64748b', icon: 'Cigarette' }
];

// Category details for warnings
const CATEGORY_DETAILS = [
	{ category_id: 'rechargeable-battery', field: 'warning', content: '端子を絶縁テープで覆うこと。可燃ごみに出さない。' },
	{ category_id: 'rechargeable-battery', field: 'examples', content: 'リチウムイオン電池、モバイルバッテリー、充電式電池' },
	{ category_id: 'e-bike-rechargeable-battery', field: 'warning', content: '対象機器・電池の回収条件は店舗や回収協力店ごとに異なるため、持ち込み前に確認してください。' },
	{ category_id: 'button-battery', field: 'examples', content: '時計、体温計、電卓、補聴器用電池' },
	{ category_id: 'dry-battery', field: 'note', content: '可燃ごみとしても出せますが、回収が推奨されます' },
	{ category_id: 'small-appliance', field: 'note', content: '金属資源回収（都市鉱山）の対象' },
	{ category_id: 'fluorescent', field: 'warning', content: '割れた場合は直接触れない。水銀対策のため専用回収。' },
	{ category_id: 'fluorescent', field: 'examples', content: '蛍光管、電球型蛍光灯、環形蛍光灯' },
	{ category_id: 'heated-tobacco-device', field: 'note', content: '加熱式たばこ機器等の回収対象や受付方法は店舗により異なる場合があります。' }
];

// Collectors
const COLLECTORS = [
	{ id: 'jbrc', name: 'JBRC（日本小型家電リサイクル協会）', url: 'https://www.jbrc.co.jp/' },
	{ id: 'toshima-city', name: '豊島区環境課', url: 'https://www.city.toshima.lg.jp/' },
	{ id: 'chiyoda-city', name: '千代田区環境課', url: 'https://www.city.chiyoda.lg.jp/' },
	{ id: 'chuo-city', name: '中央区環境課', url: 'https://www.city.chuo.lg.jp/' },
	{ id: 'minato-city', name: '港区環境課', url: 'https://www.city.minato.tokyo.jp/' },
	{ id: 'shinjuku-city', name: '新宿区環境課', url: 'https://www.city.shinjuku.lg.jp/' },
	{ id: 'bunkyo-city', name: '文京区環境課', url: 'https://www.city.bunkyo.lg.jp/' },
	{ id: 'taito-city', name: '台東区環境課', url: 'https://www.city.taito.lg.jp/' },
	{ id: 'sumida-city', name: '墨田区環境課', url: 'https://www.city.sumida.lg.jp/' },
	{ id: 'koto-city', name: '江東区環境課', url: 'https://www.city.koto.lg.jp/' },
	{ id: 'shinagawa-city', name: '品川区環境課', url: 'https://www.city.shinagawa.tokyo.jp/' },
	{ id: 'meguro-city', name: '目黒区環境課', url: 'https://www.city.meguro.tokyo.jp/' },
	{ id: 'ota-city', name: '大田区環境課', url: 'https://www.city.ota.tokyo.jp/' },
	{ id: 'setagaya-city', name: '世田谷区環境課', url: 'https://www.city.setagaya.lg.jp/' },
	{ id: 'shibuya-city', name: '渋谷区環境課', url: 'https://www.city.shibuya.tokyo.jp/' },
	{ id: 'nakano-city', name: '中野区環境課', url: 'https://www.city.tokyo-nakano.lg.jp/' },
	{ id: 'suginami-city', name: '杉並区環境課', url: 'https://www.city.suginami.tokyo.jp/' },
	{ id: 'kita-city', name: '北区環境課', url: 'https://www.city.kita.lg.jp/' },
	{ id: 'arakawa-city', name: '荒川区環境課', url: 'https://www.city.arakawa.tokyo.jp/' },
	{ id: 'itabashi-city', name: '板橋区環境課', url: 'https://www.city.itabashi.tokyo.jp/' },
	{ id: 'nerima-city', name: '練馬区環境課', url: 'https://www.city.nerima.tokyo.jp/' },
	{ id: 'adachi-city', name: '足立区環境課', url: 'https://www.city.adachi.tokyo.jp/' },
	{ id: 'katsushika-city', name: '葛飾区環境課', url: 'https://www.city.katsushika.lg.jp/' },
	{ id: 'edogawa-city', name: '江戸川区環境課', url: 'https://www.city.edogawa.tokyo.jp/' }
];

// Wards configuration
const WARDS = [
	{ id: 'toshima', prefecture: 'tokyo', city_label: '豊島区', url: 'https://www.city.toshima.lg.jp/' },
	{ id: 'chiyoda', prefecture: 'tokyo', city_label: '千代田区', url: 'https://www.city.chiyoda.lg.jp/' },
	{ id: 'chuo', prefecture: 'tokyo', city_label: '中央区', url: 'https://www.city.chuo.lg.jp/' },
	{ id: 'minato', prefecture: 'tokyo', city_label: '港区', url: 'https://www.city.minato.tokyo.jp/' },
	{ id: 'shinjuku', prefecture: 'tokyo', city_label: '新宿区', url: 'https://www.city.shinjuku.lg.jp/' },
	{ id: 'bunkyo', prefecture: 'tokyo', city_label: '文京区', url: 'https://www.city.bunkyo.lg.jp/' },
	{ id: 'taito', prefecture: 'tokyo', city_label: '台東区', url: 'https://www.city.taito.lg.jp/' },
	{ id: 'sumida', prefecture: 'tokyo', city_label: '墨田区', url: 'https://www.city.sumida.lg.jp/' },
	{ id: 'koto', prefecture: 'tokyo', city_label: '江東区', url: 'https://www.city.koto.lg.jp/' },
	{ id: 'shinagawa', prefecture: 'tokyo', city_label: '品川区', url: 'https://www.city.shinagawa.tokyo.jp/' },
	{ id: 'meguro', prefecture: 'tokyo', city_label: '目黒区', url: 'https://www.city.meguro.tokyo.jp/' },
	{ id: 'ota', prefecture: 'tokyo', city_label: '大田区', url: 'https://www.city.ota.tokyo.jp/' },
	{ id: 'setagaya', prefecture: 'tokyo', city_label: '世田谷区', url: 'https://www.city.setagaya.lg.jp/' },
	{ id: 'shibuya', prefecture: 'tokyo', city_label: '渋谷区', url: 'https://www.city.shibuya.tokyo.jp/' },
	{ id: 'nakano', prefecture: 'tokyo', city_label: '中野区', url: 'https://www.city.tokyo-nakano.lg.jp/' },
	{ id: 'suginami', prefecture: 'tokyo', city_label: '杉並区', url: 'https://www.city.suginami.tokyo.jp/' },
	{ id: 'kita', prefecture: 'tokyo', city_label: '北区', url: 'https://www.city.kita.lg.jp/' },
	{ id: 'arakawa', prefecture: 'tokyo', city_label: '荒川区', url: 'https://www.city.arakawa.tokyo.jp/' },
	{ id: 'itabashi', prefecture: 'tokyo', city_label: '板橋区', url: 'https://www.city.itabashi.tokyo.jp/' },
	{ id: 'nerima', prefecture: 'tokyo', city_label: '練馬区', url: 'https://www.city.nerima.tokyo.jp/' },
	{ id: 'adachi', prefecture: 'tokyo', city_label: '足立区', url: 'https://www.city.adachi.tokyo.jp/' },
	{ id: 'katsushika', prefecture: 'tokyo', city_label: '葛飾区', url: 'https://www.city.katsushika.lg.jp/' },
	{ id: 'edogawa', prefecture: 'tokyo', city_label: '江戸川区', url: 'https://www.city.edogawa.tokyo.jp/' }
];

async function migrate() {
	console.log('Starting GeoJSON to SQLite migration...');
	
	// Create dev-only validation database. Keep this outside static public assets.
	const dbPath = process.env.SQLITE_OUTPUT_PATH
		? path.resolve(projectRoot, process.env.SQLITE_OUTPUT_PATH)
		: path.join(projectRoot, '.local', 'recycling-dev.db');
	fs.mkdirSync(path.dirname(dbPath), { recursive: true });
	
	const db = new Database(dbPath);
	
	// Drop existing tables if they exist (for clean migration)
	db.exec(`
		DROP TABLE IF EXISTS facility_categories;
		DROP TABLE IF EXISTS facilities;
		DROP TABLE IF EXISTS ward_categories;
		DROP TABLE IF EXISTS collectors;
		DROP TABLE IF EXISTS wards;
		DROP TABLE IF EXISTS category_details;
		DROP TABLE IF EXISTS categories;
	`);
	
	// Read schema
	const schemaPath = path.join(projectRoot, 'src', 'lib', 'db', 'schema.sql');
	const schema = fs.readFileSync(schemaPath, 'utf-8');
	
	// Execute schema
	db.exec(schema);
	console.log('Schema created.');
	
	// Insert categories
	const insertCategory = db.prepare(
		'INSERT INTO categories (id, label, color, icon) VALUES (?, ?, ?, ?)'
	);
	for (const cat of CATEGORIES) {
		insertCategory.run(cat.id, cat.label, cat.color, cat.icon);
	}
	console.log(`Inserted ${CATEGORIES.length} categories.`);
	
	// Insert category details
	const insertDetail = db.prepare(
		'INSERT INTO category_details (category_id, field, content) VALUES (?, ?, ?)'
	);
	for (const detail of CATEGORY_DETAILS) {
		insertDetail.run(detail.category_id, detail.field, detail.content);
	}
	console.log(`Inserted ${CATEGORY_DETAILS.length} category details.`);
	
	// Insert collectors
	const insertCollector = db.prepare(
		'INSERT INTO collectors (id, name, url) VALUES (?, ?, ?)'
	);
	for (const collector of COLLECTORS) {
		insertCollector.run(collector.id, collector.name, collector.url);
	}
	console.log(`Inserted ${COLLECTORS.length} collectors.`);
	
	// Insert wards
	const insertWard = db.prepare(
		'INSERT INTO wards (id, prefecture, city_label, url) VALUES (?, ?, ?, ?)'
	);
	for (const ward of WARDS) {
		insertWard.run(ward.id, ward.prefecture, ward.city_label, ward.url);
	}
	console.log(`Inserted ${WARDS.length} wards.`);
	
	// Process GeoJSON files
	const dataDir = path.join(projectRoot, 'src', 'lib', 'data');
	const prefectures = fs.readdirSync(dataDir);
	
	const insertFacility = db.prepare(
		'INSERT INTO facilities (id, ward_id, name, address, latitude, longitude, url, official_url, category_urls, collector_id, hours, notes, image_url, image_alt, image_credit, image_source_url, mapillary_image_id) ' +
		'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
	);
	const insertFacilityCategory = db.prepare(
		'INSERT INTO facility_categories (facility_id, category_id) VALUES (?, ?)'
	);
	const insertWardCategory = db.prepare(
		'INSERT OR IGNORE INTO ward_categories (ward_id, category_id) VALUES (?, ?)'
	);
	
	let totalFacilities = 0;
	
	for (const prefecture of prefectures) {
		const prefecturePath = path.join(dataDir, prefecture);
		if (!fs.statSync(prefecturePath).isDirectory()) continue;
		
		const files = fs.readdirSync(prefecturePath).filter(f => f.endsWith('.geojson'));
		
		for (const file of files) {
			const city = file.replace('.geojson', '');
			const filePath = path.join(prefecturePath, file);
			const content = fs.readFileSync(filePath, 'utf-8');
			const geojson = JSON.parse(content);
			
			const wardCategories = new Set<string>();
			
			for (const feature of geojson.features) {
				const props = feature.properties;
				const coords = feature.geometry.coordinates;
				
				const rawCategories: unknown[] = Array.isArray(props.categories) ? props.categories : [];
				const categories: string[] = rawCategories.filter(
					(category): category is string => typeof category === 'string'
				);
				const uniqueCategories = [...new Set(categories)];
				
				// Validate categories
				const validCategories: string[] = uniqueCategories.filter((c) => c !== 'battery');
				if (categories.includes('battery')) {
					console.warn(`  Warning: ${props.id} (${props.name}) has 'battery' category - needs manual classification`);
				}
				
				// Determine collector based on categories
				let collectorId: string | null = null;
				if (validCategories.includes('rechargeable-battery')) {
					collectorId = 'jbrc';
				} else if (city === 'toshima') {
					collectorId = 'toshima-city';
				} else if (city === 'chiyoda') {
					collectorId = 'chiyoda-city';
				} else if (city === 'chuo') {
					collectorId = 'chuo-city';
				} else if (city === 'minato') {
					collectorId = 'minato-city';
				} else if (city === 'shinjuku') {
					collectorId = 'shinjuku-city';
				} else if (city === 'bunkyo') {
					collectorId = 'bunkyo-city';
				} else if (city === 'taito') {
					collectorId = 'taito-city';
				} else if (city === 'sumida') {
					collectorId = 'sumida-city';
				} else if (city === 'koto') {
					collectorId = 'koto-city';
				} else if (city === 'shinagawa') {
					collectorId = 'shinagawa-city';
				} else if (city === 'meguro') {
					collectorId = 'meguro-city';
				} else if (city === 'ota') {
					collectorId = 'ota-city';
				} else if (city === 'setagaya') {
					collectorId = 'setagaya-city';
				} else if (city === 'shibuya') {
					collectorId = 'shibuya-city';
				} else if (city === 'nakano') {
					collectorId = 'nakano-city';
				} else if (city === 'suginami') {
					collectorId = 'suginami-city';
				} else if (city === 'kita') {
					collectorId = 'kita-city';
				} else if (city === 'arakawa') {
					collectorId = 'arakawa-city';
				} else if (city === 'itabashi') {
					collectorId = 'itabashi-city';
				} else if (city === 'nerima') {
					collectorId = 'nerima-city';
				} else if (city === 'adachi') {
					collectorId = 'adachi-city';
				} else if (city === 'katsushika') {
					collectorId = 'katsushika-city';
				} else if (city === 'edogawa') {
					collectorId = 'edogawa-city';
				}
				
				// Insert facility
				const officialUrl = typeof props.officialUrl === 'string' ? props.officialUrl : null;
				const categoryUrls = props.categoryUrls && typeof props.categoryUrls === 'object'
					? JSON.stringify(props.categoryUrls)
					: null;
				const imageUrl = typeof props.imageUrl === 'string' ? props.imageUrl : null;
				const imageAlt = typeof props.imageAlt === 'string' ? props.imageAlt : null;
				const imageCredit = typeof props.imageCredit === 'string' ? props.imageCredit : null;
				const imageSourceUrl = typeof props.imageSourceUrl === 'string' ? props.imageSourceUrl : null;
				const mapillaryImageId = typeof props.mapillaryImageId === 'string' ? props.mapillaryImageId : null;

				insertFacility.run(
					props.id,
					city,
					props.name,
					props.address,
					coords[1], // latitude
					coords[0], // longitude
					null,
					officialUrl,
					categoryUrls,
					collectorId,
					props.hours || null,
					props.notes || null,
					imageUrl,
					imageAlt,
					imageCredit,
					imageSourceUrl,
					mapillaryImageId
				);
				
				// Insert facility categories
				for (const catId of validCategories) {
					insertFacilityCategory.run(props.id, catId);
					wardCategories.add(catId);
				}
				
				totalFacilities++;
			}
			
			// Insert ward categories
			for (const catId of wardCategories) {
				insertWardCategory.run(city, catId);
			}
			
			console.log(`Processed ${file}: ${geojson.features.length} facilities`);
		}
	}
	
	console.log(`\nMigration complete!`);
	console.log(`Total facilities: ${totalFacilities}`);
	console.log(`Database saved to: ${dbPath}`);
	
	// Print summary
	const wardCatCount = db.prepare('SELECT COUNT(*) as count FROM ward_categories').get() as { count: number };
	const facCatCount = db.prepare('SELECT COUNT(*) as count FROM facility_categories').get() as { count: number };
	console.log(`Ward-category relationships: ${wardCatCount.count}`);
	console.log(`Facility-category relationships: ${facCatCount.count}`);
	
	db.close();
}

migrate().catch(err => {
	console.error('Migration failed:', err);
	process.exit(1);
});
