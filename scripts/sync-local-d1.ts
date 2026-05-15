import { mkdirSync, rmSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

type RemoteSource = 'prod' | 'preview';

const SOURCES: Record<RemoteSource, { database: string; env?: string }> = {
	prod: { database: 'recycling-facilities-prod' },
	preview: { database: 'recycling-facilities-preview', env: 'preview' }
};

const LOCAL_DATABASE = 'recycling-facilities-local';
const LOCAL_D1_STATE_DIR = '.wrangler/state/v3/d1/miniflare-D1DatabaseObject';

function parseSource(): RemoteSource {
	const arg = process.argv.find((value) => value.startsWith('--from='));
	const source = (arg?.split('=')[1] ?? 'prod') as RemoteSource;

	if (!(source in SOURCES)) {
		console.error('Usage: npm run d1:sync:local -- --from=prod|preview');
		process.exit(1);
	}

	return source;
}

function run(args: string[], options: { quietStdout?: boolean } = {}): void {
	const result = spawnSync('npx', ['wrangler', ...args], {
		stdio: options.quietStdout ? ['inherit', 'ignore', 'inherit'] : 'inherit',
		shell: false
	});

	if (result.status !== 0) {
		process.exit(result.status ?? 1);
	}
}

const source = parseSource();
const remote = SOURCES[source];
const outputDir = resolve('.local/d1-sync');
const outputFile = join(outputDir, `${source}-${new Date().toISOString().replace(/[:.]/g, '-')}.sql`);

mkdirSync(outputDir, { recursive: true });

console.log(`Exporting remote D1 (${remote.database}) to ${outputFile}`);
run([
	'd1',
	'export',
	remote.database,
	...(remote.env ? ['--env', remote.env] : []),
	'--remote',
	'--output',
	outputFile,
	'--skip-confirmation'
]);

console.log(`Resetting local D1 state at ${LOCAL_D1_STATE_DIR}`);
rmSync(LOCAL_D1_STATE_DIR, { recursive: true, force: true });

console.log(`Importing dump into local D1 (${LOCAL_DATABASE})`);
run([
	'd1',
	'execute',
	LOCAL_DATABASE,
	'--env',
	'local',
	'--local',
	'--file',
	outputFile
], { quietStdout: true });

console.log(`Local D1 is now synced from ${source}.`);
