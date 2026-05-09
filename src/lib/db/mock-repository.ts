import type { Repository } from './repository';
import type { Category, Collector, Facility, FacilityWithCategories, Ward } from './types';

/**
 * In-memory mock implementation of Repository
 * Used for unit testing
 */
export class MockRepository implements Repository {
	private wards: Ward[] = [];
	private categories: Category[] = [];
	private collectors: Collector[] = [];
	private facilities: FacilityWithCategories[] = [];
	private wardCategories: Map<string, string[]> = new Map();
	private categoryDetails: Map<string, Record<string, string>> = new Map();

	// Test data setup methods
	setWards(wards: Ward[]) {
		this.wards = wards;
	}

	setCategories(categories: Category[]) {
		this.categories = categories;
	}

	setCollectors(collectors: Collector[]) {
		this.collectors = collectors;
	}

	setFacilities(facilities: FacilityWithCategories[]) {
		this.facilities = facilities;
	}

	setWardCategories(wardId: string, categoryIds: string[]) {
		this.wardCategories.set(wardId, categoryIds);
	}

	setCategoryDetails(categoryId: string, details: Record<string, string>) {
		this.categoryDetails.set(categoryId, details);
	}

	// Clear all data
	clear() {
		this.wards = [];
		this.categories = [];
		this.collectors = [];
		this.facilities = [];
		this.wardCategories.clear();
		this.categoryDetails.clear();
	}

	// Repository implementation
	getWards(): Ward[] {
		return [...this.wards];
	}

	getCategories(): Category[] {
		return [...this.categories];
	}

	getAvailableCategories(wardIds: string[]): Category[] {
		const availableIds = new Set<string>();
		for (const wardId of wardIds) {
			const cats = this.wardCategories.get(wardId) || [];
			cats.forEach(id => availableIds.add(id));
		}
		return this.categories.filter(c => availableIds.has(c.id));
	}

	getCategoryDetails(categoryId: string): Record<string, string> {
		return this.categoryDetails.get(categoryId) || {};
	}

	getCollectors(): Collector[] {
		return [...this.collectors];
	}

	getFacilities(wardIds: string[], categoryIds: string[]): FacilityWithCategories[] {
		return this.facilities.filter(f => {
			const hasWard = wardIds.length === 0 || wardIds.includes(f.ward_id);
			// If no categories selected, return all facilities in the wards
			const hasCategory = categoryIds.length === 0 || f.categories.some(c => categoryIds.includes(c));
			return hasWard && hasCategory;
		});
	}

	getFacilityById(id: string): FacilityWithCategories | null {
		return this.facilities.find(f => f.id === id) || null;
	}

	searchFacilities(query: string, wardIds: string[]): FacilityWithCategories[] {
		const q = query.toLowerCase();
		return this.facilities.filter(f => {
			const inWard = wardIds.length === 0 || wardIds.includes(f.ward_id);
			const matchesQuery = f.name.toLowerCase().includes(q) || 
			                    f.address.toLowerCase().includes(q);
			return inWard && matchesQuery;
		});
	}
}
