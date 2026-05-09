import { spawnSync } from 'node:child_process';

type Violation = {
	path: string;
	reason: string;
};

const PRIVATE_DIRECTORY_PREFIXES = ['raw/', 'exports/', 'cache/', 'normalized/', '.local/'];
const PRIVATE_FILE_PATTERNS: Array<[RegExp, string]> = [
	[/\.csv$/i, 'CSV snapshots must stay in the private data pipeline repository'],
	[/\.sqlite3?$/i, 'local SQLite validation databases must stay private and outside tracked files'],
	[/\.db$/i, 'bulk database files must not be tracked or shipped as public assets'],
	[/\.dump$/i, 'database dumps must stay private'],
	[/(^|\/)(seed|import).*\.sql$/i, 'data-bearing seed/import SQL must stay private'],
	[/[-_](seed|import)\.sql$/i, 'data-bearing seed/import SQL must stay private'],
	[/geocoding\.json$/i, 'geocoding cache must stay private'],
	[/geocode-cache\.json$/i, 'geocoding cache must stay private'],
	[/raw[-_/].*\.(html|json|csv)$/i, 'raw upstream responses must stay private'],
	[/source[-_]?snapshot/i, 'source snapshots must stay private']
];

function trackedFiles(): string[] {
	const jjResult = spawnSync('jj', ['file', 'list'], {
		encoding: 'utf-8',
		stdio: ['ignore', 'pipe', 'pipe']
	});

	if (!jjResult.error && jjResult.status === 0) {
		return jjResult.stdout
			.split('\n')
			.map((line) => line.trim())
			.filter(Boolean);
	}

	const gitResult = spawnSync('git', ['ls-files'], {
		encoding: 'utf-8',
		stdio: ['ignore', 'pipe', 'pipe']
	});

	if (!gitResult.error && gitResult.status === 0) {
		return gitResult.stdout
			.split('\n')
			.map((line) => line.trim())
			.filter(Boolean);
	}

	const jjMessage = jjResult.error?.message ?? jjResult.stderr?.trim() ?? 'jj file list failed';
	const gitMessage = gitResult.error?.message ?? gitResult.stderr?.trim() ?? 'git ls-files failed';
	console.error('Failed to list tracked files for private data audit.');
	console.error(`jj: ${jjMessage}`);
	console.error(`git: ${gitMessage}`);
	process.exit(jjResult.status ?? gitResult.status ?? 1);
}

function normalizePath(path: string): string {
	return path.replaceAll('\\', '/');
}

function trackedFilesForAudit(): string[] {
	return trackedFiles()
		.map((line) => normalizePath(line.trim()))
		.filter(Boolean);
}

function violationFor(path: string): Violation | null {
	for (const prefix of PRIVATE_DIRECTORY_PREFIXES) {
		if (path.startsWith(prefix)) {
			return { path, reason: `private pipeline directory '${prefix}' must not be tracked here` };
		}
	}

	for (const [pattern, reason] of PRIVATE_FILE_PATTERNS) {
		if (pattern.test(path)) {
			return { path, reason };
		}
	}

	return null;
}

const violations = trackedFilesForAudit()
	.map(violationFor)
	.filter((item): item is Violation => item !== null);

if (violations.length > 0) {
	console.error('Private data boundary audit failed.');
	console.error('The public app repository must not track upstream CSV/raw/geocoding cache files.\n');
	for (const violation of violations) {
		console.error(`- ${violation.path}: ${violation.reason}`);
	}
	process.exit(1);
}

console.log('Private data boundary audit passed.');
