// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	interface D1Result<T = unknown> {
		results?: T[];
		success: boolean;
		meta: unknown;
	}

	interface D1PreparedStatement {
		bind(...values: unknown[]): D1PreparedStatement;
		all<T = unknown>(): Promise<D1Result<T>>;
		first<T = unknown>(): Promise<T | null>;
	}

	interface D1Database {
		prepare(query: string): D1PreparedStatement;
	}

	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		interface Platform {
			env?: {
				RECYCLING_DB?: D1Database;
			};
		}
	}
}

export {};
