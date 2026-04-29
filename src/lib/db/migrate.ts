#!/usr/bin/env node
/**
 * GeoJSON to SQLite Migration Script
 * 
 * SOURCE OF TRUTH: src/lib/data/{prefecture}/{city}.geojson
 * 
 * This script reads GeoJSON files and creates a SQLite database.
 * 
 * To add/modify facilities, edit the GeoJSON files directly.
 * Then run: npm run build:db
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
	{ id: 'rechargeable-battery', label: '小型充電式電池', color: '#dc2626', icon: 'Battery' },
	{ id: 'dry-battery', label: '乾電池', color: '#7dd3fc', icon: 'Battery' },
	{ id: 'button-battery', label: 'ボタン電池', color: '#fde047', icon: 'Battery' },
	{ id: 'small-appliance', label: '小型家電', color: '#0891b2', icon: 'Smartphone' },
	{ id: 'fluorescent', label: '蛍光灯', color: '#fdba74', icon: 'Lightbulb' },
	{ id: 'ink-cartridge', label: 'インクカートリッジ', color: '#a855f7', icon: 'Printer' },
	{ id: 'cooking-oil', label: '廃食用油', color: '#c9956a', icon: 'Droplet' },
	{ id: 'used-clothing', label: '古布・衣類', color: '#db2777', icon: 'Shirt' },
	{ id: 'paper-pack', label: '紙パック', color: '#059669', icon: 'Package' },
	{ id: 'styrofoam', label: '発泡スチロール', color: '#8b5cf6', icon: 'Box' }
];

// Category details for warnings
const CATEGORY_DETAILS = [
	{ category_id: 'rechargeable-battery', field: 'warning', content: '端子を絶縁テープで覆うこと。可燃ごみに出さない。' },
	{ category_id: 'rechargeable-battery', field: 'examples', content: 'リチウムイオン電池、モバイルバッテリー、充電式電池' },
	{ category_id: 'button-battery', field: 'examples', content: '時計、体温計、電卓、補聴器用電池' },
	{ category_id: 'dry-battery', field: 'note', content: '可燃ごみとしても出せますが、回収が推奨されます' },
	{ category_id: 'small-appliance', field: 'note', content: '金属資源回収（都市鉱山）の対象' },
	{ category_id: 'fluorescent', field: 'warning', content: '割れた場合は直接触れない。水銀対策のため専用回収。' },
	{ category_id: 'fluorescent', field: 'examples', content: '蛍光管、電球型蛍光灯、環形蛍光灯' }
];

// Collectors
const COLLECTORS = [
	{ id: 'jbrc', name: 'JBRC（日本小型家電リサイクル協会）', url: 'https://www.jbrc.co.jp/' },
	{ id: 'toshima-city', name: '豊島区環境課', url: 'https://www.city.toshima.lg.jp/' },
	{ id: 'chiyoda-city', name: '千代田区環境課', url: 'https://www.city.chiyoda.lg.jp/' }
];

// Wards configuration
const WARDS = [
	{ id: 'toshima', prefecture: 'tokyo', city_label: '豊島区', url: 'https://www.city.toshima.lg.jp/' },
	{ id: 'chiyoda', prefecture: 'tokyo', city_label: '千代田区', url: 'https://www.city.chiyoda.lg.jp/' }
];

async function migrate() {
	console.log('Starting GeoJSON to SQLite migration...');
	
	// Create database
	const dbPath = path.join(projectRoot, 'static', 'recycling.db');
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
		'INSERT INTO facilities (id, ward_id, name, address, latitude, longitude, url, collector_id, hours, notes) ' +
		'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
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
				
				const categories = props.categories || [];
				const uniqueCategories = [...new Set(categories)];
				
				// Validate categories
				const validCategories = uniqueCategories.filter(c => c !== 'battery');
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
				}
				
				// Insert facility
				insertFacility.run(
					props.id,
					city,
					props.name,
					props.address,
					coords[1], // latitude
					coords[0], // longitude
					null,
					collectorId,
					props.hours || null,
					props.notes || null
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
