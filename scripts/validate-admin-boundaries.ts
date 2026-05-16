#!/usr/bin/env tsx
import { readFileSync } from 'node:fs';
import { basename } from 'node:path';

import {
	validateAdminBoundaryCollection,
	type AdminBoundaryLevel
} from '../src/lib/map/admin-boundaries';

type CliTarget = {
	level: AdminBoundaryLevel;
	file: string;
};

function parseArgs(args: string[]): CliTarget[] {
	if (args.length === 0) {
		return [
			{ level: 'prefecture', file: 'static/geojson/admin-areas/prefectures.json' },
			{ level: 'municipality', file: 'static/geojson/admin-areas/municipalities.json' }
		];
	}

	if (args.length % 2 !== 0) {
		throw new Error('Usage: tsx scripts/validate-admin-boundaries.ts [prefecture|municipality <file>]...');
	}

	const targets: CliTarget[] = [];
	for (let i = 0; i < args.length; i += 2) {
		const level = args[i];
		if (level !== 'prefecture' && level !== 'municipality') {
			throw new Error(`Unsupported level "${level}". Use "prefecture" or "municipality".`);
		}
		targets.push({ level, file: args[i + 1] });
	}
	return targets;
}

function main() {
	const targets = parseArgs(process.argv.slice(2));
	let hasErrors = false;

	for (const target of targets) {
		const raw = JSON.parse(readFileSync(target.file, 'utf-8')) as unknown;
		const result = validateAdminBoundaryCollection(raw, target.level);
		const { stats } = result;
		const invalidCount = stats.unsupportedGeometry + stats.missingRequiredProperties;
		if (invalidCount > 0) hasErrors = true;

		console.log(`${basename(target.file)} (${target.level})`);
		console.log(`  total features: ${stats.totalFeatures}`);
		console.log(`  accepted features: ${stats.acceptedFeatures}`);
		console.log(`  missing geometry skipped: ${stats.missingGeometry}`);
		console.log(`  unsupported geometry: ${stats.unsupportedGeometry}`);
		console.log(`  missing required properties: ${stats.missingRequiredProperties}`);
	}

	if (hasErrors) {
		throw new Error('Administrative boundary validation failed.');
	}
}

main();
