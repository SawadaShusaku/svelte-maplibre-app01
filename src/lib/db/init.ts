import initSqlJs from 'sql.js';
import type { Database } from 'sql.js';

let db: Database | null = null;
let initPromise: Promise<Database> | null = null;

export async function initDatabase(): Promise<Database> {
	if (db) return db;
	if (initPromise) return initPromise;

	initPromise = (async () => {
		try {
			const SQL = await initSqlJs({
				locateFile: (file) => {
					// sql.js looks for sql-wasm-browser.wasm but we have sql-wasm.wasm
					if (file === 'sql-wasm-browser.wasm') {
						return '/sql-wasm.wasm';
					}
					return `/${file}`;
				}
			});

			// Load pre-built database from static assets
			const response = await fetch('/recycling.db');
			if (!response.ok) {
				throw new Error(`Failed to fetch database: ${response.status} ${response.statusText}`);
			}
			const buffer = await response.arrayBuffer();
			const data = new Uint8Array(buffer);

			db = new SQL.Database(data);
			return db;
		} catch (error) {
			console.error('Database initialization failed:', error);
			initPromise = null;
			throw error;
		}
	})();

	return initPromise;
}

export function getDatabase(): Database {
	if (!db) {
		throw new Error('Database not initialized. Call initDatabase() first.');
	}
	return db;
}

export function closeDatabase(): void {
	if (db) {
		db.close();
		db = null;
	}
}
