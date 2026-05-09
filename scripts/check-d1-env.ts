import fs from 'node:fs';

function readDotEnv(): Record<string, string> {
	if (!fs.existsSync('.env')) return {};
	const values: Record<string, string> = {};
	for (const line of fs.readFileSync('.env', 'utf-8').split('\n')) {
		const trimmed = line.trim();
		if (!trimmed || trimmed.startsWith('#')) continue;
		const index = trimmed.indexOf('=');
		if (index === -1) continue;
		const key = trimmed.slice(0, index).trim();
		const value = trimmed.slice(index + 1).trim().replace(/^['"]|['"]$/g, '');
		values[key] = value;
	}
	return values;
}

const env = { ...readDotEnv(), ...process.env };
const databaseName = env.DATABASE_NAME?.trim();
const databaseId = env.DATABASE_ID?.trim();

if (!databaseName || !databaseId) {
	console.error('DATABASE_NAME and DATABASE_ID must be set in .env or the shell.');
	process.exit(1);
}

console.log(`D1 env is configured for database '${databaseName}' (${databaseId.slice(0, 8)}...).`);
console.log('Wrangler does not expand .env inside [[d1_databases]].');
console.log('Before remote deploy, copy these values into wrangler.toml for the intended environment.');
