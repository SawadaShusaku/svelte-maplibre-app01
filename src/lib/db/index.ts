import { browser } from '$app/environment';
import type { Repository } from './repository';
import { SqlJsRepository } from './sqljs-repository';
import { MockRepository } from './mock-repository';

// Singleton instance
let repository: Repository | null = null;

export function getRepository(): Repository {
	if (!repository) {
		if (browser) {
			repository = new SqlJsRepository();
		} else {
			throw new Error('Repository can only be used in browser. Use MockRepository for tests.');
		}
	}
	return repository;
}

export function setRepository(repo: Repository) {
	repository = repo;
}

// Re-export types
export type { Repository } from './repository';
export { SqlJsRepository } from './sqljs-repository';
export { MockRepository } from './mock-repository';

// Re-export types from types.ts
export type {
	Category,
	CategoryDetail,
	Collector,
	Facility,
	FacilityCategory,
	FacilityWithCategories,
	Ward,
	WardCategory,
	WardWithCategories,
	CategoryWithDetails
} from './types';

// Re-export categories
export {
	CATEGORIES,
	CATEGORY_DETAILS,
	CATEGORY_COLOR,
	CATEGORY_LABEL,
	CATEGORY_ICON,
	getCategoryDetails
} from './categories';

// Re-export init
export { initDatabase, getDatabase, closeDatabase } from './init';
