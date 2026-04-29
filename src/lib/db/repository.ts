// Repository interface for database operations
// Allows switching between implementations (sql.js for browser, mock for tests)

import type { Category, Collector, Facility, FacilityWithCategories, Ward } from './types';

export interface Repository {
	// Wards
	getWards(): Ward[];
	
	// Categories
	getCategories(): Category[];
	getAvailableCategories(wardIds: string[]): Category[];
	getCategoryDetails(categoryId: string): Record<string, string>;
	
	// Collectors
	getCollectors(): Collector[];
	
	// Facilities
	getFacilities(wardIds: string[], categoryIds: string[]): FacilityWithCategories[];
	getFacilityById(id: string): FacilityWithCategories | null;
	searchFacilities(query: string, wardIds: string[]): FacilityWithCategories[];
}
